const slider = document.querySelector('midi-cc');
const uniform = document.querySelector('[name="mixUniform"]');

slider.addEventListener('midiMsg', function(e) {
  uniform.setAttribute('value', Number(slider.value[1])/127);
})