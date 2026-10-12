# Security footage

Put the security-wall recording here as `cctv-wall.mp4`. Each square of the grid becomes its own camera on the briefing page's monitor, and **ALL** shows the whole wall.

- The grid is set in `js/config.js` → `CCTV_GRID` (`cols: 4, rows: 3` by default). Change it to match your video.
- Optional camera names go in `CCTV_GRID.labels`, in reading order: `["LOADING DOCK", "STAIRWELL B", …]`.
- Keep the file under 25 MB, or GitHub's web uploader won't take it. Sound is never played, so you can strip it out.

To shrink a big file with ffmpeg:

```sh
ffmpeg -i original.mp4 -an -vf "scale=1280:-2,fps=15" -c:v libx264 -crf 30 -preset slow -movflags +faststart cctv-wall.mp4
```

Until the file is here, the monitor shows its four drawn cameras.
