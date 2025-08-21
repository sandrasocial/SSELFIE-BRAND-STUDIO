import fs from 'fs';
import path from 'path';

export const sslConfig = {
    production: {
        key: process.env.SSL_KEY_PATH ? 
            fs.readFileSync(process.env.SSL_KEY_PATH) : undefined,
        cert: process.env.SSL_CERT_PATH ? 
            fs.readFileSync(process.env.SSL_CERT_PATH) : undefined,
        ca: process.env.SSL_CA_PATH ? 
            fs.readFileSync(process.env.SSL_CA_PATH) : undefined,
    },
    development: {
        key: undefined,
        cert: undefined,
        ca: undefined
    }
};