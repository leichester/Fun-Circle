/**
 * Cookie utility functions for managing user preferences
 */

export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Set a cookie with the given name, value, and options
 */
export const setCookie = (name: string, value: string, options: CookieOptions = {}): void => {
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.expires) {
    let expires: string;
    if (typeof options.expires === 'number') {
      // If expires is a number, treat it as days from now
      const date = new Date();
      date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
      expires = date.toUTCString();
    } else {
      expires = options.expires.toUTCString();
    }
    cookieString += `; expires=${expires}`;
  }

  if (options.path) {
    cookieString += `; path=${options.path}`;
  }

  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (options.secure) {
    cookieString += `; secure`;
  }

  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }

  document.cookie = cookieString;
};

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }

  return null;
};

/**
 * Delete a cookie by setting its expiration to the past
 */
export const deleteCookie = (name: string, path?: string, domain?: string): void => {
  setCookie(name, '', {
    expires: new Date(0),
    path,
    domain,
  });
};

/**
 * Check if cookies are enabled in the browser
 */
export const areCookiesEnabled = (): boolean => {
  try {
    const testCookie = 'cookietest';
    setCookie(testCookie, 'test', { expires: 1 });
    const enabled = getCookie(testCookie) === 'test';
    if (enabled) {
      deleteCookie(testCookie);
    }
    return enabled;
  } catch (e) {
    return false;
  }
};

// Language-specific cookie functions
const LANGUAGE_COOKIE_NAME = 'fun-circle-language';
const LANGUAGE_COOKIE_EXPIRES = 365; // 1 year

/**
 * Save user's language preference to cookie
 */
export const saveLanguagePreference = (language: string): void => {
  if (areCookiesEnabled()) {
    setCookie(LANGUAGE_COOKIE_NAME, language, {
      expires: LANGUAGE_COOKIE_EXPIRES,
      path: '/',
      sameSite: 'lax'
    });
  }
};

/**
 * Get user's language preference from cookie
 */
export const getLanguagePreference = (): string | null => {
  if (areCookiesEnabled()) {
    return getCookie(LANGUAGE_COOKIE_NAME);
  }
  return null;
};

/**
 * Clear user's language preference cookie
 */
export const clearLanguagePreference = (): void => {
  deleteCookie(LANGUAGE_COOKIE_NAME, '/');
};