import React from 'react';

export const EditorialGrid: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Feature Block 1 */}
          <div className="space-y-4">
            <h3 className="font-times-new-roman text-2xl tracking-tight">Creative Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              Transform your artistic concepts into compelling visual narratives.
            </p>
          </div>

          {/* Feature Block 2 */}
          <div className="space-y-4">
            <h3 className="font-times-new-roman text-2xl tracking-tight">Editorial Excellence</h3>
            <p className="text-gray-600 leading-relaxed">
              Curate your content with the precision of a luxury magazine editor.
            </p>
          </div>

          {/* Feature Block 3 */}
          <div className="space-y-4">
            <h3 className="font-times-new-roman text-2xl tracking-tight">Digital Atelier</h3>
            <p className="text-gray-600 leading-relaxed">
              Your sophisticated workspace for creating timeless digital content.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};