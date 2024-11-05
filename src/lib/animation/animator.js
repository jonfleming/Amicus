export class Animator {
    constructor(handleMorphTargetChange, clearMorphTargets) {
        this.queue = null;
        this.handleMorphTargetChange = handleMorphTargetChange;
        this.clearMorphTargets = clearMorphTargets;
    }
    
    start() {
        this.queue = [];
        // start interval for animation
        this.animationInterval = setInterval(() => {
            this.update();
        }, 200); // 5 FPS

        console.log("Animation started with queue:", this.queue);
    }

    update() {
        if (this.queue.length > 0) {
            const visemeData = this.queue.shift();
            if (this.handleMorphTargetChange) {
                // viseme is an object with:
                // timeing[] - array of time values  {start: 0, duration: 0.1}
                // visemes[] - array of viseme values ['viseme_aa', 'viseme_E']
                visemeData.visemes.forEach((viseme, index) => {
                    console.log(`Animating viseme: ${viseme} for ${visemeData.timing[index].duration}ms`);
                    console.log(visemeData.timing)
                    this.handleMorphTargetChange(viseme, 0.5); // Animate to full value                

                    setTimeout(() => {
                        this.handleMorphTargetChange(viseme, 0)
                    }, visemeData.timing[index].duration*1000);
                }); 
            }
        } else {
            clearInterval(this.animationInterval);
            this.clearMorphTargets();
            console.log("Animation finished");
            this.animationInterval = null;
            this.queue = null;
        }
    }

    addViseme(viseme) {
        if (!this.queue || !this.animationInterval) {
            this.start();
        }
        this.queue.push(viseme);
        console.log("Viseme added to queue:", viseme);
    }
}
