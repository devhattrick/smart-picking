import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getStoredAuthSession } from '../services/picking-system-service';

export default function Errorpage() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasStoredUser = Boolean(getStoredAuthSession());
  const fallbackPath = hasStoredUser ? '/dashboard' : '/login';

  return (
    <div className="min-h-[calc(100vh-10rem)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.12)] md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden bg-slate-900 px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.28),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.2),_transparent_30%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 backdrop-blur-sm">
              <AlertTriangle size={16} className="text-amber-300" />
              Route Not Found
            </div>

            <p className="mt-6 text-sm uppercase tracking-[0.4em] text-slate-300">Error 404</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">The page you are looking for could not be found</h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300 sm:text-base">
              This route may have been removed, renamed, or entered incorrectly. Please return to the main system page to continue.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between px-6 py-10 sm:px-10 sm:py-12">
          <div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <AlertTriangle size={30} />
            </div>

            <p className="mt-6 text-sm font-medium uppercase tracking-[0.3em] text-slate-400">Requested Path</p>
            <p className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-600 break-all">
              {location.pathname}
            </p>

            <p className="mt-6 text-sm leading-7 text-slate-500">
              If you arrived here from an internal link, check the route again or return to the dashboard to start over.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
            <button
              type="button"
              onClick={() => navigate(fallbackPath, { replace: true })}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <Home size={18} />
              {hasStoredUser ? 'Back to Dashboard' : 'Go to Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
