import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Search terms for each category
const searchQueries = {
  ai: ['AI tool', 'AI generator', 'AI assistant', 'machine learning app', 'chatbot'],
  devtools: ['developer tool', 'code editor', 'API tool', 'debugging tool', 'CLI tool'],
  gems: ['productivity app', 'design tool', 'utility app', 'creative tool', 'online converter']
}

// Platform domains to detect
const platformDomains = [
  { domain: 'vercel.app', platform: 'Vercel' },
  { domain: 'netlify.app', platform: 'Netlify' },
  { domain: 'railway.app', platform: 'Railway' },
  { domain: 'onrender.com', platform: 'OnRender' },
  { domain: 'render.com', platform: 'OnRender' },
  { domain: 'github.io', platform: 'GitHub' },
  { domain: 'replit.com', platform: 'Replit' },
  { domain: 'repl.co', platform: 'Replit' },
  { domain: 'lovable.app', platform: 'Lovable' },
  { domain: 'lovable.dev', platform: 'Lovable' },
  { domain: 'bolt.new', platform: 'Bolt' },
  { domain: 'fly.io', platform: 'Fly.io' },
  { domain: 'fly.dev', platform: 'Fly.io' },
  { domain: 'framer.site', platform: 'Framer' },
  { domain: 'bubble.io', platform: 'Bubble' },
]

function detectPlatform(url: string): string {
  const lowercaseUrl = url.toLowerCase()
  for (const { domain, platform } of platformDomains) {
    if (lowercaseUrl.includes(domain)) {
      return platform
    }
  }
  return 'Web'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Starting daily picks update...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const today = new Date().toISOString().split('T')[0]
    console.log(`📅 Updating picks for date: ${today}`)
    
    // Delete old picks (older than today)
    const { error: deleteError } = await supabase
      .from('daily_top_picks')
      .delete()
      .lt('valid_for_date', today)
    
    if (deleteError) {
      console.error('Error deleting old picks:', deleteError)
    }
    
    // Check if we already have picks for today
    const { data: existingPicks, error: checkError } = await supabase
      .from('daily_top_picks')
      .select('id')
      .eq('valid_for_date', today)
      .limit(1)
    
    if (checkError) {
      console.error('Error checking existing picks:', checkError)
    }
    
    if (existingPicks && existingPicks.length > 0) {
      console.log('✅ Picks already exist for today, skipping update')
      return new Response(
        JSON.stringify({ success: true, message: 'Picks already exist for today' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const allPicks: any[] = []
    
    // Try to use Firecrawl if available
    if (firecrawlApiKey) {
      console.log('🔥 Using Firecrawl for web search...')
      
      for (const [category, queries] of Object.entries(searchQueries)) {
        // Pick a random query for variety
        const query = queries[Math.floor(Math.random() * queries.length)]
        console.log(`🔍 Searching for "${query}" in category: ${category}`)
        
        try {
          const response = await fetch('https://api.firecrawl.dev/v1/search', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${firecrawlApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: `${query} site:vercel.app OR site:netlify.app OR site:railway.app OR site:render.com OR site:lovable.app`,
              limit: 6,
            }),
          })
          
          if (response.ok) {
            const data = await response.json()
            const results = data.data || []
            
            results.slice(0, 4).forEach((result: any, index: number) => {
              allPicks.push({
                title: result.title || 'Untitled',
                url: result.url,
                snippet: result.description || result.markdown?.substring(0, 200) || '',
                platform: detectPlatform(result.url),
                category,
                search_term: query,
                rank: index + 1,
                score: Math.round(80 + Math.random() * 20),
                valid_for_date: today,
              })
            })
          }
        } catch (searchError) {
          console.error(`Error searching ${category}:`, searchError)
        }
      }
    }
    
    // If no Firecrawl results, fall back to indexed_sites
    if (allPicks.length === 0) {
      console.log('📚 Using indexed_sites as fallback...')
      
      for (const category of ['ai', 'devtools', 'gems'] as const) {
        const searchTerm = searchQueries[category][0]
        
        // Get random high-quality sites from our index
        const { data: sites, error: sitesError } = await supabase
          .from('indexed_sites')
          .select('title, url, description, platform, search_score')
          .order('search_score', { ascending: false })
          .limit(50)
        
        if (sitesError) {
          console.error('Error fetching indexed sites:', sitesError)
          continue
        }
        
        // Shuffle and pick 4 random sites for variety
        const shuffled = sites?.sort(() => Math.random() - 0.5).slice(0, 4) || []
        
        shuffled.forEach((site, index) => {
          allPicks.push({
            title: site.title,
            url: site.url,
            snippet: site.description || '',
            platform: site.platform || detectPlatform(site.url),
            category,
            search_term: searchTerm,
            rank: index + 1,
            score: site.search_score || Math.round(70 + Math.random() * 30),
            valid_for_date: today,
          })
        })
      }
    }
    
    // If still no picks, use curated fallbacks
    if (allPicks.length === 0) {
      console.log('🎨 Using curated fallback picks...')
      
      const fallbacks = [
        // AI Category
        { title: 'AI Image Generator', url: 'https://ai-image-gen.vercel.app', snippet: 'Generate stunning images with AI', platform: 'Vercel', category: 'ai', search_term: 'AI tool', rank: 1, score: 95 },
        { title: 'ChatBot Builder', url: 'https://chatbot-builder.netlify.app', snippet: 'Build custom chatbots easily', platform: 'Netlify', category: 'ai', search_term: 'AI assistant', rank: 2, score: 92 },
        { title: 'ML Playground', url: 'https://ml-playground.railway.app', snippet: 'Experiment with machine learning models', platform: 'Railway', category: 'ai', search_term: 'machine learning', rank: 3, score: 88 },
        { title: 'Voice AI Demo', url: 'https://voice-ai-demo.lovable.app', snippet: 'Voice-powered AI interactions', platform: 'Lovable', category: 'ai', search_term: 'AI tool', rank: 4, score: 85 },
        // DevTools Category
        { title: 'Code Formatter', url: 'https://code-formatter.vercel.app', snippet: 'Format your code instantly', platform: 'Vercel', category: 'devtools', search_term: 'developer tool', rank: 1, score: 94 },
        { title: 'API Tester', url: 'https://api-tester.netlify.app', snippet: 'Test APIs with ease', platform: 'Netlify', category: 'devtools', search_term: 'API tool', rank: 2, score: 91 },
        { title: 'JSON Validator', url: 'https://json-validator.railway.app', snippet: 'Validate and format JSON', platform: 'Railway', category: 'devtools', search_term: 'developer tool', rank: 3, score: 87 },
        { title: 'Regex Tester', url: 'https://regex-tester.vercel.app', snippet: 'Test regular expressions', platform: 'Vercel', category: 'devtools', search_term: 'developer tool', rank: 4, score: 84 },
        // Gems Category
        { title: 'Color Palette Generator', url: 'https://color-palette.vercel.app', snippet: 'Create beautiful color palettes', platform: 'Vercel', category: 'gems', search_term: 'design tool', rank: 1, score: 93 },
        { title: 'Markdown Editor', url: 'https://markdown-editor.netlify.app', snippet: 'Write markdown with live preview', platform: 'Netlify', category: 'gems', search_term: 'productivity app', rank: 2, score: 90 },
        { title: 'QR Code Generator', url: 'https://qr-generator.railway.app', snippet: 'Generate QR codes instantly', platform: 'Railway', category: 'gems', search_term: 'utility app', rank: 3, score: 86 },
        { title: 'Resume Builder', url: 'https://resume-builder.lovable.app', snippet: 'Build professional resumes', platform: 'Lovable', category: 'gems', search_term: 'productivity app', rank: 4, score: 82 },
      ]
      
      fallbacks.forEach(fb => {
        allPicks.push({
          ...fb,
          valid_for_date: today,
        })
      })
    }
    
    console.log(`📊 Inserting ${allPicks.length} picks for today...`)
    
    // Insert new picks
    const { error: insertError } = await supabase
      .from('daily_top_picks')
      .insert(allPicks)
    
    if (insertError) {
      console.error('Error inserting picks:', insertError)
      throw insertError
    }
    
    console.log('✅ Daily picks updated successfully!')
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${allPicks.length} picks for ${today}`,
        picks: allPicks.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error updating daily picks:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
