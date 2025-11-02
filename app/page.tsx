"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Users, Clock, BarChart3, Shield, Zap, CheckCircle, ChevronDown, ArrowRight, Check, Bell, FileText, TrendingUp, Rocket, Code, Palette, Target, Heart, Award, Mail, Phone, MapPin, Headphones, MessageSquare } from 'lucide-react';
import MarketingNavbar from '@/components/MarketingNavbar';

export default function MarketingHome() {
  return (
    <div style={{minHeight:'100vh',background:'#ffffff'}}>
      <MarketingNavbar currentPage="home" />
      <HeroSection />
      <LogoCloud />
      <BenefitsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}

function HeroSection(){
  return (
    <section style={{padding:'6rem 2rem 4rem',maxWidth:1400,margin:'0 auto'}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr',gap:'3rem',alignItems:'center',}} className="hero-grid">
        {/* Left - Copy */}
        <div style={{textAlign:'center'}} className="hero-text">
          <div style={{
            display:'inline-flex',
            alignItems:'center',
            gap:'0.5rem',
            background:'#eff6ff',
            padding:'0.5rem 1rem',
            borderRadius:20,
            border:'1px solid #bfdbfe',
            marginBottom:'2rem'
          }}>
            <span style={{
              background:'#2563eb',
              color:'white',
              padding:'0.125rem 0.5rem',
              borderRadius:6,
              fontSize:'0.75rem',
              fontWeight:700
            }}>NEW</span>
            <span style={{fontSize:'0.875rem',color:'#1e40af'}}>Launch your roster system now!</span>
          </div>

          <h1 style={{
            fontSize:'3.5rem',
            fontWeight:800,
            color:'#1e293b',
            lineHeight:1.1,
            marginBottom:'1.5rem'
          }}>
            Experience the{' '}
            <span style={{color:'#2563eb'}}>RosterBhai</span>
            {' '}Platform
          </h1>

          <p style={{
            fontSize:'1.25rem',
            color:'#64748b',
            lineHeight:1.6,
            marginBottom:'2rem',
            maxWidth:600,
            margin:'0 auto 2rem'
          }}>
            A complete roster management system with real-time updates, shift swapping, and everything you need to manage your team efficiently.
          </p>

          <div style={{display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/pricing#signup" style={{
              display:'inline-flex',
              alignItems:'center',
              gap:'0.5rem',
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
              Get Started
              <ArrowRight size={20} />
            </Link>
            <a href="#features" style={{
              display:'inline-flex',
              alignItems:'center',
              gap:'0.5rem',
              padding:'1rem 2rem',
              background:'white',
              color:'#2563eb',
              textDecoration:'none',
              borderRadius:10,
              fontWeight:700,
              fontSize:'1.05rem',
              border:'2px solid #e5e7eb',
              transition:'all 0.2s'
            }}>
              Learn More
            </a>
          </div>
        </div>

        {/* Right - Preview Image */}
        <div style={{position:'relative',padding:'2rem'}} className="hero-image">
          {/* Glow Effect */}
          <div style={{
            position:'absolute',
            top:'50%',
            left:'50%',
            transform:'translate(-50%, -50%)',
            width:'80%',
            height:'80%',
            background:'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)',
            filter:'blur(60px)',
            zIndex:0
          }} />
          
          {/* Browser Mock */}
          <div style={{
            position:'relative',
            borderRadius:12,
            border:'1px solid #e5e7eb',
            background:'white',
            boxShadow:'0 20px 60px rgba(0,0,0,0.1)',
            overflow:'hidden',
            zIndex:1
          }}>
            {/* Browser Bar */}
            <div style={{
              display:'flex',
              alignItems:'center',
              justifyContent:'space-between',
              padding:'0.75rem 1rem',
              background:'#f8fafc',
              borderBottom:'1px solid #e5e7eb'
            }}>
              <div style={{display:'flex',gap:'0.5rem'}}>
                <div style={{width:12,height:12,borderRadius:'50%',background:'#ef4444'}} />
                <div style={{width:12,height:12,borderRadius:'50%',background:'#f59e0b'}} />
                <div style={{width:12,height:12,borderRadius:'50%',background:'#10b981'}} />
              </div>
              <div style={{
                flex:1,
                maxWidth:300,
                margin:'0 1rem',
                padding:'0.25rem 0.75rem',
                background:'white',
                borderRadius:6,
                border:'1px solid #e5e7eb',
                  fontSize:'0.75rem',
                  color:'#94a3b8',
                  textAlign:'center'
                }}>
                rosterbhai.app
              </div>
            </div>
            {/* Dashboard Preview */}
            <div style={{padding:'2rem',background:'#f8fafc'}}>
              <div style={{background:'white',padding:'1.5rem',borderRadius:10,border:'1px solid #e5e7eb',marginBottom:'1rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
                  <div style={{height:24,width:120,background:'#e5e7eb',borderRadius:4}} />
                  <div style={{height:32,width:100,background:'#2563eb',borderRadius:6,opacity:0.8}} />
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem'}}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{height:80,background:'#f8fafc',borderRadius:8,border:'1px solid #e5e7eb'}} />
                  ))}
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'0.5rem'}}>
                {Array.from({length:35}).map((_,i) => (
                  <div key={i} style={{
                    height:60,
                    background:i % 7 === 0 || i % 7 === 6 ? '#f8fafc' : 'white',
                    borderRadius:6,
                    border:'1px solid #e5e7eb',
                    opacity: i < 7 ? 1 : 0.6
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (min-width: 1024px) {
          .hero-grid {
            grid-template-columns: 0.9fr 1.1fr;
          }
          .hero-text {
            text-align: left;
          }
          .hero-text h1 {
            font-size: 4rem;
          }
          .hero-text p {
            margin: 0 0 2rem 0;
          }
          .hero-text > div:last-of-type {
            justify-content: flex-start;
          }
        }
      `}</style>
    </section>
  );
}

function LogoCloud(){
  const [logos, setLogos] = useState<Array<{name: string; url: string; image: string}>>([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    // Fetch logos from CMS API
    fetch('/api/public/landing-cms/logos')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.logos) {
          setLogos(data.logos);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  });

  if (loading || logos.length === 0) return null;

  // Duplicate logos for infinite scroll effect
  const duplicatedLogos = [...logos, ...logos];

  return (
    <section style={{padding:'4rem 2rem',background:'white',overflow:'hidden'}}>
      <div style={{maxWidth:1400,margin:'0 auto',textAlign:'center'}}>
        <p style={{fontSize:'0.875rem',fontWeight:700,color:'#64748b',marginBottom:'3rem',letterSpacing:'0.1em'}}>
          TRUSTED BY LEADING ORGANIZATIONS
        </p>
        <div style={{
          position:'relative',
          display:'flex',
          overflow:'hidden',
          userSelect:'none'
        }}>
          <div 
            style={{
              display:'flex',
              gap:'4rem',
              animation:'scroll 30s linear infinite',
              paddingRight:'4rem'
            }}
            className="logo-scroll"
          >
            {duplicatedLogos.map((logo, i) => (
              <a
                key={i}
                href={logo.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  minWidth:150,
                  opacity:0.5,
                  transition:'opacity 0.3s',
                  textDecoration:'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  (e.currentTarget.querySelector('img') as HTMLImageElement).style.filter = 'grayscale(0%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.5';
                  (e.currentTarget.querySelector('img') as HTMLImageElement).style.filter = 'grayscale(100%)';
                }}
              >
                <img
                  src={logo.image}
                  alt={logo.name}
                  style={{
                    maxWidth:150,
                    maxHeight:60,
                    objectFit:'contain',
                    filter:'grayscale(100%)',
                    transition:'filter 0.3s'
                  }}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .logo-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

function BenefitsSection(){
  const benefits = [
    {
      icon: Rocket,
      title: 'Launch Faster',
      description: 'Get your team organized in minutes, not weeks. Start managing rosters immediately with our intuitive platform.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Empower your team with shift swapping, schedule requests, and real-time notifications for seamless coordination.'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and secure data storage. Your team information is always protected and compliant.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Sub-second response times and real-time updates. Your roster changes sync instantly across all devices.'
    }
  ];

  return (
    <section id="benefits" style={{padding:'5rem 2rem',background:'#f8fafc'}}>
      <div style={{maxWidth:1400,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr',gap:'3rem',alignItems:'center'}} className="benefits-grid">
          <div>
            <div style={{color:'#2563eb',fontWeight:700,fontSize:'0.875rem',marginBottom:'0.5rem',letterSpacing:'0.05em'}}>
              BENEFITS
            </div>
            <h2 style={{fontSize:'2.5rem',fontWeight:800,color:'#1e293b',marginBottom:'1rem'}}>
              Why Choose RosterBhai
            </h2>
            <p style={{fontSize:'1.125rem',color:'#64748b',lineHeight:1.6}}>
              Stop wasting time on spreadsheets and manual scheduling. Get a battle-tested platform that lets you focus on what matters - managing your team effectively.
            </p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1.5rem'}}>
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} style={{
                  background:'white',
                  padding:'2rem',
                  borderRadius:12,
                  border:'1px solid #e5e7eb',
                  position:'relative',
                  overflow:'hidden',
                  transition:'all 0.3s'
                }}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'1.5rem'}}>
                    <div style={{
                      width:56,
                      height:56,
                      background:'#2563eb',
                      borderRadius:10,
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center'
                    }}>
                      <Icon size={28} style={{color:'white'}} />
                    </div>
                    <div style={{
                      fontSize:'4rem',
                      fontWeight:800,
                      color:'#e2e8f0',
                      lineHeight:1
                    }}>
                      0{index + 1}
                    </div>
                  </div>
                  <h3 style={{fontSize:'1.25rem',fontWeight:700,color:'#1e293b',marginBottom:'0.75rem'}}>
                    {benefit.title}
                  </h3>
                  <p style={{color:'#64748b',lineHeight:1.6}}>
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (min-width: 1024px) {
          .benefits-grid {
            grid-template-columns: 0.8fr 1.2fr;
          }
        }
      `}</style>
    </section>
  );
}

function FeaturesSection(){
  const features = [
    { icon: Calendar, title: 'Smart Scheduling', desc: 'AI-powered roster generation and conflict detection' },
    { icon: Users, title: 'Team Management', desc: 'Organize employees, teams, and departments efficiently' },
    { icon: Bell, title: 'Real-Time Notifications', desc: 'Instant alerts for schedule changes and requests' },
    { icon: Clock, title: 'Shift Swapping', desc: 'Let employees swap shifts with manager approval' },
    { icon: FileText, title: 'Comprehensive Reports', desc: 'Export rosters and analyze team data' },
    { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track hours, coverage, and team metrics' }
  ];

  return (
    <section id="features" style={{padding:'5rem 2rem',background:'white'}}>
      <div style={{maxWidth:1400,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'3rem'}}>
          <div style={{color:'#2563eb',fontWeight:700,fontSize:'0.875rem',marginBottom:'0.5rem',letterSpacing:'0.05em'}}>
            FEATURES
          </div>
          <h2 style={{fontSize:'2.5rem',fontWeight:800,color:'#1e293b',marginBottom:'1rem'}}>
            Everything You Need
          </h2>
          <p style={{fontSize:'1.125rem',color:'#64748b',maxWidth:600,margin:'0 auto'}}>
            Powerful features designed to make roster management effortless
          </p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'2rem'}}>
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} style={{
                padding:'2rem',
                borderRadius:12,
                border:'1px solid #e5e7eb',
                background:'white',
                transition:'all 0.3s'
              }}>
                <div style={{
                  width:56,
                  height:56,
                  background:'#dbeafe',
                  borderRadius:10,
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  marginBottom:'1.5rem'
                }}>
                  <Icon size={28} style={{color:'#2563eb'}} />
                </div>
                <h3 style={{fontSize:'1.25rem',fontWeight:700,color:'#1e293b',marginBottom:'0.75rem'}}>
                  {feature.title}
                </h3>
                <p style={{color:'#64748b',lineHeight:1.6}}>
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection(){
  const steps = [
    { number: 1, title: 'Sign Up', desc: 'Create your organization account in minutes' },
    { number: 2, title: 'Add Your Team', desc: 'Import employees and set up departments' },
    { number: 3, title: 'Create Rosters', desc: 'Build schedules with our intuitive tools' },
    { number: 4, title: 'Go Live', desc: 'Share rosters and manage in real-time' }
  ];

  return (
    <section style={{padding:'5rem 2rem',background:'#1e3a8a',color:'white'}}>
      <div style={{maxWidth:1400,margin:'0 auto',textAlign:'center'}}>
        <div style={{marginBottom:'3rem'}}>
          <div style={{fontWeight:700,fontSize:'0.875rem',marginBottom:'0.5rem',letterSpacing:'0.05em',color:'white'}}>
            HOW IT WORKS
          </div>
          <h2 style={{fontSize:'2.5rem',fontWeight:800,marginBottom:'1rem',color:'white'}}>
            Get Started in 4 Simple Steps
          </h2>
          <p style={{fontSize:'1.125rem',maxWidth:600,margin:'0 auto',color:'white'}}>
            From signup to managing your first roster in under 15 minutes
          </p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'2rem'}}>
          {steps.map((step) => (
            <div key={step.number} style={{
              background:'rgba(255,255,255,0.1)',
              padding:'2rem 1.5rem',
              borderRadius:12,
              border:'1px solid rgba(255,255,255,0.2)',
              backdropFilter:'blur(10px)'
            }}>
              <div style={{
                width:56,
                height:56,
                background:'white',
                color:'#1e40af',
                borderRadius:'50%',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                margin:'0 auto 1.5rem',
                fontSize:'1.5rem',
                fontWeight:800
              }}>
                {step.number}
              </div>
              <h3 style={{fontSize:'1.25rem',fontWeight:700,marginBottom:'0.75rem',color:'white'}}>
                {step.title}
              </h3>
              <p style={{lineHeight:1.6,color:'white'}}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection(){
  const plans = [
    {
      name: 'Monthly',
      price: 3000,
      period: 'month',
      popular: false,
      features: [
        'Unlimited employees',
        'Real-time updates',
        'Shift swapping',
        'Mobile access',
        'Email notifications',
        'CSV export',
        'Email support'
      ]
    },
    {
      name: 'Yearly',
      price: 30000,
      period: 'year',
      popular: true,
      savings: '৳6,000',
      features: [
        'Everything in Monthly',
        'Save ৳6,000 (2 months free)',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
        'API access',
        'Dedicated account manager'
      ]
    }
  ];

  return (
    <section id="pricing" style={{padding:'5rem 2rem',background:'white'}}>
      <div style={{maxWidth:1400,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'3rem'}}>
          <div style={{color:'#2563eb',fontWeight:700,fontSize:'0.875rem',marginBottom:'0.5rem',letterSpacing:'0.05em'}}>
            PRICING
          </div>
          <h2 style={{fontSize:'2.5rem',fontWeight:800,color:'#1e293b',marginBottom:'1rem'}}>
            Get Unlimited Access
          </h2>
          <p style={{fontSize:'1.125rem',color:'#64748b',maxWidth:600,margin:'0 auto'}}>
            Choose the perfect plan that fits your needs and budget
          </p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:'2rem',maxWidth:900,margin:'0 auto'}}>
          {plans.map((plan) => (
            <div key={plan.name} style={{
              border: plan.popular ? '2px solid #2563eb' : '1px solid #e5e7eb',
              borderRadius:16,
              padding:'2rem',
              background: plan.popular ? '#eff6ff' : 'white',
              position:'relative',
              transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
              boxShadow: plan.popular ? '0 10px 40px rgba(37,99,235,0.15)' : 'none'
            }}>
              {plan.popular && (
                <div style={{
                  position:'absolute',
                  top:-12,
                  left:'50%',
                  transform:'translateX(-50%)',
                  background:'#2563eb',
                  color:'white',
                  padding:'0.375rem 1rem',
                  borderRadius:20,
                  fontSize:'0.75rem',
                  fontWeight:700,
                  letterSpacing:'0.05em'
                }}>
                  MOST POPULAR
                </div>
              )}

              <div style={{marginBottom:'1.5rem'}}>
                <h3 style={{fontSize:'1.5rem',fontWeight:700,color:'#1e293b',marginBottom:'0.5rem'}}>
                  {plan.name}
                </h3>
                <div style={{display:'flex',alignItems:'baseline',gap:'0.5rem',marginBottom:'1rem'}}>
                  <span style={{fontSize:'2.5rem',fontWeight:800,color: plan.popular ? '#2563eb' : '#1e293b'}}>
                    ৳{plan.price.toLocaleString()}
                  </span>
                  <span style={{color:'#64748b'}}>/{plan.period}</span>
                </div>
                {plan.savings && (
                  <div style={{
                    display:'inline-block',
                    background:'#dcfce7',
                    color:'#15803d',
                    padding:'0.25rem 0.75rem',
                    borderRadius:6,
                    fontSize:'0.875rem',
                    fontWeight:600
                  }}>
                    Save {plan.savings}
                  </div>
                )}
              </div>

              <Link href="/pricing#signup" style={{
                display:'block',
                padding:'1rem',
                background: plan.popular ? '#2563eb' : '#f1f5f9',
                color: plan.popular ? 'white' : '#1e293b',
                textAlign:'center',
                borderRadius:10,
                fontWeight:700,
                textDecoration:'none',
                marginBottom:'2rem',
                border: plan.popular ? 'none' : '1px solid #e5e7eb'
              }}>
                Get Started
              </Link>

              <div style={{paddingTop:'2rem',borderTop:'1px solid #e5e7eb'}}>
                <div style={{fontWeight:600,color:'#1e293b',marginBottom:'1rem',fontSize:'0.875rem'}}>
                  WHAT'S INCLUDED:
                </div>
                {plan.features.map((feature, i) => (
                  <div key={i} style={{display:'flex',gap:'0.75rem',alignItems:'flex-start',marginBottom:'0.75rem'}}>
                    <Check size={18} style={{color:'#10b981',flexShrink:0,marginTop:'0.125rem'}} />
                    <span style={{color:'#64748b',fontSize:'0.875rem'}}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection(){
  const testimonials = [
    {
      name: 'Sarah Ahmed',
      role: 'Operations Manager',
      company: 'TechCorp BD',
      text: 'RosterBhai transformed how we manage our 50+ person team. Shift conflicts are a thing of the past!',
      rating: 5
    },
    {
      name: 'Karim Hassan',
      role: 'HR Director',
      company: 'RetailChain',
      text: 'The shift swap feature alone saved us countless hours. Our employees love the mobile access.',
      rating: 5
    },
    {
      name: 'Nadia Khan',
      role: 'Team Lead',
      company: 'Healthcare Plus',
      text: 'Finally, a roster system that actually works! Real-time updates keep everyone on the same page.',
      rating: 5
    }
  ];

  return (
    <section style={{padding:'5rem 2rem',background:'#f8fafc'}}>
      <div style={{maxWidth:1400,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'3rem'}}>
          <div style={{color:'#2563eb',fontWeight:700,fontSize:'0.875rem',marginBottom:'0.5rem',letterSpacing:'0.05em'}}>
            TESTIMONIALS
          </div>
          <h2 style={{fontSize:'2.5rem',fontWeight:800,color:'#1e293b',marginBottom:'1rem'}}>
            Loved by Teams Everywhere
          </h2>
          <p style={{fontSize:'1.125rem',color:'#64748b'}}>
            See what our customers have to say
          </p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'2rem'}}>
          {testimonials.map((testimonial, i) => (
            <div key={i} style={{
              background:'white',
              padding:'2rem',
              borderRadius:12,
              border:'1px solid #e5e7eb'
            }}>
              <div style={{display:'flex',gap:'0.25rem',marginBottom:'1rem'}}>
                {Array.from({length: 5}).map((_, i) => (
                  <span key={i} style={{color:'#f59e0b',fontSize:'1.125rem'}}>★</span>
                ))}
              </div>
              <p style={{color:'#64748b',lineHeight:1.6,marginBottom:'1.5rem',fontSize:'0.9375rem'}}>
                "{testimonial.text}"
              </p>
              <div>
                <div style={{fontWeight:700,color:'#1e293b'}}>{testimonial.name}</div>
                <div style={{fontSize:'0.875rem',color:'#64748b'}}>{testimonial.role} at {testimonial.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection(){
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqs = [
    {
      question: 'How quickly can I get started?',
      answer: 'You can be up and running in under 15 minutes. Simply sign up, add your team, and start creating rosters immediately.'
    },
    {
      question: 'Is there a limit on team size?',
      answer: 'No! Both plans support unlimited employees. Manage teams of any size without restrictions.'
    },
    {
      question: 'Can employees access their schedules on mobile?',
      answer: 'Yes, RosterBhai is fully responsive and works perfectly on any device - desktop, tablet, or smartphone.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major payment methods including bKash, Nagad, credit cards, and bank transfers for yearly plans.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your subscription at any time. No long-term commitments required.'
    }
  ];

  return (
    <section id="faq" style={{padding:'5rem 2rem',background:'white'}}>
      <div style={{maxWidth:800,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'3rem'}}>
          <div style={{color:'#2563eb',fontWeight:700,fontSize:'0.875rem',marginBottom:'0.5rem',letterSpacing:'0.05em'}}>
            FAQS
          </div>
          <h2 style={{fontSize:'2.5rem',fontWeight:800,color:'#1e293b',marginBottom:'1rem'}}>
            Common Questions
          </h2>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          {faqs.map((faq, index) => (
            <div key={index} style={{
              border:'1px solid #e5e7eb',
              borderRadius:12,
              overflow:'hidden',
              background:'white'
            }}>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                style={{
                  width:'100%',
                  padding:'1.5rem',
                  display:'flex',
                  justifyContent:'space-between',
                  alignItems:'center',
                  background:'white',
                  border:'none',
                  cursor:'pointer',
                  textAlign:'left'
                }}
              >
                <span style={{fontWeight:600,color:'#1e293b',fontSize:'1.0625rem'}}>
                  {faq.question}
                </span>
                <ChevronDown 
                  size={20} 
                  style={{
                    color:'#64748b',
                    transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition:'transform 0.2s'
                  }} 
                />
              </button>
              {openIndex === index && (
                <div style={{
                  padding:'0 1.5rem 1.5rem',
                  color:'#64748b',
                  lineHeight:1.6
                }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection(){
  return (
    <section style={{padding:'5rem 2rem',background:'#0f172a',color:'white',textAlign:'center'}}>
      <div style={{maxWidth:800,margin:'0 auto'}}>
        <h2 style={{fontSize:'2.5rem',fontWeight:800,marginBottom:'1.5rem',color:'white'}}>
          Ready to Transform Your Team Management?
        </h2>
        <p style={{fontSize:'1.125rem',marginBottom:'2rem',color:'white'}}>
          Join hundreds of organizations who trust RosterBhai to manage their teams
        </p>
        <div style={{display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap'}}>
          <Link href="/pricing#signup" style={{
            display:'inline-flex',
            alignItems:'center',
            gap:'0.5rem',
            padding:'1rem 2rem',
            background:'#2563eb',
            color:'white',
            textDecoration:'none',
            borderRadius:10,
            fontWeight:700,
            fontSize:'1.05rem',
            boxShadow:'0 4px 12px rgba(37,99,235,0.3)'
          }}>
            Start Free Trial
            <ArrowRight size={20} />
          </Link>
          <a href="/contact" style={{
            display:'inline-flex',
            alignItems:'center',
            padding:'1rem 2rem',
            background:'transparent',
            color:'white',
            textDecoration:'none',
            borderRadius:10,
            fontWeight:700,
            fontSize:'1.05rem',
            border:'2px solid rgba(255,255,255,0.3)'
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
    <footer style={{background:'#0f172a',color:'white',padding:'3rem 2rem 2rem'}}>
      <div style={{maxWidth:1400,margin:'0 auto'}}>
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
            <p style={{color:'#94a3b8',fontSize:'0.875rem',lineHeight:1.6}}>
              Modern roster management for forward-thinking teams
            </p>
          </div>
          <div>
            <h4 style={{fontWeight:700,marginBottom:'1rem'}}>Product</h4>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              <a href="#features" style={{color:'#94a3b8',textDecoration:'none',fontSize:'0.875rem'}}>Features</a>
              <a href="#pricing" style={{color:'#94a3b8',textDecoration:'none',fontSize:'0.875rem'}}>Pricing</a>
              <a href="#faq" style={{color:'#94a3b8',textDecoration:'none',fontSize:'0.875rem'}}>FAQ</a>
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
            <h4 style={{fontWeight:700,marginBottom:'1rem'}}>Legal</h4>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              <a href="#" style={{color:'#94a3b8',textDecoration:'none',fontSize:'0.875rem'}}>Privacy Policy</a>
              <a href="#" style={{color:'#94a3b8',textDecoration:'none',fontSize:'0.875rem'}}>Terms of Service</a>
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
