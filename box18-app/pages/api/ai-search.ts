import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { getPlayerPosition } from '@/lib/positionMapping';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
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

      return {
        name: p.full_name,
        position,
        age: p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : null,
        team,
        goals,
        assists,
        matches,
        nationality: p.nationality
      };
    }) || [];

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({ error: 'AI service not configured' });
    }

    // Create prompt for Gemini
    const systemPrompt = `You are an AI recruiting assistant for Box18, a youth soccer recruitment platform.
Your job is to help coaches find the perfect players based on their requirements.

You have access to the following players database:
${JSON.stringify(playersContext.slice(0, 50), null, 2)}

When a coach asks about players, you should:
1. Analyze their requirements (position, age, stats, playing style, etc.)
2. Search through the database to find matching players
3. Return a ranked list of the best fits with explanations
4. Be conversational and helpful
5. Ask follow-up questions if needed to narrow down the search

Always format your responses in a friendly, professional way. If you recommend players, list them with their key stats and why they match the criteria.`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prepare conversation history with system prompt
    const conversationHistory = messages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const chat = model.startChat({
      history: conversationHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    // Combine system prompt with user message for first message, or just send user message
    const messageToSend = conversationHistory.length === 0
      ? `${systemPrompt}\n\nUser: ${userMessage}`
      : userMessage;

    const result = await chat.sendMessage(messageToSend);

    const response = result.response;
    const text = response.text();

    return res.status(200).json({
      message: text,
      players: playersContext
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
