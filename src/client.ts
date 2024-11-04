import { BaseHTMLJSONConverter, type ConverterConfig } from "./base.js";
// Client-side implementation
export class ClientHTMLJSONConverter extends BaseHTMLJSONConverter {
    protected parseHTML(html: string): Element {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const { documentElement, body, head } = doc;

        const isFullDocument = BaseHTMLJSONConverter.DOCUMENT_INDICATORS.some((indicator) =>
            html.toLowerCase().startsWith(indicator.toLowerCase())
        );

        if (isFullDocument && documentElement?.tagName.toLowerCase() === "html") {
            return documentElement;
        }

        // Modified logic for head-only elements and empty structure
        const headElement = head.firstElementChild;
        const bodyElement = body.firstElementChild;

        if (!headElement && !bodyElement) {
            throw new Error("No HTML element found");
        }

        // Check head first, then body
        if (html.toLowerCase().startsWith("<head")) {
            return head;
        }

        return bodyElement || headElement as Element;
    }
}