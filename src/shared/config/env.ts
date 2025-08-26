declare global {
  interface Window {
    __ENV__?: Record<string, string>;
  }
}

export const getEnv = (key: string, defaultValue = ""): string => {
  return window.__ENV__?.[key] || defaultValue;
};
