class World {
    constructor(scene) {
        this.scene = scene;
    }

    createGround() {
        const geometry = new THREE.PlaneGeometry(300, 300);
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, 0, 512, 512);
        
        for (let i = 0; i < 200; i++) {
            ctx.fillStyle = `rgba(139, 115, 85, ${Math.random() * 0.3})`;
            ctx.fillRect(
                Math.random() * 512,
                Math.random() * 512,
                Math.random() * 50,
                Math.random() * 50
            );
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.repeat.set(8, 8);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        const gridHelper = new THREE.GridHelper(300, 60, 0x444444, 0x222222);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
    }

    createSkybox() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#4a4a00');
        gradient.addColorStop(0.5, '#8B6914');
        gradient.addColorStop(1, '#1a1a00');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * 512,
                Math.random() * 512,
                Math.random() * 100 + 50,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        const geometry = new THREE.SphereGeometry(400, 32, 32);
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
        const skybox = new THREE.Mesh(geometry, material);
        this.scene.add(skybox);
    }

    createApocalypticStructures() {
        this.createDestroyedBuilding(new THREE.Vector3(30, 0, -40), new THREE.Vector3(8, 12, 8));
        this.createDestroyedBuilding(new THREE.Vector3(-50, 0, 20), new THREE.Vector3(6, 10, 10));
        this.createDestroyedBuilding(new THREE.Vector3(-20, 0, -60), new THREE.Vector3(7, 9, 7));
        
        this.createWatchTower(new THREE.Vector3(60, 0, 50));
        this.createWatchTower(new THREE.Vector3(-70, 0, -50));
        
        this.createBarricade(new THREE.Vector3(0, 0, -80));
        this.createBarricade(new THREE.Vector3(80, 0, 0));
        
        this.createDebris();
    }

    createDestroyedBuilding(position, size) {
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        const material = new THREE.MeshStandardMaterial({
            color: 0x555555,
            roughness: 0.9,
            metalness: 0.3
        });
        
        const building = new THREE.Mesh(geometry, material);
        building.position.copy(position);
        building.position.y = size.y / 2;
        building.castShadow = true;
        building.receiveShadow = true;
        
        for (let i = 0; i < 3; i++) {
            const crackGeom = new THREE.BoxGeometry(
                size.x * 0.3,
                size.y * 0.5,
                0.2
            );
            const crackMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
            const crack = new THREE.Mesh(crackGeom, crackMat);
            crack.position.set(
                (Math.random() - 0.5) * size.x,
                (Math.random() - 0.5) * size.y,
                size.z / 2 + 0.1
            );
            building.add(crack);
        }
        
        this.scene.add(building);
    }

    createWatchTower(position) {
        const group = new THREE.Group();
        
        const baseGeom = new THREE.CylinderGeometry(4, 5, 2, 32);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.8 });
        const base = new THREE.Mesh(baseGeom, baseMat);
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);
        
        const pillarGeom = new THREE.CylinderGeometry(1.5, 1.5, 15, 32);
        const pillar = new THREE.Mesh(pillarGeom, baseMat);
        pillar.position.y = 8.5;
        pillar.castShadow = true;
        group.add(pillar);
        
        const platformGeom = new THREE.CylinderGeometry(4, 4, 1, 32);
        const platform = new THREE.Mesh(platformGeom, baseMat);
        platform.position.y = 16;
        platform.castShadow = true;
        platform.receiveShadow = true;
        group.add(platform);
        
        const gunGeom = new THREE.BoxGeometry(0.3, 0.3, 1);
        const gunMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const gun = new THREE.Mesh(gunGeom, gunMat);
        gun.position.set(2, 17, 0);
        gun.rotation.z = Math.PI / 4;
        group.add(gun);
        
        group.position.copy(position);
        this.scene.add(group);
    }

    createBarricade(position) {
        const group = new THREE.Group();
        
        for (let i = 0; i < 5; i++) {
            const barGeom = new THREE.BoxGeometry(2, 2, 0.5);
            const barMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 });
            const bar = new THREE.Mesh(barGeom, barMat);
            bar.position.x = (i - 2) * 2.5;
            bar.castShadow = true;
            bar.receiveShadow = true;
            group.add(bar);
        }
        
        group.position.copy(position);
        this.scene.add(group);
    }

    createDebris() {
        for (let i = 0; i < 20; i++) {
            const size = Math.random() * 2 + 0.5;
            const geometry = new THREE.BoxGeometry(size, size * 0.5, size * 0.8);
            const material = new THREE.MeshStandardMaterial({
                color: 0x666666,
                roughness: 0.9
            });
            
            const debris = new THREE.Mesh(geometry, material);
            debris.position.set(
                (Math.random() - 0.5) * 200,
                size * 0.25,
                (Math.random() - 0.5) * 200
            );
            debris.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            debris.castShadow = true;
            debris.receiveShadow = true;
            this.scene.add(debris);
        }
    }
}