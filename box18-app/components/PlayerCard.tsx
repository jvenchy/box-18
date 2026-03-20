import Link from "next/link";
import Image from "next/image";

interface Player {
  id: string;
  name: string;
  position: string | null;
  age: number | null;
  team: string;
  stat: string;
  rating: number;
  imageUrl?: string;
}

export default function PlayerCard({ player }: { player: Player }) {
  const displayPosition = player.position === 'Goalkeeper' ? 'GK' : player.position;

  return (
    <Link href={`/player/${player.id}`} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-[#5B8DB8] transition-all duration-300 cursor-pointer block">
      {/* Player Image */}
      <div className="aspect-[4/5] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
        {player.imageUrl ? (
          <>
            <Image
              src={player.imageUrl}
              alt={player.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            {/* Heavy noise overlay */}
            <div
              className="absolute inset-0 opacity-60 mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
              }}
            />
            {/* Blue gradient overlay matching background3.jpg aesthetic */}
            {/* <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, rgba(30, 58, 138, 0.4), rgba(15, 23, 42, 0.6))',
              }}
            /> */}
            {/* Blue color filter */}
            {/* <div className="absolute inset-0 bg-blue-900/30 mix-blend-multiply" /> */}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl font-bold text-white/20">{displayPosition || 'N/A'}</div>
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(49, 69, 121, 0.8), rgba(16, 48, 138, 0.4), transparent)',
          }}
        />
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2">
            <span className="text-xs font-semibold text-white">{player.stat}</span>
          </div>
        </div>
      </div>

      {/* Player Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-0.5">{player.name}</h3>
            <p className="text-xs text-gray-500">{player.team}</p>
          </div>
          {player.age && (
            <div className="px-2.5 py-1 bg-gray-100 rounded-md">
              <span className="text-xs font-semibold text-gray-700">{player.age}y</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <div className="flex-1">
            <span className="text-xs text-gray-500 block mb-1">Position</span>
            <span className="text-sm font-semibold text-gray-900">{displayPosition || 'Unknown'}</span>
          </div>
          <button className="px-3 py-1.5 bg-[#5B8DB8] text-white rounded-md text-xs font-semibold hover:bg-[#4a7a9f] transition-all opacity-0 group-hover:opacity-100">
            View Profile
          </button>
        </div>
      </div>
    </Link>
  );
}
