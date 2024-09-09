figma.ui.onmessage = async (msg) => {
  if (msg.type === 'export-gif') {
    const selectedFrames = figma.currentPage.selection;

    // Ensure at least 2 frames are selected and they have the same size
    if (selectedFrames.length < 2 || selectedFrames.some(f => f.width !== selectedFrames[0].width || f.height !== selectedFrames[0].height)) {
      figma.notify("Please select at least 2 frames with the same size.");
      return;
    }

    // Get the interval and scale from the UI
    const interval = msg.interval;
    const scale = parseFloat(msg.scale);

    // Export frames and convert to base64
    const frameImagesBase64 = await Promise.all(
      selectedFrames.map(async (frame) => {
        const exportSettings: ExportSettingsImage = {
          format: 'PNG',
          constraint: { type: 'SCALE', value: scale },
        };
        const imageData = await frame.exportAsync(exportSettings);
        return `data:image/png;base64,${figma.base64Encode(imageData)}`;
      })
    );

    // Send the base64-encoded images back to the UI
    figma.ui.postMessage({
      type: 'frames-exported',
      images: frameImagesBase64,
      interval,
    });
  }
};

figma.showUI(__html__);
figma.ui.resize(300, 400);
