# vj-otg
Video DJ on the Go!!!

# Converting Videos!!!

Videos need to be power of 2 webms use this ffmpeg command to a video into the working format. 

```
ffmpeg -i input.mp4  -vf scale=512:512 -an -c:v libvpx-vp9 -crf 30 -b:v 500k output.webm
```