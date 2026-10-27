"""Rebuild the approved stock montage from original footage, never from an old encode.

Usage: python3 scripts/encode-home-hero.py --ffmpeg /path/to/ffmpeg \
  --documents /path/documents.mp4 --site /path/site.mp4 \
  --retail /path/retail.mp4 --mall /path/mall.mp4
Original footage and source credits are documented in docs/image-credits.md.
"""
import argparse
import subprocess
from pathlib import Path

parser = argparse.ArgumentParser()
for name in ('ffmpeg', 'documents', 'site', 'retail', 'mall'):
    parser.add_argument('--' + name, required=True)
args = parser.parse_args()
output = Path(__file__).resolve().parents[1] / 'public/assets/home-hero'
output.mkdir(parents=True, exist_ok=True)
shots = [(args.documents, 2), (args.site, 4), (args.retail, 1), (args.mall, 4)]

def run(command):
    subprocess.run([args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', *command], check=True)

for name, width, height in [('hd', 1920, 1080), ('qhd', 2560, 1440), ('portrait', 810, 1440)]:
    inputs, filters = ['-filter_complex_threads', '1'], []
    for i, (source, start) in enumerate(shots + [shots[0]]):
        inputs += ['-ss', str(start), '-t', '5' if i < 4 else '0.8', '-i', source]
        filters.append(f'[{i}:v]scale={width}:{height}:force_original_aspect_ratio=increase:flags=lanczos,'
                       f'crop={width}:{height},setsar=1,setpts=PTS-STARTPTS,settb=1/25,fps=25,format=yuv420p[v{i}]')
    previous = 'v0'
    for i in range(1, 5):
        filters.append(f'[{previous}][v{i}]xfade=transition=fade:duration=0.8:offset={4.2*i:.1f},fps=25,settb=1/25[x{i}]')
        previous = f'x{i}'
    filters.append('[x4]trim=start=0.8,setpts=PTS-STARTPTS,format=yuv420p[out]')
    target = output / f'plan-to-presence-{name}-v2.mp4'
    run(inputs + ['-filter_complex', ';'.join(filters), '-map', '[out]', '-an', '-t', '16.8',
                  '-c:v', 'libx264', '-preset', 'medium', '-threads', '2', '-crf', '19',
                  '-pix_fmt', 'yuv420p', '-g', '50', '-keyint_min', '25', '-tag:v', 'avc1',
                  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
                  '-movflags', '+faststart', str(target)])
    run(['-i', str(target), '-frames:v', '1', '-c:v', 'libwebp', '-quality', '88',
         str(target.with_suffix('.webp'))])
    print(f'{name}: {width} × {height}, {target.stat().st_size / 1048576:.2f} MiB', flush=True)
