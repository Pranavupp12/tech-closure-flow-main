
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { StoredDocument, downloadDocument, getDocumentsByIds } from "@/lib/documentStorage";
import { formatDate, getUserById } from "@/lib/utils";

interface DocumentsListProps {
  documentIds: string[];
  title: string;
  showUploader?: boolean;
}

const DocumentsList: React.FC<DocumentsListProps> = ({ 
  documentIds, 
  title,
  showUploader = false 
}) => {
  const documents = getDocumentsByIds(documentIds);

  const handleDownload = (document: StoredDocument) => {
    try {
      downloadDocument(document);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  if (documents.length === 0 && !showUploader) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-500 mb-2">{title}</h4>
      <div className="space-y-2">
        {documents.map((document) => {
          const uploader = getUserById(document.uploadedBy);
          return (
            <div key={document.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <h4 className="font-medium">{document.name}</h4>
                  <p className="text-sm text-gray-500">
                    Uploaded by {uploader?.name} on {formatDate(document.uploadedAt)} • {(document.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => handleDownload(document)}
              >
                <Download size={16} />
                Download
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentsList;
