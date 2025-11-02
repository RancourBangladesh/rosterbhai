"use client";
import { useState } from 'react';
import { Check, ArrowRight, Shield, Zap, Users, Calendar, Clock, FileText, Bell, TrendingUp } from 'lucide-react';
import MarketingNavbar from '@/components/MarketingNavbar';

export default function PricingPage(){
  return (
    <div style={{minHeight:'100vh',background:'#ffffff'}}>
      <MarketingNavbar currentPage="pricing" />
      <HeroSection />
      <PricingCards />
      <FeaturesIncluded />
      <SignupSection />
      <Footer />
    </div>
  );
}

function HeroSection(){
  return (
    <section style={{
      padding:'5rem 2rem 3rem',
      textAlign:'center',
      background:'#f8fafc'
    }}>
      <div style={{maxWidth:800,margin:'0 auto'}}>
        <h1 style={{
          fontSize:'3rem',
          fontWeight:800,
          color:'#1e293b',
          marginBottom:'1rem',
          lineHeight:1.2
        }}>
          Simple, Transparent Pricing
        </h1>
        <p style={{
          fontSize:'1.25rem',
          color:'#64748b',
          marginBottom:'2rem'
        }}>
          Choose the plan that works for your team. No hidden fees, no surprises.
        </p>
        <div style={{
          display:'inline-flex',
          gap:'1rem',
          background:'white',
          padding:'0.5rem',
          borderRadius:12,
          border:'2px solid #e5e7eb'
        }}>
          <span style={{color:'#64748b',fontSize:'0.875rem'}}>💰 Save ৳6,000 with yearly plan</span>
          <span style={{color:'#64748b',fontSize:'0.875rem'}}>🎁 Get 2 months free</span>
        </div>
      </div>
    </section>
  );
}

function PricingCards(){
  const features = [
    'Unlimited employees',
    'Real-time roster updates',
    'Shift swap requests',
    'Mobile access',
    'Email notifications',
    'Data export (CSV)',
    'Admin dashboard',
    'Employee portal',
    'Schedule templates',
    'Google Calendar sync'
  ];

  return (
    <section style={{padding:'4rem 2rem',background:'white'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:'2rem'}}>
          {/* Monthly Plan */}
          <div style={{
            border:'2px solid #e5e7eb',
            borderRadius:16,
            padding:'2rem',
            background:'white',
            transition:'all 0.3s'
          }}>
            <div style={{marginBottom:'1.5rem'}}>
              <h3 style={{fontSize:'1.5rem',fontWeight:700,color:'#1e293b',marginBottom:'0.5rem'}}>Monthly</h3>
              <div style={{display:'flex',alignItems:'baseline',gap:'0.5rem',marginBottom:'1rem'}}>
                <span style={{fontSize:'3rem',fontWeight:800,color:'#1e293b'}}>৳3,000</span>
                <span style={{color:'#64748b',fontSize:'1rem'}}>/month</span>
              </div>
              <p style={{color:'#64748b'}}>Perfect for getting started</p>
            </div>
            <a href="#signup" style={{
              display:'block',
              padding:'1rem',
              background:'#f1f5f9',
              color:'#1e293b',
              textAlign:'center',
              borderRadius:10,
              fontWeight:700,
              textDecoration:'none',
              transition:'all 0.2s',
              border:'2px solid #e5e7eb'
            }}>
              Get Started
            </a>
            <div style={{marginTop:'2rem',paddingTop:'2rem',borderTop:'1px solid #e5e7eb'}}>
              <div style={{fontWeight:600,color:'#1e293b',marginBottom:'1rem'}}>All features included:</div>
              {features.map((f,i)=>(
                <div key={i} style={{display:'flex',gap:'0.75rem',alignItems:'center',marginBottom:'0.75rem'}}>
                  <Check size={18} style={{color:'#10b981',flexShrink:0}}/>
                  <span style={{color:'#64748b'}}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Yearly Plan - Highlighted */}
          <div style={{
            border:'3px solid #2563eb',
            borderRadius:16,
            padding:'2rem',
            background:'#eff6ff',
            position:'relative',
            transform:'scale(1.05)',
            boxShadow:'0 10px 40px rgba(37,99,235,0.2)'
          }}>
            <div style={{
              position:'absolute',
              top:-16,
              left:'50%',
              transform:'translateX(-50%)',
              background:'#2563eb',
              color:'white',
              padding:'0.5rem 1.5rem',
              borderRadius:20,
              fontWeight:700,
              fontSize:'0.875rem'
            }}>
              BEST VALUE
            </div>
            <div style={{marginBottom:'1.5rem',marginTop:'1rem'}}>
              <h3 style={{fontSize:'1.5rem',fontWeight:700,color:'#1e293b',marginBottom:'0.5rem'}}>Yearly</h3>
              <div style={{display:'flex',alignItems:'baseline',gap:'0.5rem',marginBottom:'0.5rem'}}>
                <span style={{fontSize:'3rem',fontWeight:800,color:'#2563eb'}}>৳30,000</span>
                <span style={{color:'#64748b',fontSize:'1rem'}}>/year</span>
              </div>
              <div style={{
                display:'inline-block',
                background:'#dcfce7',
                color:'#15803d',
                padding:'0.25rem 0.75rem',
                borderRadius:6,
                fontSize:'0.875rem',
                fontWeight:600,
                marginBottom:'0.5rem'
              }}>
                Save ৳6,000 (17% off)
              </div>
              <p style={{color:'#64748b',marginTop:'0.5rem'}}>Best for growing teams</p>
            </div>
            <a href="#signup" style={{
              display:'block',
              padding:'1rem',
              background:'#2563eb',
              color:'white',
              textAlign:'center',
              borderRadius:10,
              fontWeight:700,
              textDecoration:'none',
              transition:'all 0.2s',
              boxShadow:'0 4px 12px rgba(37,99,235,0.3)'
            }}>
              Get Started
            </a>
            <div style={{marginTop:'2rem',paddingTop:'2rem',borderTop:'1px solid #cbd5e1'}}>
              <div style={{fontWeight:600,color:'#1e293b',marginBottom:'1rem'}}>All features included:</div>
              {features.map((f,i)=>(
                <div key={i} style={{display:'flex',gap:'0.75rem',alignItems:'center',marginBottom:'0.75rem'}}>
                  <Check size={18} style={{color:'#10b981',flexShrink:0}}/>
                  <span style={{color:'#475569'}}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesIncluded(){
  const featuresList = [
    { icon: Users, title: 'Unlimited Team Members', desc: 'Add as many employees as you need' },
    { icon: Calendar, title: 'Smart Scheduling', desc: 'AI-powered roster generation' },
    { icon: Clock, title: 'Shift Management', desc: 'Request, swap, and approve shifts' },
    { icon: Bell, title: 'Real-Time Notifications', desc: 'Stay updated on schedule changes' },
    { icon: FileText, title: 'Comprehensive Reports', desc: 'Export and analyze roster data' },
    { icon: Shield, title: 'Bank-Level Security', desc: 'Your data is encrypted and safe' },
    { icon: Zap, title: 'Lightning Fast', desc: 'Sub-second response times' },
    { icon: TrendingUp, title: 'Analytics Dashboard', desc: 'Track team performance metrics' }
  ];

  return (
    <section style={{padding:'4rem 2rem',background:'#f8fafc'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'3rem'}}>
          <h2 style={{fontSize:'2.5rem',fontWeight:800,color:'#1e293b',marginBottom:'1rem'}}>
            Everything You Need, In One Place
          </h2>
          <p style={{fontSize:'1.125rem',color:'#64748b'}}>
            All plans include full access to our complete feature set
          </p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'2rem'}}>
          {featuresList.map((feature,i)=>{
            const Icon = feature.icon;
            return (
              <div key={i} style={{
                background:'white',
                padding:'1.5rem',
                borderRadius:12,
                border:'1px solid #e5e7eb',
                transition:'all 0.3s'
              }}>
                <div style={{
                  width:48,
                  height:48,
                  background:'#dbeafe',
                  borderRadius:10,
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  marginBottom:'1rem'
                }}>
                  <Icon size={24} style={{color:'#2563eb'}}/>
                </div>
                <h3 style={{fontSize:'1.125rem',fontWeight:700,color:'#1e293b',marginBottom:'0.5rem'}}>
                  {feature.title}
                </h3>
                <p style={{color:'#64748b',fontSize:'0.875rem'}}>{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SignupSection(){
  return (
    <section id="signup" style={{padding:'4rem 2rem',background:'white'}}>
      <div style={{maxWidth:800,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'3rem'}}>
          <h2 style={{fontSize:'2.5rem',fontWeight:800,color:'#1e293b',marginBottom:'1rem'}}>
            Ready to Get Started?
          </h2>
          <p style={{fontSize:'1.125rem',color:'#64748b'}}>
            Create your tenant account in minutes. No credit card required to sign up.
          </p>
        </div>
        <SignupForm />
      </div>
    </section>
  );
}

function Footer(){
  return (
    <footer style={{background:'#1e293b',color:'white',padding:'3rem 2rem 2rem'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'2rem',marginBottom:'2rem'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1rem'}}>
              <div style={{
                width:36,height:36,
                background:'#2563eb',
                borderRadius:8,
                display:'flex',alignItems:'center',justifyContent:'center',
                color:'white',fontWeight:800
              }}>R</div>
              <span style={{fontSize:'1.25rem',fontWeight:800}}>RosterBhai</span>
            </div>
            <p style={{color:'#94a3b8',fontSize:'0.875rem'}}>
              Modern roster management for forward-thinking teams
            </p>
          </div>
          <div>
            <h4 style={{fontWeight:700,marginBottom:'1rem'}}>Product</h4>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              <a href="/" style={{color:'#94a3b8',textDecoration:'none',fontSize:'0.875rem'}}>Features</a>
              <a href="/pricing" style={{color:'#94a3b8',textDecoration:'none',fontSize:'0.875rem'}}>Pricing</a>
              <a href="/" style={{color:'#94a3b8',textDecoration:'none',fontSize:'0.875rem'}}>FAQ</a>
            </div>
          </div>
          <div>
            <h4 style={{fontWeight:700,marginBottom:'1rem'}}>Company</h4>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              <a href="/about" style={{color:'#94a3b8',textDecoration:'none',fontSize:'0.875rem'}}>About Us</a>
              <a href="/contact" style={{color:'#94a3b8',textDecoration:'none',fontSize:'0.875rem'}}>Contact</a>
            </div>
          </div>
          <div>
            <h4 style={{fontWeight:700,marginBottom:'1rem'}}>Support</h4>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              <a href="/contact" style={{color:'#94a3b8',textDecoration:'none',fontSize:'0.875rem'}}>Help Center</a>
              <a href="/contact" style={{color:'#94a3b8',textDecoration:'none',fontSize:'0.875rem'}}>Contact Support</a>
            </div>
          </div>
        </div>
        <div style={{borderTop:'1px solid #334155',paddingTop:'2rem',textAlign:'center',color:'#94a3b8',fontSize:'0.875rem'}}>
          © {new Date().getFullYear()} RosterBhai. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function SignupForm(){
  const [name,setName]=useState('');
  const [slug,setSlug]=useState('');
  const [plan,setPlan]=useState<'monthly'|'yearly'>('yearly');
  const [email,setEmail]=useState('');
  const [phone,setPhone]=useState('');
  const [msg,setMsg]=useState('');
  const [loading,setLoading]=useState(false);

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try{
      const res = await fetch('/api/public/tenants/signup',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g,''), plan, contact_email: email, contact_phone: phone })
      });
      const data = await res.json();
      if(data.success){
        setMsg('✅ Signup received! We will call to verify and activate your portal.');
        setName(''); setSlug(''); setEmail(''); setPhone('');
      } else {
        setMsg('❌ '+(data.error||'Failed to signup'));
      }
    } finally{ setLoading(false); }
  }

  const subdomainPreview = slug ? `${slug.toLowerCase().replace(/[^a-z0-9-]/g,'')}.rosterbhai.app` : 'your-company.rosterbhai.app';

  return (
    <form onSubmit={submit} style={{
      background:'white',
      padding:'2.5rem',
      borderRadius:16,
      border:'2px solid #e5e7eb',
      boxShadow:'0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <div style={{display:'grid',gap:'1.5rem'}}>
        <div>
          <label style={{display:'block',fontWeight:600,color:'#1e293b',marginBottom:'0.5rem',fontSize:'0.875rem'}}>
            Organization Name *
          </label>
          <input 
            value={name} 
            onChange={e=>setName(e.target.value)} 
            required 
            placeholder="Acme Corporation" 
            style={{
              width:'100%',
              padding:'1rem 1.25rem',
              border:'2px solid #e5e7eb',
              borderRadius:10,
              fontSize:'1rem',
              transition:'all 0.2s',
              outline:'none'
            }}
            onFocus={(e)=>e.target.style.borderColor='#2563eb'}
            onBlur={(e)=>e.target.style.borderColor='#e5e7eb'}
          />
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>
          <div>
            <label style={{display:'block',fontWeight:600,color:'#1e293b',marginBottom:'0.5rem',fontSize:'0.875rem'}}>
              Subdomain *
            </label>
            <input 
              value={slug} 
              onChange={e=>setSlug(e.target.value)} 
              required 
              placeholder="acme" 
              style={{
                width:'100%',
                padding:'1rem 1.25rem',
                border:'2px solid #e5e7eb',
                borderRadius:10,
                fontSize:'1rem',
                transition:'all 0.2s',
                outline:'none'
              }}
              onFocus={(e)=>e.target.style.borderColor='#2563eb'}
              onBlur={(e)=>e.target.style.borderColor='#e5e7eb'}
            />
            <div style={{marginTop:'0.5rem',color:'#64748b',fontSize:'0.75rem'}}>
              Your portal: <span style={{color:'#2563eb',fontWeight:600}}>{subdomainPreview}</span>
            </div>
          </div>

          <div>
            <label style={{display:'block',fontWeight:600,color:'#1e293b',marginBottom:'0.5rem',fontSize:'0.875rem'}}>
              Billing Plan *
            </label>
            <select 
              value={plan} 
              onChange={e=>setPlan(e.target.value as any)} 
              style={{
                width:'100%',
                padding:'1rem 1.25rem',
                border:'2px solid #e5e7eb',
                borderRadius:10,
                fontSize:'1rem',
                background:'white',
                cursor:'pointer',
                transition:'all 0.2s',
                outline:'none'
              }}
              onFocus={(e)=>e.target.style.borderColor='#2563eb'}
              onBlur={(e)=>e.target.style.borderColor='#e5e7eb'}
            >
              <option value="monthly">Monthly – ৳3,000/mo</option>
              <option value="yearly">Yearly – ৳30,000/yr (save ৳6,000)</option>
            </select>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>
          <div>
            <label style={{display:'block',fontWeight:600,color:'#1e293b',marginBottom:'0.5rem',fontSize:'0.875rem'}}>
              Contact Email
            </label>
            <input 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              placeholder="you@company.com" 
              type="email" 
              style={{
                width:'100%',
                padding:'1rem 1.25rem',
                border:'2px solid #e5e7eb',
                borderRadius:10,
                fontSize:'1rem',
                transition:'all 0.2s',
                outline:'none'
              }}
              onFocus={(e)=>e.target.style.borderColor='#2563eb'}
              onBlur={(e)=>e.target.style.borderColor='#e5e7eb'}
            />
          </div>

          <div>
            <label style={{display:'block',fontWeight:600,color:'#1e293b',marginBottom:'0.5rem',fontSize:'0.875rem'}}>
              Phone Number
            </label>
            <input 
              value={phone} 
              onChange={e=>setPhone(e.target.value)} 
              placeholder="01XXXXXXXXX" 
              style={{
                width:'100%',
                padding:'1rem 1.25rem',
                border:'2px solid #e5e7eb',
                borderRadius:10,
                fontSize:'1rem',
                transition:'all 0.2s',
                outline:'none'
              }}
              onFocus={(e)=>e.target.style.borderColor='#2563eb'}
              onBlur={(e)=>e.target.style.borderColor='#e5e7eb'}
            />
          </div>
        </div>

        <button 
          disabled={loading} 
          type="submit"
          style={{
            width:'100%',
            padding:'1rem 1.5rem',
            background: loading ? '#94a3b8' : '#2563eb',
            color:'white',
            border:'none',
            borderRadius:10,
            fontWeight:700,
            fontSize:'1.05rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition:'all 0.2s',
            boxShadow:'0 4px 12px rgba(37,99,235,0.3)'
          }}
          onMouseEnter={(e)=>{if(!loading) e.currentTarget.style.transform='translateY(-2px)';}}
          onMouseLeave={(e)=>e.currentTarget.style.transform='translateY(0)'}
        >
          {loading ? 'Submitting...' : 'Request Activation →'}
        </button>

        {msg && (
          <div style={{
            padding:'1rem 1.25rem',
            borderRadius:10,
            background: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2',
            color: msg.startsWith('✅') ? '#15803d' : '#991b1b',
            fontWeight:500,
            fontSize:'0.875rem'
          }}>
            {msg}
          </div>
        )}

        <div style={{
          padding:'1rem',
          background:'#f8fafc',
          borderRadius:10,
          color:'#64748b',
          fontSize:'0.75rem',
          textAlign:'center'
        }}>
          🔒 Your information is secure. We'll contact you to verify and activate your account.
        </div>
      </div>
    </form>
  );
}
