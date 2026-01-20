// ==========================================
// SMOOTH SCROLL & NAVIGATION
// ==========================================

// Configurar video de fondo
const lunarVideo = document.getElementById('lunar-video-bg');
if (lunarVideo) {
    // Verificar si el video está cargado
    lunarVideo.addEventListener('loadeddata', () => {
        // Video loaded
    });
    
    lunarVideo.addEventListener('error', (e) => {
        // Video error - silent fail
    });
    
    // Asegurar que el video se reproduzca
    lunarVideo.play().then(() => {
        // Video playing
    }).catch(err => {
        // Autoplay prevented - require user interaction
        document.addEventListener('click', () => {
            lunarVideo.play();
        }, { once: true });
    });
    
    // Pausar video cuando no esté visible (optimización)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            lunarVideo.pause();
        } else {
            lunarVideo.play();
        }
    });
}

// Smooth scroll para enlaces internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Cerrar menú móvil si está abierto
            nav.classList.remove('active');
        }
    });
});

// ==========================================
// HEADER SCROLL EFFECT
// ==========================================

const header = document.getElementById('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Agregar clase "scrolled" cuando se hace scroll
    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ==========================================
// ACTIVE NAV LINK ON SCROLL
// ==========================================

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ==========================================
// MOBILE MENU TOGGLE
// ==========================================

const menuToggle = document.getElementById('menuToggle');
const nav = document.querySelector('.nav');

menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

// Cerrar menú al hacer clic fuera
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
    }
});

// ==========================================
// INTERSECTION OBSERVER (Animaciones al scroll)
// ==========================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Animación escalonada para las tarjetas de servicio
            if (entry.target.classList.contains('servicio-card')) {
                const cards = document.querySelectorAll('.servicio-card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('visible');
                    }, index * 150);
                });
            }
        }
    });
}, observerOptions);

// Observar elementos con animación
const fadeElements = document.querySelectorAll('.fade-in');
const servicioCards = document.querySelectorAll('.servicio-card');

fadeElements.forEach(el => observer.observe(el));
servicioCards.forEach(card => observer.observe(card));

// ==========================================
// FORMULARIO DE CONTACTO
// ==========================================

const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Obtener valores del formulario
    const formData = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        empresa: document.getElementById('empresa').value,
        mensaje: document.getElementById('mensaje').value
    };
    
    // Validación básica
    if (!formData.nombre || !formData.email || !formData.mensaje) {
        showNotification('Por favor, completa todos los campos obligatorios.', 'error');
        return;
    }
    
    // Aquí puedes integrar con tu backend o servicio de email
    console.log('Formulario enviado:', formData);
    
    // Simulación de envío exitoso
    showNotification('¡Gracias por contactarnos! Responderemos pronto.', 'success');
    
    // Limpiar formulario
    contactForm.reset();
});

// ==========================================
// SISTEMA DE NOTIFICACIONES
// ==========================================

function showNotification(message, type = 'success') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos inline para la notificación
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        background: type === 'success' ? '#d4af37' : '#d32f2f',
        color: type === 'success' ? '#000000' : '#ffffff',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.3)',
        zIndex: '10000',
        animation: 'slideIn 0.3s ease',
        maxWidth: '300px',
        fontSize: '0.9rem',
        fontWeight: '600'
    });
    
    document.body.appendChild(notification);
    
    // Eliminar después de 4 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// Agregar estilos de animación para notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==========================================
// PARALLAX EFFECT EN HERO
// ==========================================

const heroBackground = document.querySelector('.hero-background');

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxSpeed = 0.5;
    
    if (heroBackground && scrolled < window.innerHeight) {
        heroBackground.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    }
});

// ==========================================
// PRELOAD ANIMATIONS
// ==========================================

window.addEventListener('load', () => {
    // Agregar clase visible a elementos hero
    const heroElements = document.querySelectorAll('.hero .fade-in');
    heroElements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('visible');
        }, index * 200);
    });
});

// ==========================================
// SCROLL TO TOP BUTTON (Opcional)
// ==========================================

// Crear botón de scroll to top
const scrollTopBtn = document.createElement('button');
scrollTopBtn.innerHTML = '↑';
scrollTopBtn.className = 'scroll-top-btn';
Object.assign(scrollTopBtn.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'var(--color-gold)',
    color: 'var(--color-black)',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    opacity: '0',
    visibility: 'hidden',
    transition: 'all 0.3s ease',
    zIndex: '1000',
    boxShadow: '0 5px 20px rgba(212, 175, 55, 0.4)',
    fontWeight: 'bold'
});

document.body.appendChild(scrollTopBtn);

// Mostrar/ocultar botón según scroll
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
        scrollTopBtn.style.opacity = '1';
        scrollTopBtn.style.visibility = 'visible';
    } else {
        scrollTopBtn.style.opacity = '0';
        scrollTopBtn.style.visibility = 'hidden';
    }
});

// Scroll to top al hacer clic
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Hover effect
scrollTopBtn.addEventListener('mouseenter', () => {
    scrollTopBtn.style.transform = 'translateY(-5px)';
    scrollTopBtn.style.boxShadow = '0 8px 30px rgba(212, 175, 55, 0.6)';
});

scrollTopBtn.addEventListener('mouseleave', () => {
    scrollTopBtn.style.transform = 'translateY(0)';
    scrollTopBtn.style.boxShadow = '0 5px 20px rgba(212, 175, 55, 0.4)';
});

// ==========================================
// PERFORMANCE OPTIMIZATION
// ==========================================

// Debounce function para optimizar eventos de scroll
function debounce(func, wait = 10) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Aplicar debounce a eventos de scroll intensivos
const debouncedScroll = debounce(() => {
    // Aquí puedes poner código que se ejecute en scroll
}, 10);

window.addEventListener('scroll', debouncedScroll);

console.log('🚀 The Next Step - Website loaded successfully!');

// ==========================================
// SISTEMA DE TRADUCCIÓN MULTI-IDIOMA
// ==========================================

const translations = {
    es: {
        // Header
        'nav-inicio': 'Inicio',
        'nav-servicios': 'Servicios',
        'nav-ciber': 'Ciberseguridad',
        'nav-nosotros': 'Nosotros',
        'nav-clientes': 'Clientes',
        'nav-contacto': 'Contacto',
        'logo-subtitle': 'Legal Consulting',
        
        // Hero
        'hero-title': 'The Next Step',
        'hero-tagline': 'Grandes Sueños, Pasos Estratégicos',
        'hero-subtitle': 'Consultoría legal y compliance digital para el siguiente paso de tu empresa.',
        'hero-btn': 'Dar el siguiente paso',
        'hero-experience': 'Más de 10 años de experiencia asesorando empresas del sector público y privado.',
        
        // Servicios
        'servicios-title': 'Nuestros Servicios',
        'btn-explorar': 'Explorar',
        'servicio-1-title': 'Consultoría Legal Integral',
        'servicio-1-desc': 'Constitución de sociedades, contratos, y asesoría completa en derecho empresarial para el crecimiento de tu negocio.',
        'servicio-2-title': 'Compliance Digital',
        'servicio-2-desc': 'Normativas digitales, derecho tecnológico y adaptación legal especializada para startups y empresas tech.',
        'servicio-3-title': 'Ciberseguridad',
        'servicio-3-desc': 'Protección de datos, auditorías técnicas y asesoramiento preventivo en seguridad informática empresarial.',
        'servicio-4-title': 'Asesoría Estratégica',
        'servicio-4-desc': 'Escalamiento empresarial y planificación legal estratégica para startups en fase de crecimiento.',
        
        // Ciberseguridad
        'ciber-title': 'Ciberseguridad',
        'ciber-subtitle': 'Soluciones técnicas para proteger tu infraestructura digital',
        'pentest-title': 'Pentest 360°',
        'pentest-subtitle': 'Ataques controlados. Resultados accionables.',
        'pentest-feat-1': 'Web/API/Mobile/AD/Cloud',
        'pentest-feat-2': 'OWASP/OSSTMM/MITRE',
        'pentest-feat-3': 'Informe ejecutivo + técnico',
        'pentest-feat-4': 'Retest incluido',
        'pentest-cta': 'Solicitar propuesta',
        'vmaas-title': 'Vulnerabilidades 24/7',
        'vmaas-subtitle': 'ASM + gestión y parches guiados.',
        'vmaas-feat-1': 'Discovery de activos',
        'vmaas-feat-2': 'Scans autenticados',
        'vmaas-feat-3': 'Prioridad por CISA KEV/EPSS',
        'vmaas-feat-4': 'Dashboard + alertas',
        'vmaas-cta': 'Agendar demo',
        
        // Por qué elegirnos
        'why-title': 'Por qué elegirnos',
        'why-text': 'En The Next Step, entendemos que el éxito no es el resultado del azar, sino de un proceso bien diseñado. Nos especializamos en guiar a empresas y emprendedores a través de un camino claro y estructurado que convierte metas ambiciosas en logros concretos.',
        'why-highlight': 'Somos los únicos en Santa Fe capital que integran derecho digital, ciberseguridad y experiencia legal en una sola consultora.',
        'why-subtitle': 'Nuestro equipo combina más de una década de experiencia y una visión innovadora para empresas en crecimiento.',
        
        // Nosotros
        'nosotros-title': 'Quiénes somos y qué queremos cambiar',
        'nosotros-intro-p1': 'En The Next Step, somos un equipo de profesionales de distintas ramas que entendemos que liderar un proyecto ambicioso puede generar incertidumbre y ansiedad. Por eso, ofrecemos un proceso claro, estructurado y personalizado que te permite avanzar con confianza hacia tus metas.',
        'nosotros-intro-p2': 'Diseñamos estrategias específicas para cada caso, simplificando lo complejo y transformando tus ideas en un camino concreto y alcanzable. Nuestro servicio no solo maximiza resultados, sino que te brinda la tranquilidad de saber exactamente qué hacer en cada etapa, reduciendo la carga mental y permitiéndote enfocarte en lo que realmente importa.',
        'nosotros-intro-p3': 'Con The Next Step, la claridad se convierte en tu mejor herramienta para liderar con seguridad y lograr lo extraordinario.',
        'nosotros-historia-title': 'Nuestra Historia',
        'nosotros-historia-p1': 'Nacimos con una misión clara: acompañar a cada negocio a dar su siguiente paso hacia el futuro. En un mundo empresarial en constante transformación, entendemos que el éxito requiere no solo cumplimiento normativo, sino una visión estratégica que anticipe los desafíos del mañana.',
        'nosotros-historia-p2': 'Desde nuestra fundación, hemos trabajado con empresas de diversos sectores, desde startups tecnológicas hasta corporaciones establecidas, ayudándolas a navegar el complejo panorama legal y digital con confianza y seguridad.',
        'nosotros-valores-title': 'Nuestros Valores',
        'valor-1-title': 'Innovación',
        'valor-1-desc': 'Adoptamos las últimas tendencias legales y tecnológicas',
        'valor-2-title': 'Confianza',
        'valor-2-desc': 'Construimos relaciones duraderas basadas en la transparencia',
        'valor-3-title': 'Compromiso',
        'valor-3-desc': 'Nos dedicamos al éxito de cada cliente como si fuera nuestro',
        
        // Clientes
        'clientes-title': 'Confían en Nosotros',
        'trust-title': 'Confían en Nosotros',
        'testimonio-1': '"The Next Step nos ayudó a estructurar legalmente nuestra startup tech desde cero. Su conocimiento en compliance digital fue fundamental."',
        'testimonio-1-autor': '— María González, CEO TechStart',
        'testimonio-2': '"Profesionalismo y experiencia en ciberseguridad. Nos brindaron la tranquilidad que necesitábamos para escalar nuestro negocio."',
        'testimonio-2-autor': '— Carlos Martínez, Director InnovaCorp',
        'testimonio-3': '"Un equipo excepcional que entiende las necesidades del sector privado. Recomendados al 100%."',
        'testimonio-3-autor': '— Laura Fernández, Gerente Legal DataSolutions',
        
        // Contacto
        'contacto-title': 'Contacto',
        'form-nombre': 'Nombre completo',
        'form-email': 'Email',
        'form-empresa': 'Empresa',
        'form-mensaje': 'Mensaje',
        'form-btn': 'Enviar consulta',
        'contacto-info-title': 'Información de Contacto',
        'contacto-direccion': 'Dirección',
        'contacto-direccion-texto': 'Puerto Norte, Santa Fe, Argentina',
        'contacto-telefono': 'Teléfono',
        'contacto-email': 'Email',
        
        // Footer
        'footer-tagline': 'Dando el siguiente paso hacia el futuro.',
        'footer-copyright': 'The Next Step © 2025 — Todos los derechos reservados.',
    },
    en: {
        // Header
        'nav-inicio': 'Home',
        'nav-servicios': 'Services',
        'nav-ciber': 'Cybersecurity',
        'nav-nosotros': 'About Us',
        'nav-clientes': 'Clients',
        'nav-contacto': 'Contact',
        'logo-subtitle': 'Legal Consulting',
        
        // Hero
        'hero-title': 'The Next Step',
        'hero-tagline': 'Big Dreams, Strategic Steps',
        'hero-subtitle': 'Legal consulting and digital compliance for your company\'s next step.',
        'hero-btn': 'Take the next step',
        'hero-experience': 'Over 10 years of experience advising public and private sector companies.',
        
        // Servicios
        'servicios-title': 'Our Services',
        'btn-explorar': 'Explore',
        'servicio-1-title': 'Comprehensive Legal Consulting',
        'servicio-1-desc': 'Company formation, contracts, and complete business law advisory for your business growth.',
        'servicio-2-title': 'Digital Compliance',
        'servicio-2-desc': 'Digital regulations, technology law and specialized legal adaptation for tech startups and companies.',
        'servicio-3-title': 'Cybersecurity',
        'servicio-3-desc': 'Data protection, technical audits and preventive advice on corporate information security.',
        'servicio-4-title': 'Strategic Advisory',
        'servicio-4-desc': 'Business scaling and strategic legal planning for startups in growth phase.',
        
        // Ciberseguridad
        'ciber-title': 'Cybersecurity',
        'ciber-subtitle': 'Technical solutions to protect your digital infrastructure',
        'pentest-title': 'Pentest 360°',
        'pentest-subtitle': 'Controlled attacks. Actionable results.',
        'pentest-feat-1': 'Web/API/Mobile/AD/Cloud',
        'pentest-feat-2': 'OWASP/OSSTMM/MITRE',
        'pentest-feat-3': 'Executive + technical report',
        'pentest-feat-4': 'Retest included',
        'pentest-cta': 'Request proposal',
        'vmaas-title': 'Vulnerabilities 24/7',
        'vmaas-subtitle': 'ASM + guided patching management.',
        'vmaas-feat-1': 'Asset discovery',
        'vmaas-feat-2': 'Authenticated scans',
        'vmaas-feat-3': 'Priority by CISA KEV/EPSS',
        'vmaas-feat-4': 'Dashboard + alerts',
        'vmaas-cta': 'Schedule demo',
        
        // Por qué elegirnos
        'why-title': 'Why choose us',
        'why-text': 'At The Next Step, we understand that success is not the result of chance, but of a well-designed process. We specialize in guiding companies and entrepreneurs through a clear and structured path that turns ambitious goals into concrete achievements.',
        'why-highlight': 'We are the only firm in Santa Fe capital that integrates digital law, cybersecurity and legal experience in one consultancy.',
        'why-subtitle': 'Our team combines over a decade of experience and an innovative vision for growing companies.',
        
        // Nosotros
        'nosotros-title': 'Who we are and what we want to change',
        'nosotros-intro-p1': 'At The Next Step, we are a team of professionals from different fields who understand that leading an ambitious project can generate uncertainty and anxiety. That is why we offer a clear, structured and personalized process that allows you to move forward with confidence towards your goals.',
        'nosotros-intro-p2': 'We design specific strategies for each case, simplifying the complex and transforming your ideas into a concrete and achievable path. Our service not only maximizes results, but also gives you the peace of mind of knowing exactly what to do at each stage, reducing mental burden and allowing you to focus on what really matters.',
        'nosotros-intro-p3': 'With The Next Step, clarity becomes your best tool to lead with confidence and achieve the extraordinary.',
        'nosotros-historia-title': 'Our Story',
        'nosotros-historia-p1': 'We were born with a clear mission: to help every business take its next step towards the future. In a constantly transforming business world, we understand that success requires not only regulatory compliance, but a strategic vision that anticipates tomorrow\'s challenges.',
        'nosotros-historia-p2': 'Since our founding, we have worked with companies from various sectors, from tech startups to established corporations, helping them navigate the complex legal and digital landscape with confidence and security.',
        'nosotros-valores-title': 'Our Values',
        'valor-1-title': 'Innovation',
        'valor-1-desc': 'We adopt the latest legal and technological trends',
        'valor-2-title': 'Trust',
        'valor-2-desc': 'We build lasting relationships based on transparency',
        'valor-3-title': 'Commitment',
        'valor-3-desc': 'We dedicate ourselves to each client\'s success as if it were our own',
        
        // Clientes
        'clientes-title': 'They Trust Us',
        'trust-title': 'They Trust Us',
        'testimonio-1': '"The Next Step helped us legally structure our tech startup from scratch. Their knowledge in digital compliance was fundamental."',
        'testimonio-1-autor': '— María González, CEO TechStart',
        'testimonio-2': '"Professionalism and expertise in cybersecurity. They gave us the peace of mind we needed to scale our business."',
        'testimonio-2-autor': '— Carlos Martínez, Director InnovaCorp',
        'testimonio-3': '"An exceptional team that understands the needs of the private sector. 100% recommended."',
        'testimonio-3-autor': '— Laura Fernández, Legal Manager DataSolutions',
        
        // Contacto
        'contacto-title': 'Contact',
        'form-nombre': 'Full name',
        'form-email': 'Email',
        'form-empresa': 'Company',
        'form-mensaje': 'Message',
        'form-btn': 'Send inquiry',
        'contacto-info-title': 'Contact Information',
        'contacto-direccion': 'Address',
        'contacto-direccion-texto': 'Puerto Norte, Santa Fe, Argentina',
        'contacto-telefono': 'Phone',
        'contacto-email': 'Email',
        
        // Footer
        'footer-tagline': 'Taking the next step towards the future.',
        'footer-copyright': 'The Next Step © 2025 — All rights reserved.',
    },
    ar: {
        // Header
        'nav-inicio': 'الرئيسية',
        'nav-servicios': 'الخدمات',
        'nav-ciber': 'الأمن السيبراني',
        'nav-nosotros': 'من نحن',
        'nav-clientes': 'العملاء',
        'nav-contacto': 'اتصل بنا',
        'logo-subtitle': 'استشارات قانونية',
        
        // Hero
        'hero-title': 'الخطوة التالية',
        'hero-tagline': 'أحلام كبيرة، خطوات استراتيجية',
        'hero-subtitle': 'استشارات قانونية والامتثال الرقمي للخطوة التالية لشركتك.',
        'hero-btn': 'اتخذ الخطوة التالية',
        'hero-experience': 'أكثر من 10 سنوات من الخبرة في تقديم المشورة للشركات في القطاعين العام والخاص.',
        
        // Servicios
        'servicios-title': 'خدماتنا',
        'btn-explorar': 'استكشف',
        'servicio-1-title': 'استشارات قانونية شاملة',
        'servicio-1-desc': 'تأسيس الشركات والعقود والمشورة الكاملة في قانون الأعمال لنمو عملك.',
        'servicio-2-title': 'الامتثال الرقمي',
        'servicio-2-desc': 'اللوائح الرقمية وقانون التكنولوجيا والتكيف القانوني المتخصص للشركات الناشئة التقنية.',
        'servicio-3-title': 'الأمن السيبراني',
        'servicio-3-desc': 'حماية البيانات والتدقيق الفني والمشورة الوقائية في أمن المعلومات للشركات.',
        'servicio-4-title': 'الاستشارات الاستراتيجية',
        'servicio-4-desc': 'توسيع الأعمال والتخطيط القانوني الاستراتيجي للشركات الناشئة في مرحلة النمو.',
        
        // Ciberseguridad
        'ciber-title': 'الأمن السيبراني',
        'ciber-subtitle': 'حلول تقنية لحماية البنية التحتية الرقمية الخاصة بك',
        'pentest-title': 'اختبار الاختراق 360°',
        'pentest-subtitle': 'هجمات محكومة. نتائج قابلة للتنفيذ.',
        'pentest-feat-1': 'ويب/API/موبايل/AD/السحابة',
        'pentest-feat-2': 'OWASP/OSSTMM/MITRE',
        'pentest-feat-3': 'تقرير تنفيذي + تقني',
        'pentest-feat-4': 'إعادة الاختبار مضمنة',
        'pentest-cta': 'طلب عرض',
        'vmaas-title': 'إدارة الثغرات 24/7',
        'vmaas-subtitle': 'ASM + إدارة التصحيحات الموجهة.',
        'vmaas-feat-1': 'اكتشاف الأصول',
        'vmaas-feat-2': 'فحوصات مصادق عليها',
        'vmaas-feat-3': 'أولوية حسب CISA KEV/EPSS',
        'vmaas-feat-4': 'لوحة تحكم + تنبيهات',
        'vmaas-cta': 'جدولة عرض توضيحي',
        
        // Por qué elegirnos
        'why-title': 'لماذا تختارنا',
        'why-text': 'في The Next Step، نفهم أن النجاح ليس نتيجة الصدفة، بل نتيجة عملية مصممة بشكل جيد. نحن متخصصون في توجيه الشركات ورجال الأعمال عبر طريق واضح ومنظم يحول الأهداف الطموحة إلى إنجازات ملموسة.',
        'why-highlight': 'نحن الوحيدون في سانتا في كابيتال الذين يدمجون القانون الرقمي والأمن السيبراني والخبرة القانونية في استشارة واحدة.',
        'why-subtitle': 'يجمع فريقنا بين أكثر من عقد من الخبرة ورؤية مبتكرة للشركات النامية.',
        
        // Nosotros
        'nosotros-title': 'من نحن وما نريد تغييره',
        'nosotros-intro-p1': 'في The Next Step، نحن فريق من المحترفين من مختلف المجالات الذين يفهمون أن قيادة مشروع طموح يمكن أن تولد عدم اليقين والقلق. لهذا السبب، نقدم عملية واضحة ومنظمة وشخصية تسمح لك بالمضي قدمًا بثقة نحو أهدافك.',
        'nosotros-intro-p2': 'نصمم استراتيجيات محددة لكل حالة، مبسطين المعقد ومحولين أفكارك إلى طريق ملموس وقابل للتحقيق. خدمتنا لا تعظم النتائج فحسب، بل تمنحك أيضًا راحة البال من معرفة ما يجب فعله بالضبط في كل مرحلة، مما يقلل من العبء العقلي ويسمح لك بالتركيز على ما يهم حقًا.',
        'nosotros-intro-p3': 'مع The Next Step، تصبح الوضوح أفضل أداة لك للقيادة بثقة وتحقيق الاستثنائي.',
        'nosotros-historia-title': 'قصتنا',
        'nosotros-historia-p1': 'ولدنا بمهمة واضحة: مساعدة كل عمل على اتخاذ خطوته التالية نحو المستقبل. في عالم الأعمال المتحول باستمرار، نفهم أن النجاح يتطلب ليس فقط الامتثال التنظيمي، بل رؤية استراتيجية تتوقع تحديات الغد.',
        'nosotros-historia-p2': 'منذ تأسيسنا، عملنا مع شركات من مختلف القطاعات، من الشركات الناشئة التقنية إلى الشركات الراسخة، مساعدتها في التنقل في المشهد القانوني والرقمي المعقد بثقة وأمان.',
        'nosotros-valores-title': 'قيمنا',
        'valor-1-title': 'الابتكار',
        'valor-1-desc': 'نتبنى أحدث الاتجاهات القانونية والتكنولوجية',
        'valor-2-title': 'الثقة',
        'valor-2-desc': 'نبني علاقات دائمة قائمة على الشفافية',
        'valor-3-title': 'الالتزام',
        'valor-3-desc': 'نكرس أنفسنا لنجاح كل عميل كما لو كان نجاحنا',
        
        // Clientes
        'clientes-title': 'يثقون بنا',
        'trust-title': 'يثقون بنا',
        'testimonio-1': '"ساعدتنا The Next Step في هيكلة شركتنا الناشئة التقنية قانونيًا من الصفر. كانت معرفتهم بالامتثال الرقمي أساسية."',
        'testimonio-1-autor': '— ماريا غونزاليس، الرئيس التنفيذي TechStart',
        'testimonio-2': '"الاحترافية والخبرة في الأمن السيبراني. منحونا راحة البال التي احتجناها لتوسيع أعمالنا."',
        'testimonio-2-autor': '— كارلوس مارتينيز، مدير InnovaCorp',
        'testimonio-3': '"فريق استثنائي يفهم احتياجات القطاع الخاص. موصى به 100٪."',
        'testimonio-3-autor': '— لورا فرنانديز، مدير قانوني DataSolutions',
        
        // Contacto
        'contacto-title': 'اتصل بنا',
        'form-nombre': 'الاسم الكامل',
        'form-email': 'البريد الإلكتروني',
        'form-empresa': 'الشركة',
        'form-mensaje': 'الرسالة',
        'form-btn': 'إرسال الاستفسار',
        'contacto-info-title': 'معلومات الاتصال',
        'contacto-direccion': 'العنوان',
        'contacto-direccion-texto': 'بويرتو نورتي، سانتا في، الأرجنتين',
        'contacto-telefono': 'الهاتف',
        'contacto-email': 'البريد الإلكتروني',
        
        // Footer
        'footer-tagline': 'اتخاذ الخطوة التالية نحو المستقبل.',
        'footer-copyright': 'The Next Step © 2025 — جميع الحقوق محفوظة.',
    }
};

// Variable para el idioma actual
let currentLang = 'es';

// Función para cambiar el idioma
function changeLanguage(lang) {
    currentLang = lang;
    
    // Actualizar dirección del texto para árabe
    if (lang === 'ar') {
        document.body.setAttribute('dir', 'rtl');
    } else {
        document.body.setAttribute('dir', 'ltr');
    }
    
    // Traducir todos los elementos con data-translate
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        } else {
            console.warn(`Translation missing for key: ${key} in language: ${lang}`);
        }
    });
    
    // Actualizar botones activos
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // Guardar preferencia en localStorage
    localStorage.setItem('preferred-language', lang);
    
    console.log(`Idioma cambiado a: ${lang}`);
}

// Event listeners para botones de idioma
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        changeLanguage(lang);
    });
});

// Cargar idioma preferido al iniciar
window.addEventListener('load', () => {
    const savedLang = localStorage.getItem('preferred-language');
    // Sanitize and validate language input
    const allowedLangs = ['es', 'en', 'ar'];
    if (savedLang && allowedLangs.includes(savedLang) && translations[savedLang]) {
        changeLanguage(savedLang);
    }
});

// ==========================================
// SECURITY: Input Sanitization
// ==========================================

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Validate and sanitize URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is safe
 */
function isValidURL(url) {
    try {
        const urlObj = new URL(url);
        return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
        return false;
    }
}

// Prevent iframe injection
window.addEventListener('DOMContentLoaded', () => {
    // Remove any injected iframes
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        if (!iframe.hasAttribute('data-allowed')) {
            iframe.remove();
        }
    });
    
    // Prevent eval and Function constructor
    window.eval = function() {
        throw new Error('eval is disabled for security');
    };
    window.Function = function() {
        throw new Error('Function constructor is disabled for security');
    };
});

// ==========================================
// SECURITY: Prevent Common Attacks
// ==========================================

// Prevent prototype pollution
Object.freeze(Object.prototype);
Object.freeze(Array.prototype);

// Clear sensitive data on page unload
window.addEventListener('beforeunload', () => {
    // Clear any sensitive data from memory
    if (window.sensitiveData) {
        window.sensitiveData = null;
    }
});