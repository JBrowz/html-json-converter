# HTML JSON Converter

A TypeScript library to convert HTML to JSON and vice versa. Supports both Node.js and browser environments.

- [HTML JSON Converter](#html-json-converter)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Server-Side Usage](#server-side-usage)
    - [Browser Usage](#browser-usage)
  - [Features](#features)
    - [Void Elements](#void-elements)
    - [Raw Text Elements](#raw-text-elements)
    - [Nested Elements](#nested-elements)
    - [Supported HTML Elements](#supported-html-elements)
    - [Document Fragment vs Full Documents](#document-fragment-vs-full-documents)
    - [Custom Elements](#custom-elements)
  - [Configuration](#configuration)
  - [Important Notes](#important-notes)
  - [License](#license)
  - [Additional Considerations](#additional-considerations)
  - [Examples](#examples)
    - [Handling Malformed HTML](#handling-malformed-html)
    - [Enforcing Rules During Conversion](#enforcing-rules-during-conversion)
  - [Feedback and Contributions](#feedback-and-contributions)

---

## Installation

```bash
npm install html-json-converter
```

---

## Usage

### Server-Side Usage

```typescript
import { ServerHTMLJSONConverter } from 'html-json-converter';

const converter = new ServerHTMLJSONConverter();

// HTML to JSON
const html = '<div class="test">Hello World</div>';
const json = converter.toJSON(html);
console.log(json);
/* Output:
{
  tag: "div",
  attributes: { class: "test" },
  children: ["Hello World"]
}
*/

// JSON to HTML
const jsonObj = {
  tag: "div",
  attributes: { class: "test" },
  children: ["Hello World"]
};
const htmlOutput = converter.toHTML(jsonObj);
console.log(htmlOutput);
/* Output:
<div class="test">
    Hello World
</div>
*/
```

### Browser Usage

```typescript
import { ClientHTMLJSONConverter } from 'html-json-converter';

const converter = new ClientHTMLJSONConverter();

// Usage is the same as server-side
```

---

## Features

### Void Elements

Void elements are self-closing elements that cannot have children, such as `<img>`, `<br>`, `<hr>`, etc. The converter enforces the rule that void elements cannot have children.

```typescript
// Valid void element
const html = '<img src="test.jpg" alt="Test"/>';
const json = converter.toJSON(html);
/* Output:
{
  tag: "img",
  attributes: {
    src: "test.jpg",
    alt: "Test"
  }
}
*/

// Attempting to convert a void element with children in JSON to HTML will throw an error
const invalidJson = {
  tag: "img",
  attributes: { src: "test.jpg" },
  children: ["Invalid content"] // This is not allowed
};

try {
  converter.toHTML(invalidJson);
} catch (error) {
  console.error(error.message);
  // Output: Void element <img> cannot have children.
}
```

### Raw Text Elements

Raw text elements, such as `<script>` and `<style>`, preserve their content as a single text node.

```typescript
const html = '<style>.test { color: red; }</style>';
const json = converter.toJSON(html);
/* Output:
{
  tag: "style",
  children: [".test { color: red; }"]
}
*/
```

### Nested Elements

The converter handles nested HTML structures seamlessly.

```typescript
const html = `
<div class="container">
  <h1>Title</h1>
  <p>Paragraph</p>
</div>
`;
const json = converter.toJSON(html);
/* Output:
{
  tag: "div",
  attributes: { class: "container" },
  children: [
    {
      tag: "h1",
      children: ["Title"]
    },
    {
      tag: "p",
      children: ["Paragraph"]
    }
  ]
}
*/
```

Certainly! Below is a table that lists all the HTML elements supported by default by the **HTML JSON Converter**. The table includes the element name, its type, and whether it allows children and attributes.

---

### Supported HTML Elements

| **Element**      | **Type**     | **Allows Children** | **Allows Attributes** |
|------------------|--------------|---------------------|-----------------------|
| `a`              | Normal       | Yes                 | Yes                   |
| `abbr`           | Normal       | Yes                 | Yes                   |
| `address`        | Normal       | Yes                 | Yes                   |
| `article`        | Normal       | Yes                 | Yes                   |
| `aside`          | Normal       | Yes                 | Yes                   |
| `audio`          | Normal       | Yes                 | Yes                   |
| `b`              | Normal       | Yes                 | Yes                   |
| `bdi`            | Normal       | Yes                 | Yes                   |
| `bdo`            | Normal       | Yes                 | Yes                   |
| `blockquote`     | Normal       | Yes                 | Yes                   |
| `body`           | Normal       | Yes                 | Yes                   |
| `button`         | Normal       | Yes                 | Yes                   |
| `canvas`         | Normal       | Yes                 | Yes                   |
| `caption`        | Normal       | Yes                 | Yes                   |
| `cite`           | Normal       | Yes                 | Yes                   |
| `code`           | Normal       | Yes                 | Yes                   |
| `colgroup`       | Normal       | Yes                 | Yes                   |
| `data`           | Normal       | Yes                 | Yes                   |
| `datalist`       | Normal       | Yes                 | Yes                   |
| `dd`             | Normal       | Yes                 | Yes                   |
| `del`            | Normal       | Yes                 | Yes                   |
| `details`        | Normal       | Yes                 | Yes                   |
| `dfn`            | Normal       | Yes                 | Yes                   |
| `dialog`         | Normal       | Yes                 | Yes                   |
| `div`            | Normal       | Yes                 | Yes                   |
| `dl`             | Normal       | Yes                 | Yes                   |
| `dt`             | Normal       | Yes                 | Yes                   |
| `em`             | Normal       | Yes                 | Yes                   |
| `fieldset`       | Normal       | Yes                 | Yes                   |
| `figcaption`     | Normal       | Yes                 | Yes                   |
| `figure`         | Normal       | Yes                 | Yes                   |
| `footer`         | Normal       | Yes                 | Yes                   |
| `form`           | Normal       | Yes                 | Yes                   |
| `h1`             | Normal       | Yes                 | Yes                   |
| `h2`             | Normal       | Yes                 | Yes                   |
| `h3`             | Normal       | Yes                 | Yes                   |
| `h4`             | Normal       | Yes                 | Yes                   |
| `h5`             | Normal       | Yes                 | Yes                   |
| `h6`             | Normal       | Yes                 | Yes                   |
| `head`           | Normal       | Yes                 | Yes                   |
| `header`         | Normal       | Yes                 | Yes                   |
| `hgroup`         | Normal       | Yes                 | Yes                   |
| `html`           | Normal       | Yes                 | Yes                   |
| `i`              | Normal       | Yes                 | Yes                   |
| `iframe`         | Normal       | Yes                 | Yes                   |
| `ins`            | Normal       | Yes                 | Yes                   |
| `kbd`            | Normal       | Yes                 | Yes                   |
| `label`          | Normal       | Yes                 | Yes                   |
| `legend`         | Normal       | Yes                 | Yes                   |
| `li`             | Normal       | Yes                 | Yes                   |
| `main`           | Normal       | Yes                 | Yes                   |
| `map`            | Normal       | Yes                 | Yes                   |
| `mark`           | Normal       | Yes                 | Yes                   |
| `menu`           | Normal       | Yes                 | Yes                   |
| `meter`          | Normal       | Yes                 | Yes                   |
| `nav`            | Normal       | Yes                 | Yes                   |
| `noscript`       | Normal       | Yes                 | Yes                   |
| `object`         | Normal       | Yes                 | Yes                   |
| `ol`             | Normal       | Yes                 | Yes                   |
| `optgroup`       | Normal       | Yes                 | Yes                   |
| `option`         | Normal       | Yes                 | Yes                   |
| `output`         | Normal       | Yes                 | Yes                   |
| `p`              | Normal       | Yes                 | Yes                   |
| `picture`        | Normal       | Yes                 | Yes                   |
| `pre`            | Normal       | Yes                 | Yes                   |
| `progress`       | Normal       | Yes                 | Yes                   |
| `q`              | Normal       | Yes                 | Yes                   |
| `rp`             | Normal       | Yes                 | Yes                   |
| `rt`             | Normal       | Yes                 | Yes                   |
| `ruby`           | Normal       | Yes                 | Yes                   |
| `s`              | Normal       | Yes                 | Yes                   |
| `samp`           | Normal       | Yes                 | Yes                   |
| `section`        | Normal       | Yes                 | Yes                   |
| `select`         | Normal       | Yes                 | Yes                   |
| `small`          | Normal       | Yes                 | Yes                   |
| `span`           | Normal       | Yes                 | Yes                   |
| `strong`         | Normal       | Yes                 | Yes                   |
| `sub`            | Normal       | Yes                 | Yes                   |
| `summary`        | Normal       | Yes                 | Yes                   |
| `sup`            | Normal       | Yes                 | Yes                   |
| `table`          | Normal       | Yes                 | Yes                   |
| `tbody`          | Normal       | Yes                 | Yes                   |
| `td`             | Normal       | Yes                 | Yes                   |
| `template`       | Normal       | Yes                 | Yes                   |
| `tfoot`          | Normal       | Yes                 | Yes                   |
| `th`             | Normal       | Yes                 | Yes                   |
| `thead`          | Normal       | Yes                 | Yes                   |
| `time`           | Normal       | Yes                 | Yes                   |
| `tr`             | Normal       | Yes                 | Yes                   |
| `u`              | Normal       | Yes                 | Yes                   |
| `ul`             | Normal       | Yes                 | Yes                   |
| `var`            | Normal       | Yes                 | Yes                   |
| `video`          | Normal       | Yes                 | Yes                   |
| **Void Elements** |              |                     |                       |
| `area`           | Void         | No                  | Yes                   |
| `base`           | Void         | No                  | Yes                   |
| `br`             | Void         | No                  | Yes                   |
| `col`            | Void         | No                  | Yes                   |
| `embed`          | Void         | No                  | Yes                   |
| `hr`             | Void         | No                  | Yes                   |
| `img`            | Void         | No                  | Yes                   |
| `input`          | Void         | No                  | Yes                   |
| `keygen`         | Void         | No                  | Yes                   |
| `link`           | Void         | No                  | Yes                   |
| `meta`           | Void         | No                  | Yes                   |
| `param`          | Void         | No                  | Yes                   |
| `source`         | Void         | No                  | Yes                   |
| `track`          | Void         | No                  | Yes                   |
| `wbr`            | Void         | No                  | Yes                   |
| **Raw Text Elements** |          |                     |                       |
| `script`         | Raw Text     | Yes                 | Yes                   |
| `style`          | Raw Text     | Yes                 | Yes                   |
| `textarea`       | Raw Text     | Yes                 | Yes                   |
| `title`          | Raw Text     | Yes                 | Yes                   |
| **Foreign Elements** |           |                     |                       |
| `svg`            | Foreign      | Yes                 | Yes                   |
| `math`           | Foreign      | Yes                 | Yes                   |

---

### Document Fragment vs Full Documents

The converter supports both HTML fragments and full HTML documents.

```typescript
// Fragment
const fragment = '<p>Hello</p>';
const fragmentJson = converter.toJSON(fragment);
/* Output:
{
  tag: "p",
  children: ["Hello"]
}
*/

// Full Document
const doc = '<!DOCTYPE html><html><body><p>Hello</p></body></html>';
const docJson = converter.toJSON(doc);
/* Output:
{
  tag: "html",
  children: [
    {
      tag: "head"
    },
    {
      tag: "body",
      children: [
        {
          tag: "p",
          children: ["Hello"]
        }
      ]
    }
  ]
}
*/
```

### Custom Elements

You can register custom elements with specific behaviors.

```typescript
const customElements = {
  'my-component': { type: 'normal', allowChildren: true, allowAttributes: true },
  'my-void-element': { type: 'void', allowChildren: false, allowAttributes: true }
};

const converter = new ServerHTMLJSONConverter({ customElements });

const html = '<my-component><span>Content</span></my-component>';
const json = converter.toJSON(html);
/* Output:
{
  tag: "my-component",
  children: [
    {
      tag: "span",
      children: ["Content"]
    }
  ]
}
*/
```

---

## Configuration

You can customize the converter's behavior using the `ConverterConfig` interface.

```typescript
const config = {
  useTab: false,      // Use spaces instead of tabs for indentation
  tabSize: 2,         // Number of spaces per indentation level
  customElements: {   // Register custom elements
    'custom-tag': { type: 'normal', allowChildren: true, allowAttributes: true }
  }
};

const converter = new ServerHTMLJSONConverter(config);
```

---

## Important Notes

- **Enforcement of HTML Rules**: The converter enforces certain HTML rules:
  - **Void Elements**:
    - Cannot have children.
    - Must be self-closing in the output HTML.
  - **Non-Void Elements**:
    - Cannot be self-closed.
    - Must have separate opening and closing tags, even if they have no children.
- **Parser Behavior**:
  - When converting HTML to JSON, the converter relies on the HTML parser (`JSDOM` on the server, `DOMParser` in the browser).
  - The parser may correct malformed HTML automatically.
  - Invalid HTML (e.g., void elements with children) may be parsed differently than expected due to parser correction.
- **Whitespace Handling**:
  - Whitespace and indentation in the output HTML are controlled by the `useTab` and `tabSize` configuration options.
- **Error Handling**:
  - The converter will throw errors when attempting to violate enforced HTML rules during conversion.
  - Examples include adding children to void elements in JSON when converting to HTML.

---

## License

This project is licensed under the MIT License.

---

## Additional Considerations

- **Graceful Handling of Invalid HTML**:
  - While the converter enforces rules during JSON to HTML conversion, it handles invalid HTML input gracefully when converting HTML to JSON.
  - The parser may automatically correct or ignore invalid structures.
- **Custom Element Types**:
  - You can define custom element types and specify whether they are void, raw text, or normal elements.
  - This allows for flexibility when working with web components or custom tags.
- **Cross-Environment Consistency**:
  - Both `ServerHTMLJSONConverter` and `ClientHTMLJSONConverter` aim to provide consistent behavior across Node.js and browser environments.
  - Be aware that slight differences may occur due to underlying parser implementations.

---

## Examples

### Handling Malformed HTML

```typescript
const html = '<div>Unclosed div';
const json = converter.toJSON(html);
/* Output:
{
  tag: "div",
  children: ["Unclosed div"]
}
*/
// The parser corrects the unclosed <div> tag.
```

### Enforcing Rules During Conversion

```typescript
// Attempting to add children to a void element
const invalidJson = {
  tag: "br",
  children: ["Should not be here"]
};

try {
  converter.toHTML(invalidJson);
} catch (error) {
  console.error(error.message);
  // Output: Void element <br> cannot have children.
}
```

---

## Feedback and Contributions

I appreciate your feedback and contributions. If you encounter issues or have suggestions for improvements, please open an issue or submit a pull request on the GitHub repository.
