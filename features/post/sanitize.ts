import sanitizeHtml from "sanitize-html";

/**
 * Post bodies are rich-text HTML written in the dashboard and rendered on the
 * public site, so they are cleaned on every write and again before display:
 * no scripts, event handlers, iframes, styles or javascript: URLs.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code",
    "strong", "b", "em", "i", "u", "s", "strike", "sub", "sup", "mark", "small", "span",
    "ul", "ol", "li", "a", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }, true),
  },
};

export function cleanPostHtml(html: string | null | undefined): string {
  return html ? sanitizeHtml(html, OPTIONS) : "";
}

/** Plain-text summary for cards, e.g. the landing page news section. */
export function postExcerpt(html: string | null | undefined, max = 180): string {
  const text = sanitizeHtml(html || "", { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, "")}…` : text;
}
