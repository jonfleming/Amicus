// Map of phonemes to visemes
// Using a simplified set of visemes based on common mouth positions
const phonemeToVisemeMap = {
    // Vowels
    'AA': 'ah',  // hot
    'AE': 'ah',  // cat
    'AH': 'ah',  // but
    'AO': 'oh',  // caught
    'AW': 'oh',  // cow
    'AY': 'ah',  // hide
    'EH': 'eh',  // red
    'ER': 'er',  // bird
    'EY': 'eh',  // say
    'IH': 'ih',  // sit
    'IY': 'ih',  // see
    'OW': 'oh',  // show
    'OY': 'oh',  // toy
    'UH': 'oh',  // could
    'UW': 'oh',  // too
  
    // Consonants
    'B': 'p',    // be
    'CH': 'ch',  // cheese
    'D': 't',    // dee
    'DH': 'th',  // thee
    'F': 'f',    // fee
    'G': 'k',    // green
    'HH': 'ah',  // he
    'JH': 'ch',  // joy
    'K': 'k',    // key
    'L': 'l',    // lee
    'M': 'p',    // me
    'N': 't',    // knee
    'NG': 'k',   // ping
    'P': 'p',    // pee
    'R': 'er',   // read
    'S': 's',    // sea
    'SH': 'ch',  // she
    'T': 't',    // tea
    'TH': 'th',  // thin
    'V': 'f',    // vee
    'W': 'oh',   // we
    'Y': 'ih',   // yield
    'Z': 's',    // zee
    'ZH': 'ch'   // vision
  };
  
  // CMU Dictionary-style pronunciation rules
  const pronunciationRules = {
    'hello': ['HH', 'EH', 'L', 'OW'],
    'world': ['W', 'ER', 'L', 'D'],
    'how': ['HH', 'AW'],
    'are': ['AA', 'R'],
    'you': ['Y', 'UW'],
    // Add more words as needed
  };
  
  export function textToPhonemes(text) {
    // Convert text to lowercase and split into words
    const words = text.toLowerCase().split(/\s+/);
    const phonemes = [];
  
    words.forEach(word => {
      if (pronunciationRules[word]) {
        phonemes.push(...pronunciationRules[word]);
      } else {
        // Basic fallback for unknown words - convert letters to approximate phonemes
        word.split('').forEach(letter => {
          switch(letter) {
            case 'a': phonemes.push('AH'); break;
            case 'e': phonemes.push('EH'); break;
            case 'i': phonemes.push('IH'); break;
            case 'o': phonemes.push('OW'); break;
            case 'u': phonemes.push('UH'); break;
            default: 
              // Try to map consonants directly if possible
              const upperLetter = letter.toUpperCase();
              if (phonemeToVisemeMap[upperLetter]) {
                phonemes.push(upperLetter);
              }
          }
        });
      }
    });
  
    return phonemes;
  }
  
  function phonemesToVisemes(phonemes) {
    return phonemes.map(phoneme => phonemeToVisemeMap[phoneme] || 'rest');
  }
  
  export function textToVisemes(text) {
    const phonemes = textToPhonemes(text);
    const visemes = phonemesToVisemes(phonemes);
    
    return {
      text,
      phonemes,
      visemes,
      timing: generateTiming(visemes.length)
    };
  }
  
  function generateTiming(visemeCount) {
    const averagePhonemeDuration = 0.1; // 100ms per phoneme on average
    return Array.from({ length: visemeCount }, (_, i) => ({
      start: i * averagePhonemeDuration,
      duration: averagePhonemeDuration
    }));
  }
  
//   // Example usage:
//   const sentence = "Hello world";
//   const result = textToVisemes(sentence);
//   console.log(result);