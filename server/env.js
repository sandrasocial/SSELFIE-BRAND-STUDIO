"use strict";
/// <reference path="types/global.d.ts" />
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VEO_GOOGLE_MODEL = exports.VEO3_MODEL = exports.GOOGLE_API_KEY = exports.VEO3_ENABLED = exports.LIVE_SOCKET_ENABLED = exports.ALLOWED_EMBED_HOSTS = exports.TESTING_VITE_STRIPE_PUBLIC_KEY = exports.STRIPE_SECRET_KEY = exports.REPLIT_DEV_DOMAIN = exports.PORT = exports.NODE_ENV = exports.MAKE_API_TOKEN = exports.MANYCHAT_API_TOKEN = exports.META_ACCESS_TOKEN = exports.INSTAGRAM_BUSINESS_ACCOUNT_ID = exports.RESEND_API_KEY = exports.FLODESK_API_KEY = exports.SHANNON_USER_ID = exports.ADMIN_USER_ID = exports.AWS_S3_BUCKET = exports.AWS_REGION = exports.AWS_SECRET_ACCESS_KEY = exports.AWS_ACCESS_KEY_ID = exports.ANTHROPIC_API_KEY = exports.REPLICATE_USERNAME = exports.REPLICATE_API_TOKEN = exports.VITE_STACK_PUBLISHABLE_CLIENT_KEY = exports.STACK_SECRET_SERVER_KEY = exports.DATABASE_URL = void 0;
const dotenv = __importStar(require("dotenv"));
// Only load .env.server in non-production environments
if (process.env['NODE_ENV'] !== 'production') {
    dotenv.config({ path: '.env.server' });
}
exports.DATABASE_URL = process.env['DATABASE_URL'];
console.log('DEBUG: DATABASE_URL at startup:', exports.DATABASE_URL);
exports.STACK_SECRET_SERVER_KEY = process.env['STACK_SECRET_SERVER_KEY'];
exports.VITE_STACK_PUBLISHABLE_CLIENT_KEY = process.env['VITE_STACK_PUBLISHABLE_CLIENT_KEY'];
exports.REPLICATE_API_TOKEN = process.env['REPLICATE_API_TOKEN'];
exports.REPLICATE_USERNAME = process.env['REPLICATE_USERNAME'];
exports.ANTHROPIC_API_KEY = process.env['ANTHROPIC_API_KEY'];
exports.AWS_ACCESS_KEY_ID = process.env['AWS_ACCESS_KEY_ID'];
exports.AWS_SECRET_ACCESS_KEY = process.env['AWS_SECRET_ACCESS_KEY'];
exports.AWS_REGION = process.env['AWS_REGION'];
exports.AWS_S3_BUCKET = process.env['AWS_S3_BUCKET'];
exports.ADMIN_USER_ID = process.env['ADMIN_USER_ID'];
exports.SHANNON_USER_ID = process.env['SHANNON_USER_ID'];
exports.FLODESK_API_KEY = process.env['FLODESK_API_KEY'];
exports.RESEND_API_KEY = process.env['RESEND_API_KEY'];
exports.INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env['INSTAGRAM_BUSINESS_ACCOUNT_ID'];
exports.META_ACCESS_TOKEN = process.env['META_ACCESS_TOKEN'];
exports.MANYCHAT_API_TOKEN = process.env['MANYCHAT_API_TOKEN'];
exports.MAKE_API_TOKEN = process.env['MAKE_API_TOKEN'];
exports.NODE_ENV = process.env['NODE_ENV'];
exports.PORT = process.env['PORT'];
exports.REPLIT_DEV_DOMAIN = process.env['REPLIT_DEV_DOMAIN'];
exports.STRIPE_SECRET_KEY = process.env['STRIPE_SECRET_KEY'];
exports.TESTING_VITE_STRIPE_PUBLIC_KEY = process.env['TESTING_VITE_STRIPE_PUBLIC_KEY'];
exports.ALLOWED_EMBED_HOSTS = process.env['ALLOWED_EMBED_HOSTS'] || 'mentimeter.com,*.mentimeter.com,canva.com,*.canva.com';
exports.LIVE_SOCKET_ENABLED = process.env['LIVE_SOCKET_ENABLED'] === '1';
// VEO 3 Video Generation Configuration
exports.VEO3_ENABLED = process.env['VEO3_ENABLED'];
exports.GOOGLE_API_KEY = process.env['GOOGLE_API_KEY'];
exports.VEO3_MODEL = process.env['VEO3_MODEL'];
exports.VEO_GOOGLE_MODEL = process.env['VEO_GOOGLE_MODEL']; // Legacy compatibility
