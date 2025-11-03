"use client";
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentPage?: 'home' | 'about' | 'pricing' | 'contact';
}

export default function MarketingNavbar({ currentPage = 'home' }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const isActive = (page: string) => currentPage === page;
  
  return (
    <div style={{position:'sticky',top:'0.5rem',zIndex:999,maxWidth:1400,margin:'0 auto',padding:'0 1rem'}}>
      <nav style={{
        borderRadius:12,
        border:'1px solid #e5e7eb',
        background:'rgba(255,255,255,0.8)',
        backdropFilter:'blur(12px)',
        boxShadow:'0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.75rem 1.5rem'}}>
          {/* Logo */}
          <Link href="/" style={{display:'flex',alignItems:'center',gap:'0.75rem',textDecoration:'none'}}>
            <div style={{
              width:40,height:40,
              background:'#2563eb',
              borderRadius:10,
              display:'flex',alignItems:'center',justifyContent:'center',
              color:'white',fontWeight:800,fontSize:'1.25rem'
            }}>R</div>
            <span style={{fontSize:'1.5rem',fontWeight:800,color:'#1e293b'}}>RosterBhai</span>
          </Link>

          {/* Desktop Nav */}
          <div style={{display:'none',gap:'2rem',alignItems:'center'}} className="desktop-nav">
            <a 
              href="/" 
              style={{
                color: isActive('home') ? '#2563eb' : '#64748b',
                textDecoration:'none',
                fontWeight: isActive('home') ? 600 : 500,
                fontSize:'0.875rem'
              }}
            >
              Home
            </a>
            <a 
              href="/about" 
              style={{
                color: isActive('about') ? '#2563eb' : '#64748b',
                textDecoration:'none',
                fontWeight: isActive('about') ? 600 : 500,
                fontSize:'0.875rem'
              }}
            >
              About
            </a>
            <a 
              href="/pricing" 
              style={{
                color: isActive('pricing') ? '#2563eb' : '#64748b',
                textDecoration:'none',
                fontWeight: isActive('pricing') ? 600 : 500,
                fontSize:'0.875rem'
              }}
            >
              Pricing
            </a>
            <a 
              href="/contact" 
              style={{
                color: isActive('contact') ? '#2563eb' : '#64748b',
                textDecoration:'none',
                fontWeight: isActive('contact') ? 600 : 500,
                fontSize:'0.875rem'
              }}
            >
              Contact
            </a>
          </div>

          {/* Desktop Actions */}
          <div style={{display:'none',gap:'0.75rem',alignItems:'center'}} className="desktop-nav">
            <Link href="/pricing#signup" style={{
              padding:'0.5rem 1.25rem',
              background:'white',
              color:'#2563eb',
              textDecoration:'none',
              borderRadius:8,
              fontWeight:600,
              fontSize:'0.875rem',
              border:'1px solid #e5e7eb'
            }}>
              Sign In
            </Link>
            <Link href="/pricing#signup" style={{
              padding:'0.5rem 1.25rem',
              background:'#2563eb',
              color:'white',
              textDecoration:'none',
              borderRadius:8,
              fontWeight:600,
              fontSize:'0.875rem',
              display:'flex',
              alignItems:'center',
              gap:'0.5rem'
            }}>
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            style={{
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              padding:'0.5rem',
              background:'white',
              border:'1px solid #e5e7eb',
              borderRadius:8,
              cursor:'pointer'
            }}
            className="mobile-menu-btn"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div style={{
            padding:'1rem 1.5rem',
            borderTop:'1px solid #e5e7eb',
            background:'white',
            borderBottomLeftRadius:12,
            borderBottomRightRadius:12
          }}>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <a 
                href="/" 
                onClick={() => setIsOpen(false)} 
                style={{
                  color: isActive('home') ? '#2563eb' : '#64748b',
                  textDecoration:'none',
                  fontWeight: isActive('home') ? 600 : 500
                }}
              >
                Home
              </a>
              <a 
                href="/about" 
                onClick={() => setIsOpen(false)} 
                style={{
                  color: isActive('about') ? '#2563eb' : '#64748b',
                  textDecoration:'none',
                  fontWeight: isActive('about') ? 600 : 500
                }}
              >
                About
              </a>
              <a 
                href="/pricing" 
                onClick={() => setIsOpen(false)} 
                style={{
                  color: isActive('pricing') ? '#2563eb' : '#64748b',
                  textDecoration:'none',
                  fontWeight: isActive('pricing') ? 600 : 500
                }}
              >
                Pricing
              </a>
              <a 
                href="/contact" 
                onClick={() => setIsOpen(false)} 
                style={{
                  color: isActive('contact') ? '#2563eb' : '#64748b',
                  textDecoration:'none',
                  fontWeight: isActive('contact') ? 600 : 500
                }}
              >
                Contact
              </a>
              <div style={{borderTop:'1px solid #e5e7eb',paddingTop:'1rem',display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                <Link href="/pricing#signup" style={{
                  padding:'0.75rem',
                  background:'white',
                  color:'#2563eb',
                  textDecoration:'none',
                  borderRadius:8,
                  fontWeight:600,
                  textAlign:'center',
                  border:'1px solid #e5e7eb'
                }}>
                  Sign In
                </Link>
                <Link href="/pricing#signup" style={{
                  padding:'0.75rem',
                  background:'#2563eb',
                  color:'white',
                  textDecoration:'none',
                  borderRadius:8,
                  fontWeight:600,
                  textAlign:'center',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  gap:'0.5rem'
                }}>
                  Get Started
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <style jsx global>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
