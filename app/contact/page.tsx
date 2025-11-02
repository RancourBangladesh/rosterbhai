"use client";
import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Headphones } from 'lucide-react';
import MarketingNavbar from '@/components/MarketingNavbar';

export default function ContactPage(){
  return (
    <div style={{minHeight:'100vh',background:'#ffffff'}}>
      <MarketingNavbar currentPage="contact" />
      <HeroSection />
      <ContactSection />
      <InfoSection />
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
          Get in Touch
        </h1>
        <p style={{
          fontSize:'1.25rem',
          color:'#64748b',
          marginBottom:'2rem'
        }}>
          Have questions? We're here to help. Reach out and we'll respond as soon as possible.
        </p>
      </div>
    </section>
  );
}

function ContactSection(){
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [subject,setSubject]=useState('');
  const [message,setMessage]=useState('');
  const [sent,setSent]=useState(false);
  const [loading,setLoading]=useState(false);

  async function handleSubmit(e:React.FormEvent){
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSent(true);
    setLoading(false);
  }

  return (
    <section style={{padding:'4rem 2rem',background:'white'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(400px,1fr))',gap:'3rem'}}>
          {/* Contact Form */}
          <div>
            <h2 style={{fontSize:'2rem',fontWeight:800,color:'#1e293b',marginBottom:'1rem'}}>
              Send us a Message
            </h2>
            <p style={{color:'#64748b',marginBottom:'2rem'}}>
              Fill out the form below and our team will get back to you within 24 hours.
            </p>
            {!sent ? (
              <form onSubmit={handleSubmit} style={{display:'grid',gap:'1.5rem'}}>
                <div>
                  <label style={{display:'block',fontWeight:600,color:'#1e293b',marginBottom:'0.5rem',fontSize:'0.875rem'}}>
                    Your Name *
                  </label>
                  <input 
                    value={name} 
                    onChange={e=>setName(e.target.value)} 
                    required 
                    placeholder="John Doe"
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
                    Email Address *
                  </label>
                  <input 
                    value={email} 
                    onChange={e=>setEmail(e.target.value)} 
                    required 
                    type="email"
                    placeholder="john@company.com"
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
                    Subject *
                  </label>
                  <input 
                    value={subject} 
                    onChange={e=>setSubject(e.target.value)} 
                    required 
                    placeholder="How can we help?"
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
                    Message *
                  </label>
                  <textarea 
                    value={message} 
                    onChange={e=>setMessage(e.target.value)} 
                    required 
                    rows={6}
                    placeholder="Tell us more about your inquiry..."
                    style={{
                      width:'100%',
                      padding:'1rem 1.25rem',
                      border:'2px solid #e5e7eb',
                      borderRadius:10,
                      fontSize:'1rem',
                      transition:'all 0.2s',
                      outline:'none',
                      fontFamily:'inherit',
                      resize:'vertical'
                    }}
                    onFocus={(e)=>e.target.style.borderColor='#2563eb'}
                    onBlur={(e)=>e.target.style.borderColor='#e5e7eb'}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  style={{
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    gap:'0.5rem',
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
                >
                  <Send size={20} />
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            ) : (
              <div style={{
                padding:'2rem',
                background:'#dcfce7',
                borderRadius:12,
                border:'2px solid #86efac',
                textAlign:'center'
              }}>
                <div style={{fontSize:'3rem',marginBottom:'1rem'}}>✅</div>
                <h3 style={{fontSize:'1.5rem',fontWeight:700,color:'#15803d',marginBottom:'0.5rem'}}>
                  Message Sent!
                </h3>
                <p style={{color:'#166534'}}>
                  Thanks for reaching out! We'll get back to you within 24 hours.
                </p>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <h2 style={{fontSize:'2rem',fontWeight:800,color:'#1e293b',marginBottom:'1rem'}}>
              Contact Information
            </h2>
            <p style={{color:'#64748b',marginBottom:'2rem'}}>
              Prefer to reach out directly? Here's how you can get in touch with us.
            </p>

            <div style={{display:'grid',gap:'1.5rem'}}>
              <div style={{
                padding:'1.5rem',
                background:'#f8fafc',
                borderRadius:12,
                border:'1px solid #e5e7eb',
                display:'flex',
                gap:'1rem'
              }}>
                <div style={{
                  width:48,height:48,
                  background:'#dbeafe',
                  borderRadius:10,
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  flexShrink:0
                }}>
                  <Mail size={24} style={{color:'#2563eb'}}/>
                </div>
                <div>
                  <div style={{fontWeight:700,color:'#1e293b',marginBottom:'0.25rem'}}>Email</div>
                  <a href="mailto:support@rosterbhai.com" style={{color:'#2563eb',textDecoration:'none'}}>
                    support@rosterbhai.com
                  </a>
                </div>
              </div>

              <div style={{
                padding:'1.5rem',
                background:'#f8fafc',
                borderRadius:12,
                border:'1px solid #e5e7eb',
                display:'flex',
                gap:'1rem'
              }}>
                <div style={{
                  width:48,height:48,
                  background:'#dbeafe',
                  borderRadius:10,
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  flexShrink:0
                }}>
                  <Phone size={24} style={{color:'#2563eb'}}/>
                </div>
                <div>
                  <div style={{fontWeight:700,color:'#1e293b',marginBottom:'0.25rem'}}>Phone</div>
                  <a href="tel:+8801XXXXXXXXX" style={{color:'#2563eb',textDecoration:'none'}}>
                    +880 1XXX-XXXXXX
                  </a>
                </div>
              </div>

              <div style={{
                padding:'1.5rem',
                background:'#f8fafc',
                borderRadius:12,
                border:'1px solid #e5e7eb',
                display:'flex',
                gap:'1rem'
              }}>
                <div style={{
                  width:48,height:48,
                  background:'#dbeafe',
                  borderRadius:10,
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  flexShrink:0
                }}>
                  <Clock size={24} style={{color:'#2563eb'}}/>
                </div>
                <div>
                  <div style={{fontWeight:700,color:'#1e293b',marginBottom:'0.25rem'}}>Business Hours</div>
                  <div style={{color:'#64748b'}}>Monday - Friday: 9:00 AM - 6:00 PM</div>
                  <div style={{color:'#64748b',fontSize:'0.875rem'}}>Saturday: 10:00 AM - 2:00 PM</div>
                </div>
              </div>

              <div style={{
                padding:'1.5rem',
                background:'#f8fafc',
                borderRadius:12,
                border:'1px solid #e5e7eb',
                display:'flex',
                gap:'1rem'
              }}>
                <div style={{
                  width:48,height:48,
                  background:'#dbeafe',
                  borderRadius:10,
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  flexShrink:0
                }}>
                  <MapPin size={24} style={{color:'#2563eb'}}/>
                </div>
                <div>
                  <div style={{fontWeight:700,color:'#1e293b',marginBottom:'0.25rem'}}>Address</div>
                  <div style={{color:'#64748b'}}>Dhaka, Bangladesh</div>
                </div>
              </div>
            </div>

            <div style={{
              marginTop:'2rem',
              padding:'1.5rem',
              background:'#eff6ff',
              borderRadius:12,
              border:'2px solid #bfdbfe'
            }}>
              <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1rem'}}>
                <Headphones size={24} style={{color:'#2563eb'}}/>
                <h3 style={{fontSize:'1.25rem',fontWeight:700,color:'#1e293b'}}>Need Immediate Help?</h3>
              </div>
              <p style={{color:'#475569',marginBottom:'1rem',fontSize:'0.875rem'}}>
                Our support team is available to assist you with any urgent issues.
              </p>
              <a href="mailto:support@rosterbhai.com" style={{
                display:'inline-block',
                padding:'0.75rem 1.5rem',
                background:'#2563eb',
                color:'white',
                textDecoration:'none',
                borderRadius:8,
                fontWeight:600,
                fontSize:'0.875rem',
                transition:'all 0.2s'
              }}>
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoSection(){
  const faqs = [
    {
      icon: MessageSquare,
      title: 'Sales Inquiries',
      desc: 'Interested in RosterBhai for your organization? Contact our sales team for a demo.',
      action: 'sales@rosterbhai.com'
    },
    {
      icon: Headphones,
      title: 'Technical Support',
      desc: 'Experiencing technical issues? Our support team is here to help.',
      action: 'support@rosterbhai.com'
    },
    {
      icon: Mail,
      title: 'General Questions',
      desc: 'Have general questions about our platform? We\'d love to hear from you.',
      action: 'info@rosterbhai.com'
    }
  ];

  return (
    <section style={{padding:'4rem 2rem',background:'#f8fafc'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'3rem'}}>
          <h2 style={{fontSize:'2.5rem',fontWeight:800,color:'#1e293b',marginBottom:'1rem'}}>
            Other Ways to Connect
          </h2>
          <p style={{fontSize:'1.125rem',color:'#64748b'}}>
            Choose the best way to reach us based on your needs
          </p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'2rem'}}>
          {faqs.map((faq,i)=>{
            const Icon = faq.icon;
            return (
              <div key={i} style={{
                background:'white',
                padding:'2rem',
                borderRadius:12,
                border:'2px solid #e5e7eb',
                textAlign:'center'
              }}>
                <div style={{
                  width:56,height:56,
                  background:'#dbeafe',
                  borderRadius:10,
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  margin:'0 auto 1.5rem'
                }}>
                  <Icon size={28} style={{color:'#2563eb'}}/>
                </div>
                <h3 style={{fontSize:'1.25rem',fontWeight:700,color:'#1e293b',marginBottom:'0.75rem'}}>
                  {faq.title}
                </h3>
                <p style={{color:'#64748b',marginBottom:'1rem',fontSize:'0.875rem'}}>
                  {faq.desc}
                </p>
                <a href={`mailto:${faq.action}`} style={{
                  color:'#2563eb',
                  fontWeight:600,
                  textDecoration:'none',
                  fontSize:'0.875rem'
                }}>
                  {faq.action}
                </a>
              </div>
            );
          })}
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
