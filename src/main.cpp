#include <Arduino.h>
#include <driver/i2s.h>
#include <math.h>

#define I2S_BCK   26
#define I2S_WS    25
#define I2S_DOUT  22

#define POT_VOLUME    34
#define POT_MAINFREQ  35
#define POT_MODFREQ   32
#define POT_DELAY     33
#define POT_FEEDBACK  27

#define MAIN_A 13
#define MAIN_B 12

#define MOD_A 14
#define MOD_B 4

#define BTN_TRIGGER 18
#define BTN_SCALE   19

#define SAMPLE_RATE 44100

// Delay ~370ms
#define MAX_DELAY_SAMPLES 16384

int16_t delayBuffer[MAX_DELAY_SAMPLES];
uint16_t delayIndex = 0;

float mainPhase = 0.0f;
float modPhase  = 0.0f;

enum WaveType
{
    WAVE_SINE,
    WAVE_TRIANGLE,
    WAVE_SQUARE
};

float generateWave(float phase, WaveType wave)
{
    switch(wave)
    {
        case WAVE_SINE:
            return sinf(phase);

        case WAVE_TRIANGLE:
        {
            float x = phase / (2.0f * PI);

            if(x < 0.25f)
                return x * 4.0f;

            if(x < 0.75f)
                return 2.0f - (x * 4.0f);

            return (x * 4.0f) - 4.0f;
        }

        case WAVE_SQUARE:
            return (phase < PI) ? 1.0f : -1.0f;
    }

    return 0.0f;
}

WaveType readMainWave()
{
    bool a = digitalRead(MAIN_A);
    bool b = digitalRead(MAIN_B);

    if(a) return WAVE_SINE;
    if(b) return WAVE_SQUARE;

    return WAVE_TRIANGLE;
}

WaveType readModWave()
{
    bool a = digitalRead(MOD_A);
    bool b = digitalRead(MOD_B);

    if(a) return WAVE_SINE;
    if(b) return WAVE_SQUARE;

    return WAVE_TRIANGLE;
}

float quantizeScale(float freq)
{
    const float notes[] =
    {
        65.4,73.4,82.4,87.3,98.0,
        110.0,123.4,130.8,146.8,
        164.8,174.6,196.0,220.0,
        246.9,261.6,293.7,329.6,
        349.2,392.0,440.0,493.9,
        523.2,587.3,659.2,698.4,
        784.0,880.0
    };

    float best = notes[0];
    float err = fabs(freq - best);

    for(int i=1;i<27;i++)
    {
        float e = fabs(freq - notes[i]);

        if(e < err)
        {
            err = e;
            best = notes[i];
        }
    }

    return best;
}

void setup()
{
    Serial.begin(115200);

    analogReadResolution(12);

    pinMode(MAIN_A, INPUT_PULLDOWN);
    pinMode(MAIN_B, INPUT_PULLDOWN);

    pinMode(MOD_A, INPUT_PULLDOWN);
    pinMode(MOD_B, INPUT_PULLDOWN);

    pinMode(BTN_TRIGGER, INPUT_PULLUP);
    pinMode(BTN_SCALE, INPUT_PULLUP);

    memset(delayBuffer, 0, sizeof(delayBuffer));

    i2s_config_t i2s_config =
    {
        .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
        .sample_rate = SAMPLE_RATE,
        .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
        .channel_format = I2S_CHANNEL_FMT_RIGHT_LEFT,
        .communication_format = I2S_COMM_FORMAT_I2S,
        .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
        .dma_buf_count = 8,
        .dma_buf_len = 256,
        .use_apll = false,
        .tx_desc_auto_clear = true,
        .fixed_mclk = 0
    };

    i2s_pin_config_t pin_config =
    {
        .bck_io_num = I2S_BCK,
        .ws_io_num = I2S_WS,
        .data_out_num = I2S_DOUT,
        .data_in_num = I2S_PIN_NO_CHANGE
    };

    i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
    i2s_set_pin(I2S_NUM_0, &pin_config);

    Serial.println("DUB SIREN V3");
}

void loop()
{
    int16_t samples[512];

    float volume =
        analogRead(POT_VOLUME) / 4095.0f;

    float mainFreq =
        60.0f +
        (analogRead(POT_MAINFREQ) / 4095.0f) * 1200.0f;

    float modFreq =
        0.1f +
        (analogRead(POT_MODFREQ) / 4095.0f) * 20.0f;

    if(digitalRead(BTN_SCALE) == LOW)
    {
        mainFreq = quantizeScale(mainFreq);
    }

    WaveType mainWave = readMainWave();
    WaveType modWave  = readModWave();

    bool trigger =
        (digitalRead(BTN_TRIGGER) == LOW);

    int delaySamples =
        map(
            analogRead(POT_DELAY),
            0,
            4095,
            1000,
            MAX_DELAY_SAMPLES - 1
        );

    for(int i = 0; i < 256; i++)
    {
        float mod =
            generateWave(modPhase, modWave);

        float freq =
            mainFreq +
            (mod * (mainFreq * 0.30f));

        if(freq < 20.0f)
            freq = 20.0f;

        float sample = 0.0f;

        if(trigger)
        {
            sample =
                generateWave(
                    mainPhase,
                    mainWave
                );
        }

        // DELAY

        int readIndex =
            delayIndex - delaySamples;

        if(readIndex < 0)
            readIndex += MAX_DELAY_SAMPLES;

        float delayed =
            delayBuffer[readIndex] /
            32768.0f;

        sample += delayed * 0.5f;

        delayBuffer[delayIndex] =
            (int16_t)(sample * 16000.0f);

        delayIndex++;

        if(delayIndex >= MAX_DELAY_SAMPLES)
            delayIndex = 0;

        // LIMITER

        if(sample > 1.0f)
            sample = 1.0f;

        if(sample < -1.0f)
            sample = -1.0f;

        int16_t value =
            (int16_t)(
                sample *
                12000.0f *
                volume
            );

        samples[i * 2]     = value;
        samples[i * 2 + 1] = value;

        mainPhase +=
            (2.0f * PI * freq) /
            SAMPLE_RATE;

        modPhase +=
            (2.0f * PI * modFreq) /
            SAMPLE_RATE;

        if(mainPhase >= 2.0f * PI)
            mainPhase -= 2.0f * PI;

        if(modPhase >= 2.0f * PI)
            modPhase -= 2.0f * PI;
    }

    size_t bytesWritten;

    i2s_write(
        I2S_NUM_0,
        samples,
        sizeof(samples),
        &bytesWritten,
        portMAX_DELAY
    );
}
