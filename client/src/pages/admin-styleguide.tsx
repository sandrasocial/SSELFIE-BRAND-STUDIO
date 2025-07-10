import { useState } from "react";

export default function AdminStyleguide() {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "Overview" },
    { id: "colors", title: "Colors" },
    { id: "typography", title: "Typography" },
    { id: "components", title: "Components" },
    { id: "violations", title: "Common Violations" },
    { id: "checklist", title: "Validation Checklist" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-10 py-5 flex justify-between items-center">
          <div className="font-times text-xl font-light">SSELFIE EDITORIAL STYLEGUIDE</div>
          <div className="text-xs uppercase tracking-widest text-gray-600">ADMIN DASHBOARD</div>
        </div>
      </nav>

      <div className="pt-20 flex">
        {/* Sidebar */}
        <div className="w-80 bg-gray-50 min-h-screen p-10 border-r border-gray-200">
          <div className="text-xs uppercase tracking-widest text-gray-600 mb-8">SECTIONS</div>
          <nav className="space-y-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`block w-full text-left text-sm font-light transition-colors ${
                  activeSection === section.id 
                    ? "text-black font-normal" 
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-20">
          {activeSection === "overview" && (
            <div className="max-w-4xl">
              <h1 className="font-times text-6xl uppercase font-light tracking-tight mb-12">
                Editorial Styleguide
              </h1>
              
              <div className="grid grid-cols-2 gap-16 mb-16">
                <div>
                  <h2 className="text-xs uppercase tracking-widest text-gray-600 mb-6">MISSION</h2>
                  <p className="text-lg font-light leading-relaxed">
                    Maintain SSELFIE Studio's luxury editorial aesthetic across all components. 
                    Every design decision emphasizes sophistication, minimalism, and timeless elegance.
                  </p>
                </div>
                <div>
                  <h2 className="text-xs uppercase tracking-widest text-gray-600 mb-6">PRINCIPLES</h2>
                  <ul className="space-y-3 text-lg font-light">
                    <li>• Whitespace is luxury</li>
                    <li>• Typography as art</li>
                    <li>• Minimal color palette</li>
                    <li>• Sharp, clean edges</li>
                  </ul>
                </div>
              </div>

              <div className="bg-black text-white p-16 mb-16">
                <h3 className="font-times text-4xl uppercase font-light tracking-wide mb-8">
                  Absolute Prohibitions
                </h3>
                <div className="grid grid-cols-2 gap-12 text-base font-light">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-white/60 mb-4">NEVER USE</div>
                    <ul className="space-y-2">
                      <li>× Icons or emojis</li>
                      <li>× Rounded corners</li>
                      <li>× Shadows or gradients</li>
                      <li>× Blue links</li>
                      <li>× Visual clutter</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-white/60 mb-4">ALWAYS USE</div>
                    <ul className="space-y-2">
                      <li>✓ Text characters (×, +, &gt;, •)</li>
                      <li>✓ Sharp edges</li>
                      <li>✓ Flat design</li>
                      <li>✓ Black/white palette</li>
                      <li>✓ Maximum whitespace</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "colors" && (
            <div className="max-w-4xl">
              <h1 className="font-times text-6xl uppercase font-light tracking-tight mb-12">
                Color Palette
              </h1>
              
              <div className="text-xs uppercase tracking-widest text-gray-600 mb-8">
                APPROVED COLORS ONLY
              </div>
              
              <div className="grid grid-cols-3 gap-8 mb-16">
                <div className="text-center">
                  <div className="h-48 bg-black border border-gray-200 mb-6"></div>
                  <div className="text-sm font-light mb-2">PRIMARY BLACK</div>
                  <div className="text-xs font-mono text-gray-600">#0a0a0a</div>
                </div>
                <div className="text-center">
                  <div className="h-48 bg-white border border-gray-200 mb-6"></div>
                  <div className="text-sm font-light mb-2">PRIMARY WHITE</div>
                  <div className="text-xs font-mono text-gray-600">#ffffff</div>
                </div>
                <div className="text-center">
                  <div className="h-48 bg-gray-50 border border-gray-200 mb-6"></div>
                  <div className="text-sm font-light mb-2">EDITORIAL GRAY</div>
                  <div className="text-xs font-mono text-gray-600">#f5f5f5</div>
                </div>
              </div>

              <div className="bg-gray-50 p-16">
                <h3 className="text-xs uppercase tracking-widest text-gray-600 mb-8">COLOR USAGE RULES</h3>
                <div className="grid grid-cols-2 gap-12 text-base font-light">
                  <div>
                    <div className="font-normal mb-4">Backgrounds</div>
                    <ul className="space-y-2">
                      <li>• Primary: White (#ffffff)</li>
                      <li>• Accent: Editorial Gray (#f5f5f5)</li>
                      <li>• Contrast: Black (#0a0a0a)</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-normal mb-4">Text</div>
                    <ul className="space-y-2">
                      <li>• Primary: Black (#0a0a0a)</li>
                      <li>• Secondary: Soft Gray (#666666)</li>
                      <li>• On Dark: White (#ffffff)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "typography" && (
            <div className="max-w-4xl">
              <h1 className="font-times text-6xl uppercase font-light tracking-tight mb-12">
                Typography System
              </h1>
              
              <div className="space-y-16">
                <div className="border-b border-gray-200 pb-16">
                  <div className="text-xs uppercase tracking-widest text-gray-600 mb-8">HEADLINES - TIMES NEW ROMAN</div>
                  <div className="space-y-8">
                    <div>
                      <h1 className="font-times text-8xl uppercase font-light tracking-tight">Hero Title</h1>
                      <div className="text-xs text-gray-600 mt-2">font-size: clamp(5rem, 12vw, 12rem)</div>
                    </div>
                    <div>
                      <h2 className="font-times text-6xl uppercase font-light tracking-tight">Section Header</h2>
                      <div className="text-xs text-gray-600 mt-2">font-size: clamp(3rem, 6vw, 6rem)</div>
                    </div>
                    <div>
                      <h3 className="font-times text-4xl uppercase font-light tracking-tight">Subsection</h3>
                      <div className="text-xs text-gray-600 mt-2">font-size: clamp(2rem, 4vw, 4rem)</div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-16">
                  <div className="text-xs uppercase tracking-widest text-gray-600 mb-8">BODY TEXT - SYSTEM SANS</div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-lg font-light leading-relaxed">
                        Large body text for introductions and key messages. Light weight with generous line-height.
                      </p>
                      <div className="text-xs text-gray-600 mt-2">font-size: 20px, font-weight: 300</div>
                    </div>
                    <div>
                      <p className="text-base font-light leading-relaxed">
                        Standard body text for content and descriptions. Maintains readability with optimal spacing.
                      </p>
                      <div className="text-xs text-gray-600 mt-2">font-size: 16px, font-weight: 300</div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest">
                        SMALL CAPS FOR LABELS AND NAVIGATION
                      </p>
                      <div className="text-xs text-gray-600 mt-2">font-size: 11px, letter-spacing: 0.3em</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-widest text-gray-600 mb-8">EDITORIAL QUOTES</div>
                  <div className="italic font-times text-5xl font-light leading-tight">
                    "Typography as art creates editorial sophistication and timeless elegance."
                  </div>
                  <div className="text-xs text-gray-600 mt-4">font-family: Times New Roman, italic, font-weight: 300</div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "components" && (
            <div className="max-w-4xl">
              <h1 className="font-times text-6xl uppercase font-light tracking-tight mb-12">
                Component Library
              </h1>
              
              <div className="space-y-16">
                <div>
                  <div className="text-xs uppercase tracking-widest text-gray-600 mb-8">BUTTONS</div>
                  <div className="flex gap-6 mb-6">
                    <button className="px-8 py-4 text-xs uppercase tracking-widest border border-black bg-transparent hover:bg-black hover:text-white transition-all duration-300">
                      Primary Button
                    </button>
                    <button className="px-8 py-4 text-xs uppercase tracking-widest border border-gray-400 text-gray-600 bg-transparent hover:border-black hover:text-black transition-all duration-300">
                      Secondary Button
                    </button>
                  </div>
                  <div className="bg-gray-50 p-6 text-sm font-mono">
                    className="px-8 py-4 text-xs uppercase tracking-widest border border-black bg-transparent hover:bg-black hover:text-white transition-all duration-300"
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-widest text-gray-600 mb-8">CARDS</div>
                  <div className="grid grid-cols-2 gap-8 mb-6">
                    <div className="bg-white border border-gray-200 hover:bg-black hover:text-white transition-all duration-500 cursor-pointer">
                      <div className="p-12">
                        <div className="text-xs uppercase tracking-widest mb-4">Category</div>
                        <h3 className="font-times text-3xl uppercase font-light tracking-tight mb-6">Card Title</h3>
                        <p className="text-base font-light leading-relaxed">Card description with elegant typography and proper spacing.</p>
                      </div>
                    </div>
                    <div className="bg-black text-white">
                      <div className="p-12">
                        <div className="text-xs uppercase tracking-widest mb-4 text-white/60">Category</div>
                        <h3 className="font-times text-3xl uppercase font-light tracking-tight mb-6">Dark Card</h3>
                        <p className="text-base font-light leading-relaxed">Inverted color scheme for contrast and emphasis.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-widest text-gray-600 mb-8">TEXT CHARACTERS (NO ICONS)</div>
                  <div className="grid grid-cols-4 gap-8 bg-gray-50 p-8">
                    <div className="text-center">
                      <div className="text-2xl mb-2">×</div>
                      <div className="text-xs">Close/Delete</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-2">+</div>
                      <div className="text-xs">Add/Expand</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-2">&rsaquo;</div>
                      <div className="text-xs">Next/Forward</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-2">•</div>
                      <div className="text-xs">Bullet Point</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "violations" && (
            <div className="max-w-4xl">
              <h1 className="font-times text-6xl uppercase font-light tracking-tight mb-12">
                Common Violations
              </h1>
              
              <div className="space-y-12">
                <div className="bg-red-50 border border-red-200 p-8">
                  <div className="text-xs uppercase tracking-widest text-red-600 mb-6">NEVER USE - ICONS</div>
                  <div className="bg-white p-6 border border-red-200">
                    <div className="text-sm font-mono text-red-600">
                      {`// WRONG`}<br/>
                      {`<ChevronRight className="h-4 w-4" />`}<br/>
                      {`<PlusIcon size={16} />`}
                    </div>
                  </div>
                  <div className="mt-4 text-sm font-light">
                    Replace with text characters: ›, +, ×, •, ⋮
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 p-8">
                  <div className="text-xs uppercase tracking-widest text-red-600 mb-6">NEVER USE - ROUNDED CORNERS</div>
                  <div className="bg-white p-6 border border-red-200">
                    <div className="text-sm font-mono text-red-600">
                      {`// WRONG`}<br/>
                      {`className="rounded-lg rounded-md border-radius-8"`}
                    </div>
                  </div>
                  <div className="mt-4 text-sm font-light">
                    Use sharp edges only. No border-radius values.
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 p-8">
                  <div className="text-xs uppercase tracking-widest text-red-600 mb-6">NEVER USE - UNAUTHORIZED COLORS</div>
                  <div className="bg-white p-6 border border-red-200">
                    <div className="text-sm font-mono text-red-600">
                      {`// WRONG`}<br/>
                      {`className="bg-blue-500 text-blue-600"`}<br/>
                      {`className="bg-gradient-to-r from-pink-500"`}
                    </div>
                  </div>
                  <div className="mt-4 text-sm font-light">
                    Only use: #0a0a0a (black), #ffffff (white), #f5f5f5 (gray)
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 p-8">
                  <div className="text-xs uppercase tracking-widest text-green-600 mb-6">CORRECT USAGE</div>
                  <div className="bg-white p-6 border border-green-200">
                    <div className="text-sm font-mono text-green-600">
                      {`// CORRECT`}<br/>
                      {`<span className="text-sm">×</span>`}<br/>
                      {`className="bg-black text-white border border-black"`}<br/>
                      {`className="font-times text-4xl uppercase font-light"`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "checklist" && (
            <div className="max-w-4xl">
              <h1 className="font-times text-6xl uppercase font-light tracking-tight mb-12">
                Validation Checklist
              </h1>
              
              <div className="bg-gray-50 p-12 mb-12">
                <h2 className="text-xs uppercase tracking-widest text-gray-600 mb-8">BEFORE COMMITTING CODE</h2>
                <div className="space-y-4 text-base font-light">
                  <label className="flex items-center gap-4">
                    <input type="checkbox" className="w-5 h-5"/>
                    <span>No Lucide React icons imported</span>
                  </label>
                  <label className="flex items-center gap-4">
                    <input type="checkbox" className="w-5 h-5"/>
                    <span>No emoji characters used</span>
                  </label>
                  <label className="flex items-center gap-4">
                    <input type="checkbox" className="w-5 h-5"/>
                    <span>Only approved colors (#0a0a0a, #ffffff, #f5f5f5)</span>
                  </label>
                  <label className="flex items-center gap-4">
                    <input type="checkbox" className="w-5 h-5"/>
                    <span>Times New Roman for headlines</span>
                  </label>
                  <label className="flex items-center gap-4">
                    <input type="checkbox" className="w-5 h-5"/>
                    <span>System fonts for body text</span>
                  </label>
                  <label className="flex items-center gap-4">
                    <input type="checkbox" className="w-5 h-5"/>
                    <span>No rounded corners (border-radius: 0)</span>
                  </label>
                  <label className="flex items-center gap-4">
                    <input type="checkbox" className="w-5 h-5"/>
                    <span>No shadows or gradients</span>
                  </label>
                  <label className="flex items-center gap-4">
                    <input type="checkbox" className="w-5 h-5"/>
                    <span>Text characters used instead of icons</span>
                  </label>
                  <label className="flex items-center gap-4">
                    <input type="checkbox" className="w-5 h-5"/>
                    <span>Sharp, minimal aesthetic maintained</span>
                  </label>
                </div>
              </div>

              <div className="bg-black text-white p-12">
                <h2 className="text-xs uppercase tracking-widest text-white/60 mb-8">DESIGN VALIDATION COMMANDS</h2>
                <div className="space-y-4 text-sm font-mono">
                  <div>
                    <div className="text-white/60 mb-2"># Search for icon violations:</div>
                    <div>grep -r "lucide-react" client/src/</div>
                  </div>
                  <div>
                    <div className="text-white/60 mb-2"># Check color usage:</div>
                    <div>grep -r "bg-blue\|text-blue\|border-blue" client/src/</div>
                  </div>
                  <div>
                    <div className="text-white/60 mb-2"># Find rounded corners:</div>
                    <div>grep -r "rounded-\|border-radius" client/src/</div>
                  </div>
                  <div>
                    <div className="text-white/60 mb-2"># Search for shadows:</div>
                    <div>grep -r "shadow-\|drop-shadow" client/src/</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}