import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase, USER_ID } from "./supabase";

let pushChain = Promise.resolve();

export const useSyncStore = create(
  persist(
    (set, get) => ({
      favourites: {},
      pins: {},
      playlists: [],
      recent: [],
      counts: {},
      hydrated: false,

      hydrate: async () => {
        if (!supabase) return set({ hydrated: true });
        try {
          const { data } = await supabase
            .from("user_data").select("*").eq("user_id", USER_ID).maybeSingle();
          if (data) {
            set((s) => ({
              favourites: { ...s.favourites, ...(data.favourites || {}) },
              pins: { ...s.pins, ...(data.pins || {}) },
              playlists: data.playlists?.length ? data.playlists : s.playlists,
              recent: data.recent?.length ? data.recent : s.recent,
              counts: { ...s.counts, ...(data.counts || {}) },
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
              favourites: s.favourites,
              pins: s.pins,
              playlists: s.playlists,
              recent: s.recent,
              counts: s.counts,
              updated_at: new Date().toISOString(),
            });
            if (error) console.warn("[sync] push error:", error.message);
          } catch (e) {
            console.warn("[sync] push failed:", e);
          }
        });
        return pushChain;
      },

      toggleFavourite: (id) => {
        set((s) => ({ favourites: { ...s.favourites, [id]: !s.favourites[id] } }));
        get()._push();
      },

      togglePin: (id) => {
        set((s) => ({ pins: { ...s.pins, [id]: !s.pins[id] } }));
        get()._push();
      },

      addPlaylist: (pl) => {
        set((s) => ({ playlists: [...s.playlists, pl] }));
        get()._push();
      },

      removePlaylist: (id) => {
        set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) }));
        get()._push();
      },

      addSongToPlaylist: (pid, song) => {
        set((s) => ({
          playlists: s.playlists.map((p) => {
            if (p.id !== pid) return p;
            const existing = p.songs || [];
            if (existing.some((x) => x.id === song.id)) return p;
            return { ...p, songs: [...existing, song] };
          }),
        }));
        get()._push();
      },

      recordPlay: (id) => {
        set((s) => ({
          counts: { ...s.counts, [id]: (s.counts[id] || 0) + 1 },
          recent: [id, ...s.recent.filter((r) => r !== id)].slice(0, 50),
        }));
        get()._push();
      },
    }),
    {
      name: "rushi-music-sync",
      partialize: (s) => ({
        favourites: s.favourites,
        pins: s.pins,
        playlists: s.playlists,
        recent: s.recent,
        counts: s.counts,
      }),
    }
  )
);