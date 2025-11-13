import {keyboard} from "./keyboard.ts"
import {consumer} from "./consumer.ts"
import {ac} from "@/data/keys/ac.ts";
import {contact} from "@/data/keys/contact.ts";
import {al} from "@/data/keys/al.ts";
import {media} from "@/data/keys/media.ts";


export interface KeyboardKeys {
	Kind: string
	Id: number
	Name: string
	UsageIds: Keys[]
	UsageIdGenerator: null
	slug: string
}

export interface Keys {
	Id: number
	Name: string
	Label?: string
	Label2?: string
	Kinds?: string[]
	w?: number
	h?: number
	x?: number
	y?: number
}

export const keyboards: KeyboardKeys[] = [
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
