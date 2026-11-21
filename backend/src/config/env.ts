import dotenv from 'dotenv';
import path from 'path';

// Load variables from the backend/.env file regardless of the process cwd.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function get(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

function required(name: string): string {
  const value = get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export interface Env {
  nodeEnv: string;
  cookieSecure: boolean;
  port: number;
  corsOrigins: string[];
  mongoUri: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  dnsServers: string[];
  ecodeEncryptionKey: string;
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    configured: boolean;
  };
  seed: {
    adminName: string;
    adminEmail: string;
    adminPassword: string;
  };
}

const cloudName = get('CLOUDINARY_CLOUD_NAME');
const apiKey = get('CLOUDINARY_API_KEY');
const apiSecret = get('CLOUDINARY_API_SECRET');

export const env: Env = {
  nodeEnv: get('NODE_ENV', 'development'),
  // Cookie security must not be inferred from NODE_ENV (not reliably set to
  // 'production' on every host). Defaults to secure so production is safe out
  // of the box; local dev sets COOKIE_SECURE=false.
  cookieSecure: get('COOKIE_SECURE', 'true') === 'true',
  port: parseInt(get('PORT', '4000'), 10),
  corsOrigins: get('CORS_ORIGIN', 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  mongoUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  accessTokenExpiry: get('ACCESS_TOKEN_EXPIRY', '15m'),
  refreshTokenExpiry: get('REFRESH_TOKEN_EXPIRY', '7d'),
  dnsServers: get('DNS_SERVERS')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  ecodeEncryptionKey: get('ECODE_ENCRYPTION_KEY'),
  cloudinary: {
    cloudName,
    apiKey,
    apiSecret,
    configured: Boolean(cloudName && apiKey && apiSecret),
  },
  seed: {
    adminName: get('SEED_ADMIN_NAME'),
    adminEmail: get('SEED_ADMIN_EMAIL'),
    adminPassword: get('SEED_ADMIN_PASSWORD'),
  },
};
