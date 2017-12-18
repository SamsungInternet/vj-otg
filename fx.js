document.addEventListener('midiMsg', function(e) {

	document.querySelector('vj-otg-visuals').style.setProperty('--'+e.target.id, e.detail.data[2])

})