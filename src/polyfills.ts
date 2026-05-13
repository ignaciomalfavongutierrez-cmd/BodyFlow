/**
 * Polyfills for older browsers (Safari 12, iOS 12, etc.)
 */

// Array.prototype.at
if (!Array.prototype.at) {
  Array.prototype.at = function(n: number) {
    n = Math.trunc(n) || 0;
    if (n < 0) n += this.length;
    if (n < 0 || n >= this.length) return undefined;
    return this[n];
  };
}

// structuredClone fallback
if (typeof structuredClone !== 'function') {
  (window as any).structuredClone = (obj: any) => {
    if (obj === undefined) return undefined;
    if (obj === null) return null;
    return JSON.parse(JSON.stringify(obj));
  };
}

// crypto.randomUUID fallback
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  (crypto as any).randomUUID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
}

// Minimal IntersectionObserver polyfill if not present
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  // Very basic fallback that just assumes everything is visible
  (window as any).IntersectionObserver = class IntersectionObserver {
    callback: any;
    constructor(callback: any) { this.callback = callback; }
    observe(target: any) {
      this.callback([{ isIntersecting: true, target }], this);
    }
    unobserve() {}
    disconnect() {}
  };
}

// Minimal ResizeObserver polyfill
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  (window as any).ResizeObserver = class ResizeObserver {
    callback: any;
    constructor(callback: any) { this.callback = callback; }
    observe() {
      // Just fire once to prevent app from breaking
      // In a real app, you might want a more robust polyfill
    }
    unobserve() {}
    disconnect() {}
  };
}
