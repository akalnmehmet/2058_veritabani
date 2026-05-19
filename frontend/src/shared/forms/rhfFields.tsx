// Path: @/shared/forms/rhfFields.tsx
import * as React from "react";
import type { FieldError, FieldErrors, Path, UseFormRegister } from "react-hook-form";
import { cn } from "@/lib/utils";

function getError<T>(errors: FieldErrors<T>, name: Path<T>): FieldError | undefined {
  const parts = String(name).split(".");
  let cur: any = errors;
  for (const p of parts) cur = cur?.[p];
  return cur as FieldError | undefined;
}

export function RHFInput<T>({
  label,
  name,
  register,
  errors,
  type = "text",
  className,
  inputClassName,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: React.ReactNode;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  inputClassName?: string;
}) {
  const err = getError(errors, name);

  return (
    <div className={cn("grid gap-2", className)}>
      <label className="text-sm" htmlFor={String(name)}>
        {label}
      </label>

      <input
        id={String(name)}
        type={type}
        className={cn(
          "input input-bordered w-full",
          err ? "border-red-500 focus-visible:ring-red-500" : "",
          inputClassName
        )}
        {...register(name as any)}
        {...rest}
      />

      {err?.message ? <div className="text-xs text-red-500">{String(err.message)}</div> : null}
    </div>
  );
}

export function RHFSelect<T>({
  label,
  name,
  register,
  errors,
  className,
  selectClassName,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: React.ReactNode;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  selectClassName?: string;
}) {
  const err = getError(errors, name);

  return (
    <div className={cn("grid gap-2", className)}>
      <label className="text-sm" htmlFor={String(name)}>
        {label}
      </label>

      <select
        id={String(name)}
        className={cn(
          "select select-bordered w-full",
          err ? "border-red-500 focus-visible:ring-red-500" : "",
          selectClassName
        )}
        {...register(name as any)}
        {...rest}
      >
        {children}
      </select>

      {err?.message ? <div className="text-xs text-red-500">{String(err.message)}</div> : null}
    </div>
  );
}
