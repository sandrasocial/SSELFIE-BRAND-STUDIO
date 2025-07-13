import { useState, useCallback } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { Navigation } from '@/components/navigation';
import { SandraImages } from '@/lib/sandra-images';

interface FlatlayImage {
  id: string;
  url: string;
  title: string;
  category: string;
  description: string;
}

interface FlatlayCollection {
  id: string;
  name: string;
  description: string;
  aesthetic: string;
  backgroundImage: string;
  images: FlatlayImage[];
}

// Flatlay Collections Data Structure
const flatlayCollections: FlatlayCollection[] = [
  {
    id: 'luxury-minimal',
    name: 'Luxury Minimal',
    description: 'Clean white backgrounds, designer accessories, minimal styling',
    aesthetic: 'Clean sophistication with generous white space',
    backgroundImage: 'https://i.postimg.cc/1tfNMJvk/file-16.png',
    images: [
      {
        id: 'lm-1',
        url: 'https://i.postimg.cc/1tfNMJvk/file-16.png',
        title: 'Clean Workspace',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-2',
        url: 'https://i.postimg.cc/6qZ4xTJz/file-19.png',
        title: 'Minimal Setup',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-3',
        url: 'https://i.postimg.cc/4NzH8K1x/file-20.png',
        title: 'Beauty Minimal',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-4',
        url: 'https://i.postimg.cc/V5ysqFhW/file-21.png',
        title: 'Planning Flatlay',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-5',
        url: 'https://i.postimg.cc/yY9cwp7B/file-22.png',
        title: 'Executive Setup',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-6',
        url: 'https://i.postimg.cc/bvFZG1q3/file-23.png',
        title: 'Content Creation',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-7',
        url: 'https://i.postimg.cc/C1Bzbd1Y/file-24.png',
        title: 'Laptop Workspace',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-8',
        url: 'https://i.postimg.cc/Y95jRkGF/file-25.png',
        title: 'Minimal Luxury',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-9',
        url: 'https://i.postimg.cc/sgr7yP2W/file-26.png',
        title: 'Designer Accessories',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-10',
        url: 'https://i.postimg.cc/5t9zQxLN/file-27.png',
        title: 'Elegant Minimal',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-11',
        url: 'https://i.postimg.cc/3wLvgPFj/file-28.png',
        title: 'White Space',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-12',
        url: 'https://i.postimg.cc/x13Hdkk4/file-31.png',
        title: 'Clean Lines',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-13',
        url: 'https://i.postimg.cc/HWFbv1DB/file-32.png',
        title: 'Minimal Beauty',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-14',
        url: 'https://i.postimg.cc/PfCmMrcC/file-33.png',
        title: 'Luxury Essentials',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-15',
        url: 'https://i.postimg.cc/kMRbbY68/file-44.png',
        title: 'Professional Setup',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-16',
        url: 'https://i.postimg.cc/kXrtFNKH/file-45.png',
        title: 'Organized Minimal',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-17',
        url: 'https://i.postimg.cc/Z54BXTfF/file-46.png',
        title: 'Aesthetic Order',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-18',
        url: 'https://i.postimg.cc/htszBH6F/file-47.png',
        title: 'Executive Minimal',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      },
      {
        id: 'lm-19',
        url: 'https://i.postimg.cc/0NN62V1z/file-48.png',
        title: 'Sophisticated Clean',
        category: 'Luxury Minimal',
        description: 'Clean sophisticated lifestyle flatlay'
      }
    ]
  },
  {
    id: 'editorial-magazine',
    name: 'Editorial Magazine',
    description: 'Dark moody flatlays, fashion magazines, coffee aesthetic',
    aesthetic: 'Magazine-worthy editorial sophistication',
    backgroundImage: 'https://i.postimg.cc/02VLGyr8/1.png',
    images: [
      {
        id: 'em-1',
        url: 'https://i.postimg.cc/02VLGyr8/1.png',
        title: 'Editorial Magazine 1',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-2',
        url: 'https://i.postimg.cc/xjR7Y1vK/10.png',
        title: 'Editorial Magazine 2',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-3',
        url: 'https://i.postimg.cc/TwC83VLX/100.png',
        title: 'Editorial Magazine 3',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-4',
        url: 'https://i.postimg.cc/90nvGcY8/101.png',
        title: 'Editorial Magazine 4',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-5',
        url: 'https://i.postimg.cc/j25pwDPn/102.png',
        title: 'Editorial Magazine 5',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-6',
        url: 'https://i.postimg.cc/9F43cqcv/103.png',
        title: 'Editorial Magazine 6',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-7',
        url: 'https://i.postimg.cc/QNYGLqZQ/104.png',
        title: 'Editorial Magazine 7',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-8',
        url: 'https://i.postimg.cc/fT1GyTLk/105.png',
        title: 'Editorial Magazine 8',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-9',
        url: 'https://i.postimg.cc/rwWvrX0j/106.png',
        title: 'Editorial Magazine 9',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-10',
        url: 'https://i.postimg.cc/CKg9CPbg/107.png',
        title: 'Editorial Magazine 10',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-11',
        url: 'https://i.postimg.cc/hG162L07/108.png',
        title: 'Editorial Magazine 11',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-12',
        url: 'https://i.postimg.cc/636Sg8Hb/109.png',
        title: 'Editorial Magazine 12',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-13',
        url: 'https://i.postimg.cc/hPtYGRsN/11.png',
        title: 'Editorial Magazine 13',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-14',
        url: 'https://i.postimg.cc/gJM5WGQz/110.png',
        title: 'Editorial Magazine 14',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-15',
        url: 'https://i.postimg.cc/QCHzNRZp/111.png',
        title: 'Editorial Magazine 15',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-16',
        url: 'https://i.postimg.cc/tJwMs298/112.png',
        title: 'Editorial Magazine 16',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-17',
        url: 'https://i.postimg.cc/VsVTZLX4/113.png',
        title: 'Editorial Magazine 17',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-18',
        url: 'https://i.postimg.cc/8PfY2QHG/114.png',
        title: 'Editorial Magazine 18',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-19',
        url: 'https://i.postimg.cc/HLdP8JCW/115.png',
        title: 'Editorial Magazine 19',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-20',
        url: 'https://i.postimg.cc/nL2S4HH4/116.png',
        title: 'Editorial Magazine 20',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-21',
        url: 'https://i.postimg.cc/XJvHxTJT/117.png',
        title: 'Editorial Magazine 21',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-22',
        url: 'https://i.postimg.cc/0QHt4cKr/118.png',
        title: 'Editorial Magazine 22',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-23',
        url: 'https://i.postimg.cc/C5Bvpkb7/119.png',
        title: 'Editorial Magazine 23',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-24',
        url: 'https://i.postimg.cc/qMD5hDZq/12.png',
        title: 'Editorial Magazine 24',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-25',
        url: 'https://i.postimg.cc/RhkgShRB/120.png',
        title: 'Editorial Magazine 25',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-26',
        url: 'https://i.postimg.cc/FFYmH6ZW/121.png',
        title: 'Editorial Magazine 26',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-27',
        url: 'https://i.postimg.cc/BZR3LC7q/122.png',
        title: 'Editorial Magazine 27',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-28',
        url: 'https://i.postimg.cc/pX8HDn3K/123.png',
        title: 'Editorial Magazine 28',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-29',
        url: 'https://i.postimg.cc/cLBGzGxH/124.png',
        title: 'Editorial Magazine 29',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-30',
        url: 'https://i.postimg.cc/y8Hzn8zt/125.png',
        title: 'Editorial Magazine 30',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-31',
        url: 'https://i.postimg.cc/KYchSpj5/126.png',
        title: 'Editorial Magazine 31',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-32',
        url: 'https://i.postimg.cc/KY9SZ7gh/127.png',
        title: 'Editorial Magazine 32',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-33',
        url: 'https://i.postimg.cc/vTVpLp2G/128.png',
        title: 'Editorial Magazine 33',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-34',
        url: 'https://i.postimg.cc/bJsXdGQD/129.png',
        title: 'Editorial Magazine 34',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-35',
        url: 'https://i.postimg.cc/bwGFQ0KT/13.png',
        title: 'Editorial Magazine 35',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-36',
        url: 'https://i.postimg.cc/9MS69Wpx/130.png',
        title: 'Editorial Magazine 36',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-37',
        url: 'https://i.postimg.cc/zDHZrgz4/131.png',
        title: 'Editorial Magazine 37',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-38',
        url: 'https://i.postimg.cc/tC00C47J/132.png',
        title: 'Editorial Magazine 38',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-39',
        url: 'https://i.postimg.cc/SNcBXbzr/133.png',
        title: 'Editorial Magazine 39',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-40',
        url: 'https://i.postimg.cc/BnsdH7TG/134.png',
        title: 'Editorial Magazine 40',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-41',
        url: 'https://i.postimg.cc/bwT4T0gS/135.png',
        title: 'Editorial Magazine 41',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-42',
        url: 'https://i.postimg.cc/TPNF8RZR/136.png',
        title: 'Editorial Magazine 42',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-43',
        url: 'https://i.postimg.cc/jjSmkW3g/137.png',
        title: 'Editorial Magazine 43',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-44',
        url: 'https://i.postimg.cc/wvtPgCpD/138.png',
        title: 'Editorial Magazine 44',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-45',
        url: 'https://i.postimg.cc/XJTPJsjm/139.png',
        title: 'Editorial Magazine 45',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-46',
        url: 'https://i.postimg.cc/8zqXwJGV/14.png',
        title: 'Editorial Magazine 46',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-47',
        url: 'https://i.postimg.cc/x8M4bLqC/140.png',
        title: 'Editorial Magazine 47',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-48',
        url: 'https://i.postimg.cc/v8VjjwXs/141.png',
        title: 'Editorial Magazine 48',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-49',
        url: 'https://i.postimg.cc/sDC8CH0Z/142.png',
        title: 'Editorial Magazine 49',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-50',
        url: 'https://i.postimg.cc/ZKPQbP1s/143.png',
        title: 'Editorial Magazine 50',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-51',
        url: 'https://i.postimg.cc/x104cJQf/144.png',
        title: 'Editorial Magazine 51',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-52',
        url: 'https://i.postimg.cc/SxDt8SQW/145.png',
        title: 'Editorial Magazine 52',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-53',
        url: 'https://i.postimg.cc/YS0Dz5jT/146.png',
        title: 'Editorial Magazine 53',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-54',
        url: 'https://i.postimg.cc/cJz99FnC/147.png',
        title: 'Editorial Magazine 54',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-55',
        url: 'https://i.postimg.cc/B61hd2Tg/148.png',
        title: 'Editorial Magazine 55',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-56',
        url: 'https://i.postimg.cc/Fz5Pm1GQ/149.png',
        title: 'Editorial Magazine 56',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-57',
        url: 'https://i.postimg.cc/s276LjfG/15.png',
        title: 'Editorial Magazine 57',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-58',
        url: 'https://i.postimg.cc/x8v6dYFN/150.png',
        title: 'Editorial Magazine 58',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-59',
        url: 'https://i.postimg.cc/kMK1sFXM/151.png',
        title: 'Editorial Magazine 59',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-60',
        url: 'https://i.postimg.cc/7Y4BWGf3/152.png',
        title: 'Editorial Magazine 60',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-61',
        url: 'https://i.postimg.cc/4N18kf9r/153.png',
        title: 'Editorial Magazine 61',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-62',
        url: 'https://i.postimg.cc/BnQmJr5t/154.png',
        title: 'Editorial Magazine 62',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-63',
        url: 'https://i.postimg.cc/vZq3T0Xh/155.png',
        title: 'Editorial Magazine 63',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-64',
        url: 'https://i.postimg.cc/JhSxctfB/156.png',
        title: 'Editorial Magazine 64',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-65',
        url: 'https://i.postimg.cc/PqCKw1Rj/157.png',
        title: 'Editorial Magazine 65',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-66',
        url: 'https://i.postimg.cc/RhBTyyVS/158.png',
        title: 'Editorial Magazine 66',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-67',
        url: 'https://i.postimg.cc/C1DNvS0r/159.png',
        title: 'Editorial Magazine 67',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-68',
        url: 'https://i.postimg.cc/tTbSQK7S/16.png',
        title: 'Editorial Magazine 68',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-69',
        url: 'https://i.postimg.cc/PJQMjyPm/160.png',
        title: 'Editorial Magazine 69',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-70',
        url: 'https://i.postimg.cc/1RGBwmJf/161.png',
        title: 'Editorial Magazine 70',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-71',
        url: 'https://i.postimg.cc/029fCTBZ/162.png',
        title: 'Editorial Magazine 71',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-72',
        url: 'https://i.postimg.cc/02ZCXtgv/163.png',
        title: 'Editorial Magazine 72',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-73',
        url: 'https://i.postimg.cc/pLTJwDxF/164.png',
        title: 'Editorial Magazine 73',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-74',
        url: 'https://i.postimg.cc/QdyJhHxn/165.png',
        title: 'Editorial Magazine 74',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-75',
        url: 'https://i.postimg.cc/6Q4L3t86/166.png',
        title: 'Editorial Magazine 75',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-76',
        url: 'https://i.postimg.cc/fL47Spdc/167.png',
        title: 'Editorial Magazine 76',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-77',
        url: 'https://i.postimg.cc/vTbW3n3D/168.png',
        title: 'Editorial Magazine 77',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-78',
        url: 'https://i.postimg.cc/LXzttDkr/169.png',
        title: 'Editorial Magazine 78',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-79',
        url: 'https://i.postimg.cc/63hH9Mv9/17.png',
        title: 'Editorial Magazine 79',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-80',
        url: 'https://i.postimg.cc/pVJQy0Lj/170.png',
        title: 'Editorial Magazine 80',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-81',
        url: 'https://i.postimg.cc/sxm582Nm/171.png',
        title: 'Editorial Magazine 81',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-82',
        url: 'https://i.postimg.cc/Pr6mQPZr/172.png',
        title: 'Editorial Magazine 82',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-83',
        url: 'https://i.postimg.cc/2SVncrFd/173.png',
        title: 'Editorial Magazine 83',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-84',
        url: 'https://i.postimg.cc/Z52pX2VG/174.png',
        title: 'Editorial Magazine 84',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-85',
        url: 'https://i.postimg.cc/GpDGRKfH/175.png',
        title: 'Editorial Magazine 85',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-86',
        url: 'https://i.postimg.cc/fLhXRX45/176.png',
        title: 'Editorial Magazine 86',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-87',
        url: 'https://i.postimg.cc/d35T6xhS/177.png',
        title: 'Editorial Magazine 87',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-88',
        url: 'https://i.postimg.cc/3RCG4RYh/178.png',
        title: 'Editorial Magazine 88',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-89',
        url: 'https://i.postimg.cc/VvfCj8kC/179.png',
        title: 'Editorial Magazine 89',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-90',
        url: 'https://i.postimg.cc/j2dMCyHy/18.png',
        title: 'Editorial Magazine 90',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-91',
        url: 'https://i.postimg.cc/1RB6yfvc/180.png',
        title: 'Editorial Magazine 91',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-92',
        url: 'https://i.postimg.cc/bNvnrpMX/181.png',
        title: 'Editorial Magazine 92',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-93',
        url: 'https://i.postimg.cc/QxnTWvGF/182.png',
        title: 'Editorial Magazine 93',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-94',
        url: 'https://i.postimg.cc/Nj9r8bBp/183.png',
        title: 'Editorial Magazine 94',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-95',
        url: 'https://i.postimg.cc/YC5LdgSk/184.png',
        title: 'Editorial Magazine 95',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-96',
        url: 'https://i.postimg.cc/7LSGd6Cz/185.png',
        title: 'Editorial Magazine 96',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-97',
        url: 'https://i.postimg.cc/ZRZBSS3M/186.png',
        title: 'Editorial Magazine 97',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-98',
        url: 'https://i.postimg.cc/LXTq4b36/187.png',
        title: 'Editorial Magazine 98',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-99',
        url: 'https://i.postimg.cc/wT3tHFyg/188.png',
        title: 'Editorial Magazine 99',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-100',
        url: 'https://i.postimg.cc/1X7fwVdk/189.png',
        title: 'Editorial Magazine 100',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-101',
        url: 'https://i.postimg.cc/WzWXZt8C/19.png',
        title: 'Editorial Magazine 101',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-102',
        url: 'https://i.postimg.cc/wMj11Qw5/190.png',
        title: 'Editorial Magazine 102',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-103',
        url: 'https://i.postimg.cc/L4xqrGsx/191.png',
        title: 'Editorial Magazine 103',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-104',
        url: 'https://i.postimg.cc/dtXh0drd/192.png',
        title: 'Editorial Magazine 104',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-105',
        url: 'https://i.postimg.cc/T3Dp5wJs/193.png',
        title: 'Editorial Magazine 105',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-106',
        url: 'https://i.postimg.cc/SKLRVv57/194.png',
        title: 'Editorial Magazine 106',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-107',
        url: 'https://i.postimg.cc/xdVqv2s1/195.png',
        title: 'Editorial Magazine 107',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-108',
        url: 'https://i.postimg.cc/C1F124py/196.png',
        title: 'Editorial Magazine 108',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-109',
        url: 'https://i.postimg.cc/VvvNfLND/197.png',
        title: 'Editorial Magazine 109',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-110',
        url: 'https://i.postimg.cc/RFXFxnvW/198.png',
        title: 'Editorial Magazine 110',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-111',
        url: 'https://i.postimg.cc/C52xzTBY/199.png',
        title: 'Editorial Magazine 111',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-112',
        url: 'https://i.postimg.cc/K8VwVpnw/2.png',
        title: 'Editorial Magazine 112',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-113',
        url: 'https://i.postimg.cc/xjtshFQ5/20.png',
        title: 'Editorial Magazine 113',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-114',
        url: 'https://i.postimg.cc/DfpZCsCD/200.png',
        title: 'Editorial Magazine 114',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-115',
        url: 'https://i.postimg.cc/VLSN26pN/201.png',
        title: 'Editorial Magazine 115',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-116',
        url: 'https://i.postimg.cc/HkXksNpD/202.png',
        title: 'Editorial Magazine 116',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-117',
        url: 'https://i.postimg.cc/TYZPxxvJ/203.png',
        title: 'Editorial Magazine 117',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-118',
        url: 'https://i.postimg.cc/PqHrLMxL/204.png',
        title: 'Editorial Magazine 118',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-119',
        url: 'https://i.postimg.cc/zfkDTRbx/205.png',
        title: 'Editorial Magazine 119',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-120',
        url: 'https://i.postimg.cc/NMfsDfRB/206.png',
        title: 'Editorial Magazine 120',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-121',
        url: 'https://i.postimg.cc/HxZphDt5/207.png',
        title: 'Editorial Magazine 121',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-122',
        url: 'https://i.postimg.cc/vT4QRqPK/208.png',
        title: 'Editorial Magazine 122',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-123',
        url: 'https://i.postimg.cc/QCvjjQwd/209.png',
        title: 'Editorial Magazine 123',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-124',
        url: 'https://i.postimg.cc/7YRKYGfT/21.png',
        title: 'Editorial Magazine 124',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-125',
        url: 'https://i.postimg.cc/7Z3qyTVq/210.png',
        title: 'Editorial Magazine 125',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-126',
        url: 'https://i.postimg.cc/CM2hC05p/211.png',
        title: 'Editorial Magazine 126',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-127',
        url: 'https://i.postimg.cc/Dy0CTdyT/22.png',
        title: 'Editorial Magazine 127',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-128',
        url: 'https://i.postimg.cc/qvCjtJ3D/23.png',
        title: 'Editorial Magazine 128',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-129',
        url: 'https://i.postimg.cc/bvcLk70y/24.png',
        title: 'Editorial Magazine 129',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-130',
        url: 'https://i.postimg.cc/zfC7jxpn/25.png',
        title: 'Editorial Magazine 130',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-131',
        url: 'https://i.postimg.cc/gJGDB3B1/26.png',
        title: 'Editorial Magazine 131',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-132',
        url: 'https://i.postimg.cc/2y6xCrYw/27.png',
        title: 'Editorial Magazine 132',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-133',
        url: 'https://i.postimg.cc/bJLTXd7r/28.png',
        title: 'Editorial Magazine 133',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-134',
        url: 'https://i.postimg.cc/D0MPZHyK/29.png',
        title: 'Editorial Magazine 134',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-135',
        url: 'https://i.postimg.cc/vZDC0w65/3.png',
        title: 'Editorial Magazine 135',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-136',
        url: 'https://i.postimg.cc/KcqNJk7s/30.png',
        title: 'Editorial Magazine 136',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-137',
        url: 'https://i.postimg.cc/MKnY46dZ/31.png',
        title: 'Editorial Magazine 137',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-138',
        url: 'https://i.postimg.cc/VkMWfKx3/32.png',
        title: 'Editorial Magazine 138',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-139',
        url: 'https://i.postimg.cc/J4SQCf2N/33.png',
        title: 'Editorial Magazine 139',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-140',
        url: 'https://i.postimg.cc/g0Wqnvdr/34.png',
        title: 'Editorial Magazine 140',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-141',
        url: 'https://i.postimg.cc/VNW9MdLg/35.png',
        title: 'Editorial Magazine 141',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-142',
        url: 'https://i.postimg.cc/3RrXZYkT/36.png',
        title: 'Editorial Magazine 142',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-143',
        url: 'https://i.postimg.cc/28L4GHSV/37.png',
        title: 'Editorial Magazine 143',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-144',
        url: 'https://i.postimg.cc/9fCZWCt7/38.png',
        title: 'Editorial Magazine 144',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-145',
        url: 'https://i.postimg.cc/qRZ3Xnfs/39.png',
        title: 'Editorial Magazine 145',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-146',
        url: 'https://i.postimg.cc/yY1MSZ1Q/4.png',
        title: 'Editorial Magazine 146',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-147',
        url: 'https://i.postimg.cc/Hnc7SxHf/40.png',
        title: 'Editorial Magazine 147',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-148',
        url: 'https://i.postimg.cc/GmJTg6wh/41.png',
        title: 'Editorial Magazine 148',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-149',
        url: 'https://i.postimg.cc/nz5XQJ7T/42.png',
        title: 'Editorial Magazine 149',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-150',
        url: 'https://i.postimg.cc/WtctXw5k/43.png',
        title: 'Editorial Magazine 150',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-151',
        url: 'https://i.postimg.cc/JzWpSy03/44.png',
        title: 'Editorial Magazine 151',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-152',
        url: 'https://i.postimg.cc/hjhsVTZn/45.png',
        title: 'Editorial Magazine 152',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-153',
        url: 'https://i.postimg.cc/FFMpJfyt/46.png',
        title: 'Editorial Magazine 153',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-154',
        url: 'https://i.postimg.cc/bN1T0zgZ/47.png',
        title: 'Editorial Magazine 154',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-155',
        url: 'https://i.postimg.cc/g2DH5Nfd/48.png',
        title: 'Editorial Magazine 155',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-156',
        url: 'https://i.postimg.cc/W3QGrKJm/49.png',
        title: 'Editorial Magazine 156',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-157',
        url: 'https://i.postimg.cc/439qTvPd/5.png',
        title: 'Editorial Magazine 157',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-158',
        url: 'https://i.postimg.cc/dtcRVbFw/50.png',
        title: 'Editorial Magazine 158',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-159',
        url: 'https://i.postimg.cc/YCp11QjP/51.png',
        title: 'Editorial Magazine 159',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-160',
        url: 'https://i.postimg.cc/bvrk58xH/52.png',
        title: 'Editorial Magazine 160',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-161',
        url: 'https://i.postimg.cc/J7ZJvpkg/53.png',
        title: 'Editorial Magazine 161',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-162',
        url: 'https://i.postimg.cc/DycGym5P/54.png',
        title: 'Editorial Magazine 162',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-163',
        url: 'https://i.postimg.cc/wTzJpD5B/55.png',
        title: 'Editorial Magazine 163',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-164',
        url: 'https://i.postimg.cc/g2kZwdTF/56.png',
        title: 'Editorial Magazine 164',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-165',
        url: 'https://i.postimg.cc/t4SVWfK1/57.png',
        title: 'Editorial Magazine 165',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-166',
        url: 'https://i.postimg.cc/zf4bPhX8/58.png',
        title: 'Editorial Magazine 166',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-167',
        url: 'https://i.postimg.cc/PqCv4yHS/59.png',
        title: 'Editorial Magazine 167',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-168',
        url: 'https://i.postimg.cc/vBwj812v/6.png',
        title: 'Editorial Magazine 168',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-169',
        url: 'https://i.postimg.cc/k486r5B8/60.png',
        title: 'Editorial Magazine 169',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-170',
        url: 'https://i.postimg.cc/4ygKXT90/61.png',
        title: 'Editorial Magazine 170',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-171',
        url: 'https://i.postimg.cc/3NFkRbjx/62.png',
        title: 'Editorial Magazine 171',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-172',
        url: 'https://i.postimg.cc/4NXKMsZ7/63.png',
        title: 'Editorial Magazine 172',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-173',
        url: 'https://i.postimg.cc/FFydD7tX/64.png',
        title: 'Editorial Magazine 173',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-174',
        url: 'https://i.postimg.cc/Hs3J1RsS/65.png',
        title: 'Editorial Magazine 174',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-175',
        url: 'https://i.postimg.cc/0yQzknz9/66.png',
        title: 'Editorial Magazine 175',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-176',
        url: 'https://i.postimg.cc/VkVddttn/67.png',
        title: 'Editorial Magazine 176',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-177',
        url: 'https://i.postimg.cc/R0Jqf018/68.png',
        title: 'Editorial Magazine 177',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-178',
        url: 'https://i.postimg.cc/NMhFxwp0/69.png',
        title: 'Editorial Magazine 178',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-179',
        url: 'https://i.postimg.cc/BbqVDr0L/7.png',
        title: 'Editorial Magazine 179',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-180',
        url: 'https://i.postimg.cc/Bb4vdBW9/70.png',
        title: 'Editorial Magazine 180',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-181',
        url: 'https://i.postimg.cc/NM1MJPzk/71.png',
        title: 'Editorial Magazine 181',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-182',
        url: 'https://i.postimg.cc/6qcQw4w7/72.png',
        title: 'Editorial Magazine 182',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-183',
        url: 'https://i.postimg.cc/3rFN2VpK/73.png',
        title: 'Editorial Magazine 183',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-184',
        url: 'https://i.postimg.cc/RVCFddQw/74.png',
        title: 'Editorial Magazine 184',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-185',
        url: 'https://i.postimg.cc/02tNBScF/75.png',
        title: 'Editorial Magazine 185',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-186',
        url: 'https://i.postimg.cc/6pyQJQP3/76.png',
        title: 'Editorial Magazine 186',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-187',
        url: 'https://i.postimg.cc/wjZj6pKk/77.png',
        title: 'Editorial Magazine 187',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-188',
        url: 'https://i.postimg.cc/HLMsnhd1/78.png',
        title: 'Editorial Magazine 188',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-189',
        url: 'https://i.postimg.cc/cHN1nBLg/79.png',
        title: 'Editorial Magazine 189',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-190',
        url: 'https://i.postimg.cc/C1C2RFWp/8.png',
        title: 'Editorial Magazine 190',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-191',
        url: 'https://i.postimg.cc/26FkFL1H/80.png',
        title: 'Editorial Magazine 191',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-192',
        url: 'https://i.postimg.cc/wMq6WxJ9/81.png',
        title: 'Editorial Magazine 192',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-193',
        url: 'https://i.postimg.cc/Hn6TFG4X/82.png',
        title: 'Editorial Magazine 193',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-194',
        url: 'https://i.postimg.cc/c4JxwH0m/83.png',
        title: 'Editorial Magazine 194',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-195',
        url: 'https://i.postimg.cc/G3K34Ywt/84.png',
        title: 'Editorial Magazine 195',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-196',
        url: 'https://i.postimg.cc/dtSqBY0K/85.png',
        title: 'Editorial Magazine 196',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-197',
        url: 'https://i.postimg.cc/VkrzZVS0/86.png',
        title: 'Editorial Magazine 197',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-198',
        url: 'https://i.postimg.cc/Hkqdq95Z/87.png',
        title: 'Editorial Magazine 198',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-199',
        url: 'https://i.postimg.cc/RF99FCgw/88.png',
        title: 'Editorial Magazine 199',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-200',
        url: 'https://i.postimg.cc/0N7PPK08/89.png',
        title: 'Editorial Magazine 200',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-201',
        url: 'https://i.postimg.cc/br3FRmy6/9.png',
        title: 'Editorial Magazine 201',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-202',
        url: 'https://i.postimg.cc/xCRQbrZh/90.png',
        title: 'Editorial Magazine 202',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-203',
        url: 'https://i.postimg.cc/brVj3xpR/91.png',
        title: 'Editorial Magazine 203',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-204',
        url: 'https://i.postimg.cc/QCd3Q4Gt/92.png',
        title: 'Editorial Magazine 204',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-205',
        url: 'https://i.postimg.cc/G3XrLCGs/93.png',
        title: 'Editorial Magazine 205',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-206',
        url: 'https://i.postimg.cc/fTkskrfq/94.png',
        title: 'Editorial Magazine 206',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-207',
        url: 'https://i.postimg.cc/rFbk4NhV/95.png',
        title: 'Editorial Magazine 207',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-208',
        url: 'https://i.postimg.cc/3xvHF06g/96.png',
        title: 'Editorial Magazine 208',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-209',
        url: 'https://i.postimg.cc/FR95vWKZ/97.png',
        title: 'Editorial Magazine 209',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-210',
        url: 'https://i.postimg.cc/fbQQ2Tn1/98.png',
        title: 'Editorial Magazine 210',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      },
      {
        id: 'em-211',
        url: 'https://i.postimg.cc/mr3f0fTk/99.png',
        title: 'Editorial Magazine 211',
        category: 'Editorial Magazine',
        description: 'Editorial Magazine aesthetic flatlay'
      }
    ]
  },
  {
    id: 'european-luxury',
    name: 'European Luxury',
    description: 'Parisian cafe tables, designer bags, sophisticated lifestyle',
    aesthetic: 'Effortless European sophistication',
    backgroundImage: 'https://i.postimg.cc/rmgNb53p/file-1.png',
    images: [
      {
        id: 'el-1',
        url: 'https://i.postimg.cc/rmgNb53p/file-1.png',
        title: 'European Luxury 1',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-2',
        url: 'https://i.postimg.cc/RhFLzNxL/file-10.png',
        title: 'European Luxury 2',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-3',
        url: 'https://i.postimg.cc/SQ7BS5FX/file-11.png',
        title: 'European Luxury 3',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-4',
        url: 'https://i.postimg.cc/wTqS7Vgw/file-12.png',
        title: 'European Luxury 4',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-5',
        url: 'https://i.postimg.cc/pLXRMvmX/file-13.png',
        title: 'European Luxury 5',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-6',
        url: 'https://i.postimg.cc/W3V5xN45/file-14.png',
        title: 'European Luxury 6',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-7',
        url: 'https://i.postimg.cc/rw6xfhsJ/file-15.png',
        title: 'European Luxury 7',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-8',
        url: 'https://i.postimg.cc/cJBRgQsc/file-16.png',
        title: 'European Luxury 8',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-9',
        url: 'https://i.postimg.cc/pTVDDprM/file-17.png',
        title: 'European Luxury 9',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-10',
        url: 'https://i.postimg.cc/ZRf6j4vB/file-18.png',
        title: 'European Luxury 10',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-11',
        url: 'https://i.postimg.cc/t4MQ0x02/file-19.png',
        title: 'European Luxury 11',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-12',
        url: 'https://i.postimg.cc/KjHrcxZS/file-2.png',
        title: 'European Luxury 12',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-13',
        url: 'https://i.postimg.cc/SxTqyP9L/file-20.png',
        title: 'European Luxury 13',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-14',
        url: 'https://i.postimg.cc/HstdNnsh/file-21.png',
        title: 'European Luxury 14',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-15',
        url: 'https://i.postimg.cc/kgtw466j/file-22.png',
        title: 'European Luxury 15',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-16',
        url: 'https://i.postimg.cc/Pqsy8X1d/file-23.png',
        title: 'European Luxury 16',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-17',
        url: 'https://i.postimg.cc/W4vm19P3/file-24.png',
        title: 'European Luxury 17',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-18',
        url: 'https://i.postimg.cc/htxbnk66/file-25.png',
        title: 'European Luxury 18',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-19',
        url: 'https://i.postimg.cc/3JxcKxF6/file-26.png',
        title: 'European Luxury 19',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-20',
        url: 'https://i.postimg.cc/RhMbJS5W/file-27.png',
        title: 'European Luxury 20',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-21',
        url: 'https://i.postimg.cc/8C22cgzv/file-28.png',
        title: 'European Luxury 21',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-22',
        url: 'https://i.postimg.cc/3xR5bZqk/file-29.png',
        title: 'European Luxury 22',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-23',
        url: 'https://i.postimg.cc/C5zkQXbv/file-3.png',
        title: 'European Luxury 23',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-24',
        url: 'https://i.postimg.cc/LXmVNxy7/file-30.png',
        title: 'European Luxury 24',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-25',
        url: 'https://i.postimg.cc/YC4DWDVz/file-31.png',
        title: 'European Luxury 25',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-26',
        url: 'https://i.postimg.cc/x1WxyyVD/file-32.png',
        title: 'European Luxury 26',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-27',
        url: 'https://i.postimg.cc/NMRWrCKz/file-33.png',
        title: 'European Luxury 27',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-28',
        url: 'https://i.postimg.cc/X7rkHG8V/file-34.png',
        title: 'European Luxury 28',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-29',
        url: 'https://i.postimg.cc/ZKXF1b76/file-35.png',
        title: 'European Luxury 29',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-30',
        url: 'https://i.postimg.cc/HLrmjt0q/file-36.png',
        title: 'European Luxury 30',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-31',
        url: 'https://i.postimg.cc/fbmHHtM3/file-37.png',
        title: 'European Luxury 31',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-32',
        url: 'https://i.postimg.cc/gjS4w3H7/file-38.png',
        title: 'European Luxury 32',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-33',
        url: 'https://i.postimg.cc/wxfkQcDf/file-39.png',
        title: 'European Luxury 33',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-34',
        url: 'https://i.postimg.cc/x8hMD5R9/file-4.png',
        title: 'European Luxury 34',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-35',
        url: 'https://i.postimg.cc/zv54wwWX/file-40.png',
        title: 'European Luxury 35',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-36',
        url: 'https://i.postimg.cc/cCm2FKM7/file-41.png',
        title: 'European Luxury 36',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-37',
        url: 'https://i.postimg.cc/m2mKMHrB/file-42.png',
        title: 'European Luxury 37',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-38',
        url: 'https://i.postimg.cc/x1qhP1kH/file-43.png',
        title: 'European Luxury 38',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-39',
        url: 'https://i.postimg.cc/g0Z7ftH2/file-44.png',
        title: 'European Luxury 39',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-40',
        url: 'https://i.postimg.cc/cHGzZ7FM/file-45.png',
        title: 'European Luxury 40',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-41',
        url: 'https://i.postimg.cc/gJyT0w59/file-46.png',
        title: 'European Luxury 41',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-42',
        url: 'https://i.postimg.cc/4yB2zDsB/file-47.png',
        title: 'European Luxury 42',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-43',
        url: 'https://i.postimg.cc/c1mzynww/file-48.png',
        title: 'European Luxury 43',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-44',
        url: 'https://i.postimg.cc/9MTjYFn1/file-49.png',
        title: 'European Luxury 44',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-45',
        url: 'https://i.postimg.cc/mZ5QHZGK/file-5.png',
        title: 'European Luxury 45',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-46',
        url: 'https://i.postimg.cc/brhfCfXP/file-50.png',
        title: 'European Luxury 46',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-47',
        url: 'https://i.postimg.cc/MHm2g3xQ/file-51.png',
        title: 'European Luxury 47',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-48',
        url: 'https://i.postimg.cc/kMQmVG8g/file-52.png',
        title: 'European Luxury 48',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-49',
        url: 'https://i.postimg.cc/J4RWj8cc/file-53.png',
        title: 'European Luxury 49',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-50',
        url: 'https://i.postimg.cc/Nfbv4ndh/file-54.png',
        title: 'European Luxury 50',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-51',
        url: 'https://i.postimg.cc/mr1xTgBR/file-55.png',
        title: 'European Luxury 51',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-52',
        url: 'https://i.postimg.cc/L877QFfW/file-56.png',
        title: 'European Luxury 52',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-53',
        url: 'https://i.postimg.cc/hGNBm7pf/file-57.png',
        title: 'European Luxury 53',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-54',
        url: 'https://i.postimg.cc/TPV9Vzcg/file-58.png',
        title: 'European Luxury 54',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-55',
        url: 'https://i.postimg.cc/PJr2rSYZ/file-59.png',
        title: 'European Luxury 55',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-56',
        url: 'https://i.postimg.cc/9Fwyt3m0/file-6.png',
        title: 'European Luxury 56',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-57',
        url: 'https://i.postimg.cc/j5hMbpwt/file-60.png',
        title: 'European Luxury 57',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-58',
        url: 'https://i.postimg.cc/T2CtHXvc/file-61.png',
        title: 'European Luxury 58',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-59',
        url: 'https://i.postimg.cc/QxC02nXZ/file-7.png',
        title: 'European Luxury 59',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-60',
        url: 'https://i.postimg.cc/fTqgkQHb/file-8.png',
        title: 'European Luxury 60',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-61',
        url: 'https://i.postimg.cc/BQzM4c6L/file-9.png',
        title: 'European Luxury 61',
        category: 'European Luxury',
        description: 'European Luxury aesthetic flatlay'
      },
      {
        id: 'el-10',
        url: 'https://i.postimg.cc/ZRf6j4vB/file-18.png',
        title: 'Cafe Culture',
        category: 'European Luxury',
        description: 'European cafe culture'
      },
      {
        id: 'el-11',
        url: 'https://i.postimg.cc/t4MQ0x02/file-19.png',
        title: 'Sophisticated Style',
        category: 'European Luxury',
        description: 'European sophisticated style'
      },
      {
        id: 'el-12',
        url: 'https://i.postimg.cc/KjHrcxZS/file-2.png',
        title: 'European Charm',
        category: 'European Luxury',
        description: 'Charming European aesthetic'
      },
      {
        id: 'el-13',
        url: 'https://i.postimg.cc/SxTqyP9L/file-20.png',
        title: 'Luxury Details',
        category: 'European Luxury',
        description: 'European luxury details'
      },
      {
        id: 'el-14',
        url: 'https://i.postimg.cc/HstdNnsh/file-21.png',
        title: 'Elegant Setup',
        category: 'European Luxury',
        description: 'European elegant setup'
      },
      {
        id: 'el-15',
        url: 'https://i.postimg.cc/kgtw466j/file-22.png',
        title: 'Chic Lifestyle',
        category: 'European Luxury',
        description: 'European chic lifestyle'
      },
      {
        id: 'el-16',
        url: 'https://i.postimg.cc/Pqsy8X1d/file-23.png',
        title: 'Parisian Luxury',
        category: 'European Luxury',
        description: 'Parisian luxury aesthetic'
      },
      {
        id: 'el-17',
        url: 'https://i.postimg.cc/W4vm19P3/file-24.png',
        title: 'European Fashion',
        category: 'European Luxury',
        description: 'European fashion lifestyle'
      },
      {
        id: 'el-18',
        url: 'https://i.postimg.cc/htxbnk66/file-25.png',
        title: 'Luxury European',
        category: 'European Luxury',
        description: 'Luxury European lifestyle'
      }
    ]
  },
  {
    id: 'fitness-health',
    name: 'Fitness & Health',
    description: 'Workout gear, healthy lifestyle, fitness motivation flatlays',
    aesthetic: 'Active lifestyle and wellness motivation',
    backgroundImage: 'https://i.postimg.cc/T1dT95WG/Fitness-Aesthetic1.png',
    images: [
      {
        id: 'fh-1',
        url: 'https://i.postimg.cc/T1dT95WG/Fitness-Aesthetic1.png',
        title: 'Fitness Motivation',
        category: 'Fitness & Health',
        description: 'Workout gear and fitness aesthetic'
      },
      {
        id: 'fh-2',
        url: 'https://i.postimg.cc/Bb4nVwkr/Fitness-Aesthetic10.png',
        title: 'Active Lifestyle',
        category: 'Fitness & Health',
        description: 'Healthy living workout setup'
      },
      {
        id: 'fh-3',
        url: 'https://i.postimg.cc/ZRrqjh7P/Fitness-Aesthetic11.png',
        title: 'Workout Essentials',
        category: 'Fitness & Health',
        description: 'Fitness gear and motivation'
      },
      {
        id: 'fh-4',
        url: 'https://i.postimg.cc/k4r4x5cX/Fitness-Aesthetic12.png',
        title: 'Health Journey',
        category: 'Fitness & Health',
        description: 'Fitness and wellness lifestyle'
      },
      {
        id: 'fh-5',
        url: 'https://i.postimg.cc/CKn5B8bQ/Fitness-Aesthetic13.png',
        title: 'Gym Aesthetic',
        category: 'Fitness & Health',
        description: 'Workout motivation setup'
      },
      {
        id: 'fh-6',
        url: 'https://i.postimg.cc/7ZWbZ9Jz/Fitness-Aesthetic14.png',
        title: 'Fitness Goals',
        category: 'Fitness & Health',
        description: 'Health and fitness inspiration'
      },
      {
        id: 'fh-7',
        url: 'https://i.postimg.cc/jdRDgLrD/Fitness-Aesthetic15.png',
        title: 'Healthy Living',
        category: 'Fitness & Health',
        description: 'Active lifestyle aesthetic'
      },
      {
        id: 'fh-8',
        url: 'https://i.postimg.cc/PrKPBTt2/Fitness-Aesthetic16.png',
        title: 'Workout Gear',
        category: 'Fitness & Health',
        description: 'Fitness equipment and style'
      },
      {
        id: 'fh-9',
        url: 'https://i.postimg.cc/8kRFmLx8/Fitness-Aesthetic17.png',
        title: 'Exercise Motivation',
        category: 'Fitness & Health',
        description: 'Workout inspiration flatlay'
      },
      {
        id: 'fh-10',
        url: 'https://i.postimg.cc/QCJHNrcN/Fitness-Aesthetic18.png',
        title: 'Fitness Lifestyle',
        category: 'Fitness & Health',
        description: 'Health and wellness setup'
      },
      {
        id: 'fh-11',
        url: 'https://i.postimg.cc/D0TSKzJY/Fitness-Aesthetic19.png',
        title: 'Active Health',
        category: 'Fitness & Health',
        description: 'Fitness and health aesthetic'
      },
      {
        id: 'fh-12',
        url: 'https://i.postimg.cc/85B1Mmct/Fitness-Aesthetic2.png',
        title: 'Training Setup',
        category: 'Fitness & Health',
        description: 'Workout training gear'
      },
      {
        id: 'fh-13',
        url: 'https://i.postimg.cc/NMTKVXMH/Fitness-Aesthetic20.png',
        title: 'Wellness Journey',
        category: 'Fitness & Health',
        description: 'Health and fitness journey'
      },
      {
        id: 'fh-14',
        url: 'https://i.postimg.cc/wB1yXZYF/Fitness-Aesthetic21.png',
        title: 'Gym Life',
        category: 'Fitness & Health',
        description: 'Fitness gym lifestyle'
      },
      {
        id: 'fh-15',
        url: 'https://i.postimg.cc/L8CgZRwn/Fitness-Aesthetic22.png',
        title: 'Health Goals',
        category: 'Fitness & Health',
        description: 'Fitness and health goals'
      },
      {
        id: 'fh-16',
        url: 'https://i.postimg.cc/9fs4JbW2/Fitness-Aesthetic23.png',
        title: 'Workout Style',
        category: 'Fitness & Health',
        description: 'Stylish fitness aesthetic'
      },
      {
        id: 'fh-17',
        url: 'https://i.postimg.cc/y8YSdWfM/Fitness-Aesthetic24.png',
        title: 'Fitness Inspiration',
        category: 'Fitness & Health',
        description: 'Health and fitness motivation'
      },
      {
        id: 'fh-18',
        url: 'https://i.postimg.cc/RVTH4wT1/Fitness-Aesthetic25.png',
        title: 'Active Wellness',
        category: 'Fitness & Health',
        description: 'Active health and wellness'
      }
    ]
  },
  {
    id: 'coastal-vibes',
    name: 'Coastal Vibes',
    description: 'Beach aesthetics, surfboards, ocean lifestyle, coastal living',
    aesthetic: 'Relaxed coastal and surf lifestyle',
    backgroundImage: 'https://i.postimg.cc/6qBxt1FS/file-1.png',
    images: [
      {
        id: 'cv-1',
        url: 'https://i.postimg.cc/6qBxt1FS/file-1.png',
        title: 'Coastal Lifestyle',
        category: 'Coastal Vibes',
        description: 'Relaxed beach aesthetic'
      },
      {
        id: 'cv-2',
        url: 'https://i.postimg.cc/43hg5cz8/file-11.png',
        title: 'Ocean Vibes',
        category: 'Coastal Vibes',
        description: 'Coastal living aesthetic'
      },
      {
        id: 'cv-3',
        url: 'https://i.postimg.cc/DZkKYz67/file-12.png',
        title: 'Beach Setup',
        category: 'Coastal Vibes',
        description: 'Coastal beach lifestyle'
      },
      {
        id: 'cv-4',
        url: 'https://i.postimg.cc/wvVbcxbf/file-15.png',
        title: 'Surf Culture',
        category: 'Coastal Vibes',
        description: 'Surfing lifestyle aesthetic'
      },
      {
        id: 'cv-5',
        url: 'https://i.postimg.cc/brwV6X7z/file-16.png',
        title: 'Coastal Living',
        category: 'Coastal Vibes',
        description: 'Beach coastal living'
      },
      {
        id: 'cv-6',
        url: 'https://i.postimg.cc/SNNbP36Y/file-18.png',
        title: 'Ocean Aesthetic',
        category: 'Coastal Vibes',
        description: 'Ocean surf aesthetic'
      },
      {
        id: 'cv-7',
        url: 'https://i.postimg.cc/HkNmXz7c/file-2.png',
        title: 'Beach Vibes',
        category: 'Coastal Vibes',
        description: 'Coastal beach vibes'
      },
      {
        id: 'cv-8',
        url: 'https://i.postimg.cc/1zDdXr0Z/file-21.png',
        title: 'Surf Lifestyle',
        category: 'Coastal Vibes',
        description: 'Surfing beach lifestyle'
      },
      {
        id: 'cv-9',
        url: 'https://i.postimg.cc/9MVn7w1w/file-23.png',
        title: 'Coastal Style',
        category: 'Coastal Vibes',
        description: 'Coastal style aesthetic'
      },
      {
        id: 'cv-10',
        url: 'https://i.postimg.cc/BQM4Q4SC/file-3.png',
        title: 'Beach Culture',
        category: 'Coastal Vibes',
        description: 'Beach culture lifestyle'
      },
      {
        id: 'cv-11',
        url: 'https://i.postimg.cc/Bb5ZCFGW/file-33.png',
        title: 'Ocean Living',
        category: 'Coastal Vibes',
        description: 'Ocean coastal living'
      },
      {
        id: 'cv-12',
        url: 'https://i.postimg.cc/kgLrB5kW/file-36.png',
        title: 'Surf Aesthetic',
        category: 'Coastal Vibes',
        description: 'Surf beach aesthetic'
      },
      {
        id: 'cv-13',
        url: 'https://i.postimg.cc/4yfqrH9R/file-37.png',
        title: 'Coastal Retreat',
        category: 'Coastal Vibes',
        description: 'Coastal retreat lifestyle'
      },
      {
        id: 'cv-14',
        url: 'https://i.postimg.cc/7hKdDP3G/file-38.png',
        title: 'Beach Life',
        category: 'Coastal Vibes',
        description: 'Beach lifestyle aesthetic'
      },
      {
        id: 'cv-15',
        url: 'https://i.postimg.cc/26ZSVJcS/file-39.png',
        title: 'Ocean Escape',
        category: 'Coastal Vibes',
        description: 'Ocean escape aesthetic'
      },
      {
        id: 'cv-16',
        url: 'https://i.postimg.cc/DzW2MHKP/file-4.png',
        title: 'Coastal Freedom',
        category: 'Coastal Vibes',
        description: 'Coastal freedom lifestyle'
      },
      {
        id: 'cv-17',
        url: 'https://i.postimg.cc/d3ctdBpm/file-40.png',
        title: 'Surf Journey',
        category: 'Coastal Vibes',
        description: 'Surfing journey aesthetic'
      },
      {
        id: 'cv-18',
        url: 'https://i.postimg.cc/8P1TSjS5/file-41.png',
        title: 'Beach Adventure',
        category: 'Coastal Vibes',
        description: 'Beach adventure lifestyle'
      }
    ]
  },
  {
    id: 'pink-girly',
    name: 'Pink & Girly',
    description: 'Soft feminine flatlays, beauty products, flowers',
    aesthetic: 'Feminine and romantic styling',
    backgroundImage: 'https://i.postimg.cc/QtnSw23T/1.png',
    images: [
      {
        id: 'pg-1',
        url: 'https://i.postimg.cc/QtnSw23T/1.png',
        title: 'Feminine Beauty',
        category: 'Pink & Girly',
        description: 'Soft pink feminine flatlay'
      },
      {
        id: 'pg-2',
        url: 'https://i.postimg.cc/FKrM4X2W/10.png',
        title: 'Pink Aesthetic',
        category: 'Pink & Girly',
        description: 'Girly pink aesthetic'
      },
      {
        id: 'pg-3',
        url: 'https://i.postimg.cc/9fLvXN2W/11.png',
        title: 'Romantic Style',
        category: 'Pink & Girly',
        description: 'Romantic feminine style'
      },
      {
        id: 'pg-4',
        url: 'https://i.postimg.cc/wv3n1cxD/12.png',
        title: 'Soft Femininity',
        category: 'Pink & Girly',
        description: 'Soft feminine aesthetic'
      },
      {
        id: 'pg-5',
        url: 'https://i.postimg.cc/63Sgn2Tg/13.png',
        title: 'Beauty Essentials',
        category: 'Pink & Girly',
        description: 'Beauty and feminine essentials'
      },
      {
        id: 'pg-6',
        url: 'https://i.postimg.cc/nrD5kFDz/14.png',
        title: 'Pink Vibes',
        category: 'Pink & Girly',
        description: 'Pink girly vibes'
      },
      {
        id: 'pg-7',
        url: 'https://i.postimg.cc/59YZ13RV/15.png',
        title: 'Feminine Charm',
        category: 'Pink & Girly',
        description: 'Charming feminine aesthetic'
      },
      {
        id: 'pg-8',
        url: 'https://i.postimg.cc/3rszwvsD/16.png',
        title: 'Girly Lifestyle',
        category: 'Pink & Girly',
        description: 'Girly lifestyle aesthetic'
      },
      {
        id: 'pg-9',
        url: 'https://i.postimg.cc/wTDZRBz4/17.png',
        title: 'Pink Dreams',
        category: 'Pink & Girly',
        description: 'Pink dreamy aesthetic'
      },
      {
        id: 'pg-10',
        url: 'https://i.postimg.cc/YCkV6wqr/18.png',
        title: 'Feminine Grace',
        category: 'Pink & Girly',
        description: 'Graceful feminine style'
      },
      {
        id: 'pg-11',
        url: 'https://i.postimg.cc/Z5cQjDCr/19.png',
        title: 'Romantic Pink',
        category: 'Pink & Girly',
        description: 'Romantic pink aesthetic'
      },
      {
        id: 'pg-12',
        url: 'https://i.postimg.cc/vmh0L12X/2.png',
        title: 'Soft Beauty',
        category: 'Pink & Girly',
        description: 'Soft beauty aesthetic'
      },
      {
        id: 'pg-13',
        url: 'https://i.postimg.cc/DzwMNdXR/20.png',
        title: 'Pink Elegance',
        category: 'Pink & Girly',
        description: 'Elegant pink style'
      },
      {
        id: 'pg-14',
        url: 'https://i.postimg.cc/tgvMGZdJ/21.png',
        title: 'Girly Chic',
        category: 'Pink & Girly',
        description: 'Chic girly aesthetic'
      },
      {
        id: 'pg-15',
        url: 'https://i.postimg.cc/TwyHddQ9/22.png',
        title: 'Feminine Luxury',
        category: 'Pink & Girly',
        description: 'Luxurious feminine style'
      },
      {
        id: 'pg-16',
        url: 'https://i.postimg.cc/x8Mxm6wN/23.png',
        title: 'Pink Paradise',
        category: 'Pink & Girly',
        description: 'Pink paradise aesthetic'
      },
      {
        id: 'pg-17',
        url: 'https://i.postimg.cc/ydwpWMbz/24.png',
        title: 'Sweet Femininity',
        category: 'Pink & Girly',
        description: 'Sweet feminine aesthetic'
      },
      {
        id: 'pg-18',
        url: 'https://i.postimg.cc/tCdvCmdL/25.png',
        title: 'Girly Glamour',
        category: 'Pink & Girly',
        description: 'Glamorous girly style'
      }
    ]
  },
  {
    id: 'cream-aesthetic',
    name: 'Cream Aesthetic',
    description: 'Neutral tones, cream textures, minimalist elegance',
    aesthetic: 'Soft neutral and cream sophistication',
    backgroundImage: 'https://i.postimg.cc/NfrbPGj8/1.png',
    images: [
      {
        id: 'ca-1',
        url: 'https://i.postimg.cc/NfrbPGj8/1.png',
        title: 'Cream Elegance',
        category: 'Cream Aesthetic',
        description: 'Soft cream aesthetic'
      },
      {
        id: 'ca-2',
        url: 'https://i.postimg.cc/ryRY7Nht/10.png',
        title: 'Neutral Vibes',
        category: 'Cream Aesthetic',
        description: 'Neutral cream vibes'
      },
      {
        id: 'ca-3',
        url: 'https://i.postimg.cc/ydkr1mst/11.png',
        title: 'Cream Sophistication',
        category: 'Cream Aesthetic',
        description: 'Sophisticated cream style'
      },
      {
        id: 'ca-4',
        url: 'https://i.postimg.cc/7hzs7qCN/12.png',
        title: 'Minimalist Cream',
        category: 'Cream Aesthetic',
        description: 'Minimalist cream aesthetic'
      },
      {
        id: 'ca-5',
        url: 'https://i.postimg.cc/L6d0Sg7Q/13.png',
        title: 'Cream Luxury',
        category: 'Cream Aesthetic',
        description: 'Luxurious cream tones'
      },
      {
        id: 'ca-6',
        url: 'https://i.postimg.cc/ZKrs5Kzb/14.png',
        title: 'Neutral Luxury',
        category: 'Cream Aesthetic',
        description: 'Neutral luxury aesthetic'
      },
      {
        id: 'ca-7',
        url: 'https://i.postimg.cc/YCRXQnST/15.png',
        title: 'Cream Lifestyle',
        category: 'Cream Aesthetic',
        description: 'Cream lifestyle aesthetic'
      },
      {
        id: 'ca-8',
        url: 'https://i.postimg.cc/fRD2tnMx/16.png',
        title: 'Soft Neutrals',
        category: 'Cream Aesthetic',
        description: 'Soft neutral tones'
      },
      {
        id: 'ca-9',
        url: 'https://i.postimg.cc/yNNLjmgx/17.png',
        title: 'Cream Comfort',
        category: 'Cream Aesthetic',
        description: 'Comfortable cream aesthetic'
      },
      {
        id: 'ca-10',
        url: 'https://i.postimg.cc/nLw0PXBk/18.png',
        title: 'Neutral Elegance',
        category: 'Cream Aesthetic',
        description: 'Elegant neutral style'
      },
      {
        id: 'ca-11',
        url: 'https://i.postimg.cc/ydgv47Tz/19.png',
        title: 'Cream Serenity',
        category: 'Cream Aesthetic',
        description: 'Serene cream aesthetic'
      },
      {
        id: 'ca-12',
        url: 'https://i.postimg.cc/MGzDTybt/2.png',
        title: 'Soft Cream',
        category: 'Cream Aesthetic',
        description: 'Soft cream style'
      },
      {
        id: 'ca-13',
        url: 'https://i.postimg.cc/RFkGv2PJ/20.png',
        title: 'Cream Warmth',
        category: 'Cream Aesthetic',
        description: 'Warm cream tones'
      },
      {
        id: 'ca-14',
        url: 'https://i.postimg.cc/4ypPywML/21.png',
        title: 'Neutral Beauty',
        category: 'Cream Aesthetic',
        description: 'Beautiful neutral aesthetic'
      },
      {
        id: 'ca-15',
        url: 'https://i.postimg.cc/qBKj1MRs/22.png',
        title: 'Cream Tranquility',
        category: 'Cream Aesthetic',
        description: 'Tranquil cream style'
      },
      {
        id: 'ca-16',
        url: 'https://i.postimg.cc/PrkK9spB/23.png',
        title: 'Soft Luxury',
        category: 'Cream Aesthetic',
        description: 'Soft luxurious cream'
      },
      {
        id: 'ca-17',
        url: 'https://i.postimg.cc/7YMXysSb/24.png',
        title: 'Cream Harmony',
        category: 'Cream Aesthetic',
        description: 'Harmonious cream aesthetic'
      },
      {
        id: 'ca-18',
        url: 'https://i.postimg.cc/Dwv6frc6/25.png',
        title: 'Neutral Perfection',
        category: 'Cream Aesthetic',
        description: 'Perfect neutral tones'
      }
    ]
  }
];

export default function FlatlayLibrary() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedCollection, setSelectedCollection] = useState<FlatlayCollection>(flatlayCollections[0]);
  const [fullSizeImage, setFullSizeImage] = useState<string | null>(null);
  const [favoriteImages, setFavoriteImages] = useState<Set<string>>(new Set());

  // Save flatlay to gallery
  const saveToGallery = useCallback(async (imageUrl: string, imageTitle: string) => {
    try {
      const response = await fetch('/api/save-selected-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrls: [imageUrl],
          prompt: `Flatlay: ${imageTitle}`
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save image');
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/ai-images'] });
      
      toast({
        title: "Flatlay Saved",
        description: "Added to your gallery successfully",
      });
    } catch (error) {
      console.error('Error saving flatlay:', error);
      toast({
        title: "Save Failed",
        description: "Could not save flatlay to gallery",
        variant: "destructive",
      });
    }
  }, [queryClient, toast]);

  // Toggle favorite
  const toggleFavorite = (imageId: string) => {
    setFavoriteImages(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(imageId)) {
        newFavorites.delete(imageId);
      } else {
        newFavorites.add(imageId);
      }
      return newFavorites;
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <Navigation />
      
      {/* Hero Section */}
      <HeroFullBleed
        title="FLATLAYS"
        tagline="Brand Library"
        description="CURATED LIFESTYLE IMAGES THAT MATCH YOUR AESTHETIC. BECAUSE YOUR BRAND NEEDS MORE THAN JUST SELFIES."
        backgroundImage={SandraImages.flatlays.workspace1}
      />

      {/* Collection Selector */}
      <div style={{
        background: '#f5f5f5',
        padding: '80px 0'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 40px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            <h2 style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 200,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#0a0a0a',
              marginBottom: '20px'
            }}>
              CHOOSE YOUR VIBE
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#666666',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Six curated collections of professional flatlays. Pick the aesthetic that matches your brand and save your favorites.
            </p>
          </div>

          {/* Collection Grid - Image Buttons with Text Overlay */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
            marginBottom: '80px'
          }}>
            {flatlayCollections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => setSelectedCollection(collection)}
                style={{
                  position: 'relative',
                  height: '280px',
                  border: selectedCollection.id === collection.id ? '3px solid #0a0a0a' : '1px solid #e5e5e5',
                  cursor: 'pointer',
                  transition: 'all 300ms ease',
                  background: 'transparent',
                  padding: '0',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {/* Background Image */}
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${collection.backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: selectedCollection.id === collection.id ? 'brightness(1)' : 'brightness(0.75)'
                }} />
                
                {/* Text Overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                  padding: '50px 30px 25px',
                  color: '#ffffff',
                  textAlign: 'center'
                }}>
                  <h3 style={{
                    fontFamily: 'Times New Roman, serif',
                    fontSize: '1.5rem',
                    fontWeight: 200,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                    color: '#ffffff'
                  }}>
                    {collection.name}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    opacity: 0.9,
                    marginBottom: '8px',
                    lineHeight: 1.4,
                    color: '#ffffff'
                  }}>
                    {collection.description}
                  </p>
                  <div style={{
                    fontSize: '12px',
                    opacity: 0.7,
                    fontStyle: 'italic',
                    color: '#ffffff'
                  }}>
                    {collection.aesthetic}
                  </div>
                </div>
                
                {/* Selection Indicator */}
                {selectedCollection.id === collection.id && (
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: '#ffffff',
                    color: '#0a0a0a',
                    padding: '5px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}>
                    SELECTED
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Collection Images */}
      <div style={{
        background: '#ffffff',
        padding: '80px 0'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 40px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            <h2 style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 200,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#0a0a0a',
              marginBottom: '15px'
            }}>
              {selectedCollection.name}
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#666666',
              marginBottom: '30px'
            }}>
              {selectedCollection.description}
            </p>
            <div style={{
              background: '#f5f5f5',
              padding: '20px',
              fontSize: '14px',
              color: '#0a0a0a',
              textAlign: 'center',
              border: '1px solid #e5e5e5'
            }}>
              <strong>Upload Location:</strong> Create folder: <code>/public/flatlays/{selectedCollection.id}/</code>
              <br />
              Add your flatlay images here and update the collection data below
            </div>
          </div>

          {/* Image Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {selectedCollection.images.map((image) => (
              <div
                key={image.id}
                style={{
                  position: 'relative',
                  background: '#f5f5f5',
                  aspectRatio: '4/5',
                  overflow: 'hidden',
                  border: '1px solid #e5e5e5'
                }}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    transition: 'transform 300ms ease'
                  }}
                  onClick={() => setFullSizeImage(image.url)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                
                {/* Image Actions */}
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  display: 'flex',
                  gap: '10px'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(image.id);
                    }}
                    style={{
                      background: favoriteImages.has(image.id) ? '#0a0a0a' : 'rgba(255, 255, 255, 0.9)',
                      color: favoriteImages.has(image.id) ? '#ffffff' : '#0a0a0a',
                      border: 'none',
                      width: '32px',
                      height: '32px',
                      borderRadius: '0',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ♡
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      saveToGallery(image.url, image.title);
                    }}
                    style={{
                      background: 'rgba(10, 10, 10, 0.9)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 12px',
                      fontSize: '10px',
                      fontWeight: 400,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    Save
                  </button>
                </div>

                {/* Image Info */}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  background: 'linear-gradient(transparent, rgba(10, 10, 10, 0.8))',
                  padding: '20px 15px 15px',
                  color: '#ffffff'
                }}>
                  <h4 style={{
                    fontSize: '12px',
                    fontWeight: 400,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '5px'
                  }}>
                    {image.title}
                  </h4>
                  <p style={{
                    fontSize: '11px',
                    opacity: 0.8,
                    lineHeight: 1.4
                  }}>
                    {image.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Collection Stats */}
          <div style={{
            textAlign: 'center',
            marginTop: '60px',
            padding: '40px',
            background: '#f5f5f5',
            border: '1px solid #e5e5e5'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#666666',
              marginBottom: '10px'
            }}>
              {selectedCollection.images.length} Professional Flatlays Available
            </p>
            <p style={{
              fontSize: '12px',
              color: '#0a0a0a',
              fontWeight: 400,
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              Click images to preview • Save favorites to your gallery
            </p>
          </div>
        </div>
      </div>

      {/* Full Size Image Modal */}
      {fullSizeImage && (
        <div style={{
          position: 'fixed',
          inset: '0',
          background: 'rgba(10, 10, 10, 0.95)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px'
        }}>
          <div style={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh'
          }}>
            <img
              src={fullSizeImage}
              alt="Full size flatlay"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
            <button
              onClick={() => setFullSizeImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '24px',
                cursor: 'pointer',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}