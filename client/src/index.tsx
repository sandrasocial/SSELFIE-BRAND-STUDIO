// Standalone lightweight video preview modal controller
// This file is intentionally kept framework-agnostic so other scripts (including React components)
// can dispatch CustomEvents to show the preview without coupling.

interface VideoPreviewOptions {
	autoplay?: boolean;
	loop?: boolean;
	mute?: boolean;
	/** Canonical remote URL if a Blob is passed so downstream save can persist original */
	originalSrc?: string;
}

let currentObjectUrl: string | null = null;
let initialized = false;
let previousActiveElement: HTMLElement | null = null;
let scrollPosition = 0;

function qs<T extends HTMLElement = HTMLElement>(sel: string): T | null {
	return document.querySelector(sel) as T | null;
}

export function showVideoPreview(source: string | Blob, opts: VideoPreviewOptions = {}) {
	ensureInit();
	const modal = qs<HTMLDivElement>('#video-preview-modal');
	const player = qs<HTMLVideoElement>('#video-preview-player');
	if (!modal || !player) return;

	// Cleanup previous resource
	if (currentObjectUrl) {
		URL.revokeObjectURL(currentObjectUrl);
		currentObjectUrl = null;
	}

	// If a Blob provided, create an object URL
	let src: string;
	if (source instanceof Blob) {
		src = URL.createObjectURL(source);
		currentObjectUrl = src;
	} else {
		src = source;
	}

	player.src = src;
	// Persist original canonical URL (if provided) for save events
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	window.__videoPreview = { ...(window as any).__videoPreview, showVideoPreview, hideVideoPreview, lastOriginalSrc: opts.originalSrc || (typeof source === 'string' ? source : undefined) };
	player.loop = !!opts.loop;
	player.muted = !!opts.mute;
	player.controls = true;

		modal.classList.add('active');
		modal.setAttribute('aria-hidden', 'false');
			modal.setAttribute('role', 'dialog');
			modal.setAttribute('aria-label', 'Video preview');
			modal.setAttribute('aria-modal', 'true');

		// Scroll lock
		scrollPosition = window.scrollY;
		document.body.style.top = `-${scrollPosition}px`;
		document.body.style.position = 'fixed';
		document.body.style.width = '100%';

		// Mark rest of body inert (simple approach)
		const root = document.getElementById('root');
		if (root) root.setAttribute('aria-hidden', 'true');

		// Focus handling
		previousActiveElement = document.activeElement as HTMLElement;
		const closeBtn = qs<HTMLButtonElement>('#video-preview-close');
		if (closeBtn) closeBtn.focus();

	// Autoplay handling (must follow a user gesture generally)
	if (opts.autoplay) {
		const playPromise = player.play();
		if (playPromise) {
			playPromise.catch(err => {
				console.warn('[VideoPreview] Autoplay blocked:', err);
			});
		}
	}
}

export function hideVideoPreview() {
	const modal = qs<HTMLDivElement>('#video-preview-modal');
	const player = qs<HTMLVideoElement>('#video-preview-player');
	if (!modal || !player) return;
	modal.classList.remove('active');
	modal.setAttribute('aria-hidden', 'true');
	player.pause();
	player.removeAttribute('src');
	player.load();
	if (currentObjectUrl) {
		URL.revokeObjectURL(currentObjectUrl);
		currentObjectUrl = null;
	}
	// Restore scroll
	document.body.style.position = '';
	document.body.style.top = '';
	document.body.style.width = '';
	window.scrollTo(0, scrollPosition);
	// Remove inert marker
	const root = document.getElementById('root');
	if (root) root.removeAttribute('aria-hidden');
	// Restore focus
	if (previousActiveElement) {
		previousActiveElement.focus();
		previousActiveElement = null;
	}
}

function onBackdropClick(e: MouseEvent) {
	const content = qs('.video-preview-content');
	if (!content) return;
	if (e.target instanceof Node && !content.contains(e.target)) {
		hideVideoPreview();
	}
}

function onKeyDown(e: KeyboardEvent) {
	if (e.key === 'Escape') {
		const modal = qs('#video-preview-modal');
		if (modal && modal.classList.contains('active')) {
			hideVideoPreview();
		}
	}
}

function trapFocus(e: KeyboardEvent) {
	if (e.key !== 'Tab') return;
	const modal = qs<HTMLDivElement>('#video-preview-modal');
	if (!modal || !modal.classList.contains('active')) return;
	const focusableSelectors = 'button, [href], video, [tabindex]:not([tabindex="-1"])';
	const focusables = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelectors)).filter(el => !el.hasAttribute('disabled'));
	if (focusables.length === 0) return;
	const first = focusables[0];
	const last = focusables[focusables.length - 1];
	if (e.shiftKey && document.activeElement === first) {
		e.preventDefault();
		last.focus();
	} else if (!e.shiftKey && document.activeElement === last) {
		e.preventDefault();
		first.focus();
	}
}

function ensureInit() {
	if (initialized) return;
	initialized = true;
	const modal = qs('#video-preview-modal');
	const closeBtn = qs('#video-preview-close');

	if (modal) {
		modal.addEventListener('click', onBackdropClick);
	}
	if (closeBtn) {
		closeBtn.addEventListener('click', () => hideVideoPreview());
	}
		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keydown', trapFocus);

	// Custom event bridge for other scripts / React components
	window.addEventListener('video:preview', (e: Event) => {
		const detail = (e as CustomEvent).detail || {};
		if (detail && detail.source) {
			showVideoPreview(detail.source, detail.options || {});
		}
	});

	window.addEventListener('video:preview:hide', () => hideVideoPreview());
		// Add action buttons dynamically if not present (save/download)
		if (modal && !modal.querySelector('.video-preview-actions')) {
			const content = modal.querySelector('.video-preview-content');
			if (content) {
				const actionBar = document.createElement('div');
				actionBar.className = 'video-preview-actions';
				actionBar.style.position = 'absolute';
				actionBar.style.left = '12px';
				actionBar.style.bottom = '12px';
				actionBar.style.display = 'flex';
				actionBar.style.gap = '8px';

				const createBtn = (label: string, handler: () => void) => {
					const btn = document.createElement('button');
					btn.type = 'button';
					btn.textContent = label;
					btn.style.padding = '6px 12px';
					btn.style.fontSize = '12px';
					btn.style.letterSpacing = '0.1em';
					btn.style.textTransform = 'uppercase';
					btn.style.background = 'rgba(0,0,0,0.55)';
					btn.style.color = '#fff';
					btn.style.border = '1px solid rgba(255,255,255,0.25)';
					btn.style.borderRadius = '4px';
					btn.style.cursor = 'pointer';
					btn.style.backdropFilter = 'blur(4px)';
					btn.onmouseenter = () => (btn.style.background = 'rgba(0,0,0,0.75)');
					btn.onmouseleave = () => (btn.style.background = 'rgba(0,0,0,0.55)');
					btn.onclick = handler;
					return btn;
				};

				const saveBtn = createBtn('Save', () => {
					const player = qs<HTMLVideoElement>('#video-preview-player');
					if (!player || !player.src) return;
					const detail: Record<string, any> = { src: player.src };
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					if ((window as any).__videoPreview?.lastOriginalSrc) {
						detail.originalSrc = (window as any).__videoPreview.lastOriginalSrc;
					}
					// Fire a custom save event so React layer can handle persistence
					window.dispatchEvent(new CustomEvent('video:preview:save', { detail }));
				});
				const downloadBtn = createBtn('Download', () => {
					const player = qs<HTMLVideoElement>('#video-preview-player');
					if (!player || !player.src) return;
					const a = document.createElement('a');
					a.href = player.src;
					a.download = `video-${Date.now()}.mp4`;
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);
				});
				actionBar.appendChild(saveBtn);
				actionBar.appendChild(downloadBtn);
				content.appendChild(actionBar);
			}
		}

		console.log('[VideoPreview] Modal controller initialized with focus trap & actions');
}

// Auto init after DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', ensureInit, { once: true });
} else {
	ensureInit();
}

// Expose helpers for manual triggering in console / other scripts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.__videoPreview = { showVideoPreview, hideVideoPreview };

