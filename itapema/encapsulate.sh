#1/bin/sh

mkdir -p mp4

for f in *.aac; do

    MP4Box -add "$f" "$f.mp4"
    mv "$f.mp4" mp4
    rm "$f"

done

