// Code group: tab switching interaction only (structure is SSR'd by rehype)
document.addEventListener("click", (e: MouseEvent) => {
	const btn = (e.target as Element | null)?.closest(
		".code-group-tab",
	) as HTMLElement | null;
	if (!btn) return;
	const nav = btn.parentElement as HTMLElement | null;
	if (!nav) return;
	const group = nav.closest(".code-group") as HTMLElement | null;
	if (!group) return;

	const idx = btn.getAttribute("data-idx")!;

	// Deactivate siblings, activate clicked
	nav
		.querySelectorAll(".code-group-tab")
		.forEach((t) => t.classList.remove("active"));
	btn.classList.add("active");

	if (nav.classList.contains("code-group-nav")) {
		// Top-level tab switch
		group
			.querySelectorAll<HTMLElement>(":scope > .code-group-sub-nav")
			.forEach((sn) => {
				sn.style.display = sn.getAttribute("data-tab") === idx ? "" : "none";
			});
		group
			.querySelectorAll<HTMLElement>(":scope > .code-group-panel")
			.forEach((panel) => {
				if (panel.getAttribute("data-tab") !== idx) {
					panel.style.display = "none";
					return;
				}
				const sub = panel.getAttribute("data-sub");
				if (sub !== null) {
					const subNav = group.querySelector<HTMLElement>(
						`.code-group-sub-nav[data-tab="${idx}"]`,
					);
					const activeSub = subNav
						?.querySelector(".code-group-tab.active")
						?.getAttribute("data-idx");
					panel.style.display = sub === activeSub ? "" : "none";
				} else {
					panel.style.display = "";
				}
			});
	} else if (nav.classList.contains("code-group-sub-nav")) {
		// Sub-tab switch
		const tabIdx = nav.getAttribute("data-tab")!;
		group
			.querySelectorAll<HTMLElement>(
				`:scope > .code-group-panel[data-tab="${tabIdx}"]`,
			)
			.forEach((panel) => {
				panel.style.display =
					panel.getAttribute("data-sub") === idx ? "" : "none";
			});
	}
});
