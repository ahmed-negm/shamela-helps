import fs from "fs/promises";
import { getShamelaContent } from "./shamelaUtils";
import { parseHadithMarkdown, replaceSymbols, toArabicDigits } from "./hadithUtils";

const bukhari = "البخاري";
const bookId = 2;

async function main() {
  const content = await getShamelaContent(1284, 167, 205);

  const hadithJson = parseHadithMarkdown(content);

  for (const hadith of hadithJson) {
    const { hadithId, chapterId, hadithText } = hadith;
    const md = `---
type: hadith
book_name: ${bukhari}
chapter_id: ${bookId}
subchapter_id: ${chapterId}
hadith_id: ${hadithId}
---
${replaceSymbols(hadithText)}
`;
    await fs.writeFile(`../Zettelkasten/Sunnah/صحيح البخاري/الأحاديث/${bukhari}-${toArabicDigits(hadithId)}.md`, md);
  }

  console.log(`Processed from ${hadithJson[0].hadithId} to ${hadithJson[hadithJson.length - 1].hadithId} hadiths from Shamela book ${bookId}.`);
}

main().catch(console.error);
