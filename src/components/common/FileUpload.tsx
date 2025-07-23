
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Upload } from "lucide-react";
import { StoredDocument, fileToBase64, generateDocumentId } from "@/lib/documentStorage";
import { useAuth } from "@/contexts/AuthContext";

interface FileUploadProps {
  label: string;
  multiple?: boolean;
  onFilesChange: (documents: StoredDocument[]) => void;
  existingFiles?: StoredDocument[];
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  label, 
  multiple = false, 
  onFilesChange,
  existingFiles = []
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<StoredDocument[]>(existingFiles);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setIsUploading(true);
    const newDocuments: StoredDocument[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const base64Data = await fileToBase64(file);
        const document: StoredDocument = {
          id: generateDocumentId(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64Data,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user.id,
        };
        newDocuments.push(document);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    const updatedFiles = [...uploadedFiles, ...newDocuments];
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);
    setIsUploading(false);
    
    // Clear the input
    event.target.value = '';
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(file => file.id !== fileId);
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="file"
          multiple={multiple}
          onChange={handleFileUpload}
          disabled={isUploading}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          className="flex items-center gap-1"
        >
          <Upload size={16} />
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
      
      {uploadedFiles.length > 0 && (
        <div className="space-y-2 mt-3">
          <Label className="text-sm text-gray-600">Uploaded Files:</Label>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex-1">
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(file.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
