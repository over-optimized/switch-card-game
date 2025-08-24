import { useGameStore } from '../stores';

interface OpponentAreaProps {
  position: 'top' | 'left' | 'right';
  player: {
    id: string;
    name: string;
    hand: { id: string }[];
  };
  isCurrentTurn: boolean;
}

function PositionedOpponentArea({ position, player, isCurrentTurn }: OpponentAreaProps) {
  const baseClasses = `opponent-area opponent-${position}`;
  const turnClass = isCurrentTurn ? 'current-turn' : '';
  const className = `${baseClasses} ${turnClass}`.trim();

  return (
    <div className={className}>
      <div className="opponent-info">
        <h4 className="opponent-name">{player.name}</h4>
        <span className="card-count">{player.hand.length} cards</span>
      </div>
      <div className={`opponent-hand opponent-hand-${position}`}>
        {Array(player.hand.length)
          .fill(0)
          .map((_, index) => (
            <div key={index} className={`card-back small ${position}`}>
              🂠
            </div>
          ))}
      </div>
    </div>
  );
}

export function MultiOpponentArea() {
  const { gameState, playerId } = useGameStore(state => ({
    gameState: state.gameState,
    playerId: state.playerId,
  }));

  if (!gameState) return null;

  const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
  const playerCount = gameState.players.length;
  
  // Find the human player's index
  const humanPlayerIndex = gameState.players.findIndex(p => p.id === playerId);
  
  if (humanPlayerIndex === -1) return null;

  // Create positioned opponents based on clockwise order from human player
  const getPositionedOpponents = () => {
    const opponents = [];
    
    for (let i = 1; i < playerCount; i++) {
      const opponentIndex = (humanPlayerIndex + i) % playerCount;
      const opponent = gameState.players[opponentIndex];
      
      // Map relative position to screen position (clockwise from bottom)
      let position: 'top' | 'left' | 'right';
      
      if (playerCount === 2) {
        position = 'top'; // Opponent directly across
      } else if (playerCount === 3) {
        position = i === 1 ? 'left' : 'top'; // First opponent left, second top
      } else { // playerCount === 4
        if (i === 1) position = 'left';       // First opponent (clockwise left)
        else if (i === 2) position = 'top';   // Second opponent (across/top)
        else position = 'right';               // Third opponent (clockwise right)
      }
      
      opponents.push({
        player: opponent,
        position,
        isCurrentTurn: currentTurnPlayer.id === opponent.id,
      });
    }
    
    return opponents;
  };

  const positionedOpponents = getPositionedOpponents();

  return (
    <>
      {positionedOpponents.map(({ player, position, isCurrentTurn }) => (
        <PositionedOpponentArea
          key={player.id}
          position={position}
          player={player}
          isCurrentTurn={isCurrentTurn}
        />
      ))}
    </>
  );
}