console.log("UI script started");

function exportGif() {
  console.log("Export button clicked");
  const interval = document.getElementById("interval").value;
  const scale = document.getElementById("size").value;

  console.log("Sending message to plugin", { interval, scale });
  parent.postMessage(
    {
      pluginMessage: {
        type: "export-gif",
        interval: parseInt(interval, 10),
        scale: scale
      }
    },
    "*"
  );
  console.log("Message sent to plugin");
}

document.getElementById("export").onclick = exportGif;

window.onmessage = (event) => {
  console.log("Message received in UI:", event.data.pluginMessage);
  const message = event.data.pluginMessage;
  if (message.type === 'create-gif') {
    console.log("Creating GIF");
    if (typeof window.GIF === 'undefined') {
      console.error('GIF is not defined. Make sure gif.js is loaded correctly.');
      return;
    }
    console.log("GIF object is available");
    const gif = new window.GIF({
      workers: 2,
      quality: 10,
    });

    console.log("Processing frames");
    message.frameData.forEach((frameData, index) => {
      console.log(`Processing frame ${index + 1}`);
      const uint8Array = new Uint8Array(frameData);
      const blob = new Blob([uint8Array], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        gif.addFrame(img, { delay: message.interval });
        URL.revokeObjectURL(url);
        console.log(`Frame ${index + 1} added to GIF`);
        if (index === message.frameData.length - 1) {
          console.log("All frames processed, rendering GIF");
          gif.render();
        }
      };
      img.src = url;
    });

    gif.on('finished', (blob) => {
      console.log("GIF rendering finished");
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result;
        console.log("Sending finished GIF back to plugin");
        parent.postMessage({ pluginMessage: { type: 'gif-created', base64Data: base64String } }, '*');
        // Create download link
        const link = document.createElement('a');
        link.href = base64String;
        link.download = 'animation.gif';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log("GIF download initiated");
      };
      reader.readAsDataURL(blob);
    });
  }
  if (message.type === 'plugin-ready') {
    console.log("Plugin is ready");
  }
};

console.log("UI script finished loading");
