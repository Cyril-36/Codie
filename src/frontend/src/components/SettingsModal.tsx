import React, { useEffect, useMemo } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
};

const LS_KEY = "codie.uploadLimitKB";

export default function SettingsModal({ open, onClose }: Props) {
  const gemini = !!import.meta.env.VITE_GEMINI_API_KEY;
  const hf = !!import.meta.env.VITE_HF_API_TOKEN;
  const provider = useMemo(() => {
    if (gemini) return "Gemini";
    if (hf) return "Hugging Face";
    return "None (fallback)";
  }, [gemini, hf]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  const currentKB = Number(localStorage.getItem(LS_KEY) || "1024");
  function setLimit(kb: number) {
    localStorage.setItem(LS_KEY, String(kb));
  }
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm modal-overlay"
      onClick={onClose}
    >
      <div
        className="bg-white text-black rounded-lg shadow-xl p-6 w-[480px] max-w-[95vw] modal-content card-elevate"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-xl">Settings</h2>
          <button 
            className="btn btn-outline btn-sm btn-anim" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="space-y-6">
          <div className="card p-4">
            <div className="text-sm text-muted-foreground mb-2">Active AI Provider</div>
            <div className="font-medium text-lg">
              <span className="badge badge-info">{provider}</span>
            </div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-muted-foreground mb-3">Client Upload Limit</div>
            <div className="flex gap-2 flex-wrap">
              {[512, 1024, 2048, 4096].map((kb) => (
                <button
                  key={kb}
                  className={`btn btn-sm ${currentKB === kb ? "btn-primary" : "btn-outline"} btn-anim`}
                  onClick={() => setLimit(kb)}
                >
                  {kb / 1024} MB
                </button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              Note: Backend still enforces its own limit; this is a client-side pre-check.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
