import React, { forwardRef } from 'react';
import type { 
  ComponentPropsWithoutRef,
  ElementRef,
  ReactNode,
  ForwardRefExoticComponent,
  RefAttributes,
  MouseEventHandler as ReactMouseEventHandler,
  JSXElementConstructor,
  DetailedHTMLProps,
  HTMLAttributes
} from 'react';
import * as RadixDialog from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "../../lib/utils.js";
import DialogComponent from './dialog.js';

const { Root: DialogRoot, Content: DialogContentComponent } = DialogComponent;

type DialogRootProps = ComponentPropsWithoutRef<typeof DialogRoot>;
type DialogContentProps = ComponentPropsWithoutRef<typeof DialogContentComponent> & {
  className?: string;
  children?: ReactNode;
};

interface CommandDialogProps extends DialogRootProps {
  children?: ReactNode;
}

type SpanProps = DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;

interface CommandShortcutProps extends SpanProps {
  className?: string;
}

const DialogContentMemo = React.memo(function DialogContent({ className, children, ...props }: DialogContentProps) {
  return (
    <div className={cn("overflow-hidden p-0 shadow-lg", className)} {...props}>
      {children}
    </div>
  );
});

const Command = React.memo(forwardRef<ElementRef<typeof CommandPrimitive>, ComponentPropsWithoutRef<typeof CommandPrimitive>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-white dark:bg-gray-800",
        className
      )}
      {...props}
    />
  )
));
Command.displayName = CommandPrimitive.displayName;

const CommandDialogContent = React.memo(forwardRef<ElementRef<typeof DialogContentComponent>, DialogContentProps>(
  ({ className, children, ...props }, ref) => (
    <DialogContentMemo {...props} className={className}>
      <CommandPrimitive className={cn("[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5")}>
        {children}
      </CommandPrimitive>
    </DialogContentMemo>
  )
));

const CommandDialog = React.memo(({ children, ...props }: CommandDialogProps) => (
  <DialogRoot {...props}>
    <DialogContentMemo>
      <CommandPrimitive className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
        {children}
      </CommandPrimitive>
    </DialogContentMemo>
  </DialogRoot>
));

const CommandInput = forwardRef<
  ElementRef<typeof CommandPrimitive.Input>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <span className="mr-2 text-xs shrink-0 opacity-50 uppercase tracking-wider">search</span>
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
))

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = forwardRef<
  ElementRef<typeof CommandPrimitive.List>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
))

CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = forwardRef<
  ElementRef<typeof CommandPrimitive.Empty>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = forwardRef<
  ElementRef<typeof CommandPrimitive.Group>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props}
  />
))

CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = forwardRef<
  ElementRef<typeof CommandPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

const CommandItem = forwardRef<
  ElementRef<typeof CommandPrimitive.Item>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className
    )}
    {...props}
  />
))

CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = React.memo(function CommandShortcut({
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...props
}) {
  const handleClick: ReactMouseEventHandler<HTMLSpanElement> = (event) => {
    onClick?.(event);
  };

  const handleMouseEnter: ReactMouseEventHandler<HTMLSpanElement> = (event) => {
    onMouseEnter?.(event);
  };

  const handleMouseLeave: ReactMouseEventHandler<HTMLSpanElement> = (event) => {
    onMouseLeave?.(event);
  };

  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    />
  );
});
CommandShortcut.displayName = "CommandShortcut"

const CommandComponent = {
  Root: Command,
  Dialog: CommandDialog,
  Input: CommandInput,
  List: CommandList,
  Empty: CommandEmpty,
  Group: CommandGroup,
  Item: CommandItem,
  Shortcut: CommandShortcut,
  Separator: CommandSeparator,
}

export default CommandComponent
