import { describe, it, expect } from "bun:test";
import { frontmatterSchema } from "@/lib/validators/content.schema";

describe("Content Schema", () => {
  it("should validate valid frontmatter", () => {
    const validData = {
      title: "Test Post",
      description: "A test post",
      date: "2024-01-01",
      tags: ["test", "demo"],
    };

    const result = frontmatterSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid frontmatter", () => {
    const invalidData = {
      description: "Missing title",
    };

    const result = frontmatterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
