export interface BaseDocument {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileAttachment {
  fileName: string;
  fileUrl: string;
  filePath: string;
  fileSize: number;
  fileType: string;
}
