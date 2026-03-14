// pages/api/lookup-client.js
// Consulta un cliente en Contifico por RUC o cédula
// Llamado desde el formulario cuando el cliente ingresa su identificación

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { ruc } = req.query

  if (!ruc || ruc.length < 10) {
    return res.status(400).json({ error: 'RUC o cédula inválido' })
  }

  const API_KEY = process.env.CONTIFICO_API_KEY
  const BASE_URL = process.env.CONTIFICO_BASE_URL || 'https://api.contifico.com/sistema/api/v1'

  try {
    // Buscar por RUC primero
    const response = await fetch(
      `${BASE_URL}/persona/?ruc=${encodeURIComponent(ruc)}`,
      {
        headers: {
          'Authorization': API_KEY,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Contifico respondió con status ${response.status}`)
    }

    const data = await response.json()

    // Contifico devuelve un array
    if (data && data.length > 0) {
      const cliente = data[0]
      return res.status(200).json({
        found: true,
        id: cliente.id,
        razon_social: cliente.razon_social || cliente.nombre_comercial,
        ruc: cliente.ruc || cliente.cedula,
        telefono: cliente.telefonos,
        direccion: cliente.direccion,
        email: cliente.email,
        porcentaje_descuento: cliente.porcentaje_descuento || 0,
        tipo: cliente.es_corporativo ? 'B2B Restaurante' : 'B2C',
      })
    }

    // Si no encontró por RUC, intentar por cédula
    const responseCedula = await fetch(
      `${BASE_URL}/persona/?cedula=${encodeURIComponent(ruc)}`,
      {
        headers: {
          'Authorization': API_KEY,
          'Content-Type': 'application/json',
        },
      }
    )

    const dataCedula = await responseCedula.json()

    if (dataCedula && dataCedula.length > 0) {
      const cliente = dataCedula[0]
      return res.status(200).json({
        found: true,
        id: cliente.id,
        razon_social: cliente.razon_social || cliente.nombre_comercial,
        ruc: cliente.ruc || cliente.cedula,
        telefono: cliente.telefonos,
        direccion: cliente.direccion,
        email: cliente.email,
        porcentaje_descuento: cliente.porcentaje_descuento || 0,
        tipo: cliente.es_corporativo ? 'B2B Restaurante' : 'B2C',
      })
    }

    // Cliente no existe — devolver not found para que el form muestre campos de registro
    return res.status(200).json({ found: false })

  } catch (error) {
    console.error('Error consultando Contifico:', error)
    return res.status(500).json({ error: 'Error al consultar Contifico', details: error.message })
  }
}
