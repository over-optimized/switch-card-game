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

  const setupLocalGame = useGameStore(state => state.setupLocalGame);

  const handleStartGame = (config: GameSetupConfig) => {
    setGameSetup(config);
    setupLocalGame(config);
    setCurrentScreen('game');
  };

  const handleBackToMenu = () => {
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
