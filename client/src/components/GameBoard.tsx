import { DeckArea } from './DeckArea';
import { MultiOpponentArea } from './MultiOpponentArea';
import { PlayerHandArea } from './PlayerHandArea';
import { useGameStore } from '../stores';

export function GameBoard() {
  const gameState = useGameStore(state => state.gameState);

  if (!gameState) return null;

  const playerCount = gameState.players.length;

  return (
    <div className={`game-board game-board-${playerCount}p`}>
      <MultiOpponentArea />
      <div className="center-area">
        <DeckArea />
      </div>
      <div className="player-area">
        <PlayerHandArea />
      </div>
    </div>
  );
}
