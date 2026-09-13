class Projectile {
    constructor(position, direction, damage, range) {
        this.damage = damage;
        this.range = range;
        this.startPosition = position.clone();
        this.direction = direction.normalize();
        this.speed = 1.0;
        this.lifetime = range / this.speed;
        this.createdTime = Date.now();
        
        const geometry = new THREE.SphereGeometry(0.15, 8, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            roughness: 0.3,
            metalness: 0.7
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;
    }

    update() {
        this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed));
    }

    isAlive() {
        const distance = this.mesh.position.distanceTo(this.startPosition);
        return distance < this.range && (Date.now() - this.createdTime) < this.lifetime * 1000;
    }
}

class NPCProjectile {
    constructor(position, direction, damage) {
        this.damage = damage;
        const geometry = new THREE.SphereGeometry(0.15, 8, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff4400,
            emissive: 0xff4400,
            roughness: 0.2
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;
        this.direction = direction;
        this.speed = 0.6;
        this.lifetime = 5000;
        this.createdTime = Date.now();
    }

    update() {
        this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed));
        return Date.now() - this.createdTime < this.lifetime;
    }
}