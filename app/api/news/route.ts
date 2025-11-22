import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || 'demam berdarah'
  const language = 'id'
  const pageSize = 10
  
  const apiKey = process.env.NEWS_API_KEY
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'News API key not configured' },
      { status: 500 }
    )
  }

  try {
    // Fokus pada kata kunci DBD yang spesifik
    const dbdKeywords = {
      'demam': '"demam tinggi" OR "dengue" OR "DBD"',
      'demam-berdarah': '"demam berdarah" OR "dengue" OR "DBD"',
      'pencegahan': '"pencegahan DBD" OR "fogging" OR "3M dengue"',
      'vaksin': '"vaksin db" OR "vaksin DBD"',
      'teknologi': '"AI dengue" OR "deteksi DBD" OR "teknologi dbd"'
    }
    
    const searchQuery = dbdKeywords[query as keyof typeof dbdKeywords] || '"demam berdarah" OR "dengue" OR "DBD"'
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&language=${language}&pageSize=${pageSize}&sortBy=publishedAt&apiKey=${apiKey}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Dengue-Checker/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`News API responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    // Filter artikel untuk memastikan relevansi dengan DBD
    const filteredArticles = data.articles?.filter((article: any) => {
      if (!article.title || !article.description || !article.url) return false
      if (article.title.includes('[Removed]') || article.description.includes('[Removed]')) return false
      
      const titleLower = article.title.toLowerCase()
      const descLower = article.description.toLowerCase()
      
      return (
        titleLower.includes('dbd') ||
        titleLower.includes('demam berdarah') ||
        titleLower.includes('dengue') ||
        titleLower.includes('aedes') ||
        descLower.includes('dbd') ||
        descLower.includes('demam berdarah') ||
        descLower.includes('dengue') ||
        descLower.includes('aedes')
      )
    }) || []

    return NextResponse.json({
      articles: filteredArticles,
      totalResults: data.totalResults
    })
    
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}