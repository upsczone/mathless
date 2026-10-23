import React, { useState } from 'react';
import { Trophy, Globe, Sparkles, Edit2, Check } from 'lucide-react';
import { LeaderboardEntry } from '../types/game';

interface LeaderboardCardProps {
  entries: LeaderboardEntry[];
  currentPlayerScore: number;
  currentPlayerLevel: number;
  currentUsername: string;
  onUpdateUsername: (newName: string) => void;
  nextUnlockLabel?: string;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  entries,
  currentPlayerScore,
  currentPlayerLevel,
  currentUsername,
  onUpdateUsername,
  nextUnlockLabel = 'Neon Gradient Skin at 15,000 pts',
}) => {
  const [filter, setFilter] = useState<'global' | 'today'>('global');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentUsername);

  // Compute player's realistic ranking dynamically based on current score
  const allScores = [...entries.map((e) => e.score), currentPlayerScore].sort((a, b) => b - a);
  const playerRank = Math.max(1, allScores.indexOf(currentPlayerScore) + 1);

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed.length > 0) {
      onUpdateUsername(trimmed);
    }
    setIsEditingName(false);
  };

  return (
    <div
      id="leaderboard-card"
      className="w-full lg:w-72 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs sm:text-sm uppercase font-black text-fuchsia-200 flex items-center gap-1.5 tracking-wider">
          <Trophy size={16} className="text-amber-400" />
          Leaderboard
        </h3>
        <div className="flex gap-1 bg-black/30 p-0.5 rounded-lg border border-white/10">
          <button
            onClick={() => setFilter('global')}
            className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
              filter === 'global' ? 'bg-cyan-400 text-black shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            Global
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
              filter === 'today' ? 'bg-cyan-400 text-black shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            Today
          </button>
        </div>
      </div>

      {/* Leaderboard Entries List */}
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-1">
        {entries.slice(0, 5).map((entry, idx) => {
          const rank = idx + 1;
          const isGold = rank === 1;
          const isSilver = rank === 2;
          const isBronze = rank === 3;

          return (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                isGold
                  ? 'bg-gradient-to-r from-amber-400/20 to-transparent border-l-4 border-amber-400'
                  : isSilver
                  ? 'bg-gradient-to-r from-slate-300/20 to-transparent border-l-4 border-slate-300'
                  : isBronze
                  ? 'bg-gradient-to-r from-amber-700/20 to-transparent border-l-4 border-amber-600'
                  : 'bg-white/5 border border-white/5'
              }`}
            >
              <span
                className={`w-4 font-black text-xs text-center ${
                  isGold
                    ? 'text-amber-400'
                    : isSilver
                    ? 'text-slate-300'
                    : isBronze
                    ? 'text-amber-500'
                    : 'text-white/50'
                }`}
              >
                {rank}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{entry.avatar}</span>
                  <p className="text-xs font-bold text-white truncate leading-tight">
                    {entry.username}
                  </p>
                </div>
                <p className="text-[10px] text-white/50 font-mono">
                  {entry.score.toLocaleString()} pts • LVL {entry.level}
                </p>
              </div>

              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border text-[10px] font-black ${
                  isGold
                    ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                    : isSilver
                    ? 'bg-slate-300/15 border-slate-300/40 text-slate-200'
                    : 'bg-white/10 border-white/20 text-white/70'
                }`}
              >
                #{rank}
              </div>
            </div>
          );
        })}

        {/* Current Player's Live Standing */}
        <div
          id="leaderboard-player-row"
          className="flex items-center gap-3 p-2.5 bg-fuchsia-500/20 rounded-xl border border-fuchsia-500/40 mt-1 shadow-md shadow-fuchsia-500/10"
        >
          <span className="w-5 font-black text-xs text-center text-fuchsia-300 font-mono">
            {playerRank <= 99 ? playerRank : '99+'}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🎮</span>
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    maxLength={12}
                    className="w-20 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded border border-white/30 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="text-cyan-300 hover:text-white"
                  >
                    <Check size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 group">
                  <p className="text-xs font-black text-fuchsia-200 truncate">
                    {currentUsername}
                  </p>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="opacity-60 hover:opacity-100 text-white/80 transition-opacity"
                    title="Edit player name"
                  >
                    <Edit2 size={11} />
                  </button>
                </div>
              )}
            </div>
            <p className="text-[10px] text-fuchsia-200/70 font-mono font-semibold">
              {currentPlayerScore.toLocaleString()} pts • LVL {currentPlayerLevel}
            </p>
          </div>

          <div className="w-7 h-7 rounded-full bg-fuchsia-500/30 border border-white/40 flex items-center justify-center text-[10px] font-black text-fuchsia-200">
            YOU
          </div>
        </div>
      </div>

      {/* Next Unlock Teaser Card */}
      <div className="mt-auto pt-3 border-t border-white/10">
        <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] text-white/50 mb-0.5 uppercase tracking-wider font-semibold">
            <Sparkles size={11} className="text-amber-400" />
            Milestone Target
          </div>
          <p className="text-xs font-black text-fuchsia-300 tracking-tight">
            {nextUnlockLabel}
          </p>
        </div>
      </div>
    </div>
  );
};
