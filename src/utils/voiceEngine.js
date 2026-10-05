/**
 * Voice Engine Utility Module
 * Handles text sanitization, markdown stripping, emoji replacement,
 * code/table/URL cleanup, and pronunciation corrections for TTS.
 */

// 1. Emoji Map for Speakable Equivalents
const emojiSpeakMap = {
  '👍': ' Great. ',
  '❌': ' No. ',
  '✅': ' Yes. ',
  '🎉': ' Congratulations! ',
  '😂': ' Haha, ',
  '😊': '', // Pleasant tone (handled by styling, silent in text)
  '❤️': '', // Warm tone
  '🔥': ''  // Excited tone
};

// 2. Technical Pronunciation Dictionary
const technicalPronunciations = {
  'JWT': 'J-W-T',
  'SQL': 'Sequel',
  'REST': 'Rest',
  'API': 'A-P-I',
  'DSA': 'D-S-A',
  'HTML': 'H-T-M-L',
  'CSS': 'C-S-S',
  'OOP': 'O-O-P',
  'React': 'React',
  'Vite': 'Veet',
  'Node.js': 'Node J-S',
  'Express.js': 'Express J-S',
  'Spring Boot': 'Spring Boot',
  'GitHub': 'Git-Hub'
};

/**
 * Parses four-digit years or general numbers into speakable forms (e.g. 2026 -> "twenty twenty-six")
 */
function cleanNumbers(text) {
  return text.replace(/\b(19|20)\d{2}\b/g, (match) => {
    const century = match.substring(0, 2);
    const decade = match.substring(2, 4);
    
    const centText = century === '20' ? 'twenty' : 'nineteen';
    
    let decText = '';
    const decadeVal = parseInt(decade, 10);
    if (decadeVal === 0) {
      decText = 'hundred';
    } else if (decadeVal < 10) {
      decText = 'oh ' + getSingleDigitWord(decadeVal);
    } else {
      decText = getTwoDigitWord(decadeVal);
    }
    return `${centText} ${decText}`;
  });
}

function getSingleDigitWord(num) {
  const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  return words[num] || '';
}

function getTwoDigitWord(num) {
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

  if (num < 10) return getSingleDigitWord(num);
  if (num >= 10 && num < 20) return teens[num - 10];
  
  const tenDigit = Math.floor(num / 10);
  const oneDigit = num % 10;
  return tenDigit > 0 ? (tens[tenDigit] + (oneDigit > 0 ? '-' + ones[oneDigit] : '')) : '';
}

/**
 * Strips out Markdown characters
 */
function cleanMarkdown(text) {
  let cleaned = text;
  
  // Headers (e.g., #, ##, ###)
  cleaned = cleaned.replace(/^#+\s+/gm, '');
  
  // Bold and Italics (e.g., **, *, __, _)
  cleaned = cleaned.replace(/\*\*+/g, '');
  cleaned = cleaned.replace(/\b_+\b/g, '');
  
  // Code line blocks (e.g., `code`)
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
  return cleaned;
}

/**
 * Detects code blocks and replaces them with a speakable sentence
 */
function cleanCodeBlocks(text) {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  return text.replace(codeBlockRegex, (match, lang) => {
    const speakableLang = lang ? lang.toUpperCase() : 'code';
    return ` [I've included a ${speakableLang} code example on the screen. Let me explain what it does.] `;
  });
}

/**
 * Detects tables and replaces them with a speakable summary
 */
function cleanTables(text) {
  const tableRegex = /(\|[^\n]+\|\r?\n){2,}/g;
  return text.replace(tableRegex, () => {
    return " [I've shown a table on your screen comparing these options.] ";
  });
}

/**
 * Cleans up URLs into friendly spoken references
 */
function cleanUrls(text) {
  const urlRegex = /https?:\/\/[^\s]+/g;
  return text.replace(urlRegex, (match) => {
    if (match.includes('spring.io')) return 'the official Spring Boot documentation site';
    if (match.includes('github.com')) return 'the GitHub repository';
    if (match.includes('reactjs.org') || match.includes('react.dev')) return 'the official React website';
    return 'the website link shown on the screen';
  });
}

/**
 * Sanitizes and handles emojis in text
 */
function handleEmojis(text) {
  let cleaned = text;
  
  Object.entries(emojiSpeakMap).forEach(([emoji, spoken]) => {
    cleaned = cleaned.replaceAll(emoji, spoken);
  });
  
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]/gu, '');
  
  return cleaned;
}

/**
 * Cleans technical acronyms using technicalPronunciations dictionary
 */
function cleanAcronyms(text) {
  let cleaned = text;
  Object.entries(technicalPronunciations).forEach(([term, pronunciation]) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    cleaned = cleaned.replace(regex, pronunciation);
  });
  return cleaned;
}

/**
 * Replaces bullet points with list transition markers
 */
function cleanBullets(text) {
  let cleaned = text;
  
  const bulletGroupRegex = /(?:^\s*[-*•]\s+.+(?:\r?\n|$)){2,}/gm;
  cleaned = cleaned.replace(bulletGroupRegex, (listBlock) => {
    const lines = listBlock.split('\n')
      .map(line => line.replace(/^\s*[-*•]\s+/, '').trim())
      .filter(Boolean);
    
    if (lines.length === 0) return '';
    
    let spokenList = `There are ${lines.length} important points. `;
    lines.forEach((line, idx) => {
      let prefix = '';
      if (idx === 0) prefix = 'First, ';
      else if (idx === lines.length - 1) prefix = 'Finally, ';
      else if (idx === 1) prefix = 'Second, ';
      else if (idx === 2) prefix = 'Third, ';
      else prefix = 'Next, ';
      
      spokenList += `${prefix}${line} `;
    });
    
    return spokenList;
  });
  
  return cleaned;
}

/**
 * Limits reading to ~300 words and appends a "Continue?" prompt if exceeded
 */
function limitWordLength(text) {
  const words = text.split(/\s+/);
  if (words.length > 300) {
    const limited = words.slice(0, 300).join(' ');
    return `${limited}... [Would you like me to continue?]`;
  }
  return text;
}

/**
 * Injects pauses after sentences, colons, or semicolons
 */
function addPauses(text) {
  let cleaned = text;
  cleaned = cleaned.replace(/([.?!।])\s+/g, '$1... ');
  return cleaned;
}

/**
 * Main Voice Pipeline
 * Prepares raw LLM text response for natural TTS playback
 */
export function prepareVoiceText(text) {
  if (!text) return '';
  
  let step = text;
  
  step = cleanCodeBlocks(step);
  step = cleanTables(step);
  step = cleanUrls(step);
  step = cleanBullets(step);
  step = cleanMarkdown(step);
  step = handleEmojis(step);
  step = cleanAcronyms(step);
  step = cleanNumbers(step);
  step = limitWordLength(step);
  step = addPauses(step);
  
  return step.trim();
}
