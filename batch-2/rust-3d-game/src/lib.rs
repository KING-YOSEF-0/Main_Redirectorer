use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Clone, Copy)]
pub struct GameObject {
    pub id: u32,
    pub x: f32,
    pub y: f32,
    pub z: f32,
    pub rot_x: f32,
    pub rot_y: f32,
    pub scale: f32,
    pub obj_type: u32, // 0: Cube, 1: Sphere, 2: Pyramid
}

#[wasm_bindgen]
pub struct GameWorld {
    player_x: f32,
    player_z: f32,
    player_rot: f32,
    score: u32,
    objects: Vec<GameObject>,
    time: f32,
}

#[wasm_bindgen]
impl GameWorld {
    #[wasm_bindgen(constructor)]
    pub fn new() -> GameWorld {
        let mut objects = Vec::new();
        // Generate a large-scale grid of 3D objects
        let range = 5;
        let mut id_counter = 1;
        for x in -range..=range {
            for z in -range..=range {
                if x == 0 && z == 0 { continue; }
                let obj_type = (id_counter % 3) as u32;
                objects.push(GameObject {
                    id: id_counter,
                    x: (x * 6) as f32,
                    y: 1.0,
                    z: (z * 6) as f32,
                    rot_x: 0.0,
                    rot_y: 0.0,
                    scale: 1.0,
                    obj_type,
                });
                id_counter += 1;
            }
        }

        GameWorld {
            player_x: 0.0,
            player_z: 10.0,
            player_rot: 0.0,
            score: 0,
            objects,
            time: 0.0,
        }
    }

    pub fn update(&mut self, dt: f32, move_x: f32, move_z: f32) {
        self.time += dt;

        // Move player based on input
        let speed = 10.0 * dt;
        self.player_x += move_x * speed;
        self.player_z += move_z * speed;

        // Animate objects in Rust (large scale procedural movement)
        for obj in self.objects.iter_mut() {
            obj.rot_y += 1.0 * dt;
            if obj.obj_type == 1 {
                obj.y = 1.0 + (self.time * 2.0 + obj.x).sin() * 1.5;
            }
        }
    }

    pub fn get_objects(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.objects).unwrap()
    }

    pub fn get_player_state(&self) -> JsValue {
        let state = vec![self.player_x, self.player_z, self.player_rot];
        serde_wasm_bindgen::to_value(&state).unwrap()
    }

    pub fn add_score(&mut self, points: u32) {
        self.score += points;
    }

    pub fn get_score(&self) -> u32 {
        self.score
    }
}
