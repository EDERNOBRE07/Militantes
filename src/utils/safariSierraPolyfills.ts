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

// 3.1 Promise.any polyfill (Safari < 14 - Safari 10/11/12 no macOS Sierra)
if (!('any' in Promise) || typeof (Promise as any).any !== 'function') {
  (Promise as any).any = function (promises: Iterable<Promise<any>>) {
    return new Promise((resolve, reject) => {
      const arr = Array.from(promises);
      if (arr.length === 0) {
        return reject(new Error('All promises were rejected (empty array)'));
      }
      let rejections = 0;
      const errors: any[] = new Array(arr.length);
      arr.forEach((p, index) => {
        Promise.resolve(p)
          .then(resolve)
          .catch(err => {
            errors[index] = err;
            rejections++;
            if (rejections === arr.length) {
              reject(new Error('All promises were rejected: ' + errors.map(e => e?.message || e).join(', ')));
            }
          });
      });
    });
  };
}

// 3.2 Array.prototype.flat polyfill (Safari < 12)
if (!Array.prototype.flat) {
  Array.prototype.flat = function (depth = 1) {
    const flatten = (arr: any[], d: number): any[] => {
      return d > 0
        ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val, d - 1) : val), [])
        : arr.slice();
    };
    return flatten(this as any[], depth) as any;
  };
}

// 3.3 String.prototype.replaceAll polyfill (Safari < 13.1)
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function (str: any, newStr: any) {
    if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
      return this.replace(str, newStr);
    }
    return this.replace(new RegExp(String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newStr);
  };
}

// 3.4 AbortController polyfill (Safari < 11.1)
if (typeof window !== 'undefined' && typeof (window as any).AbortController === 'undefined') {
  class SimpleAbortSignal {
    aborted = false;
    addEventListener() {}
    removeEventListener() {}
  }
  class SimpleAbortController {
    signal = new SimpleAbortSignal();
    abort() {
      this.signal.aborted = true;
    }
  }
  (window as any).AbortController = SimpleAbortController;
  (window as any).AbortSignal = SimpleAbortSignal;
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

// 6. Blindagem para LocalStorage no Safari em modo anônimo ou macOS Sierra antigo
if (typeof window !== 'undefined') {
  try {
    const testKey = '__safari_quota_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
  } catch (storageErr) {
    console.warn('[Polyfill] LocalStorage restrito no Safari (modo anônimo ou quota rígida). Ativando memória resiliente.');
    const memoryStore: Record<string, string> = {};
    const mockStorage = {
      getItem: (key: string) => (key in memoryStore ? memoryStore[key] : null),
      setItem: (key: string, val: string) => { memoryStore[key] = String(val); },
      removeItem: (key: string) => { delete memoryStore[key]; },
      clear: () => { Object.keys(memoryStore).forEach(k => delete memoryStore[k]); },
      key: (i: number) => Object.keys(memoryStore)[i] ?? null,
      get length() { return Object.keys(memoryStore).length; }
    };
    try {
      Object.defineProperty(window, 'localStorage', { value: mockStorage, configurable: true });
    } catch {}
  }
}

// 7. Polyfill completo de CanvasRenderingContext2D.prototype.roundRect e Path2D.prototype.roundRect
// (Introduzido na especificação apenas no Safari 15.4 / 2022. Essencial para Safari 10/11/12 no macOS Sierra)
if (typeof window !== 'undefined' && typeof CanvasRenderingContext2D !== 'undefined') {
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (
      this: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      radii?: number | (number | any)[]
    ) {
      if (w === 0 || h === 0) {
        this.rect(x, y, w, h);
        return this;
      }

      if (w < 0) {
        x += w;
        w = -w;
      }
      if (h < 0) {
        y += h;
        h = -h;
      }

      let rTL = 0, rTR = 0, rBR = 0, rBL = 0;
      if (typeof radii === 'number') {
        rTL = rTR = rBR = rBL = Math.max(0, radii);
      } else if (Array.isArray(radii)) {
        if (radii.length === 1) {
          rTL = rTR = rBR = rBL = Math.max(0, Number(radii[0]) || 0);
        } else if (radii.length === 2) {
          rTL = rBR = Math.max(0, Number(radii[0]) || 0);
          rTR = rBL = Math.max(0, Number(radii[1]) || 0);
        } else if (radii.length === 3) {
          rTL = Math.max(0, Number(radii[0]) || 0);
          rTR = rBL = Math.max(0, Number(radii[1]) || 0);
          rBR = Math.max(0, Number(radii[2]) || 0);
        } else if (radii.length >= 4) {
          rTL = Math.max(0, Number(radii[0]) || 0);
          rTR = Math.max(0, Number(radii[1]) || 0);
          rBR = Math.max(0, Number(radii[2]) || 0);
          rBL = Math.max(0, Number(radii[3]) || 0);
        }
      }

      const maxR = Math.min(w / 2, h / 2);
      rTL = Math.min(rTL, maxR);
      rTR = Math.min(rTR, maxR);
      rBR = Math.min(rBR, maxR);
      rBL = Math.min(rBL, maxR);

      this.moveTo(x + rTL, y);
      this.lineTo(x + w - rTR, y);
      if (rTR > 0) this.arcTo(x + w, y, x + w, y + rTR, rTR);
      this.lineTo(x + w, y + h - rBR);
      if (rBR > 0) this.arcTo(x + w, y + h, x + w - rBR, y + h, rBR);
      this.lineTo(x + rBL, y + h);
      if (rBL > 0) this.arcTo(x, y + h, x, y + h - rBL, rBL);
      this.lineTo(x, y + rTL);
      if (rTL > 0) this.arcTo(x, y, x + rTL, y, rTL);
      this.closePath();
      return this;
    };
    console.info('[Polyfill] CanvasRenderingContext2D.prototype.roundRect instalado para compatibilidade Safari / macOS Sierra.');
  }

  // Path2D roundRect polyfill se Path2D existir
  if (typeof (window as any).Path2D !== 'undefined' && !(window as any).Path2D.prototype.roundRect) {
    (window as any).Path2D.prototype.roundRect = function (
      this: any,
      x: number,
      y: number,
      w: number,
      h: number,
      radii?: number | (number | any)[]
    ) {
      if (w === 0 || h === 0) {
        this.rect(x, y, w, h);
        return this;
      }
      if (w < 0) { x += w; w = -w; }
      if (h < 0) { y += h; h = -h; }
      let rTL = 0, rTR = 0, rBR = 0, rBL = 0;
      if (typeof radii === 'number') {
        rTL = rTR = rBR = rBL = Math.max(0, radii);
      } else if (Array.isArray(radii)) {
        if (radii.length === 1) {
          rTL = rTR = rBR = rBL = Math.max(0, Number(radii[0]) || 0);
        } else if (radii.length >= 2) {
          rTL = Math.max(0, Number(radii[0]) || 0);
          rTR = Math.max(0, Number(radii[1]) || 0);
          rBR = Math.max(0, Number(radii[2]) || rTL);
          rBL = Math.max(0, Number(radii[3]) || rTR);
        }
      }
      const maxR = Math.min(w / 2, h / 2);
      rTL = Math.min(rTL, maxR);
      rTR = Math.min(rTR, maxR);
      rBR = Math.min(rBR, maxR);
      rBL = Math.min(rBL, maxR);

      this.moveTo(x + rTL, y);
      this.lineTo(x + w - rTR, y);
      if (rTR > 0) this.arcTo(x + w, y, x + w, y + rTR, rTR);
      this.lineTo(x + w, y + h - rBR);
      if (rBR > 0) this.arcTo(x + w, y + h, x + w - rBR, y + h, rBR);
      this.lineTo(x + rBL, y + h);
      if (rBL > 0) this.arcTo(x, y + h, x, y + h - rBL, rBL);
      this.lineTo(x, y + rTL);
      if (rTL > 0) this.arcTo(x, y, x + rTL, y, rTL);
      this.closePath();
      return this;
    };
  }
}

// 8. Polyfill HTMLCanvasElement.prototype.toBlob (Safari 10 / macOS Sierra não possuía toBlob nativo)
if (typeof window !== 'undefined' && typeof HTMLCanvasElement !== 'undefined' && !HTMLCanvasElement.prototype.toBlob) {
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: function (callback: (blob: Blob | null) => void, type?: string, quality?: any) {
      try {
        const dataURL = this.toDataURL(type || 'image/png', quality);
        setTimeout(() => {
          try {
            const parts = dataURL.split(',');
            const base64 = parts[1];
            const mime = parts[0].match(/:(.*?);/)?.[1] || type || 'image/png';
            const binStr = atob(base64);
            const len = binStr.length;
            const u8arr = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              u8arr[i] = binStr.charCodeAt(i);
            }
            callback(new Blob([u8arr], { type: mime }));
          } catch {
            callback(null);
          }
        }, 0);
      } catch {
        callback(null);
      }
    }
  });
  console.info('[Polyfill] HTMLCanvasElement.prototype.toBlob instalado para compatibilidade Safari / macOS Sierra.');
}

// 9. Detecção do Safari no macOS Sierra para diagnóstico e adaptação de UI
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

// 10. Disparador seguro de download de arquivos compatível com Safari legado e modernas proteções de sandbox
export function safeTriggerDownload(url: string, fileName: string): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);

    if (typeof link.click === 'function') {
      link.click();
    } else {
      const evt = document.createEvent('MouseEvents');
      evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      link.dispatchEvent(evt);
    }

    setTimeout(() => {
      try {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      } catch {}
    }, 1200);
    return true;
  } catch (err) {
    console.warn('[safeTriggerDownload] Erro ao disparar download via <a>:', err);
    return false;
  }
}
