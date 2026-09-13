import fs from 'node:fs';
import path from 'node:path';
import {
  fetchTeam,
  fetchPublications,
  fetchResearch,
  fetchNews,
  fetchSettings,
  fetchHomepage,
  fetchTeamPhotos,
} from '../src/lib/fetchSheetData.js';

const dataDir = path.resolve('src/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log('🔄 Fetching latest data directly from Google Sheets...');

try {
  const [team, publications, research, news, settings, homepage, photos] = await Promise.all([
    fetchTeam(),
    fetchPublications(),
    fetchResearch(),
    fetchNews(),
    fetchSettings(),
    fetchHomepage(),
    fetchTeamPhotos(),
  ]);

  fs.writeFileSync(path.join(dataDir, 'team.json'), JSON.stringify(team, null, 2), 'utf-8');
  fs.writeFileSync(path.join(dataDir, 'publications.json'), JSON.stringify(publications, null, 2), 'utf-8');
  fs.writeFileSync(path.join(dataDir, 'research.json'), JSON.stringify(research, null, 2), 'utf-8');
  fs.writeFileSync(path.join(dataDir, 'news.json'), JSON.stringify(news, null, 2), 'utf-8');
  fs.writeFileSync(path.join(dataDir, 'settings.json'), JSON.stringify(settings, null, 2), 'utf-8');
  fs.writeFileSync(path.join(dataDir, 'homepage.json'), JSON.stringify(homepage, null, 2), 'utf-8');
  fs.writeFileSync(path.join(dataDir, 'team_photos.json'), JSON.stringify(photos, null, 2), 'utf-8');

  console.log('✅ Successfully downloaded and saved Google Sheet data to src/data/:');
  console.log(`   - Team: ${team.length} members`);
  console.log(`   - Publications: ${publications.length} papers`);
  console.log(`   - Research: ${research.length} projects`);
  console.log(`   - News: ${news.length} articles`);
  console.log(`   - Settings: ${Object.keys(settings).length} properties`);
  console.log(`   - Homepage: ${Object.keys(homepage).length} properties`);
  console.log(`   - Photos: ${photos.length} photos`);
} catch (error) {
  console.error('⚠️ Error downloading Google Sheet data:', error.message || error);
  process.exit(1);
}
