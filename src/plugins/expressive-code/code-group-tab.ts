import { definePlugin } from "@expressive-code/core";

/**
 * Expressive Code plugin that extracts `tab="..."` from code block meta
 * and sets it as a `data-tab` attribute on the rendered figure element.
 */
export function pluginCodeGroupTab() {
	const tabMap = new WeakMap();

	return definePlugin({
		name: "Code Group Tab",
		hooks: {
			preprocessMetadata: (context) => {
				const meta = context.codeBlock.meta;
				const match = meta.match(/tab="([^"]+)"/);
				if (match) {
					tabMap.set(context.codeBlock, match[1]);
					context.codeBlock.meta = meta.replace(/tab="[^"]+"/, "").trim();
				}
			},
			postprocessRenderedBlock: (context) => {
				const tab = tabMap.get(context.codeBlock);
				if (tab) {
					const ast = context.renderData.blockAst;
					ast.properties = ast.properties || {};
					ast.properties.dataTab = tab;
					tabMap.delete(context.codeBlock);
				}
			},
		},
	});
}
