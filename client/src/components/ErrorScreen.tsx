interface ErrorScreenProps {
  message: string;
}

export function ErrorScreen({ message }: ErrorScreenProps) {
  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="error">
      <h2>Game Error</h2>
      <p>{message}</p>
      <button onClick={handleRestart}>
        Restart Game
      </button>
    </div>
  );
}