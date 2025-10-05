"use strict";
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
exports.serverlessQuery = exports.db = void 0;
/// <reference path="types/global.d.ts" />
const neon_http_1 = require("drizzle-orm/neon-http");
const serverless_1 = require("@neondatabase/serverless");
const env_js_1 = require("./env.js");
const schema = __importStar(require("../shared/schema.js"));
// Use HTTP-based connection for drizzle operations (optimal for serverless)
const sql = (0, serverless_1.neon)(env_js_1.DATABASE_URL, {
    fetchOptions: {
        priority: 'high' // Prioritize database requests
    }
});
exports.db = (0, neon_http_1.drizzle)(sql, { schema });
// Export a serverless-optimized query helper
const serverlessQuery = async (text, params) => {
    try {
        // Validate input
        if (!text?.trim()) {
            throw new Error('Query text is required');
        }
        // Execute query with proper type handling
        const result = params?.length
            ? await sql.query(text, params)
            : await sql `${sql.unsafe(text)}`;
        // Ensure result structure - convert array results to QueryResult format
        if (Array.isArray(result)) {
            return {
                rows: result,
                command: 'SELECT',
                rowCount: result.length,
                oid: 0,
                fields: []
            };
        }
        // Cast to proper type if already in correct format
        const queryResult = result;
        return {
            rows: queryResult.rows || [],
            command: queryResult.command || 'SELECT',
            rowCount: queryResult.rowCount || 0,
            oid: queryResult.oid || 0,
            fields: queryResult.fields || []
        };
    }
    catch (error) {
        console.error('❌ Serverless query error:', error instanceof Error ? error.message : 'Unknown error');
        throw error instanceof Error ? error : new Error('Query execution failed');
    }
};
exports.serverlessQuery = serverlessQuery;
