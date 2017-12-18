## Part Two: Media & Effects (or Other Uses for the Web Audio API)

From the off we were experimenting with media and effects.

We discussed 2D and 3D, the functionality of a VJ app. I drew some scamps and we decided our first version was to use 2D canvas. We could have video elements applied with `` and also draw shapes just be regular context methods.

----
This was pretty much the stage I'd got to with my own VJ software I experiment with in my spare time. I had run into some performance problems with crunching numbers both on canvas and with re-analysing the audio data at the same time, but with Ada now here to help, I felt like the problems could be solvable by starting a fresh.
----

_(photo)_

### Time for a performance

Ada set up a service worker and I wrote an HTML for the interface. Ada found a video clip, loaded it onto the canvas using ``. Now we could manipulate the pixel data.

We created an effects library, essentially a bunch of functions to run on the canvas pixel data. They could be called when effects were selected via the interface. We hooked up some white noise (random number generation) and added it to the existing pixel data, this simply created noise on the video clip. This all worked and was great, however one of the problems we encountered was it started slowing the render frame rate down quite considerably.

This is where Ada started working some magic. We were using a `uint8array` for the rgba channel data; each set of four items carried the numbers for one pixel. She swapped this out for a `float32array`, so one array item could carry all rgba data together. This immediately sped things considerably.

### Other uses for the Web Audio API

Ada had [read an article recently about using the Web Audio API's filters to manipulate pixel data](https://medium.com/statuscode/filtering-images-using-web-audio-api-276555cca6ad) - we _really_ wanted to try it. We already had an audio context as we were to analyse audio data - why not use it! Not only did we want to try all the audio effects as visual effects, but we were hoping it would speed up the processing of the data even more and thus performance would benefit.

So we did. It was relatively straight forward. Get the data, process it with the `script` node of the audio api and watch the results.

``` CODE

Now the script processor node breaks data into chunks and processes it - we thought this would be cool for all the number crunching we were doing. Unfortunately (or not) the node chucks away data it can't process in time. So although we couldn't use it for breaking our canvas data array into rgba channels for better effects use. We _could_ use it for an effect all by itself, I means it was almost glitching, right there!

However this did mean it was really hard for us to get any effects to run fast. We discussed forcing a 3D context instead of using a 2D one. Basically using wedGL and processing on the GPU instead of the CPU. In theory we should be able to run a 2D canvas as a texture in a 3D canvas (this is totally meta) - so keep the way we have already worked things just put our 2D canvas in a 3D environment.

### Notables

I have noticed before if you use, say, the `biquadFilter` node on an oscillator with the Web Audio API, it can sound different in Chrome and Firefox. This actually became apparent when we were playing with this on the canvas data as well, rendering slightly different effects on the canvas.

Also audio workouts have recently landed in Chrome Canary behind the _Experimental Web Platform Features_ flag. If this were available to us now, we could have possibly solved the problem of the script processor chucking away chunks of data because it didn't process it in time, as we could have taken that processing off into a worker.

### Sitting in the Shade

So Ada started writing some custom shaders for both displaying the media and to create effects.

This was our new effects library... I'll leave her to tell you all about it as she basically writes shaders in her sleep. Me? I moved on to the audio and MIDI.