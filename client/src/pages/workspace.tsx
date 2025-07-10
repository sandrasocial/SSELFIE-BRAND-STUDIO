import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Navigation } from '@/components/navigation';
import { PaymentVerification } from '@/components/payment-verification';
import { SandraImages } from '@/lib/sandra-images';

export default function Workspace() {
  const { user, isAuthenticated } = useAuth();

  // Fetch user data
  const { data: aiImages = [] } = useQuery({
    queryKey: ['/api/ai-images'],
    enabled: isAuthenticated
  });

  const { data: userModel } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated
  });

  const { data: onboardingData } = useQuery({
    queryKey: ['/api/onboarding'],
    enabled: isAuthenticated
  });

  const { data: brandbook } = useQuery({
    queryKey: ['/api/brandbook'],
    enabled: isAuthenticated
  });

  const { data: subscription } = useQuery({
    queryKey: ['/api/subscription'],
    enabled: isAuthenticated
  });

  // Business progress calculation
  const getBusinessProgress = () => {
    const steps = [
      {
        id: 'ai-model',
        label: 'AI Model Trained',
        status: userModel?.status === 'completed' ? 'complete' : userModel?.status === 'training' ? 'progress' : 'pending',
        detail: aiImages.length > 0 ? `${aiImages.length} images ready` : 'Ready to train',
        link: '/ai-generator'
      },
      {
        id: 'styleguide',
        label: 'Styleguide Created',
        status: brandbook ? 'complete' : onboardingData?.completed ? 'progress' : 'pending',
        detail: brandbook?.templateId ? brandbook.templateId.replace('-', ' ') : 'Choose your style',
        link: '/styleguide-demo'
      },
      {
        id: 'landing-page',
        label: 'Landing Page',
        status: 'progress',
        detail: 'In Progress',
        link: '/styleguide-landing-builder'
      },
      {
        id: 'payment-setup',
        label: 'Payment Setup',
        status: 'pending',
        detail: 'Coming Next',
        link: '/workspace'
      },
      {
        id: 'domain',
        label: 'Custom Domain',
        status: 'pending',
        detail: 'Coming Next',
        link: '/workspace'
      }
    ];
    
    return steps;
  };

  const getUsageStats = () => {
    const monthlyLimit = subscription?.plan === 'sselfie-studio' ? 300 : 100;
    return {
      used: aiImages.length || 0,
      total: monthlyLimit,
      percentage: Math.round(((aiImages.length || 0) / monthlyLimit) * 100)
    };
  };

  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontWeight: 300,
        color: '#0a0a0a'
      }}>
        <Navigation />
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '120px 40px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontFamily: 'Times New Roman, serif',
            fontSize: 'clamp(3rem, 6vw, 6rem)',
            fontWeight: 200,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            marginBottom: '24px',
            lineHeight: 1
          }}>
            Please Sign In
          </h1>
          <p style={{
            fontSize: '16px',
            lineHeight: 1.6,
            fontWeight: 300,
            maxWidth: '600px',
            margin: '0 auto 40px auto',
            color: '#666666'
          }}>
            You need to be signed in to access your STUDIO.
          </p>
          <a
            href="/api/login"
            style={{
              display: 'inline-block',
              padding: '16px 32px',
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              border: '1px solid #0a0a0a',
              color: '#0a0a0a',
              background: 'transparent',
              transition: 'all 300ms ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#0a0a0a';
              e.target.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#0a0a0a';
            }}
          >
            SIGN IN
          </a>
        </div>
      </div>
    );
  }

  const businessProgress = getBusinessProgress();
  const usageStats = getUsageStats();

  return (
    <PaymentVerification>
      <div style={{ 
        minHeight: '100vh', 
        background: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontWeight: 300,
        color: '#0a0a0a'
      }}>
        <Navigation />
        
        {/* Hero Section with Editorial Background */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.4
          }}>
            <img 
              src={SandraImages.hero.dashboard}
              alt="Studio dashboard"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          <div style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: 'none'
          }}>
            <div style={{
              fontSize: '11px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '40px',
              fontWeight: 300
            }}>
              {user?.email ? `Welcome back, ${user.email.split('@')[0]}` : 'It starts with your selfies'}
            </div>
            <h1 style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(5rem, 12vw, 12rem)',
              lineHeight: 0.9,
              fontWeight: 200,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              marginBottom: '20px'
            }}>
              STUDIO
            </h1>
            <div style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(1.5rem, 4vw, 3rem)',
              lineHeight: 1,
              fontWeight: 200,
              letterSpacing: '0.5em',
              textTransform: 'uppercase',
              opacity: 0.8,
              marginBottom: '60px'
            }}>
              COMMAND CENTER
            </div>
            <div style={{
              fontSize: '16px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              opacity: 0.8,
              fontWeight: 300,
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Your mess is your message
            </div>
          </div>
        </section>

        {/* Business Progress Section */}
        <section style={{ padding: '120px 0', background: '#f5f5f5' }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 40px'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: '#666666',
              marginBottom: '24px'
            }}>
              FOUNDATION
            </div>
            <h2 style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(3rem, 6vw, 6rem)',
              fontWeight: 200,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              marginBottom: '32px',
              lineHeight: 1
            }}>
              Business Progress
            </h2>
            <p style={{
              fontSize: '20px',
              lineHeight: 1.5,
              fontWeight: 300,
              maxWidth: '600px',
              marginBottom: '80px'
            }}>
              Every step builds your empire. Track your journey from selfie to CEO.
            </p>
            
            {/* Progress Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '8px',
              margin: '80px 0'
            }}>
              {businessProgress.map((step, index) => (
                <Link key={step.id} href={step.link}>
                  <div style={{
                    background: '#ffffff',
                    position: 'relative',
                    transition: 'all 500ms ease',
                    cursor: 'pointer',
                    border: '1px solid #e5e5e5'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0a0a0a';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.color = '#0a0a0a';
                  }}>
                    <div style={{ padding: '60px' }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 400,
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        color: '#666666',
                        marginBottom: '20px'
                      }}>
                        Step {index + 1}
                      </div>
                      <h3 style={{
                        fontFamily: 'Times New Roman, serif',
                        fontSize: 'clamp(2rem, 4vw, 4rem)',
                        fontWeight: 200,
                        letterSpacing: '-0.01em',
                        textTransform: 'uppercase',
                        marginBottom: '24px',
                        lineHeight: 1
                      }}>
                        {step.label.split(' ').map((word, i) => (
                          <span key={i}>
                            {word}
                            {i < step.label.split(' ').length - 1 && <br />}
                          </span>
                        ))}
                      </h3>
                      <p style={{
                        fontSize: '16px',
                        lineHeight: 1.6,
                        fontWeight: 300,
                        marginBottom: '24px'
                      }}>
                        {step.detail}
                      </p>
                      <div style={{
                        fontSize: '24px',
                        opacity: 0.3
                      }}>
                        {step.status === 'complete' ? '✓' : step.status === 'progress' ? '→' : '•'}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: 'Times New Roman, serif',
                      fontSize: '120px',
                      position: 'absolute',
                      top: '20px',
                      right: '30px',
                      opacity: 0.1,
                      lineHeight: 1
                    }}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Tools Section */}
        <section style={{ padding: '120px 0' }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 40px'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: '#666666',
              marginBottom: '24px'
            }}>
              BUILDING BLOCKS
            </div>
            <h2 style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(3rem, 6vw, 6rem)',
              fontWeight: 200,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              marginBottom: '32px',
              lineHeight: 1
            }}>
              Quick Access Tools
            </h2>
            <p style={{
              fontSize: '20px',
              lineHeight: 1.5,
              fontWeight: 300,
              maxWidth: '600px',
              marginBottom: '80px'
            }}>
              Every element designed to make you feel seen, not sold to.
            </p>
            
            {/* Tools Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: '30px'
            }}>
              {/* AI Photoshoot */}
              <Link href="/ai-generator">
                <div style={{
                  gridColumn: 'span 3',
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#f5f5f5',
                  aspectRatio: '4/5',
                  cursor: 'pointer'
                }}>
                  <img 
                    src={SandraImages.portraits.sandra2}
                    alt="AI Photoshoot"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 1000ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, transparent 50%, rgba(10, 10, 10, 0.9) 100%)',
                    opacity: 0,
                    transition: 'opacity 500ms ease',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '40px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = 1;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = 0;
                  }}>
                    <div>
                      <h4 style={{
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 400,
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        marginBottom: '8px'
                      }}>
                        AI PHOTOSHOOT
                      </h4>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '14px',
                        margin: 0
                      }}>
                        {usageStats.used}/{usageStats.total} used
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Styleguide Card */}
              <div style={{ gridColumn: 'span 3' }}>
                <Link href="/styleguide-demo">
                  <div style={{
                    background: '#ffffff',
                    position: 'relative',
                    transition: 'all 500ms ease',
                    cursor: 'pointer',
                    aspectRatio: '4/5'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0a0a0a';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.color = '#0a0a0a';
                  }}>
                    <div style={{ padding: '60px' }}>
                      <h3 style={{
                        fontFamily: 'Times New Roman, serif',
                        fontSize: 'clamp(2rem, 4vw, 4rem)',
                        fontWeight: 200,
                        letterSpacing: '-0.01em',
                        textTransform: 'uppercase',
                        marginBottom: '24px',
                        lineHeight: 1
                      }}>
                        STYLE<br/>GUIDE
                      </h3>
                      <p style={{
                        fontSize: '16px',
                        lineHeight: 1.6,
                        fontWeight: 300
                      }}>
                        {brandbook?.templateId ? brandbook.templateId.replace('-', ' ') : 'Create your brand bible'}
                      </p>
                    </div>
                    <div style={{
                      fontFamily: 'Times New Roman, serif',
                      fontSize: '120px',
                      position: 'absolute',
                      top: '20px',
                      right: '30px',
                      opacity: 0.1,
                      lineHeight: 1
                    }}>
                      02
                    </div>
                  </div>
                </Link>
              </div>

              {/* Landing Pages */}
              <Link href="/styleguide-landing-builder">
                <div style={{
                  gridColumn: 'span 3',
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#f5f5f5',
                  aspectRatio: '4/5',
                  cursor: 'pointer'
                }}>
                  <img 
                    src={SandraImages.flatlays.workspace1}
                    alt="Landing Pages"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 1000ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, transparent 50%, rgba(10, 10, 10, 0.9) 100%)',
                    opacity: 0,
                    transition: 'opacity 500ms ease',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '40px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = 1;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = 0;
                  }}>
                    <div>
                      <h4 style={{
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 400,
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        marginBottom: '8px'
                      }}>
                        LANDING PAGES
                      </h4>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '14px',
                        margin: 0
                      }}>
                        Build sales pages
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Sandra AI Card */}
              <div style={{ gridColumn: 'span 3' }}>
                <Link href="/sandra-chat">
                  <div style={{
                    background: '#0a0a0a',
                    color: '#ffffff',
                    position: 'relative',
                    transition: 'all 500ms ease',
                    cursor: 'pointer',
                    aspectRatio: '4/5'
                  }}>
                    <div style={{ padding: '60px' }}>
                      <h3 style={{
                        fontFamily: 'Times New Roman, serif',
                        fontSize: 'clamp(2rem, 4vw, 4rem)',
                        fontWeight: 200,
                        letterSpacing: '-0.01em',
                        textTransform: 'uppercase',
                        marginBottom: '24px',
                        lineHeight: 1
                      }}>
                        SANDRA<br/>AI
                      </h3>
                      <p style={{
                        fontSize: '16px',
                        lineHeight: 1.6,
                        fontWeight: 300,
                        color: 'rgba(255, 255, 255, 0.8)'
                      }}>
                        Your personal brand builder
                      </p>
                    </div>
                    <div style={{
                      fontFamily: 'Times New Roman, serif',
                      fontSize: '120px',
                      position: 'absolute',
                      top: '20px',
                      right: '30px',
                      opacity: 0.1,
                      lineHeight: 1
                    }}>
                      04
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <div style={{
          padding: '120px 0',
          textAlign: 'center',
          background: '#0a0a0a',
          color: '#ffffff'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 40px'
          }}>
            <div style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(28px, 4vw, 56px)',
              fontStyle: 'italic',
              letterSpacing: '-0.02em',
              lineHeight: 1.3,
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              "We're not just teaching selfies.<br/>
              We're building an empire<br/>
              of confident women."
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <section style={{ padding: '120px 0', background: '#f5f5f5' }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 40px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: '30px'
            }}>
              <div style={{ gridColumn: 'span 8' }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                  color: '#666666',
                  marginBottom: '24px'
                }}>
                  USAGE OVERVIEW
                </div>
                <h2 style={{
                  fontFamily: 'Times New Roman, serif',
                  fontSize: 'clamp(3rem, 6vw, 6rem)',
                  fontWeight: 200,
                  letterSpacing: '-0.01em',
                  textTransform: 'uppercase',
                  marginBottom: '32px',
                  lineHeight: 1
                }}>
                  This Month
                </h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '30px',
                  marginTop: '80px'
                }}>
                  <div style={{
                    background: '#ffffff',
                    padding: '60px',
                    border: '1px solid #e5e5e5'
                  }}>
                    <div style={{
                      fontFamily: 'Times New Roman, serif',
                      fontSize: '120px',
                      fontWeight: 200,
                      letterSpacing: '-0.01em',
                      lineHeight: 1,
                      marginBottom: '20px'
                    }}>
                      {usageStats.used}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 400,
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      color: '#666666'
                    }}>
                      IMAGES GENERATED
                    </div>
                  </div>
                  
                  <div style={{
                    background: '#ffffff',
                    padding: '60px',
                    border: '1px solid #e5e5e5'
                  }}>
                    <div style={{
                      fontFamily: 'Times New Roman, serif',
                      fontSize: '120px',
                      fontWeight: 200,
                      letterSpacing: '-0.01em',
                      lineHeight: 1,
                      marginBottom: '20px'
                    }}>
                      {businessProgress.filter(s => s.status === 'complete').length}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 400,
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      color: '#666666'
                    }}>
                      STEPS COMPLETED
                    </div>
                  </div>
                  
                  <div style={{
                    background: '#ffffff',
                    padding: '60px',
                    border: '1px solid #e5e5e5'
                  }}>
                    <div style={{
                      fontFamily: 'Times New Roman, serif',
                      fontSize: '120px',
                      fontWeight: 200,
                      letterSpacing: '-0.01em',
                      lineHeight: 1,
                      marginBottom: '20px'
                    }}>
                      {usageStats.total - usageStats.used}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 400,
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      color: '#666666'
                    }}>
                      IMAGES REMAINING
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ gridColumn: 'span 4' }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                  color: '#666666',
                  marginBottom: '24px'
                }}>
                  ACTIVITY
                </div>
                <h3 style={{
                  fontFamily: 'Times New Roman, serif',
                  fontSize: 'clamp(2rem, 4vw, 4rem)',
                  fontWeight: 200,
                  letterSpacing: '-0.01em',
                  textTransform: 'uppercase',
                  marginBottom: '40px',
                  lineHeight: 1
                }}>
                  What's New
                </h3>
                
                <div style={{ fontSize: '16px', lineHeight: 1.6, fontWeight: 300 }}>
                  {aiImages.length > 0 && (
                    <div style={{ 
                      padding: '16px 0', 
                      borderBottom: '1px solid #e5e5e5',
                      color: '#666666'
                    }}>
                      • New AI images generated (2h)
                    </div>
                  )}
                  {brandbook && (
                    <div style={{ 
                      padding: '16px 0', 
                      borderBottom: '1px solid #e5e5e5',
                      color: '#666666'
                    }}>
                      • Styleguide updated (1d)
                    </div>
                  )}
                  {userModel?.status === 'completed' && (
                    <div style={{ 
                      padding: '16px 0', 
                      borderBottom: '1px solid #e5e5e5',
                      color: '#666666'
                    }}>
                      • AI model training complete (3d)
                    </div>
                  )}
                  <div style={{ 
                    padding: '16px 0',
                    color: '#666666'
                  }}>
                    • Welcome to SSELFIE Studio (5d)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PaymentVerification>
  );
}