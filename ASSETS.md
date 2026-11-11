# Assets

The code in this repository is covered by [LICENSE](LICENSE). This file covers everything that isn't code: where each asset came from, what you may do with it, and how to get the assets that aren't included.

## 1. Ours: included and open

Unless a row says otherwise, these are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Credit "Jonathan Mann (Song A Day)".

| Path | What it is | Made with | License |
| --- | --- | --- | --- |
| `src/credits.json` | The site's copy: bios and descriptions, written for this site from the public sources each credit links to | Jonathan Mann, with Claude | CC BY 4.0. The facts belong to no one, and the names and works are their owners'. |
| `src/og.png` | The share image | ImageMagick, with the fonts below | CC BY 4.0 |
| `src/favicon.svg` | "EP" tab icon | Hand-written SVG | CC BY 4.0 |

## 2. Free third-party: included under their own licenses

| Path | Source (link) | Author | License |
| --- | --- | --- | --- |
| Instrument Serif (loaded from Google Fonts, not bundled) | https://fonts.google.com/specimen/Instrument+Serif | The Instrument Serif Project Authors | OFL 1.1 |
| Archivo (loaded from Google Fonts, not bundled) | https://fonts.google.com/specimen/Archivo | The Archivo Project Authors (Omnibus-Type) | OFL 1.1 |

## 3. Licensed (paid or restricted): not included

None.

## 4. Not ours and not licensed: never in the repo

These live in the ignored `private-assets/` folder. They were downloaded on October 22, 2026, from each artist's own pages and profiles, to show each credit, and remain their owners'. `build.mjs` copies them into the deployed site when they're present. Without them the site builds with no photos.

| Expected path | What it is | Source | Why it's excluded |
| --- | --- | --- | --- |
| `private-assets/images/cy-lee.webp` | Photo of C.Y. Lee holding an ice cream cone | Jonathan Mann's songaday.studio site bundle (`songaday-studios/private-assets/site/images/cy-lee.webp`) | A photo of a real person; the photographer is not recorded |
| `private-assets/artists/ahmed-sirour.webp` | A.S. I Am, Part Two (Set 1) cover (Bandcamp), cropped to 480px | https://f4.bcbits.com/img/a3034282342_10.jpg | The artist's or their label's own image |
| `private-assets/artists/amerge.webp` | Amerge logo (its Fractured Atlas page), cropped to 480px | https://fa-fundraising-production.cf.fracturedatlas.org/xa9dx9lt18ed5zy11towgko1apxc?response-content-type=image/png&response-content-disposition=inline;%20filename=%22731524990-Amerge%20Logo.png%22; | The artist's or their label's own image |
| `private-assets/artists/bboy-wicket.webp` | Bboy Wicket's bio photo (YBCA), cropped to 480px | https://ybca.org/wp-content/uploads/2025/05/wicket-bio-web.jpg | The artist's or their label's own image |
| `private-assets/artists/black-dave.webp` | Black Dave MK2's 2025 album cover (Spotify), cropped to 480px | https://i.scdn.co/image/ab67616d0000b273bdc3ee62f97770bf78b36856 | The artist's or their label's own image |
| `private-assets/artists/duo-do.webp` | Dúo Dø's Spotify artist image, cropped to 480px | https://i.scdn.co/image/ab6761610000e5ebd184b8a2b5c694a2572da1e4 | The artist's or their label's own image |
| `private-assets/artists/fridays-at-the-park.webp` | Fridays at The Park Season 1 cover (Spotify), cropped to 480px | https://i.scdn.co/image/ab67616d0000b273e2c50514ace01fd23a062a78 | The artist's or their label's own image |
| `private-assets/artists/house-of-paper.webp` | House of Paper's graphic on the Allied Arts Foundation site, cropped to 480px | https://images.squarespace-cdn.com/content/v1/672137e716176766b86cf7fd/f22a23c4-7105-4a7c-bb1b-8c27716ca1ea/HouseofPaper-AAF.png | The artist's or their label's own image |
| `private-assets/artists/iman-europe.webp` | Iman Europe's Spotify artist image, cropped to 480px | https://i.scdn.co/image/ab6761610000e5eb0f01bf52492c37493e1d995e | The artist's or their label's own image |
| `private-assets/artists/la-equis.webp` | LA EQUIS's Spotify artist image, cropped to 480px | https://i.scdn.co/image/ab6761610000e5eb72bec3eb96f45490ed06496a | The artist's or their label's own image |
| `private-assets/artists/latasha.webp` | LATASHÁ's Spotify artist image, cropped to 480px | https://i.scdn.co/image/ab6761610000e5ebea5ac03b1636db2a6ce6764b | The artist's or their label's own image |
| `private-assets/artists/maceagon-voyce.webp` | Guided by Voyces publication image (Substack), cropped to 480px | https://substack-post-media.s3.amazonaws.com/public/images/8b4ba382-00d3-4936-9d42-3fd29c6fab32_2012x2012.jpeg | The artist's or their label's own image |
| `private-assets/artists/rae-isla.webp` | Rae Isla's Spotify artist image, cropped to 480px | https://i.scdn.co/image/ab6761610000e5eb1a85d12278d5cd095666c337 | The artist's or their label's own image |
| `private-assets/artists/sound-of-fractures.webp` | Sound of Fractures' Spotify artist image, cropped to 480px | https://i.scdn.co/image/ab6761610000e5eb5bc5bd1767967b125c58b1b2 | The artist's or their label's own image |
| `private-assets/artists/tk-the-legend.webp` | DARKSIDE cover art (darkside.love share image), cropped to 480px | https://www.darkside.love/images/darkside-cover-og.png | The artist's or their label's own image |
| `private-assets/artists/vivid-fever-dreams.webp` | Vivid Fever Dreams' Spotify artist image, cropped to 480px | https://i.scdn.co/image/ab6761610000e5eb0b3528debd9a76b0201d17d5 | The artist's or their label's own image |
| `private-assets/artists/yuri-beats.webp` | Future Movements for Earth People cover (Spotify), cropped to 480px | https://i.scdn.co/image/ab67616d0000b27377ec7ab74f8c036f96b55632 | The artist's or their label's own image |

The players in each credit are embedded from Spotify, Bandcamp, and YouTube and load from those services. Their artwork and audio belong to the artists.

## Never commit

Ripped songs or videos, press, stock, or Getty photos, photos or likenesses of real people, other NFT collections' art, screenshots of commercial software, the source files of paid asset packs, voice models with noncommercial terms, and personal data.
