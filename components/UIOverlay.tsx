
import React from 'react';
import { GameState, GameProgress, GunnerStats, WizardStats, FighterStats } from '../types';
import { EXP_PER_LEVEL } from '../constants';

interface UIOverlayProps {
  gameState: GameState;
  progress: GameProgress;
  challengeStage: number | null;
  onPause: () => void;
  onResume: () => void;
  onHome: () => void;
  onLevelUp: (updatedStats: any) => void;
  onRestart: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  gameState, 
  progress, 
  challengeStage,
  onPause, 
  onResume, 
  onHome, 
  onLevelUp,
  onRestart
}) => {
  const currentClass = progress.selectedClass;
  const currentProg = progress.progression[currentClass];
  const currentStats = currentProg.stats;

  const handleStatUpgrade = (statKey: string) => {
    const nextStats = { ...currentStats } as any;
    if (statKey === 'attackSpeed') {
      nextStats[statKey] *= 0.9; // 10% faster
    } else {
      nextStats[statKey] *= 1.15; // 15% increase
      if (statKey === 'projectileCount') nextStats[statKey] = Math.floor(nextStats[statKey]) + 1;
    }
    onLevelUp(nextStats);
  };

  const isMenuOpen = 
    gameState === GameState.PAUSED || 
    gameState === GameState.LEVEL_UP || 
    gameState === GameState.GAME_OVER || 
    gameState === GameState.CHALLENGE_SUCCESS;

  return (
    <div className={`absolute inset-0 pointer-events-none flex flex-col ${isMenuOpen ? 'pointer-events-auto' : ''}`}>
      <div className="p-4 flex flex-col items-center">
        <div className="w-full max-w-md bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-full p-1 flex items-center shadow-lg pointer-events-auto">
          <div className="bg-indigo-600 px-4 py-1 rounded-full text-xs font-bold mr-2">LV {currentProg.level}</div>
          <div className="flex-1 h-3 bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-400 transition-all duration-300"
              style={{ width: `${(currentProg.exp / EXP_PER_LEVEL(currentProg.level)) * 100}%` }}
            />
          </div>
          {challengeStage && (
            <div className="ml-2 px-3 py-1 bg-amber-500 rounded-full text-[10px] font-black text-black">STAGE {challengeStage}</div>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); onPause(); }}
            className="ml-2 w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-full transition-colors"
          >
            ⏸
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        {gameState === GameState.PAUSED && (
          <OverlayContainer title="일시 정지">
            <MenuButton onClick={onResume} label="게임 재개" variant="primary" />
            <MenuButton onClick={onHome} label="홈으로 이동" variant="secondary" />
          </OverlayContainer>
        )}

        {gameState === GameState.LEVEL_UP && (
          <OverlayContainer title="레벨 업!">
            <p className="text-slate-400 mb-6">강화할 스탯을 선택하세요</p>
            <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
              <StatUpgradeButton label="공격 속도" onClick={() => handleStatUpgrade('attackSpeed')} />
              <StatUpgradeButton label="데미지" onClick={() => handleStatUpgrade('damage')} />
              <StatUpgradeButton label="이동 속도" onClick={() => handleStatUpgrade('moveSpeed')} />
              <StatUpgradeButton label="생명력" onClick={() => handleStatUpgrade('hp')} />
              {currentClass === 'GUNNER' && (
                <StatUpgradeButton label="발사체 수" onClick={() => handleStatUpgrade('projectileCount')} />
              )}
              {currentClass === 'WIZARD' && (
                <StatUpgradeButton label="공격 범위" onClick={() => handleStatUpgrade('attackArea')} />
              )}
              {currentClass === 'FIGHTER' && (
                <StatUpgradeButton label="리치 강화" onClick={() => handleStatUpgrade('reach')} />
              )}
            </div>
          </OverlayContainer>
        )}

        {gameState === GameState.GAME_OVER && (
          <OverlayContainer title="전투 종료">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">💀</div>
              <p className="text-xl text-slate-300">당신의 여정이 끝났습니다.</p>
              <p className="text-slate-500 mt-2">레벨 {currentProg.level}까지 도달하셨습니다.</p>
            </div>
            <MenuButton onClick={onRestart} label="다시 시작" variant="primary" />
            <MenuButton onClick={onHome} label="포기하고 홈으로" variant="secondary" />
          </OverlayContainer>
        )}

        {gameState === GameState.CHALLENGE_SUCCESS && (
          <OverlayContainer title="챌린지 성공!">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4 animate-bounce">🏆</div>
              <p className="text-2xl text-yellow-400 font-black">STAGE {challengeStage} 클리어!</p>
              <p className="text-slate-400 mt-2">다음 단계가 잠금 해제되었습니다.</p>
            </div>
            <MenuButton onClick={onHome} label="홈으로 돌아가기" variant="primary" />
          </OverlayContainer>
        )}
      </div>
    </div>
  );
};

const OverlayContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 pointer-events-auto">
    <h2 className="text-4xl font-black text-white mb-8 tracking-tighter uppercase">{title}</h2>
    {children}
  </div>
);

const MenuButton: React.FC<{ onClick: () => void; label: string; variant: 'primary' | 'secondary' }> = ({ onClick, label, variant }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`w-full max-w-xs py-4 rounded-xl text-xl font-bold transition-all active:scale-95 mb-4 ${
      variant === 'primary' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-lg' : 'bg-slate-800 hover:bg-slate-700'
    }`}
  >
    {label}
  </button>
);

const StatUpgradeButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className="w-full bg-slate-800 hover:bg-indigo-900 border border-slate-700 hover:border-indigo-500 p-4 rounded-xl flex items-center justify-between group transition-all"
  >
    <span className="font-bold">{label}</span>
    <span className="text-indigo-400 group-hover:translate-x-1 transition-transform">UP ➔</span>
  </button>
);

export default UIOverlay;
