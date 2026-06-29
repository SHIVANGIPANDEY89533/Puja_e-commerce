import api from './api';

export type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  stock: number;
  images: string[];
  description: string;
  features: string[];
  rating: number;
  createdAt: string;
  updatedAt: string;
};

export interface Category {
  _id: string;
  name: string;
  icon?: string;
  banner?: string;
  description?: string;
}

const API_URL = 'http://localhost:5000/api/products';
const CATEGORY_API_URL = 'http://localhost:5000/api/categories';

const getProducts = async (categoryId?: string, search?: string, sort?: string, minPrice?: number, maxPrice?: number) => {
  const params: any = {};
  if (categoryId) params.categoryId = categoryId;
  if (search) params.search = search;
  if (sort) params.sort = sort;
  if (minPrice !== undefined) params.minPrice = minPrice;
  if (maxPrice !== undefined) params.maxPrice = maxPrice;
  
  const response = await api.get<Product[]>('/products', { params });
  return response.data;
};

const getProductById = async (id: string) => {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
};

const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

const getSimilarProducts = async (id: string, categoryId?: string) => {
  const params: any = {};
  if (categoryId) params.categoryId = categoryId;
  const response = await api.get<Product[]>(`/products/${id}/similar`, { params });
  return response.data;
};

const addProduct = async (productData: Partial<Product>) => {
  const response = await api.post<Product>('/products', productData);
  return response.data;
};

const updateProduct = async (id: string, productData: Partial<Product>) => {
  const response = await api.put<Product>(`/products/${id}`, productData);
  return response.data;
};

const deleteProduct = async (id: string) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

const bulkUploadProducts = async (products: Partial<Product>[]) => {
  const response = await api.post('/products/bulk', { products });
  return response.data;
};

export const productService = {
  getProducts,
  getProductById,
  getCategories,
  getSimilarProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  bulkUploadProducts,
};
