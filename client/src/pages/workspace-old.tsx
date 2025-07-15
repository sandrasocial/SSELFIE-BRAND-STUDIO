import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import MemberNavigation from '@/components/member-navigation';
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

  // SSELFIE Photoshoot Progress - Simplified 3-step process
  const getPhotoshootProgress = () => {
    const steps = [
      {
        id: 'train-ai',
        label: 'Train Your SSELFIE AI',
        status: userModel?.trainingStatus === 'completed' ? 'complete' : userModel?.trainingStatus === 'training' ? 'progress' : 'pending',
        detail: userModel?.trainingStatus === 'completed' ? 'AI model ready for photoshoots' : userModel?.trainingStatus === 'training' ? 'Training in progress (20 minutes)' : 'Upload 10+ selfies to start training',
        link: '/ai-training',
        priority: !userModel || userModel.trainingStatus === 'not_started'
      },
      {
        id: 'plan-photoshoot',
        label: 'Plan Your Photoshoot with Sandra AI',
        status: userModel?.trainingStatus === 'completed' ? 'ready' : 'pending',
        detail: userModel?.trainingStatus === 'completed' ? 'Chat with Sandra AI or use built-in prompts' : 'Complete AI training first',
        link: userModel?.trainingStatus === 'completed' ? '/ai-photoshoot' : '#',
        priority: false
      },
      {
        id: 'sselfie-gallery',
        label: 'Your SSELFIE Gallery',
        status: aiImages.length > 0 ? 'active' : 'pending',
        detail: aiImages.length > 0 ? `${aiImages.length} photos in your gallery` : 'Generate photos to build your gallery',
        link: aiImages.length > 0 ? '/gallery' : '#',
        priority: false
      }
    ];
    
    return steps;
  };

  const getUsageStats = () => {
    const monthlyLimit = subscription?.plan === 'sselfie-studio' ? 100 : 5;
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
        <MemberNavigation />
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
            href="/login"
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

  const photoshootProgress = getPhotoshootProgress();
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
        <MemberNavigation />
        
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
              SSELFIE
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
              STUDIO
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

        {/* SSELFIE Photoshoot Progress Section */}
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
              YOUR PHOTOSHOOT JOURNEY
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
              3 Simple Steps
            </h2>
            <p style={{
              fontSize: '20px',
              lineHeight: 1.5,
              fontWeight: 300,
              maxWidth: '600px',
              marginBottom: '80px'
            }}>
              From selfie to stunning brand photos in 20 minutes. Let's create your professional image library.
            </p>
            
            {/* Photoshoot Steps Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '8px',
              margin: '80px 0'
            }}>
              {photoshootProgress.map((step, index) => (
                <Link key={step.id} href={step.link}>
                  <div style={{
                    background: step.priority ? '#0a0a0a' : step.status === 'complete' ? '#f5f5f5' : '#ffffff',
                    color: step.priority ? '#ffffff' : '#0a0a0a',
                    position: 'relative',
                    transition: 'all 500ms ease',
                    cursor: step.link !== '#' ? 'pointer' : 'default',
                    border: step.priority ? '2px solid #0a0a0a' : '1px solid #e5e5e5',
                    transform: step.priority ? 'scale(1.02)' : 'scale(1)',
                    zIndex: step.priority ? 10 : 1,
                    opacity: step.status === 'pending' && !step.priority ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!step.priority && step.link !== '#') {
                      e.currentTarget.style.background = '#0a0a0a';
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!step.priority && step.link !== '#') {
                      e.currentTarget.style.background = step.status === 'complete' ? '#f5f5f5' : '#ffffff';
                      e.currentTarget.style.color = '#0a0a0a';
                    }
                  }}>
                    {/* Priority Badge */}
                    {step.priority && (
                      <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        background: '#ffffff',
                        color: '#0a0a0a',
                        padding: '8px 16px',
                        fontSize: '10px',
                        fontWeight: 400,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase'
                      }}>
                        START HERE
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    {step.status === 'pending' && !step.priority && (
                      <div style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: '#f5f5f5',
                        color: '#666666',
                        padding: '8px 16px',
                        fontSize: '10px',
                        fontWeight: 400,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase'
                      }}>
                        LOCKED
                      </div>
                    )}
                    
                    <div style={{ padding: '60px' }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 400,
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        color: step.priority && !onboardingData?.completed ? 'rgba(255, 255, 255, 0.7)' : '#666666',
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
                        marginBottom: '24px',
                        opacity: step.priority && !onboardingData?.completed ? 0.9 : 1
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
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '30px'
            }}
            className="tools-grid">
              {/* AI Photoshoot */}
              <Link href="/ai-generator">
                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#f5f5f5',
                  aspectRatio: '4/5',
                  cursor: 'pointer'
                }}
                className="tool-card">
                  <img 
                    src={SandraImages.portraits.professional[0]}
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

              {/* SSELFIE Gallery - Active */}
              <Link href="/sselfie-gallery">
                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#f5f5f5',
                  aspectRatio: '4/5',
                  cursor: 'pointer'
                }}
                className="tool-card">
                  <img 
                    src={aiImages.length > 0 ? aiImages[0].imageUrl : SandraImages.flatlays.workspace1}
                    alt="SSELFIE Gallery"
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
                        SSELFIE GALLERY
                      </h4>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '14px',
                        margin: 0
                      }}>
                        {aiImages.length} photos saved
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Sandra AI - Dedicated Chat Interface */}
              <Link href="/sandra-ai">
                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#f5f5f5',
                  aspectRatio: '4/5',
                  cursor: 'pointer'
                }}
                className="tool-card">
                  <img 
                    src="https://replicate.delivery/xezq/tIR9rofcvTxuE61uMrnnMufXCv7A8aAaMtQpIQkvYej8YhfTB/out-0.jpg"
                    alt="Sandra AI"
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
                        SANDRA AI
                      </h4>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '14px',
                        margin: 0
                      }}>
                        Personal brand strategy
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Sandra AI Photoshoot Planning - Available after AI training */}
              <div className="tool-card">
                <div style={{
                  background: userModel?.trainingStatus === 'completed' ? '#0a0a0a' : '#f5f5f5',
                  color: userModel?.trainingStatus === 'completed' ? '#ffffff' : '#666666',
                  position: 'relative',
                  transition: 'all 500ms ease',
                  cursor: userModel?.trainingStatus === 'completed' ? 'pointer' : 'default',
                  aspectRatio: '4/5',
                  opacity: userModel?.trainingStatus === 'completed' ? 1 : 0.5
                }}
                onClick={() => {
                  if (userModel?.trainingStatus === 'completed') {
                    window.location.href = '/sandra-photoshoot';
                  }
                }}>
                  {userModel?.trainingStatus !== 'completed' && (
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      background: '#ffffff',
                      color: '#666666',
                      padding: '8px 16px',
                      fontSize: '10px',
                      fontWeight: 400,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase'
                    }}>
                      TRAIN AI FIRST
                    </div>
                  )}
                  <div style={{ padding: '60px' }}>
                    <h3 style={{
                      fontFamily: 'Times New Roman, serif',
                      fontSize: 'clamp(1.8rem, 3.5vw, 3.5rem)',
                      fontWeight: 200,
                      letterSpacing: '-0.01em',
                      textTransform: 'uppercase',
                      marginBottom: '24px',
                      lineHeight: 1
                    }}>
                      AI<br/>PHOTO<br/>SHOOT
                    </h3>
                    <p style={{
                      fontSize: '16px',
                      lineHeight: 1.6,
                      fontWeight: 300
                    }}>
                      {userModel?.trainingStatus === 'completed' ? 'Generate your brand photos' : 'Complete AI training to unlock'}
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
              </div>

              {/* Business Setup - Coming Soon */}
              <div className="tool-card">
                <div style={{
                  background: '#f5f5f5',
                  color: '#666666',
                  position: 'relative',
                  aspectRatio: '4/5',
                  opacity: 0.5,
                  cursor: 'default'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: '#ffffff',
                    color: '#666666',
                    padding: '8px 16px',
                    fontSize: '10px',
                    fontWeight: 400,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase'
                  }}>
                    COMING SOON
                  </div>
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
                      BUSINESS<br/>SETUP
                    </h3>
                    <p style={{
                      fontSize: '16px',
                      lineHeight: 1.6,
                      fontWeight: 300
                    }}>
                      Landing pages & payment setup
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
                    03
                  </div>
                </div>
              </div>

              {/* Settings - Coming Soon */}
              <div className="tool-card">
                <div style={{
                  background: '#f5f5f5',
                  color: '#666666',
                  position: 'relative',
                  aspectRatio: '4/5',
                  opacity: 0.5,
                  cursor: 'default'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: '#ffffff',
                    color: '#666666',
                    padding: '8px 16px',
                    fontSize: '10px',
                    fontWeight: 400,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase'
                  }}>
                    COMING SOON
                  </div>
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
                      CUSTOM<br/>DOMAINS
                    </h3>
                    <p style={{
                      fontSize: '16px',
                      lineHeight: 1.6,
                      fontWeight: 300
                    }}>
                      Launch with your own domain
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
            }}
            className="main-grid">
              <div style={{ gridColumn: 'span 8' }} className="stats-content">
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
                }}
                className="stats-grid">
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
                      {photoshootProgress.filter(s => s.status === 'complete').length}
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
              
              <div style={{ gridColumn: 'span 4' }} className="activity-sidebar">
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
        
        {/* Mobile & Desktop Responsive CSS */}
        <style>{`
          /* Desktop optimization - 4 cards in a row */
          @media (min-width: 1025px) {
            .tools-grid {
              grid-template-columns: repeat(4, 1fr) !important;
              gap: 30px !important;
            }
          }
          
          /* Tablet optimization - 2 cards per row */
          @media (max-width: 1024px) and (min-width: 769px) {
            .tools-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 25px !important;
            }
            .main-grid {
              grid-template-columns: 1fr !important;
              gap: 20px !important;
            }
            .stats-content {
              grid-column: span 1 !important;
            }
            .activity-sidebar {
              grid-column: span 1 !important;
            }
            .stats-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 20px !important;
            }
            section {
              padding: 100px 0 !important;
            }
            section > div {
              padding: 0 30px !important;
            }
          }
          
          /* Mobile optimization - 1 card per row */
          @media (max-width: 768px) {
            .tools-grid {
              grid-template-columns: 1fr !important;
              gap: 20px !important;
            }
            .stats-grid {
              grid-template-columns: 1fr !important;
              gap: 20px !important;
            }
            section {
              padding: 80px 0 !important;
            }
            section > div {
              padding: 0 20px !important;
            }
          }
          
          /* Small mobile optimization */
          @media (max-width: 480px) {
            section {
              padding: 60px 0 !important;
            }
            section > div {
              padding: 0 20px !important;
            }
          }
        `}</style>
      </div>
    </PaymentVerification>
  );
}