"use client";

import Image from "next/image";
import Link from "next/link";
import { DM_Sans } from "next/font/google";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import StaggeredMenu from "@/components/StaggeredMenu";
import { getPlayerPosition } from "@/lib/positionMapping";
import StrikerAnalytics from "@/components/analytics/StrikerAnalytics";
import MidfielderAnalytics from "@/components/analytics/MidfielderAnalytics";
import DefenderAnalytics from "@/components/analytics/DefenderAnalytics";
import GoalkeeperAnalytics from "@/components/analytics/GoalkeeperAnalytics";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface Player {
  id: string;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  position: string | null;
  dob: string | null;
  nationality: string | null;
  preferred_foot: string | null;
  metadata: any;
}

interface MatchRoster {
  match_id: string;
  jersey_number: string | null;
  minutes_played: number | null;
  position: string | null;
  teams: {
    id: string;
    name: string;
  } | null;
  matches: {
    date: string;
    home_score: number;
    away_score: number;
    home_team_id: string;
    away_team_id: string;
  };
}

interface PlayerStats {
  goals: number;
  assists: number;
  matches: number;
  minutes: number;
  yellowCards: number;
  redCards: number;
}

export default function PlayerProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [player, setPlayer] = useState<Player | null>(null);
  const [matchRosters, setMatchRosters] = useState<MatchRoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [yellowCards, setYellowCards] = useState(0);

  const menuItems = [
    { label: "Discover", link: "/home", ariaLabel: "Discover players" },
    { label: "Search", link: "/search", ariaLabel: "Search" },
    { label: "Upload", link: "/upload", ariaLabel: "Upload footage" },
    { label: "Features", link: "/#features", ariaLabel: "View features" },
  ];

  const socialItems = [
    { label: "Twitter", link: "https://twitter.com" },
    { label: "Instagram", link: "https://instagram.com" },
    { label: "LinkedIn", link: "https://linkedin.com" },
  ];

  useEffect(() => {
    if (id) {
      fetchPlayer();
    }
  }, [id]);

  useEffect(() => {
    async function fetchStats() {
      if (!id || Array.isArray(id)) return;

      const { data: goalData } = await supabase
        .from('match_events')
        .select('*')
        .eq('player_id', id)
        .eq('event_type', 'goal');

      const { data: assistData } = await supabase
        .from('match_events')
        .select('*')
        .eq('player_id', id)
        .eq('event_type', 'assist');

      const { data: yellowCardData } = await supabase
        .from('match_events')
        .select('*')
        .eq('player_id', id)
        .eq('event_type', 'yellow card');

      setGoals(goalData?.length || 0);
      setAssists(assistData?.length || 0);
      setYellowCards(yellowCardData?.length || 0);
    }

    fetchStats();
  }, [id]);

  async function fetchPlayer() {
    if (!id || Array.isArray(id)) return;

    try {
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .single();

      if (playerError) throw playerError;

      const { data: rostersData, error: rostersError } = await supabase
        .from('match_rosters')
        .select(`
          match_id,
          jersey_number,
          minutes_played,
          position,
          teams (
            id,
            name
          ),
          matches (
            date,
            home_score,
            away_score,
            home_team_id,
            away_team_id
          )
        `)
        .eq('player_id', id)
        .order('matches(date)', { ascending: false });

      if (rostersError) console.error('Error fetching rosters:', rostersError);

      setPlayer(playerData);
      setMatchRosters(rostersData || []);
    } catch (error) {
      console.error('Error fetching player:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={`${dmSans.variable} min-h-screen bg-black font-sans flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-lg text-white">Loading player profile...</div>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className={`${dmSans.variable} min-h-screen bg-black font-sans`}>
        <StaggeredMenu
          position="right"
          colors={["#f8fafc", "#e2e8f0"]}
          items={menuItems}
          socialItems={socialItems}
          displaySocials={true}
          displayItemNumbering={true}
          logoUrl="/logos/box18-text-logo.png"
          menuButtonColor="#fff"
          openMenuButtonColor="#fff"
          accentColor="#5B8DB8"
          changeMenuColorOnOpen={false}
          isFixed={true}
          closeOnClickAway={true}
        />
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Player not found</h1>
          <Link href="/home" className="text-[#5B8DB8] font-semibold hover:underline">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  const age = player.dob ? new Date().getFullYear() - new Date(player.dob).getFullYear() : null;

  // Use position mapping based on goals scored
  const playerPosition = getPlayerPosition(player.id, player.position);

  // Get team from rosters
  const team = matchRosters[0]?.teams?.name || 'Unknown Team';

  // Determine which analytics component to show
  const getAnalyticsComponent = () => {
    const pos = playerPosition?.toUpperCase() || '';

    if (pos === 'GK' || pos === 'GOALKEEPER') {
      return <GoalkeeperAnalytics />;
    } else if (pos === 'ST' || pos === 'CF' || pos === 'LW' || pos === 'RW') {
      return <StrikerAnalytics />;
    } else if (pos === 'CM' || pos === 'CAM' || pos === 'CDM' || pos === 'LM' || pos === 'RM') {
      return <MidfielderAnalytics />;
    } else if (pos === 'CB' || pos === 'LB' || pos === 'RB' || pos === 'LWB' || pos === 'RWB') {
      return <DefenderAnalytics />;
    } else {
      // Default to midfielder analytics for unknown positions
      return <MidfielderAnalytics />;
    }
  };

  const stats: PlayerStats = {
    goals,
    assists,
    matches: matchRosters.length,
    minutes: matchRosters.reduce((sum, r) => sum + (r.minutes_played || 0), 0),
    yellowCards,
    redCards: 0,
  };

  const similarPlayers = [
    { name: "Marcus Rashford", similarity: 92, team: "Manchester United" },
    { name: "Phil Foden", similarity: 88, team: "Manchester City" },
    { name: "Bukayo Saka", similarity: 85, team: "Arsenal" },
  ];

  return (
    <div className={`${dmSans.variable} min-h-screen font-sans bg-black`}>
      <StaggeredMenu
        position="right"
        colors={["#000000", "#000000"]}
        items={menuItems}
        socialItems={socialItems}
        displaySocials={true}
        displayItemNumbering={true}
        logoUrl="/logos/box18-text-logo.png"
        logoLink="/home"
        menuButtonColor="#fff"
        openMenuButtonColor="#fff"
        accentColor="#5B8DB8"
        changeMenuColorOnOpen={false}
        isFixed={true}
        closeOnClickAway={true}
        panelTextColor="#fff"
      />

      <div className="flex min-h-screen">
        {/* Left Side - Player Details */}
        <div className="w-2/5 relative">
          <div
            className="fixed top-0 left-0 w-2/5 h-screen"
            style={{
              backgroundImage: 'url(/background/background3.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <div className="relative h-full flex flex-col justify-center px-12">
              {/* Position Badge */}
              <div className="mb-6">
                <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                  <span className="text-white/80 text-sm font-semibold">{playerPosition || 'Unknown'}</span>
                </div>
              </div>

              {/* Player Name */}
              <h1 className="text-7xl font-bold text-white mb-4 leading-none">
                {player.full_name}
              </h1>

              {/* Team */}
              <p className="text-2xl text-white/70 mb-8">{team}</p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {age && (
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                    <div className="text-white/60 text-sm mb-1">Age</div>
                    <div className="text-white text-2xl font-bold">{age}</div>
                  </div>
                )}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                  <div className="text-white/60 text-sm mb-1">Matches</div>
                  <div className="text-white text-2xl font-bold">{stats.matches}</div>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                  <div className="text-white/60 text-sm mb-1">Goals</div>
                  <div className="text-white text-2xl font-bold">{stats.goals}</div>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                  <div className="text-white/60 text-sm mb-1">Assists</div>
                  <div className="text-white text-2xl font-bold">{stats.assists}</div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-2">
                {player.nationality && (
                  <div className="flex items-center gap-3 text-white/70">
                    <span className="text-sm">Nationality:</span>
                    <span className="text-sm font-semibold text-white">{player.nationality}</span>
                  </div>
                )}
                {player.preferred_foot && (
                  <div className="flex items-center gap-3 text-white/70">
                    <span className="text-sm">Preferred Foot:</span>
                    <span className="text-sm font-semibold text-white">{player.preferred_foot}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Scrollable Analytics */}
        <div className="w-3/5 ml-auto">
          <div className="bg-white min-h-screen">
            <div className="p-12 space-y-8 pt-24">
              {/* Performance Overview */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Performance Overview</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6">
                    <div className="text-sm text-gray-500 mb-2">Total Minutes</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.minutes}'</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6">
                    <div className="text-sm text-gray-500 mb-2">Goals</div>
                    <div className="text-3xl font-bold text-[#5B8DB8]">{stats.goals}</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6">
                    <div className="text-sm text-gray-500 mb-2">Assists</div>
                    <div className="text-3xl font-bold text-[#5B8DB8]">{stats.assists}</div>
                  </div>
                </div>
              </section>

              {/* Advanced Analytics */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced Analytics</h2>
                {getAnalyticsComponent()}
              </section>

              {/* Match History */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Match History</h2>
                {matchRosters.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-500">No match history available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matchRosters.slice(0, 10).map((roster, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-gray-100 rounded-lg px-3 py-2 min-w-[60px] text-center">
                              <div className="text-sm font-bold text-gray-900">
                                {roster.matches.home_score} - {roster.matches.away_score}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">
                                {new Date(roster.matches.date).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-400">
                                {roster.position || 'Unknown Position'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900">
                              {roster.minutes_played || 0}'
                            </div>
                            <div className="text-xs text-gray-500">Minutes</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* AI Player Comparisons */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Player Comparisons</h2>
                <p className="text-gray-600 mb-6">Similar players based on playing style and statistics</p>
                <div className="space-y-3">
                  {similarPlayers.map((comp, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{comp.name}</div>
                          <div className="text-sm text-gray-500">{comp.team}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#5B8DB8]">{comp.similarity}%</div>
                          <div className="text-xs text-gray-500">Match</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#5B8DB8] h-2 rounded-full transition-all"
                          style={{ width: `${comp.similarity}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
