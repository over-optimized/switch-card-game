import { useEffect } from 'react';
import { track } from '@vercel/analytics';
import { GameContainer, MenuScreen } from './components';
import { useUIStore, useGameStore } from './stores';
import { GameSetupConfig } from './components/MenuScreen';

export function App() {
  const { currentScreen, setCurrentScreen, setGameSetup } = useUIStore(
    state => ({
      currentScreen: state.currentScreen,
      setCurrentScreen: state.setCurrentScreen,
      setGameSetup: state.setGameSetup,
    }),
  );

  const { setupWebSocketGame, gameState } = useGameStore(state => ({
    setupWebSocketGame: state.setupWebSocketGame,
    gameState: state.gameState,
  }));

  // Add/remove game-active class based on current screen for mobile overflow control
  useEffect(() => {
    if (currentScreen === 'game') {
      document.body.classList.add('game-active');
    } else {
      document.body.classList.remove('game-active');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('game-active');
    };
  }, [currentScreen]);

  const handleStartGame = (config: GameSetupConfig) => {
    setGameSetup(config);
    setupWebSocketGame(config);
    setCurrentScreen('game');
  };

  const handleBackToMenu = () => {
    // Track local game abandonment if there's an active game
    if (gameState && gameState.phase === 'playing') {
      const gameDurationMs = gameState.gameStats.gameDurationMs || 0;
      const totalPossibleMoves = gameState.players.length * 10; // Rough estimate
      const progressPercentage = Math.min(
        (gameState.gameStats.totalMoves / totalPossibleMoves) * 100,
        90,
      );

      track('game_abandoned', {
        duration_seconds: Math.round(gameDurationMs / 1000),
        progress_percentage: Math.round(progressPercentage),
        abandonment_reason: 'back_to_menu',
        player_count: gameState.players.length,
        total_moves: gameState.gameStats.totalMoves,
        game_mode: 'local',
      });
    }

    setCurrentScreen('menu');
  };

  return (
    <div className="app">
      {currentScreen === 'menu' && <MenuScreen onStartGame={handleStartGame} />}

      {currentScreen === 'game' && (
        <GameContainer onBackToMenu={handleBackToMenu} />
      )}
    </div>
  );
}
