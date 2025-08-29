import { MobileGameBoard } from './mobile/MobileGameBoard';
import { useGameStore } from '../stores';

interface GameBoardProps {
  onBackToMenu?: (() => void) | undefined;
}

export function GameBoard(_props: GameBoardProps) {
  const gameState = useGameStore(state => state.gameState);

  if (!gameState) return null;

  // Always use mobile-first layout - desktop responsive adjustments handled via CSS
  // onBackToMenu is handled at GameContainer level for MobileWinModal
  return <MobileGameBoard />;
}
