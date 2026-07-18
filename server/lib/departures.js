const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'config', 'departures.json');

// Re-read on every call — this file is meant to be hand-edited on the
// server without requiring a code change or redeploy, just a restart is
// not even required since we read fresh each time.
function loadDepartures() {
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  const list = JSON.parse(raw);
  return list.filter((d) => d.active !== false);
}

function getDeparture(id) {
  return loadDepartures().find((d) => d.id === id) || null;
}

module.exports = { loadDepartures, getDeparture };
