#!/bin/bash
# Web Search Lite - Command-line web search using Jina AI
# Usage: ./web-search-lite.sh <query|URL>
# For search: ./web-search-lite.sh "search terms"
# For URL: ./web-search-lite.sh "https://example.com"

set -euo pipefail

JINA_API_KEY="${JINA_API_KEY:-}"
SEARCH_ENDPOINT="https://s.jina.ai"
READER_ENDPOINT="https://r.jina.ai"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

urlencode() {
    # Basic URL encoding: replace spaces with %20
    echo "$1" | sed 's/ /%20/g'
}

# Check if curl is available
if ! command -v curl &> /dev/null; then
    log_error "curl is required but not installed. Please install curl."
    exit 1
fi

# Check arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 <query|URL>"
    echo "  For search: $0 'search terms'"
    echo "  For URL:    $0 'https://example.com'"
    exit 1
fi

INPUT="$*"

# Determine if input is a URL (starts with http:// or https://)
if [[ "$INPUT" =~ ^https?:// ]]; then
    MODE="url"
    URL="$INPUT"
else
    MODE="search"
    QUERY="$INPUT"
fi

if [ "$MODE" = "search" ]; then
    log_info "Searching for: $QUERY"
    ENCODED_QUERY=$(urlencode "$QUERY")
    
    # Prepare curl command
    CURL_CMD="curl -s"
    if [ -n "$JINA_API_KEY" ]; then
        CURL_CMD="$CURL_CMD -H 'Authorization: Bearer $JINA_API_KEY'"
    fi
    
    # Make request
    RESPONSE=$(eval "$CURL_CMD '$SEARCH_ENDPOINT/$ENCODED_QUERY'" 2>/dev/null || true)
    
    # Check for authentication error
    if echo "$RESPONSE" | grep -q '"code":401'; then
        log_warning "Authentication required for search endpoint."
        log_warning "Set JINA_API_KEY environment variable or use a specific URL instead."
        echo ""
        echo "You can also try reading a specific URL:"
        echo "  $0 'https://example.com'"
        exit 1
    fi
    
    # Check if response is empty
    if [ -z "$RESPONSE" ]; then
        log_error "Empty response from search endpoint. Please try again."
        exit 1
    fi
    
    echo "--- Search Results ---"
    echo "$RESPONSE"
    
elif [ "$MODE" = "url" ]; then
    log_info "Fetching URL: $URL"
    
    # r.jina.ai expects the URL to be prefixed with http://
    # Ensure the URL starts with http:// or https://
    if [[ "$URL" =~ ^https:// ]]; then
        # Replace https:// with http:// for the endpoint (r.jina.ai expects http://)
        READER_URL="${READER_ENDPOINT}/http://${URL:8}"
    else
        READER_URL="${READER_ENDPOINT}/$URL"
    fi
    
    RESPONSE=$(curl -s "$READER_URL" 2>/dev/null || true)
    
    if [ -z "$RESPONSE" ]; then
        log_error "Failed to fetch URL. Please check the URL and try again."
        exit 1
    fi
    
    echo "--- Webpage Content ---"
    echo "$RESPONSE"
fi

log_info "Done. Use the output above for summarization."