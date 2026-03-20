"use client";

import Link from "next/link";
import { DM_Sans } from "next/font/google";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import StaggeredMenu from "@/components/StaggeredMenu";
import PlayerCard from "@/components/PlayerCard";
import { getPlayerPosition } from "@/lib/positionMapping";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface Player {
  id: string;
  full_name: string;
  position: string | null;
  dob: string | null;
  nationality: string | null;
  metadata: any;
}

interface PlayerWithStats extends Player {
  age: number | null;
  team: string;
  stat: string;
  name: string;
  rating: number;
  goals: number;
  assists: number;
  matches: number;
  minutes: number;
  imageUrl?: string;
}

// Hardcoded player images for top players
const PLAYER_IMAGES: Record<string, string> = {
  // Top Strikers
  'NIGEL BUCKLEY': '/player-pics/buckley.png',
  'GEORGE AKPABIO': '/player-pics/akpabio.png',
  'ERION METAJ': '/player-pics/metaj.png',
  'RONALDO MARSHALL': '/player-pics/ronaldomarshall.png',
  // Top Midfielders
  'BEGLEY': '/player-pics/begley.png',
  'DAMOLA': '/player-pics/damola.png',
  'MICAH JOSEPH': '/player-pics/micahjoseph.png',
  'SEBASTIAN COCHRANE': '/player-pics/sebastiancochrane.png',
}

interface Club {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
  metadata: any;
  teams: Team[];
}

interface Team {
  id: string;
  name: string;
  gender: string | null;
  level: string | null;
}

interface League {
  id: string;
  name: string;
  gender: string | null;
  age_group: string | null;
  created_at: string;
  matches: Match[];
  seasons: Season[];
}

interface Match {
  id: string;
  date: string;
  home_score: number | null;
  away_score: number | null;
  status: string | null;
}

interface Season {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
}

type SearchTab = 'players' | 'clubs' | 'leagues';

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<SearchTab>('players');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");

  const [players, setPlayers] = useState<PlayerWithStats[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoOpacity, setLogoOpacity] = useState(1);

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
    if (activeTab === 'players') {
      fetchPlayers();
    } else if (activeTab === 'clubs') {
      fetchClubs();
    } else if (activeTab === 'leagues') {
      fetchLeagues();
    }
  }, [activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const fadeStart = 0;
      const fadeEnd = 150;

      if (scrollPosition <= fadeStart) {
        setLogoOpacity(1);
      } else if (scrollPosition >= fadeEnd) {
        setLogoOpacity(0);
      } else {
        const opacity = 1 - (scrollPosition - fadeStart) / (fadeEnd - fadeStart);
        setLogoOpacity(opacity);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function fetchPlayers() {
    setLoading(true);
    try {
      // Get all players
      const { data: playersData, error } = await supabase
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
      const rostersMap = new Map<string, any[]>();

      allGoals?.forEach((g: any) => {
        goalsMap.set(g.player_id, (goalsMap.get(g.player_id) || 0) + 1);
      });

      allAssists?.forEach((a: any) => {
        assistsMap.set(a.player_id, (assistsMap.get(a.player_id) || 0) + 1);
      });

      allRosters?.forEach((r: any) => {
        if (!rostersMap.has(r.player_id)) {
          rostersMap.set(r.player_id, []);
        }
        rostersMap.get(r.player_id)?.push(r);
      });

      const playersWithStats: PlayerWithStats[] = (playersData || []).map((player: Player) => {
        const age = player.dob ? new Date().getFullYear() - new Date(player.dob).getFullYear() : null;

        const rosters = rostersMap.get(player.id) || [];
        const goals = goalsMap.get(player.id) || 0;
        const assists = assistsMap.get(player.id) || 0;
        const matches = rosters.length;
        const minutes = rosters.reduce((sum: number, r: any) => sum + (r.minutes_played || 0), 0);
        const team = rosters[0]?.teams?.name || 'Unknown Team';

        // Use position mapping based on goals scored
        const position = getPlayerPosition(player.id, player.position);

        let stat = 'No stats';
        let rating = 75;
        if (goals > 0) {
          stat = `${goals} Goal${goals > 1 ? 's' : ''}`;
          rating = Math.min(95, 75 + goals * 2);
        } else if (assists > 0) {
          stat = `${assists} Assist${assists > 1 ? 's' : ''}`;
          rating = Math.min(95, 75 + assists);
        } else if (matches > 0) {
          stat = `${matches} Match${matches > 1 ? 'es' : ''}`;
        }

        // Check if this player has a hardcoded image
        const imageUrl = PLAYER_IMAGES[player.full_name.toUpperCase()];

        return {
          ...player,
          position,
          name: player.full_name,
          age,
          team,
          stat,
          rating,
          goals,
          assists,
          matches,
          minutes,
          imageUrl
        };
      });

      setPlayers(playersWithStats);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClubs() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select(`
          *,
          teams (
            id,
            name,
            gender,
            level
          )
        `)
        .order('name');

      if (error) throw error;
      setClubs(data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLeagues() {
    setLoading(true);
    try {
      const { data: leaguesData, error: leaguesError } = await supabase
        .from('leagues')
        .select('*')
        .order('name');

      if (leaguesError) throw leaguesError;

      const leaguesWithData = await Promise.all(
        (leaguesData || []).map(async (league) => {
          const { data: matchesData } = await supabase
            .from('matches')
            .select('id, date, home_score, away_score, status')
            .eq('league_id', league.id)
            .limit(5);

          const { data: seasonsData } = await supabase
            .from('seasons')
            .select('*')
            .order('start_date', { ascending: false })
            .limit(3);

          return {
            ...league,
            matches: matchesData || [],
            seasons: seasonsData || [],
          };
        })
      );

      setLeagues(leaguesWithData);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         player.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = !selectedPosition || player.position?.toUpperCase() === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.short_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLeagues = leagues.filter(league =>
    league.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`${dmSans.variable} min-h-screen font-sans relative`}>
      <style jsx global>{`
        .sm-logo {
          opacity: ${logoOpacity};
          transition: opacity 0.3s ease;
        }
      `}</style>
      {/* Fixed Background Layer */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(/background/background3.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 backdrop-blur-md bg-black/20" />
      </div>

      {/* Transparent Navbar Spacer */}
      <div className="h-20" />

      <StaggeredMenu
        position="right"
        colors={["#000000", "#000000"]}
        items={menuItems}
        socialItems={socialItems}
        displaySocials={true}
        displayItemNumbering={true}
        logoUrl="/logos/box18-text-logo.png"
        logoLink="/"
        menuButtonColor="#fff"
        openMenuButtonColor="#fff"
        accentColor="#5B8DB8"
        changeMenuColorOnOpen={false}
        isFixed={true}
        closeOnClickAway={true}
        panelTextColor="#fff"
      />

      <main className="max-w-7xl mx-auto px-6 py-8 bg-white rounded-t-3xl relative">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Search</h1>
          <p className="text-gray-600">Find players, clubs, and leagues</p>
        </div>

        {/* Tab Toggles */}
        <div className="flex items-center gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('players')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'players'
                ? 'text-[#5B8DB8] border-b-2 border-[#5B8DB8]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Players
          </button>
          <button
            onClick={() => setActiveTab('clubs')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'clubs'
                ? 'text-[#5B8DB8] border-b-2 border-[#5B8DB8]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Clubs
          </button>
          <button
            onClick={() => setActiveTab('leagues')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'leagues'
                ? 'text-[#5B8DB8] border-b-2 border-[#5B8DB8]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Leagues
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-2xl">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full px-5 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:border-[#5B8DB8] transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Position Filter for Players */}
        {activeTab === 'players' && (
          <div className="mb-8">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedPosition("")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedPosition === ""
                    ? "bg-[#5B8DB8] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Positions
              </button>
              {['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'CF'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setSelectedPosition(pos)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedPosition === pos
                      ? "bg-[#5B8DB8] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading {activeTab}...</p>
          </div>
        ) : activeTab === 'players' ? (
          filteredPlayers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No players found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPlayers.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          )
        ) : activeTab === 'clubs' ? (
          filteredClubs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No clubs found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
                <div
                  key={club.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{club.name}</h3>
                    {club.short_name && (
                      <p className="text-sm text-gray-500">{club.short_name}</p>
                    )}
                  </div>

                  {club.teams.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Teams ({club.teams.length})
                      </p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {club.teams.map((team) => (
                          <Link
                            key={team.id}
                            href={`/team/${team.id}`}
                            className="block px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="text-sm font-medium text-gray-900">{team.name}</div>
                            <div className="text-xs text-gray-500">
                              {team.gender && team.level ? `${team.gender} • ${team.level}` : team.gender || team.level || 'Unknown'}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No teams</p>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          filteredLeagues.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No leagues found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredLeagues.map((league) => (
                <div
                  key={league.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{league.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        {league.gender && (
                          <span className="px-3 py-1 bg-gray-100 rounded-full">{league.gender}</span>
                        )}
                        {league.age_group && (
                          <span className="px-3 py-1 bg-gray-100 rounded-full">{league.age_group}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Matches</div>
                      <div className="text-2xl font-bold text-[#5B8DB8]">{league.matches.length}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {league.matches.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Matches</h4>
                        <div className="space-y-2">
                          {league.matches.slice(0, 3).map((match) => (
                            <Link
                              key={match.id}
                              href={`/match/${match.id}`}
                              className="block px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                  {new Date(match.date).toLocaleDateString()}
                                </div>
                                <div className="text-sm font-bold text-gray-900">
                                  {match.home_score !== null && match.away_score !== null
                                    ? `${match.home_score} - ${match.away_score}`
                                    : 'TBD'}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {league.seasons.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Seasons</h4>
                        <div className="space-y-2">
                          {league.seasons.map((season) => (
                            <div
                              key={season.id}
                              className="px-4 py-3 bg-gray-50 rounded-lg"
                            >
                              <div className="text-sm font-medium text-gray-900">{season.name}</div>
                              {season.start_date && season.end_date && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(season.start_date).toLocaleDateString()} -{' '}
                                  {new Date(season.end_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
