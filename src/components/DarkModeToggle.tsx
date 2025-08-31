import { useTheme } from "@/providers/ThemeProvider.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Moon, Sun } from "lucide-react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup, DropdownMenuItem,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx"

export function DarkModeToggle () {
	const { setTheme } = useTheme()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Button variant="outline" size="icon">
					<Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
					<Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent >
				<DropdownMenuGroup>
					<DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
					<DropdownMenuItem onClick={()  => setTheme("dark")}>Dark</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}