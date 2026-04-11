/**
 * lib/routing.js — Lógica de zonas y días de entrega Apetitos
 * Regla de corte: 48h antes del día de entrega a las 10:00am (hora Quito UTC-5)
 */

// ─── ZONAS Y KEYWORDS ────────────────────────────────────────────────────────
const norm = (s = '') =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ')

export const ZONAS_RUTA = {
  lunes: {
    label: 'Lunes',
    zona: 'Nororiente de Quito',
    horario: '8:00 – 17:00',
    diaSemana: 1,
    keywords: ['armenia', 'tanda', 'monteserrin', 'gonzalez suarez', 'republica del salvador',
      'las americas', 'ecopark', 'capelo', 'benalcazar', 'nororiente', 'cotocollao', 'carcelén',
      'carcelen', 'calderón', 'calderon', 'comité del pueblo', 'comite del pueblo'],
  },
  martes: {
    label: 'Martes',
    zona: 'Tababela · Puembo · San Rafael · Valle de los Chillos',
    horario: '8:00 – 17:00 (Tababela máx. 10:00)',
    diaSemana: 2,
    keywords: ['tababela', 'puembo', 'san rafael', 'la primavera', 'primavera'],
  },
  miercoles: {
    label: 'Miércoles',
    zona: 'Centro · Norte Quito · Uyumbicho · Sur',
    horario: '7:00 – 17:00',
    diaSemana: 3,
    keywords: ['floresta', 'el jardin', 'quicentro', 'cci', 'luxemburgo', 'rio coca',
      'av inca', 'occidental', 'isla genovesa', 'uyumbicho', 'solanda', 'guamani',
      'moran valverde', 'la carolina', 'el batan', 'batan', 'iñaquito', 'inaquito',
      'mariana de jesus', 'parque carolina', 'bellavista'],
  },
  jueves: {
    label: 'Jueves',
    zona: 'Tumbaco · Cumbayá',
    horario: '8:00 – 17:00',
    diaSemana: 4,
    keywords: ['tumbaco', 'cumbaya', 'ceramica', 'la ceramica', 'playa chica',
      'selva alegre', 'san pedro', 'la tejedora', 'el arenal', 'arenal',
      'interoceanica', 'via interoceanica', 'nayon', 'zambiza'],
  },
}

// Valle de los Chillos — flexible Lun-Jue, desde 15:00
export const VALLE_CHILLOS = [
  'sangolqui', 'sangolquí', 'conocoto', 'rumiñahui', 'ruminahui',
  'san rafael del valle', 'valle de los chillos', 'amaguaña', 'amaguana',
  'uyumbicho', 'cotogchoa',
]

// Sur de Quito — Miércoles
export const SUR_QUITO = [
  'solanda', 'guamani', 'moran valverde', 'quitumbe', 'turubamba',
  'chillogallo', 'la ecuatoriana', 'la ferroviaria', 'el camal',
]

// Provincias
export const ENETSA_CITIES = [
  'ibarra', 'otavalo', 'cotacachi', 'cuenca', 'guayaquil', 'samborondon',
  'manta', 'portoviejo', 'esmeraldas', 'ambato', 'riobamba', 'machala',
  'loja', 'tulcan', 'guaranda', 'azogues', 'nueva loja', 'lago agrio',
]
export const TRAMACO_CITIES = ['latacunga', 'salcedo', 'pujili', 'saquisili']
export const CIUDADES_EC = [
  'quito', 'guayaquil', 'cuenca', 'ibarra', 'otavalo', 'loja', 'ambato',
  'riobamba', 'esmeraldas', 'manta', 'portoviejo', 'santo domingo', 'machala',
  'latacunga', 'tulcan', 'guaranda', 'azogues', 'nueva loja', 'lago agrio',
  'sangolqui', 'cumbaya', 'tumbaco', 'puembo', 'tabacundo', 'cayambe',
  'conocoto', 'pomasqui', 'san antonio de pichincha', 'mitad del mundo',
  'cotacachi', 'el carmen', 'pinas', 'piñas', 'zamora', 'macas', 'tena',
  'puyo', 'santa elena', 'salinas', 'la libertad', 'milagro', 'quevedo',
  'babahoyo', 'samborondon',
]

/**
 * Detecta la zona de entrega en base a la dirección/ciudad
 * @returns {string} zona key | 'valle_chillos' | 'sur_quito' | 'provincia_enetsa' | 'provincia_tramaco' | 'quito_general'
 */
export function detectarZona(ciudad = '', direccion = '') {
  const txt = norm(ciudad + ' ' + direccion)

  if (TRAMACO_CITIES.some(k => txt.includes(norm(k)))) return 'provincia_tramaco'
  if (ENETSA_CITIES.some(k => txt.includes(norm(k)))) return 'provincia_enetsa'
  if (VALLE_CHILLOS.some(k => txt.includes(norm(k)))) return 'valle_chillos'
  if (SUR_QUITO.some(k => txt.includes(norm(k)))) return 'miercoles' // Sur → Miércoles

  for (const [zona, data] of Object.entries(ZONAS_RUTA)) {
    if (data.keywords.some(k => txt.includes(norm(k)))) return zona
  }

  // Ciudad es Ecuador pero zona no detectada
  if (CIUDADES_EC.some(k => txt.includes(norm(k)))) return 'quito_general'

  return null // Ciudad no reconocida
}

export function esEcuador(ciudad = '') {
  if (!ciudad.trim()) return true // Empty = pass
  const c = norm(ciudad)
  return CIUDADES_EC.some(e => c.includes(norm(e))) ||
    ENETSA_CITIES.some(e => c.includes(norm(e))) ||
    TRAMACO_CITIES.some(e => c.includes(norm(e)))
}

/**
 * Detecta tipo de envío para logística
 */
export function detectarEnvio(ciudad = '', direccion = '') {
  const txt = norm(ciudad + ' ' + direccion)
  if (TRAMACO_CITIES.some(k => txt.includes(norm(k)))) {
    return { tipo: 'tramaco', label: 'Tramaco', precio: 11.0 }
  }
  if (ENETSA_CITIES.some(k => txt.includes(norm(k)))) {
    return {
      tipo: 'enetsa', label: 'Enetsa', opciones: [
        { id: 'enetsa-domicilio', label: 'Entrega a domicilio', precio: 4.70 },
        { id: 'enetsa-oficina', label: 'Retiro en oficina Enetsa', precio: 4.50 },
      ]
    }
  }
  return null // Quito / sin envío externo
}

// ─── CALENDARIO DE ENTREGAS ───────────────────────────────────────────────────
const HORA_CORTE_LOCAL = 10 // 10am Quito
const MINUTOS_ANTICIPACION = 48 * 60 // 48 horas en minutos

function getQuinoTime() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guayaquil' }))
}

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatFechaEntrega(date) {
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  return `${dias[date.getDay()]} ${date.getDate()} de ${meses[date.getMonth()]}`
}

/**
 * Devuelve los próximos días de entrega disponibles para una zona
 * @param {string} zona
 * @param {number} semanas — cuántas semanas hacia adelante buscar
 * @returns {Array<{date, dateKey, label, zona, tipo, horario, cutoff, disponible}>}
 */
export function getDiasDisponibles(zona, semanas = 3) {
  const ahora = getQuinoTime()
  const dias = []

  for (let d = 1; d <= semanas * 7; d++) {
    const fecha = new Date(ahora)
    fecha.setDate(ahora.getDate() + d)
    fecha.setHours(12, 0, 0, 0)

    const dow = fecha.getDay() // 0=Dom, 1=Lun, ..., 5=Vie, 6=Sáb
    if (dow === 0 || dow === 6) continue // Skip fines de semana

    // Calcular cutoff = fecha de entrega a las 10am - 48h
    const cutoff = new Date(fecha)
    cutoff.setHours(HORA_CORTE_LOCAL, 0, 0, 0)
    cutoff.setTime(cutoff.getTime() - MINUTOS_ANTICIPACION * 60000)
    const disponible = ahora < cutoff

    const zonaLabels = {
      1: 'Lunes — Nororiente Quito',
      2: 'Martes — Tababela · Puembo · San Rafael · Valle',
      3: 'Miércoles — Centro · Norte · Sur Quito',
      4: 'Jueves — Tumbaco · Cumbayá',
    }

    switch (zona) {
      case 'lunes':
        if (dow === 1) dias.push({ date: fecha, dateKey: dateKey(fecha), label: `Lunes ${fecha.getDate()}/${fecha.getMonth() + 1}`, zona: 'lunes', tipo: 'ruta', horario: '8:00 – 17:00', cutoff, disponible })
        break
      case 'martes':
        if (dow === 2) dias.push({ date: fecha, dateKey: dateKey(fecha), label: `Martes ${fecha.getDate()}/${fecha.getMonth() + 1}`, zona: 'martes', tipo: 'ruta', horario: '8:00 – 17:00', cutoff, disponible })
        break
      case 'miercoles':
        if (dow === 3) dias.push({ date: fecha, dateKey: dateKey(fecha), label: `Miércoles ${fecha.getDate()}/${fecha.getMonth() + 1}`, zona: 'miercoles', tipo: 'ruta', horario: '7:00 – 17:00', cutoff, disponible })
        break
      case 'jueves':
        if (dow === 4) dias.push({ date: fecha, dateKey: dateKey(fecha), label: `Jueves ${fecha.getDate()}/${fecha.getMonth() + 1}`, zona: 'jueves', tipo: 'ruta', horario: '8:00 – 17:00', cutoff, disponible })
        break
      case 'valle_chillos':
        if (dow >= 1 && dow <= 4) {
          const labels = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves']
          dias.push({ date: fecha, dateKey: dateKey(fecha), label: `${labels[dow]} ${fecha.getDate()}/${fecha.getMonth() + 1} (desde 15:00)`, zona: 'valle_chillos', tipo: 'valle_flexible', horario: '15:00 – 18:00', cutoff, disponible })
        }
        break
      case 'provincia_enetsa':
        // Solo Martes y Miércoles
        if (dow === 2 || dow === 3) {
          // Corte adicional: pedido hasta Miércoles 11am para envío de esa semana
          const corteProv = new Date(fecha)
          corteProv.setDate(corteProv.getDate() - (dow - 1)) // Lunes de esa semana
          corteProv.setHours(11, 0, 0, 0)
          const dispProv = ahora < corteProv
          dias.push({ date: fecha, dateKey: dateKey(fecha), label: `${dow === 2 ? 'Martes' : 'Miércoles'} ${fecha.getDate()}/${fecha.getMonth() + 1} (courier ~1–2 días)`, zona: 'provincia_enetsa', tipo: 'courier_enetsa', horario: 'Llega en 1–2 días hábiles', cutoff: corteProv, disponible: dispProv })
        }
        break
      case 'provincia_tramaco':
        if (dow === 2 || dow === 3) {
          const corteProv = new Date(fecha)
          corteProv.setDate(corteProv.getDate() - (dow - 1))
          corteProv.setHours(11, 0, 0, 0)
          const dispProv = ahora < corteProv
          dias.push({ date: fecha, dateKey: dateKey(fecha), label: `${dow === 2 ? 'Martes' : 'Miércoles'} ${fecha.getDate()}/${fecha.getMonth() + 1} (Tramaco ~1–2 días)`, zona: 'provincia_tramaco', tipo: 'courier_tramaco', horario: 'Llega en 1–2 días hábiles', cutoff: corteProv, disponible: dispProv })
        }
        break
      case 'quito_general':
      default:
        if (dow >= 1 && dow <= 4) {
          dias.push({ date: fecha, dateKey: dateKey(fecha), label: `${['', 'Lunes', 'Martes', 'Miércoles', 'Jueves'][dow]} ${fecha.getDate()}/${fecha.getMonth() + 1}`, zona: `dia_${dow}`, tipo: 'ruta', horario: '8:00 – 17:00', cutoff, disponible })
        }
        break
    }
  }

  return dias
}

// ─── CLIENTES CON MÚLTIPLES SUCURSALES ───────────────────────────────────────
// Detectados por coincidencia en razon_social (lowercase) desde Contifico
export const MULTI_SUCURSAL = {
  lunacorp: {
    match: ['lunacorp'],
    sucursales: ['Floresta / Orellana', 'C.C. El Jardín', 'Luxemburgo'],
    tipo: 'misma_factura', // Una factura, especificar sucursal en descripción
  },
  delilu: {
    match: ['delilu', 'deli lucia'],
    sucursales: ['Quicentro Norte', 'CCI', 'Scala (Coffe Lucía)'],
    tipo: 'misma_factura',
  },
  paul_llumiquinga: {
    match: ['paul llumiquinga'],
    sucursales: ['San Pedro', 'Playa Chica'],
    tipo: 'factura_por_local', // Factura separada por local
    nota: 'Cobrar de 2 facturas, mandar ambas fotos',
  },
  fantasias_vera: {
    match: ['imporfiesta', 'diversimport', 'novoa aguirre', 'fantasias vera'],
    sucursales: ['Capelo', 'El Inca', 'Av. Occidental (HiperFiesta)'],
    tipo: 'factura_por_local',
  },
  trayanna: {
    match: ['geovanna endara', 'trayanna'],
    sucursales: ['Armenia (Trayanna Fast Food)', 'Ecopark (Trayanna)'],
    tipo: 'misma_factura',
  },
  eva: {
    match: ['fruteria de eva', 'frutería de eva'],
    sucursales: ['Monteserrín (Eva 3)', 'Cumbayá (Eva 1)', 'Tumbaco (Eva 2)'],
    tipo: 'misma_factura',
    nota: 'Migas gratis en cada entrega, avisar a Yoli',
  },
  pos_orale: {
    match: ['paul llumiquinga'],
    sucursales: ['San Pedro', 'Playa Chica'],
    tipo: 'factura_por_local',
  },
}

export function detectarSucursales(razonSocial = '') {
  const rs = norm(razonSocial)
  for (const [, config] of Object.entries(MULTI_SUCURSAL)) {
    if (config.match.some(m => rs.includes(norm(m)))) return config
  }
  return null
}
