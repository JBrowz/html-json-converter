// Core interfaces and types
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

export interface ElementTypeConfig {
	type: HTMLElementType;
	allowChildren?: boolean;
	allowAttributes?: boolean;
}

/**
 * ConverterConfig interface to define configuration options
 * @property useTab : boolean - Use tabs for indentation
 * @property tabSize : number - Number of spaces for indentation
 * @property customElements : Record<string, ElementTypeConfig> - Custom element configurations
 */

export interface ConverterConfig {
	useTab?: boolean;
	tabSize?: number;
	customElements?: Record<string, ElementTypeConfig>;
}

const NODE_TYPES = {
	ELEMENT_NODE: 1,
	TEXT_NODE: 3,
} as const;

/**
 * ElementRegistry class to manage element configurations
 */

class ElementRegistry {
	private static instance: ElementRegistry;
	private elementConfigs: Map<string, ElementTypeConfig>;

	private readonly defaultElements: Record<string, ElementTypeConfig> = {
		a: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		abbr: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		address: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		article: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		aside: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		audio: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		b: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		bdi: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		bdo: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		blockquote: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		body: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		button: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		canvas: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		caption: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		cite: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		code: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		colgroup: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		data: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		datalist: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		dd: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		del: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		details: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		dfn: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		dialog: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		div: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		dl: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		dt: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		em: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		fieldset: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		figcaption: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		figure: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		footer: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		form: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		h1: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		h2: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		h3: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		h4: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		h5: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		h6: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		head: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		header: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		hgroup: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		html: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		i: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		iframe: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		ins: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		kbd: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		label: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		legend: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		li: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		main: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		map: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		mark: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		menu: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		meter: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		nav: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		noscript: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		object: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		ol: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		optgroup: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		option: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		output: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		p: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		picture: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		pre: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		progress: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		q: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		rp: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		rt: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		ruby: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		s: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		samp: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		section: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		select: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		small: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		span: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		strong: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		sub: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		summary: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		sup: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		table: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		tbody: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		td: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		template: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		tfoot: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		th: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		thead: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		time: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		tr: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		u: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		ul: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		var: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },
		video: { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true },

		// Void elements
		area: { type: HTMLElementType.VOID, allowChildren: false, allowAttributes: true },
		base: { type: HTMLElementType.VOID, allowChildren: false, allowAttributes: true },
		br: { type: HTMLElementType.VOID, allowChildren: false, allowAttributes: true },
		col: { type: HTMLElementType.VOID, allowChildren: false, allowAttributes: true },
		embed: { type: HTMLElementType.VOID, allowChildren: false, allowAttributes: true },
		hr: { type: HTMLElementType.VOID, allowChildren: false, allowAttributes: true },
		img: { type: HTMLElementType.VOID, allowChildren: false, allowAttributes: true },
		input: { type: HTMLElementType.VOID, allowChildren: false, allowAttributes: true },
		keygen: { type: HTMLElementType.VOID, allowChildren: false, allowAttributes: true },
		link: { type: HTMLElementType.VOID, allowChildren: false, allowAttributes: true },
		meta: { type: HTMLElementType.VOID, allowChildren: false, allowAttributes: true },
		param: { type: HTMLElementType.VOID, allowChildren: false, allowAttributes: true },
		source: { type: HTMLElementType.VOID, allowChildren: false, allowAttributes: true },
		track: { type: HTMLElementType.VOID, allowChildren: false, allowAttributes: true },
		wbr: { type: HTMLElementType.VOID, allowChildren: false, allowAttributes: true },

		// Raw text elements
		script: { type: HTMLElementType.RAW_TEXT, allowChildren: true, allowAttributes: true },
		style: { type: HTMLElementType.RAW_TEXT, allowChildren: true, allowAttributes: true },
		textarea: { type: HTMLElementType.RAW_TEXT, allowChildren: true, allowAttributes: true },
		title: { type: HTMLElementType.RAW_TEXT, allowChildren: true, allowAttributes: true },

		// Foreign elements
		svg: { type: HTMLElementType.FOREIGN, allowChildren: true, allowAttributes: true },
		math: { type: HTMLElementType.FOREIGN, allowChildren: true, allowAttributes: true },
	};

	private constructor() {
		this.elementConfigs = new Map(Object.entries(this.defaultElements));
	}

	public static getInstance(): ElementRegistry {
		if (!ElementRegistry.instance) {
			ElementRegistry.instance = new ElementRegistry();
		}
		return ElementRegistry.instance;
	}
	/**
	 * Register a new element with its configuration
	 * @param tagName : string
	 * @param config : ElementTypeConfig
	 */
	public registerElement(tagName: string, config: ElementTypeConfig): void {
		this.elementConfigs.set(tagName.toLowerCase(), config);
	}

	/**
	 * Register multiple elements with their configurations
	 * @param elements : Record<string, ElementTypeConfig>
	 */

	public registerElements(elements: Record<string, ElementTypeConfig>): void {
		for (const [tag, config] of Object.entries(elements)) {
			this.registerElement(tag, config);
		}
	}

	/**
	 * Get the configuration for an element
	 * @param tagName : string
	 * @returns ElementTypeConfig
	 */

	public getElementConfig(tagName: string): ElementTypeConfig {
		const config = this.elementConfigs.get(tagName.toLowerCase());
		return config || { type: HTMLElementType.NORMAL, allowChildren: true, allowAttributes: true };
	}

	/**
	 * Remove an element from the registry
	 * @param tagName : string
	 */

	public removeElement(tagName: string): void {
		this.elementConfigs.delete(tagName.toLowerCase());
	}

	public reset(): void {
		this.elementConfigs = new Map(Object.entries(this.defaultElements));
	}
}

/**
 * @constructor takes an optional config object of type ConverterConfig
 * @type {config} : ConverterConfig
 */

export abstract class BaseHTMLJSONConverter {
	protected static readonly DOCUMENT_INDICATORS = ["<html", "<?xml"];
	protected readonly useTab: boolean;
	protected readonly tabSize: number;
	protected readonly registry: ElementRegistry;

	constructor(config?: ConverterConfig) {
		this.useTab = config?.useTab ?? true;
		this.tabSize = config?.tabSize ?? 1;
		this.registry = ElementRegistry.getInstance();

		if (config?.customElements) {
			this.registry.registerElements(config.customElements);
		}
	}

	protected abstract parseHTML(html: string): Element;

	/**
	 *
	 * @param html : string
	 * @returns HTMLNode
	 */
	public toJSON(html: string): HTMLNode {
		const trimmedHtml = html.trim();
		if (!trimmedHtml) {
			throw new Error("No HTML element found");
		}

		const htmlWithoutDoctype = trimmedHtml.replace(/<!DOCTYPE[^>]*>/i, "").trim();
		const element = this.parseHTML(htmlWithoutDoctype);
		return this.elementToJSON(element);
	}

	/**
	 *
	 * @param node
	 * @param level (default = 0)
	 * @returns html string
	 */

	public toHTML(node: HTMLNode | string, level = 0): string {
		if (typeof node === "string") {
			const text = node.trim();
			return text ? `${this.getIndent(level)}${text}\n` : "";
		}

		const indent = this.getIndent(level);
		let html = `${indent}<${node.tag}`;

		if (node.attributes) {
			html += this.serializeAttributes(node.attributes);
		}

		const elementConfig = this.registry.getElementConfig(node.tag);

		// **Void Elements**
		if (elementConfig.type === HTMLElementType.VOID) {
			// **Void elements must not have children**
			if (node.children && node.children.length > 0) {
				throw new Error(`Void element <${node.tag}> cannot have children.`);
			}
			// **Ensure void elements are self-closing**
			return `${html}/>\n`;
		}

		// **Non-Void Elements**
		// **Ensure they are not self-closed (do not use "/>")**
		html += ">";

		if (elementConfig.type === HTMLElementType.RAW_TEXT) {
			if (node.children?.length) {
				html += node.children.join("").trim();
			}
		} else if (node.children?.length) {
			html += "\n";
			for (const child of node.children) {
				html += this.toHTML(child, level + 1);
			}
			html += indent;
		}

		// **Add closing tag for non-void elements**
		return `${html}</${node.tag}>\n`;
	}

	protected getIndent(level: number): string {
		return this.useTab ? "\t".repeat(level * this.tabSize) : " ".repeat(level * this.tabSize * 2);
	}

	protected serializeAttributes(attributes: Record<string, string>): string {
		return Object.entries(attributes)
			.map(([key, value]) => ` ${key}="${value}"`)
			.join("");
	}

	protected elementToJSON(element: Element): HTMLNode {
		const node: HTMLNode = {
			tag: element.tagName.toLowerCase(),
		};

		const elementConfig = this.registry.getElementConfig(node.tag);

		if (elementConfig.allowAttributes) {
			this.processAttributes(element, node);
		}

		// **Check if the element is a void element**
		if (elementConfig.type === HTMLElementType.VOID) {
			// **Void elements should not have children**
			if (element.childNodes.length > 0) {
				throw new Error(`Void element <${node.tag}> must not have children.`);
			}
		} else {
			// **Non-void elements must not be self-closing (cannot be void)**
			// **Process children as usual**
			this.processChildren(element, node);
		}

		return node;
	}

	protected processAttributes(element: Element, node: HTMLNode): void {
		const attributes = element.attributes;
		if (attributes.length > 0) {
			node.attributes = {};
			for (const attribute of Array.from(attributes)) {
				if (!node.attributes) return;
				node.attributes[attribute.name] = attribute.value;
			}
		}
	}

	protected processChildren(element: Element, node: HTMLNode): void {
		const elementConfig = this.registry.getElementConfig(node.tag);

		if (elementConfig.type === HTMLElementType.RAW_TEXT) {
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
