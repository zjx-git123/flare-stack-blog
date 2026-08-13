import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AUTH_KEYS } from "@/features/auth/queries";
import { usePreviousLocation } from "@/hooks/use-previous-location";
import { authClient } from "@/lib/auth/auth.client";
import { getLoginAuthErrorMessage } from "@/lib/auth/auth-errors";
import type { Messages } from "@/lib/i18n";
import { m } from "@/paraglide/messages";
import { normalizeRedirectUrl } from "./normalize-redirect-url";

const createLoginSchema = (messages: Messages) =>
  z.object({
    username: z.string().min(1, messages.login_validation_username_required()),
    password: z.string().min(1, messages.login_validation_password_required()),
  });

type LoginSchema = z.infer<ReturnType<typeof createLoginSchema>>;

export interface UseLoginFormOptions {
  turnstileToken: string | null;
  resetTurnstile: () => void;
  redirectTo?: string;
}

export function useLoginForm(options: UseLoginFormOptions) {
  const { turnstileToken, resetTurnstile, redirectTo } = options;

  const [loginStep, setLoginStep] = useState<"IDLE" | "VERIFYING" | "SUCCESS">(
    "IDLE",
  );

  const navigate = useNavigate();
  const previousLocation = usePreviousLocation();
  const queryClient = useQueryClient();
  const loginSchema = createLoginSchema(m);

  const form = useForm<LoginSchema>({
    resolver: standardSchemaResolver(loginSchema),
  });

  const performRedirect = (
    redirectTarget: string | undefined,
    fallback: string,
  ) => {
    const target = normalizeRedirectUrl(redirectTarget, fallback);

    if (target.startsWith("/api/")) {
      window.location.assign(target);
      return;
    }

    if (target.startsWith(window.location.origin)) {
      const url = new URL(target);
      navigate({ to: `${url.pathname}${url.search}${url.hash}` });
      return;
    }

    window.location.assign(target);
  };

  const onSubmit = async (data: LoginSchema) => {
    setLoginStep("VERIFYING");

    const { error } = await authClient.signIn.username({
      username: data.username,
      password: data.password,
      fetchOptions: {
        headers: { "X-Turnstile-Token": turnstileToken || "" },
      },
    });

    resetTurnstile();

    if (error) {
      setLoginStep("IDLE");
      const description =
        getLoginAuthErrorMessage(error, m) ?? m.auth_error_default_desc();

      toast.error(m.login_error_default(), {
        description,
      });
      return;
    }

    queryClient.removeQueries({ queryKey: AUTH_KEYS.session });
    setLoginStep("SUCCESS");

    setTimeout(() => {
      performRedirect(redirectTo, previousLocation);
      toast.success(m.login_toast_success());
    }, 800);
  };

  return {
    register: form.register,
    errors: form.formState.errors,
    handleSubmit: form.handleSubmit(onSubmit),
    loginStep,
    isSubmitting: form.formState.isSubmitting,
    loginSchema,
  };
}

export type UseLoginFormReturn = ReturnType<typeof useLoginForm>;
