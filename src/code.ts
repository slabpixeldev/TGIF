import { fromByteArray } from 'base64-js';

declare class Blob {
  constructor(parts?: any[], options?: { type?: string });
  size: number;
  type: string;
  slice(start?: number, end?: number, contentType?: string): Blob;
}

declare class FileReader extends EventTarget {
  result: ArrayBuffer | string | null;
  readAsArrayBuffer(blob: Blob): void;
  onload: (event: ProgressEvent<FileReader>) => void;
  onerror: (event: ProgressEvent<FileReader>) => void;
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'export-gif') {
    const selectedFrames = figma.currentPage.selection;
    console.log("Selected frames:", selectedFrames.length, selectedFrames.map(f => f.name));

    // Ensure at least 2 frames are selected and they have the same size
    if (selectedFrames.length < 2 || selectedFrames.some(f => f.width !== selectedFrames[0].width || f.height !== selectedFrames[0].height)) {
      figma.notify("Please select at least 2 frames with the same size.");
      return;
    }

    // Get the interval and size from the UI
    const interval = msg.interval;
    const scale = parseFloat(msg.scale);

    // Export frames and generate GIF
    figma.notify("Exporting frames...");
    const frameImages = await Promise.all(
      selectedFrames.map(async (frame) => {
        const exportSettings: ExportSettingsImage = {
          format: 'PNG',
          constraint: { type: 'SCALE', value: scale },
        };
        return await frame.exportAsync(exportSettings);
      })
    );

    figma.notify("Generating GIF...");
    const gif = new GIF({
      workers: 2,
      quality: 10,
    });

    frameImages.forEach((imageData: Uint8Array) => {
      gif.addFrame(imageData, { delay: interval });
    });

    gif.on('finished', (blob: Uint8Array) => {
      figma.notify("GIF generated, preparing for download...");
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64String = fromByteArray(uint8Array);
        figma.ui.postMessage({ type: 'gif-finished', base64Data: `data:image/gif;base64,${base64String}` });
      };
      reader.readAsArrayBuffer(new Blob([blob]));
    });

    gif.render();
    console.log("GIF rendering started");
  }
};

figma.showUI(__html__);
figma.ui.resize(300, 400);
