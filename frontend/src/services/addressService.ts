import api from './api';

export interface Address {
  _id: string;
  user: string;
  fullName: string;
  phone: string;
  flat: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  addressType: 'Home' | 'Office' | 'Other';
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type AddressInput = Omit<Address, '_id' | 'user' | 'createdAt' | 'updatedAt'>;

const getMyAddresses = async () => {
  const response = await api.get<Address[]>('/addresses');
  return response.data;
};

const getAddressById = async (id: string) => {
  const response = await api.get<Address>(`/addresses/${id}`);
  return response.data;
};

const createAddress = async (data: Partial<AddressInput>) => {
  const response = await api.post<Address>('/addresses', data);
  return response.data;
};

const updateAddress = async (id: string, data: Partial<AddressInput>) => {
  const response = await api.put<Address>(`/addresses/${id}`, data);
  return response.data;
};

const deleteAddress = async (id: string) => {
  const response = await api.delete(`/addresses/${id}`);
  return response.data;
};

export const addressService = {
  getMyAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
};
