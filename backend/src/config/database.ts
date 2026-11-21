import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env';

function configureDns(): void {
  if (env.dnsServers.length === 0) return;
  dns.setServers(env.dnsServers);
  console.log('[database] Using custom DNS servers:', env.dnsServers.join(', '));
}

export async function connectDatabase(): Promise<void> {
  configureDns();
  mongoose.set('strictQuery', true);

  mongoose.connection.on('error', (err) => {
    console.error('[database] MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[database] MongoDB disconnected');
  });

  mongoose.connection.on('connected', () => {
    console.log('[database] MongoDB connected');
  });

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
  } catch (err) {
    console.error('[database] Failed to connect to MongoDB:', err);
    throw err;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
