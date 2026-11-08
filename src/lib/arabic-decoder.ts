// =============================================================================
// DocuMind - Arabic Text Reconstruction & Unicode Normalization Engine
// Fixes letter-spaced PDFs (Noor-Book, Cairo fonts, OCR glyphs),
// re-attaches tanween and diacritics, normalizes NFKC/presentation forms,
// and preserves legitimate word boundaries and spaces.
// =============================================================================

export function decodeAndFixArabicText(text: string): string {
  if (!text) return "";

  // 1. Normalize presentation forms (U+FB50-U+FDFF, U+FE70-U+FEFF) to standard Arabic
  let s = text.normalize("NFKC");

  // 2. Process lines to fix letter-spaced words without altering normal words
  const lines = s.split(/\r?\n/);
  const fixedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return "";

    // If the line has no Arabic letters, leave as is
    if (!/[\u0600-\u06FF]/.test(trimmed)) return trimmed;

    // Detect if this line is dominated by single-letter Arabic tokens
    const tokens = trimmed.split(/\s+/);
    const singleLetterTokens = tokens.filter(
      (t) => t.length === 1 && /[\u0600-\u06FF]/.test(t)
    );
    const ratio = singleLetterTokens.length / Math.max(1, tokens.length);

    if (ratio > 0.35) {
      // The line was extracted with letter-by-letter glyph coordinates.
      // In these PDFs, words are separated by 2+ spaces or punctuation/tabs,
      // while intra-word letters are separated by 1 space.
      const chunks = trimmed.split(/(\s{2,}|\t+|[،,.:;!؟?()\[\]"]+)/);
      const reconstructed = chunks.map((chunk) => {
        if (/^(\s{2,}|\t+|[،,.:;!؟?()\[\]"]+)$/.test(chunk)) return chunk;
        const subTokens = chunk.trim().split(/\s+/);
        if (
          subTokens.length >= 2 &&
          subTokens.every(
            (st) => st.length === 1 && /[\u0600-\u06FF\u064B-\u065F]/.test(st)
          )
        ) {
          return subTokens.join("");
        }
        return chunk.replace(
          /(?:(?<=^|\s)[\u0600-\u06FF]\s+){1,}[\u0600-\u06FF](?=$|\s)/g,
          (m) => m.replace(/\s+/g, "")
        );
      });
      return reconstructed.join(" ");
    }

    // Normal line with isolated letter-spaced sequences
    return trimmed.replace(
      /(?:(?<=^|\s)[\u0600-\u06FF]\s+){2,}[\u0600-\u06FF](?=$|\s)/g,
      (m) => m.replace(/\s+/g, "")
    );
  });

  return fixedLines
    .join("\n")
    .replace(/\s+([\u064B-\u0652])/g, "$1") // Re-attach tanween and harakat to preceding letter
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();
}
