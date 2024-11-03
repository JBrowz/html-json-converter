import { JSDOM } from 'jsdom';
import type { HTMLNode } from './types/index.ts';
import { HTMLElementType, NODE_TYPES } from './types/index.ts';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';


class ElementTypeMap {
	private readonly elementTypes: Record<string, HTMLElementType> = {
		// Regular elements
		div: HTMLElementType.NORMAL,
		span: HTMLElementType.NORMAL,
		p: HTMLElementType.NORMAL,
		h1: HTMLElementType.NORMAL,
		h2: HTMLElementType.NORMAL,
		h3: HTMLElementType.NORMAL,
		h4: HTMLElementType.NORMAL,
		h5: HTMLElementType.NORMAL,
		h6: HTMLElementType.NORMAL,
		article: HTMLElementType.NORMAL,
		section: HTMLElementType.NORMAL,
		nav: HTMLElementType.NORMAL,
		aside: HTMLElementType.NORMAL,
		header: HTMLElementType.NORMAL,
		footer: HTMLElementType.NORMAL,
		address: HTMLElementType.NORMAL,
		main: HTMLElementType.NORMAL,
		body: HTMLElementType.NORMAL,
		html: HTMLElementType.NORMAL,
		ul: HTMLElementType.NORMAL,
		ol: HTMLElementType.NORMAL,
		li: HTMLElementType.NORMAL,
		table: HTMLElementType.NORMAL,
		tr: HTMLElementType.NORMAL,
		td: HTMLElementType.NORMAL,
		th: HTMLElementType.NORMAL,
		form: HTMLElementType.NORMAL,
		label: HTMLElementType.NORMAL,
		a: HTMLElementType.NORMAL,
		button: HTMLElementType.NORMAL,

		// Void elements (Self closing ones)
		area: HTMLElementType.VOID,
		base: HTMLElementType.VOID,
		br: HTMLElementType.VOID,
		col: HTMLElementType.VOID,
		embed: HTMLElementType.VOID,
		hr: HTMLElementType.VOID,
		img: HTMLElementType.VOID,
		input: HTMLElementType.VOID,
		link: HTMLElementType.VOID,
		meta: HTMLElementType.VOID,
		source: HTMLElementType.VOID,
		track: HTMLElementType.VOID,
		wbr: HTMLElementType.VOID,

		// Raw text elements
		script: HTMLElementType.RAW_TEXT,
		style: HTMLElementType.RAW_TEXT,
		textarea: HTMLElementType.RAW_TEXT,
		title: HTMLElementType.RAW_TEXT,

		// Foreign elements
		svg: HTMLElementType.FOREIGN,
		math: HTMLElementType.FOREIGN,
	};

	getElementType(tagName: string): HTMLElementType {
		return this.elementTypes[tagName.toLowerCase()] || HTMLElementType.NORMAL;
	}
}

export class HTMLJSONConverter {
	private readonly useTab: boolean;
	private readonly tabSize: number;
	private readonly elementTypeMap: ElementTypeMap;

	constructor(useTab = true, tabSize = 1) {
		this.useTab = useTab;
		this.tabSize = tabSize;
		this.elementTypeMap = new ElementTypeMap();
	}

	/**
	 * Converts an HTMLNode object to pretty-printed HTML string
	 */
	toHTML(node: HTMLNode | string, level = 0): string {
		if (typeof node === "string") {
			const text = node.trim();
			return text ? `${this.getIndent(level)}${text}\n` : "";
		}

		const indent = this.getIndent(level);
		let html = `${indent}<${node.tag}`;

		if (node.attributes) {
			for (const [key, value] of Object.entries(node.attributes)) {
				html += ` ${key}="${value}"`;
			}
		}

		const elementType = this.elementTypeMap.getElementType(node.tag);

		switch (elementType) {
			case HTMLElementType.VOID:
				return `${html}/>\n`;

			case HTMLElementType.RAW_TEXT:
				html += ">";
				if (node.children) {
					html += "\n";
					html += this.getIndent(level + 1);
					html += node.children.join("").trim();
					html += "\n";
					html += indent;
				}
				return `${html}</${node.tag}>\n`;

			default:
				html += ">";
				if (node.children?.length) {
					html += "\n";
					for (const child of node.children) {
						html += this.toHTML(child, level + 1);
					}
					html += indent;
				}
				return `${html}</${node.tag}>\n`;
		}
	}

	/**
	 * Converts an HTML string to HTMLNode object
	 */
	toJSON(html: string): HTMLNode {
		const dom = new JSDOM(html);
		const { documentElement } = dom.window.document;
		
		if (!documentElement) {
			throw new Error("No HTML element found");
		}
		
		return this.elementToJSON(documentElement);
	}

	private getIndent(level: number): string {
		return this.useTab ? "\t".repeat(level * this.tabSize) : " ".repeat(level * this.tabSize * 2);
	}

	private elementToJSON(element: Element): HTMLNode {
		const node: HTMLNode = {
			tag: element.tagName.toLowerCase()
		};

		this.processAttributes(element, node);
		this.processChildren(element, node);

		return node;
	}

	private processAttributes(element: Element, node: HTMLNode): void {
		const attributes = element.attributes;
		if (attributes.length > 0) {
			node.attributes = {};
			for (const attribute of Array.from(attributes) as Attr[]) {
				if (!node.attributes) return;
				node.attributes[attribute.name] = attribute.value;
			}
		}
	}

	private processChildren(element: Element, node: HTMLNode): void {
		const elementType = this.elementTypeMap.getElementType(node.tag);

		if (elementType === HTMLElementType.VOID) {
			return;
		}

		if (elementType === HTMLElementType.RAW_TEXT) {
			const text = element.textContent?.trim();
			if (text) {
				node.children = [text];
			}
			return;
		}

		const childNodes: NodeList = element.childNodes;
		
		if (childNodes.length > 0) {
			node.children = [];
			
			for (const child of Array.from(childNodes as NodeList)) {
				if (child.nodeType === NODE_TYPES.TEXT_NODE) {
					const text = (child as Text).textContent?.trim();
					if (text) {
						node.children.push(text);
					}
				} else if (child.nodeType === NODE_TYPES.ELEMENT_NODE) {
					node.children.push(this.elementToJSON(child as Element));
				}
			}
			
			if (node.children.length === 0) {
				node.children = undefined;
			}
		}
	}
}

// Example usage:
/*
const converter = new HTMLJSONConverter(true, 1);  // Use tabs with size 1

const html = `
<!DOCTYPE html>
<html>
	<head><title>Test</title></head>
	<body>
		<h1>Hello World</h1>
		<img src="test.jpg" alt="Test"/>
	</body>
</html>
`;

// Convert HTML to JSON
const json = converter.toJSON(html);
console.log(JSON.stringify(json, null, "\t"));

// Convert back to HTML
const generatedHtml = converter.toHTML(json);
console.log(generatedHtml);
*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const converter = new HTMLJSONConverter(true, 1);

// Read JSON file from utils folder and then convert it to HTML
const HtmlFilePath = path.resolve(__dirname, 'utils', 'complex_webpage.html');
const html  = fs.readFileSync(HtmlFilePath, 'utf-8');
const json = converter.toJSON(html);
fs.writeFileSync(path.resolve(__dirname, 'utils', 'complex_webpage.json'), JSON.stringify(json, null, 2));

