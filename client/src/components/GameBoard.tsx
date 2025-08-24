import { DeckArea } from './DeckArea';
import { MultiOpponentArea } from './MultiOpponentArea';
import { PlayerHandArea } from './PlayerHandArea';
import { PenaltyIndicator } from './PenaltyIndicator';
import { SkipIndicator } from './SkipIndicator';
import { SuitSelector } from './SuitSelector';
import { useGameStore } from '../stores';

export function GameBoard() {
  const gameState = useGameStore(state => state.gameState);
  const penaltyState = useGameStore(state => state.penaltyState);
  const suitSelectionOpen = useGameStore(state => state.suitSelectionOpen);
  const { closeSuitSelection, selectSuit } = useGameStore(state => ({
    closeSuitSelection: state.closeSuitSelection,
    selectSuit: state.selectSuit,
  }));

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
      <PenaltyIndicator penaltyState={penaltyState} />
      <SkipIndicator gameState={gameState} />
      <SuitSelector
        isOpen={suitSelectionOpen}
        onSuitSelect={selectSuit}
        onClose={closeSuitSelection}
      />
    </div>
  );
}
