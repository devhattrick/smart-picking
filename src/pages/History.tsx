// src/pages/History.tsx
import { useOutletContext } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, Clock, MapPin, User } from 'lucide-react';
import type { AppOutletContext } from '../types';

export default function History() {
    const { history, products } = useOutletContext<AppOutletContext>();

    // ฟังก์ชันช่วยหาชื่อและ SKU สินค้าจาก ID
    const getProductDetails = (productId: number) => {
        const product = products.find(p => p.id === productId);
        return product ? `[${product.sku}] ${product.name}` : 'ไม่พบข้อมูลสินค้า (อาจถูกลบ)';
    };

    // ฟังก์ชันแปลงวันที่ให้ดูอ่านง่าย (ภาษาไทย)
    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('th-TH', {
            year: '2-digit', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4 border-b pb-2 border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">ประวัติทำรายการ</h2>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    ทั้งหมด {history.length} รายการ
                </span>
            </div>

            <div className="space-y-3 pb-6">
                {history.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 bg-white rounded-xl shadow-sm border border-gray-100">
                        ยังไม่มีประวัติการทำรายการ
                    </div>
                ) : (
                    history.map((log) => {
                        // กำหนดสีและไอคอนตามประเภท IN / OUT
                        const isIN = log.type === 'IN';
                        const typeColor = isIN ? 'text-primary-600 bg-primary-50 border-primary-100' : 'text-orange-600 bg-orange-50 border-orange-100';
                        const Icon = isIN ? ArrowDownRight : ArrowUpRight;
                        const typeLabel = isIN ? 'นำเข้า' : 'เบิกออก';

                        return (
                            <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                                {/* แถบสีด้านซ้ายบอกสถานะ */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isIN ? 'bg-primary-500' : 'bg-orange-500'}`}></div>

                                <div className="pl-2">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-lg border ${typeColor}`}>
                                                <Icon size={18} />
                                            </div>
                                            <div>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${isIN ? 'bg-primary-100 text-primary-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {typeLabel}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <Clock size={12} className="mr-1" />
                                            {formatDateTime(log.timestamp)}
                                        </div>
                                    </div>

                                    <div className="font-medium text-gray-800 text-sm mb-1 line-clamp-2">
                                        {getProductDetails(log.productId)}
                                    </div>

                                    <div className="flex justify-between items-end mt-3 pt-3 border-t border-gray-50">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <MapPin size={12} className="mr-1 text-gray-400" />
                                                {log.location}
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500">
                                                <User size={12} className="mr-1 text-gray-400" />
                                                {log.person}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500 mb-0.5">จำนวน</div>
                                            <div className={`text-lg font-bold ${isIN ? 'text-primary-600' : 'text-orange-600'}`}>
                                                {isIN ? '+' : '-'}{log.quantity}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
