"""Generate DevQuest's original effects (no samples or third-party melodies).
Run: python scripts/create_audio.py. Output: 22.05 kHz mono 16-bit PCM WAV.
"""
from pathlib import Path
import math
import struct
import wave

ROOT = Path(__file__).resolve().parents[1] / 'assets' / 'audio'
RATE = 22050

def render(filename, notes, duration):
    samples = [0.0] * int(duration * RATE)
    for start, length, frequency, amplitude in notes:
        for i in range(int(length * RATE)):
            index = int(start * RATE) + i
            if index >= len(samples):
                break
            t = i / RATE
            # Rounded attacks and releases avoid clicks; partials give a soft bell timbre.
            envelope = min(1, t / .015) * min(1, (length - t) / .08) * math.exp(-2.8 * t / length)
            tone = math.sin(2 * math.pi * frequency * t) + .22 * math.sin(4 * math.pi * frequency * t)
            samples[index] += amplitude * envelope * tone
    peak = max(abs(x) for x in samples) or 1
    scale = min(1, .65 / peak)
    with wave.open(str(ROOT / filename), 'wb') as out:
        out.setparams((1, 2, RATE, 0, 'NONE', 'not compressed'))
        out.writeframes(b''.join(struct.pack('<h', round(x * scale * 32767)) for x in samples))

ROOT.mkdir(parents=True, exist_ok=True)
render('correct.wav', [(0,.4,523.25,.3),(.09,.4,783.99,.26),(.18,.5,1046.5,.22)], .72)
render('incorrect.wav', [(0,.3,349.23,.18),(.12,.35,293.66,.16)], .5)
render('victory.wav', [(i*.16,.5,f,.27) for i,f in enumerate([523.25,659.25,783.99,1046.5])], 1.1)
render('boss-victory.wav', [(i*.18,.65,f,.27) for i,f in enumerate([261.63,392,523.25,659.25,783.99,1046.5])] + [(1.1,.8,523.25,.16),(1.1,.8,659.25,.14),(1.1,.8,783.99,.14)], 2)
