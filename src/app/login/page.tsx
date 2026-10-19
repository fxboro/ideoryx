"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, Loader2, ArrowRight, Mail } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get("next") || "/today"

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isSignUp, setIsSignUp] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter an email address")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      if (isSignUp) {
        if (!password || password.length < 6) {
          toast.error("Password must be at least 6 characters")
          setIsLoading(false)
          return
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
          },
        })

        if (error) {
          toast.error(error.message)
        } else {
          toast.success("Account created! Please check your email to confirm.")
        }
      } else {
        // Sign In
        if (password) {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            toast.error(error.message)
          } else {
            toast.success("Signed in successfully!")
            router.push(nextUrl)
            router.refresh()
          }
        } else {
          // Magic link fallback
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
            },
          })

          if (error) {
            toast.error(error.message)
          } else {
            toast.success("Magic link sent! Check your email inbox.")
          }
        }
      }
    } catch (err) {
      console.warn("Supabase Auth error, using preview mode:", err)
      toast.info("Entering preview mode")
      router.push(nextUrl)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
        },
      })
      if (error) toast.error(error.message)
    } catch (err) {
      console.warn("OAuth redirect error:", err)
      toast.info("Entering preview mode")
      router.push(nextUrl)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 md:p-8">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Zap className="size-6 fill-primary-foreground" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Ideoryx</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Personal AI operating system for tech founders & builders.
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 font-semibold flex items-center justify-center gap-2 border-border/80 hover:bg-muted/60"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <span className="relative bg-background px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Or email
            </span>
          </div>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Password {isSignUp ? "" : "(Optional for magic link)"}
              </Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10"
            />
          </div>

          <Button type="submit" className="w-full h-11 font-bold shadow-md shadow-primary/20 gap-2" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isSignUp ? (
              <>
                Create Account <ArrowRight className="size-4" />
              </>
            ) : password ? (
              <>
                Sign In <ArrowRight className="size-4" />
              </>
            ) : (
              <>
                <Mail className="size-4" /> Send Magic Link
              </>
            )}
          </Button>
        </form>

        {/* Toggle Sign In / Sign Up */}
        <div className="flex flex-col items-center gap-3 text-center text-xs">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-muted-foreground hover:text-foreground font-semibold transition-colors underline underline-offset-4"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </button>

          {/* Quick Demo Bypass */}
          <Link
            href="/today"
            className="text-primary hover:text-primary/80 font-bold tracking-tight text-xs mt-2"
          >
            Preview Ideoryx Workspace →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  )
}
