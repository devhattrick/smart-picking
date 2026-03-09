// src/pages/Dashboard.jsx
import { useOutletContext } from 'react-router-dom';
import { Package, TrendingUp, TrendingDown, AlertCircle, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const { products, history } = useOutletContext();

    // คำนวณสถิติต่างๆ
    const totalSKU = products.length;
    const totalStock = products.reduce((sum, item) => sum + item.stock, 0);

    // คำนวณยอดรับเข้า-เบิกออก (รวมทั้งหมด)
    const totalIn = history.filter(h => h.type === 'IN').reduce((sum, h) => sum + h.quantity, 0);
    const totalOut = history.filter(h => h.type === 'OUT').reduce((sum, h) => sum + h.quantity, 0);

    // หาสินค้าที่สต๊อกเหลือน้อย (น้อยกว่าหรือเท่ากับ 20 ชิ้น)
    const lowStockItems = products.filter(p => p.stock <= 20);

    // เตรียมข้อมูลสำหรับกราฟ (แยกตามสินค้า)
    const chartData = products.map(p => {
        const inQty = history.filter(h => h.productId === p.id && h.type === 'IN').reduce((sum, h) => sum + h.quantity, 0);
        const outQty = history.filter(h => h.productId === p.id && h.type === 'OUT').reduce((sum, h) => sum + h.quantity, 0);
        return {
            name: p.name, 
            sku: p.sku,
            inbound: inQty,
            outbound: outQty
        };
    }).filter(data => data.inbound > 0 || data.outbound > 0);

    // เตรียมข้อมูลสำหรับกราฟรวมทั้งหมด
    const totalSummaryData = [
        { name: 'รวมทั้งหมด (Total)', inbound: totalIn, outbound: totalOut }
    ];

    return (
        <div className="animate-in fade-in duration-300 space-y-4">
            <div className="flex items-center gap-2 mb-4 border-b pb-2 border-gray-200">
                <BarChart3 className="text-primary-600" size={24} />
                <h2 className="text-2xl font-bold text-primary-600"> Dashboard </h2>
            </div>

            {/* สรุปตัวเลขด้านบน */}
            <div className="grid grid-cols-2 gap-3">
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
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-green-100 flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">นำเข้ารวม</div>
                        <div className="text-lg font-bold text-gray-800">{totalIn}</div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl shadow-sm border border-orange-100 flex items-center gap-3">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                        <TrendingDown size={20} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">เบิกออกรวม</div>
                        <div className="text-lg font-bold text-gray-800">{totalOut}</div>
                    </div>
                </div>
            </div>

            {/* กราฟสถิติรวมนำเข้า-เบิกออกทั้งหมด */}
            <div className="bg-white rounded-xl shadow-sm border border-primary-100 p-4 mt-2 mb-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-4">สถิติรวมนำเข้า-เบิกออกทั้งหมด</h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={totalSummaryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                            <Bar dataKey="inbound" name="นำเข้ารวม (Total In)" fill="#10B981" radius={[4, 4, 0, 0]} barSize={60} />
                            <Bar dataKey="outbound" name="เบิกออกรวม (Total Out)" fill="#F97316" radius={[4, 4, 0, 0]} barSize={60} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* กราฟสถิติการรับเข้า-เบิกออก */}
            <div className="bg-white rounded-xl shadow-sm border border-primary-100 p-4 mt-2">
                <h3 className="font-semibold text-gray-800 text-sm mb-4">สถิติการรับเข้า-เบิกออก (ตาม SKU)</h3>
                {chartData.length > 0 ? (
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} labelFormatter={(label, payload) => {
                                    if (payload && payload.length > 0) {
                                        return `สินค้า: ${payload[0].payload.name}`;
                                    }
                                    return `สินค้า: ${label}`;
                                }} />
                                <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                                <Bar dataKey="inbound" name="นำเข้า (ชิ้น)" fill="#10B981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="outbound" name="เบิกออก (ชิ้น)" fill="#F97316" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
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