// Path: @/shared/forms/useZodForm.ts
import { useMemo } from "react";
import { useForm, type UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z, ZodTypeAny } from "zod";

type UseZodFormArgs<TSchema extends ZodTypeAny> = {
  schema: TSchema;
  defaultValues: z.infer<TSchema>;
  formOptions?: Omit<UseFormProps<z.infer<TSchema>>, "resolver" | "defaultValues">;
};

export function useZodForm<TSchema extends ZodTypeAny>({
  schema,
  defaultValues,
  formOptions,
}: UseZodFormArgs<TSchema>) {
  const resolver = useMemo(() => zodResolver(schema), [schema]);

  return useForm<z.infer<TSchema>>({
    resolver,
    defaultValues,
    mode: "onChange",
    ...formOptions,
  });
}
