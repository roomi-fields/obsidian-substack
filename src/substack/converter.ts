/**
 * Markdown to Substack JSON converter
 * Adapted from substack-mcp-plus Python implementation
 */

import {
  TextContent,
  ParagraphBlock,
  HeaderBlock,
  HeaderType,
  BulletedListBlock,
  OrderedListBlock,
  CodeBlock,
  BlockquoteBlock,
  ImageBlock,
  HorizontalRuleBlock,
  SubstackBlock,
  SubstackDocument,
} from "./types";

// Escape sequences for protected characters
const ESCAPED_ASTERISK = "\x00ESCAPED_ASTERISK\x00";
const ESCAPED_BRACKET_OPEN = "\x00ESCAPED_BRACKET_OPEN\x00";
const ESCAPED_BRACKET_CLOSE = "\x00ESCAPED_BRACKET_CLOSE\x00";

/**
 * Builder class for creating Substack JSON blocks
 */
class BlockBuilder {
  paragraph(content: string | TextContent[]): ParagraphBlock {
    if (typeof content === "string") {
      return {
        type: "paragraph",
        content: [{ type: "text", content }],
      };
    }
    return { type: "paragraph", content };
  }

  header(content: string, level: number): HeaderBlock {
    if (level < 1 || level > 6) {
      throw new Error("Header level must be between 1 and 6");
    }

    const headerTypes: Record<number, HeaderType> = {
      1: "heading-one",
      2: "heading-two",
      3: "heading-three",
      4: "heading-four",
      5: "heading-five",
      6: "heading-six",
    };

    return {
      type: headerTypes[level] as HeaderType,
      content: [{ type: "text", content }],
    };
  }

  unorderedList(items: string[]): BulletedListBlock {
    return {
      type: "bulleted-list",
      content: items.map((item) => ({
        type: "bulleted-list-item" as const,
        content: [this.paragraph(item)],
      })),
    };
  }

  orderedList(items: string[]): OrderedListBlock {
    return {
      type: "ordered-list",
      content: items.map((item) => ({
        type: "ordered-list-item" as const,
        content: [this.paragraph(item)],
      })),
    };
  }

  codeBlock(code: string, language: string = ""): CodeBlock {
    return {
      type: "code",
      language,
      content: code,
    };
  }

  blockquote(content: string): BlockquoteBlock {
    return {
      type: "blockquote",
      content: [this.paragraph(content)],
    };
  }

  image(src: string, alt: string, caption: string = ""): ImageBlock {
    return {
      type: "captioned-image",
      src,
      alt,
      caption,
    };
  }

  link(text: string, href: string): TextContent {
    return {
      type: "text",
      content: text,
      marks: [{ type: "link", href }],
    };
  }

  horizontalRule(): HorizontalRuleBlock {
    return { type: "hr" };
  }

  text(content: string, marks?: Array<"strong" | "em" | "code">): TextContent {
    const textObj: TextContent = { type: "text", content };
    if (marks && marks.length > 0) {
      textObj.marks = marks.map((mark) => ({ type: mark }));
    }
    return textObj;
  }
}

/**
 * Converts Markdown text to Substack JSON block format
 */
export class MarkdownConverter {
  private builder: BlockBuilder;

  constructor() {
    this.builder = new BlockBuilder();
  }

  /**
   * Convert markdown text to Substack document format
   */
  convert(markdown: string): SubstackDocument {
    const blocks = this.convertToBlocks(markdown);
    return {
      type: "doc",
      content: blocks,
    };
  }

  /**
   * Convert markdown text to Substack JSON blocks
   */
  convertToBlocks(markdown: string): SubstackBlock[] {
    if (!markdown || !markdown.trim()) {
      return [];
    }

    const blocks: SubstackBlock[] = [];
    const lines = markdown.split("\n");
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      if (line === undefined) {
        i++;
        continue;
      }

      // Skip empty lines
      if (!line.trim()) {
        i++;
        continue;
      }

      // Check for code blocks
      if (line.trim().startsWith("```")) {
        const result = this.parseCodeBlock(lines, i);
        if (result.block) {
          blocks.push(result.block);
        }
        i = result.nextIndex;
        continue;
      }

      // Check for headers
      if (line.startsWith("#")) {
        const block = this.parseHeader(line);
        if (block) {
          blocks.push(block);
          i++;
          continue;
        }
      }

      // Check for horizontal rule
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
        blocks.push(this.builder.horizontalRule());
        i++;
        continue;
      }

      // Check for blockquote
      if (line.startsWith(">")) {
        const result = this.parseBlockquote(lines, i);
        if (result.block) {
          blocks.push(result.block);
        }
        i = result.nextIndex;
        continue;
      }

      // Check for lists
      if (/^(\*|-|\+|\d+\.)\s/.test(line.trim())) {
        const result = this.parseList(lines, i);
        if (result.block) {
          blocks.push(result.block);
        }
        i = result.nextIndex;
        continue;
      }

      // Default to paragraph
      const result = this.parseParagraph(lines, i);
      if (result.block) {
        blocks.push(result.block);
      }
      i = result.nextIndex;
    }

    return blocks;
  }

  private parseHeader(line: string): HeaderBlock | null {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match && match[1] && match[2]) {
      const level = match[1].length;
      const content = match[2].trim();
      return this.builder.header(content, level);
    }
    return null;
  }

  private parseCodeBlock(
    lines: string[],
    start: number
  ): { block: CodeBlock | null; nextIndex: number } {
    const line = lines[start];
    if (!line || !line.trim().startsWith("```")) {
      return { block: null, nextIndex: start + 1 };
    }

    // Extract language if present
    const language = line.trim().slice(3).trim();

    // Find the closing ```
    const codeLines: string[] = [];
    let i = start + 1;
    while (i < lines.length) {
      const currentLine = lines[i];
      if (currentLine !== undefined && currentLine.trim() === "```") {
        const code = codeLines.join("\n");
        return { block: this.builder.codeBlock(code, language), nextIndex: i + 1 };
      }
      codeLines.push(currentLine ?? "");
      i++;
    }

    // If no closing found, treat as paragraph
    return { block: null, nextIndex: start + 1 };
  }

  private parseBlockquote(
    lines: string[],
    start: number
  ): { block: BlockquoteBlock | null; nextIndex: number } {
    const quoteLines: string[] = [];
    let i = start;

    while (i < lines.length) {
      const line = lines[i];
      if (!line || !line.trim().startsWith(">")) {
        break;
      }
      const content = line.trim().slice(1).trim();
      quoteLines.push(content);
      i++;
    }

    if (quoteLines.length > 0) {
      const quoteText = quoteLines.join(" ");
      return { block: this.builder.blockquote(quoteText), nextIndex: i };
    }

    return { block: null, nextIndex: start + 1 };
  }

  private parseList(
    lines: string[],
    start: number
  ): { block: BulletedListBlock | OrderedListBlock | null; nextIndex: number } {
    const firstLine = lines[start];
    if (!firstLine) {
      return { block: null, nextIndex: start + 1 };
    }

    // Determine list type
    const isOrdered = /^\d+\.\s/.test(firstLine.trim());

    const items: string[] = [];
    let i = start;

    while (i < lines.length) {
      const line = lines[i];
      if (line === undefined) {
        i++;
        continue;
      }

      const trimmedLine = line.trim();
      if (!trimmedLine) {
        // Empty line might end the list
        const nextLine = lines[i + 1];
        if (nextLine === undefined || !/^(\*|-|\+|\d+\.)\s/.test(nextLine.trim())) {
          break;
        }
        i++;
        continue;
      }

      // Check if this line is a list item
      let match: RegExpMatchArray | null;
      if (isOrdered) {
        match = trimmedLine.match(/^\d+\.\s+(.+)$/);
      } else {
        match = trimmedLine.match(/^(\*|-|\+)\s+(.+)$/);
      }

      if (match) {
        const content = isOrdered ? match[1] : match[2];
        if (content) {
          items.push(content);
        }
        i++;
      } else {
        break;
      }
    }

    if (items.length > 0) {
      if (isOrdered) {
        return { block: this.builder.orderedList(items), nextIndex: i };
      } else {
        return { block: this.builder.unorderedList(items), nextIndex: i };
      }
    }

    return { block: null, nextIndex: start + 1 };
  }

  private parseParagraph(
    lines: string[],
    start: number
  ): { block: ParagraphBlock | ImageBlock | null; nextIndex: number } {
    const paragraphLines: string[] = [];
    let i = start;

    while (i < lines.length) {
      const line = lines[i];
      if (line === undefined) {
        break;
      }

      const trimmedLine = line.trim();

      // Stop at empty lines or special syntax
      if (
        !trimmedLine ||
        line.startsWith("#") ||
        line.startsWith(">") ||
        trimmedLine.startsWith("```") ||
        /^(\*|-|\+|\d+\.)\s/.test(trimmedLine) ||
        /^(-{3,}|\*{3,}|_{3,})$/.test(trimmedLine)
      ) {
        break;
      }

      paragraphLines.push(line);
      i++;
    }

    if (paragraphLines.length > 0) {
      const text = paragraphLines.join(" ");

      // Check for images first
      const imgMatch = text.trim().match(/^!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]+)")?\)$/);
      if (imgMatch) {
        const altText = imgMatch[1] ?? "";
        const src = imgMatch[2] ?? "";
        const caption = imgMatch[3] ?? "";
        return { block: this.builder.image(src, altText, caption), nextIndex: i };
      }

      // Parse inline formatting
      const content = this.parseInlineFormatting(text);
      return { block: this.builder.paragraph(content), nextIndex: i };
    }

    return { block: null, nextIndex: start + 1 };
  }

  private parseInlineFormatting(text: string): TextContent[] {
    // Handle escaped characters
    let processedText = text
      .replace(/\\\*/g, ESCAPED_ASTERISK)
      .replace(/\\\[/g, ESCAPED_BRACKET_OPEN)
      .replace(/\\\]/g, ESCAPED_BRACKET_CLOSE);

    const elements: TextContent[] = [];
    let remaining = processedText;

    const patterns: Array<{ regex: RegExp; type: string }> = [
      { regex: /\*\*\*([^*]+)\*\*\*/, type: "bold_italic" },
      { regex: /\*\*([^*]+)\*\*/, type: "bold" },
      { regex: /\*([^*]+)\*/, type: "italic" },
      { regex: /\[([^\]]+)\]\(([^)]+)\)/, type: "link" },
      { regex: /`([^`]+)`/, type: "code" },
    ];

    while (remaining) {
      let earliestPos = remaining.length;
      let nextMatch: RegExpExecArray | null = null;
      let nextType: string | null = null;

      for (const { regex, type } of patterns) {
        const match = regex.exec(remaining);
        if (match && match.index < earliestPos) {
          earliestPos = match.index;
          nextMatch = match;
          nextType = type;
        }
      }

      if (nextMatch && nextType) {
        // Add text before the match
        if (nextMatch.index > 0) {
          const plainText = remaining.slice(0, nextMatch.index);
          elements.push(this.restoreEscapedChars({ type: "text", content: plainText }));
        }

        // Add the formatted element
        switch (nextType) {
          case "bold_italic":
            elements.push(
              this.restoreEscapedChars(this.builder.text(nextMatch[1] ?? "", ["strong", "em"]))
            );
            break;
          case "bold":
            elements.push(
              this.restoreEscapedChars(this.builder.text(nextMatch[1] ?? "", ["strong"]))
            );
            break;
          case "italic":
            elements.push(
              this.restoreEscapedChars(this.builder.text(nextMatch[1] ?? "", ["em"]))
            );
            break;
          case "link":
            elements.push(
              this.restoreEscapedChars(this.builder.link(nextMatch[1] ?? "", nextMatch[2] ?? ""))
            );
            break;
          case "code":
            elements.push(
              this.restoreEscapedChars(this.builder.text(nextMatch[1] ?? "", ["code"]))
            );
            break;
        }

        remaining = remaining.slice(nextMatch.index + nextMatch[0].length);
      } else {
        // No more formatting, add the rest as plain text
        elements.push(this.restoreEscapedChars({ type: "text", content: remaining }));
        break;
      }
    }

    return elements.length > 0 ? elements : [{ type: "text", content: "" }];
  }

  private restoreEscapedChars(element: TextContent): TextContent {
    if (element.content) {
      element.content = element.content
        .replace(new RegExp(ESCAPED_ASTERISK, "g"), "*")
        .replace(new RegExp(ESCAPED_BRACKET_OPEN, "g"), "[")
        .replace(new RegExp(ESCAPED_BRACKET_CLOSE, "g"), "]");
    }
    return element;
  }
}
