// Test file for import fixes
import { storage } from '../server/storage.js';
import type { Thing } from './types.js';
import type { ExternalConfig } from '@vercel/node';

// Dynamic import example
const helper = await import('./test-helper.js');