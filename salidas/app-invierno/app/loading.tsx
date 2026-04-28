export default function Loading() {
  return (
    <div className="snow-shell relative min-h-screen flex items-center justify-center px-4">
      <div className="surface-card rounded-[2.2rem] border border-white/80 p-8 sm:p-12 w-full max-w-sm text-center">
        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-violet-500" />
        <p className="text-sm font-semibold text-slate-500">Cargando capacitación…</p>
      </div>
    </div>
  );
}
