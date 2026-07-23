# Guía de Despliegue en Oracle Cloud Infrastructure (OCI Compute)

Esta guía explica paso a paso cómo desplegar la aplicación **FinanceBANK** en una instancia VM (Ubuntu) de **Oracle Cloud Infrastructure (OCI)** para que funcione 24/7 con respuesta a consultas mediante la API de Gemini.

---

## Requisitos Previos en OCI

1. **Instancia VM en OCI**:
   - Sistema Operativo recomendado: **Ubuntu 22.04 LTS** o **Ubuntu 24.04 LTS**.
   - Tipo de forma: Ampere A1 (Always Free 4 OCPU / 24 GB RAM) o AMD Micro.
2. **Dirección IP Pública** asignada a la instancia.

---

## Paso 1: Configurar Puertos en la Red OCI (VCN Security List)

En la consola web de Oracle Cloud:
1. Ve a **Networking** > **Virtual Cloud Networks** > Tu VCN > **Security Lists** > **Default Security List**.
2. Haz clic en **Add Ingress Rules**:
   - **Source CIDR**: `0.0.0.0/0`
   - **IP Protocol**: `TCP`
   - **Destination Port Range**: `3000` (y opcionalmente `80, 443`)
3. Haz clic en **Add Ingress Rule**.

---

## Paso 2: Conectarse por SSH y Abrir el Firewall del Sistema

Conéctate desde tu terminal o VS Code SSH:
```bash
ssh -i /ruta/a/tu/llave.key ubuntu@<IP_PUBLICA_DE_OCI>
```

Abre el puerto 3000 en el firewall interno de Ubuntu (`iptables` / `ufw`):
```bash
# Permitir puerto 3000 en iptables (mecanismo habitual en OCI)
sudo iptables -I INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT

# Guardar las reglas para que persistan tras reiniciar
sudo netfilter-persistent save
```

---

## Paso 3: Instalar Node.js 20 LTS y Git

En la terminal de la VM en OCI:
```bash
# Actualizar el sistema e instalar repositorio Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git iptables-persistent

# Verificar versiones
node -v
npm -v
```

---

## Paso 4: Subir o Clonar el Proyecto en OCI

Clona tu repositorio de GitHub o sube el código a la VM:
```bash
git clone https://github.com/TU_USUARIO/FinanceBANK.git
cd FinanceBANK

# Instalar dependencias del proyecto
npm install
```

---

## Paso 5: Crear el Archivo `.env` en la VM

Crea el archivo `.env` para almacenar la API Key de Gemini:
```bash
nano .env
```

Pega el siguiente contenido (reemplazando con tu clave real):
```env
GEMINI_API_KEY=AIzaSy...TuClaveRealAqui...
NODE_ENV=production
```
Guarda con `Ctrl + O`, presiona `Enter` y sal con `Ctrl + X`.

---

## Paso 6: Compilar y Ejecutar en Producción con PM2

1. **Instalar PM2** (gestor de procesos para mantener la app activa 24/7):
```bash
sudo npm install -g pm2
```

2. **Compilar la aplicación para producción**:
```bash
npm run build
```

3. **Iniciar el servidor compilado**:
```bash
pm2 start dist/server.cjs --name "financebank"
```

4. **Configurar inicio automático tras reinicios de la VM**:
```bash
pm2 startup
# Copia y ejecuta el comando que aparezca en pantalla, luego:
pm2 save
```

---

## Paso 7: Comprobar el Funcionamiento

Abre tu navegador web e ingresa:
```text
http://<IP_PUBLICA_DE_OCI>:3000
```

¡Listo! La interfaz cargará correctamente y el servidor responderá a todas las preguntas utilizando la API de Gemini configurada en el archivo `.env`.

---

## Paso 8 (Opcional): Configurar Nginx + Certificado SSL Gratuito (HTTPS)

Si deseas usar un dominio propio (ej. `midominio.com`) con HTTPS:

1. **Instalar Nginx**:
```bash
sudo apt-get install -y nginx
```

2. **Configurar Proxy Inverso**:
Crea `/etc/nginx/sites-available/financebank`:
```nginx
server {
    listen 80;
    server_name midominio.com www.midominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Activar sitio y reiniciar Nginx**:
```bash
sudo ln -s /etc/nginx/sites-available/financebank /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. **Instalar SSL Gratuito con Certbot**:
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d midominio.com -d www.midominio.com
```
