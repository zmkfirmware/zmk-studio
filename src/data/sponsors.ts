import niceAndTyperactive from "../assets/niceandtyperactive.png";
import niceAndTyperactiveDarkMode from "../assets/niceandtyperactive-dark-mode.png";
import kinesis from "../assets/kinesis.png";
import kinesisDarkMode from "../assets/kinesis-dark-mode.png";
import cannonKeys from "../assets/cannonkeys.png";
import cannonKeysDarkMode from "../assets/cannonkeys-dark-mode.png";
import keychron from "../assets/keychron.png";
import keychronDarkMode from "../assets/keychron-dark-mode.png";
import littleKeyboards from "../assets/littlekeyboards.avif";
import littleKeyboardsDarkMode from "../assets/littlekeyboards-dark-mode.avif";
import keebmaker from "../assets/keebmaker.png";
import keebmakerDarkMode from "../assets/keebmaker-dark-mode.png";
import keebio from "../assets/keebio.avif";
import mode from "../assets/mode.png";
import modeDarkMode from "../assets/mode-dark-mode.png";
import deskHero from "../assets/deskhero.webp";
import deskHeroDarkMode from "../assets/deskhero-dark-mode.webp";
import phaseByte from "../assets/phasebyte.png";
import mechlovin from "../assets/mechloving.png";
import mechlovinDarkMode from "../assets/mechlovin-dark-mode.png";
import splitkb from "../assets/splitkb.png";
import splitkbDarkMode from "../assets/splitkb-dark-mode.png";
import keycapsss from "../assets/keycapsss.png";
import keycapsssDarkMode from "../assets/keycapsss-dark-mode.png";
import mekibo from "../assets/mekibo.png";
import mekiboDarkMode from "../assets/mekibo-dark-mode.png";
import SponsorSize from "../enums/SponsorSize";

export default [
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
