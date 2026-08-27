import React, { useRef, useState } from 'react';
import {
  ImagePlus,
  Loader2,
  Trash2,
  Star,
  X,
  Upload,
} from 'lucide-react';
import {
  uploadImageToCloudinary,
  CloudinaryImage,
} from '../../services/cloudinary';

interface ProductImageUploaderProps {
  images: CloudinaryImage[];
  onChange: (images: CloudinaryImage[]) => void;
  maxImages?: number;
}

interface LocalPreview {
  file: File;
  preview: string;
}

export const ProductImageUploader: React.FC<
  ProductImageUploaderProps
> = ({
  images,
  onChange,
  maxImages = 6,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [previews, setPreviews] = useState<
    LocalPreview[]
  >([]);

  const [uploading, setUploading] =
    useState(false);

  const [progress, setProgress] = useState(0);

  const [error, setError] = useState('');

  const selectFiles = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    setError('');

    const remaining =
      maxImages - images.length - previews.length;

    if (files.length > remaining) {
      setError(
        `Vous pouvez ajouter maximum ${remaining} photo${
          remaining > 1 ? 's' : ''
        }.`
      );

      return;
    }

    const accepted = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
    ];

    const newPreviews: LocalPreview[] = [];

    files.forEach((file) => {
      if (!accepted.includes(file.type)) {
        setError(
          `${file.name} : format non supporté.`
        );
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError(
          `${file.name} dépasse 10 MB.`
        );
        return;
      }

      newPreviews.push({
        file,
        preview: URL.createObjectURL(file),
      });
    });

    setPreviews((current) => [
      ...current,
      ...newPreviews,
    ]);

    event.target.value = '';
  };

  const uploadSelectedImages = async () => {
    if (!previews.length) return;

    setUploading(true);
    setError('');
    setProgress(0);

    const uploaded: CloudinaryImage[] = [];

    try {
      for (let i = 0; i < previews.length; i++) {
        const item = previews[i];

        const image =
          await uploadImageToCloudinary(
            item.file,
            (fileProgress) => {
              const totalProgress =
                ((i + fileProgress / 100) /
                  previews.length) *
                100;

              setProgress(
                Math.round(totalProgress)
              );
            }
          );

        uploaded.push(image);
      }

      onChange([
        ...images,
        ...uploaded,
      ]);

      previews.forEach((item) => {
        URL.revokeObjectURL(item.preview);
      });

      setPreviews([]);
      setProgress(100);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Erreur pendant l'upload."
      );
    } finally {
      setUploading(false);
    }
  };

  const removeExistingImage = (
    index: number
  ) => {
    const updated = [...images];

    updated.splice(index, 1);

    onChange(updated);
  };

  const removePreview = (index: number) => {
    const item = previews[index];

    URL.revokeObjectURL(item.preview);

    setPreviews((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const moveImage = (
    index: number,
    direction: 'left' | 'right'
  ) => {
    const target =
      direction === 'left'
        ? index - 1
        : index + 1;

    if (
      target < 0 ||
      target >= images.length
    ) {
      return;
    }

    const updated = [...images];

    [
      updated[index],
      updated[target],
    ] = [
      updated[target],
      updated[index],
    ];

    onChange(updated);
  };

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex items-end justify-between">
        <div>
          <h3 className="font-display text-sm uppercase text-white">
            Photos du produit
          </h3>

          <p className="mt-1 text-[10px] font-mono-brand text-neutral-500">
            {images.length}/{maxImages} photos
          </p>
        </div>

       
      </div>

      {/* EXISTING IMAGES */}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

          {images.map((image, index) => (
            <div
              key={`${image.publicId}-${index}`}
              className="group relative aspect-[4/5] overflow-hidden border border-neutral-800 bg-black"
            >
              <img loading="lazy"                src={image.url}
                alt={`Produit ${index + 1}`}
                className="h-full w-full object-cover"
              />

              {/* MAIN IMAGE */}

              {index === 0 && (
                <div className="absolute left-2 top-2 flex items-center gap-1 bg-white px-2 py-1 text-[8px] font-bold uppercase text-black">
                  <Star className="h-3 w-3 fill-current" />
                  Principale
                </div>
              )}

              {/* REMOVE */}

              <button
                type="button"
                onClick={() =>
                  removeExistingImage(index)
                }
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-black/80 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              {/* ORDER */}

              <div className="absolute bottom-2 left-2 flex gap-1">

                {index > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      moveImage(index, 'left')
                    }
                    className="h-7 w-7 bg-black/80 text-white"
                  >
                    ←
                  </button>
                )}

                {index <
                  images.length - 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      moveImage(index, 'right')
                    }
                    className="h-7 w-7 bg-black/80 text-white"
                  >
                    →
                  </button>
                )}

              </div>
            </div>
          ))}

        </div>
      )}

      {/* LOCAL PREVIEWS */}

      {previews.length > 0 && (
        <div className="space-y-3">

          <span className="text-[9px] font-mono-brand uppercase tracking-widest text-amber-400">
            Photos sélectionnées
          </span>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

            {previews.map((item, index) => (
              <div
                key={item.preview}
                className="relative aspect-[4/5] overflow-hidden border border-amber-500/30"
              >
                <img loading="lazy"                  src={item.preview}
                  alt={item.file.name}
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() =>
                    removePreview(index)
                  }
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center bg-black/80 text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

          </div>

          {/* UPLOAD */}

          <button
            type="button"
            onClick={uploadSelectedImages}
            disabled={uploading}
            className="flex w-full items-center justify-center gap-3 bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Upload {progress}%
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Envoyer 
              </>
            )}
          </button>

        </div>
      )}

      {/* ADD PHOTO */}

      {images.length +
        previews.length <
        maxImages && (
        <button
          type="button"
          onClick={() =>
            inputRef.current?.click()
          }
          className="group flex min-h-36 w-full flex-col items-center justify-center border border-dashed border-neutral-700 bg-[#0D0D0D] hover:border-white"
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-neutral-700 group-hover:border-white">
            <ImagePlus className="h-5 w-5 text-neutral-500 group-hover:text-white" />
          </div>

          <span className="font-mono-brand text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 group-hover:text-white">
            Ajouter une photo
          </span>

          <span className="mt-2 text-[9px] font-mono-brand text-neutral-600">
            JPG · PNG · WEBP · AVIF
          </span>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={selectFiles}
            className="hidden"
          />
        </button>
      )}

      {/* ERROR */}

      {error && (
        <div className="border border-red-500/20 bg-red-500/5 p-3">
          <p className="text-[10px] font-mono-brand text-red-400">
            {error}
          </p>
        </div>
      )}

    </div>
  );
};