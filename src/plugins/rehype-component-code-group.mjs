import { h } from "hastscript";

/**
 * Rehype component for :::code-group directive.
 * Wraps children in a <div class="code-group"> container.
 * Tab navigation is built client-side from expressive-code's title rendering.
 */
export function CodeGroupComponent(_properties, children) {
	return h("div", { class: "code-group" }, children);
}
