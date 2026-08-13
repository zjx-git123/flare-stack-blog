import { Link } from "@tanstack/react-router";
import type { RegisterPageProps } from "@/features/theme/contract/pages";
import { m } from "@/paraglide/messages";
import { RegisterForm } from "./form";

export function RegisterPage({
  registerForm,
  turnstileElement,
}: RegisterPageProps) {
  return (
    <div className="space-y-12">
      <header className="text-center space-y-3">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground/60">
          [ {m.register_label()} ]
        </p>
        <h1 className="text-2xl font-serif font-medium tracking-tight">
          {m.register_title()}
        </h1>
      </header>

      <div className="space-y-10">
        <RegisterForm form={registerForm} />

        {turnstileElement}

        <div className="text-center pt-4">
          <p className="text-[10px] font-mono text-muted-foreground/50 tracking-wider">
            {m.register_have_account()}{" "}
            <Link
              to="/login"
              className="text-foreground hover:opacity-70 transition-opacity ml-1"
            >
              [ {m.register_go_to_login()} ]
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
