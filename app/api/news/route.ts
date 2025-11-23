import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('q') || 'demam-berdarah'
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Map query ke kategori database
    const categoryMap: { [key: string]: string } = {
      'demam-berdarah': 'Berita DBD Terbaru',
      'pencegahan': 'Pencegahan DBD',
      'vaksin': 'Vaksin Dengue',
      'teknologi': 'Teknologi Deteksi'
    }
    
    const category = categoryMap[query] || 'Berita DBD Terbaru'

    let dbQuery = supabase
      .from('news_articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit)

    // Filter berdasarkan kategori jika bukan "Berita DBD Terbaru"
    if (category !== 'Berita DBD Terbaru') {
      dbQuery = dbQuery.eq('category', category)
    }

    const { data: articles, error } = await dbQuery

    if (error) {
      console.error('Database error:', error)
      // Fallback ke external API jika database error
      return await fetchFromExternalAPI(query, limit)
    }

    // Jika tidak ada artikel di database, coba sync dari external API
    if (!articles || articles.length === 0) {
      console.log('No articles in database, attempting to sync...')
      await syncFromExternalAPI()
      
      // Coba query lagi setelah sync
      const { data: retryArticles } = await dbQuery
      
      if (retryArticles && retryArticles.length > 0) {
        return NextResponse.json({
          articles: retryArticles.map(formatArticleFromDB),
          totalResults: retryArticles.length
        })
      }
      
      // Jika masih kosong, fallback ke external API
      return await fetchFromExternalAPI(query, limit)
    }

    return NextResponse.json({
      articles: articles.map(formatArticleFromDB),
      totalResults: articles.length
    })

  } catch (error) {
    console.error('API Error:', error)
    // Fallback ke external API jika ada error
    return await fetchFromExternalAPI(
      new URL(request.url).searchParams.get('q') || 'demam-berdarah', 
      10
    )
  }
}

// Fallback function untuk fetch dari external API
async function fetchFromExternalAPI(query: string, limit: number) {
  try {
    const apiKey = process.env.NEWSDATA_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'NewsData API key not configured' },
        { status: 500 }
      )
    }

    // Map query ke search terms
    const dbdKeywords: { [key: string]: string } = {
      'demam-berdarah': 'Demam Berdarah',
      'pencegahan': 'Pencegahan DBD',
      'vaksin': 'Vaksin Dengue',
      'teknologi': 'Teknologi DBD'
    }
    
    const searchQuery = dbdKeywords[query] || 'Demam Berdarah'
    const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=${encodeURIComponent(searchQuery)}&language=id&size=${limit}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Dengue-Checker/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`NewsData API responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    // Filter dan transform artikel
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
    console.error('External API Error:', error)
    return NextResponse.json({
      articles: [],
      totalResults: 0
    }, { status: 500 })
  }
}

// Function untuk sync otomatis dari external API
async function syncFromExternalAPI() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'
    const syncResponse = await fetch(`${baseUrl}/api/news/sync`, {
      method: 'POST'
    })
    
    if (syncResponse.ok) {
      console.log('Successfully synced news from external API')
    }
  } catch (error) {
    console.error('Auto sync failed:', error)
  }
}

// Format artikel dari database ke format yang expected oleh frontend
function formatArticleFromDB(article: any) {
  return {
    title: article.title,
    description: article.description || 'Baca selengkapnya di sumber berita...',
    url: article.url,
    urlToImage: article.image_url,
    publishedAt: article.published_at,
    source: {
      name: article.source_name || 'News'
    },
    author: article.source_name || null
  }
}