// pages/api/lookup-client.js — Consulta cliente en Contifico
// Detecta tipo, sucursales, descuento, deuda y últimas facturas

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' })

  const { ruc } = req.query
  if (!ruc || ruc.length < 10) return res.status(400).json({ error: 'RUC o cédula inválido' })

  const API_KEY = process.env.CONTIFICO_API_KEY
  const BASE_URL = process.env.CONTIFICO_BASE_URL || 'https://api.contifico.com/sistema/api/v1'

  if (!API_KEY) {
    // Modo demo sin API key real
    console.warn('CONTIFICO_API_KEY no configurada — modo demo')
    return res.status(200).json({ found: false, demo: true })
  }

  try {
    // 1. Buscar cliente en Contifico (por RUC o cédula)
    let cliente = null
    for (const campo of ['ruc', 'cedula']) {
      const resp = await fetch(`${BASE_URL}/persona/?${campo}=${encodeURIComponent(ruc)}`, {
        headers: { Authorization: API_KEY, 'Content-Type': 'application/json' },
      })
      if (resp.ok) {
        const data = await resp.json()
        if (data?.length > 0) { cliente = data[0]; break }
      }
    }

    if (!cliente) return res.status(200).json({ found: false })

    // 2. Verificar deuda pendiente vencida
    let tieneDeuda = false
    let facturasVencidas = []
    try {
      const deudaResp = await fetch(
        `${BASE_URL}/documento/?persona_id=${cliente.id}&tipo_documento=FAC&estado=P`,
        { headers: { Authorization: API_KEY } }
      )
      if (deudaResp.ok) {
        const docs = await deudaResp.json()
        facturasVencidas = (docs || []).filter(d => d.saldo > 0 && d.vencido)
        tieneDeuda = facturasVencidas.length > 0
      }
    } catch (_) { /* no bloquear si falla consulta de deuda */ }

    // 3. Obtener últimas facturas (para duplicar pedido)
    let ultimasFact = []
    try {
      const histResp = await fetch(
        `${BASE_URL}/documento/?persona_id=${cliente.id}&tipo_documento=FAC&limit=5`,
        { headers: { Authorization: API_KEY } }
      )
      if (histResp.ok) {
        const docs = await histResp.json()
        ultimasFact = (docs || []).slice(0, 3).map(d => ({
          numero: d.numero_documento,
          fecha: d.fecha,
          total: d.total,
          descripcion: d.descripcion || '',
        }))
      }
    } catch (_) { }

    // 4. Detectar sucursales múltiples (se hace en el frontend con lib/routing.js)
    const razonSocial = cliente.razon_social || cliente.nombre_comercial || ''

    return res.status(200).json({
      found: true,
      id: cliente.id,
      razon_social: razonSocial,
      ruc: cliente.ruc || cliente.cedula,
      telefono: cliente.telefonos || '',
      email: cliente.email || '',
      direccion: cliente.direccion || '',
      ciudad: cliente.ciudad || '',
      porcentaje_descuento: parseFloat(cliente.porcentaje_descuento) || 0,
      credito_dias: parseInt(cliente.plazo_credito) || 0,
      tiene_deuda: tieneDeuda,
      facturas_vencidas: facturasVencidas.length,
      ultima_factura: ultimasFact[0] || null,
      historial_facturas: ultimasFact,
      es_corporativo: Boolean(cliente.es_corporativo),
    })

  } catch (err) {
    console.error('Error Contifico lookup:', err)
    return res.status(500).json({ error: 'Error al consultar Contifico', details: err.message })
  }
}
