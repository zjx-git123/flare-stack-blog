import {
  createFileRoute,
} from "@tanstack/react-router";
import theme from "@theme";
import { Turnstile, useTurnstile } from "@/components/common/turnstile";
import { useRegisterForm } from "@/features/auth/hooks";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_auth/register")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: m.register_title(),
      },
    ],
  }),
});

function RouteComponent() {
  const {
    isPending: turnstilePending,
    token: turnstileToken,
    reset: resetTurnstile,
    turnstileProps,
  } = useTurnstile("register");

  const registerForm = useRegisterForm({
    turnstileToken,
    turnstilePending,
    resetTurnstile,
  });

  const turnstileElement = (
    <div className="flex justify-center">
      <Turnstile {...turnstileProps} />
    </div>
  );

  return (
    <theme.RegisterPage
      registerForm={{ ...registerForm, turnstileProps }}
      turnstileElement={turnstileElement}
    />
  );
}
