/**
 * Substack JSON block format types
 * Adapted from substack-mcp-plus Python implementation
 */

// Text marks for inline formatting (Tiptap format)
export interface TextMark {
  type: "strong" | "em" | "code" | "link";
  attrs?: {
    href?: string; // Only for link marks
  };
}

// Base text content element (Tiptap format uses "text" field, not "content")
export interface TextContent {
  type: "text";
  text: string;
  marks?: TextMark[];
}

// Hard break for line breaks within paragraphs
export interface HardBreak {
  type: "hardBreak";
}

// Content that can appear inside a paragraph
export type InlineContent = TextContent | HardBreak;

// Paragraph block
export interface ParagraphBlock {
  type: "paragraph";
  content: InlineContent[];
}

// Header blocks (h1-h6) - Tiptap format with attrs.level
export interface HeaderBlock {
  type: "heading";
  attrs: {
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };
  content: TextContent[];
}

// List item blocks (Tiptap format)
export interface ListItemBlock {
  type: "listItem";
  content: ParagraphBlock[];
}

// List blocks (Tiptap format)
export interface BulletListBlock {
  type: "bulletList";
  content: ListItemBlock[];
}

export interface OrderedListBlock {
  type: "orderedList";
  content: ListItemBlock[];
}

// Code block (Tiptap format)
export interface CodeBlock {
  type: "codeBlock";
  attrs?: {
    language?: string;
  };
  content: Array<{
    type: "text";
    text: string;
  }>;
}

// Blockquote
export interface BlockquoteBlock {
  type: "blockquote";
  content: ParagraphBlock[];
}

// Image block (Substack uses image2 type)
export interface ImageBlock {
  type: "image2";
  attrs: {
    src: string;
    fullscreen?: boolean;
    imageSize?: string;
    height?: number;
    width?: number;
    resizeWidth?: number;
    bytes?: number;
    alt?: string;
    title?: string;
    type?: string;
    href?: string;
    belowTheFold?: boolean;
    internalRedirect?: string | null;
  };
}

// Horizontal rule (Tiptap format)
export interface HorizontalRuleBlock {
  type: "horizontal_rule";
}

// Paywall marker
export interface PaywallBlock {
  type: "paywall";
}

// Union of all block types
export type SubstackBlock =
  | ParagraphBlock
  | HeaderBlock
  | BulletListBlock
  | OrderedListBlock
  | CodeBlock
  | BlockquoteBlock
  | ImageBlock
  | HorizontalRuleBlock
  | PaywallBlock;

// Document structure
export interface SubstackDocument {
  type: "doc";
  content: SubstackBlock[];
}

// Draft creation/update payload
export interface SubstackDraftPayload {
  title: string;
  subtitle?: string;
  body: SubstackDocument;
  audience?: "everyone" | "only_paid" | "founding" | "only_free";
}

// API response types
export interface SubstackDraftResponse {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  post_date: string;
  audience: string;
  draft_title: string;
  draft_subtitle: string;
  draft_body: SubstackDocument;
}

export interface SubstackPublishResponse {
  id: string;
  slug: string;
  canonical_url: string;
}

// Image upload types
export interface ImageUploadResult {
  id: string;
  url: string;
  contentType: string;
  bytes: number;
  imageWidth: number;
  imageHeight: number;
}

export interface ImageReference {
  fullMatch: string;
  alt: string;
  path: string;
  title?: string;
  isLocal: boolean;
}

export interface ImageProcessingResult {
  processedMarkdown: string;
  uploadedImages: Array<{
    originalPath: string;
    cdnUrl: string;
  }>;
  errors: Array<{
    path: string;
    error: string;
  }>;
}
