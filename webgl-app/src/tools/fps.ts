export function fps() {

  // Create FPS counter
  const fpsElement = document.createElement('div');
  fpsElement.style.position = 'absolute';
  fpsElement.style.top = '10px';
  fpsElement.style.right = '10px';
  fpsElement.style.padding = '5px 10px';
  fpsElement.style.background = 'rgba(0, 0, 0, 0.5)';
  fpsElement.style.color = '#00ff00';
  fpsElement.style.fontFamily = 'monospace';
  fpsElement.style.fontSize = '14px';
  fpsElement.style.zIndex = '1000';
  fpsElement.innerText = 'FPS: ...';
  document.body.appendChild(fpsElement);

  let lastTime = performance.now();
  let frameCount = 0;

  function updateFPS() {
    const now = performance.now();
    frameCount++;

    if (now - lastTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (now - lastTime));
      fpsElement.innerText = `FPS: ${fps}`;
      frameCount = 0;
      lastTime = now;
    }

    requestAnimationFrame(updateFPS);
  }

  updateFPS();
}