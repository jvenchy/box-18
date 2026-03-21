"use client";

import Image from "next/image";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';

const saveData = [
  { type: 'Shot Stopping', saves: 24, faced: 31 },
  { type: 'Cross Claims', saves: 14, faced: 18 },
  { type: 'One-on-One', saves: 6, faced: 9 },
  { type: 'Penalties', saves: 2, faced: 3 },
];

const performanceData = [
  { attribute: 'Reflexes', value: 87 },
  { attribute: 'Positioning', value: 85 },
  { attribute: 'Handling', value: 83 },
  { attribute: 'Distribution', value: 78 },
  { attribute: 'Aerial', value: 84 },
  { attribute: 'Command', value: 81 },
];

const cleanSheetData = [
  { match: 'Game 1', clean: 1 },
  { match: 'Game 2', clean: 0 },
  { match: 'Game 3', clean: 1 },
  { match: 'Game 4', clean: 1 },
  { match: 'Game 5', clean: 0 },
  { match: 'Game 6', clean: 1 },
  { match: 'Game 7', clean: 0 },
  { match: 'Game 8', clean: 1 },
];

export default function GoalkeeperAnalytics() {
  return (
    <div className="space-y-8">
      {/* Heat Map Section */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Goalkeeper Activity Map</h3>
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

      {/* Save Analysis */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Save Analysis</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={saveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="type" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="saves" fill="#34d399" radius={[8, 8, 0, 0]} />
              <Bar dataKey="faced" fill="#5B8DB8" radius={[8, 8, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#34d399] rounded"></div>
              <span className="text-sm text-gray-600">Saves Made</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#5B8DB8] opacity-60 rounded"></div>
              <span className="text-sm text-gray-600">Total Faced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Radar */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Goalkeeper Attributes</h3>
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

      {/* Clean Sheets */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Clean Sheet Record</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={cleanSheetData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="match" stroke="#6b7280" />
              <YAxis domain={[0, 1]} ticks={[0, 1]} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value) => [value === 1 ? 'Yes' : 'No', 'Clean Sheet']}
              />
              <Line type="stepAfter" dataKey="clean" stroke="#34d399" strokeWidth={3} dot={{ fill: '#34d399', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Goalkeeper Stats */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Goalkeeper Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 mb-2">Save Percentage</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">77%</div>
            <div className="text-xs text-green-600">Elite level</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 mb-2">Clean Sheets</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">5</div>
            <div className="text-xs text-green-600">62.5%</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 mb-2">Passes Completed</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">84%</div>
            <div className="text-xs text-gray-600">Good distribution</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white border border-gray-200 rounded-xl p-6">
            <div className="text-sm text-gray-500 mb-2">High Claims</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">14</div>
            <div className="text-xs text-green-600">Commanding</div>
          </div>
        </div>
      </div>
    </div>
  );
}
