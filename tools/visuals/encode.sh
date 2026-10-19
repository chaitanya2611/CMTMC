#!/bin/bash
# encode.sh <frames-dir> <out-basename> <width> <crf-vp9> <crf-x264>
# 24 fps PNG frames -> WebM (VP9) + MP4 (H.264) + WebP/JPG poster of frame 0
set -e
F=$1; O=$2; W=$3; CV=${4:-40}; CX=${5:-28}
mkdir -p "$(dirname "$O")"
ffmpeg -y -loglevel error -framerate 24 -i "$F/f_%04d.png" -vf "scale=$W:-2:flags=lanczos,format=yuv420p" \
  -c:v libvpx-vp9 -b:v 0 -crf $CV -row-mt 1 -deadline good -cpu-used 2 -g 96 -an "$O.webm"
ffmpeg -y -loglevel error -framerate 24 -i "$F/f_%04d.png" -vf "scale=$W:-2:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf $CX -profile:v high -tune film -g 96 -movflags +faststart -an "$O.mp4"
ls -la "$O".webm "$O".mp4 | awk '{print $5, $9}'
