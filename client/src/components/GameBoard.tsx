import { useState, useEffect } from 'react';
import { DeckArea } from './DeckArea';
import { MultiOpponentArea } from './MultiOpponentArea';
import { MobileOpponentArea } from './MobileOpponentArea';
import { PlayerHandArea } from './PlayerHandArea';
import { PenaltyIndicator } from './PenaltyIndicator';
import { SkipIndicator } from './SkipIndicator';
import { SuitSelector } from './SuitSelector';
import { useGameStore } from '../stores';

export function GameBoard() {
  const [isMobile, setIsMobile] = useState(false);
  const gameState = useGameStore(state => state.gameState);
  const playerId = useGameStore(state => state.playerId);
  const penaltyState = useGameStore(state => state.penaltyState);
  const suitSelectionOpen = useGameStore(state => state.suitSelectionOpen);
  const { closeSuitSelection, selectSuit } = useGameStore(state => ({
    closeSuitSelection: state.closeSuitSelection,
    selectSuit: state.selectSuit,
  }));

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!gameState) return null;

  const playerCount = gameState.players.length;

  // Prepare opponents data for mobile
  const getOpponents = () => {
    if (!gameState || !playerId) return [];
    
    const humanPlayerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (humanPlayerIndex === -1) return [];

    const opponents = [];
    for (let i = 1; i < playerCount; i++) {
      const opponentIndex = (humanPlayerIndex + i) % playerCount;
      const opponent = gameState.players[opponentIndex];
      const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
      
      opponents.push({
        id: opponent.id,
        name: opponent.name,
        hand: opponent.hand,
        isCurrentTurn: currentTurnPlayer.id === opponent.id,
      });
    }
    
    return opponents;
  };

  const opponents = getOpponents();

  return (
    <div className={`game-board game-board-${playerCount}p ${isMobile ? 'mobile' : ''}`}>
      {isMobile && opponents.length > 0 ? (
        <MobileOpponentArea opponents={opponents} />
      ) : (
        <MultiOpponentArea />
      )}
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
