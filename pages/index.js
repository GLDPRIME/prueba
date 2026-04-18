import { useState, useEffect } from 'react'
import Head from 'next/head'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS_SHORT = ['Do','Lu','Ma','Mi','Ju','Vi','Sá']

// ── CONFIGURACIÓN ─────────────────────────────────────────────────────────────
const CONFIG = {
  hostName:     'Velvet',
  hostInitials: 'VE',
  tagline:      'Barbería profesional',
  address:      'Diagonal Paraguay 291, Santiago',
  hours:        'Lun–Sáb · 9:00 – 21:00',
  accentColor:  '#1a1a2e',
  profesionales: [
    { id: 1, nombre: 'Geremi',    iniciales: 'GE', color: '#4f46e5' },
    { id: 2, nombre: 'Alejandro', iniciales: 'AL', color: '#0891b2' },
    { id: 3, nombre: 'Oswaldo',   iniciales: 'OS', color: '#059669' },
  ],
  servicios: [
    { id: 1, nombre: 'Corte de pelo clásico', precio: 14000, duracion: '45 min' },
    { id: 2, nombre: 'Corte y barba',         precio: 18000, duracion: '60 min' },
    { id: 3, nombre: 'Platinado',             precio: 20000, duracion: '90 min' },
  ],
  slots: {
    1: ['09:00','09:45','10:30','11:15','12:00','12:45','14:00','14:45','15:30','16:15','17:00','17:45','18:30','19:15','20:00','20:45'],
    2: ['09:00','09:45','10:30','11:15','12:00','12:45','14:00','14:45','15:30','16:15','17:00','17:45','18:30','19:15','20:00','20:45'],
    3: ['09:00','09:45','10:30','11:15','12:00','12:45','14:00','14:45','15:30','16:15','17:00','17:45','18:30','19:15','20:00','20:45'],
    4: ['09:00','09:45','10:30','11:15','12:00','12:45','14:00','14:45','15:30','16:15','17:00','17:45','18:30','19:15','20:00','20:45'],
    5: ['09:00','09:45','10:30','11:15','12:00','12:45','14:00','14:45','15:30','16:15','17:00','17:45','18:30','19:15','20:00','20:45'],
    6: ['09:00','09:45','10:30','11:15','12:00','12:45','14:00','14:45','15:30','16:15','17:00','17:45','18:30','19:15','20:00','20:45'],
  }
}
// ─────────────────────────────────────────────────────────────────────────────

const fmt = n => `$${n.toLocaleString('es-CL')}`

export default function Home() {
  const today = new Date(); today.setHours(0,0,0,0)
  const [step,        setStep]        = useState(1)
  const [selProf,     setSelProf]     = useState(null)
  const [selServicio, setSelServicio] = useState(null)
  const [viewDate,    setViewDate]    = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selDate,     setSelDate]     = useState(null)
  const [selTime,     setSelTime]     = useState(null)
  const [form,        setForm]        = useState({ name:'', email:'', notes:'' })
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [booking,     setBooking]     = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])

  useEffect(() => {
    if (!selDate) return
    const dateStr = selDate.toISOString().split('T')[0]
    fetch(`/api/booked-slots?date=${dateStr}`)
      .then(r => r.json())
      .then(d => setBookedSlots(d.times || []))
  }, [selDate])

  const yr = viewDate.getFullYear(), mo = viewDate.getMonth()
  const firstDow    = new Date(yr, mo, 1).getDay()
  const daysInMonth = new Date(yr, mo + 1, 0).getDate()
  const calDays = []
  for (let i = 0; i < firstDow; i++) calDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d)

  const slots = selDate ? (CONFIG.slots[selDate.getDay()] || []) : []

  async function confirm() {
    if (!form.name || !form.email) { setError('Completa tu nombre y correo.'); return }
    setError(''); setLoading(true)
    const dateStr = selDate.toISOString().split('T')[0]
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        date: dateStr,
        time: selTime,
        profesional: selProf.nombre,
        servicio: selServicio.nombre,
        precio: selServicio.precio,
      })
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Error al guardar'); return }
    setBooking(data.booking)
    setStep(5)
  }

  function reset() {
    setStep(1); setSelProf(null); setSelServicio(null)
    setSelDate(null); setSelTime(null)
    setForm({ name:'', email:'', notes:'' }); setBooking(null); setError('')
  }

  const dateLabel = selDate
    ? selDate.toLocaleDateString('es-CL', { weekday:'long', day:'numeric', month:'long' })
    : ''
  const dateLabelCap = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)
  const AC = CONFIG.accentColor
  const STEPS = ['Profesional','Servicio','Fecha y hora','Tus datos','Confirmado']

  return (
    <>
      <Head>
        <title>Reserva — {CONFIG.hostName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f0f2f5;color:#1a1a2e;-webkit-font-smoothing:antialiased;}
        button{font-family:inherit;cursor:pointer;}
        input{font-family:inherit;}

        .pw{min-height:100vh;background:#f0f2f5;display:flex;flex-direction:column;align-items:center;}
        .bh{width:100%;background:${AC};}
        .bhi{max-width:520px;margin:0 auto;padding:28px 20px 24px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;}
        .blogo{width:68px;height:68px;border-radius:16px;background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#fff;letter-spacing:-1px;}
        .bname{font-size:22px;font-weight:700;color:#fff;}
        .btag{font-size:13px;color:rgba(255,255,255,.6);}
        .bmeta{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-top:4px;}
        .bmi{display:flex;align-items:center;gap:5px;font-size:12px;color:rgba(255,255,255,.65);}
        .bc{width:100%;max-width:520px;background:#fff;border-radius:0 0 20px 20px;box-shadow:0 8px 32px rgba(0,0,0,.10);overflow:hidden;margin-bottom:32px;}

        /* stepper */
        .stp{display:flex;align-items:flex-start;padding:14px 12px;border-bottom:1px solid #f3f4f6;overflow-x:auto;}
        .si{display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;min-width:0;}
        .sc{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;flex-shrink:0;}
        .sc.active{background:${AC};color:#fff;}
        .sc.done{background:#dcfce7;color:#16a34a;}
        .sc.pending{background:#f3f4f6;color:#9ca3af;}
        .sl{font-size:10px;font-weight:500;color:#9ca3af;text-align:center;white-space:nowrap;}
        .sl.active{color:${AC};}
        .sl.done{color:#16a34a;}
        .scon{flex:1;height:1px;background:#e5e7eb;margin:12px 3px 0;flex-shrink:0;}
        .scon.done{background:#16a34a;}

        .stitle{font-size:15px;font-weight:600;color:#1a1a2e;padding:20px 20px 4px;}
        .ssub{font-size:13px;color:#6b7280;padding:0 20px 16px;}

        /* profesionales */
        .prof-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0 20px 20px;}
        .prof-card{border:1.5px solid #e5e7eb;border-radius:14px;padding:16px 10px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;transition:all .15s;background:#fff;}
        .prof-card:hover{border-color:${AC};background:#f8f9ff;}
        .prof-card.sel{border-color:${AC};background:#f0f1ff;box-shadow:0 0 0 3px rgba(26,26,46,.08);}
        .prof-avatar{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;color:#fff;}
        .prof-name{font-size:13px;font-weight:600;color:#1a1a2e;text-align:center;}

        /* servicios */
        .serv-list{display:flex;flex-direction:column;gap:10px;padding:0 20px 20px;}
        .serv-card{border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:all .15s;background:#fff;}
        .serv-card:hover{border-color:${AC};background:#f8f9ff;}
        .serv-card.sel{border-color:${AC};background:#f0f1ff;box-shadow:0 0 0 3px rgba(26,26,46,.08);}
        .serv-left{display:flex;flex-direction:column;gap:4px;}
        .serv-nombre{font-size:14px;font-weight:600;color:#1a1a2e;}
        .serv-dur{font-size:12px;color:#9ca3af;display:flex;align-items:center;gap:4px;}
        .serv-precio{font-size:16px;font-weight:700;color:${AC};}
        .serv-check{width:22px;height:22px;border-radius:50%;border:1.5px solid #e5e7eb;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;}
        .serv-card.sel .serv-check{background:${AC};border-color:${AC};}

        /* resumen */
        .resumen{margin:0 20px 14px;background:#f8f9ff;border:1px solid #e0e2f0;border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:5px;}
        .res-row{display:flex;align-items:center;gap:8px;font-size:13px;color:#374151;}
        .res-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}

        /* calendario */
        .cnav{display:flex;align-items:center;justify-content:space-between;padding:0 20px 10px;}
        .cmonth{font-size:15px;font-weight:600;}
        .nbtn{width:34px;height:34px;border-radius:10px;border:1px solid #e5e7eb;background:#fff;font-size:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;}
        .nbtn:hover{background:#f9fafb;}
        .cgrid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;padding:0 14px 14px;}
        .dow{text-align:center;font-size:11px;font-weight:600;color:#9ca3af;padding:4px 0 8px;text-transform:uppercase;}
        .db{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:13px;border-radius:50%;border:none;background:none;color:#c4c7cc;cursor:default;transition:all .15s;}
        .db.av{color:#1a1a2e;font-weight:500;cursor:pointer;}
        .db.av:hover{background:#f3f4f6;}
        .db.sel{background:${AC} !important;color:#fff !important;font-weight:700;}
        .db.tod{box-shadow:inset 0 0 0 1.5px ${AC};}
        .db:disabled{opacity:.3;}
        .ts{border-top:1px solid #f3f4f6;padding:14px 20px 4px;}
        .tdl{font-size:13px;font-weight:600;color:#374151;margin-bottom:10px;display:flex;align-items:center;gap:6px;}
        .tg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;}
        @media(min-width:380px){.tg{grid-template-columns:repeat(4,1fr);}}
        .tb{border:1.5px solid #e5e7eb;border-radius:10px;padding:9px 4px;font-size:13px;font-weight:500;background:#fff;color:#374151;cursor:pointer;text-align:center;transition:all .15s;}
        .tb:hover:not(.bk):not(.tsel){border-color:${AC};color:${AC};background:#f8f9ff;}
        .tsel{background:${AC};border-color:${AC};color:#fff;}
        .bk{opacity:.35;cursor:not-allowed;text-decoration:line-through;background:#f9fafb;}

        /* botones */
        .br{padding:14px 20px;display:flex;justify-content:space-between;gap:10px;border-top:1px solid #f3f4f6;}
        .bp{flex:1;padding:13px 20px;border-radius:12px;border:none;background:${AC};color:#fff;font-size:14px;font-weight:600;cursor:pointer;transition:opacity .15s,transform .1s;}
        .bp:hover:not(:disabled){opacity:.88;}
        .bp:active:not(:disabled){transform:scale(.98);}
        .bp:disabled{opacity:.4;cursor:not-allowed;}
        .bs{padding:13px 20px;border-radius:12px;border:1.5px solid #e5e7eb;background:#fff;color:#374151;font-size:14px;font-weight:500;cursor:pointer;}
        .bs:hover{background:#f9fafb;}

        /* formulario */
        .fa{padding:18px 20px;display:flex;flex-direction:column;gap:14px;}
        .pill{display:flex;align-items:center;gap:8px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:10px 14px;font-size:13px;color:#0369a1;font-weight:500;flex-wrap:wrap;line-height:1.5;}
        .fg{display:flex;flex-direction:column;gap:5px;}
        .fl{font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.05em;}
        .fi{font-size:15px;padding:12px 14px;border-radius:10px;border:1.5px solid #e5e7eb;background:#fafafa;color:#1a1a2e;outline:none;transition:border-color .15s;width:100%;}
        .fi:focus{border-color:${AC};background:#fff;}
        .err{font-size:13px;color:#dc2626;background:#fef2f2;border-radius:8px;padding:10px 14px;}

        /* confirmación */
        .cw{display:flex;flex-direction:column;align-items:center;gap:12px;padding:32px 20px 28px;text-align:center;}
        .chk{width:64px;height:64px;border-radius:50%;background:#dcfce7;display:flex;align-items:center;justify-content:center;}
        .ct{font-size:20px;font-weight:700;}
        .cs{font-size:14px;color:#6b7280;max-width:280px;line-height:1.6;}
        .cc{width:100%;border:1.5px solid #e5e7eb;border-radius:14px;overflow:hidden;margin-top:4px;}
        .cr{display:flex;justify-content:space-between;align-items:center;padding:11px 16px;font-size:14px;border-bottom:1px solid #f3f4f6;}
        .cr:last-child{border-bottom:none;}
        .ck{color:#6b7280;}
        .cv{font-weight:600;color:#1a1a2e;text-align:right;max-width:60%;word-break:break-word;}
        .ft{font-size:12px;color:#9ca3af;text-align:center;padding:0 0 28px;}
      `}</style>

      <div className="pw">
        <header className="bh">
          <div className="bhi">
            <div className="blogo">{CONFIG.hostInitials}</div>
            <p className="bname">{CONFIG.hostName}</p>
            <p className="btag">{CONFIG.tagline}</p>
            <div className="bmeta">
              <span className="bmi"><IcoPin />{CONFIG.address}</span>
              <span className="bmi"><IcoClock />{CONFIG.hours}</span>
            </div>
          </div>
        </header>

        <div className="bc">

          {/* STEPPER */}
          <div className="stp">
            {STEPS.map((label, i) => {
              const n = i + 1
              const isActive = step === n
              const isDone   = step > n
              return (
                <div key={label} style={{display:'flex',alignItems:'flex-start',flex:1,minWidth:0}}>
                  <div className="si">
                    <div className={`sc ${isActive?'active':isDone?'done':'pending'}`}>
                      {isDone ? <IcoCheck/> : n}
                    </div>
                    <span className={`sl ${isActive?'active':isDone?'done':''}`}>{label}</span>
                  </div>
                  {i < STEPS.length-1 && <div className={`scon ${isDone?'done':''}`}/>}
                </div>
              )
            })}
          </div>

          {/* ── STEP 1: Profesional ── */}
          {step === 1 && (<>
            <p className="stitle">¿Con quién quieres atenderte?</p>
            <p className="ssub">Elige tu profesional</p>
            <div className="prof-grid">
              {CONFIG.profesionales.map(p => (
                <div key={p.id}
                  className={`prof-card ${selProf?.id===p.id?'sel':''}`}
                  onClick={() => setSelProf(p)}>
                  <div className="prof-avatar" style={{background:p.color}}>{p.iniciales}</div>
                  <span className="prof-name">{p.nombre}</span>
                </div>
              ))}
            </div>
            <div className="br" style={{justifyContent:'flex-end'}}>
              <button className="bp" disabled={!selProf} onClick={() => setStep(2)}>Continuar →</button>
            </div>
          </>)}

          {/* ── STEP 2: Servicio ── */}
          {step === 2 && (<>
            <p className="stitle">¿Qué servicio necesitas?</p>
            <p className="ssub">Con {selProf?.nombre}</p>
            <div className="serv-list">
              {CONFIG.servicios.map(s => (
                <div key={s.id}
                  className={`serv-card ${selServicio?.id===s.id?'sel':''}`}
                  onClick={() => setSelServicio(s)}>
                  <div className="serv-left">
                    <span className="serv-nombre">{s.nombre}</span>
                    <span className="serv-dur"><IcoClock /> {s.duracion}</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <span className="serv-precio">{fmt(s.precio)}</span>
                    <div className="serv-check">
                      {selServicio?.id===s.id && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="br">
              <button className="bs" onClick={() => setStep(1)}>← Atrás</button>
              <button className="bp" disabled={!selServicio} onClick={() => setStep(3)}>Continuar →</button>
            </div>
          </>)}

          {/* ── STEP 3: Fecha y hora ── */}
          {step === 3 && (<>
            <p className="stitle">Selecciona fecha y hora</p>
            <div className="resumen">
              <div className="res-row">
                <div className="res-dot" style={{background:selProf?.color}}></div>
                <span><strong>{selProf?.nombre}</strong> · {selServicio?.nombre}</span>
              </div>
              <div className="res-row">
                <div className="res-dot" style={{background:'#9ca3af'}}></div>
                <span style={{color:'#059669',fontWeight:600}}>{fmt(selServicio?.precio)}</span>
                <span style={{color:'#9ca3af'}}>· {selServicio?.duracion}</span>
              </div>
            </div>

            <div className="cnav">
              <button className="nbtn" onClick={() => setViewDate(new Date(yr,mo-1,1))}>‹</button>
              <span className="cmonth">{MONTHS[mo]} {yr}</span>
              <button className="nbtn" onClick={() => setViewDate(new Date(yr,mo+1,1))}>›</button>
            </div>

            <div className="cgrid">
              {DAYS_SHORT.map(d => <div key={d} className="dow">{d}</div>)}
              {calDays.map((d, i) => {
                if (!d) return <div key={`e${i}`}/>
                const dt = new Date(yr, mo, d)
                const isPast = dt < today
                const dow = dt.getDay()
                const isAvail = !isPast && dow !== 0 && !!CONFIG.slots[dow]
                const isSel   = selDate && dt.toDateString()===selDate.toDateString()
                const isToday = dt.toDateString()===today.toDateString()
                let cls = 'db'
                if (isAvail && !isSel) cls += ' av'
                if (isSel) cls += ' sel'
                if (isToday && !isSel) cls += ' tod'
                return (
                  <button key={d} className={cls} disabled={!isAvail}
                    onClick={() => { setSelDate(dt); setSelTime(null); setBookedSlots([]) }}>
                    {d}
                  </button>
                )
              })}
            </div>

            {selDate && (
              <div className="ts">
                <p className="tdl"><IcoCal />{dateLabelCap}</p>
                {slots.length === 0
                  ? <p style={{fontSize:13,color:'#9ca3af',marginBottom:14}}>Sin horarios disponibles</p>
                  : <div className="tg">
                      {slots.map(t => {
                        const isBooked = bookedSlots.includes(t)
                        const isSel = selTime===t
                        let cls = 'tb'
                        if (isSel) cls += ' tsel'
                        if (isBooked) cls += ' bk'
                        return (
                          <button key={t} className={cls} disabled={isBooked}
                            onClick={() => !isBooked && setSelTime(t)}>{t}</button>
                        )
                      })}
                    </div>
                }
              </div>
            )}

            <div className="br">
              <button className="bs" onClick={() => setStep(2)}>← Atrás</button>
              <button className="bp" disabled={!selTime} onClick={() => setStep(4)}>Continuar →</button>
            </div>
          </>)}

          {/* ── STEP 4: Datos ── */}
          {step === 4 && (<>
            <p className="stitle">Tus datos de contacto</p>
            <div className="fa">
              <div className="pill">
                <IcoCal />
                {dateLabelCap} · {selTime} · {selProf?.nombre} · {selServicio?.nombre} · {fmt(selServicio?.precio)}
              </div>
              <div className="fg">
                <label className="fl">Nombre completo *</label>
                <input className="fi" value={form.name}
                  onChange={e => setForm({...form,name:e.target.value})}
                  placeholder="Tu nombre"/>
              </div>
              <div className="fg">
                <label className="fl">Correo electrónico *</label>
                <input className="fi" type="email" value={form.email}
                  onChange={e => setForm({...form,email:e.target.value})}
                  placeholder="tu@correo.com"/>
              </div>
              <div className="fg">
                <label className="fl">Teléfono (opcional)</label>
                <input className="fi" value={form.notes}
                  onChange={e => setForm({...form,notes:e.target.value})}
                  placeholder="+56 9 1234 5678"/>
              </div>
              {error && <p className="err">{error}</p>}
            </div>
            <div className="br">
              <button className="bs" onClick={() => setStep(3)}>← Atrás</button>
              <button className="bp" disabled={loading} onClick={confirm}>
                {loading ? 'Guardando…' : 'Confirmar cita'}
              </button>
            </div>
          </>)}

          {/* ── STEP 5: Confirmación ── */}
          {step === 5 && (
            <div className="cw">
              <div className="chk">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L19 7" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="ct">¡Reserva confirmada!</p>
              <p className="cs">Te esperamos en {CONFIG.hostName}. ¡Hasta pronto!</p>
              <div className="cc">
                {[
                  ['Profesional', selProf?.nombre],
                  ['Servicio',    selServicio?.nombre],
                  ['Precio',      fmt(selServicio?.precio)],
                  ['Fecha',       booking?.date],
                  ['Hora',        booking?.time],
                  ['Nombre',      booking?.name],
                  ['Correo',      booking?.email],
                ].map(([k,v]) => (
                  <div key={k} className="cr">
                    <span className="ck">{k}</span>
                    <span className="cv">{v}</span>
                  </div>
                ))}
              </div>
              <button className="bs" style={{marginTop:8}} onClick={reset}>Agendar otra cita</button>
            </div>
          )}

        </div>
        <p className="ft">© {CONFIG.hostName} · <a href="/admin" style={{color:'#9ca3af'}}>Admin</a></p>
      </div>
    </>
  )
}

function IcoPin()   { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}><path d="M8 1.5a4.5 4.5 0 0 1 4.5 4.5c0 3-4.5 8.5-4.5 8.5S3.5 9 3.5 6A4.5 4.5 0 0 1 8 1.5z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="6" r="1.5" fill="currentColor"/></svg> }
function IcoClock() { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 4.5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function IcoCal()   { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}><rect x="1.5" y="2.5" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M1.5 6.5h13" stroke="currentColor" strokeWidth="1.3"/><path d="M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function IcoCheck() { return <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> }
