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
canvas.width = 1300;
canvas.height = 400;

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
        'rgb(255, 128, 128)',
        'rgb(255, 191, 128)',
        'rgb(255, 255, 128)',
        'rgb(191, 255, 128)',
        'rgb(128, 255, 191)',
        'rgb(128, 191, 255)',
        'rgb(191, 128, 255)',
        'rgb(255, 128, 255)'
    ],
    bluepastel: [
        'rgb(173, 216, 230)',
        'rgb(135, 206, 250)',
        'rgb(135, 206, 235)',
        'rgb(173, 216, 230)',
        'rgb(135, 206, 250)',
        'rgb(135, 206, 235)',
        'rgb(173, 216, 230)',
        'rgb(135, 206, 250)',
        'rgb(173, 216, 230)',
        'rgb(135, 206, 250)',
        'rgb(135, 206, 235)',
        'rgb(173, 216, 230)',
        'rgb(135, 206, 250)',
        'rgb(135, 206, 235)',
        'rgb(173, 216, 230)',
        'rgb(135, 206, 250)'
    ],
    neon: [
        'rgb(255,0,0)',
        'rgb(255,165,0)',
        'rgb(255,255,0)',
        'rgb(0,255,0)',
        'rgb(0,255,255)',
        'rgb(0,0,255)',
        'rgb(255,0,255)',
        'rgb(255,20,147)'
    ],
    trafficlights: [
        'rgb(255,0,0)',
        'rgb(255,255,0)',
        'rgb(0,255,0)',
    ],
    zebracrossing: [
        'rgb(255,255,255)',
        'rgb(0,0,0)',
        'rgb(255,255,255)',
        'rgb(0,0,0)',
        'rgb(255,255,255)',
        'rgb(0,0,0)',
        'rgb(255,255,255)',
        'rgb(0,0,0)',
        'rgb(255,255,255)',
        'rgb(0,0,0)',
        'rgb(255,255,255)',
        'rgb(0,0,0)',
        'rgb(255,255,255)'
    ],
    grayscale: [
        'rgb(76, 76, 76)',
        'rgb(149, 149, 149)',
        'rgb(218, 218, 218)',
        'rgb(143, 143, 143)',
        'rgb(128, 128, 128)',
        'rgb(28, 28, 28)',
        'rgb(145, 145, 145)',
        'rgb(105, 105, 105)'
    ],
    night: [
        'rgb(75,115,168)',
        'rgb(83,107,161)',
        'rgb(92,98,152)',
        'rgb(99,90,145)',
        'rgb(108,82,137)',
    ],
    white: [
        'rgb(255, 255, 255)'
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

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = 10;
    const spacing = 3;
    let x = 0;

    const numberOfBars = 100; // Limit number of bars for lower frequencies
    const selectedPalette = palettes[colorPalette.value];
    const colorCount = Math.min(numberOfBars, selectedPalette.length);

    // Draw the bars
    for (let i = 0; i < numberOfBars; i++) {
        // Custom weighting for balancing frequencies
        const weighting = 1 + (i / numberOfBars);
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