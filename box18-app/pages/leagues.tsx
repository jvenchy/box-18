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

interface League {
  id: string;
  name: string;
  gender: string | null;
  age_group: string | null;
  created_at: string;
}

interface Season {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
}

interface Match {
  id: string;
  date: string;
  home_score: number | null;
  away_score: number | null;
  status: string | null;
}

interface LeagueWithData extends League {
  matches: Match[];
  seasons: Season[];
}

export default function Leagues() {
  const [leagues, setLeagues] = useState<LeagueWithData[]>([]);
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
    fetchLeagues();
  }, []);

  async function fetchLeagues() {
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

  const filteredLeagues = leagues.filter(league =>
    league.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Leagues</h1>
          <p className="text-gray-600">Browse leagues, seasons, and matches</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="max-w-2xl">
            <input
              type="text"
              placeholder="Search leagues..."
              className="w-full px-5 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:border-[#5B8DB8] transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Leagues Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading leagues...</p>
          </div>
        ) : filteredLeagues.length === 0 ? (
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
                  {/* Recent Matches */}
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

                  {/* Seasons */}
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
        )}
      </main>
    </div>
  );
}
