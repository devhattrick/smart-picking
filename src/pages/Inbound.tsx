import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import ActionPopup from '../components/ActionPopup';
import { pickingSystemService } from '../services/picking-system-service';
import type { AppOutletContext } from '../types';

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
    const { products, setProducts, setHistory, locations, setLocations } = useOutletContext<AppOutletContext>();
    const defaultLocation = locations[0] ?? '';

    const [formData, setFormData] = useState<InboundFormData>({
        productId: '',
        quantity: '',
        location: '',
        person: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    useEffect(() => {
        if (!formData.location && defaultLocation) {
            setFormData((current) => ({ ...current, location: defaultLocation }));
        }
    }, [defaultLocation, formData.location]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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

        setIsSubmitting(true);

        try {
            const result = await pickingSystemService.createInboundMovement({
                productId: prodId,
                quantity: qty,
                location: formData.location.trim(),
                person: formData.person.trim(),
            });

            setProducts((currentProducts) =>
                currentProducts.map((product) => (product.id === result.product.id ? result.product : product))
            );
            setHistory((currentHistory) => [result.movement, ...currentHistory]);
            setLocations(result.locations);

            showPopup(
                'success',
                'บันทึกการนำเข้าสำเร็จ',
                `[${selectedProduct.sku}] ${selectedProduct.name} จำนวน ${qty} ชิ้น`
            );
            setFormData({ productId: '', quantity: '', location: result.locations[0] ?? '', person: '' });
        } catch (error) {
            showPopup('error', 'บันทึกไม่สำเร็จ', error instanceof Error ? error.message : 'ไม่สามารถบันทึกการนำเข้าได้');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-300">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 border-b pb-2 border-gray-200">นำเข้าสินค้า (Inbound)</h2>

            <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm border border-primary-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เลือกสินค้า</label>
                    <select required value={formData.productId} onChange={e => setFormData({ ...formData, productId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 bg-white">
                        <option value="">-- กรุณาเลือกสินค้า --</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>[{p.sku}] {p.name} | SO: {p.soNo}</option>
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

                <button type="submit" disabled={isSubmitting || products.length === 0} className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors mt-2 shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed md:col-span-2">
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการนำเข้า'}
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
