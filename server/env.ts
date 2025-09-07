import 'dotenv/config';

const req = (k: string) => {
  const v = process.env[k]?.trim().replace(/^['"]+|['"]+$/g, '');
  if (!v) throw new Error(`${k} missing`);
  return v;
};

export const DATABASE_URL = req('DATABASE_URL'); // use pooler endpoint
export const STACK_SECRET_SERVER_KEY = req('STACK_SECRET_SERVER_KEY');