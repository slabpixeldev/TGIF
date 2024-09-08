import { fromByteArray } from 'base64-js';

figma.ui.onmessage = async (msg) => {
  console.log("Message received in plugin", msg);
  if (msg.type === 'export-gif') {
    console.log("Export GIF message received");
    const selectedFrames = figma.currentPage.selection;
    console.log("Selected frames:", selectedFrames.length, selectedFrames.map(f => f.name));

    // Ensure at least 2 frames are selected and they have the same size
    if (selectedFrames.length < 2 || selectedFrames.some(f => f.width !== selectedFrames[0].width || f.height !== selectedFrames[0].height)) {
      console.log("Not enough frames or frames have different sizes");
      figma.notify("Please select at least 2 frames with the same size.");
      return;
    }

    // Get the interval and size from the UI
    const interval = msg.interval;
    const scale = parseFloat(msg.scale);

    // Export frames
    figma.notify("Exporting frames...");
    console.log("Starting frame export");
    const frameImages = await Promise.all(
      selectedFrames.map(async (frame) => {
        const exportSettings: ExportSettingsImage = {
          format: 'PNG',
          constraint: { type: 'SCALE', value: scale },
        };
        return await frame.exportAsync(exportSettings);
      })
    );
    console.log("Frames exported:", frameImages.length);

    // Send frame data to UI for GIF generation
    console.log("Sending frame data to UI");
    figma.ui.postMessage({
      type: 'create-gif',
      frameData: frameImages.map(img => Array.from(img)),
      interval: interval
    });
    console.log("Frame data sent to UI");
  } else if (msg.type === 'gif-created') {
    // Handle the created GIF
    console.log("GIF created message received");
    figma.notify("GIF created successfully!");
    // You can add more logic here if needed
  }
};

console.log("Plugin code initialized");
figma.ui.postMessage({ type: 'plugin-ready' });

figma.showUI(__html__);
figma.ui.resize(300, 200);