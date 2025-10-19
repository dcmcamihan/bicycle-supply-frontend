import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const InventoryTable = ({ 
  products, 
  selectedItems, 
  onSelectItem, 
  onSelectAll, 
  onEdit, 
  onDuplicate, 
  onDelete,
  sortConfig,
  onSort 
}) => {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[InventoryTable] mounted. products:', products);
  }, [products]);
  const [hoveredRow, setHoveredRow] = useState(null);

  const getStockStatusColor = (stock, reorderLevel) => {
    if (stock <= 0) return 'text-destructive bg-destructive/10';
    if (stock <= reorderLevel) return 'text-warning bg-warning/10';
    return 'text-success bg-success/10';
  };

  const getStockStatusText = (stock, reorderLevel) => {
  if (stock <= 0) return 'Out of Stock';
  if (stock <= reorderLevel) return 'Low Stock';
  return 'In Stock';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSortIcon = (column) => {
    if (sortConfig?.key !== column) return 'ArrowUpDown';
    return sortConfig?.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const handleSort = (column) => {
    onSort(column);
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-subtle overflow-hidden">
      {/* Table Header */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <Checkbox
                  checked={selectedItems?.length === products?.length && products?.length > 0}
                  indeterminate={selectedItems?.length > 0 && selectedItems?.length < products?.length}
                  onChange={(e) => onSelectAll(e?.target?.checked)}
                />
              </th>
              <th className="px-4 py-3 text-left font-body font-semibold text-sm text-foreground">
                Product
              </th>
              <th className="px-4 py-3 text-left font-body font-semibold text-sm text-foreground cursor-pointer hover:bg-muted/80 transition-micro"
                  onClick={() => handleSort('sku')}>
                <div className="flex items-center space-x-1">
                  <span>SKU</span>
                  <Icon name={getSortIcon('sku')} size={14} className="text-muted-foreground" />
                </div>
              </th>
              <th className="px-4 py-3 text-left font-body font-semibold text-sm text-foreground cursor-pointer hover:bg-muted/80 transition-micro"
                  onClick={() => handleSort('category')}>
                <div className="flex items-center space-x-1">
                  <span>Category</span>
                  <Icon name={getSortIcon('category')} size={14} className="text-muted-foreground" />
                </div>
              </th>
              <th className="px-4 py-3 text-left font-body font-semibold text-sm text-foreground cursor-pointer hover:bg-muted/80 transition-micro"
                  onClick={() => handleSort('stock')}>
                <div className="flex items-center space-x-1">
                  <span>Stock</span>
                  <Icon name={getSortIcon('stock')} size={14} className="text-muted-foreground" />
                </div>
              </th>
              <th className="px-4 py-3 text-left font-body font-semibold text-sm text-foreground cursor-pointer hover:bg-muted/80 transition-micro"
                  onClick={() => handleSort('price')}>
                <div className="flex items-center space-x-1">
                  <span>Price</span>
                  <Icon name={getSortIcon('price')} size={14} className="text-muted-foreground" />
                </div>
              </th>
              <th className="w-32 px-4 py-3 text-right font-body font-semibold text-sm text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products?.map((product) => (
              <tr 
                key={product?.id}
                className={`hover:bg-muted/50 transition-micro ${
                  selectedItems?.includes(product?.id) ? 'bg-primary/5' : ''
                }`}
                onMouseEnter={() => setHoveredRow(product?.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-4 py-4">
                  <Checkbox
                    checked={selectedItems?.includes(product?.id)}
                    onChange={(e) => onSelectItem(product?.id, e?.target?.checked)}
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={product?.image}
                        alt={product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-body font-medium text-sm text-foreground truncate">
                        {product?.name}
                      </p>
                      <p className="font-caption text-xs text-muted-foreground truncate">
                        {product?.brand}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="font-data text-sm text-foreground">
                    {product?.id}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                    {product?.category}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-body font-medium text-sm text-foreground">
                        {product?.stock}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        getStockStatusColor(product?.stock, product?.reorderLevel)
                      }`}>
                        {getStockStatusText(product?.stock, product?.reorderLevel)}
                      </span>
                    </div>
                      {getStockStatusText(product?.stock, product?.reorderLevel) === 'Low Stock' && (
                        <p className="font-caption text-xs text-muted-foreground">
                          Reorder at: {product?.reorderLevel}
                        </p>
                      )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="font-body font-medium text-sm text-foreground">
                    {formatCurrency(product?.price)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(product)}
                      iconName="Edit"
                      iconSize={16}
                      className="h-8 w-8"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDuplicate(product)}
                      iconName="Copy"
                      iconSize={16}
                      className="h-8 w-8"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(product)}
                      iconName="Trash2"
                      iconSize={16}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Empty State */}
      {products?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Icon name="Package" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
            No products found
          </h3>
          <p className="font-body text-sm text-muted-foreground text-center max-w-sm">
            No products match your current filters. Try adjusting your search criteria or add new products to your inventory.
          </p>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;