import positionData from '../data/position_mapping.json';

// Position mapping from player IDs to positions (ST, CM, CB)
export const positionMapping: Record<string, string> = positionData;

/**
 * Get the position for a player based on their ID
 * Falls back to their database position if not in mapping
 */
export function getPlayerPosition(playerId: string, dbPosition: string | null): string {
  // Check if we have a mapping for this field player
  if (positionMapping[playerId]) {
    return positionMapping[playerId];
  }

  // Normalize database position
  const normalizedPosition = dbPosition?.toLowerCase();

  if (normalizedPosition === 'goalkeeper') {
    return 'GK';
  }

  // If it's a field player without mapping, default to CM
  if (normalizedPosition === 'field') {
    return 'CM';
  }

  // Return the position as-is if it's already specific (CB, ST, etc.)
  return dbPosition?.toUpperCase() || 'FLD';
}
