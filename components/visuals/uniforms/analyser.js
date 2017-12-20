
/* global HTMLElementPlus */


// Exposes a beat uniform and an analyser uniform for use in the shader
// fires a 'beat' event each time a beat is triggered in the audio input

/**
 * Required params: Threshold
 */

class VJOTAnalyserUniform extends HTMLElementPlus {
	constructor() {
		super();
	}
	static get observedAttributes() {
		return ['threshold'];
	}
	allAttributesChangedCallback(glAttributes) {

		glAttributes.threshold = glAttributes.threshold || 64;

		const fftSize = 4096;
		const cutoff = 682; // Cut off high freq maximum is fftSize/2
		const finalSize = 20; // Number of bins in the histogram

		this.shaderChunks = {
			uniforms: `
				uniform float beat;
				uniform float analyser[${finalSize}];
				const float noAnalyserBins = ${finalSize.toFixed(1)};`
		};

		// Fetch an existing uniform to update or create a new one
		const beatUniform = this.parentNode.uniforms.beat || {
			type: 'f',
			value: 0
		};
		this.parentNode.uniforms.beat = beatUniform;

		// Fetch an existing uniform to update or create a new one
		const analyserUniform = this.parentNode.uniforms.analyser || {
			type: 'uFloatArray'
		};
		this.parentNode.uniforms.analyser = analyserUniform;

		// If this has already been setup then update the threshold and return
		if (this.threshold) {
			this.threshold = glAttributes.threshold;
			return;
		}

		this.threshold = glAttributes.threshold || 127; // our threshold value
		const base = 2; // Base for the power function, higher means larger groups at higher frequencies.
		const data = new Uint8Array(fftSize / 2); // Bins in for analyser node
		const processedData = new Float32Array(finalSize); // Our bins for post processed data
		let beat = 0; // our beat value
		const audioCtx = new window.AudioContext();
		const analyserNode = audioCtx.createAnalyser();
		analyserNode.fftSize = fftSize;
		const beatEvent = new Event('beat');

		analyserUniform.value = processedData;

		const binPattern = (function(inAmount, target) {
			let val = 1;
			let step = 1;
			let result;
			while (result !== target) {
				result = getBins(val).length;
				if (result < target) {
					// console.log('too big', val, result);
					step = step / 2;
					val -= step;
				} else if (result > target) {
					// console.log('too small', val, result);
					val += step;
				}
			}

			function getBins(k) {
				const a = [];
				let t = 0;
				let i = 0;
				while (t < inAmount) {
					t += Math.pow(base, k * i++);
					a.push(
						(a[a.length - 1] || 0) + Math.round(Math.pow(base, k * i++))
					);
				}
				return a;
			}

			return getBins(val);
		}(cutoff, finalSize));

		// fetches audio atream and returns analysed data
		function getStreamData() {
			// pipe in analysing to getUserMedia
			return navigator.mediaDevices
				.getUserMedia({ audio: true, video: false })
				.then(stream => audioCtx.createMediaStreamSource(stream))
				.then(source => {
					source.connect(analyserNode);
				});
		}

		getStreamData().then(() => {
			this.rafFn = function() {
				beatUniform.value *= 0.9;

				analyserNode.getByteFrequencyData(data);

				// put data into processed data using binPattern
				// First index needs to be one for the special case
				// i=0 where the initial value is 0.
				let index = 1;
				let sum = data[0];
				let binSize = 0;

				// binPattern is the index value of the next cutoff
				// for each item in frequency data (up to how many we actually want)
				for (let i = 0; i < cutoff; i++) {
					sum += data[i];

					if (i >= binPattern[index]) {
						binSize = binPattern[index] - binPattern[index - 1];
						sum = sum / binSize;
						processedData[index] = sum / 256; // Normalised so between 0 and 1
						sum = 0;
						index++;
					}
				}

				// get average
				let avSum = processedData.reduce(function(a, b) {
					return a + b;
				});

				beat = 256 * avSum / finalSize;

				if (beat > this.threshold) {
					// Dispatch the event.
					beatUniform.value = 1.0;
					this.dispatchEvent(beatEvent);
				}
			};
		});
	}
}

customElements.define('vj-otg-audio-uniform', VJOTAnalyserUniform);
export default VJOTAnalyserUniform;