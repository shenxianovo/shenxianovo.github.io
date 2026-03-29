import { h } from "hastscript";
import { SKIP, visit } from "unist-util-visit";

/**
 * Parse a named attribute from a code block's meta string.
 */
function parseMeta(meta, key) {
	const match = meta?.match(new RegExp(`${key}="([^"]+)"`));
	return match ? match[1] : null;
}

/**
 * Get language from code element's className.
 */
function getLang(code) {
	for (const c of code?.properties?.className || []) {
		if (typeof c === "string" && c.startsWith("language-")) {
			return c.slice(9).toUpperCase();
		}
	}
	return null;
}

/**
 * Rehype plugin that transforms :::code-group containers into
 * tabbed code-group structures at build time (SSR).
 *
 * Operates directly on the HAST tree, bypassing rehype-components.
 */
export function rehypeCodeGroup() {
	return (tree) => {
		visit(tree, "element", (node, index, parent) => {
			if (!parent || index === null) return;

			// Match the <code-group> element created by parseDirectiveNode
			if (node.tagName !== "code-group") return;

			const codeBlocks = node.children.filter((c) => c.tagName === "pre");
			if (codeBlocks.length < 2) {
				// Not enough blocks — just wrap in a div
				node.tagName = "div";
				node.properties = { className: ["code-group"] };
				return SKIP;
			}

			// Group by tab label
			const tabOrder = [];
			const tabGroups = new Map();

			for (const pre of codeBlocks) {
				const code = pre.children?.find((c) => c.tagName === "code");
				const meta = code?.data?.meta || "";
				const tab = parseMeta(meta, "tab") || getLang(code) || "Code";
				const title = parseMeta(meta, "title") || getLang(code) || null;

				if (!tabGroups.has(tab)) {
					tabOrder.push(tab);
					tabGroups.set(tab, []);
				}
				tabGroups.get(tab).push({ pre, title });
			}

			// Build tab buttons
			const tabButtons = tabOrder.map((label, i) =>
				h(
					"button",
					{
						className: ["code-group-tab", ...(i === 0 ? ["active"] : [])],
						"data-idx": String(i),
						type: "button",
					},
					label,
				),
			);
			const nav = h("div", { className: ["code-group-nav"] }, tabButtons);

			// Build panels
			const panels = [];
			tabOrder.forEach((label, ti) => {
				const items = tabGroups.get(label);
				const hasTitle = items.some((item) => item.title != null);

				if (items.length > 1 || hasTitle) {
					const subButtons = items.map((item, si) =>
						h(
							"button",
							{
								className: ["code-group-tab", ...(si === 0 ? ["active"] : [])],
								"data-idx": String(si),
								type: "button",
							},
							item.title || `#${si + 1}`,
						),
					);
					panels.push(
						h(
							"div",
							{
								className: ["code-group-sub-nav"],
								"data-tab": String(ti),
								style: ti !== 0 ? "display:none" : undefined,
							},
							subButtons,
						),
					);

					items.forEach((item, si) => {
						panels.push(
							h(
								"div",
								{
									className: ["code-group-panel"],
									"data-tab": String(ti),
									"data-sub": String(si),
									style: ti !== 0 || si !== 0 ? "display:none" : undefined,
								},
								[item.pre],
							),
						);
					});
				} else {
					panels.push(
						h(
							"div",
							{
								className: ["code-group-panel"],
								"data-tab": String(ti),
								style: ti !== 0 ? "display:none" : undefined,
							},
							[items[0].pre],
						),
					);
				}
			});

			// Mutate in-place: change tagName, properties, and children
			node.tagName = "div";
			node.properties = { className: ["code-group"] };
			node.children = [nav, ...panels];

			return SKIP;
		});
	};
}
