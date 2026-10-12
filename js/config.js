// Your Google Apps Script web app URL (see README.md).
// Set it to "" and the site still works: players get a "dossier code"
// to send you, which you paste into the GM page.
const CONFIG = {
  ENDPOINT: "https://script.google.com/macros/s/AKfycbw1mmiMnbuXxPtJCqRzC4xi6haffUZ5UpSoTHBOQBS6vurtbTQD__gqHa_UqPbseVUQng/exec",
  // Security monitor on the briefing page. Leave src empty to use the built-in scenes,
  // or point one at a looping video clip (an .mp4 in this repo, or a direct link).
  // A recording of a whole wall of security screens: each square becomes its own camera.
  // Put the file in the repo (e.g. video/cctv-wall.mp4) and set cols/rows to match the grid.
  // Until the file exists the monitor just shows the drawn cameras below.
  CCTV_GRID: { src: "video/cctv-wall.mp4", cols: 4, rows: 3, labels: [] },
  CCTV: [
    { label: "LOBBY", src: "" },
    { label: "CORRIDOR 3F", src: "" },
    { label: "OPEN PLAN 4F", src: "" },
    { label: "ROOF ACCESS", src: "" },
  ],
};
