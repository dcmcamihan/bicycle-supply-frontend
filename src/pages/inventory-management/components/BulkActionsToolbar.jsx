import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const BulkActionsToolbar = ({ 
  selectedCount, 
  onBulkEdit, 
  onBulkDelete, 
  onBulkExport,
  onBulkPriceUpdate,
  onBulkCategoryUpdate,
  onClearSelection 
}) => {
  const [showActions, setShowActions] = useState(false);

  const actionOptions = [
    { value: 'edit', label: 'Edit Selected', icon: 'Edit' },
    { value: 'price-update', label: 'Update Prices', icon: 'DollarSign' },
    { value: 'category-update', label: 'Change Category', icon: 'Tag' },
    { value: 'export', label: 'Export Data', icon: 'Download' },
    { value: 'delete', label: 'Delete Selected', icon: 'Trash2' }
  ];

  const handleActionSelect = (action) => {
    switch (action) {
      case 'edit':
        onBulkEdit();
        break;
      case 'price-update':
        onBulkPriceUpdate();
        break;
      case 'category-update':
        onBulkCategoryUpdate();
        break;
      case 'export':
        onBulkExport();
        break;
      case 'delete':
        onBulkDelete();
        break;
      default:
        break;
    }
    setShowActions(false);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={20} className="text-primary" />
            <span className="font-body font-medium text-sm text-foreground">
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <div className="h-4 w-px bg-border"></div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              iconName="Settings"
              iconPosition="left"
              iconSize={16}
            >
              Bulk Actions
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              iconName="X"
              iconSize={16}
            >
              Clear Selection
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkExport}
            iconName="Download"
            iconPosition="left"
            iconSize={16}
          >
            Export
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            iconName="Trash2"
            iconPosition="left"
            iconSize={16}
          >
            Delete
          </Button>
        </div>
      </div>
      {/* Expanded Actions Menu */}
      {showActions && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {actionOptions?.map((action) => (
              <Button
                key={action?.value}
                variant="ghost"
                size="sm"
                onClick={() => handleActionSelect(action?.value)}
                iconName={action?.icon}
                iconPosition="left"
                iconSize={16}
                className={`justify-start ${
                  action?.value === 'delete' ? 'text-destructive hover:text-destructive' : ''
                }`}
              >
                {action?.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActionsToolbar;