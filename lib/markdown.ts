// lib/markdown.ts
// Pure-TypeScript markdown → HTML renderer. No external dependencies.
// Supports: headings, paragraphs, bold, italic, links, ul, ol, hr, blockquote.

function processInline(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Links  [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="blog-link">$1</a>');
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.split("\n");
  let html = "";
  let inUl = false;
  let inOl = false;
  let inBlockquote = false;
  let paraLines: string[] = [];

  const flushPara = () => {
    if (paraLines.length > 0) {
      const text = paraLines.join(" ").trim();
      if (text) html += `<p>${processInline(text)}</p>\n`;
      paraLines = [];
    }
  };

  const closeList = () => {
    if (inUl) { html += "</ul>\n"; inUl = false; }
    if (inOl) { html += "</ol>\n"; inOl = false; }
  };

  const closeBlockquote = () => {
    if (inBlockquote) { html += "</blockquote>\n"; inBlockquote = false; }
  };

  for (const line of lines) {
    // Heading 4
    if (line.startsWith("#### ")) {
      flushPara(); closeList(); closeBlockquote();
      html += `<h4>${processInline(line.slice(5))}</h4>\n`;
    }
    // Heading 3
    else if (line.startsWith("### ")) {
      flushPara(); closeList(); closeBlockquote();
      html += `<h3>${processInline(line.slice(4))}</h3>\n`;
    }
    // Heading 2
    else if (line.startsWith("## ")) {
      flushPara(); closeList(); closeBlockquote();
      html += `<h2>${processInline(line.slice(3))}</h2>\n`;
    }
    // Heading 1
    else if (line.startsWith("# ")) {
      flushPara(); closeList(); closeBlockquote();
      html += `<h1>${processInline(line.slice(2))}</h1>\n`;
    }
    // Horizontal rule
    else if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
      flushPara(); closeList(); closeBlockquote();
      html += "<hr />\n";
    }
    // Blockquote
    else if (line.startsWith("> ")) {
      flushPara(); closeList();
      if (!inBlockquote) { html += "<blockquote>\n"; inBlockquote = true; }
      html += `<p>${processInline(line.slice(2))}</p>\n`;
    }
    // Unordered list item
    else if (line.match(/^[-*] /)) {
      flushPara(); closeBlockquote();
      if (!inUl) { html += "<ul>\n"; inUl = true; }
      html += `<li>${processInline(line.slice(2))}</li>\n`;
    }
    // Ordered list item
    else if (line.match(/^\d+\. /)) {
      flushPara(); closeBlockquote();
      if (!inOl) { html += "<ol>\n"; inOl = true; }
      html += `<li>${processInline(line.replace(/^\d+\. /, ""))}</li>\n`;
    }
    // Blank line — end current block
    else if (line.trim() === "") {
      flushPara();
      closeList();
      closeBlockquote();
    }
    // Regular paragraph text
    else {
      if (inUl || inOl) closeList();
      if (inBlockquote) closeBlockquote();
      paraLines.push(line);
    }
  }

  flushPara();
  closeList();
  closeBlockquote();

  return html;
}
