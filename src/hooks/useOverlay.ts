"use client";

import { useState, useEffect } from "react";

interface OverlaySettingsData {
  height: number;
  offset: number;
  opacity: number;
  blur: number;
}

interface UseOverlayReturn {
  height: number;
  offset: number;
  opacity: number;
  blur: number;
  loading: boolean;
  error: string | null;
}

const DEFAULT_OVERLAY_SETTINGS = {
  height: 55,
  offset: 0,
  opacity: 0.95,
  blur: 8,
};

export function useOverlay(setId: string): UseOverlayReturn {
  const [settings, setSettings] = useState<OverlaySettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/overlay?setId=${setId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch overlay settings");
        }

        const result = await response.json();
        if (result.success && result.data) {
          setSettings(result.data);
        } else {
          setSettings(null);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setSettings(null);
      } finally {
        setLoading(false);
      }
    };

    if (setId) {
      fetchSettings();
    }
  }, [setId]);

  return {
    height: settings?.height ?? DEFAULT_OVERLAY_SETTINGS.height,
    offset: settings?.offset ?? DEFAULT_OVERLAY_SETTINGS.offset,
    opacity: settings?.opacity ?? DEFAULT_OVERLAY_SETTINGS.opacity,
    blur: settings?.blur ?? DEFAULT_OVERLAY_SETTINGS.blur,
    loading,
    error,
  };
}
