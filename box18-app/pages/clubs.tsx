"use client";

import Link from "next/link";
import { DM_Sans } from "next/font/google";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import StaggeredMenu from "@/components/StaggeredMenu";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface Club {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
  metadata: any;
  created_at: string;
}

interface Team {
  id: string;
  name: string;
  gender: string | null;
  level: string | null;
}

interface ClubWithTeams extends Club {
  teams: Team[];
}

export default function Clubs() {
  const [clubs, setClubs] = useState<ClubWithTeams[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
    fetchClubs();
  }, []);

  async function fetchClubs() {
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

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.short_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`${dmSans.variable} min-h-screen font-sans relative`}>
      {/* Fixed Background Layer */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(/background/background3.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

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
        logoLink="/home"
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Clubs</h1>
          <p className="text-gray-600">Browse clubs and their teams</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="max-w-2xl">
            <input
              type="text"
              placeholder="Search clubs..."
              className="w-full px-5 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:border-[#5B8DB8] transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Clubs Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading clubs...</p>
          </div>
        ) : filteredClubs.length === 0 ? (
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
        )}
      </main>
    </div>
  );
}
