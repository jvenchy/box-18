import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabaseConfig";

type WaitlistPayload = {
  audience?: "player" | "club" | "recruiter";
  email?: string;
  city?: string;
  university?: string;
  [key: string]: unknown;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const audiences = new Set(["player", "club", "recruiter"]);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = req.body as WaitlistPayload;
  const email = payload.email?.trim().toLowerCase();
  const audience = payload.audience;

  if (!email || !emailPattern.test(email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }

  if (!audience || !audiences.has(audience)) {
    return res.status(400).json({ error: "Choose player, club, or recruiter." });
  }

  const { error } = await supabase.from("waitlist").insert({
    email,
    audience,
    city: typeof payload.city === "string" ? payload.city.trim() : null,
    university: typeof payload.university === "string" ? payload.university.trim() : null,
    answers: payload,
  });

  if (error) {
    if (error.code === "23505") {
      return res.status(200).json({ ok: true, duplicate: true });
    }

    return res.status(500).json({ error: "Could not join the waitlist yet." });
  }

  return res.status(200).json({ ok: true });
}
