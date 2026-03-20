const fs = require('fs');
const path = require('path');

// Read and parse CSV files
function parseCSV(filename) {
  const content = fs.readFileSync(path.join('data', filename), 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
    const obj = {};
    headers.forEach((header, i) => {
      let value = values[i] || '';
      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      obj[header] = value;
    });
    return obj;
  });
}

// Load data
const players = parseCSV('players_rows.csv');
const events = parseCSV('match_events_rows.csv');

// Count goals per player
const playerGoals = {};
events.forEach(event => {
  if (event.event_type === 'goal') {
    const playerId = event.player_id;
    playerGoals[playerId] = (playerGoals[playerId] || 0) + 1;
  }
});

// Get field players
const fieldPlayers = players.filter(p => p.position === 'Field');
console.log(`Total field players: ${fieldPlayers.length}`);

// Sort by goals
const playersWithGoals = fieldPlayers.map(p => ({
  id: p.id,
  name: p.full_name,
  goals: playerGoals[p.id] || 0
})).sort((a, b) => b.goals - a.goals);

// Statistics
const totalWithGoals = playersWithGoals.filter(p => p.goals > 0).length;
console.log(`Field players with goals: ${totalWithGoals}`);

// Show distribution
console.log('\nTop 10 goal scorers:');
playersWithGoals.slice(0, 10).forEach((p, i) => {
  console.log(`${i+1}. ${p.name}: ${p.goals} goals`);
});

// Categorization logic
const strikerThreshold = 2; // Players with 2+ goals are likely strikers
const strikers = playersWithGoals.filter(p => p.goals >= strikerThreshold);
const remaining = playersWithGoals.filter(p => p.goals < strikerThreshold);

// Split remaining between midfielders (40%) and defenders (60%)
const midCount = Math.ceil(remaining.length * 0.4);
const defCount = remaining.length - midCount;

console.log(`\nProposed distribution:`);
console.log(`Strikers (${strikerThreshold}+ goals): ${strikers.length}`);
console.log(`Midfielders (randomly from remaining): ${midCount}`);
console.log(`Defenders (rest): ${defCount}`);
