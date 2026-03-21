"use client";

import Link from "next/link";
import { DM_Sans } from "next/font/google";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import StaggeredMenu from "@/components/StaggeredMenu";
import PlayerCard from "@/components/PlayerCard";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface Team {
  id: string;
  name: string;
  gender: string | null;
  level: string | null;
  metadata: any;
  clubs: {
    name: string;
    short_name: string | null;
  } | null;
}

interface PlayerWithStats {
  id: string;
  name: string;
  full_name: string;
  position: string | null;
  age: number | null;
  team: string;
  stat: string;
  rating: number;
  metadata: any;
}

export default function TeamPage() {
  const router = useRouter();
  const { id } = router.query;
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<PlayerWithStats[]>([]);
  const [loading, setLoading] = useState(true);

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
      fetchTeam();
    }
  }, [id]);

  async function fetchTeam() {
    if (!id || Array.isArray(id)) return;

    try {
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select(`
          *,
          clubs (
            name,
            short_name
          )
        `)
        .eq('id', id)
        .single();

      if (teamError) throw teamError;
      if (!teamData) return;

      // Get all players from this team via match_rosters
      const { data: rostersData } = await supabase
        .from('match_rosters')
        .select(`
          player_id,
          players (
            id,
            full_name,
            position,
            dob,
            metadata
          )
        `)
        .eq('team_id', id);

      // Get unique players
      const uniquePlayers = new Map();
      rostersData?.forEach((roster: any) => {
        if (roster.players && !uniquePlayers.has(roster.players.id)) {
          const player = roster.players;
          const age = player.dob ? new Date().getFullYear() - new Date(player.dob).getFullYear() : null;
          const metadata = player.metadata as { goals?: number; assists?: number; clean_sheets?: number; tackles?: number } | null;

          const goals = metadata?.goals || 0;
          const assists = metadata?.assists || 0;
          const cleanSheets = metadata?.clean_sheets || 0;
          const tackles = metadata?.tackles || 0;

          let stat = 'No stats';
          let rating = 75;
          if (goals > 0) {
            stat = `${goals} Goals`;
            rating = Math.min(95, 75 + goals * 2);
          } else if (assists > 0) {
            stat = `${assists} Assists`;
            rating = Math.min(95, 75 + assists);
          } else if (cleanSheets > 0) {
            stat = `${cleanSheets} Clean Sheets`;
            rating = Math.min(95, 75 + cleanSheets);
          } else if (tackles > 0) {
            stat = `${tackles} Tackles`;
            rating = Math.min(95, 75 + tackles / 2);
          }

          uniquePlayers.set(player.id, {
            id: player.id,
            name: player.full_name,
            full_name: player.full_name,
            position: player.position,
            age,
            team: (teamData as any).name,
            stat,
            rating,
            metadata: player.metadata,
          });
        }
      });

      setTeam(teamData);
      setPlayers(Array.from(uniquePlayers.values()));
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={`${dmSans.variable} min-h-screen bg-white font-sans flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-lg text-gray-500">Loading team...</div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className={`${dmSans.variable} min-h-screen bg-white font-sans`}>
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Team not found</h1>
          <Link href="/clubs" className="text-[#5B8DB8] font-semibold hover:underline">
            Return to clubs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${dmSans.variable} min-h-screen bg-white font-sans`}>
      {/* Top Nav Bar with Background */}
      <div
        className="fixed top-0 left-0 right-0 h-20 z-30"
        style={{
          backgroundImage: 'url(/background/background3.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

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

      <main className="max-w-7xl mx-auto px-6 py-8 pt-28">
        {/* Team Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/clubs" className="hover:text-[#5B8DB8]">Clubs</Link>
            <span>/</span>
            <span>{team.clubs?.name || 'Unknown Club'}</span>
            <span>/</span>
            <span className="text-gray-900 font-semibold">{team.name}</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3">{team.name}</h1>

          <div className="flex items-center gap-3">
            {team.clubs && (
              <span className="text-lg text-gray-600">{team.clubs.short_name || team.clubs.name}</span>
            )}
            {team.gender && (
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                {team.gender}
              </span>
            )}
            {team.level && (
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                {team.level}
              </span>
            )}
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 mb-2">Squad Size</div>
            <div className="text-3xl font-bold text-gray-900">{players.length}</div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 mb-2">Gender</div>
            <div className="text-3xl font-bold text-[#5B8DB8]">{team.gender || 'N/A'}</div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 mb-2">Level</div>
            <div className="text-3xl font-bold text-[#5B8DB8]">{team.level || 'N/A'}</div>
          </div>
        </div>

        {/* Roster */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Roster</h2>
          {players.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-500">No players found for this team</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {players.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
