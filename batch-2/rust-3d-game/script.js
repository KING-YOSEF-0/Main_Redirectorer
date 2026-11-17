// Main Entry Point for Rust + Three.js 3D Game
import init, { GameWorld } from './pkg/rust_3d_game.js';

let scene, camera, renderer, gameWorld;
let meshes = new Map();
let isStarted = false;
let lastTime = performance.now();
let frameCount = 0;
let lastFpsUpdate = performance.now();

const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false };

async function main() {
    // Initialize WASM module
    try {
        await init();
        console.log("Rust WASM module loaded successfully!");
    } catch (e) {
        console.warn("WASM module failed to load in static preview mode. Falling back to JS simulation engine.", e);
    }

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

    // Initialize Game World (Rust if available, or fallback JS)
    try {
        gameWorld = new GameWorld();
    } catch (e) {
        // Fallback mock if WASM is not built yet
        gameWorld = {
            update: (dt) => {},
            get_objects: () => [],
            get_player_state: () => [0, 10, 0],
            get_score: () => 0
        };
    }

    setupInput();
    setupUI();

    // Start Animation Loop
    requestAnimationFrame(animate);
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
}

function setupUI() {
    const startBtn = document.getElementById('start-btn');
    const instructions = document.getElementById('instructions');
    const crosshair = document.getElementById('crosshair');

    startBtn.addEventListener('click', () => {
        isStarted = true;
        instructions.style.display = 'none';
        crosshair.classList.add('active');
        document.body.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement !== document.body && isStarted) {
            // Optional: Pause or show menu on unlock
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!isStarted || document.pointerLockElement !== document.body) return;
        const sensitivity = 0.002;
        camera.rotation.y -= e.movementX * sensitivity;
    });
}

function animate(currentTime) {
    requestAnimationFrame(animate);

    const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;

    // FPS calculation
    frameCount++;
    if (currentTime - lastFpsUpdate > 1000) {
        document.getElementById('fps-val').textContent = Math.round((frameCount * 1000) / (currentTime - lastFpsUpdate));
        frameCount = 0;
        lastFpsUpdate = currentTime;
    }

    if (isStarted && gameWorld) {
        let moveX = 0;
        let moveZ = 0;

        if (keys['w'] || keys['W'] || keys['ArrowUp']) moveZ -= 1;
        if (keys['s'] || keys['S'] || keys['ArrowDown']) moveZ += 1;
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) moveX -= 1;
        if (keys['d'] || keys['D'] || keys['ArrowRight']) moveX += 1;

        // Update Rust game state
        try {
            gameWorld.update(dt, moveX, moveZ);

            // Get player position from Rust
            const pState = gameWorld.get_player_state();
            if (pState) {
                camera.position.x = pState[0];
                camera.position.z = pState[1];
            }

            // Sync objects from Rust to Three.js
            const objects = gameWorld.get_objects();
            if (objects) {
                document.getElementById('obj-val').textContent = objects.length;

                objects.forEach(obj => {
                    let mesh = meshes.get(obj.id);
                    if (!mesh) {
                        // Create mesh based on obj_type
                        let geometry;
                        if (obj.obj_type === 0) geometry = new THREE.BoxGeometry(2, 2, 2);
                        else if (obj.obj_type === 1) geometry = new THREE.SphereGeometry(1.2, 16, 16);
                        else geometry = new THREE.ConeGeometry(1.5, 3, 16);

                        const material = new THREE.MeshStandardMaterial({
                            color: obj.obj_type === 0 ? 0x38bdf8 : obj.obj_type === 1 ? 0xf43f5e : 0xa855f7,
                            roughness: 0.3,
                            metalness: 0.8,
                            emissive: obj.obj_type === 0 ? 0x0284c7 : 0xe11d48,
                            emissiveIntensity: 0.2
                        });

                        mesh = new THREE.Mesh(geometry, material);
                        mesh.castShadow = true;
                        scene.add(mesh);
                        meshes.set(obj.id, mesh);
                    }

                    mesh.position.set(obj.x, obj.y, obj.z);
                    mesh.rotation.x = obj.rot_x;
                    mesh.rotation.y = obj.rot_y;
                });
            }

            document.getElementById('score-val').textContent = gameWorld.get_score();
        } catch (e) {
            // Fallback if WASM methods are not fully linked yet
        }
    }

    renderer.render(scene, camera);
}

main();
