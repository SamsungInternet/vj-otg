'use strict';

// get all our elements
const sliders = document.querySelectorAll('midi-cc');
const allMidiEls = document.querySelectorAll('midi-cc, midi-pad, midi-toggle');

for (let i=0; i<allMidiEls.length; i++) {
	allMidiEls[i].addEventListener('midiMsg', function(e) {

		if (this.tagName === 'MIDI-CC') {
			this.setAttribute('value', sliders[i].message.data[1]);
		}

		onMIDIMessage(allMidiEls[i].message);

	});
}

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

// if we get a midi value - do some controlling of effects
// I am considering a function map rather than what we have now - maybe it will become more clear when I start to control effects
function onMIDIMessage(message) {
	// I don't fee like I need this anymore
	data = message.data;

	// send type as well - if channel is between certain numbers then it's a pad, if not it's a CC - or something (it's a little bit rudementary but I don't have a better way ya)
	if ( (data[0] > 135) && (data[0] < 150) ) {
		message.type = 'pad';
	} else {
		message.type = 'cc';
	}

	// emit event for uniform elements
	document.dispatchEvent(new CustomEvent('midiMsg', {message: message}));

}

// event test
document.addEventListener("midiMsg", function(e) {console.log(e)});

