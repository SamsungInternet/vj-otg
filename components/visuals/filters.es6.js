/* bundle all the effects together whilst there is no native js import yet. */

import './wrapper/wrapper.js'; // vj-otg-visuals

import './utility/asset.js'; // vj-otg-assets
import './utility/group.js'; // vj-otg-group

import './uniforms/source.js'; // vj-otg-source-uniform
import './uniforms/midi.js'; // vj-otg-midi-uniform
import './uniforms/time.js'; // vj-otg-time-uniform
import './uniforms/analyser.js'; // vj-otg-audio-uniform
import './uniforms/generic-float.js'; // vj-otg-float-uniform

import './effects/dynamicTexture.js'; // vj-otg-dynamic-texture
import './effects/staticTexture.js'; // vj-otg-static-texture
import './effects/splitx.js'; // vj-otg-splitx
import './effects/gradient.js'; // vj-otg-gradient
import './effects/main.js'; // vj-otg-main
import './effects/graph1.js'; // vj-otg-main (relies on analyser uniform)

import './distorts/rotate.js'; // vj-otg-rotate
import './distorts/wave.js'; // vj-otg-wave
import './distorts/zoom.js'; // vj-otg-zoom
import './distorts/mirror.js'; // vj-otg-mirror
