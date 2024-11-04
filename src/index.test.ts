import { describe, it, expect, beforeEach, test } from "vitest";
import { type HTMLNode, ServerHTMLJSONConverter } from "./index.js"; // Adjust the import path as needed
import { ClientHTMLJSONConverter } from "./index.js";

// Tests for ServerHTMLJSONConverter
describe("ServerHTMLJSONConverter", () => {
	let converter: ServerHTMLJSONConverter;

	beforeEach(() => {
		converter = new ServerHTMLJSONConverter();
	});

	describe("HTML to JSON conversion", () => {
		it("should convert simple HTML to JSON", () => {
			const html = '<div class="test">Hello</div>';
			const expected = {
				tag: "div",
				attributes: { class: "test" },
				children: ["Hello"],
			};

			const result = converter.toJSON(html);
			expect(result).toEqual(expected);
		});

		it("should handle void elements without children", () => {
			const html = '<img src="test.jpg" alt="Test"/>';
			const expected = {
				tag: "img",
				attributes: {
					src: "test.jpg",
					alt: "Test",
				},
			};

			const result = converter.toJSON(html);
			expect(result).toEqual(expected);
		});

		it("should handle invalid HTML where void elements have children gracefully", () => {
			const html = '<img src="test.jpg">Invalid content</img>';
			const result = converter.toJSON(html);
			expect(result.tag).toBe("img");
			expect(result.children).toBeUndefined(); // No children due to parser correction
		});

		it("should handle nested elements", () => {
			const html = `
        <div>
          <h1>Title</h1>
          <p>Paragraph</p>
        </div>
      `;

			const result = converter.toJSON(html);
			expect(result.tag).toBe("div");
			expect(result.children).toHaveLength(2);
			expect(result.children?.[0]).toEqual({
				tag: "h1",
				children: ["Title"],
			});
		});
	});

	describe("JSON to HTML conversion", () => {
		it("should convert simple JSON to HTML", () => {
			const json = {
				tag: "div",
				attributes: { class: "test" },
				children: ["Hello"],
			};

			const result = converter.toHTML(json).trim();
			expect(result).toBe('<div class="test">\n\tHello\n</div>');
		});

		it("should handle void elements without children", () => {
			const json = {
				tag: "img",
				attributes: {
					src: "test.jpg",
					alt: "Test",
				},
			};

			const result = converter.toHTML(json).trim();
			expect(result).toBe('<img src="test.jpg" alt="Test"/>');
		});

		it("should throw an error if void elements have children in JSON", () => {
			const json = {
				tag: "img",
				attributes: {
					src: "test.jpg",
					alt: "Test",
				},
				children: ["Invalid content"],
			};

			expect(() => converter.toHTML(json)).toThrow("Void element <img> cannot have children.");
		});

		it("should handle nested elements", () => {
			const json = {
				tag: "div",
				children: [
					{
						tag: "h1",
						children: ["Title"],
					},
					{
						tag: "p",
						children: ["Paragraph"],
					},
				],
			};

			const result = converter.toHTML(json).trim();
			expect(result).toBe(
				`<div>
\t<h1>
\t\tTitle
\t</h1>
\t<p>
\t\tParagraph
\t</p>
</div>`,
			);
		});
	});

	describe("Enforcement of void element rules", () => {
		it("should handle invalid HTML where void elements have children gracefully", () => {
			const html = "<br>Line break</br>";
			const result = converter.toJSON(html);
			expect(result.tag).toBe("br");
			expect(result.children).toBeUndefined(); // No children due to parser correction
		});

		it("should throw an error when converting JSON with void elements having children", () => {
			const json = {
				tag: "hr",
				children: ["Invalid content"],
			};
			expect(() => converter.toHTML(json)).toThrow("Void element <hr> cannot have children.");
		});
	});

	describe("Enforcement of non-void element rules", () => {
		it("should not self-close non-void elements in HTML output", () => {
			const json = {
				tag: "div",
				attributes: { class: "container" },
				// No children
			};

			const result = converter.toHTML(json).trim();
			expect(result).toBe('<div class="container"></div>');
		});
	});

	describe("Complex conversions", () => {
		it("should preserve formatting in style tags", () => {
			const html = "<style>.test { color: red; }</style>";
			const json = converter.toJSON(html);
			const backToHtml = converter.toHTML(json);
			expect(backToHtml).toContain(".test { color: red; }");
		});

		it("should preserve script contents", () => {
			const html = "<script>console.log('test');</script>";
			const json = converter.toJSON(html);
			const backToHtml = converter.toHTML(json);
			expect(backToHtml).toContain("console.log('test');");
		});
	});

	describe("Error handling", () => {
		it("should throw error for empty HTML", () => {
			expect(() => converter.toJSON("")).toThrow("No HTML element found");
		});

		it("should throw error for whitespace HTML", () => {
			expect(() => converter.toJSON("   \n   ")).toThrow("No HTML element found");
		});

		it("should throw error for HTML comment only", () => {
			expect(() => converter.toJSON("<!-- comment -->")).toThrow("No HTML element found");
		});

		it("should throw error for text-only fragment", () => {
			expect(() => converter.toJSON("Just some text")).toThrow("No HTML element found");
		});

		it("should handle malformed HTML gracefully", () => {
			const html = "<div>Unclosed div";
			const result = converter.toJSON(html);
			expect(result.tag).toBe("div");
			expect(result.children).toEqual(["Unclosed div"]);
		});

		describe("HTML document handling", () => {
			it("should handle DOCTYPE without throwing errors", () => {
				const html = "<!DOCTYPE html><div>Test</div>";
				const result = converter.toJSON(html);
				expect(result.tag).toBe("div");
				expect(result.children).toEqual(["Test"]);
			});

			it("should handle incomplete HTML document structure", () => {
				const html = "<!DOCTYPE html><html><not-valid>Test</not-valid></html>";
				const result = converter.toJSON(html);
				expect(result.tag).toBe("html");

				// Find the <body> element within the children
				const bodyElement = (result.children as HTMLNode[]).find(
					(child) => (child as HTMLNode).tag === "body",
				) as HTMLNode;

				expect(bodyElement).toBeDefined();

				// Find the <not-valid> element within the body
				const notValidElement = (bodyElement.children as HTMLNode[]).find(
					(child) => (child as HTMLNode).tag === "not-valid",
				);

				expect(notValidElement).toEqual({
					tag: "not-valid",
					children: ["Test"],
				});
			});

			it("should process document fragments normally", () => {
				const html = "<main><article>Content</article></main>";
				const result = converter.toJSON(html);
				expect(result.tag).toBe("main");
				expect(result.children?.[0]).toEqual({
					tag: "article",
					children: ["Content"],
				});
			});
		});

		describe("Edge cases", () => {
			it("should set children to undefined when no meaningful children exist", () => {
				const html = "<div>     </div>"; // div with only whitespace
				const result = converter.toJSON(html);
				expect(result.tag).toBe("div");
				expect(result.children).toBeUndefined();
			});

			it("should handle elements with empty text nodes", () => {
				const html = "<div>\n    \t    </div>"; // div with newlines and tabs
				const result = converter.toJSON(html);
				expect(result.tag).toBe("div");
				expect(result.children).toBeUndefined();
			});
		});
	});
});

// Tests for ClientHTMLJSONConverter
describe("ClientHTMLJSONConverter", () => {
	let converter: ClientHTMLJSONConverter;

	beforeEach(() => {
		converter = new ClientHTMLJSONConverter();
	});

	test("converts simple HTML to JSON", () => {
		const html = '<div class="test">Hello World</div>';
		const expected = {
			tag: "div",
			attributes: { class: "test" },
			children: ["Hello World"],
		};

		const result = converter.toJSON(html);
		expect(result).toEqual(expected);
	});

	test("converts nested HTML to JSON", () => {
		const html = `
      <div class="container">
        <h1>Title</h1>
        <p>Paragraph</p>
      </div>
    `;

		const result = converter.toJSON(html);
		expect(result).toEqual({
			tag: "div",
			attributes: { class: "container" },
			children: [
				{
					tag: "h1",
					children: ["Title"],
				},
				{
					tag: "p",
					children: ["Paragraph"],
				},
			],
		});
	});

	test("converts void elements correctly", () => {
		const html = '<img src="test.jpg" alt="test"/>';
		const result = converter.toJSON(html);
		expect(result).toEqual({
			tag: "img",
			attributes: {
				src: "test.jpg",
				alt: "test",
			},
		});
	});

	test("handles invalid HTML where void elements have children gracefully", () => {
		const html = '<img src="test.jpg">Invalid content</img>';
		const result = converter.toJSON(html);
		expect(result.tag).toBe("img");
		expect(result.children).toBeUndefined(); // No children due to parser correction
	});

	test("handles HTML to JSON to HTML roundtrip", () => {
		const originalHtml = '<div class="test"><p>Hello</p></div>';
		const json = converter.toJSON(originalHtml);
		const html = converter.toHTML(json).trim();

		// Convert both back to JSON to compare (since HTML whitespace might differ)
		const originalJson = converter.toJSON(originalHtml);
		const finalJson = converter.toJSON(html);

		expect(finalJson).toEqual(originalJson);
	});

	test("handles malformed HTML", () => {
		const html = "<div>Unclosed div";
		expect(() => converter.toJSON(html)).not.toThrow();
		const result = converter.toJSON(html);
		expect(result.tag).toBe("div");
		expect(result.children).toEqual(["Unclosed div"]);
	});

	test("throws error for empty input", () => {
		expect(() => converter.toJSON("")).toThrow("No HTML element found");
	});
	// Add these tests to index.test.ts
	describe("ClientHTMLJSONConverter edge cases", () => {
		let converter: ClientHTMLJSONConverter;

		beforeEach(() => {
			converter = new ClientHTMLJSONConverter();
		});

		test("handles full HTML documents", () => {
			const html = "<!DOCTYPE html><html><head><title>Test</title></head><body></body></html>";
			const result = converter.toJSON(html);
			expect(result.tag).toBe("html");
		});

		test("handles head-only elements", () => {
			const html = "<head><title>Test</title></head>";
			const result = converter.toJSON(html);
			expect(result.tag).toBe("head");
		});
	});
});
