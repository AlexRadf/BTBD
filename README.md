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

### If it isn't working

Open your `/exec` URL in a private/incognito window. You should see `{"ok":false,"error":"unauthorized"}`.

- **Works in a private window but not in your normal browser**: you're signed into more than one Google account. Players won't hit this; for your own testing, use a private window or a browser profile with only the account that owns the script.
- **A Google sign-in page**: under Deploy → Manage deployments, set *Who has access* to **Anyone**. "Anyone with a Google account" isn't enough.
- **"Script function not found"**, or the GM page says *got a page instead of data*: the deployment is running old code. Paste in the latest `Code.gs`, then Deploy → Manage deployments → Edit (pencil) → Version: **New version** → Deploy.
- **`GM_KEY script property is not set`**: add it under Project Settings → Script Properties.
- **An error about a spreadsheet**: the script has to be opened from the Sheet (Extensions → Apps Script). Or add a `SHEET_ID` script property with the long ID from the Sheet's URL.

Then try `…/exec?key=YOUR_GM_KEY`. It should list the files.

## The night (GM tab)

The second tab on `gm.html` is for running the game:

- **The tower**: tap *Pull* each time someone pulls a block. The gauge shows how shaky the tower is getting. *It fell* marks that goon as taken and deals you a scene describing how they vanish.
- **Pressure points**: for the selected goon, scares built from their own answers.
- **Something in the building**: draws a random unsettling beat, aimed at a goon who's still in.
- **Make a moment**: choose a kind (Scare, Turn the crew, Temptation, Close call) and a target, and it builds a ready-to-read moment: a setup somewhere in the building, a turn taken from one of that goon's answers, and the pull with what happens if they refuse. It works through answers you haven't used yet before repeating any.

Pull counts and who's been taken are saved in your browser, so a refresh mid-game is safe.

## The security monitor

The briefing page has a CCTV monitor with four cameras (lobby, corridor, open-plan office, roof). It cycles on its own (SEQ), or players can switch channels with the number keys. The scenes are drawn in code and loop forever. Every so often something happens on one of the cameras, and at 2:13 AM local time the building goes wrong.

**Footage of a whole wall of screens:** drop it in as `video/cctv-wall.mp4` and each square becomes its own camera, with an **ALL** key to see the whole wall. See `video/README.md` for the grid settings and how to shrink the file.

To use real footage on one of the drawn cameras instead, set its `src` in `js/config.js` to a looping video clip: an `.mp4` you've added to this repo (e.g. `video/lobby.mp4`) or a direct link to one. It gets the same grain, timestamp and glitches. Free clips: [Mixkit CCTV](https://mixkit.co/free-stock-video/cctv/), [Mixkit security camera](https://mixkit.co/free-stock-video/security-camera/), [Coverr office corridor](https://coverr.co/stock-video-footage/office-corridor). Check each clip's licence.

## Running locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Notes

- GitHub Pages repos are usually public, so anything in this repo (questions, comments, commit messages) can be read by a curious player. Keep GM-only secrets out of it.
- Answers are capped at 1500 characters each. Drafts autosave in the player's browser.
- Question `id`s should stay the same once players start filling things in. Question text can change, because each filed dossier keeps a copy of the questions it answered.
