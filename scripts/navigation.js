// Système de navigation unifié pour préserver le plein écran
class UnifiedNavigation {
    constructor() {
        this.isFullscreen = false;
        this.currentFile = window.location.pathname.includes('suite.html') ? 'suite' : 'index';
        this.init();
    }

    init() {
        // Vérifier l'état du plein écran au chargement
        this.checkFullscreenState();
        
        // Écouter les changements de plein écran
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            this.saveFullscreenState();
        });

        // Restaurer l'état du plein écran si nécessaire
        this.restoreFullscreenState();
    }

    checkFullscreenState() {
        this.isFullscreen = !!document.fullscreenElement;
    }

    saveFullscreenState() {
        // Sauvegarder l'état dans sessionStorage
        sessionStorage.setItem('fullscreenState', this.isFullscreen);
        sessionStorage.setItem('fullscreenTimestamp', Date.now());
    }

    restoreFullscreenState() {
        // Vérifier si on vient de changer de fichier et si on était en plein écran
        const savedState = sessionStorage.getItem('fullscreenState');
        const timestamp = sessionStorage.getItem('fullscreenTimestamp');
        const now = Date.now();
        
        // Si on a un état sauvegardé et que c'est récent (< 2 secondes)
        if (savedState === 'true' && timestamp && (now - parseInt(timestamp)) < 2000) {
            // Petit délai pour s'assurer que la page est complètement chargée
            setTimeout(() => {
                this.enterFullscreen();
            }, 100);
        }
    }

    async enterFullscreen() {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                this.isFullscreen = true;
            }
        } catch (err) {
            console.warn('Impossible d\'activer le plein écran:', err);
        }
    }

    async exitFullscreen() {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
                this.isFullscreen = false;
            }
        } catch (err) {
            console.warn('Impossible de désactiver le plein écran:', err);
        }
    }

    // Navigation intelligente entre les fichiers
    async navigateToFile(targetFile, targetSlide) {
        // Sauvegarder l'état actuel AVANT la navigation
        this.saveFullscreenState();
        
        // Construire la nouvelle URL
        const newUrl = `${targetFile}.html#slide${targetSlide}`;
        
        // Utiliser l'API History pour éviter le rechargement complet
        try {
            // Pour la navigation entre fichiers, on doit utiliser location.replace
            // mais on peut essayer de préserver l'état via sessionStorage
            window.location.replace(newUrl);
        } catch (err) {
            // Fallback sur la méthode classique
            window.location.href = newUrl;
        }
    }

    // Méthode pour basculer le plein écran
    toggleFullscreen() {
        if (this.isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }

    // Obtenir l'état actuel du plein écran
    getFullscreenState() {
        return this.isFullscreen;
    }
}

// Créer une instance globale
window.unifiedNavigation = new UnifiedNavigation();

// Exporter pour utilisation dans les autres scripts
window.UnifiedNavigation = UnifiedNavigation;