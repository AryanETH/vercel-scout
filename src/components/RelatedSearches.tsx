import { Search } from "lucide-react";

interface RelatedSearchesProps {
  query: string;
  onSearch: (query: string, isSuggestion?: boolean) => void;
}

// Smart tool suggestions based on search context
function generateSmartToolSuggestions(query: string): string[] {
  const queryLower = query.toLowerCase().trim();
  
  // Tool-specific related suggestions mapping
  const toolMappings: Record<string, string[]> = {
    // Image tools
    "image to pdf": ["png to pdf", "jpeg to pdf", "merge images to pdf", "pdf to image", "image compressor", "bulk image converter"],
    "pdf to image": ["pdf to png", "pdf to jpeg", "image to pdf", "pdf merger", "pdf splitter", "pdf editor free"],
    "background remover": ["image editor free", "photo enhancer", "image upscaler", "transparent png maker", "photo background changer", "ai image generator"],
    "image compressor": ["png compressor", "jpeg optimizer", "bulk image resize", "webp converter", "image to webp", "lossless compression"],
    "image resize": ["bulk image resizer", "image cropper", "aspect ratio calculator", "image to icon", "favicon generator", "thumbnail maker"],
    "png to": ["png to jpg", "png to svg", "png to ico", "png to webp", "png compressor", "transparent png maker"],
    "jpg to": ["jpg to png", "jpg to pdf", "jpg to svg", "jpg to webp", "jpeg optimizer", "image quality enhancer"],
    "svg": ["svg editor", "svg to png", "png to svg", "svg optimizer", "icon maker", "vector graphics editor"],
    
    // PDF tools
    "pdf": ["pdf editor free", "pdf merger", "pdf splitter", "pdf compressor", "pdf to word", "word to pdf"],
    "merge pdf": ["pdf splitter", "pdf compressor", "pdf editor", "combine pdfs online", "pdf organizer", "pdf page extractor"],
    "compress pdf": ["pdf optimizer", "reduce pdf size", "pdf merger", "pdf to image", "image compressor", "file compressor"],
    
    // Video tools
    "video": ["video editor free", "video compressor", "video converter", "screen recorder", "video trimmer", "youtube downloader"],
    "video to": ["video to gif", "video to mp3", "video compressor", "video trimmer", "video merger", "video format converter"],
    "gif": ["gif maker", "video to gif", "gif compressor", "gif editor", "animated gif creator", "gif to video"],
    
    // Audio tools
    "audio": ["audio converter", "mp3 cutter", "audio editor", "voice recorder", "text to speech", "audio compressor"],
    "mp3": ["mp3 cutter", "mp3 converter", "audio merger", "youtube to mp3", "audio compressor", "music player free"],
    
    // Code & Dev tools
    "code": ["code editor online", "json formatter", "regex tester", "code beautifier", "minifier", "syntax highlighter"],
    "json": ["json formatter", "json validator", "json to csv", "csv to json", "json editor", "api tester"],
    "html": ["html editor", "html to pdf", "html formatter", "css beautifier", "html validator", "wysiwyg editor"],
    "css": ["css generator", "css minifier", "css beautifier", "gradient generator", "flexbox generator", "css validator"],
    
    // Design tools
    "design": ["logo maker", "poster maker", "banner creator", "mockup generator", "color palette", "font pairing"],
    "logo": ["logo maker", "icon generator", "favicon creator", "brand kit", "svg editor", "vector graphics"],
    "color": ["color palette generator", "color picker", "gradient maker", "color contrast checker", "hex to rgb", "color scheme"],
    "font": ["font identifier", "font pairing tool", "google fonts", "font generator", "typography tool", "web font loader"],
    
    // AI tools
    "ai": ["ai image generator", "ai writer", "chatbot", "ai code assistant", "ai art generator", "ai voice generator"],
    "ai image": ["ai art generator", "ai background remover", "ai upscaler", "ai photo enhancer", "text to image", "ai avatar maker"],
    "chatbot": ["ai assistant", "gpt alternatives", "ai writer", "ai chat free", "conversational ai", "llm playground"],
    
    // Productivity
    "converter": ["file converter", "unit converter", "currency converter", "time zone converter", "document converter", "format converter"],
    "calculator": ["scientific calculator", "percentage calculator", "age calculator", "bmi calculator", "loan calculator", "date calculator"],
    "qr": ["qr code generator", "qr code scanner", "barcode generator", "qr code customizer", "bulk qr generator", "dynamic qr code"],
    
    // Writing tools
    "grammar": ["grammar checker", "spell checker", "paraphrasing tool", "plagiarism checker", "writing assistant", "readability checker"],
    "translate": ["translator", "language detector", "document translator", "voice translator", "multilingual tool", "localization"],
    "text": ["text editor", "text compare", "word counter", "character counter", "text to speech", "speech to text"],
  };

  // Find matching tool category
  for (const [keyword, suggestions] of Object.entries(toolMappings)) {
    if (queryLower.includes(keyword)) {
      return suggestions;
    }
  }

  // Generic tool suggestions based on common patterns
  const genericSuggestions = [
    `${query} alternative`,
    `best ${query}`,
    `${query} online`,
    `open source ${query}`,
    `${query} no signup`,
    `${query} no watermark`,
    `${query} bulk`,
    `${query} api`,
  ];

  return genericSuggestions;
}

export function RelatedSearches({ query, onSearch }: RelatedSearchesProps) {
  const suggestions = generateSmartToolSuggestions(query).slice(0, 8);

  if (!query) return null;

  return (
    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 sm:mb-4">You might like</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSearch(suggestion, true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-muted/50 hover:bg-muted rounded-md text-left transition-colors group"
          >
            <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
            <span className="text-sm text-foreground truncate">{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
