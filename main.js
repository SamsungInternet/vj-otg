'use strict';

// get all our elements
const sliders = document.querySelectorAll('midi-cc');
const allMidiEls = document.querySelectorAll('midi-cc, midi-pad, midi-toggle');

// for (let i=0; i<allMidiEls.length; i++) {
// 	allMidiEls[i].addEventListener('midiMsg', function(e) {

// 		if (this.tagName === 'MIDI-CC') {
// 			this.setAttribute('value', e.detail.data[2]);
// 		}

// 	});
// }

// set midi element cc value - should probably be part of the custom element
document.addEventListener('midiMsg', function (e) {
	if (e.detail.type === 'cc') {
		document.querySelector('midi-cc[note="' + e.detail.data[1] + '"]').setAttribute('value', e.detail.data[2]);
	}
})


// midi stuff here
var midi, data;
// request MIDI access
if (navigator.requestMIDIAccess) {
	navigator.requestMIDIAccess({
		sysex: false
	}).then(onMIDISuccess, onMIDIFailure);
} else {
	alert("Sorry! There's no MIDI support in your browser ☹️ Why not try using Samsung Internet Browser 🤓");
}

// midi functions
function onMIDISuccess(midiAccess) {
	// when we get a succesful response, run this code
	midi = midiAccess; // this is our raw MIDI data, inputs, outputs, and sysex status

	var inputs = midi.inputs.values();
	// loop over all available inputs and listen for any MIDI input
	for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
		// each time there is a midi message call the onMIDIMessage function
		input.value.onmidimessage = onMIDIMessage;
	}
}

function onMIDIFailure(error) {
	// when we get a failed response, run this code
	console.log("MIDI access has failed ☹️ Check the error & try restarting the browser. " + error);
}

function onMIDIMessage(message) {

	let detail = {};

	detail.data = message.data;
	detail.type = 'cc';

	// send type as well - if channel is between certain numbers then it's a pad, if not it's a CC - or something (it's a little bit rudementary but I don't have a better way ya)
	if ((detail.data[0] > 135) && (detail.data[0] < 150)) {
		detail.type = 'pad';
	}

	if (document.querySelector(`midi-cc[channel="${detail.data[0]}"][note="${detail.data[1]}"]`)) {
		detail.type = 'cc';
	}
	
	if (document.querySelector(`midi-pad[channel="${detail.data[0]}"][note="${detail.data[1]}"]`)) {
		detail.type = 'pad';
	}

	// emit event for uniform elements
	document.dispatchEvent(new CustomEvent('midiMsg', { detail: detail }));

}


