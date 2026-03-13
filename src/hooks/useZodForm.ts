import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UseMutateFunction } from "@tanstack/react-query";

export const useZodForm = (
  schema: z.ZodType<any, any>,
  mutation: UseMutateFunction<any, any, any, any>,
  defaultValues?: Record<string, any>
) => {
  const {
    register,
    watch,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: zodResolver(schema as any),
    defaultValues: { ...defaultValues },
  });

  const onFormSubmit = handleSubmit(async (values) => {
    mutation({ ...values });
  });

  return { register, watch, reset, onFormSubmit, errors };
};
