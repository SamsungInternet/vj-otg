# vj-otg
Video DJ on the Go!!!

## Make your own visualisations

Please go ahead and fork to make it your own!

For most users everything you need to change can be done in `/index.html` to configure it as you need.

## Converting Videos!!

Videos need to be power of 2 webms use this ffmpeg command to a video into the working format. 

```
ffmpeg -i input.mp4  -vf scale=512:512 -an -c:v libvpx-vp9 -crf 30 -b:v 500k output.webm
```

## Contributing

Contributions are welcome.

Pull requests to further the documentation are extremely welcome, there is still much to document!! 

If you find bugs and want to fix them you can raise issues and/or submit pull requests.

## Building

If you make changes to the files in `/components/visuals/` you will need to rebuild the bundle.

This is done using npm:

```
> npm install
> npm run build
```
