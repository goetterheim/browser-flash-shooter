class Game {
    constructor(difficulty = 'normal') {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        this.camera.position.set(0, 2, 0);
        this.camera.lookAt(0, 2, -10);

        this.scene.background = new THREE.Color(0x1a1a1a);
        this.scene.fog = new THREE.Fog(0x1a1a1a, 150, 400);

        this.difficulty = difficulty;
        this.difficultyMultipliers = {
            easy: { enemyDamage: 0.5, enemyHealth: 0.7, spawnRate: 0.5 },
            normal: { enemyDamage: 1, enemyHealth: 1, spawnRate: 1 },
            hard: { enemyDamage: 1.5, enemyHealth: 1.5, spawnRate: 1.5 }
        };

        this.player = new Player(this.camera);
        this.world = new World(this.scene);
        this.weaponManager = new WeaponManager();
        
        this.npcs = [];
        this.projectiles = [];
        this.npcProjectiles = [];
        
        this.score = 0;
        this.playerHealth = 100;
        this.playerMaxHealth = 100;
        this.wave = 1;
        this.enemiesKilledInWave = 0;
        this.waveSize = 5;
        this.isRunning = true;
        this.gameOver = false;

        this.setupLights();
        this.world.createGround();
        this.world.createSkybox();
        this.world.createApocalypticStructures();
        this.setupEventListeners();
        this.spawnWave();
        this.animate();
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffcc99, 0.9);
        directionalLight.position.set(80, 80, 80);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 4096;
        directionalLight.shadow.mapSize.height = 4096;
        directionalLight.shadow.camera.far = 300;
        directionalLight.shadow.camera.left = -150;
        directionalLight.shadow.camera.right = 150;
        directionalLight.shadow.camera.top = 150;
        directionalLight.shadow.camera.bottom = -150;
        directionalLight.shadow.bias = -0.001;
        this.scene.add(directionalLight);

        const hemisphereLight = new THREE.HemisphereLight(0xffcc99, 0x664422, 0.4);
        this.scene.add(hemisphereLight);
    }

    setupEventListeners() {
        document.addEventListener('mousemove', (e) => {
            this.player.updateMousePosition(e.clientX, e.clientY);
        });

        document.addEventListener('mousedown', (e) => {
            if (e.button === 0 && this.isRunning) {
                this.shoot();
            }
        });

        document.addEventListener('keydown', (e) => {
            this.player.handleKeyDown(e.key);
            const num = parseInt(e.key);
            if (num >= 1 && num <= 4) {
                this.weaponManager.equip(num - 1);
            }
            if (e.key === 'e' || e.key === 'E') this.weaponManager.nextWeapon();
            if (e.key === 'q' || e.key === 'Q') this.weaponManager.previousWeapon();
            if (e.key === 'r' || e.key === 'R') this.weaponManager.reload();
        });

        document.addEventListener('keyup', (e) => {
            this.player.handleKeyUp(e.key);
        });

        window.addEventListener('resize', () => this.onWindowResize());
    }

    shoot() {
        const weapon = this.weaponManager.getCurrentWeapon();
        
        if (weapon.fire()) {
            const projectileCount = weapon.type === 'shotgun' ? 8 : 1;
            
            for (let i = 0; i < projectileCount; i++) {
                const direction = this.camera.getWorldDirection(new THREE.Vector3());
                
                if (weapon.type === 'shotgun') {
                    direction.x += (Math.random() - 0.5) * weapon.spread;
                    direction.y += (Math.random() - 0.5) * weapon.spread;
                    direction.z += (Math.random() - 0.5) * weapon.spread;
                    direction.normalize();
                } else if (i > 0) {
                    direction.x += (Math.random() - 0.5) * weapon.spread * 0.5;
                    direction.y += (Math.random() - 0.5) * weapon.spread * 0.5;
                    direction.normalize();
                }
                
                const projectile = new Projectile(
                    this.camera.position.clone(),
                    direction,
                    weapon.damage,
                    weapon.range
                );
                this.scene.add(projectile.mesh);
                this.projectiles.push(projectile);
            }
            
            this.updateHUD();
        }
    }

    spawnWave() {
        const spawnCount = Math.floor(this.waveSize * (1 + this.wave * 0.3));
        
        for (let i = 0; i < spawnCount; i++) {
            setTimeout(() => {
                const angle = Math.random() * Math.PI * 2;
                const distance = 40 + Math.random() * 30;
                const x = Math.cos(angle) * distance;
                const z = Math.sin(angle) * distance;
                
                const npc = new NPC(new THREE.Vector3(x, 0, z), this);
                npc.health *= this.difficultyMultipliers[this.difficulty].enemyHealth;
                npc.maxHealth = npc.health;
                
                this.scene.add(npc.mesh);
                this.npcs.push(npc);
            }, i * 500);
        }
    }

    updateHUD() {
        const healthPercent = Math.max(0, this.playerHealth / this.playerMaxHealth) * 100;
        document.getElementById('health-bar').style.width = healthPercent + '%';
        document.getElementById('health').querySelector('.hud-value').textContent = 
            `${Math.max(0, this.playerHealth)}/100`;

        const radiationPercent = Math.max(0, (this.wave - 1) * 10) % 100;
        document.getElementById('radiation-bar').style.width = radiationPercent + '%';
        document.getElementById('radiation').querySelector('.hud-value').textContent = radiationPercent + '%';

        const weapon = this.weaponManager.getCurrentWeapon();
        document.getElementById('ammo').innerHTML = 
            `<span class="ammo-value">${weapon.ammo}</span><span class="ammo-label">/ ${weapon.maxAmmo}</span>`;

        document.getElementById('score').querySelector('.hud-value').textContent = this.score;
        document.getElementById('wave').querySelector('.hud-value').textContent = this.wave;
    }

    checkCollisions() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            for (let j = this.npcs.length - 1; j >= 0; j--) {
                const npc = this.npcs[j];
                const distance = projectile.mesh.position.distanceTo(npc.mesh.position);
                
                if (distance < 2 && npc.state !== 'dead') {
                    npc.takeDamage(projectile.damage);
                    
                    if (npc.state === 'dead') {
                        this.score += Math.floor(25 * (1 + this.wave * 0.2));
                        this.enemiesKilledInWave++;
                        
                        if (this.enemiesKilledInWave >= Math.floor(this.waveSize * (1 + this.wave * 0.3))) {
                            this.nextWave();
                        }
                    }
                    
                    this.scene.remove(projectile.mesh);
                    this.projectiles.splice(i, 1);
                    break;
                }
            }
        }

        for (let i = this.npcProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.npcProjectiles[i];
            const distance = projectile.mesh.position.distanceTo(this.camera.position);
            
            if (distance < 2) {
                this.playerHealth -= projectile.damage;
                
                if (this.playerHealth <= 0) {
                    this.endGame();
                }
                
                this.scene.remove(projectile.mesh);
                this.npcProjectiles.splice(i, 1);
            }
        }

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            if (!this.projectiles[i].isAlive()) {
                this.scene.remove(this.projectiles[i].mesh);
                this.projectiles.splice(i, 1);
            }
        }

        for (let i = this.npcProjectiles.length - 1; i >= 0; i--) {
            if (!this.npcProjectiles[i].update()) {
                this.scene.remove(this.npcProjectiles[i].mesh);
                this.npcProjectiles.splice(i, 1);
            }
        }

        for (let i = this.npcs.length - 1; i >= 0; i--) {
            if (this.npcs[i].state === 'dead' && this.npcs[i].deathTime && Date.now() - this.npcs[i].deathTime > 3000) {
                this.scene.remove(this.npcs[i].mesh);
                this.npcs.splice(i, 1);
            }
        }
    }

    nextWave() {
        this.wave++;
        this.waveSize = 5 + this.wave * 2;
        this.enemiesKilledInWave = 0;
        this.spawnWave();
    }

    endGame() {
        this.isRunning = false;
        this.gameOver = true;
        alert(`¡GAME OVER!\n\nPuntuación Final: ${this.score}\nOleadas Completadas: ${this.wave - 1}\nEnemigos Eliminados: ${this.npcs.length}`);
        location.reload();
    }

    animate() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        this.player.update();
        
        this.npcs.forEach(npc => {
            npc.update(this.camera.position);
        });
        
        this.projectiles.forEach(p => p.update());
        this.npcProjectiles.forEach(p => p.update());
        
        this.checkCollisions();
        this.updateHUD();
        this.renderer.render(this.scene, this.camera);
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }

    stop() {
        this.isRunning = false;
        this.renderer.dispose();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
