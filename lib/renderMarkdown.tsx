import { Fragment, type ReactNode } from "react";

// Deliberately tiny markdown renderer — SnapTab's legal docs use only headings,
// paragraphs, italics, and bullet lists. Pulling in a full markdown lib for
// this would be overkill (and would spend bytes on features we don't use).

export function renderMarkdown(source: string): ReactNode {
  const lines = source.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push(
      <p key={`p-${key++}`} className="text-sm leading-relaxed text-fg-muted">
        {renderInline(paragraph.join(" "))}
      </p>,
    );
    paragraph = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`ul-${key++}`} className="ml-5 list-disc space-y-1 text-sm text-fg-muted">
        {listItems.map((li, i) => (
          <li key={i}>{renderInline(li)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith("# ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <h1 key={`h-${key++}`} className="text-2xl font-black text-fg lg:text-3xl">
          {line.slice(2)}
        </h1>,
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <h2 key={`h-${key++}`} className="mt-4 text-lg font-semibold text-fg">
          {line.slice(3)}
        </h2>,
      );
      continue;
    }
    if (line.startsWith("- ")) {
      flushParagraph();
      listItems.push(line.slice(2));
      continue;
    }
    if (line === "") {
      flushParagraph();
      flushList();
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();
  flushList();

  return <Fragment>{blocks}</Fragment>;
}

// Inline: **bold**, *italic*, _italic_.
function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < text.length) {
    if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        parts.push(
          <strong key={`b-${key++}`} className="font-semibold text-fg">
            {text.slice(i + 2, end)}
          </strong>,
        );
        i = end + 2;
        continue;
      }
    }
    if (text[i] === "_" || text[i] === "*") {
      const marker = text[i];
      const end = text.indexOf(marker!, i + 1);
      if (end !== -1) {
        parts.push(
          <em key={`i-${key++}`} className="italic text-fg-muted">
            {text.slice(i + 1, end)}
          </em>,
        );
        i = end + 1;
        continue;
      }
    }
    // Accumulate plain text up to the next inline marker.
    let j = i;
    while (j < text.length && text[j] !== "*" && text[j] !== "_") j++;
    parts.push(text.slice(i, j));
    i = j;
  }
  return parts;
}
