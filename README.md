# executiveproducing.com

The website of C.Y. Lee, a Seattle music nerd who pays for independent artists' work before it exists. It's laid out like a film's closing credits: his name on the title card, then every artist he has executive-produced or backed, each with what he funded, a short bio, links, and a player.

**Live:** https://executiveproducing.com

## Run it locally

```bash
npm run build      # writes dist/
npx wrangler dev   # serves dist/ at http://localhost:8787
```

No install step and no keys. The build is a Node script (`build.mjs`, Node 20+) with no dependencies.

## Editing the credits

Everything on the page comes from [`src/credits.json`](src/credits.json):

- `cy`: the title card, liner notes, facts, quote, and contact links.
- `credits`: the handful of artists that roll large, in order. `role` and `work` are the left column, `name` the right. `backed` and `source` say what C.Y. funded and where it's documented. `embed` is an optional player (`spotify` with an id like `album/…`, `bandcamp` with `album=…`, `youtube` with a video id).
- `moreCredits`: every other artist, same fields, shown as two columns of compact rows under the `moreCreditsLabel` heading. Move an entry between the two lists to promote or demote it.
- `projects`: the "Projects & Documentaries" groups. An item takes the same fields as a credit, minus `role` and `work`, plus a `url` whose domain shows under the name.
- `interviews`: the "In conversation" section.

Then run `npm run build`.

## How it's built

A Node script renders the JSON into one static HTML page, with a little vanilla JS for the players, the top bar that tracks which section you're in, the photo that follows your pointer, and the "Roll credits" button. Cloudflare Workers static assets serves it (`wrangler.jsonc`).

## Publishing

Pushing to `main` publishes the site. Cloudflare watches this repo and runs `npm run deploy` on every push to `main`, and the live site updates a minute or two later. If that build fails, the live site stays as it was. To try something without publishing it, work on another branch and merge when it's ready.

## Photos

Photos aren't in this repo (see [ASSETS.md](ASSETS.md)). The shared copy lives in a private Cloudflare R2 bucket, and on your machine they sit in the ignored `private-assets/` folder.

- `npm run build` uses whatever is in `private-assets/`. Without photos the site still builds, just without them.
- `npm run deploy`, which is what Cloudflare runs, downloads any photo the site uses that isn't there. If one can't be found it stops before publishing and lists the files, so the live site can't lose its photos by accident.
- To add or replace a photo, put it in `private-assets/`, point to it from `src/credits.json`, and run `npm run photos:push` before you push to `main`.
- `npm run photos:pull` downloads the photos the site uses onto a new machine.

The two `photos` commands need a Cloudflare login that can reach the bucket (`npx wrangler login`).

## License

Code: [MIT](LICENSE). Text, the share image, and media: see [ASSETS.md](ASSETS.md).

Made by [Jonathan Mann](https://jonathanmann.net) (Song A Day).
