// Shared formatting utilities for consistency across the app

// Format memory from MB to a human-friendly string using MB/GB only
// Examples: 0.77 -> "0.77 MB", 1234 -> "1.21 GB"
export function formatMemoryMB(memoryMb: number, fractionDigits: number = 2): string {
  if (!isFinite(memoryMb)) return "0 MB";
  if (memoryMb >= 1024) {
    const gb = memoryMb / 1024;
    return `${gb.toFixed(fractionDigits)} GB`;
  }
  return `${memoryMb.toFixed(fractionDigits)} MB`;
}

// Optional: generic number formatter with fixed fraction digits
export function formatFixed(value: number, fractionDigits: number = 2): string {
  if (!isFinite(value)) return (0).toFixed(fractionDigits);
  return value.toFixed(fractionDigits);
}

// Dev-only assertion helper to encourage consistent formatter usage
export function assertFormatted(label: string, value: string) {
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
    // heuristic: warn if value looks like a bare number without unit suffix
    const bareNumber = /^\d+(?:\.\d+)?$/.test(value.trim());
    if (bareNumber) {
       
      console.warn(`[formatters] '${label}' appears unformatted: '${value}'. Use formatTime()/formatMemoryMB().`);
    }
  }
}
