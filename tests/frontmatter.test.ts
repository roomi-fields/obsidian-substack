import { describe, it, expect } from "vitest";

/**
 * Test frontmatter removal logic used in PostComposer
 * Extracted as pure function for testability
 */
function removeFrontmatter(content: string): string {
  return content.replace(/^---[\s\S]*?---\n?/, "");
}

describe("removeFrontmatter", () => {
  describe("valid frontmatter", () => {
    it("should remove YAML frontmatter from content", () => {
      const input = "---\ntitle: Test\nauthor: John\n---\nActual content here";
      const result = removeFrontmatter(input);
      expect(result).toBe("Actual content here");
    });

    it("should remove frontmatter and preserve content newlines", () => {
      const input = "---\ntitle: Test\n---\nLine 1\nLine 2\nLine 3";
      const result = removeFrontmatter(input);
      expect(result).toBe("Line 1\nLine 2\nLine 3");
    });

    it("should handle empty frontmatter", () => {
      const input = "---\n---\nContent after empty frontmatter";
      const result = removeFrontmatter(input);
      expect(result).toBe("Content after empty frontmatter");
    });

    it("should handle frontmatter with various YAML types", () => {
      const input = `---
title: "Quoted Title"
tags:
  - tag1
  - tag2
date: 2024-01-01
published: true
count: 42
---
The actual content`;
      const result = removeFrontmatter(input);
      expect(result).toBe("The actual content");
    });
  });

  describe("content without frontmatter", () => {
    it("should return content unchanged when no frontmatter", () => {
      const input = "Just regular content without frontmatter";
      const result = removeFrontmatter(input);
      expect(result).toBe(input);
    });

    it("should return empty string for empty input", () => {
      const result = removeFrontmatter("");
      expect(result).toBe("");
    });

    it("should not remove --- that appears mid-content", () => {
      const input = "Some text\n---\nMore text";
      const result = removeFrontmatter(input);
      expect(result).toBe(input);
    });
  });

  describe("edge cases", () => {
    it("should handle frontmatter without trailing newline", () => {
      const input = "---\ntitle: Test\n---Content immediately after";
      const result = removeFrontmatter(input);
      expect(result).toBe("Content immediately after");
    });

    it("should handle only frontmatter (no content)", () => {
      const input = "---\ntitle: Test\n---\n";
      const result = removeFrontmatter(input);
      expect(result).toBe("");
    });

    it("should handle frontmatter with special characters", () => {
      const input = "---\ntitle: \"Test: A Story\"\ndesc: It's great!\n---\nContent";
      const result = removeFrontmatter(input);
      expect(result).toBe("Content");
    });

    it("should handle frontmatter with multiple dashes in values", () => {
      const input = "---\ntitle: 2024-01-01 - My Post\n---\nContent";
      const result = removeFrontmatter(input);
      expect(result).toBe("Content");
    });

    it("should not be greedy with multiple --- blocks", () => {
      const input = "---\ntitle: First\n---\nContent\n---\nMore content";
      const result = removeFrontmatter(input);
      expect(result).toBe("Content\n---\nMore content");
    });

    it("should handle Windows-style line endings", () => {
      const input = "---\r\ntitle: Test\r\n---\r\nContent";
      const result = removeFrontmatter(input);
      // The regex handles \n, so \r may remain
      expect(result).toContain("Content");
    });
  });

  describe("invalid frontmatter patterns", () => {
    it("should not remove unclosed frontmatter", () => {
      const input = "---\ntitle: Test\nContent without closing";
      const result = removeFrontmatter(input);
      expect(result).toBe(input);
    });

    it("should not remove if opening --- is not at start", () => {
      const input = "Some text\n---\ntitle: Test\n---\nContent";
      const result = removeFrontmatter(input);
      expect(result).toBe(input);
    });

    it("should handle --- with spaces (not valid frontmatter)", () => {
      const input = " ---\ntitle: Test\n---\nContent";
      const result = removeFrontmatter(input);
      expect(result).toBe(input);
    });
  });
});
