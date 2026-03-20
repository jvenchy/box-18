"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';

const defensiveData = [
  { action: 'Tackles', successful: 42, attempted: 54 },
  { action: 'Interceptions', successful: 28, attempted: 28 },
  { action: 'Clearances', successful: 36, attempted: 38 },
  { action: 'Blocks', successful: 18, attempted: 18 },
];

const performanceData = [
  { attribute: 'Defending', value: 86 },
  { attribute: 'Tackling', value: 88 },
  { attribute: 'Positioning', value: 84 },
  { attribute: 'Aerial', value: 82 },
  { attribute: 'Strength', value: 85 },
  { attribute: 'Passing', value: 76 },
];

const duelsData = [
  { match: 'Game 1', won: 8, total: 11 },
  { match: 'Game 2', won: 10, total: 13 },
  { match: 'Game 3', won: 7, total: 9 },
  { match: 'Game 4', won: 11, total: 14 },
  { match: 'Game 5', won: 9, total: 12 },
  { match: 'Game 6', won: 12, total: 15 },
  { match: 'Game 7', won: 10, total: 13 },
];

export default function DefenderAnalytics() {
  return (
    <div className="space-y-8">
      {/* Heat Map Section */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Defensive Heat Map</h3>
        <div className="bg-gradient-to-br from-green-50 to-white border border-gray-200 rounded-xl p-6">
          <div className="relative w-full aspect-[2/3] bg-gradient-to-b from-green-600 to-green-700 rounded-lg overflow-hidden">
            {/* Soccer field */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 right-0 h-px bg-white"></div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-white"></div>
              <div className="absolute top-0 bottom-0 left-0 w-px bg-white"></div>
              <div className="absolute top-0 bottom-0 right-0 w-px bg-white"></div>
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white"></div>
            </div>

            {/* Heat zones - concentrated in defensive third */}
            <div className="absolute top-[65%] left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500 rounded-full opacity-60 blur-3xl"></div>
            <div className="absolute top-[55%] left-[30%] w-24 h-24 bg-orange-500 rounded-full opacity-50 blur-2xl"></div>
            <div className="absolute top-[55%] right-[30%] w-24 h-24 bg-orange-500 rounded-full opacity-50 blur-2xl"></div>
            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-20 h-20 bg-yellow-500 rounded-full opacity-40 blur-xl"></div>
            <div className="absolute top-[75%] left-[20%] w-16 h-16 bg-yellow-500 rounded-full opacity-35 blur-lg"></div>
            <div className="absolute top-[75%] right-[20%] w-16 h-16 bg-yellow-500 rounded-full opacity-35 blur-lg"></div>

            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>High Activity</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Medium Activity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Low Activity</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Defensive Actions */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Defensive Actions</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={defensiveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="action" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="successful" fill="#34d399" radius={[8, 8, 0, 0]} />
              <Bar dataKey="attempted" fill="#5B8DB8" radius={[8, 8, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#34d399] rounded"></div>
              <span className="text-sm text-gray-600">Successful</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#5B8DB8] opacity-60 rounded"></div>
              <span className="text-sm text-gray-600">Attempted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Radar */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Defender Attributes</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={performanceData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="attribute" stroke="#6b7280" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
              <Radar name="Rating" dataKey="value" stroke="#5B8DB8" fill="#5B8DB8" fillOpacity={0.6} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Duels Won */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Duels Won per Game</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={duelsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="match" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Line type="monotone" dataKey="won" stroke="#34d399" strokeWidth={3} dot={{ fill: '#34d399', r: 5 }} />
              <Line type="monotone" dataKey="total" stroke="#5B8DB8" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#5B8DB8', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#34d399] rounded"></div>
              <span className="text-sm text-gray-600">Duels Won</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#5B8DB8] rounded border-2 border-dashed border-[#5B8DB8]"></div>
              <span className="text-sm text-gray-600">Total Duels</span>
            </div>
          </div>
        </div>
      </div>

      {/* Defensive Stats */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Defensive Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 mb-2">Tackle Success</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">78%</div>
            <div className="text-xs text-green-600">Elite level</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 mb-2">Aerial Duels Won</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">68%</div>
            <div className="text-xs text-green-600">Top 20%</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 mb-2">Clean Sheets</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">5</div>
            <div className="text-xs text-gray-600">This season</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 mb-2">Fouls/Game</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">1.2</div>
            <div className="text-xs text-green-600">Disciplined</div>
          </div>
        </div>
      </div>
    </div>
  );
}
