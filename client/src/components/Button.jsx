function Button({ children, type = 'button', loading = false, disabled = false, ...props }) {
  return (
    <button
      className="button"
      type={type}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Please wait...' : children}
    </button>
  );
}

export default Button;
