// pages/api/lookup-client.js
// Consulta cliente en Contifico por RUC o cédula
// Detecta tipo de cliente, productos especiales y estado de deuda

const ENETSA_CITIES = [
  'quito', 'guayaquil', 'cuenca', 'ibarra', 'otavalo', 'riobamba',
  'ambato', 'loja', 'esmeraldas', 'manta', 'portoviejo', 'santo domingo',
  'machala', 'milagro', 'durán', 'daule', 'samborondón', 'nueva loja',
  'lago agrio', 'tulcán', 'guaranda', 'azogues', 'puyo', 'tena',
  'macas', 'zamora', 'santa elena', 'salinas', 'la libertad',
  'conocoto', 'sangolquí', 'cumbayá', 'tumbaco', 'puembo',
  'tabacundo', 'cayambe', 'pedro moncayo'
]

const TRAMACO_CITIES = ['latacunga', 'salcedo', 'pujilí', 'saquisilí']

// Clientes con productos especiales (por nombre de facturación de Contifico)
const SPECIAL_CLIENTS = {
  'roast foods': { extraProducts: ['totopos-125g'] },
  'meramexair': { usesDocenas: true, freeDocena: true },
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' })

  const { ruc } = req.query
  if (!ruc || ruc.length < 10) return res.status(400).json({ error: 'RUC o cédula inválido' })

  const API_KEY = process.env.CONTIFICO_API_KEY
  const BASE_URL = process.env.CONTIFICO_BASE_URL || 'https://api.contifico.com/sistema/api/v1'

  try {
    // 1. Buscar cliente en Contifico
    let cliente = null

    for (const campo of ['ruc', 'cedula']) {
      const resp = await fetch(`${BASE_URL}/persona/?${campo}=${encodeURIComponent(ruc)}`, {
        headers: { 'Authorization': API_KEY, 'Content-Type': 'application/json' }
      })
      if (resp.ok) {
        const data = await resp.json()
        if (data?.length > 0) { cliente = data[0]; break }
      }
    }

    if (!cliente) return res.status(200).json({ found: false })

    // 2. Detectar tipo de cliente
    const nombreFact = (cliente.razon_social || cliente.nombre_comercial || '').toLowerCase()
    const tipo = detectarTipo(cliente)
    const ciudad = (cliente.direccion || '').toLowerCase()
    const envio = detectarEnvio(ciudad)
    const clienteEspecial = Object.entries(SPECIAL_CLIENTS).find(([k]) => nombreFact.includes(k))

    // 3. Verificar deuda pendiente
    let tienDeuda = false
    try {
      const deudaResp = await fetch(
        `${BASE_URL}/documento/?persona_id=${cliente.id}&estado=P`,
        { headers: { 'Authorization': API_KEY } }
      )
      if (deudaResp.ok) {
        const docs = await deudaResp.json()
        tienDeuda = docs?.some(d => d.saldo > 0 && d.vencido) || false
      }
    } catch (_) { /* Si falla la consulta de deuda, dejamos pasar */ }

    return res.status(200).json({
      found: true,
      id: cliente.id,
      razon_social: cliente.razon_social || cliente.nombre_comercial,
      ruc: cliente.ruc || cliente.cedula,
      telefono: cliente.telefonos,
      direccion: cliente.direccion,
      email: cliente.email,
      porcentaje_descuento: cliente.porcentaje_descuento || 0,
      tipo,
      envio,
      tiene_deuda: tienDeuda,
      config_especial: clienteEspecial ? clienteEspecial[1] : null,
    })

  } catch (err) {
    console.error('Error Contifico:', err)
    return res.status(500).json({ error: 'Error al consultar Contifico', details: err.message })
  }
}

function detectarTipo(cliente) {
  if (cliente.es_corporativo) return 'B2B Restaurante'
  // Se puede refinar con campos adicionales de Contifico
  return 'B2C'
}

function detectarEnvio(direccion) {
  const dir = direccion.toLowerCase()

  for (const city of TRAMACO_CITIES) {
    if (dir.includes(city)) return { tipo: 'tramaco', label: 'Tramaco', precio: 11.00, ciudades: TRAMACO_CITIES }
  }

  for (const city of ENETSA_CITIES) {
    if (dir.includes(city)) return { tipo: 'enetsa', label: 'Enetsa', opciones: [
      { id: 'enetsa-domicilio', label: 'Entrega a domicilio', precio: 4.70 },
      { id: 'enetsa-oficina', label: 'Retiro en oficina Enetsa', precio: 4.50 },
    ]}
  }

  return { tipo: 'otro', label: 'Otra empresa', precio: 5.50 }
}
