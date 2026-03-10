import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Package, ArrowDownToLine, ArrowUpFromLine, ClipboardList, LayoutDashboard, LogOut } from 'lucide-react';
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  //* ปรับ Permission การมองเห็น Page ที่ Role ['admin', 'employee']
  const allNavItems: NavItem[] = [
    { path: '/dashboard', name: 'ภาพรวม', icon: <LayoutDashboard size={24} />, roles: ['admin', 'employee'] },
    { path: '/products', name: 'สินค้า', icon: <Package size={24} />, roles: ['admin'] },
    { path: '/inbound', name: 'นำเข้า', icon: <ArrowDownToLine size={24} />, roles: ['admin', 'employee'] },
    { path: '/outbound', name: 'เบิกออก', icon: <ArrowUpFromLine size={24} />, roles: ['admin', 'employee'] },
    { path: '/history', name: 'ประวัติ', icon: <ClipboardList size={24} />, roles: ['admin', 'employee'] },
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
          <button onClick={handleLogout} className="text-white hover:text-red-200 transition-colors p-1" title="ออกจากระบบ">
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
    </div>
  );
}
