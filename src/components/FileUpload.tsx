/**
 * File Upload Component for React Native
 * Supports images, videos, and documents with progress tracking
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { storageService } from '@/src/api/services/storageService';
import { FileUploadResponse } from '@/src/api/types';

interface FileUploadProps {
  type: 'avatar' | 'kyc' | 'deliverable' | 'portfolio';
  onUploadComplete: (response: FileUploadResponse) => void;
  onUploadError?: (error: Error) => void;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  deliverableId?: string;
  documentType?: string;
  showPreview?: boolean;
  label?: string;
}

export function FileUpload({
  type,
  onUploadComplete,
  onUploadError,
  maxSize,
  allowedTypes,
  deliverableId,
  documentType,
  showPreview = true,
  label,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    type: string;
    name: string;
    size: number;
  } | null>(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === 'avatar' || type === 'portfolio' 
          ? ImagePicker.MediaTypeOptions.Images 
          : ImagePicker.MediaTypeOptions.All,
        allowsEditing: type === 'avatar',
        aspect: type === 'avatar' ? [1, 1] : undefined,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        handleFileSelected({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `image.${asset.uri.split('.').pop()}`,
          size: asset.fileSize || 0,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: type === 'avatar',
        aspect: type === 'avatar' ? [1, 1] : undefined,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        handleFileSelected({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `photo.${asset.uri.split('.').pop()}`,
          size: asset.fileSize || 0,
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes || ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        handleFileSelected({
          uri: asset.uri,
          type: asset.mimeType || 'application/pdf',
          name: asset.name,
          size: asset.size || 0,
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleFileSelected = (file: {
    uri: string;
    type: string;
    name: string;
    size: number;
  }) => {
    // Validate file size
    if (maxSize && file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      Alert.alert('File Too Large', `File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setSelectedFile(file);
    if (showPreview && file.type.startsWith('image/')) {
      setPreview(file.uri);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      Alert.alert('No File Selected', 'Please select a file first');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const response = await storageService.uploadFile(
        selectedFile.uri,
        type,
        {
          deliverableId,
          documentType,
        },
        (progressValue) => {
          setProgress(progressValue);
        }
      );

      setUploading(false);
      setProgress(0);
      onUploadComplete(response);
      
      // Clear selection after successful upload
      setSelectedFile(null);
      setPreview(null);
    } catch (error: any) {
      setUploading(false);
      setProgress(0);
      console.error('Upload error:', error);
      
      if (onUploadError) {
        onUploadError(error);
      } else {
        Alert.alert('Upload Failed', error.message || 'Failed to upload file');
      }
    }
  };

  const showPickerOptions = () => {
    const options: string[] = [];
    
    if (type === 'avatar' || type === 'portfolio') {
      options.push('Take Photo', 'Choose from Gallery');
    } else if (type === 'kyc') {
      options.push('Take Photo', 'Choose from Gallery', 'Choose Document');
    } else {
      options.push('Choose from Gallery', 'Choose Document');
    }

    Alert.alert('Select File', '', [
      ...options.map((option) => ({
        text: option,
        onPress: () => {
          if (option === 'Take Photo') {
            takePhoto();
          } else if (option === 'Choose from Gallery') {
            pickImage();
          } else if (option === 'Choose Document') {
            pickDocument();
          }
        },
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {showPreview && preview && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: preview }} style={styles.preview} />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => {
              setPreview(null);
              setSelectedFile(null);
            }}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}

      {!selectedFile && (
        <TouchableOpacity style={styles.selectButton} onPress={showPickerOptions}>
          <Text style={styles.selectButtonText}>
            {type === 'avatar' ? 'Select Avatar' : 
             type === 'kyc' ? 'Select Document' : 
             type === 'deliverable' ? 'Select File' : 
             'Select Portfolio Item'}
          </Text>
        </TouchableOpacity>
      )}

      {selectedFile && !uploading && (
        <View style={styles.fileInfo}>
          <Text style={styles.fileName}>{selectedFile.name}</Text>
          <Text style={styles.fileSize}>
            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setSelectedFile(null);
                setPreview(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.uploadButton]}
              onPress={uploadFile}
            >
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {uploading && (
        <View style={styles.uploadProgress}>
          <ActivityIndicator size="small" color="#6366f1" />
          <Text style={styles.progressText}>
            Uploading... {Math.round(progress)}%
          </Text>
          {progress > 0 && (
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  previewContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  removeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectButton: {
    backgroundColor: '#1f1f3a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6366f1',
    borderStyle: 'dashed',
  },
  selectButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  fileInfo: {
    backgroundColor: '#1f1f3a',
    borderRadius: 12,
    padding: 16,
  },
  fileName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileSize: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#374151',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#6366f1',
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadProgress: {
    backgroundColor: '#1f1f3a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  progressText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
});

