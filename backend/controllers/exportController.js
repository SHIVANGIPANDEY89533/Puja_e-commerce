import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import PDFDocument from 'pdfkit-table';

// @desc    Export products data
// @route   GET /api/export/products
// @access  Private/Admin
export const exportProducts = asyncHandler(async (req, res) => {
  const { format } = req.query; // csv or pdf

  const products = await Product.find({});
  
  if (format === 'csv') {
    // Generate CSV
    const header = 'ID,Name,Category,Price,Stock,Status\n';
    const rows = products.map(p => `"${p._id}","${p.name.replace(/"/g, '""')}","${p.category}","${p.price}","${p.stock}","${p.stock > 0 ? 'Active' : 'Out of Stock'}"`).join('\n');
    
    res.setHeader('Content-Disposition', 'attachment; filename=products_export.csv');
    res.set('Content-Type', 'text/csv');
    return res.status(200).send(header + rows);
  } else if (format === 'pdf') {
    res.setHeader('Content-Disposition', 'attachment; filename=products_export.pdf');
    res.set('Content-Type', 'application/pdf');
    
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    doc.pipe(res);
    
    const table = {
      title: "Products Report",
      headers: ["ID", "Name", "Category", "Price", "Stock", "Status"],
      rows: products.map(p => [String(p._id), p.name, p.category, String(p.price), String(p.stock), p.stock > 0 ? 'Active' : 'Out of Stock'])
    };
    
    await doc.table(table, { width: 500 });
    doc.end();
  } else {
    res.status(400).json({ message: 'Invalid format. Use ?format=csv or ?format=pdf' });
  }
});

// @desc    Export reports data
// @route   GET /api/export/reports
// @access  Private/Admin
export const exportReports = asyncHandler(async (req, res) => {
  const { format, range } = req.query; // csv or pdf
  
  let matchDate = {};
  const now = new Date();
  let startDate = new Date();
  
  if (range === 'daily') startDate.setDate(now.getDate() - 1);
  else if (range === 'weekly') startDate.setDate(now.getDate() - 7);
  else if (range === 'monthly') startDate.setMonth(now.getMonth() - 1);
  else if (range === 'yearly') startDate.setFullYear(now.getFullYear() - 1);
  else startDate = new Date(0); // all
  
  matchDate = { createdAt: { $gte: startDate } };
  
  const formatStr = range === 'yearly' || range === 'monthly' ? '%Y-%m' : '%Y-%m-%d';
  const salesChartData = await Order.aggregate([
    { $match: matchDate },
    { $group: { _id: { $dateToString: { format: formatStr, date: '$createdAt' } }, sales: { $sum: '$total' }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  if (format === 'csv') {
    const header = 'Date,Sales,Orders\n';
    const rows = salesChartData.map(row => `"${row._id}","${row.sales}","${row.count}"`).join('\n');
    
    res.setHeader('Content-Disposition', `attachment; filename=sales_report_${range || 'all'}.csv`);
    res.set('Content-Type', 'text/csv');
    return res.status(200).send(header + rows);
  } else if (format === 'pdf') {
    res.setHeader('Content-Disposition', `attachment; filename=sales_report_${range || 'all'}.pdf`);
    res.set('Content-Type', 'application/pdf');
    
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    doc.pipe(res);
    
    const table = {
      title: `Sales Report (${range || 'all'})`,
      headers: ["Date", "Sales", "Orders"],
      rows: salesChartData.map(row => [String(row._id), String(row.sales), String(row.count)])
    };
    
    await doc.table(table, { width: 400 });
    doc.end();
  } else {
    res.status(400).json({ message: 'Invalid format. Use ?format=csv or ?format=pdf' });
  }
});

// @desc    Export CSV Template
// @route   GET /api/export/template
// @access  Public
export const exportTemplate = asyncHandler(async (req, res) => {
  const header = 'Name,Category,Price,Stock,Description\n';
  const row = '"Example Product","Diyas","299","50","Handcrafted beautiful Diya."';
  
  res.setHeader('Content-Disposition', 'attachment; filename=product_template.csv');
  res.set('Content-Type', 'text/csv');
  return res.status(200).send(header + row);
});
