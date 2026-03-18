// src/pages/Dashboard.tsx
import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Package, TrendingUp, TrendingDown, AlertCircle, BarChart3 } from 'lucide-react';
import D3DonutChart from '../components/charts/D3DonutChart';
import D3GroupedBarChart, { movementSeries } from '../components/charts/D3GroupedBarChart';
import type { AppOutletContext } from '../types';

export default function Dashboard() {
    const { products, history } = useOutletContext<AppOutletContext>();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // คำนวณสถิติต่างๆ
    const totalSKU = products.length;
    const totalStock = products.reduce((sum, item) => sum + item.stock, 0);

    const isInvalidRange = Boolean(startDate && endDate && startDate > endDate);

    const filteredHistory = useMemo(() => {
        if (isInvalidRange) return [];

        const startBoundary = startDate ? new Date(`${startDate}T00:00:00`) : null;
        const endBoundary = endDate ? new Date(`${endDate}T23:59:59.999`) : null;

        return history.filter((record) => {
            const recordDate = new Date(record.timestamp);
            if (Number.isNaN(recordDate.getTime())) return false;
            if (startBoundary && recordDate < startBoundary) return false;
            if (endBoundary && recordDate > endBoundary) return false;
            return true;
        });
    }, [history, startDate, endDate, isInvalidRange]);

    // คำนวณยอดรับเข้า-เบิกออก (รวมทั้งหมด)
    const totalIn = filteredHistory.filter(h => h.type === 'IN').reduce((sum, h) => sum + h.quantity, 0);
    const totalOut = filteredHistory.filter(h => h.type === 'OUT').reduce((sum, h) => sum + h.quantity, 0);

    // หาสินค้าที่สต๊อกเหลือน้อย (น้อยกว่าหรือเท่ากับ 20 ชิ้น)
    const lowStockItems = products.filter(p => p.stock <= 20);

    // เตรียมข้อมูลสำหรับกราฟ (แยกตามสินค้า)
    const chartData = products.map(p => {
        const inQty = filteredHistory.filter(h => h.productId === p.id && h.type === 'IN').reduce((sum, h) => sum + h.quantity, 0);
        const outQty = filteredHistory.filter(h => h.productId === p.id && h.type === 'OUT').reduce((sum, h) => sum + h.quantity, 0);
        return {
            name: p.name, 
            sku: p.sku,
            inbound: inQty,
            outbound: outQty
        };
    }).filter(data => data.inbound > 0 || data.outbound > 0);

    // เตรียมข้อมูลสำหรับกราฟรวมทั้งหมด (Pie Chart)
    const totalSummaryData = [
        { name: 'นำเข้ารวม (Total In)', value: totalIn, color: '#10B981' },
        { name: 'เบิกออกรวม (Total Out)', value: totalOut, color: '#F97316' }
    ].filter(item => item.value > 0);

    const rangeText = `${startDate || 'ไม่จำกัด'} - ${endDate || 'ไม่จำกัด'}`;

    return (
        <div className="animate-in fade-in duration-300 space-y-4">
            <div className="flex items-center gap-2 mb-4 border-b pb-2 border-gray-200">
                <BarChart3 className="text-primary-600" size={24} />
                <h2 className="text-xl sm:text-2xl font-bold text-primary-600"> Dashboard </h2>
            </div>

            {/* ตัวเลือกช่วงวันที่ */}
            <div className="bg-white rounded-xl shadow-sm border border-primary-100 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 text-sm">ช่วงวันที่สำหรับสรุปข้อมูล</h3>
                    <button
                        type="button"
                        onClick={() => {
                            setStartDate('');
                            setEndDate('');
                        }}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                        disabled={!startDate && !endDate}
                    >
                        ล้างช่วงวันที่
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            max={endDate || undefined}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || undefined}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 bg-white"
                        />
                    </div>
                </div>
                <div className="mt-3 text-xs">
                    {isInvalidRange ? (
                        <p className="text-red-600">ช่วงวันที่ไม่ถูกต้อง: วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด</p>
                    ) : (
                        <p className="text-gray-500">
                            ช่วงที่เลือก: {rangeText} | รายการที่พบ: {filteredHistory.length} รายการ
                        </p>
                    )}
                </div>
            </div>

            {/* สรุปตัวเลขด้านบน */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-primary-100 flex flex-col items-center justify-center">
                    <Package className="text-primary-500 mb-1" size={28} />
                    <div className="text-l font-bold text-gray-800">{totalSKU}</div>
                    <div className="text-xs text-gray-500">รายการสินค้า (SKU)</div>
                </div>

                <div className="bg-primary-600 p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-white">
                    <div className="text-2xl font-bold">{totalStock}</div>
                    <div className="text-xs text-primary-100 mt-1">สินค้าคงเหลือรวม (ชิ้น)</div>
                </div>
            </div>

            {/* สรุปการเคลื่อนไหว */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-green-100 flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">นำเข้ารวม (ช่วงที่เลือก)</div>
                        <div className="text-lg font-bold text-gray-800">{totalIn}</div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl shadow-sm border border-orange-100 flex items-center gap-3">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                        <TrendingDown size={20} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">เบิกออกรวม (ช่วงที่เลือก)</div>
                        <div className="text-lg font-bold text-gray-800">{totalOut}</div>
                    </div>
                </div>
            </div>

            {/* กราฟสถิติรวมนำเข้า-เบิกออกทั้งหมด */}
            <div className="bg-white rounded-xl shadow-sm border border-primary-100 p-4 mt-2 mb-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-4">สถิติรวมนำเข้า-เบิกออกทั้งหมด</h3>
                <div className="mb-3 flex flex-wrap gap-3 text-xs text-gray-600">
                    {totalSummaryData.map((item) => (
                        <div key={item.name} className="inline-flex items-center gap-2">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span>{item.name}</span>
                        </div>
                    ))}
                </div>
                <div className="h-52 sm:h-56 w-full">
                    {totalSummaryData.length > 0 ? (
                        <D3DonutChart data={totalSummaryData} />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            ยังไม่มีข้อมูลการทำรายการ
                        </div>
                    )}
                </div>
            </div>

            {/* กราฟสถิติการรับเข้า-เบิกออก */}
            <div className="bg-white rounded-xl shadow-sm border border-primary-100 p-4 mt-2">
                <h3 className="font-semibold text-gray-800 text-sm mb-4">สถิติการรับเข้า-เบิกออก (ตาม SKU)</h3>
                <div className="mb-3 flex flex-wrap gap-3 text-xs text-gray-600">
                    {movementSeries.map((series) => (
                        <div key={series.key} className="inline-flex items-center gap-2">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: series.color }}
                            />
                            <span>{series.label}</span>
                        </div>
                    ))}
                </div>
                {chartData.length > 0 ? (
                    <div className="h-64 sm:h-72 w-full">
                        <D3GroupedBarChart data={chartData} />
                    </div>
                ) : (
                    <div className="h-32 w-full flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        ยังไม่มีข้อมูลการทำรายการ
                    </div>
                )}
            </div>

            {/* แจ้งเตือนสินค้าใกล้หมด */}
            <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden mt-2">
                <div className="bg-red-50 p-3 flex items-center gap-2 border-b border-red-100">
                    <AlertCircle className="text-red-500" size={18} />
                    <h3 className="font-semibold text-red-700 text-sm">สินค้าใกล้หมด (Low Stock)</h3>
                </div>
                <div className="p-3">
                    {lowStockItems.length > 0 ? (
                        <ul className="space-y-2">
                            {lowStockItems.map(item => (
                                <li key={item.id} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-700 truncate pr-2">[{item.sku}] {item.name}</span>
                                    <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs">
                                        เหลือ {item.stock}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center text-sm text-gray-500 py-2">
                            ไม่มีสินค้าที่ใกล้หมดสต๊อก
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
