import Link from "next/link";

import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({ searchParams }: PageProps<"/auth/login">) {
  const params = await searchParams;
  const nextPath = typeof params.next === "string" ? params.next : undefined;

  return (
    <main className="bg-ink text-warm-white min-h-dvh">
      <div className="container-editorial tablet:py-12 flex min-h-dvh items-center py-8">
        <div className="grid w-full grid-cols-12 gap-x-(--spacing-gutter) gap-y-12">
          <section
            aria-labelledby="login-intro-heading"
            className="desktop:col-span-5 desktop:col-start-2 desktop:row-start-1 order-2 col-span-12 self-center"
          >
            <Link
              href="/"
              className="font-display inline-flex text-2xl leading-none tracking-tight hover:text-white/75"
            >
              Aurelia
            </Link>
            <p className="type-meta mt-16 text-white/55">Portfolio admin</p>
            <h1
              id="login-intro-heading"
              className="font-display tablet:text-6xl mt-4 max-w-md text-5xl leading-[0.98] tracking-tight"
            >
              A private space for the work.
            </h1>
            <p className="type-spec mt-8 max-w-sm text-white/70">
              Manage the portfolio content from one focused workspace.
            </p>
          </section>

          <section
            aria-labelledby="login-heading"
            className="bg-warm-white text-ink desktop:col-span-5 desktop:col-start-8 desktop:row-start-1 tablet:px-10 tablet:py-10 col-span-12 border border-white/20 px-6 py-7"
          >
            <div className="flex items-start justify-between gap-6">
              <p className="type-meta text-foreground-subtle">Admin access</p>
              <Link
                href="/"
                className="type-meta text-foreground-muted hover:text-foreground inline-flex min-h-11 items-center"
              >
                View public site
              </Link>
            </div>

            <h2 id="login-heading" className="type-heading mt-12">
              Sign in to continue.
            </h2>
            <p className="type-spec text-foreground-muted mt-5 max-w-sm">
              Use your admin account to manage site content.
            </p>

            <div className="mt-10">
              <LoginForm nextPath={nextPath} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
