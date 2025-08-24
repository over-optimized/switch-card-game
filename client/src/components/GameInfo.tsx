import { useGameStore } from '../stores';

export function GameInfo() {
  const {
    gameState,
    playerId,
    message,
    recentMoves,
    showRecentMoves,
    restartGame,
    toggleRecentMoves,
  } = useGameStore(state => ({
    gameState: state.gameState,
    playerId: state.playerId,
    message: state.message,
    recentMoves: state.recentMoves,
    showRecentMoves: state.showRecentMoves,
    restartGame: state.restartGame,
    toggleRecentMoves: state.toggleRecentMoves,
  }));

  if (!gameState) return null;

  const getGameStatus = () => {
    if (gameState.phase === 'finished') {
      const winner = gameState.winner;
      return winner?.id === playerId ? 'You Win!' : `${winner?.name} Wins!`;
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    return currentPlayer.id === playerId
      ? 'Your Turn'
      : `${currentPlayer.name}'s Turn`;
  };

  return (
    <div className="game-info">
      <div className="game-status">
        <p>
          <strong>Status:</strong> {getGameStatus()}
        </p>
        <p>
          <strong>Message:</strong> {message}
        </p>

        {gameState.phase === 'finished' && (
          <button className="restart-btn" onClick={restartGame}>
            New Game
          </button>
        )}
      </div>

      <div className="debug-controls">
        <button className="debug-btn" onClick={toggleRecentMoves}>
          Recent Moves {showRecentMoves ? '▼' : '▶'}
        </button>

        {showRecentMoves && (
          <div className="recent-moves-panel">
            {recentMoves.length > 0 ? (
              recentMoves
                .slice(-6)
                .reverse()
                .map((move, index) => (
                  <div
                    key={`${move.timestamp.getTime()}-${index}`}
                    className="recent-move"
                  >
                    <span className="move-time">
                      {move.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="move-text">
                      {move.player}: {move.action}
                    </span>
                    {move.details && (
                      <span className="move-details">{move.details}</span>
                    )}
                  </div>
                ))
            ) : (
              <div className="no-moves">No recent moves</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
