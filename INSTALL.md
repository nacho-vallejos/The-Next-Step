# 🚀 Guía Rápida de Instalación y Configuración

## Pasos de Instalación

### 1. Instalar Dependencias

\`\`\`bash
npm install
\`\`\`

### 2. Configurar Variables de Entorno

\`\`\`bash
cp .env.example .env
\`\`\`

Editar \`.env\` y generar secretos seguros:

\`\`\`bash
# Generar secretos
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log('COOKIE_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('base64'))"
node -e "console.log('CSRF_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
\`\`\`

### 3. Compilar TypeScript

\`\`\`bash
npm run build
\`\`\`

### 4. Iniciar Servidor

**Desarrollo:**
\`\`\`bash
npm run dev
\`\`\`

**Producción:**
\`\`\`bash
npm run start:prod
\`\`\`

## Verificación de Seguridad

### Checklist Post-Instalación

- [ ] Todas las variables en \`.env\` configuradas
- [ ] Archivo \`.env\` NO está en git
- [ ] Secretos son aleatorios y >= 32 caracteres
- [ ] \`ALLOWED_ORIGINS\` configurado correctamente
- [ ] Build exitoso sin errores
- [ ] Servidor inicia en puerto 3000
- [ ] Headers de seguridad presentes (curl -I localhost:3000)

### Testing Básico

\`\`\`bash
# 1. Health check
curl http://localhost:3000/health

# 2. Verificar headers
curl -I http://localhost:3000

# 3. Verificar CSRF
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","email":"test@test.com","mensaje":"Test"}'
# Debe retornar 403 sin token CSRF

# 4. Run security checks
npm run security:check
\`\`\`

## Configuración de Producción

### Nginx Setup

1. Instalar certificado TLS:
\`\`\`bash
sudo certbot --nginx -d tudominio.com
\`\`\`

2. Copiar config:
\`\`\`bash
sudo cp config/nginx.conf /etc/nginx/sites-available/thenextstep
sudo ln -s /etc/nginx/sites-available/thenextstep /etc/nginx/sites-enabled/
\`\`\`

3. Generar DH params:
\`\`\`bash
sudo openssl dhparam -out /etc/nginx/dhparam.pem 2048
\`\`\`

4. Reload:
\`\`\`bash
sudo nginx -t && sudo systemctl reload nginx
\`\`\`

### PM2 Setup

\`\`\`bash
npm install -g pm2
pm2 start dist/server/server.js --name thenextstep
pm2 startup
pm2 save
\`\`\`

## Troubleshooting

### Puerto en uso
\`\`\`bash
lsof -ti:3000 | xargs kill -9
\`\`\`

### Permisos de uploads
\`\`\`bash
mkdir -p uploads
chmod 755 uploads
\`\`\`

### Ver logs
\`\`\`bash
# Desarrollo
tail -f logs/*.log

# Producción con PM2
pm2 logs thenextstep
\`\`\`

## Próximos Pasos

1. Configurar base de datos (PostgreSQL/MongoDB)
2. Configurar Redis para sesiones distribuidas
3. Configurar SMTP para emails
4. Configurar Sentry para error tracking
5. Configurar backups automáticos
6. Revisar y customizar políticas de privacidad

## Soporte

- Documentación completa: [README_SECURITY.md](./README_SECURITY.md)
- Email: security@thenextstep.com.ar
