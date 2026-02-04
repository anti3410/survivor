
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, GameProgress, CharacterClass } from './types';
import { loadProgress, saveProgress } from './store';
import HomeScreen from './components/HomeScreen';
import CharacterSelectScreen from './components/CharacterSelectScreen';
import ChallengeSelectScreen from './components/ChallengeSelectScreen';
import GameView from './components/GameView';
import UIOverlay from './components/UIOverlay';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.HOME);
  const [progress, setProgress] = useState<GameProgress>(loadProgress());
  const [currentChallengeStage, setCurrentChallengeStage] = useState<number | null>(null);
  
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const handleStartGame = () => {
    setCurrentChallengeStage(null);
    setGameState(GameState.PLAYING);
  };

  const handleStartChallenge = (stage: number) => {
    setCurrentChallengeStage(stage);
    setGameState(GameState.PLAYING);
  };

  const handleSelectCharacter = (charClass: CharacterClass) => {
    setProgress(prev => ({ ...prev, selectedClass: charClass }));
    setGameState(GameState.HOME);
  };

  const handleLevelUp = useCallback((updatedStats: any) => {
    setProgress(prev => {
      const currentClass = prev.selectedClass;
      return {
        ...prev,
        progression: {
          ...prev.progression,
          [currentClass]: {
            ...prev.progression[currentClass],
            level: prev.progression[currentClass].level + 1,
            stats: updatedStats
          }
        }
      };
    });
    setGameState(GameState.PLAYING);
  }, []);

  const handleGameOver = (finalExp: number) => {
    setProgress(prev => {
      const currentClass = prev.selectedClass;
      return {
        ...prev,
        progression: {
          ...prev.progression,
          [currentClass]: {
            ...prev.progression[currentClass],
            exp: finalExp
          }
        }
      };
    });
    setGameState(GameState.GAME_OVER);
  };

  const handleChallengeSuccess = () => {
    if (currentChallengeStage !== null) {
      setProgress(prev => ({
        ...prev,
        clearedChallengeStage: Math.max(prev.clearedChallengeStage, currentChallengeStage)
      }));
    }
    setGameState(GameState.CHALLENGE_SUCCESS);
  };

  const handleExpGain = (newExp: number) => {
    setProgress(prev => {
      const currentClass = prev.selectedClass;
      return {
        ...prev,
        progression: {
          ...prev.progression,
          [currentClass]: {
            ...prev.progression[currentClass],
            exp: newExp
          }
        }
      };
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900 text-white select-none">
      {gameState === GameState.HOME && (
        <HomeScreen 
          progress={progress} 
          onStart={handleStartGame} 
          onNavigateSelect={() => setGameState(GameState.CHARACTER_SELECT)}
          onNavigateChallenge={() => setGameState(GameState.CHALLENGE_SELECT)}
        />
      )}

      {gameState === GameState.CHARACTER_SELECT && (
        <CharacterSelectScreen 
          onSelect={handleSelectCharacter} 
          currentSelection={progress.selectedClass}
          progression={progress.progression}
        />
      )}

      {gameState === GameState.CHALLENGE_SELECT && (
        <ChallengeSelectScreen
          clearedStage={progress.clearedChallengeStage}
          onSelectStage={handleStartChallenge}
          onBack={() => setGameState(GameState.HOME)}
        />
      )}

      {(gameState === GameState.PLAYING || 
        gameState === GameState.PAUSED || 
        gameState === GameState.LEVEL_UP || 
        gameState === GameState.CHALLENGE_SUCCESS ||
        gameState === GameState.GAME_OVER) && (
        <>
          <GameView 
            gameState={gameState} 
            progress={progress}
            challengeStage={currentChallengeStage}
            setGameState={setGameState}
            onLevelUpTrigger={() => setGameState(GameState.LEVEL_UP)}
            onGameOver={handleGameOver}
            onChallengeSuccess={handleChallengeSuccess}
            onExpGain={handleExpGain}
          />
          <UIOverlay 
            gameState={gameState}
            progress={progress}
            challengeStage={currentChallengeStage}
            onPause={() => setGameState(GameState.PAUSED)}
            onResume={() => setGameState(GameState.PLAYING)}
            onHome={() => setGameState(GameState.HOME)}
            onLevelUp={handleLevelUp}
            onRestart={() => {
              setGameState(GameState.PLAYING);
            }}
          />
        </>
      )}
    </div>
  );
};

export default App;
