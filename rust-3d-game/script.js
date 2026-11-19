// Main Entry Point for JS-Only 3D Game
import { GameLoop } from './game-loop.js';
import { PhysicsWorld, Vector3, Sphere } from './physics_engine.js';
import { GameHUD, ScoreDisplay, HealthDisplay, InputPrompt } from './ui-controller.js';

let scene, camera, renderer, physicsWorld, gameLoop, hud;
let meshes = new Map();
let objects = new Map();
let isStarted = false;

const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false };

// Player state
const player = {
    position: new Vector3(0, 2, 10),
    velocity: new Vector3(),
    moveSpeed: 5.0,
    jumpForce: 7.0,
    onGround: true
};

async function main() {
    // Initialize Three.js Scene
    const canvas = document.getElementById('webgl-canvas');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    scene.fog = new THREE.FogExp2(0x030712, 0.03);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 10);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Ground Grid
    const gridHelper = new THREE.GridHelper(200, 50, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Floor plane
    const floorGeo = new THREE.PlaneGeometry(200, 200);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9, metalness: 0.1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Initialize Physics Engine
    physicsWorld = new PhysicsWorld();

    // Initialize Game Loop
    gameLoop = new GameLoop(update, render, handleInput);

    // Initialize UI
    hud = new GameHUD();
    hud.addTo(document.body);
    hud.createScoreDisplay();
    hud.createHealthDisplay();
    hud.createTimerDisplay();
    hud.createLevelDisplay();
    hud.createPerformanceDisplay();

    // Setup Input
    setupInput();

    // Generate Game World
    generateWorld();

    // Start Game Loop
    gameLoop.start();
}

function generateWorld() {
    // Procedural grid of 3D objects (cubes, spheres, pyramids)
    const gridRange = 5;
    const objectCount = gridRange * gridRange;

    for (let x = -gridRange; x <= gridRange; x++) {
        for (let z = -gridRange; z <= gridRange; z++) {
            const id = `obj_${x}_${z}`;
            const type = Math.floor(Math.random() * 3);
            const y = 1 + Math.random() * 2;

            const pos = new Vector3(x * 3, y, z * 3);

            // Add to physics world
            if (type === 0) {
                physicsWorld.add_sphere(id, pos, 1.0, 1.0);
            } else if (type === 1) {
                physicsWorld.add_mesh(id, pos, 1.5, 1.0);
            } else {
                physicsWorld.add_sphere(id, pos, 0.8, 0.5);
            }

            // Create Three.js mesh
            let geometry;
            if (type === 0) geometry = new THREE.BoxGeometry(2, 2, 2);
            else if (type === 1) geometry = new THREE.SphereGeometry(1.2, 16, 16);
            else geometry = new THREE.ConeGeometry(1.5, 3, 16);

            const material = new THREE.MeshStandardMaterial({
                color: type === 0 ? 0x38bdf4 : type === 1 ? 0xf43f5e : 0xa855f7,
                roughness: 0.3,
                metalness: 0.8,
                emissive: type === 0 ? 0x0284c7 : type === 1 ? 0xe11d48 : 0xc084fc,
                emissiveIntensity: 0.2
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.position.copy(pos);
            scene.add(mesh);
            meshes.set(id, mesh);
            objects.set(id, { type, mesh });
        }
    }

    console.log(`Generated ${objectCount} 3D objects`);
}

function handleInput(dt) {
    if (!isStarted || document.pointerLockElement !== document.body) return;

    let moveX = 0;
    let moveZ = 0;

    if (keys['w'] || keys['W'] || keys['ArrowUp']) moveZ -= 1;
    if (keys['s'] || keys['S'] || keys['ArrowDown']) moveZ += 1;
    if (keys['a'] || keys['A'] || keys['ArrowLeft']) moveX -= 1;
    if (keys['d'] || keys['D'] || keys['ArrowRight']) moveX += 1;

    if (moveX !== 0 || moveZ !== 0) {
        const dir = new Vector3(moveX, 0, moveZ).normalize();
        const move = dir.mul(player.moveSpeed * dt);
        player.position = player.position.add(move);
        player.onGround = true;
    }

    // Jump
    if (keys[' ']) {
        if (player.onGround) {
            player.velocity.y = player.jumpForce;
            player.onGround = false;
        }
    }

    // Apply gravity
    if (!player.onGround) {
        player.velocity.y -= 9.8 * dt;
        player.position.y += player.velocity.y * dt;
        if (player.position.y <= 2) {
            player.position.y = 2;
            player.velocity.y = 0;
            player.onGround = true;
        }
    }

    // Update camera position
    camera.position.copy(player.position);
}

function update(dt) {
    if (!isStarted) return;

    // Update physics
    physicsWorld.step_simulation(dt);

    // Sync objects from physicsWorld to Three.js meshes
    for (const [id, obj] of objects) {
        const pos = physicsWorld.get_position(id);
        if (pos) {
            obj.mesh.position.copy(pos);
        }
    }

    // Update HUD
    hud.update({
        score: gameLoop.getState().score,
        lives: gameLoop.getState().lives,
        level: gameLoop.getState().level,
        timeRemaining: gameLoop.getState().timeRemaining,
        fps: gameLoop.getPerformanceStats().fps
    });
}

function render(dt) {
    renderer.render(scene, camera);
}

function setupInput() {
    window.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key) || keys.hasOwnProperty(e.code)) {
            keys[e.key] = true;
            keys[e.code] = true;
        }
    });

    window.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key) || keys.hasOwnProperty(e.code)) {
            keys[e.key] = false;
            keys[e.code] = false;
        }
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const startBtn = document.getElementById('start-btn');
    const instructions = document.getElementById('instructions');
    const crosshair = document.getElementById('crosshair');

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            isStarted = true;
            if (instructions) instructions.style.display = 'none';
            if (crosshair) crosshair.classList.add('active');
            document.body.requestPointerLock();
        });
    }
}

main();
