/**
 * File Upload Service for React Native
 * Handles file uploads to CreatorX backend (Supabase Storage)
 */

import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { apiClient } from '../api/client';
import { Platform } from 'react-native';

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onError?: (error: Error) => void;
}

class FileUploadService {
  /**
   * Request camera/gallery permissions
   */
  async requestImagePermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Image library permission not granted');
      return false;
    }
    return true;
  }

  /**
   * Request camera permission
   */
  async requestCameraPermission(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Camera permission not granted');
      return false;
    }
    return true;
  }

  /**
   * Upload avatar image
   */
  async uploadAvatar(
    userId: string,
    options?: UploadOptions
  ): Promise<string> {
    try {
      // Request permissions
      const hasPermission = await this.requestImagePermissions();
      if (!hasPermission) {
        throw new Error('Image library permission not granted');
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for avatars
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        throw new Error('Image selection cancelled');
      }

      const asset = result.assets[0];
      const fileUri = asset.uri;

      // Create FormData
      const formData = new FormData();
      const fileName = fileUri.split('/').pop() || 'avatar.jpg';
      const fileType = this.getMimeType(fileUri);

      formData.append('file', {
        uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
        name: fileName,
        type: fileType,
      } as any);

      // Upload to backend
      const response = await apiClient.post<{ fileUrl: string }>(
        '/storage/upload/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (options?.onProgress && progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              options.onProgress({
                loaded: progressEvent.loaded,
                total: progressEvent.total,
                percent,
              });
            }
          },
        }
      );

      return response.fileUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      options?.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Upload KYC document
   */
  async uploadKYCDocument(
    userId: string,
    documentType: 'AADHAAR' | 'PAN' | 'GST' | 'PASSPORT' | 'DRIVING_LICENSE',
    options?: UploadOptions
  ): Promise<string> {
    try {
      // Request permissions
      const hasPermission = await this.requestImagePermissions();
      if (!hasPermission) {
        throw new Error('Image library permission not granted');
      }

      // Launch image picker or document picker
      const useDocumentPicker = documentType === 'PAN' || documentType === 'GST';
      
      let fileUri: string;
      let fileName: string;
      let fileType: string;

      if (useDocumentPicker) {
        // Use document picker for PDFs
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'image/*'],
          copyToCacheDirectory: true,
        });

        if (result.type === 'cancel') {
          throw new Error('Document selection cancelled');
        }

        fileUri = result.uri;
        fileName = result.name || 'document.pdf';
        fileType = result.mimeType || 'application/pdf';
      } else {
        // Use image picker for images
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.9,
          allowsMultipleSelection: false,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
          throw new Error('Image selection cancelled');
        }

        const asset = result.assets[0];
        fileUri = asset.uri;
        fileName = fileUri.split('/').pop() || 'document.jpg';
        fileType = this.getMimeType(fileUri);
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
        name: fileName,
        type: fileType,
      } as any);
      formData.append('documentType', documentType);

      // Upload to backend
      const response = await apiClient.post<{ fileUrl: string }>(
        '/storage/upload/kyc',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (options?.onProgress && progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              options.onProgress({
                loaded: progressEvent.loaded,
                total: progressEvent.total,
                percent,
              });
            }
          },
        }
      );

      return response.fileUrl;
    } catch (error) {
      console.error('Error uploading KYC document:', error);
      options?.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Upload deliverable (image or video)
   */
  async uploadDeliverable(
    deliverableId: string,
    options?: UploadOptions
  ): Promise<string> {
    try {
      // Request permissions
      const hasPermission = await this.requestImagePermissions();
      if (!hasPermission) {
        throw new Error('Media library permission not granted');
      }

      // Launch media picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.9,
        allowsMultipleSelection: false,
        videoMaxDuration: 300, // 5 minutes max
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        throw new Error('Media selection cancelled');
      }

      const asset = result.assets[0];
      const fileUri = asset.uri;
      const fileName = fileUri.split('/').pop() || 'deliverable.mp4';
      const fileType = asset.type === 'video' 
        ? 'video/mp4' 
        : this.getMimeType(fileUri);

      // Create FormData
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
        name: fileName,
        type: fileType,
      } as any);
      formData.append('deliverableId', deliverableId);

      // Upload to backend
      const response = await apiClient.post<{ fileUrl: string }>(
        '/storage/upload/deliverable',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (options?.onProgress && progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              options.onProgress({
                loaded: progressEvent.loaded,
                total: progressEvent.total,
                percent,
              });
            }
          },
        }
      );

      return response.fileUrl;
    } catch (error) {
      console.error('Error uploading deliverable:', error);
      options?.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Upload portfolio item
   */
  async uploadPortfolioItem(
    userId: string,
    options?: UploadOptions
  ): Promise<string> {
    try {
      // Request permissions
      const hasPermission = await this.requestImagePermissions();
      if (!hasPermission) {
        throw new Error('Media library permission not granted');
      }

      // Launch media picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.9,
        allowsMultipleSelection: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        throw new Error('Media selection cancelled');
      }

      const asset = result.assets[0];
      const fileUri = asset.uri;
      const fileName = fileUri.split('/').pop() || 'portfolio.mp4';
      const fileType = asset.type === 'video' 
        ? 'video/mp4' 
        : this.getMimeType(fileUri);

      // Create FormData
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
        name: fileName,
        type: fileType,
      } as any);

      // Upload to backend
      const response = await apiClient.post<{ fileUrl: string }>(
        '/storage/upload/portfolio',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (options?.onProgress && progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              options.onProgress({
                loaded: progressEvent.loaded,
                total: progressEvent.total,
                percent,
              });
            }
          },
        }
      );

      return response.fileUrl;
    } catch (error) {
      console.error('Error uploading portfolio item:', error);
      options?.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      await apiClient.delete('/storage/delete', {
        params: { fileUrl },
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Generate signed URL for temporary access
   */
  async generateSignedUrl(
    fileUrl: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const response = await apiClient.get<{ signedUrl: string }>(
        '/storage/signed-url',
        {
          params: { fileUrl, expiresIn },
        }
      );
      return response.signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
  }

  /**
   * Get MIME type from file URI
   */
  private getMimeType(uri: string): string {
    const extension = uri.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'mp4':
        return 'video/mp4';
      case 'mov':
        return 'video/quicktime';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();

