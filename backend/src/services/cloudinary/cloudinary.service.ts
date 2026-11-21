import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { isCloudinaryConfigured } from './cloudinary.config';
import { ResourceType } from '../../models';

export interface UploadOptions {
  folder: string;
  publicId?: string;
}

export interface UploadResult {
  url: string;
  publicId: string;
  resourceType: ResourceType;
  width?: number;
  height?: number;
}

const CONFIGURATION_ERROR =
  'Cloudinary is not configured on the server. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.';

export function uploadImage(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
  if (!isCloudinaryConfigured()) {
    return Promise.reject(new Error(CONFIGURATION_ERROR));
  }

  return new Promise<UploadResult>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed.'));
          return;
        }
        const res = result as UploadApiResponse;
        resolve({
          url: res.secure_url,
          publicId: res.public_id,
          resourceType: 'image',
          width: res.width,
          height: res.height,
        });
      }
    );
    stream.end(buffer);
  });
}

export function destroyMedia(publicId: string, resourceType: ResourceType = 'image'): Promise<void> {
  if (!isCloudinaryConfigured()) {
    return Promise.reject(new Error(CONFIGURATION_ERROR));
  }
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType }).then(() => undefined);
}
