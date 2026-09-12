/**
 * paths.js
 * Centralized URL resolution utility for base path support (e.g. GitHub Pages /ABCD/ subpath).
 */

/**
 * Resolves an internal site path with the configured base URL.
 * Automatically handles external URLs, anchors (#), and mailto/tel protocols.
 *
 * @param {string} path - The internal relative path (e.g., '/', '/people', '/images/pic.jpg')
 * @returns {string} The normalized URL path with base prefixed
 */
export function url(path = '') {
  if (
    !path ||
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('mailto:') ||
    path.startsWith('tel:') ||
    path.startsWith('#') ||
    path.startsWith('data:')
  ) {
    return path;
  }

  const base = import.meta?.env?.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;

  // Separate query parameters and hash
  const [withoutQuery, ...queryParts] = path.split('?');
  const queryString = queryParts.length > 0 ? `?${queryParts.join('?')}` : '';
  const [mainPath, ...hashParts] = withoutQuery.split('#');
  const hashString = hashParts.length > 0 ? `#${hashParts.join('#')}` : '';

  const cleanPath = mainPath.startsWith('/') ? mainPath : `/${mainPath}`;

  // If path is root '/'
  if (cleanPath === '/') {
    return `${cleanBase ? `${cleanBase}/` : '/'}${queryString}${hashString}`;
  }

  // If it is a static file (has an extension like .jpg, .svg, .ico, .css, .png, etc.)
  if (/\.[a-zA-Z0-9]+$/i.test(cleanPath)) {
    return `${cleanBase}${cleanPath}${queryString}${hashString}`;
  }

  // For page routes, append trailing slash for GitHub Pages compatibility
  const routePath = cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`;
  return `${cleanBase}${routePath}${queryString}${hashString}`;
}

/**
 * Normalizes a pathname to ignore any subpath base (e.g., stripping '/ABCD' or trailing slashes)
 * so that route comparisons (such as active navigation item styling) work reliably in all environments.
 *
 * @param {string} pathname - Raw pathname (e.g., '/ABCD/people/' or '/people')
 * @returns {string} Standardized route path starting with '/' (e.g., '/people' or '/')
 */
export function normalizePath(pathname = '/') {
  const base = import.meta?.env?.BASE_URL || '/';
  let cleaned = pathname;

  if (base !== '/' && cleaned.startsWith(base.replace(/\/$/, ''))) {
    cleaned = cleaned.slice(base.replace(/\/$/, '').length);
  }

  // Strip trailing slash unless it's just '/'
  if (cleaned.length > 1 && cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }

  return cleaned || '/';
}
