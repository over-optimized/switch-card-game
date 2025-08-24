import { useEffect } from 'react';
import { GameContainer } from './components/GameContainer';
import { useGameStore } from './stores';

export function App() {
  const setupLocalGame = useGameStore(state => state.setupLocalGame);
  
  // Initialize the game on app start
  useEffect(() => {
    setupLocalGame();
  }, [setupLocalGame]);
  
  return (
    <div className="app">
      <GameContainer />
    </div>
  );
}