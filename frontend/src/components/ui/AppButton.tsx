// Path: @/components/ui/AppButton.tsx
import React from "react";

type ButtonVariant =
  | "seffaf"
  | "koyumavi"
  | "kurumsalmavi"
  | "gri"
  | "yesil"
  | "mor"
  | "turuncu"
  | "sari"
  | "lacivert"
  | "kirmizi";

type ButtonSize = "sm" | "md" | "mdtxtlg" | "lg";
type ButtonShape = "none" | "md" | "xl";
type TextColor = "white" | "black";

type PolymorphicProps<T extends React.ElementType> = {
  as?: T;
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  disabled?: boolean;
  textcolor?: TextColor;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "type" | "disabled" | "children">;

function AppButtonInner<T extends React.ElementType = "button">(
  {
    as,
    variant = "kurumsalmavi",
    size = "sm",
    shape = "none",
    type = "button",
    loading = false,
    disabled = false,
    textcolor = "white",
    className = "",
    children,
    ...rest
  }: PolymorphicProps<T>,
  ref: React.ForwardedRef<HTMLElement>
) {
  const Tag = (as ?? "button") as React.ElementType;
  const isDisabled = disabled || loading;

  const textcolors: Record<TextColor, string> = {
    white: "text-white",
    black: "text-black",
  };

  const radius =
    {
      none: "rounded-none",
      md: "rounded-md",
      xl: "rounded-xl",
    }[shape] || "rounded-xl";

  const base =
    "inline-flex items-center justify-center " +
    radius +
    " transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 " +
    "focus-visible:ring-primary/60 disabled:opacity-50 disabled:cursor-not-allowed " +
    "select-none cursor-pointer";

  const sizes: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    mdtxtlg: "h-10 px-4 text-md",
    lg: "h-11 px-5 text-base",
  };

  const variants: Record<ButtonVariant, string> = {
    seffaf: "",
    koyumavi: "bg-blue-700 text-white hover:bg-blue-700 shadow-sm",
    kurumsalmavi:
      "bg-blue-600 text-white hover:bg-blue-700 shadow-sm dark:bg-blue-800 text-white hover:bg-blue-600 shadow-sm",
    gri:
      "bg-zinc-600 text-white hover:bg-zinc-700 shadow-sm dark:bg-zinc-500 text-white hover:bg-zinc-700 shadow-sm",
    yesil: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
    mor: "bg-violet-600 text-white hover:bg-violet-700 shadow-sm",
    turuncu: "bg-orange-600 text-white hover:bg-orange-700 shadow-sm",
    sari:
      "bg-amber-400 text-white hover:bg-amber-600 shadow-sm dark:bg-amber-500 text-white hover:bg-amber-600 shadow-sm",
    lacivert: "bg-indigo-900 text-white hover:bg-indigo-800 shadow-sm",
    kirmizi:
      "bg-red-600 text-white hover:bg-red-700 shadow-sm dark:bg-red-700 text-white hover:bg-red-700 shadow-sm",
  };

  const spin =
    "inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2";

  const isNativeButton = Tag === "button";

  return (
    <Tag
      ref={ref as any}
      type={isNativeButton ? type : undefined}
      className={[
        base,
        sizes[size],
        variants[variant] || variants.kurumsalmavi,
        textcolors[textcolor],
        className,
      ].join(" ")}
      disabled={isNativeButton ? isDisabled : undefined}
      aria-disabled={!isNativeButton && isDisabled ? true : undefined}
      aria-busy={loading ? "true" : undefined}
      data-variant={variant}
      {...rest}
      onClick={(e: any) => {
        if (!isNativeButton && isDisabled) {
          e.preventDefault?.();
          e.stopPropagation?.();
          return;
        }
        (rest as any).onClick?.(e);
      }}
    >
      {loading ? <span className={spin} /> : null}
      {children}
    </Tag>
  );
}

const AppButton = React.forwardRef(AppButtonInner) as <T extends React.ElementType = "button">(
  props: PolymorphicProps<T> & { ref?: React.Ref<HTMLElement> }
) => React.ReactElement | null;

export default AppButton;
