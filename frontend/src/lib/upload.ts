import { UploadedMedia } from './graphql/operations';
import { UPLOAD_URL } from './config';

export async function uploadImageToServer(
  file: File,
  folder: string,
  accessToken: string
): Promise<UploadedMedia> {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);

  const res = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
    body: form,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error ?? 'Upload failed. Please try again.');
  }

  const media = json.media;
  return { id: media._id ?? media.id, url: media.url, publicId: media.publicId };
}

/** Upload with a real progress callback (uses XHR for `upload.onprogress`). */
export function uploadImageWithProgress(
  file: File,
  folder: string,
  accessToken: string,
  onProgress: (percent: number) => void
): Promise<UploadedMedia> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    form.append('folder', folder);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', UPLOAD_URL);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && json.media) {
          resolve({
            id: json.media._id ?? json.media.id,
            url: json.media.url,
            publicId: json.media.publicId,
          });
        } else {
          reject(new Error(json?.error ?? 'Upload failed. Please try again.'));
        }
      } catch {
        reject(new Error('Upload failed. Please try again.'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload.'));
    xhr.send(form);
  });
}
