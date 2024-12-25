import { useState } from 'react';
import { Upload } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface ExcelUploaderProps {
  onFileUpload: (data: any[]) => void;
  validateData: (data: any[]) => { isValid: boolean; errors?: string[] };
  acceptedFileTypes?: string[];
}

const ExcelUploader = ({ 
  onFileUpload, 
  validateData,
  acceptedFileTypes = ['.xlsx', '.xls']
}: ExcelUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
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

    try {
      // Here you would typically use a library like xlsx to parse the Excel file
      // For now, we'll just simulate the parsing
      const mockData = [
        { id: 1, data: "Sample data" }
      ];

      const validation = validateData(mockData);
      if (!validation.isValid) {
        toast({
          variant: "destructive",
          title: "Invalid data format",
          description: validation.errors?.join('\n')
        });
        return;
      }

      onFileUpload(mockData);
      toast({
        title: "Success",
        description: "File uploaded successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process the file. Please try again."
      });
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        Drag and drop your Excel file here, or
      </p>
      <div className="mt-4">
        <Button
          variant="outline"
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          Select File
        </Button>
        <input
          id="fileInput"
          type="file"
          className="hidden"
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileChange}
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Supported formats: {acceptedFileTypes.join(', ')}
      </p>
    </div>
  );
};

export default ExcelUploader;