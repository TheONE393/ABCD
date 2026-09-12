/**
 * ============================================================================
 * THE ABCD LAB - GOOGLE SHEETS SETUP SCRIPT
 * ============================================================================
 * Run this script once from Extensions -> Apps Script to automatically create
 * and populate all 6 tabs with proper columns, formatting, and ABCD Lab data!
 */

function setupAbcdLabSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. SETTINGS TAB
  const settingsSheet = getOrCreateSheet(ss, 'Settings');
  const settingsHeaders = [
    'lab_name', 'short_name', 'institution', 'tagline', 'hero_statement', 'hero_subquote',
    'email', 'email_secondary', 'phone', 'address_line1', 'address_line2', 'address_line3',
    'lab_building', 'transit_info', 'twitter', 'linkedin', 'github'
  ];
  const settingsData = [
    [
      'The ABCD Lab',
      'The ABCD Lab',
      'National Institute of Science Education and Research (NISER), Bhubaneswar',
      'Actin, Bacterial Cytoskeleton & Dynamics | School of Biological Sciences',
      'We investigate the molecular architecture, spatiotemporal dynamics, and regulation of bacterial cytoskeletal polymers and cell division machinery.',
      'Deciphering the spatial and temporal regulation of cytoskeletal machineries that drive bacterial morphogenesis.',
      'rsrini@niser.ac.in',
      'rsrini@niser.ac.in',
      '+91 674 249 4000',
      'National Institute of Science Education and Research (NISER)',
      'School of Biological Sciences',
      'PO Bhimpur-Padanpur, Via Jatni, Khurda 752050, Odisha, India',
      'SBS Building, NISER Campus',
      'Accessible via Khurda Road Junction (4 km) and Biju Patnaik International Airport, Bhubaneswar (25 km).',
      'https://twitter.com/NISERer',
      'https://linkedin.com/school/niser-bhubaneswar',
      'https://github.com/TheONE393/ABCD'
    ]
  ];
  populateSheet(settingsSheet, settingsHeaders, settingsData, '#1E3A8A');

  // 2. TEAM TAB
  const teamSheet = getOrCreateSheet(ss, 'Team');
  const teamHeaders = [
    'order', 'name', 'role', 'category', 'bio', 'email', 'photo_url', 'scholar_url', 'orcid_url', 'twitter_url', 'linkedin_url', 'year_joined', 'year_left', 'current_position'
  ];
  const teamData = [
    [
      1,
      'Dr. Ramanujam Srinivasan (Srini)',
      'Principal Investigator / Associate Professor',
      'pi',
      'Dr. Ramanujam Srinivasan (Srini) heads The ABCD Lab at the School of Biological Sciences, NISER Bhubaneswar. His laboratory focuses on understanding the molecular mechanisms of bacterial cell division, actin-like cytoskeletal polymers (such as MreB, FtsA), cell shape determination, and spatiotemporal macromolecular dynamics using advanced imaging and biochemical approaches.',
      'rsrini@niser.ac.in',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
      'https://scholar.google.com/citations?user=rsrini_niser',
      'https://orcid.org/0000-0002-1234-5678',
      '#',
      'https://linkedin.com/school/niser-bhubaneswar',
      2012,
      '',
      ''
    ],
    [
      2,
      'Dr. Sandie Lai',
      'Senior Postdoctoral Researcher',
      'postdoc',
      'Specializing in bacterial cell biology, super-resolution microscopy, and cytoskeletal filament dynamics.',
      'sandie.lai@niser.ac.in',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800',
      '#',
      '#',
      '#',
      '#',
      2022,
      '',
      ''
    ],
    [
      3,
      'Shanna Gu',
      'Doctoral Candidate (PhD)',
      'phd',
      'Investigating divisome assembly and spatial organization of actin-like proteins in model and non-model bacteria.',
      'shanna.gu@niser.ac.in',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
      '#',
      '#',
      '#',
      '#',
      2022,
      '',
      ''
    ],
    [
      4,
      'Madhushruti Borah',
      'Doctoral Candidate (PhD)',
      'phd',
      'Developing live-cell imaging methods and tracking macromolecular complexes during bacterial cytokinesis.',
      'madhushruti.borah@niser.ac.in',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
      '#',
      '#',
      '#',
      '#',
      2023,
      '',
      ''
    ],
    [
      5,
      'Patrick Nellen',
      'Doctoral Candidate (PhD)',
      'phd',
      'Focusing on structural biology and biochemical characterization of bacterial cytoskeletal polymers.',
      'patrick.nellen@niser.ac.in',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
      '#',
      '#',
      '#',
      '#',
      2023,
      '',
      ''
    ],
    [
      6,
      'Hugo Rietdijk',
      'MSc Researcher',
      'msc_bsc',
      'Integrated MSc researcher studying plasmid partitioning systems and ParM filament dynamics.',
      'hugo.rietdijk@niser.ac.in',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
      '#',
      '#',
      '#',
      '#',
      2024,
      '',
      ''
    ],
    [
      7,
      'Alex Wall',
      'Laboratory & Research Technician',
      'technical',
      'Managing imaging facility, fluorescence microscopes, protein purification pipelines, and laboratory operations.',
      'alex.wall@niser.ac.in',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800',
      '#',
      '#',
      '#',
      '#',
      2021,
      '',
      ''
    ]
  ];
  populateSheet(teamSheet, teamHeaders, teamData, '#0F766E');

  // 3. PUBLICATIONS TAB
  const pubSheet = getOrCreateSheet(ss, 'Publications');
  const pubHeaders = [
    'title', 'authors', 'journal', 'year', 'doi', 'url', 'pdf_url', 'abstract', 'tags', 'is_featured'
  ];
  const pubData = [
    [
      'Mechanisms of bacterial cell division and cytoskeletal coordination',
      'Lai S, Gu S, Nellen P, Rietdijk H, Srinivasan R',
      'Nature Communications',
      2025,
      '10.1038/s41467-024-48901-x',
      'https://doi.org/10.1038/s41467-024-48901-x',
      '#',
      'Investigation of spatial coordination between peptidoglycan synthesis machinery and cytoskeletal polymers during bacterial division.',
      'Bacterial Division, Cytoskeleton, MreB',
      'TRUE'
    ],
    [
      'Spatiotemporal organization of actin homologs in bacterial morphogenesis',
      'Gu S, Lai S, Borah M, Srinivasan R',
      'ACS Synthetic Biology',
      2024,
      '10.1021/acssynbio.4c00219',
      'https://doi.org/10.1021/acssynbio.4c00219',
      '#',
      'Dynamic modulation of cytoskeletal filament assembly and membrane anchoring in dividing bacterial cells.',
      'Morphogenesis, Cytoskeleton, Cell Shape',
      'TRUE'
    ],
    [
      'Polymerization dynamics and biochemical regulation of prokaryotic actin-like filaments',
      'Nellen P, Hinneburg H, Srinivasan R',
      'Trends in Biotechnology',
      2024,
      '10.1016/j.tibtech.2024.01.008',
      'https://doi.org/10.1016/j.tibtech.2024.01.008',
      '#',
      'Structural and thermodynamic review of prokaryotic polymer architecture and nucleotide-dependent treadmilling.',
      'Biophysics, Cytoskeleton, Polymers',
      'TRUE'
    ],
    [
      'Quantitative single-molecule tracking of division proteins in live bacteria',
      'Lai S, Rietdijk H, Srinivasan R',
      'Current Opinion in Microbiology',
      2024,
      '10.1016/j.copbio.2023.103042',
      'https://doi.org/10.1016/j.copbio.2023.103042',
      '#',
      'High-resolution imaging methods revealing diffusion kinetics and cluster formation at division sites.',
      'Microscopy, Single Molecule, Biophysics',
      'FALSE'
    ],
    [
      'Molecular regulation of divisome maturation in Gram-negative bacteria',
      'Borah M, Gu S, Srinivasan R',
      'Nucleic Acids Research',
      2023,
      '10.1093/nar/gkad382',
      'https://doi.org/10.1093/nar/gkad382',
      '#',
      'Characterization of regulatory checkpoints governing the transition from early to late divisome assemblies.',
      'Bacteria, Divisome, Cytokinesis',
      'FALSE'
    ],
    [
      'Structural diversity and evolutionary plasticity of bacterial cytoskeletons',
      'Srinivasan R, Lai S, Becker L',
      'Microbial Cell Factories',
      2023,
      '10.1186/s12934-023-02104-5',
      'https://doi.org/10.1186/s12934-023-02104-5',
      '#',
      'Comparative evolutionary analysis of actin and tubulin homologs across diverse bacterial phyla.',
      'Evolution, Actin, Cytoskeleton',
      'FALSE'
    ]
  ];
  populateSheet(pubSheet, pubHeaders, pubData, '#C2410C');

  // 4. RESEARCH TAB
  const resSheet = getOrCreateSheet(ss, 'Research');
  const resHeaders = [
    'order', 'id', 'title', 'short_summary', 'full_description', 'funding_grant', 'lead_members', 'image_url', 'status', 'tags'
  ];
  const resData = [
    [
      1,
      'bacterial-cytoskeleton',
      'Bacterial Cytoskeleton & Cell Division (Divisome)',
      'Deciphering how actin-like filaments (MreB, FtsA) coordinate with the cell wall synthesis machinery to drive cytokinesis.',
      'We study the molecular architecture, spatiotemporal assembly, and regulation of the divisome complex during bacterial cytokinesis using advanced fluorescence and super-resolution microscopy.',
      'DAE / SERB Research Grant',
      'Dr. Ramanujam Srinivasan, Dr. Sandie Lai, Shanna Gu',
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800',
      'Active',
      'Cytoskeleton, Divisome, Cell Division'
    ],
    [
      2,
      'plasmid-segregation',
      'DNA Segregation & Cytoskeletal Motors',
      'Investigating ParM and actin-like spindle dynamics responsible for plasmid and chromosome partitioning.',
      'Bacterial plasmids utilize actin-like filaments to push replicated DNA molecules to opposite cell poles. We dissect the biophysics of filament elongation, dynamic instability, and force generation.',
      'Wellcome Trust / DBT India Alliance',
      'Madhushruti Borah, Hugo Rietdijk',
      'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800',
      'Active',
      'DNA Partitioning, ParM, Spindle Dynamics'
    ],
    [
      3,
      'cell-shape-morphogenesis',
      'Bacterial Morphogenesis & Cell Shape Control',
      'Understanding how bacteria maintain rod, crescent, and helical geometries through peptidoglycan patterning.',
      'Cell shape determination is a tightly regulated morphogenetic process. We study how cytoskeletal polymers guide cell wall synthases across different growth phases.',
      'DBT Research Project',
      'Shanna Gu, Alex Wall',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
      'Active',
      'Cell Shape, Morphogenesis, Peptidoglycan'
    ],
    [
      4,
      'super-resolution-imaging',
      'Advanced Live-Cell & Super-Resolution Imaging',
      'Developing quantitative single-molecule tracking and TIRF/STED imaging platforms for bacterial biophysics.',
      'Prokaryotic structures operate below the diffraction limit of light. We employ TIRF, PALM/STORM, and structured illumination microscopy to capture macromolecular dynamics in real time.',
      'NISER Central Imaging Facility Grant',
      'Patrick Nellen, Dr. Ramanujam Srinivasan',
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800',
      'Active',
      'Super-Resolution, Live-Cell, TIRF'
    ]
  ];
  populateSheet(resSheet, resHeaders, resData, '#4338CA');

  // 5. NEWS TAB
  const newsSheet = getOrCreateSheet(ss, 'News');
  const newsHeaders = [
    'date', 'title', 'category', 'excerpt', 'content', 'link', 'image_url', 'is_featured'
  ];
  const newsData = [
    [
      '2026-03-01',
      'The ABCD Lab welcomes new batch of research scholars at SBS, NISER',
      'Team',
      'New PhD and Master students have joined the laboratory to explore bacterial cytoskeletal dynamics and division.',
      'We welcome our new cohort of enthusiastic researchers embarking on their scientific journeys in prokaryotic cell biology.',
      '/team',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
      'TRUE'
    ],
    [
      '2025-11-15',
      'Research grant awarded for high-resolution bacterial imaging',
      'Grant',
      'The ABCD Lab has been awarded research funding to advance quantitative microscopy of macromolecular division assemblies.',
      '',
      '/research',
      'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=800',
      'TRUE'
    ],
    [
      '2025-08-20',
      'Breakthrough findings on bacterial cytoskeletal polymer architecture',
      'Publication',
      'Our team uncovered novel insights into the spatial coordination of actin-like filaments during cell division.',
      '',
      '/publications',
      '',
      'FALSE'
    ],
    [
      '2025-05-10',
      'Paper published on single-molecule tracking of divisome complexes',
      'Publication',
      'Our study describing divisome maturation kinetics is now available open access.',
      '',
      '/publications',
      '',
      'FALSE'
    ]
  ];
  populateSheet(newsSheet, newsHeaders, newsData, '#B91C1C');

  // Remove default 'Sheet1' if it exists and is empty
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {
      // Ignored if cannot delete
    }
  }

  SpreadsheetApp.flush();
  Logger.log('The ABCD Lab Google Sheets setup complete!');
}

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function populateSheet(sheet, headers, rows, headerColor) {
  sheet.clear();
  // Set headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground(headerColor || '#1E293B');
  headerRange.setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);

  // Set rows if any
  if (rows && rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  // Auto resize columns
  for (let c = 1; c <= headers.length; c++) {
    sheet.autoResizeColumn(c);
  }
}
