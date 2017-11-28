'use strict';

const slider = document.querySelector('midi-cc');
const uniform = document.querySelector('[name="mixUniform"]');
const pad = document.querySelector('[name="pad1"]');

pad.addEventListener('midiMsg', function(e) {
	// keep this here - it's from the slider test and I'll need it later
	// uniform.setAttribute('value', Number(slider.value.data[1])/127);

	console.log(pad.message);

	// you can just call midi message function and pass in message
	// remember value has a data property which actually contains the channel/note values - this is fine, this emulates the MIDI controller and we can also add more params to value if we need to
	onMIDIMessage(pad.message);

});



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

// if we get a midi value - do some controlling
function onMIDIMessage(message) {
	data = message.data;

	// this is a test
	if ( (data[0] === akaiControls.prog1.PAD.pad1.onPress[0]) && (data[1] === akaiControls.prog1.PAD.pad1.onPress[1]) ) {

		document.getElementById('vjotg').style.backgroundColor = 'red';
    }

    if ( (data[0] === akaiControls.prog1.PAD.pad1.onRelease[0]) && (data[1] === akaiControls.prog1.PAD.pad1.onRelease[1]) ) {

		document.getElementById('vjotg').style.backgroundColor = 'transparent';
    }
}



// refactor this - and get an abstract class as well!

var akaiControls = {
  prog1: {
    dial1: [176, 1],
    dial2: [176, 2],
    dial3: [176, 3],
    dial4: [176, 4],
    dial5: [176, 5],
    dial6: [176, 6],
    dial7: [176, 7],
    dial8: [176, 8],
    PAD: {
      pad1: {
        onPress: [144, 36],
        onRelease: [128, 36, 127]
      },
      pad2: {
        onPress: [144, 37],
        onRelease: [128, 37, 127]
      },
      pad3: {
        onPress: [144, 38],
        onRelease: [128, 38, 127]
      },
      pad4: {
        onPress: [144, 39],
        onRelease: [128, 39, 127]
      },
      pad5: {
        onPress: [144, 40],
        onRelease: [128, 40, 127]
      },
      pad6: {
        onPress: [144, 41],
        onRelease: [128, 41, 127]
      },
      pad7: {
        onPress: [144, 42],
        onRelease: [128, 42, 127]
      },
      pad8: {
        onPress: [144, 43],
        onRelease: [128, 43, 127]
      }
    },
    progChng: {
      pad1: [192, 0],
      pad2: [192, 1],
      pad3: [192, 2],
      pad4: [192, 3],
      pad5: [192, 4],
      pad6: [192, 5],
      pad7: [192, 6],
      pad8: [192, 7]
    },
    CC: {
      pad1: {
        onPress: [176, 1],
        onRelease: [176, 1, 0]
      },
      pad2: {
        onPress: [176, 2],
        onRelease: [176, 2, 0]
      },
      pad3: {
        onPress: [176, 3],
        onRelease: [176, 3, 0]
      },
      pad4: {
        onPress: [176, 4],
        onRelease: [176, 4, 0]
      },
      pad5: {
        onPress: [176, 5],
        onRelease: [176, 5, 0]
      },
      pad6: {
        onPress: [176, 6],
        onRelease: [176, 6, 0]
      },
      pad7: {
        onPress: [176, 8],
        onRelease: [176, 8, 0]
      },
      pad8: {
        onPress: [176, 9],
        onRelease: [176, 9, 0]
      }
    }
  },
  prog2: {
    dial1: [177, 1],
    dial2: [177, 2],
    dial3: [177, 3],
    dial4: [177, 4],
    dial5: [177, 5],
    dial6: [177, 6],
    dial7: [177, 7],
    dial8: [177, 8],
    PAD: {
      pad1: {
        onPress: [145, 35],
        onRelease: [129, 35, 127]
      },
      pad2: {
        onPress: [145, 36],
        onRelease: [129, 36, 127]
      },
      pad3: {
        onPress: [145, 42],
        onRelease: [129, 42, 127]
      },
      pad4: {
        onPress: [145, 39],
        onRelease: [129, 39, 127]
      },
      pad5: {
        onPress: [145, 37],
        onRelease: [129, 37, 127]
      },
      pad6: {
        onPress: [145, 38],
        onRelease: [129, 38, 127]
      },
      pad7: {
        onPress: [145, 46],
        onRelease: [129, 46, 127]
      },
      pad8: {
        onPress: [145, 44],
        onRelease: [129, 44, 127]
      }
    },
    progChng: {
      pad1: [193, 0],
      pad2: [193, 1],
      pad3: [193, 2],
      pad4: [193, 3],
      pad5: [193, 4],
      pad6: [193, 5],
      pad7: [193, 6],
      pad8: [193, 7]
    },
    CC: {
      pad1: {
        onPress: [177, 1],
        onRelease: [177, 1, 0]
      },
      pad2: {
        onPress: [177, 2],
        onRelease: [177, 2, 0]
      },
      pad3: {
        onPress: [177, 3],
        onRelease: [177, 3, 0]
      },
      pad4: {
        onPress: [177, 4],
        onRelease: [177, 4, 0]
      },
      pad5: {
        onPress: [177, 5],
        onRelease: [177, 5, 0]
      },
      pad6: {
        onPress: [177, 6],
        onRelease: [177, 6, 0]
      },
      pad7: {
        onPress: [177, 8],
        onRelease: [177, 8, 0]
      },
      pad8: {
        onPress: [177, 9],
        onRelease: [177, 9, 0]
      }
    }
  },
  prog3: {
    dial1: [178, 1],
    dial2: [178, 2],
    dial3: [178, 3],
    dial4: [178, 4],
    dial5: [178, 5],
    dial6: [178, 6],
    dial7: [178, 7],
    dial8: [178, 8],
    PAD: {
      pad1: {
        onPress: [146, 60],
        onRelease: [130, 60, 127]
      },
      pad2: {
        onPress: [146, 62],
        onRelease: [130, 62, 127]
      },
      pad3: {
        onPress: [146, 64],
        onRelease: [130, 64, 127]
      },
      pad4: {
        onPress: [146, 65],
        onRelease: [130, 65, 127]
      },
      pad5: {
        onPress: [146, 67],
        onRelease: [130, 67, 127]
      },
      pad6: {
        onPress: [146, 69],
        onRelease: [130, 69, 127]
      },
      pad7: {
        onPress: [146, 71],
        onRelease: [130, 71, 127]
      },
      pad8: {
        onPress: [146, 72],
        onRelease: [130, 72, 127]
      }
    },
    progChng: {
      pad1: [194, 0],
      pad2: [194, 1],
      pad3: [194, 2],
      pad4: [194, 3],
      pad5: [194, 4],
      pad6: [194, 5],
      pad7: [194, 6],
      pad8: [194, 7]
    },
    CC: {
      pad1: {
        onPress: [178, 1],
        onRelease: [178, 1, 0]
      },
      pad2: {
        onPress: [178, 2],
        onRelease: [178, 2, 0]
      },
      pad3: {
        onPress: [178, 3],
        onRelease: [178, 3, 0]
      },
      pad4: {
        onPress: [178, 4],
        onRelease: [178, 4, 0]
      },
      pad5: {
        onPress: [178, 5],
        onRelease: [178, 5, 0]
      },
      pad6: {
        onPress: [178, 6],
        onRelease: [178, 6, 0]
      },
      pad7: {
        onPress: [178, 8],
        onRelease: [178, 8, 0]
      },
      pad8: {
        onPress: [178, 9],
        onRelease: [178, 9, 0]
      }
    }
  },
  prog4: {
    dial1: [179, 1],
    dial2: [179, 2],
    dial3: [179, 3],
    dial4: [179, 4],
    dial5: [179, 5],
    dial6: [179, 6],
    dial7: [179, 7],
    dial8: [179, 8],
    PAD: {
      pad1: {
        onPress: [147, 36],
        onRelease: [131, 36, 127]
      },
      pad2: {
        onPress: [146, 38],
        onRelease: [131, 38, 127]
      },
      pad3: {
        onPress: [146, 40],
        onRelease: [131, 40, 127]
      },
      pad4: {
        onPress: [146, 41],
        onRelease: [131, 41, 127]
      },
      pad5: {
        onPress: [146, 43],
        onRelease: [131, 43, 127]
      },
      pad6: {
        onPress: [146, 45],
        onRelease: [131, 45, 127]
      },
      pad7: {
        onPress: [146, 47],
        onRelease: [131, 47, 127]
      },
      pad8: {
        onPress: [146, 48],
        onRelease: [131, 48, 127]
      }
    },
    progChng: {
      pad1: [195, 0],
      pad2: [195, 1],
      pad3: [195, 2],
      pad4: [195, 3],
      pad5: [195, 4],
      pad6: [195, 5],
      pad7: [195, 6],
      pad8: [195, 7]
    },
    CC: {
      pad1: {
        onPress: [179, 1],
        onRelease: [179, 1, 0]
      },
      pad2: {
        onPress: [179, 2],
        onRelease: [179, 2, 0]
      },
      pad3: {
        onPress: [179, 3],
        onRelease: [179, 3, 0]
      },
      pad4: {
        onPress: [179, 4],
        onRelease: [179, 4, 0]
      },
      pad5: {
        onPress: [179, 5],
        onRelease: [179, 5, 0]
      },
      pad6: {
        onPress: [179, 6],
        onRelease: [179, 6, 0]
      },
      pad7: {
        onPress: [179, 8],
        onRelease: [179, 8, 0]
      },
      pad8: {
        onPress: [179, 9],
        onRelease: [179, 9, 0]
      }
    }
  }
};
