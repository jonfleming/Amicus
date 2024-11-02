export function getPCM16Duration(buffer, sampleRate = 44100, numChannels = 1) {
    // For 16-bit PCM, each sample is 2 bytes
    const bytesPerSample = 2;
    
    // Calculate total number of samples
    const numSamples = buffer.length / (bytesPerSample * numChannels);
    
    // Calculate duration in seconds
    const duration = numSamples / sampleRate;
    
    return {
        duration,          // in seconds
        numSamples,       // total number of samples
        bufferLength: buffer.length,  // total bytes
        bytesPerFrame: bytesPerSample * numChannels  // bytes per frame (all channels)
    };
}

// Example usage:
// const buffer = Buffer.from(/* your 16-bit PCM data */);
// const audioInfo = getPCM16Duration(buffer, 44100, 2);  // stereo audio at 44.1kHz
// console.log(`Duration: ${audioInfo.duration} seconds`);