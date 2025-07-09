import { useState } from 'react';

interface BrandbookPreviewProps {
  brandbook: {
    businessName: string;
    tagline?: string;
    story?: string;
    primaryFont: string;
    secondaryFont: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoType: string;
    logoUrl?: string;
    moodboardStyle: string;
    voiceTone?: string;
    keyPhrases?: string;
  };
}

export function BrandbookPreview({ brandbook }: BrandbookPreviewProps) {
  const [activeTab, setActiveTab] = useState('colors');

  const tabs = [
    { id: 'colors', label: 'Colors' },
    { id: 'fonts', label: 'Typography' },
    { id: 'logo', label: 'Logo' },
    { id: 'voice', label: 'Voice' }
  ];

  return (
    <div className="bg-white border border-[#e5e5e5] h-full">
      {/* Header */}
      <div className="border-b border-[#e5e5e5] p-6">
        <h2 className="text-2xl font-light mb-2" style={{ fontFamily: brandbook.primaryFont }}>
          {brandbook.businessName || 'Your Business'}
        </h2>
        {brandbook.tagline && (
          <p className="text-[#666]" style={{ fontFamily: brandbook.secondaryFont }}>
            {brandbook.tagline}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-[#e5e5e5]">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#0a0a0a] text-[#0a0a0a]'
                  : 'border-transparent text-[#666] hover:text-[#0a0a0a]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'colors' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-[#0a0a0a] mb-3">Color Palette</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div
                    className="w-full h-20 border border-[#e5e5e5] mb-2"
                    style={{ backgroundColor: brandbook.primaryColor }}
                  ></div>
                  <div className="text-xs text-[#666]">Primary</div>
                  <div className="text-xs font-mono">{brandbook.primaryColor}</div>
                </div>
                <div className="text-center">
                  <div
                    className="w-full h-20 border border-[#e5e5e5] mb-2"
                    style={{ backgroundColor: brandbook.secondaryColor }}
                  ></div>
                  <div className="text-xs text-[#666]">Secondary</div>
                  <div className="text-xs font-mono">{brandbook.secondaryColor}</div>
                </div>
                <div className="text-center">
                  <div
                    className="w-full h-20 border border-[#e5e5e5] mb-2"
                    style={{ backgroundColor: brandbook.accentColor }}
                  ></div>
                  <div className="text-xs text-[#666]">Accent</div>
                  <div className="text-xs font-mono">{brandbook.accentColor}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fonts' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-[#0a0a0a] mb-3">Typography</h3>
              <div className="space-y-4">
                <div className="border border-[#e5e5e5] p-4">
                  <div className="text-sm text-[#666] mb-2">Primary Font (Headlines)</div>
                  <div className="text-xl" style={{ fontFamily: brandbook.primaryFont }}>
                    {brandbook.primaryFont}
                  </div>
                  <div className="text-sm text-[#666] mt-2">
                    Example: This is your headline style
                  </div>
                </div>
                <div className="border border-[#e5e5e5] p-4">
                  <div className="text-sm text-[#666] mb-2">Secondary Font (Body Text)</div>
                  <div className="text-lg" style={{ fontFamily: brandbook.secondaryFont }}>
                    {brandbook.secondaryFont}
                  </div>
                  <div className="text-sm text-[#666] mt-2">
                    Example: This is your body text style for all content and descriptions.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logo' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-[#0a0a0a] mb-3">Logo Design</h3>
              <div className="border border-[#e5e5e5] p-8 text-center">
                {brandbook.logoType === 'upload' && brandbook.logoUrl ? (
                  <img src={brandbook.logoUrl} alt="Logo" className="max-h-24 mx-auto" />
                ) : (
                  <div className="space-y-2">
                    <div className="w-24 h-24 bg-[#f5f5f5] border border-[#e5e5e5] mx-auto flex items-center justify-center">
                      <span className="text-[#0a0a0a] font-light text-lg">AI</span>
                    </div>
                    <p className="text-sm text-[#666]">
                      Sandra AI will create your minimalistic logo
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-[#0a0a0a] mb-3">Brand Voice</h3>
              <div className="space-y-4">
                {brandbook.voiceTone && (
                  <div className="border border-[#e5e5e5] p-4">
                    <div className="text-sm text-[#666] mb-2">Tone & Personality</div>
                    <div className="text-[#0a0a0a]">{brandbook.voiceTone}</div>
                  </div>
                )}
                {brandbook.keyPhrases && (
                  <div className="border border-[#e5e5e5] p-4">
                    <div className="text-sm text-[#666] mb-2">Key Phrases</div>
                    <div className="text-[#0a0a0a]">{brandbook.keyPhrases}</div>
                  </div>
                )}
                <div className="border border-[#e5e5e5] p-4">
                  <div className="text-sm text-[#666] mb-2">Visual Style</div>
                  <div className="text-[#0a0a0a] capitalize">
                    {brandbook.moodboardStyle.replace('-', ' ')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}