
// each media item, with it's effects, controllers and what values to expect -> configure this to a different controller

// I am considering whether screen 1 or 2 selection is done on the interface and not on the controller

var midiConfig = {
	master: {
		opacity: {
			mix: akaiControls.prog1.CC[0],
			flash: akaiControls.prog1.PAD[0],
			onOff: akaiControls.prog1.PC[0]
		},
		noise: {
			size: akaiControls.prog1.CC[1],
			amount: akaiControls.prog1.CC[2]
		}
	},
	// minnie
	media1: {
		opacity: {
			mix: akaiControls.prog1.CC[3],
			flash: akaiControls.prog1.PAD[1],
			onOff: akaiControls.prog1.PC[1]
		},
		hueShift: {
			rotate: akaiControls.prog1.CC[4]
		},
		splitScreen: {
			split: akaiControls.prog1.PC[2]
		}
	},
	// hamster
	media2: {
		opacity: {
			mix: akaiControls.prog1.CC[5],
			flash: akaiControls.prog1.PAD[2],
			onOff: akaiControls.prog1.PC[2]
		},
		wave: {
			frequency: akaiControls.prog1.CC[6],
			amplitude: akaiControls.prog1.CC[7],
			speed: akaiControls.prog1.CC[7]
		},
		zoom: {
			amount: akaiControls.prog1.CC[6],
			xPos: akaiControls.prog1.CC[7],
			yPos: akaiControls.prog1.CC[7]
		},
		rotate: {
			degrees: akaiControls.prog1.CC[7]
		}
	}
};


// I'm considering this: define all the effects and then just reference them above for each media item

// var fxConfig = {
// 	opacity: {
// 		sliders: ["Mix Amount"],

// 	}
// }