class APU {
	constructor(dmg) {
		this.dmg = dmg;
		this.gbClock = 4194304;
		this.enabled = true;

		const AudioCtor = window.AudioContext || window.webkitAudioContext;
		this.ctx = AudioCtor ? new AudioCtor() : null;
		this.sampleRate = this.ctx ? this.ctx.sampleRate : 48000;
		this.cyclesPerSample = this.gbClock / this.sampleRate;
		this.cycleAccumulator = 0;
		this.phase = 0;

		this.bufferSize = 32768;
		this.buffer = new Float32Array(this.bufferSize);
		this.readIndex = 0;
		this.writeIndex = 0;

		if (this.ctx) {
			this.masterGain = this.ctx.createGain();
			this.masterGain.gain.value = 0.18;

			this.outputNode = this.ctx.createScriptProcessor(1024, 0, 1);
			this.outputNode.onaudioprocess = (event) => {
				const out = event.outputBuffer.getChannelData(0);
				for (let i = 0; i < out.length; i++) {
					out[i] = this.dequeueSample();
				}
			};

			this.outputNode.connect(this.masterGain);
			this.masterGain.connect(this.ctx.destination);
		}
	}

	setEnabled(enabled) {
		this.enabled = enabled;
		if (!this.ctx) {
			return;
		}

		if (enabled) {
			this.ctx.resume?.().catch(() => {});
		} else {
			this.ctx.suspend?.().catch(() => {});
		}
	}

	update(deltaClock) {
		if (!this.enabled || !this.ctx) {
			return;
		}

		this.cycleAccumulator += deltaClock;
		while (this.cycleAccumulator >= this.cyclesPerSample) {
			this.cycleAccumulator -= this.cyclesPerSample;
			this.enqueueSample(this.sampleCH1());
		}
	}

	sampleCH1() {
		const mmu = this.dmg.mmu.memory;
		const nr52 = mmu[0xff26];
		if ((nr52 & 0x80) === 0) {
			return 0;
		}

		const nr12 = mmu[0xff12];
		const dacEnabled = (nr12 & 0xf8) !== 0;
		if (!dacEnabled) {
			return 0;
		}

		const nr13 = mmu[0xff13];
		const nr14 = mmu[0xff14];
		const freqX = ((nr14 & 0x07) << 8) | nr13;
		if (freqX >= 2048) {
			return 0;
		}

		const frequencyHz = 131072 / (2048 - freqX);
		this.phase += frequencyHz / this.sampleRate;
		if (this.phase >= 1) {
			this.phase -= Math.floor(this.phase);
		}

		const dutyIndex = (mmu[0xff11] >> 6) & 0x03;
		const dutyTable = [0.125, 0.25, 0.5, 0.75];
		const duty = dutyTable[dutyIndex];
		const square = this.phase < duty ? 1 : -1;

		const envelopeVolume = ((nr12 >> 4) & 0x0f) / 15;
		const nr50 = mmu[0xff24];
		const nr51 = mmu[0xff25];
		const leftEnabled = (nr51 & 0x10) !== 0;
		const rightEnabled = (nr51 & 0x01) !== 0;
		if (!leftEnabled && !rightEnabled) {
			return 0;
		}

		const leftVol = ((nr50 >> 4) & 0x07) / 7;
		const rightVol = (nr50 & 0x07) / 7;
		const mixGain = ((leftEnabled ? leftVol : 0) + (rightEnabled ? rightVol : 0)) * 0.5;

		return square * envelopeVolume * mixGain * 0.35;
	}

	enqueueSample(sample) {
		const nextWrite = (this.writeIndex + 1) % this.bufferSize;
		if (nextWrite === this.readIndex) {
			this.readIndex = (this.readIndex + 1) % this.bufferSize;
		}
		this.buffer[this.writeIndex] = sample;
		this.writeIndex = nextWrite;
	}

	dequeueSample() {
		if (this.readIndex === this.writeIndex) {
			return 0;
		}
		const sample = this.buffer[this.readIndex];
		this.readIndex = (this.readIndex + 1) % this.bufferSize;
		return sample;
	}
}

export {
	APU,
};
