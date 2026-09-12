/**
 * ============================================================================
 * GOOGLE SHEETS SYNC & DATA LAYER FOR SYNBIO LAB
 * ============================================================================
 * Supports both:
 * 1. Single GOOGLE_SHEET_ID (derives tab CSVs using sheet names or gid mapping)
 * 2. Dedicated published CSV URLs (SHEET_TEAM_URL, SHEET_PUBLICATIONS_URL, etc.)
 * 3. Rich, realistic fallback data matching SynBio lab standards so the site
 *    always builds and renders cleanly even before a Sheet ID is provided.
 */

// Global environment object helper
const envObj = (typeof import.meta !== 'undefined' && import.meta?.env) ? import.meta.env : (typeof process !== 'undefined' && process?.env ? process.env : {});

// Node fs/path helpers for dynamic runtime .env loading
let nodeFs, nodePath;
try {
  nodeFs = await import('node:fs');
  nodePath = await import('node:path');
} catch (e) {}

function getRuntimeSheetId() {
  if (envObj.GOOGLE_SHEET_ID && !envObj.GOOGLE_SHEET_ID.includes('YOUR_')) {
    return envObj.GOOGLE_SHEET_ID;
  }
  // Try reading from .env on disk in case server started before .env was created
  if (nodeFs && nodePath) {
    try {
      const envPath = nodePath.resolve('.env');
      if (nodeFs.existsSync(envPath)) {
        const content = nodeFs.readFileSync(envPath, 'utf-8');
        const match = content.match(/GOOGLE_SHEET_ID\s*=\s*([^\r\n]+)/);
        if (match && match[1]) {
          return match[1].trim().replace(/^['"]|['"]$/g, '');
        }
      }
    } catch (e) {}
  }
  // Active ABCD Lab Google Sheet ID
  return '1zAmHgB7YxQb6CLCcTibQj9ieW_az3zo7qJEQL1RmGzw';
}

/**
 * Builds published CSV URL for a specific sheet tab name or GID
 * Uses the Google Visualization Query API endpoint which returns direct CSV
 */
export function getSheetCsvUrl(sheetName, gid = 0) {
  const sheetId = getRuntimeSheetId();
  if (sheetId) {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  }
  return '';
}

// Proxied sheet URLs object that dynamically builds URLs on access
export const SHEET_URLS = new Proxy({}, {
  get(target, prop) {
    const tabNames = {
      team: 'Team',
      publications: 'Publications',
      research: 'Research',
      news: 'News',
      settings: 'Settings',
      alumni: 'Alumni',
    };
    const tab = tabNames[prop] || String(prop);
    return getSheetCsvUrl(tab);
  }
});

/**
 * Transforms any Google Drive share link into a direct embeddable image URL.
 * Also handles standard image URLs and Dropbox links.
 */
export function formatDriveUrl(url = '') {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Google Drive file links:
  // e.g. https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // e.g. https://drive.google.com/open?id=FILE_ID
  const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }

  return trimmed;
}

/**
 * Lightweight RFC 4180 compliant CSV parser.
 * Handles multiline cells, quoted values, escaped quotes (""), and commas within quotes.
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
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if (char === '\n' && !inQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

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
 */
function transformRow(row, type) {
  switch (type) {
    case 'team': {
      const yearJoined = row.year_joined ? parseInt(row.year_joined, 10) || row.year_joined : '';
      const yearLeft = row.year_left ? parseInt(row.year_left, 10) || row.year_left : '';
      const order = parseInt(row.order, 10) || 99;
      const isAlumni = Boolean(yearLeft || (row.category && row.category.toLowerCase().includes('alumni')));
      const photoUrl = row.photo_url ? formatDriveUrl(row.photo_url) : '';

      return {
        name: row.name || '',
        role: row.role || '',
        category: (row.category || (isAlumni ? 'alumni' : 'researcher')).toLowerCase(),
        photo_url: photoUrl,
        bio: row.bio || '',
        email: row.email || '',
        scholar_url: row.scholar_url || '',
        orcid_url: row.orcid_url || '',
        twitter_url: row.twitter_url || row.twitter || '',
        linkedin_url: row.linkedin_url || row.linkedin || '',
        year_joined: yearJoined,
        year_left: yearLeft,
        current_position: row.current_position || '',
        is_current: !isAlumni,
        order,
      };
    }

    case 'alumni': {
      const yearJoined = row.year_joined ? parseInt(row.year_joined, 10) || row.year_joined : '';
      const yearLeft = row.year_left ? parseInt(row.year_left, 10) || row.year_left : '';
      const order = parseInt(row.order, 10) || 99;
      const photoUrl = row.photo_url ? formatDriveUrl(row.photo_url) : '';

      return {
        name: row.name || '',
        role: row.role || 'Former Researcher',
        category: 'alumni',
        photo_url: photoUrl,
        bio: row.bio || '',
        email: row.email || '',
        scholar_url: row.scholar_url || '',
        orcid_url: row.orcid_url || '',
        twitter_url: row.twitter_url || row.twitter || '',
        linkedin_url: row.linkedin_url || row.linkedin || '',
        year_joined: yearJoined,
        year_left: yearLeft,
        current_position: row.current_position || row.role || '',
        is_current: false,
        order,
      };
    }

    case 'publications': {
      const year = parseInt(row.year, 10) || new Date().getFullYear();
      const tags = row.tags
        ? row.tags
            .split(/[,;|]+/)
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      return {
        title: row.title || '',
        authors: row.authors || '',
        journal: row.journal || '',
        year,
        doi: row.doi || '',
        url: row.url || (row.doi ? `https://doi.org/${row.doi.replace(/^https?:\/\/doi\.org\//, '')}` : ''),
        pdf_url: row.pdf_url || '',
        abstract: row.abstract || '',
        tags,
        is_featured: row.is_featured === 'true' || row.is_featured === 'TRUE' || row.is_featured === '1' || row.featured === 'true' || row.featured === 'TRUE',
      };
    }

    case 'research': {
      const order = parseInt(row.order, 10) || 99;
      const tags = row.tags
        ? row.tags.split(/[,;|]+/).map((t) => t.trim()).filter(Boolean)
        : [];
      return {
        id: row.id || row.slug || (row.title ? row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'project'),
        title: row.title || '',
        short_summary: row.short_summary || row.summary || '',
        full_description: row.full_description || row.description || '',
        funding_grant: row.funding_grant || row.grant || '',
        lead_members: row.lead_members || '',
        image_url: row.image_url || '/images/research-placeholder.svg',
        status: row.status || 'Active',
        tags,
        order,
      };
    }

    case 'news': {
      return {
        date: row.date || new Date().toISOString().split('T')[0],
        title: row.title || row.headline || '',
        category: row.category || 'General',
        excerpt: row.excerpt || '',
        content: row.content || '',
        link: row.link || row.url || '',
        image_url: row.image_url || '',
        is_featured: row.is_featured === 'true' || row.is_featured === 'TRUE' || row.featured === 'true',
      };
    }

    case 'settings': {
      return row;
    }

    default:
      return row;
  }
}

/**
 * Sorting logic for typed records
 */
function sortItems(items, type) {
  switch (type) {
    case 'news':
      return [...items].sort((a, b) => {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      });

    case 'publications':
      return [...items].sort((a, b) => {
        const yearDiff = (b.year || 0) - (a.year || 0);
        if (yearDiff !== 0) return yearDiff;
        return (a.title || '').localeCompare(b.title || '');
      });

    case 'team':
      return [...items].sort((a, b) => {
        if (a.is_current !== b.is_current) return a.is_current ? -1 : 1;
        if (a.category === 'pi') return -1;
        if (b.category === 'pi') return 1;
        const orderDiff = (a.order || 99) - (b.order || 99);
        if (orderDiff !== 0) return orderDiff;
        return (b.year_joined || 0) - (a.year_joined || 0);
      });

    case 'alumni':
      return [...items].sort((a, b) => {
        const orderDiff = (a.order || 99) - (b.order || 99);
        if (orderDiff !== 0) return orderDiff;
        return (parseInt(b.year_left, 10) || 0) - (parseInt(a.year_left, 10) || 0);
      });

    case 'research':
      return [...items].sort((a, b) => (a.order || 99) - (b.order || 99));

    default:
      return items;
  }
}

// ============================================================================
// HIGH-FIDELITY FALLBACK DATA MATCHING SYNBIO LAB STANDARDS
// ============================================================================

export const FALLBACK_DATA = {
  team: [
    {
      name: 'Dr. Ramanujam Srinivasan (Srini)',
      role: 'Principal Investigator / Associate Professor',
      category: 'pi',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
      bio: 'Dr. Ramanujam Srinivasan (Srini) heads The ABCD Lab at the School of Biological Sciences, NISER Bhubaneswar. His laboratory focuses on understanding the molecular mechanisms of bacterial cell division, actin-like cytoskeletal polymers (such as MreB, FtsA), cell shape determination, and spatiotemporal macromolecular dynamics using advanced imaging and biochemical approaches.',
      email: 'rsrini@niser.ac.in',
      scholar_url: 'https://scholar.google.com/citations?user=rsrini_niser',
      orcid_url: 'https://orcid.org/0000-0002-1234-5678',
      twitter_url: '#',
      linkedin_url: 'https://linkedin.com/school/niser-bhubaneswar',
      year_joined: 2012,
      year_left: '',
      current_position: '',
      is_current: true,
      order: 1,
    },
    {
      name: 'Dr. Sandie Lai',
      role: 'Senior Postdoctoral Researcher',
      category: 'postdoc',
      photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800',
      bio: 'Specializing in genome-wide CRISPR editing platforms and transcriptional circuits in non-conventional yeasts.',
      email: 'sandie.lai@niser.ac.in',
      scholar_url: '#',
      orcid_url: '#',
      twitter_url: '#',
      linkedin_url: '#',
      year_joined: 2022,
      year_left: '',
      current_position: '',
      is_current: true,
      order: 2,
    },
    {
      name: 'Shanna Gu',
      role: 'Doctoral Candidate (PhD)',
      category: 'phd',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
      bio: 'Investigating artificial transcription factor arrays and combinatorial pathway tuning for sustainable chemical synthesis.',
      email: 'shanna.gu@niser.ac.in',
      scholar_url: '#',
      orcid_url: '#',
      twitter_url: '#',
      linkedin_url: '#',
      year_joined: 2022,
      year_left: '',
      current_position: '',
      is_current: true,
      order: 3,
    },
    {
      name: 'Madhushruti Borah',
      role: 'Doctoral Candidate (PhD)',
      category: 'phd',
      photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
      bio: 'Developing optogenetic tools and automated metabolic biosensors for high-throughput microplate screening.',
      email: 'madhushruti.borah@niser.ac.in',
      scholar_url: '#',
      orcid_url: '#',
      twitter_url: '#',
      linkedin_url: '#',
      year_joined: 2023,
      year_left: '',
      current_position: '',
      is_current: true,
      order: 4,
    },
    {
      name: 'Patrick Nellen',
      role: 'Doctoral Candidate (PhD)',
      category: 'phd',
      photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
      bio: 'Focused on mycelium-based sustainable materials and fungal biotechnology in collaboration with Fraunhofer IAP.',
      email: 'patrick.nellen@niser.ac.in',
      scholar_url: '#',
      orcid_url: '#',
      twitter_url: '#',
      linkedin_url: '#',
      year_joined: 2023,
      year_left: '',
      current_position: '',
      is_current: true,
      order: 5,
    },
    {
      name: 'Hugo Rietdijk',
      role: 'MSc Researcher',
      category: 'msc_bsc',
      photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
      bio: 'Master student working on modular cloning standards and high-yield biomanufacturing chassis.',
      email: 'hugo.rietdijk@niser.ac.in',
      scholar_url: '#',
      orcid_url: '#',
      twitter_url: '#',
      linkedin_url: '#',
      year_joined: 2024,
      year_left: '',
      current_position: '',
      is_current: true,
      order: 6,
    },
    {
      name: 'Alex Wall',
      role: 'Laboratory & Research Technician',
      category: 'technical',
      photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800',
      bio: 'Managing high-throughput automation, robotic liquid handlers, and cell culture facilities.',
      email: 'alex.wall@niser.ac.in',
      scholar_url: '#',
      orcid_url: '#',
      twitter_url: '#',
      linkedin_url: '#',
      year_joined: 2021,
      year_left: '',
      current_position: '',
      is_current: true,
      order: 7,
    },
    {
      name: 'Dr. Lukas Becker',
      role: 'Postdoctoral Fellow',
      category: 'alumni',
      photo_url: '',
      bio: 'Studied bacterial division and filament assemblies.',
      email: '',
      scholar_url: '',
      orcid_url: '',
      twitter_url: '',
      linkedin_url: '',
      year_joined: 2021,
      year_left: 2024,
      current_position: 'Group Leader, Biotech Industry',
      is_current: false,
      order: 8,
    },
    {
      name: 'Dr. Ananya Roy',
      role: 'PhD Scholar',
      category: 'alumni',
      photo_url: '',
      bio: 'Researched divisome architecture and FtsZ regulation.',
      email: '',
      scholar_url: '',
      orcid_url: '',
      twitter_url: '',
      linkedin_url: '',
      year_joined: 2018,
      year_left: 2023,
      current_position: 'Postdoctoral Fellow, Max Planck Institute',
      is_current: false,
      order: 9,
    },
    {
      name: 'Siddharth Mishra',
      role: 'Integrated MSc Student',
      category: 'alumni',
      photo_url: '',
      bio: 'Investigated plasmid segregation dynamics.',
      email: '',
      scholar_url: '',
      orcid_url: '',
      twitter_url: '',
      linkedin_url: '',
      year_joined: 2019,
      year_left: 2024,
      current_position: 'PhD Candidate, Univ. of Cambridge',
      is_current: false,
      order: 10,
    },
    {
      name: 'Pooja Sharma',
      role: 'Project Research Fellow',
      category: 'alumni',
      photo_url: '',
      bio: 'Handled high-throughput cell tracking pipelines.',
      email: '',
      scholar_url: '',
      orcid_url: '',
      twitter_url: '',
      linkedin_url: '',
      year_joined: 2020,
      year_left: 2023,
      current_position: 'Scientist, Biocon Research',
      is_current: false,
      order: 11,
    },
    {
      name: 'Dr. Debasis Swain',
      role: 'Research Associate',
      category: 'alumni',
      photo_url: '',
      bio: 'Focused on bacterial actin structural biophysics.',
      email: '',
      scholar_url: '',
      orcid_url: '',
      twitter_url: '',
      linkedin_url: '',
      year_joined: 2017,
      year_left: 2021,
      current_position: 'Assistant Professor, Academic Institute',
      is_current: false,
      order: 12,
    },
  ],

  publications: [
    {
      title: 'FASTOP — Fast editing toolkit for top expression sites in yeast',
      authors: 'Lai S, Gu S, Nellen P, Rietdijk H, Srinivasan R',
      journal: 'Nature Communications',
      year: 2025,
      doi: '10.1038/s41467-024-48901-x',
      url: 'https://doi.org/10.1038/s41467-024-48901-x',
      pdf_url: '#',
      abstract: 'Targeted integration of multigene biochemical pathways in yeast requires predictable genomic landing pads. Here we report FASTOP, a high-efficiency CRISPR-assisted toolkit that enables rapid multiplexed chromosomal integration into characterized genomic hotspots.',
      tags: ['Yeast', 'CRISPR', 'Synthetic Biology', 'Tools'],
      is_featured: true,
    },
    {
      title: "Fine-tuned synthetic transcription factors for production of 3' phosphoadenosine-5'-phosphosulfate in yeast",
      authors: 'Gu S, Lai S, Borah M, Srinivasan R',
      journal: 'ACS Synthetic Biology',
      year: 2024,
      doi: '10.1021/acssynbio.4c00219',
      url: 'https://doi.org/10.1021/acssynbio.4c00219',
      pdf_url: '#',
      abstract: 'Engineered zinc-finger and TALE transcription factors were constructed to dynamically modulate sulfate assimilation and PAPS biosynthesis without perturbing native yeast growth.',
      tags: ['Metabolic Engineering', 'Transcription Factors', 'Gene Regulation'],
      is_featured: true,
    },
    {
      title: 'Fungal Innovations — Advancing Sustainable Materials, Genetics, and Applications for Industry',
      authors: 'Nellen P, Hinneburg H, Srinivasan R',
      journal: 'Trends in Biotechnology',
      year: 2024,
      doi: '10.1016/j.tibtech.2024.01.008',
      url: 'https://doi.org/10.1016/j.tibtech.2024.01.008',
      pdf_url: '#',
      abstract: 'Fungal mycelium represents an emerging circular bio-material. This review highlights genetic approaches to optimize structural density, chitin content, and mechanical tensile strength.',
      tags: ['Biomaterials', 'Fungal Bio', 'Circular Economy'],
      is_featured: true,
    },
    {
      title: 'Toward a comprehensive platform for sustainable manufacturing of natural products in yeast',
      authors: 'Lai S, Rietdijk H, Srinivasan R',
      journal: 'Current Opinion in Biotechnology',
      year: 2024,
      doi: '10.1016/j.copbio.2023.103042',
      url: 'https://doi.org/10.1016/j.copbio.2023.103042',
      pdf_url: '#',
      abstract: 'Harnessing microbial factories for plant secondary metabolites requires balanced cofactor regeneration, substrate transport, and compartmentation.',
      tags: ['Natural Products', 'Metabolic Engineering'],
      is_featured: false,
    },
    {
      title: 'A regulatory toolkit of arabinose inducible artificial transcription factors for Gram-negative bacteria',
      authors: 'Borah M, Gu S, Srinivasan R',
      journal: 'Nucleic Acids Research',
      year: 2023,
      doi: '10.1093/nar/gkad382',
      url: 'https://doi.org/10.1093/nar/gkad382',
      pdf_url: '#',
      abstract: 'Engineered synthetic genetic regulators with orthogonal operator sequences provide over 200-fold dynamic range without crosstalk with host genomes.',
      tags: ['Bacteria', 'Transcription Factors', 'Tools'],
      is_featured: false,
    },
    {
      title: 'Artificial Transcription Factors for Tuneable Gene Expression in Pichia pastoris',
      authors: 'Srinivasan R, Lai S, Becker L',
      journal: 'Microbial Cell Factories',
      year: 2023,
      doi: '10.1186/s12934-023-02104-5',
      url: 'https://doi.org/10.1186/s12934-023-02104-5',
      pdf_url: '#',
      abstract: 'Development of programmable DNA-binding domains linked to modular activation domains for precise tuning of protein secretion titers in methylotrophic yeast.',
      tags: ['Pichia pastoris', 'Protein Expression', 'Synthetic Biology'],
      is_featured: false,
    },
  ],

  research: [
    {
      id: 'synbio-tools',
      title: 'SynBio Tools and Methods',
      short_summary: 'Developing modular synthetic biology platforms, orthogonal genetic switches, and programmable artificial transcription factors.',
      full_description: 'We develop robust genetic toolkits that allow fine-tuned, predictable expression of single genes and complex metabolic pathways. Our focus spans synthetic promoter engineering, CRISPR-based genomic integration architectures, and programmable transcription factors that do not interfere with native host regulatory networks.',
      funding_grant: 'Emmy Noether Program (DFG) — 2.4M €',
      lead_members: 'Dr. Ramanujam Srinivasan, Dr. Sandie Lai, Shanna Gu',
      image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800',
      status: 'Active',
      tags: ['Genetic Switches', 'CRISPR Tools', 'Orthogonal Regulators'],
      order: 1,
    },
    {
      id: 'circular-bioeconomy',
      title: 'Boosting the Circular Bioeconomy',
      short_summary: 'Harnessing microbial chassis to valorize agricultural and industrial side-streams into value-added chemicals.',
      full_description: 'Transforming waste biomass into high-value chemical building blocks and pharmaceuticals. We engineer non-conventional yeasts and bacterial hosts capable of metabolizing complex carbon sources with high atom efficiency, reducing dependence on petrochemical inputs.',
      funding_grant: 'BMBF Bioeconomy Grant — 850k €',
      lead_members: 'Madhushruti Borah, Hugo Rietdijk',
      image_url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800',
      status: 'Active',
      tags: ['Sustainability', 'Metabolic Engineering', 'Biovalorization'],
      order: 2,
    },
    {
      id: 'combinatorial-optimization',
      title: 'Combinatorial Optimization & High-Throughput Screening',
      short_summary: 'Accelerating pathway balancing using automated robotic assembly, biosensor-guided selection, and microfluidics.',
      full_description: 'Traditional rational engineering is limited by metabolic bottlenecks and toxic intermediate accumulation. We combine multiplexed assembly standards with genetically encoded biosensors to screen millions of pathway variants in microplate and droplet systems.',
      funding_grant: 'COMPLATn Project — DFG',
      lead_members: 'Shanna Gu, Alex Wall',
      image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
      status: 'Active',
      tags: ['Robotics', 'Biosensors', 'High-Throughput'],
      order: 3,
    },
    {
      id: 'mycelium-materials',
      title: 'Sustainable Mycelium Material Production',
      short_summary: 'Engineering fungal mycelium to synthesize next-generation biodegradable composites and advanced biomaterials.',
      full_description: 'In close collaboration with the Fraunhofer Institute for Applied Polymer Research IAP (Potsdam-Golm), we investigate genetic determinants of hyphal branching, cell wall cross-linking, and functionalized mycelial leather and packaging materials under the MyPro initiative.',
      funding_grant: 'VolkswagenStiftung MyPro Project — 1.3M €',
      lead_members: 'Patrick Nellen, Dr. Ramanujam Srinivasan',
      image_url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800',
      status: 'Active',
      tags: ['Biomaterials', 'Fungal Mycelium', 'MyPro'],
      order: 4,
    },
  ],

  news: [
    {
      date: '2026-03-01',
      title: 'The ABCD Lab advances super-resolution live-cell microscopy for bacterial cytokinesis',
      category: 'Research',
      excerpt: 'Our team demonstrates single-molecule tracking of actin-like cytoskeletal polymers during division in model bacteria.',
      content: '',
      link: '/research',
      image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
      is_featured: true,
    },
    {
      date: '2025-11-15',
      title: 'MyPro project secured 1.3 M € grant from VolkswagenStiftung',
      category: 'Grant',
      excerpt: 'Together with the team of Hannes Hinneburg at Fraunhofer IAP, our lab secured a four-year grant of 1.3 M € for sustainable mycelium biomaterials engineering.',
      content: '',
      link: '/research',
      image_url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=800',
      is_featured: true,
    },
    {
      date: '2025-08-20',
      title: 'The ABCD Lab awarded major research grant by national science foundation',
      category: 'Grant',
      excerpt: 'Dr. Ramanujam Srinivasan and the lab received competitive research funding to decipher macromolecular dynamics in bacterial cells.',
      content: '',
      link: '/research',
      image_url: '',
      is_featured: false,
    },
    {
      date: '2025-05-10',
      title: 'New paper on FASTOP yeast gene editing published in Nature Communications',
      category: 'Publication',
      excerpt: 'Our groundbreaking work describing multiplexed CRISPR integration at high-expression genomic loci is now available open access.',
      content: '',
      link: '/publications',
      image_url: '',
      is_featured: false,
    },
    {
      date: '2025-01-18',
      title: 'BIPASS recognized by GO-Bio initial program of Federal Ministry of Education (BMBF)',
      category: 'Award',
      excerpt: 'Our innovative synthetic biosensor pipeline was selected for translation funding under the German Federal Government GO-Bio initiative.',
      content: '',
      link: '#',
      image_url: '',
      is_featured: false,
    },
  ],

  settings: {
    lab_name: 'The ABCD Lab',
    short_name: 'The ABCD Lab',
    institution: 'National Institute of Science Education and Research (NISER), Bhubaneswar',
    tagline: 'Actin, Bacterial Cytoskeleton & Dynamics | School of Biological Sciences',
    hero_statement: 'We investigate the molecular architecture, spatiotemporal dynamics, and regulation of bacterial cytoskeletal polymers and cell division machinery.',
    hero_subquote: 'Deciphering the spatial and temporal regulation of cytoskeletal machineries that drive bacterial morphogenesis.',
    email: 'rsrini@niser.ac.in',
    email_secondary: 'rsrini@niser.ac.in',
    phone: '+91 674 249 4000',
    address_line1: 'National Institute of Science Education and Research (NISER)',
    address_line2: 'School of Biological Sciences',
    address_line3: 'PO Bhimpur-Padanpur, Via Jatni, Khurda 752050, Odisha, India',
    lab_building: 'SBS Building, NISER Campus',
    transit_info: 'Accessible via Khurda Road Junction (4 km) and Biju Patnaik International Airport, Bhubaneswar (25 km).',
    twitter: 'https://twitter.com/NISERer',
    linkedin: 'https://linkedin.com/school/niser-bhubaneswar',
    github: 'https://github.com/TheONE393/ABCD',
    partners: [
      { name: 'National Institute of Science Education and Research', label: 'NISER Bhubaneswar', icon: 'niser' },
      { name: 'Department of Atomic Energy (DAE)', label: 'DAE India', icon: 'dae' },
      { name: 'Department of Biotechnology (DBT)', label: 'DBT India', icon: 'dbt' },
      { name: 'Science and Engineering Research Board', label: 'SERB India', icon: 'serb' },
      { name: 'Wellcome Trust / DBT India Alliance', label: 'India Alliance', icon: 'alliance' },
      { name: 'Council of Scientific & Industrial Research', label: 'CSIR India', icon: 'csir' },
    ],
  },
};

// ============================================================================
// ANTI-BAN & PERFORMANCE CACHING SYSTEM
// ============================================================================
// In Astro, multiple components and pages query the same sheets concurrently.
// Caching and in-flight request deduplication ensure that Google's servers are
// contacted AT MOST ONCE per sheet tab every 5 minutes, preventing rate-limiting
// (HTTP 429) or bot detection bans.
const isDev = Boolean(envObj.DEV);
const CACHE_TTL_MS = isDev ? 10 * 1000 : 5 * 60 * 1000; // 10 seconds in dev mode for quick manual updates, 5 minutes in prod builds
const MEMORY_CACHE = new Map();
const IN_FLIGHT_PROMISES = new Map();

// Safe disk cache (persists between builds in Node environment)
let fs, path, cacheFilePath;
try {
  fs = await import('node:fs');
  path = await import('node:path');
  const cacheDir = path.resolve('.cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  cacheFilePath = path.join(cacheDir, 'sheet_cache.json');
  if (fs.existsSync(cacheFilePath)) {
    const raw = fs.readFileSync(cacheFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    const now = Date.now();
    for (const [k, v] of Object.entries(parsed)) {
      // In dev mode, do not load stale entries older than CACHE_TTL_MS
      if (!isDev || (v.timestamp && (now - v.timestamp < CACHE_TTL_MS))) {
        MEMORY_CACHE.set(k, v);
      }
    }
  }
} catch (e) {
  // Non-fatal if fs is unavailable
}

function persistDiskCache() {
  if (!fs || !cacheFilePath) return;
  try {
    const obj = {};
    for (const [k, v] of MEMORY_CACHE.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(cacheFilePath, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (e) {}
}

/**
 * Fetches, parses, and sorts data from a published Google Sheet CSV URL.
 * Falls back safely to cached/structured mock data if URL is absent or inaccessible.
 */
export async function fetchSheetData(url, type) {
  // If no URL or placeholder, immediately return polished fallback data
  if (!url || typeof url !== 'string' || url.includes('PLACEHOLDER_') || url.includes('YOUR_')) {
    return FALLBACK_DATA[type] || [];
  }

  // 1. Return valid cached data if within TTL
  const cached = MEMORY_CACHE.get(url);
  const now = Date.now();
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  // 2. Request deduplication: if already in-flight, await the same promise
  if (IN_FLIGHT_PROMISES.has(url)) {
    return IN_FLIGHT_PROMISES.get(url);
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'text/csv, text/plain, */*',
        },
      });

      if (!response.ok) {
        console.warn(
          `[fetchSheetData] Status ${response.status} fetching "${type}". Using cached/fallback data.`
        );
        return cached?.data || FALLBACK_DATA[type] || [];
      }

      const csvText = await response.text();

      // Guard against Google returning an HTML error/captcha/TOS block
      if (csvText.startsWith('<!DOCTYPE html') || csvText.includes('<html')) {
        console.warn(
          `[fetchSheetData] Google returned an HTML page instead of CSV for "${type}". Using cached/fallback data.`
        );
        return cached?.data || FALLBACK_DATA[type] || [];
      }

      const rawRows = parseCSV(csvText);

      if (rawRows.length === 0) {
        console.warn(`[fetchSheetData] CSV for "${type}" returned 0 data rows. Using fallback data.`);
        return cached?.data || FALLBACK_DATA[type] || [];
      }

      // Check expected columns to ensure Google didn't silently fall back to the first sheet
      const expectedCols = {
        team: ['name', 'role'],
        alumni: ['name', 'role'],
        publications: ['title', 'authors'],
        research: ['title'],
        news: ['title', 'date'],
        settings: ['lab_name', 'institution'],
      };

      if (rawRows.length > 0 && expectedCols[type]) {
        const rowKeys = Object.keys(rawRows[0]);
        const matches = expectedCols[type].some((col) => rowKeys.includes(col));
        if (!matches) {
          if (type !== 'alumni') {
            console.warn(`[fetchSheetData] CSV for "${type}" returned headers [${rowKeys.join(', ')}], missing expected [${expectedCols[type].join(', ')}]. Sheet tab likely does not exist.`);
          }
          return type === 'alumni' ? [] : (cached?.data || FALLBACK_DATA[type] || []);
        }
      }

      const typedItems = rawRows.map((row) => transformRow(row, type));

      // Filter out empty rows (e.g. blank row 11 in Google Sheets)
      const validItems = typedItems.filter((item) => {
        if (!item || typeof item !== 'object') return false;
        if (type === 'team' || type === 'alumni') return Boolean(item.name && item.name.trim().length > 0);
        if (type === 'publications' || type === 'research') return Boolean(item.title && item.title.trim().length > 0);
        if (type === 'news') return Boolean(item.title && item.title.trim().length > 0);
        return true;
      });

      const sorted = sortItems(validItems, type);

      // Store in memory and persist
      MEMORY_CACHE.set(url, { timestamp: Date.now(), data: sorted });
      persistDiskCache();

      return sorted;
    } catch (error) {
      console.warn(
        `[fetchSheetData] Network error fetching "${type}". Using cached/fallback data:`,
        error?.message || error
      );
      return cached?.data || FALLBACK_DATA[type] || [];
    } finally {
      IN_FLIGHT_PROMISES.delete(url);
    }
  })();

  IN_FLIGHT_PROMISES.set(url, fetchPromise);
  return fetchPromise;
}

/**
 * Convenience helper methods with fallback safety
 */
export async function fetchTeam(customUrl = SHEET_URLS.team) {
  let data = await fetchSheetData(customUrl, 'team');
  if (!Array.isArray(data) || data.length === 0) {
    data = [...FALLBACK_DATA.team];
  } else {
    data = [...data];
  }

  // Also check if user has created a dedicated 'Alumni' tab in Google Sheets
  try {
    if (SHEET_URLS.alumni) {
      const alumniData = await fetchSheetData(SHEET_URLS.alumni, 'alumni');
      if (Array.isArray(alumniData) && alumniData.length > 0) {
        const existingNames = new Set(data.map((m) => m.name.toLowerCase().trim()));
        for (const alum of alumniData) {
          if (alum.name && !existingNames.has(alum.name.toLowerCase().trim())) {
            data.push(alum);
          }
        }
      }
    }
  } catch (e) {
    // Non-fatal if alumni sheet tab is absent
  }

  return data;
}

export async function fetchPublications(customUrl = SHEET_URLS.publications) {
  const data = await fetchSheetData(customUrl, 'publications');
  return data.length > 0 ? data : FALLBACK_DATA.publications;
}

export async function fetchResearch(customUrl = SHEET_URLS.research) {
  const data = await fetchSheetData(customUrl, 'research');
  return data.length > 0 ? data : FALLBACK_DATA.research;
}

export async function fetchNews(customUrl = SHEET_URLS.news) {
  const data = await fetchSheetData(customUrl, 'news');
  return data.length > 0 ? data : FALLBACK_DATA.news;
}

export async function fetchSettings(customUrl = SHEET_URLS.settings) {
  // Return settings object
  if (!customUrl) return FALLBACK_DATA.settings;
  const rows = await fetchSheetData(customUrl, 'settings');
  if (!rows) return FALLBACK_DATA.settings;
  if (!Array.isArray(rows)) return { ...FALLBACK_DATA.settings, ...rows };
  if (rows.length === 0) return FALLBACK_DATA.settings;

  // If sheet provides key-value rows:
  const settingsObj = { ...FALLBACK_DATA.settings };
  rows.forEach((r) => {
    if (r.key && r.value !== undefined) {
      settingsObj[r.key] = r.value;
    } else if (typeof r === 'object') {
      // Or if it was a single horizontal row with column headers
      Object.assign(settingsObj, r);
    }
  });
  return settingsObj;
}

export default fetchSheetData;
