// pages/api/submit-order.js
// Recibe el pedido del formulario y lo envía al webhook de n8n
// n8n luego crea el registro en Notion y puede crear cliente en Contifico si es nuevo

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const {
    cliente,
    productos,
    total,
    notas,
    esClienteNuevo,
    tipoCliente,
    envio,
  } = req.body

  // Validaciones básicas
  if (!cliente || !productos || productos.length === 0) {
    return res.status(400).json({ error: 'Datos del pedido incompletos' })
  }

  if (total <= 0) {
    return res.status(400).json({ error: 'El pedido no tiene productos seleccionados' })
  }

  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || ''

  if (!N8N_WEBHOOK_URL) {
    console.error('N8N_WEBHOOK_URL no configurado')
    return res.status(500).json({ error: 'Configuración de webhook faltante' })
  }

  // Armar payload completo para n8n
  const payload = {
    // Metadatos del pedido
    fecha: new Date().toISOString(),
    canal: 'Formulario web',
    estado: 'Pendiente',

    // Datos del cliente
    cliente: {
      id_contifico: cliente.id || null,
      razon_social: cliente.razon_social,
      ruc_cedula: cliente.ruc,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      email: cliente.email,
      tipo: tipoCliente || cliente.tipo || 'B2C',
      porcentaje_descuento: cliente.porcentaje_descuento || 0,
      es_nuevo: esClienteNuevo || false,
    },

    // Productos seleccionados
    productos: productos.map(p => ({
      id: p.id,
      nombre: p.nombre,
      cantidad: p.cantidad,
      precio_unitario: p.precio,
      subtotal: p.precio * p.cantidad,
    })),

    // Totales
    subtotal: total,
    descuento_porcentaje: cliente.porcentaje_descuento || 0,
    descuento_monto: total * ((cliente.porcentaje_descuento || 0) / 100),
    total_final: total - (total * ((cliente.porcentaje_descuento || 0) / 100)),

    // Envío (para clientes de provincias)
    envio: envio || null,

    // Notas
    notas: notas || '',

    // Seguridad
    secret: WEBHOOK_SECRET,
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`n8n respondió con status ${response.status}`)
    }

    return res.status(200).json({
      success: true,
      message: 'Pedido enviado correctamente',
    })

  } catch (error) {
    console.error('Error enviando a n8n:', error)
    return res.status(500).json({ error: 'Error al procesar el pedido', details: error.message })
  }
}
