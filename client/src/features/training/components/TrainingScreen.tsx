import React, { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Camera, ChevronRight, Star, X } from 'lucide-react';
import { useTrainingStatus } from '../../../hooks/useTrainingStatus';
import { useEnhancedImageOptimization } from '../../../hooks/useEnhancedImageOptimization';
import { apiRequest } from '../../../lib/queryClient';
import { useToast } from '../../../hooks/use-toast';
import { SandraImages } from '../../../lib/sandra-images';

// Props are intentionally untyped for now to align with neighboring screens
const TrainingScreen = ({ user, setHasTrainedModel, setActiveTab }: any) => {
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [selfieImages, setSelfieImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [retrainPriceEUR, setRetrainPriceEUR] = useState<number>(Number((import.meta as any)?.env?.VITE_RETRAIN_PRICE_EUR ?? 10));

  const [forceRetraining, setForceRetraining] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { batchOptimize } = useEnhancedImageOptimization();
  const queryClient = useQueryClient();

  // On return from Stripe (success), auto-refresh user and clean URL
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('retraining') === 'success') {
        // Invalidate cached /api/me to get updated hasRetrainingAccess
        queryClient.invalidateQueries({ queryKey: ['/api/me'] });
        // Remove the query param without a full reload
        url.searchParams.delete('retraining');
        window.history.replaceState({}, document.title, url.pathname + (url.search ? '?' + url.searchParams.toString() : '') + url.hash);
      }
    } catch (e) {
      // noop
    }
  }, [queryClient]);

  // Fetch pricing from server to keep UI consistent with Stripe
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/pricing');
        if (!res.ok) return;
        const data = await res.json();
        const cents = data?.retraining?.amountCents;
        if (!cancelled && typeof cents === 'number' && isFinite(cents)) {
          setRetrainPriceEUR(Math.round(cents / 100));
        }
      } catch {
        // ignore; fallback to env default
      }
    })();
    return () => { cancelled = true; };
  }, []);


  const { toast } = useToast();

  // Maintain object URLs for previews and cleanup
  useEffect(() => {
    const urls = selfieImages.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [selfieImages]);

  // Real training status
  const {
    progressMetrics,
    isTraining,
    isCompleted,
    refetch,
  } = useTrainingStatus(user?.id || '', true);

  // Locally override completed state when user initiates retraining
  const showCompleted = isCompleted && !forceRetraining;

  // Inform parent when completed
  if (isCompleted) {
    setHasTrainedModel?.(true);
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imagesOnly = files.filter((f) => f.type.startsWith('image/'));
    if (imagesOnly.length !== files.length) {
      toast({ title: 'Some files were skipped', description: 'Only image files are allowed.' });
    }
    setSelfieImages((prev) => [...prev, ...imagesOnly]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    const imagesOnly = files.filter((f) => f.type.startsWith('image/'));
    if (imagesOnly.length !== files.length) {
      toast({ title: 'Some files were skipped', description: 'Only image files are allowed.' });
    }
    if (imagesOnly.length) setSelfieImages((prev) => [...prev, ...imagesOnly]);
  };

  const removeImageAt = (index: number) => {
    setSelfieImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRetrainClick = async () => {
    if (!user) {
      toast({ title: 'Authentication required', description: 'Please sign in to retrain your model.' });
      return;
    }

    // If user already has retraining access, go straight to upload state
    if (user.hasRetrainingAccess) {
      setForceRetraining(true);
      setSelfieImages([]);
      setSelectedGender('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsCheckingPayment(true);
    try {
      const response = await fetch('/api/create-retrain-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          successUrl: window.location.href + (window.location.search ? '&' : '?') + 'retraining=success',
          cancelUrl: window.location.href
        })
      });

      const data = await response.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Retraining checkout error:', error);
      toast({ title: 'Payment Error', description: 'Failed to start checkout. Please try again.' });
      setIsCheckingPayment(false);
    }
  };


  const startTraining = async () => {
    if (!selectedGender) {
      toast({ title: 'Gender Required', description: 'Please select your gender before starting training.' });
      return;
    }
    if (selfieImages.length < 10) {
      toast({ title: 'Need More Photos', description: `Only ${selfieImages.length} photos uploaded. Minimum 10 required.` });
      return;
    }

    try {
      setIsUploading(true);
      // Optimize images client-side
      const blobs = await batchOptimize(selfieImages, {}, () => {});
      const base64s = await Promise.all(
        blobs.map(
          (b) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(b);
            })
        )
      );

      await apiRequest('/api/start-model-training', 'POST', {
        selfieImages: base64s,
        gender: selectedGender,
        retraining: forceRetraining === true,
      });

      toast({ title: 'Training Started', description: 'Your AI model is now training.' });
      refetch();
    } catch (err: any) {
      console.error('Start training failed', err);
      toast({ title: 'Training Failed', description: err?.message || 'Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  // Training in progress UI (artifact styling)
  if (isTraining && !isCompleted) {
    const progress = Math.max(0, Math.min(100, progressMetrics?.progress ?? 0));
    return (
      <div className="space-y-6 sm:space-y-8 pb-4">
        <div className="pt-3 sm:pt-4 md:pt-6 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase leading-none mb-2 sm:mb-3">
            AI Training
          </h1>
          <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase font-light text-stone-500">
            Training Your Personal Model
          </p>
        </div>

        <div className="bg-white/50 backdrop-blur-2xl border border-white/60 rounded-xl sm:rounded-[1.75rem] p-5 sm:p-6 md:p-8 shadow-xl shadow-stone-900/10">
          <div className="text-center mb-6 sm:mb-8">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6">
              <div className="absolute inset-0 rounded-full bg-stone-200/30 animate-ping"></div>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-stone-950 flex items-center justify-center shadow-2xl shadow-stone-900/40 animate-pulse">
                <div className="text-white text-xl sm:text-2xl font-bold">{progress}%</div>
              </div>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-stone-950 mb-3 sm:mb-4">Training Your Model</h3>
            <p className="text-xs sm:text-sm font-medium text-stone-600 mb-6 sm:mb-8">This takes about 20 minutes. You'll get a notification when it's ready.</p>
          </div>

          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between text-xs sm:text-sm font-semibold text-stone-700 mb-2 sm:mb-3">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="relative w-full h-2.5 sm:h-3 bg-stone-200/40 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-stone-950 rounded-full transition-all duration-500 shadow-lg" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {[
              { stage: 'Preprocessing', done: progress > 20 },
              { stage: 'Training Model', done: progress > 70 },
              { stage: 'Finalizing', done: progress > 95 }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 sm:p-4 bg-white/50 backdrop-blur-xl rounded-lg sm:rounded-[1.25rem] border border-white/60 shadow-lg">
                <span className="text-xs sm:text-sm font-semibold text-stone-950">{item.stage}</span>
                <div className={`${item.done ? 'bg-stone-950 shadow-lg shadow-stone-900/30' : 'bg-stone-300/60'} w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all duration-300`}>
                  {item.done && <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white rounded-full"></div>}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 sm:mt-8 text-center">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-stone-100 backdrop-blur-xl rounded-full border border-stone-200">
              <div className="flex gap-0.5 sm:gap-1">
                <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-stone-950 animate-bounce"></div>
                <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-stone-950 animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-stone-950 animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="text-[10px] sm:text-xs tracking-wider uppercase font-semibold text-stone-700">
                {Math.max(0, Math.round((100 - progress) / 5))} minutes remaining
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Completed UI (artifact styling)
  if (showCompleted) {
    return (
      <div className="space-y-6 sm:space-y-8 pb-4">
        <div className="pt-3 sm:pt-4 md:pt-6 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase leading-none mb-2 sm:mb-3">
            AI Training
          </h1>
          <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase font-light text-stone-500">Training Complete</p>
        </div>

        <div className="bg-white/50 backdrop-blur-2xl border border-white/60 rounded-xl sm:rounded-[1.75rem] p-5 sm:p-6 md:p-8 text-center shadow-xl shadow-stone-900/10">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-stone-200/30 rounded-full animate-ping"></div>
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-stone-950 rounded-full flex items-center justify-center shadow-2xl shadow-stone-900/40">
              <Star size={32} className="text-white" strokeWidth={2.5} fill="currentColor" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-stone-950 mb-3 sm:mb-4">Training Complete</h3>
          <p className="text-xs sm:text-sm font-medium text-stone-600 mb-6 sm:mb-8">Your AI model is ready! You can now create professional photos.</p>

          <button
            onClick={() => { setHasTrainedModel?.(true); setActiveTab?.('studio'); }}
            className="group relative w-full bg-stone-950 text-white py-4 sm:py-5 rounded-xl sm:rounded-[1.5rem] font-semibold tracking-wide text-xs sm:text-sm transition-all duration-300 hover:shadow-2xl hover:shadow-stone-900/40 mb-3 sm:mb-4 min-h-[52px] sm:min-h-[60px] overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              Go to Studio
              <ChevronRight size={14} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {!user?.hasRetrainingAccess && (
            <div className="mb-3 sm:mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-200/60 bg-white/70 backdrop-blur-md shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-900" />
                <span className="text-[10px] sm:text-xs tracking-[0.12em] uppercase font-medium text-stone-800">
                  {`Retraining costs €${retrainPriceEUR}`}
                </span>
              </span>
            </div>
          )}
          <button
            onClick={handleRetrainClick}
            disabled={isCheckingPayment}
            className="w-full bg-white/60 backdrop-blur-xl text-stone-950 border border-white/70 py-4 sm:py-5 rounded-xl sm:rounded-[1.5rem] font-semibold text-xs sm:text-sm transition-all duration-300 hover:bg-white/80 hover:border-white/90 min-h-[52px] sm:min-h-[60px] shadow-lg shadow-stone-900/10 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCheckingPayment ? 'Processing...' : user?.hasRetrainingAccess ? 'Retrain Model' : (`Pay €${retrainPriceEUR} to Retrain`)}
          </button>
        </div>
      </div>
    );
  }

  // Upload stage (artifact styling)
  return (
    <div className="space-y-6 sm:space-y-8 pb-4">
      <div className="pt-3 sm:pt-4 md:pt-6 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase leading-none mb-2 sm:mb-3">AI Training</h1>
        <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase font-light text-stone-500">Train Your Personal Model</p>
      </div>

      <div className="bg-stone-100/50 border border-stone-200/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
        <div className="text-center mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg md:text-xl font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase mb-2 sm:mb-3">Select Your Gender</h3>
          <p className="text-xs sm:text-sm font-light text-stone-600">This helps us train your AI model more accurately</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto mb-4 sm:mb-6">
          {[
            { value: 'woman', label: 'Woman' },
            { value: 'man', label: 'Man' },
            { value: 'non-binary', label: 'Non Binary' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedGender(option.value)}
              className={`group p-4 sm:p-6 rounded-xl sm:rounded-[1.5rem] font-semibold tracking-wide text-xs sm:text-sm transition-all duration-300 min-h-[75px] sm:min-h-[90px] relative overflow-hidden ${
                selectedGender === option.value
                  ? 'bg-stone-950 text-white shadow-2xl shadow-stone-900/40 scale-[1.02]'
                  : 'bg-white/50 backdrop-blur-xl text-stone-950 border border-white/60 hover:bg-white/70 hover:border-white/80 hover:scale-[1.02]'
              } border shadow-lg shadow-stone-900/10 active:scale-[0.98]`}
            >
              {selectedGender === option.value && (
                <div className="absolute inset-0 bg-white/10"></div>
              )}
              <span className="relative z-10">{option.label}</span>
            </button>
          ))}
        </div>

        {selectedGender && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-stone-100 backdrop-blur-xl rounded-full border border-stone-200 shadow-lg">
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-stone-950 rounded-full shadow-lg shadow-stone-900/50"></div>
              <span className="text-[10px] sm:text-xs tracking-wider uppercase font-semibold text-stone-950">
                Selected: {selectedGender === 'woman' ? 'Woman' : selectedGender === 'man' ? 'Man' : 'Non Binary'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-stone-100/50 border border-stone-200/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-[10px] sm:text-xs tracking-[0.15em] uppercase font-light mb-3 sm:mb-4 text-stone-500">Step 1 of 2</div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-extralight tracking-[0.1em] text-stone-950 uppercase mb-3 sm:mb-4">Upload Your Selfies</h3>
          <p className="text-xs sm:text-sm font-light text-stone-600 mb-4 sm:mb-6">Upload 10-20 selfies to train your AI model. Good lighting and variety work best.</p>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
        <div
          className="border-2 border-dashed border-stone-300/60 rounded-xl sm:rounded-[1.5rem] p-6 sm:p-8 md:p-12 text-center mb-4 sm:mb-6 bg-white/30 backdrop-blur-xl hover:bg-white/50 hover:border-stone-400/60 transition-all duration-300 cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
          onDrop={handleDrop}
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-stone-950 rounded-lg sm:rounded-[1.25rem] flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl shadow-stone-900/30 group-hover:scale-110 transition-transform duration-300">
            <Camera size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <h4 className="text-sm sm:text-base font-semibold text-stone-950 mb-2 sm:mb-3">Click to Upload Photos</h4>
          <p className="text-xs sm:text-sm font-medium text-stone-600 mb-3 sm:mb-4">or drag and drop</p>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-stone-100/60 backdrop-blur-xl rounded-full">
            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-stone-950 rounded-full"></div>
            <span className="text-[10px] sm:text-xs tracking-wider uppercase font-semibold text-stone-700">
              {selfieImages.length} / 10 minimum
            </span>
          </div>
        </div>

        {previewUrls.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden border border-stone-300/40 bg-stone-100/60">
                  <img src={url} alt={`Selected ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={(e) => { e.stopPropagation(); removeImageAt(idx); }}
                    className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 border border-white/70 flex items-center justify-center shadow-md hover:bg-white"
                  >
                    <X size={14} className="text-stone-900" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { label: 'Clear Photos', desc: 'Well-lit selfies' },
            { label: 'Variety', desc: 'Different angles' },
            { label: '10-20 Images', desc: 'Best results' }
          ].map((item, i) => (
            <div key={i} className="text-center p-3 sm:p-4 bg-stone-50/50 rounded-lg sm:rounded-xl border border-stone-200/30">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-stone-950 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white rounded-full"></div>
              </div>
              <div className="text-xs sm:text-sm font-light text-stone-950 mb-1">{item.label}</div>
              <div className="text-[10px] sm:text-xs font-light text-stone-600">{item.desc}</div>
            </div>
          ))}
        </div>

        <button
          onClick={startTraining}
          disabled={selfieImages.length < 10 || !selectedGender || isUploading}
          className={`w-full bg-stone-950 text-stone-50 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-light tracking-[0.15em] uppercase text-xs sm:text-sm transition-all duration-200 min-h-[48px] sm:min-h-[52px] ${selfieImages.length < 10 || !selectedGender || isUploading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-stone-800'}`}
        >
          {isUploading ? 'Starting Training...' : 'Start Training'}
        </button>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-base sm:text-lg font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase">Example Training Photos</h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {SandraImages.portraits.professional.slice(0, 6).map((imageUrl, i) => (
            <div key={i} className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden border border-stone-300/30 bg-stone-200/30">
              <img src={imageUrl} alt={`Example ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
        <div className="mt-2 sm:mt-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-stone-200/60 bg-white/70 backdrop-blur-md shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-900" />
            <span className="text-[10px] sm:text-xs tracking-[0.12em] uppercase font-medium text-stone-800">These are examples of good selfies for training.</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrainingScreen;

