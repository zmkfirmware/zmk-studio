import React from "react";
import { useModalRef } from "./misc/useModalRef";

import cannonKeys from "./assets/cannonkeys.png";
import cannonKeysDarkMode from "./assets/cannonkeys-dark-mode.png";

import niceAndTyperactive from "./assets/niceandtyperactive.png";
import niceAndTyperactiveDarkMode from "./assets/niceandtyperactive-dark-mode.png";

import kinesis from "./assets/kinesis.png";
import kinesisDarkMode from "./assets/kinesis-dark-mode.png";

import keychron from "./assets/keychron.png";
import keychronDarkMode from "./assets/keychron-dark-mode.png";

import littleKeyboards from "./assets/littlekeyboards.avif";
import littleKeyboardsDarkMode from "./assets/littlekeyboards-dark-mode.avif";

import keebmaker from "./assets/keebmaker.png";
import keebmakerDarkMode from "./assets/keebmaker-dark-mode.png";

import keebio from "./assets/keebio.avif";

import deskHero from "./assets/deskhero.webp";
import deskHeroDarkMode from "./assets/deskhero-dark-mode.webp";

import mode from "./assets/mode.png";
import modeDarkMode from "./assets/mode-dark-mode.png";

import mechlovin from "./assets/mechloving.png";
import mechlovinDarkMode from "./assets/mechlovin-dark-mode.png";

import phaseByte from "./assets/phasebyte.png";

import keycapsss from "./assets/keycapsss.png";
import keycapsssDarkMode from "./assets/keycapsss-dark-mode.png";

import mekibo from "./assets/mekibo.png";
import mekiboDarkMode from "./assets/mekibo-dark-mode.png";

import splitkb from "./assets/splitkb.png";
import splitkbDarkMode from "./assets/splitkb-dark-mode.png";
import { GenericModal } from "./GenericModal";
import { ExternalLink } from "./misc/ExternalLink";

export interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

enum SponsorSize {
  Large,
  Medium,
  Small,
}

const sponsors = [
  {
    level: "Platinum",
    size: SponsorSize.Large,
    vendors: [
      {
        name: "nice!keyboards / typeractive",
        img: niceAndTyperactive,
        darkModeImg: niceAndTyperactiveDarkMode,
        url: "https://typeractive.xyz/",
      },
      {
        name: "Kinesis",
        img: kinesis,
        darkModeImg: kinesisDarkMode,
        url: "https://kinesis-ergo.com/",
      },
    ],
  },
  {
    level: "Gold+",
    size: SponsorSize.Large,
    vendors: [
      {
        name: "CannonKeys",
        img: cannonKeys,
        darkModeImg: cannonKeysDarkMode,
        url: "https://cannonkeys.com/",
      },
      {
        name: "Keychron",
        img: keychron,
        darkModeImg: keychronDarkMode,
        url: "https://keychron.com/",
      },
    ],
  },
  {
    level: "Gold",
    size: SponsorSize.Medium,
    vendors: [
      {
        name: "Little Keyboards",
        img: littleKeyboards,
        darkModeImg: littleKeyboardsDarkMode,
        url: "https://littlekeyboards.com/",
      },
      {
        name: "Keebmaker",
        img: keebmaker,
        darkModeImg: keebmakerDarkMode,
        url: "https://keebmaker.com/",
      },
    ],
  },
  {
    level: "Silver",
    size: SponsorSize.Medium,
    vendors: [
      {
        name: "keeb.io",
        img: keebio,
        url: "https://keeb.io/",
      },
      {
        name: "Mode Designs",
        img: mode,
        darkModeImg: modeDarkMode,
        url: "https://modedesigns.com/",
      },
    ],
  },
  {
    level: "Bronze",
    size: SponsorSize.Small,
    vendors: [
      {
        name: "deskhero",
        img: deskHero,
        darkModeImg: deskHeroDarkMode,
        url: "https://deskhero.ca/",
      },
      {
        name: "PhaseByte",
        img: phaseByte,
        url: "https://phasebyte.com/",
      },
      {
        name: "Mechlovin'",
        img: mechlovin,
        darkModeImg: mechlovinDarkMode,
        url: "https://mechlovin.studio/",
      },
    ],
  },
  {
    level: "Additional",
    size: SponsorSize.Small,
    vendors: [
      {
        name: "splitkb.com",
        img: splitkb,
        darkModeImg: splitkbDarkMode,
        url: "https://splitkb.com/",
      },
      {
        name: "keycapsss",
        img: keycapsss,
        darkModeImg: keycapsssDarkMode,
        url: "https://keycapsss.com/",
      },
      {
        name: "mekibo",
        img: mekibo,
        darkModeImg: mekiboDarkMode,
        url: "https://mekibo.com/",
      },
    ],
  },
];

export const AboutModal = ({ open, onClose }: AboutModalProps) => {
  const ref = useModalRef(open, true);

  return (
    <GenericModal ref={ref} className="w-[70vw] min-w-min" onClose={onClose}>
      <div className="flex items-start justify-between">
        <p>
          The ZMK Project:{" "}
          <ExternalLink href="https://zmk.dev/">website</ExternalLink>,{" "}
          <ExternalLink href="https://github.com/zmkfirmware/zmk/issues/">
            GitHub Issues
          </ExternalLink>
          ,{" "}
          <ExternalLink href="https://zmk.dev/community/discord/invite">
            Discord Server
          </ExternalLink>
        </p>
        <button
          className="rounded-md bg-gray-100 p-1.5 text-black hover:bg-gray-300"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <div>
        <p className="mr-2 py-1">
          ZMK Studio is made possible thanks to the generous donation of time
          from our contributors, as well as the financial sponsorship from the
          following vendors:
        </p>
      </div>
      <div className="grid auto-rows-auto grid-cols-[auto_minmax(min-content,1fr)] items-center justify-items-center gap-2">
        {sponsors.map((s) => {
          const heightVariants = {
            [SponsorSize.Large]: "h-16",
            [SponsorSize.Medium]: "h-12",
            [SponsorSize.Small]: "h-8",
          };

          return (
            <React.Fragment key={s.level}>
              <label>{s.level}</label>
              <div
                className={`grid auto-cols-fr grid-flow-col grid-rows-1 items-center justify-items-center gap-x-1 ${
                  heightVariants[s.size]
                }`}
              >
                {s.vendors.map((v) => {
                  const maxSizeVariants = {
                    [SponsorSize.Large]: "max-h-16",
                    [SponsorSize.Medium]: "max-h-12",
                    [SponsorSize.Small]: "max-h-8",
                  };

                  return (
                    <a key={v.name} href={v.url} target="_blank">
                      <picture aria-label={v.name}>
                        {v.darkModeImg && (
                          <source
                            className={maxSizeVariants[s.size]}
                            srcSet={v.darkModeImg}
                            media="(prefers-color-scheme: dark)"
                          />
                        )}
                        <img className={maxSizeVariants[s.size]} src={v.img} />
                      </picture>
                    </a>
                  );
                })}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </GenericModal>
  );
};
