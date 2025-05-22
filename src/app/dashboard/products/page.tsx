'use client'

import { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaWater, FaBoxes } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { productService } from '@/services/api/productService'

type Product = {
  _id: string
  name: string
  unit: string
  price: number
  is_returnable: boolean
  stock: number
  createdAt: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    price: 0,
    is_returnable: false,
    stock: 0,
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const data = await productService.getProducts()
      setProducts(data)
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm!')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData({
      ...formData,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
          ? Number(value)
          : value
    })
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newProduct = await productService.createProduct(formData)
      setProducts([...products, newProduct])
      resetForm()
      setShowAddModal(false)
      toast.success('Thêm sản phẩm thành công')
    } catch (error) {
      toast.error('Không thể thêm sản phẩm!')
    }
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return
    try {
      const updated = await productService.updateProduct(selectedProduct._id, formData)
      setProducts(products.map(product => product._id === selectedProduct._id ? updated : product))
      resetForm()
      setShowEditModal(false)
      toast.success('Cập nhật sản phẩm thành công')
    } catch (error) {
      toast.error('Không thể cập nhật sản phẩm!')
    }
  }

  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      const updated = await productService.updateStock(id, newStock)
      setProducts(products.map(product => product._id === id ? updated : product))
      toast.success('Cập nhật tồn kho thành công')
    } catch (error) {
      toast.error('Không thể cập nhật tồn kho!')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) return
    try {
      await productService.deleteProduct(id)
      setProducts(products.filter(product => product._id !== id))
      toast.success('Xóa sản phẩm thành công')
    } catch (error) {
      toast.error('Không thể xóa sản phẩm!')
    }
  }

  const openEditModal = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      unit: product.unit,
      price: product.price,
      is_returnable: product.is_returnable,
      stock: product.stock,
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      unit: '',
      price: 0,
      is_returnable: false,
      stock: 0,
    })
    setSelectedProduct(null)
  }

  const filteredProducts = products
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý sản phẩm</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center"
        >
          <FaPlus className="mr-2" />
          Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between mb-4 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
              {products.map(product => (
                <div key={product._id} className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-600">
                  <div className="p-4 bg-primary-50 dark:bg-primary-900 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                      <FaWater className="text-primary-600 dark:text-primary-300 text-2xl" />
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{product.name}</h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Đơn vị:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{product.unit}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Giá:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Tồn kho:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{product.stock} {product.unit}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Loại:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {product.is_returnable ? 'Có vỏ hoàn trả' : 'Không hoàn trả'}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-primary-600 hover:text-primary-900 dark:hover:text-primary-400 flex items-center"
                      >
                        <FaEdit className="mr-1" />
                        Sửa
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400 flex items-center"
                      >
                        <FaTrash className="mr-1" />
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-inner border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FaBoxes className="mr-2" />
                Cập nhật tồn kho
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sản phẩm</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tồn kho hiện tại</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cập nhật</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredProducts.map(product => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.unit}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.stock}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center">
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                className="input w-24"
                                min="0"
                                value={product.stock}
                                onChange={(e) => handleUpdateStock(product._id, Number(e.target.value))}
                              />
                              <button
                                onClick={() => handleUpdateStock(product._id, product.stock)}
                                className="btn btn-primary"
                                disabled={true}
                              >
                                Cập nhật
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Thêm sản phẩm mới</h2>

            <form onSubmit={handleAddProduct}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="label">Tên sản phẩm</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="input"
                    placeholder="Nhập tên sản phẩm"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="unit" className="label">Đơn vị</label>
                  <input
                    type="text"
                    id="unit"
                    name="unit"
                    className="input"
                    placeholder="Nhập đơn vị (Bình, Chai, Thùng, ...)"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="price" className="label">Giá (VNĐ)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    className="input"
                    placeholder="Nhập giá sản phẩm"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="stock" className="label">Tồn kho ban đầu</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    className="input"
                    placeholder="Nhập số lượng tồn kho ban đầu"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_returnable"
                    name="is_returnable"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={formData.is_returnable}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="is_returnable" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Sản phẩm có vỏ hoàn trả
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    resetForm()
                    setShowAddModal(false)
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Thêm sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Chỉnh sửa sản phẩm</h2>

            <form onSubmit={handleEditProduct}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="label">Tên sản phẩm</label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    className="input"
                    placeholder="Nhập tên sản phẩm"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-unit" className="label">Đơn vị</label>
                  <input
                    type="text"
                    id="edit-unit"
                    name="unit"
                    className="input"
                    placeholder="Nhập đơn vị (Bình, Chai, Thùng, ...)"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-price" className="label">Giá (VNĐ)</label>
                  <input
                    type="number"
                    id="edit-price"
                    name="price"
                    className="input"
                    placeholder="Nhập giá sản phẩm"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-is_returnable"
                    name="is_returnable"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={formData.is_returnable}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="edit-is_returnable" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Sản phẩm có vỏ hoàn trả
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    resetForm()
                    setShowEditModal(false)
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
