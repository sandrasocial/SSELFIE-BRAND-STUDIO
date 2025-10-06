import { useState, useEffect } from 'react';
import { MemberNavigation } from '../../components/member-navigation.js';
import { SandraImages } from '../../lib/sandra-images.js';
import { useAuth } from '../../hooks/use-auth.js';
import { Link } from 'wouter';
import { useToast } from '../../hooks/use-toast.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient.js';
import ErrorBoundary from '../../components/ErrorBoundary.js';
import { User, UserModel } from '../../types/index.js';
import { MayaUploadComponent } from '../../components/maya/MayaUploadComponent.js';
import { TypographyClasses } from '../../styles/premium-typography.js';

// Enhanced training infrastructure
import { useTrainingStatus } from '../../hooks/useTrainingStatus.js';
import { TrainingErrorBoundary } from '../../components/training/TrainingErrorBoundary.js';

function SimpleTraining() {
  // Always call hooks in the same order
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  // State hooks always called consistently
  const [isTrainingStarted, setIsTrainingStarted] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<string>('');
  const [isRetrainingMode, setIsRetrainingMode] = useState(false);
  
  // Gender selection state - CRITICAL for training setup
  const [userGender, setUserGender] = useState<string>('');
  const [showGenderSelection, setShowGenderSelection] = useState(true);
  

  
  // Enhanced training status with adaptive polling
  const {
    userModel: enhancedUserModel,
    progressMetrics,
    trainingStage,
    isTraining: isEnhancedTraining,
    isCompleted,
    isFailed,
    isPolling,
    currentPollingInterval
  } = useTrainingStatus(user?.id || '', isAuthenticated);

  // Check user model status with proper authentication and typing
  const { data: userModel, refetch: refetchUserModel } = useQuery<{
    id?: number;
    userId?: string;
    replicateModelId?: string;
    trainingStatus?: string;
    trainingProgress?: number;
    startedAt?: string;
    modelName?: string;
    replicateVersionId?: string;
    triggerWord?: string;
    isLuxury?: boolean;
    modelType?: string;
    estimatedCompletionTime?: string;
    failureReason?: string;
    completedAt?: string;
    canRetrain?: boolean;
    needsTraining?: boolean;
  }>({
    queryKey: ['/api/user-model'],
    retry: false,
    enabled: isAuthenticated, // Only when authenticated
    staleTime: 30 * 1000, // 30 seconds for training status
    refetchInterval: isTrainingStarted ? 5000 : false, // Poll every 5s during training
  });

  // Check training status for failures
  const { data: trainingStatus, refetch: refetchTrainingStatus } = useQuery<{
    needsRestart: boolean;
    reason: string;
  }>({
    queryKey: ['/api/training-status'],
    retry: false,
    enabled: isAuthenticated,
    staleTime: 10 * 1000, // 10 seconds for training status
  });

  // Restart training mutation
  const restartTrainingMutation = useMutation({
    mutationFn: () => apiRequest('/api/restart-training', 'POST'),
    onSuccess: () => {
      // Clear state and redirect to training page
      setIsRetrainingMode(false);
      setIsTrainingStarted(false);
      setTrainingProgress(0);
      refetchUserModel();
      refetchTrainingStatus();
      
      // Redirect to training page after clearing data
      setTimeout(() => {
        window.location.href = '/ai-training';
      }, 500);
    },
    onError: () => {
      toast({
        title: "Reset Failed",
        description: "Unable to reset training. Please try again.",
        
      });
    }
  });

  // Initialize gender from user data if available
  useEffect(() => {
    if (user && (user as any)?.gender) {
      setUserGender((user as any).gender);
      setShowGenderSelection(false);
    }
  }, [user]);

  // Initialize training state based on userModel data
  useEffect(() => {
      userModel,
      isAuthenticated,
      trainingStatus: userModel?.trainingStatus,
      needsRestart: trainingStatus?.needsRestart
    });
    
    // Check if training failed and needs restart
    if (trainingStatus?.needsRestart && userModel?.trainingStatus !== 'completed') {
      setIsRetrainingMode(true);
      // Removed red toast notification per user request
      return; // Don't proceed with normal training flow
    }

    // 🔄 PHASE 1: USER TYPE DETECTION - New users vs. trained users
    if (userModel?.canRetrain && userModel?.needsTraining && !userModel?.id) {
      setIsRetrainingMode(false); // Use normal training flow for new users
    }
    
    if (userModel && userModel.trainingStatus === 'training') {
      setIsTrainingStarted(true);
      setTrainingProgress(userModel.trainingProgress || 5);
      if (userModel.startedAt) {
        setStartTime(new Date(userModel.startedAt));
      }
    } else if (userModel && userModel.trainingStatus === 'completed') {
      // 🔄 PHASE 4: Enhanced retraining logic with retraining access support
      const currentPath = window.location.pathname;
      const isOnTrainingPage = currentPath.includes('simple-training') || currentPath.includes('ai-training');
      const hasRetrainingAccess = (userModel as any)?.hasRetrainingAccess === true;
      
      if (isOnTrainingPage) {
        if (hasRetrainingAccess) {
          // 🔄 PHASE 4: User has retraining access - allow training to continue
          toast({
            title: "🎉 Retraining Access Active!",
            description: "Your retraining session is ready! Upload new photos and refresh your AI model.",
          });
          // Let training continue normally - don't redirect
        } else {
          // 🔄 PHASE 4: User without retraining access - route to retraining checkout
          toast({
            title: "✨ AI Model Ready!",
            description: "Your AI model is trained and ready! Redirecting you to Maya to start creating beautiful photos.",
          });
          
          setTimeout(() => {
            window.location.href = '/app';
          }, 2000);
        }
      } else {
      }
    }
  }, [userModel, trainingStatus, isAuthenticated]);

  // Poll for training status updates with progress - ONLY when on training page  
  useEffect(() => {
    const isCurrentlyTraining = isTrainingStarted || (userModel && userModel.trainingStatus === 'training');
    
    // CRITICAL FIX: Only poll when we're actually on the training page and training is active
    // PREVENT MAYA INTERFERENCE: Do not poll or redirect if user is not on training-related pages
    const currentPath = window.location.pathname;
    const isOnTrainingPage = currentPath.includes('simple-training') || currentPath.includes('ai-training');
    
    if (isCurrentlyTraining && isAuthenticated && isOnTrainingPage) {
      
      const interval = setInterval(async () => {
        // STOP POLLING: If training is no longer active, clear interval immediately
        if (!isTrainingStarted && userModel?.trainingStatus !== 'training') {
          clearInterval(interval);
          return;
        }
        
        // Update user model data
        const updatedData = await refetchUserModel();
        
        // Check if training completed
        if (updatedData?.data?.trainingStatus === 'completed') {
          setIsTrainingStarted(false);
          setTrainingProgress(100);
          clearInterval(interval); // CRITICAL: Stop polling immediately
          
          // 🔄 PHASE 1: TRAINING COMPLETION - Route to workspace for newly trained users
          const stillOnTrainingPage = window.location.pathname.includes('simple-training') || window.location.pathname.includes('ai-training');
          if (stillOnTrainingPage) {
            toast({
              title: "Model Ready",
              description: "Your AI training is complete. Redirecting to Maya...",
            });
            
            setTimeout(() => {
              window.location.href = '/app';
            }, 2000);
          }
          
          return; // Exit early
        }
        
        // Get progress data if we have user model and still training
        if (userModel?.userId && userModel?.trainingStatus === 'training') {
          try {
            const progressResponse = await fetch(`/api/training-progress/${userModel.userId}`, {
              credentials: 'include'
            });
            if (progressResponse.ok) {
              const progressData = await progressResponse.json();
              setTrainingProgress(progressData.progress || 0);
            }
          } catch (error) {
            console.error('Failed to fetch training progress:', error);
          }
        }
      }, 5000); // Poll every 5 seconds

      return () => {
        clearInterval(interval);
      };
    }
  }, [isTrainingStarted, userModel, refetchUserModel, isAuthenticated]);

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





  // Training completed view
  if (isTrainingStarted || (userModel && userModel.trainingStatus === 'training')) {
    return (
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
                alt="Decorative illustration"
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
                fontSize: 'clamp(2.5rem, 8vw, 8rem)',
                lineHeight: 0.9,
                fontWeight: 200,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                marginBottom: '24px'
              }}>
                TRAINING YOUR MODEL
              </h1>
              
              <p style={{
                fontSize: 'clamp(16px, 4vw, 20px)',
                lineHeight: 1.5,
                fontWeight: 300,
                maxWidth: '600px',
                margin: '0 auto 32px auto',
                opacity: 0.9,
                padding: '0 20px'
              }}>
                Your personalized AI model is training. This takes about 20 minutes. 
                You'll get an email when it's complete.
              </p>
              
              {/* Simple Training Animation */}
              <div style={{
                position: 'relative',
                width: '100px',
                height: '100px',
                margin: '0 auto 40px auto'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  borderTop: '2px solid #ffffff',
                  borderRadius: '50%',
                  animation: 'spin 2s linear infinite'
                }}></div>
              </div>
              
              {/* Training Progress Display */}
              {(
                // Simple progress display
                <div style={{ marginBottom: '40px' }}>
                  <div style={{
                    maxWidth: '500px',
                    margin: '0 auto 30px auto',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    height: '12px',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{
                      width: `${Math.max(5, trainingProgress)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 50%, #ffffff 100%)',
                      transition: 'width 0.5s ease-out',
                      borderRadius: '16px'
                    }}></div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 'clamp(30px, 5vw, 60px)',
                    fontSize: 'clamp(13px, 3vw, 16px)',
                    marginBottom: '30px',
                    flexWrap: 'wrap',
                    padding: '0 20px'
                  }}>
                    <div style={{
                      opacity: 0.9,
                      fontWeight: 300,
                      letterSpacing: '0.05em'
                    }}>
                      Progress: {Math.max(5, trainingProgress)}%
                    </div>
                    {estimatedTimeRemaining && (
                      <div style={{
                        opacity: 0.9,
                        fontWeight: 300,
                        letterSpacing: '0.05em'
                      }}>
                        Time Remaining: {estimatedTimeRemaining}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Polling Status Indicator */}
              {isPolling && (
                <div style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '20px',
                  letterSpacing: '0.1em'
                }}>
                  Checking progress every {Math.round(currentPollingInterval / 1000)}s
                </div>
              )}
              
              {/* LUXURY VALUE MESSAGING */}
              <div style={{
                maxWidth: '600px',
                margin: '0 auto 40px auto',
                padding: '24px 32px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  opacity: 0.8,
                  lineHeight: 1.6,
                  fontWeight: 300,
                  letterSpacing: '0.025em'
                }}>
                  <div style={{ marginBottom: '8px', fontWeight: 400 }}>
                    <strong>Personal AI Model Training</strong>
                  </div>
                  <div>
                    High-quality personalization • Natural results • Gallery-ready photos
                  </div>
                </div>
              </div>
              
              <Link href="/maya">
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
                  const target = e.target as HTMLElement;
                  target.style.background = '#ffffff';
                  target.style.color = '#0a0a0a';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.background = 'transparent';
                  target.style.color = '#ffffff';
                }}
                >
                  START WITH MAYA
                </div>
              </Link>
            </div>
          </section>
        </div>
    );
  }

  // Training failure restart view - LUXURY EDITORIAL DESIGN
  if (isRetrainingMode || (trainingStatus?.needsRestart && userModel?.trainingStatus !== 'completed')) {
    return (
      <div className="min-h-screen bg-white">
        <MemberNavigation />
        
        {/* Editorial Training Restart Section */}
        <section className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <img 
              src={SandraImages.editorial.thinking}
              alt="Decorative illustration"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative z-2 text-center max-w-900 px-10">
            <div className={TypographyClasses.editorialHeadline}>
              AI MODEL TRAINING SYSTEM
            </div>
            
            <h1 className={TypographyClasses.editorialHeadlineLarge}>
              FRESH START
            </h1>
            
            <p className={TypographyClasses.bodyLarge}>
              {trainingStatus?.reason === 'No training data found - please start training' 
                ? 'Ready to create your personal AI model with fresh images'
                : 'Your previous training requires a fresh start with new images'
              }
            </p>
            
            {/* Editorial Message Box */}
            <div className="max-w-800 mx-auto mb-12 p-8 bg-white/5 border border-white/2">
              <div className={TypographyClasses.caption}>
                Training Process
              </div>
              
              <div className={TypographyClasses.body}>
                <div className="mb-3">
                  • Upload 10-20 high-quality selfie images
                </div>
                <div className="mb-3">
                  • AI creates your personal model (30-45 minutes)
                </div>
                <div className="mb-3">
                  • Generate unlimited editorial-quality images
                </div>
                <div>
                  • Professional face distortion prevention included
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '24px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <button
                onClick={() => restartTrainingMutation.mutate()}
                disabled={restartTrainingMutation.isPending}
                className={`px-10 py-5 text-xs font-medium tracking-wide uppercase bg-white text-black border-none cursor-pointer transition-all duration-300 ${restartTrainingMutation.isPending ? 'opacity-60' : 'hover:bg-gray-100'}`}
              >
                {restartTrainingMutation.isPending ? 'CLEARING...' : 'START FRESH TRAINING'}
              </button>
              
              <Link href="/workspace">
                <div className="px-10 py-5 text-xs font-medium tracking-wide uppercase text-decoration-none border border-white/4 bg-transparent text-white/8 hover:border-white/8 hover:text-white transition-all duration-300 cursor-pointer inline-block">
                  RETURN TO WORKSPACE
                </div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }



  // Training upload view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <MemberNavigation />
        <div className="max-w-1400 mx-auto px-10 py-30 text-center">
          <h1 className={TypographyClasses.editorialHeadlineLarge}>
            Please Sign In
          </h1>
        </div>
      </div>
    );
  }

  // Show model completed view with retrain option
  if (userModel && userModel.trainingStatus === 'completed' && !isRetrainingMode) {
    return (
        <div className="min-h-screen bg-white">
          <MemberNavigation />
          
          {/* Hero Section */}
          <section className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-40">
              <img 
                src={SandraImages.editorial.aiSuccess}
                alt="Decorative illustration"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="relative z-2 text-center max-w-800 px-10">
              <div className={TypographyClasses.editorialHeadline}>
                AI MODEL READY
              </div>
              
              <h1 className={TypographyClasses.editorialHeadlineLarge}>
                YOUR AI IS READY
              </h1>
              
              <p className={TypographyClasses.bodyLarge}>
                Your AI is officially trained and ready to create professional photos that capture your unique style. Let's start creating.
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 'clamp(12px, 3vw, 20px)',
                flexWrap: 'wrap',
                marginBottom: '40px',
                padding: '0 20px'
              }}>
                <Link href="/maya">
                  <div 
                    className="touch-manipulation"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 'clamp(12px, 3vw, 16px) clamp(24px, 6vw, 32px)',
                      minHeight: '44px',
                      fontSize: 'clamp(10px, 2.5vw, 11px)',
                      fontWeight: 400,
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      border: '1px solid #ffffff',
                      color: '#0a0a0a',
                      background: '#ffffff',
                      transition: 'all 300ms ease',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.background = 'transparent';
                      target.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.background = '#ffffff';
                      target.style.color = '#0a0a0a';
                    }}
                  >
                    START AI PHOTOSHOOT
                  </div>
                </Link>

                <div 
                  onClick={() => setIsRetrainingMode(true)}
                  className="touch-manipulation"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'clamp(12px, 3vw, 16px) clamp(24px, 6vw, 32px)',
                    minHeight: '44px',
                    fontSize: 'clamp(10px, 2.5vw, 11px)',
                    fontWeight: 400,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    border: '1px solid #ffffff',
                    color: '#ffffff',
                    background: 'transparent',
                    transition: 'all 300ms ease',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.background = '#ffffff';
                    target.style.color = '#0a0a0a';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.background = 'transparent';
                    target.style.color = '#ffffff';
                  }}
                >
                  RETRAIN MY MODEL
                </div>
              </div>

            </div>
          </section>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-white">
        <MemberNavigation />
        
        {/* Hero Section - Simplified */}
        <section className="min-h-80vh flex items-center justify-center bg-gray-50 relative px-5 py-15">
          <div className="text-center max-w-800">
            <div className={TypographyClasses.editorialHeadline}>
              Step One • 2 minutes
            </div>
            
            <h1 className={TypographyClasses.editorialHeadlineLarge}>
              Upload Your Selfies
            </h1>
            
            <p className={TypographyClasses.bodyLarge}>
              Upload 10 selfies so your AI can create photos that actually look like you. 
              Good lighting and variety work best.
            </p>

            {/* Gender Selection - Critical for E2E tests */}
            {showGenderSelection && !userGender && (
              <div className="max-w-400 mx-auto mb-10 p-6 bg-gray-50 border border-gray-2 border-radius-4">
                <h3 className={TypographyClasses.label}>
                  Select Your Gender
                </h3>
                <p className={TypographyClasses.bodySmall}>
                  This helps us train your AI model more accurately
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setUserGender('male');
                      setShowGenderSelection(false);
                    }}
                    className="px-4 py-3 text-sm font-medium tracking-normal uppercase border border-black text-black bg-transparent cursor-pointer transition-all duration-200 hover:bg-black hover:text-white"
                  >
                    Male
                  </button>
                  <button
                    onClick={() => {
                      setUserGender('female');
                      setShowGenderSelection(false);
                    }}
                    className="px-4 py-3 text-sm font-medium tracking-normal uppercase border border-black text-black bg-transparent cursor-pointer transition-all duration-200 hover:bg-black hover:text-white"
                  >
                    Female
                  </button>
                </div>
              </div>
            )}

            {/* Selected Gender Display */}
            {userGender && (
              <div className={TypographyClasses.caption}>
                Training for: {userGender} • 
                <button
                  onClick={() => {
                    setUserGender('');
                    setShowGenderSelection(true);
                  }}
                  className="ml-2 text-sm color-gray-500 bg-none border-none text-decoration-underline cursor-pointer"
                >
                  Change
                </button>
              </div>
            )}

            {/* Enhanced Maya Upload Component */}
            <div style={{
              maxWidth: '600px',
              margin: '0 auto 40px auto'
            }}>
              <MayaUploadComponent
                data-test-id="training-upload-component"
                onUploadComplete={(success) => {
                  if (success) {
                    setIsTrainingStarted(true);
                  } else {
                  }
                }}
                onTrainingStart={() => {
                  setIsTrainingStarted(true);
                }}
                className="luxury-training-upload"
              />
            </div>
          </div>
        </section>

        {/* Example Photos Section */}
        <section className="py-15 sm:py-25 bg-white border-t border-gray-1">
          <div className="max-w-1200 mx-auto px-5 text-center">
            <div className={TypographyClasses.editorialHeadline}>
              Training Examples
            </div>
            
            <h2 className={TypographyClasses.editorialHeadlineMedium}>
              This Is How I Trained My AI
            </h2>
            
            <p className={TypographyClasses.bodyLarge}>
              Here are actual examples from my training set. Notice the variety in lighting, 
              angles, and expressions. This is what creates professional results.
            </p>

            {/* Example Photos Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              marginBottom: '60px',
              maxWidth: '1000px',
              margin: '0 auto 60px auto'
            }}>
              {/* Sandra's actual training images */}
              <div style={{
                aspectRatio: '3/4',
                background: '#f5f5f5',
                border: '1px solid #e5e5e5',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <img 
                  src="https://i.postimg.cc/x12VBCkc/IMG-5627.jpg"
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
                  src="https://i.postimg.cc/nzMyq9Ww/IMG-4827.jpg"
                  alt="Training example: profile angle left"
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
                  PROFILE ANGLE LEFT
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
                  src="https://i.postimg.cc/TPk8yJtD/IMG-4086.jpg"
                  alt="Training example: profile angle right"
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
                  PROFILE ANGLE RIGHT
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
                  src="https://i.postimg.cc/85q0WKMj/IMG-0670.jpg"
                  alt="Training example: different expression 1"
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
                  DIFFERENT EXPRESSION 1
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
                  src="https://i.postimg.cc/bN0BDRJw/IMG-2639.jpg"
                  alt="Training example: different expression 2"
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
                  DIFFERENT EXPRESSION 2
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
                  src="https://i.postimg.cc/KYpVcvY7/IMG-3516.jpg"
                  alt="Training example: sitting shot"
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
                  SITTING SHOT
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
                  src="https://i.postimg.cc/VLX39871/IMG-3484.jpg"
                  alt="Training example: full body shot"
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
                  FULL BODY SHOT
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
                  src="https://i.postimg.cc/Hk91mg53/IMG-3168.jpg"
                  alt="Training example: front facing shot"
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
                  FRONT FACING SHOT
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
                  src="https://i.postimg.cc/ZR9QWt9G/IMG-3047-2.png"
                  alt="Training example: smiling shot"
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
                  SMILING SHOT
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
                  src="https://i.postimg.cc/59CG1JWv/IMG-0698.jpg"
                  alt="Training example: where I felt cute"
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
                  SHOT WHERE I FELT CUTE
                </div>
              </div>
            </div>

            {/* Training Tips */}
            <div className="bg-gray-50 p-10 max-w-600 mx-auto text-left">
              <h4 className={TypographyClasses.button}>
                What makes good training photos:
              </h4>
              <div className="grid grid-cols-2 gap-4 text-base leading-1-6 color-stone-700 font-light">
                <div>
                  <div className="mb-2">✓ Natural window light</div>
                  <div className="mb-2">✓ Clear, unfiltered photos</div>
                  <div className="mb-2">✓ Different angles</div>
                </div>
                <div>
                  <div className="mb-2">✓ Various expressions</div>
                  <div className="mb-2">✓ Close-up and waist-up</div>
                  <div className="mb-2">✓ Recent photos of you</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Add spinning animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
  );
}

export default function SimpleTrainingWithErrorBoundary() {
  return (
    <TrainingErrorBoundary>
      <ErrorBoundary>
        <SimpleTraining />
      </ErrorBoundary>
    </TrainingErrorBoundary>
  );
}