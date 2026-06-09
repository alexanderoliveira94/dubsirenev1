const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let mainOsc;
let modOsc;

let modGain;
let outputGain;

let delayNode;
let feedbackGain;

let dryGain;
let wetGain;

let delayFilter;

let playing = false;
let scaleEnabled = false;
let gateGain;
let delayInputFilter;

const notes = [
    65.4, 73.4, 82.4, 87.3, 98.0,
    110.0, 123.4, 130.8, 146.8,
    164.8, 174.6, 196.0, 220.0,
    246.9, 261.6, 293.7, 329.6,
    349.2, 392.0, 440.0, 493.9,
    523.2, 587.3, 659.2, 698.4,
    784.0, 880.0
];

function quantize(freq) {
    let best = notes[0];
    let err = Math.abs(freq - best);

    for (const note of notes) {
        const e = Math.abs(freq - note);

        if (e < err) {
            err = e;
            best = note;
        }
    }

    return best;
}

function buildSynth() {

    mainOsc = audioCtx.createOscillator();
    modOsc = audioCtx.createOscillator();

    modGain = audioCtx.createGain();

    outputGain = audioCtx.createGain();

    dryGain = audioCtx.createGain();
    wetGain = audioCtx.createGain();

    gateGain = audioCtx.createGain();

    delayNode = audioCtx.createDelay(2.0);

    feedbackGain = audioCtx.createGain();

    delayInputFilter =
        audioCtx.createBiquadFilter();

    delayInputFilter.type = "lowpass";
    delayInputFilter.frequency.value = 1500;
    delayInputFilter.Q.value = 0.7;

    delayFilter =
        audioCtx.createBiquadFilter();

    delayFilter.type = "lowpass";
    delayFilter.frequency.value = 800;
    delayFilter.Q.value = 0.7;

    // FM

    modOsc.connect(modGain);
    modGain.connect(mainOsc.frequency);

    // GATE

    gateGain.gain.value = 0;

    mainOsc.connect(gateGain);
    gateGain.connect(outputGain);

    // DRY

    outputGain.connect(dryGain);

    // DELAY INPUT FILTER

    outputGain.connect(delayInputFilter);

    delayInputFilter.connect(delayNode);

    // WET

    delayNode.connect(wetGain);

    // FEEDBACK LOOP

    delayNode.connect(delayFilter);

    delayFilter.connect(feedbackGain);

    feedbackGain.connect(delayNode);

    // OUTPUT

    dryGain.connect(audioCtx.destination);

    wetGain.connect(audioCtx.destination);

    dryGain.gain.value = 1.0;
    wetGain.gain.value = 0.45;

    updateParams();

    mainOsc.start();
    modOsc.start();
}

function updateParams() {
    if (!mainOsc) return;

    const now =
        audioCtx.currentTime;

    let freq =
        parseFloat(
            document.getElementById(
                "mainFreq"
            ).value
        );

    if (scaleEnabled) {
        freq = quantize(freq);
    }

    const modFreq =
        parseFloat(
            document.getElementById(
                "modFreq"
            ).value
        );

    const volume =
        parseFloat(
            document.getElementById(
                "volume"
            ).value
        );

    const delay =
        parseFloat(
            document.getElementById(
                "delay"
            ).value
        );

    let feedback =
        parseFloat(
            document.getElementById(
                "feedback"
            ).value
        );

    const fmDepth =
        parseFloat(
            document.getElementById(
                "fmDepth"
            ).value
        );

    // curva musical

    Math.pow(
        feedback,
        1.5
    );

    // frequência principal

    mainOsc.frequency.setTargetAtTime(
        freq,
        now,
        0.01
    );

    // frequência LFO

    modOsc.frequency.setTargetAtTime(
        modFreq,
        now,
        0.02
    );

    // profundidade FM

    const deviation =
        Math.min(
            freq * fmDepth,
            400
        );

    modGain.gain.setTargetAtTime(
        deviation,
        now,
        0.02
    );

    // volume

    outputGain.gain.setTargetAtTime(
        volume,
        now,
        0.02
    );

    // delay sem clicks

    delayNode.delayTime.setTargetAtTime(
        delay,
        now,
        0.05
    );

    // feedback suave

    feedbackGain.gain.setTargetAtTime(
        feedback,
        now,
        0.05
    );

    // formas de onda

    mainOsc.type =
        document.getElementById(
            "mainWave"
        ).value;

    modOsc.type =
        document.getElementById(
            "modWave"
        ).value;
}

function stopSynth() {
    if (!playing) return;

    try {
        mainOsc.stop();
        modOsc.stop();

        mainOsc.disconnect();
        modOsc.disconnect();

        modGain.disconnect();

        outputGain.disconnect();

        dryGain.disconnect();
        wetGain.disconnect();

        delayNode.disconnect();

        feedbackGain.disconnect();

        delayFilter.disconnect();
    }
    catch (error) {
        console.log(error);
    }
}

playing = false;

document
    .getElementById("trigger")
    .addEventListener(
        "mousedown",
        async () => {
            if (!playing) {
                await audioCtx.resume();

                buildSynth();

                playing = true;
            }

            gateGain.gain.setTargetAtTime(
                1,
                audioCtx.currentTime,
                0.005
            );

            wetGain.gain.setTargetAtTime(
                0.30,
                audioCtx.currentTime,
                0.03
            );
        });

document
    .getElementById("trigger")
    .addEventListener(
        "mouseup",
        () => {
            gateGain.gain.setTargetAtTime(
                0,
                audioCtx.currentTime,
                0.02
            );

            wetGain.gain.setTargetAtTime(
                0.65,
                audioCtx.currentTime,
                0.25
            );
        });

document
    .getElementById("trigger")
    .addEventListener(
        "mouseleave",
        () => {
            gateGain.gain.setTargetAtTime(
                0,
                audioCtx.currentTime,
                0.02
            );
        });

document
    .getElementById(
        "scale"
    )
    .addEventListener(
        "click",
        () => {
            scaleEnabled =
                !scaleEnabled;

            document
                .getElementById(
                    "scale"
                )
                .innerText =
                scaleEnabled
                    ? "SCALE ON"
                    : "SCALE OFF";

            updateParams();
        });

document
    .querySelectorAll(
        "input, select"
    )
    .forEach(control => {
        control.addEventListener(
            "input",
            updateParams
        );
    });

let spacePressed = false;

document.addEventListener("keydown", async (e) => {

    if (e.code !== "Space")
        return;

    e.preventDefault();

    if (spacePressed)
        return;

    spacePressed = true;

    if (!playing) {

        await audioCtx.resume();

        buildSynth();

        playing = true;
    }

    if (gateGain) {

        gateGain.gain.setTargetAtTime(
            1,
            audioCtx.currentTime,
            0.005
        );
    }

    // Diminui delay enquanto toca

    if (wetGain) {

        wetGain.gain.setTargetAtTime(
            0.30,
            audioCtx.currentTime,
            0.03
        );
    }
});

document.addEventListener("keyup", (e) => {

    if (e.code !== "Space")
        return;

    e.preventDefault();

    spacePressed = false;

    if (gateGain) {

        gateGain.gain.setTargetAtTime(
            0,
            audioCtx.currentTime,
            0.02
        );
    }

    // Solta o delay quando para

    if (wetGain) {

        wetGain.gain.setTargetAtTime(
            0.65,
            audioCtx.currentTime,
            0.25
        );
    }
});