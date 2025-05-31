'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { productService, Product } from '@/services/api/productService';
import { orderService } from '@/services/api/orderService';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function CustomerOrderPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getProducts();
        setProducts(data);
      } catch (error) {
        toast.error('Lỗi khi tải sản phẩm');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const found = prev.find((item) => item.product._id === product._id);
      if (found) {
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product._id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const handleOrder = async () => {
    if (!user) return;
    if (cart.length === 0) {
      toast.warning('Vui lòng chọn sản phẩm');
      return;
    }
    setIsSubmitting(true);
    try {
      const orderData = {
        customerId: user.id,
        orderItems: cart.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          unitPrice: item.product.price,
          total: item.product.price * item.quantity,
        })),
        paidAmount: 0,
        totalAmount: cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
        depositAmount: 0,
        totalPayment: cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      };
      await orderService.createOrder(orderData);
      toast.success('Đặt hàng thành công!');
      setCart([]);
      router.push('/customer/order-history');
    } catch (error: any) {
      toast.error('Lỗi khi đặt hàng: ' + (error.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Đặt hàng mới</h1>
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                <div className="font-medium text-lg mb-2">{product.name}</div>
                <div className="mb-2">Giá: {product.price?.toLocaleString('vi-VN')} đ</div>
                <button
                  className="btn btn-primary"
                  onClick={() => addToCart(product)}
                >
                  Thêm vào giỏ
                </button>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Giỏ hàng</h2>
            {cart.length === 0 ? (
              <div className="text-gray-500">Chưa có sản phẩm nào trong giỏ</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Sản phẩm</th>
                    <th className="px-4 py-2">Số lượng</th>
                    <th className="px-4 py-2">Thành tiền</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.product._id}>
                      <td className="px-4 py-2">{item.product.name}</td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product._id, Number(e.target.value))}
                          className="w-16 border rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-2">{(item.product.price * item.quantity).toLocaleString('vi-VN')} đ</td>
                      <td className="px-4 py-2">
                        <button className="text-red-600" onClick={() => removeFromCart(item.product._id)}>
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="mt-4 flex justify-end">
              <button
                className="btn btn-primary"
                onClick={handleOrder}
                disabled={isSubmitting || cart.length === 0}
              >
                {isSubmitting ? 'Đang đặt hàng...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 