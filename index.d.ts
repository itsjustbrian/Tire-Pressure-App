interface ResizeObserver {
  observe(target: Element): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

declare class ResizeObserver {
  constructor(callback: any);
  clone(): ResizeObserver;
}

declare module '*.png'

declare var firebase: any;

declare module 'lazysizes';
declare var lazySizesConfig: any;