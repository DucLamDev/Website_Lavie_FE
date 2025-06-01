'use client'
import { useEffect, useState } from 'react';
import { customerService } from '@/services/api/customerService';
import { productService } from '@/services/api/productService';
import { orderService } from '@/services/api/orderService';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { getUsers, User } from '@/services/api/userService';

interface Product { _id: string; name: string; price: number; is_returnable: boolean; stock?: number; }
interface Customer { _id: string; name: string; phone: string; address: string; }
interface CartItem { product: Product; quantity: number; returnable_quantity?: number; }

export default function SalesOrderPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Lấy user role customer
        const users: User[] = await getUsers();
        const customers = users.filter(u => u.role === 'customer');
        setCustomers(customers.map(u => ({
          _id: u._id,
          name: u.name,
          phone: u.username,
          address: '',
        })));
        const prods = await productService.getProducts();
        setProducts(prods);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const addToCart = (product: Product, quantity: number) => {
    if (quantity <= 0) return;
    setCart(prev => {
      const exist = prev.find(item => item.product._id === product._id);
      if (exist) {
        return prev.map(item => item.product._id === product._id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { product, quantity }];
    });
    toast.success(`Đã thêm ${product.name} x${quantity} vào giỏ hàng`);
  };

  const handleOrder = async () => {
    if (!selectedCustomer) {
      toast.error('Vui lòng chọn khách hàng!');
      return;
    }
    if (cart.length === 0) {
      toast.error('Vui lòng thêm sản phẩm vào giỏ hàng!');
      return;
    }
    setIsSubmitting(true);
    try {
      await orderService.createOrder({
        customerId: selectedCustomer._id,
        orderItems: cart.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          unitPrice: item.product.price,
          returnable_quantity: item.product.is_returnable ? (item.returnable_quantity || 0) : 0
        })),
        staffId: user?.id,
        staffName: user?.name
      });
      toast.success('Đặt hàng thành công!');
      setCart([]);
    } catch (error: any) {
      if (error?.response?.data?.message) {
        toast.error('Lỗi: ' + error.response.data.message);
      } else {
        toast.error('Đặt hàng thất bại!');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Đặt hàng tại quầy</h1>
      <div className="mb-4">
        <label className="block font-medium mb-1">Chọn khách hàng</label>
        <select className="input text-gray-900" value={selectedCustomer?._id || ''} onChange={e => {
          const found = customers.find(c => c._id === e.target.value);
          setSelectedCustomer(found || null);
        }}>
          <option value="">-- Chọn khách hàng --</option>
          {customers.map(c => <option key={c._id} value={c._id} className="text-gray-900">{c.name} ({c.phone})</option>)}
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Chọn sản phẩm</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map(product => (
            <div key={product._id} className="border rounded p-3 flex flex-col">
              <span className="font-semibold text-gray-900">{product.name}</span>
              <span className="text-gray-500">{product.price.toLocaleString('vi-VN')} đ</span>
              {product.stock !== undefined && (
                <span className="text-xs text-gray-600">Tồn kho: {product.stock}</span>
              )}
              <input type="number" min={1} defaultValue={1} className="input mt-2" id={`qty-${product._id}`} />
              <button className="btn btn-primary mt-2" onClick={() => {
                const input = document.getElementById(`qty-${product._id}`) as HTMLInputElement | null;
                const qty = input ? Number(input.value) : 1;
                addToCart(product, qty);
              }}>Thêm</button>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <h2 className="font-medium mb-2">Giỏ hàng</h2>
        {cart.length === 0 ? (
          <div className="text-gray-500">Chưa có sản phẩm trong giỏ hàng</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 mb-4 text-gray-900">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bình rỗng đổi trả</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cart.map((item, idx) => (
                  <tr key={item.product._id}>
                    <td className="px-4 py-2">{item.product.name}</td>
                    <td className="px-4 py-2">{item.quantity}</td>
                    <td className="px-4 py-2">
                      {item.product.is_returnable ? (
                        <input
                          type="number"
                          min={0}
                          max={item.quantity}
                          value={item.returnable_quantity || 0}
                          onChange={e => {
                            const val = Math.max(0, Math.min(Number(e.target.value), item.quantity));
                            setCart(prev => prev.map((it, i) => i === idx ? { ...it, returnable_quantity: val } : it));
                          }}
                          className="w-16 border rounded px-2 py-1"
                        />
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{(item.product.price * item.quantity).toLocaleString('vi-VN')} đ</td>
                    <td className="px-4 py-2">
                      <button className="text-red-600" onClick={() => setCart(prev => prev.filter(i => i.product._id !== item.product._id))}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end">
              <button className="px-6 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"  onClick={handleOrder}>Đặt hàng</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 