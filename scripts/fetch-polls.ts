// scripts/fetch-polls.ts
import { JSDOM } from 'jsdom';
import { db } from '../src/server/db';

const POLL_URL = 'https://www.pollofpolls.no/?cmd=Stortinget&do=visallesnitt';

// Map party abbreviations to your database party IDs
const PARTY_MAP: { [key: string]: string } = {
  'Ap': 'A',     // Replace with actual party IDs from your database
  'H': 'H',
  'Frp': 'FrP',
  'SV': 'SV',
  'Sp': 'Sp',
  'KrF': 'KrF',
  'V': 'V',
  'MDG': 'MDG',
  'R': 'R'
};

function getMonthNumber(norwegianMonth: string): number {
  const months: { [key: string]: number } = {
    'januar': 1, 'februar': 2, 'mars': 3, 'april': 4,
    'mai': 5, 'juni': 6, 'juli': 7, 'august': 8,
    'september': 9, 'oktober': 10, 'november': 11, 'desember': 12
  };
  return months[norwegianMonth.toLowerCase()] || 1;
}

function parsePollDate(dateText: string | null | undefined): string | null {
  if (!dateText) return null;

  // Split the date text and handle potential undefined values
  const parts = dateText.trim().split(' ');
  if (parts.length !== 2) {
    console.error(`Invalid date format: ${dateText}`);
    return null;
  }

  const monthPart = parts[0];
  const yearPart = parts[1];
  
  if (!monthPart || !yearPart) {
    console.error(`Missing month or year in date: ${dateText}`);
    return null;
  }
  
  // Extract year from format like "'25" or "25"
  const yearMatch = yearPart.match(/['"]?(\d{2})['"]?/);
  if (!yearMatch) {
    console.error(`Could not parse year from: ${yearPart}`);
    return null;
  }

  const year = '20' + yearMatch[1];
  const monthNum = getMonthNumber(monthPart);
  
  return `${year}-${String(monthNum).padStart(2, '0')}`;
}

async function processPollRow(row: Element) {
  // Extract month and year
  const dateCell = row.querySelector('th')?.textContent;
  const monthYear = parsePollDate(dateCell);
  
  if (!monthYear) {
    console.error('Could not parse date from row:', dateCell);
    return null;
  }

  console.log(`Processing poll for ${monthYear}...`);

  try {
    // Check if poll already exists
    const existingPoll = await db.poll.findUnique({
      where: { monthYear }
    });

    if (existingPoll) {
      console.log(`Poll for ${monthYear} already exists, skipping...`);
      return null;
    }

    // Create new poll
    const poll = await db.poll.create({
      data: { monthYear }
    });

    // Process each party's results
    const cells = Array.from(row.querySelectorAll('td'));
    for (let i = 0; i < cells.length - 1; i++) { // Skip "Andre" (others)
      const cell = cells[i];
      const partyAbbrevs = Object.keys(PARTY_MAP);
      if (i >= partyAbbrevs.length) {
        console.warn(`No party mapping found for index ${i}`);
        continue;
      }
      const partyAbbr = partyAbbrevs[i];
      const partyId = PARTY_MAP[partyAbbr];
      
      if (!cell || !partyId) {
        console.warn(`Skipping cell for party ${partyAbbr} - missing data or mapping`);
        continue;
      }

      const cellText = cell.textContent?.trim() || '';
      const matches = cellText.match(/(\d+[,.]?\d*)\s*\((\d+)\)/);
      
      if (!matches) {
        console.warn(`Could not parse poll data from cell: ${cellText}`);
        continue;
      }

      const [, percentageStr, mandatesStr] = matches;
      const percentage = parseFloat(percentageStr.replace(',', '.'));
      const mandates = parseInt(mandatesStr);

      if (isNaN(percentage) || isNaN(mandates)) {
        console.warn(`Invalid numbers in poll data: ${cellText}`);
        continue;
      }

      await db.pollResult.create({
        data: {
          pollId: poll.id,
          partyId,
          percentage,
          mandates
        }
      });
    }

    console.log(`Successfully processed poll for ${monthYear}`);
    return poll;
  } catch (error) {
    console.error(`Error processing poll for ${monthYear}:`, error);
    return null;
  }
}

async function fetchAllPolls() {
  try {
    console.log('Fetching poll data...');
    const response = await fetch(POLL_URL);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Get all data rows
    const rows = Array.from(document.querySelectorAll('tbody tr')).slice(1); // Skip header row
    console.log(`Found ${rows.length} polls to process`);

    // Process each row
    let successCount = 0;
    let errorCount = 0;

    for (const row of rows) {
      try {
        const poll = await processPollRow(row);
        if (poll) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error('Error processing row:', error);
        errorCount++;
      }
    }

    console.log('\nProcessing complete!');
    console.log(`Successfully processed: ${successCount} polls`);
    console.log(`Failed to process: ${errorCount} polls`);

  } catch (error) {
    console.error('Error fetching poll data:', error);
  } finally {
    await db.$disconnect();
  }
}

// Run the script
fetchAllPolls().catch(console.error);