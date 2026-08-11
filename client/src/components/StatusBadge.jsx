function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status?.toLowerCase() || 'default'}`}>
      {status || 'UNKNOWN'}
    </span>
  );
}

export default StatusBadge;
