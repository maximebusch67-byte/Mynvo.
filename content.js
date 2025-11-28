(() => {
    console.log("🎮 Extension Mynvo ZQSD - Chargée");
    
    // Configuration des touches
    const defaultConfig = {
        up: 'z',
        down: 's', 
        left: 'q',
        right: 'd',
        jump: ' '
    };

    let config = { ...defaultConfig };

    // Charger la configuration
    if (chrome.storage) {
        chrome.storage.sync.get(defaultConfig, (result) => {
            config = result;
            console.log('✅ Configuration chargée:', config);
        });
    }

    // Système de mapping des touches
    const getKeyMap = () => ({
        [config.up.toLowerCase()]: { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
        [config.down.toLowerCase()]: { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
        [config.left.toLowerCase()]: { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
        [config.right.toLowerCase()]: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
        [config.jump]: { key: ' ', code: 'Space', keyCode: 32 }
    });

    let currentHandler = null;

    const applyKeyMapping = () => {
        // Supprimer l'ancien handler
        if (currentHandler) {
            document.removeEventListener('keydown', currentHandler, true);
            document.removeEventListener('keyup', currentHandler, true);
        }

        const keyMap = getKeyMap();
        
        const handler = (e) => {
            const key = e.key.toLowerCase();
            const mappedKey = keyMap[key];
            
            if (!mappedKey) return;

            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();

            // Créer le nouvel événement
            const newEvent = new KeyboardEvent(e.type, {
                key: mappedKey.key,
                code: mappedKey.code,
                keyCode: mappedKey.keyCode,
                which: mappedKey.keyCode,
                bubbles: true,
                cancelable: true,
                composed: true
            });

            // Injecter l'événement
            const targets = [
                document,
                window,
                document.activeElement,
                document.querySelector('canvas'),
                document.querySelector('body')
            ].filter(target => target);

            targets.forEach(target => {
                try {
                    target.dispatchEvent(newEvent);
                } catch (err) {
                    // Ignorer les erreurs
                }
            });

            console.log(`🎯 ${key} → ${mappedKey.key}`);
        };

        // Ajouter les nouveaux écouteurs
        document.addEventListener('keydown', handler, { capture: true });
        document.addEventListener('keyup', handler, { capture: true });
        currentHandler = handler;

        console.log('✅ Contrôles ZQSD activés:', config);
    };

    // Appliquer le mapping au chargement
    applyKeyMapping();

    // Mettre à jour quand la config change
    if (chrome.storage) {
        chrome.storage.onChanged.addListener(() => {
            chrome.storage.sync.get(defaultConfig, (result) => {
                config = result;
                applyKeyMapping();
            });
        });
    }

    // Auto-click sur Play
    function autoClickPlay() {
        console.log('🔄 Recherche du bouton Play...');
        
        const selectors = [
            'button[class*="play"]',
            'button[class*="start"]',
            '.play-button',
            '.start-button',
            '#play',
            '#start',
            'canvas'
        ];

        const interval = setInterval(() => {
            let playButton = null;
            
            for (const selector of selectors) {
                playButton = document.querySelector(selector);
                if (playButton) {
                    console.log(`✅ Bouton trouvé: ${selector}`);
                    clearInterval(interval);
                    
                    if (selector === 'canvas') {
                        // Cliquer au centre du canvas
                        const rect = playButton.getBoundingClientRect();
                        const clickEvent = new MouseEvent('click', {
                            clientX: rect.left + rect.width / 2,
                            clientY: rect.top + rect.height / 2,
                            bubbles: true
                        });
                        playButton.dispatchEvent(clickEvent);
                    } else {
                        playButton.click();
                    }
                    
                    // Focus après le clic
                    setTimeout(() => {
                        const canvas = document.querySelector('canvas');
                        if (canvas) {
                            canvas.focus();
                            console.log('🎮 Focus sur le canvas');
                        }
                    }, 1000);
                    
                    break;
                }
            }
        }, 1000);

        // Arrêter après 10 secondes
        setTimeout(() => clearInterval(interval), 10000);
    }

    // Lancer l'auto-click après le chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoClickPlay);
    } else {
        autoClickPlay();
    }

    // Bandeau indicateur
    const indicator = document.createElement('div');
    indicator.innerHTML = `🎮 MYNVO ZQSD: <strong>${config.left.toUpperCase()} ${config.up.toUpperCase()} ${config.down.toUpperCase()} ${config.right.toUpperCase()}</strong> | <strong>${config.jump === ' ' ? 'SPACE' : config.jump.toUpperCase()}</strong>`;
    indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #0d1117;
        color: #58a6ff;
        padding: 10px 15px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: bold;
        border: 2px solid #7c62dc;
        z-index: 999999;
        pointer-events: none;
        box-shadow: 0 5px 15px rgba(124, 98, 220, 0.3);
    `;
    document.body.appendChild(indicator);

    console.log('✅ Extension Mynvo complètement initialisée');
})();
