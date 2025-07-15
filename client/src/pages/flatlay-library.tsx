import { useState, useCallback } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { HeroFullBleed } from '@/components/HeroFullBleed';
import { MemberNavigation } from '@/components/member-navigation';
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
        title: 'Fitness & Health 1',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-2',
        url: 'https://i.postimg.cc/85B1Mmct/Fitness-Aesthetic2.png',
        title: 'Fitness & Health 2',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-3',
        url: 'https://i.postimg.cc/wvdq1Gq1/Fitness-Aesthetic3.png',
        title: 'Fitness & Health 3',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-4',
        url: 'https://i.postimg.cc/g2QkW01q/Fitness-Aesthetic4.png',
        title: 'Fitness & Health 4',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-5',
        url: 'https://i.postimg.cc/bwsNWnVw/Fitness-Aesthetic5.png',
        title: 'Fitness & Health 5',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-6',
        url: 'https://i.postimg.cc/yNR6YHHq/Fitness-Aesthetic6.png',
        title: 'Fitness & Health 6',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-7',
        url: 'https://i.postimg.cc/02tyVnf4/Fitness-Aesthetic7.png',
        title: 'Fitness & Health 7',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-8',
        url: 'https://i.postimg.cc/SNQKL3W8/Fitness-Aesthetic8.png',
        title: 'Fitness & Health 8',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-9',
        url: 'https://i.postimg.cc/C57xTsVz/Fitness-Aesthetic9.png',
        title: 'Fitness & Health 9',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-10',
        url: 'https://i.postimg.cc/Bb4nVwkr/Fitness-Aesthetic10.png',
        title: 'Fitness & Health 10',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-11',
        url: 'https://i.postimg.cc/ZRrqjh7P/Fitness-Aesthetic11.png',
        title: 'Fitness & Health 11',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-12',
        url: 'https://i.postimg.cc/k4r4x5cX/Fitness-Aesthetic12.png',
        title: 'Fitness & Health 12',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-13',
        url: 'https://i.postimg.cc/CKn5B8bQ/Fitness-Aesthetic13.png',
        title: 'Fitness & Health 13',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-14',
        url: 'https://i.postimg.cc/7ZWbZ9Jz/Fitness-Aesthetic14.png',
        title: 'Fitness & Health 14',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-15',
        url: 'https://i.postimg.cc/jdRDgLrD/Fitness-Aesthetic15.png',
        title: 'Fitness & Health 15',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-16',
        url: 'https://i.postimg.cc/PrKPBTt2/Fitness-Aesthetic16.png',
        title: 'Fitness & Health 16',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-17',
        url: 'https://i.postimg.cc/8kRFmLx8/Fitness-Aesthetic17.png',
        title: 'Fitness & Health 17',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-18',
        url: 'https://i.postimg.cc/QCJHNrcN/Fitness-Aesthetic18.png',
        title: 'Fitness & Health 18',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-19',
        url: 'https://i.postimg.cc/D0TSKzJY/Fitness-Aesthetic19.png',
        title: 'Fitness & Health 19',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-20',
        url: 'https://i.postimg.cc/NMTKVXMH/Fitness-Aesthetic20.png',
        title: 'Fitness & Health 20',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-21',
        url: 'https://i.postimg.cc/wB1yXZYF/Fitness-Aesthetic21.png',
        title: 'Fitness & Health 21',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-22',
        url: 'https://i.postimg.cc/L8CgZRwn/Fitness-Aesthetic22.png',
        title: 'Fitness & Health 22',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-23',
        url: 'https://i.postimg.cc/9fs4JbW2/Fitness-Aesthetic23.png',
        title: 'Fitness & Health 23',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-24',
        url: 'https://i.postimg.cc/y8YSdWfM/Fitness-Aesthetic24.png',
        title: 'Fitness & Health 24',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-25',
        url: 'https://i.postimg.cc/RVTH4wT1/Fitness-Aesthetic25.png',
        title: 'Fitness & Health 25',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-26',
        url: 'https://i.postimg.cc/9F276LyF/Fitness-Aesthetic26.png',
        title: 'Fitness & Health 26',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-27',
        url: 'https://i.postimg.cc/nVBmSyjP/Fitness-Aesthetic27.png',
        title: 'Fitness & Health 27',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-28',
        url: 'https://i.postimg.cc/GtFsBDnC/Fitness-Aesthetic28.png',
        title: 'Fitness & Health 28',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-29',
        url: 'https://i.postimg.cc/0jRw2f3n/Fitness-Aesthetic29.png',
        title: 'Fitness & Health 29',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-30',
        url: 'https://i.postimg.cc/XvP5t3kT/Fitness-Aesthetic30.png',
        title: 'Fitness & Health 30',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-31',
        url: 'https://i.postimg.cc/hj7mBwCh/Fitness-Aesthetic31.png',
        title: 'Fitness & Health 31',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-32',
        url: 'https://i.postimg.cc/GptYM9GF/Fitness-Aesthetic32.png',
        title: 'Fitness & Health 32',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-33',
        url: 'https://i.postimg.cc/bw3kH1DY/Fitness-Aesthetic33.png',
        title: 'Fitness & Health 33',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-34',
        url: 'https://i.postimg.cc/7ZxS2KLQ/Fitness-Aesthetic34.png',
        title: 'Fitness & Health 34',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-35',
        url: 'https://i.postimg.cc/X7KwqRnC/Fitness-Aesthetic35.png',
        title: 'Fitness & Health 35',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-36',
        url: 'https://i.postimg.cc/FsXy9rXv/Fitness-Aesthetic36.png',
        title: 'Fitness & Health 36',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-37',
        url: 'https://i.postimg.cc/zDgwZLMp/Fitness-Aesthetic37.png',
        title: 'Fitness & Health 37',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-38',
        url: 'https://i.postimg.cc/8cMLh3Wx/Fitness-Aesthetic38.png',
        title: 'Fitness & Health 38',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-39',
        url: 'https://i.postimg.cc/bJKQS8GQ/Fitness-Aesthetic39.png',
        title: 'Fitness & Health 39',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-40',
        url: 'https://i.postimg.cc/Y946SjSr/Fitness-Aesthetic40.png',
        title: 'Fitness & Health 40',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-41',
        url: 'https://i.postimg.cc/VNZ91XmZ/Fitness-Aesthetic41.png',
        title: 'Fitness & Health 41',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-42',
        url: 'https://i.postimg.cc/fbR768n0/Fitness-Aesthetic42.png',
        title: 'Fitness & Health 42',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-43',
        url: 'https://i.postimg.cc/g2DqSf5W/Fitness-Aesthetic43.png',
        title: 'Fitness & Health 43',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-44',
        url: 'https://i.postimg.cc/8zDmb1Z4/Fitness-Aesthetic44.png',
        title: 'Fitness & Health 44',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-45',
        url: 'https://i.postimg.cc/gk3KRwHr/Fitness-Aesthetic45.png',
        title: 'Fitness & Health 45',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-46',
        url: 'https://i.postimg.cc/G3WQHPYZ/Fitness-Aesthetic46.png',
        title: 'Fitness & Health 46',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-47',
        url: 'https://i.postimg.cc/pVhCWc9f/Fitness-Aesthetic47.png',
        title: 'Fitness & Health 47',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-48',
        url: 'https://i.postimg.cc/1Xqrv4xC/Fitness-Aesthetic48.png',
        title: 'Fitness & Health 48',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-49',
        url: 'https://i.postimg.cc/NMVx8mn2/Fitness-Aesthetic49.png',
        title: 'Fitness & Health 49',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-50',
        url: 'https://i.postimg.cc/pTyZnqst/Fitness-Aesthetic50.png',
        title: 'Fitness & Health 50',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-51',
        url: 'https://i.postimg.cc/TPt0wZq9/Fitness-Aesthetic51.png',
        title: 'Fitness & Health 51',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-52',
        url: 'https://i.postimg.cc/wBqF96JM/Fitness-Aesthetic52.png',
        title: 'Fitness & Health 52',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-53',
        url: 'https://i.postimg.cc/qvXjftNW/Fitness-Aesthetic53.png',
        title: 'Fitness & Health 53',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-54',
        url: 'https://i.postimg.cc/T3XCHj3r/Fitness-Aesthetic54.png',
        title: 'Fitness & Health 54',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-55',
        url: 'https://i.postimg.cc/ryKndFHt/Fitness-Aesthetic55.png',
        title: 'Fitness & Health 55',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-56',
        url: 'https://i.postimg.cc/h46CVRFZ/Fitness-Aesthetic56.png',
        title: 'Fitness & Health 56',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-57',
        url: 'https://i.postimg.cc/LhF53bDg/Fitness-Aesthetic57.png',
        title: 'Fitness & Health 57',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-58',
        url: 'https://i.postimg.cc/WzktrvGP/Fitness-Aesthetic58.png',
        title: 'Fitness & Health 58',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-59',
        url: 'https://i.postimg.cc/B6tjSDtb/Fitness-Aesthetic59.png',
        title: 'Fitness & Health 59',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-60',
        url: 'https://i.postimg.cc/LX7nnXZT/Fitness-Aesthetic60.png',
        title: 'Fitness & Health 60',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-61',
        url: 'https://i.postimg.cc/JhpyCKrS/Fitness-Aesthetic61.png',
        title: 'Fitness & Health 61',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-62',
        url: 'https://i.postimg.cc/JhryFSLb/Fitness-Aesthetic62.png',
        title: 'Fitness & Health 62',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-63',
        url: 'https://i.postimg.cc/vTJgSBYB/Fitness-Aesthetic63.png',
        title: 'Fitness & Health 63',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-64',
        url: 'https://i.postimg.cc/SxpY6J11/Fitness-Aesthetic64.png',
        title: 'Fitness & Health 64',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-65',
        url: 'https://i.postimg.cc/fWp9bHcN/Fitness-Aesthetic65.png',
        title: 'Fitness & Health 65',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
      },
      {
        id: 'fh-66',
        url: 'https://i.postimg.cc/dtCTZ86T/Fitness-Aesthetic66.png',
        title: 'Fitness & Health 66',
        category: 'Fitness & Health',
        description: 'Fitness & Health aesthetic flatlay'
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
        url: 'https://i.postimg.cc/rynDPfn4/marga888-Aesthetic-close-up-of-a-female-surfers-hand-gripping-53ec62d8-1ab9-4048-b02d-b4b30a837b43-0.png',
        title: 'Coastal Vibes 1',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-2',
        url: 'https://i.postimg.cc/JnKsmxR9/marga888-Aesthetic-close-up-of-a-female-surfers-hand-gripping-53ec62d8-1ab9-4048-b02d-b4b30a837b43-1.png',
        title: 'Coastal Vibes 2',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-3',
        url: 'https://i.postimg.cc/mk5h1rzj/marga888-Aesthetic-close-up-of-a-female-surfers-hand-gripping-53ec62d8-1ab9-4048-b02d-b4b30a837b43-2.png',
        title: 'Coastal Vibes 3',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-4',
        url: 'https://i.postimg.cc/yNmJpBt6/marga888-Aesthetic-close-up-of-a-female-surfers-hand-gripping-d3815090-665c-4be9-a02c-74277a9c3c26-0.png',
        title: 'Coastal Vibes 4',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-5',
        url: 'https://i.postimg.cc/4dXYrqR6/marga888-Aesthetic-close-up-of-a-female-surfers-hand-gripping-d3815090-665c-4be9-a02c-74277a9c3c26-1.png',
        title: 'Coastal Vibes 5',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-6',
        url: 'https://i.postimg.cc/SQr6NLZQ/marga888-Aesthetic-close-up-of-a-surfers-feet-walking-on-the-45e6acf0-43b6-411e-930f-87e29423eae9-0.png',
        title: 'Coastal Vibes 6',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-7',
        url: 'https://i.postimg.cc/mgr8GpBG/marga888-Aesthetic-close-up-of-a-surfers-feet-walking-on-the-45e6acf0-43b6-411e-930f-87e29423eae9-2.png',
        title: 'Coastal Vibes 7',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-8',
        url: 'https://i.postimg.cc/tC4h11f3/marga888-Aesthetic-close-up-of-a-surfers-feet-walking-on-the-45e6acf0-43b6-411e-930f-87e29423eae9-3.png',
        title: 'Coastal Vibes 8',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-9',
        url: 'https://i.postimg.cc/vHTVYJgX/marga888-Aesthetic-close-up-of-a-woman-sitting-on-her-surfboa-0782d245-53e7-4d06-9a8e-9fcd5489c440-0.png',
        title: 'Coastal Vibes 9',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-10',
        url: 'https://i.postimg.cc/GhfsHXvR/marga888-Aesthetic-close-up-of-a-woman-sitting-on-her-surfboa-0782d245-53e7-4d06-9a8e-9fcd5489c440-2.png',
        title: 'Coastal Vibes 10',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-11',
        url: 'https://i.postimg.cc/mkDtr9Dh/marga888-Aesthetic-close-up-of-a-woman-sitting-on-her-surfboa-0782d245-53e7-4d06-9a8e-9fcd5489c440-3.png',
        title: 'Coastal Vibes 11',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-12',
        url: 'https://i.postimg.cc/dVTZdG9y/marga888-Aesthetic-close-up-of-a-woman-sitting-on-her-surfboa-fb015995-34d5-4d7f-a729-429ce6474a54-1.png',
        title: 'Coastal Vibes 12',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-13',
        url: 'https://i.postimg.cc/3w54ZWLb/marga888-Aesthetic-close-up-of-a-woman-sitting-on-her-surfboa-fb015995-34d5-4d7f-a729-429ce6474a54-2.png',
        title: 'Coastal Vibes 13',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-14',
        url: 'https://i.postimg.cc/Wb5wSmrY/marga888-A-close-up-of-a-surfboards-waxed-surface-with-sand-g-bc113a5a-d6b2-4d1d-8e34-822623cd80c8-0.png',
        title: 'Coastal Vibes 14',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-15',
        url: 'https://i.postimg.cc/bwdH5G9y/marga888-A-close-up-of-a-surfboards-waxed-surface-with-sand-g-bc113a5a-d6b2-4d1d-8e34-822623cd80c8-1.png',
        title: 'Coastal Vibes 15',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-16',
        url: 'https://i.postimg.cc/0y3d18Vp/marga888-A-close-up-of-a-surfboards-waxed-surface-with-sand-g-bc113a5a-d6b2-4d1d-8e34-822623cd80c8-3.png',
        title: 'Coastal Vibes 16',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-17',
        url: 'https://i.postimg.cc/2yzn735f/marga888-A-close-up-of-a-wetsuit-hanging-to-dry-on-a-rustic-f-4bfecd60-74a4-46e2-9ed8-78622125a271-3.png',
        title: 'Coastal Vibes 17',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-18',
        url: 'https://i.postimg.cc/QtD7jV1W/marga888-A-close-up-of-fringed-beach-umbrellas-standing-on-a-384afec0-b5a2-4f53-9f38-1c559b49345f-2.png',
        title: 'Coastal Vibes 18',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-19',
        url: 'https://i.postimg.cc/9fZT3yRh/marga888-A-close-up-of-fringed-beach-umbrellas-standing-on-a-384afec0-b5a2-4f53-9f38-1c559b49345f-3.png',
        title: 'Coastal Vibes 19',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-20',
        url: 'https://i.postimg.cc/sg9ytXjL/marga888-A-close-up-of-fringed-beach-umbrellas-standing-on-a-73bb9921-c92c-4358-bcc5-99e297145ec2-0.png',
        title: 'Coastal Vibes 20',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-21',
        url: 'https://i.postimg.cc/Ls9RRph8/marga888-A-close-up-of-fringed-beach-umbrellas-standing-on-a-73bb9921-c92c-4358-bcc5-99e297145ec2-1.png',
        title: 'Coastal Vibes 21',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-22',
        url: 'https://i.postimg.cc/GpXRm5sJ/marga888-A-close-up-of-fringed-beach-umbrellas-standing-on-a-73bb9921-c92c-4358-bcc5-99e297145ec2-2.png',
        title: 'Coastal Vibes 22',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-23',
        url: 'https://i.postimg.cc/nz5tv92X/marga888-A-close-up-of-fringed-beach-umbrellas-standing-on-a-73bb9921-c92c-4358-bcc5-99e297145ec2-3.png',
        title: 'Coastal Vibes 23',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-24',
        url: 'https://i.postimg.cc/F1X56t2m/marga888-A-close-up-shot-of-palm-leaves-gently-swaying-in-the-21544c8c-b3e1-4ef4-9f09-3725377a3d10-1.png',
        title: 'Coastal Vibes 24',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-25',
        url: 'https://i.postimg.cc/jqwDBzGk/marga888-A-close-up-shot-of-palm-leaves-gently-swaying-in-the-21544c8c-b3e1-4ef4-9f09-3725377a3d10-2.png',
        title: 'Coastal Vibes 25',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-26',
        url: 'https://i.postimg.cc/vH255YFp/marga888-A-close-up-shot-of-palm-leaves-gently-swaying-in-the-2977131a-052b-40d6-91fa-20948bb8bb81-2.png',
        title: 'Coastal Vibes 26',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-27',
        url: 'https://i.postimg.cc/4xrtFW3P/marga888-A-close-up-shot-of-palm-leaves-gently-swaying-in-the-2977131a-052b-40d6-91fa-20948bb8bb81-3.png',
        title: 'Coastal Vibes 27',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-28',
        url: 'https://i.postimg.cc/HkJX2qTj/marga888-A-close-up-shot-of-palm-tree-gently-swaying-in-the-b-a4aed3b6-44a1-4c4f-aa8a-38ea30330bce-2.png',
        title: 'Coastal Vibes 28',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-29',
        url: 'https://i.postimg.cc/XvkJcLBp/marga888-a-close-up-of-feet-on-the-sand-next-to-an-surfboard-f73af47f-725c-45cf-ae7d-e235c4cf1c28-0.png',
        title: 'Coastal Vibes 29',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-30',
        url: 'https://i.postimg.cc/gJc0Mh34/marga888-a-close-up-of-feet-on-the-sand-next-to-an-surfboard-f73af47f-725c-45cf-ae7d-e235c4cf1c28-2.png',
        title: 'Coastal Vibes 30',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-31',
        url: 'https://i.postimg.cc/gk3n2GcV/marga888-A-collection-of-surfboards-in-various-pastel-colors-ea89ad4b-4514-46c6-9773-ce3fb6a1f980-0.png',
        title: 'Coastal Vibes 31',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-32',
        url: 'https://i.postimg.cc/FHm1fw12/marga888-A-collection-of-surfboards-in-various-pastel-colors-ea89ad4b-4514-46c6-9773-ce3fb6a1f980-1.png',
        title: 'Coastal Vibes 32',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-33',
        url: 'https://i.postimg.cc/Z5cn6jd0/marga888-A-collection-of-surfboards-in-various-pastel-colors-ea89ad4b-4514-46c6-9773-ce3fb6a1f980-2.png',
        title: 'Coastal Vibes 33',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-34',
        url: 'https://i.postimg.cc/0NyQnmYn/marga888-A-collection-of-surfboards-in-various-pastel-colors-ea89ad4b-4514-46c6-9773-ce3fb6a1f980-3.png',
        title: 'Coastal Vibes 34',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-35',
        url: 'https://i.postimg.cc/JntLD5Nw/marga888-A-lone-surfer-walking-along-a-deserted-beach-with-a-32c02e44-3861-489f-87d1-6624cc6c5441-2.png',
        title: 'Coastal Vibes 35',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-36',
        url: 'https://i.postimg.cc/8zVNKWSW/marga888-A-photograph-of-an-Australian-surfer-walking-along-t-bd7fdb7f-9255-4173-a6e3-3c66df0304dd-1.png',
        title: 'Coastal Vibes 36',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-37',
        url: 'https://i.postimg.cc/J72hqG0c/marga888-A-photograph-of-surfboards-stacked-on-an-old-wooden-0d42390a-67dd-4ace-b7e0-68a5d14ddaa3-0.png',
        title: 'Coastal Vibes 37',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-38',
        url: 'https://i.postimg.cc/vHxZSb6R/marga888-A-photograph-of-surfboards-stacked-on-an-old-wooden-0d42390a-67dd-4ace-b7e0-68a5d14ddaa3-1.png',
        title: 'Coastal Vibes 38',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-39',
        url: 'https://i.postimg.cc/yxk8KzQZ/marga888-A-photograph-of-surfboards-stacked-on-an-old-wooden-73c3f3ba-4c22-4f6a-bc3c-54bd59222563-2.png',
        title: 'Coastal Vibes 39',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-40',
        url: 'https://i.postimg.cc/hv6PP363/marga888-A-photograph-of-surfboards-stacked-on-an-old-wooden-73c3f3ba-4c22-4f6a-bc3c-54bd59222563-3.png',
        title: 'Coastal Vibes 40',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-41',
        url: 'https://i.postimg.cc/nh8cygvX/marga888-A-photograph-of-surfboards-stacked-on-an-old-wooden-fbfb5819-b205-415f-bd45-52447cf628c9-0.png',
        title: 'Coastal Vibes 41',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-42',
        url: 'https://i.postimg.cc/3JG3F1PY/marga888-A-photograph-shows-an-Australian-surfer-walking-on-t-b8fb4324-a61c-4257-9606-2bbd686f27ac-0.png',
        title: 'Coastal Vibes 42',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-43',
        url: 'https://i.postimg.cc/HnqdC88q/marga888-A-surfboard-leaning-against-the-wall-of-an-open-air-9a02a907-86aa-4334-8d97-dd02280a6b8d-2.png',
        title: 'Coastal Vibes 43',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-44',
        url: 'https://i.postimg.cc/7PdxzdtK/marga888-A-surfboard-leaning-against-the-wall-of-an-open-air-9a02a907-86aa-4334-8d97-dd02280a6b8d-3.png',
        title: 'Coastal Vibes 44',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-45',
        url: 'https://i.postimg.cc/G2pcPC15/marga888-A-surfboard-leaning-against-the-wall-of-an-outdoor-b-e88b9c62-e8b7-459b-8dc3-49fa56581ee7-0.png',
        title: 'Coastal Vibes 45',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-46',
        url: 'https://i.postimg.cc/gJBGNTzk/marga888-A-surfboard-leaning-against-the-wall-of-an-outdoor-b-e88b9c62-e8b7-459b-8dc3-49fa56581ee7-1.png',
        title: 'Coastal Vibes 46',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-47',
        url: 'https://i.postimg.cc/D0JnDP0Q/marga888-A-surfboard-leaning-against-the-wall-of-an-outdoor-b-e88b9c62-e8b7-459b-8dc3-49fa56581ee7-3.png',
        title: 'Coastal Vibes 47',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-48',
        url: 'https://i.postimg.cc/W1MbT8nX/marga888-A-surfboard-leaning-against-the-wall-of-an-outdoor-b-ec1e6e44-edf5-420d-94c2-10513635e7a4-0.png',
        title: 'Coastal Vibes 48',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-49',
        url: 'https://i.postimg.cc/yNs6dRpB/marga888-A-surfboard-leaning-against-the-wall-of-an-outdoor-b-ec1e6e44-edf5-420d-94c2-10513635e7a4-2.png',
        title: 'Coastal Vibes 49',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-50',
        url: 'https://i.postimg.cc/VNgfbN2t/marga888-A-surfboard-leaning-against-the-wall-of-an-outdoor-b-ec1e6e44-edf5-420d-94c2-10513635e7a4-3.png',
        title: 'Coastal Vibes 50',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-51',
        url: 'https://i.postimg.cc/PqVqRxKj/marga888-A-vintage-Jeep-parked-on-a-serene-beach-with-surfboa-0570da5b-92ef-49aa-9abb-8950edb1d252-0.png',
        title: 'Coastal Vibes 51',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-52',
        url: 'https://i.postimg.cc/qRt7VTZC/marga888-A-vintage-Jeep-parked-on-a-serene-beach-with-surfboa-0570da5b-92ef-49aa-9abb-8950edb1d252-3.png',
        title: 'Coastal Vibes 52',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-53',
        url: 'https://i.postimg.cc/fLv9yZfq/marga888-A-wide-angle-shot-of-a-beachfront-surf-shack-surfboa-0916d678-34ae-4a38-b5af-9dd18b8da3b8-0.png',
        title: 'Coastal Vibes 53',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-54',
        url: 'https://i.postimg.cc/VvLbbT7f/marga888-A-wide-angle-shot-of-a-beachfront-surf-shack-surfboa-0916d678-34ae-4a38-b5af-9dd18b8da3b8-1.png',
        title: 'Coastal Vibes 54',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-55',
        url: 'https://i.postimg.cc/7hsJ1Vcg/marga888-A-wide-angle-shot-of-a-beachfront-surf-shack-surfboa-0916d678-34ae-4a38-b5af-9dd18b8da3b8-2.png',
        title: 'Coastal Vibes 55',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-56',
        url: 'https://i.postimg.cc/gcNhPzJn/marga888-A-wide-angle-shot-of-a-beachfront-surf-shack-surfboa-0916d678-34ae-4a38-b5af-9dd18b8da3b8-3.png',
        title: 'Coastal Vibes 56',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-57',
        url: 'https://i.postimg.cc/GpCtyV2W/marga888-A-wide-shot-of-a-surfer-standing-on-a-sandy-cliff-lo-b05e0fc0-8dbc-4d12-b25b-9adb8473fbe3-2.png',
        title: 'Coastal Vibes 57',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-58',
        url: 'https://i.postimg.cc/28gVzVf8/marga888-A-wide-shot-of-a-surfer-standing-on-a-sandy-shore-lo-ffd78bad-1d17-4e16-9ecb-cb4b2003f401-2.png',
        title: 'Coastal Vibes 58',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-59',
        url: 'https://i.postimg.cc/DySSk1HM/marga888-a-woman-waxing-her-surfboard-near-the-shore-with-a-b-f6239216-9f83-49ee-bf09-d285a22ca159-0.png',
        title: 'Coastal Vibes 59',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-60',
        url: 'https://i.postimg.cc/Z53004TP/marga888-a-woman-waxing-her-surfboard-near-the-shore-with-a-b-f6239216-9f83-49ee-bf09-d285a22ca159-2.png',
        title: 'Coastal Vibes 60',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-61',
        url: 'https://i.postimg.cc/L51Fv4QN/marga888-calm-empty-beach-with-two-beach-umbrellas-and-a-sing-a2458560-7502-4de2-bf51-21f450b34ba3-2.png',
        title: 'Coastal Vibes 61',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-62',
        url: 'https://i.postimg.cc/7PMVJrLk/marga888-Close-up-of-a-surfboard-fin-slicing-through-the-wate-49dbbf2e-2e82-4135-ad5f-b941ac4e1fb1-2.png',
        title: 'Coastal Vibes 62',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-63',
        url: 'https://i.postimg.cc/HLq2Xp5p/marga888-Close-up-shot-of-a-surfers-hands-tying-an-ankle-leas-78ac1213-9898-4443-a528-844efefb5913-3.png',
        title: 'Coastal Vibes 63',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-64',
        url: 'https://i.postimg.cc/nzdhNLkx/marga888-photo-of-white-surfboard-with-black-sticker-laying-o-1eeed837-ce38-463a-a48d-1e57ab0abc0a-2.png',
        title: 'Coastal Vibes 64',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-65',
        url: 'https://i.postimg.cc/G3W4R4R3/marga888-Two-surfers-relaxing-on-their-boards-in-crystal-clea-3d4c5fd8-50c1-4d52-88f3-169774617a6d-1.png',
        title: 'Coastal Vibes 65',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-66',
        url: 'https://i.postimg.cc/26nxxPFn/marga888-Wide-angle-shot-of-surfers-gear-scattered-on-the-san-a375bdaa-4fb7-4fa9-97c2-7797a0b8894a-1.png',
        title: 'Coastal Vibes 66',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-67',
        url: 'https://i.postimg.cc/NfDpSvh4/marga888-Wide-angle-shot-of-surfers-silhouetted-against-a-pas-3ed7b292-5157-464f-8541-d9a29ec32ba5-0.png',
        title: 'Coastal Vibes 67',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-68',
        url: 'https://i.postimg.cc/SxtVQLxY/marga888-Wide-angle-shot-of-surfers-silhouetted-against-a-pas-3ed7b292-5157-464f-8541-d9a29ec32ba5-2.png',
        title: 'Coastal Vibes 68',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-69',
        url: 'https://i.postimg.cc/fbtCV3V2/marga888-Wide-angle-shot-of-surfers-silhouetted-against-a-pas-3ed7b292-5157-464f-8541-d9a29ec32ba5-3.png',
        title: 'Coastal Vibes 69',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-70',
        url: 'https://i.postimg.cc/zBYC3xZv/marga888-Wide-angle-view-of-a-camper-van-parked-by-the-beach-fe4cfb5d-a544-4d07-a9db-aa5c116cda26-1.png',
        title: 'Coastal Vibes 70',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-71',
        url: 'https://i.postimg.cc/DZQqG1ng/marga888-Wide-angle-view-of-a-camper-van-parked-by-the-beach-fe4cfb5d-a544-4d07-a9db-aa5c116cda26-2.png',
        title: 'Coastal Vibes 71',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-72',
        url: 'https://i.postimg.cc/1XJwCPgV/marga888-Wide-angle-view-of-a-camper-van-parked-by-the-beach-fe4cfb5d-a544-4d07-a9db-aa5c116cda26-3.png',
        title: 'Coastal Vibes 72',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-73',
        url: 'https://i.postimg.cc/02kCpX6J/marga888-Wide-shot-of-a-sandy-pathway-leading-through-beach-g-65a48781-dc89-4797-b993-d37623983598-0.png',
        title: 'Coastal Vibes 73',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-74',
        url: 'https://i.postimg.cc/wBm56Srn/marga888-Wide-shot-of-a-sandy-pathway-leading-through-beach-g-80fb2868-643d-4ba2-bdcc-2b3aba0e0194-2.png',
        title: 'Coastal Vibes 74',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-75',
        url: 'https://i.postimg.cc/2ym7922M/marga888-Wide-shot-of-a-sandy-pathway-leading-through-beach-g-ec049191-c050-4e52-b565-307e33f28011-1.png',
        title: 'Coastal Vibes 75',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
      },
      {
        id: 'cv-76',
        url: 'https://i.postimg.cc/VvRBxnh6/marga888-Wide-shot-of-a-sandy-pathway-leading-through-beach-g-ec049191-c050-4e52-b565-307e33f28011-3.png',
        title: 'Coastal Vibes 76',
        category: 'Coastal Vibes',
        description: 'Coastal Vibes aesthetic flatlay'
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
        title: 'Pink & Girly 1',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-2',
        url: 'https://i.postimg.cc/FKrM4X2W/10.png',
        title: 'Pink & Girly 2',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-3',
        url: 'https://i.postimg.cc/HnMYyCW0/100.png',
        title: 'Pink & Girly 3',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-4',
        url: 'https://i.postimg.cc/tTwRJgbC/101.png',
        title: 'Pink & Girly 4',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-5',
        url: 'https://i.postimg.cc/c1t4jf7K/102.png',
        title: 'Pink & Girly 5',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-6',
        url: 'https://i.postimg.cc/TY8YXhQt/103.png',
        title: 'Pink & Girly 6',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-7',
        url: 'https://i.postimg.cc/Ghk33r5d/104.png',
        title: 'Pink & Girly 7',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-8',
        url: 'https://i.postimg.cc/bwpysM7b/105.png',
        title: 'Pink & Girly 8',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-9',
        url: 'https://i.postimg.cc/6pc9RcKP/106.png',
        title: 'Pink & Girly 9',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-10',
        url: 'https://i.postimg.cc/QMMjq7xd/107.png',
        title: 'Pink & Girly 10',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-11',
        url: 'https://i.postimg.cc/TPHfNPpq/108.png',
        title: 'Pink & Girly 11',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-12',
        url: 'https://i.postimg.cc/LXYRcMPd/109.png',
        title: 'Pink & Girly 12',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-13',
        url: 'https://i.postimg.cc/9fLvXN2W/11.png',
        title: 'Pink & Girly 13',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-14',
        url: 'https://i.postimg.cc/J7XMKMmZ/110.png',
        title: 'Pink & Girly 14',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-15',
        url: 'https://i.postimg.cc/Y0Q7Sf8b/111.png',
        title: 'Pink & Girly 15',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-16',
        url: 'https://i.postimg.cc/4NTZSqNM/112.png',
        title: 'Pink & Girly 16',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-17',
        url: 'https://i.postimg.cc/dVsFqCCj/114.png',
        title: 'Pink & Girly 17',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-18',
        url: 'https://i.postimg.cc/P5SjNqzs/115.png',
        title: 'Pink & Girly 18',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-19',
        url: 'https://i.postimg.cc/HxyDS9Gd/118.png',
        title: 'Pink & Girly 19',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-20',
        url: 'https://i.postimg.cc/T1v8B5Gm/119.png',
        title: 'Pink & Girly 20',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-21',
        url: 'https://i.postimg.cc/wv3n1cxD/12.png',
        title: 'Pink & Girly 21',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-22',
        url: 'https://i.postimg.cc/vT7Ry8HK/120.png',
        title: 'Pink & Girly 22',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-23',
        url: 'https://i.postimg.cc/Df13L6dc/121.png',
        title: 'Pink & Girly 23',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-24',
        url: 'https://i.postimg.cc/8PH8nCYJ/122.png',
        title: 'Pink & Girly 24',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-25',
        url: 'https://i.postimg.cc/DyFkgGx3/123.png',
        title: 'Pink & Girly 25',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-26',
        url: 'https://i.postimg.cc/XYHR4z4n/124.png',
        title: 'Pink & Girly 26',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-27',
        url: 'https://i.postimg.cc/bwwXXhX6/125.png',
        title: 'Pink & Girly 27',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-28',
        url: 'https://i.postimg.cc/SKnwsfxC/126.png',
        title: 'Pink & Girly 28',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-29',
        url: 'https://i.postimg.cc/YSTTmLvV/127.png',
        title: 'Pink & Girly 29',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-30',
        url: 'https://i.postimg.cc/vB9k789m/128.png',
        title: 'Pink & Girly 30',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-31',
        url: 'https://i.postimg.cc/8cmY3yZQ/129.png',
        title: 'Pink & Girly 31',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-32',
        url: 'https://i.postimg.cc/63Sgn2Tg/13.png',
        title: 'Pink & Girly 32',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-33',
        url: 'https://i.postimg.cc/hPK6xBGS/130.png',
        title: 'Pink & Girly 33',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-34',
        url: 'https://i.postimg.cc/2jQgV6rc/131.png',
        title: 'Pink & Girly 34',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-35',
        url: 'https://i.postimg.cc/WbSKwHD0/132.png',
        title: 'Pink & Girly 35',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-36',
        url: 'https://i.postimg.cc/K8zWqDLw/133.png',
        title: 'Pink & Girly 36',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-37',
        url: 'https://i.postimg.cc/wjGGSRQv/134.png',
        title: 'Pink & Girly 37',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-38',
        url: 'https://i.postimg.cc/mr15RZmS/135.png',
        title: 'Pink & Girly 38',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-39',
        url: 'https://i.postimg.cc/wvKbBKPY/136.png',
        title: 'Pink & Girly 39',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-40',
        url: 'https://i.postimg.cc/ZRrsB7tB/137.png',
        title: 'Pink & Girly 40',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-41',
        url: 'https://i.postimg.cc/ZnHfjWqJ/138.png',
        title: 'Pink & Girly 41',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-42',
        url: 'https://i.postimg.cc/x8nxKvns/139.png',
        title: 'Pink & Girly 42',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-43',
        url: 'https://i.postimg.cc/nrD5kFDz/14.png',
        title: 'Pink & Girly 43',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-44',
        url: 'https://i.postimg.cc/c41kCBDC/140.png',
        title: 'Pink & Girly 44',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-45',
        url: 'https://i.postimg.cc/gcHBGTH1/141.png',
        title: 'Pink & Girly 45',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-46',
        url: 'https://i.postimg.cc/BnXhcQfG/142.png',
        title: 'Pink & Girly 46',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-47',
        url: 'https://i.postimg.cc/yYfQZ35P/143.png',
        title: 'Pink & Girly 47',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-48',
        url: 'https://i.postimg.cc/dVp5WPJZ/144.png',
        title: 'Pink & Girly 48',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-49',
        url: 'https://i.postimg.cc/VNtDpGNG/145.png',
        title: 'Pink & Girly 49',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-50',
        url: 'https://i.postimg.cc/B6GM0TLq/146.png',
        title: 'Pink & Girly 50',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-51',
        url: 'https://i.postimg.cc/PxzKrCY1/147.png',
        title: 'Pink & Girly 51',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-52',
        url: 'https://i.postimg.cc/rsVjdqN3/148.png',
        title: 'Pink & Girly 52',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-53',
        url: 'https://i.postimg.cc/C5cNk9v1/149.png',
        title: 'Pink & Girly 53',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-54',
        url: 'https://i.postimg.cc/59YZ13RV/15.png',
        title: 'Pink & Girly 54',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-55',
        url: 'https://i.postimg.cc/QxMShxtW/150.png',
        title: 'Pink & Girly 55',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-56',
        url: 'https://i.postimg.cc/fTgCLntq/151.png',
        title: 'Pink & Girly 56',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-57',
        url: 'https://i.postimg.cc/FHdZkW0r/152.png',
        title: 'Pink & Girly 57',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-58',
        url: 'https://i.postimg.cc/jSphHHhz/153.png',
        title: 'Pink & Girly 58',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-59',
        url: 'https://i.postimg.cc/TwGqSTF1/154.png',
        title: 'Pink & Girly 59',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-60',
        url: 'https://i.postimg.cc/vm5t34PC/155.png',
        title: 'Pink & Girly 60',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-61',
        url: 'https://i.postimg.cc/W3n6cQcn/156.png',
        title: 'Pink & Girly 61',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-62',
        url: 'https://i.postimg.cc/Vvk9fDYc/157.png',
        title: 'Pink & Girly 62',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-63',
        url: 'https://i.postimg.cc/0jXYbDQK/158.png',
        title: 'Pink & Girly 63',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-64',
        url: 'https://i.postimg.cc/jqMQg0Xq/159.png',
        title: 'Pink & Girly 64',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-65',
        url: 'https://i.postimg.cc/3rszwvsD/16.png',
        title: 'Pink & Girly 65',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-66',
        url: 'https://i.postimg.cc/vHD7Cqqr/160.png',
        title: 'Pink & Girly 66',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-67',
        url: 'https://i.postimg.cc/GhNPRFVZ/161.png',
        title: 'Pink & Girly 67',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-68',
        url: 'https://i.postimg.cc/FHLyHfQ1/162.png',
        title: 'Pink & Girly 68',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-69',
        url: 'https://i.postimg.cc/0NG77Ljs/163.png',
        title: 'Pink & Girly 69',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-70',
        url: 'https://i.postimg.cc/25N4bzzG/164.png',
        title: 'Pink & Girly 70',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-71',
        url: 'https://i.postimg.cc/SsyCdDYz/165.png',
        title: 'Pink & Girly 71',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-72',
        url: 'https://i.postimg.cc/SRP9y4TW/166.png',
        title: 'Pink & Girly 72',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-73',
        url: 'https://i.postimg.cc/DwkW5Bty/167.png',
        title: 'Pink & Girly 73',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-74',
        url: 'https://i.postimg.cc/wjX1rDp5/168.png',
        title: 'Pink & Girly 74',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
      },
      {
        id: 'pg-75',
        url: 'https://i.postimg.cc/KYm1h4G6/169.png',
        title: 'Pink & Girly 75',
        category: 'Pink & Girly',
        description: 'Pink & Girly aesthetic flatlay'
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
        title: 'Cream Aesthetic 1',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-5',
        url: 'https://i.postimg.cc/9XvFj1c3/102.png',
        title: 'Cream Aesthetic 5',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-6',
        url: 'https://i.postimg.cc/MKVZZRGn/103.png',
        title: 'Cream Aesthetic 6',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-7',
        url: 'https://i.postimg.cc/Jz8rsnyP/104.png',
        title: 'Cream Aesthetic 7',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-8',
        url: 'https://i.postimg.cc/t4zXWjWy/105.png',
        title: 'Cream Aesthetic 8',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-9',
        url: 'https://i.postimg.cc/mr2TS5y9/106.png',
        title: 'Cream Aesthetic 9',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-10',
        url: 'https://i.postimg.cc/zft82Fxc/107.png',
        title: 'Cream Aesthetic 10',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-11',
        url: 'https://i.postimg.cc/PxChgvcr/108.png',
        title: 'Cream Aesthetic 11',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-12',
        url: 'https://i.postimg.cc/RF294V51/109.png',
        title: 'Cream Aesthetic 12',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-13',
        url: 'https://i.postimg.cc/ydkr1mst/11.png',
        title: 'Cream Aesthetic 13',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-14',
        url: 'https://i.postimg.cc/zvWNBZ8s/110.png',
        title: 'Cream Aesthetic 14',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-15',
        url: 'https://i.postimg.cc/h47cMxT2/111.png',
        title: 'Cream Aesthetic 15',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-16',
        url: 'https://i.postimg.cc/zXZ5QBk8/112.png',
        title: 'Cream Aesthetic 16',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-17',
        url: 'https://i.postimg.cc/nLztmQnY/113.png',
        title: 'Cream Aesthetic 17',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-18',
        url: 'https://i.postimg.cc/SN6qbhZ8/114.png',
        title: 'Cream Aesthetic 18',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-19',
        url: 'https://i.postimg.cc/htKnS5wY/115.png',
        title: 'Cream Aesthetic 19',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-20',
        url: 'https://i.postimg.cc/JzKLtQCz/116.png',
        title: 'Cream Aesthetic 20',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-21',
        url: 'https://i.postimg.cc/yNbCyYdq/117.png',
        title: 'Cream Aesthetic 21',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-22',
        url: 'https://i.postimg.cc/mD1fXfzP/118.png',
        title: 'Cream Aesthetic 22',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-23',
        url: 'https://i.postimg.cc/D0VVRjLB/119.png',
        title: 'Cream Aesthetic 23',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-24',
        url: 'https://i.postimg.cc/7hzs7qCN/12.png',
        title: 'Cream Aesthetic 24',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-25',
        url: 'https://i.postimg.cc/L5zdStVR/120.png',
        title: 'Cream Aesthetic 25',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-26',
        url: 'https://i.postimg.cc/Dfs31h3D/121.png',
        title: 'Cream Aesthetic 26',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-27',
        url: 'https://i.postimg.cc/65XJ0P9Q/122.png',
        title: 'Cream Aesthetic 27',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-28',
        url: 'https://i.postimg.cc/dtjMS91j/123.png',
        title: 'Cream Aesthetic 28',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-29',
        url: 'https://i.postimg.cc/DwfVVb4k/124.png',
        title: 'Cream Aesthetic 29',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-30',
        url: 'https://i.postimg.cc/FHTMhs0f/125.png',
        title: 'Cream Aesthetic 30',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-31',
        url: 'https://i.postimg.cc/s28bZ66s/126.png',
        title: 'Cream Aesthetic 31',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-32',
        url: 'https://i.postimg.cc/cJ6VCycF/127.png',
        title: 'Cream Aesthetic 32',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-33',
        url: 'https://i.postimg.cc/Pxw9bW9Z/128.png',
        title: 'Cream Aesthetic 33',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-34',
        url: 'https://i.postimg.cc/L5F7xqFW/129.png',
        title: 'Cream Aesthetic 34',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-35',
        url: 'https://i.postimg.cc/L6d0Sg7Q/13.png',
        title: 'Cream Aesthetic 35',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-36',
        url: 'https://i.postimg.cc/Bb5zkqqn/130.png',
        title: 'Cream Aesthetic 36',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      },
      {
        id: 'ca-37',
        url: 'https://i.postimg.cc/mZ7KtSQW/131.png',
        title: 'Cream Aesthetic 37',
        category: 'Cream Aesthetic',
        description: 'Cream Aesthetic flatlay'
      }
    ]
  }
];

export default function FlatlayLibrary() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedCollection, setSelectedCollection] = useState<FlatlayCollection>(flatlayCollections[0]);
  const [fullSizeImage, setFullSizeImage] = useState<string | null>(null);
  const [favoriteImages, setFavoriteImages] = useState<Set<string>>(new Set());

  // Fetch user subscription to check plan
  const { data: subscription } = useQuery({
    queryKey: ['/api/subscription'],
    enabled: isAuthenticated
  });

  const isPremiumUser = subscription?.plan === 'sselfie-studio' || user?.plan === 'admin' || user?.email === 'ssa@ssasocial.com';

  // Save flatlay to gallery
  const saveToGallery = useCallback(async (imageUrl: string, imageTitle: string) => {
    try {
      const response = await fetch('/api/save-selected-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-black mb-4">Please Log In</h1>
          <p className="text-gray-600">You need to be logged in to access the flatlay library.</p>
        </div>
      </div>
    );
  }



  if (!isPremiumUser) {
    return (
      <div className="min-h-screen bg-white">
        <MemberNavigation />
        
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <h1 className="text-2xl font-serif text-black mb-4">Premium Feature</h1>
              <p className="text-gray-600 mb-6">
                Flatlay collections are available for SSELFIE Studio subscribers. 
                Upgrade to access 900+ professional styled flatlays.
              </p>
            </div>
            
            <div className="space-y-4">
              <a
                href="/pricing"
                className="block w-full bg-black text-white py-3 px-6 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
              >
                Upgrade to Studio - $47/month
              </a>
              <a
                href="/workspace"
                className="block w-full border border-gray-300 text-black py-3 px-6 text-sm uppercase tracking-wider hover:bg-gray-50 transition-colors"
              >
                Back to Workspace
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      {/* Hero Section */}
      <HeroFullBleed
        title="Flatlay Library"
        subtitle="Professional styled flatlays to elevate your brand"
        backgroundImage={SandraImages.flatlays.workspace1}
        textPosition="center"
      />

      {/* Collection Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-light text-black mb-6">
            Curated Collections
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Professional flatlay photography collections designed to complement your AI portraits.
            Each collection captures a distinct aesthetic to match your brand vision.
          </p>
        </div>

        {/* Collection Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {flatlayCollections.map((collection) => (
            <div
              key={collection.id}
              onClick={() => setSelectedCollection(collection)}
              className={`cursor-pointer group transition-all duration-300 ${
                selectedCollection.id === collection.id
                  ? 'ring-2 ring-black'
                  : 'hover:ring-1 hover:ring-gray-300'
              }`}
            >
              <div className="aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={collection.backgroundImage}
                  alt={collection.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 bg-white">
                <h3 className="font-serif text-xl text-black mb-2">{collection.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{collection.description}</p>
                <p className="text-xs text-gray-500 italic">{collection.aesthetic}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Collection Images */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-serif font-light text-black mb-3">
              {selectedCollection.name}
            </h3>
            <p className="text-gray-600">{selectedCollection.description}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {selectedCollection.images.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square bg-gray-100 overflow-hidden cursor-pointer"
                onClick={() => setFullSizeImage(image.url)}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end p-4">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        saveToGallery(image.url, image.title);
                      }}
                      className="bg-white text-black px-3 py-1 text-xs font-medium hover:bg-gray-100 transition-colors"
                    >
                      Save to Gallery
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collection Stats */}
        <div className="text-center py-8 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            {selectedCollection.images.length} professional flatlays in {selectedCollection.name} collection
          </p>
        </div>
      </div>

      {/* Full Size Image Modal */}
      {fullSizeImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setFullSizeImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={fullSizeImage}
              alt="Full size flatlay"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              onClick={() => setFullSizeImage(null)}
              className="absolute top-4 right-4 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}