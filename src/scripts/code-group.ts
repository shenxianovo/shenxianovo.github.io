function buildNav(
	navClass: string,
	btnClass: string,
	labels: string[],
	activeIdx: number,
): HTMLElement {
	const nav = document.createElement("div");
	nav.className = navClass;
	labels.forEach((label, i) => {
		const btn = document.createElement("button");
		btn.className = btnClass + (i === activeIdx ? " active" : "");
		btn.setAttribute("data-idx", String(i));
		btn.type = "button";
		btn.textContent = label;
		nav.appendChild(btn);
	});
	return nav;
}

function initCodeGroups() {
	document.querySelectorAll<HTMLElement>(".code-group").forEach((group) => {
		if (group.querySelector(".code-group-nav")) return;

		const blocks = Array.from(
			group.querySelectorAll<HTMLElement>(":scope > .expressive-code"),
		);
		if (blocks.length < 2) return;

		// Group blocks by tab label
		const tabOrder: string[] = [];
		const tabMap = new Map<string, HTMLElement[]>();
		for (const block of blocks) {
			const fig = block.querySelector("figure");
			const label =
				fig?.getAttribute("data-tab") ||
				block
					.querySelector("pre")
					?.getAttribute("data-language")
					?.toUpperCase() ||
				"Code";
			if (!tabMap.has(label)) {
				tabOrder.push(label);
				tabMap.set(label, []);
			}
			tabMap.get(label)?.push(block);
		}

		// Build tab nav
		const nav = buildNav("code-group-nav", "code-group-tab", tabOrder, 0);
		group.insertBefore(nav, group.firstChild);

		tabOrder.forEach((label, ti) => {
			const items = tabMap.get(label)!;
			for (const b of items) {
				b.setAttribute("data-tab", String(ti));
				if (ti !== 0) b.style.display = "none";
			}

			// Sub-nav: show when multiple blocks, or when single block has a title
			const titles = items.map(
				(b, i) =>
					b.querySelector(".title")?.textContent ||
					b
						.querySelector("pre")
						?.getAttribute("data-language")
						?.toUpperCase() ||
					`#${i + 1}`,
			);
			const hasTitle = items.some((b) => b.querySelector(".title"));
			if (items.length > 1 || hasTitle) {
				const subNav = buildNav(
					"code-group-sub-nav",
					"code-group-tab",
					titles,
					0,
				);
				subNav.setAttribute("data-tab", String(ti));
				if (ti !== 0) subNav.style.display = "none";
				items[0].parentNode?.insertBefore(subNav, items[0]);
				items.forEach((b, si) => {
					b.setAttribute("data-sub", String(si));
					if (si !== 0) b.style.display = "none";
				});
			}
		});
	});
}

initCodeGroups();
document.addEventListener("swup:page:view", initCodeGroups);

// Unified click handler for tab and sub-tab switching
document.addEventListener("click", (e: MouseEvent) => {
	const btn = (e.target as Element | null)?.closest(
		".code-group-tab",
	) as HTMLElement | null;
	if (!btn) return;
	const parentNav = btn.parentElement as HTMLElement | null;
	if (!parentNav) return;
	const group = parentNav.closest(".code-group") as HTMLElement | null;
	if (!group) return;

	const idx = btn.getAttribute("data-idx")!;

	// Deactivate siblings, activate clicked
	parentNav
		.querySelectorAll(".code-group-tab")
		.forEach((t) => t.classList.remove("active"));
	btn.classList.add("active");

	if (parentNav.classList.contains("code-group-nav")) {
		// Top-level tab switch
		group
			.querySelectorAll<HTMLElement>(":scope > .code-group-sub-nav")
			.forEach((sn) => {
				sn.style.display = sn.getAttribute("data-tab") === idx ? "" : "none";
			});
		group
			.querySelectorAll<HTMLElement>(":scope > .expressive-code")
			.forEach((block) => {
				if (block.getAttribute("data-tab") !== idx) {
					block.style.display = "none";
					return;
				}
				const sub = block.getAttribute("data-sub");
				if (sub !== null) {
					const subNav = group.querySelector<HTMLElement>(
						`.code-group-sub-nav[data-tab="${idx}"]`,
					);
					const activeSub = subNav
						?.querySelector(".code-group-tab.active")
						?.getAttribute("data-idx");
					block.style.display = sub === activeSub ? "" : "none";
				} else {
					block.style.display = "";
				}
			});
	} else if (parentNav.classList.contains("code-group-sub-nav")) {
		// Sub-tab switch
		const tabIdx = parentNav.getAttribute("data-tab")!;
		group
			.querySelectorAll<HTMLElement>(
				`:scope > .expressive-code[data-tab="${tabIdx}"]`,
			)
			.forEach((block) => {
				block.style.display =
					block.getAttribute("data-sub") === idx ? "" : "none";
			});
	}
});
