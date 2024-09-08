declare class GIF {
    constructor(options: { workers: number; quality: number });
    addFrame(imageData: Uint8Array, options: { delay: number }): void;
    on(event: 'finished', callback: (blob: Uint8Array) => void): void;
    render(): void;
  }
  