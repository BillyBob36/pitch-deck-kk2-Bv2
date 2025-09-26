class PitchDeck {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.slide');
        this.totalSlides = this.slides.length;
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateNavigation();
        this.handleKeyboard();
    }

    bindEvents() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Support tactile pour mobile
        let touchStartY = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartY, touchEndY);
        }, { passive: true });
    }

    handleKeyboard() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevSlide();
                    break;
                case 'ArrowDown':
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides - 1);
                    break;
            }
        });
    }

    handleSwipe(startY, endY) {
        const swipeThreshold = 50;
        const diff = startY - endY;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.goToSlide(this.currentSlide + 1);
        } else if (this.currentSlide === this.totalSlides - 1) {
            // Si on est à la dernière slide (10), aller vers la suite
            if (window.unifiedNavigation) {
                window.unifiedNavigation.navigateToFile('suite', 11);
            } else {
                window.location.href = 'suite.html#slide11';
            }
        }
    }

    prevSlide() {
        if (this.currentSlide > 0) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    goToSlide(slideIndex) {
        if (slideIndex >= 0 && slideIndex < this.totalSlides) {
            // Retirer la classe active de la slide actuelle
            this.slides[this.currentSlide].classList.remove('active');
            
            // Mettre à jour l'index
            this.currentSlide = slideIndex;
            
            // Ajouter la classe active à la nouvelle slide
            setTimeout(() => {
                this.slides[this.currentSlide].classList.add('active');
            }, 50);
            
            this.updateNavigation();
            this.updateURL();
        }
    }

    updateNavigation() {
        // Mettre à jour l'état des boutons
        this.prevBtn.disabled = this.currentSlide === 0;
        // Le bouton suivant reste toujours actif (même à la dernière slide pour aller vers la suite)
        this.nextBtn.disabled = false;
        
        // Ajouter des classes visuelles pour les boutons désactivés
        this.prevBtn.style.opacity = this.currentSlide === 0 ? '0.3' : '1';
        this.nextBtn.style.opacity = '1'; // Toujours visible
        
        // Mettre à jour le titre de la page
        document.title = `Metagora - Pitch Deck (${this.currentSlide + 1}/${this.totalSlides})`;
    }

    updateURL() {
        // Mettre à jour l'URL avec le hash de la slide actuelle
        const url = new URL(window.location);
        url.hash = `slide${this.currentSlide + 1}`;
        window.history.replaceState({}, '', url);
    }

    toggleFullscreen() {
        if (window.unifiedNavigation) {
            window.unifiedNavigation.toggleFullscreen();
        } else {
            if (!document.fullscreenElement) {
                // Entrer en plein écran
                document.documentElement.requestFullscreen().catch(err => {
                    console.error(`Erreur lors de l'activation du plein écran: ${err.message}`);
                });
            } else {
                // Sortir du plein écran
                document.exitFullscreen();
            }
        }
    }

    // Méthode pour aller directement à une slide via l'URL
    handleHashChange() {
        const hash = window.location.hash;
        if (hash) {
            const slideNumber = parseInt(hash.replace('#slide', ''));
            if (!isNaN(slideNumber) && slideNumber > 0 && slideNumber <= this.totalSlides) {
                this.goToSlide(slideNumber - 1);
            }
        }
    }

    // Méthode pour obtenir la slide actuelle (utile pour débogage)
    getCurrentSlide() {
        return this.currentSlide + 1;
    }

    // Méthode pour obtenir le nombre total de slides
    getTotalSlides() {
        return this.totalSlides;
    }
}

// Initialiser le pitch deck quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    const pitchDeck = new PitchDeck();
    
    // Gérer le changement de hash dans l'URL
    window.addEventListener('hashchange', () => {
        pitchDeck.handleHashChange();
    });
    
    // Vérifier s'il y a un hash au chargement initial
    pitchDeck.handleHashChange();
    
    // Exposer l'instance pour le débogage
    window.pitchDeck = pitchDeck;
    
    console.log('🚀 Pitch Deck Metagora initialisé !');
    console.log(`📊 ${pitchDeck.getTotalSlides()} slides disponibles`);
    console.log('⌨️ Utilisez les flèches ou les boutons pour naviguer');
});

// Empêcher le défilement par défaut du navigateur
document.addEventListener('wheel', (e) => {
    e.preventDefault();
}, { passive: false });

// Gérer le focus pour l'accessibilité
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Quand l'onglet redevient visible, s'assurer que la slide actuelle est bien affichée
        const activeSlide = document.querySelector('.slide.active');
        if (activeSlide) {
            activeSlide.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});