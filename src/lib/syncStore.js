import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase, USER_ID } from "./supabase";

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
        if (!supabase) { set({ hydrated: true }); return; }
        try {
          const { data } = await supabase
            .from("user_data").select("*").eq("user_id", USER_ID).maybeSingle();
          if (data) {
            set({
              favourites: data.favourites || {},
              pins: data.pins || {},
              playlists: data.playlists || [],
              recent: data.recent || [],
              counts: data.counts || {},
              hydrated: true,
            });
          } else { set({ hydrated: true }); }
        } catch { set({ hydrated: true }); }
      },

      _push: async () => {
        if (!supabase) return;
        const s = get();
        await supabase.from("user_data").upsert({
          user_id: USER_ID,
          favourites: s.favourites,
          pins: s.pins,
          playlists: s.playlists,
          recent: s.recent,
          counts: s.counts,
          updated_at: new Date().toISOString(),
        });
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
          playlists: s.playlists.map((p) =>
            p.id === pid ? { ...p, songs: [...(p.songs || []), song] } : p
          ),
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
    { name: "rushi-music-sync" }
  )
);
