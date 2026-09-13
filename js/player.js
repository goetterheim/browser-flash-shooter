class Player {
    constructor(camera) {
        this.camera = camera;
        this.velocity = new THREE.Vector3();
        this.speed = 0.25;
        this.sensitivity = 1;
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.pitch = 0;
        this.yaw = 0;
    }

    handleKeyDown(key) {
        this.keys[key.toLowerCase()] = true;
    }

    handleKeyUp(key) {
        this.keys[key.toLowerCase()] = false;
    }

    updateMousePosition(x, y) {
        this.mouseX = x;
        this.mouseY = y;
        
        // Calcular ángulos de rotación
        const deltaX = x - (window.innerWidth / 2);
        const deltaY = y - (window.innerHeight / 2);
        
        this.yaw -= deltaX * 0.003 * this.sensitivity;
        this.pitch -= deltaY * 0.003 * this.sensitivity;
        
        // Limitar pitch
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
        
        // Aplicar rotaciones
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;
    }

    update() {
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

        this.velocity.set(0, 0, 0);

        if (this.keys['w']) this.velocity.add(forward.multiplyScalar(this.speed));
        if (this.keys['s']) this.velocity.sub(forward.multiplyScalar(this.speed));
        if (this.keys['a']) this.velocity.sub(right.multiplyScalar(this.speed));
        if (this.keys['d']) this.velocity.add(right.multiplyScalar(this.speed));

        this.camera.position.add(this.velocity);
        this.camera.position.y = 1.7; // Altura del jugador
    }
}
