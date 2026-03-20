// pages/index.js — Formulario de Pedidos Apetitos × AINOS
// Versión 2.0 — Diseño claro, productos dinámicos por tipo de cliente

import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'

// ─── CATÁLOGO COMPLETO ───────────────────────────────────────────────────────
const CATALOGO = {
  // Productos B2C (todos los clientes)
  b2c: [
    {
      id: 'tortilla-tradicional-decenas',
      nombre: 'Tortillas Tradicionales',
      descripcion: 'Paquete × 10 unidades · 12.5 cm',
      detalle: 'Maíz nixtamalizado cultivado en la sierra ecuatoriana. Sin harina.',
      precio: 1.75,
      unidad: 'paquete x10',
      categoria: 'Tortillas',
      imagen: '/images/tortillas-decenas.png',
      escalaImg: 1.0,
    },
    {
      id: 'tortilla-jumbo-decenas',
      nombre: 'Tortilla Jumbo',
      descripcion: 'Paquete × 10 unidades · 18.5 cm',
      detalle: 'La tortilla más grande. Ideal para burritos y platos de porción generosa.',
      precio: 2.50,
      unidad: 'paquete x10',
      categoria: 'Tortillas',
      imagen: '/images/tortilla-jumbo.jpg',
      escalaImg: 1.25,
    },
    {
      id: 'totopos-180g',
      nombre: 'Totopos Crocantes 180g',
      descripcion: 'Bolsa 180 gramos · Nachos',
      detalle: 'Fritos y escurridos artesanalmente. Perfectos para entradas y snacks.',
      precio: 1.75,
      unidad: 'bolsa',
      categoria: 'Totopos',
      imagen: '/images/totopos-180g.png',
      escalaImg: 1.0,
    },
    {
      id: 'totopos-500g',
      nombre: 'Totopos Crocantes 500g',
      descripcion: 'Bolsa 500 gramos · Nachos',
      detalle: 'El formato grande para restaurantes y eventos.',
      precio: 4.25,
      unidad: 'bolsa',
      categoria: 'Totopos',
      imagen: '/images/totopos-500g.png',
      escalaImg: 1.0,
    },
  ],
  // Productos adicionales B2B (restaurantes + provincias)
  b2b: [
    {
      id: 'tortilla-mini-25',
      nombre: 'Tortilla Mini',
      descripcion: 'Paquete × 25 unidades · 8 cm',
      detalle: 'Mini tortilla ideal para tacos pequeños y bocaditos.',
      precio: 0.11 * 25,
      unidad: 'paquete x25',
      categoria: 'Tortillas',
      imagen: '/images/sope.jpg',
      escalaImg: 0.55,
    },
    {
      id: 'tortilla-mediana-50',
      nombre: 'Tortilla Mediana',
      descripcion: 'Paquete × 50 unidades · 11 cm',
      detalle: 'Paquete profesional para restaurantes de alto volumen.',
      precio: 0.13 * 50,
      unidad: 'paquete x50',
      categoria: 'Tortillas',
      imagen: '/images/tortilla-jumbo.jpg',
      escalaImg: 0.75,
    },
    {
      id: 'tortilla-grande-25',
      nombre: 'Tortilla Grande',
      descripcion: 'Paquete × 25 unidades · 13.5 cm',
      detalle: 'Tortilla grande para platillos principales y wraps.',
      precio: 0.18 * 25,
      unidad: 'paquete x25',
      categoria: 'Tortillas',
      imagen: '/images/tortilla-jumbo.jpg',
      escalaImg: 1.1,
    },
    {
      id: 'tortilla-cuadrada-25',
      nombre: 'Tortilla Cuadrada',
      descripcion: 'Paquete × 25 unidades · 12×14.5 cm',
      detalle: 'Formato cuadrado para presentaciones especiales y quesadillas.',
      precio: 0.17 * 25,
      unidad: 'paquete x25',
      categoria: 'Tortillas',
      imagen: '/images/tortilla-cuadrada.jpg',
      escalaImg: 1.0,
    },
    {
      id: 'sopes-20',
      nombre: 'Sopes',
      descripcion: 'Paquete × 20 unidades · 9.5 cm',
      detalle: 'Base gruesa de maíz para sopes tradicionales mexicanos.',
      precio: 0.22 * 20,
      unidad: 'paquete x20',
      categoria: 'Tortillas',
      imagen: '/images/sope.jpg',
      escalaImg: 0.65,
    },
    {
      id: 'migas-kg',
      nombre: 'Migas de Maíz',
      descripcion: 'Por kilogramo',
      detalle: 'Migas de maíz nixtamalizado. Consultar disponibilidad.',
      precio: 1.00,
      unidad: 'kg',
      categoria: 'Granel',
      imagen: '/images/nachos-180g.png',
      escalaImg: 1.0,
    },
    {
      id: 'masa-kg',
      nombre: 'Masa de Maíz',
      descripcion: 'Por kilogramo',
      detalle: 'Masa fresca de maíz nixtamalizado lista para usar.',
      precio: 7.00,
      unidad: 'kg',
      categoria: 'Granel',
      imagen: '/images/tortillas-decenas.png',
      escalaImg: 1.0,
    },
  ],
  // Producto especial solo para Meramexair
  meramexair: [
    {
      id: 'tortilla-docena-meramexair',
      nombre: 'Tortillas Tradicionales',
      descripcion: 'Docena × 12 unidades · Precio especial',
      detalle: '1 docena adicional gratis por pedido.',
      precio: 1.50,
      unidad: 'docena x12',
      categoria: 'Tortillas',
      imagen: '/images/tortillas-decenas.png',
      escalaImg: 1.0,
      badge: '1 docena gratis',
    },
  ],
  // Producto especial solo para Ramona (Roast Foods)
  ramona: [
    {
      id: 'totopos-125g-especial',
      nombre: 'Totopos 125g',
      descripcion: 'Bolsa 125 gramos · Formato especial',
      detalle: 'Formato exclusivo para Ramona. Precio especial.',
      precio: 1.20,
      unidad: 'bolsa',
      categoria: 'Totopos',
      imagen: '/images/nachos-180g.png',
      escalaImg: 0.85,
    },
  ],
}

// ─── OPCIONES DE ENVÍO ───────────────────────────────────────────────────────
const MAPS_LINK = 'https://maps.app.goo.gl/CTXikRYZ5SE8nT9N6'

// ─── ESTILOS BASE ────────────────────────────────────────────────────────────
const S = {
  page: { minHeight: '100vh', background: 'var(--bg)', padding: '0 0 80px' },
  header: {
    background: 'var(--black)',
    padding: '28px 20px 24px',
    textAlign: 'center',
    marginBottom: 32,
  },
  logo: { height: 56, width: 'auto', objectFit: 'contain' },
  tagline: { color: 'rgba(239,230,216,0.55)', fontSize: 11, letterSpacing: 4, marginTop: 8, fontFamily: 'Nunito', fontWeight: 600 },
  container: { maxWidth: 560, margin: '0 auto', padding: '0 16px' },
  steps: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 28, padding: '0 8px' },
  stepDot: (active, done) => ({
    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
    background: done ? 'var(--oxblood)' : active ? 'var(--gold)' : 'var(--border)',
    border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, fontFamily: 'Nunito',
    color: done || active ? (active ? 'var(--black)' : 'var(--eggshell)') : 'var(--text-muted)',
    transition: 'all 0.2s',
  }),
  stepLabel: (active) => ({
    fontSize: 10, letterSpacing: 1.5, fontFamily: 'Nunito', fontWeight: active ? 700 : 500,
    color: active ? 'var(--oxblood)' : 'var(--text-muted)',
  }),
  stepLine: { width: 16, height: 1, background: 'var(--border)', flexShrink: 0 },
  card: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px', marginBottom: 16, boxShadow: 'var(--shadow)' },
  cardTitle: { fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 },
  label: { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6 },
  input: {
    width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)',
    borderRadius: 7, padding: '11px 14px', color: 'var(--text)', fontSize: 14,
    boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  btnPrimary: {
    width: '100%', background: 'var(--oxblood)', border: 'none', borderRadius: 8,
    padding: '14px', color: 'var(--eggshell)', fontSize: 13, fontWeight: 700,
    letterSpacing: 2, cursor: 'pointer', fontFamily: 'Nunito', transition: 'opacity 0.2s, transform 0.1s',
  },
  btnSecondary: {
    width: '100%', background: 'transparent', border: '1.5px solid var(--border)',
    borderRadius: 8, padding: '12px', color: 'var(--text-muted)', fontSize: 12,
    fontWeight: 600, letterSpacing: 1.5, cursor: 'pointer', fontFamily: 'Nunito',
  },
  errorText: { color: 'var(--error)', fontSize: 12, marginTop: 6 },
  badge: (color = 'oxblood') => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: 20,
    fontSize: 10, fontWeight: 700, letterSpacing: 0.5, fontFamily: 'Nunito',
    background: color === 'gold' ? 'rgba(212,160,23,0.12)' : 'rgba(111,29,27,0.10)',
    color: color === 'gold' ? 'var(--gold)' : 'var(--oxblood)',
  }),
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
export default function ApetitosPedidos() {
  const [step, setStep] = useState(1)
  const [ruc, setRuc] = useState('')
  const [loadingCliente, setLoadingCliente] = useState(false)
  const [errorCliente, setErrorCliente] = useState('')
  const [cliente, setCliente] = useState(null)
  const [esNuevo, setEsNuevo] = useState(false)
  const [nuevoData, setNuevoData] = useState({ nombre: '', telefono: '', email: '', ciudad: '', direccion: '' })
  const [cantidades, setCantidades] = useState({})
  const [envio, setEnvio] = useState(null)
  const [notas, setNotas] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  const [pedidoListo, setPedidoListo] = useState(false)
  const [numeroPedido, setNumeroPedido] = useState('')

  // Determinar productos visibles según tipo de cliente
  const productos = (() => {
    if (!cliente) return []
    const tipo = cliente.tipo || 'B2C'
    const nombre = (cliente.razon_social || '').toLowerCase()

    // Meramexair — docenas especiales en lugar de decenas
    if (nombre.includes('meramexair')) return [...CATALOGO.meramexair, ...CATALOGO.b2c.filter(p => !p.id.includes('tradicional')), ...CATALOGO.b2b.filter(p => !['migas-kg','masa-kg'].includes(p.id))]

    // Ramona (Roast Foods) — solo totopos especiales
    if (nombre.includes('roast foods') || cliente.config_especial?.extraProducts?.includes('totopos-125g')) {
      return [...CATALOGO.ramona, ...CATALOGO.b2c.filter(p => !p.id.includes('topos'))]
    }

    const base = [...CATALOGO.b2c]
    if (tipo === 'B2B Restaurante' || tipo === 'Provincias') return [...base, ...CATALOGO.b2b]
    return base
  })()

  // Calcular totales
  const subtotal = productos.reduce((s, p) => s + p.precio * (cantidades[p.id] || 0), 0)
  const descuento = cliente?.porcentaje_descuento || 0
  const montoDesc = subtotal * (descuento / 100)
  const costoEnvio = envio?.precio || 0
  const total = subtotal - montoDesc + costoEnvio

  // ── STEP 1: Buscar cliente ────────────────────────────────────────────────
  const buscarCliente = async () => {
    if (ruc.length < 10 || loadingCliente) return
    setLoadingCliente(true)
    setErrorCliente('')
    try {
      const res = await fetch(`/api/lookup-client?ruc=${encodeURIComponent(ruc)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al consultar')
      if (data.found) {
        if (data.tiene_deuda) {
          setErrorCliente('⚠️ Tienes facturas pendientes. Comunícate con Apetitos para regularizar tu cuenta antes de hacer un nuevo pedido.')
          setLoadingCliente(false)
          return
        }
        setCliente(data)
        setEsNuevo(false)
      } else {
        setCliente({ ruc, porcentaje_descuento: 0, tipo: 'B2C' })
        setEsNuevo(true)
      }
      setStep(2)
    } catch (err) {
      setErrorCliente('No pudimos verificar tu RUC/cédula. Intenta de nuevo.')
    } finally {
      setLoadingCliente(false)
    }
  }

  // ── STEP 3: Confirmar ─────────────────────────────────────────────────────
  const confirmarPedido = async () => {
    setEnviando(true)
    setErrorEnvio('')
    const clienteFinal = esNuevo ? { ...cliente, razon_social: nuevoData.nombre, telefono: nuevoData.telefono, email: nuevoData.email, direccion: `${nuevoData.direccion}, ${nuevoData.ciudad}` } : cliente
    try {
      const res = await fetch('/api/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: clienteFinal,
          productos: productos.filter(p => (cantidades[p.id] || 0) > 0).map(p => ({ ...p, cantidad: cantidades[p.id] })),
          total, subtotal, descuento_pct: descuento, monto_descuento: montoDesc,
          envio, notas, esClienteNuevo: esNuevo, tipoCliente: clienteFinal.tipo,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNumeroPedido(`APT-${Date.now().toString(36).toUpperCase()}`)
      setPedidoListo(true)
    } catch (err) {
      setErrorEnvio('Hubo un error al enviar tu pedido. Por favor intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  // ── Pantalla éxito ───────────────────────────────────────────────────────
  if (pedidoListo) return (
    <div style={{ ...S.page, display: 'flex', flexDirection: 'column' }}>
      <div style={S.header}>
        <img src="/images/logo.png" alt="Apetitos" style={S.logo} />
      </div>
      <div style={{ ...S.container, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(39,174,96,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>✓</div>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 26, marginBottom: 8 }}>¡Pedido recibido!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>Te confirmaremos por WhatsApp en breve.</p>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 24px', marginBottom: 24, display: 'inline-block' }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1 }}>REFERENCIA</p>
            <p style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20, color: 'var(--oxblood)' }}>{numeroPedido}</p>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--eggshell)', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600 }}>
              Total: <span style={{ color: 'var(--oxblood)' }}>${total.toFixed(2)}</span>
            </div>
            <a href={`https://wa.me/593987772578?text=Hola%2C%20acabo%20de%20enviar%20el%20pedido%20${numeroPedido}%20por%20${total.toFixed(2)}%20USD.%20Quedo%20pendiente%20de%20confirmación.`}
              target="_blank" rel="noreferrer"
              style={{ background: '#25D366', color: 'white', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: 'Nunito' }}>
              📲 Confirmar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Head>
        <title>Pedido en Línea — Apetitos</title>
        <meta name="description" content="Realiza tu pedido de tortillas y nachos Apetitos" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <div style={S.page}>
        {/* Header con logo */}
        <div style={S.header}>
          <img src="/images/logo.png" alt="Apetitos" style={S.logo} />
          <p style={S.tagline}>PEDIDO EN LÍNEA</p>
        </div>

        <div style={S.container}>
          {/* Steps */}
          <div style={S.steps}>
            {['Identificación', 'Productos', 'Confirmar'].map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={S.stepDot(step === i + 1, step > i + 1)}>{step > i + 1 ? '✓' : i + 1}</div>
                <span style={S.stepLabel(step === i + 1)}>{label.toUpperCase()}</span>
                {i < 2 && <div style={S.stepLine} />}
              </div>
            ))}
          </div>

          {/* ── STEP 1: Identificación ──────────────────────────────────── */}
          {step === 1 && (
            <div>
              <div style={S.card}>
                <p style={S.cardTitle}>Identifícate</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
                  Ingresa tu RUC o cédula y cargamos automáticamente tu información desde nuestro sistema.
                </p>
                <label style={S.label}>RUC O CÉDULA *</label>
                <input
                  value={ruc}
                  onChange={e => { setRuc(e.target.value.replace(/\D/g, '').slice(0, 13)); setErrorCliente('') }}
                  onKeyDown={e => e.key === 'Enter' && buscarCliente()}
                  placeholder="Ej: 1792045670001"
                  maxLength={13}
                  style={S.input}
                  autoFocus
                />
                {errorCliente && <p style={S.errorText}>{errorCliente}</p>}
              </div>
              <button onClick={buscarCliente} disabled={ruc.length < 10 || loadingCliente} style={S.btnPrimary}>
                {loadingCliente ? 'VERIFICANDO...' : 'CONTINUAR →'}
              </button>
            </div>
          )}

          {/* ── STEP 2: Productos ───────────────────────────────────────── */}
          {step === 2 && cliente && (
            <div>
              {/* Banner cliente */}
              <div style={{ ...S.card, background: esNuevo ? 'var(--white)' : '#FEF9F0', border: `1.5px solid ${esNuevo ? 'var(--border)' : 'rgba(212,160,23,0.3)'}` }}>
                {esNuevo ? (
                  <>
                    <p style={S.cardTitle}>Nuevo cliente — Completa tus datos</p>
                    <div style={{ display: 'grid', gap: 12 }}>
                      {[
                        { k: 'nombre', l: 'NOMBRE / RAZÓN SOCIAL *', p: 'Tu nombre o empresa' },
                        { k: 'telefono', l: 'TELÉFONO / WHATSAPP *', p: '0987654321' },
                        { k: 'email', l: 'CORREO ELECTRÓNICO', p: 'tu@correo.com' },
                        { k: 'ciudad', l: 'CIUDAD *', p: 'Ej: Quito, Cuenca, Ibarra...' },
                        { k: 'direccion', l: 'DIRECCIÓN DE ENTREGA *', p: 'Calle, número, referencia' },
                      ].map(f => (
                        <div key={f.k}>
                          <label style={S.label}>{f.l}</label>
                          <input
                            value={nuevoData[f.k]}
                            onChange={e => setNuevoData(prev => ({ ...prev, [f.k]: e.target.value }))}
                            placeholder={f.p}
                            style={S.input}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{cliente.razon_social}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{cliente.tipo} · RUC {cliente.ruc}</p>
                      {cliente.direccion && <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{cliente.direccion}</p>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                      {descuento > 0 && <span style={S.badge('oxblood')}>−{descuento}% descuento</span>}
                      {cliente.tipo === 'Provincias' && <span style={S.badge('gold')}>🚚 Provincia</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Productos */}
              <div style={S.card}>
                <p style={S.cardTitle}>Selecciona tus productos</p>
                {['Tortillas', 'Totopos', 'Granel'].map(cat => {
                  const prods = productos.filter(p => p.categoria === cat)
                  if (prods.length === 0) return null
                  return (
                    <div key={cat} style={{ marginBottom: 20 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>{cat}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {prods.map(p => {
                          const q = cantidades[p.id] || 0
                          const precioFinal = p.precio * (1 - descuento / 100)
                          return (
                            <div key={p.id} style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              background: q > 0 ? 'rgba(111,29,27,0.04)' : 'var(--bg)',
                              border: `1.5px solid ${q > 0 ? 'rgba(111,29,27,0.25)' : 'var(--border)'}`,
                              borderRadius: 8, padding: '10px 12px', transition: 'all 0.15s',
                            }}>
                              {/* Imagen del producto */}
                              <div style={{ width: 52, height: 52, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img
                                  src={p.imagen}
                                  alt={p.nombre}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${p.escalaImg || 1})` }}
                                  onError={e => { e.target.style.display = 'none' }}
                                />
                              </div>
                              {/* Info */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                  <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13 }}>{p.nombre}</p>
                                  {p.badge && <span style={S.badge('gold')}>{p.badge}</span>}
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 2 }}>{p.descripcion}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ color: 'var(--oxblood)', fontWeight: 700, fontSize: 13 }}>${precioFinal.toFixed(2)}</span>
                                  {descuento > 0 && <span style={{ color: 'var(--text-muted)', fontSize: 11, textDecoration: 'line-through' }}>${p.precio.toFixed(2)}</span>}
                                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>/ {p.unidad}</span>
                                </div>
                              </div>
                              {/* Stepper */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
                                <button
                                  onClick={() => setCantidades(prev => ({ ...prev, [p.id]: Math.max(0, (prev[p.id] || 0) - 1) }))}
                                  style={{ width: 30, height: 30, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px 0 0 6px', cursor: 'pointer', fontSize: 15, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                                <div style={{ width: 36, height: 30, background: q > 0 ? 'rgba(111,29,27,0.07)' : 'var(--white)', border: '1px solid var(--border)', borderLeft: 'none', borderRight: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: 'Nunito', color: q > 0 ? 'var(--oxblood)' : 'var(--text-muted)' }}>{q}</div>
                                <button
                                  onClick={() => setCantidades(prev => ({ ...prev, [p.id]: (prev[p.id] || 0) + 1 }))}
                                  style={{ width: 30, height: 30, background: 'var(--oxblood)', border: 'none', borderRadius: '0 6px 6px 0', cursor: 'pointer', fontSize: 15, color: 'var(--eggshell)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Envío */}
              <div style={S.card}>
                <p style={S.cardTitle}>Método de entrega</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Sin envío (solo Quito/Conocoto) */}
                  <div
                    onClick={() => setEnvio(null)}
                    style={{ ...envioCardStyle(!envio), cursor: 'pointer' }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13 }}>Retiro en fábrica</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>Conocoto, Quito</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <a href={MAPS_LINK} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 10, color: 'var(--oxblood)', textDecoration: 'underline', fontWeight: 600 }}>Ver mapa</a>
                      <span style={{ fontFamily: 'Nunito', fontWeight: 700, color: 'var(--success)' }}>Gratis</span>
                    </div>
                  </div>

                  {/* Enetsa opciones */}
                  {(() => {
                    const infoEnvio = cliente?.envio
                    if (!infoEnvio || infoEnvio.tipo === 'otro') return null
                    if (infoEnvio.tipo === 'enetsa') return infoEnvio.opciones?.map(op => (
                      <div key={op.id} onClick={() => setEnvio(op)} style={{ ...envioCardStyle(envio?.id === op.id), cursor: 'pointer' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13 }}>Enetsa — {op.label}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>Envío por Enetsa</p>
                        </div>
                        <span style={{ fontFamily: 'Nunito', fontWeight: 700, color: 'var(--oxblood)' }}>${op.precio.toFixed(2)}</span>
                      </div>
                    ))
                    if (infoEnvio.tipo === 'tramaco') return (
                      <div onClick={() => setEnvio({ id: 'tramaco', label: 'Tramaco', precio: infoEnvio.precio })} style={{ ...envioCardStyle(envio?.id === 'tramaco'), cursor: 'pointer' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13 }}>Tramaco</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>Envío a Latacunga y zona</p>
                        </div>
                        <span style={{ fontFamily: 'Nunito', fontWeight: 700, color: 'var(--oxblood)' }}>${infoEnvio.precio.toFixed(2)}</span>
                      </div>
                    )
                    return null
                  })()}
                </div>
              </div>

              {/* Total */}
              <div style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '16px 20px', marginBottom: 16, boxShadow: 'var(--shadow)' }}>
                {descuento > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: 'var(--text-muted)' }}>
                    <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                  </div>
                )}
                {descuento > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: 'var(--success)' }}>
                    <span>Descuento ({descuento}%)</span><span>−${montoDesc.toFixed(2)}</span>
                  </div>
                )}
                {costoEnvio > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: 'var(--text-muted)' }}>
                    <span>Envío ({envio?.label})</span><span>+${costoEnvio.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: descuento > 0 || costoEnvio > 0 ? '1px solid var(--border)' : 'none', paddingTop: descuento > 0 || costoEnvio > 0 ? 10 : 0, marginTop: descuento > 0 || costoEnvio > 0 ? 8 : 0 }}>
                  <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: 'var(--text-muted)' }}>TOTAL DEL PEDIDO</span>
                  <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 24, color: 'var(--oxblood)' }}>${total.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={() => setStep(3)} disabled={subtotal === 0} style={S.btnPrimary}>
                REVISAR PEDIDO →
              </button>
            </div>
          )}

          {/* ── STEP 3: Confirmar ───────────────────────────────────────── */}
          {step === 3 && (
            <div>
              {/* Resumen cliente */}
              <div style={S.card}>
                <p style={S.cardTitle}>Cliente</p>
                <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 15 }}>{esNuevo ? nuevoData.nombre : cliente?.razon_social}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{cliente?.ruc} · {esNuevo ? nuevoData.telefono : cliente?.telefono}</p>
                {(esNuevo ? nuevoData.direccion : cliente?.direccion) && (
                  <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{esNuevo ? `${nuevoData.direccion}, ${nuevoData.ciudad}` : cliente?.direccion}</p>
                )}
              </div>

              {/* Resumen productos */}
              <div style={S.card}>
                <p style={S.cardTitle}>Productos</p>
                {productos.filter(p => (cantidades[p.id] || 0) > 0).map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                    <div>
                      <span style={{ fontWeight: 500 }}>{p.nombre}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}> × {cantidades[p.id]} {p.unidad}</span>
                    </div>
                    <span style={{ color: 'var(--oxblood)', fontWeight: 700 }}>${(p.precio * (1 - descuento / 100) * cantidades[p.id]).toFixed(2)}</span>
                  </div>
                ))}
                {envio && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, color: 'var(--text-muted)', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                    <span>Envío — {envio.label}</span>
                    <span>${envio.precio.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: 'var(--text-muted)' }}>TOTAL</span>
                  <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 22, color: 'var(--oxblood)' }}>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Notas */}
              <div style={S.card}>
                <p style={S.cardTitle}>Notas adicionales</p>
                <textarea
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  placeholder="Instrucciones de entrega, observaciones..."
                  rows={3}
                  style={{ ...S.input, resize: 'none' }}
                />
              </div>

              {errorEnvio && <p style={{ ...S.errorText, textAlign: 'center', marginBottom: 12 }}>{errorEnvio}</p>}

              <button onClick={confirmarPedido} disabled={enviando} style={{ ...S.btnPrimary, marginBottom: 10 }}>
                {enviando ? 'ENVIANDO...' : 'CONFIRMAR PEDIDO ✓'}
              </button>
              <button onClick={() => setStep(2)} style={S.btnSecondary}>← MODIFICAR PEDIDO</button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Helper para estilo de tarjeta de envío
function envioCardStyle(selected) {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    background: selected ? 'rgba(111,29,27,0.05)' : 'var(--bg)',
    border: `1.5px solid ${selected ? 'rgba(111,29,27,0.35)' : 'var(--border)'}`,
    borderRadius: 8, padding: '12px 14px', transition: 'all 0.15s',
  }
}
