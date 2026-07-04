import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Platform, Alert } from 'react-native';

export const parseUploadedFile = async (uri: string, name: string, mimeType?: string): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();

        if (name.toLowerCase().endsWith('.csv') || mimeType === 'text/csv') {
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result as string;
            Papa.parse(text, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => resolve(results.data),
              error: (err: any) => reject(err),
            });
          };
          reader.readAsText(blob);
        } else if (name.toLowerCase().endsWith('.xlsx') || name.toLowerCase().endsWith('.xls')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            resolve(json);
          };
          reader.readAsBinaryString(blob);
        } else {
          reject(new Error('Unsupported file format. Please upload CSV or Excel files.'));
        }
      } else {
        // Native (Android/iOS)
        if (name.toLowerCase().endsWith('.csv') || mimeType === 'text/csv' || mimeType === 'application/vnd.ms-excel' || mimeType?.includes('spreadsheet')) {
          try {
            // First try as CSV
            if (name.toLowerCase().endsWith('.csv')) {
              const text = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
              Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => resolve(results.data),
                error: (err: any) => reject(new Error('Failed to parse CSV: ' + err.message)),
              });
            } else {
               // Try as Excel
              const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
              const workbook = XLSX.read(base64, { type: 'base64' });
              const firstSheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheetName];
              const json = XLSX.utils.sheet_to_json(worksheet);
              resolve(json);
            }
          } catch(e: any) {
            reject(new Error('Failed to read file content: ' + e.message));
          }
        } else {
          reject(new Error('Unsupported file format. Please upload CSV or Excel files.'));
        }
      }
    } catch (err: any) {
      reject(new Error(`Failed to read file: ${err.message}`));
    }
  });
};

import api from '@/services/api';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';

// Ensure the correct base URL is used
const getBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_API_URL || 'https://puja-e-commerce.onrender.com/api';
  return url;
};

const triggerBackendDownload = async (endpoint: string, filenameFallback: string) => {
  try {
    const authHeader = api.defaults.headers.common['Authorization'];
    const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : null;

    if (!token && !endpoint.includes('template')) {
      Alert.alert('Error', 'You must be logged in to download.');
      return;
    }
    
    // Check if endpoint already has a query string
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = token ? `${getBaseUrl()}${endpoint}${separator}token=${token}` : `${getBaseUrl()}${endpoint}`;
    
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Alert.alert('Downloading...', 'Your file is being downloaded.');
      
      const fileExt = endpoint.includes('pdf') ? '.pdf' : '.csv';
      const mimeType = endpoint.includes('pdf') ? 'application/pdf' : 'text/csv';
      const filename = `${filenameFallback}_${Date.now()}${fileExt}`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      const { uri, status } = await FileSystem.downloadAsync(url, fileUri);
      
      if (status !== 200) {
        Alert.alert('Download Error', 'Failed to download the file from server.');
        return;
      }

      Alert.alert(
        'File Downloaded', 
        'Your file has been downloaded successfully.', 
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open File', 
            onPress: async () => {
              if (Platform.OS === 'android') {
                try {
                  const contentUri = await FileSystem.getContentUriAsync(uri);
                  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                    data: contentUri,
                    flags: 1,
                    type: mimeType
                  });
                } catch (e) {
                  // Fallback if intent fails
                  Sharing.shareAsync(uri, { dialogTitle: 'Open File' });
                }
              } else {
                Sharing.shareAsync(uri);
              }
            }
          }
        ]
      );
    }
  } catch (err) {
    console.error(err);
    Alert.alert('Error', 'Failed to initiate download.');
  }
};

export const exportToCSV = (type: 'products' | 'reports', range?: string) => {
  if (type === 'products') {
    triggerBackendDownload('/export/products?format=csv', 'products');
  } else if (type === 'reports') {
    triggerBackendDownload(`/export/reports?format=csv&range=${range || 'all'}`, `reports_${range || 'all'}`);
  }
};

export const exportToPDF = (type: 'products' | 'reports', range?: string) => {
  if (type === 'products') {
    triggerBackendDownload('/export/products?format=pdf', 'products');
  } else if (type === 'reports') {
    triggerBackendDownload(`/export/reports?format=pdf&range=${range || 'all'}`, `reports_${range || 'all'}`);
  }
};

export const downloadTemplate = () => {
  triggerBackendDownload('/export/template', 'template');
};
