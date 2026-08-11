function EmptyState({ message = 'No records found.' }) {
  return (
    <div className="state-message">
      {message}
    </div>
  );
}

export default EmptyState;
