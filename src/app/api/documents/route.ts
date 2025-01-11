import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const documentId = url.searchParams.get('documentId');
  
  if (!documentId) {
    return new NextResponse('Missing documentId', { status: 400 });
  }

  try {
    const response = await fetch(
      `https://data.stortinget.no/eksport/publikasjon?publikasjonid=${documentId}&format=html`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const content = await response.text();
    
    return new NextResponse(content, {
      headers: { 
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return new NextResponse('Error fetching document', { status: 500 });
  }
}