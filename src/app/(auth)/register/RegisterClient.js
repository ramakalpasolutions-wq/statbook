'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Activity, Heart, Shield, Stethoscope, Pill, Microscope, Thermometer, Zap, User, Phone, Mail, Lock, Building2, ChevronDown } from 'lucide-react'

export default function RegisterClient() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    role: '', organization: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const roles = [
    { value:'doctor',       label:'Doctor' },
    { value:'nurse',        label:'Nurse' },
    { value:'paramedic',    label:'Paramedic' },
    { value:'receptionist', label:'Receptionist' },
    { value:'pharmacist',   label:'Pharmacist' },
    { value:'lab_tech',     label:'Lab Technician' },
    { value:'admin',        label:'Administrator' },
    { value:'patient',      label:'Patient' },
  ]

  const handleNext = () => {
    if (!form.name.trim())  return toast.error('Full name is required')
    if (!form.email.trim() && !form.phone.trim()) return toast.error('Email or phone is required')
    if (!form.role)         return toast.error('Please select your role')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.password)                         return toast.error('Password is required')
    if (form.password.length < 8)               return toast.error('Password must be at least 8 characters')
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Account created! Please sign in.')
        router.push('/auth/login')
      } else {
        toast.error(data.error || 'Registration failed')
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
  ]

  const particles = [...Array(20)].map((_,i) => ({
    left:`${(i*4.5+2)%100}%`, top:`${(i*7.3+5)%100}%`,
    size: i%3===0?4:i%3===1?3:2,
    delay:`${(i*0.4)%4}s`, dur:`${4+(i%4)}s`,
  }))

  const inputStyle = {
    background:'rgba(255,255,255,0.05)',
    border:'1px solid rgba(99,102,241,0.2)',
    color:'white', fontSize:'clamp(13px,1.5vw,15px)',
  }
  const focusIn  = e => { e.target.style.borderColor='rgba(99,102,241,0.6)'; e.target.style.background='rgba(99,102,241,0.08)' }
  const focusOut = e => { e.target.style.borderColor='rgba(99,102,241,0.2)'; e.target.style.background='rgba(255,255,255,0.05)' }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <style>{`
        @keyframes floatY       { 0%,100%{transform:translateY(0) rotate(0deg);opacity:.12} 50%{transform:translateY(-22px) rotate(8deg);opacity:.28} }
        @keyframes particlePulse{ 0%,100%{transform:scale(1);opacity:.15} 50%{transform:scale(1.8);opacity:.45} }
        @keyframes blobMove1    { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.1)} 66%{transform:translate(-20px,20px) scale(.95)} }
        @keyframes blobMove2    { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-35px,25px) scale(1.05)} 66%{transform:translate(30px,-20px) scale(.9)} }
        @keyframes blobMove3    { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,30px) scale(1.08)} }
        @keyframes formIn       { from{opacity:0;transform:translateY(24px) scale(.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes fadeUp       { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin         { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes shimmer      { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes slideRight   { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideLeft    { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulseGlow    { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.4)} 50%{box-shadow:0 0 0 14px rgba(99,102,241,0)} }
        .stat-input::placeholder{ color:rgba(148,163,184,.35) }
        .stat-input:focus       { outline:none }
        .stat-select            { appearance:none; -webkit-appearance:none }
        .stat-select option     { background:#0f1632; color:white }
        @media (max-height:700px){ .form-scroll{ overflow-y:auto; max-height:calc(100vh - 40px) } }
      `}</style>

      {/* BG */}
      <div className="absolute inset-0" style={{background:'linear-gradient(135deg,#0a0f1e 0%,#0d1b3e 30%,#0f2460 55%,#0a1628 80%,#060d1a 100%)'}}/>
      <div className="absolute" style={{top:'-15%',left:'-10%',width:'55%',height:'55%',background:'radial-gradient(ellipse,rgba(99,102,241,.18) 0%,transparent 70%)',animation:'blobMove1 14s ease-in-out infinite',borderRadius:'50%'}}/>
      <div className="absolute" style={{bottom:'-20%',right:'-12%',width:'60%',height:'60%',background:'radial-gradient(ellipse,rgba(6,182,212,.14) 0%,transparent 70%)',animation:'blobMove2 18s ease-in-out infinite',borderRadius:'50%'}}/>
      <div className="absolute" style={{top:'30%',right:'15%',width:'35%',height:'40%',background:'radial-gradient(ellipse,rgba(16,185,129,.1) 0%,transparent 70%)',animation:'blobMove3 12s ease-in-out infinite',borderRadius:'50%'}}/>
      <div className="absolute inset-0" style={{backgroundImage:`linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px)`,backgroundSize:'60px 60px'}}/>

      {/* Particles */}
      {particles.map((p,i)=>(
        <div key={i} className="absolute rounded-full" style={{left:p.left,top:p.top,width:p.size,height:p.size,background:i%3===0?'#6366f1':i%3===1?'#06b6d4':'#10b981',animation:`particlePulse ${p.dur} ease-in-out infinite`,animationDelay:p.delay}}/>
      ))}

      {/* Floating icons */}
      {floatingIcons.map(({Icon,top,left,size,delay,dur},i)=>(
        <div key={i} className="absolute" style={{top,left,animation:`floatY ${dur} ease-in-out infinite`,animationDelay:delay,color:i%3===0?'rgba(99,102,241,.28)':i%3===1?'rgba(6,182,212,.22)':'rgba(16,185,129,.22)',pointerEvents:'none'}}>
          <Icon size={size} strokeWidth={1.2}/>
        </div>
      ))}

      {/* Layout */}
      <div className="absolute inset-0 flex flex-col lg:flex-row" style={{paddingBottom:'40px'}}>

        {/* Left panel */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">

          <div className="flex items-center gap-4 mb-10" style={{animation:'fadeUp .6s ease-out both'}}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#6366f1,#4f46e5)',boxShadow:'0 8px 32px rgba(99,102,241,.4)',animation:'pulseGlow 3s ease-in-out infinite'}}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="12" y="2" width="4" height="24" rx="2" fill="white"/><rect x="2" y="12" width="24" height="4" rx="2" fill="white"/></svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-white font-black text-3xl tracking-tight">STAT</span>
                <span className="font-black text-3xl tracking-tight" style={{color:'#818cf8'}}>BOOK</span>
              </div>
              <p className="text-xs font-medium tracking-widest uppercase" style={{color:'rgba(148,163,184,.6)'}}>Healthcare Management</p>
            </div>
          </div>

          <div className="mb-8" style={{animation:'fadeUp .7s ease-out both'}}>
            <h1 className="font-black text-white leading-tight mb-4" style={{fontSize:'clamp(2rem,3.2vw,3rem)',letterSpacing:'-.02em'}}>
              Join thousands of<br/>
              <span style={{background:'linear-gradient(90deg,#6366f1,#06b6d4,#10b981)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
                healthcare heroes.
              </span>
            </h1>
            <p className="text-base leading-relaxed" style={{color:'rgba(148,163,184,.75)'}}>
              Create your account and get instant access to patient records, appointments, billing, and more.
            </p>
          </div>

          {/* Steps guide */}
          <div className="flex flex-col gap-4 mb-8">
            {[
              { n:'01', title:'Basic Information',   desc:'Name, contact & role',       color:'#6366f1', active: step===1 },
              { n:'02', title:'Set Your Password',   desc:'Secure your account',        color:'#06b6d4', active: step===2 },
              { n:'03', title:'Start Using STATBOOK', desc:'Full platform access',       color:'#10b981', active: false   },
            ].map((s,i)=>(
              <div key={i} className="flex items-center gap-4" style={{animation:`fadeUp .6s ease-out both`,animationDelay:`${.2+i*.12}s`,opacity: s.active||i<step-1?1:0.4,transition:'opacity .3s'}}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0" style={{
                  background: s.active||i<step-1 ? `${s.color}22` : 'rgba(255,255,255,.05)',
                  border:`1px solid ${s.active||i<step-1?s.color+'50':'rgba(255,255,255,.08)'}`,
                  color: s.active||i<step-1 ? s.color : 'rgba(148,163,184,.4)',
                }}>
                  {i < step-1 ? '✓' : s.n}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{color: s.active ? 'white' : i<step-1?'rgba(203,213,225,.7)':'rgba(148,163,184,.4)'}}>{s.title}</p>
                  <p className="text-xs" style={{color:'rgba(100,116,139,.6)'}}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Security note */}
          <div className="rounded-2xl p-4 flex items-start gap-3" style={{background:'rgba(16,185,129,.08)',border:'1px solid rgba(16,185,129,.2)'}}>
            <Shield size={18} style={{color:'#10b981',flexShrink:0,marginTop:2}}/>
            <div>
              <p className="text-xs font-bold mb-1" style={{color:'#10b981'}}>Your data is protected</p>
              <p className="text-xs leading-relaxed" style={{color:'rgba(148,163,184,.6)'}}>All information is encrypted with AES-256 and stored in compliance with HIPAA regulations.</p>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4 lg:py-0 form-scroll">
          <div className="w-full" style={{maxWidth:'440px'}}>

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#6366f1,#4f46e5)',boxShadow:'0 4px 20px rgba(99,102,241,.4)'}}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="8.5" y="1" width="3" height="18" rx="1.5" fill="white"/><rect x="1" y="8.5" width="18" height="3" rx="1.5" fill="white"/></svg>
              </div>
              <span className="text-white font-black text-2xl tracking-tight">STAT<span style={{color:'#818cf8'}}>BOOK</span></span>
            </div>

            {/* Progress bar */}
            <div className="mb-4 px-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{color:'rgba(148,163,184,.6)'}}>Step {step} of 2</span>
                <span className="text-xs" style={{color:'rgba(99,102,241,.8)'}}>{step===1?'Basic Info':'Set Password'}</span>
              </div>
              <div className="h-1 rounded-full" style={{background:'rgba(99,102,241,.15)'}}>
                <div className="h-1 rounded-full transition-all duration-500" style={{
                  width: step===1?'50%':'100%',
                  background:'linear-gradient(90deg,#6366f1,#06b6d4)',
                }}/>
              </div>
            </div>

            {/* Card */}
            <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8" style={{
              background:'rgba(15,22,50,.88)',
              border:'1px solid rgba(99,102,241,.2)',
              backdropFilter:'blur(32px)',
              WebkitBackdropFilter:'blur(32px)',
              boxShadow:'0 40px 80px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.05)',
              animation:'formIn .7s ease-out both',
            }}>
              <div className="h-px mb-6 rounded-full" style={{background:'linear-gradient(90deg,transparent,#6366f1,#06b6d4,transparent)'}}/>

              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-white mb-1.5" style={{letterSpacing:'-.01em'}}>
                  {step===1 ? 'Create account' : 'Secure your account'}
                </h2>
                <p className="text-sm" style={{color:'rgba(148,163,184,.6)'}}>
                  {step===1 ? 'Fill in your basic information to get started.' : 'Choose a strong password to protect your data.'}
                </p>
              </div>

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <div className="space-y-4" style={{animation:'slideRight .4s ease-out both'}}>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{color:'rgba(148,163,184,.55)'}}>Full Name</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:'rgba(99,102,241,.55)'}}>
                        <User size={15}/>
                      </div>
                      <input type="text" placeholder="Dr. John Smith" value={form.name}
                        onChange={e=>setForm({...form,name:e.target.value})}
                        className="stat-input w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl text-sm text-white transition-all"
                        style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{color:'rgba(148,163,184,.55)'}}>Email Address</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:'rgba(99,102,241,.55)'}}>
                        <Mail size={15}/>
                      </div>
                      <input type="email" placeholder="you@hospital.com" value={form.email}
                        onChange={e=>setForm({...form,email:e.target.value})}
                        className="stat-input w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl text-sm text-white transition-all"
                        style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{color:'rgba(148,163,184,.55)'}}>Phone Number</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:'rgba(99,102,241,.55)'}}>
                        <Phone size={15}/>
                      </div>
                      <input type="tel" placeholder="+91 98765 43210" value={form.phone}
                        onChange={e=>setForm({...form,phone:e.target.value})}
                        className="stat-input w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl text-sm text-white transition-all"
                        style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{color:'rgba(148,163,184,.55)'}}>Your Role</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:'rgba(99,102,241,.55)'}}>
                        <Stethoscope size={15}/>
                      </div>
                      <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}
                        className="stat-input stat-select w-full pl-10 pr-10 py-3 sm:py-3.5 rounded-xl text-sm transition-all"
                        style={{...inputStyle, color: form.role ? 'white' : 'rgba(148,163,184,.35)'}}
                        onFocus={focusIn} onBlur={focusOut}>
                        <option value="" disabled>Select your role</option>
                        {roles.map(r=>(
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:'rgba(99,102,241,.55)'}}>
                        <ChevronDown size={15}/>
                      </div>
                    </div>
                  </div>

                  {/* Organization */}
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{color:'rgba(148,163,184,.55)'}}>
                      Organization <span style={{color:'rgba(100,116,139,.5)',textTransform:'none',letterSpacing:'normal',fontWeight:400}}>(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:'rgba(99,102,241,.55)'}}>
                        <Building2 size={15}/>
                      </div>
                      <input type="text" placeholder="City General Hospital" value={form.organization}
                        onChange={e=>setForm({...form,organization:e.target.value})}
                        className="stat-input w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl text-sm text-white transition-all"
                        style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                    </div>
                  </div>

                  {/* Next */}
                  <button type="button" onClick={handleNext}
                    className="w-full rounded-xl font-bold text-white text-sm transition-all relative overflow-hidden mt-2"
                    style={{
                      padding:'clamp(10px,2vh,14px) 24px',
                      background:'linear-gradient(135deg,#6366f1 0%,#4f46e5 50%,#4338ca 100%)',
                      boxShadow:'0 8px 32px rgba(99,102,241,.4),inset 0 1px 0 rgba(255,255,255,.15)',
                    }}>
                    <div className="absolute inset-0 rounded-xl" style={{background:'linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent)',backgroundSize:'200% 100%',animation:'shimmer 3s linear infinite'}}/>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Continue
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </span>
                  </button>
                </div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-4" style={{animation:'slideLeft .4s ease-out both'}}>

                  {/* Password strength indicator */}
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{color:'rgba(148,163,184,.55)'}}>Password</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:'rgba(99,102,241,.55)'}}>
                        <Lock size={15}/>
                      </div>
                      <input type={showPass?'text':'password'} placeholder="Min. 8 characters" value={form.password}
                        onChange={e=>setForm({...form,password:e.target.value})}
                        className="stat-input w-full pl-10 pr-11 py-3 sm:py-3.5 rounded-xl text-sm text-white transition-all"
                        style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                      <button type="button" onClick={()=>setShowPass(!showPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                        style={{color:'rgba(148,163,184,.45)'}}>
                        {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                      </button>
                    </div>
                    {/* Strength bars */}
                    {form.password && (
                      <div className="mt-2 flex gap-1.5">
                        {[1,2,3,4].map(n=>{
                          const len = form.password.length
                          const hasUpper = /[A-Z]/.test(form.password)
                          const hasNum   = /[0-9]/.test(form.password)
                          const hasSym   = /[^a-zA-Z0-9]/.test(form.password)
                          const score = [len>=6, len>=8&&hasUpper, hasNum, hasSym].filter(Boolean).length
                          const color = score<=1?'#ef4444':score===2?'#f59e0b':score===3?'#10b981':'#6366f1'
                          return <div key={n} className="flex-1 h-1 rounded-full transition-all duration-300" style={{background: n<=score ? color : 'rgba(255,255,255,.1)'}}/>
                        })}
                      </div>
                    )}
                  </div>

                  {/* Confirm */}
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{color:'rgba(148,163,184,.55)'}}>Confirm Password</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:'rgba(99,102,241,.55)'}}>
                        <Lock size={15}/>
                      </div>
                      <input type={showConfirm?'text':'password'} placeholder="Re-enter password" value={form.confirmPassword}
                        onChange={e=>setForm({...form,confirmPassword:e.target.value})}
                        className="stat-input w-full pl-10 pr-11 py-3 sm:py-3.5 rounded-xl text-sm text-white transition-all"
                        style={{...inputStyle, borderColor: form.confirmPassword && form.password!==form.confirmPassword ? 'rgba(239,68,68,.5)' : 'rgba(99,102,241,.2)'}}
                        onFocus={focusIn} onBlur={focusOut}/>
                      <button type="button" onClick={()=>setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2"
                        style={{color:'rgba(148,163,184,.45)'}}>
                        {showConfirm ? <EyeOff size={15}/> : <Eye size={15}/>}
                      </button>
                    </div>
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <p className="text-xs mt-1.5" style={{color:'#f87171'}}>Passwords do not match</p>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="rounded-xl p-3.5" style={{background:'rgba(99,102,241,.06)',border:'1px solid rgba(99,102,241,.15)'}}>
                    <p className="text-xs leading-relaxed" style={{color:'rgba(148,163,184,.6)'}}>
                      By creating an account you agree to our{' '}
                      <a href="#" className="underline" style={{color:'rgba(129,140,248,.8)'}}>Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="underline" style={{color:'rgba(129,140,248,.8)'}}>Privacy Policy</a>.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-1">
                    {/* Back */}
                    <button type="button" onClick={()=>setStep(1)}
                      className="rounded-xl font-semibold text-sm transition-all flex-shrink-0"
                      style={{
                        padding:'clamp(10px,2vh,14px) 18px',
                        border:'1px solid rgba(99,102,241,.3)',
                        color:'rgba(129,140,248,.8)',
                        background:'rgba(99,102,241,.06)',
                      }}>
                      ← Back
                    </button>
                    {/* Create */}
                    <button type="submit" disabled={loading}
                      className="flex-1 rounded-xl font-bold text-white text-sm transition-all relative overflow-hidden"
                      style={{
                        padding:'clamp(10px,2vh,14px) 24px',
                        background:loading?'rgba(99,102,241,.3)':'linear-gradient(135deg,#6366f1 0%,#4f46e5 50%,#4338ca 100%)',
                        boxShadow:loading?'none':'0 8px 32px rgba(99,102,241,.4),inset 0 1px 0 rgba(255,255,255,.15)',
                      }}>
                      {!loading && <div className="absolute inset-0 rounded-xl" style={{background:'linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent)',backgroundSize:'200% 100%',animation:'shimmer 3s linear infinite'}}/>}
                      {loading ? (
                        <span className="flex items-center justify-center gap-2 relative z-10">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" style={{animation:'spin .7s linear infinite'}}/>
                          Creating...
                        </span>
                      ) : (
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          Create Account
                          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{background:'rgba(255,255,255,.06)'}}/>
                <span className="text-xs whitespace-nowrap" style={{color:'rgba(148,163,184,.35)'}}>Already have an account?</span>
                <div className="flex-1 h-px" style={{background:'rgba(255,255,255,.06)'}}/>
              </div>

              <a href="/login"
                className="flex items-center justify-center gap-2 w-full rounded-xl font-semibold text-sm transition-all"
                style={{padding:'clamp(10px,1.8vh,13px) 24px',border:'1px solid rgba(99,102,241,.28)',color:'rgba(129,140,248,.85)',background:'rgba(99,102,241,.06)'}}>
                Sign in instead
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>

              <div className="h-px mt-6 rounded-full" style={{background:'linear-gradient(90deg,transparent,rgba(6,182,212,.35),transparent)'}}/>
              <p className="text-center mt-4" style={{fontSize:'11px',color:'rgba(100,116,139,.55)'}}>🔒 256-bit SSL · SOC 2 Type II · HIPAA Compliant</p>
            </div>

            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 flex-wrap">
              {['ISO 27001','NABH','HL7 FHIR'].map((b,i)=>(
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{background:i===0?'#6366f1':i===1?'#06b6d4':'#10b981'}}/>
                  <span style={{fontSize:'11px',color:'rgba(100,116,139,.6)',fontWeight:500}}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 sm:px-8"
        style={{height:'40px',background:'rgba(10,15,30,.96)',borderTop:'1px solid rgba(99,102,241,.1)'}}>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{animation:'particlePulse 2s ease-in-out infinite'}}/>
          <span className="text-xs font-mono hidden sm:inline" style={{color:'rgba(100,116,139,.6)'}}>All systems operational</span>
          <span className="text-xs font-mono sm:hidden" style={{color:'rgba(100,116,139,.6)'}}>Online</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <span className="text-xs font-mono hidden sm:inline" style={{color:'rgba(100,116,139,.45)'}}>v2.4.1</span>
          <span className="text-xs" style={{color:'rgba(100,116,139,.45)'}}>© 2026 STAT BOOK</span>
        </div>
      </div>
    </div>
  )
}
