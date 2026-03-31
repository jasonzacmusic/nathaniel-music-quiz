"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import * as Tone from "tone";

const SALAMANDER_URL = "https://tonejs.github.io/audio/salamander/";

// Map note names to Salamander sample files (only loads a subset for faster init)
const SAMPLE_MAP: Record<string, string> = {
  A0: "A0v8.mp3",
  C1: "C1v8.mp3",
  "D#1": "Ds1v8.mp3",
  "F#1": "Fs1v8.mp3",
  A1: "A1v8.mp3",
  C2: "C2v8.mp3",
  "D#2": "Ds2v8.mp3",
  "F#2": "Fs2v8.mp3",
  A2: "A2v8.mp3",
  C3: "C3v8.mp3",
  "D#3": "Ds3v8.mp3",
  "F#3": "Fs3v8.mp3",
  A3: "A3v8.mp3",
  C4: "C4v8.mp3",
  "D#4": "Ds4v8.mp3",
  "F#4": "Fs4v8.mp3",
  A4: "A4v8.mp3",
  C5: "C5v8.mp3",
  "D#5": "Ds5v8.mp3",
  "F#5": "Fs5v8.mp3",
  A5: "A5v8.mp3",
  C6: "C6v8.mp3",
  "D#6": "Ds6v8.mp3",
  "F#6": "Fs6v8.mp3",
  A6: "A6v8.mp3",
  C7: "C7v8.mp3",
  "D#7": "Ds7v8.mp3",
  "F#7": "Fs7v8.mp3",
  A7: "A7v8.mp3",
  C8: "C8v8.mp3",
};

export function usePiano() {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initPiano = useCallback(async () => {
    if (samplerRef.current || isLoading) return;
    setIsLoading(true);

    await Tone.start();

    const sampler = new Tone.Sampler({
      urls: SAMPLE_MAP,
      baseUrl: SALAMANDER_URL,
      release: 1,
      onload: () => {
        setIsLoaded(true);
        setIsLoading(false);
      },
    }).toDestination();

    samplerRef.current = sampler;
  }, [isLoading]);

  const playNote = useCallback(
    (note: string, duration: string = "2n") => {
      if (samplerRef.current && isLoaded) {
        samplerRef.current.triggerAttackRelease(note, duration);
      }
    },
    [isLoaded]
  );

  const playNotes = useCallback(
    (notes: string[], duration: string = "2n") => {
      if (samplerRef.current && isLoaded) {
        samplerRef.current.triggerAttackRelease(notes, duration);
      }
    },
    [isLoaded]
  );

  const playSequence = useCallback(
    (notes: string[], interval: number = 0.5) => {
      if (samplerRef.current && isLoaded) {
        const now = Tone.now();
        notes.forEach((note, i) => {
          samplerRef.current!.triggerAttackRelease(note, "4n", now + i * interval);
        });
      }
    },
    [isLoaded]
  );

  const cleanup = useCallback(() => {
    if (samplerRef.current) {
      samplerRef.current.dispose();
      samplerRef.current = null;
      setIsLoaded(false);
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { initPiano, playNote, playNotes, playSequence, isLoaded, isLoading };
}
