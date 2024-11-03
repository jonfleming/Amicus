
export class Animator {
    constructor() {
        this.queue = null;
    }
    
    start() {
        this.queue = [];
        // start interval for animation
        this.animationInterval = setInterval(() => {
            this.update();
        }, 250); // 4 FPS

        console.log("Animation started with queue:", this.queue);
    }

    update() {
        if (this.queue.length > 0) {
            const viseme = this.queue.shift();
            console.log("Animating viseme:", viseme);
        } else {
            clearInterval(this.animationInterval);
            console.log("Animation finished");
        }
    }

    addViseme(viseme) {
        if (!this.queue) {
            this.start();
        }
        this.queue.push(viseme);
        console.log("Viseme added to queue:", viseme);
    }
}