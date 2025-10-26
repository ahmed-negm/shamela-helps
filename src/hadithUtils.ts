// src/parseHadithMarkdown.ts
export interface Hadith {
  chapterId: number;
  hadithId: number;
  hadithText: string;
}

export type HadithCollection = Hadith[];

/** Converts Arabic/Indic numerals (٠-٩) to standard Latin digits */
function convertArabicDigitsToNumber(arabic: string): number {
  const map: Record<string, string> = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };
  const normalized = arabic.replace(/[٠-٩]/g, (d) => map[d]);
  return Number(normalized);
}

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
export function toArabicDigits(str: string | number): string {
  return String(str).replace(/[0-9]/g, (d) => ARABIC_DIGITS[parseInt(d)]);
}

/**
 * Parses Sahih al-Bukhari markdown text into structured Hadith JSON.
 * Works for both:
 *   - "١ - بَابُ ..."   (standard chapter)
 *   - "١ - ..."         (chapter without 'باب')
 */
export function parseHadithMarkdown(markdown: string): HadithCollection {
  const results: HadithCollection = [];

  // Normalize line endings
  const text = markdown.replace(/\r\n|\r/g, "\n");

  // Updated regex — matches both "١ - بَابُ ..." and "١ - ..." headers
  const chapterRegex = /([٠-٩]+)\s*[-\.]\s*(?:بَاب[ٌُ]?\s+)?[^\n]+/g;

  // Hadith markers
  const hadithRegex = /•\s*\[([٠-٩]+)\]/g;

  // Find all matches
  const chapterMatches = Array.from(text.matchAll(chapterRegex));
  const hadithMatches = Array.from(text.matchAll(hadithRegex));

  // Track chapter positions and hadith positions
  type Marker = { type: "chapter" | "hadith"; id: number; index: number };
  const markers: Marker[] = [];

  for (const m of chapterMatches) {
    markers.push({
      type: "chapter",
      id: convertArabicDigitsToNumber(m[1]),
      index: m.index ?? 0,
    });
  }

  for (const m of hadithMatches) {
    markers.push({
      type: "hadith",
      id: convertArabicDigitsToNumber(m[1]),
      index: m.index ?? 0,
    });
  }

  // Sort markers by position
  markers.sort((a, b) => a.index - b.index);

  // Parse sequentially
  let currentChapterId: number | null = null;
  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];
    const nextMarker = markers[i + 1];
    const segmentEnd = nextMarker ? nextMarker.index : text.length;

    if (marker.type === "chapter") {
      currentChapterId = marker.id;
      continue;
    }

    if (marker.type === "hadith" && currentChapterId !== null) {
      const slice = text.slice(marker.index, segmentEnd);
      const hadithText = slice
        .replace(/•\s*\[[٠-٩]+\]/, "")
        .replace(/\s+/g, " ")
        .trim();

      results.push({
        chapterId: currentChapterId,
        hadithId: marker.id,
        hadithText,
      });
    }
  }

  return results;
}

export function replaceSymbols(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/\uFD44/g, "عليه السلام")
    .replace(/\uFD42/g, "أم المؤمنين")
    .replace(/\uFD41/g, "رضي الله عنه");
}
