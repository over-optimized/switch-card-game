import { useGameStore } from '../stores';

export function OpponentArea() {
  const { gameState, playerId } = useGameStore(state => ({
    gameState: state.gameState,
    playerId: state.playerId,
  }));

  if (!gameState) return null;

  const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
  const opponents = gameState.players.filter(p => p.id !== playerId);

  if (opponents.length === 0) return null;

  return (
    <div className="opponents-area">
      {opponents.map(player => (
        <div 
          key={player.id}
          className={`opponent ${currentTurnPlayer.id === player.id ? 'current-turn' : ''}`}
        >
          <h4>{player.name}</h4>
          <div className="opponent-hand">
            {Array(player.hand.length).fill(0).map((_, index) => (
              <div key={index} className="card-back small">
                🂠
              </div>
            ))}
          </div>
          <span className="card-count">{player.hand.length} cards</span>
        </div>
      ))}
    </div>
  );
}