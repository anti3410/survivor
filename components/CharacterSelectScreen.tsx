
import React from 'react';
import { CharacterClass, GameProgress } from '../types';

interface CharacterSelectScreenProps {
  onSelect: (charClass: CharacterClass) => void;
  currentSelection: CharacterClass;
  progression: GameProgress['progression'];
}

const CharacterSelectScreen: React.FC<CharacterSelectScreenProps> = ({ onSelect, currentSelection, progression }) => {
  return (
    <div 
      className="w-full h-full overflow-y-auto bg-slate-950 p-6 py-12 flex flex-col items-center scroll-smooth"
      style={{ touchAction: 'pan-y' }}
    >
      <h2 className="text-3xl font-bold mb-10 text-slate-400 uppercase tracking-widest flex-shrink-0">캐릭터 선택</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl pb-10">
        <CharacterCard 
          id="GUNNER"
          name="거너 (Gunner)"
          icon="🔫"
          description="원거리 발사체로 적을 제압합니다. 투사체 수 증가 시 화력이 급증합니다."
          isSelected={currentSelection === 'GUNNER'}
          onSelect={() => onSelect('GUNNER')}
          stats={progression.GUNNER.stats}
          level={progression.GUNNER.level}
        />
        <CharacterCard 
          id="WIZARD"
          name="마법사 (Wizard)"
          icon="🪄"
          description="가장 가까운 적에게 강력한 폭발을 일으킵니다. 광역 피해에 특화되어 있습니다."
          isSelected={currentSelection === 'WIZARD'}
          onSelect={() => onSelect('WIZARD')}
          stats={progression.WIZARD.stats}
          level={progression.WIZARD.level}
        />
        <CharacterCard 
          id="FIGHTER"
          name="격투가 (Fighter)"
          icon="🥊"
          description="빠른 공격 속도와 강력한 막대기 휘두르기로 근접한 적들을 박살냅니다."
          isSelected={currentSelection === 'FIGHTER'}
          onSelect={() => onSelect('FIGHTER')}
          stats={progression.FIGHTER.stats}
          level={progression.FIGHTER.level}
        />
      </div>

      <button 
        onClick={() => (window as any).location.reload()} 
        className="mt-4 mb-8 text-slate-600 hover:text-slate-400 text-sm transition-colors flex-shrink-0"
      >
        처음으로 돌아가기
      </button>
    </div>
  );
};

const CharacterCard: React.FC<{
  id: CharacterClass;
  name: string;
  icon: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
  stats: any;
  level: number;
}> = ({ id, name, icon, description, isSelected, onSelect, stats, level }) => (
  <div 
    onClick={onSelect}
    className={`p-6 rounded-2xl cursor-pointer transition-all border-4 flex flex-col ${
      isSelected ? 'bg-indigo-900/40 border-indigo-500 scale-105 shadow-[0_0_30px_rgba(99,102,241,0.3)]' : 'bg-slate-800 border-slate-700 hover:border-slate-500'
    }`}
  >
    <div className="text-6xl mb-4 text-center">{icon}</div>
    <div className="flex items-center justify-between mb-2">
        <h3 className="text-2xl font-bold">{name}</h3>
        <span className="bg-slate-700 px-3 py-1 rounded-full text-xs font-bold text-indigo-400">LV.{level}</span>
    </div>
    <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow h-20 overflow-hidden">{description}</p>
    
    <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold tracking-tighter text-slate-300 bg-slate-900/50 p-3 rounded-xl mb-4">
        <div className="flex justify-between border-b border-slate-700/50 pb-1">
            <span>공격속도</span>
            <span className="text-white">{(1000/stats.attackSpeed).toFixed(1)}/S</span>
        </div>
        <div className="flex justify-between border-b border-slate-700/50 pb-1">
            <span>데미지</span>
            <span className="text-white">{stats.damage}</span>
        </div>
        <div className="flex justify-between border-b border-slate-700/50 pb-1 sm:border-none">
            <span>체력</span>
            <span className="text-white">{stats.hp}</span>
        </div>
        <div className="flex justify-between border-b border-slate-700/50 pb-1 sm:border-none">
            <span>이동속도</span>
            <span className="text-white">{stats.moveSpeed.toFixed(1)}</span>
        </div>
        <div className="flex justify-between col-span-2 pt-1 border-t border-slate-700/50">
            <span>{id === 'GUNNER' ? '발사체 수' : id === 'WIZARD' ? '공격 범위' : '리치'}</span>
            <span className="text-white">
              {id === 'GUNNER' ? stats.projectileCount : id === 'WIZARD' ? stats.attackArea : stats.reach.toFixed(1)}
            </span>
        </div>
    </div>

    {isSelected ? (
      <div className="py-2 bg-indigo-500 text-center text-xs font-bold rounded-lg text-white">
        SELECTED
      </div>
    ) : (
      <div className="py-2 bg-slate-700 text-center text-xs font-bold rounded-lg text-slate-400">
        SELECT
      </div>
    )}
  </div>
);

export default CharacterSelectScreen;