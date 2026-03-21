import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { getPlayerPosition } from '@/lib/positionMapping';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface Message {
  role: 'user' | 'assistant';
  content: string;
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

    const userMessage = messages[messages.length - 1].content;

    // Fetch players from database
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id, full_name, position, dob, nationality');

    if (playersError) {
      console.error('Error fetching players:', playersError);
      return res.status(500).json({ error: 'Failed to fetch players', details: playersError.message });
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

    const { data: allRosters } = await supabase
      .from('match_rosters')
      .select(`
        player_id,
        minutes_played,
        teams (
          name
        )
      `);

    // Create lookup maps for performance
    const goalsMap = new Map<string, number>();
    const assistsMap = new Map<string, number>();
    const rostersMap = new Map<string, any[]>();

    allGoals?.forEach((g: any) => {
      goalsMap.set(g.player_id, (goalsMap.get(g.player_id) || 0) + 1);
    });

    allAssists?.forEach((a: any) => {
      assistsMap.set(a.player_id, (assistsMap.get(a.player_id) || 0) + 1);
    });

    allRosters?.forEach((r: any) => {
      if (!rostersMap.has(r.player_id)) {
        rostersMap.set(r.player_id, []);
      }
      rostersMap.get(r.player_id)?.push(r);
    });

    // Prepare context for AI
    const playersContext = players?.map(p => {
      const rosters = rostersMap.get(p.id) || [];
      const goals = goalsMap.get(p.id) || 0;
      const assists = assistsMap.get(p.id) || 0;
      const matches = rosters.length;
      const team = rosters[0]?.teams?.name || 'Unknown Team';
      const position = getPlayerPosition(p.id, p.position);

      // Map player photos
      const photoMap: { [key: string]: string } = {
        'NIGEL BUCKLEY': '/player-pics/buckley.png',
        'GEORGE AKPABIO': '/player-pics/akpabio.png',
        'ERION METAJ': '/player-pics/metaj.png',
        'RONALDO MARSHALL': '/player-pics/ronaldomarshall.png',
        'JACOB BEGLEY': '/player-pics/begley.png',
        'DAMOLA AKANNI': '/player-pics/damola.png',
        'SEBASTIAN COCHRANE': '/player-pics/sebastiancochrane.png',
        'MICAH JOSEPH': '/player-pics/micahjoseph.png'
      };

      const imageUrl = photoMap[p.full_name];

      return {
        id: p.id,
        name: p.full_name,
        position,
        age: p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : null,
        team,
        goals,
        assists,
        matches,
        nationality: p.nationality,
        imageUrl
      };
    }) || [];

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      return res.status(500).json({ error: 'AI service not configured' });
    }

    // Create system prompt for OpenAI
    const systemPrompt = `You are an AI recruiting assistant for Box18, a youth soccer recruitment platform.
Your job is to help coaches find the perfect players based on their requirements.

When a coach asks about players, use the search_players function to find and display matching players.
When a coach asks for analytics on a specific player, use the show_analytics function.

Be conversational and helpful. Ask follow-up questions if needed to narrow down the search.`;

    // Define function tools
    const tools = [
      {
        type: 'function',
        function: {
          name: 'search_players',
          description: 'Search for players by position and return the top rated players. This will display player cards in the chat.',
          parameters: {
            type: 'object',
            properties: {
              position: {
                type: 'string',
                description: 'The position to filter by (e.g., ST, CM, CB, GK). Use null for all positions.',
                enum: ['ST', 'CF', 'LW', 'RW', 'CM', 'CAM', 'CDM', 'LM', 'RM', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'GK', null]
              },
              limit: {
                type: 'number',
                description: 'Maximum number of players to return (default: 5)',
                default: 5
              }
            },
            required: []
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'show_analytics',
          description: 'Show analytics for a specific player. This will display analytics charts and stats.',
          parameters: {
            type: 'object',
            properties: {
              playerName: {
                type: 'string',
                description: 'The full name of the player to show analytics for'
              },
              analyticsType: {
                type: 'string',
                description: 'Type of analytics to show based on player position',
                enum: ['striker', 'midfielder', 'defender', 'goalkeeper']
              }
            },
            required: ['playerName', 'analyticsType']
          }
        }
      }
    ];

    // Prepare conversation history for OpenAI
    const conversationHistory = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content
      }))
    ];

    // Call OpenAI API with function calling
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1000,
      temperature: 0.7,
      messages: conversationHistory,
      tools: tools as any,
      tool_choice: 'auto',
    });

    const choice = response.choices[0];
    const message = choice.message;

    // Handle function calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0] as any;
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      if (functionName === 'search_players') {
        const { position, limit = 5 } = functionArgs;

        // Filter players by position if specified
        let filteredPlayers = playersContext;
        if (position) {
          filteredPlayers = playersContext.filter(p =>
            p.position?.toUpperCase() === position.toUpperCase()
          );
        }

        // Sort by goals (rating proxy) and limit
        const topPlayers = filteredPlayers
          .sort((a, b) => (b.goals || 0) - (a.goals || 0))
          .slice(0, limit);

        return res.status(200).json({
          message: message.content || `Here are the top ${position || 'rated'} players:`,
          type: 'players',
          players: topPlayers
        });
      } else if (functionName === 'show_analytics') {
        const { playerName, analyticsType } = functionArgs;

        return res.status(200).json({
          message: `Here are the analytics for ${playerName}:`,
          type: 'analytics',
          playerName,
          analyticsType
        });
      }
    }

    const text = message.content || 'Sorry, I could not generate a response.';

    return res.status(200).json({
      message: text,
      type: 'text'
    });

  } catch (error: any) {
    console.error('Error in AI search:', error);
    console.error('Error details:', error?.message, error?.stack);
    return res.status(500).json({
      error: 'Failed to get AI response',
      details: error?.message || 'Unknown error'
    });
  }
}
