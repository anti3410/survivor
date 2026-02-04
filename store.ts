
import { GameProgress } from './types';
import { INITIAL_GUNNER_STATS, INITIAL_WIZARD_STATS, INITIAL_FIGHTER_STATS, STORAGE_KEY } from './constants';

export const saveProgress = (progress: GameProgress) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

export const loadProgress = (): GameProgress => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.clearedChallengeStage === undefined) parsed.clearedChallengeStage = 0;
      // 신규 캐릭터 데이터가 없는 경우를 위한 보정
      if (!parsed.progression.FIGHTER) {
        parsed.progression.FIGHTER = {
          level: 1,
          exp: 0,
          stats: { ...INITIAL_FIGHTER_STATS }
        };
      }
      return parsed;
    } catch (e) {
      console.error("Failed to parse save data", e);
    }
  }
  return {
    selectedClass: 'GUNNER',
    progression: {
      GUNNER: {
        level: 1,
        exp: 0,
        stats: { ...INITIAL_GUNNER_STATS }
      },
      WIZARD: {
        level: 1,
        exp: 0,
        stats: { ...INITIAL_WIZARD_STATS }
      },
      FIGHTER: {
        level: 1,
        exp: 0,
        stats: { ...INITIAL_FIGHTER_STATS }
      }
    },
    clearedChallengeStage: 0
  };
};

export const resetProgress = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};
