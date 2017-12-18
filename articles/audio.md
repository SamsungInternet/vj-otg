## Part Four: Audio

--- say what you are doing here

I wrote an article last year about how I consider the data we receive from the Web Audio API and manipulate it so we have more suitable numbers to represent music and use within our visuals.

The function to do this has taken on a few iterations over this past year as I've added some more functionality and tailored it to suit my own piece of VJ software. However because it's grown it's now in a stage of least performant. I feel it's a little like a sine curve, it's starts great, goes through a stage of 'what the... what - it's not working!' and then back down to bottom and great again. When I got to including it in this project it was at peak 'it's not working'. I mean the function _was_ working, it's just probably at it's least performant so far.

Ada and I discussed it in detail. We removed some of the redundant functionality for this particular application and of course, as always the case when you work with friends, she made it all better again.

The new function was smaller, leaner and faster. It was still doing the same thing, using `getByteFrequencyData` from the analyser node of the Web Audio API, returning the amplitude values for different frequencies of the microphone feed


Today I also started adding some audio analysis... I already had some code from my own software, but, just like the number crunching when processing effects, I was running into similar difficulties when processing the analysis data. WRITE ABOUT REANALYSIS HERE.

It's super duper great to pair, as I discussed with Ada what I was trying to achieve and we broke it down for this prototype. As I left for the day to go and teach my evening class I left her musing over the code. I received a message about an hour or so later. She had done some refactoring which was causing the code to run a lot smoother. This was super promising, all we needed now was a little averaging for beat detection.


