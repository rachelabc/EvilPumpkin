/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Difficulty, GameStats, HighScoreEntry, RacerCharacter } from './types/game';
import { HIGH_SCORES_STORAGE_KEY, RACERS } from './utils/constants';
import { soundManager } from './utils/audio';
import { StartScreen } from './components/StartScreen';
import { GameCanvas } from './components/GameCanvas';
import { FinishScreen } from './components/FinishScreen';

export default function App() {
  const [screen, setScreen] = useState<'START' | 'PLAYING' | 'FINISH'>('START');
  const [selectedRacer, setSelectedRacer] = useState<RacerCharacter>(RACERS[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>('CLASSIC');
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);

  // Load high scores from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HIGH_SCORES_STORAGE_KEY);
      if (stored) {
        setHighScores(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleStartGame = () => {
    soundManager.startBGM();
    setScreen('PLAYING');
  };

  const handleFinishGame = (stats: GameStats) => {
    setGameStats(stats);
    setScreen('FINISH');

    // Save to high scores
    try {
      const minutes = Math.floor(stats.timeElapsed / 60);
      const seconds = Math.floor(stats.timeElapsed % 60);
      const entry: HighScoreEntry = {
        characterName: selectedRacer.name,
        score: stats.finalScore,
        timeFormatted: `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`,
        difficulty: stats.difficulty,
        isVictory: stats.isVictory,
        date: new Date().toLocaleDateString(),
      };

      const updated = [...highScores, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      setHighScores(updated);
      localStorage.setItem(HIGH_SCORES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const handlePlayAgain = () => {
    soundManager.startBGM();
    setScreen('PLAYING');
  };

  const handleReturnToMenu = () => {
    soundManager.stopBGM();
    setScreen('START');
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#120a1f] select-none font-['Fredoka',sans-serif]">
      {screen === 'START' && (
        <StartScreen
          selectedRacer={selectedRacer}
          onSelectRacer={setSelectedRacer}
          difficulty={difficulty}
          onSelectDifficulty={setDifficulty}
          onStartGame={handleStartGame}
          highScores={highScores}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'PLAYING' && (
        <GameCanvas
          racer={selectedRacer}
          difficulty={difficulty}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onFinishGame={handleFinishGame}
          onReturnToMenu={handleReturnToMenu}
        />
      )}

      {screen === 'FINISH' && gameStats && (
        <FinishScreen
          stats={gameStats}
          racer={selectedRacer}
          onPlayAgain={handlePlayAgain}
          onReturnToMenu={handleReturnToMenu}
        />
      )}
    </div>
  );
}
