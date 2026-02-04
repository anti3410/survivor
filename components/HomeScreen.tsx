
import React from 'react';
import { GameProgress, GunnerStats, WizardStats, FighterStats } from '../types';

interface HomeScreenProps {
  progress: GameProgress;
  onStart: () => void;
  onNavigateSelect: () => void;
  onNavigateChallenge: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ progress, onStart, onNavigateSelect, onNavigateChallenge }) => {
  const currentClass = progress.selectedClass;
  const currentProg = progress.progression[currentClass];
  const stats = currentProg.stats;

  const renderSpecificStat = () => {
    switch(currentClass) {
      case 'GUNNER':
        return <StatRow label="발사체 수" value={(stats as GunnerStats).projectileCount} />;
      case 'WIZARD':
        return <StatRow label="공격범위" value={(stats as WizardStats).attackArea} />;
      case 'FIGHTER':
        return <StatRow label="리치" value={(stats as FighterStats).reach.toFixed(1)} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 bg-gradient-to-b from-slate-800 to-slate-950 p-6 overflow-y-auto">
      <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600 mb-2 animate-pulse text-center">
        PIXEL SURVIVOR
      </h1>

      <div className="w-full max-w-sm bg-slate-800/80 rounded-2xl border-2 border-slate-700 p-6 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-3xl">
              {currentClass === 'GUNNER' ? '🔫' : currentClass === 'WIZARD' ? '🪄' : '🥊'}
            </div>
            <div>
              <h2 className="text-xl font-bold">{currentClass}</h2>
              <p className="text-sm text-slate-400">Level {currentProg.level}</p>
            </div>
          </div>
          <button 
            onClick={onNavigateSelect}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold transition-colors shadow-lg"
          >
            변경
          </button>
        </div>

        <div className="space-y-3">
          <StatRow label="공격속도" value={`${(1000/stats.attackSpeed).toFixed(2)}/s`} />
          <StatRow label="데미지" value={stats.damage} />
          <StatRow label="생명력" value={stats.hp} />
          <StatRow label="이동속도" value={stats.moveSpeed.toFixed(2)} />
          {renderSpecificStat()}
        </div>
      </div>

      <div className="flex flex-col w-full max-w-xs space-y-4">
        <button 
          onClick={onStart}
          className="group relative w-full px-8 py-4 bg-orange-500 hover:bg-orange-400 rounded-full text-2xl font-black tracking-widest shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all active:scale-95"
        >
          <span className="relative z-10 uppercase">무한 모드</span>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-full transition-opacity"></div>
        </button>

        <button 
          onClick={onNavigateChallenge}
          className="group relative w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full text-xl font-bold tracking-widest shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all active:scale-95 border-b-4 border-indigo-800"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            🏆 챌린지 모드
          </span>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-full transition-opacity"></div>
        </button>
      </div>
    </div>
  );
};

const StatRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between items-center text-slate-300 border-b border-slate-700/50 pb-1">
    <span className="text-sm">{label}</span>
    <span className="font-mono text-white font-bold">{value}</span>
  </div>
);

export default HomeScreen;
