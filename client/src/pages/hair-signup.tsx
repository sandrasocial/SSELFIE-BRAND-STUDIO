import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { GlobalFooter } from "../components/global-footer";

interface FormData {
  navn: string;
  epost: string;
  telefon: string;
  interesse: string;
}

interface FormErrors {
  navn?: string;
  epost?: string;
  general?: string;
}

export default function HairSignup() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<FormData>({
    navn: "",
    epost: "",
    telefon: "",
    interesse: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // SEO Meta Tags for Hair Signup
  useEffect(() => {
    document.title = "Meld deg på Hair Experience | SSELFIE Studio";
    
    const metaTags = [
      { name: 'description', content: 'Meld deg på SSELFIE Hair Experience og få profesjonelle hår- og skjønnhetsbilder for kun €47/måned. Perfekt for frisører og skjønnhetsprofesjonelle.' },
      { name: 'robots', content: 'noindex, nofollow' }, // Private signup page
      { property: 'og:title', content: 'Meld deg på Hair Experience | SSELFIE Studio' },
      { property: 'og:description', content: 'Bli med på Hair Experience og få profesjonelle AI-genererte bilder for din hår- og skjønnetsbedrift.' },
    ];

    metaTags.forEach(tag => {
      const selector = tag.name ? `meta[name="${tag.name}"]` : `meta[property="${tag.property}"]`;
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        if (tag.name) meta.setAttribute('name', tag.name);
        if (tag.property) meta.setAttribute('property', tag.property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', tag.content);
    });

    return () => {
      document.title = "SSELFIE Studio";
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.navn.trim()) {
      newErrors.navn = "Navn er påkrevd";
    }

    if (!formData.epost.trim()) {
      newErrors.epost = "E-post er påkrevd";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.epost)) {
        newErrors.epost = "Ugyldig e-post adresse";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/hair-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          kilde: 'qr-code-signup'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || 'Det oppstod en feil. Prøv igjen.' });
        return;
      }

      setIsSuccess(true);
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ general: 'Det oppstod en feil. Sjekk internettforbindelsen og prøv igjen.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToHair = () => {
    setLocation('/hair');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white text-black">
        {/* Fixed Top Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div 
                className="font-serif text-xl font-light tracking-wide text-black cursor-pointer"
                style={{ fontFamily: "Times New Roman, serif" }}
                onClick={() => setLocation("/hair")}
              >
                SSELFIE
                <span className="text-xs uppercase tracking-[0.3em] font-light text-black/70 ml-2">
                  HAIR EXPERIENCE
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Success Message */}
        <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 
                className="text-4xl md:text-5xl font-light mb-8 text-black"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Takk for din interesse!
              </h1>
              
              <p className="text-lg md:text-xl font-light leading-relaxed text-gray-700 mb-8">
                Vi har mottatt din påmelding til Hair Experience. Vi kontakter deg snart med mer informasjon 
                om hvordan du kan komme i gang med å lage profesjonelle hår- og skjønnhetsbilder.
              </p>

              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 font-light mb-6">
                    Forventet responstid: 1-2 virkedager
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleBackToHair}
                    className="bg-black text-white px-8 py-4 text-sm uppercase tracking-[0.3em] font-light hover:bg-gray-800 transition-colors duration-300"
                  >
                    Tilbake til Hair Experience
                  </button>
                  
                  <button
                    onClick={() => setLocation('/business')}
                    className="border border-black/30 text-black px-8 py-4 text-sm uppercase tracking-[0.3em] font-light hover:bg-black/5 transition-colors duration-300"
                  >
                    Se Bedriftsløsning
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <GlobalFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Fixed Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div 
              className="font-serif text-xl font-light tracking-wide text-black cursor-pointer"
              style={{ fontFamily: "Times New Roman, serif" }}
              onClick={() => setLocation("/hair")}
            >
              SSELFIE
              <span className="text-xs uppercase tracking-[0.3em] font-light text-black/70 ml-2">
                HAIR EXPERIENCE
              </span>
            </div>
            
            <button
              onClick={handleBackToHair}
              className="text-xs uppercase tracking-[0.3em] font-light text-black/70 hover:text-black transition-all duration-300"
            >
              Tilbake
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 
              className="text-4xl md:text-5xl font-light mb-8 text-black"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              Meld deg på Hair Experience
            </h1>
            
            <p className="text-lg md:text-xl font-light leading-relaxed text-gray-700 mb-8">
              Fyll ut skjemaet under for å komme i gang med profesjonelle hår- og skjønnhetsbilder 
              for kun €47 per måned.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}

            <div>
              <label 
                htmlFor="navn" 
                className="block text-sm font-light text-black uppercase tracking-[0.2em] mb-2"
              >
                Navn *
              </label>
              <input
                type="text"
                id="navn"
                name="navn"
                value={formData.navn}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${
                  errors.navn ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } focus:outline-none focus:border-black transition-colors duration-300 font-light`}
                placeholder="Skriv ditt fulle navn"
              />
              {errors.navn && (
                <p className="text-red-600 text-sm mt-1 font-light">{errors.navn}</p>
              )}
            </div>

            <div>
              <label 
                htmlFor="epost" 
                className="block text-sm font-light text-black uppercase tracking-[0.2em] mb-2"
              >
                E-post *
              </label>
              <input
                type="email"
                id="epost"
                name="epost"
                value={formData.epost}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${
                  errors.epost ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } focus:outline-none focus:border-black transition-colors duration-300 font-light`}
                placeholder="din@epost.no"
              />
              {errors.epost && (
                <p className="text-red-600 text-sm mt-1 font-light">{errors.epost}</p>
              )}
            </div>

            <div>
              <label 
                htmlFor="telefon" 
                className="block text-sm font-light text-black uppercase tracking-[0.2em] mb-2"
              >
                Telefonnummer (valgfritt)
              </label>
              <input
                type="tel"
                id="telefon"
                name="telefon"
                value={formData.telefon}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors duration-300 font-light"
                placeholder="+47 xxx xx xxx"
              />
            </div>

            <div>
              <label 
                htmlFor="interesse" 
                className="block text-sm font-light text-black uppercase tracking-[0.2em] mb-2"
              >
                Fortell oss om din interesse (valgfritt)
              </label>
              <textarea
                id="interesse"
                name="interesse"
                value={formData.interesse}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors duration-300 font-light resize-none"
                placeholder="Beskriv hva du håper å oppnå med Hair Experience..."
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-white px-8 py-4 text-sm uppercase tracking-[0.3em] font-light transition-colors duration-300 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-black hover:bg-gray-800'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sender...
                  </span>
                ) : (
                  'Send påmelding'
                )}
              </button>
              
              <p className="text-xs text-gray-600 text-center mt-4 font-light">
                * Påkrevde felt
              </p>
            </div>
          </form>

          <div className="mt-12 text-center">
            <div className="border-t border-gray-200 pt-8">
              <h3 
                className="text-xl font-light mb-4 text-black"
                style={{ fontFamily: "Times New Roman, serif" }}
              >
                Hva får du?
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="font-light text-black mb-2">100 bilder/måned</div>
                  <div className="text-gray-600">Profesjonelle hår- og skjønnhetsbilder</div>
                </div>
                <div>
                  <div className="font-light text-black mb-2">€47/måned</div>
                  <div className="text-gray-600">Kun en brøkdel av tradisjonelle fotoshoot</div>
                </div>
                <div>
                  <div className="font-light text-black mb-2">24t trening</div>
                  <div className="text-gray-600">Din personlige AI-modell klar på en dag</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GlobalFooter />
    </div>
  );
}
