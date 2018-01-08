
import VJOTGFilter from '../prototype.js';

class VJOTGGraph1 extends VJOTGFilter {
	constructor() {
		super();
	}

	allAttributesChangedCallback() {
		
		// HACK, Because it has no attributes allAttributesChangedCallback is called during construction
		// before shaderChunks is defined.
		this.shaderChunks = {};
		
		// If this is in the top layer then work on the Fragment directly
		const layerName =
			this.parentNode.tagName === 'VJ-OTG-VISUALS'
				? 'gl_FragColor'
				: this.parentNode.glLayerName; // Otherwise work on the parent layer.

		this.shaderChunks.main = `

		// Work in polar coordinates
		newUV.x = (PI + atan(newUV.x - 0.5, newUV.y - 0.5)) / (2.0 * PI);
		newUV.y = distanceFromCenter;

		// Get the current column and it's value
		int column = int(newUV.x * noAnalyserBins);
		float columnValue = (
			(float(column == 0) * analyser[0]) +
			(float(column == 1) * analyser[1]) +
			(float(column == 2) * analyser[2]) +
			(float(column == 3) * analyser[3]) +
			(float(column == 4) * analyser[4]) +
			(float(column == 5) * analyser[5]) +
			(float(column == 6) * analyser[6]) +
			(float(column == 7) * analyser[7]) +
			(float(column == 8) * analyser[8]) +
			(float(column == 9) * analyser[9]) +
			(float(column == 10) * analyser[10]) +
			(float(column == 11) * analyser[11]) +
			(float(column == 12) * analyser[12]) +
			(float(column == 13) * analyser[13]) +
			(float(column == 14) * analyser[14]) +
			(float(column == 15) * analyser[15]) +
			(float(column == 16) * analyser[16]) +
			(float(column == 17) * analyser[17]) +
			(float(column == 18) * analyser[18]) +
			(float(column == 19) * analyser[19])
		);

		// Each column is coloured using hsl
		vec3 rgbColumnColor = hsl2rgb(float(column)/noAnalyserBins, 1.0 , 0.5);

		// Work out whether that pixel should be coloured or not.
		${layerName} = mix(
			vec4(0.0, 0.0, 0.0, 0.0),
			vec4(rgbColumnColor, 1.0),
			float(newUV.y <= columnValue) * float(columnValue - newUV.y <= 0.1 )
		);`;
	}
}

customElements.define('vj-otg-graph1', VJOTGGraph1);
export default VJOTGGraph1;