// ==========================================
// AWWWARDS ANIMATIONS - ENHANCED EFFECTS
// ==========================================

// AWWWARDS EFFECT: Enhanced Split Text Animation for "The Next Step" Title
document.addEventListener('DOMContentLoaded', function() {
    
    // Split text animation for main title with enhanced effects
    const mainTitle = document.getElementById('main-title');
    
    if (mainTitle) {
        const text = mainTitle.textContent;
        mainTitle.textContent = '';
        mainTitle.style.marginBottom = '3rem';
        
        text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.animationDelay = `${index * 0.08}s`;
            
            // Add hover effect to individual characters
            span.addEventListener('mouseenter', function() {
                this.style.animation = 'awwwards-char-hover 0.5s ease forwards';
            });
            
            span.addEventListener('mouseleave', function() {
                this.style.animation = '';
            });
            
            mainTitle.appendChild(span);
        });
        
        // Add floating particles effect
        createFloatingParticles(mainTitle);
    }
    
    // Pause marquee on hover
    const marqueeContent = document.querySelector('.marquee-content');
    
    if (marqueeContent) {
        marqueeContent.addEventListener('mouseenter', function() {
            this.style.animationPlayState = 'paused';
        });
        
        marqueeContent.addEventListener('mouseleave', function() {
            this.style.animationPlayState = 'running';
        });
    }
});

// Create floating particles effect
function createFloatingParticles(element) {
    const particleContainer = document.createElement('div');
    particleContainer.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: -1;
    `;
    
    element.style.position = 'relative';
    element.parentElement.insertBefore(particleContainer, element);
    
    // Create 20 particles
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: radial-gradient(circle, #d4af37, transparent);
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.5 + 0.3};
            animation: float-particle ${Math.random() * 3 + 2}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        particleContainer.appendChild(particle);
    }
}

// Add floating particle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes float-particle {
        0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-30px) translateX(10px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Mouse parallax effect for the title
document.addEventListener('mousemove', function(e) {
    const mainTitle = document.getElementById('main-title');
    if (mainTitle && window.innerWidth > 768) {
        const rect = mainTitle.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        
        mainTitle.style.transform = `perspective(1000px) rotateY(${x * 2}deg) rotateX(${-y * 2}deg)`;
    }
});

console.log('🎨 Awwwards enhanced animations loaded!');
