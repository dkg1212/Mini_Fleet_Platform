function Input({ id, label, error, ...props }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} className={error ? 'input input-error' : 'input'} {...props} />
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}

export default Input;
