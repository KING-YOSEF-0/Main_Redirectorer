use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

// WASM-compatible 3D rendering system using JavaScript/TypeScript
// This module interfaces with Three.js for WebGL rendering

#[derive(Serialize, Deserialize, Clone, Copy)]
pub struct Vector3 {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[derive(Serialize, Deserialize)]
pub struct Material {
    pub color: u32,
    pub roughness: f32,
    pub metalness: f32,
    pub emissive: u32,
    pub emissive_intensity: f32,
    pub texture_id: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct Mesh {
    pub id: u32,
    pub geometry_type: u32,
    pub material: Material,
    pub position: Vector3,
    pub rotation: Vector3,
    pub scale: f32,
    pub bounding_radius: f32,
}

#[derive(Serialize, Deserialize)]
pub struct Light {
    pub id: u32,
    pub light_type: u32,
    pub position: Vector3,
    pub color: u32,
    pub intensity: f32,
    pub distance: f32,
    pub cast_shadow: bool,
}

#[derive(Serialize, Deserialize)]
pub struct Camera {
    pub position: Vector3,
    pub rotation: Vector3,
    pub fov: f32,
    pub aspect_ratio: f32,
    pub near_plane: f32,
    pub far_plane: f32,
    pub orthographic: bool,
}

#[derive(Serialize, Deserialize)]
pub struct Scene {
    pub id: u32,
    pub name: String,
    pub background_color: u32,
    pub fog: Option<Fog>,
    pub lights: Vec<Light>,
    pub cameras: Vec<Camera>,
    pub meshes: Vec<Mesh>,
}

#[derive(Serialize, Deserialize)]
pub struct Fog {
    pub color: u32,
    pub density: f32,
    pub near_distance: f32,
    pub far_distance: f32,
}

#[derive(Serialize, Deserialize)]
pub struct WebGLRenderer {
    pub scene: Scene,
    pub active_camera: u32,
    pub render_mode: u32,
    pub wireframe_mode: bool,
    pub shadows_enabled: bool,
    pub ambient_light_intensity: f32,
    pub max_render_distance: f32,
    pub frustum_culling: bool,
    pub occlusion_enabled: bool,
}

#[wasm_bindgen]
pub struct GameRenderer {
    world_state_ptr: usize,
}

#[wasm_bindgen]
impl GameRenderer {
    #[wasm_bindgen(constructor)]
    pub fn new(world_state: &str) -> GameRenderer {
        let mut renderer = WebGLRenderer {
            scene: Scene {
                id: 1,
                name: "Main Game Scene".to_string(),
                background_color: 0x030712,
                fog: None,
                lights: vec![
                    Light {
                        id: 1,
                        light_type: 0,
                        position: Vector3 { x: 20.0, y: 40.0, z: 20.0 },
                        color: 0x38bdf8,
                        intensity: 1.2,
                        distance: 100.0,
                        cast_shadow: true,
                    },
                ],
                cameras: vec![
                    Camera {
                        position: Vector3 { x: 0.0, y: 2.0, z: 10.0 },
                        rotation: Vector3 { x: 0.0, y: 0.0, z: 0.0 },
                        fov: 75.0,
                        aspect_ratio: 1.78,
                        near_plane: 0.1,
                        far_plane: 1000.0,
                        orthographic: false,
                    },
                ],
                meshes: Vec::new(),
            },
            active_camera: 0,
            render_mode: 0,
            wireframe_mode: false,
            shadows_enabled: true,
            ambient_light_intensity: 0.6,
            max_render_distance: 50.0,
            frustum_culling: true,
            occlusion_enabled: false,
        };

        // Generate procedural meshes based on game objects
        let world_data: Vec<GameObject> = serde_wasm_bindgen::from_value(js_sys::JSON::parse(world_state).unwrap()).unwrap();
        renderer.scene.meshes = generate_meshes_from_objects(&world_data);

        GameRenderer { world_state_ptr: 0 }
    }

    pub fn render_frame(&mut self, dt: f32) -> JsValue {
        // This function would be called from JavaScript to render a frame
        // It updates animations and returns render commands for Three.js
        let render_commands = vec![
            "updateAnimations",
            "updateCameras",
            "renderScene",
            "updateLighting"
        ];

        serde_wasm_bindgen::to_value(&render_commands).unwrap()
    }

    pub fn update_objects(&mut self, world_data: &str) {
        // Update 3D objects based on game world state
        let objects: Vec<GameObject> = serde_wasm_bindgen::from_value(js_sys::JSON::parse(world_data).unwrap()).unwrap();
        self.scene.meshes = generate_meshes_from_objects(&objects);
    }

    pub fn get_scene_data(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.scene).unwrap()
    }
}

fn generate_meshes_from_objects(objects: &[GameObject]) -> Vec<Mesh> {
    let mut meshes = Vec::new();

    for obj in objects {
        let geometry_type = obj.obj_type;
        let mut material = Material {
            color: match geometry_type {
                0 => 0x38bdf8, // Blue for cubes
                1 => 0xf43f5e, // Red for spheres
                2 => 0xa855f7, // Purple for pyramids
                _ => 0x38bdf8,
            },
            roughness: 0.3,
            metalness: 0.8,
            emissive: match geometry_type {
                0 => 0x0284c7,
                1 => 0xe11d48,
                2 => 0xc084fc,
                _ => 0x0284c7,
            },
            emissive_intensity: 0.2,
            texture_id: None,
        };

        let scale = if obj.scale > 0.0 { obj.scale } else { 1.0 };
        material.roughness *= scale;
        material.metalness *= scale;

        let mesh = Mesh {
            id: obj.id,
            geometry_type,
            material,
            position: Vector3 { x: obj.x, y: obj.y, z: obj.z },
            rotation: Vector3 { x: 0.0, y: obj.rot_x, z: obj.rot_y },
            scale,
            bounding_radius: 1.5 * scale,
        };

        meshes.push(mesh);
    }

    meshes
}

// Supporting types that are used by other modules
#[derive(Serialize, Deserialize, Clone, Copy)]
pub struct GameObject {
    pub id: u32,
    pub x: f32,
    pub y: f32,
    pub z: f32,
    pub rot_x: f32,
    pub rot_y: f32,
    pub scale: f32,
    pub obj_type: u32,
}