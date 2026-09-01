import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
  notFound: vi.fn(),
  redirect: vi.fn(),
  responseRedirect: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
  redirect: mocks.redirect,
}));
vi.mock("next/server", () => ({
  NextResponse: { redirect: mocks.responseRedirect },
}));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));

import { loginAction } from "@/app/auth/login/actions";
import * as signoutRoute from "@/app/auth/signout/route";
import { requireAdmin } from "@/lib/auth/require-admin";

function navigationError(kind: string, destination?: string) {
  return new Error(destination ? `${kind}:${destination}` : kind);
}

function formData(values: Record<string, string>): FormData {
  const data = new FormData();

  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

function profileQuery(result: { data: unknown; error: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });

  return { from, maybeSingle };
}

describe("loginAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.redirect.mockImplementation((destination: string) => {
      throw navigationError("REDIRECT", destination);
    });
  });

  it("signs in with the supplied credentials and keeps a safe admin target", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: null });
    mocks.createServerSupabaseClient.mockResolvedValue({ auth: { signInWithPassword } });

    await expect(
      loginAction(
        { status: "idle" },
        formData({ email: "admin@example.com", password: "secret", next: "/admin/site?tab=1" }),
      ),
    ).rejects.toThrow("REDIRECT:/admin/site?tab=1");

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "admin@example.com",
      password: "secret",
    });
  });

  it("returns one generic error for invalid credentials or provider failures", async () => {
    const signInWithPassword = vi
      .fn()
      .mockResolvedValueOnce({ error: { message: "Invalid login credentials" } });
    mocks.createServerSupabaseClient.mockResolvedValue({ auth: { signInWithPassword } });

    await expect(
      loginAction({ status: "idle" }, formData({ email: "admin@example.com", password: "wrong" })),
    ).resolves.toEqual({ status: "error" });

    mocks.createServerSupabaseClient.mockRejectedValueOnce(new Error("provider details"));

    await expect(
      loginAction({ status: "idle" }, formData({ email: "admin@example.com", password: "secret" })),
    ).resolves.toEqual({ status: "error" });
  });

  it("rejects an external next target", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: null });
    mocks.createServerSupabaseClient.mockResolvedValue({ auth: { signInWithPassword } });

    await expect(
      loginAction(
        { status: "idle" },
        formData({
          email: "admin@example.com",
          password: "secret",
          next: "https://attacker.example/steal",
        }),
      ),
    ).rejects.toThrow("REDIRECT:/admin");
  });
});

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.redirect.mockImplementation((destination: string) => {
      throw navigationError("REDIRECT", destination);
    });
    mocks.notFound.mockImplementation(() => {
      throw navigationError("NOT_FOUND");
    });
  });

  it("redirects when claims do not identify an authenticated user", async () => {
    const getClaims = vi.fn().mockResolvedValue({ data: null, error: null });
    mocks.createServerSupabaseClient.mockResolvedValue({ auth: { getClaims } });

    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/auth/login");
  });

  it("returns the own admin profile after verified claims", async () => {
    const getClaims = vi
      .fn()
      .mockResolvedValue({ data: { claims: { sub: "admin-id" } }, error: null });
    const query = profileQuery({
      data: { id: "admin-id", display_name: "Aurelia", role: "admin" },
      error: null,
    });
    mocks.createServerSupabaseClient.mockResolvedValue({ auth: { getClaims }, ...query });

    await expect(requireAdmin()).resolves.toEqual({
      userId: "admin-id",
      displayName: "Aurelia",
    });
    expect(query.from).toHaveBeenCalledWith("profiles");
  });

  it("uses a not-found response for a missing or non-admin profile", async () => {
    const getClaims = vi
      .fn()
      .mockResolvedValue({ data: { claims: { sub: "user-id" } }, error: null });
    const query = profileQuery({
      data: { id: "user-id", display_name: null, role: "editor" },
      error: null,
    });
    mocks.createServerSupabaseClient.mockResolvedValue({ auth: { getClaims }, ...query });

    await expect(requireAdmin()).rejects.toThrow("NOT_FOUND");
  });
});

describe("signout route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.responseRedirect.mockImplementation((url: URL) => ({ url }));
  });

  it("signs out and redirects without exposing a continuation target", async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null });
    mocks.createServerSupabaseClient.mockResolvedValue({ auth: { signOut } });

    const response = await signoutRoute.POST(
      new Request("https://aurelporto.test/auth/signout", { method: "POST" }),
    );

    expect(signOut).toHaveBeenCalledOnce();
    expect(mocks.responseRedirect).toHaveBeenCalledWith(
      new URL("https://aurelporto.test/auth/login"),
      303,
    );
    expect(response).toEqual({ url: new URL("https://aurelporto.test/auth/login") });
  });

  it("exposes no GET handler, so no prefetch or preload can end a session", () => {
    // Regression: a GET handler let Next.js viewport prefetching sign the admin
    // out in the background while they were browsing /admin.
    expect("GET" in signoutRoute).toBe(false);
  });
});
