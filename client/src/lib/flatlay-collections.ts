// Flatlay Collections - Ready for uploaded images
// Each collection will have 12 curated images uploaded by user

export interface FlatlayCollection {
  id: string;
  name: string;
  description: string;
  images: string[];
}

export const flatlayCollections: FlatlayCollection[] = [
  {
    id: "luxury-minimal",
    name: "Luxury Minimal",
    description: "Refined minimalism with luxury touches",
    images: [
      "https://i.postimg.cc/1tfNMJvk/file-16.png",
      "https://i.postimg.cc/6qZ4xTJz/file-19.png",
      "https://i.postimg.cc/4NzH8K1x/file-20.png",
      "https://i.postimg.cc/V5ysqFhW/file-21.png",
      "https://i.postimg.cc/yY9cwp7B/file-22.png",
      "https://i.postimg.cc/bvFZG1q3/file-23.png",
      "https://i.postimg.cc/C1Bzbd1Y/file-24.png",
      "https://i.postimg.cc/Y95jRkGF/file-25.png",
      "https://i.postimg.cc/sgr7yP2W/file-26.png",
      "https://i.postimg.cc/5t9zQxLN/file-27.png",
      "https://i.postimg.cc/3wLvgPFj/file-28.png",
      "https://i.postimg.cc/x13Hdkk4/file-31.png",
      "https://i.postimg.cc/HWFbv1DB/file-32.png",
      "https://i.postimg.cc/PfCmMrcC/file-33.png",
      "https://i.postimg.cc/kMRbbY68/file-44.png",
      "https://i.postimg.cc/kXrtFNKH/file-45.png",
      "https://i.postimg.cc/Z54BXTfF/file-46.png",
      "https://i.postimg.cc/htszBH6F/file-47.png",
      "https://i.postimg.cc/0NN62V1z/file-48.png"
    ]
  },
  {
    id: "editorial-magazine",
    name: "Editorial Magazine",
    description: "High-fashion editorial sophistication",
    images: [
      "https://i.postimg.cc/02VLGyr8/1.png",
      "https://i.postimg.cc/xjR7Y1vK/10.png",
      "https://i.postimg.cc/TwC83VLX/100.png",
      "https://i.postimg.cc/90nvGcY8/101.png",
      "https://i.postimg.cc/j25pwDPn/102.png",
      "https://i.postimg.cc/9F43cqcv/103.png",
      "https://i.postimg.cc/QNYGLqZQ/104.png",
      "https://i.postimg.cc/fT1GyTLk/105.png",
      "https://i.postimg.cc/rwWvrX0j/106.png",
      "https://i.postimg.cc/CKg9CPbg/107.png",
      "https://i.postimg.cc/hG162L07/108.png",
      "https://i.postimg.cc/636Sg8Hb/109.png",
      "https://i.postimg.cc/hPtYGRsN/11.png",
      "https://i.postimg.cc/gJM5WGQz/110.png"
    ]
  },
  {
    id: "european-luxury",
    name: "European Luxury",
    description: "Parisian elegance and designer sophistication",
    images: [
      "https://i.postimg.cc/rmgNb53p/file-1.png",
      "https://i.postimg.cc/RhFLzNxL/file-10.png",
      "https://i.postimg.cc/SQ7BS5FX/file-11.png",
      "https://i.postimg.cc/wTqS7Vgw/file-12.png",
      "https://i.postimg.cc/pLXRMvmX/file-13.png",
      "https://i.postimg.cc/W3V5xN45/file-14.png",
      "https://i.postimg.cc/rw6xfhsJ/file-15.png",
      "https://i.postimg.cc/cJBRgQsc/file-16.png",
      "https://i.postimg.cc/pTVDDprM/file-17.png",
      "https://i.postimg.cc/ZRf6j4vB/file-18.png",
      "https://i.postimg.cc/t4MQ0x02/file-19.png",
      "https://i.postimg.cc/KjHrcxZS/file-2.png",
      "https://i.postimg.cc/SxTqyP9L/file-20.png",
      "https://i.postimg.cc/HstdNnsh/file-21.png",
      "https://i.postimg.cc/kgtw466j/file-22.png",
      "https://i.postimg.cc/Pqsy8X1d/file-23.png",
      "https://i.postimg.cc/W4vm19P3/file-24.png",
      "https://i.postimg.cc/htxbnk66/file-25.png"
    ]
  },
  {
    id: "fitness-health",
    name: "Fitness & Health",
    description: "Wellness and active lifestyle inspiration",
    images: [
      "https://i.postimg.cc/B6tjSDtb/Fitness-Aesthetic59.png",
      "https://i.postimg.cc/yNR6YHHq/Fitness-Aesthetic6.png",
      "https://i.postimg.cc/LX7nnXZT/Fitness-Aesthetic60.png",
      "https://i.postimg.cc/JhpyCKrS/Fitness-Aesthetic61.png",
      "https://i.postimg.cc/JhryFSLb/Fitness-Aesthetic62.png",
      "https://i.postimg.cc/vTJgSBYB/Fitness-Aesthetic63.png",
      "https://i.postimg.cc/SxpY6J11/Fitness-Aesthetic64.png",
      "https://i.postimg.cc/fWp9bHcN/Fitness-Aesthetic65.png",
      "https://i.postimg.cc/dtCTZ86T/Fitness-Aesthetic66.png",
      "https://i.postimg.cc/02tyVnf4/Fitness-Aesthetic7.png",
      "https://i.postimg.cc/SNQKL3W8/Fitness-Aesthetic8.png",
      "https://i.postimg.cc/C57xTsVz/Fitness-Aesthetic9.png"
    ]
  },
  {
    id: "coastal-vibes",
    name: "Coastal Vibes",
    description: "Beach and ocean lifestyle inspiration",
    images: [
      "https://i.postimg.cc/90g2Xvg2/1.png",
      "https://i.postimg.cc/8cc8YZp0/10.png",
      "https://i.postimg.cc/y8ZD5PWx/100.png",
      "https://i.postimg.cc/yxxdThwV/102.png",
      "https://i.postimg.cc/tC1JZ53k/103.png",
      "https://i.postimg.cc/C52KrBgb/104.png",
      "https://i.postimg.cc/WpYt1Kkt/105.png",
      "https://i.postimg.cc/xTWCKzg2/106.png",
      "https://i.postimg.cc/g28042B6/107.png",
      "https://i.postimg.cc/R0mZYxjp/108.png",
      "https://i.postimg.cc/x8ZrVLqT/11.png",
      "https://i.postimg.cc/wvTT6cxh/110.png",
      "https://i.postimg.cc/W3WptFtx/111.png",
      "https://i.postimg.cc/sxMjWjhx/112.png",
      "https://i.postimg.cc/wMn6cCXV/113.png",
      "https://i.postimg.cc/zDQXrgsg/114.png",
      "https://i.postimg.cc/FsJFsKvn/115.png",
      "https://i.postimg.cc/NjqsywfG/116.png"
    ]
  },
  {
    id: "pink-girly",
    name: "Pink & Girly",
    description: "Soft feminine aesthetics and beauty",
    images: [
      "https://i.postimg.cc/QtnSw23T/1.png",
      "https://i.postimg.cc/FKrM4X2W/10.png",
      "https://i.postimg.cc/HnMYyCW0/100.png",
      "https://i.postimg.cc/tTwRJgbC/101.png",
      "https://i.postimg.cc/c1t4jf7K/102.png",
      "https://i.postimg.cc/TY8YXhQt/103.png",
      "https://i.postimg.cc/Ghk33r5d/104.png",
      "https://i.postimg.cc/bwpysM7b/105.png",
      "https://i.postimg.cc/6pc9RcKP/106.png",
      "https://i.postimg.cc/QMMjq7xd/107.png",
      "https://i.postimg.cc/TPHfNPpq/108.png",
      "https://i.postimg.cc/LXYRcMPd/109.png",
      "https://i.postimg.cc/9fLvXN2W/11.png",
      "https://i.postimg.cc/J7XMKMmZ/110.png",
      "https://i.postimg.cc/Y0Q7Sf8b/111.png",
      "https://i.postimg.cc/4NTZSqNM/112.png",
      "https://i.postimg.cc/dVsFqCCj/114.png",
      "https://i.postimg.cc/P5SjNqzs/115.png",
      "https://i.postimg.cc/HxyDS9Gd/118.png",
      "https://i.postimg.cc/T1v8B5Gm/119.png",
      "https://i.postimg.cc/wv3n1cxD/12.png"
    ]
  },
  {
    id: "cream-aesthetic",
    name: "Cream Aesthetic",
    description: "Neutral tones and minimalist elegance",
    images: [
      "https://i.postimg.cc/NfrbPGj8/1.png",
      "https://i.postimg.cc/ryRY7Nht/10.png",
      "https://i.postimg.cc/Cdy26Ryt/100.png",
      "https://i.postimg.cc/RC3V825Q/101.png",
      "https://i.postimg.cc/9XvFj1c3/102.png",
      "https://i.postimg.cc/MKVZZRGn/103.png",
      "https://i.postimg.cc/Jz8rsnyP/104.png",
      "https://i.postimg.cc/t4zXWjWy/105.png",
      "https://i.postimg.cc/mr2TS5y9/106.png",
      "https://i.postimg.cc/zft82Fxc/107.png",
      "https://i.postimg.cc/PxChgvcr/108.png",
      "https://i.postimg.cc/RF294V51/109.png",
      "https://i.postimg.cc/ydkr1mst/11.png",
      "https://i.postimg.cc/zvWNBZ8s/110.png",
      "https://i.postimg.cc/h47cMxT2/111.png",
      "https://i.postimg.cc/zXZ5QBk8/112.png",
      "https://i.postimg.cc/nLztmQnY/113.png",
      "https://i.postimg.cc/SN6qbhZ8/114.png",
      "https://i.postimg.cc/htKnS5wY/115.png",
      "https://i.postimg.cc/JzKLtQCz/116.png",
      "https://i.postimg.cc/yNbCyYdq/117.png",
      "https://i.postimg.cc/mD1fXfzP/118.png",
      "https://i.postimg.cc/D0VVRjLB/119.png"
    ]
  }
];