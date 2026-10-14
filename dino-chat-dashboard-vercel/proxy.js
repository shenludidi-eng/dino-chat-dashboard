import { timingSafeEqual } from "node:crypto";
import { next } from "@vercel/functions";

const REALM = "Dino Chat Dashboard";

function unauthorized() {
  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function secureEqual(actual, expected) {
  const left = Buffer.from(actual);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export default function proxy(request) {
  const expectedUsername = process.env.DASHBOARD_USERNAME;
  const expectedPassword = process.env.DASHBOARD_PASSWORD;
  const authorization = request.headers.get("authorization");

  if (!expectedUsername || !expectedPassword || !authorization?.startsWith("Basic ")) {
    return unauthorized();
  }

  try {
    const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator < 0) return unauthorized();
    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    if (!secureEqual(username, expectedUsername) || !secureEqual(password, expectedPassword)) {
      return unauthorized();
    }
  } catch {
    return unauthorized();
  }

  return next({
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
    },
  });
}
