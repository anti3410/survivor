
import { GunnerStats, WizardStats, FighterStats } from './types';

export const INITIAL_GUNNER_STATS: GunnerStats = {
  attackSpeed: 1000,
  damage: 20,
  hp: 100,
  moveSpeed: 2.1,
  projectileCount: 1,
};

export const INITIAL_WIZARD_STATS: WizardStats = {
  attackSpeed: 500,
  damage: 15,
  hp: 80,
  moveSpeed: 1.75,
  attackArea: 60,
};

export const INITIAL_FIGHTER_STATS: FighterStats = {
  attackSpeed: 400, // 1000 / 2.5s = 400ms
  damage: 18,
  hp: 130,
  moveSpeed: 2.3,
  reach: 1.5, // 초기 리치값 1.5 (게임 로직에서 스케일링하여 사용)
};

export const STORAGE_KEY = 'pixel_survivor_save_v3';

export const EXP_PER_LEVEL = (level: number) => 100 + (level * 50);
export const ENEMY_SPAWN_RATE = 1500;
