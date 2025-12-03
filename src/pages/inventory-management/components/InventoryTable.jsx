import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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
    <div className="bg-card border border-border rounded-lg shadow-subtle overflow-hidden w-full overflow-x-auto">
      {/* Table Header */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="w-12 px-2 sm:px-4 py-3 text-left">
                <Checkbox
                  checked={selectedItems?.length === products?.length && products?.length > 0}
                  indeterminate={selectedItems?.length > 0 && selectedItems?.length < products?.length}
                  onChange={(e) => onSelectAll(e?.target?.checked)}
                />
              </th>
              <th className="px-2 sm:px-4 py-3 text-left font-body font-semibold text-xs sm:text-sm text-foreground">
                Product
              </th>
              <th className="px-2 sm:px-4 py-3 text-left font-body font-semibold text-xs sm:text-sm text-foreground cursor-pointer hover:bg-muted/80 transition-micro hidden sm:table-cell"
                  onClick={() => handleSort('sku')}>
                <div className="flex items-center gap-1">
                  <span>SKU</span>
                  <Icon name={getSortIcon('sku')} size={12} className="text-muted-foreground" />
                </div>
              </th>
              <th className="px-2 sm:px-4 py-3 text-left font-body font-semibold text-xs sm:text-sm text-foreground cursor-pointer hover:bg-muted/80 transition-micro hidden md:table-cell"
                  onClick={() => handleSort('category')}>
                <div className="flex items-center gap-1">
                  <span>Category</span>
                  <Icon name={getSortIcon('category')} size={12} className="text-muted-foreground" />
                </div>
              </th>
              <th className="px-2 sm:px-4 py-3 text-left font-body font-semibold text-xs sm:text-sm text-foreground cursor-pointer hover:bg-muted/80 transition-micro"
                  onClick={() => handleSort('stock')}>
                <div className="flex items-center gap-1">
                  <span>Stock</span>
                  <Icon name={getSortIcon('stock')} size={12} className="text-muted-foreground" />
                </div>
              </th>
              <th className="px-2 sm:px-4 py-3 text-left font-body font-semibold text-xs sm:text-sm text-foreground cursor-pointer hover:bg-muted/80 transition-micro hidden lg:table-cell"
                  onClick={() => handleSort('price')}>
                <div className="flex items-center gap-1">
                  <span>Price</span>
                  <Icon name={getSortIcon('price')} size={12} className="text-muted-foreground" />
                </div>
              </th>
              <th className="w-auto px-2 sm:px-4 py-3 text-right font-body font-semibold text-xs sm:text-sm text-foreground">
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
                <td className="px-2 sm:px-4 py-4">
                  <Checkbox
                    checked={selectedItems?.includes(product?.id)}
                    onChange={(e) => onSelectItem(product?.id, e?.target?.checked)}
                  />
                </td>
                <td className="px-2 sm:px-4 py-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={product?.image_url || product?.image}
                        alt={product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <button
                        className="font-body font-medium text-xs sm:text-sm text-primary underline underline-offset-2 hover:text-primary/80 truncate text-left bg-transparent border-0 p-0 cursor-pointer"
                        onClick={() => navigate(`/inventory-management/product-details?id=${product?.id}`)}
                        title={product?.name}
                        type="button"
                      >
                        {product?.name}
                      </button>
                      <p className="font-caption text-xs text-muted-foreground truncate">
                        {product?.brand}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-4 hidden sm:table-cell">
                  <span className="font-data text-xs sm:text-sm text-foreground">
                    {product?.id}
                  </span>
                </td>
                <td className="px-2 sm:px-4 py-4 hidden md:table-cell">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                    {product?.category}
                  </span>
                </td>
                <td className="px-2 sm:px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-body font-medium text-xs sm:text-sm text-foreground">
                        {product?.stock}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
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
                <td className="px-2 sm:px-4 py-4 hidden lg:table-cell">
                  <span className="font-body font-medium text-xs sm:text-sm text-foreground">
                    {formatCurrency(product?.price)}
                  </span>
                </td>
                <td className="px-2 sm:px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(product)}
                      iconName="Edit"
                      iconSize={14}
                      className="h-7 w-7 sm:h-8 sm:w-8"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(product)}
                      iconName="Trash2"
                      iconSize={14}
                      className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive"
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
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
          <div className="w-12 sm:w-16 h-12 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Icon name="Package" size={24} className="text-muted-foreground" />
          </div>
          <h3 className="font-heading font-semibold text-base sm:text-lg text-foreground mb-2">
            No products found
          </h3>
          <p className="font-body text-xs sm:text-sm text-muted-foreground text-center max-w-sm">
            No products match your current filters. Try adjusting your search criteria or add new products to your inventory.
          </p>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;