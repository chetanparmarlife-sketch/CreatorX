/**
 * Storage service for file uploads to Supabase Storage
 */

import { apiClient } from '../client';
import { FileUploadResponse, SignedUrlResponse } from '../types';
import * as FileSystem from 'expo-file-system';

export interface UploadOptions {
  deliverableId?: string;
  documentType?: string;
}

export const storageService = {
  /**
   * Upload file with progress tracking
   */
  async uploadFile(
    fileUri: string,
    type: 'avatar' | 'kyc' | 'deliverable' | 'portfolio',
    options: UploadOptions = {},
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse> {
    try {
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Create form data
      const formData = new FormData();
      
      // Get file name and type from URI
      const fileName = fileUri.split('/').pop() || 'file';
      const fileType = getFileTypeFromUri(fileUri);
      
      // @ts-ignore - FormData in React Native
      formData.append('file', {
        uri: fileUri,
        type: fileType,
        name: fileName,
      } as any);
      
      formData.append('type', type);
      
      if (options.deliverableId) {
        formData.append('deliverableId', options.deliverableId);
      }
      
      if (options.documentType) {
        formData.append('documentType', options.documentType);
      }

      // Upload with progress tracking
      const response = await apiClient.post<FileUploadResponse>(
        `/storage/upload/${type === 'avatar' ? 'avatar' : 
                        type === 'kyc' ? 'kyc' : 
                        type === 'deliverable' ? 'deliverable' : 
                        'portfolio'}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(progress);
            }
          },
        }
      );

      return response;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
  },

  /**
   * Upload avatar
   */
  async uploadAvatar(
    fileUri: string,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse> {
    return this.uploadFile(fileUri, 'avatar', {}, onProgress);
  },

  /**
   * Upload KYC document
   */
  async uploadKYCDocument(
    fileUri: string,
    documentType: string,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse> {
    return this.uploadFile(
      fileUri,
      'kyc',
      { documentType },
      onProgress
    );
  },

  /**
   * Upload deliverable
   */
  async uploadDeliverable(
    fileUri: string,
    deliverableId: string,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse> {
    return this.uploadFile(
      fileUri,
      'deliverable',
      { deliverableId },
      onProgress
    );
  },

  /**
   * Upload portfolio item
   */
  async uploadPortfolioItem(
    fileUri: string,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse> {
    return this.uploadFile(fileUri, 'portfolio', {}, onProgress);
  },

  /**
   * Delete file
   */
  async deleteFile(fileUrl: string): Promise<void> {
    await apiClient.delete('/storage/delete', {
      params: { fileUrl },
    });
  },

  /**
   * Generate signed URL
   */
  async generateSignedUrl(
    fileUrl: string,
    expiresIn: number = 3600
  ): Promise<SignedUrlResponse> {
    const response = await apiClient.get<SignedUrlResponse>('/storage/signed-url', {
      params: { fileUrl, expiresIn },
    });
    return response;
  },
};

/**
 * Get file MIME type from URI
 */
function getFileTypeFromUri(uri: string): string {
  const extension = uri.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    webm: 'video/webm',
    pdf: 'application/pdf',
  };
  
  return mimeTypes[extension || ''] || 'application/octet-stream';
}

