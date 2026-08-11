function StatusBadge({ status }) {
  const statusKey = status?.toLowerCase() || 'default';
  const statusStyles = {
    default: 'border-slate-300 bg-slate-100 text-slate-700',
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    assigned: 'border-sky-200 bg-sky-50 text-sky-700',
    accepted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    completed: 'border-teal-200 bg-teal-50 text-teal-700',
    cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
    canceled: 'border-rose-200 bg-rose-50 text-rose-700',
    inprogress: 'border-violet-200 bg-violet-50 text-violet-700',
    'in-progress': 'border-violet-200 bg-violet-50 text-violet-700'
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles[statusKey] || statusStyles.default}`}>
      {status || 'UNKNOWN'}
    </span>
  );
}

export default StatusBadge;
