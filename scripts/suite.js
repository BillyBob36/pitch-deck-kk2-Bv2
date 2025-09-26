class PitchDeckSuite {
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
        } else {
            // Si on est à la dernière slide, retourner au fichier principal
            window.location.href = 'index.html#slide10';
        }
    }

    prevSlide() {
        if (this.currentSlide > 0) {
            this.goToSlide(this.currentSlide - 1);
        } else {
            // Si on est à la première slide (slide 11), retourner à la slide 10 du fichier principal
            window.location.href = 'index.html#slide10';
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
        // Le bouton précédent est toujours actif (même sur la première slide pour retourner au fichier principal)
        this.prevBtn.disabled = false;
        this.nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
        
        // Ajouter des classes visuelles pour les boutons
        // Le bouton précédent a une opacité normale même sur la première slide
        this.prevBtn.style.opacity = '1';
        this.nextBtn.style.opacity = this.currentSlide === this.totalSlides - 1 ? '0.3' : '1';
        
        // Mettre à jour le titre de la page
        document.title = `Metagora - Pitch Deck Suite (${this.currentSlide + 11}/${this.totalSlides + 10})`;
    }

    updateURL() {
        // Mettre à jour l'URL avec le hash de la slide actuelle
        const url = new URL(window.location);
        url.hash = `slide${this.currentSlide + 11}`;
        window.history.replaceState({}, '', url);
    }

    toggleFullscreen() {
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

    // Méthode pour aller directement à une slide via l'URL
    handleHashChange() {
        const hash = window.location.hash;
        if (hash) {
            const slideNumber = parseInt(hash.replace('#slide', ''));
            if (!isNaN(slideNumber) && slideNumber >= 11 && slideNumber <= this.totalSlides + 10) {
                this.goToSlide(slideNumber - 11);
            }
        }
    }

    // Méthode pour obtenir la slide actuelle (utile pour débogage)
    getCurrentSlide() {
        return this.currentSlide + 11;
    }

    // Méthode pour obtenir le nombre total de slides
    getTotalSlides() {
        return this.totalSlides;
    }
}

// Initialiser le pitch deck quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    const pitchDeckSuite = new PitchDeckSuite();
    
    // Gérer le changement de hash dans l'URL
    window.addEventListener('hashchange', () => {
        pitchDeckSuite.handleHashChange();
    });
    
    // Vérifier s'il y a un hash au chargement initial
    pitchDeckSuite.handleHashChange();
    
    // Exposer l'instance pour le débogage
    window.pitchDeckSuite = pitchDeckSuite;
    
    console.log('🚀 Pitch Deck Metagora Suite initialisé !');
    console.log(`📊 ${pitchDeckSuite.getTotalSlides()} slides disponibles`);
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