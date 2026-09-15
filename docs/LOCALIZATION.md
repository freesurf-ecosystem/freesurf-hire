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

| # | Language | ISO | Native name | Localized |
|---|---|---|---|---|
| 1 | English | eng | English | T · R · C |
| 2 | Mandarin Chinese | cmn | 普通话 | T · R · C |
| 3 | Hindi | hin | मानक हिन्दी | T · R · C |
| 4 | Spanish | spa | español | T · R · C |
| 5 | Standard Arabic | arb | العربية | T |
| 6 | French | fra | français | T · R · C |
| 7 | Bengali | ben | বাংলা | T |
| 8 | Portuguese | por | Português | T · R · C |
| 9 | Indonesian | ind | Bahasa Indonesia | T · C |
| 10 | Urdu | urd | اُردُو | T |
| 11 | Russian | rus | русский язык | T · C |
| 12 | Standard German | deu | Deutsch | T · C |
| 13 | Japanese | jpn | 日本語 | T · R · C |
| 14 | Nigerian Pidgin | pcm | Naijá | — |
| 15 | Egyptian Arabic | arz | مصري | — |
| 16 | Marathi | mar | मराठी | T |
| 17 | Vietnamese | vie | Tiếng Việt | T · C |
| 18 | Telugu | tel | తెలుగు | T |
| 19 | Swahili | swh | Kiswahili | — |
| 20 | Hausa | hau | Hausa | T |
| 21 | Turkish | tur | Türkçe | T · C |
| 22 | Western Punjabi | pnb | پنجابی | — |
| 23 | Tagalog | tgl | Tagalog | T |
| 24 | Tamil | tam | தமிழ் | T |
| 25 | Yue Chinese | yue | 粵語 | — |
| 26 | Wu Chinese | wuu | 江南话 | — |
| 27 | Iranian Persian | pes | فارسی | T |
| 28 | Korean | kor | 한국말 | T · C |
| 29 | Amharic | amh | ኣማርኛ | — |
| 30 | Thai | tha | ภาษาไทย | T · C |
| 31 | Javanese | jav | ꦧꦱꦗꦮ | — |
| 32 | Italian | ita | Italiano | T · R · C |
| 33 | Gujarati | guj | ગુજરાત | — |
| 34 | Kannada | kan | ಕನ್ನಡ | — |
| 35 | Levantine Arabic | apc | شامي | — |
| 36 | Sudanese Arabic | apd | سوداني | — |
| 37 | Yoruba | yor | Èdè Yorùbá | — |
| 38 | Bhojpuri | bho | भोजपुरी | — |
| 39 | Jinyu Chinese | cjy | 晋语 | — |
| 40 | Min Nan Chinese | nan | 闽南语 | — |
| 41 | Polish | pol | język polski | T |
| 42 | Burmese | mya | မြန်မာစကား | — |
| 43 | Algerian Arabic | arq | العامية | — |
| 44 | Hakka Chinese | hak | 客家話 | — |
| 45 | Lingala | lin | Lingala | — |
| 46 | Moroccan Arabic | ary | الدارجة | — |
| 47 | Odia | ory | ଓଡ଼ିଆ | — |
| 48 | Malayalam | mal | മലയാളം | — |
| 49 | Xiang Chinese | hsn | 湘语 | — |
| 50 | Sindhi | snd | سنڌي | — |
| 51 | Eastern Punjabi | pan | ਪੰਜਾਬੀ ਭਾਸ਼ਾ | — |
| 52 | Sundanese | sun | ᮘᮞ ᮞᮥᮔ᮪ᮓ | — |
| 53 | Igbo | ibo | Asụsụ Igbo | — |
| 54 | Dari | prs | دری | — |
| 55 | Nepali | npi | नेपाली | — |
| 56 | Congo Swahili | swc | Kiswahili ya Kongo | — |
| 57 | Northern Uzbek | uzn | ўзбек тили | — |
| 58 | Ukrainian | ukr | українська мова | T |
| 59 | Central Malay | zlm | Bahasa Melayu | T |
| 60 | Saraiki | skr | سرائیکی | — |
| 61 | Zulu | zul | isiZulu | — |
| 62 | Sa'idi Arabic | aec | صعيدى | — |
| 63 | Northern Pashto | pbu | پښتو | — |
| 64 | West Central Oromo | gaz | Afaan Oromoo | — |
| 65 | Dutch | nld | Nederlands | T |
| 66 | Somali | som | Af-Soomaali | — |
| 67 | Assamese | asm | অসমীয়া | — |
| 68 | Romanian | ron | Limba română | T |
| 69 | Gan Chinese | gan | 江西話 | — |
| 70 | Southern Pashto | pbt | پښتو | — |
| 71 | Cebuano | ceb | Binisaya | — |
| 72 | Najdi Arabic | ars | نجدي | — |
| 73 | Magahi | mag | मगही | — |
| 74 | Sinhala | sin | සිංහල | — |
| 75 | Khmer | khm | ខ្មែរ | — |
| 76 | Kazakh | kaz | қазақ тілі | — |
| 77 | Mesopotamian Arabic | acm | اللهجة العراقية | — |
| 78 | Xhosa | xho | isiXhosa | — |
| 79 | Afrikaans | afr | Afrikaans | — |
| 80 | Nigerian Fulfulde | fuv | 𞤊𞤵𞤤𞤬𞤵𞤤𞤣𞤫 | — |
| 81 | Maithili | mai | मैथिली | — |
| 82 | Kurmanji Kurdish | kmr | Kurmancî | — |
| 83 | Wolof | wol | Wolof làkk | — |
| 84 | Chhattisgarhi | hne | छत्तीसगढ़ी | — |
| 85 | Kinyarwanda | kin | Ikinyarwanda | — |
| 86 | Sanaani Arabic | ayn | يمني | — |
| 87 | Chichewa | nya | Chicheŵa | — |
| 88 | Bambara | bam | ߓߡߊߣߊ߲ߞߊ߲ | — |
| 89 | Isan | tts | อีสาน | — |
| 90 | Shona | sna | ChiShona | — |
| 91 | Ta'izzi-Adeni Arabic | acq | لهجة تعزية عدنية | — |
| 92 | Haitian Creole | hat | Kreyòl Ayisyen | — |
| 93 | Sepedi | nso | Sesotho sa Leboa | — |
| 94 | Bavarian | bar | Boarisch | — |
| 95 | Setswana | tsn | Setswana | — |
| 96 | Uyghur | uig | ئۇيغۇر تىلى | — |
| 97 | Sesotho | sot | Sesotho | — |
| 98 | South Azerbaijani | azb | آذربایجانجا | — |
| 99 | Greek | ell | Νέα Ελληνικά | T |
| 100 | Chittagonian | ctg | চাঁটগাঁইয়া বুলি | — |
| 101 | Kirundi | run | Ikirundi | — |
| 102 | Dyula | dyu | ߖߎ߬ߟߊ߬ߞߊ߲ | — |
| 103 | Hungarian | hun | Magyar | T |
| 104 | Deccan | dcc | دکھنی | — |
| 105 | Bajjika | vjk | बज्जिका | — |
| 106 | Luganda | lug | Luganda | — |
| 107 | Tunisian Arabic | aeb | تونسي | — |
| 108 | Kituba | ktu | Kikongo ya Leta | — |
| 109 | Hijazi Arabic | acw | حجازي | — |
| 110 | Czech | ces | Čeština | T |
| 111 | Sadri | sck | सादरी | — |
| 112 | Mooré | mos | Moore | — |
| 113 | Cameroon Pidgin | wes | Wes Cos | — |
| 114 | Sylheti | syl | ꠍꠤꠟꠐꠤ | — |
| 115 | Eastern Oromo | hae | Afaan Oromoo | — |
| 116 | Min Bei Chinese | mnp | 閩北語 | — |
| 117 | Swedish | swe | Svenska | T |
| 118 | North Mesopotamian Arabic | ayp | مصلاوي | — |
| 119 | Ibibio | ibb | Ibibio | — |
| 120 | Tigrinya | tir | ትግርኛ | — |
| 121 | Min Dong Chinese | cdo | 闽东话 | — |
| 122 | Rangpuri | rkt | রংপুরী | — |
| 123 | Tajik | tgk | тоҷикӣ | — |
| 124 | Hebrew | heb | עברית | — |
| 125 | Noakhali | oak | নোয়াখাইল্লা | — |
| 126 | North Azerbaijani | azj | Azərbaycan dili | — |
| 127 | Haryanvi | bgc | हरियाणवी | — |
| 128 | Borana-Arsi-Guji Oromo | gax | Afaan Oromoo | — |
| 129 | Akan | aka | Akan | — |
| 130 | Tsonga | tso | Xitsonga | — |
| 131 | Yerwa Kanuri | knc | Yerwa Kanuri | — |
| 132 | Catalan | cat | Català | — |
| 133 | Turkmen | tuk | Türkmençe | — |
| 134 | Serbian | srp | српски | — |
| 135 | Chadian Arabic | shu | العربية التشادية | — |
| 136 | Ilocano | ilo | Ilokano | — |
| 137 | Umbundu | umb | Umbundu | — |
| 138 | Kikuyu | kik | Gĩgĩkũyũ | — |
| 139 | Gulf Arabic | afb | خليجي | — |
| 140 | Sukuma | suk | Kisukuma | — |
| 141 | Kabyle | kab | ⵜⴰⵇⴱⴰⵢⵍⵉⵜ | — |
| 142 | Kikongo | kng | Kikongo | — |
| 143 | Santali | sat | Har Rar | — |
| 144 | Marwari | rwr | मारवाड़ी | — |
| 145 | Northern Thai | nod | ᨣᩴᩤᨾᩮᩬᩥᨦ | — |
| 146 | Madurese | mad | Basa Mathura | — |
| 147 | Krio of Sierra Leone | kri | Krio | — |
| 148 | Merina Malagasy | plt | Malagasy ôfisialy | — |
| 149 | Bulgarian | bul | български език | — |
| 150 | Adamawa Fulfulde | fub | 𞤊𞤵𞤤𞤬𞤵𞤤𞤣𞤫 | — |
| 151 | Central Pashto | pst | پښتو | — |
| 152 | Kashmiri | kas | کٲشُر | — |
| 153 | Luba-Kasai | lua | Ciluba | — |
| 154 | Pulaar | fuc | 𞤆𞤵𞤤𞤢𞥄𞤪 | — |
| 155 | Varhadi-Nagpuri | vah | वरहदी नागपुरी | — |
| 156 | Indian Sign Language | ins | ISL | — |
| 157 | Slovak | slk | Slovenčina | — |
| 158 | Swiss German | gsw | Schwiizerdütsch | — |
| 159 | Hainanese | hnm | 海南话 | — |
| 160 | Paraguayan Guaraní | gug | Avañe'ẽ | — |
| 161 | Hiligaynon | hil | Ilonggo | — |
| 162 | Kyrgyz | kir | кыргыз тили | — |
| 163 | Libyan Arabic | ayl | ليبي | — |
| 164 | Baoulé | bci | Wawle | — |
| 165 | Sorani Kurdish | ckb | زمانی سۆرانی | — |
| 166 | Hadrami Arabic | ayh | حضرمي | — |
| 167 | Kanauji | bjj | देहाती | — |
| 168 | Southern Kurdish | sdh | کوردیی باشووری | — |
| 169 | Croatian | hrv | Hrvatski | — |
| 170 | Tachelhit | shi | ⵜⴰⵛⵍⵃⵉⵢⵜ | — |
| 171 | Danish | dan | Dansk | T |
| 172 | Ewe | ewe | Èʋegbe | — |
| 173 | Napoletano | nap | Napulitano | — |
| 174 | Hassaniyya | mey | حسانية | — |
| 175 | Bundeli | bns | बुन्देली | — |
| 176 | Finnish | fin | Suomi | T |
| 177 | Minangkabau | min | Minangkabau | — |
| 178 | Norwegian | nor | Norsk | T |
| 179 | Malvi | mup | मालवी | — |
| 180 | Huizhou Chinese | czh | 徽州話 | — |
| 181 | Zarma | dje | Zarma sanni | — |
| 182 | Sango | sag | Sängö | — |
| 183 | Kamba | kam | Kĩkamba | — |
| 184 | Dholuo | luo | Dholuo | — |
| 185 | Sidaama | sid | Sidaamu Afoo | — |
| 186 | Belarusian | bel | беларуская мова | — |
| 187 | Lambadi | lmn | బంజార | — |
| 188 | Hazaragi | haz | آزرگی | — |
| 189 | Ghanaian Pidgin | gpe | Kroo Inglish | — |
| 190 | Liberian English | lir | Koloqua | — |
| 191 | Central Atlas Tamazight | tzm | ⵜⴰⵎⴰⵣⵉⵖⵜ | — |
| 192 | Tiv | tiv | Tiv | — |
| 193 | Shan | shn | လိၵ်ႈတႆး | — |
| 194 | Pular | fuf | 𞤆𞤵𞤤𞤢𞤪 | — |
| 195 | Tatar | tat | татар теле | — |
| 196 | Awadhi | awa | अवधी | — |
| 197 | Seswati | ssw | siSwati | — |
| 198 | Gheg Albanian | aln | Gegnisht | — |
| 199 | Sicilian | scn | Sicilianu | — |
| 200 | Luba-Katanga | lub | Kiluba | — |

> **Coverage note:** of the top 200, we currently localize ~32 (all of which are in the top ~180). The biggest *unlocalized* high-value opportunities (by speakers, and where competitors often skip localization) include: **Yue/Wu/Min Chinese varieties, Gujarati, Kannada, Malayalam, Burmese, Nepali, Sinhala, Khmer, Kazakh, Uzbek, Amharic, Yoruba, Igbo, Zulu, and the Arabic varieties (Egyptian, Levantine, Moroccan, etc.)** — good candidates for later phases. Note several are *dialects of languages we already support* (Arabic/Chinese), which may need their own variants or careful handling.

---

## 6. Country roll-out potential (Whisper-compatible)

Countries where the **primary language is supported by Whisper** (so the transcriber can actually process it). **Whisper ASR** = can transcribe; **Localized** = app UI already ships strings (T Transcriber, R Reader, C Calorie).

- **Ready now** = localized + Whisper-compatible.
- **Localize-then-launch** = Whisper-compatible but UI not yet localized (good expansion targets).
- **Not yet** = primary language isn't in Whisper's set (transcriber can't process it).

| Country / Region | Main language(s) | Whisper ASR | Localized |
|---|---|---|---|
| **North America** | | | |
| United States | English, Spanish | Y | T · R · C |
| Canada | English, French | Y | T · R · C |
| Mexico | Spanish | Y | T · R · C |
| **Latin America & Caribbean** | | | |
| Brazil | Portuguese | Y | T · R · C |
| Argentina | Spanish | Y | T · R · C |
| Colombia | Spanish | Y | T · R · C |
| Peru | Spanish | Y | T · R · C |
| Chile | Spanish | Y | T · R · C |
| Venezuela | Spanish | Y | T · R · C |
| Ecuador | Spanish | Y | T · R · C |
| Guatemala | Spanish | Y | T · R · C |
| Bolivia | Spanish | Y | T · R · C |
| Cuba | Spanish | Y | T · R · C |
| Dominican Republic | Spanish | Y | T · R · C |
| Honduras | Spanish | Y | T · R · C |
| Paraguay | Spanish | Y | T · R · C |
| El Salvador | Spanish | Y | T · R · C |
| Nicaragua | Spanish | Y | T · R · C |
| Costa Rica | Spanish | Y | T · R · C |
| Panama | Spanish | Y | T · R · C |
| Uruguay | Spanish | Y | T · R · C |
| Puerto Rico | Spanish | Y | T · R · C |
| Haiti | French, Haitian Creole | Y | T · R · C |
| **Europe** | | | |
| Spain | Spanish | Y | T · R · C |
| Portugal | Portuguese | Y | T · R · C |
| France | French | Y | T · R · C |
| Italy | Italian | Y | T · R · C |
| Germany | German | Y | T · C |
| Austria | German | Y | T · C |
| Switzerland | German, French, Italian | Y | T · R · C |
| Netherlands | Dutch | Y | T |
| Belgium | Dutch, French | Y | T · R · C |
| Ireland | English | Y | T · R · C |
| United Kingdom | English | Y | T · R · C |
| Poland | Polish | Y | T |
| Sweden | Swedish | Y | T |
| Norway | Norwegian | Y | T |
| Denmark | Danish | Y | T |
| Finland | Finnish, Swedish | Y | T |
| Czechia | Czech | Y | T |
| Greece | Greek | Y | T |
| Romania | Romanian | Y | T |
| Hungary | Hungarian | Y | T |
| Ukraine | Ukrainian | Y | T |
| Russia | Russian | Y | T · C |
| Belarus | Belarusian, Russian | Y | T · C |
| Moldova | Romanian | Y | T |
| Croatia | Croatian | Y | — |
| Serbia | Serbian | Y | — |
| Bulgaria | Bulgarian | Y | — |
| Slovakia | Slovak | Y | — |
| Slovenia | Slovenian | Y | — |
| Estonia | Estonian | Y | — |
| Latvia | Latvian | Y | — |
| Lithuania | Lithuanian | Y | — |
| Iceland | Icelandic | Y | — |
| Malta | Maltese, English | Y | T · R · C |
| Albania | Albanian | Y | — |
| North Macedonia | Macedonian | Y | — |
| **Middle East & Central Asia** | | | |
| Turkey | Turkish | Y | T · C |
| Cyprus | Greek, Turkish | Y | T · C |
| Israel | Hebrew, Arabic | Y | T |
| Saudi Arabia | Arabic | Y | T |
| United Arab Emirates | Arabic | Y | T |
| Egypt | Arabic | Y | T |
| Algeria | Arabic, French | Y | T · R · C |
| Morocco | Arabic, French | Y | T · R · C |
| Tunisia | Arabic, French | Y | T · R · C |
| Iraq | Arabic | Y | T |
| Jordan | Arabic | Y | T |
| Lebanon | Arabic, French | Y | T · R · C |
| Kuwait | Arabic | Y | T |
| Qatar | Arabic | Y | T |
| Oman | Arabic | Y | T |
| Bahrain | Arabic | Y | T |
| Yemen | Arabic | Y | T |
| Syria | Arabic | Y | T |
| Iran | Persian | Y | T |
| Afghanistan | Persian (Dari), Pashto | Y | T |
| Azerbaijan | Azerbaijani | Y | — |
| Armenia | Armenian | Y | — |
| Georgia | Georgian | Y | — |
| Kazakhstan | Kazakh, Russian | Y | T · C |
| Uzbekistan | Uzbek, Russian | Y | T · C |
| Kyrgyzstan | Kyrgyz, Russian | Y | T · C |
| Tajikistan | Tajik | Y | — |
| **Africa** | | | |
| Nigeria | English, Hausa, Yoruba, Igbo | Y | T (Hausa) · English T · R · C |
| Kenya | Swahili, English | Y | T · R · C |
| Tanzania | Swahili | Y | — |
| Uganda | English, Swahili | Y | T · R · C |
| Ethiopia | Amharic | Y | — |
| South Africa | English, Zulu, Afrikaans, Xhosa | Y | T · R · C |
| Ghana | English | Y | T · R · C |
| Senegal | French, Wolof | Y | T · R · C |
| Ivory Coast | French | Y | T · R · C |
| Cameroon | French, English | Y | T · R · C |
| DR Congo | French, Lingala, Swahili | Y | T · R · C |
| Angola | Portuguese | Y | T · R · C |
| Mozambique | Portuguese | Y | T · R · C |
| Madagascar | French, Malagasy | Y | T · R · C |
| **South Asia** | | | |
| India | Hindi, Bengali, Tamil, Telugu, Marathi, Urdu, Gujarati, Kannada, Malayalam, Punjabi | Y | T (many) · Hindi R · C |
| Pakistan | Urdu, Punjabi, Sindhi, Pashto | Y | T |
| Bangladesh | Bengali | Y | T |
| Sri Lanka | Sinhala, Tamil | Y | T (Tamil) |
| Nepal | Nepali | Y | — |
| **East & Southeast Asia** | | | |
| China | Mandarin | Y | T · R · C |
| Taiwan | Mandarin | Y | T · R · C |
| Hong Kong | Cantonese (Yue) | N | — |
| Japan | Japanese | Y | T · R · C |
| South Korea | Korean | Y | T · C |
| Vietnam | Vietnamese | Y | T · C |
| Thailand | Thai | Y | T · C |
| Indonesia | Indonesian | Y | T · C |
| Malaysia | Malay | Y | T |
| Philippines | Tagalog, English | Y | T |
| Singapore | English, Mandarin, Malay, Tamil | Y | T · R · C |
| Myanmar | Burmese | Y | — |
| Cambodia | Khmer | Y | — |
| Laos | Lao | Y | — |
| Mongolia | Mongolian | Y | — |
| **Oceania** | | | |
| Australia | English | Y | T · R · C |
| New Zealand | English, Maori | Y | T · R · C |

> **How to read this:** anything marked **Y** in Whisper ASR is a market the transcriber can already serve today; where Localized is `—`, the app would need UI localization before a full launch. Rows with **N** (e.g. Hong Kong/Cantonese) can't be transcribed by the current model.


