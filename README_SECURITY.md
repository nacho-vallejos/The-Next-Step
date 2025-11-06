# 🔒 The Next Step - Sitio Web Seguro

Sitio web de consultoría legal con arquitectura de seguridad por capas, cumpliendo con **OWASP Top 10**, **Ley 25.326** de Argentina y mejores prácticas de DevSecOps.

![Security](https://img.shields.io/badge/Security-Hardened-green)
![Node](https://img.shields.io/badge/Node.js-18+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/License-Proprietary-red)

## 📋 Tabla de Contenidos

- [Características de Seguridad](#características-de-seguridad)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Arquitectura](#arquitectura)
- [Testing de Seguridad](#testing-de-seguridad)
- [Despliegue](#despliegue)
- [Compliance](#compliance)
- [Contribución](#contribución)

## 🛡️ Características de Seguridad

### Defensas Implementadas

✅ **Headers de Seguridad**
- Helmet.js con CSP estricta + nonce dinámico
- HSTS con preload
- X-Content-Type-Options, X-Frame-Options
- Referrer-Policy, Permissions-Policy
- Cross-Origin policies

✅ **Protección contra Ataques**
- CSRF con doble submit cookie
- XSS con sanitización y CSP
- SQL Injection con validación estricta
- NoSQL Injection con mongo-sanitize
- Command Injection con detección de patrones
- HTTP Parameter Pollution
- Clickjacking con framebusting

✅ **Rate Limiting & DDoS**
- Rate limiting por IP y ruta
- Slow down progresivo
- Límites especiales para auth y contacto
- Bloqueo de bots maliciosos

✅ **Autenticación & Autorización**
- JWT con rotación de tokens
- Bcrypt/Argon2 para passwords
- Sesiones con HttpOnly cookies
- Guards de autenticación/autorización

✅ **Validación & Sanitización**
- Joi/Zod para schemas
- DOMPurify para HTML
- Validación de MIME types
- Detección de patrones peligrosos

✅ **Logging & Monitoring**
- Pino logger con redacción de secretos
- IDS básico por IP
- Auditoría de eventos críticos
- Alertas de seguridad

✅ **DevSecOps**
- Gitleaks (secretos en código)
- CodeQL (SAST)
- npm audit automatizado
- SBOM con CycloneDX
- GitHub Actions pipeline

## 📦 Requisitos

- **Node.js:** >= 18.0.0
- **npm:** >= 9.0.0
- **TypeScript:** 5.3+
- **Redis:** (opcional, para sesiones distribuidas)
- **Nginx:** (producción, como reverse proxy)

## 🚀 Instalación

### 1. Clonar Repositorio

\`\`\`bash
git clone https://github.com/nacho-vallejos/The-Next-Step.git
cd The-Next-Step
\`\`\`

### 2. Instalar Dependencias

\`\`\`bash
npm install
\`\`\`

### 3. Configurar Variables de Entorno

\`\`\`bash
cp .env.example .env
\`\`\`

Editar \`.env\` y configurar:
- \`SESSION_SECRET\`: String aleatorio >= 32 caracteres
- \`COOKIE_SECRET\`: String aleatorio >= 32 caracteres
- \`JWT_SECRET\`: String aleatorio >= 64 caracteres
- \`ALLOWED_ORIGINS\`: Dominio(s) permitido(s)

**Generar secretos seguros:**

\`\`\`bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
\`\`\`

### 4. Build

\`\`\`bash
npm run build
\`\`\`

## ⚙️ Configuración

### Estructura de Archivos

\`\`\`
The-Next-Step/
├── src/
│   ├── server/
│   │   ├── server.ts              # Servidor principal
│   │   ├── middleware/security/   # Middlewares de seguridad
│   │   │   ├── helmet.ts          # CSP + headers
│   │   │   ├── rateLimit.ts       # Rate limiting
│   │   │   ├── cors.ts            # CORS estricto
│   │   │   ├── csrf.ts            # CSRF protection
│   │   │   ├── validation.ts      # Joi/Zod validation
│   │   │   ├── errors.ts          # Error handling
│   │   │   ├── upload.ts          # Multer seguro
│   │   │   └── authGuards.ts      # JWT/sesiones
│   │   ├── utils/
│   │   │   ├── cspNonce.ts        # Generador de nonce
│   │   │   ├── logger.ts          # Pino logger + IDS
│   │   │   └── sanitizer.ts       # DOMPurify
│   │   └── routes/
│   │       ├── public.ts          # Rutas públicas
│   │       ├── auth.ts            # Autenticación
│   │       └── contact.ts         # Formulario
│   └── web/
│       ├── index.html             # Frontend
│       ├── styles.css             # Estilos
│       ├── app.js                 # JavaScript
│       └── assets/                # Recursos estáticos
├── config/
│   └── nginx.conf                 # Configuración Nginx
├── .github/workflows/
│   └── security.yml               # CI/CD seguridad
├── .env.example                   # Template variables
├── SECURITY.txt                   # RFC 9116
├── privacy-policy.md              # Ley 25.326
└── cookies-policy.md              # GDPR-style
\`\`\`

### Configuración de Nginx (Producción)

1. Copiar configuración:

\`\`\`bash
sudo cp config/nginx.conf /etc/nginx/sites-available/thenextstep
sudo ln -s /etc/nginx/sites-available/thenextstep /etc/nginx/sites-enabled/
\`\`\`

2. Generar certificado TLS (Let's Encrypt):

\`\`\`bash
sudo certbot --nginx -d thenextstep.com.ar -d www.thenextstep.com.ar
\`\`\`

3. Generar DH parameters:

\`\`\`bash
sudo openssl dhparam -out /etc/nginx/dhparam.pem 2048
\`\`\`

4. Recargar Nginx:

\`\`\`bash
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

## 💻 Uso

### Desarrollo

\`\`\`bash
npm run dev
\`\`\`

Servidor disponible en: \`http://localhost:3000\`

### Producción

\`\`\`bash
npm run build
npm run start:prod
\`\`\`

### Scripts Disponibles

\`\`\`bash
npm run dev           # Desarrollo con hot-reload
npm run build         # Compilar TypeScript
npm run start         # Iniciar servidor compilado
npm run start:prod    # Producción con NODE_ENV=production
npm run lint          # ESLint
npm run format        # Prettier
npm test              # Jest tests
npm run audit         # npm audit
npm run sbom          # Generar SBOM
npm run scan:secrets  # Gitleaks
npm run depcheck      # Verificar dependencias
npm run security:check # Todos los checks
\`\`\`

## 🏗️ Arquitectura

### Capas de Seguridad

\`\`\`
┌─────────────────────────────────────────┐
│         NGINX (Reverse Proxy)           │
│  • TLS 1.3                              │
│  • HSTS, OCSP Stapling                  │
│  • Rate Limiting L7                     │
│  • Headers de seguridad                 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Express.js (Node Backend)          │
│  • Helmet + CSP con nonce               │
│  • CORS estricto                        │
│  • CSRF protection                      │
│  • Rate limiting                        │
│  • Input validation (Joi/Zod)           │
│  • Sanitización (DOMPurify)             │
│  • Auth Guards (JWT)                    │
│  • Logging (Pino) + IDS                 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Frontend (HTML/CSS/JS)          │
│  • CSP-compliant scripts con nonce      │
│  • SRI en recursos externos             │
│  • Validación client-side               │
│  • DOMPurify en contenido dinámico      │
│  • Fetch con credentials: same-origin   │
└─────────────────────────────────────────┘
\`\`\`

### Flujo de Request

\`\`\`
1. Cliente → NGINX
   └─ TLS handshake
   └─ Rate limit check
   └─ Headers de seguridad

2. NGINX → Express
   └─ Proxy con X-Forwarded-*
   └─ Connection keep-alive

3. Express Middlewares (orden)
   └─ 1. Nonce generation
   └─ 2. Helmet + CSP
   └─ 3. CORS
   └─ 4. Rate limiting
   └─ 5. Body parsers
   └─ 6. Cookie parser
   └─ 7. Session
   └─ 8. CSRF
   └─ 9. Sanitization
   └─ 10. Routes
   └─ 11. Error handlers

4. Route Handlers
   └─ Validation (Joi/Zod)
   └─ Auth guards
   └─ Business logic
   └─ Logging

5. Response → Cliente
   └─ Headers de seguridad
   └─ Content-Type correcto
   └─ Cache control
\`\`\`

## 🧪 Testing de Seguridad

### Checklist Manual

\`\`\`bash
# 1. Headers de seguridad
curl -I https://thenextstep.com.ar

# Verificar:
# ✓ Strict-Transport-Security
# ✓ Content-Security-Policy
# ✓ X-Content-Type-Options: nosniff
# ✓ X-Frame-Options: DENY
# ✓ Referrer-Policy: no-referrer

# 2. TLS Configuration
nmap --script ssl-enum-ciphers -p 443 thenextstep.com.ar

# 3. Rate Limiting
ab -n 200 -c 10 https://thenextstep.com.ar/api/contact

# 4. CSRF Protection
curl -X POST https://thenextstep.com.ar/api/contact \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","email":"test@test.com","mensaje":"Test"}'
# Debe retornar 403 sin token CSRF

# 5. XSS Protection
curl -X POST https://thenextstep.com.ar/api/contact \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <token>" \
  -d '{"nombre":"<script>alert(1)</script>","email":"test@test.com","mensaje":"Test"}'
# Debe sanitizar el input
\`\`\`

### Herramientas Automatizadas

\`\`\`bash
# OWASP ZAP
zap-cli quick-scan https://thenextstep.com.ar

# Nikto
nikto -h https://thenextstep.com.ar

# SSL Labs
https://www.ssllabs.com/ssltest/analyze.html?d=thenextstep.com.ar

# Security Headers
https://securityheaders.com/?q=thenextstep.com.ar

# Mozilla Observatory
https://observatory.mozilla.org/analyze/thenextstep.com.ar
\`\`\`

### CI/CD Security Pipeline

El workflow \`.github/workflows/security.yml\` ejecuta automáticamente:

- ✅ Gitleaks (secretos)
- ✅ CodeQL (SAST)
- ✅ npm audit
- ✅ SBOM generation
- ✅ Dependency check
- ✅ ESLint security rules
- ✅ Unit tests

## 🚀 Despliegue

### Producción con PM2

\`\`\`bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicación
pm2 start dist/server/server.js --name thenextstep

# Configurar autostart
pm2 startup
pm2 save

# Monitoring
pm2 monit
\`\`\`

### Docker (Opcional)

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
COPY src/web ./src/web
USER node
EXPOSE 3000
CMD ["node", "dist/server/server.js"]
\`\`\`

## 📜 Compliance

### Ley 25.326 (Argentina)

- ✅ Política de privacidad completa
- ✅ Consentimiento explícito
- ✅ Derechos de acceso, rectificación, supresión
- ✅ Retención de datos (2 años)
- ✅ Medidas de seguridad técnicas y organizativas
- ✅ Registro de tratamiento de datos

### OWASP Top 10 2021

| Vulnerabilidad | Mitigación |
|----------------|------------|
| A01 Broken Access Control | Auth guards, RBAC |
| A02 Cryptographic Failures | TLS 1.3, bcrypt/argon2 |
| A03 Injection | Joi/Zod validation, sanitización |
| A04 Insecure Design | Threat modeling, secure SDLC |
| A05 Security Misconfiguration | Helmet, secure defaults |
| A06 Vulnerable Components | npm audit, Dependabot |
| A07 Authentication Failures | MFA-ready, rate limiting |
| A08 Software/Data Integrity | SRI, SBOM, verificación |
| A09 Logging Failures | Pino logger, audit logs |
| A10 SSRF | Input validation, whitelist |

## 🤝 Contribución

Para reportar vulnerabilidades de seguridad:

**Email:** security@thenextstep.com.ar  
**Security.txt:** https://thenextstep.com.ar/.well-known/security.txt

### Política de Divulgación Responsable

1. Reportar vulnerabilidad por email cifrado (PGP opcional)
2. No divulgar públicamente hasta que se resuelva
3. Responderemos dentro de 48 horas hábiles
4. Reconocimiento en Hall of Fame (opcional)

## 📄 Licencia

Copyright © 2025 The Next Step. Todos los derechos reservados.

Este proyecto es propietario y confidencial. No se permite la reproducción sin autorización.

## 📞 Contacto

**The Next Step - Consultoría Legal**

- 🌐 Web: https://thenextstep.com.ar
- 📧 Email: contacto@thenextstep.com.ar
- 🔒 Security: security@thenextstep.com.ar
- 📞 Teléfono: +54 9 3425 03-1568
- 📍 Ubicación: Puerto Norte, Santa Fe, Argentina

---

**Construido con seguridad en mente 🔒**
