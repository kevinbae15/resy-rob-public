"use client"

export const ACCESS_TOKEN_COOKIE_NAME = "rb_access";
export const RESY_TOKEN_COOKIE_NAME = "resy_access";
export type AUTH_COOKIES_KEY = typeof RESY_TOKEN_COOKIE_NAME | typeof ACCESS_TOKEN_COOKIE_NAME;

export function setCookie(name: AUTH_COOKIES_KEY, value: string, expiresAt: string): void {
  // Calculate the expiration time
  const expires = new Date(expiresAt).toUTCString();
  // Set the cookie using document.cookie
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

export function getCookieValue(name: AUTH_COOKIES_KEY): string | null {
  // Extract the cookie value from document.cookie
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=').map(c => c.trim());
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}

export function getAccessToken(): string | null {
  return getCookieValue(ACCESS_TOKEN_COOKIE_NAME);
}

export function getResyToken(): string | null {
  return getCookieValue(RESY_TOKEN_COOKIE_NAME);
}
