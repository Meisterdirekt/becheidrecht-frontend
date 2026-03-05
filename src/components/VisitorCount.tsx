"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import type { RealtimeChannel } from "@supabase/supabase-js";

const CHANNEL_NAME = "site:visitors";

export function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const sessionIdRef = useRef<string>(typeof crypto !== "undefined" ? crypto.randomUUID() : "guest");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch("/api/auth-config", { cache: "no-store" });
        const data = await res.json();
        if (cancelled || !data?.configured || !data?.url || !data?.anonKey) return;

        const supabase = createClient(data.url, data.anonKey);
        const channel = supabase.channel(CHANNEL_NAME);

        channel.on("presence", { event: "sync" }, () => {
          if (cancelled) return;
          const state = channel.presenceState();
          const n = Object.keys(state).length;
          setCount(n);
        });

        await channel.subscribe(async (status) => {
          if (cancelled) return;
          if (status === "SUBSCRIBED") {
            await channel.track({ id: sessionIdRef.current, at: Date.now() });
          }
        });

        channelRef.current = channel;
      } catch {
        if (!cancelled) setCount(null);
      }
    }

    run();
    return () => {
      cancelled = true;
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, []);

  if (count === null) return null;

  return (
    <span className="text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase">
      {count === 0
        ? "Keine Besucher gerade"
        : count === 1
          ? "1 Besucher gerade online"
          : `${count} Besucher gerade online`}
    </span>
  );
}
