/**
 * Markdown 轻量解析 → 可渲染块（App / H5 / 微信小程序兼容）
 */
import { sanitizeTableCellText } from '@/utils/textSanitize.js';

const HEADING_RE = /^(#{1,6})\s+(.+)$/;
const UL_ITEM_RE = /^[-*+]\s+(.+)$/;
const OL_ITEM_RE = /^\d+\.\s+(.+)$/;
const BLOCKQUOTE_RE = /^>\s?(.+)$/;
const TABLE_SEPARATOR_RE = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/;

function parseInlineSegments(text = '') {
  const segments = [];
  const source = String(text);
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match = pattern.exec(source);

  while (match) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', text: source.slice(lastIndex, match.index) });
    }
    const token = match[0];
    if (token.startsWith('`')) {
      segments.push({ type: 'code', text: token.slice(1, -1) });
    } else if (token.startsWith('**')) {
      segments.push({ type: 'bold', text: token.slice(2, -2) });
    } else if (token.startsWith('*')) {
      segments.push({ type: 'italic', text: token.slice(1, -1) });
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        segments.push({ type: 'link', text: linkMatch[1], href: linkMatch[2] });
      } else {
        segments.push({ type: 'text', text: token });
      }
    }
    lastIndex = match.index + token.length;
    match = pattern.exec(source);
  }

  if (lastIndex < source.length) {
    segments.push({ type: 'text', text: source.slice(lastIndex) });
  }

  return segments.length ? segments : [{ type: 'text', text: source }];
}

function isTableRow(line = '') {
  const trimmed = String(line).trim();
  if (!trimmed.includes('|')) {
    return false;
  }
  if (TABLE_SEPARATOR_RE.test(trimmed)) {
    return true;
  }
  const cells = parseTableRowCells(trimmed);
  return cells.length >= 2;
}

function parseTableRowCells(line = '') {
  const trimmed = String(line).trim();
  const normalized = trimmed.replace(/^\|/, '').replace(/\|$/, '');
  return normalized.split('|').map((cell) => sanitizeTableCellText(cell.trim()));
}

function parseTableBlock(text = '') {
  const lines = String(text)
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2 || !lines.every((line) => isTableRow(line))) {
    return null;
  }

  const separatorIndex = lines.findIndex((line) => TABLE_SEPARATOR_RE.test(line));
  const headerLine = lines[0];
  const bodyLines = separatorIndex >= 0 ? lines.slice(separatorIndex + 1) : lines.slice(1);

  if (!bodyLines.length && separatorIndex < 0) {
    return null;
  }

  const headers = parseTableRowCells(headerLine).map((cell) => parseInlineSegments(cell));
  const rows = bodyLines
    .filter((line) => !TABLE_SEPARATOR_RE.test(line))
    .map((line) => parseTableRowCells(line).map((cell) => parseInlineSegments(cell)));

  const columnCount = headers.length;
  const normalizedRows = rows.map((row) => {
    const next = [...row];
    while (next.length < columnCount) {
      next.push([{ type: 'text', text: '' }]);
    }
    return next.slice(0, columnCount);
  });

  return {
    type: 'table',
    headers,
    rows: normalizedRows,
  };
}

function extractEmbeddedTableLines(lines = []) {
  for (let start = 0; start < lines.length; start += 1) {
    if (!isTableRow(lines[start])) {
      continue;
    }
    let end = start;
    while (end < lines.length && isTableRow(lines[end])) {
      end += 1;
    }
    if (end - start >= 2) {
      return {
        before: lines.slice(0, start),
        tableLines: lines.slice(start, end),
        after: lines.slice(end),
      };
    }
  }
  return null;
}

function parseSimpleParagraphBlock(text = '') {
  const trimmed = String(text).trim();
  if (!trimmed) {
    return null;
  }

  const headingMatch = trimmed.match(HEADING_RE);
  if (headingMatch) {
    return {
      type: 'heading',
      level: headingMatch[1].length,
      segments: parseInlineSegments(headingMatch[2]),
    };
  }

  const quoteMatch = trimmed.match(BLOCKQUOTE_RE);
  if (quoteMatch) {
    return {
      type: 'blockquote',
      segments: parseInlineSegments(quoteMatch[1]),
    };
  }

  const lines = trimmed.split('\n');
  if (lines.length > 1 && lines.every((line) => UL_ITEM_RE.test(line.trim()))) {
    return {
      type: 'list',
      ordered: false,
      items: lines.map((line) => {
        const item = line.trim().match(UL_ITEM_RE);
        return parseInlineSegments(item?.[1] || line);
      }),
    };
  }

  if (lines.length > 1 && lines.every((line) => OL_ITEM_RE.test(line.trim()))) {
    return {
      type: 'list',
      ordered: true,
      items: lines.map((line) => {
        const item = line.trim().match(OL_ITEM_RE);
        return parseInlineSegments(item?.[1] || line);
      }),
    };
  }

  return {
    type: 'paragraph',
    segments: parseInlineSegments(trimmed),
  };
}

function parseParagraphBlock(text = '') {
  const trimmed = String(text).trim();
  if (!trimmed) {
    return null;
  }

  const tableBlock = parseTableBlock(trimmed);
  if (tableBlock) {
    return tableBlock;
  }

  return parseSimpleParagraphBlock(trimmed);
}

function parseMixedBlocks(text = '') {
  const trimmed = String(text).trim();
  if (!trimmed) {
    return [];
  }

  const tableOnly = parseTableBlock(trimmed);
  if (tableOnly) {
    return [tableOnly];
  }

  const lines = trimmed.split('\n');
  const embedded = extractEmbeddedTableLines(lines);
  if (!embedded) {
    const block = parseParagraphBlock(trimmed);
    return block ? [block] : [];
  }

  const blocks = [];
  if (embedded.before.length) {
    const beforeBlock = parseSimpleParagraphBlock(embedded.before.join('\n'));
    if (beforeBlock) {
      blocks.push(beforeBlock);
    }
  }

  const tableBlock = parseTableBlock(embedded.tableLines.join('\n'));
  if (tableBlock) {
    blocks.push(tableBlock);
  }

  if (embedded.after.length) {
    const afterBlock = parseMixedBlocks(embedded.after.join('\n'));
    blocks.push(...afterBlock);
  }

  return blocks;
}

function splitCodeFences(raw = '') {
  const blocks = [];
  const parts = String(raw).split('```');
  const hasOpenFence = parts.length % 2 === 0;

  parts.forEach((part, index) => {
    if (!part && index !== parts.length - 1) {
      return;
    }
    if (index % 2 === 1) {
      const codeText = part.replace(/^\w*\n/, '');
      blocks.push({
        type: 'code',
        text: codeText,
        partial: hasOpenFence && index === parts.length - 1,
      });
      return;
    }

    const paragraphs = part.split(/\n{2,}/);
    paragraphs.forEach((paragraph) => {
      parseMixedBlocks(paragraph).forEach((block) => {
        blocks.push(block);
      });
    });
  });

  return blocks;
}

export function parseChatContentBlocks(content = '') {
  const raw = String(content || '');
  if (!raw.trim()) {
    return [];
  }

  const blocks = splitCodeFences(raw);
  return blocks.filter((block) => {
    if (block.type === 'code') {
      return String(block.text || '').length > 0 || block.partial;
    }
    return true;
  });
}
