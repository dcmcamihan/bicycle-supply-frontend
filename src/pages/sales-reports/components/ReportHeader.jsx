import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ReportHeader = ({ 
  dateRange, 
  onDateRangeChange, 
  reportType, 
  onReportTypeChange,
  onExportPDF,
  onExportExcel,
  onRefresh,
  customRange,
  onCustomRangeChange,
  activeRangeLabel,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const reportTypeOptions = [
    { value: 'daily', label: 'Daily Reports' },
    { value: 'weekly', label: 'Weekly Reports' },
    { value: 'monthly', label: 'Monthly Reports' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await onExportPDF();
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await onExportExcel();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6 shadow-subtle">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Section - Title and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground mb-1">
              Sales Reports
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              Comprehensive analytics and business insights
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              label=""
              placeholder="Select date range"
              options={dateRangeOptions}
              value={dateRange}
              onChange={onDateRangeChange}
              className="w-full sm:w-48"
            />
            
            <Select
              label=""
              placeholder="Report type"
              options={reportTypeOptions}
              value={reportType}
              onChange={onReportTypeChange}
              className="w-full sm:w-40"
            />
          </div>
          {activeRangeLabel && (
            <div className="mt-2 text-sm text-muted-foreground">
              {activeRangeLabel}
            </div>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            iconName="RefreshCw"
            iconPosition="left"
            iconSize={16}
          >
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            loading={isExporting}
            iconName="FileText"
            iconPosition="left"
            iconSize={16}
          >
            Export PDF
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            loading={isExporting}
            iconName="Download"
            iconPosition="left"
            iconSize={16}
          >
            Export Excel
          </Button>
        </div>
      </div>

      {/* Custom Date Range Inputs */}
      {(dateRange === 'custom' || reportType === 'custom' || (typeof dateRange === 'object' && dateRange)) && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block font-body text-sm font-medium text-foreground mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-input border border-border rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                value={customRange?.start || ''}
                onChange={(e)=> onCustomRangeChange?.({ ...customRange, start: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <label className="block font-body text-sm font-medium text-foreground mb-1">
                End Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-input border border-border rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                value={customRange?.end || ''}
                onChange={(e)=> onCustomRangeChange?.({ ...customRange, end: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportHeader;