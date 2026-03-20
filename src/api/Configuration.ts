

import { SupabaseClient } from "@supabase/supabase-js";

export interface Configuration {
  supabaseClient: SupabaseClient;
}

let configuration: Configuration;

export function setConfiguration(config: Configuration) {
  configuration = config;
}

export function getConfiguration() {
  if (!configuration) {
    throw new Error('System needs to be configured.');
  }
  return configuration;
}

export function getSupabaseClient() {
  return getConfiguration().supabaseClient;
}
