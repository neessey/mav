export interface CloudinaryImage {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
}

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadImageToCloudinary(
  file: File,
  onProgress?: (progress: number) => void
): Promise<CloudinaryImage> {
  if (!CLOUD_NAME) {
    throw new Error(
      'VITE_CLOUDINARY_CLOUD_NAME est manquant.'
    );
  }

  if (!UPLOAD_PRESET) {
    throw new Error(
      'VITE_CLOUDINARY_UPLOAD_PRESET est manquant.'
    );
  }

  const formData = new FormData();

  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
    );

    xhr.upload.addEventListener('progress', (event) => {
      if (!event.lengthComputable) return;

      const progress = Math.round(
        (event.loaded / event.total) * 100
      );

      onProgress?.(progress);
    });

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);

        if (xhr.status < 200 || xhr.status >= 300) {
          reject(
            new Error(
              data?.error?.message ||
                "L'upload Cloudinary a échoué."
            )
          );
          return;
        }

        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
          format: data.format,
        });
      } catch {
        reject(
          new Error(
            'Réponse Cloudinary invalide.'
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(
        new Error(
          'Impossible de contacter Cloudinary.'
        )
      );
    };

    xhr.send(formData);
  });
}