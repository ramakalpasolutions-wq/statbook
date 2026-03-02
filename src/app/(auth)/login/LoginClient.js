'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Activity, Heart, Shield, Stethoscope, Pill, Microscope, Thermometer, Zap } from 'lucide-react'

export default function LoginClient() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
  e.preventDefault()
  if (!form.email || !form.password) return toast.error('Please fill all fields')
  setLoading(true)
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, password: form.password }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success(`Welcome back, ${data.user.name}!`)
      // Role-based redirect matching your API roles
      const redirectMap = {
        SUPER_ADMIN:    '/super-admin/dashboard',
        HOSPITAL_ADMIN: '/hospital-admin/dashboard',
        DOCTOR:         '/doctor/dashboard',
        USER:           '/user/dashboard',
      }
      router.push(redirectMap[data.role] || '/dashboard')
    } else {
      toast.error(data.error || 'Login failed')
    }
  } catch {
    toast.error('Server error')
  } finally {
    setLoading(false)
  }
}

  const floatingIcons = [
    { Icon: Heart,       top:'8%',  left:'4%',  size:28, delay:'0s',   dur:'6s'  },
    { Icon: Activity,    top:'18%', left:'88%', size:32, delay:'1s',   dur:'7s'  },
    { Icon: Stethoscope, top:'35%', left:'6%',  size:26, delay:'2s',   dur:'8s'  },
    { Icon: Shield,      top:'55%', left:'91%', size:30, delay:'0.5s', dur:'6.5s'},
    { Icon: Pill,        top:'70%', left:'3%',  size:24, delay:'1.5s', dur:'7.5s'},
    { Icon: Microscope,  top:'80%', left:'87%', size:28, delay:'2.5s', dur:'9s'  },
    { Icon: Thermometer, top:'12%', left:'78%', size:22, delay:'3s',   dur:'6s'  },
    { Icon: Zap,         top:'62%', left:'8%',  size:20, delay:'0.8s', dur:'8s'  },
    { Icon: Heart,       top:'45%', left:'93%', size:18, delay:'3.5s', dur:'7s'  },
    { Icon: Activity,    top:'88%', left:'15%', size:26, delay:'1.2s', dur:'6.5s'},
    { Icon: Shield,      top:'25%', left:'2%',  size:20, delay:'4s',   dur:'8.5s'},
    { Icon: Pill,        top:'92%', left:'80%', size:22, delay:'2.2s', dur:'7s'  },
  ]

  const particles = [...Array(22)].map((_,i) => ({
    left:`${(i*4.5+2)%100}%`,
    top:`${(i*7.3+5)%100}%`,
    size: i%3===0 ? 4 : i%3===1 ? 3 : 2,
    delay:`${(i*0.4)%4}s`,
    dur:`${4+(i%4)}s`,
  }))

  return (
    <div className="fixed inset-0 overflow-hidden">
      <style>{`
        @keyframes floatY {
          0%,100% { transform:translateY(0px) rotate(0deg); opacity:0.12; }
          50%      { transform:translateY(-22px) rotate(8deg); opacity:0.28; }
        }
        @keyframes particlePulse {
          0%,100% { transform:scale(1); opacity:0.15; }
          50%      { transform:scale(1.8); opacity:0.45; }
        }
        @keyframes ecgRepeat {
          0%   { stroke-dashoffset:900; opacity:1 }
          60%  { stroke-dashoffset:0;   opacity:1 }
          85%  { stroke-dashoffset:0;   opacity:0 }
          86%  { stroke-dashoffset:900; opacity:0 }
          100% { stroke-dashoffset:900; opacity:1 }
        }
        @keyframes formSlide {
          from { opacity:0; transform:translateX(40px) }
          to   { opacity:1; transform:translateX(0) }
        }
        @keyframes leftSlide {
          from { opacity:0; transform:translateX(-40px) }
          to   { opacity:1; transform:translateX(0) }
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow:0 0 0 0 rgba(99,102,241,0.4) }
          50%      { box-shadow:0 0 0 14px rgba(99,102,241,0) }
        }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes shimmer {
          0%   { background-position:-200% 0 }
          100% { background-position:200% 0 }
        }
        @keyframes blobMove1 {
          0%,100% { transform:translate(0,0) scale(1) }
          33%      { transform:translate(40px,-30px) scale(1.1) }
          66%      { transform:translate(-20px,20px) scale(0.95) }
        }
        @keyframes blobMove2 {
          0%,100% { transform:translate(0,0) scale(1) }
          33%      { transform:translate(-35px,25px) scale(1.05) }
          66%      { transform:translate(30px,-20px) scale(0.9) }
        }
        @keyframes blobMove3 {
          0%,100% { transform:translate(0,0) scale(1) }
          50%      { transform:translate(20px,30px) scale(1.08) }
        }
        @keyframes lineGrow {
          from { opacity:0; background-position:-200% 0 }
          to   { opacity:1; background-position:0 0 }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px) }
          to   { opacity:1; transform:translateY(0) }
        }
        @keyframes mobileFormIn {
          from { opacity:0; transform:translateY(24px) scale(0.98) }
          to   { opacity:1; transform:translateY(0) scale(1) }
        }

        /* ── Responsive input placeholder color ── */
        .stat-input::placeholder { color: rgba(148,163,184,0.35); }
        .stat-input:focus { outline: none; }

        /* ── Scrollable form on very small screens ── */
        @media (max-height: 680px) {
          .form-scroll { overflow-y: auto; max-height: calc(100vh - 40px); }
        }
      `}</style>

      {/* ══ BG GRADIENT ══ */}
      <div className="absolute inset-0" style={{
        background:'linear-gradient(135deg,#0a0f1e 0%,#0d1b3e 30%,#0f2460 55%,#0a1628 80%,#060d1a 100%)',
      }}/>

      {/* ══ BLOBS ══ */}
      <div className="absolute" style={{
        top:'-15%',left:'-10%',width:'55%',height:'55%',
        background:'radial-gradient(ellipse,rgba(99,102,241,0.18) 0%,transparent 70%)',
        animation:'blobMove1 14s ease-in-out infinite',borderRadius:'50%',
      }}/>
      <div className="absolute" style={{
        bottom:'-20%',right:'-12%',width:'60%',height:'60%',
        background:'radial-gradient(ellipse,rgba(6,182,212,0.14) 0%,transparent 70%)',
        animation:'blobMove2 18s ease-in-out infinite',borderRadius:'50%',
      }}/>
      <div className="absolute" style={{
        top:'30%',right:'15%',width:'35%',height:'40%',
        background:'radial-gradient(ellipse,rgba(16,185,129,0.1) 0%,transparent 70%)',
        animation:'blobMove3 12s ease-in-out infinite',borderRadius:'50%',
      }}/>

      {/* ══ GRID ══ */}
      <div className="absolute inset-0" style={{
        backgroundImage:`linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)`,
        backgroundSize:'60px 60px',
      }}/>

      {/* ══ PARTICLES ══ */}
      {particles.map((p,i)=>(
        <div key={i} className="absolute rounded-full" style={{
          left:p.left,top:p.top,width:p.size,height:p.size,
          background:i%3===0?'#6366f1':i%3===1?'#06b6d4':'#10b981',
          animation:`particlePulse ${p.dur} ease-in-out infinite`,
          animationDelay:p.delay,
        }}/>
      ))}

      {/* ══ FLOATING ICONS ══ */}
      {floatingIcons.map(({Icon,top,left,size,delay,dur},i)=>(
        <div key={i} className="absolute" style={{
          top,left,
          animation:`floatY ${dur} ease-in-out infinite`,
          animationDelay:delay,
          color:i%3===0?'rgba(99,102,241,0.28)':i%3===1?'rgba(6,182,212,0.22)':'rgba(16,185,129,0.22)',
          pointerEvents:'none',
        }}>
          <Icon size={size} strokeWidth={1.2}/>
        </div>
      ))}

      {/* ══ MAIN LAYOUT ══ */}
      <div className="absolute inset-0 flex flex-col lg:flex-row" style={{paddingBottom:'40px'}}>

        {/* ── LEFT PANEL (desktop only) ── */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16 relative"
          style={{animation:'leftSlide 0.8s ease-out both'}}>

          {/* Logo */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{
              background:'linear-gradient(135deg,#6366f1,#4f46e5)',
              boxShadow:'0 8px 32px rgba(99,102,241,0.4)',
              animation:'pulseGlow 3s ease-in-out infinite',
            }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="12" y="2" width="4" height="24" rx="2" fill="white"/>
                <rect x="2" y="12" width="24" height="4" rx="2" fill="white"/>
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-white font-black text-3xl tracking-tight">STAT</span>
                <span className="font-black text-3xl tracking-tight" style={{color:'#818cf8'}}>BOOK</span>
              </div>
              <p className="text-xs font-medium tracking-widest uppercase" style={{color:'rgba(148,163,184,0.6)'}}>Healthcare Management</p>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-8">
            <h1 className="font-black text-white leading-tight mb-4"
              style={{fontSize:'clamp(2rem,3.5vw,3.2rem)',letterSpacing:'-0.02em'}}>
              Modern Care,<br/>
              <span style={{
                background:'linear-gradient(90deg,#6366f1,#06b6d4,#10b981)',
                WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
              }}>
                Smarter Tools.
              </span>
            </h1>
            <p className="text-base leading-relaxed" style={{color:'rgba(148,163,184,0.75)'}}>
              The all-in-one platform for hospitals, clinics, and healthcare professionals.
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-3 mb-8">
            {[
              { Icon:Shield,    text:'HIPAA Compliant & Secure',          color:'#6366f1' },
              { Icon:Activity,  text:'Real-time Patient Monitoring',       color:'#06b6d4' },
              { Icon:Zap,       text:'Instant Appointment Scheduling',     color:'#10b981' },
              { Icon:Heart,     text:'Integrated EHR & Billing',           color:'#f472b6' },
            ].map(({Icon,text,color},i)=>(
              <div key={i} className="flex items-center gap-3"
                style={{animation:`fadeUp 0.6s ease-out both`,animationDelay:`${0.2+i*0.12}s`}}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                  background:`${color}18`,color,border:`1px solid ${color}30`,
                }}>
                  <Icon size={15} strokeWidth={2}/>
                </div>
                <span className="text-sm font-medium" style={{color:'rgba(203,213,225,0.8)'}}>{text}</span>
              </div>
            ))}
          </div>

          {/* ECG */}
          <div className="relative" style={{height:52}}>
            <div className="absolute left-0 right-0" style={{top:'50%',height:'1px',background:'rgba(99,102,241,0.12)'}}/>
            <svg width="100%" height="52" viewBox="0 0 500 52" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ecgG" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#6366f1"/>
                  <stop offset="50%"  stopColor="#06b6d4"/>
                  <stop offset="100%" stopColor="#10b981"/>
                </linearGradient>
              </defs>
              <polyline
                points="0,26 40,26 55,26 65,5 75,47 85,26 110,26 150,26 165,26 175,5 185,47 195,26 220,26 260,26 275,26 285,5 295,47 305,26 330,26 370,26 385,26 395,5 405,47 415,26 440,26 500,26"
                fill="none" stroke="url(#ecgG)" strokeWidth="2" strokeLinecap="round"
                strokeDasharray="900" strokeDashoffset="900"
                style={{animation:'ecgRepeat 3.5s ease-in-out infinite'}}/>
            </svg>
            <div className="absolute right-0 bottom-1 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{animation:'particlePulse 1.5s ease-in-out infinite'}}/>
              <span className="text-xs font-mono" style={{color:'rgba(148,163,184,0.5)'}}>LIVE · BPM 72</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              {val:'50K+', label:'Patients', color:'#6366f1'},
              {val:'200+', label:'Doctors',  color:'#06b6d4'},
              {val:'99.9%',label:'Uptime',   color:'#10b981'},
            ].map((s,i)=>(
              <div key={i} className="rounded-2xl p-4 text-center" style={{
                background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.07)',
                backdropFilter:'blur(8px)',
                animation:`fadeUp 0.6s ease-out both`,
                animationDelay:`${0.6+i*0.1}s`,
              }}>
                <div className="text-xl font-black mb-1" style={{color:s.color}}>{s.val}</div>
                <div className="text-xs" style={{color:'rgba(148,163,184,0.55)'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL: FORM ── */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4 lg:py-0 form-scroll"
          style={{animation:'formSlide 0.8s ease-out both'}}>
          <div className="w-full" style={{maxWidth:'440px'}}>

            {/* ── MOBILE HEADER (shown only on mobile) ── */}
            <div className="lg:hidden mb-6" style={{animation:'mobileFormIn 0.6s ease-out both'}}>
              {/* Mobile Logo */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                  background:'linear-gradient(135deg,#6366f1,#4f46e5)',
                  boxShadow:'0 4px 20px rgba(99,102,241,0.4)',
                }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="8.5" y="1" width="3" height="18" rx="1.5" fill="white"/>
                    <rect x="1" y="8.5" width="18" height="3" rx="1.5" fill="white"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-white font-black text-2xl tracking-tight">STAT</span>
                    <span className="font-black text-2xl tracking-tight" style={{color:'#818cf8'}}>BOOK</span>
                  </div>
                </div>
              </div>

              {/* Mobile mini stats */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                {[
                  {val:'50K+', label:'Patients', color:'#6366f1'},
                  {val:'200+', label:'Doctors',  color:'#06b6d4'},
                  {val:'99.9%',label:'Uptime',   color:'#10b981'},
                ].map((s,i)=>(
                  <div key={i} className="rounded-xl p-2.5 text-center" style={{
                    background:'rgba(255,255,255,0.04)',
                    border:'1px solid rgba(255,255,255,0.07)',
                  }}>
                    <div className="text-sm font-black" style={{color:s.color}}>{s.val}</div>
                    <div className="text-xs mt-0.5" style={{color:'rgba(148,163,184,0.5)',fontSize:'10px'}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── FORM CARD ── */}
            <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8" style={{
              background:'rgba(15,22,50,0.88)',
              border:'1px solid rgba(99,102,241,0.2)',
              backdropFilter:'blur(32px)',
              WebkitBackdropFilter:'blur(32px)',
              boxShadow:'0 40px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(99,102,241,0.08),inset 0 1px 0 rgba(255,255,255,0.05)',
              animation:'mobileFormIn 0.7s ease-out both',
            }}>

              {/* Accent top */}
              <div className="h-px mb-6 sm:mb-8 rounded-full" style={{
                background:'linear-gradient(90deg,transparent,#6366f1,#06b6d4,transparent)',
              }}/>

              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-white mb-1.5" style={{letterSpacing:'-0.01em'}}>
                  Sign in
                </h2>
                <p className="text-sm" style={{color:'rgba(148,163,184,0.6)'}}>
                  Welcome back — enter your credentials to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-widest"
                    style={{color:'rgba(148,163,184,0.55)'}}>
                    Email or Phone
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{color:'rgba(99,102,241,0.55)'}}>
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="you@hospital.com"
                      value={form.email}
                      onChange={e => setForm({...form, email:e.target.value})}
                      className="stat-input w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl text-sm text-white transition-all"
                      style={{
                        background:'rgba(255,255,255,0.05)',
                        border:'1px solid rgba(99,102,241,0.2)',
                        fontSize:'clamp(13px,1.5vw,15px)',
                      }}
                      onFocus={e=>{e.target.style.borderColor='rgba(99,102,241,0.6)';e.target.style.background='rgba(99,102,241,0.08)'}}
                      onBlur={e=>{e.target.style.borderColor='rgba(99,102,241,0.2)';e.target.style.background='rgba(255,255,255,0.05)'}}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-widest"
                    style={{color:'rgba(148,163,184,0.55)'}}>
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{color:'rgba(99,102,241,0.55)'}}>
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    </div>
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={form.password}
                      onChange={e => setForm({...form, password:e.target.value})}
                      className="stat-input w-full pl-10 pr-11 py-3 sm:py-3.5 rounded-xl text-sm text-white transition-all"
                      style={{
                        background:'rgba(255,255,255,0.05)',
                        border:'1px solid rgba(99,102,241,0.2)',
                        fontSize:'clamp(13px,1.5vw,15px)',
                      }}
                      onFocus={e=>{e.target.style.borderColor='rgba(99,102,241,0.6)';e.target.style.background='rgba(99,102,241,0.08)'}}
                      onBlur={e=>{e.target.style.borderColor='rgba(99,102,241,0.2)';e.target.style.background='rgba(255,255,255,0.05)'}}
                    />
                    <button type="button" onClick={()=>setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                      style={{color:'rgba(148,163,184,0.45)'}}>
                      {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </div>

                {/* Forgot */}
                <div className="flex justify-end">
                  <a href="/forgot-password"
                    className="text-xs font-semibold transition-colors"
                    style={{color:'rgba(99,102,241,0.75)'}}>
                    Forgot password?
                  </a>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="w-full rounded-xl font-bold text-white text-sm transition-all relative overflow-hidden"
                  style={{
                    padding:'clamp(10px,2vh,14px) 24px',
                    background:loading
                      ? 'rgba(99,102,241,0.3)'
                      : 'linear-gradient(135deg,#6366f1 0%,#4f46e5 50%,#4338ca 100%)',
                    boxShadow:loading ? 'none' : '0 8px 32px rgba(99,102,241,0.4),inset 0 1px 0 rgba(255,255,255,0.15)',
                  }}>
                  {!loading && (
                    <div className="absolute inset-0 rounded-xl" style={{
                      background:'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.1) 50%,transparent 100%)',
                      backgroundSize:'200% 100%',
                      animation:'shimmer 3s linear infinite',
                    }}/>
                  )}
                  {loading ? (
                    <span className="flex items-center justify-center gap-2 relative z-10">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                        style={{animation:'spin 0.7s linear infinite'}}/>
                      Signing in...
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Sign In to STAT BOOK
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{background:'rgba(255,255,255,0.06)'}}/>
                <span className="text-xs whitespace-nowrap" style={{color:'rgba(148,163,184,0.35)'}}>
                  Don't have an account?
                </span>
                <div className="flex-1 h-px" style={{background:'rgba(255,255,255,0.06)'}}/>
              </div>

              {/* Register */}
              <a href="/register"
                className="flex items-center justify-center gap-2 w-full rounded-xl font-semibold text-sm transition-all"
                style={{
                  padding:'clamp(10px,1.8vh,13px) 24px',
                  border:'1px solid rgba(99,102,241,0.28)',
                  color:'rgba(129,140,248,0.85)',
                  background:'rgba(99,102,241,0.06)',
                }}>
                Create an account
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4v16m8-8H4"/>
                </svg>
              </a>

              {/* Bottom accent */}
              <div className="h-px mt-6 rounded-full" style={{
                background:'linear-gradient(90deg,transparent,rgba(6,182,212,0.35),transparent)',
              }}/>

              <p className="text-center mt-4" style={{fontSize:'11px',color:'rgba(100,116,139,0.55)',lineHeight:'1.6'}}>
                🔒 256-bit SSL · SOC 2 Type II · HIPAA Compliant
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 flex-wrap">
              {['ISO 27001','NABH','HL7 FHIR'].map((b,i)=>(
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{
                    background:i===0?'#6366f1':i===1?'#06b6d4':'#10b981'
                  }}/>
                  <span style={{fontSize:'11px',color:'rgba(100,116,139,0.6)',fontWeight:500}}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ BOTTOM STATUS BAR ══ */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 sm:px-8"
        style={{height:'40px',background:'rgba(10,15,30,0.96)',borderTop:'1px solid rgba(99,102,241,0.1)'}}>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            style={{animation:'particlePulse 2s ease-in-out infinite'}}/>
          <span className="text-xs font-mono hidden sm:inline" style={{color:'rgba(100,116,139,0.6)'}}>
            All systems operational
          </span>
          <span className="text-xs font-mono sm:hidden" style={{color:'rgba(100,116,139,0.6)'}}>
            Online
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <span className="text-xs font-mono hidden sm:inline" style={{color:'rgba(100,116,139,0.45)'}}>v2.4.1</span>
          <span className="text-xs" style={{color:'rgba(100,116,139,0.45)'}}>© 2026 STAT BOOK</span>
        </div>
      </div>
    </div>
  )
}
