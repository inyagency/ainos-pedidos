# AINOS Pedidos 🌮

Formulario de pedidos online para **Apetitoso × AINOS**.  
Stack: Next.js · Vercel · Contifico API · n8n · Notion

---

## Estructura del proyecto

```
ainos-pedidos/
├── pages/
│   ├── index.js              ← Formulario principal (3 pasos)
│   ├── _app.js               ← App wrapper
│   └── api/
│       ├── lookup-client.js  ← Consulta cliente en Contifico
│       └── submit-order.js   ← Envía pedido a n8n webhook
├── styles/
│   └── globals.css           ← Estilos globales + fuentes
├── .env.local.example        ← Variables de entorno de ejemplo
├── next.config.js
└── package.json
```

---

## Setup rápido

### 1. Clonar e instalar
```bash
git clone https://github.com/TU_USUARIO/ainos-pedidos.git
cd ainos-pedidos
npm install
```

### 2. Variables de entorno
```bash
cp .env.local.example .env.local
# Edita .env.local con tus credenciales reales
```

### 3. Correr en desarrollo
```bash
npm run dev
# Abre http://localhost:3000
```

---

## Variables de entorno necesarias

| Variable | Descripción |
|---|---|
| `CONTIFICO_API_KEY` | Tu API Key de Contifico |
| `CONTIFICO_API_TOKEN` | Tu API Token de Contifico |
| `CONTIFICO_BASE_URL` | URL base de Contifico API |
| `N8N_WEBHOOK_URL` | URL del webhook en tu n8n |
| `WEBHOOK_SECRET` | Clave secreta para validar webhooks |

En Vercel: Settings → Environment Variables → añade cada una.

---

## Flujo completo

```
Cliente ingresa RUC/Cédula
        ↓
/api/lookup-client → Contifico API
        ↓
¿Existe? → Auto-rellena datos + descuento
¿No existe? → Muestra campos de registro
        ↓
Cliente selecciona productos
Total calculado en tiempo real
        ↓
Cliente confirma → /api/submit-order
        ↓
n8n webhook recibe el pedido
   ├── Crea registro en Notion (Pedidos Operativos)
   └── Si cliente nuevo → crea en Contifico
```

---

## Deploy en Vercel

1. Push a GitHub
2. Importar repo en vercel.com
3. Añadir variables de entorno en Vercel dashboard
4. Deploy automático ✅

---

## Personalización

- **Productos**: editar array `CATALOGO` en `pages/index.js`
- **Precios de envío**: editar array `ENVIO_OPCIONES` en `pages/index.js`
- **Colores**: variables CSS en `styles/globals.css`
- **Imágenes**: añadir `imagen` a cada producto en `CATALOGO` y usar `<img>` en el card
