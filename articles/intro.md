## The proposal

Create an audio visualisation app run entirely in Samsung Internet Browser and use it to project audio reactive visuals using a Samsung S8 phone.

## Part One: The App

### Overview

Ada and I had ten days to put together a progressive web app, to run on a Samsung S8 phone with the ability to project audio reactive visualisations controlled by a MIDI controller.

### Core components of the app

The app went through different iterations as we were building it, based on what we found worked and what didn't. However the core components of what constitutes a piece of VJ software always stayed at the forefront. I've broken down the writing as per these components, as each tells it's own story.

VJ (Video Jockey) apps similar core functionality:

- Media: You can either import or create media; e.g. Videos, images, 3D models, patterns, signage.
- Effects: These are to be added to the media to manipulate it. Colour changes, distortion, symmetry etc...
- Audio analysis: Basic frequency analysis at the core, you would also then use beat detection, low, mid, high frequencies etc... to manipulate params within the software
- MIDI Support: To control the software use of MIDI controllers

### How to prototype

We had _about_ ten days. Just over, but wanted to keep time for inevitable overs, plus these writings, so we planned for ten days of dev time.

The first five days was to be our 'hack' time. Working with prototyping, which essentially this was, I believe putting a time limit on development is a good idea in the beginning. When you are building something unknown (as in 'can we do this' 🤷🏻‍♀️, 'shall we do it like this' 🤷🏻‍♀️) when everything is 'how long is a piece of string', just sitting down and hacking something together gives you so much insight, as long as you have a stopping point. (Ada and I really could have hacked for weeks!).

This gave us a lot of learnings and understandings about what worked and what didn't and how the end app would materialise. Then we spent the next 5 days building and fine tuning what we settled on, meaning we have a publishable piece of working code, even if there's a whole heap of features and bits and bobs we'd like to keep developing!

### Can I use it?

You sure can! Just go to the url and start playing!

Each of the pads & dials on the interface changes whats happening on the screen by fading the media in and out or changing effects. What's happening under the hood is each is essentially just changing a variable you can set wherever you want within the app. For instance the first four pads set custom properties to change the CSS, the first four dials fade each media item in and out.

### Notables

Our audience is developers and although the app works stand alone and you can play with it, the real functionality is forking the code and messing around and having your own custom version to play with.

We made a few, what I've dubbed 'sandbox' decisions whilst we built. Such as having the app work out of the box with the AKAI LPD8 controller and not a different MIDI device. Each further article explains these decisions.

### Come with us, on a journey through space & time

Over the next few articles we'll go over all the features of the app in depth, explaining different technologies we tried, and how we settled on the using the incredible features of the web platform we did.

They'll be audio filters, analysis, canvas 2D & 3D, custom shaders, web components and a sprinkling of MIDI, I mean if you haven't figured it out yet, there should _always_ be a sprinkling of MIDI 🖲

Now, go to the url, find yourself a screen & VJ your way through Christmas and the New Year!