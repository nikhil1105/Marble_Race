export const getIsLaptop = () => {
    if ((window.matchMedia("(orientation: portrait)").matches && window.innerWidth > 1050) || (!window.matchMedia("(orientation: portrait)").matches && window.innerWidth > 1400)) {
        return true;
    } else {
        return false;
    }
}

export const getDeviceType = () => {
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    const width = window.innerWidth;
    const height = window.innerHeight;

    if ((!isPortrait && width > 1400) || (isPortrait && width > 1050)) {
        return "laptop";
    } else if ((width <= 1050 && width > 750 && isPortrait) || (width > 1023 && !isPortrait)) {
        return "tablet";
    } else //(width <= 768) 
    {

        return "phone";
    }
    // else {
    //     return "unknown";
    // }
};


export const triggerKeyPress = (keys) => {
    keys.forEach(key => {
        const event = new KeyboardEvent('keydown', {
            key: key,
            code: key,
            keyCode: key.charCodeAt(0),
            bubbles: true,
        });
        document.dispatchEvent(event);
    });
};

export const triggerKeyRelease = (keys) => {
    keys.forEach(key => {
        const event = new KeyboardEvent('keyup', {
            key: key,
            code: key,
            keyCode: key.charCodeAt(0),
            bubbles: true,
        });
        document.dispatchEvent(event);
    });
};

export const arraysEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
};

export function makeFullScreen() {
    const element = document.documentElement; // This targets the entire page
    if (element.requestFullscreen) {
        element.requestFullscreen(); // Standard Fullscreen API
    } else if (element.webkitRequestFullscreen) { // For Safari
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { // For Internet Explorer/Edge
        element.msRequestFullscreen();
    } else {
        console.info("Fullscreen mode is not supported in this browser.");
    }
}

export function exitFullScreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen(); // Standard Fullscreen API
    } else if (document.webkitExitFullscreen) { // For Safari
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // For Internet Explorer/Edge
        document.msExitFullscreen();
    }
}

export function toggleFullScreen() {
    if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
    ) {
        exitFullScreen(); // Exit fullscreen if already in fullscreen mode
    } else {
        makeFullScreen(); // Enter fullscreen if not already in fullscreen mode
    }
}


export function toggleMusic() {
    const music = document.getElementById('backgroundMusic');    
    if (music.paused) {
        music.play();
    } else {
        music.pause();
    }
}