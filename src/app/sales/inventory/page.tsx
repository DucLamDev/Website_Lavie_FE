'use client'
import { useEffect, useState } from 'react';
import { reportService } from '@/services/api/reportService';
import type { InventorySummary } from '@/services/api/inventoryService';

// Định nghĩa type cho item tồn kho lấy từ reportService
interface InventoryItem {
  productId: string;
  productName: string;
  inStock: number;
}

export default function SalesInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await reportService.getInventoryReport();
        // Gộp các sản phẩm tồn kho (lowStock, outOfStock, mostStocked) thành 1 mảng
        const allProducts = [
          ...(data.lowStockProducts || []),
          ...(data.outOfStockProducts || []),
          ...(data.mostStockedProducts || [])
        ];
        // Loại trùng productId
        const unique = Object.values(
          allProducts.reduce((acc: Record<string, InventoryItem>, item: any) => {
            acc[item.productId] = {
              productId: item.productId,
              productName: item.productName,
              inStock: item.inStock
            };
            return acc;
          }, {})
        ) as InventoryItem[];
        setInventory(unique);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Tồn kho</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {inventory.map(item => (
            <tr key={item.productId}>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.productName || item.productId}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.inStock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 