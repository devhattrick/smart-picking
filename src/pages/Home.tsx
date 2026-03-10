// src/pages/Home.tsx
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertTriangle, Plus, Edit, Trash2, X } from 'lucide-react';
import type { AppOutletContext, Product } from '../types';

interface ProductFormData extends Omit<Product, 'id'> {
  id: number | null;
}

const emptyFormData: ProductFormData = {
  id: null,
  name: '',
  sku: '',
  binLocation: '',
  documentNo: '',
  unit: '',
  lotNo: '',
  manufacturingDate: '',
  expiryDate: '',
  stock: 0,
};

export default function Home() {
  // ดึงข้อมูลสินค้ามาจาก Layout
  const { products, setProducts } = useOutletContext<AppOutletContext>();
  const [showForm, setShowForm] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyFormData);
  const filteredProducts = products.filter((product) =>
    `${product.sku} ${product.name}`.toLowerCase().includes(nameFilter.trim().toLowerCase())
  );

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('th-TH');
  };

  const isInvalidDateRange = Boolean(
    formData.manufacturingDate &&
    formData.expiryDate &&
    formData.expiryDate < formData.manufacturingDate
  );

  useEffect(() => {
    if (!deleteTarget) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDeleteTarget(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteTarget]);

  // ฟังก์ชันบันทึกข้อมูล (ใช้ได้ทั้งเพิ่มและแก้ไข)
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalizedData = {
      ...formData,
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      binLocation: formData.binLocation.trim(),
      documentNo: formData.documentNo.trim(),
      unit: formData.unit.trim(),
      lotNo: formData.lotNo.trim(),
      stock: Number(formData.stock) || 0,
    };

    if (isInvalidDateRange) {
      return;
    }

    if (formData.id !== null) {
      // กรณีแก้ไข
      const updatedProduct: Product = { ...normalizedData, id: formData.id };
      setProducts(products.map(p => p.id === formData.id ? updatedProduct : p));
    } else {
      // กรณีเพิ่มใหม่
      const newProduct: Product = { ...normalizedData, id: Date.now() };
      setProducts([...products, newProduct]);
    }
    closeForm();
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData(emptyFormData);
  };

  const openDeletePopup = (product: Product) => {
    setDeleteTarget({
      id: product.id,
      label: `[${product.sku}] ${product.name}`,
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setProducts(prevProducts => prevProducts.filter(product => product.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-800">รายการสินค้า</h2>
        <button
          onClick={() => {
            setFormData(emptyFormData);
            setShowForm(true);
          }}
          className="bg-primary-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-sm shadow-sm hover:bg-primary-700 transition-colors w-full sm:w-auto"
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
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">รหัสสินค้า</label>
              <input type="text" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">ชื่อสินค้า</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Bin Location</label>
              <input type="text" required value={formData.binLocation} onChange={e => setFormData({ ...formData, binLocation: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">เลขที่เอกสาร</label>
              <input type="text" required value={formData.documentNo} onChange={e => setFormData({ ...formData, documentNo: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">หน่วย</label>
              <input type="text" required value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Lot No.</label>
              <input type="text" required value={formData.lotNo} onChange={e => setFormData({ ...formData, lotNo: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">วันที่ผลิต</label>
              <input type="date" required value={formData.manufacturingDate} onChange={e => setFormData({ ...formData, manufacturingDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">วันหมดอายุ</label>
              <input type="date" required min={formData.manufacturingDate || undefined} value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" />
            </div>
            {isInvalidDateRange && (
              <div className="text-xs text-red-600 sm:col-span-2 lg:col-span-3">
                วันหมดอายุต้องไม่น้อยกว่าวันที่ผลิต
              </div>
            )}
            <button type="submit" disabled={isInvalidDateRange} className="w-full bg-primary-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed sm:col-span-2 lg:col-span-3">
              บันทึกข้อมูล
            </button>
          </form>
        </div>
      )}

      {/* รายการสินค้าในระบบ */}
      <div className="space-y-3 pb-4">
        <div className="bg-white p-3 rounded-xl border border-gray-100">
          <label htmlFor="product-name-filter" className="block text-xs text-gray-500 mb-1">
            ค้นหาชื่อสินค้า
          </label>
          <input
            id="product-name-filter"
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="พิมพ์ชื่อสินค้า..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {filteredProducts.map((product: Product) => (
          <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center items-start gap-3">
            <div>
              <div className="text-xs text-primary-600 font-semibold mb-0.5">รหัสสินค้า: {product.sku}</div>
              <div className="font-medium text-gray-800 leading-tight">{product.name}</div>
              <div className="text-sm text-gray-500 mt-1">
                คงเหลือ: <span className="font-semibold text-gray-800">{product.stock}</span> {product.unit}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                <div>Bin Location: <span className="text-gray-700">{product.binLocation}</span></div>
                <div>เลขที่เอกสาร: <span className="text-gray-700">{product.documentNo}</span></div>
                <div>Lot No.: <span className="text-gray-700">{product.lotNo}</span></div>
                <div>วันที่ผลิต: <span className="text-gray-700">{formatDate(product.manufacturingDate)}</span></div>
                <div>วันหมดอายุ: <span className="text-gray-700">{formatDate(product.expiryDate)}</span></div>
              </div>
            </div>
            <div className="flex gap-2 self-end sm:self-auto">
              <button onClick={() => { setFormData(product); setShowForm(true); }} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Edit size={16} />
              </button>
              <button onClick={() => openDeletePopup(product)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="text-center text-gray-500 py-8 text-sm">ไม่มีข้อมูลสินค้า กรุณาเพิ่มสินค้า</div>
        )}
        {products.length > 0 && filteredProducts.length === 0 && (
          <div className="text-center text-gray-500 py-8 text-sm">ไม่พบสินค้าที่ตรงกับคำค้นหา</div>
        )}
      </div>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-[2px]"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setDeleteTarget(null);
            }
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-rose-100 bg-white p-5 shadow-2xl">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
              <AlertTriangle size={30} className="text-rose-600" />
            </div>
            <h4 className="text-center text-lg font-semibold text-slate-800">ยืนยันการลบสินค้า</h4>
            <p className="mt-1 text-center text-sm text-slate-500">
              รายการ <span className="font-medium text-slate-700">{deleteTarget.label}</span> จะถูกลบออกจากระบบ
            </p>
            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="w-full rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
              >
                ลบสินค้า
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
