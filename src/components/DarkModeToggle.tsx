import { useTheme } from "@/providers/ThemeProvider.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Moon, Sun } from "lucide-react"
import { Menu, MenuItem, MenuTrigger } from "./ui/menu"
import { MenuPopover } from "@/components/ui/menu.tsx"

export function DarkModeToggle () {
	const { setTheme } = useTheme()

	return (
		<MenuTrigger>
			<Button variant="outline" size="icon">
				<Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
				<Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
				<span className="sr-only">Toggle theme</span>
			</Button>
			<MenuPopover>
				<Menu>
					<MenuItem onAction={() => setTheme("light")}>Light</MenuItem>
					<MenuItem onAction={()  => setTheme("dark")}>Dark</MenuItem>
					<MenuItem onAction={() => setTheme("system")}>System</MenuItem>
				</Menu>
			</MenuPopover>
		</MenuTrigger>
	)
}