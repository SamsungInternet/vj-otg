'use strict';

const slider = document.querySelector('midi-cc');
const uniform = document.querySelector('[name="mixUniform"]');

slider.addEventListener('midiMsg', function() {
	uniform.setAttribute('value', Number(slider.value[1])/127);
});