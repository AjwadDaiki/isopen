interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

export function isCaptchaRequired(): boolean {
  return process.env.NODE_ENV === "production" || process.env.REPORT_CAPTCHA_REQUIRED === "true";
}

export function hasCaptchaSecret(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string | null
): Promise<{ success: boolean; errors: string[] }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { success: false, errors: ["missing_secret"] };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });
  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
    });

    if (!res.ok) {
      return { success: false, errors: [`http_${res.status}`] };
    }

    const json = (await res.json()) as TurnstileVerifyResponse;
    return {
      success: Boolean(json.success),
      errors: json["error-codes"] || [],
    };
  } catch {
    return { success: false, errors: ["request_failed"] };
  }
}
