var SOUND_VOL = 0.25;
var QUIET_SOUND_VOL = 0.1;
var SAMPLE_RATE = 5512;
var BIT_DEPTH = 8;

var SQUARE = 0;
var SAWTOOTH = 1;
var SINE = 2;
var NOISE = 3;
var TRIANGLE = 4;
var BREAKER = 5;

var SHAPES = [
  'square', 'sawtooth', 'sine', 'noise', 'triangle', 'breaker'
];

var AUDIO_CONTEXT;

function checkAudioContextExists(){
  try{
    if (AUDIO_CONTEXT==null){
      if (typeof AudioContext != 'undefined') {
        AUDIO_CONTEXT = new AudioContext();
      } else if (typeof webkitAudioContext != 'undefined') {
        AUDIO_CONTEXT = new webkitAudioContext();
      }
    }
  }
  catch (ex){
    window.console.log(ex)
  }
}

checkAudioContextExists();

// Playback volume
var masterVolume = 1.0;

// Sound generation parameters are on [0,1] unless noted SIGNED, & thus [-1,1]
function Params() {
  var result={};
  // Wave shape
  result.wave_type = SQUARE;

  // Envelope
  result.p_env_attack = 0.0;   // Attack time
  result.p_env_sustain = 0.3;  // Sustain time
  result.p_env_punch = 0.0;    // Sustain punch
  result.p_env_decay = 0.4;    // Decay time

  // Tone
  result.p_base_freq = 0.3;    // Start frequency
  result.p_freq_limit = 0.0;   // Min frequency cutoff
  result.p_freq_ramp = 0.0;    // Slide (SIGNED)
  result.p_freq_dramp = 0.0;   // Delta slide (SIGNED)
  // Vibrato
  result.p_vib_strength = 0.0; // Vibrato depth
  result.p_vib_speed = 0.0;    // Vibrato speed

  // Tonal change
  result.p_arp_mod = 0.0;      // Change amount (SIGNED)
  result.p_arp_speed = 0.0;    // Change speed

  // Duty (wat's that?)
  result.p_duty = 0.0;         // Square duty
  result.p_duty_ramp = 0.0;    // Duty sweep (SIGNED)

  // Repeat
  result.p_repeat_speed = 0.0; // Repeat speed

  // Phaser
  result.p_pha_offset = 0.0;   // Phaser offset (SIGNED)
  result.p_pha_ramp = 0.0;     // Phaser sweep (SIGNED)

  // Low-pass filter
  result.p_lpf_freq = 1.0;     // Low-pass filter cutoff
  result.p_lpf_ramp = 0.0;     // Low-pass filter cutoff sweep (SIGNED)
  result.p_lpf_resonance = 0.0;// Low-pass filter resonance
  // High-pass filter
  result.p_hpf_freq = 0.0;     // High-pass filter cutoff
  result.p_hpf_ramp = 0.0;     // High-pass filter cutoff sweep (SIGNED)

  // Sample parameters
  result.sound_vol = 0.5;
  result.sample_rate = 44100;
  result.bit_depth = 8;
  return result;
}

var rng;
var seeded = false;
function frnd(range) {
  if (seeded) {
    return rng.uniform() * range;
  } else {
    return Math.random() * range;
  }
}


function rnd(max) {
  if (seeded) {
  return Math.floor(rng.uniform() * (max + 1));
  } else {
    return Math.floor(Math.random() * (max + 1));
  }
}


pickupCoin = function() {
  var result=Params();
  result.wave_type = Math.floor(frnd(SHAPES.length));
  if (result.wave_type === 3) {
    result.wave_type = 0;
  }
  result.p_base_freq = 0.4 + frnd(0.5);
  result.p_env_attack = 0.0;
  result.p_env_sustain = frnd(0.1);
  result.p_env_decay = 0.1 + frnd(0.4);
  result.p_env_punch = 0.3 + frnd(0.3);
  if (rnd(1)) {
    result.p_arp_speed = 0.5 + frnd(0.2);
    var num = (frnd(7) | 1) + 1;
    var den = num + (frnd(7) | 1) + 2;
    result.p_arp_mod = (+num) / (+den); //0.2 + frnd(0.4);
  }
  return result;
};


laserShoot = function() {
  var result=Params();
  result.wave_type = rnd(2);
  if (result.wave_type === SINE && rnd(1))
    result.wave_type = rnd(1);
  result.wave_type = Math.floor(frnd(SHAPES.length));

  if (result.wave_type === 3) {
    result.wave_type = SQUARE;
  }

  result.p_base_freq = 0.5 + frnd(0.5);
  result.p_freq_limit = result.p_base_freq - 0.2 - frnd(0.6);
  if (result.p_freq_limit < 0.2) result.p_freq_limit = 0.2;
  result.p_freq_ramp = -0.15 - frnd(0.2);
  if (rnd(2) === 0)
  {
    result.p_base_freq = 0.3 + frnd(0.6);
    result.p_freq_limit = frnd(0.1);
    result.p_freq_ramp = -0.35 - frnd(0.3);
  }
  if (rnd(1))
  {
    result.p_duty = frnd(0.5);
    result.p_duty_ramp = frnd(0.2);
  }
  else
  {
    result.p_duty = 0.4 + frnd(0.5);
    result.p_duty_ramp = -frnd(0.7);
  }
  result.p_env_attack = 0.0;
  result.p_env_sustain = 0.1 + frnd(0.2);
  result.p_env_decay = frnd(0.4);
  if (rnd(1))
    result.p_env_punch = frnd(0.3);
  if (rnd(2) === 0)
  {
    result.p_pha_offset = frnd(0.2);
    result.p_pha_ramp = -frnd(0.2);
  }
  if (rnd(1))
    result.p_hpf_freq = frnd(0.3);

  return result;
};

explosion = function() {
  var result=Params();

  if (rnd(1)) {
    result.p_base_freq = 0.1 + frnd(0.4);
    result.p_freq_ramp = -0.1 + frnd(0.4);
  } else {
    result.p_base_freq = 0.2 + frnd(0.7);
    result.p_freq_ramp = -0.2 - frnd(0.2);
  }
  result.p_base_freq *= result.p_base_freq;
  if (rnd(4) === 0)
    result.p_freq_ramp = 0.0;
  if (rnd(2) === 0)
    result.p_repeat_speed = 0.3 + frnd(0.5);
  result.p_env_attack = 0.0;
  result.p_env_sustain = 0.1 + frnd(0.3);
  result.p_env_decay = frnd(0.5);
  if (rnd(1) === 0) {
    result.p_pha_offset = -0.3 + frnd(0.9);
    result.p_pha_ramp = -frnd(0.3);
  }
  result.p_env_punch = 0.2 + frnd(0.6);
  if (rnd(1)) {
    result.p_vib_strength = frnd(0.7);
    result.p_vib_speed = frnd(0.6);
  }
  if (rnd(2) === 0) {
    result.p_arp_speed = 0.6 + frnd(0.3);
    result.p_arp_mod = 0.8 - frnd(1.6);
  }

  return result;
};
//9675111
birdSound = function() {
  var result=Params();

if (frnd(10) < 1) {
    result.wave_type = Math.floor(frnd(SHAPES.length));
    if (result.wave_type === 3) {
      result.wave_type = SQUARE;
    }
result.p_env_attack = 0.4304400932967592 + frnd(0.2) - 0.1;
result.p_env_sustain = 0.15739346034252394 + frnd(0.2) - 0.1;
result.p_env_punch = 0.004488201744871758 + frnd(0.2) - 0.1;
result.p_env_decay = 0.07478075528212291 + frnd(0.2) - 0.1;
result.p_base_freq = 0.9865265720147687 + frnd(0.2) - 0.1;
result.p_freq_limit = 0 + frnd(0.2) - 0.1;
result.p_freq_ramp = -0.2995018224359539 + frnd(0.2) - 0.1;
if (frnd(1.0) < 0.5) {
  result.p_freq_ramp = 0.1 + frnd(0.15);
}
result.p_freq_dramp = 0.004598608156964473 + frnd(0.1) - 0.05;
result.p_vib_strength = -0.2202799497929496 + frnd(0.2) - 0.1;
result.p_vib_speed = 0.8084998703158364 + frnd(0.2) - 0.1;
result.p_arp_mod = 0;//-0.46410459213693644+frnd(0.2)-0.1;
result.p_arp_speed = 0;//-0.10955361249587248+frnd(0.2)-0.1;
result.p_duty = -0.9031808754347107 + frnd(0.2) - 0.1;
result.p_duty_ramp = -0.8128699999808343 + frnd(0.2) - 0.1;
result.p_repeat_speed = 0.6014860189319991 + frnd(0.2) - 0.1;
result.p_pha_offset = -0.9424902314367765 + frnd(0.2) - 0.1;
result.p_pha_ramp = -0.1055482222272056 + frnd(0.2) - 0.1;
result.p_lpf_freq = 0.9989765717851521 + frnd(0.2) - 0.1;
result.p_lpf_ramp = -0.25051720626043017 + frnd(0.2) - 0.1;
result.p_lpf_resonance = 0.32777871505494693 + frnd(0.2) - 0.1;
result.p_hpf_freq = 0.0023548750981756753 + frnd(0.2) - 0.1;
result.p_hpf_ramp = -0.002375673204842568 + frnd(0.2) - 0.1;
return result;
}

if (frnd(10) < 1) {
    result.wave_type = Math.floor(frnd(SHAPES.length));
    if (result.wave_type === 3) {
      result.wave_type = SQUARE;
    }
result.p_env_attack = 0.5277795946672003 + frnd(0.2) - 0.1;
result.p_env_sustain = 0.18243733568468432 + frnd(0.2) - 0.1;
result.p_env_punch = -0.020159754546840117 + frnd(0.2) - 0.1;
result.p_env_decay = 0.1561353422051903 + frnd(0.2) - 0.1;
result.p_base_freq = 0.9028855606533718 + frnd(0.2) - 0.1;
result.p_freq_limit = -0.008842787837148716;
result.p_freq_ramp = -0.1;
result.p_freq_dramp = -0.012891241489551925;
result.p_vib_strength = -0.17923136138403065 + frnd(0.2) - 0.1;
result.p_vib_speed = 0.908263385610142 + frnd(0.2) - 0.1;
result.p_arp_mod = 0.41690153355414894 + frnd(0.2) - 0.1;
result.p_arp_speed = 0.0010766233195860703 + frnd(0.2) - 0.1;
result.p_duty = -0.8735363011184684 + frnd(0.2) - 0.1;
result.p_duty_ramp = -0.7397985366747507 + frnd(0.2) - 0.1;
result.p_repeat_speed = 0.0591789344172107 + frnd(0.2) - 0.1;
result.p_pha_offset = -0.9961184222777699 + frnd(0.2) - 0.1;
result.p_pha_ramp = -0.08234769395850523 + frnd(0.2) - 0.1;
result.p_lpf_freq = 0.9412475115697335 + frnd(0.2) - 0.1;
result.p_lpf_ramp = -0.18261358925834958 + frnd(0.2) - 0.1;
result.p_lpf_resonance = 0.24541438107389477 + frnd(0.2) - 0.1;
result.p_hpf_freq = -0.01831940280978611 + frnd(0.2) - 0.1;
result.p_hpf_ramp = -0.03857383633171346 + frnd(0.2) - 0.1;
return result;

}
  if (frnd(10) < 1) {
//result.wave_type = 4;
    result.wave_type = Math.floor(frnd(SHAPES.length));

    if (result.wave_type === 3) {
      result.wave_type = SQUARE;
    }
result.p_env_attack = 0.4304400932967592 + frnd(0.2) - 0.1;
result.p_env_sustain = 0.15739346034252394 + frnd(0.2) - 0.1;
result.p_env_punch = 0.004488201744871758 + frnd(0.2) - 0.1;
result.p_env_decay = 0.07478075528212291 + frnd(0.2) - 0.1;
result.p_base_freq = 0.9865265720147687 + frnd(0.2) - 0.1;
result.p_freq_limit = 0 + frnd(0.2) - 0.1;
result.p_freq_ramp = -0.2995018224359539 + frnd(0.2) - 0.1;
result.p_freq_dramp = 0.004598608156964473 + frnd(0.2) - 0.1;
result.p_vib_strength = -0.2202799497929496 + frnd(0.2) - 0.1;
result.p_vib_speed = 0.8084998703158364 + frnd(0.2) - 0.1;
result.p_arp_mod = -0.46410459213693644 + frnd(0.2) - 0.1;
result.p_arp_speed = -0.10955361249587248 + frnd(0.2) - 0.1;
result.p_duty = -0.9031808754347107 + frnd(0.2) - 0.1;
result.p_duty_ramp = -0.8128699999808343 + frnd(0.2) - 0.1;
result.p_repeat_speed = 0.7014860189319991 + frnd(0.2) - 0.1;
result.p_pha_offset = -0.9424902314367765 + frnd(0.2) - 0.1;
result.p_pha_ramp = -0.1055482222272056 + frnd(0.2) - 0.1;
result.p_lpf_freq = 0.9989765717851521 + frnd(0.2) - 0.1;
result.p_lpf_ramp = -0.25051720626043017 + frnd(0.2) - 0.1;
result.p_lpf_resonance = 0.32777871505494693 + frnd(0.2) - 0.1;
result.p_hpf_freq = 0.0023548750981756753 + frnd(0.2) - 0.1;
result.p_hpf_ramp = -0.002375673204842568 + frnd(0.2) - 0.1;
return result;
}
  if (frnd(5) > 1) {
    result.wave_type = Math.floor(frnd(SHAPES.length));

    if (result.wave_type === 3) {
      result.wave_type = SQUARE;
    }
    if (rnd(1)) {
      result.p_arp_mod = 0.2697849293151393 + frnd(0.2) - 0.1;
      result.p_arp_speed = -0.3131172257760948 + frnd(0.2) - 0.1;
      result.p_base_freq = 0.8090588299313949 + frnd(0.2) - 0.1;
      result.p_duty = -0.6210022920964955 + frnd(0.2) - 0.1;
      result.p_duty_ramp = -0.00043441813553182567 + frnd(0.2) - 0.1;
      result.p_env_attack = 0.004321877246874195 + frnd(0.2) - 0.1;
      result.p_env_decay = 0.1 + frnd(0.2) - 0.1;
      result.p_env_punch = 0.061737781504416146 + frnd(0.2) - 0.1;
      result.p_env_sustain = 0.4987252564798832 + frnd(0.2) - 0.1;
      result.p_freq_dramp = 0.31700340314222614 + frnd(0.2) - 0.1;
      result.p_freq_limit = 0 + frnd(0.2) - 0.1;
      result.p_freq_ramp = -0.163380391341416 + frnd(0.2) - 0.1;
      result.p_hpf_freq = 0.4709005021145149 + frnd(0.2) - 0.1;
      result.p_hpf_ramp = 0.6924667290539194 + frnd(0.2) - 0.1;
      result.p_lpf_freq = 0.8351398631384511 + frnd(0.2) - 0.1;
      result.p_lpf_ramp = 0.36616557192873134 + frnd(0.2) - 0.1;
      result.p_lpf_resonance = -0.08685777111664439 + frnd(0.2) - 0.1;
      result.p_pha_offset = -0.036084571580025544 + frnd(0.2) - 0.1;
      result.p_pha_ramp = -0.014806445085568108 + frnd(0.2) - 0.1;
      result.p_repeat_speed = -0.8094368475518489 + frnd(0.2) - 0.1;
      result.p_vib_speed = 0.4496665457171294 + frnd(0.2) - 0.1;
      result.p_vib_strength = 0.23413762515532424 + frnd(0.2) - 0.1;
    } else {
      result.p_arp_mod = -0.35697118026766184 + frnd(0.2) - 0.1;
      result.p_arp_speed = 0.3581140690559588 + frnd(0.2) - 0.1;
      result.p_base_freq = 1.3260897696157528 + frnd(0.2) - 0.1;
      result.p_duty = -0.30984900436710694 + frnd(0.2) - 0.1;
      result.p_duty_ramp = -0.0014374759133411626 + frnd(0.2) - 0.1;
      result.p_env_attack = 0.3160357835682254 + frnd(0.2) - 0.1;
      result.p_env_decay = 0.1 + frnd(0.2) - 0.1;
      result.p_env_punch = 0.24323114016870148 + frnd(0.2) - 0.1;
      result.p_env_sustain = 0.4 + frnd(0.2) - 0.1;
      result.p_freq_dramp = 0.2866475886237244 + frnd(0.2) - 0.1;
      result.p_freq_limit = 0 + frnd(0.2) - 0.1;
      result.p_freq_ramp = -0.10956352368742976 + frnd(0.2) - 0.1;
      result.p_hpf_freq = 0.20772718017889846 + frnd(0.2) - 0.1;
      result.p_hpf_ramp = 0.1564090637378835 + frnd(0.2) - 0.1;
      result.p_lpf_freq = 0.6021372770637031 + frnd(0.2) - 0.1;
      result.p_lpf_ramp = 0.24016227139979027 + frnd(0.2) - 0.1;
      result.p_lpf_resonance = -0.08787383821160144 + frnd(0.2) - 0.1;
      result.p_pha_offset = -0.381597686151701 + frnd(0.2) - 0.1;
      result.p_pha_ramp = -0.0002481687661373495 + frnd(0.2) - 0.1;
      result.p_repeat_speed = 0.07812112809425686 + frnd(0.2) - 0.1;
      result.p_vib_speed = -0.13648848579133943 + frnd(0.2) - 0.1;
      result.p_vib_strength = 0.0018874158972302657 + frnd(0.2) - 0.1;
    }
    return result;

  }

  result.wave_type = Math.floor(frnd(SHAPES.length));//TRIANGLE;
  if (result.wave_type === 1 || result.wave_type === 3) {
    result.wave_type = 2;
  }
  //new
  result.p_base_freq = 0.85 + frnd(0.15);
  result.p_freq_ramp = 0.3 + frnd(0.15);
//  result.p_freq_dramp = 0.3+frnd(2.0);

  result.p_env_attack = 0 + frnd(0.09);
  result.p_env_sustain = 0.2 + frnd(0.3);
  result.p_env_decay = 0 + frnd(0.1);

  result.p_duty = frnd(2.0) - 1.0;
  result.p_duty_ramp = Math.pow(frnd(2.0) - 1.0, 3.0);


  result.p_repeat_speed = 0.5 + frnd(0.1);

  result.p_pha_offset = -0.3 + frnd(0.9);
  result.p_pha_ramp = -frnd(0.3);

  result.p_arp_speed = 0.4 + frnd(0.6);
  result.p_arp_mod = 0.8 + frnd(0.1);


  result.p_lpf_resonance = frnd(2.0) - 1.0;
  result.p_lpf_freq = 1.0 - Math.pow(frnd(1.0), 3.0);
  result.p_lpf_ramp = Math.pow(frnd(2.0) - 1.0, 3.0);
  if (result.p_lpf_freq < 0.1 && result.p_lpf_ramp < -0.05)
    result.p_lpf_ramp = -result.p_lpf_ramp;
  result.p_hpf_freq = Math.pow(frnd(1.0), 5.0);
  result.p_hpf_ramp = Math.pow(frnd(2.0) - 1.0, 5.0);

  return result;
};


pushSound = function() {
  var result=Params();
  result.wave_type = Math.floor(frnd(SHAPES.length));//TRIANGLE;
  if (result.wave_type === 2) {
    result.wave_type++;
  }
  if (result.wave_type === 0) {
    result.wave_type = NOISE;
  }
  //new
  result.p_base_freq = 0.1 + frnd(0.4);
  result.p_freq_ramp = 0.05 + frnd(0.2);

  result.p_env_attack = 0.01 + frnd(0.09);
  result.p_env_sustain = 0.01 + frnd(0.09);
  result.p_env_decay = 0.01 + frnd(0.09);

  result.p_repeat_speed = 0.3 + frnd(0.5);
  result.p_pha_offset = -0.3 + frnd(0.9);
  result.p_pha_ramp = -frnd(0.3);
  result.p_arp_speed = 0.6 + frnd(0.3);
  result.p_arp_mod = 0.8 - frnd(1.6);

  return result;
};



powerUp = function() {
  var result=Params();
  if (rnd(1))
    result.wave_type = SAWTOOTH;
  else
    result.p_duty = frnd(0.6);
  result.wave_type = Math.floor(frnd(SHAPES.length));
  if (result.wave_type === 3) {
    result.wave_type = SQUARE;
  }
  if (rnd(1))
  {
    result.p_base_freq = 0.2 + frnd(0.3);
    result.p_freq_ramp = 0.1 + frnd(0.4);
    result.p_repeat_speed = 0.4 + frnd(0.4);
  }
  else
  {
    result.p_base_freq = 0.2 + frnd(0.3);
    result.p_freq_ramp = 0.05 + frnd(0.2);
    if (rnd(1))
    {
      result.p_vib_strength = frnd(0.7);
      result.p_vib_speed = frnd(0.6);
    }
  }
  result.p_env_attack = 0.0;
  result.p_env_sustain = frnd(0.4);
  result.p_env_decay = 0.1 + frnd(0.4);

  return result;
};

hitHurt = function() {
  result = Params();
  result.wave_type = rnd(2);
  if (result.wave_type === SINE)
    result.wave_type = NOISE;
  if (result.wave_type === SQUARE)
    result.p_duty = frnd(0.6);
  result.wave_type = Math.floor(frnd(SHAPES.length));
  result.p_base_freq = 0.2 + frnd(0.6);
  result.p_freq_ramp = -0.3 - frnd(0.4);
  result.p_env_attack = 0.0;
  result.p_env_sustain = frnd(0.1);
  result.p_env_decay = 0.1 + frnd(0.2);
  if (rnd(1))
    result.p_hpf_freq = frnd(0.3);
  return result;
};


jump = function() {
  result = Params();
  result.wave_type = SQUARE;
  result.wave_type = Math.floor(frnd(SHAPES.length));
  if (result.wave_type === 3) {
    result.wave_type = SQUARE;
  }
  result.p_duty = frnd(0.6);
  result.p_base_freq = 0.3 + frnd(0.3);
  result.p_freq_ramp = 0.1 + frnd(0.2);
  result.p_env_attack = 0.0;
  result.p_env_sustain = 0.1 + frnd(0.3);
  result.p_env_decay = 0.1 + frnd(0.2);
  if (rnd(1))
    result.p_hpf_freq = frnd(0.3);
  if (rnd(1))
    result.p_lpf_freq = 1.0 - frnd(0.6);
  return result;
};

blipSelect = function() {
  result = Params();
  result.wave_type = rnd(1);
  result.wave_type = Math.floor(frnd(SHAPES.length));
  if (result.wave_type === 3) {
    result.wave_type = rnd(1);
  }
  if (result.wave_type === SQUARE)
    result.p_duty = frnd(0.6);
  result.p_base_freq = 0.2 + frnd(0.4);
  result.p_env_attack = 0.0;
  result.p_env_sustain = 0.1 + frnd(0.1);
  result.p_env_decay = frnd(0.2);
  result.p_hpf_freq = 0.1;
  return result;
};

random = function() {
  result = Params();
  result.wave_type = Math.floor(frnd(SHAPES.length));
  result.p_base_freq = Math.pow(frnd(2.0) - 1.0, 2.0);
  if (rnd(1))
    result.p_base_freq = Math.pow(frnd(2.0) - 1.0, 3.0) + 0.5;
  result.p_freq_limit = 0.0;
  result.p_freq_ramp = Math.pow(frnd(2.0) - 1.0, 5.0);
  if (result.p_base_freq > 0.7 && result.p_freq_ramp > 0.2)
    result.p_freq_ramp = -result.p_freq_ramp;
  if (result.p_base_freq < 0.2 && result.p_freq_ramp < -0.05)
    result.p_freq_ramp = -result.p_freq_ramp;
  result.p_freq_dramp = Math.pow(frnd(2.0) - 1.0, 3.0);
  result.p_duty = frnd(2.0) - 1.0;
  result.p_duty_ramp = Math.pow(frnd(2.0) - 1.0, 3.0);
  result.p_vib_strength = Math.pow(frnd(2.0) - 1.0, 3.0);
  result.p_vib_speed = frnd(2.0) - 1.0;
  result.p_env_attack = Math.pow(frnd(2.0) - 1.0, 3.0);
  result.p_env_sustain = Math.pow(frnd(2.0) - 1.0, 2.0);
  result.p_env_decay = frnd(2.0) - 1.0;
  result.p_env_punch = Math.pow(frnd(0.8), 2.0);
  if (result.p_env_attack + result.p_env_sustain + result.p_env_decay < 0.2) {
    result.p_env_sustain += 0.2 + frnd(0.3);
    result.p_env_decay += 0.2 + frnd(0.3);
  }
  result.p_lpf_resonance = frnd(2.0) - 1.0;
  result.p_lpf_freq = 1.0 - Math.pow(frnd(1.0), 3.0);
  result.p_lpf_ramp = Math.pow(frnd(2.0) - 1.0, 3.0);
  if (result.p_lpf_freq < 0.1 && result.p_lpf_ramp < -0.05)
    result.p_lpf_ramp = -result.p_lpf_ramp;
  result.p_hpf_freq = Math.pow(frnd(1.0), 5.0);
  result.p_hpf_ramp = Math.pow(frnd(2.0) - 1.0, 5.0);
  result.p_pha_offset = Math.pow(frnd(2.0) - 1.0, 3.0);
  result.p_pha_ramp = Math.pow(frnd(2.0) - 1.0, 3.0);
  result.p_repeat_speed = frnd(2.0) - 1.0;
  result.p_arp_speed = frnd(2.0) - 1.0;
  result.p_arp_mod = frnd(2.0) - 1.0;
  return result;
};

var generators = [
pickupCoin,
laserShoot,
explosion,
powerUp,
hitHurt,
jump,
blipSelect,
pushSound,
random,
birdSound
];

var generatorNames = [
'pickupCoin',
'laserShoot',
'explosion',
'powerUp',
'hitHurt',
'jump',
'blipSelect',
'pushSound',
'random',
'birdSound'
];

/*
i like 9675111
*/
generateFromSeed = function(seed) {
  rng = new RNG((seed / 100) | 0);
  var generatorindex = seed % 100;
  var soundGenerator = generators[generatorindex % generators.length];
  seeded = true;
  var result = soundGenerator();
  result.seed = seed;
  seeded = false;
  return result;
};

function SoundEffect(length, sample_rate) {
  this._buffer = AUDIO_CONTEXT.createBuffer(1, length, sample_rate);
}

SoundEffect.prototype.getBuffer = function() {
  return this._buffer.getChannelData(0);
};


//unlock bullshit
function ULBS(){   
  if (AUDIO_CONTEXT.state === 'suspended')
  {
      var unlock = function()
      {
        AUDIO_CONTEXT.resume().then(function()
          {
            document.body.removeEventListener('touchstart', unlock);
            document.body.removeEventListener('touchend', unlock);
            document.body.removeEventListener('mousedown', unlock);
            document.body.removeEventListener('mouseup', unlock);
            document.body.removeEventListener('keydown', unlock);
            document.body.removeEventListener('keyup', unlock);
          });
      };

      document.body.addEventListener('touchstart', unlock, false);
      document.body.addEventListener('touchend', unlock, false);
      document.body.addEventListener('mousedown', unlock, false);
      document.body.addEventListener('mouseup', unlock, false);
      document.body.addEventListener('keydown', unlock, false);
      document.body.addEventListener('keyup', unlock, false);
  }
}

SoundEffect.prototype.play = function() {
  ULBS();

  var source = AUDIO_CONTEXT.createBufferSource();
  var filter1 = AUDIO_CONTEXT.createBiquadFilter();
  var filter2 = AUDIO_CONTEXT.createBiquadFilter();
  var filter3 = AUDIO_CONTEXT.createBiquadFilter();

  source.buffer = this._buffer;
  source.connect(filter1);

  filter1.frequency.value = 1600;
  filter2.frequency.value = 1600;
  filter3.frequency.value = 1600;

  filter1.connect(filter2);
  filter2.connect(filter3);
  filter3.connect(AUDIO_CONTEXT.destination);
  var t = AUDIO_CONTEXT.currentTime;
  if (typeof source.start != 'undefined') {
    source.start(t);
  } else {
    source.noteOn(t);
  }
  source.onended = function() {
    filter3.disconnect()
  }
};

SoundEffect.MIN_SAMPLE_RATE = 22050;

if (typeof AUDIO_CONTEXT == 'undefined') {
  SoundEffect = function SoundEffect(length, sample_rate) {
    this._sample_rate = sample_rate;
    this._buffer = new Array(length);
    this._audioElement = null;
  };

  SoundEffect.prototype.getBuffer = function() {
    this._audioElement = null;
    return this._buffer;
  };

  SoundEffect.prototype.play = function() {
    if (this._audioElement) {
      this._audioElement.cloneNode(false).play();
    } else {
      for (var i = 0; i < this._buffer.length; i++) {
        // bit_depth is always 8, rescale [-1.0, 1.0) to [0, 256)
        this._buffer[i] = 255 & Math.floor(128 * Math.max(0, Math.min(this._buffer[i] + 1, 2)));
      }
      var wav = MakeRiff(this._sample_rate, BIT_DEPTH, this._buffer);
      this._audioElement = new Audio();
      this._audioElement.src = wav.dataURI;
      this._audioElement.play();
    }
  };

  SoundEffect.MIN_SAMPLE_RATE = 1;
}

SoundEffect.generate = function(ps) {
/*  window.console.log(ps.wave_type + "\t" + ps.seed);

  var psstring="";
  for (var n in ps) {
    if (ps.hasOwnProperty(n)) {
      psstring = psstring +"result." + n+" = " + ps[n] + ";\n";
    }
  }
window.console.log(ps);
window.console.log(psstring);*/
  function repeat() {
    rep_time = 0;

    fperiod = 100.0 / (ps.p_base_freq * ps.p_base_freq + 0.001);
    period = Math.floor(fperiod);
    fmaxperiod = 100.0 / (ps.p_freq_limit * ps.p_freq_limit + 0.001);

    fslide = 1.0 - Math.pow(ps.p_freq_ramp, 3.0) * 0.01;
    fdslide = -Math.pow(ps.p_freq_dramp, 3.0) * 0.000001;

    square_duty = 0.5 - ps.p_duty * 0.5;
    square_slide = -ps.p_duty_ramp * 0.00005;

    if (ps.p_arp_mod >= 0.0)
      arp_mod = 1.0 - Math.pow(ps.p_arp_mod, 2.0) * 0.9;
    else
      arp_mod = 1.0 + Math.pow(ps.p_arp_mod, 2.0) * 10.0;
    arp_time = 0;
    arp_limit = Math.floor(Math.pow(1.0 - ps.p_arp_speed, 2.0) * 20000 + 32);
    if (ps.p_arp_speed == 1.0)
      arp_limit = 0;
  };

  var rep_time;
  var fperiod, period, fmaxperiod;
  var fslide, fdslide;
  var square_duty, square_slide;
  var arp_mod, arp_time, arp_limit;
  repeat();  // First time through, this is a bit of a misnomer

  // Filter
  var fltp = 0.0;
  var fltdp = 0.0;
  var fltw = Math.pow(ps.p_lpf_freq, 3.0) * 0.1;
  var fltw_d = 1.0 + ps.p_lpf_ramp * 0.0001;
  var fltdmp = 5.0 / (1.0 + Math.pow(ps.p_lpf_resonance, 2.0) * 20.0) *
    (0.01 + fltw);
  if (fltdmp > 0.8) fltdmp = 0.8;
  var fltphp = 0.0;
  var flthp = Math.pow(ps.p_hpf_freq, 2.0) * 0.1;
  var flthp_d = 1.0 + ps.p_hpf_ramp * 0.0003;

  // Vibrato
  var vib_phase = 0.0;
  var vib_speed = Math.pow(ps.p_vib_speed, 2.0) * 0.01;
  var vib_amp = ps.p_vib_strength * 0.5;

  // Envelope
  var env_vol = 0.0;
  var env_stage = 0;
  var env_time = 0;
  var env_length = [
    Math.floor(ps.p_env_attack * ps.p_env_attack * 100000.0),
    Math.floor(ps.p_env_sustain * ps.p_env_sustain * 100000.0),
    Math.floor(ps.p_env_decay * ps.p_env_decay * 100000.0)
  ];
  var env_total_length = env_length[0] + env_length[1] + env_length[2];

  // Phaser
  var phase = 0;
  var fphase = Math.pow(ps.p_pha_offset, 2.0) * 1020.0;
  if (ps.p_pha_offset < 0.0) fphase = -fphase;
  var fdphase = Math.pow(ps.p_pha_ramp, 2.0) * 1.0;
  if (ps.p_pha_ramp < 0.0) fdphase = -fdphase;
  var iphase = Math.abs(Math.floor(fphase));
  var ipp = 0;
  var phaser_buffer = [];
  for (var i = 0; i < 1024; ++i)
    phaser_buffer[i] = 0.0;

  // Noise
  var noise_buffer = [];
  for (var i = 0; i < 32; ++i)
    noise_buffer[i] = Math.random() * 2.0 - 1.0;

  // Repeat
  var rep_limit = Math.floor(Math.pow(1.0 - ps.p_repeat_speed, 2.0) * 20000
                             + 32);
  if (ps.p_repeat_speed == 0.0)
    rep_limit = 0;

  //var gain = 2.0 * Math.log(1 + (Math.E - 1) * ps.sound_vol);
  var gain = 2.0 * ps.sound_vol;
  var gain = Math.exp(ps.sound_vol) - 1;

  var num_clipped = 0;

  // ...end of initialization. Generate samples.

  var sample_sum = 0;
  var num_summed = 0;
  var summands = Math.floor(44100 / ps.sample_rate);

  var buffer_i = 0;
  var buffer_length = Math.ceil(env_total_length / summands);
  var buffer_complete = false;

  var sound;
  if (ps.sample_rate < SoundEffect.MIN_SAMPLE_RATE) {
    // Assume 4x gets close enough to MIN_SAMPLE_RATE
    sound = new SoundEffect(4 * buffer_length, SoundEffect.MIN_SAMPLE_RATE);
  } else {
    sound = new SoundEffect(buffer_length, ps.sample_rate)
  }
  var buffer = sound.getBuffer();

  for (var t = 0;; ++t) {

    // Repeats
    if (rep_limit != 0 && ++rep_time >= rep_limit)
      repeat();

    // Arpeggio (single)
    if (arp_limit != 0 && t >= arp_limit) {
      arp_limit = 0;
      fperiod *= arp_mod;
    }

    // Frequency slide, and frequency slide slide!
    fslide += fdslide;
    fperiod *= fslide;
    if (fperiod > fmaxperiod) {
      fperiod = fmaxperiod;
      if (ps.p_freq_limit > 0.0)
        buffer_complete = true;
    }

    // Vibrato
    var rfperiod = fperiod;
    if (vib_amp > 0.0) {
      vib_phase += vib_speed;
      rfperiod = fperiod * (1.0 + Math.sin(vib_phase) * vib_amp);
    }
    period = Math.floor(rfperiod);
    if (period < 8) period = 8;

    square_duty += square_slide;
    if (square_duty < 0.0) square_duty = 0.0;
    if (square_duty > 0.5) square_duty = 0.5;

    // Volume envelope
    env_time++;
    if (env_time > env_length[env_stage]) {
      env_time = 1;
      env_stage++;
      while (env_stage < 3 && env_length[env_stage] === 0)
	env_stage++;
      if (env_stage === 3)
        break;
    }
    if (env_stage === 0)
      env_vol = env_time / env_length[0];
    else if (env_stage === 1)
      env_vol = 1.0 + Math.pow(1.0 - env_time / env_length[1],
                               1.0) * 2.0 * ps.p_env_punch;
    else  // env_stage == 2
      env_vol = 1.0 - env_time / env_length[2];

    // Phaser step
    fphase += fdphase;
    iphase = Math.abs(Math.floor(fphase));
    if (iphase > 1023) iphase = 1023;

    if (flthp_d != 0.0) {
      flthp *= flthp_d;
      if (flthp < 0.00001)
        flthp = 0.00001;
      if (flthp > 0.1)
        flthp = 0.1;
    }

    // 8x supersampling
    var sample = 0.0;
    for (var si = 0; si < 8; ++si) {
      var sub_sample = 0.0;
      phase++;
      if (phase >= period) {
        phase %= period;
        if (ps.wave_type === NOISE)
          for (var i = 0; i < 32; ++i)
            noise_buffer[i] = Math.random() * 2.0 - 1.0;
      }

      // Base waveform
      var fp = phase / period;
      if (ps.wave_type === SQUARE) {
        if (fp < square_duty)
          sub_sample = 0.5;
        else
          sub_sample = -0.5;
      } else if (ps.wave_type === SAWTOOTH) {
        sub_sample = 1.0 - fp * 2;
      } else if (ps.wave_type === SINE) {
        sub_sample = Math.sin(fp * 2 * Math.PI);
      } else if (ps.wave_type === NOISE) {
        sub_sample = noise_buffer[Math.floor(phase * 32 / period)];
      } else if (ps.wave_type === TRIANGLE) {
        sub_sample = Math.abs(1 - fp * 2) - 1;
      } else if (ps.wave_type === BREAKER) {
        sub_sample = Math.abs(1 - fp * fp * 2) - 1;
      } else {
        throw new Exception('bad wave type! ' + ps.wave_type);
      }

      // Low-pass filter
      var pp = fltp;
      fltw *= fltw_d;
      if (fltw < 0.0) fltw = 0.0;
      if (fltw > 0.1) fltw = 0.1;
      if (ps.p_lpf_freq != 1.0) {
        fltdp += (sub_sample - fltp) * fltw;
        fltdp -= fltdp * fltdmp;
      } else {
        fltp = sub_sample;
        fltdp = 0.0;
      }
      fltp += fltdp;

      // High-pass filter
      fltphp += fltp - pp;
      fltphp -= fltphp * flthp;
      sub_sample = fltphp;

      // Phaser
      phaser_buffer[ipp & 1023] = sub_sample;
      sub_sample += phaser_buffer[(ipp - iphase + 1024) & 1023];
      ipp = (ipp + 1) & 1023;

      // final accumulation and envelope application
      sample += sub_sample * env_vol;
    }

    // Accumulate samples appropriately for sample rate
    sample_sum += sample;
    if (++num_summed >= summands) {
      num_summed = 0;
      sample = sample_sum / summands;
      sample_sum = 0;
    } else {
      continue;
    }

    sample = sample / 8 * masterVolume;
    sample *= gain;

    buffer[buffer_i++] = sample;

    if (ps.sample_rate < SoundEffect.MIN_SAMPLE_RATE) {
      buffer[buffer_i++] = sample;
      buffer[buffer_i++] = sample;
      buffer[buffer_i++] = sample;
    }
  }

  if (summands > 0) {
    sample = sample_sum / summands;

    sample = sample / 8 * masterVolume;
    sample *= gain;

    buffer[buffer_i++] = sample;

    if (ps.sample_rate < SoundEffect.MIN_SAMPLE_RATE) {
      buffer[buffer_i++] = sample;
      buffer[buffer_i++] = sample;
      buffer[buffer_i++] = sample;
    }
  }

  return sound;
};

if (typeof exports != 'undefined') {
  // For node.js
  var RIFFWAVE = require('./riffwave').RIFFWAVE;
  exports.Params = Params;
  exports.generate = generate;
}

var sfxCache = {};
var cachedSeeds = [];
var CACHE_MAX = 50;

function clearSFXCache() {
  sfxCache = {};
  cachedSeeds = [];
}

function cacheSeed(seed){
  if (seed in sfxCache) {
    return sfxCache[seed];
  }

  var params = generateFromSeed(seed);
  params.sound_vol = SOUND_VOL * (sfxSetting / 10);
  params.sample_rate = SAMPLE_RATE;
  params.bit_depth = BIT_DEPTH;

  var sound = SoundEffect.generate(params);
  sfxCache[seed] = sound;
  cachedSeeds.push(seed);

  while (cachedSeeds.length>CACHE_MAX) {
    var toRemove=cachedSeeds[0];
    cachedSeeds = cachedSeeds.slice(1);
    delete sfxCache[toRemove];
  }

  return sound;
}

function cacheQuietSeed(seed){
  if (seed in sfxCache) {
    return sfxCache[seed];
  }

  var params = generateFromSeed(seed);
  params.sound_vol = QUIET_SOUND_VOL * (sfxSetting / 10);
  params.sample_rate = SAMPLE_RATE;
  params.bit_depth = BIT_DEPTH;

  var sound = SoundEffect.generate(params);
  sfxCache[seed] = sound;
  cachedSeeds.push(seed);

  while (cachedSeeds.length>CACHE_MAX) {
    var toRemove=cachedSeeds[0];
    cachedSeeds = cachedSeeds.slice(1);
    delete sfxCache[toRemove];
  }

  return sound;
}

function cacheLoudSeed(seed){
  if (seed in sfxCache) {
    return sfxCache[seed];
  }

  var params = generateFromSeed(seed);
  params.sound_vol = 0.4 * (sfxSetting / 10);
  params.sample_rate = SAMPLE_RATE;
  params.bit_depth = BIT_DEPTH;

  var sound = SoundEffect.generate(params);
  sfxCache[seed] = sound;
  cachedSeeds.push(seed);

  while (cachedSeeds.length>CACHE_MAX) {
    var toRemove=cachedSeeds[0];
    cachedSeeds = cachedSeeds.slice(1);
    delete sfxCache[toRemove];
  }

  return sound;
}

function playSound(seed) {
  if (muted){
    return;
  }
  checkAudioContextExists();
  if (unitTesting) return;
  var sound = cacheSeed(seed);
  sound.play();
}

function playQuietSound(seed) {
  if (muted){
    return;
  }

  checkAudioContextExists();
  if (unitTesting) return;
  var sound = cacheQuietSeed(seed);
  sound.play();
}

function playLoudSound(seed) {
  if (muted){
    return;
  }

  checkAudioContextExists();
  if (unitTesting) return;
  var sound = cacheLoudSeed(seed);
  sound.play();
}

function killAudioButton(){
  var mb = document.getElementById("muteButton");
  var umb = document.getElementById("unMuteButton");
  if (mb){
    mb.remove();
    umb.remove();
  }
}

function showAudioButton(){
  var mb = document.getElementById("muteButton");
  var umb = document.getElementById("unMuteButton");
  if (mb){
    mb.style.display="block"; 
    umb.style.display="none";
  }
}


function toggleMute() {
  if (muted===0){
    muteAudio();
  } else {
    unMuteAudio();
  }
}

function muteAudio() {
  muted=1; 
  currentMusic.pause();
  tryDeactivateYoutube();
  var mb = document.getElementById("muteButton");
  var umb = document.getElementById("unMuteButton");
  if (mb){
    mb.style.display="none"; 
    umb.style.display="block";
  }
}
function unMuteAudio() {
  muted=0;
  currentMusic.play();
  tryActivateYoutube();
  var mb = document.getElementById("muteButton");
  var umb = document.getElementById("unMuteButton");
  if (mb){
    mb.style.display="block"; 
    umb.style.display="none";
  }
}




class NGIO{static get STATUS_INITIALIZED(){return"initialized"}static get STATUS_CHECKING_LOCAL_VERSION(){return"checking-local-version"}static get STATUS_LOCAL_VERSION_CHECKED(){return"local-version-checked"}static get STATUS_PRELOADING_ITEMS(){return"preloading-items"}static get STATUS_ITEMS_PRELOADED(){return"items-preloaded"}static get STATUS_READY(){return"ready"}static get STATUS_SESSION_UNINITIALIZED(){return NewgroundsIO.SessionState.SESSION_UNINITIALIZED}static get STATUS_WAITING_FOR_SERVER(){return NewgroundsIO.SessionState.WAITING_FOR_SERVER}static get STATUS_LOGIN_REQUIRED(){return NewgroundsIO.SessionState.LOGIN_REQUIRED}static get STATUS_WAITING_FOR_USER(){return NewgroundsIO.SessionState.WAITING_FOR_USER}static get STATUS_LOGIN_CANCELLED(){return NewgroundsIO.SessionState.LOGIN_CANCELLED}static get STATUS_LOGIN_SUCCESSFUL(){return NewgroundsIO.SessionState.LOGIN_SUCCESSFUL}static get STATUS_LOGIN_FAILED(){return NewgroundsIO.SessionState.LOGIN_FAILED}static get STATUS_USER_LOGGED_OUT(){return NewgroundsIO.SessionState.USER_LOGGED_OUT}static get STATUS_SERVER_UNAVAILABLE(){return NewgroundsIO.SessionState.SERVER_UNAVAILABLE}static get STATUS_EXCEEDED_MAX_ATTEMPTS(){return NewgroundsIO.SessionState.EXCEEDED_MAX_ATTEMPTS}static get isWaitingStatus(){return 0<=NewgroundsIO.SessionState.SESSION_WAITING.indexOf(this.#lastConnectionStatus)||0<=[this.STATUS_PRELOADING_ITEMS,this.LOCAL_VERSION_CHECKED,this.STATUS_CHECKING_LOCAL_VERSION].indexOf(this.#lastConnectionStatus)}static get PERIOD_TODAY(){return"D"}static get PERIOD_CURRENT_WEEK(){return"W"}static get PERIOD_CURRENT_MONTH(){return"M"}static get PERIOD_CURRENT_YEAR(){return"Y"}static get PERIOD_ALL_TIME(){return"A"}static get PERIODS(){return[NGIO.PERIOD_TODAY,NGIO.PERIOD_CURRENT_WEEK,NGIO.PERIOD_CURRENT_MONTH,NGIO.PERIOD_CURRENT_YEAR,NGIO.PERIOD_ALL_TIME]}static get ngioCore(){return this.#ngioCore}static#ngioCore=null;static get medalScore(){return this.#medalScore}static#medalScore=-1;static get medals(){return this.#medals}static#medals=null;static get scoreBoards(){return this.#scoreBoards}static#scoreBoards=null;static get saveSlots(){return this.#saveSlots}static#saveSlots=null;static get lastExecution(){return this.#lastExecution}static#lastExecution=new Date;static get lastConnectionStatus(){return this.#lastConnectionStatus}static#lastConnectionStatus=new Date;static get sessionError(){return this.#sessionError}static#sessionError=null;static get legalHost(){return this.#legalHost}static#legalHost=!0;static get isDeprecated(){return this.#isDeprecated}static#isDeprecated=!0;static get newestVersion(){return this.#newestVersion}static#newestVersion=!0;static get loginPageOpen(){return this.#loginPageOpen}static#loginPageOpen=!1;static get gatewayVersion(){return this.#gatewayVersion}static#gatewayVersion=!0;static get lastMedalUnlocked(){return this.#lastMedalUnlocked}static#lastMedalUnlocked=!0;static get lastBoardPosted(){return this.#lastBoardPosted}static#lastBoardPosted=!0;static get lastScorePosted(){return this.#lastScorePosted}static#lastScorePosted=!0;static get lastGetScoresResult(){return this.#lastGetScoresResult}static#lastGetScoresResult=!0;static get lastSaveSlotLoaded(){return this.#lastSaveSlotLoaded}static#lastSaveSlotLoaded=!0;static get lastSaveSlotSaved(){return this.#lastSaveSlotSaved}static#lastSaveSlotSaved=!0;static get lastDateTime(){return this.#lastDateTime}static#lastDateTime="0000-00-00";static get lastLoggedEvent(){return this.#lastLoggedEvent}static#lastLoggedEvent=null;static get lastTimeStamp(){return this.#lastTimeStamp}static#lastTimeStamp=0;static get lastPingSuccess(){return this.#lastPingSuccess}static#lastPingSuccess=!0;static get isInitialized(){return null!==this.ngioCore}static get session(){return this.isInitialized?this.ngioCore.session:null}static get user(){return null===this.session?null:this.ngioCore.session.user}static get hasSession(){return null!==this.session}static get hasUser(){return null!==this.user}static get isReady(){return this.#lastConnectionStatus===this.STATUS_READY}static get version(){return this.#version}static#version="0.0.0";static get debugMode(){return this.#debugMode}static#debugMode=!1;static#preloadFlags={autoLogNewView:!1,preloadMedals:!1,preloadScoreBoards:!1,preloadSaveSlots:!1};static#sessionReady=!1;static#skipLogin=!1;static#localVersionChecked=!1;static#checkingConnectionStatus=!1;static init(e,t,s){if(!this.isInitialized){if(this.#ngioCore=new NewgroundsIO.Core(e,t),this.#ngioCore.addEventListener("serverResponse",function(e){NGIO.#onServerResponse(e)}),s&&"object"==typeof s){"string"==typeof s.version&&(this.#version=s.version);var o=["debugMode","checkHostLicense","autoLogNewView","preloadMedals","preloadScoreBoards","preloadSaveSlots"];for(let e=0;e<o.length;e++)void 0!==s[o[e]]&&(this.#preloadFlags[o[e]]=!!s[o[e]])}this.#ngioCore.debug=this.debugMode,this.#lastConnectionStatus=this.STATUS_INITIALIZED,setTimeout(function(){NGIO.keepSessionAlive()},3e4)}}static skipLogin(){this.#sessionReady||(this.#skipLogin=!0)}static openLoginPage(){this.#loginPageOpen?console.warn("loginPageOpen is true. Use CancelLogin to reset."):(this.#skipLogin=!1,this.#sessionReady=!1,this.#loginPageOpen=!0,this.session.openLoginPage())}static cancelLogin(){this.session?(this.session.cancelLogin(NewgroundsIO.SessionState.SESSION_UNINITIALIZED),this.#resetConnectionStatus(),this.skipLogin()):console.error("NGIO Error - Can't cancel non-existent session")}static logOut(){this.session?this.session.logOut(function(){this.#resetConnectionStatus(),this.skipLogin()},this):console.error("NGIO Error - Can't cancel non-existent session")}static loadAuthorUrl(){this.ngioCore.loadComponent(this.ngioCore.getComponent("Loader.loadAuthorUrl"))}static loadOfficialUrl(){this.ngioCore.loadComponent(this.ngioCore.getComponent("Loader.loadOfficialUrl"))}static loadMoreGames(){this.ngioCore.loadComponent(this.ngioCore.getComponent("Loader.loadMoreGames"))}static loadNewgrounds(){this.ngioCore.loadComponent(this.ngioCore.getComponent("Loader.loadNewgrounds"))}static loadReferral(e){this.ngioCore.loadComponent(this.ngioCore.getComponent("Loader.loadReferral",{referral_name:e}))}static getMedal(t){if(null===this.medals)return console.error("NGIO Error: Can't use getMedal without setting preloadMedals option to true"),null;for(let e=0;e<this.medals.length;e++)if(this.medals[e].id===t)return this.medals[e]}static unlockMedal(e,t,s){if(null==this.medals)return console.error("unlockMedal called without any preloaded medals."),void("function"==typeof t&&(s?t.call(s,null):t(null)));let o=this.getMedal(e);if(null==o)return console.error("Medal #"+e+" does not exist."),void("function"==typeof t&&(s?t.call(s,null):t(null)));o.unlock(function(){"function"==typeof t&&(s?t.call(s,this.lastMedalUnlocked):t(this.lastMedalUnlocked))},this)}static getScoreBoard(t){if(null===this.scoreBoards)return console.error("NGIO Error: Can't use getScoreBoard without setting preloadScoreBoards option to true"),null;for(let e=0;e<this.scoreBoards.length;e++)if(this.scoreBoards[e].id===t)return this.scoreBoards[e]}static postScore(e,t,s,o,r){return"function"==typeof s?(r=o,o=s,s=""):void 0===s&&(s=""),null==this.scoreBoards?(console.error("NGIO Error - postScore called without any preloaded scoreboards."),void("function"==typeof o&&(r?o.call(r,null,null):o(null,null)))):null==(n=this.getScoreBoard(e))?(console.error("NGIO Error - ScoreBoard #"+e+" does not exist."),void("function"==typeof o&&(r?o.call(r,null,null):o(null,null)))):void n.postScore(t,s,function(){"function"==typeof o&&(r?o.call(r,this.lastBoardPosted,this.lastScorePosted):o(this.lastBoardPosted,this.lastScorePosted))},this);var n}static getScores(e,t,s,o){let r={period:void 0===t.period?NGIO.PERIOD_TODAY:t.period,tag:"string"!=typeof t.tag?"":t.tag,social:void 0!==t.social&&!!t.social,skip:"number"!=typeof t.skip?0:t.skip,limit:"number"!=typeof t.limit?10:t.limit};return null==this.scoreBoards?(console.error("NGIO Error - getScores called without any preloaded scoreboards."),void("function"==typeof s&&(o?s.call(o,null,null,r):s(null,null,r)))):null==(n=this.getScoreBoard(e))?(console.error("NGIO Error - ScoreBoard #"+e+" does not exist."),void("function"==typeof s&&(o?s.call(o,null,null,r):s(null,null,r)))):void n.getScores(r,function(){"function"==typeof s&&(o?s.call(o,n,this.lastGetScoresResult.scores,r):s(n,this.lastGetScoresResult.scores,r))},this);var n}static getSaveSlot(t){if(null===this.saveSlots)return console.error("NGIO Error: Can't use getSaveSlot without setting preloadSaveSlots option to true"),null;for(let e=0;e<this.saveSlots.length;e++)if(this.saveSlots[e].id===t)return this.saveSlots[e]}static getTotalSaveSlots(){let t=0;return this.saveSlots.forEach(e=>{e.hasData&&t++}),t}static getSaveSlotData(e,t,s){null===this.saveSlots&&(console.error("getSaveSlotData data called without any preloaded save slots."),s?t.call(s,null):t(null));let o=this.getSaveSlot(e);(this.#lastSaveSlotLoaded=o).getData(t,s)}static setSaveSlotData(e,t,s,o){return null==saveSlots?(console.error("setSaveSlotData data called without any preloaded save slots."),void("function"==typeof s&&(o?s(o,null):s(null)))):null==(r=this.getSaveSlot(e))?(console.error("Slot #"+e+" does not exist."),void("function"==typeof s&&(o?s(o,null):s(null)))):void r.SetData(t,function(){"function"==typeof s&&(o?s(o,this.lastSaveSlotSaved):s(this.lastSaveSlotSaved))},this);var r}static logEvent(e,t,s){this.ngioCore.executeComponent(this.ngioCore.getComponent("Event.logEvent",{event_name:e}),function(){"function"==typeof t&&(s?t(s,this.lastLoggedEvent):t(this.lastLoggedEvent))},this)}static getDateTime(e,t){this.ngioCore.executeComponent(this.ngioCore.getComponent("Gateway.getDatetime"),function(){"function"==typeof e&&(t?e(t,this.lastDateTime,this.lastTimeStamp):e(this.lastDateTime,this.lastTimeStamp))},this)}static keepSessionAlive(){this.hasUser&&3e4<=(new Date-this.#lastExecution).Seconds&&(this.#lastExecution=new Date,this.ngioCore.executeComponent(this.ngioCore.getComponent("Gateway.ping")))}static getConnectionStatus(e,t){this.#checkingConnectionStatus||null===this.#lastConnectionStatus||null==this.session||(this.#checkingConnectionStatus=!0,this.#lastConnectionStatus===this.STATUS_INITIALIZED?(this.#lastConnectionStatus=this.STATUS_CHECKING_LOCAL_VERSION,this.#reportConnectionStatus(e,t),this.#checkLocalVersion(e,t)):this.#sessionReady?this.#lastConnectionStatus===this.STATUS_LOGIN_SUCCESSFUL?(this.#lastConnectionStatus=this.STATUS_PRELOADING_ITEMS,this.#reportConnectionStatus(e,t),this.#PreloadItems(function(){this.#reportConnectionStatus(e,t),this.#skipLogin=!1},this)):this.#lastConnectionStatus===this.STATUS_ITEMS_PRELOADED?(this.#loginPageOpen=!1,this.#lastConnectionStatus=this.STATUS_READY,this.#reportConnectionStatus(e,t),this.#skipLogin=!1):this.keepSessionAlive():this.#skipLogin?this.#updateSessionHandler(e,t):this.#lastConnectionStatus!==this.STATUS_CHECKING_LOCAL_VERSION&&this.session.update(function(){this.#updateSessionHandler(e,t)},this),this.#checkingConnectionStatus=!1)}static#updateSessionHandler(e,t){(this.session.statusChanged||this.#skipLogin)&&(this.#lastConnectionStatus=this.session.status,this.session.status!=NewgroundsIO.SessionState.LOGIN_SUCCESSFUL&&!this.#skipLogin||(this.#lastConnectionStatus=NewgroundsIO.SessionState.LOGIN_SUCCESSFUL,this.#sessionReady=!0),this.#reportConnectionStatus(e,t)),this.#skipLogin=!1}static#reportConnectionStatus(e,t){t?e.call(t,this.#lastConnectionStatus):e(this.#lastConnectionStatus)}static#checkLocalVersion(e,t){if(this.#localVersionChecked)return this.#lastConnectionStatus=this.STATUS_LOCAL_VERSION_CHECKED,void this.#reportConnectionStatus(e,t);this.ngioCore.queueComponent(this.ngioCore.getComponent("App.getCurrentVersion",{version:this.#version})),this.ngioCore.queueComponent(this.ngioCore.getComponent("Gateway.getVersion")),this.#preloadFlags.autoLogNewView&&this.ngioCore.queueComponent(this.ngioCore.getComponent("App.logView")),this.#preloadFlags.checkHostLicense&&this.ngioCore.queueComponent(this.ngioCore.getComponent("App.getHostLicense")),this.ngioCore.executeQueue(function(){this.#lastConnectionStatus=this.STATUS_LOCAL_VERSION_CHECKED,this.#localVersionChecked=!0,this.#reportConnectionStatus(e,t),this.#isDeprecated&&console.warn("NGIO - Version mistmatch! Published version is: "+this.#newestVersion+", this version is: "+this.version),this.#legalHost||(console.warn("NGIO - This host has been blocked fom hosting this game!"),this.#sessionReady=!0,this.#lastConnectionStatus=this.STATUS_ITEMS_PRELOADED,this.#reportConnectionStatus(e,t))},this)}static#PreloadItems(){this.#preloadFlags.preloadMedals&&(this.ngioCore.queueComponent(this.ngioCore.getComponent("Medal.getMedalScore")),this.ngioCore.queueComponent(this.ngioCore.getComponent("Medal.getList"))),this.#preloadFlags.preloadScoreBoards&&this.ngioCore.queueComponent(this.ngioCore.getComponent("ScoreBoard.getBoards")),null!==this.user&&this.#preloadFlags.preloadSaveSlots&&this.ngioCore.queueComponent(this.ngioCore.getComponent("CloudSave.loadSlots")),this.ngioCore.hasQueue?this.ngioCore.executeQueue(function(){this.#lastConnectionStatus=this.STATUS_ITEMS_PRELOADED},this):this.#lastConnectionStatus=this.STATUS_ITEMS_PRELOADED}static#resetConnectionStatus(){this.#lastConnectionStatus=this.STATUS_INITIALIZED,this.#loginPageOpen=!1,this.#skipLogin=!1,this.#sessionReady=!1}static#replaceSaveSlot(s){if(this.#saveSlots){let t=this.#saveSlots.length;for(let e=0;e<this.#saveSlots.length;e++)if(this.#saveSlots[e].id===s.id){t=e;break}this.#saveSlots[t]=s.clone(t<this.#saveSlots.length?this.#saveSlots[t]:null)}}static#replaceScoreBoard(s){if(this.#scoreBoards){let t=this.#scoreBoards.length;for(let e=0;e<this.#scoreBoards.length;e++)if(this.#scoreBoards[e].id===s.id){t=e;break}this.#scoreBoards[t]=s.clone(t<this.#scoreBoards.length?this.#scoreBoards[t]:null)}}static#replaceMedal(s){if(this.#medals){let t=this.#medals.length;for(let e=0;e<this.#medals.length;e++)if(this.#medals[e].id===s.id){t=e;break}this.#medals[t]=s.clone(t<this.#medals.length?this.#medals[t]:null)}}static#onServerResponse(e){var t=e.detail;if(t&&t.success)if(this.#lastExecution=new Date,Array.isArray(t.result))for(let e=0;e<t.result.length;e++)t.result[e]&&this.#handleNewComponentResult(t.result[e]);else t.result&&this.#handleNewComponentResult(t.result)}static#handleNewComponentResult(t){switch(t.success||104===t.error.code||110===t.error.code||console.error(t.error.message+" \ncode("+t.error.code+")"),t.__object){case"App.getCurrentVersion":if(!t.success)return;this.#newestVersion=t.current_version,this.#isDeprecated=t.client_deprecated;break;case"App.getHostLicense":if(!t.success)return;this.#legalHost=t.host_approved;break;case"App.endSession":this.#resetConnectionStatus();break;case"App.checkSession":t.success||this.#resetConnectionStatus();case"App.startSession":if(!t.success){this.#resetConnectionStatus();break}t.session.clone(this.session);break;case"CloudSave.loadSlots":if(!t.success)return;this.#saveSlots=t.slots;break;case"CloudSave.loadSlot":if(!t.success)return;this.#replaceSaveSlot(t.slot);break;case"CloudSave.setData":if(!t.success)return void(this.#lastSaveSlotSaved=null);this.#replaceSaveSlot(t.slot);break;case"CloudSave.clearSlot":if(!t.success)return;this.#replaceSaveSlot(t.slot);break;case"Event.logEvent":if(!t.success)return void(this.#lastLoggedEvent=null);this.#lastLoggedEvent=t.event_name;break;case"Gateway.getDatetime":if(!t.success)return this.#lastTimeStamp=0,void(this.#lastDateTime="0000-00-00");this.#lastDateTime=t.datetime,this.#lastTimeStamp=t.timestamp;break;case"Gateway.getVersion":if(!t.success)return void(this.#gatewayVersion=null);this.#gatewayVersion=t.version;break;case"Gateway.ping":this.#lastPingSuccess=t.success;break;case"Medal.getList":if(!t.success)return;this.#medals=[];for(let e=0;e<t.medals.length;e++)this.#medals.push(t.medals[e].clone());break;case"Medal.unlock":if(!t.success)return void(this.#lastMedalUnlocked=null);this.#medals&&(this.#replaceMedal(t.medal),this.#lastMedalUnlocked=this.getMedal(t.medal.id)),this.#medalScore=t.medal_score,window.top.postMessage(JSON.stringify({ngioComponent:"Medal.unlock",id:t.medal.id}),"*");break;case"Medal.getMedalScore":if(!t.success)return;this.#medalScore=t.medal_score;break;case"ScoreBoard.getBoards":if(!t.success)return;this.#scoreBoards=[];for(let e=0;e<t.scoreboards.length;e++)this.#scoreBoards.push(t.scoreboards[e].clone());break;case"ScoreBoard.postScore":if(!t.success)return this.#lastScorePosted=null,void(this.#lastBoardPosted=null);this.#scoreBoards&&(this.#lastScorePosted=t.score,this.#lastBoardPosted=this.getScoreBoard(t.scoreboard.id)),window.top.postMessage(JSON.stringify({ngioComponent:"ScoreBoard.postScore",id:t.scoreboard.id}),"*");break;case"ScoreBoard.getScores":if(!t.success)return void(this.#lastGetScoresResult=null);this.#lastGetScoresResult=t}}}var CryptoJS=CryptoJS||function(a){function s(){}var e={},t=e.lib={},o=t.Base={extend:function(e){s.prototype=this;var t=new s;return e&&t.mixIn(e),t.hasOwnProperty("init")||(t.init=function(){t.$super.init.apply(this,arguments)}),(t.init.prototype=t).$super=this,t},create:function(){var e=this.extend();return e.init.apply(e,arguments),e},init:function(){},mixIn:function(e){for(var t in e)e.hasOwnProperty(t)&&(this[t]=e[t]);e.hasOwnProperty("toString")&&(this.toString=e.toString)},clone:function(){return this.init.prototype.extend(this)}},l=t.WordArray=o.extend({init:function(e,t){e=this.words=e||[],this.sigBytes=null!=t?t:4*e.length},toString:function(e){return(e||n).stringify(this)},concat:function(e){var t=this.words,s=e.words,o=this.sigBytes;if(e=e.sigBytes,this.clamp(),o%4)for(var r=0;r<e;r++)t[o+r>>>2]|=(s[r>>>2]>>>24-r%4*8&255)<<24-(o+r)%4*8;else if(65535<s.length)for(r=0;r<e;r+=4)t[o+r>>>2]=s[r>>>2];else t.push.apply(t,s);return this.sigBytes+=e,this},clamp:function(){var e=this.words,t=this.sigBytes;e[t>>>2]&=4294967295<<32-t%4*8,e.length=a.ceil(t/4)},clone:function(){var e=o.clone.call(this);return e.words=this.words.slice(0),e},random:function(e){for(var t=[],s=0;s<e;s+=4)t.push(4294967296*a.random()|0);return new l.init(t,e)}}),r=e.enc={},n=r.Hex={stringify:function(e){var t=e.words;e=e.sigBytes;for(var s=[],o=0;o<e;o++){var r=t[o>>>2]>>>24-o%4*8&255;s.push((r>>>4).toString(16)),s.push((15&r).toString(16))}return s.join("")},parse:function(e){for(var t=e.length,s=[],o=0;o<t;o+=2)s[o>>>3]|=parseInt(e.substr(o,2),16)<<24-o%8*4;return new l.init(s,t/2)}},i=r.Latin1={stringify:function(e){var t=e.words;e=e.sigBytes;for(var s=[],o=0;o<e;o++)s.push(String.fromCharCode(t[o>>>2]>>>24-o%4*8&255));return s.join("")},parse:function(e){for(var t=e.length,s=[],o=0;o<t;o++)s[o>>>2]|=(255&e.charCodeAt(o))<<24-o%4*8;return new l.init(s,t)}},u=r.Utf8={stringify:function(e){try{return decodeURIComponent(escape(i.stringify(e)))}catch(e){throw Error("Malformed UTF-8 data")}},parse:function(e){return i.parse(unescape(encodeURIComponent(e)))}},c=t.BufferedBlockAlgorithm=o.extend({reset:function(){this._data=new l.init,this._nDataBytes=0},_append:function(e){"string"==typeof e&&(e=u.parse(e)),this._data.concat(e),this._nDataBytes+=e.sigBytes},_process:function(e){var t=this._data,s=t.words,o=t.sigBytes,r=this.blockSize,n=o/(4*r),n=e?a.ceil(n):a.max((0|n)-this._minBufferSize,0),o=a.min(4*(e=n*r),o);if(e){for(var i=0;i<e;i+=r)this._doProcessBlock(s,i);i=s.splice(0,e),t.sigBytes-=o}return new l.init(i,o)},clone:function(){var e=o.clone.call(this);return e._data=this._data.clone(),e},_minBufferSize:0}),p=(t.Hasher=c.extend({cfg:o.extend(),init:function(e){this.cfg=this.cfg.extend(e),this.reset()},reset:function(){c.reset.call(this),this._doReset()},update:function(e){return this._append(e),this._process(),this},finalize:function(e){return e&&this._append(e),this._doFinalize()},blockSize:16,_createHelper:function(s){return function(e,t){return new s.init(t).finalize(e)}},_createHmacHelper:function(s){return function(e,t){return new p.HMAC.init(s,t).finalize(e)}}}),e.algo={});return e}(Math),NewgroundsIO=(!function(){var e=CryptoJS,l=e.lib.WordArray;e.enc.Base64={stringify:function(e){var t=e.words,s=e.sigBytes,o=this._map;e.clamp(),e=[];for(var r=0;r<s;r+=3)for(var n=(t[r>>>2]>>>24-r%4*8&255)<<16|(t[r+1>>>2]>>>24-(r+1)%4*8&255)<<8|t[r+2>>>2]>>>24-(r+2)%4*8&255,i=0;i<4&&r+.75*i<s;i++)e.push(o.charAt(n>>>6*(3-i)&63));if(t=o.charAt(64))for(;e.length%4;)e.push(t);return e.join("")},parse:function(e){var t=e.length,s=this._map;!(n=s.charAt(64))||-1!=(n=e.indexOf(n))&&(t=n);for(var o,r,n=[],i=0,a=0;a<t;a++)a%4&&(o=s.indexOf(e.charAt(a-1))<<a%4*2,r=s.indexOf(e.charAt(a))>>>6-a%4*2,n[i>>>2]|=(o|r)<<24-i%4*8,i++);return l.create(n,i)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}}(),!function(n){function b(e,t,s,o,r,n,i){return((e=e+(t&s|~t&o)+r+i)<<n|e>>>32-n)+t}function y(e,t,s,o,r,n,i){return((e=e+(t&o|s&~o)+r+i)<<n|e>>>32-n)+t}function v(e,t,s,o,r,n,i){return((e=e+(t^s^o)+r+i)<<n|e>>>32-n)+t}function C(e,t,s,o,r,n,i){return((e=e+(s^(t|~o))+r+i)<<n|e>>>32-n)+t}for(var e=CryptoJS,t=(o=e.lib).WordArray,s=o.Hasher,o=e.algo,E=[],r=0;r<64;r++)E[r]=4294967296*n.abs(n.sin(r+1))|0;o=o.MD5=s.extend({_doReset:function(){this._hash=new t.init([1732584193,4023233417,2562383102,271733878])},_doProcessBlock:function(e,t){for(var s=0;s<16;s++){var o=e[r=t+s];e[r]=16711935&(o<<8|o>>>24)|4278255360&(o<<24|o>>>8)}var s=this._hash.words,r=e[t+0],o=e[t+1],n=e[t+2],i=e[t+3],a=e[t+4],l=e[t+5],u=e[t+6],c=e[t+7],p=e[t+8],d=e[t+9],h=e[t+10],g=e[t+11],_=e[t+12],f=e[t+13],w=e[t+14],m=e[t+15],S=b(s[0],I=s[1],N=s[2],O=s[3],r,7,E[0]),O=b(O,S,I,N,o,12,E[1]),N=b(N,O,S,I,n,17,E[2]),I=b(I,N,O,S,i,22,E[3]),S=b(S,I,N,O,a,7,E[4]),O=b(O,S,I,N,l,12,E[5]),N=b(N,O,S,I,u,17,E[6]),I=b(I,N,O,S,c,22,E[7]),S=b(S,I,N,O,p,7,E[8]),O=b(O,S,I,N,d,12,E[9]),N=b(N,O,S,I,h,17,E[10]),I=b(I,N,O,S,g,22,E[11]),S=b(S,I,N,O,_,7,E[12]),O=b(O,S,I,N,f,12,E[13]),N=b(N,O,S,I,w,17,E[14]),S=y(S,I=b(I,N,O,S,m,22,E[15]),N,O,o,5,E[16]),O=y(O,S,I,N,u,9,E[17]),N=y(N,O,S,I,g,14,E[18]),I=y(I,N,O,S,r,20,E[19]),S=y(S,I,N,O,l,5,E[20]),O=y(O,S,I,N,h,9,E[21]),N=y(N,O,S,I,m,14,E[22]),I=y(I,N,O,S,a,20,E[23]),S=y(S,I,N,O,d,5,E[24]),O=y(O,S,I,N,w,9,E[25]),N=y(N,O,S,I,i,14,E[26]),I=y(I,N,O,S,p,20,E[27]),S=y(S,I,N,O,f,5,E[28]),O=y(O,S,I,N,n,9,E[29]),N=y(N,O,S,I,c,14,E[30]),S=v(S,I=y(I,N,O,S,_,20,E[31]),N,O,l,4,E[32]),O=v(O,S,I,N,p,11,E[33]),N=v(N,O,S,I,g,16,E[34]),I=v(I,N,O,S,w,23,E[35]),S=v(S,I,N,O,o,4,E[36]),O=v(O,S,I,N,a,11,E[37]),N=v(N,O,S,I,c,16,E[38]),I=v(I,N,O,S,h,23,E[39]),S=v(S,I,N,O,f,4,E[40]),O=v(O,S,I,N,r,11,E[41]),N=v(N,O,S,I,i,16,E[42]),I=v(I,N,O,S,u,23,E[43]),S=v(S,I,N,O,d,4,E[44]),O=v(O,S,I,N,_,11,E[45]),N=v(N,O,S,I,m,16,E[46]),S=C(S,I=v(I,N,O,S,n,23,E[47]),N,O,r,6,E[48]),O=C(O,S,I,N,c,10,E[49]),N=C(N,O,S,I,w,15,E[50]),I=C(I,N,O,S,l,21,E[51]),S=C(S,I,N,O,_,6,E[52]),O=C(O,S,I,N,i,10,E[53]),N=C(N,O,S,I,h,15,E[54]),I=C(I,N,O,S,o,21,E[55]),S=C(S,I,N,O,p,6,E[56]),O=C(O,S,I,N,m,10,E[57]),N=C(N,O,S,I,u,15,E[58]),I=C(I,N,O,S,f,21,E[59]),S=C(S,I,N,O,a,6,E[60]),O=C(O,S,I,N,g,10,E[61]),N=C(N,O,S,I,n,15,E[62]),I=C(I,N,O,S,d,21,E[63]);s[0]=s[0]+S|0,s[1]=s[1]+I|0,s[2]=s[2]+N|0,s[3]=s[3]+O|0},_doFinalize:function(){var e=this._data,t=e.words,s=8*this._nDataBytes,o=8*e.sigBytes,r=(t[o>>>5]|=128<<24-o%32,n.floor(s/4294967296));for(t[15+(64+o>>>9<<4)]=16711935&(r<<8|r>>>24)|4278255360&(r<<24|r>>>8),t[14+(64+o>>>9<<4)]=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),e.sigBytes=4*(t.length+1),this._process(),t=(e=this._hash).words,s=0;s<4;s++)o=t[s],t[s]=16711935&(o<<8|o>>>24)|4278255360&(o<<24|o>>>8);return e},clone:function(){var e=s.clone.call(this);return e._hash=this._hash.clone(),e}}),e.MD5=s._createHelper(o),e.HmacMD5=s._createHmacHelper(o)}(Math),!function(){var e=CryptoJS,t=e.lib,s=t.Base,u=t.WordArray,o=(t=e.algo).EvpKDF=s.extend({cfg:s.extend({keySize:4,hasher:t.MD5,iterations:1}),init:function(e){this.cfg=this.cfg.extend(e)},compute:function(e,t){for(var s=(i=this.cfg).hasher.create(),o=u.create(),r=o.words,n=i.keySize,i=i.iterations;r.length<n;){a&&s.update(a);var a=s.update(e).finalize(t);s.reset();for(var l=1;l<i;l++)a=s.finalize(a),s.reset();o.concat(a)}return o.sigBytes=4*n,o}});e.EvpKDF=function(e,t,s){return o.create(s).compute(e,t)}}(),CryptoJS.lib.Cipher||function(){function n(e,t,s){var o=this._iv;o?this._iv=void 0:o=this._prevBlock;for(var r=0;r<s;r++)e[t+r]^=o[r]}var e=(d=CryptoJS).lib,t=e.Base,i=e.WordArray,s=e.BufferedBlockAlgorithm,o=d.enc.Base64,r=d.algo.EvpKDF,a=e.Cipher=s.extend({cfg:t.extend(),createEncryptor:function(e,t){return this.create(this._ENC_XFORM_MODE,e,t)},createDecryptor:function(e,t){return this.create(this._DEC_XFORM_MODE,e,t)},init:function(e,t,s){this.cfg=this.cfg.extend(s),this._xformMode=e,this._key=t,this.reset()},reset:function(){s.reset.call(this),this._doReset()},process:function(e){return this._append(e),this._process()},finalize:function(e){return e&&this._append(e),this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(o){return{encrypt:function(e,t,s){return("string"==typeof t?h:p).encrypt(o,e,t,s)},decrypt:function(e,t,s){return("string"==typeof t?h:p).decrypt(o,e,t,s)}}}}),l=(e.StreamCipher=a.extend({_doFinalize:function(){return this._process(!0)},blockSize:1}),d.mode={}),u=(e.BlockCipherMode=t.extend({createEncryptor:function(e,t){return this.Encryptor.create(e,t)},createDecryptor:function(e,t){return this.Decryptor.create(e,t)},init:function(e,t){this._cipher=e,this._iv=t}})).extend(),c=(u.Encryptor=u.extend({processBlock:function(e,t){var s=this._cipher,o=s.blockSize;n.call(this,e,t,o),s.encryptBlock(e,t),this._prevBlock=e.slice(t,t+o)}}),u.Decryptor=u.extend({processBlock:function(e,t){var s=this._cipher,o=s.blockSize,r=e.slice(t,t+o);s.decryptBlock(e,t),n.call(this,e,t,o),this._prevBlock=r}}),l=l.CBC=u,u=(d.pad={}).Pkcs7={pad:function(e,t){for(var s=4*t,o=(s=s-e.sigBytes%s)<<24|s<<16|s<<8|s,r=[],n=0;n<s;n+=4)r.push(o);s=i.create(r,s),e.concat(s)},unpad:function(e){e.sigBytes-=255&e.words[e.sigBytes-1>>>2]}},e.BlockCipher=a.extend({cfg:a.cfg.extend({mode:l,padding:u}),reset:function(){a.reset.call(this);var e,t=(s=this.cfg).iv,s=s.mode;this._xformMode==this._ENC_XFORM_MODE?e=s.createEncryptor:(e=s.createDecryptor,this._minBufferSize=1),this._mode=e.call(s,this,t&&t.words)},_doProcessBlock:function(e,t){this._mode.processBlock(e,t)},_doFinalize:function(){var e,t=this.cfg.padding;return this._xformMode==this._ENC_XFORM_MODE?(t.pad(this._data,this.blockSize),e=this._process(!0)):(e=this._process(!0),t.unpad(e)),e},blockSize:4}),e.CipherParams=t.extend({init:function(e){this.mixIn(e)},toString:function(e){return(e||this.formatter).stringify(this)}})),l=(d.format={}).OpenSSL={stringify:function(e){var t=e.ciphertext;return((e=e.salt)?i.create([1398893684,1701076831]).concat(e).concat(t):t).toString(o)},parse:function(e){var t,s=(e=o.parse(e)).words;return 1398893684==s[0]&&1701076831==s[1]&&(t=i.create(s.slice(2,4)),s.splice(0,4),e.sigBytes-=16),c.create({ciphertext:e,salt:t})}},p=e.SerializableCipher=t.extend({cfg:t.extend({format:l}),encrypt:function(e,t,s,o){o=this.cfg.extend(o);var r=e.createEncryptor(s,o);return t=r.finalize(t),r=r.cfg,c.create({ciphertext:t,key:s,iv:r.iv,algorithm:e,mode:r.mode,padding:r.padding,blockSize:e.blockSize,formatter:o.format})},decrypt:function(e,t,s,o){return o=this.cfg.extend(o),t=this._parse(t,o.format),e.createDecryptor(s,o).finalize(t.ciphertext)},_parse:function(e,t){return"string"==typeof e?t.parse(e,this):e}}),d=(d.kdf={}).OpenSSL={execute:function(e,t,s,o){return o=o||i.random(8),e=r.create({keySize:t+s}).compute(e,o),s=i.create(e.words.slice(t),4*s),e.sigBytes=4*t,c.create({key:e,iv:s,salt:o})}},h=e.PasswordBasedCipher=p.extend({cfg:p.cfg.extend({kdf:d}),encrypt:function(e,t,s,o){return s=(o=this.cfg.extend(o)).kdf.execute(s,e.keySize,e.ivSize),o.iv=s.iv,(e=p.encrypt.call(this,e,t,s.key,o)).mixIn(s),e},decrypt:function(e,t,s,o){return o=this.cfg.extend(o),t=this._parse(t,o.format),s=o.kdf.execute(s,e.keySize,e.ivSize,t.salt),o.iv=s.iv,p.decrypt.call(this,e,t,s.key,o)}})}(),!function(){for(var e=CryptoJS,t=e.lib.BlockCipher,s=e.algo,i=[],o=[],r=[],n=[],a=[],l=[],u=[],c=[],p=[],d=[],h=[],g=0;g<256;g++)h[g]=g<128?g<<1:g<<1^283;for(var _=0,f=0,g=0;g<256;g++){var w=f^f<<1^f<<2^f<<3^f<<4,m=(i[_]=w=w>>>8^255&w^99,h[o[w]=_]),S=h[m],O=h[S],N=257*h[w]^16843008*w;r[_]=N<<24|N>>>8,n[_]=N<<16|N>>>16,a[_]=N<<8|N>>>24,l[_]=N,u[w]=(N=16843009*O^65537*S^257*m^16843008*_)<<24|N>>>8,c[w]=N<<16|N>>>16,p[w]=N<<8|N>>>24,d[w]=N,_?(_=m^h[h[h[O^m]]],f^=h[h[f]]):_=f=1}var I=[0,1,2,4,8,16,32,64,128,27,54],s=s.AES=t.extend({_doReset:function(){for(var e,t=(o=this._key).words,s=o.sigBytes/4,o=4*((this._nRounds=s+6)+1),r=this._keySchedule=[],n=0;n<o;n++)n<s?r[n]=t[n]:(e=r[n-1],n%s?6<s&&4==n%s&&(e=i[e>>>24]<<24|i[e>>>16&255]<<16|i[e>>>8&255]<<8|i[255&e]):(e=i[(e=e<<8|e>>>24)>>>24]<<24|i[e>>>16&255]<<16|i[e>>>8&255]<<8|i[255&e],e^=I[n/s|0]<<24),r[n]=r[n-s]^e);for(t=this._invKeySchedule=[],s=0;s<o;s++)n=o-s,e=s%4?r[n]:r[n-4],t[s]=s<4||n<=4?e:u[i[e>>>24]]^c[i[e>>>16&255]]^p[i[e>>>8&255]]^d[i[255&e]]},encryptBlock:function(e,t){this._doCryptBlock(e,t,this._keySchedule,r,n,a,l,i)},decryptBlock:function(e,t){var s=e[t+1];e[t+1]=e[t+3],e[t+3]=s,this._doCryptBlock(e,t,this._invKeySchedule,u,c,p,d,o),s=e[t+1],e[t+1]=e[t+3],e[t+3]=s},_doCryptBlock:function(e,t,s,o,r,n,i,a){for(var l=this._nRounds,u=e[t]^s[0],c=e[t+1]^s[1],p=e[t+2]^s[2],d=e[t+3]^s[3],h=4,g=1;g<l;g++)var _=o[u>>>24]^r[c>>>16&255]^n[p>>>8&255]^i[255&d]^s[h++],f=o[c>>>24]^r[p>>>16&255]^n[d>>>8&255]^i[255&u]^s[h++],w=o[p>>>24]^r[d>>>16&255]^n[u>>>8&255]^i[255&c]^s[h++],d=o[d>>>24]^r[u>>>16&255]^n[c>>>8&255]^i[255&p]^s[h++],u=_,c=f,p=w;_=(a[u>>>24]<<24|a[c>>>16&255]<<16|a[p>>>8&255]<<8|a[255&d])^s[h++],f=(a[c>>>24]<<24|a[p>>>16&255]<<16|a[d>>>8&255]<<8|a[255&u])^s[h++],w=(a[p>>>24]<<24|a[d>>>16&255]<<16|a[u>>>8&255]<<8|a[255&c])^s[h++],d=(a[d>>>24]<<24|a[u>>>16&255]<<16|a[c>>>8&255]<<8|a[255&p])^s[h++],e[t]=_,e[t+1]=f,e[t+2]=w,e[t+3]=d},keySize:8});e.AES=t._createHelper(s)}(),NewgroundsIO||{});NewgroundsIO.objects=NewgroundsIO.objects||{},NewgroundsIO.results=NewgroundsIO.results||{},NewgroundsIO.components=NewgroundsIO.components||{},(()=>{class e extends EventTarget{#GATEWAY_URI="https://www.newgrounds.io/gateway_v3.php";#debug=!1;#appID=null;#aesKey=null;#componentQueue=[];#host=null;#session=null;#uriParams={};get GATEWAY_URI(){return this.#GATEWAY_URI}get debug(){return this.#debug}set debug(e){this.#debug=!!e}get appID(){return this.#appID}get componentQueue(){return this.#componentQueue}get hasQueue(){return 0<this.#componentQueue.length}get host(){return this.#host}get session(){return this.#session}get user(){return this.#session?this.#session.user:null}get uriParams(){return this.#uriParams}constructor(e,t){if(super(),void 0===e)throw"Missing required appID!";if(void 0===t)throw"Missing required aesKey!";if(this.#appID=e,this.#aesKey=CryptoJS.enc.Base64.parse(t),this.#componentQueue=[],this.#uriParams={},window&&window.location&&window.location.href?window.location.hostname?this.#host=window.location.hostname.toLowerCase():"file:"==window.location.href.toLowerCase().substr(0,5)?this.#host="<LocalHost>":this.#host="<Unknown>":this.#host="<AppView>","undefined"!=typeof window&&window.location){e=window.location.href.split("?").pop();if(e)for(var s,o=e.split("&"),r=0;r<o.length;r++)s=o[r].split("="),this.#uriParams[s[0]]=s[1]}this.#session=this.getObject("Session"),this.#session._uri_id=this.getUriParam("ngio_session_id",null)}getUriParam(e,t){return void 0===this.#uriParams[e]?t:this.#uriParams[e]}encrypt(e){let t=CryptoJS.lib.WordArray.random(16);e=CryptoJS.AES.encrypt(e,this.#aesKey,{iv:t});return CryptoJS.enc.Base64.stringify(t.concat(e.ciphertext))}getObject(e,t){if(void 0===NewgroundsIO.objects[e])return console.error("NewgroundsIO - Invalid object name: "+e),null;e=new NewgroundsIO.objects[e](t);return e.setCore(this),e}getComponent(e,t){var s=e.split("."),o=!1;if(o=2===s.length&&void 0!==NewgroundsIO.components[s[0]]&&void 0!==NewgroundsIO.components[s[0]][s[1]]?o:"Invalid component name: "+e)return console.error("NewgroundsIO - "+o),null;e=new NewgroundsIO.components[s[0]][s[1]](t);return e.setCore(this),e}queueComponent(e){this._verifyComponent(e)&&(e.setCore(this),this.#componentQueue.push(e))}executeQueue(e,t){this.#componentQueue.length<1||(this.executeComponent(this.#componentQueue,e,t),this.#componentQueue=[])}executeComponent(o,e,s){if(Array.isArray(o)){let t=!0,s=this;if(o.forEach(e=>{e instanceof NewgroundsIO.BaseComponent||(s._verifyComponent(o)||(t=!1),e.setCore(s))}),!t)return}else{if(!this._verifyComponent(o))return;o.setCore(this)}let r=this;var t=this._getRequest(o),n=(new NewgroundsIO.objects.Response,new XMLHttpRequest),i=(n.onreadystatechange=function(){if(4==n.readyState){try{t=JSON.parse(n.responseText)}catch(e){(t={success:!1,app_id:r.app_id}).error={message:String(e),code:8002}}var t=r._populateResponse(t);r.dispatchEvent(new CustomEvent("serverResponse",{detail:t})),e&&(s?e.call(s,t):e(t))}},void 0!==Array.prototype.toJSON?Array.prototype.toJSON:null);i&&delete Array.prototype.toJSON;let a=new FormData;a.append("request",JSON.stringify(t)),i&&(Array.prototype.toJSON=i),n.open("POST",this.GATEWAY_URI,!0),n.send(a)}loadComponent(e){this._verifyComponent(e)&&(e.setCore(this),e=this._getRequest(e),e=this.GATEWAY_URI+"?request="+encodeURIComponent(JSON.stringify(e)),window.open(e,"_blank"))}onServerResponse(e){}_populateResponse(t){if(t.success)if(Array.isArray(t.result))for(let e=0;e<t.result.length;e++)t.result[e]=this._populateResult(t.result[e]);else t.result=this._populateResult(t.result);else t.result&&delete t.result,t.error&&(t.error=new NewgroundsIO.objects.Error(t.error));return(t=new NewgroundsIO.objects.Response(t)).setCore(this),t}_populateResult(e){var t=e.component.split(".");let s=NewgroundsIO.results[t[0]][t[1]];if(!s)return null;e.data.component=e.component;let o=new s;return o.fromJSON(e.data,this),o}_getExecute(e){var t=new NewgroundsIO.objects.Execute;return t.setComponent(e),t.setCore(this),t}_getRequest(e){let t,s=this,o=(Array.isArray(e)?(t=[],e.forEach(e=>{e=s._getExecute(e);t.push(e)})):t=this._getExecute(e),new NewgroundsIO.objects.Request({execute:t}));return this.debug&&(o.debug=!0),o.setCore(this),o}_verifyComponent(e){return e instanceof NewgroundsIO.BaseComponent?!!e.isValid():(console.error("NewgroundsIO Type Mismatch: Expecting a NewgroundsIO.components.XXXX instance, got",e),!1)}}NewgroundsIO.Core=e})(),(()=>{class e{get type(){return this.__type}__type="object";__object="BaseObject";__properties=[];__required=[];__ngioCore=null;isValid(){if(0===this.__required.length)return!0;let t=!0;return this.__required.forEach(function(e){null===this[e]?(console.error("NewgroundsIO Error: "+this.__object+" "+this.__type+" is invalid, missing value for '"+e+"'"),t=!1):this[e]instanceof NewgroundsIO.BaseObject&&(this[e].isValid()||(t=!1))},this),t}setCore(e){this._doSetCore(e,[])}objectMap={};arrayMap={};fromJSON(t,s){var e,o,r={};for(this.setCore(s),e=0;e<this.__properties.length;e++){var n=this.__properties[e];if(void 0!==t[n]&&null!==t[n]){if(r[n]=t[n],void 0!==this.arrayMap[n]&&Array.isArray(r[n]))for(r[n]=[],o=0;o<t[n].length;o++){let e=NewgroundsIO.objects[this.arrayMap[n]];r[n][o]=new e,r[n][o].fromJSON(t[n][o],s)}else if(void 0!==this.objectMap[n]){let e=NewgroundsIO.objects[this.objectMap[n]];r[n]=new e,r[n].fromJSON(t[n],s)}this[n]=r[n]}}}_doSetCore(t,s){Array.isArray(s)||(s=[]),t instanceof NewgroundsIO.Core?(this.__ngioCore=t,s.push(this),this.__properties.forEach(function(e){this[e]instanceof NewgroundsIO.BaseObject&&-1===s.indexOf(this[e])?this[e]._doSetCore(t,s):Array.isArray(this[e])&&this[e].forEach(e=>{e instanceof NewgroundsIO.BaseObject&&-1===s.indexOf(e)&&e._doSetCore(t,s)},this),"host"!==e||this.host||(this.host=t.host)},this)):console.error("NewgroundsIO Error: Expecting NewgroundsIO.Core instance, got",t)}toJSON(){return this.__doToJSON()}__doToJSON(){if(void 0===this.__properties)return{};let t={};return this.__properties.forEach(function(e){null!==this[e]&&(t[e]="function"==typeof this[e].toJSON?this[e].toJSON():this[e])},this),t}toSecureJSON(){return this.__ngioCore&&this.__ngioCore instanceof NewgroundsIO.Core?{secure:this.__ngioCore.encrypt(JSON.stringify(this.__doToJSON()))}:(console.error("NewgroundsIO Error: Unable to create secure JSON object without calling setCore() first."),this.__doToJSON())}toString(){return this.__type}clone(t){return void 0===t&&(t=new this.constructor),this.__properties.forEach(e=>{t[e]=this[e]}),t.__ngioCore=this.__ngioCore,t}}NewgroundsIO.BaseObject=e;NewgroundsIO.BaseComponent=class extends e{constructor(){super(),this.__type="component",this.__object="BaseComponent",this.__properties=["host","echo"],this._echo=null}get host(){return this.__ngioCore?this.__ngioCore.host:null}get echo(){return this._echo}set echo(e){this.echo=""+e}};NewgroundsIO.BaseResult=class extends e{constructor(){super(),this.__type="result",this.__object="BaseResult",this.__properties=["echo","error","success"],this._echo=null,this._error=null,this._success=null}get component(){return this.__object}get echo(){return this._echo}get error(){return this._error}set error(e){this._error=e}get success(){return!!this._success}set success(e){this._success=!!e}}})(),NewgroundsIO.SessionState={SESSION_UNINITIALIZED:"session-uninitialized",WAITING_FOR_SERVER:"waiting-for-server",LOGIN_REQUIRED:"login-required",WAITING_FOR_USER:"waiting-for-user",LOGIN_CANCELLED:"login-cancelled",LOGIN_SUCCESSFUL:"login-successful",LOGIN_FAILED:"login-failed",USER_LOGGED_OUT:"user-logged-out",SERVER_UNAVAILABLE:"server-unavailable",EXCEEDED_MAX_ATTEMPTS:"exceeded-max-attempts"},NewgroundsIO.SessionState.SESSION_WAITING=[NewgroundsIO.SessionState.SESSION_UNINITIALIZED,NewgroundsIO.SessionState.WAITING_FOR_SERVER,NewgroundsIO.SessionState.WAITING_FOR_USER,NewgroundsIO.SessionState.LOGIN_CANCELLED,NewgroundsIO.SessionStateLOGIN_FAILED],(()=>{class e extends NewgroundsIO.BaseComponent{constructor(){super();this.__object="App.checkSession",this.__requireSession=!0}}void 0===NewgroundsIO.components.App&&(NewgroundsIO.components.App={}),NewgroundsIO.components.App.checkSession=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(){super();this.__object="App.endSession",this.__requireSession=!0}}void 0===NewgroundsIO.components.App&&(NewgroundsIO.components.App={}),NewgroundsIO.components.App.endSession=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(e){super();let t=this;if(this.__object="App.getCurrentVersion",["version"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#version=null;get version(){return this.#version}set version(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#version=String(e)}}void 0===NewgroundsIO.components.App&&(NewgroundsIO.components.App={}),NewgroundsIO.components.App.getCurrentVersion=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(e){super();let t=this;if(this.__object="App.getHostLicense",["host"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}}void 0===NewgroundsIO.components.App&&(NewgroundsIO.components.App={}),NewgroundsIO.components.App.getHostLicense=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(e){super();let t=this;if(this.__object="App.logView",["host"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}}void 0===NewgroundsIO.components.App&&(NewgroundsIO.components.App={}),NewgroundsIO.components.App.logView=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(e){super();let t=this;if(this.__object="App.startSession",["force"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#force=null;get force(){return this.#force}set force(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#force=!!e}}void 0===NewgroundsIO.components.App&&(NewgroundsIO.components.App={}),NewgroundsIO.components.App.startSession=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(e){super();let t=this;if(this.__object="CloudSave.clearSlot",this.__requireSession=!0,["id"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#id=null;get id(){return this.#id}set id(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#id=Number(e),isNaN(this.#id)&&(this.#id=null)}}void 0===NewgroundsIO.components.CloudSave&&(NewgroundsIO.components.CloudSave={}),NewgroundsIO.components.CloudSave.clearSlot=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(e){super();let t=this;if(this.__object="CloudSave.loadSlot",this.__requireSession=!0,["id","app_id"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#id=null;get id(){return this.#id}set id(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#id=Number(e),isNaN(this.#id)&&(this.#id=null)}#app_id=null;get app_id(){return this.#app_id}set app_id(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#app_id=String(e)}}void 0===NewgroundsIO.components.CloudSave&&(NewgroundsIO.components.CloudSave={}),NewgroundsIO.components.CloudSave.loadSlot=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(e){super();let t=this;if(this.__object="CloudSave.loadSlots",this.__requireSession=!0,["app_id"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#app_id=null;get app_id(){return this.#app_id}set app_id(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#app_id=String(e)}}void 0===NewgroundsIO.components.CloudSave&&(NewgroundsIO.components.CloudSave={}),NewgroundsIO.components.CloudSave.loadSlots=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(e){super();let t=this;if(this.__object="CloudSave.setData",this.__requireSession=!0,["id","data"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#id=null;get id(){return this.#id}set id(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#id=Number(e),isNaN(this.#id)&&(this.#id=null)}#data=null;get data(){return this.#data}set data(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#data=String(e)}}void 0===NewgroundsIO.components.CloudSave&&(NewgroundsIO.components.CloudSave={}),NewgroundsIO.components.CloudSave.setData=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(e){super();let t=this;if(this.__object="Event.logEvent",["host","event_name"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#event_name=null;get event_name(){return this.#event_name}set event_name(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#event_name=String(e)}}void 0===NewgroundsIO.components.Event&&(NewgroundsIO.components.Event={}),NewgroundsIO.components.Event.logEvent=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(){super();this.__object="Gateway.getDatetime"}}void 0===NewgroundsIO.components.Gateway&&(NewgroundsIO.components.Gateway={}),NewgroundsIO.components.Gateway.getDatetime=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(){super();this.__object="Gateway.getVersion"}}void 0===NewgroundsIO.components.Gateway&&(NewgroundsIO.components.Gateway={}),NewgroundsIO.components.Gateway.getVersion=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(){super();this.__object="Gateway.ping"}}void 0===NewgroundsIO.components.Gateway&&(NewgroundsIO.components.Gateway={}),NewgroundsIO.components.Gateway.ping=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(e){super();let t=this;if(this.__object="Loader.loadAuthorUrl",["host","redirect","log_stat"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#redirect=null;get redirect(){return this.#redirect}set redirect(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#redirect=!!e}#log_stat=null;get log_stat(){return this.#log_stat}set log_stat(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#log_stat=!!e}}void 0===NewgroundsIO.components.Loader&&(NewgroundsIO.components.Loader={}),NewgroundsIO.components.Loader.loadAuthorUrl=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(e){super();let t=this;if(this.__object="Loader.loadMoreGames",["host","redirect","log_stat"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#redirect=null;get redirect(){return this.#redirect}set redirect(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#redirect=!!e}#log_stat=null;get log_stat(){return this.#log_stat}set log_stat(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#log_stat=!!e}}void 0===NewgroundsIO.components.Loader&&(NewgroundsIO.components.Loader={}),NewgroundsIO.components.Loader.loadMoreGames=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(e){super();let t=this;if(this.__object="Loader.loadNewgrounds",["host","redirect","log_stat"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#redirect=null;get redirect(){return this.#redirect}set redirect(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#redirect=!!e}#log_stat=null;get log_stat(){return this.#log_stat}set log_stat(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#log_stat=!!e}}void 0===NewgroundsIO.components.Loader&&(NewgroundsIO.components.Loader={}),NewgroundsIO.components.Loader.loadNewgrounds=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(e){super();let t=this;if(this.__object="Loader.loadOfficialUrl",["host","redirect","log_stat"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#redirect=null;get redirect(){return this.#redirect}set redirect(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#redirect=!!e}#log_stat=null;get log_stat(){return this.#log_stat}set log_stat(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#log_stat=!!e}}void 0===NewgroundsIO.components.Loader&&(NewgroundsIO.components.Loader={}),NewgroundsIO.components.Loader.loadOfficialUrl=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(e){super();let t=this;if(this.__object="Loader.loadReferral",["host","referral_name","redirect","log_stat"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#referral_name=null;get referral_name(){return this.#referral_name}set referral_name(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#referral_name=String(e)}#redirect=null;get redirect(){return this.#redirect}set redirect(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#redirect=!!e}#log_stat=null;get log_stat(){return this.#log_stat}set log_stat(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#log_stat=!!e}}void 0===NewgroundsIO.components.Loader&&(NewgroundsIO.components.Loader={}),NewgroundsIO.components.Loader.loadReferral=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(e){super();let t=this;if(this.__object="Medal.getList",["app_id"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#app_id=null;get app_id(){return this.#app_id}set app_id(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#app_id=String(e)}}void 0===NewgroundsIO.components.Medal&&(NewgroundsIO.components.Medal={}),NewgroundsIO.components.Medal.getList=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(){super();this.__object="Medal.getMedalScore",this.__requireSession=!0}}void 0===NewgroundsIO.components.Medal&&(NewgroundsIO.components.Medal={}),NewgroundsIO.components.Medal.getMedalScore=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(e){super();let t=this;if(this.__object="Medal.unlock",this.__isSecure=!0,this.__requireSession=!0,["id"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#id=null;get id(){return this.#id}set id(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#id=Number(e),isNaN(this.#id)&&(this.#id=null)}}void 0===NewgroundsIO.components.Medal&&(NewgroundsIO.components.Medal={}),NewgroundsIO.components.Medal.unlock=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(){super();this.__object="ScoreBoard.getBoards"}}void 0===NewgroundsIO.components.ScoreBoard&&(NewgroundsIO.components.ScoreBoard={}),NewgroundsIO.components.ScoreBoard.getBoards=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(e){super();let t=this;if(this.__object="ScoreBoard.getScores",["id","period","tag","social","user","skip","limit","app_id"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#id=null;get id(){return this.#id}set id(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#id=Number(e),isNaN(this.#id)&&(this.#id=null)}#period=null;get period(){return this.#period}set period(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#period=String(e)}#tag=null;get tag(){return this.#tag}set tag(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#tag=String(e)}#social=null;get social(){return this.#social}set social(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#social=!!e}#user=null;get user(){return this.#user}set user(e){this.#user=e}#skip=null;get skip(){return this.#skip}set skip(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#skip=Number(e),isNaN(this.#skip)&&(this.#skip=null)}#limit=null;get limit(){return this.#limit}set limit(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#limit=Number(e),isNaN(this.#limit)&&(this.#limit=null)}#app_id=null;get app_id(){return this.#app_id}set app_id(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#app_id=String(e)}}void 0===NewgroundsIO.components.ScoreBoard&&(NewgroundsIO.components.ScoreBoard={}),NewgroundsIO.components.ScoreBoard.getScores=e})(),(()=>{class e extends NewgroundsIO.BaseComponent{constructor(e){super();let t=this;if(this.__object="ScoreBoard.postScore",this.__isSecure=!0,this.__requireSession=!0,["id","value","tag"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#id=null;get id(){return this.#id}set id(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#id=Number(e),isNaN(this.#id)&&(this.#id=null)}#value=null;get value(){return this.#value}set value(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#value=Number(e),isNaN(this.#value)&&(this.#value=null)}#tag=null;get tag(){return this.#tag}set tag(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#tag=String(e)}}void 0===NewgroundsIO.components.ScoreBoard&&(NewgroundsIO.components.ScoreBoard={}),NewgroundsIO.components.ScoreBoard.postScore=e})(),(()=>{class e extends NewgroundsIO.BaseObject{constructor(e){super();let t=this;if(this.__object="Debug",["exec_time","request"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#exec_time=null;get exec_time(){return this.#exec_time}set exec_time(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#exec_time=String(e)}#request=null;get request(){return this.#request}set request(e){null===(e=e instanceof NewgroundsIO.objects.Request||"object"!=typeof e?e:new NewgroundsIO.objects.Request(e))||e instanceof NewgroundsIO.objects.Request||console.warn("Type Mismatch: expecting NewgroundsIO.objects.Request, got ",e),this.#request=e}objectMap={request:"Request"}}void 0===NewgroundsIO.objects&&(NewgroundsIO.objects={}),NewgroundsIO.objects.Debug=e})(),(()=>{class e extends NewgroundsIO.BaseObject{constructor(e){super();let t=this;if(this.__object="Error",["message","code"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#message=null;get message(){return this.#message}set message(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#message=String(e)}#code=null;get code(){return this.#code}set code(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#code=Number(e),isNaN(this.#code)&&(this.#code=null)}}void 0===NewgroundsIO.objects&&(NewgroundsIO.objects={}),NewgroundsIO.objects.Error=e})(),(()=>{class e extends NewgroundsIO.BaseObject{constructor(e){super();let t=this;if(this.__object="Execute",["component","parameters","secure"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#component=null;get component(){return this.#component}set component(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#component=String(e)}#parameters=null;get parameters(){return this.#parameters}set parameters(e){if(Array.isArray(e)){let s=[];return e.forEach(function(e,t){"object"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a object, got",e),s[t]=e}),void(this.#parameters=s)}"object"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a object, got",e),this.#parameters=e}#secure=null;get secure(){return this.#secure}set secure(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#secure=String(e)}#componentObject=null;setComponent(e){e instanceof NewgroundsIO.BaseComponent||console.error("NewgroundsIO Error: Expecting NewgroundsIO component, got "+typeof e),this.#componentObject=e,this.component=e.__object,this.parameters=e.toJSON()}isValid(){return this.component||console.error("NewgroundsIO Error: Missing required component!"),this.__ngioCore?!this.#componentObject||(this.#componentObject.__requireSession&&!this.__ngioCore.session.isActive()?(console.warn("NewgroundsIO Warning: "+this.component+" can only be used with a valid user session."),this.__ngioCore.session.logProblems(),!1):this.#componentObject instanceof NewgroundsIO.BaseComponent&&this.#componentObject.isValid()):(console.error("NewgroundsIO Error: Must call setCore() before validating!"),!1)}toJSON(){return this.#componentObject&&this.#componentObject.__isSecure?this.toSecureJSON():super.toJSON()}}void 0===NewgroundsIO.objects&&(NewgroundsIO.objects={}),NewgroundsIO.objects.Execute=e})(),(()=>{class e extends NewgroundsIO.BaseObject{constructor(e){super();let t=this;if(this.__object="Medal",["id","name","description","icon","value","difficulty","secret","unlocked"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#id=null;get id(){return this.#id}set id(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#id=Number(e),isNaN(this.#id)&&(this.#id=null)}#name=null;get name(){return this.#name}set name(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#name=String(e)}#description=null;get description(){return this.#description}set description(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#description=String(e)}#icon=null;get icon(){return this.#icon}set icon(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#icon=String(e)}#value=null;get value(){return this.#value}set value(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#value=Number(e),isNaN(this.#value)&&(this.#value=null)}#difficulty=null;get difficulty(){return this.#difficulty}set difficulty(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#difficulty=Number(e),isNaN(this.#difficulty)&&(this.#difficulty=null)}#secret=null;get secret(){return this.#secret}set secret(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#secret=!!e}#unlocked=null;get unlocked(){return this.#unlocked}set unlocked(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#unlocked=!!e}unlock(e,t){var s;this.__ngioCore?(s=this.__ngioCore.getComponent("Medal.unlock",{id:this.id}),this.__ngioCore.executeComponent(s,e,t)):console.error("NewgroundsIO - Can not unlock medal object without attaching a NewgroundsIO.Core instance.")}}void 0===NewgroundsIO.objects&&(NewgroundsIO.objects={}),NewgroundsIO.objects.Medal=e})(),(()=>{class e extends NewgroundsIO.BaseObject{constructor(e){super();let t=this;if(this.__object="Request",["app_id","execute","session_id","debug"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#execute=null;get execute(){return this.#execute}set execute(e){if(Array.isArray(e)||e instanceof NewgroundsIO.objects.Execute||"object"!=typeof e||(e=new NewgroundsIO.objects.Execute(e)),Array.isArray(e)){let s=[];return e.forEach(function(e,t){null===e||e instanceof NewgroundsIO.objects.Execute||console.warn("Type Mismatch: expecting NewgroundsIO.objects.Execute, got ",e),s[t]=e}),void(this.#execute=s)}null===e||e instanceof NewgroundsIO.objects.Execute||console.warn("Type Mismatch: expecting NewgroundsIO.objects.Execute, got ",e),this.#execute=e}#debug=null;get debug(){return this.#debug}set debug(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#debug=!!e}objectMap={execute:"Execute"};arrayMap={execute:"Execute"};get app_id(){return this.__ngioCore?this.__ngioCore.appID:null}get session_id(){return this.__ngioCore&&this.__ngioCore.session?this.__ngioCore.session.id:null}}void 0===NewgroundsIO.objects&&(NewgroundsIO.objects={}),NewgroundsIO.objects.Request=e})(),(()=>{class e extends NewgroundsIO.BaseObject{constructor(e){super();let t=this;if(this.__object="Response",["app_id","success","debug","result","error","api_version","help_url"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#app_id=null;get app_id(){return this.#app_id}set app_id(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#app_id=String(e)}#success=null;get success(){return this.#success}set success(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#success=!!e}#debug=null;get debug(){return this.#debug}set debug(e){null===(e=e instanceof NewgroundsIO.objects.Debug||"object"!=typeof e?e:new NewgroundsIO.objects.Debug(e))||e instanceof NewgroundsIO.objects.Debug||console.warn("Type Mismatch: expecting NewgroundsIO.objects.Debug, got ",e),this.#debug=e}#result=null;get result(){return this.#result}set result(e){if(Array.isArray(e)){let s=[];return e.forEach(function(e,t){e instanceof NewgroundsIO.BaseResult||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be a NewgroundsIO.results.XXXX instance, got",e),s[t]=e}),void(this.#result=s)}e instanceof NewgroundsIO.BaseResult||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be a NewgroundsIO.results.XXXX instance, got",e),this.#result=e}#error=null;get error(){return this.#error}set error(e){null===(e=e instanceof NewgroundsIO.objects.Error||"object"!=typeof e?e:new NewgroundsIO.objects.Error(e))||e instanceof NewgroundsIO.objects.Error||console.warn("Type Mismatch: expecting NewgroundsIO.objects.Error, got ",e),this.#error=e}#api_version=null;get api_version(){return this.#api_version}set api_version(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#api_version=String(e)}#help_url=null;get help_url(){return this.#help_url}set help_url(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#help_url=String(e)}objectMap={debug:"Debug",error:"Error"}}void 0===NewgroundsIO.objects&&(NewgroundsIO.objects={}),NewgroundsIO.objects.Response=e})(),(()=>{class e extends NewgroundsIO.BaseObject{constructor(e){super();let t=this;if(this.__object="SaveSlot",["id","size","datetime","timestamp","url"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#id=null;get id(){return this.#id}set id(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#id=Number(e),isNaN(this.#id)&&(this.#id=null)}#size=null;get size(){return this.#size}set size(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#size=Number(e),isNaN(this.#size)&&(this.#size=null)}#datetime=null;get datetime(){return this.#datetime}set datetime(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#datetime=String(e)}#timestamp=null;get timestamp(){return this.#timestamp}set timestamp(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#timestamp=Number(e),isNaN(this.#timestamp)&&(this.#timestamp=null)}#url=null;get url(){return this.#url}set url(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#url=String(e)}get hasData(){return null!==this.url}getData(e,t){var s;"function"!=typeof e?debug.error("NewgroundsIO - Missing required callback function"):((s=new XMLHttpRequest).onreadystatechange=function(){4==s.readyState&&(t?e.call(t,s.responseText):e(s.responseText))},s.open("GET",this.url,!0),s.send())}setData(e,t,s){this.__ngioCore?(e=this.__ngioCore.getComponent("CloudSave.setData",{id:this.id,data:e}),this.__ngioCore.executeComponent(e,t,s)):console.error("NewgroundsIO - Can not save data without attaching a NewgroundsIO.Core instance.")}clearData(e,t){var s;this.__ngioCore?(this.#url=null,s=this.__ngioCore.getComponent("CloudSave.clearSlot",{id:this.id}),this.__ngioCore.executeComponent(s,e,t)):console.error("NewgroundsIO - Can not clear data without attaching a NewgroundsIO.Core instance.")}getDate(){return this.hasData?new Date(this.datetime):null}}void 0===NewgroundsIO.objects&&(NewgroundsIO.objects={}),NewgroundsIO.objects.SaveSlot=e})(),(()=>{class e extends NewgroundsIO.BaseObject{constructor(e){super();let t=this;if(this.__object="Score",["user","value","formatted_value","tag"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#user=null;get user(){return this.#user}set user(e){null===(e=e instanceof NewgroundsIO.objects.User||"object"!=typeof e?e:new NewgroundsIO.objects.User(e))||e instanceof NewgroundsIO.objects.User||console.warn("Type Mismatch: expecting NewgroundsIO.objects.User, got ",e),this.#user=e}#value=null;get value(){return this.#value}set value(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#value=Number(e),isNaN(this.#value)&&(this.#value=null)}#formatted_value=null;get formatted_value(){return this.#formatted_value}set formatted_value(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#formatted_value=String(e)}#tag=null;get tag(){return this.#tag}set tag(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#tag=String(e)}objectMap={user:"User"}}void 0===NewgroundsIO.objects&&(NewgroundsIO.objects={}),NewgroundsIO.objects.Score=e})(),(()=>{class e extends NewgroundsIO.BaseObject{constructor(e){super();let t=this;if(this.__object="ScoreBoard",["id","name"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#id=null;get id(){return this.#id}set id(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#id=Number(e),isNaN(this.#id)&&(this.#id=null)}#name=null;get name(){return this.#name}set name(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#name=String(e)}getScores(e,t,s){this.__ngioCore?("function"==typeof e&&(s=t,t=e,e={}),(e=e||{}).id=this.id,e=this.__ngioCore.getComponent("ScoreBoard.getScores",e),this.__ngioCore.executeComponent(e,t,s)):console.error("NewgroundsIO - Can not get scores without attaching a NewgroundsIO.Core instance.")}postScore(e,t,s,o){this.__ngioCore?("function"==typeof t&&(o=s,s=t,t=null),e=this.__ngioCore.getComponent("ScoreBoard.postScore",{id:this.id,value:e,tag:t}),this.__ngioCore.executeComponent(e,s,o)):console.error("NewgroundsIO - Can not post scores without attaching a NewgroundsIO.Core instance.")}}void 0===NewgroundsIO.objects&&(NewgroundsIO.objects={}),NewgroundsIO.objects.ScoreBoard=e})(),(()=>{class e extends NewgroundsIO.BaseObject{constructor(e){super();let t=this;if(this.__object="Session",["id","user","expired","remember","passport_url"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#id=null;get id(){return this.#id}set id(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#id=String(e)}#user=null;get user(){return this.#user}set user(e){null===(e=e instanceof NewgroundsIO.objects.User||"object"!=typeof e?e:new NewgroundsIO.objects.User(e))||e instanceof NewgroundsIO.objects.User||console.warn("Type Mismatch: expecting NewgroundsIO.objects.User, got ",e),this.#user=e}#expired=null;get expired(){return this.#expired}set expired(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#expired=!!e}#remember=null;get remember(){return this.#remember}set remember(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#remember=!!e}#passport_url=null;get passport_url(){return this.#passport_url}set passport_url(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#passport_url=String(e)}objectMap={user:"User"};#status=NewgroundsIO.SessionState.SESSION_UNINITIALIZED;#lastStatus=null;#statusChanged=!1;#lastUpdate=new Date((new Date).getTime()-3e4);#canUpdate=!0;#mode="expired";#totalAttempts=0;#maxAttempts=5;#uri_id=null;#saved_id=null;get status(){return this.#status}get statusChanged(){return this.#statusChanged}get waiting(){return this.#lastStatus!=this.status}get storageKey(){return this.__ngioCore?"_ngio_"+this.__ngioCore.appID+"_session_":null}resetSession(){this.#uri_id=null,this.#saved_id=null,this.remember=!1,this.user=null,this.expired=!1,localStorage.setItem(this.storageKey,null)}openLoginPage(){this.passport_url?(this.#status=NewgroundsIO.SessionState.WAITING_FOR_USER,this.mode="check",window.open(this.passport_url,"_blank")):console.warn("Can't open passport without getting a valis session first.")}logOut(e,t){this.mode="wait",this.endSession(e,t)}cancelLogin(e){this.endSession(),void 0===e&&(e=NewgroundsIO.SessionState.LOGIN_CANCELLED),this.resetSession(),this.id=null,this.#status=e,this.#totalAttempts=0,this.#mode="new",this.#lastUpdate=new Date((new Date).getTime()-3e4)}update(e,t){if(this.#statusChanged=!1,this.#lastStatus!=this.status&&(this.#statusChanged=!0,this.#lastStatus=this.status,"function"==typeof e&&(t?e.call(t,this):e(this))),this.#canUpdate&&"wait"!=this.mode){if(!this.__ngioCore)return console.error("NewgroundsIO - Can't update session without attaching a NewgroundsIO.Core instance."),void(this.#canUpdate=!1);this.status==NewgroundsIO.SessionState.SERVER_UNAVAILABLE&&(this.#totalAttempts>=this.#maxAttempts?this.#status=NewgroundsIO.SessionState.EXCEEDED_MAX_ATTEMPTS:(this.#status=NewgroundsIO.SessionState.SESSION_UNINITIALIZED,this.#totalAttempts++)),this.status==NewgroundsIO.SessionState.SESSION_UNINITIALIZED&&(this.#saved_id=localStorage.getItem(this.storageKey),this.#uri_id?this.id=this.#uri_id:this.#saved_id&&(this.id=this.#saved_id),this.mode=this.id&&"null"!==this.id?"check":"new");t=new Date,e=t-this.#lastUpdate;if(!(e<5e3))switch(this.#lastUpdate=t,this.mode){case"new":this.mode="wait",this.startSession();break;case"check":this.mode="wait",this.checkSession()}}}startSession(){this.#canUpdate=!1,this.resetSession(),this.#status=NewgroundsIO.SessionState.WAITING_FOR_SERVER;var e=this.__ngioCore.getComponent("App.startSession");this.__ngioCore.executeComponent(e,this._onStartSession,this)}_onStartSession(e){if(!0===e.success){let t=e.result;if(Array.isArray(t))for(let e=0;e<t.length;e++)if(t[e]&&t[e].__object&&"App.startSession"==t[e].__object){t=t[e];break}this.id=t.session.id,this.passport_url=t.session.passport_url,this.#status=NewgroundsIO.SessionState.LOGIN_REQUIRED,this.mode="wait"}else this.#status=NewgroundsIO.SessionState.SERVER_UNAVAILABLE;this.#canUpdate=!0}checkSession(){this.#canUpdate=!1;var e=this.__ngioCore.getComponent("App.checkSession");this.__ngioCore.executeComponent(e,this._onCheckSession,this)}_onCheckSession(e){!0===e.success?e.result.success?e.result.session.expired?(this.resetSession(),this.id=null,this.#status=NewgroundsIO.SessionState.SESSION_UNINITIALIZED):null!==e.result.session.user?(this.user=e.result.session.user,this.#status=NewgroundsIO.SessionState.LOGIN_SUCCESSFUL,this.mode="valid",e.result.session.remember&&(this.#saved_id=this.id,this.remember=!0,localStorage.setItem(this.storageKey,this.id))):this.mode="check":(this.id=null,this.cancelLogin(111===e.result.error.code?NewgroundsIO.SessionState.LOGIN_CANCELLED:NewgroundsIO.SessionState.LOGIN_FAILED)):this.#status=NewgroundsIO.SessionState.SERVER_UNAVAILABLE,this.#canUpdate=!0}endSession(t,s){this.#canUpdate=!1;var e=this.__ngioCore.getComponent("App.endSession"),o=this.__ngioCore.getComponent("App.startSession");this.__ngioCore.queueComponent(e),this.__ngioCore.queueComponent(o),this.__ngioCore.executeQueue(function(e){this._onEndSession(e),this._onStartSession(e),"function"==typeof t&&(s?t.call(s,this):t(this))},this)}_onEndSession(e){this.resetSession(),this.id=null,this.user=null,this.passport_url=null,this.mode="new",this.#status=NewgroundsIO.SessionState.USER_LOGGED_OUT,this.#canUpdate=!0}}void 0===NewgroundsIO.objects&&(NewgroundsIO.objects={}),NewgroundsIO.objects.Session=e})(),(()=>{class e extends NewgroundsIO.BaseObject{constructor(e){super();let t=this;if(this.__object="User",["id","name","icons","supporter"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#id=null;get id(){return this.#id}set id(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#id=Number(e),isNaN(this.#id)&&(this.#id=null)}#name=null;get name(){return this.#name}set name(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#name=String(e)}#icons=null;get icons(){return this.#icons}set icons(e){null===(e=e instanceof NewgroundsIO.objects.UserIcons||"object"!=typeof e?e:new NewgroundsIO.objects.UserIcons(e))||e instanceof NewgroundsIO.objects.UserIcons||console.warn("Type Mismatch: expecting NewgroundsIO.objects.UserIcons, got ",e),this.#icons=e}#supporter=null;get supporter(){return this.#supporter}set supporter(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#supporter=!!e}objectMap={icons:"UserIcons"}}void 0===NewgroundsIO.objects&&(NewgroundsIO.objects={}),NewgroundsIO.objects.User=e})(),(()=>{class e extends NewgroundsIO.BaseObject{constructor(e){super();let t=this;if(this.__object="UserIcons",["small","medium","large"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#small=null;get small(){return this.#small}set small(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#small=String(e)}#medium=null;get medium(){return this.#medium}set medium(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#medium=String(e)}#large=null;get large(){return this.#large}set large(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#large=String(e)}}void 0===NewgroundsIO.objects&&(NewgroundsIO.objects={}),NewgroundsIO.objects.UserIcons=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="App.checkSession",["session"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#session=null;get session(){return this.#session}set session(e){null===(e=e instanceof NewgroundsIO.objects.Session||"object"!=typeof e?e:new NewgroundsIO.objects.Session(e))||e instanceof NewgroundsIO.objects.Session||console.warn("Type Mismatch: expecting NewgroundsIO.objects.Session, got ",e),this.#session=e}objectMap={session:"Session"}}void 0===NewgroundsIO.results.App&&(NewgroundsIO.results.App={}),NewgroundsIO.results.App.checkSession=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="App.getCurrentVersion",["current_version","client_deprecated"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#current_version=null;get current_version(){return this.#current_version}set current_version(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#current_version=String(e)}#client_deprecated=null;get client_deprecated(){return this.#client_deprecated}set client_deprecated(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#client_deprecated=!!e}}void 0===NewgroundsIO.results.App&&(NewgroundsIO.results.App={}),NewgroundsIO.results.App.getCurrentVersion=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="App.getHostLicense",["host_approved"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#host_approved=null;get host_approved(){return this.#host_approved}set host_approved(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#host_approved=!!e}}void 0===NewgroundsIO.results.App&&(NewgroundsIO.results.App={}),NewgroundsIO.results.App.getHostLicense=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="App.startSession",["session"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#session=null;get session(){return this.#session}set session(e){null===(e=e instanceof NewgroundsIO.objects.Session||"object"!=typeof e?e:new NewgroundsIO.objects.Session(e))||e instanceof NewgroundsIO.objects.Session||console.warn("Type Mismatch: expecting NewgroundsIO.objects.Session, got ",e),this.#session=e}objectMap={session:"Session"}}void 0===NewgroundsIO.results.App&&(NewgroundsIO.results.App={}),NewgroundsIO.results.App.startSession=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="CloudSave.clearSlot",["slot"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#slot=null;get slot(){return this.#slot}set slot(e){null===(e=e instanceof NewgroundsIO.objects.SaveSlot||"object"!=typeof e?e:new NewgroundsIO.objects.SaveSlot(e))||e instanceof NewgroundsIO.objects.SaveSlot||console.warn("Type Mismatch: expecting NewgroundsIO.objects.SaveSlot, got ",e),this.#slot=e}objectMap={slot:"SaveSlot"}}void 0===NewgroundsIO.results.CloudSave&&(NewgroundsIO.results.CloudSave={}),NewgroundsIO.results.CloudSave.clearSlot=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="CloudSave.loadSlot",["slot","app_id"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#slot=null;get slot(){return this.#slot}set slot(e){null===(e=e instanceof NewgroundsIO.objects.SaveSlot||"object"!=typeof e?e:new NewgroundsIO.objects.SaveSlot(e))||e instanceof NewgroundsIO.objects.SaveSlot||console.warn("Type Mismatch: expecting NewgroundsIO.objects.SaveSlot, got ",e),this.#slot=e}#app_id=null;get app_id(){return this.#app_id}set app_id(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#app_id=String(e)}objectMap={slot:"SaveSlot"}}void 0===NewgroundsIO.results.CloudSave&&(NewgroundsIO.results.CloudSave={}),NewgroundsIO.results.CloudSave.loadSlot=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="CloudSave.loadSlots",["slots","app_id"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#slots=null;get slots(){return this.#slots}set slots(e){if(Array.isArray(e)){let s=[];e.forEach(function(e,t){null===e||e instanceof NewgroundsIO.objects.SaveSlot||console.warn("Type Mismatch: expecting NewgroundsIO.objects.SaveSlot, got ",e),s[t]=e}),this.#slots=s}}#app_id=null;get app_id(){return this.#app_id}set app_id(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#app_id=String(e)}arrayMap={slots:"SaveSlot"}}void 0===NewgroundsIO.results.CloudSave&&(NewgroundsIO.results.CloudSave={}),NewgroundsIO.results.CloudSave.loadSlots=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="CloudSave.setData",["slot"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#slot=null;get slot(){return this.#slot}set slot(e){null===(e=e instanceof NewgroundsIO.objects.SaveSlot||"object"!=typeof e?e:new NewgroundsIO.objects.SaveSlot(e))||e instanceof NewgroundsIO.objects.SaveSlot||console.warn("Type Mismatch: expecting NewgroundsIO.objects.SaveSlot, got ",e),this.#slot=e}objectMap={slot:"SaveSlot"}}void 0===NewgroundsIO.results.CloudSave&&(NewgroundsIO.results.CloudSave={}),NewgroundsIO.results.CloudSave.setData=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="Event.logEvent",["event_name"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#event_name=null;get event_name(){return this.#event_name}set event_name(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#event_name=String(e)}}void 0===NewgroundsIO.results.Event&&(NewgroundsIO.results.Event={}),NewgroundsIO.results.Event.logEvent=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="Gateway.getDatetime",["datetime","timestamp"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#datetime=null;get datetime(){return this.#datetime}set datetime(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#datetime=String(e)}#timestamp=null;get timestamp(){return this.#timestamp}set timestamp(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#timestamp=Number(e),isNaN(this.#timestamp)&&(this.#timestamp=null)}}void 0===NewgroundsIO.results.Gateway&&(NewgroundsIO.results.Gateway={}),NewgroundsIO.results.Gateway.getDatetime=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="Gateway.getVersion",["version"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#version=null;get version(){return this.#version}set version(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#version=String(e)}}void 0===NewgroundsIO.results.Gateway&&(NewgroundsIO.results.Gateway={}),NewgroundsIO.results.Gateway.getVersion=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="Gateway.ping",["pong"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#pong=null;get pong(){return this.#pong}set pong(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#pong=String(e)}}void 0===NewgroundsIO.results.Gateway&&(NewgroundsIO.results.Gateway={}),NewgroundsIO.results.Gateway.ping=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="Loader.loadAuthorUrl",["url"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#url=null;get url(){return this.#url}set url(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#url=String(e)}}void 0===NewgroundsIO.results.Loader&&(NewgroundsIO.results.Loader={}),NewgroundsIO.results.Loader.loadAuthorUrl=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="Loader.loadMoreGames",["url"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#url=null;get url(){return this.#url}set url(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#url=String(e)}}void 0===NewgroundsIO.results.Loader&&(NewgroundsIO.results.Loader={}),NewgroundsIO.results.Loader.loadMoreGames=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="Loader.loadNewgrounds",["url"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#url=null;get url(){return this.#url}set url(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#url=String(e)}}void 0===NewgroundsIO.results.Loader&&(NewgroundsIO.results.Loader={}),NewgroundsIO.results.Loader.loadNewgrounds=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="Loader.loadOfficialUrl",["url"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#url=null;get url(){return this.#url}set url(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#url=String(e)}}void 0===NewgroundsIO.results.Loader&&(NewgroundsIO.results.Loader={}),NewgroundsIO.results.Loader.loadOfficialUrl=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="Loader.loadReferral",["url"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#url=null;get url(){return this.#url}set url(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#url=String(e)}}void 0===NewgroundsIO.results.Loader&&(NewgroundsIO.results.Loader={}),NewgroundsIO.results.Loader.loadReferral=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="Medal.getList",["medals","app_id"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#medals=null;get medals(){return this.#medals}set medals(e){if(Array.isArray(e)){let s=[];e.forEach(function(e,t){null===e||e instanceof NewgroundsIO.objects.Medal||console.warn("Type Mismatch: expecting NewgroundsIO.objects.Medal, got ",e),s[t]=e}),this.#medals=s}}#app_id=null;get app_id(){return this.#app_id}set app_id(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#app_id=String(e)}arrayMap={medals:"Medal"}}void 0===NewgroundsIO.results.Medal&&(NewgroundsIO.results.Medal={}),NewgroundsIO.results.Medal.getList=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="Medal.getMedalScore",["medal_score"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#medal_score=null;get medal_score(){return this.#medal_score}set medal_score(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#medal_score=Number(e),isNaN(this.#medal_score)&&(this.#medal_score=null)}}void 0===NewgroundsIO.results.Medal&&(NewgroundsIO.results.Medal={}),NewgroundsIO.results.Medal.getMedalScore=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="Medal.unlock",["medal","medal_score"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#medal=null;get medal(){return this.#medal}set medal(e){null===(e=e instanceof NewgroundsIO.objects.Medal||"object"!=typeof e?e:new NewgroundsIO.objects.Medal(e))||e instanceof NewgroundsIO.objects.Medal||console.warn("Type Mismatch: expecting NewgroundsIO.objects.Medal, got ",e),this.#medal=e}#medal_score=null;get medal_score(){return this.#medal_score}set medal_score(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#medal_score=Number(e),isNaN(this.#medal_score)&&(this.#medal_score=null)}objectMap={medal:"Medal"}}void 0===NewgroundsIO.results.Medal&&(NewgroundsIO.results.Medal={}),NewgroundsIO.results.Medal.unlock=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="ScoreBoard.getBoards",["scoreboards"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#scoreboards=null;get scoreboards(){return this.#scoreboards}set scoreboards(e){if(Array.isArray(e)){let s=[];e.forEach(function(e,t){null===e||e instanceof NewgroundsIO.objects.ScoreBoard||console.warn("Type Mismatch: expecting NewgroundsIO.objects.ScoreBoard, got ",e),s[t]=e}),this.#scoreboards=s}}arrayMap={scoreboards:"ScoreBoard"}}void 0===NewgroundsIO.results.ScoreBoard&&(NewgroundsIO.results.ScoreBoard={}),NewgroundsIO.results.ScoreBoard.getBoards=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="ScoreBoard.getScores",["period","social","limit","scoreboard","scores","user","app_id"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#period=null;get period(){return this.#period}set period(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#period=String(e)}#social=null;get social(){return this.#social}set social(e){"boolean"!=typeof e&&"number"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a boolean, got",e),this.#social=!!e}#limit=null;get limit(){return this.#limit}set limit(e){"number"!=typeof e&&null!==e?console.warn("NewgroundsIO Type Mismatch: Value should be a number, got",e):Number.isInteger(e)||null===e||console.warn("NewgroundsIO Type Mismatch: Value should be an integer, got a float"),this.#limit=Number(e),isNaN(this.#limit)&&(this.#limit=null)}#scoreboard=null;get scoreboard(){return this.#scoreboard}set scoreboard(e){null===(e=e instanceof NewgroundsIO.objects.ScoreBoard||"object"!=typeof e?e:new NewgroundsIO.objects.ScoreBoard(e))||e instanceof NewgroundsIO.objects.ScoreBoard||console.warn("Type Mismatch: expecting NewgroundsIO.objects.ScoreBoard, got ",e),this.#scoreboard=e}#scores=null;get scores(){return this.#scores}set scores(e){if(Array.isArray(e)){let s=[];e.forEach(function(e,t){null===e||e instanceof NewgroundsIO.objects.Score||console.warn("Type Mismatch: expecting NewgroundsIO.objects.Score, got ",e),s[t]=e}),this.#scores=s}}#user=null;get user(){return this.#user}set user(e){null===(e=e instanceof NewgroundsIO.objects.User||"object"!=typeof e?e:new NewgroundsIO.objects.User(e))||e instanceof NewgroundsIO.objects.User||console.warn("Type Mismatch: expecting NewgroundsIO.objects.User, got ",e),this.#user=e}#app_id=null;get app_id(){return this.#app_id}set app_id(e){"string"!=typeof e&&null!==e&&console.warn("NewgroundsIO Type Mismatch: Value should be a string, got",e),this.#app_id=String(e)}objectMap={scoreboard:"ScoreBoard",user:"User"};arrayMap={scores:"Score"}}void 0===NewgroundsIO.results.ScoreBoard&&(NewgroundsIO.results.ScoreBoard={}),NewgroundsIO.results.ScoreBoard.getScores=e})(),(()=>{class e extends NewgroundsIO.BaseResult{constructor(e){super();let t=this;if(this.__object="ScoreBoard.postScore",["scoreboard","score"].forEach(e=>{t.__properties.indexOf(e)<0&&t.__properties.push(e)}),e&&"object"==typeof e)for(var s=0;s<this.__properties.length;s++)void 0!==e[this.__properties[s]]&&(this[this.__properties[s]]=e[this.__properties[s]])}#scoreboard=null;get scoreboard(){return this.#scoreboard}set scoreboard(e){null===(e=e instanceof NewgroundsIO.objects.ScoreBoard||"object"!=typeof e?e:new NewgroundsIO.objects.ScoreBoard(e))||e instanceof NewgroundsIO.objects.ScoreBoard||console.warn("Type Mismatch: expecting NewgroundsIO.objects.ScoreBoard, got ",e),this.#scoreboard=e}#score=null;get score(){return this.#score}set score(e){null===(e=e instanceof NewgroundsIO.objects.Score||"object"!=typeof e?e:new NewgroundsIO.objects.Score(e))||e instanceof NewgroundsIO.objects.Score||console.warn("Type Mismatch: expecting NewgroundsIO.objects.Score, got ",e),this.#score=e}objectMap={scoreboard:"ScoreBoard",score:"Score"}}void 0===NewgroundsIO.results.ScoreBoard&&(NewgroundsIO.results.ScoreBoard={}),NewgroundsIO.results.ScoreBoard.postScore=e})();