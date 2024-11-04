import { describe, it, expect, beforeEach, test } from "vitest";
import { HTMLJSONConverter } from "./index.js";
import { ClientHTMLJSONConverter } from "./index.js";

describe("HTMLJSONConverter", () => {
	const converter = new HTMLJSONConverter(true, 1);

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

		it("should handle void elements", () => {
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
			expect(typeof result?.children?.[0] === "object" && result.children[0].tag).toBe("h1");
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

		it("should handle void elements", () => {
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
				// Should extract first meaningful element or html element
				expect(result.tag).toBe("html");
				expect(result.children?.[0]).toBeDefined();
			});

			it("should process document fragments normally", () => {
				const html = "<main><article>Content</article></main>";
				const result = converter.toJSON(html);
				expect(result.tag).toBe("main");
				expect(typeof result.children?.[0] === "object" && result.children[0].tag).toBe("article");
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


describe('ClientHTMLJSONConverter', () => {
    let converter: ClientHTMLJSONConverter;

    beforeEach(() => {
        converter = new ClientHTMLJSONConverter();
    });

    test('converts simple HTML to JSON', () => {
        const html = '<div class="test">Hello World</div>';
        const expected = {
            tag: 'div',
            attributes: { class: 'test' },
            children: ['Hello World']
        };

        const result = converter.toJSON(html);
        expect(result).toEqual(expected);
    });

    test('converts nested HTML to JSON', () => {
        const html = `
            <div class="container">
                <h1>Title</h1>
                <p>Paragraph</p>
            </div>
        `;
        
        const result = converter.toJSON(html);
        expect(result).toEqual({
            tag: 'div',
            attributes: { class: 'container' },
            children: [
                {
                    tag: 'h1',
                    children: ['Title']
                },
                {
                    tag: 'p',
                    children: ['Paragraph']
                }
            ]
        });
    });

    test('converts void elements correctly', () => {
        const html = '<img src="test.jpg" alt="test"/>';
        const result = converter.toJSON(html);
        expect(result).toEqual({
            tag: 'img',
            attributes: {
                src: 'test.jpg',
                alt: 'test'
            }
        });
    });

    test('handles HTML to JSON to HTML roundtrip', () => {
        const originalHtml = '<div class="test"><p>Hello</p></div>';
        const json = converter.toJSON(originalHtml);
        const html = converter.toHTML(json).trim();
        
        // Convert both back to JSON to compare (since HTML whitespace might differ)
        const originalJson = converter.toJSON(originalHtml);
        const finalJson = converter.toJSON(html);
        
        expect(finalJson).toEqual(originalJson);
    });

    test('handles malformed HTML', () => {
        const html = '<div>Unclosed div';
        expect(() => converter.toJSON(html)).not.toThrow();
    });

    test('throws error for empty input', () => {
        expect(() => converter.toJSON('')).toThrow('No HTML element found');
    });
});