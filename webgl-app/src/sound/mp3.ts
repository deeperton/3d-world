import { FREQ_BINS_X, FREQ_BINS_Y } from './interfaces.ts';

export function playAudioAndAnalyze(updateTrees: (freqData: number[][]) => void) {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  analyser.minDecibels = -90;
  analyser.maxDecibels = -10;

  analyser.fftSize = 256;

  const audioElement = new Audio("assets/you-can_mid-3-316024.mp3");

  audioElement.loop = true;
  audioElement.controls = false;
  audioElement.setAttribute('id', 'audioElement');
  audioElement.onplay = () => {
    console.log("play MP3");
    processAudio();
  }
  audioElement.onpause = () => {
    console.log("pause MP3");
  }
  document.body.appendChild(audioElement);
  const source = audioContext.createMediaElementSource(audioElement);

  source.connect(analyser);
  analyser.connect(audioContext.destination);

  const bufferLength = analyser.frequencyBinCount;
  console.log(bufferLength);
  const dataArray = new Uint8Array(bufferLength);

  function processAudio() {
    analyser.getByteFrequencyData(dataArray);

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

  window.addEventListener('keypress', (key: KeyboardEvent)=> {
    if (key.code == "Space") {
      const el = document.getElementById('audioElement') as HTMLAudioElement | null;
      if (!el) throw new Error('Audio element not found');

      if (el.paused) {
        el.play().then(() => {
          // console.log("play MP3");
          // processAudio();
        }).catch(err => console.error("Error:", err));
      } else {
        el.pause();
      }
    }
  });
}
