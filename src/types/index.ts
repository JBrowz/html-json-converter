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

export const NODE_TYPES = {
	ELEMENT_NODE: 1,
	TEXT_NODE: 3,
} as const;