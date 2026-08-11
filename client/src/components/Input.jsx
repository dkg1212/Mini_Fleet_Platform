function Input({ id, label, error, ...props }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-slate-700">{label}</label>
      <input
        id={id}
        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 ${error ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 focus:border-teal-500'}`}
        {...props}
      />
      {error ? <span className="text-sm text-rose-600">{error}</span> : null}
    </div>
  );
}

export default Input;
