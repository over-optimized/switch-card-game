import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../stores';

interface MobileOpponentAreaProps {
  opponents: Array<{
    id: string;
    name: string;
    hand: { id: string }[];
    isCurrentTurn: boolean;
  }>;
}

export function MobileOpponentArea({ opponents }: MobileOpponentAreaProps) {
  const [currentOpponentIndex, setCurrentOpponentIndex] = useState(0);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const { gameState, playerId } = useGameStore(state => ({
    gameState: state.gameState,
    playerId: state.playerId,
  }));

  // Auto-focus on current turn player
  useEffect(() => {
    if (!gameState) return;

    const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
    const userTurn = currentTurnPlayer.id === playerId;
    setIsUserTurn(userTurn);

    // Auto-show current turn opponent (if not user's turn)
    if (!userTurn) {
      const currentTurnOpponentIndex = opponents.findIndex(
        opp => opp.id === currentTurnPlayer.id
      );
      if (currentTurnOpponentIndex !== -1) {
        setCurrentOpponentIndex(currentTurnOpponentIndex);
      }
    }
  }, [gameState, opponents, playerId]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = false;
  };

  const handleTouchMove = () => {
    if (!isDragging.current) {
      isDragging.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;

    const endX = e.changedTouches[0].clientX;
    const diffX = startX.current - endX;
    const minSwipeDistance = 50;

    if (Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        // Swipe left - next opponent
        setCurrentOpponentIndex(prev => 
          prev < opponents.length - 1 ? prev + 1 : 0
        );
      } else {
        // Swipe right - previous opponent
        setCurrentOpponentIndex(prev => 
          prev > 0 ? prev - 1 : opponents.length - 1
        );
      }
    }

    isDragging.current = false;
  };

  if (opponents.length === 0) return null;

  const currentOpponent = opponents[currentOpponentIndex];
  const showSwipeIndicators = opponents.length > 1;

  return (
    <div className="mobile-opponent-container">
      <div
        ref={containerRef}
        className="mobile-opponent-area"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="opponent-display">
          <div className="opponent-info">
            <h4 className={`opponent-name ${currentOpponent.isCurrentTurn ? 'current-turn' : ''}`}>
              {currentOpponent.name} ({currentOpponent.hand.length})
            </h4>
            {currentOpponent.isCurrentTurn && !isUserTurn && (
              <span className="turn-indicator">👤 TURN</span>
            )}
          </div>
          
          <div className="opponent-cards-container">
            <div className="opponent-cards">
              {Array(Math.min(currentOpponent.hand.length, 8))
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="card-back mobile-opponent-card">
                    🂠
                  </div>
                ))}
              {currentOpponent.hand.length > 8 && (
                <div className="more-cards-indicator">
                  +{currentOpponent.hand.length - 8}
                </div>
              )}
            </div>
          </div>
        </div>

        {showSwipeIndicators && (
          <div className="swipe-indicators">
            {opponents.map((_, index) => (
              <div
                key={index}
                className={`swipe-dot ${index === currentOpponentIndex ? 'active' : ''}`}
                onClick={() => setCurrentOpponentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
      
      {showSwipeIndicators && (
        <div className="swipe-hint">
          Swipe to see other players • {currentOpponentIndex + 1} of {opponents.length}
        </div>
      )}
    </div>
  );
}