import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AUTH_KEYS } from "@/features/auth/queries";
import { usePreviousLocation } from "@/hooks/use-previous-location";
import { authClient } from "@/lib/auth/auth.client";
import { getRegisterAuthErrorMessage } from "@/lib/auth/auth-errors";
import type { Messages } from "@/lib/i18n";
import { m } from "@/paraglide/messages";

const createRegisterSchema = (messages: Messages) =>
  z
    .object({
      name: z
        .string()
        .min(2, messages.register_validation_name_min())
        .max(20, messages.register_validation_name_max()),
      username: z
        .string()
        .min(3, messages.register_validation_username_min())
        .max(30, messages.register_validation_username_max())
        .regex(
          /^[a-zA-Z0-9_.]+$/,
          messages.register_validation_username_invalid(),
        ),
      email: z.email(messages.register_validation_email_invalid()),
      password: z.string().min(8, messages.register_validation_password_min()),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: messages.register_validation_password_mismatch(),
      path: ["confirmPassword"],
    });

type RegisterSchema = z.infer<ReturnType<typeof createRegisterSchema>>;

export interface UseRegisterFormOptions {
  turnstileToken: string | null;
  turnstilePending: boolean;
  resetTurnstile: () => void;
}

export function useRegisterForm(options: UseRegisterFormOptions) {
  const { turnstileToken, turnstilePending, resetTurnstile } = options;

  const navigate = useNavigate();
  const previousLocation = usePreviousLocation();
  const queryClient = useQueryClient();
  const registerSchema = createRegisterSchema(m);

  const form = useForm<RegisterSchema>({
    resolver: standardSchemaResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterSchema) => {
    const { error } = await authClient.signUp.email({
      username: data.username,
      email: data.email,
      password: data.password,
      name: data.name,
      fetchOptions: {
        headers: { "X-Turnstile-Token": turnstileToken || "" },
      },
    });

    resetTurnstile();

    if (error) {
      toast.error(m.register_toast_failed(), {
        description:
          getRegisterAuthErrorMessage(error, m) ?? m.register_error_default(),
      });
      return;
    }

    queryClient.removeQueries({ queryKey: AUTH_KEYS.session });

    toast.success(m.register_toast_success(), {
      description: m.register_toast_activated(),
    });
    navigate({ to: previousLocation });
  };

  return {
    register: form.register,
    errors: form.formState.errors,
    handleSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
    turnstilePending,
  };
}

export type UseRegisterFormReturn = ReturnType<typeof useRegisterForm>;
