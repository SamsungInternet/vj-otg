
// so far we only have prog1 vals - but that should suffice
var akaiControls = {
  prog1: {
  	CC: [
	    {channel:176, note:1},
	    {channel:176, note:2},
	    {channel:176, note:3},
	    {channel:176, note:4},
	    {channel:176, note:5},
	    {channel:176, note:6},
	    {channel:176, note:7},
	    {channel:176, note:8}
	],
	PAD: [
		{
			onPress: {channel:144, note:36},
			onRelease: {channel:128, note:36, value:127}
		},
		{
			onPress: {channel:144, note:37},
			onRelease: {channel:128, note:37, value:127}
		},
		{
			onPress: {channel:144, note:38},
			onRelease: {channel:128, note:38, value:127}
		},
		{
			onPress: {channel:144, note:39},
			onRelease: {channel:128, note:39, value:127}
		},
		{
			onPress: {channel:144, note:40},
			onRelease: {channel:128, note:40, value:127}
		},
		{
			onPress: {channel:144, note:41},
			onRelease: {channel:128, note:41, value:127}
		},
		{
			onPress: {channel:144, note:42},
			onRelease: {channel:128, note:42, value:127}
		},
		{
			onPress: {channel:144, note:43},
			onRelease: {channel:128, note:43, value:127}
		}
	],
	// progChng - just the pads - dials are always cc
    PC: [
    	{channel:192, note:0},
    	{channel:192, note:1},
    	{channel:192, note:2},
    	{channel:192, note:3},
    	{channel:192, note:4},
    	{channel:192, note:5},
    	{channel:192, note:6},
    	{channel:192, note:7},
    ]
  }
};