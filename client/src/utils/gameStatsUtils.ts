import type {
  GameState,
  PlayerGameStats,
} from '../../../shared/src/types/game';

export interface DisplayStat {
  label: string;
  value: string;
  icon?: string;
  priority: number; // Lower is higher priority
}

export interface GameStatsAnalysis {
  topStats: DisplayStat[];
  playerRankings: Array<{
    playerId: string;
    playerName: string;
    stats: PlayerGameStats;
    position: number;
  }>;
}

// Calculate and prioritize the most interesting statistics to display
export function analyzeGameStats(gameState: GameState): GameStatsAnalysis {
  const { players, gameStats } = gameState;

  // Create player rankings by various metrics
  const playerRankings = players.map((player, index) => ({
    playerId: player.id,
    playerName: player.name,
    stats: gameStats.playerStats[player.id] || {
      cardsPlayed: 0,
      cardsDrawn: 0,
      specialCardsPlayed: 0,
      penaltiesReceived: 0,
      totalMoves: 0,
    },
    position: index + 1,
  }));

  // Sort players for various rankings
  const mostMoves = [...playerRankings].sort(
    (a, b) => b.stats.totalMoves - a.stats.totalMoves,
  );
  const mostCards = [...playerRankings].sort(
    (a, b) => b.stats.cardsDrawn - a.stats.cardsDrawn,
  );

  // Generate potential statistics
  const potentialStats: DisplayStat[] = [
    // Game duration
    {
      label: 'Game Duration',
      value: formatDuration(gameStats.gameDurationMs),
      icon: '⏱️',
      priority: 1,
    },

    // Total moves made
    {
      label: 'Total Moves',
      value: gameStats.totalMoves.toString(),
      icon: '🎯',
      priority: 2,
    },

    // Cards played
    {
      label: 'Cards Played',
      value: gameStats.totalCardsPlayed.toString(),
      icon: '🎴',
      priority: 3,
    },

    // Most active player
    {
      label: 'Most Active',
      value: mostMoves[0]?.playerName || 'Unknown',
      icon: '⚡',
      priority: mostMoves[0]?.stats.totalMoves > 10 ? 4 : 9,
    },

    // Player who drew most cards
    {
      label: 'Card Collector',
      value: mostCards[0]?.playerName || 'Unknown',
      icon: '🃏',
      priority: mostCards[0]?.stats.cardsDrawn > 5 ? 5 : 10,
    },

    // Special cards played
    {
      label: 'Trick Cards Used',
      value: gameStats.specialCardsPlayedTotal.toString(),
      icon: '✨',
      priority: gameStats.specialCardsPlayedTotal > 0 ? 6 : 11,
    },

    // Direction changes (Jacks)
    {
      label: 'Direction Changes',
      value: gameStats.directionChanges.toString(),
      icon: '🔄',
      priority: gameStats.directionChanges > 0 ? 7 : 12,
    },

    // Penalty cards served
    {
      label: 'Penalty Cards',
      value: gameStats.penaltyCardsServed.toString(),
      icon: '⚠️',
      priority: gameStats.penaltyCardsServed > 0 ? 8 : 13,
    },
  ];

  // Smart selection: pick the most relevant stats based on priority and game context
  const relevantStats = potentialStats
    .filter(stat => {
      // Filter out stats with generic values or low relevance
      if (stat.value === '0' && stat.priority > 8) return false;
      if (stat.value === 'Unknown' && stat.priority > 8) return false;
      return true;
    })
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 6); // Show top 6 most relevant stats

  return {
    topStats: relevantStats,
    playerRankings,
  };
}

// Format game duration in a human-readable way
function formatDuration(durationMs?: number): string {
  if (!durationMs) return 'Unknown';

  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  } else if (minutes < 10) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${minutes}m`;
  }
}

// Get a specific player's performance summary
export function getPlayerSummary(
  gameState: GameState,
  playerId: string,
): {
  rank: string;
  highlight: string;
  stats: PlayerGameStats;
} {
  const analysis = analyzeGameStats(gameState);
  const playerRanking = analysis.playerRankings.find(
    p => p.playerId === playerId,
  );

  if (!playerRanking) {
    return {
      rank: 'Unknown',
      highlight: 'Player not found',
      stats: {
        cardsPlayed: 0,
        cardsDrawn: 0,
        specialCardsPlayed: 0,
        penaltiesReceived: 0,
        totalMoves: 0,
      },
    };
  }

  // Determine player's standout performance
  let highlight = 'Good game!';
  const stats = playerRanking.stats;

  if (stats.specialCardsPlayed > 3) {
    highlight = 'Trick card master! ✨';
  } else if (stats.penaltiesReceived === 0) {
    highlight = 'Perfect penalties! 🛡️';
  } else if (stats.totalMoves > 15) {
    highlight = 'Most active player! ⚡';
  } else if (stats.cardsDrawn > 8) {
    highlight = 'Card collector! 🃏';
  }

  const totalPlayers = analysis.playerRankings.length;
  const rank =
    gameState.winner?.id === playerId
      ? 'Winner! 🏆'
      : `${playerRanking.position}/${totalPlayers}`;

  return {
    rank,
    highlight,
    stats,
  };
}
