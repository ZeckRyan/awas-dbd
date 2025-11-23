import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// API endpoint untuk sync berita dari external API ke database
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Fetch berita dari external API (NewsData.io)
    const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY
    if (!NEWSDATA_API_KEY) {
      return NextResponse.json(
        { error: 'NewsData API key not configured' },
        { status: 500 }
      )
    }

    // Query untuk berita DBD/Dengue dalam bahasa Indonesia
    const newsResponse = await fetch(
      `https://newsdata.io/api/1/latest?apikey=${NEWSDATA_API_KEY}&q=demam%20berdarah%20OR%20dengue%20OR%20DBD&country=id&language=id&category=health,science&size=10`
    )

    if (!newsResponse.ok) {
      throw new Error('Failed to fetch news from external API')
    }

    const newsData = await newsResponse.json()
    
    if (!newsData.results || newsData.results.length === 0) {
      return NextResponse.json(
        { message: 'No new articles found', synced: 0 },
        { status: 200 }
      )
    }

    let syncedCount = 0
    
    // Insert atau update setiap artikel ke database
    for (const article of newsData.results) {
      try {
        // Cek apakah artikel sudah ada berdasarkan URL
        const { data: existingArticle } = await supabase
          .from('news_articles')
          .select('id')
          .eq('url', article.link)
          .single()

        if (existingArticle) {
          // Artikel sudah ada, skip
          continue
        }

        // Tentukan kategori berdasarkan keywords
        let category = 'Berita DBD Terbaru'
        const title = article.title?.toLowerCase() || ''
        const description = article.description?.toLowerCase() || ''
        
        if (title.includes('vaksin') || description.includes('vaksin')) {
          category = 'Vaksin Dengue'
        } else if (title.includes('teknologi') || title.includes('ai') || description.includes('teknologi')) {
          category = 'Teknologi Deteksi'
        } else if (title.includes('pencegahan') || title.includes('3m') || description.includes('pencegahan')) {
          category = 'Pencegahan DBD'
        }

        // Extract keywords dari title dan description
        const keywords = extractKeywords(article.title + ' ' + (article.description || ''))

        // Insert artikel baru
        const { error: insertError } = await supabase
          .from('news_articles')
          .insert({
            title: article.title || 'Untitled',
            description: article.description || null,
            content: article.content || article.description || null,
            url: article.link,
            image_url: article.image_url || null,
            published_at: article.pubDate ? new Date(article.pubDate).toISOString() : new Date().toISOString(),
            source_name: article.source_name || article.source_id || 'Unknown',
            category: category,
            keywords: keywords
          })

        if (!insertError) {
          syncedCount++
        } else {
          console.error('Error inserting article:', insertError)
        }
      } catch (articleError) {
        console.error('Error processing article:', articleError)
        continue
      }
    }

    return NextResponse.json({
      message: `Successfully synced ${syncedCount} new articles`,
      synced: syncedCount,
      total_fetched: newsData.results.length
    })

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync news articles' },
      { status: 500 }
    )
  }
}

// API endpoint untuk mendapatkan berita dari database
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    let query = supabase
      .from('news_articles')
      .select('*')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter berdasarkan kategori jika ada
    if (category && category !== 'Berita DBD Terbaru') {
      query = query.eq('category', category)
    }

    const { data: articles, error } = await query

    if (error) {
      throw error
    }

    // Get total count untuk pagination
    let countQuery = supabase
      .from('news_articles')
      .select('*', { count: 'exact', head: true })

    if (category && category !== 'Berita DBD Terbaru') {
      countQuery = countQuery.eq('category', category)
    }

    const { count } = await countQuery

    return NextResponse.json({
      articles: articles || [],
      pagination: {
        total: count || 0,
        page: page,
        limit: limit,
        total_pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Get articles error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

// Helper function untuk extract keywords
function extractKeywords(text: string): string[] {
  if (!text) return []
  
  const keywords = new Set<string>()
  const lowercaseText = text.toLowerCase()
  
  // DBD/Dengue related keywords
  const healthKeywords = ['dbd', 'dengue', 'demam berdarah', 'nyamuk', 'aedes aegypti', 'kesehatan', 'vaksin', 'pencegahan']
  const techKeywords = ['ai', 'teknologi', 'artificial intelligence', 'iot', 'digital', 'aplikasi', 'sistem']
  const locationKeywords = ['jakarta', 'indonesia', 'bandung', 'surabaya', 'medan', 'yogyakarta']
  const actionKeywords = ['penelitian', 'program', 'kampanye', 'edukasi', 'sosialisasi', '3m plus']
  
  const allKeywords = [...healthKeywords, ...techKeywords, ...locationKeywords, ...actionKeywords]
  
  allKeywords.forEach(keyword => {
    if (lowercaseText.includes(keyword)) {
      keywords.add(keyword.charAt(0).toUpperCase() + keyword.slice(1))
    }
  })
  
  return Array.from(keywords).slice(0, 5) // Maksimal 5 keywords
}