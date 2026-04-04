# Sharp Geometric Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the Incident KB frontend from corporate admin to Sharp Geometric aesthetic — new fonts, colors, split-screen auth, tighter animations, and a button bug fix.

**Architecture:** Pure visual layer changes. CSS variables propagate the new theme to all shadcn primitives automatically. Only ~12 files are touched. No API, hook, type, or logic changes.

**Tech Stack:** Next.js 16, Tailwind v4, shadcn/ui v4 (@base-ui/react), Space Grotesk + JetBrains Mono (next/font/google), Framer Motion.

**Spec:** `docs/superpowers/specs/2026-04-05-sharp-geometric-redesign-design.md`

---

### Task 1: Global Theme — CSS Variables

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace the full `globals.css` with the new Sharp Geometric theme**

Replace the entire file content. Key changes: oklch → hex colors, 0.5rem → 0.375rem radius, true black backgrounds, sharper borders, updated scrollbar and prose styling.

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-heading: var(--font-sans);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

/* ── Light Mode — Sharp Geometric ─── */
:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --card: #fafafa;
  --card-foreground: #0a0a0a;
  --popover: #fafafa;
  --popover-foreground: #0a0a0a;
  --primary: #dc2626;
  --primary-foreground: #ffffff;
  --secondary: #f5f5f5;
  --secondary-foreground: #171717;
  --muted: #f5f5f5;
  --muted-foreground: #555555;
  --accent: #fef2f2;
  --accent-foreground: #991b1b;
  --destructive: #dc2626;
  --border: #e5e5e5;
  --input: #f5f5f5;
  --ring: #dc2626;
  --chart-1: #dc2626;
  --chart-2: #0891b2;
  --chart-3: #6d28d9;
  --chart-4: #ca8a04;
  --chart-5: #db2777;
  --radius: 0.375rem;
  --sidebar: #fafafa;
  --sidebar-foreground: #171717;
  --sidebar-primary: #dc2626;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #fef2f2;
  --sidebar-accent-foreground: #991b1b;
  --sidebar-border: #e5e5e5;
  --sidebar-ring: #dc2626;
}

/* ── Dark Mode — Sharp Geometric ─── */
.dark {
  --background: #09090b;
  --foreground: #fafafa;
  --card: #111113;
  --card-foreground: #fafafa;
  --popover: #111113;
  --popover-foreground: #fafafa;
  --primary: #dc2626;
  --primary-foreground: #ffffff;
  --secondary: #1a1a1e;
  --secondary-foreground: #e5e5e5;
  --muted: #1a1a1e;
  --muted-foreground: #555555;
  --accent: #1a1012;
  --accent-foreground: #f87171;
  --destructive: #dc2626;
  --border: #222222;
  --input: #0a0a0c;
  --ring: #dc2626;
  --chart-1: #dc2626;
  --chart-2: #22d3ee;
  --chart-3: #a78bfa;
  --chart-4: #facc15;
  --chart-5: #f472b6;
  --sidebar: #09090b;
  --sidebar-foreground: #e5e5e5;
  --sidebar-primary: #dc2626;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #1a1012;
  --sidebar-accent-foreground: #f87171;
  --sidebar-border: #222222;
  --sidebar-ring: #dc2626;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans scroll-smooth;
  }
}

/* ── Scrollbar Styling ─── */
@layer base {
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #666;
  }
  .dark ::-webkit-scrollbar-thumb {
    background: #333;
  }
  .dark ::-webkit-scrollbar-thumb:hover {
    background: #444;
  }
}

/* ── Grid Pattern (auth pages, empty states) ─── */
.bg-grid-pattern {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* ── Light mode grid pattern ─── */
:root .bg-grid-pattern {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* ── Markdown Prose ─── */
.prose-incident h1,
.prose-incident h2,
.prose-incident h3 {
  font-weight: 700;
  letter-spacing: -0.02em;
}
.prose-incident code {
  font-size: 0.875em;
  padding: 0.15em 0.35em;
  border-radius: 0.25rem;
  background: #f5f5f5;
}
.dark .prose-incident code {
  background: #1a1a1e;
}
```

- [ ] **Step 2: Verify the dev server compiles without errors**

Run: `npm run dev` — check the terminal for Tailwind/CSS compilation errors. Open `http://localhost:3000` and confirm the new colors are applied globally.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style: overhaul theme to Sharp Geometric — hex colors, tighter radius, grid pattern"
```

---

### Task 2: Font Swap — Space Grotesk + JetBrains Mono

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace Geist fonts with Space Grotesk + JetBrains Mono**

Replace the full file:

```tsx
import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Incident KB",
    template: "%s | Incident KB",
  },
  description:
    "Internal support portal for incident logging, knowledge base management, and RAG-powered retrieval",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify fonts load**

Open `http://localhost:3000` in the browser. Open DevTools > Elements, inspect a heading — confirm `font-family` resolves to Space Grotesk. Inspect a `font-mono` element — confirm it resolves to JetBrains Mono.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "style: swap Geist to Space Grotesk + JetBrains Mono"
```

---

### Task 3: Bug Fix — Button `nativeButton`

**Files:**
- Modify: `src/components/ui/button.tsx`

- [ ] **Step 1: Fix the Button component to pass `nativeButton={false}` when `render` is provided**

Replace the `Button` function (lines 45–58):

```tsx
function Button({
  className,
  variant = "default",
  size = "default",
  render,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...(render ? { nativeButton: false, render } : {})}
      {...props}
    />
  )
}
```

- [ ] **Step 2: Verify the fix**

Open `http://localhost:3000/incidents` in the browser. Open DevTools console — confirm the Base UI `nativeButton` warning is gone. Click "New Incident" button — confirm it navigates to `/incidents/new`.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/button.tsx
git commit -m "fix: pass nativeButton=false when Button receives render prop"
```

---

### Task 4: Animation Updates

**Files:**
- Modify: `src/lib/animations.ts`

- [ ] **Step 1: Replace the full animations file with tighter timings and auth variants**

```ts
import type { Variants } from "framer-motion";

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.06,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// Auth page animations
export const authGridFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const authTaglineStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

export const authTaglineItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const authFormSlide: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/animations.ts
git commit -m "style: tighten animation timings, add auth variants, remove cardHover scale"
```

---

### Task 5: Auth Layout — Split Screen

**Files:**
- Modify: `src/app/(auth)/layout.tsx`

- [ ] **Step 1: Rebuild the auth layout as a split-screen wrapper**

Replace the full file:

```tsx
"use client";

import { motion } from "framer-motion";
import { authGridFade, authTaglineStagger, authTaglineItem } from "@/lib/animations";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left panel — branding */}
      <motion.div
        variants={authGridFade}
        initial="hidden"
        animate="visible"
        className="relative flex flex-1 flex-col justify-between overflow-hidden bg-background p-8 md:p-10"
      >
        {/* Grid pattern */}
        <div className="bg-grid-pattern absolute inset-0" />

        {/* Bottom gradient wash */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-t from-primary/[0.08] to-transparent" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-primary">
            <span className="font-mono text-xs font-extrabold text-primary">IK</span>
          </div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Incident KB
          </span>
        </div>

        {/* Tagline */}
        <motion.div
          variants={authTaglineStagger}
          initial="hidden"
          animate="visible"
          className="relative z-10"
        >
          <motion.h1
            variants={authTaglineItem}
            className="text-2xl font-bold tracking-tight text-foreground"
          >
            Resolve faster.
          </motion.h1>
          <motion.h1
            variants={authTaglineItem}
            className="text-2xl font-bold tracking-tight text-foreground"
          >
            Know more.
          </motion.h1>
          <motion.p
            variants={authTaglineItem}
            className="mt-3 text-[13px] leading-relaxed text-muted-foreground"
          >
            Incident management and knowledge
            <br />
            retrieval powered by AI.
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center border-l border-border bg-card p-8 md:p-10">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the split layout**

Open `http://localhost:3000/login`. Confirm: left panel has grid pattern + logo + tagline, right panel has the form. Resize to mobile width — confirm it stacks vertically.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(auth)/layout.tsx"
git commit -m "style: rebuild auth layout as split-screen with grid pattern and branding"
```

---

### Task 6: Login Form — Sharp Geometric Styling

**Files:**
- Modify: `src/components/auth/LoginForm.tsx`

- [ ] **Step 1: Rebuild the LoginForm for the right-panel Sharp Geometric style**

Replace the full file:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { authFormSlide } from "@/lib/animations";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await signIn(data.email, data.password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    }
  };

  return (
    <motion.div
      variants={authFormSlide}
      initial="hidden"
      animate="visible"
      className="w-full max-w-[380px]"
    >
      <h2 className="text-[28px] font-extrabold tracking-tight text-foreground">
        Sign in.
      </h2>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Access your dashboard
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

        <Button
          type="submit"
          className="h-10 w-full text-[13px] font-bold uppercase tracking-wide"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-primary hover:underline"
        >
          Sign up
        </Link>
      </p>
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify the login page**

Open `http://localhost:3000/login`. Confirm: "Sign in." heading with period, uppercase mono labels, no Card wrapper, no icon-in-input, clean layout.

- [ ] **Step 3: Commit**

```bash
git add src/components/auth/LoginForm.tsx
git commit -m "style: rebuild LoginForm with Sharp Geometric styling"
```

---

### Task 7: Signup Form — Sharp Geometric Styling

**Files:**
- Modify: `src/components/auth/SignupForm.tsx`

- [ ] **Step 1: Rebuild the SignupForm to match the login form's Sharp Geometric style**

Replace the full file:

```tsx
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
```

- [ ] **Step 2: Verify the signup page**

Open `http://localhost:3000/signup`. Confirm: "Create account." heading, three fields with uppercase mono labels, same styling as login.

- [ ] **Step 3: Commit**

```bash
git add src/components/auth/SignupForm.tsx
git commit -m "style: rebuild SignupForm with Sharp Geometric styling"
```

---

### Task 8: Sidebar — Sharp Geometric Styling

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Update the sidebar logo, nav item colors, and collapse toggle**

Replace the full file:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  AlertTriangle,
  BookOpen,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Incidents", path: "/incidents", icon: AlertTriangle },
  { label: "Knowledge Base", path: "/kb", icon: BookOpen },
  { label: "Ask", path: "/ask", icon: Search },
];

const BOTTOM_ITEMS = [
  { label: "Settings", path: "/settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar",
        "transition-colors duration-200",
      )}
    >
      {/* Logo / Brand */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-3">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-primary">
            <span className="font-mono text-[11px] font-extrabold text-primary">
              IK
            </span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap font-mono text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground"
              >
                Incident KB
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col justify-between px-2 py-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={isActive(item.path)}
              collapsed={collapsed}
            />
          ))}
        </ul>

        <ul className="space-y-1">
          {BOTTOM_ITEMS.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={isActive(item.path)}
              collapsed={collapsed}
            />
          ))}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-full text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </motion.aside>
  );
}

interface NavItemProps {
  item: {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  isActive: boolean;
  collapsed: boolean;
}

function NavItem({ item, isActive, collapsed }: NavItemProps) {
  const Icon = item.icon;

  const linkClasses = cn(
    "group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all duration-200",
    isActive
      ? "bg-sidebar-accent text-sidebar-accent-foreground"
      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
  );

  const iconEl = (
    <Icon
      className={cn(
        "h-4 w-4 shrink-0 transition-colors",
        isActive
          ? "text-primary"
          : "text-muted-foreground group-hover:text-sidebar-foreground",
      )}
    />
  );

  const activeBar = isActive && (
    <motion.div
      layoutId="sidebar-active"
      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
    />
  );

  if (collapsed) {
    return (
      <li>
        <Tooltip>
          <TooltipTrigger
            render={<Link href={item.path} className={linkClasses} />}
          >
            {activeBar}
            {iconEl}
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {item.label}
          </TooltipContent>
        </Tooltip>
      </li>
    );
  }

  return (
    <li>
      <Link href={item.path} className={linkClasses}>
        {activeBar}
        {iconEl}
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </li>
  );
}
```

- [ ] **Step 2: Verify the sidebar**

Open `http://localhost:3000`. Confirm: "IK" bordered monogram logo, uppercase mono label, `#555` icons in default state, red icon on active, no hover background on collapse toggle.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "style: update Sidebar to Sharp Geometric — bordered logo, mono labels, refined colors"
```

---

### Task 9: Navbar — Sharp Geometric Styling

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

- [ ] **Step 1: Update the navbar heading weight**

Replace the `h1` className on line 49 — change `font-semibold` to `font-semibold` (stays the same — 600 weight is correct for Space Grotesk since the font swap already changed the typeface). The existing Tailwind classes already produce the right look with the new font. Only change is confirming the `bg-background/80` works with the new hex color.

No code changes needed — the navbar already uses semantic classes (`bg-background/80`, `border-border`, `backdrop-blur-md`) that inherit the new theme. Verify visually only.

- [ ] **Step 2: Verify the navbar**

Open `http://localhost:3000`. Confirm: navbar background is dark with blur, border is `#222` in dark mode, page title renders in Space Grotesk.

- [ ] **Step 3: Commit (skip if no changes)**

If no code changes were needed, skip the commit. The navbar styling is updated via CSS variables.

---

### Task 10: Dashboard Page — Heading Style

**Files:**
- Modify: `src/app/(dashboard)/page.tsx`

- [ ] **Step 1: Update the dashboard heading to Sharp Geometric style**

Replace the page header section (lines 64–72):

```tsx
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Dashboard.
        </h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Incident overview, knowledge base activity, and quick search
        </p>
      </div>
```

- [ ] **Step 2: Verify**

Open `http://localhost:3000`. Confirm: "Dashboard." with period, bold heading, uppercase mono subtitle.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(dashboard)/page.tsx"
git commit -m "style: update dashboard heading to Sharp Geometric"
```

---

### Task 11: Stats Cards — Sharp Geometric Styling

**Files:**
- Modify: `src/components/dashboard/StatsCards.tsx`

- [ ] **Step 1: Update the stats cards with accent lines, bordered icon containers, and border-only hover**

Replace the `StatsCards` component (lines 64–111) and the `iconClassName` field to use border colors instead:

Update `buildCards` to use border-based icon styling:

```tsx
function buildCards(stats: DashboardStats): StatCardConfig[] {
  return [
    {
      label: "Open Incidents",
      value: stats.openIncidents,
      subtitle: `${stats.criticalIncidents} critical`,
      icon: AlertTriangle,
      iconClassName: "border-red-500 text-red-500",
    },
    {
      label: "Avg Resolution",
      value: stats.avgResolution,
      subtitle: "Last 30 days",
      icon: Clock,
      iconClassName: "border-blue-500 text-blue-500",
    },
    {
      label: "KB Articles",
      value: stats.totalArticles,
      subtitle: `${stats.publishedArticles} published`,
      icon: BookOpen,
      iconClassName: "border-emerald-500 text-emerald-500",
    },
    {
      label: "Active Rules",
      value: stats.activeRules,
      subtitle: `${stats.guardrailRules} guardrails`,
      icon: ShieldCheck,
      iconClassName: "border-amber-500 text-amber-500",
    },
  ];
}
```

Replace `StatsCards` component:

```tsx
export function StatsCards({ stats }: StatsCardsProps) {
  const cards = buildCards(stats);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div key={card.label} variants={staggerItem}>
            <Card className="relative overflow-hidden transition-colors duration-200 hover:border-primary/25">
              {/* Red accent line */}
              <div className="absolute left-4 right-4 top-0 h-[2px] rounded-b-sm bg-gradient-to-r from-primary to-transparent" />
              <CardContent className="flex items-start justify-between pt-5">
                <div className="space-y-1">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="text-[28px] font-extrabold tracking-tight text-foreground">
                    {card.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {card.subtitle}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2",
                    card.iconClassName,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify**

Open `http://localhost:3000`. Confirm: stats cards have red accent gradient at top, bordered icon squares (not filled), mono uppercase labels, border-color hover instead of translate/scale.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/StatsCards.tsx
git commit -m "style: update StatsCards with accent lines, bordered icons, border-only hover"
```

---

### Task 12: Visual Verification + Final Commit

- [ ] **Step 1: Run type-check**

Run: `npm run type-check`
Expected: No errors.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No errors (or only pre-existing ones).

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Full visual walkthrough**

Open the dev server and check each page:
1. `/login` — split screen, grid pattern, "Sign in." heading, mono labels
2. `/signup` — same split, "Create account." heading, three fields
3. `/` — dashboard with "Dashboard." heading, stats cards with accent lines
4. `/incidents` — no `nativeButton` console error, "New Incident" button works
5. Toggle dark/light mode on each page — confirm both work

- [ ] **Step 5: Commit any remaining fixes**

If any visual issues were found and fixed, commit them:

```bash
git add -A
git commit -m "style: fix visual issues found during walkthrough"
```
