"use client";

import Image from "next/image";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from 'recharts';

const passData = [
  { range: 'Short (0-15m)', completed: 142, attempted: 156 },
  { range: 'Medium (15-30m)', completed: 68, attempted: 84 },
  { range: 'Long (30m+)', completed: 24, attempted: 38 },
];

const performanceData = [
  { attribute: 'Passing', value: 88 },
  { attribute: 'Vision', value: 85 },
  { attribute: 'Control', value: 87 },
  { attribute: 'Stamina', value: 82 },
  { attribute: 'Tackling', value: 74 },
  { attribute: 'Positioning', value: 80 },
];

const touchesData = [
  { zone: 'Def Third', touches: 45 },
  { zone: 'Mid Third', touches: 128 },
  { zone: 'Att Third', touches: 67 },
  { zone: 'Opp Box', touches: 18 },
];

const keyPassTimeline = [
  { match: 'Game 1', passes: 4 },
  { match: 'Game 2', passes: 6 },
  { match: 'Game 3', passes: 3 },
  { match: 'Game 4', passes: 7 },
  { match: 'Game 5', passes: 5 },
  { match: 'Game 6', passes: 8 },
  { match: 'Game 7', passes: 6 },
];

export default function MidfielderAnalytics() {
  return (
    <div className="space-y-8">
      {/* Heat Map Section */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Midfield Heat Map</h3>
        <div className="bg-gradient-to-br from-green-50 to-white border border-gray-200 rounded-xl p-6">
          <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden">
            <Image
              src="/images/heatmap.png"
              alt="Player Heat Map"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>

      {/* Pass Completion */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Pass Completion by Range</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={passData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="range" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="completed" fill="#34d399" radius={[8, 8, 0, 0]} />
              <Bar dataKey="attempted" fill="#5B8DB8" radius={[8, 8, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#34d399] rounded"></div>
              <span className="text-sm text-gray-600">Completed</span>
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
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Midfielder Attributes</h3>
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

      {/* Touches Distribution */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Touches by Zone</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={touchesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="zone" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Area type="monotone" dataKey="touches" stroke="#5B8DB8" fill="#5B8DB8" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Stats */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Playmaking Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 mb-2">Pass Accuracy</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">87%</div>
            <div className="text-xs text-green-600">Elite level</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 mb-2">Key Passes/Game</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">5.6</div>
            <div className="text-xs text-green-600">Top 10%</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 mb-2">Distance Covered</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">11.2 km</div>
            <div className="text-xs text-green-600">+18% vs avg</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 mb-2">Ball Recoveries</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">12</div>
            <div className="text-xs text-gray-600">Above avg</div>
          </div>
        </div>
      </div>
    </div>
  );
}
