'use client'
import { useEffect, useState } from 'react';
import { customerService } from '@/services/api/customerService';
import { getUsers, User } from '@/services/api/userService';

interface Customer { _id: string; name: string; phone: string; address: string; }

export default function SalesCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const users: User[] = await getUsers();
        const customers = users.filter(u => u.role === 'customer');
        setCustomers(customers.map(u => ({
          _id: u._id,
          name: u.name,
          phone: u.username,
          address: '',
        })));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Khách hàng</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên khách hàng</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đăng nhập</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {customers.map(c => (
            <tr key={c._id}>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{c.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{c.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{c.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 