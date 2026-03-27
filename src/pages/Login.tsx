import { useState } from 'react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { pickingSystemService } from '../services/picking-system-service';
import type { User } from '../types';

interface LoginProps {
  setUser: Dispatch<SetStateAction<User | null>>;
}

export default function Login({ setUser }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const loginBackgroundUrl = `${import.meta.env.BASE_URL}inventory-modern.jpg`;

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError('');
    setIsSubmitting(true);

    try {
      const session = await pickingSystemService.login({
        username: username.trim(),
        password,
      });

      setUser(session.user);
      navigate('/dashboard');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'ไม่สามารถเข้าสู่ระบบได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: `url('${loginBackgroundUrl}')` }}
        />
        <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-white/40">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 mb-2">
            <span className="text-amber-300 drop-shadow-lg">LSMA4 </span>
            Picking System</h1>
          <p className="text-gray-500 text-sm drop-shadow-md mt-2">เข้าสู่ระบบเพื่อใช้งาน</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ">ชื่อผู้ใช้</label>
            <input 
              type="text" 
              required 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow" 
              placeholder="กรอกชื่อผู้ใช้..." 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow" 
              placeholder="กรอกรหัสผ่าน..." 
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-md mt-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        {/* <Link
          to="/error"
          className="bg-primary-600 mt-4 inline-flex w-full items-center justify-center rounded-xl  px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          เข้าสู่ระบบ
        </Link> */}
        
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Admin: admin / password</p>
          <p>Employee: emp / password</p>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Version Demo: 1.0.4</p>

        </div>
      </div>
    </div>
  );
}
