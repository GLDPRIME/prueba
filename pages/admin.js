import { useState, useEffect } from 'react'
import Head from 'next/head'

const ADMIN_PASSWORD = 'admin123'
const NOMBRE        = 'Velvet'
const INICIALES     = 'VE'

export default function Admin() {
  const [authed,   setAuthed]   = useState(false)
  const [pw,       setPw]       = useState('')
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [filter,   setFilter]   = useState('')
  const [vista,    setVista]    = useState('proximas')
  const [deleting, setDeleting] = useState(null)
  const [confirm,  setConfirm]  = useState(null)

  async function load() {
    setLoading(true)
    const res  = await fetch('/api/admin-bookings')
    const data = await res.json()
    setBookings(data.bookings || [])
    setLoading(false)
  }

  useEffect(() => { if (authed) load() }, [authed])

  function login() {
    if (pw === ADMIN_PASSWORD) setAuthed(true)
    else alert('Contraseña incorrecta')
  }

  async function eliminar(id) {
    setDeleting(id)
    const res = await fetch(`/api/delete-booking?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setBookings(prev => prev.filter(b => b.id !== id))
    } else {
      alert('Error al eliminar la cita')
    }
    setDeleting(null)
    setConfirm(null)
  }

  const today = new Date().toISOString().split('T')[0]

  const filtered = bookings.filter(b =>
    !filter ||
    b.name?.toLowerCase().includes(filter.toLowerCase()) ||
    b.email?.toLowerCase().includes(filter.toLowerCase()) ||
    b.profesional?.toLowerCase().includes(filter.toLowerCase())
  )

  const proximas = filtered.filter(b => b.date >= today)
  const pasadas  = filtered.filter(b => b.date <  today)
  const deHoy    = filtered.filter(b => b.date === today)
  const mostrar  = vista === 'hoy' ? deHoy : vista === 'todas' ? filtered : proximas

  const fmt = n => n ? `$${Number(n).toLocaleString('es-CL')}` : '—'

  if (!authed) return (
    <>
      <Head><title>Admin — {NOMBRE}</title></Head>
      <style>{css}</style>
      <div className="lp">
        <div className="lc">
          <div className="llogo">{INICIALES}</div>
          <p className="ltitle">Panel de administración</p>
          <p className="lsub">{NOMBRE}</p>
          <input className="li" type="password" placeholder="Contraseña"
            value={pw} onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()} />
          <button className="lbtn" onClick={login}>Entrar</button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Head><title>Admin — {NOMBRE}</title></Head>
      <style>{css}</style>

      {/* MODAL DE CONFIRMACIÓN */}
      {confirm && (
        <div className="modal-overlay">
          <div className="modal">
            <p className="modal-title">¿Eliminar esta cita?</p>
            <p className="modal-sub">
              <strong>{confirm.name}</strong> — {confirm.date} a las {confirm.time}<br/>
              {confirm.profesional} · {confirm.servicio}
            </p>
            <p className="modal-warn">Esta acción no se puede deshacer.</p>
            <div className="modal-btns">
              <button className="modal-cancel" onClick={() => setConfirm(null)}>Cancelar</button>
              <button className="modal-delete"
                disabled={deleting === confirm.id}
                onClick={() => eliminar(confirm.id)}>
                {deleting === confirm.id ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ap">
        {/* TOP BAR */}
        <div className="atop">
          <div className="atopL">
            <div className="alogo">{INICIALES}</div>
            <div>
              <p className="atitle">Reservas</p>
              <p className="asub">{NOMBRE}</p>
            </div>
          </div>
          <div className="atopR">
            <button className="asbtn" onClick={load}>↻ Actualizar</button>
            <a href="/" className="asbtn">← Volver</a>
          </div>
        </div>

        {/* STATS */}
        <div className="astats">
          {[
            ['Total',    bookings.length, '#e0f2fe', '#0369a1'],
            ['Hoy',      deHoy.length,    '#fef9c3', '#a16207'],
            ['Próximas', proximas.length, '#dcfce7', '#15803d'],
            ['Pasadas',  pasadas.length,  '#f5f5f5', '#6b7280'],
          ].map(([l, v, bg, color]) => (
            <div key={l} className="astat" style={{background: bg}}>
              <p className="astatN" style={{color}}>{v}</p>
              <p className="astatL">{l}</p>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="tabs">
          {[['proximas','Próximas'], ['hoy','Hoy'], ['todas','Todas']].map(([k, label]) => (
            <button key={k}
              className={`tab ${vista === k ? 'active' : ''}`}
              onClick={() => setVista(k)}>
              {label}
              <span className="tab-count">
                {k === 'proximas' ? proximas.length : k === 'hoy' ? deHoy.length : filtered.length}
              </span>
            </button>
          ))}
        </div>

        {/* BÚSQUEDA */}
        <input className="asearch"
          placeholder="Buscar por nombre, correo o profesional…"
          value={filter} onChange={e => setFilter(e.target.value)} />

        {/* TABLA */}
        {loading
          ? <p className="ahint">Cargando…</p>
          : mostrar.length === 0
            ? <p className="ahint">No hay reservas en esta vista.</p>
            : (
              <div className="atw">
                <table className="at">
                  <thead>
                    <tr>
                      {['Fecha','Hora','Profesional','Servicio','Precio','Cliente','Correo','Teléfono',''].map(h => (
                        <th key={h} className="ath">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mostrar.map(b => {
                      const esHoy = b.date === today
                      const esFut = b.date > today
                      return (
                        <tr key={b.id} className={esHoy ? 'atrHoy' : esFut ? 'atrFut' : 'atr'}>
                          <td className="atd">
                            <span className={`fecha-pill ${esHoy?'hoy':esFut?'fut':'pas'}`}>{b.date}</span>
                          </td>
                          <td className="atd"><span className="hora-pill">{b.time}</span></td>
                          <td className="atd" style={{fontWeight:600}}>{b.profesional || '—'}</td>
                          <td className="atd">{b.servicio || '—'}</td>
                          <td className="atd" style={{fontWeight:600,color:'#059669'}}>{fmt(b.precio)}</td>
                          <td className="atd" style={{fontWeight:500}}>{b.name}</td>
                          <td className="atd" style={{color:'#6b7280'}}>{b.email}</td>
                          <td className="atd" style={{color:'#9ca3af'}}>{b.notes || '—'}</td>
                          <td className="atd">
                            <button className="del-btn" onClick={() => setConfirm(b)}>
                              🗑 Eliminar
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
        }
      </div>
    </>
  )
}

const css = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f0f2f5;color:#1a1a2e;-webkit-font-smoothing:antialiased;}
  a{text-decoration:none;color:inherit;}
  button{font-family:inherit;}

  .lp{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f0f2f5;}
  .lc{background:#fff;border-radius:20px;box-shadow:0 8px 32px rgba(0,0,0,.10);padding:36px 28px;display:flex;flex-direction:column;align-items:center;gap:12px;width:340px;}
  .llogo{width:56px;height:56px;border-radius:14px;background:#1a1a2e;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#fff;}
  .ltitle{font-size:17px;font-weight:700;}
  .lsub{font-size:13px;color:#9ca3af;margin-top:-6px;}
  .li{font-size:15px;padding:12px 14px;border-radius:10px;border:1.5px solid #e5e7eb;background:#fafafa;color:#1a1a2e;outline:none;width:100%;margin-top:4px;}
  .li:focus{border-color:#1a1a2e;background:#fff;}
  .lbtn{width:100%;padding:13px;border-radius:12px;border:none;background:#1a1a2e;color:#fff;font-size:15px;font-weight:600;cursor:pointer;}

  .ap{max-width:1100px;margin:0 auto;padding:24px 20px;}
  .atop{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px;}
  .atopL{display:flex;align-items:center;gap:12px;}
  .alogo{width:40px;height:40px;border-radius:10px;background:#1a1a2e;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0;}
  .atitle{font-size:18px;font-weight:700;}
  .asub{font-size:12px;color:#9ca3af;}
  .atopR{display:flex;align-items:center;gap:8px;}
  .asbtn{font-size:13px;padding:7px 14px;border:1.5px solid #e5e7eb;border-radius:9px;background:#fff;color:#374151;cursor:pointer;}
  .asbtn:hover{background:#f9fafb;}

  .astats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}
  @media(max-width:600px){.astats{grid-template-columns:repeat(2,1fr);}}
  .astat{border-radius:14px;padding:16px 18px;text-align:center;}
  .astatN{font-size:26px;font-weight:700;}
  .astatL{font-size:12px;color:#6b7280;margin-top:2px;}

  .tabs{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;}
  .tab{padding:8px 16px;border-radius:10px;border:1.5px solid #e5e7eb;background:#fff;font-size:13px;font-weight:500;color:#6b7280;cursor:pointer;display:flex;align-items:center;gap:6px;}
  .tab:hover{border-color:#1a1a2e;color:#1a1a2e;}
  .tab.active{background:#1a1a2e;border-color:#1a1a2e;color:#fff;}
  .tab-count{font-size:11px;padding:1px 7px;border-radius:20px;background:rgba(0,0,0,.08);}
  .tab.active .tab-count{background:rgba(255,255,255,.2);}

  .asearch{font-size:14px;padding:11px 16px;border-radius:10px;border:1.5px solid #e5e7eb;background:#fff;color:#1a1a2e;outline:none;width:100%;margin-bottom:16px;}
  .asearch:focus{border-color:#1a1a2e;}
  .ahint{font-size:14px;color:#9ca3af;text-align:center;margin-top:40px;}

  .atw{overflow-x:auto;border:1.5px solid #e5e7eb;border-radius:14px;background:#fff;}
  .at{width:100%;border-collapse:collapse;font-size:13px;}
  .ath{text-align:left;padding:11px 14px;font-size:11px;font-weight:700;color:#9ca3af;border-bottom:1px solid #f3f4f6;background:#fafafa;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap;}
  .atd{padding:12px 14px;border-bottom:1px solid #f7f7f7;color:#374151;white-space:nowrap;}
  .atr{background:#fff;}
  .atrFut{background:#f0fdf4;}
  .atrHoy{background:#fffbeb;}

  .fecha-pill{font-size:12px;font-weight:600;padding:3px 8px;border-radius:6px;display:inline-block;}
  .fecha-pill.hoy{background:#fef9c3;color:#a16207;}
  .fecha-pill.fut{background:#dcfce7;color:#15803d;}
  .fecha-pill.pas{background:#f3f4f6;color:#6b7280;}
  .hora-pill{background:#f0f2f5;border-radius:6px;padding:3px 8px;font-size:12px;font-weight:600;color:#374151;}

  .del-btn{font-size:12px;padding:5px 10px;border-radius:7px;border:1.5px solid #fecaca;background:#fef2f2;color:#dc2626;cursor:pointer;font-weight:500;white-space:nowrap;}
  .del-btn:hover{background:#fee2e2;}

  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;}
  .modal{background:#fff;border-radius:16px;padding:28px;max-width:380px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.2);}
  .modal-title{font-size:17px;font-weight:700;margin-bottom:10px;}
  .modal-sub{font-size:14px;color:#374151;line-height:1.6;margin-bottom:10px;}
  .modal-warn{font-size:12px;color:#dc2626;background:#fef2f2;border-radius:8px;padding:8px 12px;margin-bottom:20px;}
  .modal-btns{display:flex;gap:10px;}
  .modal-cancel{flex:1;padding:11px;border-radius:10px;border:1.5px solid #e5e7eb;background:#fff;color:#374151;font-size:14px;font-weight:500;cursor:pointer;}
  .modal-cancel:hover{background:#f9fafb;}
  .modal-delete{flex:1;padding:11px;border-radius:10px;border:none;background:#dc2626;color:#fff;font-size:14px;font-weight:600;cursor:pointer;}
  .modal-delete:hover:not(:disabled){background:#b91c1c;}
  .modal-delete:disabled{opacity:.6;cursor:not-allowed;}
`
