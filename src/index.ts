import fs from "fs/promises";
import { existsSync } from "fs";
import { getShamelaContent } from "./shamelaUtils";
import {
  parseHadithMarkdown,
  replaceSymbols,
  toArabicDigits,
} from "./hadithUtils";
import { bookInfo } from "./bukhari";

const bukhari = "البخاري";

async function main() {
  for (const info of bookInfo) {
    const { chapterId, chapterName, start, end } = info;

    const content = await getShamelaContent(1284, start, end);

    const hadithJson = parseHadithMarkdown(content);

    for (const hadith of hadithJson) {
      const { hadithId, subchapterId, hadithText, subChapterName } = hadith;
      const outDir = `../Zettelkasten/Sunnah/صحيح البخاري/الأحاديث`;
      const outPath = `${outDir}/${bukhari}-${toArabicDigits(hadithId)}.md`;

      if (existsSync(outPath)) {
        continue;
      }

      const md = `---
type: hadith
book_name: ${bukhari}
chapter_name: ${chapterName}
subchapter_name: ${subChapterName}
chapter_id: ${chapterId}
subchapter_id: ${subchapterId}
hadith_id: ${hadithId}
---
${replaceSymbols(hadithText)}
`;

      await fs.writeFile(outPath, md);
    }

    console.log(
      `Processed from ${hadithJson[0].hadithId} to ${
        hadithJson[hadithJson.length - 1].hadithId
      } hadiths from Shamela book ${chapterId}.`
    );
  }
}

main().catch(console.error);
