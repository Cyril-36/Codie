type Props = {
  open: boolean;
  diff: string;
  onClose: () => void;
};
export default function DiffModal({ open, diff, onClose }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 modal-overlay"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative max-w-3xl w-[92%] bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 modal-content card-elevate fade-in">
        <button
          aria-label="Close diff"
          onClick={onClose}
          className="absolute top-4 right-4 btn btn-ghost btn-sm btn-anim p-2"
        >
          ×
        </button>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-xl">Proposed Changes</h2>
          <button
            onClick={() => navigator.clipboard.writeText(diff)}
            className="btn btn-primary btn-sm btn-anim"
            aria-label="Copy patch to clipboard"
          >
            Copy Patch
          </button>
        </div>
        <pre className="text-xs overflow-auto max-h-[60vh] p-4 rounded-lg bg-gray-50 dark:bg-gray-800 leading-5 border">
          {diff.split("\n").map((line, i) => {
            const cls =
              line.startsWith("+") ? "text-green-600" :
              line.startsWith("-") ? "text-red-600" :
              line.startsWith("@@") ? "text-purple-600" :
              "text-gray-800 dark:text-gray-200";
            return (
              <div key={i} className={cls}>
                {line}
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
