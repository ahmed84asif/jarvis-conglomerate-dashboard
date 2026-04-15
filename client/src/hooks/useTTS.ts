import { useCallback, useRef, useState } from "react";

export interface UseTTSOptions {
  accent?: "british" | "american" | "australian";
  speed?: number;
  pitch?: number;
}

export function useTTS(options: UseTTSOptions = {}) {
  const {
    accent = "british",
    speed = 0.9, // Slightly slower for butler-like delivery
    pitch = 0.95, // Slightly lower pitch for authority
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(
    (text: string) => {
      // Cancel any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      // Clean text for better pronunciation
      const cleanText = text
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/`/g, "")
        .replace(/\n\n/g, ". ")
        .replace(/\n/g, " ")
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Set voice properties
      utterance.rate = speed;
      utterance.pitch = pitch;
      utterance.volume = 1;

      // Select British English voice
      const voices = window.speechSynthesis.getVoices();
      const britishVoice = voices.find(
        (voice) =>
          voice.lang.includes("en-GB") ||
          voice.name.includes("British") ||
          voice.name.includes("Google UK English")
      );

      if (britishVoice) {
        utterance.voice = britishVoice;
      }

      // Event handlers
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [speed, pitch]
  );

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsSpeaking(false);
  }, []);

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
    }
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isPlaying,
    isSpeaking,
  };
}
