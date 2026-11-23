# executiveproducing.com

The website of C.Y. Lee, a Seattle music nerd who pays for independent artists' work before it exists. It's laid out like a film's closing credits: his name on the title card, then every artist he has executive-produced or backed, each with what he funded, a short bio, links, and a player.

**Live:** https://executiveproducing.com

## Run it locally

```bash
npm run build      # writes dist/
npx wrangler dev   # serves dist/ at http://localhost:8787
```

No install step and no keys. The build is one Node script (`build.mjs`, Node 20+) with no dependencies.

## Editing the credits

Everything on the page comes from [`src/credits.json`](src/credits.json):

- `cy`: the title card, liner notes, facts, quote, and contact links.
- `credits`: the handful of artists that roll large, in order. `role` and `work` are the left column, `name` the right. `backed` and `source` say what C.Y. funded and where it's documented. `embed` is an optional player (`spotify` with an id like `album/…`, `bandcamp` with `album=…`, `youtube` with a video id).
- `moreCredits`: every other artist, same fields, shown as two columns of compact rows under the `moreCreditsLabel` heading. Move an entry between the two lists to promote or demote it.
- `projects`: the "Projects & Documentaries" groups. An item takes the same fields as a credit, minus `role` and `work`, plus a `url` whose domain shows under the name.
- `interviews`: the "In conversation" section.

Then run `npm run build`.

## How it's built

A Node script renders the JSON into one static HTML page, with a little vanilla JS for the players, the top bar that tracks which section you're in, the photo that follows your pointer, and the "Roll credits" button. Cloudflare Workers static assets serves it (`wrangler.jsonc`), and `npm run deploy` builds and ships it.

Photos aren't in this repo. They live in the ignored `private-assets/` folder (see [ASSETS.md](ASSETS.md)), and the build copies them in when they're present. Without them the site still builds, just without photos.

`npm run deploy` is the exception. If any photo the site uses is missing, it stops before publishing and lists the files, so the live site can't lose its photos by accident. Get a copy of `private-assets/` from someone who has it before you deploy.

## License

Code: [MIT](LICENSE). Text, the share image, and media: see [ASSETS.md](ASSETS.md).

Made by [Jonathan Mann](https://jonathanmann.net) (Song A Day).
