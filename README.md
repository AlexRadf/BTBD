# Night Shift — Crew Intake

A character questionnaire site for a Dread one-shot where the players are the goons on a heist.
Players pick a crew role, answer leading questions, and file their dossier. The GM pulls up every file on a separate page and can print them for the table.

- `index.html`: the player intake (briefing, role picker, questionnaire, confirmation)
- `gm.html`: the GM's case-file viewer (not linked from the player pages)
- `js/questions.js`: every question, per role. Edit freely.
- `apps-script/Code.gs`: optional Google Sheets backend

## 1. Publish on GitHub Pages

1. Merge this branch into `main`.
2. Go to **Settings → Pages**, set **Source** to *Deploy from a branch*, and pick `main` / `/ (root)`.
3. After a minute the site is live at `https://<user>.github.io/<repo>/`. The GM page is `…/gm.html`.

## 2. Choose how answers reach you

### Option A: nothing to set up (dossier codes)

With `ENDPOINT` left empty in `js/config.js`, players get a **dossier code** when they file. They paste it to you in a message, and you paste it into the GM page. Codes you paste are kept in your browser.

### Option B: Google Sheet (recommended)

Files land in a spreadsheet automatically, and the GM page pulls them in with one click.

1. Create a new Google Sheet. Open **Extensions → Apps Script**.
2. Replace the editor contents with `apps-script/Code.gs` and save.
3. Open **Project Settings (gear) → Script Properties**. Add `GM_KEY` with a password only you know.
4. Click **Deploy → New deployment**, choose type **Web app**, set *Execute as* to **Me** and *Who has access* to **Anyone**. Deploy and authorize it.
5. Copy the web app URL (it ends in `/exec`) into `js/config.js`:
   ```js
   const CONFIG = { ENDPOINT: "https://script.google.com/macros/s/…/exec" };
   ```
6. Commit and push. On `gm.html`, enter your GM key and click **Pull files**.

Each player's browser gets its own file ID, so re-filing updates their row instead of adding a new one. The sheet shows a summary in each row, with the full dossier as JSON in the last column.

If you change `Code.gs` later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.

## Running locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Notes

- GitHub Pages repos are usually public, so anything in this repo (questions, comments, commit messages) can be read by a curious player. Keep GM-only secrets out of it.
- Answers are capped at 1500 characters each. Drafts autosave in the player's browser.
- Question `id`s should stay the same once players start filling things in. Question text can change, because each filed dossier keeps a copy of the questions it answered.
