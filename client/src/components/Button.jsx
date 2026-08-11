function Button({ children, type = 'button', loading = false, disabled = false, ...props }) {
  return (
    <button
      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      type={type}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Please wait...' : children}
    </button>
  );
}

export default Button;
