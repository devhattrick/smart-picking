// src/pages/Inbound.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { locations } from '../data/mockData';
import ActionPopup from '../components/ActionPopup';
import type { AppOutletContext, MovementLog } from '../types';

type PopupType = 'success' | 'error';

interface InboundFormData {
    productId: string;
    quantity: string;
    location: string;
    person: string;
}

interface PopupState {
    open: boolean;
    type: PopupType;
    title: string;
    message: string;
    autoCloseMs: number;
}

export default function Inbound() {
    const { products, setProducts, history, setHistory } = useOutletContext<AppOutletContext>();

    const [formData, setFormData] = useState<InboundFormData>({
        productId: '',
        quantity: '',
        location: locations[0],
        person: ''
    });
    const [popup, setPopup] = useState<PopupState>({
        open: false,
        type: 'success',
        title: '',
        message: '',
        autoCloseMs: 2200,
    });

    const showPopup = (type: PopupType, title: string, message: string, autoCloseMs = type === 'success' ? 2200 : 0) => {
        setPopup({ open: true, type, title, message, autoCloseMs });
    };

    const closePopup = () => {
        setPopup(prev => ({ ...prev, open: false }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const qty = Number(formData.quantity);
        const prodId = Number(formData.productId);

        if (!prodId || qty <= 0 || !formData.person) {
            showPopup('error', 'ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลให้ครบก่อนบันทึก');
            return;
        }

        const selectedProduct = products.find(p => p.id === prodId);
        if (!selectedProduct) {
            showPopup('error', 'ไม่พบสินค้า', 'ไม่พบรายการสินค้าที่เลือก กรุณาลองใหม่อีกครั้ง');
            return;
        }

        // 1. เพิ่มสต๊อกสินค้า
        setProducts(products.map(p =>
            p.id === prodId ? { ...p, stock: p.stock + qty } : p
        ));

        // 2. บันทึกประวัติ
        const newLog: MovementLog = {
            id: Date.now(),
            type: 'IN',
            productId: prodId,
            quantity: qty,
            location: formData.location,
            person: formData.person,
            timestamp: new Date().toISOString(),
        };
        setHistory([newLog, ...history]);

        showPopup(
            'success',
            'บันทึกการนำเข้าสำเร็จ',
            `[${selectedProduct.sku}] ${selectedProduct.name} จำนวน ${qty} ชิ้น`
        );
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

            <ActionPopup
                open={popup.open}
                type={popup.type}
                title={popup.title}
                message={popup.message}
                onClose={closePopup}
                autoCloseMs={popup.autoCloseMs}
            />
        </div>
    );
}
