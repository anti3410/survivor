
import React, { useState } from 'react';

interface ChallengeSelectScreenProps {
  clearedStage: number;
  onSelectStage: (stage: number) => void;
  onBack: () => void;
}

const ChallengeSelectScreen: React.FC<ChallengeSelectScreenProps> = ({ clearedStage, onSelectStage, onBack }) => {
  // 1단계부터 99단계까지 동적 생성
  const stages = Array.from({ length: 99 }, (_, i) => i + 1);
  
  // 기본적으로 클리어한 다음 단계나 마지막 클리어 단계에 포커스
  // 만약 모든 단계를 클리어했다면 마지막 단계(index 98)에 고정
  const initialIndex = Math.min(clearedStage, stages.length - 1);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const currentStage = stages[currentIndex];
  const isUnlocked = currentStage === 1 || currentStage <= clearedStage + 1;
  const isCleared = currentStage <= clearedStage;

  const handleNext = () => {
    if (currentIndex < stages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-slate-950 p-6 overflow-y-auto">
      <h2 className="text-4xl font-black mb-2 text-white uppercase tracking-tighter">챌린지 모드</h2>
      <p className="text-slate-500 mb-12 font-bold text-center">단계별 도전에 성공하여 한계를 시험하세요!</p>
      
      <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-md">
        {/* 단계 선택기 */}
        <div className="flex items-center justify-between w-full bg-slate-900/50 p-8 rounded-3xl border-2 border-slate-800 shadow-2xl relative">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all border-2
              ${currentIndex === 0 
                ? 'opacity-20 border-slate-700 cursor-not-allowed' 
                : 'bg-slate-800 border-indigo-500 hover:bg-indigo-600 active:scale-90 text-white shadow-lg shadow-indigo-500/20'}`}
          >
            <span className="text-2xl">◀</span>
          </button>

          <div className="flex flex-col items-center min-w-[120px]">
            <div className="relative">
              <span className={`text-7xl font-black tracking-tighter transition-all ${isUnlocked ? 'text-white' : 'text-slate-700'}`}>
                {currentStage}
              </span>
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl filter drop-shadow-md">🔒</span>
                </div>
              )}
              {isCleared && (
                <div className="absolute -top-4 -right-6 text-yellow-400 text-4xl animate-bounce">
                  ★
                </div>
              )}
            </div>
            <span className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 mt-2">STAGE</span>
          </div>

          <button 
            onClick={handleNext}
            disabled={currentIndex === stages.length - 1}
            className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all border-2
              ${currentIndex === stages.length - 1 
                ? 'opacity-20 border-slate-700 cursor-not-allowed' 
                : 'bg-slate-800 border-indigo-500 hover:bg-indigo-600 active:scale-90 text-white shadow-lg shadow-indigo-500/20'}`}
          >
            <span className="text-2xl">▶</span>
          </button>
        </div>

        {/* 상태 및 시작 버튼 */}
        <div className="flex flex-col items-center w-full space-y-6">
          <div className="h-6">
            {!isUnlocked && (
              <p className="text-red-500 font-bold text-sm animate-pulse">이전 단계를 먼저 클리어하세요!</p>
            )}
            {isCleared && (
              <p className="text-yellow-500 font-bold text-sm uppercase tracking-widest">CLEARED</p>
            )}
          </div>

          <button
            disabled={!isUnlocked}
            onClick={() => onSelectStage(currentStage)}
            className={`
              w-full py-5 rounded-2xl text-2xl font-black uppercase tracking-widest transition-all
              ${isUnlocked 
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:scale-95 shadow-[0_0_25px_rgba(79,70,229,0.4)] text-white' 
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
            `}
          >
            챌린지 시작
          </button>

          <button 
            onClick={onBack} 
            className="px-8 py-3 text-slate-400 hover:text-white font-bold transition-all"
          >
            취소하고 돌아가기
          </button>
        </div>
      </div>

      {/* 단계 정보 가이드 */}
      <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-md">
        <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/50 text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">제한 시간</p>
          <p className="text-white font-black">60 SECONDS</p>
        </div>
        <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/50 text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">난이도</p>
          <p className="text-indigo-400 font-black">STAGE {currentStage} LEVEL</p>
        </div>
      </div>
    </div>
  );
};

export default ChallengeSelectScreen;
