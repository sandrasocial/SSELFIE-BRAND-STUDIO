import React, { useState, useRef, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { PaymentVerification } from '@/components/payment-verification';
import { SandraImages } from '@/lib/sandra-images';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function SimpleTraining() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selfieImages, setSelfieImages] = useState<File[]>([]);
  const [isTrainingStarted, setIsTrainingStarted] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TEMPORARY: Check user model without authentication requirement 
  const { data: userModel, refetch: refetchUserModel } = useQuery({
    queryKey: ['/api/user-model'],
    retry: false,
    enabled: true // Always enabled for testing
  });

  // State for retraining mode
  const [isRetrainingMode, setIsRetrainingMode] = useState(false);

  // Poll for training status updates with progress
  useEffect(() => {
    if (isTrainingStarted || (userModel && userModel.trainingStatus === 'training')) {
      const interval = setInterval(async () => {
        // Update user model data
        refetchUserModel();
        
        // Get progress data if we have user ID
        if (userModel?.userId) {
          try {
            const progressResponse = await fetch(`/api/training-progress/${userModel.userId}`);
            if (progressResponse.ok) {
              const progressData = await progressResponse.json();
              setTrainingProgress(progressData.progress);
            }
          } catch (error) {
            console.error('Failed to fetch training progress:', error);
          }
        }
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isTrainingStarted, userModel, refetchUserModel]);

  // Calculate progress and time remaining
  useEffect(() => {
    if (startTime && trainingProgress > 0) {
      const elapsed = Date.now() - startTime.getTime();
      const totalEstimatedTime = 20 * 60 * 1000; // 20 minutes in milliseconds
      const remaining = Math.max(0, totalEstimatedTime - elapsed);
      
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      
      setEstimatedTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
  }, [trainingProgress, startTime]);

  // Start model training mutation
  const startTraining = useMutation({
    mutationFn: async (images: string[]) => {
      const response = await apiRequest('POST', '/api/start-model-training', {
        selfieImages: images
      });
      return response.json();
    },
    onSuccess: () => {
      setIsTrainingStarted(true);
      setStartTime(new Date());
      setTrainingProgress(5); // Initial progress
      toast({
        title: "Training Started!",
        description: "Your AI model is now training. This takes about 20 minutes.",
      });
    },
    onError: (error) => {
      console.error('Training failed:', error);
      toast({
        title: "Training Failed",
        description: "Images too large or network error. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isUnder10MB = file.size <= 10 * 1024 * 1024;
      return isImage && isUnder10MB;
    });
    setSelfieImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setSelfieImages(prev => prev.filter((_, i) => i !== index));
  };

  // Compress image to reduce file size
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set max dimensions to reduce file size
        const maxWidth = 800;
        const maxHeight = 800;
        
        let { width, height } = img;
        
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
        resolve(compressedBase64.split(',')[1]);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleStartTraining = async () => {
    if (selfieImages.length < 10) {
      toast({
        title: "Need More Photos",
        description: "Please upload at least 10 selfies for best results.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Compressing Images",
      description: "Preparing your photos for training...",
    });

    // Compress images to reduce file size
    const compressedImages = await Promise.all(
      selfieImages.map(file => compressImage(file))
    );

    startTraining.mutate(compressedImages);
  };

  // Training completed view
  if (isTrainingStarted || (userModel && userModel.trainingStatus === 'training')) {
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
          
          {/* Hero Section */}
          <section style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a0a',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.4
            }}>
              <img 
                src={SandraImages.editorial.aiSuccess}
                alt=""
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
              textAlign: 'center',
              maxWidth: '800px',
              padding: '0 40px'
            }}>
              <div style={{
                fontSize: '11px',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '40px',
                fontWeight: 300
              }}>
                AI MODEL TRAINING IN PROGRESS
              </div>
              
              <h1 style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: 'clamp(4rem, 8vw, 8rem)',
                lineHeight: 0.9,
                fontWeight: 200,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                marginBottom: '32px'
              }}>
                YOUR AI IS LEARNING
              </h1>
              
              <p style={{
                fontSize: '20px',
                lineHeight: 1.5,
                fontWeight: 300,
                maxWidth: '600px',
                margin: '0 auto 40px auto',
                opacity: 0.9
              }}>
                Your personal SSELFIE AI model is being created. This process takes approximately 20 minutes. 
                You'll receive an email when it's ready.
              </p>
              
              {/* Progress Bar */}
              <div style={{
                maxWidth: '400px',
                margin: '0 auto 20px auto',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                overflow: 'hidden',
                height: '8px'
              }}>
                <div style={{
                  width: `${Math.max(5, trainingProgress)}%`,
                  height: '100%',
                  background: '#ffffff',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              
              {/* Training Stats */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '40px',
                fontSize: '14px',
                opacity: 0.8,
                marginBottom: '20px'
              }}>
                <div>Progress: {Math.max(5, trainingProgress)}%</div>
                {estimatedTimeRemaining && (
                  <div>Time Remaining: {estimatedTimeRemaining}</div>
                )}
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '40px',
                marginBottom: '60px'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid #ffffff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <div style={{
                  fontSize: '14px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  opacity: 0.7
                }}>
                  Creating your personal AI model...
                </div>
              </div>
              
              <Link href="/studio">
                <div style={{
                  display: 'inline-block',
                  padding: '16px 32px',
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  border: '1px solid #ffffff',
                  color: '#ffffff',
                  background: 'transparent',
                  transition: 'all 300ms ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#ffffff';
                  e.target.style.color = '#0a0a0a';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#ffffff';
                }}
                >
                  CONTINUE TO STUDIO
                </div>
              </Link>
            </div>
          </section>
        </div>
      </PaymentVerification>
    );
  }

  // Training upload view
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
        </div>
      </div>
    );
  }

  // Show model completed view with retrain option
  if (userModel && userModel.trainingStatus === 'completed' && !isRetrainingMode) {
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
          
          {/* Hero Section */}
          <section style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a0a',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.4
            }}>
              <img 
                src={SandraImages.editorial.aiSuccess}
                alt=""
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
              textAlign: 'center',
              maxWidth: '800px',
              padding: '0 40px'
            }}>
              <div style={{
                fontSize: '11px',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '40px',
                fontWeight: 300
              }}>
                AI MODEL READY
              </div>
              
              <h1 style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: 'clamp(4rem, 8vw, 8rem)',
                lineHeight: 0.9,
                fontWeight: 200,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                marginBottom: '32px'
              }}>
                YOUR AI IS READY
              </h1>
              
              <p style={{
                fontSize: '20px',
                lineHeight: 1.5,
                fontWeight: 300,
                maxWidth: '600px',
                margin: '0 auto 40px auto',
                opacity: 0.9
              }}>
                Your personal SSELFIE AI model "{userModel.modelName}" is trained and ready to create stunning professional images.
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                flexWrap: 'wrap',
                marginBottom: '40px'
              }}>
                <Link href="/sandra-photoshoot">
                  <div style={{
                    display: 'inline-block',
                    padding: '16px 32px',
                    fontSize: '11px',
                    fontWeight: 400,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    border: '1px solid #ffffff',
                    color: '#0a0a0a',
                    background: '#ffffff',
                    transition: 'all 300ms ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#ffffff';
                    e.target.style.color = '#0a0a0a';
                  }}
                  >
                    START AI PHOTOSHOOT
                  </div>
                </Link>

                <div 
                  onClick={() => setIsRetrainingMode(true)}
                  style={{
                    display: 'inline-block',
                    padding: '16px 32px',
                    fontSize: '11px',
                    fontWeight: 400,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    border: '1px solid #ffffff',
                    color: '#ffffff',
                    background: 'transparent',
                    transition: 'all 300ms ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#ffffff';
                    e.target.style.color = '#0a0a0a';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#ffffff';
                  }}
                >
                  RETRAIN MY MODEL
                </div>
              </div>


            </div>
          </section>
        </div>
      </PaymentVerification>
    );
  }

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
        
        {/* Hero Section */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.4
          }}>
            <img 
              src={SandraImages.hero.ai}
              alt=""
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
            textAlign: 'center',
            maxWidth: '800px',
            padding: '0 40px'
          }}>
            <div style={{
              fontSize: '11px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '40px',
              fontWeight: 300
            }}>
              {isRetrainingMode ? 'RETRAIN YOUR MODEL' : 'STEP ONE OF THREE'}
            </div>
            
            <h1 style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(4rem, 8vw, 8rem)',
              lineHeight: 0.9,
              fontWeight: 200,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              marginBottom: '20px'
            }}>
              {isRetrainingMode ? 'RETRAIN' : 'TRAIN'}
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
              YOUR SSELFIE AI
            </div>
            
            <p style={{
              fontSize: '16px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              opacity: 0.8,
              fontWeight: 300,
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              {isRetrainingMode ? 'Upload 10+ new selfies to retrain your AI model with better accuracy' : 'Upload 10+ selfies to create your personal AI model'}
            </p>
          </div>
        </section>

        {/* Training Instructions Section */}
        <section style={{ padding: '120px 0', background: '#f5f5f5' }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 40px'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '80px'
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 400,
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: '#666666',
                marginBottom: '24px'
              }}>
                QUICK SETUP
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
                10 Photos to Transform Your Future
              </h2>
              <p style={{
                fontSize: '20px',
                lineHeight: 1.5,
                fontWeight: 300,
                maxWidth: '700px',
                margin: '0 auto 40px auto'
              }}>
                Your AI needs just 10 specific photos to create stunning, professional images of you. 
                No complicated setup. No professional equipment. Just your phone and good light.
              </p>
              
              <Link href="/selfie-guide">
                <div style={{
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
                  VIEW COMPLETE SELFIE GUIDE
                </div>
              </Link>
            </div>

            {/* Quick Rules Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '8px',
              marginBottom: '80px'
            }}>
              <div style={{
                background: '#ffffff',
                padding: '60px',
                position: 'relative',
                transition: 'all 500ms ease'
              }}>
                <div style={{
                  fontFamily: 'Times New Roman, serif',
                  fontSize: '120px',
                  position: 'absolute',
                  top: '20px',
                  right: '30px',
                  opacity: 0.1,
                  lineHeight: 1
                }}>01</div>
                <h3 style={{
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  marginBottom: '24px'
                }}>WHAT YOU NEED</h3>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  fontSize: '16px',
                  lineHeight: 1.8,
                  fontWeight: 300
                }}>
                  <li>→ Your phone camera</li>
                  <li>→ Natural light from window</li>
                  <li>→ 15 minutes of time</li>
                  <li>→ Your everyday look</li>
                </ul>
              </div>
              
              <div style={{
                background: '#ffffff',
                padding: '60px',
                position: 'relative',
                transition: 'all 500ms ease'
              }}>
                <div style={{
                  fontFamily: 'Times New Roman, serif',
                  fontSize: '120px',
                  position: 'absolute',
                  top: '20px',
                  right: '30px',
                  opacity: 0.1,
                  lineHeight: 1
                }}>02</div>
                <h3 style={{
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  marginBottom: '24px'
                }}>IMPORTANT RULES</h3>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  fontSize: '16px',
                  lineHeight: 1.8,
                  fontWeight: 300
                }}>
                  <li>→ No filters or heavy editing</li>
                  <li>→ Face clearly visible in all shots</li>
                  <li>→ Mix of expressions (not all smiling)</li>
                  <li>→ Recent photos only</li>
                </ul>
              </div>
              
              <div style={{
                background: '#ffffff',
                padding: '60px',
                position: 'relative',
                transition: 'all 500ms ease'
              }}>
                <div style={{
                  fontFamily: 'Times New Roman, serif',
                  fontSize: '120px',
                  position: 'absolute',
                  top: '20px',
                  right: '30px',
                  opacity: 0.1,
                  lineHeight: 1
                }}>03</div>
                <h3 style={{
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  marginBottom: '24px'
                }}>PHOTO VARIETY</h3>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  fontSize: '16px',
                  lineHeight: 1.8,
                  fontWeight: 300
                }}>
                  <li>→ Close-up portraits (front, left, right)</li>
                  <li>→ Waist-up shots (sitting, standing)</li>
                  <li>→ Full body shots</li>
                  <li>→ Profile views (both sides)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section style={{ padding: '120px 0' }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '0 40px'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '60px'
            }}>
              <h2 style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: 'clamp(2rem, 4vw, 4rem)',
                fontWeight: 200,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                marginBottom: '24px',
                lineHeight: 1
              }}>
                Upload Your Selfies
              </h2>
              <p style={{
                fontSize: '16px',
                lineHeight: 1.6,
                fontWeight: 300,
                color: '#666666',
                maxWidth: '500px',
                margin: '0 auto'
              }}>
                {selfieImages.length}/10+ photos uploaded. Training takes 20 minutes once started.
              </p>
            </div>

            {/* Upload Area */}
            <div 
              style={{
                border: '2px dashed #e5e5e5',
                background: '#fafafa',
                padding: '80px 40px',
                textAlign: 'center',
                marginBottom: '40px',
                transition: 'all 300ms ease',
                cursor: 'pointer'
              }}
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#0a0a0a';
                e.target.style.background = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e5e5';
                e.target.style.background = '#fafafa';
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              
              <div style={{
                fontSize: '48px',
                marginBottom: '24px',
                opacity: 0.3
              }}>+</div>
              
              <h3 style={{
                fontSize: '11px',
                fontWeight: 400,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>
                DRAG & DROP OR CLICK TO UPLOAD
              </h3>
              
              <p style={{
                fontSize: '14px',
                color: '#666666',
                fontWeight: 300
              }}>
                Upload high-quality selfies with good lighting (max 10MB each)
              </p>
            </div>

            {/* Uploaded Images Grid */}
            {selfieImages.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '16px',
                marginBottom: '60px'
              }}>
                {selfieImages.map((file, index) => (
                  <div key={index} style={{
                    position: 'relative',
                    aspectRatio: '1/1',
                    background: '#f5f5f5',
                    border: '1px solid #e5e5e5',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Selfie ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <button
                      onClick={() => removeImage(index)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '24px',
                        height: '24px',
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Start Training Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleStartTraining}
                disabled={selfieImages.length < 10 || startTraining.isPending}
                style={{
                  padding: '20px 40px',
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  border: selfieImages.length >= 10 ? '1px solid #0a0a0a' : '1px solid #e5e5e5',
                  color: selfieImages.length >= 10 ? '#0a0a0a' : '#666666',
                  background: 'transparent',
                  transition: 'all 300ms ease',
                  cursor: selfieImages.length >= 10 ? 'pointer' : 'not-allowed',
                  opacity: selfieImages.length >= 10 ? 1 : 0.5
                }}
                onMouseEnter={(e) => {
                  if (selfieImages.length >= 10) {
                    e.target.style.background = '#0a0a0a';
                    e.target.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selfieImages.length >= 10) {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#0a0a0a';
                  }
                }}
              >
                {startTraining.isPending ? 'STARTING TRAINING...' : 
                 selfieImages.length < 10 ? `NEED ${10 - selfieImages.length} MORE PHOTOS` : 
                 'START AI TRAINING'}
              </button>
              
              {selfieImages.length >= 10 && !startTraining.isPending && (
                <p style={{
                  fontSize: '14px',
                  color: '#666666',
                  marginTop: '16px',
                  fontWeight: 300
                }}>
                  Training takes about 20 minutes. You'll be notified when it's complete.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Add spinning animation */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </PaymentVerification>
  );
}