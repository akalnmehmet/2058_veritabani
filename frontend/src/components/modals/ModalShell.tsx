// Path: @/components/modals/ModalShell.tsx
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ModalSize = "sm" | "md" | "lg" | "xl";

const sizeClass: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

function normalizeAsChild(el: React.ReactElement): React.ReactElement {
  // Radix DialogTrigger asChild tek element ister; Fragment gelirse wrapper’a al.
  if (el.type === React.Fragment) {
    return <span className="inline-flex">{(el.props as any)?.children}</span>;
  }
  return el;
}

type ModalShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** Trigger istersen (tek element) buradan ver */
  trigger?: React.ReactElement;

  title?: React.ReactNode;
  description?: React.ReactNode;

  footer?: React.ReactNode;
  children: React.ReactNode;

  size?: ModalSize;
  contentClassName?: string;
  showCloseButton?: boolean;
};

export default function ModalShell({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  footer,
  children,
  size = "md",
  contentClassName,
  showCloseButton = true,
}: ModalShellProps) {
  const hasHeader = Boolean(title || description);
  const triggerEl = trigger ? normalizeAsChild(trigger) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerEl ? <DialogTrigger asChild>{triggerEl}</DialogTrigger> : null}

      <DialogContent
        className={cn("w-[94vw]", sizeClass[size], contentClassName)}
        showCloseButton={showCloseButton}
      >
        {hasHeader ? (
          <DialogHeader>
            {title ? <DialogTitle>{title}</DialogTitle> : null}
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>
        ) : null}

        {children}

        {footer ? <div className="pt-2">{footer}</div> : null}
      </DialogContent>
    </Dialog>
  );
}
