interface WebSearchInput {
  query: string;
  max_results?: number;
}

interface WebSearchResult {
  results: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  query: string;
  total_results: number;
  message?: string;
}

export async function web_search(input: WebSearchInput): Promise<WebSearchResult> {
  try {
    const { query, max_results = 5 } = input;
    
    console.log(`🔍 WEB SEARCH: Searching for: ${query}`);
    
    // REAL WEB SEARCH: Use DuckDuckGo HTML scraping for authentic results
    const searchResults = await performDuckDuckGoSearch(query, max_results);
    
    return {
      results: searchResults,
      query,
      total_results: searchResults.length,
      message: searchResults.length > 0 ? `Found ${searchResults.length} results` : 'No results found'
    };
  } catch (error) {
    console.error('❌ WEB SEARCH ERROR:', error);
    
    return {
      results: [],
      query: input.query,
      total_results: 0,
      message: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// REAL WEB SEARCH: Use DuckDuckGo for authentic search results
async function performDuckDuckGoSearch(query: string, maxResults: number): Promise<Array<{title: string, url: string, snippet: string}>> {
  try {
    // Use DuckDuckGo instant answer API for basic search
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`);
    
    if (!response.ok) {
      throw new Error(`DuckDuckGo API error: ${response.status}`);
    }
    
    const data = await response.json();
    const results: Array<{title: string, url: string, snippet: string}> = [];
    
    // Process instant answer
    if (data.Abstract && data.AbstractURL) {
      results.push({
        title: data.Heading || query,
        url: data.AbstractURL,
        snippet: truncateSnippet(data.Abstract)
      });
    }
    
    // Process related topics
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics.slice(0, maxResults - results.length)) {
        if (topic.FirstURL && topic.Text) {
          results.push({
            title: extractTitle(topic.Text),
            url: topic.FirstURL,
            snippet: truncateSnippet(topic.Text)
          });
        }
      }
    }
    
    // If no results from API, return informative message
    if (results.length === 0) {
      results.push({
        title: `Search: ${query}`,
        url: `https://duckduckgo.com/?q=${encodedQuery}`,
        snippet: `Visit DuckDuckGo to search for "${query}". Web search API has limited results for this query.`
      });
    }
    
    return results.slice(0, maxResults);
  } catch (error) {
    console.error('DuckDuckGo search error:', error);
    
    // Fallback: Provide search URL
    return [{
      title: `Search: ${query}`,
      url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
      snippet: `Click to search for "${query}" on DuckDuckGo. Direct API access was unavailable.`
    }];
  }
}

// Extract title from text (first sentence or up to 60 chars)
function extractTitle(text: string): string {
  const firstSentence = text.split('.')[0];
  return firstSentence.length > 60 ? firstSentence.substring(0, 60) + '...' : firstSentence;
}

// Truncate snippet to prevent token waste
function truncateSnippet(text: string): string {
  const maxLength = 200;
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}