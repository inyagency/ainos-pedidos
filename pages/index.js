// pages/index.js
// Formulario de pedidos AINOS × Apetitoso
// Flujo: Step 1 → Identificación (RUC/Cédula) → Step 2 → Productos → Step 3 → Confirmar

import { useState } from 'react'
import Head from 'next/head'

// ─── CATÁLOGO DE PRODUCTOS ────────────────────────────────────────────────────
// Precios B2C base — la lógica de descuentos se aplica desde el % de Contifico
const CATALOGO = [
  {
    id: 'tortilla-10',
    nombre: 'Tortilla de Maíz',
    descripcion: 'Paquete × 10 unidades · Nixtamalizada',
    detalle: 'Maíz cultivado en la sierra ecuatoriana. Cocido, molido, amasado y laminado. Sin harina.',
    precio: 1.75,
    unidad: 'paquete',
    categoria: 'tortillas',
  },
  {
    id: 'tortilla-jumbo',
    nombre: 'Tortilla Jumbo',
    descripcion: 'Paquete × 10 unidades · 18.5 cm',
    detalle: 'La tortilla más grande del catálogo. Ideal para burritos y platos de porciones generosas.',
    precio: 2.50,
    unidad: 'paquete',
    categoria: 'tortillas',
  },
  {
    id: 'totopos-180',
    nombre: 'Totopos Crocantes 180g',
    descripcion: 'Nachos · Bolsa 180 gramos',
    detalle: 'Especialidad del norte de México. Fritos y escurridos para evitar exceso de grasa.',
    precio: 1.75,
    unidad: 'bolsa',
    categoria: 'totopos',
  },
  {
    id: 'totopos-500',
    nombre: 'Totopos Crocantes 500g',
    descripcion: 'Nachos · Bolsa 500 gramos',
    detalle: 'El formato grande para restaurantes y reuniones. Mismo proceso artesanal, más cantidad.',
    precio: 4.25,
    unidad: 'bolsa',
    categoria: 'totopos',
  },
]

// ─── OPCIONES DE ENVÍO A PROVINCIAS ───────────────────────────────────────────
const ENVIO_OPCIONES = [
  { id: 'enetsa-domicilio', label: 'Enetsa — Entrega a domicilio', precio: 4.70 },
  { id: 'enetsa-oficina', label: 'Enetsa — Retiro en oficina', precio: 4.50 },
  { id: 'tramaco-latacunga', label: 'Tramaco — Latacunga', precio: 11.00 },
  { id: 'otra-empresa', label: 'Otra empresa de envío', precio: 5.50 },
]

// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: '#1A1A1A',
    color: '#EFE6D8',
    fontFamily: "'DM Sans', sans-serif",
    padding: '48px 20px 80px',
  },
  container: {
    maxWidth: 560,
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: 52,
  },
  eyebrow: {
    color: '#D4A017',
    fontSize: 10,
    letterSpacing: 8,
    marginBottom: 12,
    fontWeight: 500,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 36,
    fontWeight: 400,
    margin: 0,
    lineHeight: 1.1,
  },
  divider: {
    width: 40,
    height: 1,
    background: '#6F1D1B',
    margin: '18px auto 0',
  },
  steps: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 44,
  },
  stepDot: (active, done) => ({
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: done ? '#6F1D1B' : active ? '#D4A017' : 'transparent',
    border: `1px solid ${done || active ? 'transparent' : '#ffffff18'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    color: done || active ? '#1A1A1A' : '#ffffff28',
    fontWeight: 700,
    flexShrink: 0,
  }),
  stepLabel: (active) => ({
    fontSize: 10,
    letterSpacing: 2,
    color: active ? '#EFE6D8' : '#EFE6D828',
  }),
  stepLine: {
    width: 20,
    height: 1,
    background: '#ffffff12',
    flexShrink: 0,
  },
  label: {
    display: 'block',
    fontSize: 10,
    letterSpacing: 3,
    color: '#EFE6D858',
    marginBottom: 8,
    fontWeight: 500,
  },
  input: {
    width: '100%',
    background: '#ffffff06',
    border: '1px solid #ffffff14',
    borderRadius: 3,
    padding: '14px 18px',
    color: '#EFE6D8',
    fontSize: 15,
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  btn: (variant = 'primary') => ({
    width: '100%',
    border: 'none',
    borderRadius: 3,
    padding: '15px',
    fontSize: 11,
    letterSpacing: 4,
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'opacity 0.2s',
    ...(variant === 'primary' ? {
      background: '#6F1D1B',
      color: '#EFE6D8',
    } : {
      background: 'transparent',
      border: '1px solid #ffffff14',
      color: '#EFE6D848',
    }),
  }),
  card: (highlighted = false) => ({
    background: highlighted ? '#6F1D1B10' : '#ffffff04',
    border: `1px solid ${highlighted ? '#6F1D1B55' : '#ffffff0e'}`,
    borderRadius: 3,
    padding: '14px 18px',
    transition: 'all 0.15s',
  }),
  gold: { color: '#D4A017' },
  muted: { color: '#EFE6D858' },
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function AINOSPedidos() {
  const [step, setStep] = useState(1)
  const [ruc, setRuc] = useState('')
  const [loadingCliente, setLoadingCliente] = useState(false)
  const [errorCliente, setErrorCliente] = useState('')
  const [cliente, setCliente] = useState(null)
  const [esNuevo, setEsNuevo] = useState(false)
  const [nuevoClienteData, setNuevoClienteData] = useState({ nombre: '', telefono: '', direccion: '', email: '' })
  const [cantidades, setCantidades] = useState({})
  const [notas, setNotas] = useState('')
  const [envioSeleccionado, setEnvioSeleccionado] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [pedidoEnviado, setPedidoEnviado] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')

  // ── Cálculos ────────────────────────────────────────────────────────────────
  const productosSeleccionados = CATALOGO.filter(p => (cantidades[p.id] || 0) > 0)
  const subtotal = CATALOGO.reduce((s, p) => s + p.precio * (cantidades[p.id] || 0), 0)
  const descuento = cliente?.porcentaje_descuento || 0
  const montoDescuento = subtotal * (descuento / 100)
  const costoEnvio = envioSeleccionado ? ENVIO_OPCIONES.find(e => e.id === envioSeleccionado)?.precio || 0 : 0
  const totalFinal = subtotal - montoDescuento + costoEnvio

  // ── Step 1: Buscar cliente ──────────────────────────────────────────────────
  const buscarCliente = async () => {
    if (ruc.length < 10 || loadingCliente) return
    setLoadingCliente(true)
    setErrorCliente('')

    try {
      const res = await fetch(`/api/lookup-client?ruc=${encodeURIComponent(ruc)}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Error al consultar')

      if (data.found) {
        setCliente(data)
        setEsNuevo(false)
      } else {
        setCliente({ ruc, porcentaje_descuento: 0, tipo: 'B2C' })
        setEsNuevo(true)
      }
      setStep(2)
    } catch (err) {
      setErrorCliente('No pudimos consultar tu información. Verifica tu RUC/cédula.')
    } finally {
      setLoadingCliente(false)
    }
  }

  // ── Step 3: Enviar pedido ───────────────────────────────────────────────────
  const enviarPedido = async () => {
    setEnviando(true)
    setErrorEnvio('')

    const clienteFinal = esNuevo
      ? { ...cliente, razon_social: nuevoClienteData.nombre, telefono: nuevoClienteData.telefono, direccion: nuevoClienteData.direccion, email: nuevoClienteData.email }
      : cliente

    try {
      const res = await fetch('/api/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: clienteFinal,
          productos: productosSeleccionados.map(p => ({ ...p, cantidad: cantidades[p.id] })),
          total: totalFinal,
          notas,
          esClienteNuevo: esNuevo,
          tipoCliente: clienteFinal.tipo,
          envio: envioSeleccionado ? ENVIO_OPCIONES.find(e => e.id === envioSeleccionado) : null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al enviar')

      setPedidoEnviado(true)
    } catch (err) {
      setErrorEnvio('Hubo un error al enviar tu pedido. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  // ── Pantalla de confirmación final ─────────────────────────────────────────
  if (pedidoEnviado) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 20, color: '#D4A017' }}>✦</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: 30, marginBottom: 12 }}>
            ¡Pedido confirmado!
          </h2>
          <p style={{ color: '#EFE6D858', fontSize: 14, lineHeight: 1.7, maxWidth: 320, margin: '0 auto 32px' }}>
            Recibimos tu pedido correctamente.<br />
            Te confirmaremos por WhatsApp en breve.
          </p>
          <div style={{ ...S.card(false), display: 'inline-block', padding: '12px 24px' }}>
            <span style={{ ...S.gold, fontSize: 13 }}>Total: ${totalFinal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Pedido en Línea — Apetitoso × AINOS</title>
        <meta name="description" content="Formulario de pedidos Apetitoso — Tortillas de Maíz y Nachos" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <div style={S.page}>
        <div style={S.container}>

          {/* Header */}
          <div style={S.header}>
            <p style={S.eyebrow}>APETITOSO × AINOS</p>
            <h1 style={S.title}>Pedido en Línea</h1>
            <div style={S.divider} />
          </div>

          {/* Steps indicator */}
          <div style={S.steps}>
            {['Identificación', 'Productos', 'Confirmar'].map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={S.stepDot(step === i + 1, step > i + 1)}>{i + 1}</div>
                <span style={S.stepLabel(step === i + 1)}>{label.toUpperCase()}</span>
                {i < 2 && <div style={S.stepLine} />}
              </div>
            ))}
          </div>

          {/* ── STEP 1: Identificación ────────────────────────────────────── */}
          {step === 1 && (
            <div>
              <p style={{ color: '#EFE6D860', fontSize: 13, textAlign: 'center', marginBottom: 32, lineHeight: 1.7 }}>
                Ingresa tu RUC o cédula y cargamos<br />automáticamente tu información
              </p>

              <div style={{ marginBottom: 12 }}>
                <label style={S.label}>RUC O CÉDULA</label>
                <input
                  value={ruc}
                  onChange={e => setRuc(e.target.value.replace(/\D/g, '').slice(0, 13))}
                  onKeyDown={e => e.key === 'Enter' && buscarCliente()}
                  placeholder="Ej: 1792045670001"
                  maxLength={13}
                  style={S.input}
                />
              </div>

              {errorCliente && (
                <p style={{ color: '#ff6b6b', fontSize: 12, marginBottom: 12, textAlign: 'center' }}>
                  {errorCliente}
                </p>
              )}

              <button
                onClick={buscarCliente}
                disabled={ruc.length < 10 || loadingCliente}
                style={S.btn('primary')}
              >
                {loadingCliente ? 'CONSULTANDO...' : 'CONTINUAR →'}
              </button>
            </div>
          )}

          {/* ── STEP 2: Productos ─────────────────────────────────────────── */}
          {step === 2 && cliente && (
            <div>
              {/* Banner cliente */}
              <div style={{ ...S.card(false), marginBottom: 24, background: '#D4A01710', border: '1px solid #D4A01728' }}>
                {esNuevo ? (
                  <div>
                    <p style={{ color: '#D4A017', fontSize: 10, letterSpacing: 3, marginBottom: 14, fontWeight: 500 }}>CLIENTE NUEVO — COMPLETA TUS DATOS</p>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {[
                        { key: 'nombre', label: 'NOMBRE / RAZÓN SOCIAL', placeholder: 'Tu nombre o empresa' },
                        { key: 'telefono', label: 'TELÉFONO / WHATSAPP', placeholder: '0987654321' },
                        { key: 'direccion', label: 'DIRECCIÓN DE ENTREGA', placeholder: 'Calle, número, ciudad' },
                        { key: 'email', label: 'CORREO ELECTRÓNICO', placeholder: 'tu@correo.com' },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={S.label}>{f.label}</label>
                          <input
                            value={nuevoClienteData[f.key]}
                            onChange={e => setNuevoClienteData(prev => ({ ...prev, [f.key]: e.target.value }))}
                            placeholder={f.placeholder}
                            style={{ ...S.input, padding: '10px 14px', fontSize: 13 }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: 15, marginBottom: 3 }}>{cliente.razon_social}</p>
                      <p style={{ ...S.muted, fontSize: 12 }}>{cliente.tipo} · RUC {cliente.ruc}</p>
                      {cliente.direccion && <p style={{ ...S.muted, fontSize: 12 }}>{cliente.direccion}</p>}
                    </div>
                    {descuento > 0 && (
                      <div style={{ background: '#6F1D1B', borderRadius: 20, padding: '4px 12px', fontSize: 11, whiteSpace: 'nowrap', letterSpacing: 1 }}>
                        −{descuento}%
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Productos */}
              <p style={S.label}>SELECCIONA TUS PRODUCTOS</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {CATALOGO.map(p => {
                  const q = cantidades[p.id] || 0
                  const precioConDescuento = p.precio * (1 - descuento / 100)
                  return (
                    <div key={p.id} style={S.card(q > 0)}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, marginBottom: 2 }}>{p.nombre}</p>
                          <p style={{ ...S.muted, fontSize: 11, marginBottom: 4 }}>{p.descripcion}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ ...S.gold, fontSize: 13 }}>${precioConDescuento.toFixed(2)}</span>
                            {descuento > 0 && (
                              <span style={{ ...S.muted, fontSize: 11, textDecoration: 'line-through' }}>${p.precio.toFixed(2)}</span>
                            )}
                            <span style={{ ...S.muted, fontSize: 11 }}>/ {p.unidad}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                          <button
                            onClick={() => setCantidades(prev => ({ ...prev, [p.id]: Math.max(0, (prev[p.id] || 0) - 1) }))}
                            style={{ width: 30, height: 30, background: '#ffffff08', border: '1px solid #ffffff12', color: '#EFE6D8', cursor: 'pointer', borderRadius: '3px 0 0 3px', fontSize: 16, lineHeight: 1 }}
                          >−</button>
                          <div style={{ width: 36, height: 30, background: '#ffffff04', border: '1px solid #ffffff12', borderLeft: 'none', borderRight: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: q > 0 ? '#D4A017' : '#EFE6D8' }}>
                            {q}
                          </div>
                          <button
                            onClick={() => setCantidades(prev => ({ ...prev, [p.id]: (prev[p.id] || 0) + 1 }))}
                            style={{ width: 30, height: 30, background: '#6F1D1B', border: 'none', color: '#EFE6D8', cursor: 'pointer', borderRadius: '0 3px 3px 0', fontSize: 16, lineHeight: 1 }}
                          >+</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Envío (opcional — solo si el cliente indica que es de provincia) */}
              <div style={{ marginBottom: 20 }}>
                <label style={S.label}>ENVÍO A PROVINCIA (opcional)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div
                    onClick={() => setEnvioSeleccionado(null)}
                    style={{ ...S.card(!envioSeleccionado), cursor: 'pointer', padding: '10px 14px' }}
                  >
                    <span style={{ fontSize: 13 }}>Sin envío — Retiro en Conocoto, Quito</span>
                  </div>
                  {ENVIO_OPCIONES.map(e => (
                    <div
                      key={e.id}
                      onClick={() => setEnvioSeleccionado(e.id)}
                      style={{ ...S.card(envioSeleccionado === e.id), cursor: 'pointer', padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}
                    >
                      <span style={{ fontSize: 13 }}>{e.label}</span>
                      <span style={{ ...S.gold, fontSize: 13 }}>${e.precio.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div style={{ ...S.card(false), background: '#ffffff06', border: '1px solid #D4A01728', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px' }}>
                <span style={{ fontSize: 10, letterSpacing: 3, ...S.muted }}>TOTAL DEL PEDIDO</span>
                <span style={{ fontSize: 26, ...S.gold }}>${totalFinal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={subtotal === 0}
                style={S.btn('primary')}
              >
                REVISAR PEDIDO →
              </button>
            </div>
          )}

          {/* ── STEP 3: Confirmar ────────────────────────────────────────── */}
          {step === 3 && (
            <div>
              {/* Resumen cliente */}
              <div style={{ ...S.card(false), marginBottom: 16 }}>
                <p style={{ color: '#D4A017', fontSize: 10, letterSpacing: 3, marginBottom: 10, fontWeight: 500 }}>CLIENTE</p>
                <p style={{ fontSize: 14 }}>{esNuevo ? nuevoClienteData.nombre || '(sin nombre)' : cliente.razon_social}</p>
                <p style={{ ...S.muted, fontSize: 12 }}>{cliente.ruc} · {esNuevo ? nuevoClienteData.telefono : cliente.telefono}</p>
              </div>

              {/* Resumen productos */}
              <div style={{ ...S.card(false), marginBottom: 16 }}>
                <p style={{ color: '#D4A017', fontSize: 10, letterSpacing: 3, marginBottom: 12, fontWeight: 500 }}>PRODUCTOS</p>
                {productosSeleccionados.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                    <span>{p.nombre} <span style={S.muted}>× {cantidades[p.id]}</span></span>
                    <span style={S.gold}>${(p.precio * (1 - descuento / 100) * cantidades[p.id]).toFixed(2)}</span>
                  </div>
                ))}

                <div style={{ borderTop: '1px solid #ffffff0e', marginTop: 12, paddingTop: 12 }}>
                  {descuento > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={S.muted}>Descuento ({descuento}%)</span>
                      <span style={{ color: '#4caf50' }}>−${montoDescuento.toFixed(2)}</span>
                    </div>
                  )}
                  {costoEnvio > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={S.muted}>Envío</span>
                      <span style={S.gold}>+${costoEnvio.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 10, letterSpacing: 3, ...S.muted }}>TOTAL</span>
                    <span style={{ fontSize: 24, ...S.gold }}>${totalFinal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>NOTAS ADICIONALES</label>
                <textarea
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  placeholder="Instrucciones de entrega, observaciones..."
                  rows={3}
                  style={{ ...S.input, resize: 'none' }}
                />
              </div>

              {errorEnvio && (
                <p style={{ color: '#ff6b6b', fontSize: 12, marginBottom: 12, textAlign: 'center' }}>
                  {errorEnvio}
                </p>
              )}

              <button
                onClick={enviarPedido}
                disabled={enviando}
                style={{ ...S.btn('primary'), marginBottom: 8, letterSpacing: 3 }}
              >
                {enviando ? 'ENVIANDO...' : 'CONFIRMAR PEDIDO ✦'}
              </button>
              <button onClick={() => setStep(2)} style={S.btn('secondary')}>
                ← MODIFICAR PEDIDO
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
