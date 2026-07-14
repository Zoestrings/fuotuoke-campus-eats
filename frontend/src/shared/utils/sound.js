// ================================================================
// FUOTUOKE Campus Eats — Dynamic Audio Feedback Engine
// Synthesizes pleasant sounds in the browser using the Web Audio API.
// No asset download required, zero latency, and fully offline-safe.
// ================================================================

/** Plays a gentle rising melody chime when an order is initiated */
export function playChimeSound() {
  try {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtxClass) return;
    const ctx = new AudioCtxClass();
    
    const playNote = (frequency, delay, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    };

    // Rising major triad chime
    playNote(523.25, 0, 0.35);     // C5
    playNote(659.25, 0.08, 0.4);   // E5
    playNote(783.99, 0.16, 0.45);  // G5
    playNote(1046.50, 0.24, 0.55); // C6
  } catch (e) {
    console.warn("Audio feedback blocked or unsupported: ", e.message);
  }
}

/** Plays a high-quality success "ding/coin" melody when payment completes */
export function playSuccessSound() {
  try {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtxClass) return;
    const ctx = new AudioCtxClass();
    
    const playNote = (frequency, oscillatorType, delay, duration, volume) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = oscillatorType;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    };

    // Sparkling coin / checkout success chime
    playNote(987.77, "triangle", 0, 0.25, 0.15); // B5
    playNote(1318.51, "sine", 0.05, 0.4, 0.12);  // E6
    playNote(1567.98, "sine", 0.1, 0.45, 0.1);   // G6
    playNote(2093.00, "sine", 0.15, 0.6, 0.08);  // C7
  } catch (e) {
    console.warn("Audio feedback blocked or unsupported: ", e.message);
  }
}
