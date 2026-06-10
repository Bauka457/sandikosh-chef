/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { GameScreen } from './GameScreen';
import { MenuScreen } from './MenuScreen';

export type GameMode = 'bauka' | 'guests' | 'free';

export default function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');
  const [mode, setMode] = useState<GameMode>('guests');
  const [playerName, setPlayerName] = useState('Шеф');

  const handleStart = (name: string, selectedMode: GameMode) => {
    setPlayerName(name || 'Шеф');
    setMode(selectedMode);
    setGameState('playing');
  };

  return (
    <div className="w-full h-[100dvh] bg-neutral-900 flex justify-center items-center overflow-hidden font-sans">
      <div className="w-full max-w-[428px] h-full bg-white shadow-2xl relative overflow-hidden flex flex-col">
        {gameState === 'menu' ? (
          <MenuScreen onStart={handleStart} />
        ) : (
          <GameScreen 
             mode={mode} 
             playerName={playerName}
             onQuit={() => setGameState('menu')} 
          />
        )}
      </div>
    </div>
  );
}
