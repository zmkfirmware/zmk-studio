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
import releaseData from "./data/release-data.json";

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
    name: "Windows (exe)",
    urlPattern: /.*\.exe/,
  },
  windows_msi: {
    name: "Windows (msi)",
    urlPattern: /.*\.msi/,
  },
  macos: {
    name: "macOS",
    urlPattern: /.*\.dmg/,
  },
  linux_appimage: {
    name: "Linux (AppImage)",
    urlPattern: /.*\.AppImage/,
  },
  linux_deb: {
    name: "Linux (deb)",
    urlPattern: /.*\.deb/,
  },
};

const PlatformLinks: Record<Platform, DownloadLink[]> = {
  windows: [DownloadLinks.windows_exe, DownloadLinks.windows_msi],
  mac: [DownloadLinks.macos],
  linux: [DownloadLinks.linux_appimage, DownloadLinks.linux_deb],
  ios: [],
  android: [],
  unknown: [],
};

const ReleaseAssets = releaseData.assets.map((asset: any) => asset.browser_download_url);
const ReleaseVersion = releaseData.tag_name;

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "unknown";

  const userAgent = window.navigator.userAgent.toLowerCase();

  if (userAgent.includes("win")) return "windows";
  if (userAgent.includes("mac")) return "mac";
  if (userAgent.includes("linux")) return "linux";
  if (/iphone|ipad|ipod/.test(userAgent)) return "ios";
  if (userAgent.includes("android")) return "android";

  return "unknown";
}

function getUrlFromPattern(assets: string[], pattern: RegExp) {
  const asset = assets.find((asset) => pattern.test(asset));
  return asset;
}

export const Download = () => {
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const platform = detectPlatform();
    setPlatform(platform);
    if (PlatformLinks[platform].length === 0) {
      setShowAll(true);
    }
  }, []);

  return (
    <div className="bg-base-200 dark:bg-base-300 text-base-content min-h-full w-full flex flex-col justify-center items-center p-10 pb-48">
      <img src="/zmk-mac-app-icon.webp" alt="ZMK Studio" className="w-64" />
      <div className="text-3xl mb-1">ZMK Studio</div>
      <div className="text-md mb-1 opacity-70">
        {ReleaseVersion}
      </div>
      <div className="bg-base-100 p-8 max-w-md w-full m-2 rounded-lg shadow-lg dark:shadow-xl">
        {PlatformLinks[platform].length > 0 && (
          <>
            <div className="flex flex-col gap-3 mb-3">
              {PlatformLinks[platform].map((link) => (
                <a
                  key={link.name}
                  href={getUrlFromPattern(ReleaseAssets, link.urlPattern)}
                  className="p-3 text-lg bg-primary hover:opacity-85 active:opacity-70 text-primary-content rounded-lg justify-center items-center gap-3 flex"
                >
                  <FontAwesomeIcon icon={PlatformMetadata[platform].icon} className="h-6"/>{" "}
                  Download for {link.name}
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
                      href={getUrlFromPattern(ReleaseAssets, link.urlPattern)}
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
