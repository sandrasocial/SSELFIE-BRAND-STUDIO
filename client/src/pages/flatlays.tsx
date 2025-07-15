import { useState } from "react";
import MemberNavigation from "@/components/member-navigation";

// Curated collections with 12 images each
const collections = {
  "luxury-minimal": {
    name: "Luxury Minimal",
    description: "Refined minimalism with luxury touches",
    images: [
      "https://i.postimg.cc/zGJNZyYY/luxury-minimal-1.jpg",
      "https://i.postimg.cc/QtF8HM2P/luxury-minimal-2.jpg",
      "https://i.postimg.cc/g0YJnV0k/luxury-minimal-3.jpg",
      "https://i.postimg.cc/8C2DqHNd/luxury-minimal-4.jpg",
      "https://i.postimg.cc/VkD7Q8nZ/luxury-minimal-5.jpg",
      "https://i.postimg.cc/yYKtZgJ6/luxury-minimal-6.jpg",
      "https://i.postimg.cc/BNQMX8Nh/luxury-minimal-7.jpg",
      "https://i.postimg.cc/QCp1Bv8X/luxury-minimal-8.jpg",
      "https://i.postimg.cc/76DzKJ8w/luxury-minimal-9.jpg",
      "https://i.postimg.cc/mgKZv8Kb/luxury-minimal-10.jpg",
      "https://i.postimg.cc/VLq8hTdX/luxury-minimal-11.jpg",
      "https://i.postimg.cc/xjJdCL1t/luxury-minimal-12.jpg"
    ]
  },
  "editorial-magazine": {
    name: "Editorial Magazine",
    description: "High-fashion editorial sophistication",
    images: [
      "https://i.postimg.cc/prJ6ZqR4/editorial-1.jpg",
      "https://i.postimg.cc/SQr7DFLy/editorial-2.jpg",
      "https://i.postimg.cc/QMHdV5YJ/editorial-3.jpg",
      "https://i.postimg.cc/hjvhMK49/editorial-4.jpg",
      "https://i.postimg.cc/ZRxpk76v/editorial-5.jpg",
      "https://i.postimg.cc/5yW8F6VJ/editorial-6.jpg",
      "https://i.postimg.cc/zXb8L7YB/editorial-7.jpg",
      "https://i.postimg.cc/L6R2qHXy/editorial-8.jpg",
      "https://i.postimg.cc/0yVLZ8Ty/editorial-9.jpg",
      "https://i.postimg.cc/tCGKZPnD/editorial-10.jpg",
      "https://i.postimg.cc/g2Y8wQ1P/editorial-11.jpg",
      "https://i.postimg.cc/3w9Lm5YM/editorial-12.jpg"
    ]
  },
  "european-luxury": {
    name: "European Luxury",
    description: "Parisian elegance and designer sophistication",
    images: [
      "https://i.postimg.cc/8zm8wQ5P/european-1.jpg",
      "https://i.postimg.cc/yNW1q8Ly/european-2.jpg",
      "https://i.postimg.cc/02DXVZ2k/european-3.jpg",
      "https://i.postimg.cc/Y9g7DqBr/european-4.jpg",
      "https://i.postimg.cc/4ywKFGJ0/european-5.jpg",
      "https://i.postimg.cc/vZnKL8M1/european-6.jpg",
      "https://i.postimg.cc/K8LyG9qh/european-7.jpg",
      "https://i.postimg.cc/CK5DxFmY/european-8.jpg",
      "https://i.postimg.cc/QNz8pY4M/european-9.jpg",
      "https://i.postimg.cc/6QH2sVNy/european-10.jpg",
      "https://i.postimg.cc/85Tg3Kyd/european-11.jpg",
      "https://i.postimg.cc/w3Nk8vGz/european-12.jpg"
    ]
  },
  "fitness-health": {
    name: "Fitness & Health",
    description: "Wellness and active lifestyle inspiration",
    images: [
      "https://i.postimg.cc/rp6X8wq1/fitness-1.jpg",
      "https://i.postimg.cc/NjK8T7Wy/fitness-2.jpg",
      "https://i.postimg.cc/Kjz4x8M0/fitness-3.jpg",
      "https://i.postimg.cc/5j9nqN4K/fitness-4.jpg",
      "https://i.postimg.cc/d1z8Qn5Y/fitness-5.jpg",
      "https://i.postimg.cc/J4K8wWnj/fitness-6.jpg",
      "https://i.postimg.cc/MZrJbD9m/fitness-7.jpg",
      "https://i.postimg.cc/DZ02VqGy/fitness-8.jpg",
      "https://i.postimg.cc/sXzm8Nd4/fitness-9.jpg",
      "https://i.postimg.cc/6QHww8zB/fitness-10.jpg",
      "https://i.postimg.cc/W4Sg6XJ5/fitness-11.jpg",
      "https://i.postimg.cc/FK1vr8qD/fitness-12.jpg"
    ]
  },
  "coastal-vibes": {
    name: "Coastal Vibes",
    description: "Beach lifestyle and ocean inspiration",
    images: [
      "https://i.postimg.cc/W4J9xNzV/coastal-1.jpg",
      "https://i.postimg.cc/L5K8qZ3j/coastal-2.jpg",
      "https://i.postimg.cc/hjwrVKq4/coastal-3.jpg",
      "https://i.postimg.cc/LsH8qN5Y/coastal-4.jpg",
      "https://i.postimg.cc/5tj8LcPn/coastal-5.jpg",
      "https://i.postimg.cc/pL8qvN6g/coastal-6.jpg",
      "https://i.postimg.cc/yYJ8bR4k/coastal-7.jpg",
      "https://i.postimg.cc/W3K8mT7j/coastal-8.jpg",
      "https://i.postimg.cc/QMd8xV9n/coastal-9.jpg",
      "https://i.postimg.cc/6TH8vQ2k/coastal-10.jpg",
      "https://i.postimg.cc/fLJ8dN5m/coastal-11.jpg",
      "https://i.postimg.cc/RZK8xP3j/coastal-12.jpg"
    ]
  },
  "pink-girly": {
    name: "Pink & Girly",
    description: "Feminine charm with playful sophistication",
    images: [
      "https://i.postimg.cc/yY2L8qGx/pink-1.jpg",
      "https://i.postimg.cc/QCf8mH7Y/pink-2.jpg",
      "https://i.postimg.cc/BvW8nL5k/pink-3.jpg",
      "https://i.postimg.cc/QMK8wV9j/pink-4.jpg",
      "https://i.postimg.cc/Hx8qR6Tm/pink-5.jpg",
      "https://i.postimg.cc/8z5L8kNp/pink-6.jpg",
      "https://i.postimg.cc/vZ8qM4Jy/pink-7.jpg",
      "https://i.postimg.cc/LsK8nQ3f/pink-8.jpg",
      "https://i.postimg.cc/6Q8xvR5Y/pink-9.jpg",
      "https://i.postimg.cc/Nj8mT6Wk/pink-10.jpg",
      "https://i.postimg.cc/fyL8dR4m/pink-11.jpg",
      "https://i.postimg.cc/NM8qxV7j/pink-12.jpg"
    ]
  },
  "cream-aesthetic": {
    name: "Cream Aesthetic",
    description: "Neutral tones and minimalist elegance",
    images: [
      "https://i.postimg.cc/zv2m8qLx/cream-1.jpg",
      "https://i.postimg.cc/QCb8nH5Y/cream-2.jpg",
      "https://i.postimg.cc/Bv3m8nQ6k/cream-3.jpg",
      "https://i.postimg.cc/QM4m8wV7j/cream-4.jpg",
      "https://i.postimg.cc/Hx5m8qR9m/cream-5.jpg",
      "https://i.postimg.cc/8z6m8kLp/cream-6.jpg",
      "https://i.postimg.cc/vZ7m8qM2y/cream-7.jpg",
      "https://i.postimg.cc/Ls8m8nQ1f/cream-8.jpg",
      "https://i.postimg.cc/6Q9m8xvR3Y/cream-9.jpg",
      "https://i.postimg.cc/Nj0m8T4Wk/cream-10.jpg",
      "https://i.postimg.cc/fy1m8dR2m/cream-11.jpg",
      "https://i.postimg.cc/NM2m8qxV5j/cream-12.jpg"
    ]
  }
};

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