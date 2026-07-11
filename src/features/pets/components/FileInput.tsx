import { useRef, useState, useCallback } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface FileInputProps {
  label?: string;
  error?: string;
  accept?: string;
  maxSize?: number;
  value?: File | null;
  onChange?: (file: File | null) => void;
  previewUrl?: string;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

export function FileInput({
  label,
  error,
  accept = ACCEPTED_TYPES.join(','),
  maxSize = DEFAULT_MAX_SIZE,
  value: _value,
  onChange,
  previewUrl: externalPreviewUrl,
}: FileInputProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(externalPreviewUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Tipo de archivo no válido. Solo se permiten JPEG, PNG, GIF y WebP.';
    }
    if (file.size > maxSize) {
      return `El archivo excede el tamaño máximo de ${Math.round(maxSize / 1024 / 1024)}MB.`;
    }
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        alert(validationError);
        return;
      }
      setPreviewUrl(URL.createObjectURL(file));
      onChange?.(file);
    },
    [onChange, maxSize]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/30',
          error && 'border-destructive'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative w-full">
            <img
              src={previewUrl}
              alt="Preview"
              className="mx-auto max-h-48 rounded-md object-contain"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="rounded-full bg-muted p-3">
              <ImageIcon size={24} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                Arrastra una foto aquí o haz click para seleccionar
              </p>
              <p className="mt-1 text-xs">
                JPEG, PNG, GIF, WebP (max. 5MB)
              </p>
            </div>
            <Upload size={16} />
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
