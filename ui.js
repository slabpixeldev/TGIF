document.getElementById("export").onclick = () => {
    const interval = document.getElementById("interval").value;
    const scale = document.getElementById("size").value;
  
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
  };
  
  // Receiving the finished GIF message to save the file
  window.onmessage = (event) => {
    const message = event.data.pluginMessage;
    if (message.type === 'gif-finished') {
      const link = document.createElement('a');
      link.href = message.base64Data;
      link.download = 'animation.gif';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
