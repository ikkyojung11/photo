import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { FilterConfig } from "./colorGrading";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.warn("Failed to initialize Supabase client", e);
  }
}

export function isSupabaseConfigured(): boolean {
  return !!supabase;
}

export interface UserPreset {
  id: string;
  name: string;
  config: FilterConfig;
  created_at: string;
  is_custom?: boolean;
}

const LOCAL_STORAGE_KEY = "sakura_studio_custom_presets";

export function getLocalPresets(): UserPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to read local presets", e);
    return [];
  }
}

export function saveLocalPreset(name: string, config: FilterConfig): UserPreset {
  const newPreset: UserPreset = {
    id: `local-${Date.now()}`,
    name,
    config,
    created_at: new Date().toISOString(),
    is_custom: true,
  };
  const list = getLocalPresets();
  list.unshift(newPreset);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Failed to save local preset", e);
  }
  return newPreset;
}

export function deleteLocalPreset(id: string) {
  const list = getLocalPresets().filter((p) => p.id !== id);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Failed to delete local preset", e);
  }
}

export async function fetchCloudPresets(): Promise<UserPreset[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("presets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) {
      console.warn("Supabase fetch error:", error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.warn("Failed to query cloud presets", e);
    return [];
  }
}

export async function saveCloudPreset(name: string, config: FilterConfig): Promise<UserPreset | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("presets")
      .insert([{ name, config }])
      .select()
      .single();
    if (error) {
      console.warn("Supabase insert error:", error);
      return null;
    }
    return data;
  } catch (e) {
    console.warn("Failed to save to cloud", e);
    return null;
  }
}
