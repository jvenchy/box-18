import { supabase } from './supabase';

export interface PlayerStats {
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  matches: number;
  minutes: number;
  team: string | null;
  teamId: string | null;
}

export async function getPlayerStats(playerId: string): Promise<PlayerStats> {
  // Get goals
  const { data: goalData } = await supabase
    .from('match_events')
    .select('*')
    .eq('player_id', playerId)
    .eq('event_type', 'goal');

  // Get assists
  const { data: assistData } = await supabase
    .from('match_events')
    .select('*')
    .eq('player_id', playerId)
    .eq('event_type', 'assist');

  // Get yellow cards
  const { data: yellowCardData } = await supabase
    .from('match_events')
    .select('*')
    .eq('player_id', playerId)
    .eq('event_type', 'yellow card');

  // Get red cards
  const { data: redCardData } = await supabase
    .from('match_events')
    .select('*')
    .eq('player_id', playerId)
    .eq('event_type', 'red card');

  // Get match rosters with team info
  const { data: rosterData } = await supabase
    .from('match_rosters')
    .select(`
      *,
      teams (
        id,
        name
      )
    `)
    .eq('player_id', playerId);

  const goals = goalData?.length || 0;
  const assists = assistData?.length || 0;
  const yellowCards = yellowCardData?.length || 0;
  const redCards = redCardData?.length || 0;
  const matches = rosterData?.length || 0;
  const minutes = rosterData?.reduce((sum, r) => sum + (r.minutes_played || 0), 0) || 0;

  // Get most recent team
  const mostRecentRoster = rosterData?.[0];
  const team = mostRecentRoster?.teams?.name || null;
  const teamId = mostRecentRoster?.teams?.id || null;

  return {
    goals,
    assists,
    yellowCards,
    redCards,
    matches,
    minutes,
    team,
    teamId,
  };
}

export async function getPlayersWithStats() {
  // Get all players
  const { data: players, error } = await supabase
    .from('players')
    .select('*');

  if (error) throw error;

  // Get all match events at once
  const { data: allGoals } = await supabase
    .from('match_events')
    .select('player_id')
    .eq('event_type', 'goal');

  const { data: allAssists } = await supabase
    .from('match_events')
    .select('player_id')
    .eq('event_type', 'assist');

  const { data: allYellowCards } = await supabase
    .from('match_events')
    .select('player_id')
    .eq('event_type', 'yellow card');

  const { data: allRosters } = await supabase
    .from('match_rosters')
    .select(`
      player_id,
      minutes_played,
      teams (
        id,
        name
      )
    `);

  // Create lookup maps for performance
  const goalsMap = new Map<string, number>();
  const assistsMap = new Map<string, number>();
  const yellowCardsMap = new Map<string, number>();
  const rostersMap = new Map<string, any[]>();

  allGoals?.forEach(g => {
    goalsMap.set(g.player_id, (goalsMap.get(g.player_id) || 0) + 1);
  });

  allAssists?.forEach(a => {
    assistsMap.set(a.player_id, (assistsMap.get(a.player_id) || 0) + 1);
  });

  allYellowCards?.forEach(y => {
    yellowCardsMap.set(y.player_id, (yellowCardsMap.get(y.player_id) || 0) + 1);
  });

  allRosters?.forEach(r => {
    if (!rostersMap.has(r.player_id)) {
      rostersMap.set(r.player_id, []);
    }
    rostersMap.get(r.player_id)?.push(r);
  });

  // Combine data
  return players?.map(player => {
    const rosters = rostersMap.get(player.id) || [];
    const goals = goalsMap.get(player.id) || 0;
    const assists = assistsMap.get(player.id) || 0;
    const yellowCards = yellowCardsMap.get(player.id) || 0;
    const matches = rosters.length;
    const minutes = rosters.reduce((sum, r) => sum + (r.minutes_played || 0), 0);

    // Get most recent team (first roster)
    const team = rosters[0]?.teams?.name || 'Unknown Team';

    return {
      ...player,
      stats: {
        goals,
        assists,
        yellowCards,
        matches,
        minutes,
        team,
      }
    };
  }) || [];
}
