import { FREQ_BINS_X, FREQ_BINS_Y } from './interfaces.ts';

export async function setupAudio(updateTrees: (freqData: number[][]) => void) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    source.connect(analyser);
    analyser.fftSize = 512;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function processAudio() {
      analyser.getByteFrequencyData(dataArray);

      // Генеруємо двовимірний масив частот
      const freqData: number[][] = Array.from({ length: FREQ_BINS_X }, () =>
        Array(FREQ_BINS_Y).fill(0)
      );

      for (let i = 0; i < bufferLength; i++) {
        const freqX = Math.floor(i / (bufferLength / FREQ_BINS_X));
        const freqY = Math.floor((dataArray[i] / 255) * FREQ_BINS_Y);
        if (freqY >= FREQ_BINS_Y) continue;
        freqData[freqX][freqY] += dataArray[i] / 255;
      }

      updateTrees(freqData);
      requestAnimationFrame(processAudio);
    }

    processAudio();
  } catch (err) {
    console.error("Microphone access denied:", err);
  }
}
