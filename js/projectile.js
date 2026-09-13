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
        
        // Traza de luz
        const trailGeometry = new THREE.BufferGeometry();
        const trailPositions = [position.x, position.y, position.z, position.x, position.y, position.z];
        trailGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(trailPositions), 3));
        
        const trailMaterial = new THREE.LineBasicMaterial({ color: 0xffff00, opacity: 0.5, transparent: true });
        this.trail = new THREE.Line(trailGeometry, trailMaterial);
    }

    update() {
        this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed));
    }

    isAlive() {
        const distance = this.mesh.position.distanceTo(this.startPosition);
        return distance < this.range && (Date.now() - this.createdTime) < this.lifetime * 1000;
    }
}
