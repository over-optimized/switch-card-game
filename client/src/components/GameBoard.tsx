import { DeckArea } from './DeckArea';
import { OpponentArea } from './OpponentArea';
import { PlayerHandArea } from './PlayerHandArea';

export function GameBoard() {
  return (
    <div className="game-board">
      <OpponentArea />
      <DeckArea />
      <PlayerHandArea />
    </div>
  );
}