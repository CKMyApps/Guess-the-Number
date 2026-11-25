'use strict';
const $ = id => document.getElementById(id);
const saveKey = 'ckmyapps.numberguess.round.v1';
const soundKey = 'ckmyapps.numberguess.sound.v1';
function read(key){ try {return localStorage.getItem(key)} catch {return null} }
function write(key,value){ try {if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value)} catch {} }
function load(){
  try {
    const r=JSON.parse(read(saveKey));
    if(r && Number.isInteger(r.target) && r.target>=1 && r.target<=100 &&
       Number.isSafeInteger(r.tries) && r.tries>=0 && typeof r.hint==='string')return r;
  } catch {}
  return null;
}
let round=load(), sound=read(soundKey)!=='off', audio;
function beep(pitch){
  if(!sound)return;
  try {
    audio ||= new (window.AudioContext||window.webkitAudioContext)();
    audio.resume().catch(()=>{});
    const tone=audio.createOscillator(), volume=audio.createGain(), now=audio.currentTime;
    tone.frequency.value=pitch;volume.gain.setValueAtTime(.055,now);
    volume.gain.exponentialRampToValueAtTime(.001,now+.12);
    tone.connect(volume);volume.connect(audio.destination);tone.start();tone.stop(now+.12);
  } catch {}
}
function menu(){
  $('round').hidden=true;$('menu').hidden=false;$('resume').disabled=!round;
  document.body.classList.remove('playing');
}
function play(){
  $('menu').hidden=true;$('round').hidden=false;$('again').hidden=true;$('form').hidden=false;
  document.body.classList.add('playing');
  $('hint').textContent=round.hint;$('tries').textContent=round.tries;
  $('number').value='';$('number').focus();
}
function start(){
  round={target:Math.floor(Math.random()*100)+1,tries:0,hint:'I am thinking of a number between 1 and 100.'};
  write(saveKey,JSON.stringify(round));beep(350);play();
}
$('form').onsubmit=event=>{
  event.preventDefault();if(!round)return;
  const raw=$('number').value.trim(), n=Number(raw);
  if(!/^\d+$/.test(raw)||n<1||n>100){
    $('hint').textContent='Enter a whole number from 1 to 100.';$('number').focus();$('number').select();return;
  }
  round.tries++;$('tries').textContent=round.tries;
  if(n===round.target){
    $('hint').textContent='YOU GUESSED MY NUMBER! You guessed '+n+' in '+round.tries+(round.tries===1?' try.':' tries.');
    round=null;write(saveKey,null);$('form').hidden=true;$('again').hidden=false;$('again').focus();beep(780);return;
  }
  round.hint=n+' — '+(n<round.target?'Too low, try a higher number.':'Too high, try a lower number.');
  beep(n<round.target?300:490);write(saveKey,JSON.stringify(round));play();
};
$('start').onclick=$('again').onclick=start;$('resume').onclick=play;
$('back').onclick=()=>{menu();$('start').focus()};
function modal(settings){
  $('heading').textContent=settings?'Settings':'Instructions';
  $('prefs').hidden=!settings;$('rules').hidden=settings;$('panel').showModal();
}
function soundLabel(){ $('sound').textContent=sound?'Sound ON':'Sound OFF';$('sound').setAttribute('aria-pressed',String(sound)) }
$('settings').onclick=()=>modal(true);$('how').onclick=()=>modal(false);$('close').onclick=()=>$('panel').close();
$('sound').onclick=()=>{sound=!sound;write(soundKey,sound?'on':'off');soundLabel();beep(440)};
soundLabel();menu();
