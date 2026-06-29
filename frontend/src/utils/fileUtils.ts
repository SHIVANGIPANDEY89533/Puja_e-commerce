import Papa from 'papaparse';
import * as XLSX from 'xlsx';
// @ts-ignore
import { jsPDF } from 'jspdf/dist/jspdf.es.min.js';
import autoTable from 'jspdf-autotable';
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

const triggerDownload = (blob: Blob, filename: string) => {
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
    Alert.alert('Export Successful', `Data is ready. Mobile sharing not implemented in this demo.`);
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

export const exportToPDF = (data: any[], columns: string[], filename: string = 'export.pdf') => {
  const doc = new jsPDF();
  
  const tableData = data.map(row => columns.map(col => row[col] !== undefined ? String(row[col]) : ''));
  
  autoTable(doc, {
    head: [columns],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  if (Platform.OS === 'web') {
    doc.save(filename);
  } else {
    Alert.alert('Export Successful', 'Mobile sharing not implemented in this demo.');
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
