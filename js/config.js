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
  // `tile` is where the squares sit in the 1920×1080 recording; `inset` trims each square's
  // burned-in frame lines, caption and timestamp.
  CCTV_GRID: {
    src: "video/cctv-wall.mp4",
    cols: 4,
    rows: 3,
    tile: { x: 34, y: 33, w: 454, h: 337, stepX: 466, stepY: 354 },
    inset: { top: 46, right: 28, bottom: 48, left: 28 },
    labels: [
      "ATRIUM ESC. 1", "ATRIUM ESC. 2", "MAIN CONCOURSE", "MEZZANINE",
      "WEST ENTRANCE", "STAIR CORE B", "ESC. 7 LOWER", "TRAFFIC 08",
      "TRAFFIC 09", "ROOF · SOUTH", "OVERPASS", "CROSSING 12",
    ],
  },
  CCTV: [
    { label: "LOBBY", src: "" },
    { label: "CORRIDOR 3F", src: "" },
    { label: "OPEN PLAN 4F", src: "" },
    { label: "ROOF ACCESS", src: "" },
  ],
};
