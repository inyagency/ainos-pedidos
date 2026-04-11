// pages/api/submit-order.js — Recibe pedido y lo envía al webhook de n8n
// n8n: crea en Notion + crea cliente en Contifico si nuevo + factura borrador

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const {
    cliente,
    productos,
    subtotal,
    total,
    descuento_pct,
    monto_descuento,
    envio,
    notas,
    metodoPago,
    esClienteNuevo,
    tipoCliente,
    tipoNegocio,
    sucursal,
    fechaEntrega,
    zonaEntrega,
    requiereFactura,
  } = req.body

  // Validaciones
  if (!cliente) return res.status(400).json({ error: 'Datos del cliente incompletos' })
  if (!productos || productos.length === 0) return res.status(400).json({ error: 'El pedido no tiene productos' })
  if (total <= 0) return res.status(400).json({ error: 'Total inválido' })

  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || ''

  if (!N8N_WEBHOOK_URL) {
    console.error('N8N_WEBHOOK_URL no configurado')
    return res.status(500).json({ error: 'Configuración de webhook faltante' })
  }

  // Construir número de referencia local
  const numPedido = `APT-${Date.now().toString(36).toUpperCase()}`

  // Payload completo para n8n
  const payload = {
    // ── Metadata ──────────────────────────────────────────────────
    num_pedido: numPedido,
    fecha_pedido: new Date().toISOString(),
    canal: 'Formulario Web',
    estado: 'Pendiente',
    secret: WEBHOOK_SECRET,

    // ── Cliente ───────────────────────────────────────────────────
    cliente: {
      id_contifico: cliente.id || null,
      razon_social: cliente.razon_social || cliente.nombre,
      ruc_cedula: cliente.ruc || cliente.ruc_cedula || '',
      telefono: cliente.telefono || '',
      email: cliente.email || '',
      direccion: cliente.direccion || '',
      ciudad: cliente.ciudad || '',
      tipo: tipoCliente || 'B2B',
      tipo_negocio: tipoNegocio || '',
      porcentaje_descuento: parseFloat(cliente.porcentaje_descuento) || 0,
      credito_dias: parseInt(cliente.credito_dias) || 0,
      es_nuevo: Boolean(esClienteNuevo),
      sucursal: sucursal || null, // Para clientes multi-sucursal
    },

    // ── Requiere factura ──────────────────────────────────────────
    requiere_factura: requiereFactura !== false, // true por defecto, false para consumidor final sin datos

    // ── Productos ─────────────────────────────────────────────────
    lineas: productos.map(p => ({
      id_producto: p.id,
      nombre: p.nombre,
      cantidad: p.cantidad,
      precio_unitario: p.precio,
      descuento_pct: parseFloat(cliente.porcentaje_descuento) || 0,
      subtotal_bruto: p.precio * p.cantidad,
      subtotal_neto: p.precio * p.cantidad * (1 - (parseFloat(cliente.porcentaje_descuento) || 0) / 100),
      unidad: p.unidad,
    })),

    // ── Totales ───────────────────────────────────────────────────
    subtotal: subtotal || total,
    descuento_pct: descuento_pct || 0,
    monto_descuento: monto_descuento || 0,
    costo_envio: envio?.precio || 0,
    total_final: total,

    // ── Entrega ───────────────────────────────────────────────────
    entrega: {
      tipo: envio ? 'Envío courier' : 'Ruta distribución',
      courier: envio || null,
      fecha_entrega: fechaEntrega || null, // ISO string de la fecha seleccionada
      zona_ruta: zonaEntrega || null,
    },

    // ── Pago ──────────────────────────────────────────────────────
    metodo_pago: metodoPago || 'efectivo',
    notas: notas || '',

    // ── Para n8n: instrucciones de procesamiento ──────────────────
    acciones_n8n: {
      crear_cliente_contifico: Boolean(esClienteNuevo),
      crear_factura_borrador: requiereFactura !== false,
      agregar_notion: true,
      notificar_telegram: true,
      enviar_email_confirmacion: Boolean(cliente.email),
      agregar_hoja_ruta: Boolean(fechaEntrega),
    },
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`n8n respondió ${response.status}: ${errText}`)
    }

    return res.status(200).json({ success: true, num_pedido: numPedido })

  } catch (error) {
    console.error('Error enviando a n8n:', error)
    return res.status(500).json({ error: 'Error al procesar el pedido', details: error.message })
  }
}
