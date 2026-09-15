# FreeSurf Localization Tracking

Internal reference for planning localized store listings, screenshots, and phased rollouts.

Last updated: 2026-09-09

---

## 1. Whisper (ASR) supported languages

The transcriber's multilingual model is `openai/whisper-large-v3` (Together AI). It supports the following ~99 languages. (Parakeet-TDT, the English default, is **English-only**.)

- Afrikaans
- Albanian
- Amharic
- Arabic
- Armenian
- Assamese
- Azerbaijani
- Bashkir
- Basque
- Belarusian
- Bengali
- Bosnian
- Breton
- Bulgarian
- Burmese
- Catalan
- Chinese
- Croatian
- Czech
- Danish
- Dutch
- English
- Estonian
- Faroese
- Finnish
- French
- Galician
- Georgian
- German
- Greek
- Gujarati
- Haitian Creole
- Hausa
- Hawaiian
- Hebrew
- Hindi
- Hungarian
- Icelandic
- Indonesian
- Italian
- Japanese
- Javanese
- Kannada
- Kazakh
- Khmer
- Korean
- Lao
- Latin
- Latvian
- Lingala
- Lithuanian
- Luxembourgish
- Macedonian
- Malagasy
- Malay
- Malayalam
- Maltese
- Maori
- Marathi
- Mongolian
- Myanmar
- Nepali
- Norwegian
- Nynorsk
- Occitan
- Pashto
- Persian
- Polish
- Portuguese
- Punjabi
- Romanian
- Russian
- Sanskrit
- Serbian
- Shona
- Sindhi
- Sinhala
- Slovak
- Slovenian
- Somali
- Spanish
- Sundanese
- Swahili
- Swedish
- Tagalog
- Tajik
- Tamil
- Tatar
- Telugu
- Thai
- Tibetan
- Turkish
- Turkmen
- Ukrainian
- Urdu
- Uzbek
- Vietnamese
- Welsh
- Yiddish
- Yoruba

> Note: the transcriber currently sends the **app's UI language** as the ASR language. To transcribe a language outside the app's localized set, a separate "spoken language" picker (or auto-detect) would be needed.

---

## 2. Languages currently localized in-app

### Transcriber — 36 languages
- English (en)
- Spanish (es)
- Portuguese (pt)
- Hindi (hi)
- Indonesian (id)
- Malay (ms)
- Thai (th)
- Vietnamese (vi)
- Tagalog (tl)
- German (de)
- French (fr)
- Italian (it)
- Dutch (nl)
- Polish (pl)
- Swedish (sv)
- Norwegian (no)
- Danish (da)
- Finnish (fi)
- Czech (cs)
- Greek (el)
- Romanian (ro)
- Hungarian (hu)
- Ukrainian (uk)
- Russian (ru)
- Arabic (ar)
- Bengali (bn)
- Urdu (ur)
- Marathi (mr)
- Telugu (te)
- Tamil (ta)
- Persian (fa)
- Turkish (tr)
- Korean (ko)
- Japanese (ja)
- Chinese (zh)
- Hausa (ha)

### Reader — 8 languages
- English (en)
- Spanish (es)
- French (fr)
- Hindi (hi)
- Italian (it)
- Japanese (ja)
- Portuguese (pt)
- Chinese (zh)

### Calorie Tracker — 15 languages
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Turkish (tr)
- Hindi (hi)
- Indonesian (id)
- Vietnamese (vi)
- Thai (th)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)

---

## 3. Notes / rollout planning

- **Screenshots are per-locale** in Play Console / App Store Connect. To capture localized screenshots, set the app language at the first-run chooser, then screenshot the real UI.
- **Store listing localization** (title, short/full description, screenshots) is separate from in-app strings and can be phased by market.
- **Suggested phasing:** start with the highest-value ad/install markets (e.g. es, pt, de, fr, hi, id), add localized metadata + 2-3 screenshots, measure install lift, then expand.
- **Reader is the narrowest** (8) — it only localizes for languages the Kokoro TTS voices support.
- **Transcriber is the broadest** (36) and also supports the most ASR languages.
- Track which locales have: (a) in-app strings, (b) store listing metadata, (c) localized screenshots.
