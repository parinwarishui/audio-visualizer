// Getting elements from the HTML file
const audioInput = document.getElementById('audioFile');
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
const colorPalette = document.getElementById('colorPalette');
const songTitle = document.getElementById('songTitle');
const videoChoice = document.getElementById('videoChoice');
let currentVideo = document.getElementById('video1');

// Set canvas dimensions
canvas.width = 800;
canvas.height = 300;


let audioContext;
let audioElement;
let sourceNode;

let analyser;
let frequencyArray;
let bufferLength;

// Event listeners
audioInput.addEventListener('change', handleFiles);
playButton.addEventListener('click', () => {
    console.log('Play button clicked');
    if (audioElement) {
        audioElement.play();
    }
});
pauseButton.addEventListener('click', () => {
    console.log('Pause button clicked');
    if (audioElement) {
        audioElement.pause();
    }
});

videoChoice.addEventListener('change', (event) => {
    const selectedVideoId = event.target.value;
    const newVideo = document.getElementById(selectedVideoId);
    if (newVideo !== currentVideo) {
        currentVideo.pause();
        currentVideo.style.display = 'none';
        currentVideo.currentTime = 0;
        currentVideo = newVideo;
        currentVideo.style.display = 'block';
        currentVideo.play();
    }
});

// preset of colors to choose
const palettes = {
    rainbow: [
        '#ff8080',
        '#ffbf80',
        '#ffff80',
        '#bfff80',
        '#80ffbf',
        '#80bfff',
        '#bf80ff',
        '#ff80ff'
    ],
    bluepastel: [
        '#add8e6',
        '#87cefa',
        '#87ceeb',
        '#add8e6',
        '#87cefa',
        '#87ceeb',
        '#add8e6',
        '#87cefa',
        '#add8e6',
        '#87cefa',
        '#87ceeb',
        '#add8e6',
        '#87cefa',
        '#87ceeb',
        '#add8e6',
        '#87cefa'
    ],
    neon: [
        '#ff0000',
        '#ffa500',
        '#ffff00',
        '#00ff00',
        '#00ffff',
        '#0000ff',
        '#ff00ff',
        '#ff1493'
    ],
    trafficlights: [
        '#ff0000',
        '#ffff00',
        '#00ff00'
    ],
    zebracrossing: [
        '#ffffff',
        '#000000',
        '#ffffff',
        '#000000',
        '#ffffff',
        '#000000',
        '#ffffff',
        '#000000',
        '#ffffff',
        '#000000',
        '#ffffff',
        '#000000',
        '#ffffff'
    ],
    grayscale: [
        '#4c4c4c',
        '#959595',
        '#dadada',
        '#8f8f8f',
        '#808080',
        '#1c1c1c',
        '#919191',
        '#696969'
    ],
    night: [
        '#4b73a8',
        '#536ba1',
        '#5c6298',
        '#635a91',
        '#6c5289'
    ],
    sunrise: [
        '#ffb940',
        '#ffad33',
        '#ff931f',
        '#ffad33',
        '#ffb940'
    ],
    white: [
        '#ffffff'
    ]
};

// make a url of the input music file
function handleFiles(event) {
    const file = event.target.files[0];
    if (file) {
        const fileURL = URL.createObjectURL(file);
        initializeAudio(fileURL, file.name);
    }
}

// initialize the audio file received
function initializeAudio(fileURL, fileName) {
    if (audioContext) audioContext.close();

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioElement = new Audio(fileURL);
    audioElement.crossOrigin = "anonymous";

    sourceNode = audioContext.createMediaElementSource(audioElement);
    analyser = audioContext.createAnalyser();

    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    frequencyArray = new Uint8Array(bufferLength);

    songTitle.textContent = `NOW PLAYING: ${fileName.slice(0, -4)}`;
    createVisualizer();
}

function createVisualizer() {
    requestAnimationFrame(createVisualizer);

    // get each frequencies in the song playing
    analyser.getByteFrequencyData(frequencyArray);

    // clear the canvas out before drawing new one
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = 7;
    const spacing = 2.5;
    let x = 0;

    const numberOfBars = 84; // Limit number of bars for lower frequencies
    const selectedPalette = palettes[colorPalette.value];
    const colorCount = Math.min(numberOfBars, selectedPalette.length);

    // Draw the bars
    for (let i = 0; i < numberOfBars; i++) {
        // Custom weighting for balancing frequencies
        const weighting = 1 + (i / numberOfBars) * 0.4;
        const barHeight = frequencyArray[i] * weighting;

        // Calculate color index based on bar position
        const colorIndex = Math.floor((i / numberOfBars) * colorCount);
        ctx.fillStyle = selectedPalette[colorIndex];
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + spacing;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // autoplay the default video choice
    currentVideo.style.display = 'block';
    currentVideo.play();

    // changing the video
    videoChoice.addEventListener('change', () => {
        const selectedVideoId = videoChoice.value;
        const newVideo = document.getElementById(selectedVideoId);

        // pause and set the time back to 0
        currentVideo.pause();
        currentVideo.style.display = 'none';
        currentVideo.currentTime = 0;

        // change currentVideo to selected new one
        currentVideo = newVideo;
        currentVideo.style.display = 'block';
        currentVideo.play();
    });
});
