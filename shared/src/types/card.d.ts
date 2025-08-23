export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export interface Card {
    suit: Suit;
    rank: Rank;
    id: string;
}
export interface Deck {
    cards: Card[];
}
export declare function createCard(suit: Suit, rank: Rank): Card;
export declare function createStandardDeck(): Card[];
export declare function shuffleDeck(cards: Card[]): Card[];
export declare function getCardDisplayName(card: Card): string;
