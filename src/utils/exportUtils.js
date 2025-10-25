import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const calculateTotal = (data, key) => {
  return data.reduce((sum, item) => sum + (parseFloat(item[key]) || 0), 0);
};

export const generateSalesSummaryPDF = (data) => {
  const {
    dateRange,
    kpiData,
    categoryData,
    transactions,
    bestSellers,
    staffPerformance,
    peakHours
  } = data;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const fileName = `Reports${currentDate}.pdf`;

  // Add header with company logo/name
  doc.setFillColor(52, 144, 220); // Professional blue color
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('Jolens BikeShop', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Sales Report', pageWidth / 2, 32, { align: 'center' });
  
  // Reset text color and add report details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Generated on: ${formatDate(new Date())}`, 14, 50);
  doc.text(`Report Period: ${dateRange}`, 14, 58);

  let yPos = 70;

  // KPI Summary with improved styling
  const kpiTableData = kpiData.map(kpi => [
    kpi.title,
    kpi.type === 'currency' ? formatCurrency(kpi.value) : kpi.value.toLocaleString(),
    `${kpi.change >= 0 ? '+' : ''}${kpi.change}% vs ${kpi.period}`
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Key Performance Metrics', 'Value', 'Change']],
    body: kpiTableData,
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 12,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 248, 255]
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
      2: { halign: 'right' }
    },
    margin: { top: 60, left: 14, right: 14 },
    didDrawPage: (data) => {
      // Add page numbers
      doc.setFontSize(10);
      doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}/${doc.internal.getNumberOfPages()}`,
        pageWidth - 20, pageHeight - 10);
    }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Category Performance with total
  const categoryTotal = calculateTotal(categoryData, 'value');
  const categoryTableData = [
    ...categoryData.map(cat => [
      cat.name,
      formatCurrency(cat.value),
      `${cat.percentage}%`,
      `${cat.growth || 0}%`
    ]),
    ['Total', formatCurrency(categoryTotal), '100%', '-']
  ];

  doc.autoTable({
    startY: yPos,
    head: [['Category', 'Revenue', 'Share', 'Growth']],
    body: categoryTableData,
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 12,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 248, 255]
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' }
    },
    footStyles: { fillColor: [220, 230, 241], fontStyle: 'bold' },
    margin: { left: 14, right: 14 }
  });

  // Add new page for transactions
  doc.addPage();
  yPos = 20;

  // Transaction details with total
  const transactionTotal = calculateTotal(transactions, 'amount');
  const transactionTableData = [
    ...transactions.map(trans => [
      trans.id,
      formatDate(trans.date),
      trans.customer,
      formatCurrency(trans.amount),
      trans.paymentMethod,
      trans.staff
    ]),
    ['Total', '', '', formatCurrency(transactionTotal), '', '']
  ];

  doc.autoTable({
    startY: yPos,
    head: [['ID', 'Date', 'Customer', 'Amount', 'Payment', 'Staff']],
    body: transactionTableData,
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 12,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 248, 255]
    },
    columnStyles: {
      3: { halign: 'right' }
    },
    footStyles: { fillColor: [220, 230, 241], fontStyle: 'bold' },
    margin: { left: 14, right: 14 }
  });

  doc.save(fileName);
};

export const generateSalesExcelReport = (data) => {
  const {
    dateRange,
    kpiData,
    categoryData,
    transactions,
    bestSellers,
    staffPerformance,
    peakHours
  } = data;

  const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const fileName = `Reports${currentDate}.xlsx`;

  const workbook = XLSX.utils.book_new();

  // Prepare the styles
  const headerStyle = {
    font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "2980B9" } }, // Professional blue
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" }
    }
  };

  const subHeaderStyle = {
    font: { bold: true, sz: 12 },
    fill: { fgColor: { rgb: "ECF0F1" } },
    alignment: { horizontal: "center" }
  };

  const totalRowStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: "D5D8DC" } },
    alignment: { horizontal: "right" }
  };

  // KPI Summary Sheet with totals
  const kpiTotal = calculateTotal(kpiData, 'value');
  const kpiSheet = XLSX.utils.aoa_to_sheet([
    ['Key Performance Indicators'],
    ['Report Period:', dateRange],
    ['Generated on:', formatDate(new Date())],
    [''],
    ['Metric', 'Value', 'Change vs Previous Period'],
    ...kpiData.map(kpi => [
      kpi.title,
      kpi.type === 'currency' ? formatCurrency(kpi.value) : kpi.value.toLocaleString(),
      `${kpi.change >= 0 ? '+' : ''}${kpi.change}% vs ${kpi.period}`
    ]),
    ['Total', formatCurrency(kpiTotal), '']
  ]);

  // Category Performance Sheet with totals
  const categoryTotal = calculateTotal(categoryData, 'value');
  const categorySheet = XLSX.utils.aoa_to_sheet([
    ['Category Performance Analysis'],
    [''],
    ['Category', 'Revenue', 'Market Share', 'YoY Growth'],
    ...categoryData.map(cat => [
      cat.name,
      formatCurrency(cat.value),
      `${cat.percentage}%`,
      `${cat.growth || 0}%`
    ]),
    ['Total', formatCurrency(categoryTotal), '100%', '-']
  ]);

  // Transaction Details Sheet with totals
  const transactionTotal = calculateTotal(transactions, 'amount');
  const transactionSheet = XLSX.utils.aoa_to_sheet([
    ['Transaction Details'],
    [''],
    ['Transaction ID', 'Date', 'Customer', 'Items', 'Amount', 'Payment Method', 'Staff'],
    ...transactions.map(trans => [
      trans.id,
      formatDate(trans.date),
      trans.customer,
      trans.items,
      formatCurrency(trans.amount),
      trans.paymentMethod,
      trans.staff
    ]),
    ['Total', '', '', '', formatCurrency(transactionTotal), '', '']
  ]);

  // Staff Performance Sheet with totals
  const staffRevenueTotal = calculateTotal(staffPerformance, 'revenue');
  const staffSalesTotal = calculateTotal(staffPerformance, 'sales');
  const staffSheet = XLSX.utils.aoa_to_sheet([
    ['Staff Performance Metrics'],
    [''],
    ['Staff Member', 'Total Sales', 'Revenue Generated', 'Average Order Value', 'Conversion Rate'],
    ...staffPerformance.map(staff => [
      staff.name,
      staff.sales,
      formatCurrency(staff.revenue),
      formatCurrency(staff.avgOrder),
      `${staff.conversionRate || 0}%`
    ]),
    ['Total', staffSalesTotal, formatCurrency(staffRevenueTotal), '-', '-']
  ]);

  // Apply styles to all sheets
  [kpiSheet, categorySheet, transactionSheet, staffSheet].forEach(sheet => {
    const range = XLSX.utils.decode_range(sheet['!ref']);
    
    // Style header row
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
      sheet[headerCell].s = headerStyle;
    }

    // Style column headers and data
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = XLSX.utils.encode_cell({ r: R, c: C });
        if (!sheet[cell]) continue;

        // Column headers (row 2)
        if (R === 2) {
          sheet[cell].s = subHeaderStyle;
        }
        // Total row
        else if (R === range.e.r) {
          sheet[cell].s = totalRowStyle;
        }
        // Data cells
        else {
          sheet[cell].s = {
            alignment: { horizontal: C > 0 ? "right" : "left" },
            border: {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" }
            }
          };
        }
      }
    }

    // Set column widths
    sheet['!cols'] = Array(range.e.c + 1).fill({ wch: 15 });
  });

  // Add all sheets to workbook
  XLSX.utils.book_append_sheet(workbook, kpiSheet, 'KPI Summary');
  XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Performance');
  XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Transactions');
  XLSX.utils.book_append_sheet(workbook, staffSheet, 'Staff Performance');

  // Save workbook
  XLSX.writeFile(workbook, fileName);
};