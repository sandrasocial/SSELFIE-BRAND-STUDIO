import { useState } from "react";
import MemberNavigation from "@/components/member-navigation";
import { flatlayCollections } from "@/lib/flatlay-collections";

// Convert to object format for easier access
const collections = flatlayCollections.reduce((acc, collection) => {
  acc[collection.id] = {
    name: collection.name,
    description: collection.description,
    images: collection.images
  };
  return acc;
}, {} as Record<string, { name: string; description: string; images: string[] }>);

export default function FlatlayLibrary() {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  const collectionKeys = Object.keys(collections);
  const selectedCollectionData = selectedCollection ? collections[selectedCollection as keyof typeof collections] : null;

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation transparent={false} />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-serif text-5xl lg:text-6xl text-black mb-6">
              Flatlay Library
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Curated collections of professional flatlays to enhance your brand photography and visual storytelling.
            </p>
          </div>

          {!selectedCollection ? (
            /* Collection Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collectionKeys.map((key) => {
                const collection = collections[key as keyof typeof collections];
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedCollection(key)}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-100 mb-4">
                      <img
                        src={collection.images[0]}
                        alt={collection.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <h3 className="font-serif text-xl text-black mb-2">
                      {collection.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {collection.description}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Selected Collection View */
            <div>
              <div className="flex items-center justify-between mb-12">
                <button
                  onClick={() => setSelectedCollection(null)}
                  className="text-black hover:text-gray-600 transition-colors"
                >
                  ‹ Back to Collections
                </button>
                <div className="text-center">
                  <h2 className="font-serif text-3xl text-black mb-2">
                    {selectedCollectionData?.name}
                  </h2>
                  <p className="text-gray-600">
                    {selectedCollectionData?.description}
                  </p>
                </div>
                <div className="w-20" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedCollectionData?.images.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="aspect-square overflow-hidden bg-gray-100"
                  >
                    <img
                      src={imageUrl}
                      alt={`${selectedCollectionData.name} ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}