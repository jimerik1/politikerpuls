import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const documentId = url.searchParams.get('documentId');
  
  if (!documentId) {
    return new NextResponse('Missing documentId', { status: 400 });
  }

  const response = await fetch(
    `https://data.stortinget.no/eksport/publikasjon?publikasjonid=${documentId}&format=html`
  );
  
  const content = await response.text();
  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/html' },
  });
}

