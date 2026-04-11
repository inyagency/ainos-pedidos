# AINOS Pedidos 🌮

Formulario de pedidos online para **Apetitos × AINOS**.  
Stack: Next.js · Vercel · Contifico API · n8n · Notion

---

## Estructura del proyecto

```
ainos-pedidos/
├── pages/
│   ├── index.js              ← Formulario principal (4 pasos)
│   ├── _app.js               ← App wrapper
│   └── api/
│       ├── lookup-client.js  ← Consulta cliente en Contifico
│       └── submit-order.js   ← Envía pedido a n8n webhook
├── lib/
│   └── routing.js            ← Lógica de zonas y días de entrega
├── public/
│   └── images/               ← Imágenes de productos (agregar manualmente)
├── styles/
│   └── globals.css           ← Estilos globales + variables CSS
├── .env.local.example        ← Variables de entorno
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

## Variables de entorno

| Variable | Descripción |
|---|---|
| `CONTIFICO_API_KEY` | API Key de Contifico |
| `CONTIFICO_BASE_URL` | URL base Contifico API |
| `N8N_WEBHOOK_URL` | URL del webhook en tu n8n |
| `WEBHOOK_SECRET` | Clave secreta para validar webhooks |

En Vercel: Settings → Environment Variables → añade cada una.

---

## Imágenes de productos

Añadir en `/public/images/` con estos nombres exactos:

```
logo.png
tortillas-tradicionales-decenas.jpg
tortillas-jumbo-decenas.jpg
totopos-90gr.jpg
totopos-125gr.jpg
totopos-150gr.jpg
totopos-180gr.jpg
totopos-500gr.jpg
tortilla-mini.jpg
tortilla-mediana.jpg
tortilla-grande.jpg
tortilla-xgrande.jpg
tortilla-cuadrada.jpg
sopes.jpg
migas.jpg
masa-maiz.jpg
```

---

## Zonas de entrega (routing.js)

| Día | Zona |
|---|---|
| Lunes | Nororiente de Quito |
| Martes | Tababela · Puembo · San Rafael · Valle de los Chillos |
| Miércoles | Centro · Norte · Sur Quito · Uyumbicho |
| Jueves | Tumbaco · Cumbayá |
| Valle de los Chillos | Lunes–Jueves desde 15:00 |
| Provincias (ENETSA) | Pedidos Lun–Mié antes 11am, envío Mar/Mié |

Corte de pedidos: **48 horas antes** a las **10:00am hora Quito**.

---

## Deploy en Vercel

1. Push a GitHub
2. Importar repo en vercel.com
3. Añadir variables de entorno
4. Deploy automático ✅
