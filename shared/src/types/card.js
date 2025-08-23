export function createCard(suit, rank) {
    return {
        suit,
        rank,
        id: `${suit}-${rank}`,
    };
}
export function createStandardDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const cards = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            cards.push(createCard(suit, rank));
        }
    }
    return cards;
}
export function shuffleDeck(cards) {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
export function getCardDisplayName(card) {
    const suitSymbols = {
        hearts: '♥',
        diamonds: '♦',
        clubs: '♣',
        spades: '♠',
    };
    return `${card.rank}${suitSymbols[card.suit]}`;
}
