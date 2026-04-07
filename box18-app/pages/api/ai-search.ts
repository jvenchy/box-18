import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { getPlayerPosition } from '@/lib/positionMapping';
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabaseConfig';

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ''
);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface RosterTeam {
  name?: string;
}

interface RosterRow {
  player_id: string;
  teams?: RosterTeam[] | null;
}

interface SearchPlayersInput {
  position?: string | null;
  limit?: number;
}

interface ShowAnalyticsInput {
  playerName?: string;
  analyticsType?: 'striker' | 'midfielder' | 'defender' | 'goalkeeper';
}

interface GeminiResponse {
  message?: string;
  type?: 'text' | 'players' | 'analytics';
  position?: string | null;
  limit?: number;
  playerName?: string;
  analyticsType?: 'striker' | 'midfielder' | 'defender' | 'goalkeeper';
}

async function generateWithGemini(promptParts: string[]) {
  const configuredModel = process.env.GEMINI_MODEL;
  const candidateModels = [
    configuredModel,
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
  ].filter((model): model is string => Boolean(model));

  let lastError: unknown;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(promptParts);
      return result;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body as { messages: Message[] };

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'No messages provided' });
    }

    // Fetch players from database
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id, full_name, position, dob, nationality');

    if (playersError) {
      console.error('Error fetching players:', playersError);
      return res
        .status(500)
        .json({ error: 'Failed to fetch players', details: playersError.message });
    }

    // Fetch all match events for stats
    const { data: allGoals } = await supabase
      .from('match_events')
      .select('player_id')
      .eq('event_type', 'goal');

    const { data: allAssists } = await supabase
      .from('match_events')
      .select('player_id')
      .eq('event_type', 'assist');

    const { data: allRosters } = await supabase.from('match_rosters').select(`
        player_id,
        minutes_played,
        teams (
          name
        )
      `);

    // Create lookup maps for performance
    const goalsMap = new Map<string, number>();
    const assistsMap = new Map<string, number>();
    const rostersMap = new Map<string, RosterRow[]>();

    allGoals?.forEach((goal: { player_id: string }) => {
      goalsMap.set(goal.player_id, (goalsMap.get(goal.player_id) || 0) + 1);
    });

    allAssists?.forEach((assist: { player_id: string }) => {
      assistsMap.set(assist.player_id, (assistsMap.get(assist.player_id) || 0) + 1);
    });

    allRosters?.forEach((roster: RosterRow) => {
      if (!rostersMap.has(roster.player_id)) {
        rostersMap.set(roster.player_id, []);
      }
      rostersMap.get(roster.player_id)?.push(roster);
    });

    // Prepare context for AI
    const playersContext =
      players?.map((player) => {
        const rosters = rostersMap.get(player.id) || [];
        const goals = goalsMap.get(player.id) || 0;
        const assists = assistsMap.get(player.id) || 0;
        const matches = rosters.length;
        const team = rosters[0]?.teams?.[0]?.name || 'Unknown Team';
        const position = getPlayerPosition(player.id, player.position);

        // Map player photos
        const photoMap: Record<string, string> = {
          'NIGEL BUCKLEY': '/player-pics/buckley.png',
          'GEORGE AKPABIO': '/player-pics/akpabio.png',
          'ERION METAJ': '/player-pics/metaj.png',
          'RONALDO MARSHALL': '/player-pics/ronaldomarshall.png',
          'JACOB BEGLEY': '/player-pics/begley.png',
          'DAMOLA AKANNI': '/player-pics/damola.png',
          'SEBASTIAN COCHRANE': '/player-pics/sebastiancochrane.png',
          'MICAH JOSEPH': '/player-pics/micahjoseph.png',
        };

        const imageUrl = photoMap[player.full_name];

        return {
          id: player.id,
          name: player.full_name,
          position,
          age: player.dob
            ? new Date().getFullYear() - new Date(player.dob).getFullYear()
            : null,
          team,
          goals,
          assists,
          matches,
          nationality: player.nationality,
          imageUrl,
        };
      }) || [];

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const systemPrompt = `You are an AI recruiting assistant for Box18, a youth soccer recruitment platform.
Your job is to help coaches find the right players based on their requirements.

Return only valid JSON with this shape:
{
  "message": "string",
  "type": "text" | "players" | "analytics",
  "position": "ST" | "CF" | "LW" | "RW" | "CM" | "CAM" | "CDM" | "LM" | "RM" | "CB" | "LB" | "RB" | "LWB" | "RWB" | "GK" | null,
  "limit": number,
  "playerName": "string",
  "analyticsType": "striker" | "midfielder" | "defender" | "goalkeeper"
}

Rules:
- Use "players" when the coach is asking to find or compare players.
- Use "analytics" when the coach asks for analytics about one player.
- Use "text" for follow-up questions or general conversational replies.
- Keep "message" conversational and helpful.
- When type is "players", include a matching position if clear, otherwise null, and a sensible limit.
- When type is "analytics", include playerName and analyticsType.
- Do not include markdown fences or extra text outside the JSON.`;

    const conversationHistory = messages
      .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
      .join('\n');

    const result = await generateWithGemini([
      systemPrompt,
      `Available players data:\n${JSON.stringify(playersContext)}`,
      `Conversation:\n${conversationHistory}`,
    ]);

    const rawText = result.response.text().trim();
    const normalizedText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '');

    let geminiResponse: GeminiResponse;

    try {
      geminiResponse = JSON.parse(normalizedText) as GeminiResponse;
    } catch {
      return res.status(200).json({
        message: rawText || 'Sorry, I could not generate a response.',
        type: 'text',
      });
    }

    if (geminiResponse.type === 'players') {
      const input: SearchPlayersInput = {
        position:
          typeof geminiResponse.position === 'string' ? geminiResponse.position : null,
        limit: typeof geminiResponse.limit === 'number' ? geminiResponse.limit : 5,
      };

      const position = input.position;
      const limit = input.limit ?? 5;

      let filteredPlayers = playersContext;
      if (position) {
        filteredPlayers = playersContext.filter(
          (player) => player.position?.toUpperCase() === position.toUpperCase()
        );
      }

      const topPlayers = filteredPlayers
        .sort((a, b) => (b.goals || 0) - (a.goals || 0))
        .slice(0, limit);

      return res.status(200).json({
        message: geminiResponse.message || `Here are the top ${position || 'rated'} players:`,
        type: 'players',
        players: topPlayers,
      });
    }

    if (geminiResponse.type === 'analytics') {
      const input: ShowAnalyticsInput = {
        playerName: geminiResponse.playerName,
        analyticsType: geminiResponse.analyticsType,
      };

      const playerName =
        typeof input.playerName === 'string' ? input.playerName : 'Unknown Player';
      const analyticsType =
        input.analyticsType === 'striker' ||
        input.analyticsType === 'midfielder' ||
        input.analyticsType === 'defender' ||
        input.analyticsType === 'goalkeeper'
          ? input.analyticsType
          : 'midfielder';

      return res.status(200).json({
        message: geminiResponse.message || `Here are the analytics for ${playerName}:`,
        type: 'analytics',
        playerName,
        analyticsType,
      });
    }

    return res.status(200).json({
      message: geminiResponse.message || rawText || 'Sorry, I could not generate a response.',
      type: 'text',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in AI search:', err);
    console.error('Error details:', err?.message, err?.stack);
    return res.status(500).json({
      error: 'Failed to get AI response',
      details: err?.message || 'Unknown error',
    });
  }
}
