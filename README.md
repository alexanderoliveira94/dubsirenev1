# 🔊 Dub Siren V1

Uma Dub Siren digital baseada em **ESP32 + PCM5102**, inspirada nos clássicos instrumentos utilizados em Sound Systems de Dub e Reggae.

O projeto utiliza síntese digital em tempo real, modulação por LFO, seleção de formas de onda e efeitos de delay para criar sons característicos de Dub Sirens analógicas, com a flexibilidade e o baixo custo da plataforma ESP32.

---

## 🎵 Recursos

- Oscilador principal (Main Oscillator)
- Oscilador de modulação (LFO)
- Seleção de formas de onda
  - Sine
  - Triangle
  - Square
- Controle de frequência principal
- Controle de frequência de modulação
- Controle de volume
- Delay ajustável
- Feedback ajustável
- Botão Trigger
- Botão Scale
- Saída de áudio digital via PCM5102 (I2S)
- Baixa latência
- Totalmente standalone

---

## 🛠 Hardware

### Microcontrolador

- ESP32 DevKit V1
- ESP32-WROOM-32

### DAC de Áudio

- PCM5102 I2S DAC

### Controles

- 5x Potenciômetros B50K
- 2x Chaves ON-OFF-ON
- 2x Botões momentâneos

---

## 📌 Pinagem

### PCM5102

| PCM5102 | ESP32 |
|----------|--------|
| BCK | GPIO26 |
| LCK/WS | GPIO25 |
| DIN | GPIO22 |
| VIN | 5V |
| GND | GND |

---

### Potenciômetros

| Função | GPIO |
|----------|--------|
| Volume | GPIO34 |
| Main Frequency | GPIO35 |
| Mod Frequency | GPIO32 |
| Delay | GPIO33 |
| Feedback | GPIO27 |

---

### Chave Main Oscillator

| Terminal | GPIO |
|-----------|--------|
| A | GPIO13 |
| B | GPIO12 |
| Centro | 3.3V |

### Mod Oscillator

| Terminal | GPIO |
|-----------|--------|
| A | GPIO14 |
| B | GPIO4 |
| Centro | 3.3V |

---

### Botões

| Função | GPIO |
|----------|--------|
| Trigger | GPIO18 |
| Scale | GPIO19 |

Ligação:

- Um terminal → GND
- Outro terminal → GPIO

Utilizando `INPUT_PULLUP`.

---

## 🎚 Controles

### Volume

Controla o volume geral da sirene.

### Main Frequency

Controla a frequência do oscilador principal.

### Mod Frequency

Controla a velocidade da modulação.

### Delay

Controla o tempo do delay.

### Feedback

Controla a quantidade de realimentação do delay.

### Main OSC Switch

Seleciona a forma de onda principal.

### Mod OSC Switch

Seleciona a forma de onda do modulador.

### Trigger

Ativa a sirene.

### Scale

Quantiza a frequência principal para notas musicais.

---

## 🔧 Ambiente de Desenvolvimento

Projeto desenvolvido com:

- PlatformIO
- Visual Studio Code
- ESP32 Arduino Framework

---

## 🚀 Compilação

Clone o projeto:

```bash
git clone https://github.com/alexanderoliveira94/dubsirenev1.git
```

Entre na pasta:

```bash
cd dubsirenev1
```

Compile e grave usando PlatformIO:

```bash
pio run
pio run --target upload
```

---

## 📷 Futuras Melhorias

- Delay estilo Tape Echo
- Saturação analógica
- Filtro no feedback
- Reverb
- Presets
- MIDI
- Interface OLED
- Sincronização externa

---

## 🤘 Inspiração

Este projeto foi inspirado nas clássicas Dub Sirens utilizadas por Sound Systems de Reggae e Dub ao redor do mundo.

---

## 📜 Licença

MIT License

Use, modifique, compartilhe e faça barulho.
