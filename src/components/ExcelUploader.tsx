import { useState } from 'react';
import { Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface ExcelUploaderProps {
  onFileUpload: (file: File) => Promise<void>;
  acceptedFileTypes?: string[];
}

const MAX_FILE_SIZE_MB = 5;

const ExcelUploader = ({
  onFileUpload,
  acceptedFileTypes = ['.xlsx', '.xls']
}: ExcelUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    await processFile(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
    // Allow re-selecting the same file
    e.target.value = '';
  };

  const processFile = async (file: File) => {
    if (!file) return;

    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!acceptedFileTypes.includes(fileExtension)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: `Please upload a file with one of these extensions: ${acceptedFileTypes.join(', ')}`
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: `Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`
      });
      return;
    }

    setProcessing(true);
    try {
      await onFileUpload(file);
      toast({
        title: "Success",
        description: "File processed successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process the file. Please try again."
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center ${
        isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="region"
      aria-label="Excel file upload area"
    >
      <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" aria-hidden="true" />
      <p className="mt-3 text-sm text-gray-600">
        Tap below to upload your Excel file
      </p>
      <div className="mt-4">
        <Button
          variant="outline"
          onClick={() => document.getElementById('fileInput')?.click()}
          disabled={processing}
          className="min-h-[48px] px-6"
        >
          {processing ? 'Processing...' : 'Select File'}
        </Button>
        <input
          id="fileInput"
          type="file"
          className="hidden"
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileChange}
          aria-label="Excel file input"
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Supported formats: {acceptedFileTypes.join(', ')} (max {MAX_FILE_SIZE_MB}MB)
      </p>
    </div>
  );
};

export default ExcelUploader;
