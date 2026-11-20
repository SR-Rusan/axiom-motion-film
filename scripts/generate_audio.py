"""Generate a dense, deterministic 15-second beat bed with UI click accents."""

from math import exp, pi, sin
from pathlib import Path
import random
import struct
import wave


RATE = 44100
SECONDS = 15.0
TOTAL = int(RATE * SECONDS)
BPM = 128.0
BEAT = 60.0 / BPM
rng = random.Random(220604)
mix = [0.0] * TOTAL


def add_tone(start: float, length: float, hz: float, level: float, decay: float = 8.0, phase: float = 0.0) -> None:
    begin = max(0, int(start * RATE))
    end = min(TOTAL, int((start + length) * RATE))
    for index in range(begin, end):
        t = index / RATE - start
        attack = min(1.0, t * 180.0)
        envelope = attack * exp(-decay * t / max(length, 0.01))
        mix[index] += sin(2.0 * pi * hz * t + phase) * level * envelope


def kick(start: float, level: float = 0.34) -> None:
    begin = int(start * RATE)
    for offset in range(int(0.18 * RATE)):
        index = begin + offset
        if index >= TOTAL:
            break
        t = offset / RATE
        hz = 148.0 - 93.0 * min(1.0, t / 0.12)
        mix[index] += sin(2.0 * pi * hz * t) * level * exp(-24.0 * t)


def snare(start: float, level: float = 0.12) -> None:
    begin = int(start * RATE)
    for offset in range(int(0.13 * RATE)):
        index = begin + offset
        if index >= TOTAL:
            break
        t = offset / RATE
        noise = rng.random() * 2.0 - 1.0
        mix[index] += noise * level * exp(-28.0 * t)
        mix[index] += sin(2.0 * pi * 190.0 * t) * level * 0.45 * exp(-18.0 * t)


def hat(start: float, level: float = 0.035) -> None:
    begin = int(start * RATE)
    for offset in range(int(0.035 * RATE)):
        index = begin + offset
        if index >= TOTAL:
            break
        t = offset / RATE
        mix[index] += (rng.random() * 2.0 - 1.0) * level * exp(-120.0 * t)


def mouse_click(start: float, level: float = 0.15) -> None:
    """Short two-part transient: plastic click plus a tiny UI confirmation tone."""
    begin = int(start * RATE)
    for offset in range(int(0.055 * RATE)):
        index = begin + offset
        if index >= TOTAL:
            break
        t = offset / RATE
        mix[index] += (rng.random() * 2.0 - 1.0) * level * exp(-155.0 * t)
        mix[index] += sin(2.0 * pi * 1650.0 * t) * level * 0.24 * exp(-40.0 * t)
    add_tone(start + 0.018, 0.075, 980.0, level * 0.20, decay=16.0)


def rise(start: float, length: float, level: float = 0.07) -> None:
    begin = int(start * RATE)
    end = min(TOTAL, int((start + length) * RATE))
    for index in range(begin, end):
        t = index / RATE - start
        progress = t / max(length, 0.01)
        hz = 260.0 + 520.0 * progress
        mix[index] += sin(2.0 * pi * hz * t) * level * progress * (1.0 - 0.2 * progress)


# Fast four-on-the-floor foundation and sixteenth-note UI hats.
for beat_index in range(int(SECONDS / BEAT) + 1):
    start = beat_index * BEAT
    kick(start, 0.38 if beat_index % 4 == 0 else 0.29)
    if beat_index % 4 in (1, 3):
        snare(start, 0.095)
    for subdivision in range(4):
        hat(start + subdivision * BEAT / 4.0, 0.032 if subdivision != 2 else 0.047)

# Moving bass / synth figures keep the track active beneath the edit.
notes = [55.0, 65.41, 73.42, 82.41, 98.0, 82.41, 73.42, 65.41]
for index in range(32):
    start = index * BEAT * 0.5
    hz = notes[index % len(notes)]
    add_tone(start, BEAT * 0.43, hz, 0.095, decay=5.4)
    if index % 4 == 2:
        add_tone(start, BEAT * 0.24, hz * 4.0, 0.026, decay=9.0)

# Timed interaction accents mapped to the cursor and card movements.
for start in [0.82, 1.48, 2.32, 3.05, 4.06, 4.72, 5.57, 6.35, 7.28, 8.18, 9.12, 10.06, 11.16, 12.26, 13.05, 13.86, 14.46]:
    mouse_click(start, 0.13 if start < 12 else 0.16)

for start in [3.65, 6.92, 9.72, 12.68]:
    rise(start, 0.42, 0.055)

# Short tonal punctuation at the system lock and reveal.
for start, hz in [(5.62, 783.99), (9.18, 1046.5), (12.28, 1318.5), (13.96, 1568.0)]:
    add_tone(start, 0.22, hz, 0.12, decay=10.0)

peak = max(abs(value) for value in mix) or 1.0
gain = 0.82 / peak
output = Path(__file__).resolve().parents[1] / "public" / "axiom_v3_fast_soundtrack.wav"
with wave.open(str(output), "wb") as wav_file:
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)
    wav_file.setframerate(RATE)
    wav_file.writeframes(b"".join(struct.pack("<h", int(max(-1.0, min(1.0, value * gain)) * 32767)) for value in mix))

print(f"Generated {output} at {SECONDS:.2f}s / {BPM:.0f} BPM")
