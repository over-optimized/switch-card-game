export function createPlayer(id, name, isHost = false) {
    return {
        id,
        name,
        hand: [],
        isConnected: true,
        isHost,
    };
}
export function addCardToHand(player, card) {
    return {
        ...player,
        hand: [...player.hand, card],
    };
}
export function removeCardFromHand(player, cardId) {
    return {
        ...player,
        hand: player.hand.filter(card => card.id !== cardId),
    };
}
export function getHandSize(player) {
    return player.hand.length;
}
