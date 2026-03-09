// src/pages/Inbound.jsx
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { locations } from '../data/mockData';

export default function Inbound() {
    const { products, setProducts, history, setHistory } = useOutletContext();

    const [formData, setFormData] = useState({
        productId: '',
        quantity: '',
        location: locations[0],
        person: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const qty = Number(formData.quantity);
        const prodId = Number(formData.productId);

        if (!prodId || qty <= 0 || !formData.person) return alert('กรุณากรอกข้อมูลให้ครบถ้วน');

        // 1. เพิ่มสต๊อกสินค้า
        setProducts(products.map(p =>
            p.id === prodId ? { ...p, stock: p.stock + qty } : p
        ));

        // 2. บันทึกประวัติ
        const newLog = {
            id: Date.now(),
            type: 'IN',
            productId: prodId,
            quantity: qty,
            location: formData.location,
            person: formData.person,
            timestamp: new Date().toISOString(),
        };
        setHistory([newLog, ...history]);

        alert('บันทึกการนำเข้าเรียบร้อย!');
        setFormData({ productId: '', quantity: '', location: locations[0], person: '' });
    };

    return (
        <div className="animate-in fade-in duration-300">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 border-gray-200">นำเข้าสินค้า (Inbound)</h2>

            <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm border border-primary-100 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เลือกสินค้า</label>
                    <select required value={formData.productId} onChange={e => setFormData({ ...formData, productId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 bg-white">
                        <option value="">-- กรุณาเลือกสินค้า --</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>[{p.sku}] {p.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนนำเข้า</label>
                    <input type="number" required min="1" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500" placeholder="ระบุจำนวน" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">สถานที่จัดเก็บ</label>
                    <input
                        list="locations-list"
                        required
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 bg-white"
                        placeholder="เลือกหรือพิมพ์สถานที่จัดเก็บ..."
                    />
                    <datalist id="locations-list">
                        {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </datalist>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้นำเข้า</label>
                    <input type="text" required value={formData.person} onChange={e => setFormData({ ...formData, person: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500" placeholder="ชื่อผู้ทำรายการ" />
                </div>

                <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors mt-2 shadow-md">
                    บันทึกการนำเข้า
                </button>
            </form>
        </div>
    );
}