/**
 * Polyfills e adaptações de compatibilidade para navegadores legados:
 * - Safari 10 / 11 / 12 no macOS Sierra (10.12) / High Sierra (10.13) (ex: MacBook Pro 2012)
 * - iOS Safari antigo
 * - Fallbacks essenciais para ResizeObserver, Object.fromEntries, Promise.allSettled, globalThis
 */

// 1. globalThis polyfill
if (typeof globalThis === 'undefined') {
  if (typeof window !== 'undefined') {
    (window as any).globalThis = window;
  } else if (typeof self !== 'undefined') {
    (self as any).globalThis = self;
  }
}

// 2. Object.fromEntries polyfill (Safari < 12.1)
if (!Object.fromEntries) {
  Object.fromEntries = function (entries: any) {
    if (!entries) return {};
    const obj: any = {};
    for (const item of entries) {
      if (Array.isArray(item) && item.length >= 2) {
        obj[item[0]] = item[1];
      }
    }
    return obj;
  };
}

// 3. Promise.allSettled polyfill (Safari < 13)
if (!Promise.allSettled) {
  (Promise as any).allSettled = function (promises: Promise<any>[]) {
    return Promise.all(
      promises.map(p =>
        Promise.resolve(p).then(
          value => ({ status: 'fulfilled' as const, value }),
          reason => ({ status: 'rejected' as const, reason })
        )
      )
    );
  };
}

// 4. ResizeObserver polyfill (Safari < 13.1 - Essencial para Recharts / Leaflet)
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  class LegacyResizeObserver {
    private callback: (entries: any[], observer: any) => void;
    private targets: Set<Element> = new Set();
    private intervalId: any = null;

    constructor(callback: (entries: any[], observer: any) => void) {
      this.callback = callback;
    }

    observe(target: Element) {
      if (!target) return;
      this.targets.add(target);

      // Disparo inicial
      setTimeout(() => {
        try {
          const rect = target.getBoundingClientRect();
          this.callback([
            {
              target,
              contentRect: rect,
              borderBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
              contentBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
              devicePixelContentBoxSize: []
            }
          ], this);
        } catch {}
      }, 50);

      // Verificação periódica suave
      if (!this.intervalId) {
        this.intervalId = setInterval(() => {
          if (this.targets.size === 0) return;
          const entries: any[] = [];
          this.targets.forEach(el => {
            try {
              const rect = el.getBoundingClientRect();
              entries.push({
                target: el,
                contentRect: rect,
                borderBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
                contentBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
                devicePixelContentBoxSize: []
              });
            } catch {}
          });
          if (entries.length > 0) {
            try { this.callback(entries, this); } catch {}
          }
        }, 1000);
      }
    }

    unobserve(target: Element) {
      this.targets.delete(target);
      if (this.targets.size === 0 && this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }

    disconnect() {
      this.targets.clear();
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  }

  (window as any).ResizeObserver = LegacyResizeObserver;
  console.info('[Polyfill] ResizeObserver legado carregado para compatibilidade Safari / macOS Sierra.');
}

// 5. AudioContext webkit prefix
if (typeof window !== 'undefined') {
  if (!(window as any).AudioContext && (window as any).webkitAudioContext) {
    (window as any).AudioContext = (window as any).webkitAudioContext;
  }
}

// 6. Detecção do Safari no macOS Sierra para diagnóstico
export function detectLegacySafariSierra(): { isLegacySafari: boolean; isSierra: boolean; osInfo: string } {
  if (typeof window === 'undefined' || !navigator) {
    return { isLegacySafari: false, isSierra: false, osInfo: '' };
  }
  const ua = navigator.userAgent || '';
  const isMac = /Macintosh|Mac OS X/i.test(ua);
  const isSierra = isMac && (/Mac OS X 10_12/i.test(ua) || /Mac OS X 10.12/i.test(ua));
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isOldVersion = /Version\/(10|11|12)\./i.test(ua);

  return {
    isLegacySafari: isSafari && (isOldVersion || isSierra),
    isSierra,
    osInfo: isSierra ? 'macOS 10.12 Sierra' : 'macOS'
  };
}
