import { toBlob } from 'html-to-image';

/** iOS Safari refuses canvases larger than ~16.7 MP — stay safely below. */
const MAX_CANVAS_PIXELS = 16_000_000;

export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled' | 'needs-gesture';

export async function renderReceipt(node: HTMLElement, fileName: string): Promise<File> {
  const { width, height } = node.getBoundingClientRect();
  const pixelRatio = Math.max(1, Math.min(3, Math.sqrt(MAX_CANVAS_PIXELS / (width * height))));

  // Make sure fonts are ready so text metrics in the image match the layout.
  await document.fonts?.ready;

  const blob = await toBlob(node, {
    pixelRatio,
    cacheBust: true,
    backgroundColor: '#f4f2ee',
    width: Math.ceil(width),
    height: Math.ceil(height),
  });
  if (!blob) throw new Error('Не удалось создать изображение');
  return new File([blob], fileName, { type: 'image/png' });
}

export function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Opens the native share sheet (Telegram, WhatsApp, …) or falls back to a download.
 * Returns 'needs-gesture' when the browser dropped the user activation while the image
 * was rendering — the caller should offer a second tap that calls this again.
 */
export async function shareFile(file: File, title: string): Promise<ShareOutcome> {
  const data: ShareData = { files: [file], title };
  if (typeof navigator.share === 'function' && navigator.canShare?.(data)) {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (err) {
      const name = (err as DOMException)?.name;
      if (name === 'AbortError') return 'cancelled';
      if (name === 'NotAllowedError') return 'needs-gesture';
      // Any other failure — fall back to a download below.
    }
  }
  downloadFile(file);
  return 'downloaded';
}

/** ASCII-only name: some browsers drop non-Latin `download` filenames. */
export const receiptFileName = () => `minimallist-${new Date().toISOString().slice(0, 10)}.png`;
