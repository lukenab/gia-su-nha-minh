export type ApiResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; status: number; error: string };

/** JSON call to /api/admin/*; a 401 sends the person back to the login page. */
export async function sendAdminJson(
  url: string,
  method: "POST" | "PATCH",
  body: unknown,
): Promise<ApiResult> {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    if (response.status === 401) {
      window.location.assign(
        `/admin/login?next=${encodeURIComponent(
          window.location.pathname + window.location.search,
        )}`,
      );
    }
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error:
          typeof data.error === "string"
            ? data.error
            : "Could not save the changes. Please try again.",
      };
    }
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      status: 0,
      error: "Could not reach the server. Check your connection and try again.",
    };
  }
}
