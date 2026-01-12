import fs from "fs/promises";
import path from "path";
import url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.resolve(__filename, "../..");

async function generateReleaseData(version) {
  try {
    const dataFilePath = path.resolve(
      __dirname,
      "src",
      "data",
      "release-data.json",
    );
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });

    await fs.writeFile(dataFilePath, JSON.stringify({
      version: `v${version}`,
      assets: [
        `https://github.com/zmkfirmware/zmk-studio/releases/download/v${version}/ZMK.Studio-${version}-1.x86_64.rpm`,
        `https://github.com/zmkfirmware/zmk-studio/releases/download/v${version}/ZMK.Studio_${version}_amd64.AppImage`,
        `https://github.com/zmkfirmware/zmk-studio/releases/download/v${version}/ZMK.Studio_${version}_amd64.deb`,
        `https://github.com/zmkfirmware/zmk-studio/releases/download/v${version}/ZMK.Studio_${version}_universal.dmg`,
        `https://github.com/zmkfirmware/zmk-studio/releases/download/v${version}/ZMK.Studio_${version}_x64-setup.exe`,
        `https://github.com/zmkfirmware/zmk-studio/releases/download/v${version}/ZMK.Studio_${version}_x64_en-US.msi`,
        `https://github.com/zmkfirmware/zmk-studio/releases/download/v${version}/ZMK.Studio_universal.app.tar.gz`,
      ]
    }));

    console.log("Release data generated successfully!");
  } catch (error) {
    console.error("Error generating release data:", error);
    process.exit(1);
  }
}

const argv = process.argv.slice(2)
if (argv.length < 1) {
    console.error("No version wasd specified for version data generation");
    process.exit(1);
}
generateReleaseData(argv[0]);
