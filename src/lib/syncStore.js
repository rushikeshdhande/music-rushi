import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase, USER_ID } from "./supabase";

let pushChain = Promise.resolve();

export const useSyncStore = create(
  persist(
    (set, get) => ({
      pins: {},
      hydrated: false,

      hydrate: async () => {
        if (!supabase) return set({ hydrated: true });
        try {
          const { data } = await supabase
            .from("user_data").select("*").eq("user_id", USER_ID).maybeSingle();
          if (data) {
            set((s) => ({
              pins: { ...s.pins, ...(data.pins || {}) },
              hydrated: true,
            }));
          } else {
            set({ hydrated: true });
          }
        } catch (e) {
          console.warn("[sync] hydrate failed:", e);
          set({ hydrated: true });
        }
      },

      _push: () => {
        if (!supabase) return Promise.resolve();
        pushChain = pushChain.then(async () => {
          const s = get();
          try {
            const { error } = await supabase.from("user_data").upsert({
              user_id: USER_ID,
              pins: s.pins,
              updated_at: new Date().toISOString(),
            });
            if (error) console.warn("[sync] push error:", error.message);
          } catch (e) {
            console.warn("[sync] push failed:", e);
          }
        });
        return pushChain;
      },

      togglePin: (id) => {
        set((s) => ({ pins: { ...s.pins, [id]: !s.pins[id] } }));
        get()._push();
      },
    }),
    {
      name: "rushi-music-sync",
      partialize: (s) => ({ pins: s.pins }),
    }
  )
);