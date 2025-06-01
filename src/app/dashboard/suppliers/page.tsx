"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaPlus, FaFileInvoice, FaEye, FaTruckLoading } from "react-icons/fa";
import apiClient from "@/services/api/client";
import { Modal } from "@/components/Modal";

interface Supplier {
  _id: string;
  name: string;
  contact_person: string;
  phone: string;
  email?: string;
  address: string;
  debt?: number;
}

interface Purchase {
  _id: string;
  purchaseDate: string;
  totalAmount: number;
  paidAmount: number;
  debtRemaining: number;
}

interface Product {
  _id: string;
  name: string;
  stock: number;
  price?: number;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isPurchasesLoading, setIsPurchasesLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: ''
  });
  const [showImportModal, setShowImportModal] = useState(false);
  const [importForm, setImportForm] = useState<{ supplierId: string; items: { productId: string; quantity: number; unitPrice: number }[] }>({ supplierId: '', items: [] });
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/suppliers");
      setSuppliers(res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách nhà cung cấp");
    }
    setIsLoading(false);
  };

  const openDetail = async (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowModal(true);
    setIsPurchasesLoading(true);
    try {
      const res = await apiClient.get(`/purchases?supplierId=${supplier._id}`);
      setPurchases(res.data);
    } catch (err) {
      toast.error("Không thể tải lịch sử nhập hàng");
      setPurchases([]);
    }
    setIsPurchasesLoading(false);
  };

  const openImportModal = async (supplier: Supplier) => {
    setImportForm({ supplierId: supplier._id, items: [] });
    setShowImportModal(true);
    try {
      const res = await apiClient.get('/products');
      setProducts(res.data);
    } catch {
      setProducts([]);
    }
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/suppliers', addForm);
      toast.success('Thêm nhà cung cấp thành công');
      setShowAddModal(false);
      setAddForm({ name: '', contact_person: '', phone: '', email: '', address: '' });
      fetchSuppliers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi khi thêm nhà cung cấp');
    }
  };

  const handleImportItemChange = (idx: number, field: string, value: any) => {
    setImportForm((prev) => {
      const items = [...prev.items];
      if (field === 'productId') {
        const product = products.find(p => p._id === value);
        let defaultPrice = 0;
        if (product && product.price) {
          defaultPrice = Math.max(0, product.price - 1000);
        }
        items[idx] = { ...items[idx], productId: value, unitPrice: defaultPrice };
      } else if (field === 'unitPrice') {
        // Không cho nhập giá nhập >= giá bán
        const product = products.find(p => p._id === items[idx].productId);
        if (product && product.price && value >= product.price) {
          toast.error('Giá nhập phải nhỏ hơn giá bán hiện tại!');
          return prev;
        }
        items[idx] = { ...items[idx], [field]: value };
      } else {
        items[idx] = { ...items[idx], [field]: value };
      }
      return { ...prev, items };
    });
  };

  const addImportItem = () => {
    setImportForm((prev) => ({ ...prev, items: [...prev.items, { productId: '', quantity: 1, unitPrice: 0 }] }));
  };

  const removeImportItem = (idx: number) => {
    setImportForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/purchases', importForm);
      toast.success('Nhập hàng thành công');
      setShowImportModal(false);
      fetchSuppliers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi khi nhập hàng');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý nhà cung cấp</h1>
        <button className="btn btn-primary flex items-center" onClick={() => setShowAddModal(true)}>
          <FaPlus className="mr-2" /> Thêm nhà cung cấp
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Liên hệ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Địa chỉ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Công nợ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {suppliers.map((s) => (
                <tr key={s._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{s.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {s.contact_person} - {s.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{s.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">{s.debt ? s.debt.toLocaleString("vi-VN") + " ₫" : "0 ₫"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="btn btn-sm btn-outline mr-2" onClick={() => openDetail(s)}><FaEye /></button>
                    <button className="btn btn-sm btn-outline mr-2" onClick={() => openImportModal(s)}><FaTruckLoading /></button>
                    <button className="btn btn-sm btn-outline"><FaFileInvoice /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Modal chi tiết nhà cung cấp */}
      {showModal && selectedSupplier && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="p-4">
            <h2 className="text-xl font-bold mb-2">Chi tiết nhà cung cấp</h2>
            <div className="mb-2">Tên: <b>{selectedSupplier.name}</b></div>
            <div className="mb-2">Liên hệ: {selectedSupplier.contact_person} - {selectedSupplier.phone}</div>
            <div className="mb-2">Địa chỉ: {selectedSupplier.address}</div>
            <div className="mb-2 text-red-600">Công nợ: <b>{selectedSupplier.debt?.toLocaleString("vi-VN") || 0} ₫</b></div>
            <h3 className="font-semibold mt-4 mb-2">Lịch sử nhập hàng</h3>
            {isPurchasesLoading ? (
              <div>Đang tải...</div>
            ) : purchases.length === 0 ? (
              <div>Chưa có phiếu nhập hàng nào</div>
            ) : (
              <table className="min-w-full text-sm mb-2">
                <thead>
                  <tr>
                    <th className="px-2 py-1">Ngày nhập</th>
                    <th className="px-2 py-1">Tổng tiền</th>
                    <th className="px-2 py-1">Đã thanh toán</th>
                    <th className="px-2 py-1">Còn nợ</th>
                    <th className="px-2 py-1">Hóa đơn</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => (
                    <tr key={p._id}>
                      <td className="px-2 py-1">{new Date(p.purchaseDate).toLocaleDateString()}</td>
                      <td className="px-2 py-1">{p.totalAmount.toLocaleString("vi-VN")} ₫</td>
                      <td className="px-2 py-1">{p.paidAmount.toLocaleString("vi-VN")} ₫</td>
                      <td className="px-2 py-1 text-red-500">{p.debtRemaining.toLocaleString("vi-VN")} ₫</td>
                      <td className="px-2 py-1"><a href={`/api/purchases/${p._id}/invoice`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Xuất PDF</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="flex justify-end mt-4">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Đóng</button>
            </div>
          </div>
        </Modal>
      )}
      {/* Modal thêm nhà cung cấp */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <form className="p-4 space-y-3" onSubmit={handleAddSupplier}>
            <h2 className="text-lg font-bold mb-2">Thêm nhà cung cấp</h2>
            <div>
              <label className="block mb-1">Tên nhà cung cấp</label>
              <input name="name" value={addForm.name} onChange={handleAddChange} className="input w-full" required />
            </div>
            <div>
              <label className="block mb-1">Người liên hệ</label>
              <input name="contact_person" value={addForm.contact_person} onChange={handleAddChange} className="input w-full" required />
            </div>
            <div>
              <label className="block mb-1">Số điện thoại</label>
              <input name="phone" value={addForm.phone} onChange={handleAddChange} className="input w-full" required />
            </div>
            <div>
              <label className="block mb-1">Email</label>
              <input name="email" value={addForm.email} onChange={handleAddChange} className="input w-full" />
            </div>
            <div>
              <label className="block mb-1">Địa chỉ</label>
              <input name="address" value={addForm.address} onChange={handleAddChange} className="input w-full" required />
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Hủy</button>
              <button type="submit" className="btn btn-primary">Thêm</button>
            </div>
          </form>
        </Modal>
      )}
      {/* Modal nhập hàng */}
      {showImportModal && (
        <Modal onClose={() => setShowImportModal(false)}>
          <form className="p-4 space-y-3" onSubmit={handleImportSubmit}>
            <h2 className="text-lg font-bold mb-2">Nhập hàng từ nhà cung cấp</h2>
            {importForm.items.map((item, idx) => (
              <div key={idx} className="flex space-x-2 items-end mb-2">
                <div className="flex-1">
                  <label className="block mb-1">Sản phẩm</label>
                  <select className="input w-full" value={item.productId} onChange={e => handleImportItemChange(idx, 'productId', e.target.value)} required>
                    <option value="">Chọn sản phẩm</option>
                    {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Số lượng</label>
                  <input type="number" min={1} className="input w-20" value={item.quantity} onChange={e => handleImportItemChange(idx, 'quantity', Number(e.target.value))} required />
                </div>
                <div>
                  <label className="block mb-1">Giá nhập</label>
                  <input type="number" min={0} className="input w-24" value={item.unitPrice} onChange={e => handleImportItemChange(idx, 'unitPrice', Number(e.target.value))} required />
                </div>
                <button type="button" className="btn btn-sm btn-outline" onClick={() => removeImportItem(idx)}>-</button>
              </div>
            ))}
            <button type="button" className="btn btn-sm btn-primary mb-2" onClick={addImportItem}>+ Thêm sản phẩm</button>
            <div className="flex justify-end mt-4 space-x-2">
              <button type="button" className="btn btn-outline" onClick={() => setShowImportModal(false)}>Hủy</button>
              <button type="submit" className="btn btn-primary">Nhập hàng</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
} 