---
name: web-search-lite
description: Perform web search in pure command-line environment (WSL) using curl with Jina AI's search interface. Use when you need to search the web without a browser, fetching plain text via https://s.jina.ai/<query> and summarizing for the user. If s.jina.ai requires authentication, fallback to using https://r.jina.ai/http://<URL> to read specific webpages. This skill is for lightweight, browser-free web search and content fetching.
---

# Web Search Lite

This skill enables web search and webpage content fetching in a pure command-line environment (like WSL) using `curl` with Jina AI's APIs. It avoids browser automation and browser-use tools, relying solely on command-line HTTP requests.

## When to Use

- User asks to "search the web" in a CLI-only environment
- You need to fetch content from a specific URL without a browser
- Browser automation is unavailable or undesirable
- You want lightweight, fast text extraction

## Prerequisites

1. **curl** must be installed (usually available by default)
2. **Internet connectivity** from the command line
3. **Optional**: Jina AI API key for search endpoint (if `s.jina.ai` returns 401)

## How It Works

### 1. Web Search via `s.jina.ai`

The primary search endpoint is:

```bash
curl -s "https://s.jina.ai/<URL-encoded-query>"
```

**Example:**
```bash
curl -s "https://s.jina.ai/linux%20kernel%20latest%20news"
```

**Response:** Returns plain text search results (markdown format) from Jina's search engine.

**Authentication:** If you receive a 401 error, the endpoint may require an API key. Provide it via the `Authorization` header:

```bash
curl -s -H "Authorization: Bearer $JINA_API_KEY" "https://s.jina.ai/query"
```

Set `JINA_API_KEY` environment variable if needed.

### 2. Webpage Reading via `r.jina.ai`

If you have a specific URL to read (instead of a search query), use Jina's Reader API:

```bash
curl -s "https://r.jina.ai/http://<URL>"
```

**Example:**
```bash
curl -s "https://r.jina.ai/http://example.com"
```

**Response:** Returns the webpage content converted to clean markdown, including title, source URL, and main content.

This endpoint is generally free (rate-limited) and does not require authentication for basic use.

### 3. Fallback Strategy

When `s.jina.ai` fails (e.g., 401 Authentication Required):

1. If the user provided a specific URL, use `r.jina.ai` to fetch that URL directly.
2. If the user only gave a search query, you may:
   - Prompt the user to provide a Jina API key (set `JINA_API_KEY` environment variable)
   - Or, suggest using the `web_search` tool if available (requires OpenClaw's Brave Search API configuration)
   - Or, attempt an alternative search method (see Alternatives section below)

## Step-by-Step Workflow

### For Search Queries

1. **URL‑encode the query**: Replace spaces with `%20` or use `curl -G --data-urlencode`.
2. **Call `s.jina.ai`**:
   ```bash
   query="linux kernel news"
   encoded_query=$(echo "$query" | sed 's/ /%20/g')
   curl -s "https://s.jina.ai/$encoded_query"
   ```
3. **Check for errors**: If response contains `"code":401`, authentication is required.
4. **If authenticated call succeeds**, capture the output and **summarize** the key points for the user.
5. **If authentication fails and no API key is available**, fallback to `r.jina.ai` with a relevant URL (if the user can provide one), or explain the limitation.

### For Specific URLs

1. **Ensure the URL starts with `http://` or `https://`** (the `r.jina.ai` endpoint expects `http://` prefix).
2. **Call `r.jina.ai`**:
   ```bash
   curl -s "https://r.jina.ai/http://github.com"
   ```
3. **Extract the markdown content** (look for the "Markdown Content:" section in the response).
4. **Summarize** the webpage for the user, highlighting the main information.

## Summarization Guidelines

After fetching the text:

1. **Read the first 2000 characters** to understand the topic.
2. **Identify key sections** (headings, lists, important paragraphs).
3. **Condense** the content into 3–5 bullet points or a short paragraph.
4. **Include the source** (search query or URL) in your summary.
5. **If the content is large**, offer to extract specific parts upon request.

## Examples

### Example 1: Search for "Python async tutorial"

```bash
curl -s "https://s.jina.ai/Python%20async%20tutorial"
```

**Agent's summary:**
> I found several resources on Python asynchronous programming:
> - Real Python's async/await tutorial covering coroutines, tasks, and event loops
> - Official asyncio documentation with examples
> - A blog post comparing asyncio with threading
> - Video tutorial series on YouTube
>
> The most recommended starting point is the Real Python tutorial for beginners.

### Example 2: Read a specific article

```bash
curl -s "https://r.jina.ai/http://news.ycombinator.com"
```

**Agent's summary:**
> Hacker News front page currently shows:
> - "Show HN: A new lightweight vector database"
> - Discussion on Rust's borrow checker improvements
> - Article about AI code review tools
> - Debate on remote work productivity studies
>
> Top story has 324 points and 86 comments.

## Troubleshooting

- **`s.jina.ai` returns 401**: Set `JINA_API_KEY` environment variable with a valid Jina AI API key.
- **No results or empty response**: The query may be too broad; try a more specific search.
- **Slow response**: Jina's free tier may have rate limits; wait a few seconds and retry.
- **`curl` not found**: Install curl via `sudo apt install curl` (Ubuntu/Debian) or equivalent.

## Alternatives When Jina Endpoints Are Unavailable

If both `s.jina.ai` and `r.jina.ai` fail:

1. **Use OpenClaw's built-in `web_search` tool** (if configured with Brave Search API).
2. **Use `web_fetch` tool** for fetching specific URLs (also uses Jina Reader internally).
3. **Manual search with other engines**: You can try `curl` with DuckDuckGo's HTML interface:
   ```bash
   curl -s -A 'Mozilla' 'https://html.duckduckgo.com/html/?q=query'
   ```
   (Note: requires HTML parsing, which is more complex.)

## Notes

- This skill is designed for simplicity and command-line purity.
- Always respect rate limits and terms of service of Jina AI's services.
- For production or heavy usage, obtain a proper API key from [jina.ai](https://jina.ai).

## Quick Reference

| Task | Command |
|------|---------|
| Search | `curl -s "https://s.jina.ai/<query>"` |
| Read URL | `curl -s "https://r.jina.ai/http://<url>"` |
| With API key | `curl -s -H "Authorization: Bearer $JINA_API_KEY" "https://s.jina.ai/<query>"` |

