import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';

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
  const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const fileName = `Reports${currentDate}.pdf`;

  // Title and Date
  doc.setFontSize(20);
  doc.text('Sales Report Summary', pageWidth / 2, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Generated on: ${formatDate(new Date())}`, pageWidth / 2, 25, { align: 'center' });
  doc.text(`Report Period: ${dateRange}`, pageWidth / 2, 30, { align: 'center' });

  let yPos = 40;

  // KPI Summary
  doc.setFontSize(14);
  doc.text('Key Performance Indicators', 14, yPos);
  yPos += 10;

  const kpiTableData = kpiData.map(kpi => [
    kpi.title,
    kpi.type === 'currency' ? formatCurrency(kpi.value) : kpi.value.toLocaleString(),
    `${kpi.change >= 0 ? '+' : ''}${kpi.change}% vs ${kpi.period}`
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Metric', 'Value', 'Change']],
    body: kpiTableData,
    margin: { left: 14 },
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 5 }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Category Performance
  doc.setFontSize(14);
  doc.text('Category Performance', 14, yPos);
  yPos += 10;

  const categoryTableData = categoryData.map(cat => [
    cat.name,
    formatCurrency(cat.value),
    `${cat.percentage}%`
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Category', 'Revenue', 'Share']],
    body: categoryTableData,
    margin: { left: 14 },
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 5 }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Best Sellers
  doc.setFontSize(14);
  doc.text('Top Products', 14, yPos);
  yPos += 10;

  const bestSellersTableData = bestSellers.map(product => [
    product.name,
    formatCurrency(product.revenue),
    product.units.toString(),
    `${product.growth}%`
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Product', 'Revenue', 'Units Sold', 'Growth']],
    body: bestSellersTableData,
    margin: { left: 14 },
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 5 }
  });

  // Add new page for additional data
  doc.addPage();
  yPos = 15;

  // Staff Performance
  doc.setFontSize(14);
  doc.text('Staff Performance', 14, yPos);
  yPos += 10;

  const staffTableData = staffPerformance.map(staff => [
    staff.name,
    staff.sales.toString(),
    formatCurrency(staff.revenue),
    formatCurrency(staff.avgOrder)
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Staff Member', 'Sales', 'Revenue', 'Avg Order']],
    body: staffTableData,
    margin: { left: 14 },
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 5 }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Peak Hours Analysis
  doc.setFontSize(14);
  doc.text('Peak Hours Analysis', 14, yPos);
  yPos += 10;

  const peakHoursTableData = peakHours.map(hour => [
    hour.hour,
    hour.transactions.toString(),
    formatCurrency(hour.revenue)
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Time', 'Transactions', 'Revenue']],
    body: peakHoursTableData,
    margin: { left: 14 },
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 5 }
  });

  // Insights and Summary
  doc.addPage();
  doc.setFontSize(14);
  doc.text('Key Insights & Recommendations', 14, 15);
  
  const insights = [
    'Revenue Trends: ' + (kpiData[0].change >= 0 ? 'Positive growth' : 'Declining trend'),
    'Top Performing Category: ' + categoryData[0].name,
    'Peak Business Hours: ' + peakHours.reduce((a, b) => a.revenue > b.revenue ? a : b).hour,
    'Best Performing Staff: ' + staffPerformance[0].name
  ];

  let insightY = 25;
  insights.forEach(insight => {
    doc.setFontSize(10);
    doc.text('• ' + insight, 14, insightY);
    insightY += 8;
  });

  doc.save(fileName);
};

export const generateSalesExcelReport = async (data) => {
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

  const workbook = new ExcelJS.Workbook();

  // KPI Summary Sheet
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
    ])
  ]);

  // Category Performance Sheet
  const categorySheet = XLSX.utils.aoa_to_sheet([
    ['Category Performance Analysis'],
    [''],
    ['Category', 'Revenue', 'Market Share', 'YoY Growth'],
    ...categoryData.map(cat => [
      cat.name,
      formatCurrency(cat.value),
      `${cat.percentage}%`,
      `${cat.growth || 0}%`
    ])
  ]);

  // Transaction Details Sheet
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
    ])
  ]);

  // Best Sellers Sheet
  const bestSellersSheet = XLSX.utils.aoa_to_sheet([
    ['Top Performing Products'],
    [''],
    ['Product', 'Revenue', 'Units Sold', 'Growth Rate', 'Profit Margin'],
    ...bestSellers.map(product => [
      product.name,
      formatCurrency(product.revenue),
      product.units,
      `${product.growth}%`,
      `${product.margin}%`
    ])
  ]);

  // Staff Performance Sheet
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
    ])
  ]);

  // Peak Hours Analysis Sheet
  const peakHoursSheet = XLSX.utils.aoa_to_sheet([
    ['Peak Hours Analysis'],
    [''],
    ['Time Period', 'Number of Transactions', 'Revenue', 'Average Transaction Value'],
    ...peakHours.map(hour => [
      hour.hour,
      hour.transactions,
      formatCurrency(hour.revenue),
      formatCurrency(hour.revenue / hour.transactions)
    ])
  ]);

  // Apply styles to all sheets
  [kpiSheet, categorySheet, transactionSheet, bestSellersSheet, staffSheet, peakHoursSheet].forEach(sheet => {
    const range = XLSX.utils.decode_range(sheet['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (!sheet[cell_ref]) continue;
        
        // Header row styling
        if (R === 0) {
          sheet[cell_ref].s = {
            font: { bold: true, sz: 14 },
            fill: { fgColor: { rgb: "4F81BD" } },
            alignment: { horizontal: "center" }
          };
        }
        // Column headers styling
        else if (R === 2) {
          sheet[cell_ref].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "DCE6F1" } },
            alignment: { horizontal: "center" }
          };
        }
        // Data cells styling
        else {
          sheet[cell_ref].s = {
            alignment: { horizontal: "left" }
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
  XLSX.utils.book_append_sheet(workbook, bestSellersSheet, 'Best Sellers');
  XLSX.utils.book_append_sheet(workbook, staffSheet, 'Staff Performance');
  XLSX.utils.book_append_sheet(workbook, peakHoursSheet, 'Peak Hours');

  // Save workbook
  XLSX.writeFile(workbook, fileName);
};