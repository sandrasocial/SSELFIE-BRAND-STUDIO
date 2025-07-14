import React, { useState, useRef, useEffect } from 'react';
import { MemberNavigation } from '@/components/member-navigation';
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
          <MemberNavigation />
          
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
          <MemberNavigation />
          
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
        <MemberNavigation />
        
        {/* Hero Section - Simplified */}
        <section style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          position: 'relative',
          padding: '80px 40px'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '800px'
          }}>
            <div style={{
              fontSize: '11px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: 'rgba(0, 0, 0, 0.5)',
              marginBottom: '40px',
              fontWeight: 300
            }}>
              Step One • 2 minutes
            </div>
            
            <h1 style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(4rem, 10vw, 8rem)',
              lineHeight: 0.85,
              fontWeight: 200,
              marginBottom: '24px',
              color: '#0a0a0a',
              letterSpacing: '-0.02em'
            }}>
              Upload Your Selfies
            </h1>
            
            <p style={{
              fontSize: '18px',
              lineHeight: 1.6,
              fontWeight: 300,
              maxWidth: '500px',
              margin: '0 auto 60px auto',
              color: '#333333'
            }}>
              Your AI needs to learn your face to create photos that actually look like you. 
              Ten selfies with good light is all it takes.
            </p>

            <div style={{
              fontSize: '14px',
              color: '#666666',
              marginBottom: '48px',
              letterSpacing: '0.05em'
            }}>
              {selfieImages.length} of 10 photos uploaded
            </div>

            {/* Editorial Upload Area */}
            <div 
              style={{
                border: '1px solid #e5e5e5',
                background: '#ffffff',
                padding: '80px 40px',
                cursor: 'pointer',
                transition: 'all 300ms ease',
                marginBottom: '60px'
              }}
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#0a0a0a';
                e.target.style.background = '#fafafa';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e5e5';
                e.target.style.background = '#ffffff';
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
                fontFamily: 'Times New Roman, serif',
                fontSize: '72px',
                marginBottom: '24px',
                opacity: 0.15,
                lineHeight: 1,
                fontWeight: 200
              }}>+</div>
              
              <h3 style={{
                fontSize: '11px',
                fontWeight: 400,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                marginBottom: '12px',
                color: '#0a0a0a'
              }}>
                Click to select photos
              </h3>
              
              <p style={{
                fontSize: '14px',
                color: '#666666',
                fontWeight: 300,
                lineHeight: 1.5
              }}>
                Natural window light gives the best results
              </p>
            </div>

            {/* Uploaded Photos Preview */}
            {selfieImages.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: '12px',
                marginBottom: '40px',
                maxWidth: '600px',
                margin: '0 auto 40px auto'
              }}>
                {selfieImages.map((file, index) => (
                  <div key={index} style={{
                    position: 'relative',
                    aspectRatio: '1/1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #e5e5e5'
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
                        top: '4px',
                        right: '4px',
                        width: '20px',
                        height: '20px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '50%',
                        fontSize: '12px',
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

            {/* Simple Start Button */}
            <button
              onClick={handleStartTraining}
              disabled={selfieImages.length < 10 || startTraining.isPending}
              style={{
                padding: '18px 36px',
                fontSize: '16px',
                fontWeight: 500,
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                background: selfieImages.length >= 10 ? '#0a0a0a' : '#cccccc',
                cursor: selfieImages.length >= 10 ? 'pointer' : 'not-allowed',
                transition: 'all 300ms ease',
                marginBottom: '24px'
              }}
            >
              {startTraining.isPending ? 'Starting training...' : 
               selfieImages.length < 10 ? `Upload ${10 - selfieImages.length} more photos` : 
               'Start AI Training (20 minutes)'}
            </button>

            {selfieImages.length >= 10 && !startTraining.isPending && (
              <p style={{
                fontSize: '14px',
                color: '#666666',
                fontWeight: 300
              }}>
                Your AI will learn from these photos and be ready in about 20 minutes
              </p>
            )}
          </div>
        </section>

        {/* Example Photos Section */}
        <section style={{ 
          padding: '100px 0', 
          background: '#ffffff',
          borderTop: '1px solid #f0f0f0'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 40px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '11px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: 'rgba(0, 0, 0, 0.5)',
              marginBottom: '32px',
              fontWeight: 300
            }}>
              Training Examples
            </div>
            
            <h2 style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              lineHeight: 0.9,
              fontWeight: 200,
              marginBottom: '24px',
              color: '#0a0a0a',
              letterSpacing: '-0.02em'
            }}>
              This Is How I Trained My AI
            </h2>
            
            <p style={{
              fontSize: '16px',
              lineHeight: 1.6,
              fontWeight: 300,
              maxWidth: '600px',
              margin: '0 auto 60px auto',
              color: '#666666'
            }}>
              Here are actual examples from my training set. Notice the variety in lighting, 
              angles, and expressions. This is what creates professional results.
            </p>

            {/* Example Photos Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              marginBottom: '60px',
              maxWidth: '800px',
              margin: '0 auto 60px auto'
            }}>
              {/* Using Sandra's actual training images */}
              <div style={{
                aspectRatio: '3/4',
                background: '#f5f5f5',
                border: '1px solid #e5e5e5',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <img 
                  src={SandraImages.editorial.thinking}
                  alt="Training example: close-up with natural light"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  right: '8px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: '#ffffff',
                  fontSize: '10px',
                  padding: '4px 8px',
                  letterSpacing: '0.05em'
                }}>
                  CLOSE-UP, NATURAL LIGHT
                </div>
              </div>
              
              <div style={{
                aspectRatio: '3/4',
                background: '#f5f5f5',
                border: '1px solid #e5e5e5',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <img 
                  src={SandraImages.hero.contact}
                  alt="Training example: profile view"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  right: '8px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: '#ffffff',
                  fontSize: '10px',
                  padding: '4px 8px',
                  letterSpacing: '0.05em'
                }}>
                  PROFILE ANGLE
                </div>
              </div>
              
              <div style={{
                aspectRatio: '3/4',
                background: '#f5f5f5',
                border: '1px solid #e5e5e5',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <img 
                  src={SandraImages.editorial.laughing}
                  alt="Training example: different expression"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  right: '8px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: '#ffffff',
                  fontSize: '10px',
                  padding: '4px 8px',
                  letterSpacing: '0.05em'
                }}>
                  DIFFERENT EXPRESSION
                </div>
              </div>
              
              <div style={{
                aspectRatio: '3/4',
                background: '#f5f5f5',
                border: '1px solid #e5e5e5',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <img 
                  src={SandraImages.editorial.laptop1}
                  alt="Training example: waist-up shot"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  right: '8px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: '#ffffff',
                  fontSize: '10px',
                  padding: '4px 8px',
                  letterSpacing: '0.05em'
                }}>
                  WAIST-UP SHOT
                </div>
              </div>
            </div>

            {/* Quick Tips Below Examples */}
            {selfieImages.length < 10 && (
              <div style={{
                background: '#f9f9f9',
                padding: '40px',
                maxWidth: '600px',
                margin: '0 auto',
                textAlign: 'left'
              }}>
                <h4 style={{
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  marginBottom: '20px',
                  color: '#0a0a0a'
                }}>
                  What makes good training photos:
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: '#333333',
                  fontWeight: 300
                }}>
                  <div>
                    <div style={{marginBottom: '8px'}}>✓ Natural window light</div>
                    <div style={{marginBottom: '8px'}}>✓ Clear, unfiltered photos</div>
                    <div style={{marginBottom: '8px'}}>✓ Different angles</div>
                  </div>
                  <div>
                    <div style={{marginBottom: '8px'}}>✓ Various expressions</div>
                    <div style={{marginBottom: '8px'}}>✓ Close-up and waist-up</div>
                    <div style={{marginBottom: '8px'}}>✓ Recent photos of you</div>
                  </div>
                </div>
              </div>
            )}
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