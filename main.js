'use strict';

// get all our elements
const sliders = document.querySelectorAll('midi-cc');
const allMidiEls = document.querySelectorAll('midi-cc, midi-pad, midi-toggle');

for (let i=0; i<allMidiEls.length; i++) {
	allMidiEls[i].addEventListener('midiMsg', function(e) {

		if (this.tagName === 'MIDI-CC') {
			this.setAttribute('value', Number(sliders[i].message.data[1])/127);
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

const uniform = document.querySelector('[name="mixUniform"]');
// if we get a midi value - do some controlling of effects
// I am considering a function map rather than what we have now - maybe it will become more clear when I start to control effects
function onMIDIMessage(message) {
	data = message.data;

	// master
	// opacity on/off
	if ( (data[0] === midiConfig.master.opacity.onOff.onPress[0]) && (data[1] === midiConfig.master.opacity.onOff.onPress[1]) ) {

		// turn opacity on off here
		// if this state is on turn off etc...
    }
    // opacity mix
    if ( (data[0] === midiConfig.master.opacity.mix[0]) && (data[1] === midiConfig.master.opacity.mix[1]) ) {

		// change opacity based on scale
		let mixVal = data[2];
    }
    // noise
    if ( (data[0] === midiConfig.master.noise.size[0]) && (data[1] === midiConfig.master.noise.size[1]) ) {

		let mixVal = data[2];
		// insert this into size val
    }
    if ( (data[0] === midiConfig.master.noise.amount[0]) && (data[1] === midiConfig.master.noise.amount[1]) ) {

		let mixVal = data[2];
		// insert this into amount val
    }

    // minnie
    // opacity
    if ( (data[0] === midiConfig.media1.opacity.mix.channel) && (data[1] === midiConfig.media1.opacity.mix.note) ) {

    	// ok so let's assume the midi channel value is in an attribute midi and in the format [val]
    	// match it and set value of that effect based on data
    	const filter = document.querySelector('vj-otg-filter[midi="media1.opacity"]');
		let mixVal = data[2];
		// update attributes on the element here
    }
    if ( (data[0] === midiConfig.media1.opacity.flash.onPress.channel) && (data[1] === midiConfig.media1.opacity.flash.onPress.note) ) {

		// insert this into amount val
    }
    if ( (data[0] === midiConfig.media1.opacity.onOff.channel) && (data[1] === midiConfig.media1.opacity.onOff.note) ) {

		// insert this into amount val
    }
    // hue shift
    if ( (data[0] === midiConfig.media1.hueShift.rotate.channel) && (data[1] === midiConfig.media1.hueShift.rotate.note) ) {

    }
    // split screen
    if ( (data[0] === midiConfig.media1.splitScreen.split.channel) && (data[1] === midiConfig.media1.splitScreen.split.note) ) {

    }


	// this is a test


    if ( (data[0] === akaiControls.prog1.PAD[0].onRelease.channel) && (data[1] === akaiControls.prog1.PAD[0].onRelease.note) ) {

		document.getElementById('vjotg').style.backgroundColor = 'transparent';
    }
}


