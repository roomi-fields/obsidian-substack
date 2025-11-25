/**
 * Substack JSON block format types
 * Adapted from substack-mcp-plus Python implementation
 */

// Text marks for inline formatting
export interface TextMark {
  type: "strong" | "em" | "code" | "link";
  href?: string; // Only for link marks
}

// Base text content element
export interface TextContent {
  type: "text";
  content: string;
  marks?: TextMark[];
}

// Paragraph block
export interface ParagraphBlock {
  type: "paragraph";
  content: TextContent[];
}

// Header blocks (h1-h6)
export type HeaderType =
  | "heading-one"
  | "heading-two"
  | "heading-three"
  | "heading-four"
  | "heading-five"
  | "heading-six";

export interface HeaderBlock {
  type: HeaderType;
  content: TextContent[];
}

// List item blocks
export interface BulletedListItemBlock {
  type: "bulleted-list-item";
  content: ParagraphBlock[];
}

export interface OrderedListItemBlock {
  type: "ordered-list-item";
  content: ParagraphBlock[];
}

// List blocks
export interface BulletedListBlock {
  type: "bulleted-list";
  content: BulletedListItemBlock[];
}

export interface OrderedListBlock {
  type: "ordered-list";
  content: OrderedListItemBlock[];
}

// Code block
export interface CodeBlock {
  type: "code";
  language: string;
  content: string;
}

// Blockquote
export interface BlockquoteBlock {
  type: "blockquote";
  content: ParagraphBlock[];
}

// Image block
export interface ImageBlock {
  type: "captioned-image";
  src: string;
  alt: string;
  caption: string;
}

// Horizontal rule
export interface HorizontalRuleBlock {
  type: "hr";
}

// Paywall marker
export interface PaywallBlock {
  type: "paywall";
}

// Union of all block types
export type SubstackBlock =
  | ParagraphBlock
  | HeaderBlock
  | BulletedListBlock
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
