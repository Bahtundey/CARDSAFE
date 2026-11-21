import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { getAuthenticatedUser } from '../middleware/auth';
import { uploadMediaFromBuffer } from '../services/media.service';

const router = Router();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const FOLDER_RE = /^[a-zA-Z0-9_/-]+$/;

/**
 * Authenticated multipart upload. The image is streamed to Cloudinary server-side
 * (secrets never leave the backend), the resulting url/publicId is persisted in
 * MongoDB as a Media document and returned to the client.
 */
router.post('/', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided. Use the "file" field.' });
    }

    if (!ALLOWED_MIME.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Unsupported file type. Allowed: JPEG, PNG, WebP, GIF.' });
    }

    const rawFolder = typeof req.body?.folder === 'string' ? req.body.folder.trim() : '';
    const folder = rawFolder && FOLDER_RE.test(rawFolder) ? rawFolder : 'uploads';

    const media = await uploadMediaFromBuffer(req.file.buffer, folder, user, req.file.mimetype);

    return res.status(201).json({ media });
  } catch (err) {
    next(err);
  }
});

export default router;
