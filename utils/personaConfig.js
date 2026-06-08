/**
 * 人设模式配置读写
 */
import { DEFAULT_PERSONA_ID, isValidPersonaId } from '@/constants/persona.js';
import { SETTINGS_STORAGE_KEYS } from '@/constants/settings.js';
import { getStorageItem, setStorageItem } from '@/utils/storage.js';

const DEFAULT_CONFIG = {
  enabled: false,
  personaId: DEFAULT_PERSONA_ID,
  memoryEnabled: true,
};

function normalizeConfig(raw = {}) {
  const personaId = isValidPersonaId(raw.personaId) ? raw.personaId : DEFAULT_PERSONA_ID;
  return {
    enabled: !!raw.enabled,
    personaId,
    memoryEnabled: raw.memoryEnabled !== false,
  };
}

export function getPersonaConfig() {
  const raw = getStorageItem(SETTINGS_STORAGE_KEYS.PERSONA_CONFIG, '');
  if (!raw) {
    return { ...DEFAULT_CONFIG };
  }
  try {
    return normalizeConfig(JSON.parse(raw));
  } catch (error) {
    return { ...DEFAULT_CONFIG };
  }
}

export function savePersonaConfig(patch = {}) {
  const current = getPersonaConfig();
  const next = normalizeConfig({
    ...current,
    ...patch,
  });
  setStorageItem(SETTINGS_STORAGE_KEYS.PERSONA_CONFIG, JSON.stringify(next));
  return next;
}

export function isPersonaEnabled() {
  return getPersonaConfig().enabled;
}

export function isPersonaMemoryEnabled() {
  const config = getPersonaConfig();
  return config.enabled && config.memoryEnabled;
}

export function getActivePersonaId() {
  return getPersonaConfig().personaId;
}
