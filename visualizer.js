// getting the items from html file
const audioinput = document.getElementById('audioFile');
const playbutton = document.getElementById('playButton');
const pausebutton = document.getElementById('pauseButton');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

// set canvas dimensions to the computer window
canvas.width = 1200;
canvas.height = 400;

let audioContext;
let audioElement;
let sourceNode;

let analyser;
let frequencyarray; 
let bufferLength;

// set the file uploading + play/pause
audioinput.addEventListener('change', HandleFiles);
playbutton.addEventListener('click', () => audioElement && audioElement.play());
pausebutton.addEventListener('click', () => audioElement && audioElement.pause());

// the shades of rainbow to use in bars
const rainbowColors = [
    'rgb(255, 128, 128)',
    'rgb(255, 191, 128)',
    'rgb(255, 255, 128)',
    'rgb(191, 255, 128)',
    'rgb(128, 255, 191)',
    'rgb(128, 191, 255)',
    'rgb(191, 128, 255)',
    'rgb(255, 128, 255)'
];
const numberofColors = rainbowColors.length;


// make a url of the input music file
function HandleFiles(event) {
    const file = event.target.files[0];
    if (file) {
        const fileURL = URL.createObjectURL(file);
        InitializeAudio(fileURL, file.name);
    }
}

// initialize the audio file received,
function InitializeAudio(fileURL, fileName) {
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
    frequencyarray = new Uint8Array(bufferLength);

    const barWidth = 15;
    const spacing = 5;
    canvas.width = 1200;
    canvas.height = 400;

    songTitle.textContent = ("NOW PLAYING: " + fileName.slice(0, -4));
    CreateTheVisualizer();
}

function CreateTheVisualizer() {
    requestAnimationFrame(CreateTheVisualizer);

    // get each frequencies in the song playing
    analyser.getByteFrequencyData(frequencyarray);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = 10;
    const spacing = 3;
    let x = 0;

    // Draw the bars up
    for (let i = 0; i < bufferLength; i++) {
        // use custom weighting to balance the frequencies
        const weighting = 1 + (i / bufferLength); // Custom weighting
        const barHeight = frequencyarray[i] * weighting;

        // calculate the colorIndex based on the position(number) of the bar
        const colorIndex = Math.floor((i / bufferLength) * numberofColors);
        ctx.fillStyle = rainbowColors[colorIndex];
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + spacing;
    }
}

