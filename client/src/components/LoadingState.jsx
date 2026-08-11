function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="state-message">
      {message}
    </div>
  );
}

export default LoadingState;
