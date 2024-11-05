// Map of phonemes to visemes
// Using a simplified set of visemes based on common mouth positions
const phonemeToVisemeMap = {
    // Vowels
    'AA': 'viseme_aa',  // hot
    'AE': 'viseme_aa',  // cat
    'AH': 'viseme_aa',  // but
    'AO': 'viseme_aa',  // caught
    'AW': 'viseme_aa',  // cow
    'AY': 'viseme_aa',  // hide
    'EH': 'viseme_E',  // red
    'ER': 'viseme_aa',  // bird
    'EY': 'viseme_aa',  // say
    'IH': 'viseme_aa',  // sit
    'IY': 'viseme_aa',  // see
    'OW': 'viseme_aa',  // show
    'OY': 'viseme_aa',  // toy
    'UH': 'viseme_aa',  // could
    'UW': 'viseme_aa',  // too
  
    // Consonants
    'B':  'viseme_PP',    // be
    'CH': 'viseme_CH',  // cheese
    'D':  'viseme_DD',    // dee
    'DH': 'viseme_TH',  // thee
    'F':  'viseme_FF',    // fee
    'G':  'viseme_kk',    // green
    'HH': 'viseme_aa',  // he
    'JH': 'viseme_CH',  // joy
    'K':  'viseme_kk',    // key
    'L':  'viseme_nn',    // lee
    'M':  'viseme_pp',    // me
    'N':  'viseme_nn',    // knee
    'NG': 'viseme_KK',   // ping
    'P':  'viseme_PP',    // pee
    'R':  'viseme_aa',   // read
    'S':  'viseme_SS',    // sea
    'SH': 'viseme_CH',  // she
    'T':  'viseme_I',    // tea
    'TH': 'viseme_TH',  // thin
    'V':  'viseme_FF',    // vee
    'W':  'viseme_aa',   // we
    'Y':  'viseme_aa',   // yield
    'Z':  'viseme_SS',    // zee
    'ZH': 'viseme_CH'   // vision
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