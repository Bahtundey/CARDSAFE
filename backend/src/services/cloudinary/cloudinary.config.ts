import { v2 as cloudinary } from 'cloudinary';
import { env } from '../../config/env';

/**
 * Configures the Cloudinary SDK from environment variables. All API secrets stay
 * on the server and are never exposed to the browser.
 */
export function configureCloudinary(): boolean {
  if (!env.cloudinary.configured) {
    console.warn(
      '[cloudinary] Not configured — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to enable uploads.'
    );
    return false;
  }

  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });

  console.log('[cloudinary] Configured for cloud:', env.cloudinary.cloudName);
  return true;
}

export function isCloudinaryConfigured(): boolean {
  return env.cloudinary.configured;
}
