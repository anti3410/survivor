
export type CharacterClass = 'GUNNER' | 'WIZARD' | 'FIGHTER';

export interface BaseStats {
  attackSpeed: number;
  damage: number;
  hp: number;
  moveSpeed: number;
}

export interface GunnerStats extends BaseStats {
  projectileCount: number;
}

export interface WizardStats extends BaseStats {
  attackArea: number;
}

export interface FighterStats extends BaseStats {
  reach: number;
}

export type CharacterStats = GunnerStats | WizardStats | FighterStats;

export interface ClassProgression {
  level: number;
  exp: number;
  stats: CharacterStats;
}

export interface GameProgress {
  selectedClass: CharacterClass;
  progression: {
    GUNNER: ClassProgression;
    WIZARD: ClassProgression;
    FIGHTER: ClassProgression;
  };
  clearedChallengeStage: number; // 클리어한 최고 단계
}

export enum GameState {
  HOME = 'HOME',
  CHARACTER_SELECT = 'CHARACTER_SELECT',
  CHALLENGE_SELECT = 'CHALLENGE_SELECT',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  LEVEL_UP = 'LEVEL_UP',
  CHALLENGE_SUCCESS = 'CHALLENGE_SUCCESS'
}

export interface Entity {
  x: number;
  y: number;
  radius: number;
  color: string;
}

export interface Enemy extends Entity {
  hp: number;
  maxHp: number;
  speed: number;
}

export interface Projectile extends Entity {
  vx: number;
  vy: number;
  damage: number;
}

export interface Explosion extends Entity {
  duration: number;
  maxDuration: number;
  damage: number;
}

export interface FighterStrike extends Entity {
  targetX: number;
  targetY: number;
  duration: number;
  maxDuration: number;
}
