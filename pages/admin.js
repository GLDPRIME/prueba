import { useState, useEffect } from 'react'
import Head from 'next/head'

const ADMIN_PASSWORD = 'admin123'

export default function Admin() {
  const [authed,   setAuthed]   = useState(false)
  const [pw,       setPw]       = useState('')
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [filter,   setFilter]   = useState('')

  async function load() {
    setLoading(true)
    const res  = await fetch('/api/admin-bookings')
    const data = await res.json()
    setBookings(data.bookings || [])
    setLoading(false)
  }

  useEffect(()=>{ if (authed) load() }, [authed])

  function login() {
    if (pw === ADMIN_PASSWORD) setAuthed(true)
    else alert('Contraseña incorrecta')
  }

  const filtered = bookings.filter(b =>
    !filter ||
    b.name?.toLowerCase().includes(filter.toLowerCase()) ||
    b.email?.toLowerCase().includes(filter.toLowerCase())
  )

  const today    = new Date().toISOString().split('T')[0]
  const upcoming = filtered.filter(b => b.date >= today)
  const past     = filtered.filter(b => b.date <  today)

  if (!authed) return (
    <>
      <Head><title>Admin — Glen Barber</title></Head>
      <style>{adminCSS}</style>
      <div className="lp">
        <div className="lc">
          <div className="llogo">GB</div>
          <p className="ltitle">Panel de administración</p>
          <p className="lsub">Glen Barber</p>
          <input className="li" type="password" placeholder="Contraseña"
            value={pw} onChange={e=>setPw(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&login()} />
          <button className="lbtn" onClick={login}>Entrar</button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Head><title>Admin — Glen Barber</title></Head>
      <style>{adminCSS}</style>
      <div className="ap">
        <div className="atop">
          <div className="atopL">
            <div className="alogo">GB</div>
            <div>
              <p className="atitle">Reservas</p>
              <p className="asub">Glen Barber</p>
            </div>
          </div>
          <div className="atopR">
            <span className="abadge">{upcoming.length} próximas</span>
            <button className="asbtn" onClick={load}>↻ Actualizar</button>
            <a href="/" className="asbtn">← Volver</a>
          </div>
        </div>

        <div className="astats">
          {[
            ['Total', bookings.length],
            ['Próximas', upcoming.length],
            ['Pasadas', past.length],
          ].map(([l,v])=>(
            <div key={l} className="astat">
              <p className="astatN">{v}</p>
              <p className="astatL">{l}</p>
            </div>
          ))}
        </div>

        <input className="asearch" placeholder="Buscar por nombre o correo…"
          value={filter} onChange={e=>setFilter(e.target.value)} />

        {loading && <p className="ahint">Cargando…</p>}

        {!loading && (<>
          {upcoming.length > 0 && (
            <section>
              <p className="asec">Próximas ({upcoming.length})</p>
              <BookingTable bookings={upcoming} highlight />
            </section>
          )}
          {past.length > 0 && (
            <section style={{marginTop:28}}>
              <p className="asec">Pasadas ({past.length})</p>
              <BookingTable bookings={past} />
            </section>
          )}
          {filtered.length === 0 && <p className="ahint">No hay reservas aún.</p>}
        </>)}
      </div>
    </>
  )
}

function BookingTable({ bookings, highlight }) {
  return (
    <div className="atw">
      <table className="at">
        <thead>
          <tr>{['Fecha','Hora','Nombre','Correo','Teléfono'].map(h=>(
            <th key={h} className="ath">{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {bookings.map(b=>(
            <tr key={b.id} className={highlight ? 'atrH' : 'atr'}>
              <td className="atd">{b.date}</td>
              <td className="atd"><span className="atpill">{b.time}</span></td>
              <td className="atd" style={{fontWeight:600}}>{b.name}</td>
              <td className="atd" style={{color:'#6b7280'}}>{b.email}</td>
              <td className="atd" style={{color:'#9ca3af'}}>{b.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const adminCSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f0f2f5;color:#1a1a2e;-webkit-font-smoothing:antialiased;}
  a{text-decoration:none;color:inherit;}

  .lp{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f0f2f5;}
  .lc{background:#fff;border-radius:20px;box-shadow:0 8px 32px rgba(0,0,0,.10);padding:36px 28px;display:flex;flex-direction:column;align-items:center;gap:12px;width:340px;}
  .llogo{width:56px;height:56px;border-radius:14px;background:#1a1a2e;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#fff;letter-spacing:-1px;}
  .ltitle{font-size:17px;font-weight:700;color:#1a1a2e;}
  .lsub{font-size:13px;color:#9ca3af;margin-top:-6px;}
  .li{font-size:15px;padding:12px 14px;border-radius:10px;border:1.5px solid #e5e7eb;background:#fafafa;color:#1a1a2e;outline:none;width:100%;margin-top:4px;}
  .li:focus{border-color:#1a1a2e;background:#fff;}
  .lbtn{width:100%;padding:13px;border-radius:12px;border:none;background:#1a1a2e;color:#fff;font-size:15px;font-weight:600;cursor:pointer;}
  .lbtn:hover{opacity:.88;}

  .ap{max-width:960px;margin:0 auto;padding:28px 20px;}
  .atop{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px;}
  .atopL{display:flex;align-items:center;gap:12px;}
  .alogo{width:40px;height:40px;border-radius:10px;background:#1a1a2e;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0;}
  .atitle{font-size:18px;font-weight:700;color:#1a1a2e;}
  .asub{font-size:12px;color:#9ca3af;margin-top:1px;}
  .atopR{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
  .abadge{font-size:12px;background:#dcfce7;color:#16a34a;padding:4px 12px;border-radius:20px;font-weight:600;}
  .asbtn{font-size:13px;padding:7px 14px;border:1.5px solid #e5e7eb;border-radius:9px;background:#fff;color:#374151;cursor:pointer;}
  .asbtn:hover{background:#f9fafb;}

  .astats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;}
  .astat{background:#fff;border-radius:14px;padding:16px 18px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.06);}
  .astatN{font-size:24px;font-weight:700;color:#1a1a2e;}
  .astatL{font-size:12px;color:#9ca3af;margin-top:2px;}

  .asearch{font-size:14px;padding:11px 16px;border-radius:10px;border:1.5px solid #e5e7eb;background:#fff;color:#1a1a2e;outline:none;width:100%;margin-bottom:20px;}
  .asearch:focus{border-color:#1a1a2e;}
  .ahint{font-size:14px;color:#9ca3af;text-align:center;margin-top:40px;}
  .asec{font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;}

  .atw{overflow-x:auto;border:1.5px solid #e5e7eb;border-radius:14px;background:#fff;}
  .at{width:100%;border-collapse:collapse;font-size:13px;}
  .ath{text-align:left;padding:11px 16px;font-size:11px;font-weight:700;color:#9ca3af;border-bottom:1px solid #f3f4f6;background:#fafafa;text-transform:uppercase;letter-spacing:.04em;}
  .atd{padding:12px 16px;border-bottom:1px solid #f7f7f7;color:#374151;}
  .atr{background:#fff;}
  .atrH{background:#f0fdf4;}
  .atpill{background:#f0f2f5;border-radius:6px;padding:3px 8px;font-size:12px;font-weight:600;color:#374151;}
  @media(max-width:600px){.astats{grid-template-columns:repeat(3,1fr);}th:nth-child(4),td:nth-child(4),th:nth-child(5),td:nth-child(5){display:none;}}
`
