// pages/index.js — Formulario de Pedidos Apetitos v4.0
// 4 pasos: Identificación → Productos → Entrega → Confirmar
// Funcionalidades: cliente nuevo/existente, multi-sucursal, calendario de entregas,
// tipo negocio, persona natural, validación dirección Ecuador, 48h cutoff

import { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import {
  detectarZona, getDiasDisponibles, detectarSucursales, detectarEnvio,
  esEcuador, formatFechaEntrega, CIUDADES_EC,
} from '../lib/routing'

// ─── TIPOS DE CLIENTE ─────────────────────────────────────────────────────────
const TIPOS_NEGOCIO = [
  { id: 'restaurante',   label: 'Restaurante / Bar / Cafetería',      catalogo: 'b2b',      icono: '🍽️' },
  { id: 'minimarket',    label: 'Tienda / Minimarket / Micro mercado', catalogo: 'b2c',      icono: '🏪' },
  { id: 'delicatessen',  label: 'Delicatessen / Local gourmet',        catalogo: 'b2c',      icono: '🛍️' },
  { id: 'bodega',        label: 'Bodega / Distribuidora',              catalogo: 'b2b',      icono: '📦' },
  { id: 'evento',        label: 'Evento / Catering',                   catalogo: 'b2c',      icono: '🎉' },
  { id: 'persona_nat',   label: 'Compra personal (persona natural)',   catalogo: 'personal',  icono: '🙋' },
  { id: 'otro',          label: 'Otro tipo de negocio',               catalogo: 'consulta', icono: '💬' },
]

// ─── CATÁLOGO DE PRODUCTOS ────────────────────────────────────────────────────
// Nombres exactos según Notion. imagen = nombre del archivo en /public/images/
const PRODUCTOS_PERSONAL = [
  { id: 'tort-trad-dec', nombre: 'Tortillas Tradicionales x Decenas', desc: 'Paquete × 10 uds · 12.5 cm', precio: 1.75, unidad: 'paquete x10', cat: 'Tortillas', img: 'tortillas-tradicionales-decenas.jpg' },
  { id: 'tort-jumbo-dec', nombre: 'Tortillas Jumbo x Decenas', desc: 'Paquete × 10 uds · 18.5 cm', precio: 2.50, unidad: 'paquete x10', cat: 'Tortillas', img: 'tortillas-jumbo-decenas.jpg' },
  { id: 'top-180', nombre: 'Totopos Crocantes 180gr', desc: 'Bolsa 180 gramos', precio: 1.75, unidad: 'bolsa', cat: 'Totopos', img: 'totopos-180gr.jpg' },
  { id: 'top-500', nombre: 'Totopos Crocantes 500gr', desc: 'Bolsa 500 gramos', precio: 4.25, unidad: 'bolsa', cat: 'Totopos', img: 'totopos-500gr.jpg' },
]

const PRODUCTOS_B2C = [
  ...PRODUCTOS_PERSONAL,
  { id: 'top-90',  nombre: 'Totopos Crocantes 90gr',  desc: 'Bolsa 90 gramos',  precio: 1.10, unidad: 'bolsa', cat: 'Totopos', img: 'totopos-90gr.jpg' },
  { id: 'top-125', nombre: 'Totopos Crocantes 125gr', desc: 'Bolsa 125 gramos', precio: 1.20, unidad: 'bolsa', cat: 'Totopos', img: 'totopos-125gr.jpg' },
  { id: 'top-150', nombre: 'Totopos Crocantes 150gr', desc: 'Bolsa 150 gramos', precio: 1.35, unidad: 'bolsa', cat: 'Totopos', img: 'totopos-150gr.jpg' },
]

const PRODUCTOS_B2B_EXTRA = [
  { id: 'tort-mini-25',   nombre: 'Tortilla Mini (x25 uni)',            desc: 'Paquete × 25 uds · 8 cm',       precio: 2.75, unidad: 'paquete x25', cat: 'Tortillas B2B', img: 'tortilla-mini.jpg' },
  { id: 'tort-med-50',    nombre: 'Tortilla Mediana (x50 uni)',          desc: 'Paquete × 50 uds · 11 cm',      precio: 6.50, unidad: 'paquete x50', cat: 'Tortillas B2B', img: 'tortilla-mediana.jpg' },
  { id: 'tort-grd-25',    nombre: 'Tortilla Grande (x25 uni)',           desc: 'Paquete × 25 uds · 13.5 cm',    precio: 4.50, unidad: 'paquete x25', cat: 'Tortillas B2B', img: 'tortilla-grande.jpg' },
  { id: 'tort-xgrd-25',   nombre: 'Tortilla X-Grande (x25 uni)',         desc: 'Paquete × 25 uds · 15 cm',      precio: 5.25, unidad: 'paquete x25', cat: 'Tortillas B2B', img: 'tortilla-xgrande.jpg' },
  { id: 'tort-cuad-25',   nombre: 'Tortilla Cuadrada (x25 uni)',         desc: 'Paquete × 25 uds · 12×14.5 cm', precio: 4.25, unidad: 'paquete x25', cat: 'Tortillas B2B', img: 'tortilla-cuadrada.jpg' },
  { id: 'tort-trad-25',   nombre: 'Tortillas Tradicionales (x25 uni)',   desc: 'Paquete × 25 uds · 12.5 cm',    precio: 3.25, unidad: 'paquete x25', cat: 'Tortillas B2B', img: 'tortillas-tradicionales-decenas.jpg' },
  { id: 'sopes-20',       nombre: 'Sopes (x20 uni)',                     desc: 'Paquete × 20 uds · 9.5 cm',     precio: 4.40, unidad: 'paquete x20', cat: 'Tortillas B2B', img: 'sopes.jpg' },
  { id: 'migas-kg',       nombre: 'Migas de Maíz (x Kg)',                desc: 'Por kilogramo',                  precio: 1.00, unidad: 'kg',          cat: 'Granel', img: 'migas.jpg' },
  { id: 'masa-kg',        nombre: 'Masa de Maíz (x Kg)',                 desc: 'Por kilogramo',                  precio: 7.00, unidad: 'kg',          cat: 'Granel', img: 'masa-maiz.jpg' },
]

// Clientes con productos especiales (por razon_social en Contifico)
const ESPECIALES = {
  'roast foods': [{ id: 'top-125-sp', nombre: 'Totopos Crocantes 125gr', desc: 'Bolsa 125g · Precio especial', precio: 1.20, unidad: 'bolsa', cat: 'Especiales', img: 'totopos-125gr.jpg', badge: 'Pedido fijo: 45 fundas' }],
  meramexair:    [{ id: 'tort-doc',   nombre: 'Tortillas Tradicionales x Decenas', desc: 'Docena × 12 uds · Precio especial', precio: 1.50, unidad: 'docena x12', cat: 'Especiales', img: 'tortillas-tradicionales-decenas.jpg', badge: '1 docena gratis en OP' }],
  'trayanna':    [{ id: 'top-90-sp',  nombre: 'Totopos Crocantes 90gr', desc: 'Bolsa 90g · Ecopark especial', precio: 1.10, unidad: 'bolsa', cat: 'Especiales', img: 'totopos-90gr.jpg' }],
}

function getCatalogo(cliente, tipoNegocio) {
  const rs = (cliente?.razon_social || '').toLowerCase()
  for (const [key, prods] of Object.entries(ESPECIALES)) {
    if (rs.includes(key)) return [...prods, ...PRODUCTOS_B2C, ...PRODUCTOS_B2B_EXTRA]
  }
  const cat = tipoNegocio?.catalogo
  if (cat === 'personal')  return PRODUCTOS_PERSONAL
  if (cat === 'b2b')       return [...PRODUCTOS_B2C, ...PRODUCTOS_B2B_EXTRA]
  if (cat === 'consulta')  return []
  return PRODUCTOS_B2C // b2c + eventos + default
}

// ─── MAPS URL ────────────────────────────────────────────────────────────────
const MAPS_URL = 'https://maps.app.goo.gl/CTXikRYZ5SE8nT9N6'

// ─── ESTILOS REUTILIZABLES ───────────────────────────────────────────────────
const S = {
  card: { background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: '20px', marginBottom: 16, boxShadow: '0 1px 4px rgba(26,26,26,0.07)' },
  cardTitle: { fontFamily: 'Nunito,sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 1.5, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 14 },
  inp: { width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 7, padding: '11px 14px', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box', outline: 'none', transition: 'border-color .2s' },
  btnPrimary: (disabled) => ({ width: '100%', background: disabled ? '#999' : 'var(--oxblood)', border: 'none', borderRadius: 8, padding: '14px', color: 'var(--eggshell)', fontSize: 12, fontWeight: 700, letterSpacing: 2, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'Nunito,sans-serif', transition: 'all .2s', opacity: disabled ? .5 : 1 }),
  btnSecondary: { width: '100%', background: 'transparent', border: '1.5px solid var(--border)', borderRadius: 8, padding: '12px', color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, cursor: 'pointer', fontFamily: 'Nunito,sans-serif' },
  selCard: (on) => ({ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: on ? 'rgba(111,29,27,.05)' : 'var(--bg)', border: `1.5px solid ${on ? 'rgba(111,29,27,.35)' : 'var(--border)'}`, borderRadius: 8, padding: '11px 14px', marginBottom: 8, transition: 'all .15s' }),
  badge: (t = 'ox') => ({ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, fontFamily: 'Nunito,sans-serif', background: t === 'gold' ? 'rgba(212,160,23,.12)' : t === 'green' ? 'rgba(39,174,96,.12)' : 'rgba(111,29,27,.10)', color: t === 'gold' ? 'var(--gold)' : t === 'green' ? '#27AE60' : 'var(--oxblood)' }),
  label: { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6 },
  err: { color: 'var(--error)', fontSize: 12, marginTop: 6 },
}

// ─── COMPONENTE: CALENDARIO DE ENTREGAS ──────────────────────────────────────
function CalendarioEntregas({ zona, onSelect, selected }) {
  const dias = useMemo(() => getDiasDisponibles(zona, 3), [zona])
  const disponibles = dias.filter(d => d.disponible)
  const noDisponibles = dias.filter(d => !d.disponible).slice(0, 3)

  if (zona === 'provincia_enetsa' || zona === 'provincia_tramaco') {
    return (
      <div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.7 }}>
          📦 Pedidos de provincias: se envían <strong>Martes y Miércoles</strong>. El pedido debe realizarse antes del <strong>Miércoles 11:00am</strong> para ser enviado esa semana. Tiempo estimado de entrega: <strong>1–2 días hábiles</strong>.
        </p>
        <div style={{ display: 'grid', gap: 8 }}>
          {disponibles.map(d => (
            <div key={d.dateKey} onClick={() => onSelect(d)} style={S.selCard(selected?.dateKey === d.dateKey)}>
              <span style={{ fontSize: 18 }}>📦</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 600, fontSize: 13 }}>{d.label}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{d.horario}</p>
              </div>
              {selected?.dateKey === d.dateKey && <span style={{ color: 'var(--oxblood)', fontWeight: 700 }}>✓</span>}
            </div>
          ))}
        </div>
        {disponibles.length === 0 && <p style={{ color: 'var(--error)', fontSize: 13 }}>⚠️ No hay fechas disponibles esta semana. Comunícate con nuestro equipo por WhatsApp.</p>}
      </div>
    )
  }

  // Vista de semanas para rutas Quito
  const semanas = []
  disponibles.forEach(d => {
    const y = d.date.getFullYear(), w = getWeekNumber(d.date)
    const key = `${y}-${w}`
    if (!semanas.find(s => s.key === key)) semanas.push({ key, label: `Semana del ${getWeekStart(d.date)}`, dias: [] })
    semanas.find(s => s.key === key).dias.push(d)
  })

  return (
    <div>
      {semanas.map(sem => (
        <div key={sem.key} style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 10, letterSpacing: 1.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>{sem.label}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {sem.dias.map(d => {
              const isSelected = selected?.dateKey === d.dateKey
              return (
                <div key={d.dateKey} onClick={() => onSelect(d)}
                  style={{ cursor: 'pointer', background: isSelected ? 'var(--oxblood)' : '#fff', border: `1.5px solid ${isSelected ? 'var(--oxblood)' : 'var(--border)'}`, borderRadius: 8, padding: '10px 12px', transition: 'all .15s', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, fontSize: 13, color: isSelected ? 'var(--eggshell)' : 'var(--text)' }}>{d.label.split(' ')[0]}</p>
                  <p style={{ fontSize: 12, color: isSelected ? 'rgba(239,230,216,.7)' : 'var(--text-muted)' }}>{d.label.split(' ').slice(1).join(' ')}</p>
                  <p style={{ fontSize: 10, color: isSelected ? 'rgba(239,230,216,.6)' : 'var(--text-muted)', marginTop: 2 }}>{d.horario}</p>
                </div>
              )
            })}
          </div>
        </div>
      ))}
      {disponibles.length === 0 && <p style={{ color: 'var(--error)', fontSize: 13 }}>⚠️ No hay fechas disponibles próximamente. Comunícate con nuestro equipo.</p>}
      {noDisponibles.length > 0 && (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
          Los pedidos deben realizarse con <strong>48 horas de anticipación</strong> antes de las 10:00am.
        </p>
      )}
    </div>
  )
}

function getWeekNumber(d) {
  const date = new Date(d); date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}

function getWeekStart(d) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  return `${date.getDate()}/${date.getMonth() + 1}`
}

// ─── COMPONENTE: PRODUCTO CARD ────────────────────────────────────────────────
function ProductoCard({ p, qty, onQty, descPct }) {
  const q = qty[p.id] || 0
  const precioFinal = p.precio * (1 - descPct / 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: q > 0 ? 'rgba(111,29,27,.04)' : 'var(--bg)', border: `1.5px solid ${q > 0 ? 'rgba(111,29,27,.25)' : 'var(--border)'}`, borderRadius: 8, padding: '10px 12px', marginBottom: 8, transition: 'all .15s' }}>
      {/* Imagen del producto */}
      <div style={{ width: 54, height: 54, borderRadius: 7, overflow: 'hidden', flexShrink: 0, background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={`/images/${p.img}`} alt={p.nombre}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.style.display = 'none' }}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <p style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, fontSize: 13 }}>{p.nombre}</p>
          {p.badge && <span style={S.badge('gold')}>{p.badge}</span>}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 3 }}>{p.desc}</p>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ color: 'var(--oxblood)', fontWeight: 700, fontSize: 13, fontFamily: 'Nunito,sans-serif' }}>
            ${precioFinal.toFixed(2)}
          </span>
          {descPct > 0 && <span style={{ color: 'var(--text-muted)', fontSize: 11, textDecoration: 'line-through' }}>${p.precio.toFixed(2)}</span>}
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>/ {p.unidad}</span>
        </div>
      </div>

      {/* Contador */}
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <button onClick={() => onQty(p.id, Math.max(0, q - 1))} style={{ width: 28, height: 28, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px 0 0 6px', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
        <div style={{ width: 36, height: 28, background: q > 0 ? 'rgba(111,29,27,.07)' : '#fff', border: '1px solid var(--border)', borderLeft: 'none', borderRight: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: 'Nunito,sans-serif', color: q > 0 ? 'var(--oxblood)' : 'var(--text-muted)' }}>{q}</div>
        <button onClick={() => onQty(p.id, q + 1)} style={{ width: 28, height: 28, background: 'var(--oxblood)', border: 'none', borderRadius: '0 6px 6px 0', cursor: 'pointer', fontSize: 16, color: 'var(--eggshell)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(1)

  // Step 1 — identificación
  const [ruc, setRuc]               = useState('')
  const [loading, setLoading]       = useState(false)
  const [errCliente, setErrCliente] = useState('')
  const [cliente, setCliente]       = useState(null)
  const [esNuevo, setEsNuevo]       = useState(false)
  const [tipoNeg, setTipoNeg]       = useState(null)
  const [otroDesc, setOtroDesc]     = useState('')
  const [requiereFactura, setRequiereFactura] = useState(true)
  const [sucursal, setSucursal]     = useState(null)
  const [sucursalConfig, setSucursalConfig] = useState(null)
  const [nuevoData, setNuevoData]   = useState({ nombre: '', telefono: '', email: '', ruc_cedula: '', ciudad: '', direccion: '' })

  // Step 2 — productos
  const [qty, setQty] = useState({})

  // Step 3 — entrega
  const [ciudad, setCiudad]           = useState('')
  const [direccion, setDireccion]     = useState('')
  const [dirError, setDirError]       = useState('')
  const [zonaDetectada, setZonaDetectada] = useState(null)
  const [fechaEntrega, setFechaEntrega] = useState(null)
  const [envioOpt, setEnvioOpt]       = useState(null)  // para ENETSA/TRAMACO
  const [retiraFabrica, setRetiraFabrica] = useState(false)

  // Step 4 — confirmar
  const [metodoPago, setMetodoPago] = useState(null)
  const [notas, setNotas]           = useState('')
  const [enviando, setEnviando]     = useState(false)
  const [errEnvio, setErrEnvio]     = useState('')
  const [done, setDone]             = useState(false)
  const [numPedido, setNumPedido]   = useState('')

  // Derivados
  const esPersonaNatural = tipoNeg?.id === 'persona_nat'
  const catalogo    = getCatalogo(cliente, tipoNeg)
  const descPct     = esPersonaNatural ? 0 : (cliente?.porcentaje_descuento || 0)
  const creditoDias = esPersonaNatural ? 0 : (cliente?.credito_dias || 0)

  const lineasPedido = catalogo.filter(p => (qty[p.id] || 0) > 0).map(p => ({ ...p, cantidad: qty[p.id] }))
  const subtotal    = lineasPedido.reduce((s, p) => s + p.precio * p.cantidad, 0)
  const montoDesc   = subtotal * descPct / 100
  const costoEnvio  = envioOpt?.precio || 0
  const total       = subtotal - montoDesc + costoEnvio

  // Zona de entrega (step 3)
  useEffect(() => {
    const src = ciudad || (esNuevo ? nuevoData.ciudad : cliente?.ciudad || '')
    const dir = direccion || (esNuevo ? nuevoData.direccion : cliente?.direccion || '')
    if (src || dir) {
      const z = detectarZona(src, dir)
      setZonaDetectada(z)
      setFechaEntrega(null) // Reset al cambiar zona
      if (z && z !== 'provincia_enetsa' && z !== 'provincia_tramaco') {
        setEnvioOpt(null)
        setRetiraFabrica(false)
      }
    }
  }, [ciudad, direccion, nuevoData.ciudad, nuevoData.direccion, esNuevo])

  // ── STEP 1: Buscar cliente ──────────────────────────────────────────────────
  const buscarCliente = async () => {
    if (ruc.length < 10 || loading) return
    setLoading(true); setErrCliente('')
    try {
      const r  = await fetch(`/api/lookup-client?ruc=${ruc}`)
      const d  = await r.json()
      if (!r.ok) throw new Error(d.error)

      if (d.found) {
        if (d.tiene_deuda) {
          setErrCliente(`⚠️ Tienes ${d.facturas_vencidas} factura(s) vencida(s). Por favor comunícate con nuestro equipo antes de realizar un nuevo pedido.`)
          return
        }
        setCliente(d); setEsNuevo(false)
        // Detectar sucursales
        const sc = detectarSucursales(d.razon_social)
        setSucursalConfig(sc)
        setStep(2)
      } else {
        setCliente({ ruc, porcentaje_descuento: 0, credito_dias: 0 })
        setEsNuevo(true)
      }
    } catch { setErrCliente('No pudimos verificar tu identificación. Intenta de nuevo.') }
    finally { setLoading(false) }
  }

  const continuarNuevo = () => {
    const c = nuevoData.ciudad
    if (c && !esEcuador(c)) {
      setDirError('🌎 Por el momento, Apetitos distribuye únicamente en Ecuador. Si te interesa nuestros productos, escríbenos a ventasapetitos@gmail.com.')
      return
    }
    if (!nuevoData.nombre || !nuevoData.telefono || !tipoNeg) {
      setDirError('Por favor completa los campos obligatorios.')
      return
    }
    if (!esPersonaNatural && !nuevoData.ciudad) {
      setDirError('Por favor indica tu ciudad.')
      return
    }
    setDirError('')
    if (tipoNeg?.catalogo === 'consulta') { setStep(4); return }
    setStep(2)
  }

  // ── STEP 3: Validar dirección ───────────────────────────────────────────────
  const validarDireccion = () => {
    if (esPersonaNatural || retiraFabrica) return true
    const dir = direccion.trim()
    if (!dir) { setDirError('Ingresa la dirección de entrega.'); return false }
    // Validar que contenga calle y ciudad (mínimo 2 palabras + número)
    if (dir.length < 10) { setDirError('La dirección parece muy corta. Ej: Av. 6 de Diciembre N24-100, Quito'); return false }
    if (!esEcuador(ciudad)) { setDirError('🌎 Solo distribuimos en Ecuador.'); return false }
    return true
  }

  const continuarEntrega = () => {
    if (!validarDireccion()) return
    if (esPersonaNatural) { setStep(4); return }
    if (!retiraFabrica && !fechaEntrega) { setDirError('Por favor selecciona una fecha de entrega.'); return }
    setDirError('')
    setStep(4)
  }

  // ── ENVIAR PEDIDO ───────────────────────────────────────────────────────────
  const confirmar = async () => {
    if (!metodoPago && !esPersonaNatural) { setErrEnvio('Selecciona un método de pago.'); return }
    setEnviando(true); setErrEnvio('')

    const clienteFinal = esNuevo
      ? { ...cliente, razon_social: nuevoData.nombre, telefono: nuevoData.telefono, email: nuevoData.email, ruc_cedula: nuevoData.ruc_cedula, direccion: `${nuevoData.direccion}, ${nuevoData.ciudad}`, ciudad: nuevoData.ciudad }
      : { ...cliente, direccion: direccion || cliente.direccion, ciudad: ciudad || cliente.ciudad }

    try {
      const r = await fetch('/api/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: clienteFinal,
          productos: lineasPedido,
          subtotal,
          total,
          descuento_pct: descPct,
          monto_descuento: montoDesc,
          envio: retiraFabrica ? null : envioOpt,
          notas,
          metodoPago: esPersonaNatural ? 'efectivo' : metodoPago,
          esClienteNuevo: esNuevo,
          tipoCliente: esPersonaNatural ? 'Persona Natural' : (tipoNeg?.id || 'B2B'),
          tipoNegocio: tipoNeg?.label || '',
          sucursal,
          fechaEntrega: retiraFabrica ? null : (fechaEntrega?.date?.toISOString() || null),
          zonaEntrega: retiraFabrica ? 'fabrica' : zonaDetectada,
          requiereFactura: esPersonaNatural ? requiereFactura : true,
        }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setNumPedido(d.num_pedido || `APT-${Date.now().toString(36).toUpperCase()}`)
      setDone(true)
    } catch { setErrEnvio('Error al enviar el pedido. Intenta de nuevo o escríbenos por WhatsApp.') }
    finally { setEnviando(false) }
  }

  // ── WhatsApp mensaje ──────────────────────────────────────────────────────
  const waMsg = () => {
    const nombre = esNuevo ? nuevoData.nombre : cliente?.razon_social
    const sucursalStr = sucursal ? ` (${sucursal})` : ''
    const prods = lineasPedido.map(p => `• ${p.nombre} × ${p.cantidad} = $${(p.precio * (1 - descPct / 100) * p.cantidad).toFixed(2)}`).join('%0A')
    const fechaStr = retiraFabrica ? 'Retiro en fábrica' : (fechaEntrega ? `Entrega: ${formatFechaEntrega(fechaEntrega.date)}` : '')
    let m = `Hola Apetitos 🌮%0A%0A*Pedido — ${numPedido}*%0A${nombre}${sucursalStr}%0A${prods}%0A`
    if (costoEnvio) m += `• Envío = $${costoEnvio.toFixed(2)}%0A`
    m += `*Total: $${total.toFixed(2)}*%0A${fechaStr}%0A%0A`
    if (metodoPago === 'transferencia' && creditoDias > 0) {
      const fechaVenc = new Date(Date.now() + creditoDias * 86400000)
      m += `💳 Transferencia (crédito ${creditoDias} días)%0APago máx: ${fechaVenc.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })}`
    } else if (metodoPago === 'transferencia') {
      m += `💳 Transferencia — adjunta comprobante por WhatsApp.`
    } else {
      m += `💵 Pago en efectivo al momento de entrega.`
    }
    if (notas) m += `%0A%0A📝 ${notas}`
    return `https://wa.me/593987772578?text=${m}`
  }

  // ── PANTALLA DE CONFIRMACIÓN ───────────────────────────────────────────────
  if (done) {
    const creditoDiasNum = parseInt(creditoDias) || 0
    const fechaVenc = creditoDiasNum > 0 ? new Date(Date.now() + creditoDiasNum * 86400000) : null
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 60 }}>
        <Header />
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ textAlign: 'center', margin: '32px 0 24px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(39,174,96,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>✓</div>
            <h2 style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: 24, marginBottom: 4 }}>¡Pedido recibido!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Referencia: <strong style={{ color: 'var(--oxblood)' }}>{numPedido}</strong></p>
            {!retiraFabrica && fechaEntrega && <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>📅 Entrega estimada: <strong>{formatFechaEntrega(fechaEntrega.date)}</strong></p>}
            {retiraFabrica && <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>🏭 Retiro en fábrica (Conocoto)</p>}
          </div>

          {/* Resumen */}
          <div style={S.card}>
            <p style={S.cardTitle}>Resumen del pedido</p>
            {lineasPedido.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span>{p.nombre} <span style={{ color: 'var(--text-muted)' }}>× {p.cantidad}</span></span>
                <span style={{ color: 'var(--oxblood)', fontWeight: 700 }}>${(p.precio * (1 - descPct / 100) * p.cantidad).toFixed(2)}</span>
              </div>
            ))}
            {descPct > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#27ae60', paddingTop: 6, borderTop: '1px solid var(--border)' }}><span>Descuento ({descPct}%)</span><span>−${montoDesc.toFixed(2)}</span></div>}
            {costoEnvio > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}><span>Envío</span><span>+${costoEnvio.toFixed(2)}</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
              <span style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, fontSize: 12, color: 'var(--text-muted)' }}>TOTAL</span>
              <span style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: 24, color: 'var(--oxblood)' }}>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Crédito + calendario */}
          {metodoPago === 'transferencia' && fechaVenc && creditoDiasNum > 0 && (
            <div style={{ ...S.card, background: '#FEF9F0', border: '1.5px solid rgba(212,160,23,.3)' }}>
              <p style={S.cardTitle}>💳 Crédito {creditoDiasNum} días</p>
              <p style={{ fontSize: 13, marginBottom: 12 }}>Pago máximo: <strong>{fechaVenc.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
              <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`💳 Pago factura Apetitos — ${numPedido}`)}&dates=${fechaVenc.toISOString().replace(/[-:.]/g, '').slice(0, 15)}Z/${new Date(fechaVenc.getTime() + 3600000).toISOString().replace(/[-:.]/g, '').slice(0, 15)}Z&details=${encodeURIComponent(`Pedido: ${numPedido}\nTotal: $${total.toFixed(2)}`)}`} target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid var(--border)', borderRadius: 8, padding: '10px 14px', textDecoration: 'none', color: 'var(--text)', fontSize: 13, fontWeight: 600, fontFamily: 'Nunito,sans-serif' }}>
                📅 Añadir recordatorio al calendario
              </a>
            </div>
          )}

          <a href={waMsg()} target="_blank" rel="noreferrer"
            style={{ display: 'block', textAlign: 'center', background: '#25D366', color: '#fff', borderRadius: 8, padding: '14px', fontSize: 13, fontWeight: 700, textDecoration: 'none', fontFamily: 'Nunito,sans-serif', letterSpacing: 1, marginBottom: 10 }}>
            📲 CONFIRMAR POR WHATSAPP
          </a>
          <button onClick={() => { setStep(1); setDone(false); setQty({}); setRuc(''); setCliente(null); setTipoNeg(null); setMetodoPago(null); setEnvioOpt(null); setEsNuevo(false); setNuevoData({ nombre: '', telefono: '', email: '', ruc_cedula: '', ciudad: '', direccion: '' }); setFechaEntrega(null); setSucursal(null); setRetiraFabrica(false) }} style={S.btnSecondary}>
            Hacer otro pedido
          </button>
        </div>
      </div>
    )
  }

  // ── STEPS ──────────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>Pedido en Línea — Apetitos</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 80 }}>
        <Header />
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px' }}>

          {/* Barra de progreso */}
          <StepBar step={step} />

          {/* ────────────────────── STEP 1: IDENTIFICACIÓN ──────────────────── */}
          {step === 1 && (
            <div>
              <div style={S.card}>
                <p style={S.cardTitle}>Identifícate</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>
                  Ingresa tu RUC o cédula y cargamos automáticamente tu información y descuentos.
                </p>
                <label style={S.label}>RUC O CÉDULA *</label>
                <input value={ruc} onChange={e => { setRuc(e.target.value.replace(/\D/g, '').slice(0, 13)); setErrCliente(''); setEsNuevo(false) }} onKeyDown={e => e.key === 'Enter' && buscarCliente()} placeholder="Ej: 1792045670001" maxLength={13} style={S.inp} autoFocus />
                {errCliente && <p style={S.err}>{errCliente}</p>}
              </div>

              {/* Formulario nuevo cliente */}
              {esNuevo && (
                <div style={S.card}>
                  <p style={S.cardTitle}>Nuevo cliente — Completa tus datos</p>

                  {/* Tipo de negocio primero */}
                  <p style={{ ...S.label, marginBottom: 10 }}>¿CÓMO NOS CONOCES? *</p>
                  {TIPOS_NEGOCIO.map(t => (
                    <div key={t.id} onClick={() => setTipoNeg(t)} style={S.selCard(tipoNeg?.id === t.id)}>
                      <span style={{ fontSize: 18 }}>{t.icono}</span>
                      <span style={{ fontSize: 13, fontWeight: tipoNeg?.id === t.id ? 700 : 400, fontFamily: 'Nunito,sans-serif', flex: 1 }}>{t.label}</span>
                      {tipoNeg?.id === t.id && <span style={{ color: 'var(--oxblood)', fontWeight: 700 }}>✓</span>}
                    </div>
                  ))}

                  {tipoNeg?.id === 'otro' && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={S.label}>ESPECIFICA TU NEGOCIO</label>
                      <input value={otroDesc} onChange={e => setOtroDesc(e.target.value)} placeholder="Describe tu tipo de negocio" style={S.inp} />
                    </div>
                  )}

                  {/* Si es persona natural: opción de factura */}
                  {esPersonaNatural && (
                    <div style={{ background: 'rgba(212,160,23,.06)', border: '1px solid rgba(212,160,23,.2)', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
                      <p style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, fontSize: 13, marginBottom: 10 }}>¿Necesitas factura?</p>
                      {[{ id: true, label: 'Sí, quiero factura', desc: 'Completaré mis datos de facturación' }, { id: false, label: 'No, compra sin factura', desc: 'Solo necesito el producto (consumidor final)' }].map(op => (
                        <div key={String(op.id)} onClick={() => setRequiereFactura(op.id)} style={{ ...S.selCard(requiereFactura === op.id), marginBottom: 6 }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 600, fontSize: 13 }}>{op.label}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{op.desc}</p>
                          </div>
                          {requiereFactura === op.id && <span style={{ color: 'var(--oxblood)', fontWeight: 700 }}>✓</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Campos del cliente */}
                  <div style={{ display: 'grid', gap: 12 }}>
                    {[
                      { k: 'nombre', l: 'NOMBRE COMPLETO *', p: 'Tu nombre completo', req: true },
                      { k: 'telefono', l: 'TELÉFONO / WHATSAPP *', p: '0987654321', req: true },
                      { k: 'email', l: 'CORREO ELECTRÓNICO', p: 'correo@ejemplo.com', req: false },
                      ...(esPersonaNatural && !requiereFactura ? [] : [
                        { k: 'ruc_cedula', l: esPersonaNatural && requiereFactura ? 'CÉDULA (para factura)' : 'RUC/CÉDULA EMPRESA', p: '0987654321001', req: esPersonaNatural && requiereFactura },
                      ]),
                      ...(!esPersonaNatural ? [
                        { k: 'ciudad', l: 'CIUDAD *', p: 'Ej: Quito, Cumbayá, Ibarra...', req: true },
                        { k: 'direccion', l: 'DIRECCIÓN DE ENTREGA *', p: 'Ej: Av. 6 de Diciembre N24-100 y Wilson, Quito', req: true },
                      ] : []),
                    ].map(f => (
                      <div key={f.k}>
                        <label style={S.label}>{f.l}</label>
                        <input value={nuevoData[f.k] || ''} onChange={e => { setNuevoData(prev => ({ ...prev, [f.k]: e.target.value })); setDirError('') }} placeholder={f.p} style={S.inp} />
                      </div>
                    ))}
                  </div>

                  {dirError && <p style={{ ...S.err, marginTop: 10 }}>{dirError}</p>}

                  {tipoNeg?.catalogo === 'consulta' && (
                    <div style={{ background: 'rgba(212,160,23,.07)', border: '1px solid rgba(212,160,23,.25)', borderRadius: 8, padding: '12px 14px', marginTop: 12, fontSize: 13, lineHeight: 1.7 }}>
                      💬 <strong>No hay problema.</strong> Nuestro equipo te contactará para prepararte un catálogo personalizado. También puedes escribirnos a <strong>ventasapetitos@gmail.com</strong>.
                    </div>
                  )}
                </div>
              )}

              {!esNuevo
                ? <button onClick={buscarCliente} disabled={ruc.length < 10 || loading} style={S.btnPrimary(ruc.length < 10 || loading)}>{loading ? 'VERIFICANDO...' : 'CONTINUAR →'}</button>
                : <button onClick={continuarNuevo} disabled={!tipoNeg || !nuevoData.nombre || !nuevoData.telefono} style={S.btnPrimary(!tipoNeg || !nuevoData.nombre || !nuevoData.telefono)}>CONTINUAR →</button>
              }
            </div>
          )}

          {/* ────────────────────── STEP 2: PRODUCTOS ───────────────────────── */}
          {step === 2 && (
            <div>
              {/* Banner cliente */}
              <div style={{ ...S.card, background: '#FEF9F0', border: '1.5px solid rgba(212,160,23,.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <p style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{esNuevo ? nuevoData.nombre : cliente?.razon_social}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{tipoNeg?.label} · {esNuevo ? nuevoData.ciudad : cliente?.ciudad || cliente?.direccion}</p>
                  </div>
                  {descPct > 0 && <span style={S.badge('ox')}>−{descPct}% descuento</span>}
                </div>
              </div>

              {/* Selector de sucursal (multi-local) */}
              {sucursalConfig && (
                <div style={S.card}>
                  <p style={S.cardTitle}>¿Para qué local es este pedido?</p>
                  {sucursalConfig.sucursales.map(s => (
                    <div key={s} onClick={() => setSucursal(s)} style={S.selCard(sucursal === s)}>
                      <span style={{ fontSize: 16 }}>📍</span>
                      <span style={{ flex: 1, fontSize: 13, fontFamily: 'Nunito,sans-serif', fontWeight: sucursal === s ? 700 : 400 }}>{s}</span>
                      {sucursal === s && <span style={{ color: 'var(--oxblood)', fontWeight: 700 }}>✓</span>}
                    </div>
                  ))}
                  {sucursalConfig.tipo === 'factura_por_local' && sucursal && (
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>ℹ️ Se generará una factura separada por local.</p>
                  )}
                </div>
              )}

              {/* Catálogo */}
              <div style={S.card}>
                <p style={S.cardTitle}>Selecciona tus productos</p>
                {['Tortillas', 'Tortillas B2B', 'Totopos', 'Especiales', 'Granel'].map(cat => {
                  const prods = catalogo.filter(p => p.cat === cat)
                  if (!prods.length) return null
                  const catLabels = { 'Tortillas': 'Tortillas', 'Tortillas B2B': 'Tortillas Profesionales', 'Totopos': 'Totopos Crocantes', 'Especiales': '⭐ Especiales para ti', 'Granel': 'Granel' }
                  return (
                    <div key={cat} style={{ marginBottom: 20 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>{catLabels[cat] || cat}</p>
                      {prods.map(p => <ProductoCard key={p.id} p={p} qty={qty} onQty={(id, v) => setQty(prev => ({ ...prev, [id]: v }))} descPct={descPct} />)}
                    </div>
                  )
                })}
                {catalogo.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.7 }}>
                    Nuestro equipo preparará un catálogo personalizado para tu negocio. Continúa para enviarnos tu consulta.
                  </p>
                )}
              </div>

              {/* Total parcial */}
              {subtotal > 0 && (
                <div style={{ ...S.card, marginBottom: 12 }}>
                  {descPct > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#27ae60', marginBottom: 4 }}><span>Descuento ({descPct}%)</span><span>−${montoDesc.toFixed(2)}</span></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, fontSize: 12, color: 'var(--text-muted)' }}>SUBTOTAL</span>
                    <span style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--oxblood)' }}>${(subtotal - montoDesc).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button onClick={() => setStep(3)} disabled={subtotal === 0 && catalogo.length > 0} style={S.btnPrimary(subtotal === 0 && catalogo.length > 0)}>CONTINUAR →</button>
              <button onClick={() => setStep(1)} style={{ ...S.btnSecondary, marginTop: 8 }}>← VOLVER</button>
            </div>
          )}

          {/* ────────────────────── STEP 3: ENTREGA ─────────────────────────── */}
          {step === 3 && (
            <div>
              {/* Persona natural → solo retiro en fábrica */}
              {esPersonaNatural ? (
                <div style={S.card}>
                  <p style={S.cardTitle}>Retiro en fábrica</p>
                  <div style={{ background: 'rgba(39,174,96,.06)', border: '1px solid rgba(39,174,96,.2)', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                    <p style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>🏭 Fábrica Apetitos — Conocoto</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>Para compras personales el retiro es en nuestra fábrica. Sin costo de envío.</p>
                  </div>
                  <a href={MAPS_URL} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 7, padding: '8px 12px', textDecoration: 'none', color: 'var(--text)', fontSize: 12, fontWeight: 600, fontFamily: 'Nunito,sans-serif' }}>
                    🗺️ Ver ubicación en Google Maps
                  </a>
                </div>
              ) : (
                <>
                  {/* Dirección */}
                  <div style={S.card}>
                    <p style={S.cardTitle}>Dirección de entrega</p>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <div>
                        <label style={S.label}>CIUDAD *</label>
                        <input value={ciudad} onChange={e => { setCiudad(e.target.value); setDirError('') }} placeholder="Ej: Quito, Cumbayá, Ibarra..." style={S.inp} list="cities-ec" />
                        <datalist id="cities-ec">
                          {CIUDADES_EC.map(c => <option key={c} value={c.charAt(0).toUpperCase() + c.slice(1)} />)}
                        </datalist>
                      </div>
                      <div>
                        <label style={S.label}>DIRECCIÓN COMPLETA *</label>
                        <input value={direccion} onChange={e => { setDireccion(e.target.value); setDirError('') }}
                          placeholder="Ej: Av. 6 de Diciembre N24-100 y Wilson, Quito" style={S.inp} />
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Para locales en centros comerciales: C.C. El Jardín, Local 215, Av. República, Quito</p>
                      </div>
                    </div>
                    {dirError && <p style={S.err}>{dirError}</p>}
                  </div>

                  {/* Opciones de entrega */}
                  <div style={S.card}>
                    <p style={S.cardTitle}>Método de entrega</p>

                    {/* Retiro en fábrica — siempre disponible */}
                    <div onClick={() => { setRetiraFabrica(true); setFechaEntrega(null); setEnvioOpt(null) }} style={S.selCard(retiraFabrica)}>
                      <span style={{ fontSize: 18 }}>🏭</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 600, fontSize: 13 }}>Retiro en fábrica — Conocoto</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>Sin costo de envío · Coordinar horario</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <a href={MAPS_URL} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 10, color: 'var(--oxblood)', textDecoration: 'underline', fontWeight: 600 }}>Ver mapa</a>
                        <span style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, color: '#27ae60' }}>Gratis</span>
                      </div>
                    </div>

                    {/* Ruta de distribución (Quito) */}
                    {zonaDetectada && !['provincia_enetsa', 'provincia_tramaco'].includes(zonaDetectada) && (
                      <div onClick={() => setRetiraFabrica(false)} style={S.selCard(!retiraFabrica)}>
                        <span style={{ fontSize: 18 }}>🚚</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 600, fontSize: 13 }}>Entrega en tu negocio</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>Ruta de distribución · Sin costo adicional</p>
                        </div>
                        <span style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, color: '#27ae60' }}>Gratis</span>
                      </div>
                    )}

                    {/* Courier para provincias */}
                    {zonaDetectada === 'provincia_enetsa' && (
                      <>
                        {[{ id: 'en-dom', label: 'Enetsa — Entrega a domicilio', precio: 4.70 }, { id: 'en-of', label: 'Enetsa — Retiro en oficina Enetsa', precio: 4.50 }].map(op => (
                          <div key={op.id} onClick={() => { setEnvioOpt(op); setRetiraFabrica(false) }} style={S.selCard(envioOpt?.id === op.id)}>
                            <span style={{ fontSize: 18 }}>📦</span>
                            <p style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 600, fontSize: 13, flex: 1 }}>{op.label}</p>
                            <span style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, color: 'var(--oxblood)' }}>${op.precio.toFixed(2)}</span>
                          </div>
                        ))}
                      </>
                    )}
                    {zonaDetectada === 'provincia_tramaco' && (
                      <div onClick={() => { setEnvioOpt({ id: 'tramaco', label: 'Tramaco — Latacunga y zona', precio: 11.00 }); setRetiraFabrica(false) }} style={S.selCard(envioOpt?.id === 'tramaco')}>
                        <span style={{ fontSize: 18 }}>📦</span>
                        <p style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 600, fontSize: 13, flex: 1 }}>Tramaco — Latacunga y zona</p>
                        <span style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, color: 'var(--oxblood)' }}>$11.00</span>
                      </div>
                    )}

                    {/* Zona no detectada */}
                    {!zonaDetectada && ciudad && (
                      <div style={{ background: 'rgba(212,160,23,.07)', border: '1px solid rgba(212,160,23,.25)', borderRadius: 8, padding: '11px 14px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        📦 El costo de envío a tu ciudad se coordinará con nuestro equipo. Puedes continuar y te contactaremos para confirmar.
                      </div>
                    )}
                  </div>

                  {/* Calendario de fechas */}
                  {!retiraFabrica && zonaDetectada && (
                    <div style={S.card}>
                      <p style={S.cardTitle}>Fecha de entrega</p>
                      {zonaDetectada && (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
                          {zonaDetectada === 'valle_chillos'
                            ? '📍 Valle de los Chillos: entrega disponible de Lunes a Jueves, desde las 15:00.'
                            : `📍 Tu zona: ${(() => { const z = { lunes: 'Nororiente', martes: 'Tababela · Puembo · San Rafael', miercoles: 'Centro · Norte · Sur', jueves: 'Tumbaco · Cumbayá' }; return z[zonaDetectada] || 'Quito' })()}.`}
                          {' '}Pedidos con <strong>48 horas de anticipación</strong> mínimo.
                        </p>
                      )}
                      <CalendarioEntregas zona={zonaDetectada} onSelect={setFechaEntrega} selected={fechaEntrega} />
                      {fechaEntrega && (
                        <div style={{ background: 'rgba(39,174,96,.08)', border: '1px solid rgba(39,174,96,.2)', borderRadius: 8, padding: '10px 12px', marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 16 }}>✅</span>
                          <div>
                            <p style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, fontSize: 13 }}>Entrega: {formatFechaEntrega(fechaEntrega.date)}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fechaEntrega.horario}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {dirError && !esPersonaNatural && <p style={{ ...S.err, marginBottom: 12 }}>{dirError}</p>}
              <button onClick={continuarEntrega} disabled={!esPersonaNatural && !retiraFabrica && !fechaEntrega} style={S.btnPrimary(!esPersonaNatural && !retiraFabrica && !fechaEntrega)}>CONTINUAR →</button>
              <button onClick={() => setStep(2)} style={{ ...S.btnSecondary, marginTop: 8 }}>← MODIFICAR PRODUCTOS</button>
            </div>
          )}

          {/* ────────────────────── STEP 4: CONFIRMAR ───────────────────────── */}
          {step === 4 && (
            <div>
              {tipoNeg?.catalogo === 'consulta' && (
                <div style={{ background: 'rgba(212,160,23,.08)', border: '1px solid rgba(212,160,23,.3)', borderRadius: 10, padding: 16, marginBottom: 16, fontSize: 13, lineHeight: 1.7 }}>
                  💬 <strong>Nuestro equipo te contactará</strong> para preparar tu catálogo personalizado. También puedes escribirnos a <strong>ventasapetitos@gmail.com</strong>.
                </div>
              )}

              {/* Resumen cliente */}
              <div style={S.card}>
                <p style={S.cardTitle}>Cliente</p>
                <p style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, fontSize: 15 }}>{esNuevo ? nuevoData.nombre : cliente?.razon_social}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{esNuevo ? `${nuevoData.telefono} · ${nuevoData.ciudad}` : `${cliente?.ruc} · ${cliente?.telefono}`}</p>
                {sucursal && <p style={{ fontSize: 12, color: 'var(--oxblood)', marginTop: 4, fontWeight: 600 }}>📍 Local: {sucursal}</p>}
                {!retiraFabrica && fechaEntrega && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>📅 Entrega: {formatFechaEntrega(fechaEntrega.date)} · {fechaEntrega.horario}</p>}
                {retiraFabrica && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>🏭 Retiro en fábrica</p>}
              </div>

              {/* Resumen productos */}
              {lineasPedido.length > 0 && (
                <div style={S.card}>
                  <p style={S.cardTitle}>Productos</p>
                  {lineasPedido.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                      <span>{p.nombre} <span style={{ color: 'var(--text-muted)' }}>× {p.cantidad}</span></span>
                      <span style={{ color: 'var(--oxblood)', fontWeight: 700 }}>${(p.precio * (1 - descPct / 100) * p.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                  {envioOpt && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', paddingTop: 8, borderTop: '1px solid var(--border)' }}><span>Envío — {envioOpt.label}</span><span>${envioOpt.precio.toFixed(2)}</span></div>}
                  {descPct > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#27ae60' }}><span>Descuento ({descPct}%)</span><span>−${montoDesc.toFixed(2)}</span></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, fontSize: 12, color: 'var(--text-muted)' }}>TOTAL</span>
                    <span style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--oxblood)' }}>${total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Método de pago (no para persona natural) */}
              {!esPersonaNatural && (
                <div style={S.card}>
                  <p style={S.cardTitle}>Método de pago *</p>
                  {[{ id: 'efectivo', label: 'Efectivo', desc: 'Se cobra al momento de la entrega', icono: '💵' }, { id: 'transferencia', label: 'Transferencia bancaria', desc: 'Te enviamos los datos al confirmar', icono: '🏦' }, { id: 'cheque', label: 'Cheque', desc: 'A nombre de APETITOSO', icono: '📄' }].map(m => (
                    <div key={m.id} onClick={() => setMetodoPago(m.id)} style={S.selCard(metodoPago === m.id)}>
                      <span style={{ fontSize: 20 }}>{m.icono}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 600, fontSize: 13 }}>{m.label}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{m.desc}</p>
                      </div>
                      {metodoPago === m.id && <span style={{ color: 'var(--oxblood)', fontWeight: 700 }}>✓</span>}
                    </div>
                  ))}
                  {metodoPago === 'transferencia' && creditoDias > 0 && (
                    <div style={{ background: 'rgba(212,160,23,.07)', border: '1px solid rgba(212,160,23,.2)', borderRadius: 8, padding: '10px 12px', marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                      ✅ Tienes <strong>{creditoDias} días de crédito</strong>. La fecha de vencimiento aparecerá en tu confirmación.
                    </div>
                  )}
                </div>
              )}

              {/* Notas */}
              <div style={S.card}>
                <p style={S.cardTitle}>Notas adicionales</p>
                <textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Instrucciones especiales, observaciones de entrega, referencia del guardia..." rows={3} style={{ ...S.inp, resize: 'none' }} />
              </div>

              {errEnvio && <p style={{ ...S.err, textAlign: 'center', marginBottom: 12 }}>{errEnvio}</p>}
              <button onClick={confirmar} disabled={enviando || (!esPersonaNatural && !metodoPago)} style={S.btnPrimary(enviando || (!esPersonaNatural && !metodoPago))}>{enviando ? 'ENVIANDO...' : 'CONFIRMAR PEDIDO ✓'}</button>
              <button onClick={() => setStep(3)} style={{ ...S.btnSecondary, marginTop: 8 }}>← MODIFICAR ENTREGA</button>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

// ─── SUB-COMPONENTES ESTRUCTURALES ────────────────────────────────────────────
function Header() {
  return (
    <div style={{ background: 'var(--black)', padding: '28px 20px 24px', textAlign: 'center', marginBottom: 32 }}>
      <img src="/images/logo.png" alt="Apetitos" style={{ height: 56, objectFit: 'contain' }} onError={e => { e.target.style.display = 'none' }} />
      <p style={{ color: 'rgba(239,230,216,.45)', fontSize: 10, letterSpacing: 5, marginTop: 8, fontFamily: 'Nunito,sans-serif', fontWeight: 700 }}>PEDIDO EN LÍNEA</p>
    </div>
  )
}

function StepBar({ step }) {
  const steps = ['Identificación', 'Productos', 'Entrega', 'Confirmar']
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 28 }}>
      {steps.map((label, i) => {
        const n = i + 1
        const done = step > n
        const active = step === n
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: done ? 'var(--oxblood)' : active ? 'var(--gold)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: 'Nunito,sans-serif', color: done ? 'var(--eggshell)' : active ? 'var(--black)' : 'var(--text-muted)', transition: 'all .3s' }}>
                {done ? '✓' : n}
              </div>
              <span style={{ fontSize: 9, letterSpacing: 1, fontFamily: 'Nunito,sans-serif', fontWeight: active ? 700 : 500, color: active ? 'var(--oxblood)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label.toUpperCase()}</span>
            </div>
            {i < steps.length - 1 && <div style={{ width: 20, height: 1, background: step > i + 1 ? 'var(--oxblood)' : 'var(--border)', transition: 'all .3s', marginBottom: 16 }} />}
          </div>
        )
      })}
    </div>
  )
}
