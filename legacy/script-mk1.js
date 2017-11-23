/* global Uint32Array, Float32Array, Uint8Array */

navigator.serviceWorker.register('/service-worker.js');

const cw = 320;
const ch = 240;

const videoSources = {
  minnie: 'https://cdn.glitch.com/345f846f-a31f-4a45-a9f9-719362195a57%2Fminnie-small.webm?1509538400326'
};

// Gets poplated in preloadAssets
const videoElements = {
  // minnie: [Element]
};

const clips = [
  { src: 'minnie', t: 20 }
];

const isLittleEndian = (function () {
  const buf = new Uint8Array(new Uint32Array([0x0a0b0c0d]).buffer);
  if (buf[4] === 0x0a && buf[5] === 0x0b && buf[6] === 0x0c && buf[7] === 0x0d) {
      return false;
  }
  return true;
}());

const effects = {
  
  glitch: function (canvas, ctx, frame, t) {
    const l = frame.width * frame.height * 4;
    const strength = 0.5;
    const start = performance.now();
    for (let i=0;i<l;i+=4) {
      const r = frame.data[i+0] * (1 - Math.random() * strength);
      const g = frame.data[i+1] * (1 - Math.random() * strength);
      const b = frame.data[i+2] * (1 - Math.random() * strength);
      const a = 255;
      frame.data32[i/4] = isLittleEndian ? 
        ((a << 24)  & 0xff000000) | ((b << 16) & 0x00ff0000 ) | ((g << 8) & 0x0000ff00 ) | (r & 0x000000ff):
        ((r << 24)  & 0xff000000) | ((g << 16) & 0x00ff0000 ) | ((b << 8) & 0x0000ff00 ) | (a & 0x000000ff);
    }
    console.log(performance.now() - start);
  },
  
  lowpass: function (canvas, ctx, frame, t) {
    
    const audioBufferHack = new Float32Array(frame.data32.buffer);

    // offline audioCtx
    const offlineCtx = new OfflineAudioContext(1, frame.width * frame.height, 20500);
    const b = offlineCtx.createBuffer(1, frame.width * frame.height, 20500);
    b.copyToChannel(audioBufferHack, 0, 0);

    const fakeSrc = offlineCtx.createBufferSource();
    fakeSrc.buffer = b;

    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    // filter.Q.value = 100;
    

    fakeSrc
      .connect(filter)
      .connect(offlineCtx.destination);
    fakeSrc.start();

    return offlineCtx.startRendering()
    .then(function(renderedBuffer) {
      /* Start rendering as fast as the machine can. */
      renderedBuffer.copyFromChannel(audioBufferHack, 0, 0);
    });
  },
  
  peaking: function (canvas, ctx, frame, t) {
    
    const audioBufferHack = new Float32Array(frame.data32.buffer);

    // offline audioCtx
    const offlineCtx = new OfflineAudioContext(1, frame.width * frame.height, 44100/8);
    const b = offlineCtx.createBuffer(1, frame.width * frame.height, 44100/8);
    b.copyToChannel(audioBufferHack, 0, 0);

    const fakeSrc = offlineCtx.createBufferSource();
    fakeSrc.buffer = b;

    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.value = 10000;
    filter.Q.value = 0.001;
    

    fakeSrc
      .connect(filter)
      .connect(offlineCtx.destination);
    fakeSrc.start();

    return offlineCtx.startRendering()
    .then(function(renderedBuffer) {
      /* Start rendering as fast as the machine can. */
      renderedBuffer.copyFromChannel(audioBufferHack, 0, 0);
    });
  }
}

const activeEffects = [
  effects.lowpass
];

function preloadVideoAssets() {
  return Promise.all(
    Object.keys(videoSources)
    .map(
      key => fetch(videoSources[key])
        .then(response => response.blob())
        .then(blob => URL.createObjectURL(blob))
        .then(url => {
          var el = document.createElement('video');
          el.src = url;
          el.muted = true;
          el.setAttribute('muted', 'muted');
          el.loop = true;
          videoElements[key] = el;
          return el;
        })
    )
  );
};

function play(el, time) {
  el.pause();
  el.currentTime = time;
  return new Promise(resolve => {
    window.addEventListener('click', function () {
      el.play();
    }, {
      once: true
    });
    el.addEventListener('play', resolve, {
      once: true
    });
  })
  .then(() => {
    el.currentTime = time;
  });
}

function wait(t) {
  return new Promise(r => setTimeout(r, t));
}

preloadVideoAssets()
.then(function (elements) {
  
  // Remove Loading Screen
  const loader = document.getElementById('loading-screen');
  loader.remove();
  
  // Play video on canvas
  return play(videoElements['minnie'], 80);
})
.then(function () {
  
  console.log('Playing');
  
  // Create Elements
  const canvas = document.getElementById('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d', {
    alpha: false
  });
  
  const buffer = document.createElement('canvas');
  buffer.width = cw;
  buffer.height = ch;
  const bufferCtx = buffer.getContext('2d', {
    alpha: false
  });
  
  // Start render loop
  let i=0;
  (async function renderLoop() {
      if (i++ % 6) return requestAnimationFrame(renderLoop, 0, 0);
      bufferCtx.drawImage(videoElements['minnie'], 0, 0, cw, ch);
      const frame = bufferCtx.getImageData(0, 0, cw, ch);
      const l = cw * ch * 4;
      frame.data32 = new Uint32Array(frame.data.buffer);
      const t = performance.now();
      try {
        for (const fn of activeEffects) {
          await fn(canvas, ctx, frame, t);
        }
      } catch(e) {
        console.log(e);
      }
      ctx.putImageData(frame, 0, 0);
      requestAnimationFrame(renderLoop, 0, 0);
  }());
  
});

const canvas = document.getElementById('canvas');


// audio api stuff ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const audioCtx = new window.AudioContext;
let data = new Uint8Array(256),
  analyserNode = audioCtx.createAnalyser();
  analyserNode.fftSize = 512;

// fetches audio atream and returns analysed data
function getStreamData() {

  // pipe in analysing to getUserMedia
  navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(stream => audioCtx.createMediaStreamSource(stream))
    .then(source => {
      source.connect(analyserNode);
      console.log('got stream');
    });
}
getStreamData();

// don't call this - I'll add the readjustment of the frequency data and we'll call it in our main RAF
function raf() {
  requestAnimationFrame(raf);
  
  analyserNode.getByteFrequencyData(data);

  console.log('freqData:'+data);
}





