import { keyboard } from "./keyboard.ts"
import { consumer } from "./consumer.ts"
import {ac} from "@/data/keys/ac.ts";
import {contact} from "@/data/keys/contact.ts";
import {al} from "@/data/keys/al.ts";
import {media} from "@/data/keys/media.ts";

export const keyboards = [
	{
		Kind: "Defined",
		Id: 7,
		Name: "Keyboard/Keypad",
		UsageIds: keyboard,
		UsageIdGenerator: null,
		slug: "keyboard"
	},
	{
		Kind: "Defined",
		Id: 12,
		Name: "Consumer",
		UsageIds: consumer,
		UsageIdGenerator: null,
		slug: "consumer"
	},
	{
		Kind: "Defined",
		Id: 12,
		Name: "AC",
		UsageIds: ac,
		UsageIdGenerator: null,
		slug: "ac"
	},
	{
		Kind: "Defined",
		Id: 12,
		Name: "AL",
		UsageIds: al,
		UsageIdGenerator: null,
		slug: "al"
	},
	{
		Kind: "Defined",
		Id: 12,
		Name: "Contact",
		UsageIds: contact,
		UsageIdGenerator: null,
		slug: "ac"
	},
	{
		Kind: "Defined",
		Id: 12,
		Name: "Media",
		UsageIds: media,
		UsageIdGenerator: null,
		slug: "media"
	}
]
