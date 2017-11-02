
// Constant settings, consider making variable from JS
const bool invert = false;
const float beatFuzzDistance = 0.03;
const float hueWidth = 140.0/360.0;
const float hueOffset = 220.0/360.0;
const vec3 gradientStart = vec3(0.0, 0.5, 0.5);
const vec3 gradientStop = vec3(100.0, 0.5, 0.5);
const int gradientDirection = 8; // 0 is no gradient, 1 is down 3 is right 5 is up even numbers are at 45deg

vec4 splitXTexture2D(sampler2D map, vec2 coord, float distance) {
	vec4 mapTexel1 = texture2D( map, vec2(coord.x + distance, coord.y));
	vec4 mapTexel2 = texture2D( map, vec2(coord.x -distance, coord.y));
	return (mapTexel1 + mapTexel2) / 2.0;
}

void main() {

	// Change this to skew or warp the texture
	vec2 newUV = vUv + vec2(0.0, 0.0);

	// Example1. skew Distortion, skew by 0.3 to the right
	// newUV = vUv + vec2(vUv.y * -0.3, 0.0);

	// Example2. wave Distortion
	// newUV = vUv + vec2(sin((vUv.y * PI) * 3.0) * 0.1, 0.0);

	// Example3. wave Distortion which is animated using the time variable
	newUV = vUv + vec2(sin((vUv.y + time * PI)*8.0)*0.01, 0.0);

	// This is how to use the texture we are importing (skewed by the newUV above)
	// the arguments are: texture2D( texturemap, coordinates to sample as a 2 Vector)
	// It returns an RGBA value as a 4 Vector.
	vec4 originalTexture = texture2D(map, newUV);

	// Here we are sampling the texture twice at difference points
	// Using the function defined above. This gives the double exposure effect.
	vec4 splitTexture = splitXTexture2D(map, newUV, beat * beatFuzzDistance);

	// This gets a color according to the brightness of the original texture.
	vec4 colorify = vec4(hsl2rgb(length(originalTexture) * hueWidth + hueOffset, 0.6, 0.4), 1.0);

	vec4 gradient = noopVec4; // 1,1,1,1
	if (gradientDirection != 0) {
		float gradientMixFactor = 1.0-newUV.y;
		if (gradientDirection == 2) gradientMixFactor = length(newUV - vec2(1.0, 1.0));
		if (gradientDirection == 3) gradientMixFactor = 1.0-newUV.x;
		if (gradientDirection == 4) gradientMixFactor = length(newUV - vec2(1.0, 0.0));
		if (gradientDirection == 5) gradientMixFactor = newUV.y;
		if (gradientDirection == 6) gradientMixFactor = length(newUV - vec2(0.0, 0.0));
		if (gradientDirection == 7) gradientMixFactor = newUV.x;
		if (gradientDirection == 8) gradientMixFactor = length(newUV - vec2(0.0, 1.0));
		gradient = vec4(hsl2rgb(mix(gradientStart, gradientStop, gradientMixFactor) * normaliseHSL), 1.0);
	}

	gl_FragColor = splitTexture * gradient;
	
	if (invert) gl_FragColor = 1.0 - gl_FragColor;
}