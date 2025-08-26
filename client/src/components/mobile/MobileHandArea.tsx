import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Card } from '../Card';
import type { Card as CardType } from '../../../../shared/src/types/card';

export function MobileHandArea() {
  const gameState = useGameStore(state => state.gameState);
  const playerId = useGameStore(state => state.playerId);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  if (!gameState || !playerId) return null;

  const currentPlayer = gameState.players.find(player => player.id === playerId);
  if (!currentPlayer) return null;

  const handleCardClick = (card: CardType) => {
    setSelectedCards(prev => {
      if (prev.includes(card.id)) {
        return prev.filter(id => id !== card.id);
      } else {
        return [...prev, card.id];
      }
    });
  };

  return (
    <div className="mobile-hand">
      {currentPlayer.hand.map(card => (
        <Card
          key={card.id}
          card={card}
          onClick={() => handleCardClick(card)}
          isSelected={selectedCards.includes(card.id)}
        />
      ))}
    </div>
  );
}