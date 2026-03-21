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

  // Get player initials (first letter of first name + first letter of last name)
  const getInitials = (name: string) => {
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Link href={`/player/${player.id}`} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-[#5B8DB8] transition-all duration-300 cursor-pointer block">
      {/* Player Image */}
      <div className="aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Grid mesh background */}
        <Image
          src="/position-card-backgrounds/grid-background.png"
          alt="Grid background"
          fill
          className="object-cover opacity-40"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(49, 69, 121, 0.8), rgba(16, 48, 138, 0.4), transparent)',
          }}
        />

        {/* Square player profile picture in center */}
        {player.imageUrl ? (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-white/30 shadow-xl z-10">
            <Image
              src={player.imageUrl}
              alt={player.name}
              fill
              className="object-cover opacity-80"
              sizes="96px"
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-lg bg-white/10 backdrop-blur-md border-2 border-white/30 flex items-center justify-center z-10">
            <div className="text-3xl font-bold text-white">{getInitials(player.name)}</div>
          </div>
        )}

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
