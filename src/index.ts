import fs from "fs/promises";
import { getShamelaContent } from "./shamelaUtils";

async function main() {
  const content = await getShamelaContent(1284, 167, 170);
  await fs.writeFile("./dist/output.md", content);
  console.log("Markdown content written to ./dist/output.md");
}

main().catch(console.error);