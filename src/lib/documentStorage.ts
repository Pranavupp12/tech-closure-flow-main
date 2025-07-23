
export interface StoredDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64 encoded file data
  uploadedAt: string;
  uploadedBy: string;
}

const STORAGE_KEYS = {
  DOCUMENTS: 'premier_energies_documents',
};

// Document storage functions
export const saveDocuments = (documents: StoredDocument[]): void => {
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
};

export const getDocuments = (): StoredDocument[] => {
  const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
  return data ? JSON.parse(data) : [];
};

export const addDocument = (document: StoredDocument): void => {
  const documents = getDocuments();
  documents.push(document);
  saveDocuments(documents);
};

export const getDocumentById = (documentId: string): StoredDocument | undefined => {
  const documents = getDocuments();
  return documents.find(doc => doc.id === documentId);
};

export const getDocumentsByIds = (documentIds: string[]): StoredDocument[] => {
  const documents = getDocuments();
  return documents.filter(doc => documentIds.includes(doc.id));
};

// File handling utilities
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data URL prefix
    };
    reader.onerror = error => reject(error);
  });
};

export const downloadDocument = (document: StoredDocument): void => {
  const byteCharacters = atob(document.data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: document.type });
  
  const url = window.URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = document.name;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const generateDocumentId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
