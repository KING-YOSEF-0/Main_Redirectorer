// Advanced Physics Engine for JavaScript 3D Game
// Provides collision detection, physics simulation, and dynamics

class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(other) {
        return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    sub(other) {
        return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    mul(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    div(scalar) {
        return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector3();
        return this.div(mag);
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }
}

class Ray {
    constructor(origin, direction) {
        this.origin = origin instanceof Vector3 ? origin : new Vector3(origin.x, origin.y, origin.z);
        this.direction = direction instanceof Vector3 ? direction.normalize() : new Vector3();
    }

    at(t) {
        return new Vector3(
            this.origin.x + this.direction.x * t,
            this.origin.y + this.direction.y * t,
            this.origin.z + this.direction.z * t
        );
    }
}

class AABB {
    constructor(min, max) {
        this.min = min instanceof Vector3 ? min : new Vector3(min.x, min.y, min.z);
        this.max = max instanceof Vector3 ? max : new Vector3(max.x, max.y, max.z);
    }

    contains(point) {
        return point.x >= this.min.x && point.x <= this.max.x &&
               point.y >= this.min.y && point.y <= this.max.y &&
               point.z >= this.min.z && point.z <= this.max.z;
    }

    intersects(other) {
        return this.min.x <= other.max.x && this.max.x >= other.min.x &&
               this.min.y <= other.max.y && this.max.y >= other.min.y &&
               this.min.z <= other.max.z && this.max.z >= other.min.z;
    }

    get center() {
        return new Vector3(
            (this.min.x + this.max.x) / 2,
            (this.min.y + this.max.y) / 2,
            (this.min.z + this.max.z) / 2
        );
    }

    get size() {
        return new Vector3(
            this.max.x - this.min.x,
            this.max.y - this.min.y,
            this.max.z - this.min.z
        );
    }
}

class Sphere {
    constructor(center, radius) {
        this.center = center instanceof Vector3 ? center : new Vector3(center.x, center.y, center.z);
        this.radius = radius || 1.0;
    }

    contains(point) {
        const dist = new Vector3(point.x - this.center.x, point.y - this.center.y, point.z - this.center.z);
        return dist.magnitude() <= this.radius;
    }

    intersects(other) {
        const dist = new Vector3(other.center.x - this.center.x, other.center.y - this.center.y, other.center.z - this.center.z);
        const radii = this.radius + other.radius;
        return dist.magnitude() <= radii;
    }

    get volume() {
        return (4 / 3) * Math.PI * this.radius * this.radius * this.radius;
    }
}

class Capsule {
    constructor(center, radius, height) {
        this.center = center instanceof Vector3 ? center : new Vector3(center.x, center.y, center.z);
        this.radius = radius || 0.5;
        this.height = height || 2.0;
    }

    contains(point) {
        const localY = Math.abs(point.y - this.center.y) - this.height / 2;
        if (localY <= 0) {
            const capDist = new Vector3(point.x - this.center.x, 0, point.z - this.center.z).magnitude();
            return capDist <= this.radius;
        }
        const endCapDist = new Vector3(point.x - this.center.x, point.y - (this.center.y + this.height / 2), point.z - this.center.z).magnitude();
        return endCapDist <= this.radius;
    }
}

class Plane {
    constructor(normal, constant) {
        this.normal = normal instanceof Vector3 ? normal.normalize() : new Vector3(normal.x, normal.y, normal.z).normalize();
        this.constant = constant || 0;
    }

    distance(point) {
        return this.normal.x * point.x + this.normal.y * point.y + this.normal.z * point.z - this.constant;
    }

    project_point(point) {
        const dist = this.distance(point);
        return new Vector3(
            point.x - this.normal.x * dist,
            point.y - this.normal.y * dist,
            point.z - this.normal.z * dist
        );
    }
}

class CollisionInfo {
    constructor() {
        this.hit = false;
        this.point = new Vector3();
        this.normal = new Vector3();
        this.distance = 0;
        this.other_id = -1;
    }

    set(hit, point, normal, distance, other_id) {
        this.hit = hit;
        this.point = point instanceof Vector3 ? point : new Vector3(point.x, point.y, point.z);
        this.normal = normal instanceof Vector3 ? normal : new Vector3(normal.x, normal.y, normal.z);
        this.distance = distance;
        this.other_id = other_id;
    }
}

class PhysicsWorld {
    constructor(gravity = new Vector3(0, -9.8, 0), fixed_time_step = 1/60) {
        this.gravity = gravity instanceof Vector3 ? gravity : new Vector3(gravity.x, gravity.y, gravity.z);
        this.fixed_time_step = fixed_time_step;
        this.objects = new Map();
        this.collision_matrix = new Map();
        this.broadphase_pairs = [];
        this.debug = false;
    }

    add_object(id, shape, mass = 1.0) {
        this.objects.set(id, {
            id,
            shape,
            mass,
            position: new Vector3(),
            velocity: new Vector3(),
            acceleration: new Vector3(),
            angular_velocity: new Vector3(),
            force: new Vector3(),
            torque: new Vector3(),
            sleep: false,
            kinematic: false,
            restitution: 0.5,
            friction: 0.4
        });
    }

    set_object_transform(id, position, rotation) {
        const obj = this.objects.get(id);
        if (obj) {
            obj.position = position instanceof Vector3 ? position : new Vector3(position.x, position.y, position.z);
            obj.rotation = rotation instanceof Vector3 ? rotation : new Vector3(rotation.x, rotation.y, rotation.z);
        }
    }

    step_simulation(dt) {
        this.update_collisions();
        this.integrate_forces(dt);
        this.solve_constraints(dt);
        this.clear_forces();
    }

    update_collisions() {
        this.broadphase_pairs = [];
        const ids = Array.from(this.objects.keys());

        for (let i = 0; i < ids.length; i++) {
            for (let j = i + 1; j < ids.length; j++) {
                const id1 = ids[i];
                const id2 = ids[j];
                if (this.should_collide(id1, id2)) {
                    this.broadphase_pairs.push([id1, id2]);
                }
            }
        }

        this.narrowphase_collisions();
    }

    should_collide(id1, id2) {
        const obj1 = this.objects.get(id1);
        const obj2 = this.objects.get(id2);

        if (!obj1 || !obj2) return false;
        if (obj1.sleep && obj2.sleep) return false;

        const shape1 = obj1.shape;
        const shape2 = obj2.shape;

        switch (shape1.type) {
            case 'sphere':
                switch (shape2.type) {
                    case 'sphere': return true;
                    case 'capsule': return true;
                    case 'mesh': return true;
                }
                break;
            case 'capsule':
                switch (shape2.type) {
                    case 'sphere': return true;
                    case 'capsule': return true;
                    case 'mesh': return true;
                }
                break;
            case 'mesh':
                switch (shape2.type) {
                    case 'sphere': return true;
                    case 'capsule': return true;
                    case 'mesh': return true;
                }
                break;
        }
        return false;
    }

    narrowphase_collisions() {
        for (const [id1, id2] of this.broadphase_pairs) {
            this.resolve_collision(id1, id2);
        }
    }

    resolve_collision(id1, id2) {
        const obj1 = this.objects.get(id1);
        const obj2 = this.objects.get(id2);

        if (!obj1 || !obj2) return;

        const collision = this.check_shape_collision(obj1, obj2);

        if (collision.hit) {
            this.apply_impulse(obj1, obj2, collision);
            this.generate_contact_response(obj1, obj2, collision);
        }
    }

    check_shape_collision(obj1, obj2) {
        const shape1 = obj1.shape;
        const shape2 = obj2.shape;
        const info = new CollisionInfo();

        switch (shape1.type) {
            case 'sphere':
                switch (shape2.type) {
                    case 'sphere': return this.sphere_sphere_collision(obj1, obj2, info);
                    case 'capsule': return this.sphere_capsule_collision(obj1, obj2, info);
                    case 'mesh': return this.sphere_mesh_collision(obj1, obj2, info);
                }
                break;
            case 'capsule':
                switch (shape2.type) {
                    case 'sphere': return this.sphere_capsule_collision(obj2, obj1, info);
                    case 'capsule': return this.capsule_capsule_collision(obj1, obj2, info);
                    case 'mesh': return this.capsule_mesh_collision(obj1, obj2, info);
                }
                break;
            case 'mesh':
                switch (shape2.type) {
                    case 'sphere': return this.sphere_mesh_collision(obj2, obj1, info);
                    case 'capsule': return this.capsule_mesh_collision(obj2, obj1, info);
                    case 'mesh': return this.mesh_mesh_collision(obj1, obj2, info);
                }
                break;
        }

        return info;
    }

    integrate_forces(dt) {
        for (const obj of this.objects.values()) {
            if (obj.sleep) continue;

            obj.velocity = obj.velocity.add(obj.acceleration.mul(dt));
            obj.position = obj.position.add(obj.velocity.mul(dt));

            if (!obj.kinematic) {
                obj.acceleration = obj.force.mul(1 / obj.mass);
            }

            obj.force = new Vector3();
        }
    }

    solve_constraints(dt) {
        // Implement constraint solving for joints, contacts, etc.
        // This is a simplified version - full implementation would include:
        // - Contact constraint solving
        // - Joint constraints (hinges, springs, etc.)
        // - Friction and restitution
        // - Position correction

        for (const obj of this.objects.values()) {
            if (obj.sleep) continue;

            // Simple resting detection
            if (obj.velocity.magnitude() < 0.01) {
                obj.velocity = new Vector3();
            }
        }
    }

    clear_forces() {
        for (const obj of this.objects.values()) {
            obj.acceleration = new Vector3();
        }
    }

    generate_contact_response(obj1, obj2, collision) {
        const restitution = Math.sqrt(obj1.restitution * obj2.restitution);
        const impulse = collision.normal.mul((1 + restitution) * collision.distance);

        obj1.velocity = obj1.velocity.sub(impulse.mul(1 / obj1.mass));
        obj2.velocity = obj2.velocity.add(impulse.mul(1 / obj2.mass));

        // Position correction for deep penetrations
        const correction = collision.normal.mul(Math.min(collision.distance - 0.01, 0.1));
        obj1.position = obj1.position.sub(correction.mul(0.5));
        obj2.position = obj2.position.add(correction.mul(0.5));
    }

    sphere_sphere_collision(obj1, obj2, info) {
        const delta = new Vector3(
            obj1.position.x - obj2.position.x,
            obj1.position.y - obj2.position.y,
            obj1.position.z - obj2.position.z
        );

        const distance = delta.magnitude();
        const radius_sum = obj1.shape.radius + obj2.shape.radius;

        if (distance < radius_sum) {
            info.set(
                true,
                new Vector3(
                    (obj1.position.x + obj2.position.x) / 2,
                    (obj1.position.y + obj2.position.y) / 2,
                    (obj1.position.z + obj2.position.z) / 2
                ),
                delta.normalize(),
                radius_sum - distance,
                obj2.id
            );
        }

        return info;
    }

    sphere_capsule_collision(obj1, obj2, info) {
        const capsule = obj1.shape.type === 'capsule' ? obj1 : obj2;
        const sphere = obj1.shape.type === 'sphere' ? obj1 : obj2;

        const local_y = Math.abs(sphere.position.y - capsule.shape.center.y) - capsule.shape.height / 2;
        if (local_y <= 0) {
            const cap_dist = new Vector3(sphere.position.x - capsule.shape.center.x, 0, sphere.position.z - capsule.shape.center.z).magnitude();
            if (cap_dist <= capsule.shape.radius) {
                info.set(
                    true,
                    new Vector3(
                        sphere.position.x,
                        Math.max(sphere.position.y, capsule.shape.center.y - capsule.shape.height / 2),
                        sphere.position.z
                    ),
                    new Vector3(0, -Math.sign(sphere.position.y - capsule.shape.center.y), 0),
                    capsule.shape.radius - cap_dist,
                    obj2.id
                );
            }
        }

        return info;
    }

    capsule_capsule_collision(obj1, obj2, info) {
        // Simplified capsule-capsule collision detection
        const dist = new Vector3(
            obj1.position.x - obj2.position.x,
            obj1.position.y - obj2.position.y,
            obj1.position.z - obj2.position.z
        ).magnitude();

        const radius_sum = (obj1.shape.radius + obj2.shape.radius) / 2;

        if (dist < radius_sum) {
            info.set(
                true,
                new Vector3(
                    (obj1.position.x + obj2.position.x) / 2,
                    (obj1.position.y + obj2.position.y) / 2,
                    (obj1.position.z + obj2.position.z) / 2
                ),
                new Vector3(0, -Math.sign(obj1.position.y - obj2.position.y), 0),
                radius_sum - dist,
                obj2.id
            );
        }

        return info;
    }

    sphere_mesh_collision(obj1, obj2, info) {
        const sphere = obj1.shape.type === 'sphere' ? obj1 : obj2;
        const mesh = obj1.shape.type === 'mesh' ? obj1 : obj2;

        const delta = new Vector3(
            sphere.position.x - mesh.shape.center.x,
            sphere.position.y - mesh.shape.center.y,
            sphere.position.z - mesh.shape.center.z
        );

        const distance = delta.magnitude();
        const radius = sphere.shape.radius;

        if (distance < radius) {
            info.set(
                true,
                new Vector3(
                    sphere.position.x - (delta.x * radius) / distance,
                    sphere.position.y - (delta.y * radius) / distance,
                    sphere.position.z - (delta.z * radius) / distance
                ),
                delta.normalize(),
                radius - distance,
                obj2.id
            );
        }

        return info;
    }

    capsule_mesh_collision(obj1, obj2, info) {
        // Simplified capsule-mesh collision - check distance to center
        const capsule = obj1.shape.type === 'capsule' ? obj1 : obj2;
        const mesh = obj1.shape.type === 'mesh' ? obj1 : obj2;

        const dist = new Vector3(
            capsule.position.x - mesh.shape.center.x,
            capsule.position.y - mesh.shape.center.y,
            capsule.position.z - mesh.shape.center.z
        ).magnitude();

        const radius = capsule.shape.radius;

        if (dist < radius) {
            info.set(
                true,
                new Vector3(
                    capsule.position.x - (delta.x * radius) / dist,
                    capsule.position.y - (delta.y * radius) / dist,
                    capsule.position.z - (delta.z * radius) / dist
                ),
                delta.normalize(),
                radius - dist,
                obj2.id
            );
        }

        return info;
    }

    mesh_mesh_collision(obj1, obj2, info) {
        // Simplified mesh-mesh collision using bounding spheres
        const dist = new Vector3(
            obj1.position.x - obj2.position.x,
            obj1.position.y - obj2.position.y,
            obj1.position.z - obj2.position.z
        ).magnitude();

        const radius_sum = obj1.shape.bounding_radius + obj2.shape.bounding_radius;

        if (dist < radius_sum) {
            info.set(
                true,
                new Vector3(
                    (obj1.position.x + obj2.position.x) / 2,
                    (obj1.position.y + obj2.position.y) / 2,
                    (obj1.position.z + obj2.position.z) / 2
                ),
                new Vector3(0, 1, 0),
                radius_sum - dist,
                obj2.id
            );
        }

        return info;
    }

    // Public API methods
    add_sphere(id, position, radius, mass = 1.0) {
        this.add_object(id, { type: 'sphere', radius }, mass);
        this.set_object_transform(id, position);
    }

    add_capsule(id, center, radius, height, mass = 1.0) {
        this.add_object(id, { type: 'capsule', center, radius, height }, mass);
    }

    add_mesh(id, center, bounding_radius, mass = 1.0) {
        this.add_object(id, { type: 'mesh', center, bounding_radius }, mass);
    }

    set_position(id, position) {
        this.set_object_transform(id, position);
    }

    apply_force(id, force) {
        const obj = this.objects.get(id);
        if (obj) {
            obj.force = force instanceof Vector3 ? force : new Vector3(force.x, force.y, force.z);
        }
    }

    get_position(id) {
        const obj = this.objects.get(id);
        return obj ? obj.position : null;
    }

    get_velocity(id) {
        const obj = this.objects.get(id);
        return obj ? obj.velocity : null;
    }

    sleep_object(id) {
        const obj = this.objects.get(id);
        if (obj) obj.sleep = true;
    }

    wake_object(id) {
        const obj = this.objects.get(id);
        if (obj) obj.sleep = false;
    }

    set_kinematic(id, kinematic) {
        const obj = this.objects.get(id);
        if (obj) obj.kinematic = kinematic;
    }

    get_colliding_objects(id) {
        return this.broadphase_pairs
            .filter(([a, b]) => a === id || b === id)
            .flatMap(([a, b]) => (a === id ? [b] : [a]));
    }

    debug_mode(enabled) {
        this.debug = enabled;
    }

    get_debug_info() {
        return {
            object_count: this.objects.size,
            collision_pairs: this.broadphase_pairs.length,
            timestep: this.fixed_time_step
        };
    }
}

// Export for CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Vector3,
        Sphere,
        Capsule,
        Plane,
        AABB,
        CollisionInfo,
        PhysicsWorld,
        Ray
    };
}

// Global export for browser environments
if (typeof window !== 'undefined') {
    window.PhysicsUtils = {
        Vector3,
        Sphere,
        Capsule,
        Plane,
        AABB,
        CollisionInfo,
        PhysicsWorld,
        Ray
    };

    window.physics = new PhysicsWorld();
}