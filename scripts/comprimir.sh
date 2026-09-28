#!/usr/bin/env bash
# Comprime videos a un tamaño objetivo con H.264 en dos pasadas.
# Uso:   ./comprimir.sh video1.mp4 "otro video.mkv" ...
# Vars:  TARGET_MB=24 AUDIO_KBPS=96 PRESET=slow OUTDIR=comprimidos ./comprimir.sh *.mp4
set -euo pipefail

TARGET_MB="${TARGET_MB:-24}"      # margen bajo 25 MB (el muxer agrega overhead)
AUDIO_KBPS="${AUDIO_KBPS:-96}"
PRESET="${PRESET:-slow}"          # más lento = mejor calidad al mismo tamaño
OUTDIR="${OUTDIR:-comprimidos}"

mkdir -p "$OUTDIR"

for f in "$@"; do
    [[ -f "$f" ]] || { echo "No existe: $f" >&2; continue; }

    size=$(stat -c %s "$f")
    if (( size <= TARGET_MB * 1000000 )); then
        echo ">> $f ya pesa menos de ${TARGET_MB} MB, lo salto."
        continue
    fi

    dur=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$f")

    # bitrate de video (kbit/s) = tamaño total / duración - audio
    vk=$(awk -v d="$dur" -v t="$TARGET_MB" -v a="$AUDIO_KBPS" \
        'BEGIN { v = t*8000/d - a; if (v > 8000) v = 8000; printf "%d", v }')

    if (( vk < 150 )); then
        echo ">> $f es demasiado largo para ${TARGET_MB} MB (daría ${vk} kbps). Lo salto." >&2
        continue
    fi

    # Altura máxima según el bitrate disponible (nunca agranda el video)
    if   (( vk >= 2500 )); then h=1080
    elif (( vk >= 1200 )); then h=720
    elif (( vk >= 600  )); then h=480
    else                        h=360
    fi
    vf="scale=-2:'min(${h},ih)'"

    base=$(basename "$f")
    out="$OUTDIR/${base%.*}.mp4"
    log=$(mktemp -u /tmp/ffpass.XXXXXX)

    echo ">> $f  (${dur%.*} s) -> ${vk} kbps video, máx ${h}p"

    ffmpeg -hide_banner -loglevel warning -stats -y -i "$f" \
        -c:v libx264 -preset "$PRESET" -b:v "${vk}k" -vf "$vf" -pix_fmt yuv420p \
        -pass 1 -passlogfile "$log" -an -f null /dev/null

    ffmpeg -hide_banner -loglevel warning -stats -y -i "$f" \
        -c:v libx264 -preset "$PRESET" -b:v "${vk}k" -vf "$vf" -pix_fmt yuv420p \
        -pass 2 -passlogfile "$log" \
        -c:a aac -b:a "${AUDIO_KBPS}k" -ac 2 \
        -movflags +faststart "$out"

    rm -f "$log"-0.log "$log"-0.log.mbtree

    final=$(stat -c %s "$out")
    echo "   listo: $out ($(awk -v s="$final" 'BEGIN{printf "%.1f", s/1000000}') MB)"
done
