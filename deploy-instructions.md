# 🚀 Instrucciones de Deployment a DonWeb

## Preparación de Archivos

Los siguientes archivos deben ser subidos a tu hosting:

### Archivos Principales
- `index.html` - Página principal
- `style.css` - Estilos
- `script.js` - JavaScript
- `.htaccess` - Configuración de seguridad Apache
- `robots.txt` - Control de crawlers
- `security.txt` - Política de seguridad

### Carpetas
- `assets/` - Recursos (videos, imágenes, iconos)
  - `assets/videos/background.mp4`
  - `assets/icon.svg`

## Métodos de Deployment

### Opción 1: FTP/SFTP (Recomendado para DonWeb)

1. **Conectar via FTP:**
   ```bash
   Host: ftp.tudominio.com (o el que te provea DonWeb)
   Usuario: tu_usuario_ftp
   Contraseña: tu_contraseña
   Puerto: 21 (FTP) o 22 (SFTP)
   ```

2. **Usando FileZilla:**
   - Descargar FileZilla: https://filezilla-project.org/
   - Conectar con las credenciales de DonWeb
   - Navegar a `/public_html` o `/www`
   - Subir todos los archivos

3. **Usando terminal (Linux/Mac):**
   ```bash
   # Instalar lftp si no lo tienes
   sudo apt install lftp  # Ubuntu/Debian
   
   # Conectar y subir
   lftp -u usuario,contraseña ftp.tudominio.com
   cd public_html
   mirror -R /ruta/local/archivos .
   ```

### Opción 2: Panel de Control de DonWeb

1. Acceder a: https://www.donweb.com/es-ar/
2. Login con tus credenciales
3. Ir a "Administrador de archivos" o "File Manager"
4. Subir archivos a `/public_html` o `/www`

### Opción 3: Git Deployment (Si DonWeb lo soporta)

```bash
# En el servidor (via SSH si está disponible)
cd /public_html
git clone https://github.com/nacho-vallejos/The-Next-Step.git .
```

## Verificaciones Post-Deployment

### 1. Verificar archivos subidos
- [ ] index.html
- [ ] style.css
- [ ] script.js
- [ ] .htaccess
- [ ] robots.txt
- [ ] security.txt
- [ ] assets/videos/background.mp4
- [ ] assets/icon.svg

### 2. Permisos de archivos (importante)
```bash
# Archivos deben tener permiso 644
chmod 644 index.html style.css script.js
chmod 644 .htaccess robots.txt security.txt

# Directorios deben tener permiso 755
chmod 755 assets assets/videos

# Videos y recursos 644
chmod 644 assets/videos/*.mp4
chmod 644 assets/*.svg
```

### 3. Configurar SSL/HTTPS en DonWeb

1. Acceder al panel de DonWeb
2. Ir a "Certificados SSL"
3. Activar "Let's Encrypt" (gratis) o subir certificado propio
4. Forzar redirección HTTPS

### 4. Configurar dominio

Si tienes dominio propio:
1. Panel DonWeb → "Dominios"
2. Agregar dominio o configurar DNS
3. Apuntar A record a la IP del servidor

### 5. Activar seguridad en .htaccess

El archivo `.htaccess` ya está configurado con:
- ✅ Headers de seguridad
- ✅ Bloqueo de archivos sensibles
- ✅ Rate limiting
- ✅ Anti-hotlinking
- ✅ Compresión GZIP

**IMPORTANTE:** Descomentar estas líneas en `.htaccess` una vez que HTTPS esté activo:

```apache
# Force HTTPS (uncomment when SSL is configured)
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Strict-Transport-Security: Force HTTPS
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
```

## Testing Post-Deployment

### 1. Verificar que el sitio carga
```bash
curl -I https://tudominio.com
```

Debe retornar: `HTTP/2 200`

### 2. Verificar headers de seguridad
```bash
curl -I https://tudominio.com | grep -E "(X-Frame|X-Content|Content-Security)"
```

Debe mostrar:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy: ...`

### 3. Test de seguridad online
- https://securityheaders.com → Escanear tu dominio
- https://observatory.mozilla.org → Verificar configuración
- https://www.ssllabs.com/ssltest/ → Test SSL/TLS

### 4. Test de velocidad
- https://pagespeed.web.dev → Google PageSpeed
- https://gtmetrix.com → Performance completo

## Troubleshooting

### .htaccess no funciona
```apache
# Verificar que mod_rewrite esté activo
# Contactar soporte DonWeb para activarlo
```

### Videos no cargan
```apache
# Agregar tipos MIME en .htaccess
AddType video/mp4 .mp4
AddType video/webm .webm
```

### Fuentes no cargan (CORS)
```apache
# Ya está en .htaccess, verificar que esté activo
<FilesMatch "\.(ttf|otf|eot|woff|woff2)$">
    Header set Access-Control-Allow-Origin "*"
</FilesMatch>
```

### Error 500
- Verificar permisos de archivos
- Revisar sintaxis de .htaccess
- Ver logs de error en panel DonWeb

## Mantenimiento

### Actualizar sitio (después del deployment inicial)

1. **Via FTP:** Sobrescribir archivos modificados
2. **Via Git (si disponible):**
   ```bash
   ssh usuario@servidor
   cd /public_html
   git pull origin master
   ```

### Backup periódico
1. Panel DonWeb → "Backups"
2. Configurar backup automático semanal
3. Descargar backup manual antes de cambios importantes

## Contacto Soporte DonWeb

- Web: https://www.donweb.com/es-ar/soporte
- Email: soporte@donweb.com
- Tel: +54 11 5555-5555
- Chat: Disponible en panel de control

---

## Script de deployment automático

Crear archivo `deploy.sh`:

```bash
#!/bin/bash

# Configuración
FTP_HOST="ftp.tudominio.com"
FTP_USER="tu_usuario"
FTP_PASS="tu_contraseña"
REMOTE_DIR="/public_html"

echo "🚀 Iniciando deployment..."

# Usar lftp para subir archivos
lftp -c "
set ftp:ssl-allow no;
open -u $FTP_USER,$FTP_PASS $FTP_HOST;
cd $REMOTE_DIR;
mirror -R --delete --verbose ./ ./;
bye;
"

echo "✅ Deployment completado!"
echo "🌐 Verifica tu sitio en: https://tudominio.com"
```

Ejecutar:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

**¿Necesitas las credenciales FTP de DonWeb? Las encuentras en:**
Panel DonWeb → Hosting → FTP/SSH → Ver credenciales
