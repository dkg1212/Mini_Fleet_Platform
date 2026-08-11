function ErrorMessage({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
      {message}
    </div>
  );
}

export default ErrorMessage;
