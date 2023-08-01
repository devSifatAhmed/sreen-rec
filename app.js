const startButton = document.getElementById('startRecording');
const stopButton = document.getElementById('stopRecording');
const downloadButton = document.getElementById('downloadVideo');

let mediaRecorder;
let recordedBlobs;
let recordedVideoData;

const constraints = {
    audio: true,
    video: {
        width: { ideal: 1280 },
        height: { ideal: 720 }
    }
};

startButton.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Merge audio and video streams
        const audioTrack = audioStream.getAudioTracks()[0];
        stream.addTrack(audioTrack);

        recordedBlobs = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.onstop = handleStop;

        mediaRecorder.start();

        startButton.disabled = true;
        stopButton.disabled = false;
        downloadButton.style.display = 'none';
    } catch (err) {
        console.error('Error accessing media devices:', err);
    }
});

stopButton.addEventListener('click', () => {
    mediaRecorder.stop();
    startButton.disabled = false;
    stopButton.disabled = true;
});

downloadButton.addEventListener('click', () => {
    const blob = new Blob(recordedBlobs, { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'recordedVideo.mp4';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
});

function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
    }
}

async function handleStop(event) {
    const blob = new Blob(recordedBlobs, { type: 'video/mp4' });
    recordedVideoData = URL.createObjectURL(blob);
    document.getElementById('recordedVideo').src = recordedVideoData;
    downloadButton.style.display = 'inline-block';
}