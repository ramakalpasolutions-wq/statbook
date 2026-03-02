'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Mail, Phone, Shield, Activity, Heart, Zap, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotClient() {
  const router = useRouter()
  const [step, setStep]     = useState(1) // 1=request, 2=otp, 3=success
  const [method, setMethod] = useState('email')
  const [contact, setContact] = useState('')
  const [otp, setOtp]       = useState(['','','','','',''])
  const [loading, setLoading] = useState(false)

  const floatingIcons = [
    { Icon:Heart,    top:'8%',  left:'4%',  size:28, delay:'0s',   dur:'6s'  },
    { Icon:Activity, top:'18%', left:'88%', size:32, delay:'1s',   dur:'7s'  },
    { Icon:Shield,   top:'35%', left:'6%',  size:26, delay:'2s',   dur:'8s'  },
    { Icon:Zap,      top:'62%', left:'8%',  size:20, delay:'0.8s', dur:'8s'  },
    { Icon:Heart,    top:'80%', left:'87%', size:24, delay:'2.5s', dur:'9s'  },
    { Icon:Shield,   top:'55%', left:'91%', size:22, delay:'1.5s', dur:'7s'  },
  ]

  const particles = [...Array(18)].map((_,i) => ({
    left:`${(i*5.5+3)%100}%`, top:`${(i*6.7+4)%100}%`,
    size: i%3===0?4:i%3===1?3:2,
    delay:`${(i*0.4)%4}s`, dur:`${4+(i%4)}s`,
  }))

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!contact.trim()) return toast.error(`Enter your ${method === 'email' ? 'email' : 'phone number'}`)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ method, contact }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`OTP sent to your ${method}`)
        setStep(2)
      } else {
        toast.error(data.error || 'Failed to send OTP')
      }
    } catch {
      toast.error('Server error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) return toast.error('Enter the 6-digit OTP')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ method, contact, otp: code }),
      })
      const data = await res.json()
      if (res.ok) {
        setStep(3)
      } else {
        toast.error(data.error || 'Invalid OTP')
      }
    } catch {
      toast.error('Server error')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) {
      document.getElementById(`otp-${idx+1}`)?.focus()
    }
  }

  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx-1}`)?.focus()
    }
  }

  const inputBase = {
    background:'rgba(255,255,255,.05)',
    border:'1px solid rgba(99,102,241,.2)',
    color:'white',
  }
  const focusIn  = e => { e.target.style.borderColor='rgba(99,102,241,.6)'; e.target.style.background='rgba(99,102,241,.08)' }
  const focusOut = e => { e.target.style.borderColor='rgba(99,102,241,.2)'; e.target.style.background='rgba(255,255,255,.05)' }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <style>{`
        @keyframes floatY        { 0%,100%{transform:translateY(0) rotate(0deg);opacity:.12} 50%{transform:translateY(-22px) rotate(8deg);opacity:.28} }
        @keyframes particlePulse { 0%,100%{transform:scale(1);opacity:.15} 50%{transform:scale(1.8);opacity:.45} }
        @keyframes blobMove1     { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.1)} 66%{transform:translate(-20px,20px) scale(.95)} }
        @keyframes blobMove2     { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-35px,25px) scale(1.05)} 66%{transform:translate(30px,-20px) scale(.9)} }
        @keyframes formIn        { from{opacity:0;transform:translateY(24px) scale(.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes fadeUp        { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin          { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes shimmer       { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes successPop    { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
        @keyframes pulseRing     { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(1.8);opacity:0} }
        .stat-input::placeholder { color:rgba(148,163,184,.35) }
        .stat-input:focus        { outline:none }
        .otp-box::placeholder    { color:rgba(148,163,184,.2) }
        .otp-box:focus           { outline:none; border-color:rgba(99,102,241,.7)!important; background:rgba(99,102,241,.12)!important }
      `}</style>

      {/* BG */}
      <div className="absolute inset-0" style={{background:'linear-gradient(135deg,#0a0f1e 0%,#0d1b3e 30%,#0f2460 55%,#0a1628 80%,#060d1a 100%)'}}/>
      <div className="absolute" style={{top:'-15%',left:'-10%',width:'55%',height:'55%',background:'radial-gradient(ellipse,rgba(99,102,241,.18) 0%,transparent 70%)',animation:'blobMove1 14s ease-in-out infinite',borderRadius:'50%'}}/>
      <div className="absolute" style={{bottom:'-20%',right:'-12%',width:'60%',height:'60%',background:'radial-gradient(ellipse,rgba(6,182,212,.14) 0%,transparent 70%)',animation:'blobMove2 18s ease-in-out infinite',borderRadius:'50%'}}/>
      <div className="absolute inset-0" style={{backgroundImage:`linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px)`,backgroundSize:'60px 60px'}}/>

      {particles.map((p,i)=>(
        <div key={i} className="absolute rounded-full" style={{left:p.left,top:p.top,width:p.size,height:p.size,background:i%3===0?'#6366f1':i%3===1?'#06b6d4':'#10b981',animation:`particlePulse ${p.dur} ease-in-out infinite`,animationDelay:p.delay}}/>
      ))}
      {floatingIcons.map(({Icon,top,left,size,delay,dur},i)=>(
        <div key={i} className="absolute" style={{top,left,animation:`floatY ${dur} ease-in-out infinite`,animationDelay:delay,color:i%3===0?'rgba(99,102,241,.28)':i%3===1?'rgba(6,182,212,.22)':'rgba(16,185,129,.22)',pointerEvents:'none'}}>
          <Icon size={size} strokeWidth={1.2}/>
        </div>
      ))}

      {/* Center layout */}
      <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6" style={{paddingBottom:'40px'}}>
        <div className="w-full" style={{maxWidth:'420px'}}>

          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8" style={{animation:'fadeUp .5s ease-out both'}}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#6366f1,#4f46e5)',boxShadow:'0 4px 20px rgba(99,102,241,.4)'}}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="8.5" y="1" width="3" height="18" rx="1.5" fill="white"/><rect x="1" y="8.5" width="18" height="3" rx="1.5" fill="white"/></svg>
            </div>
            <span className="text-white font-black text-2xl tracking-tight">STAT<span style={{color:'#818cf8'}}>BOOK</span></span>
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

            {/* ── STEP 1: Request OTP ── */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} style={{animation:'fadeUp .5s ease-out both'}}>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:'rgba(99,102,241,.12)',border:'1px solid rgba(99,102,241,.25)'}}>
                    <Shield size={26} style={{color:'#818cf8'}}/>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mb-2" style={{letterSpacing:'-.01em'}}>Forgot password?</h2>
                  <p className="text-sm" style={{color:'rgba(148,163,184,.6)'}}>
                    Enter your registered email or phone.<br/>We'll send you a verification code.
                  </p>
                </div>

                {/* Toggle method */}
                <div className="flex rounded-xl p-1 mb-5" style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(99,102,241,.15)'}}>
                  {['email','phone'].map(m=>(
                    <button key={m} type="button" onClick={()=>{setMethod(m);setContact('')}}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
                      style={{
                        background: method===m ? 'rgba(99,102,241,.25)' : 'transparent',
                        color: method===m ? 'white' : 'rgba(148,163,184,.5)',
                        border: method===m ? '1px solid rgba(99,102,241,.4)' : '1px solid transparent',
                      }}>
                      {m==='email' ? <Mail size={14}/> : <Phone size={14}/>}
                      {m==='email' ? 'Email' : 'Phone'}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{color:'rgba(148,163,184,.55)'}}>
                    {method==='email' ? 'Email Address' : 'Phone Number'}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:'rgba(99,102,241,.55)'}}>
                      {method==='email' ? <Mail size={15}/> : <Phone size={15}/>}
                    </div>
                    <input
                      type={method==='email'?'email':'tel'}
                      placeholder={method==='email'?'you@hospital.com':'+91 98765 43210'}
                      value={contact}
                      onChange={e=>setContact(e.target.value)}
                      className="stat-input w-full pl-10 pr-4 py-3.5 rounded-xl text-sm text-white transition-all"
                      style={inputBase} onFocus={focusIn} onBlur={focusOut}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full rounded-xl font-bold text-white text-sm transition-all relative overflow-hidden"
                  style={{
                    padding:'14px 24px',
                    background:loading?'rgba(99,102,241,.3)':'linear-gradient(135deg,#6366f1,#4f46e5,#4338ca)',
                    boxShadow:loading?'none':'0 8px 32px rgba(99,102,241,.4),inset 0 1px 0 rgba(255,255,255,.15)',
                  }}>
                  {!loading&&<div className="absolute inset-0 rounded-xl" style={{background:'linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent)',backgroundSize:'200% 100%',animation:'shimmer 3s linear infinite'}}/>}
                  {loading ? (
                    <span className="flex items-center justify-center gap-2 relative z-10">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" style={{animation:'spin .7s linear infinite'}}/>
                      Sending...
                    </span>
                  ) : (
                    <span className="relative z-10">Send Verification Code</span>
                  )}
                </button>
              </form>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} style={{animation:'fadeUp .5s ease-out both'}}>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:'rgba(6,182,212,.12)',border:'1px solid rgba(6,182,212,.25)'}}>
                    {method==='email' ? <Mail size={26} style={{color:'#22d3ee'}}/> : <Phone size={26} style={{color:'#22d3ee'}}/>}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mb-2">Check your {method}</h2>
                  <p className="text-sm" style={{color:'rgba(148,163,184,.6)'}}>
                    We sent a 6-digit code to<br/>
                    <span className="font-semibold" style={{color:'#22d3ee'}}>{contact}</span>
                  </p>
                </div>

                {/* OTP boxes */}
                <div className="flex gap-2 sm:gap-3 justify-center mb-6">
                  {otp.map((v,i)=>(
                    <input key={i} id={`otp-${i}`}
                      type="text" inputMode="numeric" maxLength={1}
                      value={v}
                      onChange={e=>handleOtpChange(e.target.value,i)}
                      onKeyDown={e=>handleOtpKey(e,i)}
                      className="otp-box text-center font-black text-xl text-white rounded-xl transition-all"
                      style={{
                        width:'clamp(40px,12vw,52px)',
                        height:'clamp(48px,14vw,60px)',
                        background: v ? 'rgba(99,102,241,.2)' : 'rgba(255,255,255,.05)',
                        border: v ? '1px solid rgba(99,102,241,.6)' : '1px solid rgba(99,102,241,.2)',
                      }}
                    />
                  ))}
                </div>

                <button type="submit" disabled={loading||otp.join('').length<6}
                  className="w-full rounded-xl font-bold text-white text-sm transition-all relative overflow-hidden mb-4"
                  style={{
                    padding:'14px 24px',
                    background:loading||otp.join('').length<6?'rgba(99,102,241,.25)':'linear-gradient(135deg,#6366f1,#4f46e5,#4338ca)',
                    boxShadow:loading||otp.join('').length<6?'none':'0 8px 32px rgba(99,102,241,.4),inset 0 1px 0 rgba(255,255,255,.15)',
                  }}>
                  {!loading&&otp.join('').length===6&&<div className="absolute inset-0 rounded-xl" style={{background:'linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent)',backgroundSize:'200% 100%',animation:'shimmer 3s linear infinite'}}/>}
                  {loading ? (
                    <span className="flex items-center justify-center gap-2 relative z-10">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" style={{animation:'spin .7s linear infinite'}}/>
                      Verifying...
                    </span>
                  ) : (
                    <span className="relative z-10">Verify Code</span>
                  )}
                </button>

                <div className="text-center">
                  <button type="button" onClick={()=>setStep(1)}
                    className="text-xs font-semibold transition-colors flex items-center gap-1.5 mx-auto"
                    style={{color:'rgba(99,102,241,.7)'}}>
                    <ArrowLeft size={13}/> Change {method}
                  </button>
                </div>
              </form>
            )}

            {/* ── STEP 3: Success ── */}
            {step === 3 && (
              <div className="text-center py-4" style={{animation:'fadeUp .5s ease-out both'}}>
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{background:'rgba(16,185,129,.15)',border:'2px solid rgba(16,185,129,.4)',animation:'successPop .5s ease-out both'}}>
                    <CheckCircle size={36} style={{color:'#10b981'}}/>
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400" style={{animation:'pulseRing 1.8s ease-out infinite'}}/>
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-300" style={{animation:'pulseRing 1.8s ease-out infinite',animationDelay:'.7s'}}/>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white mb-2">Identity Verified!</h2>
                <p className="text-sm mb-8" style={{color:'rgba(148,163,184,.6)'}}>
                  A password reset link has been sent to<br/>
                  <span className="font-semibold" style={{color:'#34d399'}}>{contact}</span>.<br/>
                  Please check and follow the instructions.
                </p>

                <button onClick={()=>router.push('/auth/login')}
                  className="w-full rounded-xl font-bold text-white text-sm relative overflow-hidden"
                  style={{
                    padding:'14px 24px',
                    background:'linear-gradient(135deg,#6366f1,#4f46e5,#4338ca)',
                    boxShadow:'0 8px 32px rgba(99,102,241,.4),inset 0 1px 0 rgba(255,255,255,.15)',
                  }}>
                  <div className="absolute inset-0 rounded-xl" style={{background:'linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent)',backgroundSize:'200% 100%',animation:'shimmer 3s linear infinite'}}/>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Back to Sign In
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </span>
                </button>
              </div>
            )}

            <div className="h-px mt-6 rounded-full" style={{background:'linear-gradient(90deg,transparent,rgba(6,182,212,.35),transparent)'}}/>
            <p className="text-center mt-4" style={{fontSize:'11px',color:'rgba(100,116,139,.55)'}}>🔒 256-bit SSL · HIPAA Compliant</p>
          </div>

          {/* Back to login */}
          {step < 3 && (
            <div className="text-center mt-5">
              <a href="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                style={{color:'rgba(129,140,248,.7)'}}>
                <ArrowLeft size={14}/> Back to Sign In
              </a>
            </div>
          )}
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
