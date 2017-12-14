document.querySelectorAll('midi-pad')[0].addEventListener('midiMsg', function(e) {
	// console.log(e.detail.data[2]);
	document.querySelector('vj-otg-visuals').style.setProperty('--blurAmount',e.detail.data[2]+'px')
})