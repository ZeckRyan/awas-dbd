import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || 'demam-berdarah'
  
  const apiKey = process.env.NEWSDATA_API_KEY
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'NewsData API key not configured' },
      { status: 500 }
    )
  }

  try {
    // Fokus pada kata kunci DBD yang spesifik
    const dbdKeywords = {
      'demam-berdarah': 'Demam Berdarah',
      'pencegahan': 'Pencegahan DBD',
      'vaksin': 'Vaksin Dengue',
      'teknologi': 'Teknologi DBD'
    }
    
    const searchQuery = dbdKeywords[query as keyof typeof dbdKeywords] || 'Demam Berdarah'
    const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=${encodeURIComponent(searchQuery)}&language=id&size=10`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Dengue-Checker/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`NewsData API responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    // Filter dan transform artikel untuk kompatibilitas dengan interface existing
    const filteredArticles = data.results?.filter((article: any) => {
      if (!article.title || !article.link) return false
      
      const titleLower = article.title.toLowerCase()
      const descLower = (article.description || '').toLowerCase()
      
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
    }).map((article: any) => ({
      title: article.title,
      description: article.description || 'Baca selengkapnya di sumber berita...',
      url: article.link,
      urlToImage: article.image_url,
      publishedAt: article.pubDate,
      source: {
        name: article.source_id || 'NewsData'
      },
      author: article.creator?.[0] || article.source_id || null
    })) || []

    return NextResponse.json({
      articles: filteredArticles,
      totalResults: data.totalResults || filteredArticles.length
    })
    
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news from NewsData' },
      { status: 500 }
    )
  }
}