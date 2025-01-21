// app/api/cron/polls/route.ts
import { NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import { db } from '~/server/db';

const POLL_URL = 'https://www.pollofpolls.no/?cmd=Stortinget&do=visallesnitt';

const PARTY_MAP: { [key: string]: string } = {
  'Ap': 'A',
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
  const dateCell = row.querySelector('th')?.textContent;
  const monthYear = parsePollDate(dateCell);
  
  if (!monthYear) {
    console.error('Could not parse date from row:', dateCell);
    return null;
  }

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
    for (let i = 0; i < cells.length - 1; i++) {
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

    return poll;
  } catch (error) {
    console.error(`Error processing poll for ${monthYear}:`, error);
    return null;
  }
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    console.log('Fetching poll data...');
    const response = await fetch(POLL_URL);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Get only the first row (latest poll)
    const firstRow = document.querySelector('tbody tr:nth-child(2)');
    if (!firstRow) {
      return NextResponse.json({ message: 'No poll data found' }, { status: 404 });
    }

    const poll = await processPollRow(firstRow);
    
    if (!poll) {
      return NextResponse.json({ message: 'No new polls to process' });
    }

    return NextResponse.json({ 
      message: 'Poll data processed successfully',
      monthYear: poll.monthYear 
    });

  } catch (error) {
    console.error('Error processing poll data:', error);
    return NextResponse.json(
      { error: 'Failed to process poll data' }, 
      { status: 500 }
    );
  }
}