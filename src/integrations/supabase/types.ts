export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      airdrop_campaigns: {
        Row: {
          campaign_name: string
          claim_site_url: string
          created_at: string
          finish_date: string | null
          id: string
          is_active: boolean
          quantity_per_wallet: number
          token_address: string
          token_name: string
          token_symbol: string
          total_amount_claimable: number
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_name: string
          claim_site_url: string
          created_at?: string
          finish_date?: string | null
          id?: string
          is_active?: boolean
          quantity_per_wallet?: number
          token_address: string
          token_name: string
          token_symbol: string
          total_amount_claimable?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_name?: string
          claim_site_url?: string
          created_at?: string
          finish_date?: string | null
          id?: string
          is_active?: boolean
          quantity_per_wallet?: number
          token_address?: string
          token_name?: string
          token_symbol?: string
          total_amount_claimable?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      airdrop_claims: {
        Row: {
          campaign_id: string
          claimed_at: string
          id: string
          quantity: number
          transaction_signature: string | null
          wallet_address: string
        }
        Insert: {
          campaign_id: string
          claimed_at?: string
          id?: string
          quantity: number
          transaction_signature?: string | null
          wallet_address: string
        }
        Update: {
          campaign_id?: string
          claimed_at?: string
          id?: string
          quantity?: number
          transaction_signature?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "airdrop_claims_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "airdrop_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      airdrop_wallet_lists: {
        Row: {
          campaign_id: string
          claimed: boolean
          claimed_at: string | null
          created_at: string
          id: string
          quantity: number
          wallet_address: string
        }
        Insert: {
          campaign_id: string
          claimed?: boolean
          claimed_at?: string | null
          created_at?: string
          id?: string
          quantity?: number
          wallet_address: string
        }
        Update: {
          campaign_id?: string
          claimed?: boolean
          claimed_at?: string | null
          created_at?: string
          id?: string
          quantity?: number
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "airdrop_wallet_lists_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "airdrop_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_comments: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          downvotes: number | null
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string | null
          upvotes: number | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string | null
          downvotes: number | null
          id: string
          title: string
          updated_at: string | null
          upvotes: number | null
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          downvotes?: number | null
          id?: string
          title: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          downvotes?: number | null
          id?: string
          title?: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_votes: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string
          vote_type: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id: string
          vote_type: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      market_maker_bots: {
        Row: {
          created_at: string
          duration_hours: number
          end_time: string | null
          id: string
          package_size: number
          payment_amount: number
          payment_signature: string | null
          price_max: number | null
          price_min: number | null
          start_time: string | null
          status: string
          token_mint_address: string
          token_name: string
          token_symbol: string
          total_trades: number | null
          total_volume: number | null
          trade_frequency: number | null
          updated_at: string
          user_id: string
          volume_target: number | null
        }
        Insert: {
          created_at?: string
          duration_hours?: number
          end_time?: string | null
          id?: string
          package_size?: number
          payment_amount: number
          payment_signature?: string | null
          price_max?: number | null
          price_min?: number | null
          start_time?: string | null
          status?: string
          token_mint_address: string
          token_name: string
          token_symbol: string
          total_trades?: number | null
          total_volume?: number | null
          trade_frequency?: number | null
          updated_at?: string
          user_id: string
          volume_target?: number | null
        }
        Update: {
          created_at?: string
          duration_hours?: number
          end_time?: string | null
          id?: string
          package_size?: number
          payment_amount?: number
          payment_signature?: string | null
          price_max?: number | null
          price_min?: number | null
          start_time?: string | null
          status?: string
          token_mint_address?: string
          token_name?: string
          token_symbol?: string
          total_trades?: number | null
          total_volume?: number | null
          trade_frequency?: number | null
          updated_at?: string
          user_id?: string
          volume_target?: number | null
        }
        Relationships: []
      }
      market_maker_trades: {
        Row: {
          amount: number
          bot_id: string
          created_at: string
          id: string
          price: number
          trade_type: string
          transaction_signature: string
        }
        Insert: {
          amount: number
          bot_id: string
          created_at?: string
          id?: string
          price: number
          trade_type: string
          transaction_signature: string
        }
        Update: {
          amount?: number
          bot_id?: string
          created_at?: string
          id?: string
          price?: number
          trade_type?: string
          transaction_signature?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_maker_trades_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "market_maker_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          category: string | null
          comments_count: number | null
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          likes_count: number | null
          retweets_count: number | null
          updated_at: string | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          category?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          retweets_count?: number | null
          updated_at?: string | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          category?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          retweets_count?: number | null
          updated_at?: string | null
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          email: string | null
          follower_count: number | null
          id: string
          instagram: string | null
          is_subscribed: boolean | null
          joined_date: string | null
          linkedin: string | null
          location: string | null
          name: string | null
          post_consistency_months: number | null
          twitter: string | null
          updated_at: string | null
          username: string | null
          website: string | null
          youtube: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          email?: string | null
          follower_count?: number | null
          id: string
          instagram?: string | null
          is_subscribed?: boolean | null
          joined_date?: string | null
          linkedin?: string | null
          location?: string | null
          name?: string | null
          post_consistency_months?: number | null
          twitter?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
          youtube?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          email?: string | null
          follower_count?: number | null
          id?: string
          instagram?: string | null
          is_subscribed?: boolean | null
          joined_date?: string | null
          linkedin?: string | null
          location?: string | null
          name?: string | null
          post_consistency_months?: number | null
          twitter?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
          youtube?: string | null
        }
        Relationships: []
      }
      tokens: {
        Row: {
          associated_token_account: string | null
          authorities: Json | null
          created_at: string | null
          decimals: number
          description: string | null
          id: string
          logo_url: string | null
          metadata_uri: string | null
          mint_address: string
          name: string
          network: string
          status: string
          supply: number
          symbol: string
          transaction_signature: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          associated_token_account?: string | null
          authorities?: Json | null
          created_at?: string | null
          decimals?: number
          description?: string | null
          id?: string
          logo_url?: string | null
          metadata_uri?: string | null
          mint_address: string
          name: string
          network?: string
          status?: string
          supply?: number
          symbol: string
          transaction_signature?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          associated_token_account?: string | null
          authorities?: Json | null
          created_at?: string | null
          decimals?: number
          description?: string | null
          id?: string
          logo_url?: string | null
          metadata_uri?: string | null
          mint_address?: string
          name?: string
          network?: string
          status?: string
          supply?: number
          symbol?: string
          transaction_signature?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
