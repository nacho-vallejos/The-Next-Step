# 🌙 The Next Step - Legal Consulting

Página web profesional para consultora legal especializada en compliance digital y ciberseguridad.

## 🚀 Características

- **Diseño Moderno**: Estética inspirada en el alunizaje con tema corporativo elegante
- **Totalmente Responsivo**: Adaptado para escritorio, tablet y móvil
- **Animaciones Suaves**: Efectos de fade-in y slide-up al hacer scroll
- **Navegación Intuitiva**: Header fijo con efecto frosted glass
- **Formulario de Contacto**: Sistema de notificaciones incluido
- **Optimizado**: Código limpio y comentado

## 📁 Estructura del Proyecto

```
The-Next-Step/
├── index.html          # Estructura HTML principal
├── style.css           # Estilos CSS completos
├── script.js           # JavaScript para interactividad
├── assets/             # Recursos (imágenes, favicon)
│   └── favicon.svg     # Favicon con temática lunar
└── README.md           # Este archivo
```

## 🎨 Paleta de Colores

- **Negro Profundo**: `#0d0d0d` - Fondo principal
- **Blanco**: `#ffffff` - Texto principal
- **Plateado**: `#c0c0c0` - Acentos y detalles
- **Azul Profundo**: `#0f3d91` - CTAs y elementos destacados
- **Gris Oscuro**: `#1a1a1a` - Fondos secundarios

## 🔧 Instalación y Uso

### Opción 1: Abrir directamente
Simplemente abre el archivo `index.html` en tu navegador favorito.

### Opción 2: Servidor local
Para una mejor experiencia (especialmente con mapas embebidos):

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (si tienes http-server instalado)
npx http-server

# Con PHP
php -S localhost:8000
```

Luego visita: `http://localhost:8000`

## 📱 Secciones Incluidas

1. **Hero** - Pantalla principal con CTA destacado
2. **Servicios** - 4 servicios principales en grid
3. **Por qué elegirnos** - Diferenciadores clave
4. **Nosotros** - Historia y valores de la empresa
5. **Clientes** - Logos y testimonios
6. **Contacto** - Formulario funcional + mapa
7. **Footer** - Información y redes sociales

## ⚙️ Funcionalidades JavaScript

- ✅ Smooth scroll entre secciones
- ✅ Navbar con cambio de opacidad al scroll
- ✅ Detección de sección activa
- ✅ Menú móvil responsive
- ✅ Animaciones con Intersection Observer
- ✅ Efecto parallax en hero
- ✅ Botón scroll to top
- ✅ Sistema de notificaciones
- ✅ Validación de formulario

## 🎯 Personalización

### Cambiar contenido
Edita el archivo `index.html` para actualizar textos, imágenes o estructura.

### Modificar estilos
El archivo `style.css` está organizado en secciones comentadas para fácil navegación.

### Ajustar comportamiento
Las funcionalidades están en `script.js` con comentarios descriptivos.

### Agregar tu logo
Reemplaza el texto del logo en el header por tu imagen:

```html
<div class="logo">
    <img src="assets/tu-logo.png" alt="The Next Step">
</div>
```

### Conectar formulario
El formulario actualmente muestra notificaciones locales. Para conectarlo a un backend:

```javascript
// En script.js, dentro del evento submit del formulario
fetch('https://tu-api.com/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
})
.then(response => response.json())
.then(data => showNotification('Mensaje enviado!', 'success'))
.catch(error => showNotification('Error al enviar', 'error'));
```

## 🌐 Integrar con servicios de email

### FormSpree (Gratuito)
```html
<form action="https://formspree.io/f/TU_ID" method="POST">
```

### EmailJS
Agrega el script en el HTML y configura en JavaScript.

### Netlify Forms
Agrega `netlify` al atributo del form si despliegas en Netlify.

## 📸 Imágenes

Las imágenes de fondo actuales usan Unsplash. Para producción:
1. Descarga imágenes de alta calidad de la Luna
2. Guárdalas en `/assets/`
3. Actualiza las rutas en `style.css`:

```css
.hero-background {
    background-image: url('assets/luna-background.jpg');
}
```

## 🚀 Despliegue

### GitHub Pages
1. Sube el proyecto a GitHub
2. Ve a Settings > Pages
3. Selecciona la rama main
4. Tu sitio estará en `https://tu-usuario.github.io/The-Next-Step`

### Netlify
1. Arrastra la carpeta a netlify.com/drop
2. ¡Listo!

### Vercel
```bash
npm i -g vercel
vercel
```

## 📝 Licencia

Este proyecto fue creado para "The Next Step Legal Consulting".
Todos los derechos reservados © 2025.

## 🤝 Soporte

Para consultas o soporte técnico:
- Email: contacto@thenextstep.com.ar
- Teléfono: +54 342 XXX-XXXX
- Ubicación: Santa Fe, Argentina

---

**Desarrollado con 🌙 inspiración lunar y 💼 profesionalismo corporativo**
