# ✅ Checklist Visual - The Next Step Awwwards

Abre **http://localhost:8000** y verifica cada elemento:

## 🎯 HERO SECTION (Parte Superior)
```
□ Título "The Next Step" en tipografía grande
□ Tagline "Grandes Sueños, Pasos Estratégicos" debajo del título
□ Fuente Playfair Display (serif elegante)
□ Botón circular con flecha a la derecha
□ Video de fondo lunar
□ Indicador de scroll animado abajo
```

## 🎨 SECCIÓN SERVICIOS (Scroll hacia abajo)
```
□ Título "Nuestros Servicios"
□ 3 tarjetas en grid horizontal (desktop) o vertical (mobile)
□ Tarjeta 1: Business Development + icono rayo
□ Tarjeta 2: Aerospace + icono capas
□ Tarjeta 3: Ciberseguridad + icono escudo
□ Al pasar mouse: tarjetas hacen scale y brillan
□ Indicador "Explorar" aparece en hover
```

## 📝 SECCIÓN "POR QUÉ ELEGIRNOS"
```
□ Título grande en Playfair Display
□ Texto: "En The Next Step, entendemos que el éxito..."
□ Segundo párrafo sobre ventaja competitiva
□ Iconografía de astronauta a la derecha
□ Animación de aparición al hacer scroll
```

## 👥 SECCIÓN "QUIÉNES SOMOS"
```
□ Título "Quiénes Somos"
□ Texto sobre equipo multidisciplinario
□ Interlineado generoso (line-height 1.8)
□ Animación text reveal al scroll
```

## 🤝 SECCIÓN "CONFÍAN EN NOSOTROS"
```
□ Título centrado
□ Marquee horizontal que se mueve solo
□ 5 nombres de clientes en loop infinito:
   • Foreman
   • TO Legaltech
   • Netsaver
   • Global Talent Football Agency
   • Arquitecta de México
□ Efecto grayscale (gris) por defecto
□ Al pasar mouse: nombre en color
□ Marquee se pausa al hover
```

## 🎨 PALETA DE COLORES
```
□ Fondo negro profundo (#0a0a0a)
□ Acentos dorados (#d4af37)
□ Texto blanco/gris
□ Estética minimalista
```

## 🎬 ANIMACIONES
```
□ Scroll suave entre secciones
□ Header se vuelve translúcido al scroll
□ Tarjetas Bento tienen hover effect
□ Marquee se mueve continuamente
□ Parallax sutil en hero
```

## 📱 RESPONSIVE (Prueba redimensionando ventana)
```
□ Desktop: 3 columnas en Bento Grid
□ Tablet: Ajuste a 2 columnas
□ Mobile: 1 columna
□ Todas las fuentes son responsive (clamp)
```

---

## 🐛 Si algo NO funciona:

### Problema: No veo estilos / página en blanco
```bash
# Verificar archivos CSS
ls -lh ~/The-Next-Step/*.css

# Hard refresh del navegador
Ctrl + Shift + R (Linux/Windows)
Cmd + Shift + R (Mac)
```

### Problema: Animaciones no funcionan
```bash
# Verificar JavaScript cargado
# Abrir DevTools (F12) > Console
# No debe haber errores rojos
```

### Problema: Marquee no se mueve
```bash
# Verificar en DevTools > Elements
# Buscar class="marquee-content"
# Debe tener animation: marqueeScroll 30s linear infinite
```

### Problema: Fuentes no se cargan
```bash
# Verificar en DevTools > Network
# Buscar fonts.googleapis.com
# Deben cargar Playfair Display e Inter
```

---

## 📦 Archivos para subir a DonWeb

Cuando estés listo para deploy en thenextstep.ar:

```
REQUERIDOS (copiar vía FTP):
├── index.html                    ← HTML principal
├── style.css                     ← Estilos Awwwards
├── globals.css                   ← Tailwind directives (opcional)
├── script.js                     ← JavaScript core
├── awwwards-animations.js        ← Animaciones opcionales
├── tailwind.config.js            ← Config (si usas Tailwind CLI)
└── assets/
    ├── videos/background.mp4     ← Video lunar
    ├── icon.svg                  ← Favicon
    └── earthrise.jpg             ← Imagen hero
```

**Nota sobre globals.css:**
Si usas las directivas `@tailwind`, necesitas compilar con Tailwind CLI:
```bash
npx tailwindcss -i globals.css -o output.css --watch
```

O simplemente elimina las referencias a globals.css si no usas Tailwind CLI.

---

✨ **Todo está implementado y listo para producción**
