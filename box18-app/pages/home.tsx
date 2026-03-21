"use client";

import Link from "next/link";
import { DM_Sans } from "next/font/google";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import PlayerCard from "@/components/PlayerCard";
import StaggeredMenu from "@/components/StaggeredMenu";
import AIChat from "@/components/AIChat";
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
  metadata: {
    team?: string;
    goals?: number;
    assists?: number;
    clean_sheets?: number;
    [key: string]: unknown;
  } | null;
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

// Hardcoded player images for top strikers and midfielders
const PLAYER_IMAGES: Record<string, string> = {
  // // Top Strikers
  // 'NIGEL BUCKLEY': '/player-pics/buckley.png',
  // 'GEORGE AKPABIO': '/player-pics/akpabio.png',
  // 'ERION METAJ': '/player-pics/metaj.png',
  // 'RONALDO MARSHALL': '/player-pics/ronaldomarshall.png',
  // // Top Midfielders
  // 'BEGLEY': '/player-pics/begley.png',
  // 'DAMOLA': '/player-pics/damola.png',
  // 'MICAH JOSEPH': '/player-pics/micahjoseph.png',
  // 'SEBASTIAN COCHRANE': '/player-pics/sebastiancochrane.png',
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [players, setPlayers] = useState<PlayerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiSearchQuery, setAiSearchQuery] = useState("");
  const [logoOpacity, setLogoOpacity] = useState(1);

  useEffect(() => {
    fetchPlayers();
  }, []);

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
          team_id,
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
        const minutes = rosters.reduce((sum, r: any) => sum + (r.minutes_played || 0), 0);
        const team = rosters[0]?.teams?.name || 'Unknown Team';

        // Debug logging for strikers
        if (['NIGEL BUCKLEY', 'GEORGE AKPABIO', 'ERION METAJ'].includes(player.full_name)) {
          console.log(`${player.full_name}:`, {
            hasRosters: rosters.length > 0,
            firstRoster: rosters[0],
            team
          });
        }

        // Use position mapping based on goals scored
        const estimatedPosition = getPlayerPosition(player.id, player.position);

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

        // Map player photos
        const photoMap: { [key: string]: string } = {
          'NIGEL BUCKLEY': '/player-pics/buckley.png',
          'GEORGE AKPABIO': '/player-pics/akpabio.png',
          'ERION METAJ': '/player-pics/metaj.png',
          'RONALDO MARSHALL': '/player-pics/ronaldomarshall.png',
          'JACOB BEGLEY': '/player-pics/begley.png',
          'DAMOLA AKANNI': '/player-pics/damola.png',
          'SEBASTIAN COCHRANE': '/player-pics/sebastiancochrane.png',
          'MICAH JOSEPH': '/player-pics/micahjoseph.png'
        };

        const imageUrl = photoMap[player.full_name] || undefined;

        return {
          ...player,
          position: estimatedPosition,
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

  const getPlayersByPosition = (positionCategory: string) => {
    let filtered = players;

    if (positionCategory !== 'all') {
      filtered = players.filter(player => {
        const pos = player.position?.toUpperCase() || '';

        switch (positionCategory) {
          case 'goalkeepers':
            return pos === 'GK' || pos === 'GOALKEEPER';
          case 'strikers':
            return pos === 'ST' || pos === 'CF' || pos === 'LW' || pos === 'RW';
          case 'midfielders':
            return pos === 'CM' || pos === 'CAM' || pos === 'CDM' || pos === 'LM' || pos === 'RM';
          case 'defenders':
            return pos === 'CB' || pos === 'LB' || pos === 'RB' || pos === 'LWB' || pos === 'RWB';
          default:
            return true;
        }
      });
    }

    // Sort by position-specific metrics
    return filtered.sort((a, b) => {
      switch (positionCategory) {
        case 'strikers':
          // Sort strikers by goals (descending)
          return b.goals - a.goals;
        case 'midfielders':
          // Sort midfielders by assists, then goals (descending)
          if (b.assists !== a.assists) return b.assists - a.assists;
          return b.goals - a.goals;
        case 'defenders':
          // Sort defenders by matches played (descending)
          return b.matches - a.matches;
        case 'goalkeepers':
          // Sort goalkeepers by matches played (descending)
          return b.matches - a.matches;
        default:
          // For 'all', sort by goals (descending)
          return b.goals - a.goals;
      }
    });
  };

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
      <div className="h-28" />

      {/* StaggeredMenu Navigation */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 bg-white rounded-t-3xl relative">
        {/* AI Chat Search */}
        <div className="mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 bg-white rounded-full px-5 py-3">
                  ✨
                  <input
                    type="text"
                    placeholder="Describe your ideal player: fast striker, technical midfielder, commanding defender..."
                    className="flex-1 text-gray-900 placeholder-gray-400 outline-none text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        setAiSearchQuery(searchQuery);
                        setIsAIChatOpen(true);
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (searchQuery.trim()) {
                        setAiSearchQuery(searchQuery);
                        setIsAIChatOpen(true);
                      }
                    }}
                    className="px-5 py-2 bg-[#5B8DB8] text-white rounded-lg font-semibold hover:bg-[#4a7a9f] transition-all shadow-sm flex items-center gap-2 text-sm"
                  >
                    <span>Ask AI</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Player Categories */}
        <div className="space-y-12">
          {/* Strikers */}
          {(activeCategory === "all" || activeCategory === "strikers") && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Top Strikers</h2>
                  <p className="text-sm text-gray-500 mt-1">Highest rated forwards in the region</p>
                </div>
                <Link href="/category/strikers" className="text-[#5B8DB8] font-semibold hover:text-[#4a7a9f] transition-colors flex items-center gap-1">
                  View all
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                  <div className="col-span-4 text-center py-12 text-gray-500">Loading players...</div>
                ) : getPlayersByPosition('strikers').length === 0 ? (
                  <div className="col-span-4 text-center py-12 text-gray-500">No strikers found</div>
                ) : (
                  getPlayersByPosition('strikers').slice(0, 4).map((player) => (
                    <PlayerCard key={player.id} player={player} />
                  ))
                )}
              </div>
            </section>
          )}

          {/* Midfielders */}
          {(activeCategory === "all" || activeCategory === "midfielders") && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Top Midfielders</h2>
                  <p className="text-sm text-gray-500 mt-1">Elite playmakers and controllers</p>
                </div>
                <Link href="/category/midfielders" className="text-[#5B8DB8] font-semibold hover:text-[#4a7a9f] transition-colors flex items-center gap-1">
                  View all
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                  <div className="col-span-4 text-center py-12 text-gray-500">Loading players...</div>
                ) : getPlayersByPosition('midfielders').length === 0 ? (
                  <div className="col-span-4 text-center py-12 text-gray-500">No midfielders found</div>
                ) : (
                  getPlayersByPosition('midfielders').slice(0, 4).map((player) => (
                    <PlayerCard key={player.id} player={player} />
                  ))
                )}
              </div>
            </section>
          )}

          {/* Defenders */}
          {(activeCategory === "all" || activeCategory === "defenders") && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Top Defenders</h2>
                  <p className="text-sm text-gray-500 mt-1">Defensive stalwarts and ball winners</p>
                </div>
                <Link href="/category/defenders" className="text-[#5B8DB8] font-semibold hover:text-[#4a7a9f] transition-colors flex items-center gap-1">
                  View all
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                  <div className="col-span-4 text-center py-12 text-gray-500">Loading players...</div>
                ) : getPlayersByPosition('defenders').length === 0 ? (
                  <div className="col-span-4 text-center py-12 text-gray-500">No defenders found</div>
                ) : (
                  getPlayersByPosition('defenders').slice(0, 4).map((player) => (
                    <PlayerCard key={player.id} player={player} />
                  ))
                )}
              </div>
            </section>
          )}

          {/* Goalkeepers */}
          {(activeCategory === "all" || activeCategory === "goalkeepers") && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Top Goalkeepers</h2>
                  <p className="text-sm text-gray-500 mt-1">Elite shot-stoppers and distributors</p>
                </div>
                <Link href="/category/goalkeepers" className="text-[#5B8DB8] font-semibold hover:text-[#4a7a9f] transition-colors flex items-center gap-1">
                  View all
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                  <div className="col-span-4 text-center py-12 text-gray-500">Loading players...</div>
                ) : getPlayersByPosition('goalkeepers').length === 0 ? (
                  <div className="col-span-4 text-center py-12 text-gray-500">No goalkeepers found</div>
                ) : (
                  getPlayersByPosition('goalkeepers').slice(0, 4).map((player) => (
                    <PlayerCard key={player.id} player={player} />
                  ))
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* AI Chat Popup */}
      <AIChat
        isOpen={isAIChatOpen}
        onClose={() => {
          setIsAIChatOpen(false);
          setSearchQuery("");
        }}
        initialQuery={aiSearchQuery}
      />
    </div>
  );
}
