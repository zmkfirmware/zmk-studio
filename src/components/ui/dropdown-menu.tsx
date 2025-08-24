import * as React from "react"
import {
  Menu,
  MenuTrigger,
  Popover,
  MenuItem,
  Section,
  Separator,
  Header,
  SubmenuTrigger,
  MenuItemProps,
  PopoverProps,
  Button,
  ButtonProps
} from "react-aria-components"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Root DropdownMenu component - equivalent to Radix Root
interface DropdownMenuProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function DropdownMenu({ children, open, onOpenChange }: DropdownMenuProps) {
  return (
    <MenuTrigger isOpen={open} onOpenChange={onOpenChange}>
      {children}
    </MenuTrigger>
  )
}

// Portal component - React Aria handles portaling automatically
function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// Trigger component
interface DropdownMenuTriggerProps extends ButtonProps {
  asChild?: boolean
}

function DropdownMenuTrigger({ 
  className, 
  asChild,
  children, 
  ...props 
}: DropdownMenuTriggerProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props
    })
  }

  return (
    <Button
      slot="trigger"
      className={className}
      {...props}
    >
      {children}
    </Button>
  )
}

// Content component - equivalent to Radix Content
interface DropdownMenuContentProps extends Omit<PopoverProps, 'children'> {
  className?: string
  sideOffset?: number
  children?: React.ReactNode
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: DropdownMenuContentProps) {
  return (
    <Popover
      offset={sideOffset}
      className={cn(
        "bg-popover text-popover-foreground data-[entering]:animate-in data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[entering]:fade-in-0 data-[exiting]:zoom-out-95 data-[entering]:zoom-in-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md",
        className
      )}
      {...props}
    >
      <Menu className="outline-none">
        {children}
      </Menu>
    </Popover>
  )
}

// Group component - equivalent to Radix Group
interface DropdownMenuGroupProps {
  children: React.ReactNode
  className?: string
}

function DropdownMenuGroup({ children, className }: DropdownMenuGroupProps) {
  return (
    <Section className={className}>
      {children}
    </Section>
  )
}

// Item component - equivalent to Radix Item
interface DropdownMenuItemProps extends Omit<MenuItemProps, 'children'> {
  className?: string
  inset?: boolean
  variant?: "default" | "destructive"
  children?: React.ReactNode
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  children,
  ...props
}: DropdownMenuItemProps) {
  return (
    <MenuItem
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
    </MenuItem>
  )
}

// Checkbox Item component - equivalent to Radix CheckboxItem
interface DropdownMenuCheckboxItemProps extends Omit<MenuItemProps, 'children'> {
  className?: string
  children?: React.ReactNode
  checked?: boolean
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <MenuItem
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked && <CheckIcon className="size-4" />}
      </span>
      {children}
    </MenuItem>
  )
}

// Radio Group component - equivalent to Radix RadioGroup
interface DropdownMenuRadioGroupProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

function DropdownMenuRadioGroup({ 
  children, 
  value, 
  onValueChange, 
  className 
}: DropdownMenuRadioGroupProps) {
  return (
    <Section className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.props) {
          const childProps = child.props as any
          return React.cloneElement(child, {
            ...childProps,
            'data-selected': childProps.value === value,
            onAction: () => onValueChange?.(childProps.value)
          })
        }
        return child
      })}
    </Section>
  )
}

// Radio Item component - equivalent to Radix RadioItem
interface DropdownMenuRadioItemProps {
  className?: string
  children?: React.ReactNode
  value?: string
  'data-selected'?: boolean
  onAction?: () => void
  isDisabled?: boolean
}

function DropdownMenuRadioItem({
  className,
  children,
  value,
  'data-selected': dataSelected,
  onAction,
  isDisabled,
  ...props
}: DropdownMenuRadioItemProps) {
  return (
    <MenuItem
      textValue={value}
      onAction={onAction}
      isDisabled={isDisabled}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {dataSelected && <CircleIcon className="size-2 fill-current" />}
      </span>
      {children}
    </MenuItem>
  )
}

// Label component - equivalent to Radix Label
interface DropdownMenuLabelProps {
  className?: string
  inset?: boolean
  children?: React.ReactNode
}

function DropdownMenuLabel({
  className,
  inset,
  children,
  ...props
}: DropdownMenuLabelProps) {
  return (
    <Header
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    >
      {children}
    </Header>
  )
}

// Separator component - equivalent to Radix Separator
interface DropdownMenuSeparatorProps {
  className?: string
}

function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuSeparatorProps) {
  return (
    <Separator
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

// Shortcut component - custom span element
interface DropdownMenuShortcutProps extends React.ComponentProps<"span"> {
  className?: string
}

function DropdownMenuShortcut({
  className,
  ...props
}: DropdownMenuShortcutProps) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

// Sub component - submenu container
interface DropdownMenuSubProps {
  children: React.ReactNode
}

function DropdownMenuSub({ children }: DropdownMenuSubProps) {
  return (
    <MenuTrigger>
      {children}
    </MenuTrigger>
  )
}

// Sub Trigger component - equivalent to Radix SubTrigger
interface DropdownMenuSubTriggerProps extends Omit<MenuItemProps, 'children'> {
  className?: string
  inset?: boolean
  children?: React.ReactNode
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  return (
    <SubmenuTrigger {...props}>
      <MenuItem
        data-inset={inset}
        className={cn(
          "focus:bg-accent focus:text-accent-foreground data-[expanded]:bg-accent data-[expanded]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8",
          className
        )}
      >
        {children}
        <ChevronRightIcon className="ml-auto size-4" />
      </MenuItem>
      <Popover>
        <Menu className="outline-none">
          {/* Submenu content will be added here */}
        </Menu>
      </Popover>
    </SubmenuTrigger>
  )
}

// Sub Content component - equivalent to Radix SubContent
interface DropdownMenuSubContentProps extends Omit<PopoverProps, 'children'> {
  className?: string
  children?: React.ReactNode
}

function DropdownMenuSubContent({
  className,
  children,
  ...props
}: DropdownMenuSubContentProps) {
  return (
    <Popover
      className={cn(
        "bg-popover text-popover-foreground data-[entering]:animate-in data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[entering]:fade-in-0 data-[exiting]:zoom-out-95 data-[entering]:zoom-in-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    >
      <Menu className="outline-none">
        {children}
      </Menu>
    </Popover>
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}