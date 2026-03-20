"use client";

import Image from "next/image";
import Link from "next/link";
import { DM_Sans } from "next/font/google";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import PlayerCard from "@/components/PlayerCard";
import StaggeredMenu from "@/components/StaggeredMenu";
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
  metadata: {
    team?: string;
    goals?: number;
    assists?: number;
    clean_sheets?: number;
    tackles?: number;
    [key: string]: unknown;
  } | null;
}

interface PlayerWithStats {
  id: string;
  name: string;
  position: string | null;
  age: number | null;
  team: string;
  stat: string;
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

export default function CategoryPage() {
  const router = useRouter();
  const { category } = router.query;
  const [players, setPlayers] = useState<PlayerWithStats[]>([]);
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
    if (category) {
      fetchPlayers();
    }
  }, [category]);

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

        // Check if this player has a hardcoded image
        const imageUrl = PLAYER_IMAGES[player.full_name.toUpperCase()];

        return {
          id: player.id,
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

      // Filter by category and sort
      const filtered = filterAndSortByCategory(playersWithStats, category as string);
      setPlayers(filtered);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterAndSortByCategory(allPlayers: PlayerWithStats[], cat: string) {
    // Filter players by category
    const filtered = allPlayers.filter(player => {
      const pos = player.position?.toUpperCase() || '';

      switch (cat) {
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

    // Sort by position-specific metrics
    return filtered.sort((a, b) => {
      switch (cat) {
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
          // Default sort by goals
          return b.goals - a.goals;
      }
    });
  }

  const getCategoryTitle = () => {
    switch (category) {
      case 'strikers':
        return 'Strikers';
      case 'midfielders':
        return 'Midfielders';
      case 'defenders':
        return 'Defenders';
      case 'goalkeepers':
        return 'Goalkeepers';
      default:
        return 'Players';
    }
  };

  const getCategoryDescription = () => {
    switch (category) {
      case 'strikers':
        return 'Highest rated forwards in the region';
      case 'midfielders':
        return 'Elite playmakers and controllers';
      case 'defenders':
        return 'Defensive stalwarts and ball winners';
      case 'goalkeepers':
        return 'Elite shot-stoppers and distributors';
      default:
        return 'Browse all players';
    }
  };

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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 bg-white rounded-t-3xl relative">
        <div className="mb-10">
          <Link href="/home" className="inline-flex items-center gap-2 text-[#5B8DB8] font-semibold mb-4 hover:underline">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Discovery
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{getCategoryTitle()}</h1>
          <p className="text-lg text-gray-600">{getCategoryDescription()}</p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-900">
            {players.length} {players.length === 1 ? 'player' : 'players'} found
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading players...</div>
        ) : players.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="text-gray-500 mb-2">No players found in this category</div>
            <Link href="/home" className="text-[#4A7FA8] font-semibold hover:underline">
              Return to discovery
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
