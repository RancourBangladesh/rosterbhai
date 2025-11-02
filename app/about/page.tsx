"use client";
import { Target, Users, Zap, Shield, Heart, Award, TrendingUp, Clock } from 'lucide-react';
import MarketingNavbar from '@/components/MarketingNavbar';

export default function AboutPage(){
  return (
    <div style={{minHeight:'100vh',background:'#ffffff'}}>
      <MarketingNavbar currentPage="about" />
      <HeroSection />
      <MissionSection />
      <ValuesSection />
      <WhyChooseUsSection />
      <CTASection />
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
      <div style={{maxWidth:900,margin:'0 auto'}}>
        <h1 style={{
          fontSize:'3.5rem',
          fontWeight:800,
          color:'#1e293b',
          marginBottom:'1.5rem',
          lineHeight:1.2
        }}>
          Transforming Workforce Management
        </h1>
        <p style={{
          fontSize:'1.375rem',
          color:'#64748b',
          marginBottom:'2rem',
          lineHeight:1.6
        }}>
          We're on a mission to make roster management simple, transparent, and accessible for every organization—from small businesses to large enterprises.
        </p>
        <div style={{
          display:'flex',
          gap:'2rem',
          justifyContent:'center',
          marginTop:'3rem',
          flexWrap:'wrap'
        }}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'3rem',fontWeight:800,color:'#2563eb'}}>500+</div>
            <div style={{color:'#64748b',fontWeight:600}}>Organizations</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'3rem',fontWeight:800,color:'#2563eb'}}>10K+</div>
            <div style={{color:'#64748b',fontWeight:600}}>Active Users</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'3rem',fontWeight:800,color:'#2563eb'}}>99.9%</div>
            <div style={{color:'#64748b',fontWeight:600}}>Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MissionSection(){
  return (
    <section style={{padding:'5rem 2rem',background:'white'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(400px,1fr))',gap:'4rem',alignItems:'center'}}>
          <div>
            <div style={{
              width:60,height:60,
              background:'#dbeafe',
              borderRadius:12,
              display:'flex',alignItems:'center',justifyContent:'center',
              marginBottom:'1.5rem'
            }}>
              <Target size={32} style={{color:'#2563eb'}}/>
            </div>
            <h2 style={{fontSize:'2.5rem',fontWeight:800,color:'#1e293b',marginBottom:'1.5rem'}}>
              Our Mission
            </h2>
            <p style={{fontSize:'1.125rem',color:'#64748b',lineHeight:1.8,marginBottom:'1rem'}}>
              To empower organizations with intelligent roster management tools that save time, reduce errors, and improve team satisfaction.
            </p>
            <p style={{fontSize:'1.125rem',color:'#64748b',lineHeight:1.8}}>
              We believe workforce scheduling should be effortless, transparent, and fair for everyone involved.
            </p>
          </div>
          <div style={{
            background:'#f8fafc',
            padding:'3rem',
            borderRadius:16,
            border:'2px solid #e5e7eb'
          }}>
            <h3 style={{fontSize:'1.5rem',fontWeight:700,color:'#1e293b',marginBottom:'1.5rem'}}>
              Our Story
            </h3>
            <p style={{color:'#64748b',lineHeight:1.8,marginBottom:'1rem'}}>
              RosterBhai was born from firsthand experience with the challenges of manual roster management. We saw teams struggling with spreadsheets, missed communications, and scheduling conflicts.
            </p>
            <p style={{color:'#64748b',lineHeight:1.8}}>
              Today, we're proud to serve hundreds of organizations, helping them streamline their workforce operations and focus on what matters most—their people and their mission.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValuesSection(){
  const values = [
    {
      icon: Users,
      title: 'People First',
      desc: 'We design with empathy, putting both managers and employees at the heart of every decision.'
    },
    {
      icon: Zap,
      title: 'Speed & Simplicity',
      desc: 'Complex problems deserve elegant solutions. We make powerful tools that anyone can use.'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      desc: 'Your data is sacred. We employ bank-level encryption and security best practices.'
    },
    {
      icon: Heart,
      title: 'Continuous Improvement',
      desc: 'We listen, learn, and iterate. Your feedback directly shapes our product roadmap.'
    }
  ];

  return (
    <section style={{padding:'5rem 2rem',background:'#f8fafc'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'3rem'}}>
          <h2 style={{fontSize:'2.5rem',fontWeight:800,color:'#1e293b',marginBottom:'1rem'}}>
            Our Core Values
          </h2>
          <p style={{fontSize:'1.125rem',color:'#64748b'}}>
            The principles that guide everything we do
          </p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'2rem'}}>
          {values.map((value,i)=>{
            const Icon = value.icon;
            return (
              <div key={i} style={{
                background:'white',
                padding:'2rem',
                borderRadius:16,
                border:'2px solid #e5e7eb',
                textAlign:'center',
                transition:'all 0.3s'
              }}>
                <div style={{
                  width:64,height:64,
                  background:'#2563eb',
                  borderRadius:12,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  margin:'0 auto 1.5rem'
                }}>
                  <Icon size={32} style={{color:'white'}}/>
                </div>
                <h3 style={{fontSize:'1.375rem',fontWeight:700,color:'#1e293b',marginBottom:'1rem'}}>
                  {value.title}
                </h3>
                <p style={{color:'#64748b',lineHeight:1.6}}>
                  {value.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WhyChooseUsSection(){
  const reasons = [
    {
      icon: Award,
      title: 'Industry Leading',
      desc: 'Trusted by 500+ organizations across multiple industries'
    },
    {
      icon: TrendingUp,
      title: 'Proven Results',
      desc: '78% reduction in scheduling time reported by our customers'
    },
    {
      icon: Clock,
      title: 'Quick Setup',
      desc: 'Get up and running in under 15 minutes with our intuitive onboarding'
    },
    {
      icon: Shield,
      title: '24/7 Support',
      desc: 'Our dedicated team is always here to help you succeed'
    }
  ];

  return (
    <section style={{padding:'5rem 2rem',background:'#1e3a8a',color:'white'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'3rem'}}>
          <h2 style={{fontSize:'2.5rem',fontWeight:800,marginBottom:'1rem',color:'white'}}>
            Why Teams Choose RosterBhai
          </h2>
          <p style={{fontSize:'1.125rem',color:'white'}}>
            Join hundreds of organizations who have transformed their workforce management
          </p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:'2rem'}}>
          {reasons.map((reason,i)=>{
            const Icon = reason.icon;
            return (
              <div key={i} style={{
                background:'rgba(255,255,255,0.1)',
                padding:'2rem',
                borderRadius:12,
                border:'1px solid rgba(255,255,255,0.2)',
                textAlign:'center'
              }}>
                <div style={{
                  width:56,height:56,
                  background:'rgba(255,255,255,0.2)',
                  borderRadius:10,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  margin:'0 auto 1rem'
                }}>
                  <Icon size={28} style={{color:'white'}}/>
                </div>
                <h3 style={{fontSize:'1.25rem',fontWeight:700,marginBottom:'0.75rem',color:'white'}}>
                  {reason.title}
                </h3>
                <p style={{lineHeight:1.6,color:'white'}}>
                  {reason.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTASection(){
  return (
    <section style={{padding:'5rem 2rem',background:'white',textAlign:'center'}}>
      <div style={{maxWidth:800,margin:'0 auto'}}>
        <h2 style={{fontSize:'2.5rem',fontWeight:800,color:'#1e293b',marginBottom:'1.5rem'}}>
          Ready to Transform Your Roster Management?
        </h2>
        <p style={{fontSize:'1.125rem',color:'#64748b',marginBottom:'2rem'}}>
          Join hundreds of organizations who trust RosterBhai to manage their teams
        </p>
        <div style={{display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap'}}>
          <a href="/pricing#signup" style={{
            display:'inline-block',
            padding:'1rem 2rem',
            background:'#2563eb',
            color:'white',
            textDecoration:'none',
            borderRadius:10,
            fontWeight:700,
            fontSize:'1.05rem',
            boxShadow:'0 4px 12px rgba(37,99,235,0.3)',
            transition:'all 0.2s'
          }}>
            Start Free Trial
          </a>
          <a href="/contact" style={{
            display:'inline-block',
            padding:'1rem 2rem',
            background:'white',
            color:'#2563eb',
            textDecoration:'none',
            borderRadius:10,
            fontWeight:700,
            fontSize:'1.05rem',
            border:'2px solid #2563eb',
            transition:'all 0.2s'
          }}>
            Talk to Sales
          </a>
        </div>
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
