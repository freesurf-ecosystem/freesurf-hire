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

---

## 4. Per-locale checklist

Legend:
- **Apps** = which apps have in-app strings for that locale: `T` Transcriber, `R` Reader, `C` Calorie.
- **★ Shared** = locale is in **all three apps** (cheapest first phase — one round of metadata/screenshots covers every app).
- **Metadata** = store listing (title/description) localized.
- **Shots** = localized screenshots captured + uploaded.

Shared-across-all-3 (★): **en, es, fr, hi, it, pt, ja, zh**

| Language | Code | Apps | Metadata | Shots |
|---|---|---|---|---|
| English | en | T · R · C ★ | ☐ | ☐ |
| Spanish | es | T · R · C ★ | ☐ | ☐ |
| French | fr | T · R · C ★ | ☐ | ☐ |
| Hindi | hi | T · R · C ★ | ☐ | ☐ |
| Italian | it | T · R · C ★ | ☐ | ☐ |
| Portuguese | pt | T · R · C ★ | ☐ | ☐ |
| Japanese | ja | T · R · C ★ | ☐ | ☐ |
| Chinese | zh | T · R · C ★ | ☐ | ☐ |
| German | de | T · C | ☐ | ☐ |
| Indonesian | id | T · C | ☐ | ☐ |
| Vietnamese | vi | T · C | ☐ | ☐ |
| Thai | th | T · C | ☐ | ☐ |
| Korean | ko | T · C | ☐ | ☐ |
| Russian | ru | T · C | ☐ | ☐ |
| Turkish | tr | T · C | ☐ | ☐ |
| Malay | ms | T | ☐ | ☐ |
| Tagalog | tl | T | ☐ | ☐ |
| Dutch | nl | T | ☐ | ☐ |
| Polish | pl | T | ☐ | ☐ |
| Swedish | sv | T | ☐ | ☐ |
| Norwegian | no | T | ☐ | ☐ |
| Danish | da | T | ☐ | ☐ |
| Finnish | fi | T | ☐ | ☐ |
| Czech | cs | T | ☐ | ☐ |
| Greek | el | T | ☐ | ☐ |
| Romanian | ro | T | ☐ | ☐ |
| Hungarian | hu | T | ☐ | ☐ |
| Ukrainian | uk | T | ☐ | ☐ |
| Arabic | ar | T | ☐ | ☐ |
| Bengali | bn | T | ☐ | ☐ |
| Urdu | ur | T | ☐ | ☐ |
| Marathi | mr | T | ☐ | ☐ |
| Telugu | te | T | ☐ | ☐ |
| Tamil | ta | T | ☐ | ☐ |
| Persian | fa | T | ☐ | ☐ |
| Hausa | ha | T | ☐ | ☐ |

### Suggested phase order
1. **Phase 1 — the ★ shared 8** (en, es, fr, hi, it, pt, ja, zh): metadata + screenshots for all three apps at once.
2. **Phase 2 — Calorie's remaining 7** (de, id, vi, th, ko, ru, tr): Transcriber already covers these too.
3. **Phase 3 — Transcriber-only locales** (the rest): expand based on which markets show ad/install lift.

> The transcriber can *transcribe* ~99 Whisper languages, but the **app UI** is localized for the 36 above. To transcribe a language outside that set, a separate spoken-language picker would be needed.

---

## 5. Top 200 most spoken languages (Ethnologue)

Source: Ethnologue most-spoken languages. **Localized** = which apps already ship in-app strings for that language:
- `T` Transcriber · `R` Reader · `C` Calorie · `—` not yet localized

| # | Language | ISO | Speakers | Native name | Family | Localized |
|---|---|---|---|---|---|---|
| 1 | English | eng | 1.5B | English | Indo-European (Germanic) | T · R · C |
| 2 | Mandarin Chinese | cmn | 1.2B | 普通话 | Sino-Tibetan (Sinitic) | T · R · C |
| 3 | Hindi | hin | 611.2M | मानक हिन्दी | Indo-European (Indo-Aryan) | T · R · C |
| 4 | Spanish | spa | 561.3M | español | Indo-European (Romance) | T · R · C |
| 5 | Standard Arabic | arb | 334.9M | العربية | Afroasiatic (Semitic) | T |
| 6 | French | fra | 333.5M | français | Indo-European (Romance) | T · R · C |
| 7 | Bengali | ben | 274.4M | বাংলা | Indo-European (Indo-Aryan) | T |
| 8 | Portuguese | por | 269.4M | Português | Indo-European (Romance) | T · R · C |
| 9 | Indonesian | ind | 254.8M | Bahasa Indonesia | Austronesian (Malayo-Chamic) | T · C |
| 10 | Urdu | urd | 246.0M | اُردُو | Indo-European (Indo-Aryan) | T |
| 11 | Russian | rus | 210.3M | русский язык | Indo-European (Slavic) | T · C |
| 12 | Standard German | deu | 133.4M | Deutsch | Indo-European (Germanic) | T · C |
| 13 | Japanese | jpn | 125.7M | 日本語 | Japonic | T · R · C |
| 14 | Nigerian Pidgin | pcm | 120.7M | Naijá | Indo-European (Germanic Creole) | — |
| 15 | Egyptian Arabic | arz | 118.4M | مصري | Afroasiatic (Semitic) | — |
| 16 | Marathi | mar | 99.2M | मराठी | Indo-European (Indo-Aryan) | T |
| 17 | Vietnamese | vie | 97.1M | Tiếng Việt | Austroasiatic | T · C |
| 18 | Telugu | tel | 95.9M | తెలుగు | Dravidian | T |
| 19 | Swahili | swh | 95.2M | Kiswahili | Atlantic-Congo (Bantoid) | — |
| 20 | Hausa | hau | 94.5M | Hausa | Afroasiatic (Chadic) | T |
| 21 | Turkish | tur | 93.7M | Türkçe | Turkic | T · C |
| 22 | Western Punjabi | pnb | 90.4M | پنجابی | Indo-European (Indo-Aryan) | — |
| 23 | Tagalog | tgl | 87.1M | Tagalog | Austronesian (Greater Central Philippine) | T |
| 24 | Tamil | tam | 86.4M | தமிழ் | Dravidian | T |
| 25 | Yue Chinese | yue | 85.8M | 粵語 | Sino-Tibetan (Sinitic) | — |
| 26 | Wu Chinese | wuu | 83.3M | 江南话 | Sino-Tibetan (Sinitic) | — |
| 27 | Iranian Persian | pes | 82.5M | فارسی | Indo-European (Iranic) | T |
| 28 | Korean | kor | 82.2M | 한국말 | Koreanic | T · C |
| 29 | Amharic | amh | 78.0M | ኣማርኛ | Afroasiatic (Semitic) | — |
| 30 | Thai | tha | 71.4M | ภาษาไทย | Tai-Kadai | T · C |
| 31 | Javanese | jav | 69.2M | ꦧꦱꦗꦮ | Austronesian (Javanesic) | — |
| 32 | Italian | ita | 65.6M | Italiano | Indo-European (Romance) | T · R · C |
| 33 | Gujarati | guj | 62.5M | ગુજરાત | Indo-European (Indo-Aryan) | — |
| 34 | Kannada | kan | 58.7M | ಕನ್ನಡ | Dravidian | — |
| 35 | Levantine Arabic | apc | 57.8M | شامي | Afroasiatic (Semitic) | — |
| 36 | Sudanese Arabic | apd | 54.3M | سوداني | Afroasiatic (Semitic) | — |
| 37 | Yoruba | yor | 52.9M | Èdè Yorùbá | Atlantic-Congo (Yoruboid) | — |
| 38 | Bhojpuri | bho | 52.7M | भोजपुरी | Indo-European (Indo-Aryan) | — |
| 39 | Jinyu Chinese | cjy | 48.0M | 晋语 | Sino-Tibetan (Sinitic) | — |
| 40 | Min Nan Chinese | nan | 45.8M | 闽南语 | Sino-Tibetan (Sinitic) | — |
| 41 | Polish | pol | 45.5M | język polski | Indo-European (Slavic) | T |
| 42 | Burmese | mya | 44.5M | မြန်မာစကား | Sino-Tibetan (Burmo-Qiangic) | — |
| 43 | Algerian Arabic | arq | 43.4M | العامية | Afroasiatic (Semitic) | — |
| 44 | Hakka Chinese | hak | 40.7M | 客家話 | Sino-Tibetan (Sinitic) | — |
| 45 | Lingala | lin | 40.6M | Lingala | Atlantic-Congo (Bantoid) | — |
| 46 | Moroccan Arabic | ary | 40.4M | الدارجة | Afroasiatic (Semitic) | — |
| 47 | Odia | ory | 39.5M | ଓଡ଼ିଆ | Indo-European (Indo-Aryan) | — |
| 48 | Malayalam | mal | 38.7M | മലയാളം | Dravidian | — |
| 49 | Xiang Chinese | hsn | 38.2M | 湘语 | Sino-Tibetan (Sinitic) | — |
| 50 | Sindhi | snd | 36.9M | سنڌي | Indo-European (Indo-Aryan) | — |
| 51 | Eastern Punjabi | pan | 36.6M | ਪੰਜਾਬੀ ਭਾਸ਼ਾ | Indo-European (Indo-Aryan) | — |
| 52 | Sundanese | sun | 35.5M | ᮘᮞ ᮞᮥᮔ᮪ᮓ | Austronesian (Sundanese) | — |
| 53 | Igbo | ibo | 34.4M | Asụsụ Igbo | Atlantic-Congo (Igboid) | — |
| 54 | Dari | prs | 33.4M | دری | Indo-European (Iranic) | — |
| 55 | Nepali | npi | 33.2M | नेपाली | Indo-European (Indo-Aryan) | — |
| 56 | Congo Swahili | swc | 32.1M | Kiswahili ya Kongo | Atlantic-Congo (Bantoid) | — |
| 57 | Northern Uzbek | uzn | 31.4M | ўзбек тили | Turkic | — |
| 58 | Ukrainian | ukr | 30.8M | українська мова | Indo-European (Slavic) | T |
| 59 | Central Malay | zlm | 29.5M | Bahasa Melayu | Austronesian (Malayo-Chamic) | T |
| 60 | Saraiki | skr | 29.1M | سرائیکی | Indo-European (Indo-Aryan) | — |
| 61 | Zulu | zul | 27.8M | isiZulu | Atlantic-Congo (Bantoid) | — |
| 62 | Sa'idi Arabic | aec | 27.4M | صعيدى | Afroasiatic (Semitic) | — |
| 63 | Northern Pashto | pbu | 27.3M | پښتو | Indo-European (Iranic) | — |
| 64 | West Central Oromo | gaz | 26.4M | Afaan Oromoo | Afroasiatic (Cushitic) | — |
| 65 | Dutch | nld | 25.4M | Nederlands | Indo-European (Germanic) | T |
| 66 | Somali | som | 25.2M | Af-Soomaali | Afroasiatic (Cushitic) | — |
| 67 | Assamese | asm | 23.6M | অসমীয়া | Indo-European (Indo-Aryan) | — |
| 68 | Romanian | ron | 23.2M | Limba română | Indo-European (Romance) | T |
| 69 | Gan Chinese | gan | 22.6M | 江西話 | Sino-Tibetan (Sinitic) | — |
| 70 | Southern Pashto | pbt | 21.7M | پښتو | Indo-European (Iranic) | — |
| 71 | Cebuano | ceb | 21.4M | Binisaya | Austronesian (Greater Central Philippine) | — |
| 72 | Najdi Arabic | ars | 21.0M | نجدي | Afroasiatic (Semitic) | — |
| 73 | Magahi | mag | 21.0M | मगही | Indo-European (Indo-Aryan) | — |
| 74 | Sinhala | sin | 20.4M | සිංහල | Indo-European (Indo-Aryan) | — |
| 75 | Khmer | khm | 20.3M | ខ្មែរ | Austroasiatic | — |
| 76 | Kazakh | kaz | 20.2M | қазақ тілі | Turkic | — |
| 77 | Mesopotamian Arabic | acm | 20.2M | اللهجة العراقية | Afroasiatic (Semitic) | — |
| 78 | Xhosa | xho | 19.2M | isiXhosa | Atlantic-Congo (Bantoid) | — |
| 79 | Afrikaans | afr | 18.1M | Afrikaans | Indo-European (Germanic) | — |
| 80 | Nigerian Fulfulde | fuv | 18.0M | 𞤊𞤵𞤤𞤬𞤵𞤤𞤣𞤫 | Atlantic-Congo (North-Central-Atlantic) | — |
| 81 | Maithili | mai | 17.6M | मैथिली | Indo-European (Indo-Aryan) | — |
| 82 | Kurmanji Kurdish | kmr | 17.2M | Kurmancî | Indo-European (Iranic) | — |
| 83 | Wolof | wol | 17.4M | Wolof làkk | Atlantic-Congo (North-Central Atlantic) | — |
| 84 | Chhattisgarhi | hne | 16.3M | छत्तीसगढ़ी | Indo-European (Indo-Aryan) | — |
| 85 | Kinyarwanda | kin | 15.3M | Ikinyarwanda | Atlantic-Congo (Bantoid) | — |
| 86 | Sanaani Arabic | ayn | 15.2M | يمني | Afroasiatic (Semitic) | — |
| 87 | Chichewa | nya | 14.5M | Chicheŵa | Atlantic-Congo (Bantoid) | — |
| 88 | Bambara | bam | 14.4M | ߓߡߊߣߊ߲ߞߊ߲ | Mande | — |
| 89 | Isan | tts | 15.1M | อีสาน | Tai-Kadai | — |
| 90 | Shona | sna | 14.1M | ChiShona | Atlantic-Congo (Bantoid) | — |
| 91 | Ta'izzi-Adeni Arabic | acq | 14.1M | لهجة تعزية عدنية | Afroasiatic (Semitic) | — |
| 92 | Haitian Creole | hat | 13.8M | Kreyòl Ayisyen | Indo-European (Romance Creole) | — |
| 93 | Sepedi | nso | 13.7M | Sesotho sa Leboa | Atlantic-Congo (Bantoid) | — |
| 94 | Bavarian | bar | 13.7M | Boarisch | Indo-European (Germanic) | — |
| 95 | Setswana | tsn | 13.7M | Setswana | Atlantic-Congo (Bantoid) | — |
| 96 | Uyghur | uig | 13.6M | ئۇيغۇر تىلى | Turkic | — |
| 97 | Sesotho | sot | 13.5M | Sesotho | Atlantic-Congo (Bantoid) | — |
| 98 | South Azerbaijani | azb | 13.3M | آذربایجانجا | Turkic | — |
| 99 | Greek | ell | 13.2M | Νέα Ελληνικά | Indo-European (Hellenic) | T |
| 100 | Chittagonian | ctg | 13.0M | চাঁটগাঁইয়া বুলি | Indo-European (Indo-Aryan) | — |
| 101 | Kirundi | run | 12.9M | Ikirundi | Atlantic-Congo (Bantoid) | — |
| 102 | Dyula | dyu | 12.8M | ߖߎ߬ߟߊ߬ߞߊ߲ | Mande | — |
| 103 | Hungarian | hun | 12.8M | Magyar | Uralic | T |
| 104 | Deccan | dcc | 12.8M | دکھنی | Indo-European (Indo-Aryan) | — |
| 105 | Bajjika | vjk | 12.7M | बज्जिका | Indo-European (Indo-Aryan) | — |
| 106 | Luganda | lug | 12.6M | Luganda | Atlantic-Congo (Bantoid) | — |
| 107 | Tunisian Arabic | aeb | 12.6M | تونسي | Afroasiatic (Semitic) | — |
| 108 | Kituba | ktu | 12.4M | Kikongo ya Leta | Atlantic-Congo (Bantoid Creole) | — |
| 109 | Hijazi Arabic | acw | 12.4M | حجازي | Afroasiatic (Semitic) | — |
| 110 | Czech | ces | 12.2M | Čeština | Indo-European (Slavic) | T |
| 111 | Sadri | sck | 12.1M | सादरी | Indo-European (Indo-Aryan) | — |
| 112 | Mooré | mos | 12.1M | Moore | Atlantic-Congo (North Volta-Congo) | — |
| 113 | Cameroon Pidgin | wes | 12.0M | Wes Cos | Indo-European (Germanic Creole) | — |
| 114 | Sylheti | syl | 11.9M | ꠍꠤꠟꠐꠤ | Indo-European (Indo-Aryan) | — |
| 115 | Eastern Oromo | hae | 11.8M | Afaan Oromoo | Afroasiatic (Cushitic) | — |
| 116 | Min Bei Chinese | mnp | 11.7M | 閩北語 | Sino-Tibetan (Sinitic) | — |
| 117 | Swedish | swe | 11.5M | Svenska | Indo-European (Germanic) | T |
| 118 | North Mesopotamian Arabic | ayp | 11.5M | مصلاوي | Afroasiatic (Semitic) | — |
| 119 | Ibibio | ibb | 11.4M | Ibibio | Atlantic-Congo (Delta-Cross) | — |
| 120 | Tigrinya | tir | 11.2M | ትግርኛ | Afroasiatic (Semitic) | — |
| 121 | Min Dong Chinese | cdo | 10.8M | 闽东话 | Sino-Tibetan (Sinitic) | — |
| 122 | Rangpuri | rkt | 10.8M | রংপুরী | Indo-European (Indo-Aryan) | — |
| 123 | Tajik | tgk | 10.7M | тоҷикӣ | Indo-European (Iranic) | — |
| 124 | Hebrew | heb | 10.5M | עברית | Afroasiatic (Semitic) | — |
| 125 | Noakhali | oak | 10.5M | নোয়াখাইল্লা | Indo-European (Indo-Aryan) | — |
| 126 | North Azerbaijani | azj | 10.3M | Azərbaycan dili | Turkic | — |
| 127 | Haryanvi | bgc | 10.3M | हरियाणवी | Indo-European (Indo-Aryan) | — |
| 128 | Borana-Arsi-Guji Oromo | gax | 10.2M | Afaan Oromoo | Afroasiatic (Cushitic) | — |
| 129 | Akan | aka | 10.1M | Akan | Atlantic-Congo (Kwa Volta-Congo) | — |
| 130 | Tsonga | tso | 10.0M | Xitsonga | Atlantic-Congo (Bantoid) | — |
| 131 | Yerwa Kanuri | knc | 9.8M | Yerwa Kanuri | Saharan | — |
| 132 | Catalan | cat | 9.3M | Català | Indo-European (Romance) | — |
| 133 | Turkmen | tuk | 9.2M | Türkmençe | Turkic | — |
| 134 | Serbian | srp | 8.7M | српски | Indo-European (Slavic) | — |
| 135 | Chadian Arabic | shu | 8.5M | العربية التشادية | Afroasiatic (Semitic) | — |
| 136 | Ilocano | ilo | 8.5M | Ilokano | Austronesian (Northern Luzon) | — |
| 137 | Umbundu | umb | 8.5M | Umbundu | Atlantic-Congo (Bantoid) | — |
| 138 | Kikuyu | kik | 8.3M | Gĩgĩkũyũ | Atlantic-Congo (Bantoid) | — |
| 139 | Gulf Arabic | afb | 8.3M | خليجي | Afroasiatic (Semitic) | — |
| 140 | Sukuma | suk | 8.1M | Kisukuma | Atlantic-Congo (Bantoid) | — |
| 141 | Kabyle | kab | 8.1M | ⵜⴰⵇⴱⴰⵢⵍⵉⵜ | Afroasiatic (Berber) | — |
| 142 | Kikongo | kng | 8.0M | Kikongo | Atlantic-Congo (Bantoid) | — |
| 143 | Santali | sat | 7.9M | Har Rar | Austroasiatic | — |
| 144 | Marwari | rwr | 7.9M | मारवाड़ी | Indo-European (Indo-Aryan) | — |
| 145 | Northern Thai | nod | 7.8M | ᨣᩴᩤᨾᩮᩬᩥᨦ | Tai-Kadai | — |
| 146 | Madurese | mad | 7.8M | Basa Mathura | Austronesian (Maduresic) | — |
| 147 | Krio of Sierra Leone | kri | 7.8M | Krio | Indo-European (Germanic Creole) | — |
| 148 | Merina Malagasy | plt | 7.5M | Malagasy ôfisialy | Austronesian (Basap–Greater Barito) | — |
| 149 | Bulgarian | bul | 7.5M | български език | Indo-European (Slavic) | — |
| 150 | Adamawa Fulfulde | fub | 7.5M | 𞤊𞤵𞤤𞤬𞤵𞤤𞤣𞤫 | Atlantic-Congo (North-Central Atlantic) | — |
| 151 | Central Pashto | pst | 7.3M | پښتو | Indo-European (Iranic) | — |
| 152 | Kashmiri | kas | 7.2M | کٲشُر | Indo-European (Indo-Aryan) | — |
| 153 | Luba-Kasai | lua | 7.1M | Ciluba | Atlantic-Congo (Bantoid) | — |
| 154 | Pulaar | fuc | 7.0M | 𞤆𞤵𞤤𞤢𞥄𞤪 | Atlantic-Congo (North-Central Atlantic) | — |
| 155 | Varhadi-Nagpuri | vah | 7.0M | वरहदी नागपुरी | Indo-European (Indo-Aryan) | — |
| 156 | Indian Sign Language | ins | 6.8M | ISL | Indo-Pakistani-Nepalese Sign | — |
| 157 | Slovak | slk | 6.7M | Slovenčina | Indo-European (Slavic) | — |
| 158 | Swiss German | gsw | 6.5M | Schwiizerdütsch | Indo-European (Germanic) | — |
| 159 | Hainanese | hnm | 6.4M | 海南话 | Sino-Tibetan (Sinitic) | — |
| 160 | Paraguayan Guaraní | gug | 6.3M | Avañe'ẽ | Tupian | — |
| 161 | Hiligaynon | hil | 6.3M | Ilonggo | Austronesian (Greater Central Philippine) | — |
| 162 | Kyrgyz | kir | 6.1M | кыргыз тили | Turkic | — |
| 163 | Libyan Arabic | ayl | 6.1M | ليبي | Afroasiatic (Semitic) | — |
| 164 | Baoulé | bci | 6.1M | Wawle | Atlantic-Congo (Kwa Volta-Congo) | — |
| 165 | Sorani Kurdish | ckb | 6.1M | زمانی سۆرانی | Indo-European (Iranic) | — |
| 166 | Hadrami Arabic | ayh | 6.0M | حضرمي | Afroasiatic (Semitic) | — |
| 167 | Kanauji | bjj | 6.0M | देहाती | Indo-European (Indo-Aryan) | — |
| 168 | Southern Kurdish | sdh | 6.0M | کوردیی باشووری | Indo-European (Iranic) | — |
| 169 | Croatian | hrv | 6.0M | Hrvatski | Indo-European (Slavic) | — |
| 170 | Tachelhit | shi | 5.8M | ⵜⴰⵛⵍⵃⵉⵢⵜ | Afroasiatic (Berber) | — |
| 171 | Danish | dan | 5.8M | Dansk | Indo-European (Germanic) | T |
| 172 | Ewe | ewe | 5.8M | Èʋegbe | Atlantic-Congo (Kwa Volta-Congo) | — |
| 173 | Napoletano | nap | 5.7M | Napulitano | Indo-European (Romance) | — |
| 174 | Hassaniyya | mey | 5.6M | حسانية | Afroasiatic (Semitic) | — |
| 175 | Bundeli | bns | 5.6M | बुन्देली | Indo-European (Indo-Aryan) | — |
| 176 | Finnish | fin | 5.6M | Suomi | Uralic | T |
| 177 | Minangkabau | min | 5.6M | Minangkabau | Austronesian (Malayo-Chamic) | — |
| 178 | Norwegian | nor | 5.5M | Norsk | Indo-European (Germanic) | T |
| 179 | Malvi | mup | 5.4M | मालवी | Indo-European (Indo-Aryan) | — |
| 180 | Huizhou Chinese | czh | 5.3M | 徽州話 | Sino-Tibetan (Sinitic) | — |
| 181 | Zarma | dje | 5.3M | Zarma sanni | Songhay | — |
| 182 | Sango | sag | 5.3M | Sängö | Atlantic-Congo (Ubangian Creole) | — |
| 183 | Kamba | kam | 5.3M | Kĩkamba | Atlantic-Congo (Bantoid) | — |
| 184 | Dholuo | luo | 5.3M | Dholuo | Nilotic | — |
| 185 | Sidaama | sid | 5.3M | Sidaamu Afoo | Afroasiatic (Cushitic) | — |
| 186 | Belarusian | bel | 5.2M | беларуская мова | Indo-European (Slavic) | — |
| 187 | Lambadi | lmn | 5.1M | బంజార | Indo-European (Indo-Aryan) | — |
| 188 | Hazaragi | haz | 5.1M | آزرگی | Indo-European (Iranic) | — |
| 189 | Ghanaian Pidgin | gpe | 5.0M | Kroo Inglish | Indo-European (Germanic Creole) | — |
| 190 | Liberian English | lir | 5.0M | Koloqua | Indo-European (Germanic Creole) | — |
| 191 | Central Atlas Tamazight | tzm | 5.0M | ⵜⴰⵎⴰⵣⵉⵖⵜ | Afroasiatic (Berber) | — |
| 192 | Tiv | tiv | 5.0M | Tiv | Atlantic-Congo (Bantoid) | — |
| 193 | Shan | shn | 4.9M | လိၵ်ႈတႆး | Tai-Kadai | — |
| 194 | Pular | fuf | 4.9M | 𞤆𞤵𞤤𞤢𞤪 | Atlantic-Congo (North-Central Atlantic) | — |
| 195 | Tatar | tat | 4.8M | татар теле | Turkic | — |
| 196 | Awadhi | awa | 4.8M | अवधी | Indo-European (Indo-Aryan) | — |
| 197 | Seswati | ssw | 4.7M | siSwati | Atlantic-Congo (Bantoid) | — |
| 198 | Gheg Albanian | aln | 4.7M | Gegnisht | Indo-European (Albanic) | — |
| 199 | Sicilian | scn | 4.7M | Sicilianu | Indo-European (Romance) | — |
| 200 | Luba-Katanga | lub | 4.7M | Kiluba | Atlantic-Congo (Bantoid) | — |

> **Coverage note:** of the top 200, we currently localize ~32 (all of which are in the top ~180). The biggest *unlocalized* high-value opportunities (by speakers, and where competitors often skip localization) include: **Yue/Wu/Min Chinese varieties, Gujarati, Kannada, Malayalam, Burmese, Nepali, Sinhala, Khmer, Kazakh, Uzbek, Amharic, Yoruba, Igbo, Zulu, and the Arabic varieties (Egyptian, Levantine, Moroccan, etc.)** — good candidates for later phases. Note several are *dialects of languages we already support* (Arabic/Chinese), which may need their own variants or careful handling.

