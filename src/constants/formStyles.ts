const INPUT_BASE =
  'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-4';

export function getInputClass(hasError: boolean): string {
  return hasError
    ? `${INPUT_BASE} border-red-400 focus:border-red-500 focus:ring-red-100`
    : `${INPUT_BASE} border-slate-200 focus:border-sky-500 focus:ring-sky-100`;
}
