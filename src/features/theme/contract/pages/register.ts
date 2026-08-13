import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { TurnstileProps } from "@/components/common/turnstile";

export interface RegisterSchema {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterFormData {
  register: UseFormRegister<RegisterSchema>;
  errors: FieldErrors<RegisterSchema>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  turnstileProps: TurnstileProps;
  turnstilePending: boolean;
}

export interface RegisterPageProps {
  registerForm: RegisterFormData;
  turnstileElement: React.ReactNode;
}
