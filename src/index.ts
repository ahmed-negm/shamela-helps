import fs from "fs/promises";
import { getShamelaContent } from "./shamelaUtils";
import { parseHadithMarkdown, replaceSymbols, toArabicDigits } from "./hadithUtils";

const bukhari = "البخاري";
const chapterId = 6;
const chapterName = "كتاب الوضوء";

async function main() {
  const content = await getShamelaContent(1284, 361, 386);

  const hadithJson = parseHadithMarkdown(content);

  for (const hadith of hadithJson) {
    const { hadithId, chapterId, hadithText } = hadith;
    const md = `---
type: hadith
book_name: ${bukhari}
chapter_name: ${chapterName}
chapter_id: ${chapterId}
subchapter_id: ${chapterId}
hadith_id: ${hadithId}
---
${replaceSymbols(hadithText)}
`;
    await fs.writeFile(`../Zettelkasten/Sunnah/صحيح البخاري/الأحاديث/${bukhari}-${toArabicDigits(hadithId)}.md`, md);
  }

  console.log(`Processed from ${hadithJson[0].hadithId} to ${hadithJson[hadithJson.length - 1].hadithId} hadiths from Shamela book ${chapterId}.`);
}

main().catch(console.error);
