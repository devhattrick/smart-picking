// src/pages/Home.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import type { AppOutletContext, Product } from '../types';

interface ProductFormData {
  id: number | null;
  name: string;
  sku: string;
  stock: number;
}

export default function Home() {
  // ดึงข้อมูลสินค้ามาจาก Layout
  const { products, setProducts } = useOutletContext<AppOutletContext>();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({ id: null, name: '', sku: '', stock: 0 });

  // ฟังก์ชันบันทึกข้อมูล (ใช้ได้ทั้งเพิ่มและแก้ไข)
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.id !== null) {
      // กรณีแก้ไข
      const updatedProduct: Product = { ...formData, id: formData.id, stock: Number(formData.stock) };
      setProducts(products.map(p => p.id === formData.id ? updatedProduct : p));
    } else {
      // กรณีเพิ่มใหม่
      const newProduct: Product = { ...formData, id: Date.now(), stock: Number(formData.stock) };
      setProducts([...products, newProduct]);
    }
    closeForm();
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData({ id: null, name: '', sku: '', stock: 0 });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">รายการสินค้า</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm shadow-sm hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} /> เพิ่มสินค้า
        </button>
      </div>

      {/* ฟอร์มเพิ่ม/แก้ไขสินค้า */}
      {showForm && (
        <div className="bg-white p-4 rounded-xl shadow-md border border-primary-100 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-primary-700">{formData.id ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h3>
            <button onClick={closeForm} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">รหัสสินค้า (SKU)</label>
              <input type="text" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">ชื่อสินค้า</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            {/* <div>
              <label className="block text-xs text-gray-500 mb-1">จำนวนตั้งต้น</label>
              <input type="number" required min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div> */}
            <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              บันทึกข้อมูล
            </button>
          </form>
        </div>
      )}

      {/* รายการสินค้าในระบบ */}
      <div className="space-y-3 pb-4">
        {products.map((product: Product) => (
          <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <div className="text-xs text-primary-600 font-semibold mb-0.5">{product.sku}</div>
              <div className="font-medium text-gray-800 leading-tight">{product.name}</div>
              <div className="text-sm text-gray-500 mt-1">คงเหลือ: <span className="font-semibold text-gray-800">{product.stock}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setFormData(product); setShowForm(true); }} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Edit size={16} />
              </button>
              <button onClick={() => { if (window.confirm('ยืนยันลบสินค้านี้ใช่หรือไม่?')) setProducts(products.filter(p => p.id !== product.id)) }} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="text-center text-gray-500 py-8 text-sm">ไม่มีข้อมูลสินค้า กรุณาเพิ่มสินค้า</div>
        )}
      </div>
    </div>
  );
}
