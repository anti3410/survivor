
import React, { useRef, useEffect } from 'react';
import { 
  GameState, 
  GameProgress, 
  Enemy, 
  Projectile, 
  Explosion, 
  GunnerStats, 
  WizardStats,
  FighterStats,
  FighterStrike
} from '../types';
import { EXP_PER_LEVEL, ENEMY_SPAWN_RATE } from '../constants';

interface GameViewProps {
  gameState: GameState;
  progress: GameProgress;
  challengeStage: number | null;
  setGameState: (state: GameState) => void;
  onLevelUpTrigger: () => void;
  onGameOver: (exp: number) => void;
  onChallengeSuccess: () => void;
  onExpGain: (newExp: number) => void;
}

const CHALLENGE_TIME = 60000;

const GameView: React.FC<GameViewProps> = ({ 
  gameState, 
  progress, 
  challengeStage,
  onLevelUpTrigger, 
  onGameOver,
  onChallengeSuccess,
  onExpGain
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const gameTimeRef = useRef(0);
  const playerRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    hp: 0,
    maxHp: 0,
    vx: 0,
    vy: 0,
    lastAttack: 0,
    exp: 0,
    level: 1
  });

  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const fighterStrikesRef = useRef<FighterStrike[]>([]);
  const lastSpawnRef = useRef(0);
  const lastTimestampRef = useRef(0);
  const joystickRef = useRef({ active: false, startX: 0, startY: 0, currX: 0, currY: 0 });

  useEffect(() => {
    const currentProg = progressRef.current.progression[progressRef.current.selectedClass];
    const stats = currentProg.stats;
    if (gameState === GameState.PLAYING && playerRef.current.hp <= 0) {
      playerRef.current = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        hp: stats.hp,
        maxHp: stats.hp,
        vx: 0,
        vy: 0,
        lastAttack: 0,
        exp: currentProg.exp,
        level: currentProg.level
      };
      enemiesRef.current = [];
      projectilesRef.current = [];
      explosionsRef.current = [];
      fighterStrikesRef.current = [];
      gameTimeRef.current = challengeStage !== null ? CHALLENGE_TIME : 0;
      lastSpawnRef.current = 0;
      lastTimestampRef.current = performance.now();
    }
  }, [gameState, challengeStage]);

  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const update = (time: number) => {
      const dt = lastTimestampRef.current ? time - lastTimestampRef.current : 0;
      lastTimestampRef.current = time;

      const currentProgress = progressRef.current;
      const currentClass = currentProgress.selectedClass;
      const classProg = currentProgress.progression[currentClass];
      const stats = classProg.stats;
      const player = playerRef.current;

      if (challengeStage !== null) {
        gameTimeRef.current -= dt;
        if (gameTimeRef.current <= 0) {
          gameTimeRef.current = 0;
          onChallengeSuccess();
          return;
        }
      } else {
        gameTimeRef.current += dt;
      }

      if (joystickRef.current.active) {
        const dx = joystickRef.current.currX - joystickRef.current.startX;
        const dy = joystickRef.current.currY - joystickRef.current.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 5) {
          player.vx = (dx / dist) * stats.moveSpeed;
          player.vy = (dy / dist) * stats.moveSpeed;
        } else {
          player.vx = 0; player.vy = 0;
        }
      } else {
        player.vx = 0; player.vy = 0;
      }

      player.x += player.vx;
      player.y += player.vy;
      player.x = Math.max(20, Math.min(canvas.width - 20, player.x));
      player.y = Math.max(20, Math.min(canvas.height - 20, player.y));

      const s = challengeStage !== null ? challengeStage : 1;
      const spawnFactor = 1 + (s - 1) * 0.35;
      const hpFactor = 1 + (s - 1) * 0.45;
      const speedFactor = 1 + (s - 1) * 0.18;

      if (time - lastSpawnRef.current > (ENEMY_SPAWN_RATE / (1 + player.level * 0.1)) / spawnFactor) {
        const angle = Math.random() * Math.PI * 2;
        const spawnDist = Math.max(canvas.width, canvas.height) * 0.6;
        const enemyMaxHp = (10 + player.level * 5) * hpFactor;
        enemiesRef.current.push({
          x: player.x + Math.cos(angle) * spawnDist,
          y: player.y + Math.sin(angle) * spawnDist,
          radius: 15 + Math.random() * 5,
          color: '#ef4444',
          hp: enemyMaxHp,
          maxHp: enemyMaxHp,
          speed: (1.5 + (player.level * 0.05)) * 0.7 * speedFactor
        });
        lastSpawnRef.current = time;
      }

      if (time - player.lastAttack > stats.attackSpeed) {
        if (currentClass === 'FIGHTER') {
          const fStats = stats as FighterStats;
          const reachPx = fStats.reach * 40;
          const inRange = enemiesRef.current.filter(e => {
            const d = Math.sqrt((player.x - e.x) ** 2 + (player.y - e.y) ** 2);
            return d < reachPx + e.radius;
          }).sort((a, b) => {
            const da = (player.x - a.x) ** 2 + (player.y - a.y) ** 2;
            const db = (player.x - b.x) ** 2 + (player.y - b.y) ** 2;
            return da - db;
          });

          if (inRange.length > 0) {
            // 막대기 2개 고정
            if (inRange.length >= 2) {
              // 2개의 적을 각각 공격
              [inRange[0], inRange[1]].forEach(target => {
                fighterStrikesRef.current.push({
                  x: player.x, y: player.y, targetX: target.x, targetY: target.y,
                  radius: 4, color: '#f8fafc', duration: 0, maxDuration: 10
                });
                target.hp -= fStats.damage;
              });
            } else {
              // 하나의 적을 한번에 2번 공격
              for(let i=0; i<2; i++) {
                fighterStrikesRef.current.push({
                  x: player.x, y: player.y, targetX: inRange[0].x, targetY: inRange[0].y,
                  radius: 4, color: '#f8fafc', duration: 0, maxDuration: 10
                });
                inRange[0].hp -= fStats.damage;
              }
            }
            player.lastAttack = time;
          }
        } else {
          const targets = currentClass === 'WIZARD' 
            ? enemiesRef.current.filter(e => e.x >= 0 && e.x <= canvas.width && e.y >= 0 && e.y <= canvas.height)
            : enemiesRef.current;
          const nearest = getNearestEnemy(player.x, player.y, targets);
          if (nearest) {
            if (currentClass === 'GUNNER') {
              const gStats = stats as GunnerStats;
              const angle = Math.atan2(nearest.y - player.y, nearest.x - player.x);
              for (let i = 0; i < gStats.projectileCount; i++) {
                const spread = (i - (gStats.projectileCount - 1) / 2) * 0.2;
                projectilesRef.current.push({
                  x: player.x, y: player.y, radius: 5, color: '#fbbf24',
                  vx: Math.cos(angle + spread) * 8, vy: Math.sin(angle + spread) * 8,
                  damage: gStats.damage
                });
              }
            } else if (currentClass === 'WIZARD') {
              const wStats = stats as WizardStats;
              explosionsRef.current.push({
                x: nearest.x, y: nearest.y, radius: wStats.attackArea,
                color: 'rgba(249, 115, 22, 0.6)', duration: 0, maxDuration: 20,
                damage: wStats.damage
              });
            }
            player.lastAttack = time;
          }
        }
      }

      projectilesRef.current = projectilesRef.current.filter(p => {
        p.x += p.vx; p.y += p.vy;
        for (const enemy of enemiesRef.current) {
          const d = Math.sqrt((p.x - enemy.x) ** 2 + (p.y - enemy.y) ** 2);
          if (d < p.radius + enemy.radius) { enemy.hp -= p.damage; return false; }
        }
        return p.x > -50 && p.x < canvas.width + 50 && p.y > -50 && p.y < canvas.height + 50;
      });

      explosionsRef.current = explosionsRef.current.filter(exp => {
        if (exp.duration === 0) {
          for (const enemy of enemiesRef.current) {
            const d = Math.sqrt((exp.x - enemy.x) ** 2 + (exp.y - enemy.y) ** 2);
            if (d < exp.radius + enemy.radius) { enemy.hp -= exp.damage; }
          }
        }
        exp.duration++;
        return exp.duration < exp.maxDuration;
      });

      fighterStrikesRef.current = fighterStrikesRef.current.filter(strike => {
        strike.duration++;
        strike.x = player.x; // 캐릭터를 따라다님
        strike.y = player.y;
        return strike.duration < strike.maxDuration;
      });

      enemiesRef.current = enemiesRef.current.filter(enemy => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        enemy.x += (dx / dist) * enemy.speed;
        enemy.y += (dy / dist) * enemy.speed;
        if (dist < 20 + enemy.radius) {
          player.hp -= 0.5;
          if (player.hp <= 0) onGameOver(player.exp);
        }
        if (enemy.hp <= 0) {
          player.exp += 25;
          onExpGain(player.exp);
          if (player.exp >= EXP_PER_LEVEL(player.level)) {
            player.exp -= EXP_PER_LEVEL(player.level);
            player.level++;
            onLevelUpTrigger();
          }
          return false;
        }
        return true;
      });

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
      const step = 50;
      for (let x = 0; x < canvas.width; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
      for (let y = 0; y < canvas.height; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

      fighterStrikesRef.current.forEach(strike => {
        const progress = strike.duration / strike.maxDuration;
        const lengthFactor = Math.sin(progress * Math.PI); // 튀어나왔다 들어가는 효과
        const dx = strike.targetX - strike.x;
        const dy = strike.targetY - strike.y;
        const angle = Math.atan2(dy, dx);
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(strike.x, strike.y);
        ctx.lineTo(
          strike.x + Math.cos(angle) * (dist * lengthFactor),
          strike.y + Math.sin(angle) * (dist * lengthFactor)
        );
        ctx.stroke();
      });

      ctx.shadowBlur = 15;
      ctx.shadowColor = currentClass === 'GUNNER' ? '#3b82f6' : currentClass === 'WIZARD' ? '#a855f7' : '#f43f5e';
      ctx.fillStyle = currentClass === 'GUNNER' ? '#3b82f6' : currentClass === 'WIZARD' ? '#a855f7' : '#f43f5e';
      ctx.beginPath(); ctx.arc(player.x, player.y, 20, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#1e293b'; ctx.fillRect(player.x - 20, player.y - 35, 40, 6);
      ctx.fillStyle = player.hp / player.maxHp < 0.3 ? '#ef4444' : '#10b981';
      ctx.fillRect(player.x - 20, player.y - 35, Math.max(0, (player.hp / player.maxHp) * 40), 6);

      enemiesRef.current.forEach(e => { 
        ctx.fillStyle = e.color; ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2); ctx.fill(); 
        const barWidth = e.radius * 2;
        ctx.fillStyle = '#1e293b'; ctx.fillRect(e.x - e.radius, e.y - e.radius - 8, barWidth, 4);
        ctx.fillStyle = '#ef4444'; ctx.fillRect(e.x - e.radius, e.y - e.radius - 8, Math.max(0, (e.hp / e.maxHp) * barWidth), 4);
      });

      projectilesRef.current.forEach(p => { ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); });
      explosionsRef.current.forEach(exp => {
        ctx.fillStyle = exp.color; ctx.beginPath();
        const r = exp.radius * (exp.duration / exp.maxDuration);
        ctx.arc(exp.x, exp.y, r, 0, Math.PI * 2); ctx.fill();
      });

      if (joystickRef.current.active) {
        const { startX, startY, currX, currY } = joystickRef.current;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(startX, startY, 60, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; ctx.beginPath(); ctx.arc(currX, currY, 30, 0, Math.PI * 2); ctx.fill();
      }

      if (challengeStage !== null) {
        const seconds = Math.ceil(gameTimeRef.current / 1000);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; ctx.fillRect(canvas.width / 2 - 40, 60, 80, 40);
        ctx.fillStyle = seconds <= 10 ? '#ef4444' : '#ffffff';
        ctx.font = 'bold 24px Inter'; ctx.textAlign = 'center'; ctx.fillText(`${seconds}s`, canvas.width / 2, 88);
      }

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(animationFrameId);
      lastTimestampRef.current = 0;
    };
  }, [gameState, challengeStage, onLevelUpTrigger, onGameOver, onChallengeSuccess, onExpGain]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== GameState.PLAYING) return;
    const pos = getPos(e);
    joystickRef.current = { active: true, startX: pos.x, startY: pos.y, currX: pos.x, currY: pos.y };
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!joystickRef.current.active) return;
    const pos = getPos(e);
    joystickRef.current.currX = pos.x; joystickRef.current.currY = pos.y;
  };

  const handleEnd = () => { joystickRef.current.active = false; };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: clientX - (rect?.left || 0), y: clientY - (rect?.top || 0) };
  };

  const getNearestEnemy = (px: number, py: number, enemies: Enemy[]) => {
    if (enemies.length === 0) return null;
    let minDist = Infinity;
    let nearest = null;
    for (const enemy of enemies) {
      const d = (px - enemy.x) ** 2 + (py - enemy.y) ** 2;
      if (d < minDist) { minDist = d; nearest = enemy; }
    }
    return nearest;
  };

  useEffect(() => {
    const resize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', resize);
    resize();
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 touch-none bg-slate-900 overflow-hidden"
      style={{ touchAction: 'none' }}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default GameView;
