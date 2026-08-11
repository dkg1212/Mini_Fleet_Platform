function EmptyState({ message = 'No records found.' }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm text-slate-500">
      {message}
    </div>
  );
}

export default EmptyState;
