class MenuSystem {
    constructor() {
        this.currentMenu = 'main';
        this.gameInstance = null;
        this.setupEventListeners();
        this.difficulty = 'normal';
    }

    setupEventListeners() {
        document.getElementById('btn-play').addEventListener('click', () => this.startGame());
        document.getElementById('btn-settings').addEventListener('click', () => this.openSettings());
        document.getElementById('btn-credits').addEventListener('click', () => this.openCredits());
        document.getElementById('btn-resume').addEventListener('click', () => this.resumeGame());
        document.getElementById('btn-settings-pause').addEventListener('click', () => this.openSettings('pause'));
        document.getElementById('btn-menu-main').addEventListener('click', () => this.backToMainMenu());
        document.getElementById('btn-back').addEventListener('click', () => this.backFromSettings());
        document.getElementById('btn-credits-back').addEventListener('click', () => this.backFromCredits());

        document.getElementById('volume-master').addEventListener('input', (e) => {
            document.getElementById('volume-value').textContent = e.target.value + '%';
        });

        document.getElementById('mouse-sensitivity').addEventListener('input', (e) => {
            document.getElementById('sensitivity-value').textContent = e.target.value;
            if (this.gameInstance) {
                this.gameInstance.player.sensitivity = parseFloat(e.target.value) / 5;
            }
        });

        document.getElementById('screen-brightness').addEventListener('input', (e) => {
            document.getElementById('brightness-value').textContent = e.target.value + '%';
            document.body.style.filter = `brightness(${e.target.value}%)`;
        });

        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.difficulty = e.target.dataset.difficulty;
                if (this.gameInstance) {
                    this.gameInstance.setDifficulty(this.difficulty);
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.gameInstance && this.gameInstance.isRunning) {
                this.pauseGame();
            }
        });
    }

    startGame() {
        this.hideMenu('menu-container');
        document.getElementById('game-container').classList.remove('hidden');
        this.gameInstance = new Game(this.difficulty);
    }

    pauseGame() {
        this.gameInstance.isRunning = false;
        this.showMenu('pause-menu');
    }

    resumeGame() {
        this.hideMenu('pause-menu');
        this.gameInstance.isRunning = true;
    }

    openSettings(from = 'main') {
        this.hideMenu(from === 'main' ? 'menu-container' : 'pause-menu');
        this.showMenu('settings-menu');
    }

    backFromSettings() {
        this.hideMenu('settings-menu');
        if (this.gameInstance && !this.gameInstance.isRunning) {
            this.showMenu('pause-menu');
        } else {
            this.showMenu('menu-container');
        }
    }

    openCredits() {
        this.hideMenu('menu-container');
        this.showMenu('credits-menu');
    }

    backFromCredits() {
        this.hideMenu('credits-menu');
        this.showMenu('menu-container');
    }

    backToMainMenu() {
        this.hideMenu('pause-menu');
        if (this.gameInstance) {
            this.gameInstance.stop();
            this.gameInstance = null;
        }
        document.getElementById('game-container').classList.add('hidden');
        this.showMenu('menu-container');
    }

    showMenu(menuId) {
        const menu = document.getElementById(menuId);
        menu.classList.remove('menu-hidden');
        menu.classList.add('menu-active');
    }

    hideMenu(menuId) {
        const menu = document.getElementById(menuId);
        menu.classList.add('menu-hidden');
        menu.classList.remove('menu-active');
    }
}

const menuSystem = new MenuSystem();