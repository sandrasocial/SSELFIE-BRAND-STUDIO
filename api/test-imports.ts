// Test file for import fixes
import { getUser } from '../server/storage.js';
import type { Thing } from './types.js';
import { ExternalConfig } from '@external/package';

// Dynamic import example
const helper = await import('../utils/helper.js');