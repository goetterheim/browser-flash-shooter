class Weapon {
    constructor(name, type, config) {
        this.name = name;
        this.type = type; // 'pistol', 'rifle', 'shotgun', 'sniper', 'melee'
        this.ammo = config.ammo;
        this.maxAmmo = config.maxAmmo;
        this.fireRate = config.fireRate;
        this.damage = config.damage;
        this.range = config.range;
        this.spread = config.spread;
        this.isEquipped = false;
        this.lastFireTime = 0;
        this.model = null;
        this.color = config.color || 0x888888;
        this.recoil = config.recoil || 0.1;
    }

    canFire() {
        return this.ammo > 0 && Date.now() - this.lastFireTime > this.fireRate;
    }

    fire() {
        if (this.canFire()) {
            this.ammo--;
            this.lastFireTime = Date.now();
            return true;
        }
        return false;
    }

    reload() {
        this.ammo = this.maxAmmo;
    }

    createModel() {
        const group = new THREE.Group();
        
        if (this.type === 'pistol') {
            const barrel = new THREE.BoxGeometry(0.1, 0.1, 0.5);
            const grip = new THREE.BoxGeometry(0.15, 0.25, 0.1);
            const barrelMesh = new THREE.Mesh(barrel, new THREE.MeshStandardMaterial({ color: this.color }));
            const gripMesh = new THREE.Mesh(grip, new THREE.MeshStandardMaterial({ color: 0x333333 }));
            barrelMesh.position.z = 0.25;
            gripMesh.position.y = -0.1;
            group.add(barrelMesh, gripMesh);
        } else if (this.type === 'rifle') {
            const barrel = new THREE.BoxGeometry(0.08, 0.08, 1.2);
            const stock = new THREE.BoxGeometry(0.1, 0.15, 0.4);
            const scope = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 16);
            const barrelMesh = new THREE.Mesh(barrel, new THREE.MeshStandardMaterial({ color: this.color }));
            const stockMesh = new THREE.Mesh(stock, new THREE.MeshStandardMaterial({ color: 0x444444 }));
            const scopeMesh = new THREE.Mesh(scope, new THREE.MeshStandardMaterial({ color: 0x111111 }));
            barrelMesh.position.z = 0.4;
            stockMesh.position.z = -0.3;
            scopeMesh.position.y = 0.2;
            scopeMesh.rotation.z = Math.PI / 2;
            group.add(barrelMesh, stockMesh, scopeMesh);
        } else if (this.type === 'shotgun') {
            const barrel = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 16);
            const stock = new THREE.BoxGeometry(0.12, 0.2, 0.5);
            const barrelMesh = new THREE.Mesh(barrel, new THREE.MeshStandardMaterial({ color: this.color }));
            const stockMesh = new THREE.Mesh(stock, new THREE.MeshStandardMaterial({ color: 0x553333 }));
            barrelMesh.position.z = 0.3;
            barrelMesh.rotation.x = Math.PI / 2;
            stockMesh.position.z = -0.2;
            group.add(barrelMesh, stockMesh);
        }
        
        this.model = group;
        return group;
    }
}

class WeaponManager {
    constructor() {
        this.weapons = [];
        this.currentWeaponIndex = 0;
        this.initializeWeapons();
    }

    initializeWeapons() {
        const weapons = [
            new Weapon('PIPBOY-9mm', 'pistol', {
                ammo: 30,
                maxAmmo: 30,
                fireRate: 100,
                damage: 10,
                range: 50,
                spread: 0.02,
                color: 0x887733
            }),
            new Weapon('ASSAULT RIFLE', 'rifle', {
                ammo: 60,
                maxAmmo: 60,
                fireRate: 60,
                damage: 20,
                range: 100,
                spread: 0.03,
                color: 0x666666
            }),
            new Weapon('COMBAT SHOTGUN', 'shotgun', {
                ammo: 16,
                maxAmmo: 16,
                fireRate: 200,
                damage: 50,
                range: 30,
                spread: 0.1,
                color: 0x444444
            }),
            new Weapon('PLASMA RIFLE', 'rifle', {
                ammo: 40,
                maxAmmo: 40,
                fireRate: 80,
                damage: 35,
                range: 120,
                spread: 0.02,
                color: 0x00ff00
            })
        ];
        
        this.weapons = weapons;
        this.equip(0);
    }

    equip(index) {
        if (index < this.weapons.length) {
            if (this.weapons[this.currentWeaponIndex]) {
                this.weapons[this.currentWeaponIndex].isEquipped = false;
            }
            this.currentWeaponIndex = index;
            this.weapons[index].isEquipped = true;
        }
    }

    getCurrentWeapon() {
        return this.weapons[this.currentWeaponIndex];
    }

    switchWeapon(index) {
        this.equip(index);
    }

    nextWeapon() {
        this.equip((this.currentWeaponIndex + 1) % this.weapons.length);
    }

    previousWeapon() {
        this.equip((this.currentWeaponIndex - 1 + this.weapons.length) % this.weapons.length);
    }

    reload() {
        this.getCurrentWeapon().reload();
    }
}
