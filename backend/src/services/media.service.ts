import { Media, IMedia, IUser } from '../models';
import { Errors } from '../utils/errors';
import { uploadImage, UploadResult } from './cloudinary';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function assertValidImageBuffer(buffer: Buffer): void {
  if (!buffer || buffer.length === 0) {
    throw Errors.badInput('Invalid image data.');
  }
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw Errors.badInput('Image must be under 10 MB.');
  }
}

async function persist(upload: UploadResult, folder: string, user: IUser): Promise<IMedia> {
  return Media.create({
    url: upload.url,
    publicId: upload.publicId,
    resourceType: upload.resourceType,
    width: upload.width ?? null,
    height: upload.height ?? null,
    folder,
    owner: user._id,
  });
}

export async function uploadMediaFromBuffer(
  buffer: Buffer,
  folder: string,
  user: IUser,
  mimeType?: string
): Promise<IMedia> {
  if (mimeType && !ALLOWED_MIME.includes(mimeType)) {
    throw Errors.badInput('Unsupported image type. Allowed: JPEG, PNG, WebP, GIF.');
  }
  assertValidImageBuffer(buffer);

  const upload = await uploadImage(buffer, { folder });
  return persist(upload, folder, user);
}

/**
 * Accepts either a data URL (`data:image/png;base64,...`) or raw base64.
 */
export async function uploadMediaFromBase64(
  base64Image: string,
  folder: string,
  user: IUser
): Promise<IMedia> {
  if (!base64Image) {
    throw Errors.badInput('Image data is required.');
  }

  const match = /^data:([a-zA-Z0-9+/.-]+);base64,(.+)$/s.exec(base64Image);
  let buffer: Buffer;

  if (match) {
    if (!ALLOWED_MIME.includes(match[1])) {
      throw Errors.badInput('Unsupported image type. Allowed: JPEG, PNG, WebP, GIF.');
    }
    buffer = Buffer.from(match[2], 'base64');
  } else {
    buffer = Buffer.from(base64Image, 'base64');
  }

  assertValidImageBuffer(buffer);

  const upload = await uploadImage(buffer, { folder });
  return persist(upload, folder, user);
}
