// getting the items from html file
const audioinput = document.getElementById('audioFile');
const playbutton = document.getElementById('playButton');
const pausebutton = document.getElementById('pauseButton');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

// set canvas dimensions to the computer window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let audioContext;
let audioElement;
let sourceNode;

let analyser;
let frequencyarray; 
let bufferlength;

// set the file uploading + play/pause
audioinput.addEventListener('change', HandleFiles);
playbutton.addEventListener('click', () => audioElement && audioElement.play());
pausebutton.addEventListener('click', () => audioElement && audioElement.pause());


// make a url of the input music file
function HandleFiles(event) {
    const file = event.target.files[0];
    if (file) {
        const fileURL = URL.createObjectURL(file);
        InitializeAudio(fileURL)
    }
}

// initialize the audio file received,
function InitializeAudio(fileURL) {
    if (audioContext) audioContext.close();

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioElement = new Audio(fileURL);
    audioElement.crossOrigin = "anonymous";

    sourceNode = audioContext.createMediaElementSource(audioElement);
    analyser = audioContext.createAnalyser();

    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 256;
    bufferlength = analyser.frequencyBinCount;
    frequencyarray = new Uint8Array(bufferlength);

    CreateTheVisualizer();
}

function CreateTheVisualizer() {
    requestAnimationFrame(CreateTheVisualizer);

    // get each frequencies in the song playing
    analyser.getByteFrequencyData(frequencyarray);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // create the bars!!!
    const barWidth = (canvas.width / bufferlength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferlength; i++) {
        barHeight = frequencyarray[i];

        // fill the "blocks" in white
        ctx.fillStyle = `rgb(255,255,255)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
    }
}
