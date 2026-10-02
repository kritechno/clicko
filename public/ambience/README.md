# Ambience

Drop looping audio files (mp3/ogg/wav) into this folder and list them in `manifest.json`.
Each one shows up in settings → sound with its own volume, so they can be mixed.

```json
{
  "ambiences": [
    { "file": "rain.mp3", "name": { "en": "rain", "ru": "дождь" } },
    { "file": "fireplace.mp3", "name": "fireplace" },
    { "file": "night-city.ogg" }
  ]
}
```

`name` is optional (a string, or one per interface language); the file name is used otherwise.
Files should loop cleanly, since they repeat for as long as their volume is above zero.
