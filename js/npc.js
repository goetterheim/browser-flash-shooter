class NPC {
    constructor(position, game) {
        this.position = position.clone();
        this.game = game;
        this.health = 50;
        this.maxHealth = 50;
        this.speed = 0.08;
        this.aggressiveness = Math.random() * 0.5 + 0.5;
        this.detectionRange = 60;
        this.attackRange = 15;
        this.lastAttackTime = 0;
        this.attackCooldown = 500;
        this.state = 'idle';
        this.patrolTarget = this.getRandomPatrolPoint();
        this.ammunition = 20 + Math.floor(Math.random() * 30);
        this.type = Math.random() > 0.7 ? 'raider' : 'ghoul';
        this.deathTime = null;
        
        this.createMesh();
    }

    createMesh() {
        const geometry = new THREE.BoxGeometry(0.8, 1.8, 0.6);
        const material = new THREE.MeshStandardMaterial({
            color: this.type === 'raider' ? 0x8B4513 : 0x4A7C59,
            emissive: this.type === 'raider' ? 0x440000 : 0x224400,
            roughness: 0.8
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.userData.npc = this;
        
        const weaponGeom = new THREE.BoxGeometry(0.1, 0.1, 0.4);
        const weaponMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
        this.weapon = new THREE.Mesh(weaponGeom, weaponMat);
        this.weapon.position.set(0.3, 0.3, -0.5);
        this.mesh.add(this.weapon);
        
        this.healthBarGeometry = new THREE.PlaneGeometry(1, 0.15);
        this.healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.healthBar = new THREE.Mesh(this.healthBarGeometry, this.healthBarMaterial);
        this.healthBar.position.y = 1.2;
        this.healthBar.position.z = 0.3;
        this.mesh.add(this.healthBar);
    }

    update(playerPosition) {
        if (this.state === 'dead') return;
        
        const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);
        
        if (distanceToPlayer < this.detectionRange) {
            this.state = 'chase';
        } else if (this.state === 'chase') {
            this.state = 'patrol';
            this.patrolTarget = this.getRandomPatrolPoint();
        }
        
        if (this.state === 'idle') {
            if (Math.random() < 0.01) {
                this.patrolTarget = this.getRandomPatrolPoint();
                this.state = 'patrol';
            }
        } else if (this.state === 'patrol') {
            this.moveTowards(this.patrolTarget);
            if (this.mesh.position.distanceTo(this.patrolTarget) < 2) {
                this.state = 'idle';
            }
        } else if (this.state === 'chase') {
            this.moveTowards(playerPosition);
            
            if (distanceToPlayer < this.attackRange) {
                this.state = 'attack';
            }
        } else if (this.state === 'attack') {
            this.attack(playerPosition);
            if (distanceToPlayer > this.attackRange * 1.5) {
                this.state = 'chase';
            }
        }
        
        const healthPercent = this.health / this.maxHealth;
        this.healthBar.scale.x = healthPercent;
        this.healthBar.material.color.setHex(healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.2 ? 0xffff00 : 0xff0000);
    }

    moveTowards(target) {
        const direction = new THREE.Vector3();
        direction.subVectors(target, this.mesh.position).normalize();
        this.mesh.position.add(direction.multiplyScalar(this.speed));
        
        this.mesh.lookAt(target.x, this.mesh.position.y, target.z);
    }

    attack(playerPosition) {
        const now = Date.now();
        if (now - this.lastAttackTime > this.attackCooldown && this.ammunition > 0) {
            const direction = new THREE.Vector3();
            direction.subVectors(playerPosition, this.mesh.position).normalize();
            
            direction.x += (Math.random() - 0.5) * 0.3;
            direction.z += (Math.random() - 0.5) * 0.3;
            direction.normalize();
            
            const projectile = new NPCProjectile(
                this.mesh.position.clone().add(new THREE.Vector3(0, 0.5, 0)),
                direction,
                10
            );
            this.game.scene.add(projectile.mesh);
            this.game.npcProjectiles.push(projectile);
            this.ammunition--;
            this.lastAttackTime = now;
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.state = 'dead';
        this.mesh.material.color.setHex(0x333333);
        this.deathTime = Date.now();
        this.game.score += 25 * this.aggressiveness;
    }

    getRandomPatrolPoint() {
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 30;
        return new THREE.Vector3(
            Math.cos(angle) * distance,
            this.position.y,
            Math.sin(angle) * distance
        );
    }
}