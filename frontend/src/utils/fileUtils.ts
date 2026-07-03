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

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

const triggerDownload = async (blob: Blob, filename: string) => {
  if (Platform.OS === 'web') {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } else {
    try {
      const fr = new FileReader();
      fr.onload = async () => {
        const base64 = (fr.result as string).split(',')[1];
        // @ts-ignore
        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        
        await FileSystem.writeAsStringAsync(fileUri, base64, { 
          encoding: FileSystem.EncodingType.Base64 
        });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert("Error", "Sharing is not available on this device");
        }
      };
      fr.readAsDataURL(blob);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save file on device.");
    }
  }
};

export const exportToCSV = (data: any[], filename: string = 'export.csv') => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename);
};

export const exportToExcel = (data: any[], filename: string = 'export.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerDownload(blob, filename);
};

export const exportToPDF = async (data: any[], columns: string[], filename: string = 'export.pdf') => {
  if (Platform.OS === 'web') {
    try {
      // @ts-ignore
      const { jsPDF } = await import('jspdf/dist/jspdf.es.min.js');
      const autoTable = (await import('jspdf-autotable')).default;
      
      const doc = new jsPDF();
      
      const tableData = data.map(row => columns.map(col => row[col] !== undefined ? String(row[col]) : ''));
      
      autoTable(doc, {
        head: [columns],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      doc.save(filename);
    } catch (err) {
      console.error("Failed to generate PDF on web", err);
    }
  } else {
    try {
      // Generate HTML for the table for Mobile PDF generation
      const thead = `<tr>${columns.map(col => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #2980b9; color: white; text-transform: capitalize;">${col}</th>`).join('')}</tr>`;
      const tbody = data.map(row => `<tr>${columns.map(col => `<td style="border: 1px solid #ddd; padding: 8px;">${row[col] !== undefined ? String(row[col]) : ''}</td>`).join('')}</tr>`).join('');
      
      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              h1 { color: #333; text-align: center; }
            </style>
          </head>
          <body>
            <h1>Report</h1>
            <table>
              <thead>${thead}</thead>
              <tbody>${tbody}</tbody>
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      } else {
        Alert.alert("Error", "Sharing is not available on this device");
      }
    } catch (err) {
      console.error("Failed to generate PDF on mobile", err);
      Alert.alert('Error', 'Failed to generate PDF on mobile.');
    }
  }
};

export const downloadTemplate = () => {
  const template = [
    {
      name: 'Example Product',
      category: 'Diyas',
      price: '299',
      stock: '50',
      description: 'Handcrafted beautiful Diya.',
    }
  ];
  exportToCSV(template, 'product_template.csv');
};
