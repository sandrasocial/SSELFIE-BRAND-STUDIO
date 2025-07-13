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
        title: 'Editorial Workspace',
        category: 'Editorial Magazine',
        description: 'Dark moody editorial flatlay'
      },
      {
        id: 'em-2',
        url: 'https://i.postimg.cc/xjR7Y1vK/10.png',
        title: 'Magazine Style',
        category: 'Editorial Magazine',
        description: 'Magazine-worthy editorial moment'
      },
      {
        id: 'em-3',
        url: 'https://i.postimg.cc/hPtYGRsN/11.png',
        title: 'Creative Process',
        category: 'Editorial Magazine',
        description: 'Dark sophisticated planning setup'
      },
      {
        id: 'em-4',
        url: 'https://i.postimg.cc/qMD5hDZq/12.png',
        title: 'Editorial Planning',
        category: 'Editorial Magazine',
        description: 'Magazine editorial aesthetic'
      },
      {
        id: 'em-5',
        url: 'https://i.postimg.cc/bwGFQ0KT/13.png',
        title: 'Dark Mood',
        category: 'Editorial Magazine',
        description: 'Moody editorial flatlay'
      },
      {
        id: 'em-6',
        url: 'https://i.postimg.cc/8zqXwJGV/14.png',
        title: 'Magazine Layout',
        category: 'Editorial Magazine',
        description: 'Professional editorial setup'
      },
      {
        id: 'em-7',
        url: 'https://i.postimg.cc/s276LjfG/15.png',
        title: 'Fashion Editorial',
        category: 'Editorial Magazine',
        description: 'Fashion magazine aesthetic'
      },
      {
        id: 'em-8',
        url: 'https://i.postimg.cc/tTbSQK7S/16.png',
        title: 'Editorial Coffee',
        category: 'Editorial Magazine',
        description: 'Coffee shop editorial vibe'
      },
      {
        id: 'em-9',
        url: 'https://i.postimg.cc/63hH9Mv9/17.png',
        title: 'Magazine Spread',
        category: 'Editorial Magazine',
        description: 'Magazine spread layout'
      },
      {
        id: 'em-10',
        url: 'https://i.postimg.cc/j2dMCyHy/18.png',
        title: 'Dark Editorial',
        category: 'Editorial Magazine',
        description: 'Dark moody editorial style'
      },
      {
        id: 'em-11',
        url: 'https://i.postimg.cc/WzWXZt8C/19.png',
        title: 'Editorial Styling',
        category: 'Editorial Magazine',
        description: 'Professional editorial styling'
      },
      {
        id: 'em-12',
        url: 'https://i.postimg.cc/K8VwVpnw/2.png',
        title: 'Magazine Aesthetic',
        category: 'Editorial Magazine',
        description: 'Clean magazine aesthetic'
      },
      {
        id: 'em-13',
        url: 'https://i.postimg.cc/xjtshFQ5/20.png',
        title: 'Editorial Mood',
        category: 'Editorial Magazine',
        description: 'Sophisticated editorial mood'
      },
      {
        id: 'em-14',
        url: 'https://i.postimg.cc/7YRKYGfT/21.png',
        title: 'Fashion Magazine',
        category: 'Editorial Magazine',
        description: 'Fashion magazine style'
      },
      {
        id: 'em-15',
        url: 'https://i.postimg.cc/Dy0CTdyT/22.png',
        title: 'Editorial Layout',
        category: 'Editorial Magazine',
        description: 'Professional editorial layout'
      },
      {
        id: 'em-16',
        url: 'https://i.postimg.cc/qvCjtJ3D/23.png',
        title: 'Magazine Setup',
        category: 'Editorial Magazine',
        description: 'Magazine-worthy setup'
      },
      {
        id: 'em-17',
        url: 'https://i.postimg.cc/bvcLk70y/24.png',
        title: 'Editorial Style',
        category: 'Editorial Magazine',
        description: 'Editorial magazine style'
      },
      {
        id: 'em-18',
        url: 'https://i.postimg.cc/zfC7jxpn/25.png',
        title: 'Dark Magazine',
        category: 'Editorial Magazine',
        description: 'Dark magazine aesthetic'
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
        title: 'Parisian Cafe',
        category: 'European Luxury',
        description: 'Effortless European luxury lifestyle'
      },
      {
        id: 'el-2',
        url: 'https://i.postimg.cc/RhFLzNxL/file-10.png',
        title: 'Designer Planning',
        category: 'European Luxury',
        description: 'Luxury European aesthetic'
      },
      {
        id: 'el-3',
        url: 'https://i.postimg.cc/SQ7BS5FX/file-11.png',
        title: 'European Workspace',
        category: 'European Luxury',
        description: 'Sophisticated European lifestyle'
      },
      {
        id: 'el-4',
        url: 'https://i.postimg.cc/wTqS7Vgw/file-12.png',
        title: 'Luxury Accessories',
        category: 'European Luxury',
        description: 'Designer European accessories'
      },
      {
        id: 'el-5',
        url: 'https://i.postimg.cc/pLXRMvmX/file-13.png',
        title: 'Chic European',
        category: 'European Luxury',
        description: 'Effortless European chic'
      },
      {
        id: 'el-6',
        url: 'https://i.postimg.cc/W3V5xN45/file-14.png',
        title: 'Parisian Style',
        category: 'European Luxury',
        description: 'Parisian luxury style'
      },
      {
        id: 'el-7',
        url: 'https://i.postimg.cc/rw6xfhsJ/file-15.png',
        title: 'European Elegance',
        category: 'European Luxury',
        description: 'European elegant lifestyle'
      },
      {
        id: 'el-8',
        url: 'https://i.postimg.cc/cJBRgQsc/file-16.png',
        title: 'Designer Bags',
        category: 'European Luxury',
        description: 'European designer accessories'
      },
      {
        id: 'el-9',
        url: 'https://i.postimg.cc/pTVDDprM/file-17.png',
        title: 'Luxury Lifestyle',
        category: 'European Luxury',
        description: 'European luxury living'
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