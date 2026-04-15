import { invokeLLM } from "./_core/llm";

/**
 * Text-to-Speech service for Jarvis with British accent
 * Uses Web Speech API on client-side for minimal server overhead
 * This file provides utilities for TTS integration
 */

export interface TTSOptions {
  text: string;
  accent?: "british" | "american" | "australian";
  speed?: number; // 0.5 to 2.0
  pitch?: number; // 0.5 to 2.0
}

/**
 * Generate TTS audio URL (client-side will use Web Speech API)
 * This is a minimal server-side helper for future cloud TTS if needed
 */
export async function generateTTSUrl(options: TTSOptions): Promise<string> {
  // For now, we'll use client-side Web Speech API
  // This keeps memory usage minimal and avoids server-side TTS costs
  
  // Return a marker that client-side code will recognize
  return `tts://british-butler/${encodeURIComponent(options.text)}`;
}

/**
 * Validate text for TTS
 */
export function validateTTSText(text: string): boolean {
  if (!text || text.length === 0) return false;
  if (text.length > 5000) return false; // Limit to 5000 chars
  return true;
}

/**
 * Clean text for better TTS pronunciation
 */
export function cleanTextForTTS(text: string): string {
  return text
    .replace(/\*\*/g, "") // Remove markdown bold
    .replace(/\*/g, "") // Remove markdown italic
    .replace(/`/g, "") // Remove backticks
    .replace(/\n\n/g, ". ") // Replace double newlines with period
    .replace(/\n/g, " ") // Replace newlines with space
    .trim();
}

export default {
  generateTTSUrl,
  validateTTSText,
  cleanTextForTTS,
};
