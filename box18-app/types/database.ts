export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clubs: {
        Row: {
          id: string
          name: string
          short_name: string | null
          logo_url: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          short_name?: string | null
          logo_url?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          short_name?: string | null
          logo_url?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
      }
      leagues: {
        Row: {
          id: string
          name: string
          gender: string | null
          age_group: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          gender?: string | null
          age_group?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          gender?: string | null
          age_group?: string | null
          created_at?: string | null
        }
      }
      matches: {
        Row: {
          id: string
          league_id: string | null
          season_id: string | null
          date: string | null
          home_team_id: string | null
          away_team_id: string | null
          home_score: number | null
          away_score: number | null
          status: string | null
          video_url: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          league_id?: string | null
          season_id?: string | null
          date?: string | null
          home_team_id?: string | null
          away_team_id?: string | null
          home_score?: number | null
          away_score?: number | null
          status?: string | null
          video_url?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          league_id?: string | null
          season_id?: string | null
          date?: string | null
          home_team_id?: string | null
          away_team_id?: string | null
          home_score?: number | null
          away_score?: number | null
          status?: string | null
          video_url?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
      }
      match_events: {
        Row: {
          id: string
          match_id: string | null
          team_id: string | null
          player_id: string | null
          event_type: string | null
          minute: string | null
          description: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          match_id?: string | null
          team_id?: string | null
          player_id?: string | null
          event_type?: string | null
          minute?: string | null
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          match_id?: string | null
          team_id?: string | null
          player_id?: string | null
          event_type?: string | null
          minute?: string | null
          description?: string | null
          created_at?: string | null
        }
      }
      players: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          full_name: string
          dob: string | null
          nationality: string | null
          position: string | null
          preferred_foot: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          full_name: string
          dob?: string | null
          nationality?: string | null
          position?: string | null
          preferred_foot?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          full_name?: string
          dob?: string | null
          nationality?: string | null
          position?: string | null
          preferred_foot?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
      }
      seasons: {
        Row: {
          id: string
          name: string
          start_date: string | null
          end_date: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string | null
        }
      }
      teams: {
        Row: {
          id: string
          club_id: string | null
          name: string
          gender: string | null
          level: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          club_id?: string | null
          name: string
          gender?: string | null
          level?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          club_id?: string | null
          name?: string
          gender?: string | null
          level?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
      }
    }
  }
}
