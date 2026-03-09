import { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

type PopupType = 'success' | 'error';

interface ActionPopupProps {
    open: boolean;
    type?: PopupType;
    title: string;
    message: string;
    onClose: () => void;
    actionText?: string;
    autoCloseMs?: number;
}

const popupStyles = {
    success: {
        icon: CheckCircle2,
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        button: 'bg-emerald-500 hover:bg-emerald-600',
    },
    error: {
        icon: AlertTriangle,
        iconBg: 'bg-rose-100',
        iconColor: 'text-rose-600',
        button: 'bg-rose-500 hover:bg-rose-600',
    },
} as const;

export default function ActionPopup({
    open,
    type = 'success',
    title,
    message,
    onClose,
    actionText = 'ตกลง',
    autoCloseMs = 2200,
}: ActionPopupProps) {
    useEffect(() => {
        if (!open || !autoCloseMs) return undefined;

        const timer = setTimeout(() => {
            onClose();
        }, autoCloseMs);

        return () => clearTimeout(timer);
    }, [open, autoCloseMs, onClose]);

    if (!open) return null;

    const style = popupStyles[type] || popupStyles.success;
    const Icon = style.icon;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-[2px]"
            role="presentation"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3 top-3 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Close popup"
                >
                    <X size={16} />
                </button>

                <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${style.iconBg}`}>
                    <Icon size={30} className={style.iconColor} />
                </div>

                <h4 className="text-center text-lg font-semibold text-slate-800">{title}</h4>
                <p className="mt-1 text-center text-sm text-slate-500">{message}</p>

                <button
                    type="button"
                    onClick={onClose}
                    className={`mt-5 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-colors ${style.button}`}
                >
                    {actionText}
                </button>
            </div>
        </div>
    );
}
