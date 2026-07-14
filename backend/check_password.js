const bcrypt = require("bcryptjs");

const hashes = {
  h1: "$2a$10$fwIdhhCATNc6asUEV2nCcO..MWF8Ac03Kfa4mlWJU1VEY4jBNRNt2",
  h2: "$2a$10$WiWN/ZNVEoaBuSzfqIhE4OW9SfcPbBy.k2JpRTfwwSmPcjshk7qJq"
};

const password = "72364231Zoe@";

async function run() {
  console.log("Checking password:", password);
  for (const [name, hash] of Object.entries(hashes)) {
    const isMatch = await bcrypt.compare(password, hash);
    console.log(`${name}: ${isMatch ? "MATCH ✅" : "NO MATCH ❌"}`);
  }
}

run();
