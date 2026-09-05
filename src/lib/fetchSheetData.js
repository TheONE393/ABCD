/**
 * ============================================================================
 * GOOGLE SHEETS PUBLISHED CSV URLS
 * ============================================================================
 * How to get these URLs:
 * 1. Open your Google Sheet
 * 2. Go to: File > Share > Publish to web
 * 3. Choose the specific sheet tab (Team, Publications, or News)
 * 4. Choose "Comma-separated values (.csv)" format
 * 5. Click "Publish" and paste the generated URL into the matching key below:
 */
export const SHEET_URLS = {
  // Configured via environment variables (Cloudflare Pages / .env) or directly here:
  team:
    import.meta.env.SHEET_TEAM_URL ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vPLACEHOLDER_TEAM_SHEET_KEY/pub?gid=0&single=true&output=csv',
  publications:
    import.meta.env.SHEET_PUBLICATIONS_URL ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vPLACEHOLDER_PUBLICATIONS_SHEET_KEY/pub?gid=1&single=true&output=csv',
  news:
    import.meta.env.SHEET_NEWS_URL ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vPLACEHOLDER_NEWS_SHEET_KEY/pub?gid=2&single=true&output=csv',
};

/**
 * Lightweight, zero-dependency RFC 4180 compliant CSV parser.
 * Handles multiline cells, quoted values, escaped quotes (""), and commas within quotes.
 *
 * @param {string} csvText - Raw CSV text from the published Google Sheet
 * @returns {Array<Record<string, string>>} Array of row objects with normalized header keys
 */
export function parseCSV(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];

  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let inQuotes = false;

  // Normalize line endings to \n
  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped double quote inside a quoted string ("")
        currentCell += '"';
        i++; // skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Cell boundary
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if (char === '\n' && !inQuotes) {
      // Row boundary
      currentRow.push(currentCell.trim());
      // Only add row if it contains at least one non-empty value
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  // Push any trailing cell and row
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  // Normalize header names: lowercase, trim, replace spaces/hyphens with underscores
  const headers = rows[0].map((h) =>
    h
      .toLowerCase()
      .trim()
      .replace(/[\s-]+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
  );

  const dataRows = rows.slice(1);

  return dataRows.map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index] !== undefined ? row[index] : '';
    });
    return item;
  });
}

/**
 * Transforms raw parsed row data into typed objects based on sheet schema.
 *
 * @param {Record<string, string>} row - Raw row object from CSV
 * @param {'team' | 'publications' | 'news'} type - The data schema type
 * @returns {Record<string, any>} Typed object
 */
function transformRow(row, type) {
  switch (type) {
    case 'team': {
      const yearJoined = row.year_joined ? parseInt(row.year_joined, 10) || row.year_joined : '';
      const yearLeft = row.year_left ? parseInt(row.year_left, 10) || row.year_left : '';
      const links = row.links
        ? row.links
            .split(',')
            .map((l) => l.trim())
            .filter(Boolean)
        : [];

      return {
        name: row.name || '',
        role: row.role || '',
        photo_url: row.photo_url || '',
        bio: row.bio || '',
        year_joined: yearJoined,
        year_left: yearLeft,
        is_current: !row.year_left || row.year_left.trim() === '',
        links,
      };
    }

    case 'publications': {
      const year = parseInt(row.year, 10) || 0;
      const tags = row.tags
        ? row.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      return {
        title: row.title || '',
        authors: row.authors || '',
        journal: row.journal || '',
        year,
        doi_or_pdf_link: row.doi_or_pdf_link || '',
        tags,
      };
    }

    case 'news': {
      return {
        date: row.date || '',
        headline: row.headline || '',
        excerpt: row.excerpt || '',
        link: row.link || '',
      };
    }

    default:
      return row;
  }
}

/**
 * Sorts typed records according to the specific sheet requirements.
 *
 * @param {Array<Record<string, any>>} items - Transformed data items
 * @param {'team' | 'publications' | 'news'} type - The data schema type
 * @returns {Array<Record<string, any>>} Sorted array
 */
function sortItems(items, type) {
  switch (type) {
    case 'news':
      // Sort news by date descending (newest first)
      return [...items].sort((a, b) => {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      });

    case 'publications':
      // Sort publications by publication year descending (newest first)
      return [...items].sort((a, b) => {
        const yearDiff = (b.year || 0) - (a.year || 0);
        if (yearDiff !== 0) return yearDiff;
        return (a.title || '').localeCompare(b.title || '');
      });

    case 'team':
      // Current members first, then sorted by year joined descending
      return [...items].sort((a, b) => {
        if (a.is_current !== b.is_current) {
          return a.is_current ? -1 : 1;
        }
        return (b.year_joined || 0) - (a.year_joined || 0);
      });

    default:
      return items;
  }
}

/**
 * Fetches, parses, and sorts data from a published Google Sheet CSV URL.
 * Runs at Astro build time (server-side). Gracefully catches failures without crashing the build.
 *
 * @param {string} url - Published Google Sheet CSV URL
 * @param {'team' | 'publications' | 'news'} type - Type of data sheet
 * @returns {Promise<Array<Record<string, any>>>} Array of typed and sorted records, or empty array on failure
 */
export async function fetchSheetData(url, type) {
  if (!url || typeof url !== 'string' || url.includes('PLACEHOLDER_')) {
    // If URL is empty or unconfigured placeholder, log informational note and return empty array
    if (url && url.includes('PLACEHOLDER_')) {
      console.warn(
        `[fetchSheetData] Placeholder URL detected for "${type}". Returning empty array. (Configure real CSV URL in src/lib/fetchSheetData.js)`
      );
    }
    return [];
  }

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/csv, text/plain, */*',
      },
    });

    if (!response.ok) {
      console.warn(
        `[fetchSheetData] Warning: Failed to fetch "${type}" from ${url}. Server returned status ${response.status} (${response.statusText}). Returning empty array.`
      );
      return [];
    }

    const csvText = await response.text();
    const rawRows = parseCSV(csvText);

    if (rawRows.length === 0) {
      console.warn(`[fetchSheetData] Notice: "${type}" CSV contained no valid data rows.`);
      return [];
    }

    const typedItems = rawRows.map((row) => transformRow(row, type));
    return sortItems(typedItems, type);
  } catch (error) {
    console.warn(
      `[fetchSheetData] Error fetching or parsing "${type}" data from ${url}:`,
      error?.message || error
    );
    // Never crash the Astro build on network or parsing error
    return [];
  }
}

/**
 * Convenience helper methods using default SHEET_URLS
 */
export async function fetchTeam(customUrl = SHEET_URLS.team) {
  return fetchSheetData(customUrl, 'team');
}

export async function fetchPublications(customUrl = SHEET_URLS.publications) {
  return fetchSheetData(customUrl, 'publications');
}

export async function fetchNews(customUrl = SHEET_URLS.news) {
  return fetchSheetData(customUrl, 'news');
}

export default fetchSheetData;
