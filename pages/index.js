// pages/index.js — Formulario de Pedidos Apetitos
// v3.0 — Tipo negocio, método pago, recordatorio calendario, alerta Ecuador

import { useState } from 'react'
import Head from 'next/head'

// ─── CIUDADES ECUADOR ─────────────────────────────────────────────────────────
const CIUDADES_EC = ['quito','guayaquil','cuenca','ibarra','otavalo','loja','ambato','riobamba','esmeraldas','manta','portoviejo','santo domingo','machala','durán','daule','samborondón','nueva loja','lago agrio','tulcán','guaranda','azogues','puyo','tena','macas','zamora','santa elena','salinas','la libertad','latacunga','conocoto','sangolquí','cumbayá','tumbaco','puembo','tabacundo','cayambe','pedro moncayo','salcedo','pujilí','saquisilí','piñas','el carmen','babahoyo','quevedo','ventanas','milagro','naranjal','catamayo','cariamanga','macará','saraguro','cañar','biblián','gualaceo','paute','sígsig','nabón','girón','santa isabel','armenia','tanda','monteserrín','uyumbicho','floresta','cumbayá','la florida','cotocollao','calderón','pomasqui','san antonio','nayón','zámbiza','llano chico','llano grande','calacalí']
const esEcuador = (ciudad = '') => { const c = ciudad.toLowerCase().trim(); return !c || CIUDADES_EC.some(e => c.includes(e) || e.includes(c)) }

// ─── TIPOS DE NEGOCIO ─────────────────────────────────────────────────────────
const TIPOS_NEGOCIO = [
  { id: 'restaurante',  label: 'Restaurante / Bar / Cafetería',       catalogo: 'b2b', icono: '🍽️' },
  { id: 'minimarket',   label: 'Tienda / Minimarket / Micro mercado',  catalogo: 'b2c', icono: '🏪' },
  { id: 'delicatessen', label: 'Delicatessen / Local gourmet',         catalogo: 'b2c', icono: '🛍️' },
  { id: 'bodega',       label: 'Bodega / Distribuidora',              catalogo: 'b2b', icono: '📦' },
  { id: 'evento',       label: 'Evento / Catering',                   catalogo: 'b2c', icono: '🎉' },
  { id: 'otro',         label: 'Otro tipo de negocio',                catalogo: 'consulta', icono: '💬' },
]

// ─── CATÁLOGO ─────────────────────────────────────────────────────────────────
const B2C = [
  { id:'tortilla-trad-10', nombre:'Tortillas Tradicionales', descripcion:'Paquete × 10 uds · 12.5 cm', precio:1.75, unidad:'paquete x10', categoria:'Tortillas', imagen:'/images/tortillas-decenas.png', esc:1.0 },
  { id:'tortilla-jumbo-10', nombre:'Tortilla Jumbo',          descripcion:'Paquete × 10 uds · 18.5 cm', precio:2.50, unidad:'paquete x10', categoria:'Tortillas', imagen:'/images/tortilla-jumbo.jpg',  esc:1.2 },
  { id:'totopos-180g',      nombre:'Totopos Crocantes 180g', descripcion:'Bolsa 180 gramos',            precio:1.75, unidad:'bolsa',       categoria:'Totopos',   imagen:'/images/totopos-180g.png',    esc:1.0 },
  { id:'totopos-500g',      nombre:'Totopos Crocantes 500g', descripcion:'Bolsa 500 gramos',            precio:4.25, unidad:'bolsa',       categoria:'Totopos',   imagen:'/images/totopos-500g.png',    esc:1.0 },
]
const B2B_EXTRA = [
  { id:'tortilla-mini-25',  nombre:'Tortilla Mini',     descripcion:'Paquete × 25 uds · 8 cm',         precio:+(0.11*25).toFixed(2), unidad:'paquete x25', categoria:'Tortillas', imagen:'/images/sope.jpg',               esc:0.55 },
  { id:'tortilla-med-50',   nombre:'Tortilla Mediana',  descripcion:'Paquete × 50 uds · 11 cm',        precio:+(0.13*50).toFixed(2), unidad:'paquete x50', categoria:'Tortillas', imagen:'/images/tortilla-jumbo.jpg',     esc:0.75 },
  { id:'tortilla-grande-25',nombre:'Tortilla Grande',   descripcion:'Paquete × 25 uds · 13.5 cm',      precio:+(0.18*25).toFixed(2), unidad:'paquete x25', categoria:'Tortillas', imagen:'/images/tortilla-jumbo.jpg',     esc:1.1  },
  { id:'tortilla-cuad-25',  nombre:'Tortilla Cuadrada', descripcion:'Paquete × 25 uds · 12×14.5 cm',   precio:+(0.17*25).toFixed(2), unidad:'paquete x25', categoria:'Tortillas', imagen:'/images/tortilla-cuadrada.jpg',  esc:1.0  },
  { id:'sopes-20',          nombre:'Sopes',             descripcion:'Paquete × 20 uds · 9.5 cm',       precio:+(0.22*20).toFixed(2), unidad:'paquete x20', categoria:'Tortillas', imagen:'/images/sope.jpg',               esc:0.65 },
  { id:'migas-kg',          nombre:'Migas de Maíz',     descripcion:'Por kilogramo',                   precio:1.00,                  unidad:'kg',          categoria:'Granel',    imagen:'/images/totopos-180g.png',        esc:1.0  },
  { id:'masa-kg',           nombre:'Masa de Maíz',      descripcion:'Por kilogramo',                   precio:7.00,                  unidad:'kg',          categoria:'Granel',    imagen:'/images/tortillas-decenas.png',   esc:1.0  },
]
const ESPECIALES = {
  'roast foods': [{ id:'totopos-125g', nombre:'Totopos 125g', descripcion:'Bolsa 125g · Especial', precio:1.20, unidad:'bolsa', categoria:'Totopos', imagen:'/images/totopos-180g.png', esc:0.85 }],
  meramexair:    [{ id:'tortilla-doc', nombre:'Tortillas Tradicionales', descripcion:'Docena × 12 uds · Precio especial', precio:1.50, unidad:'docena x12', categoria:'Tortillas', imagen:'/images/tortillas-decenas.png', esc:1.0, badge:'1 docena gratis' }],
}

function getProductos(cliente, tipoNegocio) {
  const nombre = (cliente?.razon_social || '').toLowerCase()
  if (nombre.includes('roast foods')) return [...ESPECIALES['roast foods'], ...B2C.filter(p => !p.id.includes('totopos'))]
  if (nombre.includes('meramexair')) return [...ESPECIALES.meramexair, ...B2C.filter(p => !p.id.includes('trad')), ...B2B_EXTRA.filter(p => !['migas-kg','masa-kg'].includes(p.id))]
  const cat = tipoNegocio?.catalogo || cliente?.tipo || 'b2c'
  if (cat === 'b2b') return [...B2C, ...B2B_EXTRA]
  if (cat === 'consulta') return []
  return B2C
}

// ─── ENVÍO ────────────────────────────────────────────────────────────────────
const MAPS_URL = 'https://maps.app.goo.gl/CTXikRYZ5SE8nT9N6'
const ENETSA = ['otavalo','ibarra','cuenca','manta','esmeraldas','ambato','riobamba','guayaquil','machala','loja','tulcán','guaranda','azogues']
const TRAMACO = ['latacunga','salcedo','pujilí','saquisilí']
function detectEnvio(dir='') {
  const d = dir.toLowerCase()
  if (TRAMACO.some(c=>d.includes(c))) return 'tramaco'
  if (ENETSA.some(c=>d.includes(c))) return 'enetsa'
  return 'quito'
}

// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const card = { background:'#fff', border:'1px solid var(--border)', borderRadius:10, padding:'20px', marginBottom:16, boxShadow:'0 1px 4px rgba(26,26,26,0.07)' }
const cardTitle = { fontFamily:'Nunito,sans-serif', fontWeight:700, fontSize:11, letterSpacing:1.5, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:14 }
const inp = { width:'100%', background:'var(--bg)', border:'1.5px solid var(--border)', borderRadius:7, padding:'11px 14px', color:'var(--text)', fontSize:14, boxSizing:'border-box', outline:'none', transition:'border-color .2s' }
const btnP = { width:'100%', background:'var(--oxblood)', border:'none', borderRadius:8, padding:'14px', color:'var(--eggshell)', fontSize:12, fontWeight:700, letterSpacing:2, cursor:'pointer', fontFamily:'Nunito,sans-serif' }
const btnS = { width:'100%', background:'transparent', border:'1.5px solid var(--border)', borderRadius:8, padding:'12px', color:'var(--text-muted)', fontSize:11, fontWeight:600, letterSpacing:1.5, cursor:'pointer', fontFamily:'Nunito,sans-serif' }
const selCard = (on) => ({ display:'flex', alignItems:'center', gap:12, cursor:'pointer', background:on?'rgba(111,29,27,.05)':'var(--bg)', border:`1.5px solid ${on?'rgba(111,29,27,.35)':'var(--border)'}`, borderRadius:8, padding:'11px 14px', marginBottom:8, transition:'all .15s' })
const badge = (t='ox') => ({ display:'inline-block', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:700, fontFamily:'Nunito,sans-serif', background:t==='gold'?'rgba(212,160,23,.12)':'rgba(111,29,27,.10)', color:t==='gold'?'var(--gold)':'var(--oxblood)' })

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep]               = useState(1)
  const [ruc, setRuc]                 = useState('')
  const [loading, setLoading]         = useState(false)
  const [errCliente, setErrCliente]   = useState('')
  const [cliente, setCliente]         = useState(null)
  const [esNuevo, setEsNuevo]         = useState(false)
  const [nuevoData, setNuevoData]     = useState({ nombre:'', telefono:'', email:'', ciudad:'', direccion:'' })
  const [tipoNeg, setTipoNeg]         = useState(null)
  const [otroDesc, setOtroDesc]       = useState('')
  const [errUbic, setErrUbic]         = useState('')
  const [qty, setQty]                 = useState({})
  const [envio, setEnvio]             = useState(null)
  const [metodoPago, setMetodoPago]   = useState(null)
  const [notas, setNotas]             = useState('')
  const [enviando, setEnviando]       = useState(false)
  const [errEnvio, setErrEnvio]       = useState('')
  const [done, setDone]               = useState(false)
  const [numPedido, setNumPedido]     = useState('')

  const productos  = getProductos(cliente, tipoNeg)
  const descPct    = cliente?.porcentaje_descuento || 0
  const subtotal   = productos.reduce((s,p) => s + p.precio*(qty[p.id]||0), 0)
  const montoDesc  = subtotal * descPct/100
  const costoEnvio = envio?.precio || 0
  const total      = subtotal - montoDesc + costoEnvio
  const creditoDias = cliente?.credito_dias || 0
  const fechaVenc  = creditoDias ? new Date(Date.now() + creditoDias*86400000) : null

  const dirRef = esNuevo ? nuevoData.ciudad : (cliente?.direccion||'')
  const tipoEnvio = detectEnvio(dirRef)

  // Buscar cliente
  const buscarCliente = async () => {
    if (ruc.length < 10 || loading) return
    setLoading(true); setErrCliente('')
    try {
      const r = await fetch(`/api/lookup-client?ruc=${ruc}`)
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      if (d.found) {
        if (d.tiene_deuda) { setErrCliente('⚠️ Tienes facturas pendientes. Comunícate con nuestro equipo antes de realizar un nuevo pedido.'); return }
        setCliente(d); setEsNuevo(false); setStep(2)
      } else {
        setCliente({ ruc, porcentaje_descuento:0, tipo:'b2c' }); setEsNuevo(true)
      }
    } catch { setErrCliente('No pudimos verificar tu identificación. Intenta de nuevo.') }
    finally { setLoading(false) }
  }

  const continuarNuevo = () => {
    if (nuevoData.ciudad && !esEcuador(nuevoData.ciudad)) {
      setErrUbic('🌎 Por el momento, Apetitos distribuye únicamente en Ecuador. Si estás interesado en nuestros productos, escríbenos a ventasapetitos@gmail.com — nos encantaría estar más cerca de ti pronto.')
      return
    }
    if (!nuevoData.nombre||!nuevoData.telefono||!nuevoData.ciudad||!tipoNeg) { setErrUbic('Por favor completa todos los campos obligatorios.'); return }
    setErrUbic('')
    setStep(tipoNeg.catalogo === 'consulta' ? 3 : 2)
  }

  // Enviar pedido
  const confirmar = async () => {
    if (!metodoPago) { setErrEnvio('Por favor selecciona un método de pago.'); return }
    setEnviando(true); setErrEnvio('')
    const cf = esNuevo ? { ...cliente, razon_social:nuevoData.nombre, telefono:nuevoData.telefono, email:nuevoData.email, direccion:`${nuevoData.direccion}, ${nuevoData.ciudad}`, tipo:tipoNeg?.id } : cliente
    try {
      const r = await fetch('/api/submit-order', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ cliente:cf, productos:productos.filter(p=>(qty[p.id]||0)>0).map(p=>({...p,cantidad:qty[p.id]})), total, subtotal, descuento_pct:descPct, monto_descuento:montoDesc, envio, notas, metodoPago, esClienteNuevo:esNuevo, tipoNegocio:tipoNeg?.id }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setNumPedido(`APT-${Date.now().toString(36).toUpperCase()}`)
      setDone(true)
    } catch { setErrEnvio('Error al enviar el pedido. Intenta de nuevo.') }
    finally { setEnviando(false) }
  }

  // WhatsApp mensaje
  const waMsg = () => {
    const nm = esNuevo ? nuevoData.nombre : cliente?.razon_social
    const prods = productos.filter(p=>(qty[p.id]||0)>0).map(p=>`• ${p.nombre} × ${qty[p.id]} = $${(p.precio*(1-descPct/100)*qty[p.id]).toFixed(2)}`).join('%0A')
    let m = `Hola Apetitos 🌮%0A%0A*Pedido — ${numPedido}*%0A${nm}%0A${prods}%0A`
    if (costoEnvio) m += `• Envío (${envio?.label}) = $${costoEnvio.toFixed(2)}%0A`
    m += `*Total: $${total.toFixed(2)}*%0A%0A`
    if (metodoPago==='transferencia') {
      if (fechaVenc && creditoDias) { m += `💳 Transferencia con crédito ${creditoDias} días%0A📅 Pago máximo: ${fechaVenc.toLocaleDateString('es-EC',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}%0A_Recuerda pagar antes de esa fecha._` }
      else { m += `💳 Transferencia%0A📎 Adjunta el comprobante de pago para confirmar tu pedido.%0AEscribir a ventasapetitos@gmail.com para recibir los datos bancarios.` }
    } else { m += `💵 Pago en efectivo al momento de entrega.` }
    if (notas) m += `%0A%0A📝 ${notas}`
    return `https://wa.me/593987772578?text=${m}`
  }

  // Calendario
  const calLink = () => {
    if (!fechaVenc) return null
    const nm = esNuevo ? nuevoData.nombre : cliente?.razon_social
    const s = fechaVenc.toISOString().replace(/[-:.]/g,'').slice(0,15)+'Z'
    const e = new Date(fechaVenc.getTime()+3600000).toISOString().replace(/[-:.]/g,'').slice(0,15)+'Z'
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`💳 Pago factura Apetitos — ${nm}`)}&dates=${s}/${e}&details=${encodeURIComponent(`Referencia: ${numPedido}\nTotal: $${total.toFixed(2)}`)}`
  }

  // ── Pantalla confirmación ─────────────────────────────────────────────────
  if (done) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingBottom:60 }}>
      <div style={{ background:'var(--black)', padding:'28px 20px 24px', textAlign:'center', marginBottom:32 }}>
        <img src="/images/logo.png" alt="Apetitos" style={{ height:56, objectFit:'contain' }} />
      </div>
      <div style={{ maxWidth:520, margin:'0 auto', padding:'0 16px' }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(39,174,96,.12)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:26 }}>✓</div>
          <h2 style={{ fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize:24, marginBottom:4 }}>¡Pedido recibido!</h2>
          <p style={{ color:'var(--text-muted)', fontSize:13 }}>Referencia: <strong style={{ color:'var(--oxblood)' }}>{numPedido}</strong></p>
        </div>

        {/* Resumen */}
        <div style={card}>
          <p style={cardTitle}>Resumen del pedido</p>
          {productos.filter(p=>(qty[p.id]||0)>0).map(p=>(
            <div key={p.id} style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:13 }}>
              <span>{p.nombre} <span style={{ color:'var(--text-muted)' }}>× {qty[p.id]}</span></span>
              <span style={{ color:'var(--oxblood)', fontWeight:700 }}>${(p.precio*(1-descPct/100)*qty[p.id]).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ borderTop:'1px solid var(--border)', paddingTop:10, marginTop:4, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:'Nunito,sans-serif', fontWeight:700, fontSize:12, color:'var(--text-muted)' }}>TOTAL</span>
            <span style={{ fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize:22, color:'var(--oxblood)' }}>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Crédito + calendario */}
        {metodoPago==='transferencia' && fechaVenc && creditoDias>0 && (
          <div style={{ ...card, background:'#FEF9F0', border:'1.5px solid rgba(212,160,23,.3)' }}>
            <p style={cardTitle}>💳 Crédito {creditoDias} días</p>
            <p style={{ fontSize:13, marginBottom:14 }}>Fecha límite de pago: <strong>{fechaVenc.toLocaleDateString('es-EC',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</strong></p>
            {calLink() && (
              <a href={calLink()} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1.5px solid var(--border)', borderRadius:8, padding:'10px 14px', textDecoration:'none', color:'var(--text)', fontSize:13, fontWeight:600, fontFamily:'Nunito,sans-serif' }}>
                📅 Añadir recordatorio al calendario
              </a>
            )}
          </div>
        )}

        {metodoPago==='transferencia' && !creditoDias && (
          <div style={{ ...card, background:'#FEF9F0', border:'1.5px solid rgba(212,160,23,.3)' }}>
            <p style={cardTitle}>💳 Transferencia bancaria</p>
            <p style={{ fontSize:13, color:'var(--text-muted)' }}>Recuerda adjuntar el comprobante de pago al confirmar tu pedido por WhatsApp.</p>
          </div>
        )}

        <a href={waMsg()} target="_blank" rel="noreferrer" style={{ display:'block', textAlign:'center', background:'#25D366', color:'#fff', borderRadius:8, padding:'14px', fontSize:13, fontWeight:700, textDecoration:'none', fontFamily:'Nunito,sans-serif', letterSpacing:1, marginBottom:10 }}>
          📲 CONFIRMAR POR WHATSAPP
        </a>
        <button onClick={()=>{ setStep(1);setDone(false);setQty({});setRuc('');setCliente(null);setTipoNeg(null);setMetodoPago(null);setEnvio(null);setEsNuevo(false);setNuevoData({nombre:'',telefono:'',email:'',ciudad:'',direccion:''}) }} style={btnS}>
          Hacer otro pedido
        </button>
      </div>
    </div>
  )

  return (
    <>
      <Head>
        <title>Pedido en Línea — Apetitos</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight:'100vh', background:'var(--bg)', paddingBottom:80 }}>
        {/* Header */}
        <div style={{ background:'var(--black)', padding:'28px 20px 24px', textAlign:'center', marginBottom:32 }}>
          <img src="/images/logo.png" alt="Apetitos" style={{ height:56, objectFit:'contain' }} />
          <p style={{ color:'rgba(239,230,216,.5)', fontSize:10, letterSpacing:5, marginTop:8, fontFamily:'Nunito,sans-serif', fontWeight:700 }}>PEDIDO EN LÍNEA</p>
        </div>

        <div style={{ maxWidth:560, margin:'0 auto', padding:'0 16px' }}>
          {/* Steps */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginBottom:28 }}>
            {['Identificación','Productos','Confirmar'].map((label,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:26, height:26, borderRadius:'50%', flexShrink:0, background:step>i+1?'var(--oxblood)':step===i+1?'var(--gold)':'var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, fontFamily:'Nunito,sans-serif', color:step>i+1?'var(--eggshell)':step===i+1?'var(--black)':'var(--text-muted)' }}>
                  {step>i+1?'✓':i+1}
                </div>
                <span style={{ fontSize:10, letterSpacing:1.5, fontFamily:'Nunito,sans-serif', fontWeight:step===i+1?700:500, color:step===i+1?'var(--oxblood)':'var(--text-muted)' }}>{label.toUpperCase()}</span>
                {i<2&&<div style={{ width:16, height:1, background:'var(--border)', flexShrink:0 }}/>}
              </div>
            ))}
          </div>

          {/* ── STEP 1 ───────────────────────────────────────────────────────── */}
          {step===1&&(
            <div>
              <div style={card}>
                <p style={cardTitle}>Identifícate</p>
                <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:18, lineHeight:1.6 }}>Ingresa tu RUC o cédula y cargamos automáticamente tu información.</p>
                <label style={{ display:'block', fontSize:12, fontWeight:500, color:'var(--text-muted)', marginBottom:6 }}>RUC O CÉDULA *</label>
                <input value={ruc} onChange={e=>{setRuc(e.target.value.replace(/\D/g,'').slice(0,13));setErrCliente('');setEsNuevo(false)}} onKeyDown={e=>e.key==='Enter'&&buscarCliente()} placeholder="Ej: 1792045670001" maxLength={13} style={inp} autoFocus />
                {errCliente&&<p style={{ color:'var(--error)', fontSize:12, marginTop:6 }}>{errCliente}</p>}
              </div>

              {esNuevo&&(
                <div style={card}>
                  <p style={cardTitle}>Nuevo cliente — Completa tus datos</p>
                  <div style={{ display:'grid', gap:12, marginBottom:20 }}>
                    {[{k:'nombre',l:'NOMBRE / RAZÓN SOCIAL *',p:'Tu nombre o empresa'},{k:'telefono',l:'TELÉFONO / WHATSAPP *',p:'0987654321'},{k:'email',l:'CORREO ELECTRÓNICO',p:'tu@correo.com'},{k:'ciudad',l:'CIUDAD *',p:'Ej: Quito, Cuenca, Ibarra...'},{k:'direccion',l:'DIRECCIÓN DE ENTREGA *',p:'Calle, número, referencia'}].map(f=>(
                      <div key={f.k}>
                        <label style={{ display:'block', fontSize:12, fontWeight:500, color:'var(--text-muted)', marginBottom:6 }}>{f.l}</label>
                        <input value={nuevoData[f.k]} onChange={e=>{setNuevoData(p=>({...p,[f.k]:e.target.value}));setErrUbic('')}} placeholder={f.p} style={inp} />
                      </div>
                    ))}
                  </div>

                  <p style={{ ...cardTitle, marginBottom:12 }}>Tipo de negocio *</p>
                  {TIPOS_NEGOCIO.map(t=>(
                    <div key={t.id} onClick={()=>setTipoNeg(t)} style={selCard(tipoNeg?.id===t.id)}>
                      <span style={{ fontSize:18 }}>{t.icono}</span>
                      <span style={{ fontSize:13, fontWeight:tipoNeg?.id===t.id?700:400, fontFamily:'Nunito,sans-serif', flex:1 }}>{t.label}</span>
                      {tipoNeg?.id===t.id&&<span style={{ color:'var(--oxblood)', fontWeight:700 }}>✓</span>}
                    </div>
                  ))}

                  {tipoNeg?.id==='otro'&&(
                    <div style={{ marginTop:8 }}>
                      <label style={{ display:'block', fontSize:12, fontWeight:500, color:'var(--text-muted)', marginBottom:6 }}>ESPECIFICA TU NEGOCIO</label>
                      <input value={otroDesc} onChange={e=>setOtroDesc(e.target.value)} placeholder="Describe tu tipo de negocio" style={inp} />
                    </div>
                  )}

                  {tipoNeg?.catalogo==='consulta'&&!errUbic&&(
                    <div style={{ background:'rgba(212,160,23,.07)', border:'1px solid rgba(212,160,23,.25)', borderRadius:8, padding:'12px 14px', marginTop:12, fontSize:13, lineHeight:1.7 }}>
                      💬 <strong>No hay problema.</strong> Continúa y nuestro equipo te contactará para preparar un catálogo personalizado para tu negocio. También puedes escribirnos a <strong>ventasapetitos@gmail.com</strong>.
                    </div>
                  )}

                  {errUbic&&(
                    <div style={{ background:'rgba(192,57,43,.06)', border:'1px solid rgba(192,57,43,.2)', borderRadius:8, padding:'12px 14px', marginTop:12, fontSize:13, lineHeight:1.7, color:'var(--text)' }}>
                      {errUbic}
                    </div>
                  )}
                </div>
              )}

              {!esNuevo
                ?<button onClick={buscarCliente} disabled={ruc.length<10||loading} style={btnP}>{loading?'VERIFICANDO...':'CONTINUAR →'}</button>
                :<button onClick={continuarNuevo} disabled={!tipoNeg||!nuevoData.nombre||!nuevoData.telefono||!nuevoData.ciudad} style={btnP}>CONTINUAR →</button>
              }
            </div>
          )}

          {/* ── STEP 2 ───────────────────────────────────────────────────────── */}
          {step===2&&(
            <div>
              {/* Banner cliente */}
              <div style={{ ...card, background:'#FEF9F0', border:'1.5px solid rgba(212,160,23,.25)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                  <div>
                    <p style={{ fontFamily:'Nunito,sans-serif', fontWeight:700, fontSize:15, marginBottom:3 }}>{esNuevo?nuevoData.nombre:cliente?.razon_social}</p>
                    <p style={{ color:'var(--text-muted)', fontSize:12 }}>{tipoNeg?.label||cliente?.tipo} · {esNuevo?nuevoData.ciudad:cliente?.direccion}</p>
                  </div>
                  {descPct>0&&<span style={badge('ox')}>−{descPct}% descuento</span>}
                </div>
              </div>

              {/* Productos */}
              <div style={card}>
                <p style={cardTitle}>Selecciona tus productos</p>
                {['Tortillas','Totopos','Granel'].map(cat=>{
                  const prods = productos.filter(p=>p.categoria===cat)
                  if(!prods.length) return null
                  return (
                    <div key={cat} style={{ marginBottom:20 }}>
                      <p style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', letterSpacing:2, marginBottom:10, textTransform:'uppercase' }}>{cat}</p>
                      {prods.map(p=>{
                        const q=qty[p.id]||0
                        const pF=p.precio*(1-descPct/100)
                        return (
                          <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, background:q>0?'rgba(111,29,27,.04)':'var(--bg)', border:`1.5px solid ${q>0?'rgba(111,29,27,.25)':'var(--border)'}`, borderRadius:8, padding:'10px 12px', marginBottom:8, transition:'all .15s' }}>
                            <div style={{ width:50, height:50, borderRadius:6, overflow:'hidden', flexShrink:0, background:'#1A1A1A', display:'flex', alignItems:'center', justifyContent:'center' }}>
                              <img src={p.imagen} alt={p.nombre} style={{ width:'100%', height:'100%', objectFit:'cover', transform:`scale(${p.esc||1})` }} onError={e=>{e.target.style.display='none'}} />
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                                <p style={{ fontFamily:'Nunito,sans-serif', fontWeight:700, fontSize:13 }}>{p.nombre}</p>
                                {p.badge&&<span style={badge('gold')}>{p.badge}</span>}
                              </div>
                              <p style={{ color:'var(--text-muted)', fontSize:11, marginBottom:2 }}>{p.descripcion}</p>
                              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                                <span style={{ color:'var(--oxblood)', fontWeight:700, fontSize:13 }}>${pF.toFixed(2)}</span>
                                {descPct>0&&<span style={{ color:'var(--text-muted)', fontSize:11, textDecoration:'line-through' }}>${p.precio.toFixed(2)}</span>}
                                <span style={{ color:'var(--text-muted)', fontSize:11 }}>/ {p.unidad}</span>
                              </div>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', flexShrink:0 }}>
                              <button onClick={()=>setQty(prev=>({...prev,[p.id]:Math.max(0,(prev[p.id]||0)-1)}))} style={{ width:28, height:28, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'6px 0 0 6px', cursor:'pointer', fontSize:15, color:'var(--text-muted)', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                              <div style={{ width:34, height:28, background:q>0?'rgba(111,29,27,.07)':'#fff', border:'1px solid var(--border)', borderLeft:'none', borderRight:'none', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, fontFamily:'Nunito,sans-serif', color:q>0?'var(--oxblood)':'var(--text-muted)' }}>{q}</div>
                              <button onClick={()=>setQty(prev=>({...prev,[p.id]:(prev[p.id]||0)+1}))} style={{ width:28, height:28, background:'var(--oxblood)', border:'none', borderRadius:'0 6px 6px 0', cursor:'pointer', fontSize:15, color:'var(--eggshell)', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>

              {/* Envío */}
              <div style={card}>
                <p style={cardTitle}>Método de entrega</p>
                <div onClick={()=>setEnvio(null)} style={selCard(!envio)}>
                  <div style={{ flex:1 }}>
                    <p style={{ fontFamily:'Nunito,sans-serif', fontWeight:600, fontSize:13 }}>Retiro en fábrica — Conocoto</p>
                    <p style={{ color:'var(--text-muted)', fontSize:11 }}>Sin costo de envío</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <a href={MAPS_URL} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{ fontSize:10, color:'var(--oxblood)', textDecoration:'underline', fontWeight:600 }}>Ver mapa</a>
                    <span style={{ fontFamily:'Nunito,sans-serif', fontWeight:700, color:'#27ae60', fontSize:13 }}>Gratis</span>
                  </div>
                </div>
                {tipoEnvio==='enetsa'&&[{id:'en-dom',label:'Enetsa — Entrega a domicilio',precio:4.70},{id:'en-of',label:'Enetsa — Retiro en oficina',precio:4.50}].map(op=>(
                  <div key={op.id} onClick={()=>setEnvio(op)} style={selCard(envio?.id===op.id)}>
                    <p style={{ fontFamily:'Nunito,sans-serif', fontWeight:600, fontSize:13, flex:1 }}>{op.label}</p>
                    <span style={{ fontFamily:'Nunito,sans-serif', fontWeight:700, color:'var(--oxblood)' }}>${op.precio.toFixed(2)}</span>
                  </div>
                ))}
                {tipoEnvio==='tramaco'&&(
                  <div onClick={()=>setEnvio({id:'tramaco',label:'Tramaco — Latacunga',precio:11.00})} style={selCard(envio?.id==='tramaco')}>
                    <p style={{ fontFamily:'Nunito,sans-serif', fontWeight:600, fontSize:13, flex:1 }}>Tramaco — Latacunga y zona</p>
                    <span style={{ fontFamily:'Nunito,sans-serif', fontWeight:700, color:'var(--oxblood)' }}>$11.00</span>
                  </div>
                )}
                {tipoEnvio!=='enetsa'&&tipoEnvio!=='tramaco'&&tipoEnvio!=='quito'&&(
                  <div style={{ background:'rgba(212,160,23,.07)', border:'1px solid rgba(212,160,23,.25)', borderRadius:8, padding:'11px 14px', fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>
                    📦 El costo de envío a tu ciudad se coordinará directamente con nuestro equipo. Te contactaremos para confirmar los detalles de la entrega.
                  </div>
                )}
              </div>

              {/* Total */}
              <div style={{ ...card, marginBottom:12 }}>
                {descPct>0&&<><div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-muted)', marginBottom:4 }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div><div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#27ae60', marginBottom:4 }}><span>Descuento ({descPct}%)</span><span>−${montoDesc.toFixed(2)}</span></div></>}
                {costoEnvio>0&&<div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-muted)', marginBottom:4 }}><span>Envío</span><span>+${costoEnvio.toFixed(2)}</span></div>}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid var(--border)', paddingTop:10, marginTop:4 }}>
                  <span style={{ fontFamily:'Nunito,sans-serif', fontWeight:700, fontSize:12, color:'var(--text-muted)' }}>TOTAL DEL PEDIDO</span>
                  <span style={{ fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize:24, color:'var(--oxblood)' }}>${total.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={()=>setStep(3)} disabled={subtotal===0} style={btnP}>REVISAR PEDIDO →</button>
            </div>
          )}

          {/* ── STEP 3 ───────────────────────────────────────────────────────── */}
          {step===3&&(
            <div>
              {tipoNeg?.catalogo==='consulta'&&(
                <div style={{ background:'rgba(212,160,23,.08)', border:'1px solid rgba(212,160,23,.3)', borderRadius:10, padding:16, marginBottom:16, fontSize:13, lineHeight:1.7 }}>
                  💬 <strong>Nuestro equipo te contactará</strong> para preparar un catálogo personalizado. También puedes escribirnos directamente a <strong>ventasapetitos@gmail.com</strong> o por WhatsApp.
                </div>
              )}

              <div style={card}>
                <p style={cardTitle}>Cliente</p>
                <p style={{ fontFamily:'Nunito,sans-serif', fontWeight:700, fontSize:15 }}>{esNuevo?nuevoData.nombre:cliente?.razon_social}</p>
                <p style={{ color:'var(--text-muted)', fontSize:12 }}>{esNuevo?`${nuevoData.telefono} · ${nuevoData.ciudad}`:`${cliente?.ruc} · ${cliente?.telefono}`}</p>
              </div>

              {productos.filter(p=>(qty[p.id]||0)>0).length>0&&(
                <div style={card}>
                  <p style={cardTitle}>Productos</p>
                  {productos.filter(p=>(qty[p.id]||0)>0).map(p=>(
                    <div key={p.id} style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:13 }}>
                      <span>{p.nombre} <span style={{ color:'var(--text-muted)' }}>× {qty[p.id]}</span></span>
                      <span style={{ color:'var(--oxblood)', fontWeight:700 }}>${(p.precio*(1-descPct/100)*qty[p.id]).toFixed(2)}</span>
                    </div>
                  ))}
                  {envio&&<div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-muted)', paddingTop:8, borderTop:'1px solid var(--border)' }}><span>Envío — {envio.label}</span><span>${envio.precio.toFixed(2)}</span></div>}
                  <div style={{ display:'flex', justifyContent:'space-between', paddingTop:10, borderTop:'1px solid var(--border)', alignItems:'center', marginTop:4 }}>
                    <span style={{ fontFamily:'Nunito,sans-serif', fontWeight:700, fontSize:12, color:'var(--text-muted)' }}>TOTAL</span>
                    <span style={{ fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize:22, color:'var(--oxblood)' }}>${total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Método de pago */}
              <div style={card}>
                <p style={cardTitle}>Método de pago *</p>
                {[{id:'efectivo',label:'Efectivo',desc:'Se cobra al momento de la entrega',icono:'💵'},{id:'transferencia',label:'Transferencia bancaria',desc:'Te enviamos los datos al confirmar',icono:'🏦'}].map(m=>(
                  <div key={m.id} onClick={()=>setMetodoPago(m.id)} style={selCard(metodoPago===m.id)}>
                    <span style={{ fontSize:20 }}>{m.icono}</span>
                    <div style={{ flex:1 }}>
                      <p style={{ fontFamily:'Nunito,sans-serif', fontWeight:600, fontSize:13 }}>{m.label}</p>
                      <p style={{ color:'var(--text-muted)', fontSize:11 }}>{m.desc}</p>
                    </div>
                    {metodoPago===m.id&&<span style={{ color:'var(--oxblood)', fontWeight:700 }}>✓</span>}
                  </div>
                ))}
                {metodoPago==='transferencia'&&creditoDias>0&&(
                  <div style={{ background:'rgba(212,160,23,.07)', border:'1px solid rgba(212,160,23,.2)', borderRadius:8, padding:'10px 12px', marginTop:4, fontSize:12, color:'var(--text-muted)' }}>
                    ✅ Tienes <strong>{creditoDias} días de crédito</strong>. La fecha de vencimiento aparecerá en tu confirmación.
                  </div>
                )}
              </div>

              {/* Notas */}
              <div style={card}>
                <p style={cardTitle}>Notas adicionales</p>
                <textarea value={notas} onChange={e=>setNotas(e.target.value)} placeholder="Instrucciones de entrega, observaciones..." rows={3} style={{ ...inp, resize:'none' }} />
              </div>

              {errEnvio&&<p style={{ color:'var(--error)', fontSize:12, textAlign:'center', marginBottom:12 }}>{errEnvio}</p>}
              <button onClick={confirmar} disabled={enviando||!metodoPago} style={{ ...btnP, marginBottom:10 }}>{enviando?'ENVIANDO...':'CONFIRMAR PEDIDO ✓'}</button>
              <button onClick={()=>setStep(2)} style={btnS}>← MODIFICAR PEDIDO</button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
