import {PCMVisemeAnalyzer} from './pcmVisemeAnalyzer.js';
let processed = 0;

export class AnimatedFace {
    constructor(handleMorphTargetChange) {
        this.visemeAnalyzer = new PCMVisemeAnalyzer(44100); // Match your audio sample rate
        this.currentVisemeWeights = {};
        this.targetVisemeWeights = {};
        this.lastUpdateTime = 0;
        this.handleMorphTargetChange = handleMorphTargetChange;
        this.lastVisemeWeights = {};
    }

    // Process new audio chunk
    processAudioChunk(pcmChunk) {
        const visemeFrames = this.visemeAnalyzer.processPCMChunk(pcmChunk);
        this.scheduleVisemeFrames(visemeFrames);
        processed++;
        console.log(`Processed ${processed} audio chunks`);
    }

    // Schedule viseme animations
    scheduleVisemeFrames(visemeFrames) {
        visemeFrames.forEach(frame => {
            setTimeout(() => {
                this.targetVisemeWeights = frame.visemeWeights;
            }, frame.timeOffset * 1000 * 10); // Jon: trying to slow it down
        });
    }

    // Update morph targets in your render loop
    update(deltaTime) {
        const lerpFactor = Math.min(1.0, deltaTime * 15); // Adjust for smoothnessdrawbar
        let hasChanged = false;
        // Interpolate between current and target weights
        for (const viseme in this.targetVisemeWeights) {
            if (!this.currentVisemeWeights[viseme]) {
                this.currentVisemeWeights[viseme] = 0;
            }
            
            if (this.targetVisemeWeights[viseme] !=this.currentVisemeWeights[viseme]) {
                hasChanged = true;
            }
            this.currentVisemeWeights[viseme] = this.lerp(
                this.currentVisemeWeights[viseme],
                this.targetVisemeWeights[viseme],
                lerpFactor
            );
            
            // Apply to morph target
            if (hasChanged && this.currentVisemeWeights[viseme] != this.lastVisemeWeights[viseme]) {
                this.handleMorphTargetChange(viseme, this.currentVisemeWeights[viseme]);
                this.lastVisemeWeights[viseme] = this.currentVisemeWeights[viseme];
            }
        }
    }

    lerp(start, end, t) {
        return start + (end - start) * t;
    }
}