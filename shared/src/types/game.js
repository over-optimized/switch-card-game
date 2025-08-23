export function createGameState(id, players, shuffledDeck) {
    return {
        id,
        players: [...players],
        drawPile: [...shuffledDeck],
        discardPile: [],
        currentPlayerIndex: 0,
        direction: 1,
        phase: 'waiting',
        createdAt: new Date(),
    };
}
export function createRoom(code, hostId, maxPlayers = 4) {
    return {
        code,
        hostId,
        players: [],
        maxPlayers,
        status: 'waiting',
        createdAt: new Date(),
    };
}
export function getCurrentPlayer(gameState) {
    return gameState.players[gameState.currentPlayerIndex];
}
export function getNextPlayerIndex(gameState) {
    const playerCount = gameState.players.length;
    let nextIndex = gameState.currentPlayerIndex + gameState.direction;
    if (nextIndex >= playerCount) {
        nextIndex = 0;
    }
    else if (nextIndex < 0) {
        nextIndex = playerCount - 1;
    }
    return nextIndex;
}
export function isGameFinished(gameState) {
    return gameState.players.some(player => player.hand.length === 0);
}
export function getWinner(gameState) {
    return gameState.players.find(player => player.hand.length === 0);
}
