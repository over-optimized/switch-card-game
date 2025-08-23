import { describe, it, expect } from 'vitest';
import { createCard, createStandardDeck, shuffleDeck, getCardDisplayName } from './card.js';

describe('Card Functions', () => {
  it('should create a card with correct properties', () => {
    const card = createCard('hearts', 'A');
    
    expect(card.suit).toBe('hearts');
    expect(card.rank).toBe('A');
    expect(card.id).toBe('hearts-A');
  });

  it('should create a standard 52-card deck', () => {
    const deck = createStandardDeck();
    
    expect(deck).toHaveLength(52);
    
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    for (const suit of suits) {
      for (const rank of ranks) {
        const expectedId = `${suit}-${rank}`;
        expect(deck.some(card => card.id === expectedId)).toBe(true);
      }
    }
  });

  it('should shuffle deck differently', () => {
    const originalDeck = createStandardDeck();
    const shuffledDeck1 = shuffleDeck(originalDeck);
    const shuffledDeck2 = shuffleDeck(originalDeck);
    
    expect(shuffledDeck1).toHaveLength(52);
    expect(shuffledDeck2).toHaveLength(52);
    
    const isDifferent = shuffledDeck1.some((card, index) => 
      card.id !== originalDeck[index].id
    );
    expect(isDifferent).toBe(true);
  });

  it('should get correct card display name', () => {
    expect(getCardDisplayName(createCard('hearts', 'A'))).toBe('A♥');
    expect(getCardDisplayName(createCard('diamonds', 'K'))).toBe('K♦');
    expect(getCardDisplayName(createCard('clubs', '7'))).toBe('7♣');
    expect(getCardDisplayName(createCard('spades', '10'))).toBe('10♠');
  });
});