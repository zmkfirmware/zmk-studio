import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAndroid,
  faApple,
  faLinux,
  faWindows,
  IconDefinition,
} from "@fortawesome/free-brands-svg-icons";
import { DownloadIcon } from "lucide-react";

type Platform = "windows" | "mac" | "linux" | "ios" | "android" | "unknown";

const PlatformMetadata: Record<
  Platform,
  { name: string; icon: IconDefinition }
> = {
  windows: {
    name: "Windows",
    icon: faWindows,
  },
  mac: {
    name: "macOS",
    icon: faApple,
  },
  linux: {
    name: "Linux",
    icon: faLinux,
  },
  ios: {
    name: "iOS",
    icon: faApple,
  },
  android: {
    name: "Android",
    icon: faAndroid,
  },
  unknown: {
    name: "Unknown",
    icon: faAndroid,
  },
};

type DownloadLink = {
  name: string;
  urlPattern: RegExp;
};

const DownloadLinks: Record<string, DownloadLink> = {
  windows_exe: {
    name: "Windows Installer (exe)",
    urlPattern: /.*.exe/,
  },
  windows_msi: {
    name: "Windows Installer (msi)",
    urlPattern: /.*.msi/,
  },
  macos: {
    name: "macOS Installer",
    urlPattern: /.*.dmg/,
  },
  linux_deb: {
    name: "Linux Installer (deb)",
    urlPattern: /.*.deb/,
  },
  linux_appimage: {
    name: "Linux AppImage",
    urlPattern: /.*.AppImage/,
  },
};

const PlatformLinks: Record<Platform, DownloadLink[]> = {
  windows: [DownloadLinks.windows_exe, DownloadLinks.windows_msi],
  mac: [DownloadLinks.macos],
  linux: [DownloadLinks.linux_deb, DownloadLinks.linux_appimage],
  ios: [],
  android: [],
  unknown: [],
};

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "unknown";

  const userAgent = window.navigator.userAgent.toLowerCase();

  if (userAgent.indexOf("win") > -1) return "windows";
  if (userAgent.indexOf("mac") > -1) return "mac";
  if (userAgent.indexOf("linux") > -1) return "linux";
  if (/iphone|ipad|ipod/.test(userAgent)) return "ios";
  if (userAgent.indexOf("android") > -1) return "android";

  return "unknown";
}

function getUrlFromPattern(assets: string[], pattern: RegExp) {
  const asset = assets.find((asset) => pattern.test(asset));
  return asset;
}

export const Download = () => {
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [showAll, setShowAll] = useState(false);
  const [releaseAssets, setReleaseAssets] = useState([]);

  useEffect(() => {
    const platform = detectPlatform();
    setPlatform(platform);
    if (PlatformLinks[platform].length === 0) {
      setShowAll(true);
    }

    fetch("https://api.github.com/repos/zmkfirmware/zmk-studio/releases/latest")
      .then((response) => response.json())
      .then((data) => {
        setReleaseAssets(
          data.assets.map((asset: any) => asset.browser_download_url),
        );
      });
  }, []);

  return (
    <div className="bg-base-300 text-base-content min-h-full w-full flex flex-col justify-center items-center p-10 pb-48">
      <img src="/zmk-mac-download.webp" alt="ZMK Studio" className="w-64" />
      <div className="text-3xl mb-4">Download ZMK Studio</div>
      <div className="bg-base-100 p-8 max-w-md w-full m-2 rounded-lg shadow-xl">
        {PlatformLinks[platform].length > 0 && (
          <>
            <div className="text-2xl mb-4">
              <FontAwesomeIcon
                icon={PlatformMetadata[platform].icon}
                className="mr-2"
              />
              Download for {PlatformMetadata[platform].name}
            </div>
            <div>
              {PlatformLinks[platform].map((link) => (
                <a
                  key={link.name}
                  href={getUrlFromPattern(releaseAssets, link.urlPattern)}
                  className="p-2 mb-3 bg-primary hover:opacity-85 active:opacity-70 text-primary-content rounded-lg justify-center items-center gap-3 flex"
                >
                  <DownloadIcon />
                  {link.name}
                </a>
              ))}
            </div>
          </>
        )}
        <div className="flex flex-col gap-3">
          {PlatformLinks[platform].length > 0 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-primary text-left hover:underline"
            >
              {showAll ? "Hide" : "Show"} all downloads
            </button>
          )}
          {showAll && (
            <div>
              {Object.entries(PlatformLinks).map(([platform, links]) => (
                <div key={platform}>
                  {links.map((link) => (
                    <a
                      key={link.name}
                      href={getUrlFromPattern(releaseAssets, link.urlPattern)}
                      className="flex gap-1 mb-3 text-base-content hover:underline"
                    >
                      <DownloadIcon className="w-5" />
                      {link.name}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <a
        className="text-md hover:underline"
        href="https://github.com/zmkfirmware/zmk-studio/releases"
      >
        See GitHub Releases →
      </a>
    </div>
  );
};
