import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabaseConfig";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { data, error } = await supabase.rpc("public_waitlist_count");

  if (error) {
    return res.status(500).json({ error: "Could not load waitlist count." });
  }

  return res.status(200).json({ count: data ?? 0 });
}
