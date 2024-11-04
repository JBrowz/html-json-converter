import { JSDOM } from "jsdom";

export interface HTMLNode {
	tag: string;
	attributes?: Record<string, string>;
	children?: (HTMLNode | string)[];
}

export enum HTMLElementType {
	NORMAL = "normal",
	VOID = "void",
	RAW_TEXT = "raw-text",
	FOREIGN = "foreign",
}

const NODE_TYPES = {
	ELEMENT_NODE: 1,
	TEXT_NODE: 3,
} as const;

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

		// Void elements
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

/**
 * Class to convert HTML to JSON and vice versa (Server-side)
 * @param useTab - Use tabs for indentation (default: true)
 * @param tabSize - Number of spaces per tab (default: 1)
 */

export class HTMLJSONConverter {
	protected static readonly DOCUMENT_INDICATORS = ["<html", "<?xml"];
	protected readonly useTab: boolean;
	protected readonly tabSize: number;
	protected readonly elementTypeMap: ElementTypeMap;

	constructor(useTab = true, tabSize = 1) {
		this.useTab = useTab;
		this.tabSize = tabSize;
		this.elementTypeMap = new ElementTypeMap();
	}

	/**
	 * Convert HTML string to JSON
	 * @param html - HTML string
	 */

	toJSON(html: string): HTMLNode {
		const trimmedHtml = html.trim();

		if (!trimmedHtml) {
			throw new Error("No HTML element found");
		}

		// Remove DOCTYPE if present to avoid treating it as a full document
		const htmlWithoutDoctype = trimmedHtml.replace(/<!DOCTYPE[^>]*>/i, "").trim();

		const isFullDocument = HTMLJSONConverter.DOCUMENT_INDICATORS.some((indicator) =>
			htmlWithoutDoctype.toLowerCase().startsWith(indicator.toLowerCase()),
		);

		const dom = new JSDOM(htmlWithoutDoctype);
		const { documentElement, body, head } = dom.window.document;

		if (isFullDocument && documentElement?.tagName.toLowerCase() === "html") {
			return this.elementToJSON(documentElement);
		}

		// For fragments or DOCTYPE + single element, look for first meaningful element
		const firstElement = body.firstElementChild || head.firstElementChild;
		if (!firstElement) {
			throw new Error("No HTML element found");
		}

		return this.elementToJSON(firstElement);
	}

	/**
	 * Convert JSON to HTML string
	 * @param node - HTMLNode | string
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

	protected getIndent(level: number): string {
		return this.useTab ? "\t".repeat(level * this.tabSize) : " ".repeat(level * this.tabSize * 2);
	}

	protected elementToJSON(element: Element): HTMLNode {
		const node: HTMLNode = {
			tag: element.tagName.toLowerCase(),
		};

		this.processAttributes(element, node);
		this.processChildren(element, node);

		return node;
	}

	protected processAttributes(element: Element, node: HTMLNode): void {
		const attributes = element.attributes;
		if (attributes.length > 0) {
			node.attributes = {};
			for (const attribute of Array.from(attributes) as Attr[]) {
				if (!node.attributes) return;
				node.attributes[attribute.name] = attribute.value;
			}
		}
	}

	protected processChildren(element: Element, node: HTMLNode): void {
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


/**
 * Class to convert HTML to JSON and vice versa (Client-side)
 */
export class ClientHTMLJSONConverter extends HTMLJSONConverter {
    private readonly parser: DOMParser;

    constructor(useTab = true, tabSize = 1) {
        super(useTab, tabSize);
        this.parser = new DOMParser();
    }

    override toJSON(html: string): HTMLNode {
        const trimmedHtml = html.trim();

        if (!trimmedHtml) {
            throw new Error("No HTML element found");
        }

        const htmlWithoutDoctype = trimmedHtml.replace(/<!DOCTYPE[^>]*>/i, "").trim();

        const isFullDocument = HTMLJSONConverter.DOCUMENT_INDICATORS.some((indicator) =>
            htmlWithoutDoctype.toLowerCase().startsWith(indicator.toLowerCase())
        );

        const doc = this.parser.parseFromString(htmlWithoutDoctype, "text/html");
        const { documentElement, body, head } = doc;

        if (isFullDocument && documentElement?.tagName.toLowerCase() === "html") {
            return this.elementToJSON(documentElement);
        }

        const firstElement = body.firstElementChild || head.firstElementChild;
        if (!firstElement) {
            throw new Error("No HTML element found");
        }

        return this.elementToJSON(firstElement);
    }

    protected override elementToJSON(element: Element): HTMLNode {
        const node: HTMLNode = {
            tag: element.tagName.toLowerCase(),
        };

        this.processAttributes(element, node);
        this.processChildren(element, node);

        return node;
    }

    protected override processAttributes(element: Element, node: HTMLNode): void {
        const attributes = element.attributes;
        if (attributes.length > 0) {
            node.attributes = {};
            for (const attribute of Array.from(attributes)) {
                if (!node.attributes) return;
                node.attributes[attribute.name] = attribute.value;
            }
        }
    }

    protected override processChildren(element: Element, node: HTMLNode): void {
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

        const childNodes = element.childNodes;

        if (childNodes.length > 0) {
            node.children = [];

            for (const child of Array.from(childNodes)) {
                if (child.nodeType === Node.TEXT_NODE) {
                    const text = child.textContent?.trim();
                    if (text) {
                        node.children.push(text);
                    }
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    node.children.push(this.elementToJSON(child as Element));
                }
            }

            if (node.children.length === 0) {
                node.children = undefined;
            }
        }
    }
}