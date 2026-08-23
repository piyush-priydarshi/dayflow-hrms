import React from 'react';

const ToastItem = ({ toast, onRemove }) => {
  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  return (
    <div
      role="alert"
      className="pointer-events-auto flex items-start gap-3 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-2xl p-4 text-xs text-white transition-all duration-300 ease-out transform translate-y-0 opacity-100 hover:border-zinc-700 max-w-sm w-full"
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {isSuccess && (
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-[11px]">
            ✓
          </div>
        )}
        {isError && (
          <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-[11px]">
            ✕
          </div>
        )}
        {isWarning && (
          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-[11px]">
            !
          </div>
        )}
        {!isSuccess && !isError && !isWarning && (
          <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-[11px]">
            ℹ
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pr-2">
        <p className="font-semibold text-zinc-100 mb-0.5 capitalize">
          {isSuccess ? 'Success' : isError ? 'Error' : isWarning ? 'Notice' : 'Information'}
        </p>
        <p className="text-zinc-300 leading-relaxed font-normal">{toast.message}</p>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={() => onRemove(toast.id)}
        className="text-zinc-500 hover:text-zinc-200 transition-colors p-1 rounded-lg text-sm cursor-pointer leading-none flex-shrink-0"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
