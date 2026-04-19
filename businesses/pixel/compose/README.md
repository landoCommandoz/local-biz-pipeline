# PIXEL compose/ (FFmpeg slideshow layer)

Composes a 9-slide 1080x1920 vertical MP4 from Etsy listing photos.

## Template structure

```
[0.0s – 1.2s] title card (Brewington stencil aesthetic, listing title, price)
[1.2s – 2.4s] slide 1 (primary product photo, pan/zoom)
[2.4s – 3.6s] slide 2 (secondary photo, pan/zoom opposite direction)
[3.6s – 4.8s] slide 3 (detail shot)
[4.8s – 6.0s] slide 4 (context shot)
[6.0s – 7.2s] slide 5 (detail shot 2)
[7.2s – 8.4s] slide 6 (process/story shot)
[8.4s – 9.6s] slide 7 (finish shot)
[9.6s – 11.0s] CTA card ("link in bio -> etsy.com/shop/<slug>")
```

Total duration: 11 seconds. TikTok recommends 9–15s for slideshow-style. 1080x1920 = 9:16 vertical.

## Input format

`template.sh` takes an image-list file and a caption string:

```bash
./compose/template.sh \
  --images ./compose/tmp/<listing-slug>/images.txt \
  --title "Brewington Handmade Tote" \
  --price "$48" \
  --cta "etsy.com/shop/<slug>" \
  --out ./compose/out/<listing-slug>.mp4
```

`images.txt` is one image path per line, 7 lines (slides 1–7).

## Output

1080x1920 MP4, H.264, AAC audio (silent track — TikTok's own audio picker overlays music during upload if `music_id` is specified).

## Quality note

Etsy RSS ships medium-resolution thumbnails. FFmpeg upscales to 1080px; quality is good-not-great. Side-by-side against the paid stack (Apify full-res scrape) there is a visible difference. Acceptable tradeoff for Month 1 under the $0 directive.

## Failure modes

- **Source image < 600px**: upscale artifacts; template.sh logs a warning. Listing is still posted.
- **Source image is a video**: skipped (Etsy occasionally serves video). template.sh falls back to the next image.
- **Fewer than 7 usable images**: template.sh pads with the primary image. Minimum 2 images required; otherwise the listing is skipped for this tick and retried next cycle.
