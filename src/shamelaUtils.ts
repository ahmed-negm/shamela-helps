import * as cheerio from "cheerio";

export async function getShamelaContent(
  bookId: number,
  startIndex: number,
  endIndex: number
): Promise<string> {
  let markdown = "";

  for (let index = startIndex; index <= endIndex; index++) {
    const url = `https://shamela.ws/book/${bookId}/${index}`;
    const html = await getHtmlContent(url);
    markdown +=
      (markdown.at(-1) === "" ? "\n\n" : "") + extractMarkdownFromHtml(html);
  }

  return markdown;
}

function extractMarkdownFromHtml(html: string): string {
  const data = cheerio.load(html);

  let markdown = "";

  // Convert each <p> block, excluding .hamesh
  data(".nass p").each((_: any, el: any) => {
    const $el = data(el);
    if ($el.hasClass("hamesh")) return; // Exclude hamesh

    // Remove anchor and button from text
    $el.find(".anchor, .btn_tag").remove();
    let text = $el.text().trim();

    // Bold for .c5
    $el.find(".c5").each((_: any, span: any) => {
      const spanText = data(span).text();
      text = text.replace(spanText, `**${spanText}**`);
    });

    // Superscript for .c2 (for numbers)
    $el.find(".c2").each((_: any, span: any) => {
      const spanText = data(span).text();
      text = text.replace(spanText, `(${spanText})`);
    });

    // Replace repeated brackets with a single bracket (handles (), [], {}, Arabic brackets)
    text = text
      .replace(/\(\(+/g, "(")
      .replace(/\)+/g, ")")
      .replace(/\[\[+/g, "[")
      .replace(/\]+/g, "]")
      .replace(/\{\{+/g, "{")
      .replace(/\}+/g, "}")
      // Arabic brackets: (( -> ( and )) -> )
      .replace(/\u06dd+/g, ""); // Remove Arabic end of ayah if repeated (optional)
    // For Arabic parentheses (U+FD3E, U+FD3F)
    text = text
      .replace(/[\uFD3E]{2,}/g, "\uFD3E")
      .replace(/[\uFD3F]{2,}/g, "\uFD3F");

    // Remove footer references with Arabic numerals like (١), (٢), (٣), etc.
    text = text.replace(/\([\u0660-\u0669\u06F0-\u06F9]+\)/g, '');

    markdown += `${text}\n\n`;
  });

  return markdown.trim();
}

async function getHtmlContent(url: string): Promise<string> {
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const response = await fetch(url, {
        method: "GET",
      });
      return await response.text();
    } catch (err) {
      lastError = err;
      if (attempt < 5) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }
  throw lastError;
}
