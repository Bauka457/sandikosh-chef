/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { GameScreen } from './GameScreen';
import { MenuScreen } from './MenuScreen';
import { ProfileScreen } from './ProfileScreen';
import { Profile, loadProfile, DEFAULT_PROFILE } from './profile';

export type GameMode = 'bauka' | 'guests' | 'free';

type Screen = 'setup' | 'menu' | 'playing' | 'profile';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [mode, setMode] = useState<GameMode>('guests');

  useEffect(() => {
    const saved = loadProfile();
    if (saved) {
      setProfile(saved);
      setScreen('menu');
    } else {
      setScreen('setup');
    }
  }, []);

  const handleProfileSave = (p: Profile) => {
    setProfile(p);
    setScreen('menu');
  };

  const handleStart = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setScreen('playing');
  };

  const handleQuit = () => {
    const refreshed = loadProfile();
    if (refreshed) setProfile(refreshed);
    setScreen('menu');
  };

  return (
    <div className="w-full h-dvh bg-neutral-900 flex justify-center items-center overflow-hidden font-sans">
      <div className="w-full max-w-107 h-full bg-white shadow-2xl relative overflow-hidden flex flex-col">
        {screen === 'setup' && (
          <ProfileScreen
            profile={profile}
            onSave={handleProfileSave}
            onBack={() => setScreen('menu')}
            isSetup
          />
        )}
        {screen === 'menu' && (
          <MenuScreen
            profile={profile}
            onStart={handleStart}
            onEditProfile={() => setScreen('profile')}
          />
        )}
        {screen === 'profile' && (
          <ProfileScreen
            profile={profile}
            onSave={handleProfileSave}
            onBack={() => setScreen('menu')}
          />
        )}
        {screen === 'playing' && (
          <GameScreen
            mode={mode}
            playerName={profile.name}
            playerAvatar={profile.avatar}
            onQuit={handleQuit}
          />
        )}
      </div>
    </div>
  );
}
