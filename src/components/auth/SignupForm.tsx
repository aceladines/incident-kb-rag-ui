"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { authFormSlide } from "@/lib/animations";

const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setError(null);
    try {
      await signUp(data.email, data.password);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create account",
      );
    }
  };

  if (success) {
    return (
      <motion.div
        variants={authFormSlide}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[380px] text-center"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border-2 border-primary">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Check your email.
        </h2>
        <p className="mt-2 text-[13px] text-muted-foreground">
          We sent a confirmation link to your email address. Please verify to
          continue.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => router.push("/login")}
        >
          Back to login
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={authFormSlide}
      initial="hidden"
      animate="visible"
      className="w-full max-w-[380px]"
    >
      <h2 className="text-[28px] font-extrabold tracking-tight text-foreground">
        Create account.
      </h2>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Get started with Incident KB
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-10 w-full text-[13px] font-bold uppercase tracking-wide"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
