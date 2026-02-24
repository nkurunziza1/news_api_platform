import { cloudinary } from '../config/cloudinary';
import { logger } from '../config/logger';

export async function uploadImage(
  buffer: Buffer,
  folder: string,
  publicId?: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const opts: { folder: string; resource_type: 'image'; public_id?: string } = {
      folder,
      resource_type: 'image',
    };
    if (publicId) opts.public_id = publicId;
    const uploadStream = cloudinary.uploader.upload_stream(
      opts,
      (err, result) => {
        if (err) {
          logger.error('Cloudinary upload failed', err);
          reject(err);
          return;
        }
        if (!result?.secure_url) {
          reject(new Error('Upload failed'));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    logger.warn('Cloudinary delete failed', { publicId, e });
  }
}
