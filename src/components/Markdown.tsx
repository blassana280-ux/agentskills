import React from "react";

function inline(text: string): React.ReactNode[] {
  const token = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g;
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = token.exec(text))) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const value = match[0];
    if (value.startsWith("**")) nodes.push(<strong key={`${match.index}-b`}>{value.slice(2, -2)}</strong>);
    else if (value.startsWith("`")) nodes.push(<code className="inline-code" key={`${match.index}-c`}>{value.slice(1, -1)}</code>);
    else if (value.startsWith("[")) {
      const linkMatch = value.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const href = linkMatch?.[2] ?? "";
      if (linkMatch && /^https?:\/\//i.test(href)) {
        nodes.push(<a href={href} target="_blank" rel="noreferrer" key={`${match.index}-a`}>{linkMatch[1]}</a>);
      } else nodes.push(linkMatch?.[1] ?? value);
    } else nodes.push(<em key={`${match.index}-i`}>{value.slice(1, -1)}</em>);
    cursor = match.index + value.length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export default function Markdown({ content }: { content: string }) {
  const blocks = content.split(/```/);
  const rendered: React.ReactNode[] = [];
  blocks.forEach((block, index) => {
    if (index % 2 === 1) {
      const newline = block.indexOf("\n");
      const language = newline >= 0 ? block.slice(0, newline).trim() : "";
      const code = newline >= 0 ? block.slice(newline + 1).replace(/\n$/, "") : block;
      rendered.push(
        <pre className="code-block" key={`code-${index}`}>
          {language && <span className="code-language">{language}</span>}
          <code>{code}</code>
        </pre>,
      );
      return;
    }
    const lines = block.trim().split("\n");
    let list: { type: "ul" | "ol"; items: string[] } | null = null;
    const flushList = (key: string) => {
      if (!list) return;
      const Tag = list.type;
      rendered.push(<Tag key={key}>{list.items.map((item, itemIndex) => <li key={itemIndex}>{inline(item)}</li>)}</Tag>);
      list = null;
    };
    lines.forEach((line, lineIndex) => {
      if (!line.trim()) {
        flushList(`list-${index}-${lineIndex}`);
        return;
      }
      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        flushList(`list-${index}-${lineIndex}`);
        const level = heading[1].length;
        const Heading = `h${level + 1}` as keyof React.JSX.IntrinsicElements;
        rendered.push(<Heading key={`h-${index}-${lineIndex}`}>{inline(heading[2])}</Heading>);
        return;
      }
      const bullet = line.match(/^\s*[-*+]\s+(.+)$/);
      const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
      if (bullet || ordered) {
        const type = bullet ? "ul" : "ol";
        if (list && list.type !== type) flushList(`list-${index}-${lineIndex}`);
        if (!list) list = { type, items: [] };
        list.items.push((bullet ?? ordered)![1]);
        return;
      }
      flushList(`list-${index}-${lineIndex}`);
      rendered.push(<p key={`p-${index}-${lineIndex}`}>{inline(line.replace(/\s{2}$/, ""))}</p>);
    });
    flushList(`list-${index}-end`);
  });
  return <div className="markdown">{rendered}</div>;
}
