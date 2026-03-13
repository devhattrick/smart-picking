import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Package, ArrowDownToLine, ArrowUpFromLine, ClipboardList, LayoutDashboard, LogOut, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { LayoutProps, UserRole } from '../types';

interface NavItem {
  path: string;
  name: string;
  icon: ReactNode;
  roles: UserRole[];
}

export default function Layout({ products, setProducts, history, setHistory, user, setUser }: LayoutProps) {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    if (!showLogoutConfirm) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowLogoutConfirm(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showLogoutConfirm]);

  //* ปรับ Permission การมองเห็น Page ที่ Role ['admin', 'employee']
  const allNavItems: NavItem[] = [
    { path: '/dashboard', name: 'ภาพรวม', icon: <LayoutDashboard size={24} />, roles: ['admin', 'employee'] },
    { path: '/products', name: 'สินค้า', icon: <Package size={24} />, roles: ['admin'] },
    { path: '/inbound', name: 'นำเข้า', icon: <ArrowDownToLine size={24} />, roles: ['admin', 'employee'] },
    { path: '/outbound', name: 'เบิกออก', icon: <ArrowUpFromLine size={24} />, roles: ['admin', 'employee'] },
    { path: '/login', name: 'ประวัติ', icon: <ClipboardList size={24} />, roles: ['admin', 'employee'] },
  ];

  const navItems = allNavItems.filter(item => (user ? item.roles.includes(user.role) : false));

  return (
    <div className="min-h-screen bg-slate-50 pb-24 sm:pb-20 font-sans">
      <header className="bg-primary-600 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-wide leading-tight">
            <span className="text-yellow-400">LSMA4 </span>
            Picking System
          </h1>
          <button onClick={() => setShowLogoutConfirm(true)} className="text-white hover:text-red-200 transition-colors p-1" title="ออกจากระบบ">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
        {/* ส่ง Context ให้หน้าลูกๆ เอาไปใช้งาน */}
        <Outlet context={{ products, setProducts, history, setHistory, user }} />
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-10">
        <div className="flex justify-around items-center h-16 sm:h-14 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 w-full h-full ${isActive ? 'text-primary-600 font-medium' : 'text-gray-400 hover:text-primary-500'
                }`
              }
            >
              {item.icon}
              <span className="text-[10px] sm:text-xs">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-[2px]"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowLogoutConfirm(false);
            }
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-rose-100 bg-white p-5 shadow-2xl" role="dialog" aria-modal="true" aria-label="ยืนยันการออกจากระบบ">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
              <AlertTriangle size={30} className="text-rose-600" />
            </div>
            <h4 className="text-center text-lg font-semibold text-slate-800">ยืนยันการออกจากระบบ</h4>
            <p className="mt-1 text-center text-sm text-slate-500">คุณต้องการออกจากระบบตอนนี้ใช่หรือไม่</p>
            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
