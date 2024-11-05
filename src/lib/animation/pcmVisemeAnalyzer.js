export class PCMVisemeAnalyzer {
    constructor(sampleRate = 44100) {
        this.sampleRate = sampleRate;
        this.frameSize = Math.floor(sampleRate * 0.03); // 30ms frames
        this.buffer = new Float32Array(this.frameSize);
        this.bufferIndex = 0;
        
        // Frequencies for different phoneme categories
        this.visemeFrequencyMap = {
            'PP BB MM': { range: [100, 500], viseme: 'viseme_PP' },    // Bilabial sounds
            'FF VV':    { range: [1000, 2000], viseme: 'viseme_FF' },  // Labiodental sounds
            'TH':       { range: [1500, 2500], viseme: 'viseme_TH' }, // Dental sounds
            'DD':       { range: [1800, 2500], viseme: 'viseme_DD' },  // Alveolar stops
            'LL':       { range: [1500, 2500], viseme: 'viseme_nn' },  // Lateral sounds
            'EE':       { range: [2000, 2500], viseme: 'viseme_E' },  // High front vowels
            'AA':       { range: [800, 1200], viseme: 'viseme_aa' },   // Open vowels
            'OO':       { range: [300, 800], viseme: 'viseme_aa' }     // Rounded vowels
        };
    }

    // Process incoming 16-bit PCM chunks
    processPCMChunk(pcmChunk) {
        // Convert 16-bit PCM to float32
        const float32Data = new Float32Array(pcmChunk.length);
        for (let i = 0; i < pcmChunk.length; i++) {
            float32Data[i] = pcmChunk[i] / 32768.0;
        }

        // Process the data in frame-sized chunks
        const visemeFrames = [];
        let frameStart = 0;

        while (frameStart < float32Data.length) {
            const frameEnd = Math.min(frameStart + this.frameSize, float32Data.length);
            const frame = float32Data.slice(frameStart, frameEnd);
            
            if (frame.length === this.frameSize) {
                const visemeWeights = this.analyzeFrame(frame);
                visemeFrames.push({
                    timeOffset: frameStart / this.sampleRate,
                    visemeWeights
                });
            }
            
            frameStart += this.frameSize;
        }

        return visemeFrames;
    }

    // Analyze a single frame of audio
    analyzeFrame(frame) {
        // Perform FFT
        const fft = this.computeFFT(frame);
        
        // Calculate frequency magnitudes
        const frequencies = this.getFrequencyMagnitudes(fft);
        
        // Map frequencies to viseme weights
        return this.calculateVisemeWeights(frequencies);
    }

    // Compute FFT using simple DFT for demonstration
    // In production, use Web Audio API or a fast FFT library
    computeFFT(frame) {
        const N = frame.length;
        const fft = new Array(Math.floor(N/2));
    
        for (let freq = 0; freq < N/2; freq++) {
            let re = 0;
            let im = 0;
            
            for (let t = 0; t < N; t++) {
                const angle = -2 * Math.PI * freq * t / N;
                re += frame[t] * Math.cos(angle);
                im += frame[t] * Math.sin(angle);
            }
            
            fft[freq] = Math.sqrt(re * re + im * im);
        }
        
        return fft;
    }

    // Convert FFT data to frequency magnitudes
    getFrequencyMagnitudes(fft) {
        const frequencies = new Map();
        const binSize = this.sampleRate / (2 * fft.length);
        
        for (let i = 0; i < fft.length; i++) {
            const frequency = i * binSize;
            frequencies.set(frequency, fft[i]);
        }
        
        return frequencies;
    }

    // Calculate viseme weights based on frequency content
    calculateVisemeWeights(frequencies) {
        const weights = {};
        const maxMagnitude = Math.max(...frequencies.values());
        
        // Initialize all visemes to 0
        for (const phonemeGroup of Object.values(this.visemeFrequencyMap)) {
            weights[phonemeGroup.viseme] = 0;
        }
        
        // Calculate weights for each viseme
        for (const [freq, magnitude] of frequencies.entries()) {
            for (const [phoneme, data] of Object.entries(this.visemeFrequencyMap)) {
                const [minFreq, maxFreq] = data.range;
                if (freq >= minFreq && freq <= maxFreq) {
                    weights[data.viseme] = Math.max(
                        weights[data.viseme],
                        magnitude / maxMagnitude
                    );
                }
            }
        }
        
        // Normalize weights
        const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
        if (totalWeight > 0) {
            for (const viseme in weights) {
                weights[viseme] /= totalWeight;
            }
        }
        
        return weights;
    }
}