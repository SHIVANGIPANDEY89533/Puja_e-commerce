import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Platform, Alert } from 'react-native';

export const parseUploadedFile = async (uri: string, name: string, mimeType?: string): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Fetch file blob (works across Web and React Native if URI is valid)
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
    } catch (err) {
      reject(new Error('Failed to read file.'));
    }
  });
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

// Ensure the correct base URL is used
const getBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_API_URL || 'https://puja-e-commerce.onrender.com/api';
  return url;
};

const triggerBackendDownload = async (endpoint: string) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Error', 'You must be logged in to download.');
      return;
    }
    
    // Check if endpoint already has a query string
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${getBaseUrl()}${endpoint}${separator}token=${token}`;
    
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  } catch (err) {
    console.error(err);
    Alert.alert('Error', 'Failed to initiate download.');
  }
};

export const exportToCSV = (type: 'products' | 'reports', range?: string) => {
  if (type === 'products') {
    triggerBackendDownload('/export/products?format=csv');
  } else if (type === 'reports') {
    triggerBackendDownload(`/export/reports?format=csv&range=${range || 'all'}`);
  }
};

export const exportToPDF = (type: 'products' | 'reports', range?: string) => {
  if (type === 'products') {
    triggerBackendDownload('/export/products?format=pdf');
  } else if (type === 'reports') {
    triggerBackendDownload(`/export/reports?format=pdf&range=${range || 'all'}`);
  }
};

export const downloadTemplate = () => {
  // Use local generation for template since it's just static dummy data
  const template = [
    {
      name: 'Example Product',
      category: 'Diyas',
      price: '299',
      stock: '50',
      description: 'Handcrafted beautiful Diya.',
    }
  ];
  const csv = Papa.unparse(template);
  if (Platform.OS === 'web') {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } else {
    Alert.alert('Notice', 'Template download is only supported on web currently.');
  }
};
