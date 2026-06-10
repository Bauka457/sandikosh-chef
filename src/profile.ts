export interface Profile {
  name: string;
  avatar: string; // emoji
  totalCoins: number;
  dishesServed: number;
  gamesPlayed: number;
}

const KEY = 'bauka_chef_profile';

export const AVATARS = [
  '👨‍🍳','👩‍🍳','🐻','😸','🦊','🐼','🐸','🦁','🐯','🐺',
  '🤖','👽','🧑‍🚀','🦄','🐉','🎃','🤠','😎','🦸','🧙',
  '🐨','🐮','🐷','🐙','🦅','🐬','🦊','🐝','🍕','🌟',
];

export const DEFAULT_PROFILE: Profile = {
  name: '',
  avatar: '👨‍🍳',
  totalCoins: 0,
  dishesServed: 0,
  gamesPlayed: 0,
};

export const loadProfile = (): Profile | null => {
  try {
    const s = localStorage.getItem(KEY);
    if (!s) return null;
    const p = JSON.parse(s) as Profile;
    return p.name ? p : null;
  } catch { return null; }
};

export const saveProfile = (p: Profile): void => {
  localStorage.setItem(KEY, JSON.stringify(p));
};

export const addSessionStats = (coins: number, dishes: number): void => {
  const p = loadProfile();
  if (!p) return;
  saveProfile({
    ...p,
    totalCoins: p.totalCoins + coins,
    dishesServed: p.dishesServed + dishes,
    gamesPlayed: p.gamesPlayed + 1,
  });
};
