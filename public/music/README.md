# Lofi music

Clicko ships without music. Drop royalty-free tracks (mp3/ogg) into this folder and list them in `manifest.json`:

```json
{
  "tracks": [
    { "file": "evening-tape.mp3", "title": "evening tape", "bpm": 78 }
  ]
}
```

`bpm` is optional; "on the beat" mode uses it for its tempo (default 75).
