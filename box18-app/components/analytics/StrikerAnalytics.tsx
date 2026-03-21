"use client";

import Image from "next/image";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';

const shotData = [
  { location: 'Box', attempts: 24, onTarget: 18 },
  { location: 'Edge', attempts: 12, onTarget: 7 },
  { location: 'Distance', attempts: 8, onTarget: 3 },
  { location: 'Set Piece', attempts: 6, onTarget: 4 },
];

const performanceData = [
  { attribute: 'Finishing', value: 85 },
  { attribute: 'Positioning', value: 88 },
  { attribute: 'Movement', value: 82 },
  { attribute: 'Aerial', value: 76 },
  { attribute: 'Pace', value: 79 },
  { attribute: 'Strength', value: 74 },
];

const goalsTimeline = [
  { match: 'Game 1', goals: 1 },
  { match: 'Game 2', goals: 2 },
  { match: 'Game 3', goals: 0 },
  { match: 'Game 4', goals: 3 },
  { match: 'Game 5', goals: 1 },
  { match: 'Game 6', goals: 2 },
  { match: 'Game 7', goals: 1 },
];

export default function StrikerAnalytics() {
  return (
    <div className="space-y-8">
      {/* Shot Analysis */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Shot Analysis</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={shotData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="location" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="attempts" fill="#5B8DB8" radius={[8, 8, 0, 0]} />
              <Bar dataKey="onTarget" fill="#34d399" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#5B8DB8] rounded"></div>
              <span className="text-sm text-gray-600">Total Attempts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#34d399] rounded"></div>
              <span className="text-sm text-gray-600">On Target</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Radar */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Striker Attributes</h3>
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

      {/* Goals Timeline */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Goals per Game</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={goalsTimeline}>
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
              <Line type="monotone" dataKey="goals" stroke="#5B8DB8" strokeWidth={3} dot={{ fill: '#5B8DB8', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sprint Analysis */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Sprint & Distance Analysis</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 mb-2">Total Distance</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">8.2 km</div>
            <div className="text-xs text-green-600">+12% vs avg</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 mb-2">Sprint Bursts</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">24</div>
            <div className="text-xs text-green-600">Top 15%</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 mb-2">Top Speed</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">32.4 km/h</div>
            <div className="text-xs text-gray-600">Elite level</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 mb-2">Conversion Rate</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">24%</div>
            <div className="text-xs text-green-600">Above avg</div>
          </div>
        </div>
      </div>

      {/* Heat Map Section */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Attacking Heat Map</h3>
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
    </div>
  );
}
