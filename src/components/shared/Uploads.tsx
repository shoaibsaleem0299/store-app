import { useState, useRef } from 'react';
import { storageService } from '@/services/storage.service';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UploadsProps {
  onUploadSuccess: (url: string) => void;
  bucket?: string;
  className?: string;
  compact?: boolean;
}

export function Uploads({ onUploadSuccess, bucket = 'uploads', className = "", compact = false }: UploadsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await storageService.uploadImage(file, bucket);
      onUploadSuccess(url);
      toast.success("File uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (compact) {
    return (
      <div 
        className={`cursor-pointer inline-flex items-center gap-1 text-[10px] text-primary hover:underline ${isUploading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
        {isUploading ? 'Uploading...' : 'Upload'}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          disabled={isUploading}
          className="hidden"
          accept="image/*"
        />
      </div>
    );
  }

  return (
    <div 
      className={`border border-dashed border-border rounded-md flex flex-col items-center justify-center hover:bg-secondary/50 transition-colors cursor-pointer text-muted-foreground ${isUploading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`} 
      onClick={() => !isUploading && fileInputRef.current?.click()}
    >
      {isUploading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-primary mt-1" />
          <span className="text-[9px] mt-1">Uploading...</span>
        </>
      ) : (
        <>
          <Upload className="w-4 h-4 mt-1" />
          <span className="text-[9px] mt-1 text-center px-1">Upload</span>
        </>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        disabled={isUploading}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
}
