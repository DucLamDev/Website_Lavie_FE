import apiClient from './client';

export interface Product {
  _id: string;
  name: string;
  unit: string;
  price: number;
  is_returnable: boolean;
  stock: number;
  image: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreate {
  name: string;
  unit: string;
  price: number;
  is_returnable: boolean;
  stock: number;
  image?: string;
  description?: string;
}

export const productService = {
  async getProducts(): Promise<Product[]> {
    const response = await apiClient.get('/products');
    return response.data;
  },

  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  async createProduct(productData: ProductCreate): Promise<Product> {
    const response = await apiClient.post('/products', productData);
    return response.data;
  },

  async updateProduct(id: string, productData: Partial<ProductCreate>): Promise<Product> {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  },

  async deleteProduct(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  async updateStock(id: string, stock: number): Promise<Product> {
    const response = await apiClient.put(`/products/${id}/stock`, { stock });
    return response.data;
  },
};

export default productService;
