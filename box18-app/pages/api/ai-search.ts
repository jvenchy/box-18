import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { getPlayerPosition } from '@/lib/positionMapping';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

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

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const systemPrompt = `You are an AI recruiting assistant for Box18, a youth soccer recruitment platform.
Your job is to help coaches find the perfect players based on their requirements.

When a coach asks about players, use the search_players tool to find and display matching players.
When a coach asks for analytics on a specific player, use the show_analytics tool.

Be conversational and helpful. Ask follow-up questions if needed to narrow down the search.`;

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest',
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      tools: [
        {
          name: 'search_players',
          description:
            'Search for players by position and return the top rated players. This will display player cards in the chat.',
          input_schema: {
            type: 'object',
            properties: {
              position: {
                anyOf: [
                  {
                    type: 'string',
                    enum: [
                      'ST',
                      'CF',
                      'LW',
                      'RW',
                      'CM',
                      'CAM',
                      'CDM',
                      'LM',
                      'RM',
                      'CB',
                      'LB',
                      'RB',
                      'LWB',
                      'RWB',
                      'GK',
                    ],
                  },
                  { type: 'null' },
                ],
                description:
                  'The position to filter by (e.g., ST, CM, CB, GK). Use null for all positions.',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of players to return (default: 5)',
                default: 5,
              },
            },
            required: [],
          },
        },
        {
          name: 'show_analytics',
          description:
            'Show analytics for a specific player. This will display analytics charts and stats.',
          input_schema: {
            type: 'object',
            properties: {
              playerName: {
                type: 'string',
                description: 'The full name of the player to show analytics for',
              },
              analyticsType: {
                type: 'string',
                description: 'Type of analytics to show based on player position',
                enum: ['striker', 'midfielder', 'defender', 'goalkeeper'],
              },
            },
            required: ['playerName', 'analyticsType'],
          },
        },
      ],
    });

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    const toolUseBlock = response.content.find((block) => block.type === 'tool_use');

    if (toolUseBlock?.type === 'tool_use') {
      if (toolUseBlock.name === 'search_players') {
        const input = toolUseBlock.input as SearchPlayersInput;
        const position =
          typeof input.position === 'string'
            ? input.position
            : null;
        const limit = typeof input.limit === 'number' ? input.limit : 5;

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
          message: text || `Here are the top ${position || 'rated'} players:`,
          type: 'players',
          players: topPlayers,
        });
      }

      if (toolUseBlock.name === 'show_analytics') {
        const input = toolUseBlock.input as ShowAnalyticsInput;
        const playerName =
          typeof input.playerName === 'string'
            ? input.playerName
            : 'Unknown Player';
        const analyticsType =
          input.analyticsType === 'striker' ||
          input.analyticsType === 'midfielder' ||
          input.analyticsType === 'defender' ||
          input.analyticsType === 'goalkeeper'
            ? input.analyticsType
            : 'midfielder';

        return res.status(200).json({
          message: text || `Here are the analytics for ${playerName}:`,
          type: 'analytics',
          playerName,
          analyticsType,
        });
      }
    }

    return res.status(200).json({
      message: text || 'Sorry, I could not generate a response.',
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
