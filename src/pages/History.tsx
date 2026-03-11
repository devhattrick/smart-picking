// src/pages/History.tsx
import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, Clock, FileSpreadsheet, MapPin, User } from 'lucide-react';
import type { AppOutletContext, MovementType } from '../types';

export default function History() {
    const { history, products } = useOutletContext<AppOutletContext>();
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [personFilter, setPersonFilter] = useState('');
    const [productNameFilter, setProductNameFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState<'ALL' | MovementType>('ALL');
    const [isExporting, setIsExporting] = useState(false);

    const productNameOptions = useMemo(() => {
        const names = Array.from(
            new Set(
                products
                    .map((product) => product.name.trim())
                    .filter(Boolean)
            )
        );

        return names.sort((a, b) => a.localeCompare(b, 'th-TH'));
    }, [products]);

    const locationOptions = useMemo(() => {
        const locations = Array.from(
            new Set(
                [...products.map((product) => product.binLocation), ...history.map((log) => log.location)]
                    .map((value) => value.trim())
                    .filter(Boolean)
            )
        );

        return locations.sort((a, b) => a.localeCompare(b, 'th-TH'));
    }, [products, history]);

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

    const getLocalDateString = (isoString: string) => {
        const date = new Date(isoString);
        if (Number.isNaN(date.getTime())) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const isInvalidDateRange = Boolean(startDateFilter && endDateFilter && startDateFilter > endDateFilter);

    const filteredHistory = useMemo(() => {
        if (isInvalidDateRange) return [];

        const normalizedLocation = locationFilter.trim().toLowerCase();
        const normalizedPerson = personFilter.trim().toLowerCase();
        const normalizedProductName = productNameFilter.trim().toLowerCase();

        return history.filter((log) => {
            const localDate = getLocalDateString(log.timestamp);
            if (startDateFilter && localDate < startDateFilter) return false;
            if (endDateFilter && localDate > endDateFilter) return false;

            if (normalizedLocation && !log.location.toLowerCase().includes(normalizedLocation)) return false;
            if (normalizedPerson && !log.person.toLowerCase().includes(normalizedPerson)) return false;
            if (normalizedProductName) {
                const productName = products.find((p) => p.id === log.productId)?.name ?? '';
                if (!productName.toLowerCase().includes(normalizedProductName)) return false;
            }
            if (typeFilter !== 'ALL' && log.type !== typeFilter) return false;
            return true;
        });
    }, [history, products, startDateFilter, endDateFilter, locationFilter, personFilter, productNameFilter, typeFilter, isInvalidDateRange]);

    const hasActiveFilter = Boolean(startDateFilter || endDateFilter || locationFilter || personFilter || productNameFilter || typeFilter !== 'ALL');

    const handleExportExcel = async () => {
        if (filteredHistory.length === 0 || isExporting) return;

        setIsExporting(true);
        try {
            const XLSX = await import('xlsx');
            const rows = filteredHistory.map((log, index) => {
                const product = products.find((p) => p.id === log.productId);
                return {
                    'ลำดับ': index + 1,
                    'วันที่เวลา': formatDateTime(log.timestamp),
                    'ประเภท': log.type === 'IN' ? 'นำเข้า' : 'เบิกออก',
                    'SKU': product?.sku ?? '-',
                    'ชื่อสินค้า': product?.name ?? 'ไม่พบข้อมูลสินค้า (อาจถูกลบ)',
                    'จำนวน': log.quantity,
                    'Location': log.location,
                    'Person': log.person,
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(rows);
            worksheet['!cols'] = [
                { wch: 8 },
                { wch: 24 },
                { wch: 12 },
                { wch: 16 },
                { wch: 36 },
                { wch: 10 },
                { wch: 24 },
                { wch: 20 },
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'History');

            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            XLSX.writeFile(workbook, `history-${year}${month}${day}.xlsx`);
        } catch (error) {
            console.error('Failed to export history excel', error);
            window.alert('ไม่สามารถสร้างไฟล์ Excel ได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 border-b pb-2 border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">ประวัติทำรายการ</h2>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    แสดง {filteredHistory.length} / {history.length} รายการ
                </span>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">วันที่เริ่มต้น</label>
                        <input
                            type="date"
                            value={startDateFilter}
                            onChange={(e) => setStartDateFilter(e.target.value)}
                            max={endDateFilter || undefined}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">วันที่สิ้นสุด</label>
                        <input
                            type="date"
                            value={endDateFilter}
                            onChange={(e) => setEndDateFilter(e.target.value)}
                            min={startDateFilter || undefined}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">ประเภท</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as 'ALL' | MovementType)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        >
                            <option value="ALL">ทั้งหมด</option>
                            <option value="IN">นำเข้า</option>
                            <option value="OUT">เบิกออก</option>
                        </select>
                    </div>
                </div>

                {isInvalidDateRange && (
                    <div className="text-xs text-red-600">ช่วงวันที่ไม่ถูกต้อง: วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด</div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">ชื่อสินค้า</label>
                        <input
                            type="text"
                            list="history-product-name-list"
                            value={productNameFilter}
                            onChange={(e) => setProductNameFilter(e.target.value)}
                            placeholder="เลือกหรือพิมพ์ชื่อสินค้า..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        />
                        <datalist id="history-product-name-list">
                            {productNameOptions.map((name) => <option key={name} value={name} />)}
                        </datalist>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Location</label>
                        <input
                            type="text"
                            list="history-location-list"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            placeholder="เลือกหรือพิมพ์ Location..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        />
                        <datalist id="history-location-list">
                            {locationOptions.map((location) => <option key={location} value={location} />)}
                        </datalist>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Person</label>
                        <input
                            type="text"
                            value={personFilter}
                            onChange={(e) => setPersonFilter(e.target.value)}
                            placeholder="เช่น สมชาย"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleExportExcel}
                        disabled={filteredHistory.length === 0 || isExporting}
                        className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                        <FileSpreadsheet size={14} className="mr-1.5" />
                        {isExporting ? 'กำลังสร้างไฟล์...' : 'Gen Excel'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setStartDateFilter('');
                            setEndDateFilter('');
                            setProductNameFilter('');
                            setLocationFilter('');
                            setPersonFilter('');
                            setTypeFilter('ALL');
                        }}
                        disabled={!hasActiveFilter}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        ล้างตัวกรอง
                    </button>
                </div>
            </div>

            <div className="space-y-3 pb-6">
                {filteredHistory.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 bg-white rounded-xl shadow-sm border border-gray-100">
                        {history.length === 0 ? 'ยังไม่มีประวัติการทำรายการ' : 'ไม่พบรายการที่ตรงกับตัวกรอง'}
                    </div>
                ) : (
                    filteredHistory.map((log) => {
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
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
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

                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mt-3 pt-3 border-t border-gray-50">
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
                                        <div className="text-left sm:text-right">
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
