import fs from "fs/promises";
import path from "path";
import url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.resolve(__filename, "../..");

async function generateReleaseData() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/zmkfirmware/zmk-studio/releases/latest",
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const dataFilePath = path.resolve(__dirname, "src", "data", "release-data.json");
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(data));

    console.log("Release data generated successfully!");
  } catch (error) {
    console.error("Error generating release data:", error);
    process.exit(1);
  }
}

generateReleaseData();
