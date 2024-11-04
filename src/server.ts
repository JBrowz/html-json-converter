import { JSDOM } from "jsdom";
import { BaseHTMLJSONConverter, type ConverterConfig } from "./base.js";

/**
 * Server-side HTML-JSON Converter
 * Uses JSDOM to parse HTML
 * Suitable for server-side environments
 * @extends BaseHTMLJSONConverter
 */
export class ServerHTMLJSONConverter extends BaseHTMLJSONConverter {
	protected parseHTML(html: string): Element {
		const dom = new JSDOM(html);
		const { documentElement, body, head } = dom.window.document;

		const isFullDocument = BaseHTMLJSONConverter.DOCUMENT_INDICATORS.some((indicator) =>
			html.toLowerCase().startsWith(indicator.toLowerCase())
		);

		if (isFullDocument && documentElement?.tagName.toLowerCase() === "html") {
			return documentElement;
		}

		const firstElement = body.firstElementChild || head.firstElementChild;
		if (!firstElement) {
			throw new Error("No HTML element found");
		}

		return firstElement;
	}
}