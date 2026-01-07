document.addEventListener("DOMContentLoaded", () => {

 /* =========================
 DOM CONTRACT — VERROUILLÉ
 ========================= */
 const platformSelect = document.getElementById("platformSelect");
 const toneSelect = document.getElementById("toneSelect");
 const objectifSelect = document.getElementById("objectifSelect");
 const generateBtn = document.getElementById("generateBtn");

 const generatorSection = document.getElementById("generatorSection");
 const limitSection = document.getElementById("limitSection");

 const resultsSection = document.getElementById("resultsSection");
 const resultsContent = document.getElementById("resultsContent");
 const copyBtn = document.getElementById("copyBtn");

 const moodButtons = document.querySelectorAll(".mood-btn");

 if (
 !platformSelect ||
 !toneSelect ||
 !objectifSelect ||
 !generateBtn ||
 !generatorSection ||
 !limitSection ||
 !resultsSection ||
 !resultsContent ||
 !copyBtn
 ) {
 console.error(" DOM CONTRACT ROMPU — index.html invalide");
 return;
 }

 /* =========================
 CONSTANTES PAYWALL
 ========================= */
 const STORAGE_KEY = "fiveposts_last_generation";
 const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h

 let countdownInterval = null;

 /* =========================
 STATE
 ========================= */
 let selectedMood = "Aucun";

 /* =========================
 MOODS
 ========================= */
 moodButtons.forEach(btn => {
 btn.addEventListener("click", () => {
 moodButtons.forEach(b => b.classList.remove("active"));
 btn.classList.add("active");
 selectedMood = btn.dataset.mood;
 });
 });

 /* =========================
 PAYWALL LOGIC
 ========================= */
 function isBlocked() {
 const last = localStorage.getItem(STORAGE_KEY);
 if (!last) return false;
 return Date.now() - Number(last) < COOLDOWN_MS;
 }

 function getRemainingTime() {
 const last = Number(localStorage.getItem(STORAGE_KEY));
 const end = last + COOLDOWN_MS;
 return Math.max(0, end - Date.now());
 }

 function formatTime(ms) {
 const totalSeconds = Math.floor(ms / 1000);
 const hours = Math.floor(totalSeconds / 3600);
 const minutes = Math.floor((totalSeconds % 3600) / 60);
 const seconds = totalSeconds % 60;

 return `${hours.toString().padStart(2, "0")}h ${minutes
 .toString()
 .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
 }

 function updateCountdown() {
 const remaining = getRemainingTime();

 const countdownEl = document.getElementById("countdown");
 if (!countdownEl) return;

 if (remaining <= 0) {
 clearInterval(countdownInterval);
 showGenerator();
 return;
 }

 countdownEl.innerText = formatTime(remaining);
 }

 function showLimit() {
 generatorSection.hidden = true;
 limitSection.hidden = false;

 if (!countdownInterval) {
 updateCountdown();
 countdownInterval = setInterval(updateCountdown, 1000);
 }
 }

 function showGenerator() {
 generatorSection.hidden = false;
 limitSection.hidden = true;

 if (countdownInterval) {
 clearInterval(countdownInterval);
 countdownInterval = null;
 }
 }

 if (isBlocked()) {
 showLimit();
 } else {
 showGenerator();
 }

 /* =========================
 GÉNÉRATION
 ========================= */
 generateBtn.addEventListener("click", () => {

 if (isBlocked()) {
 showLimit();
 return;
 }

 const platform = platformSelect.value;
 const tone = toneSelect.value;
 const objectif = objectifSelect.value;

 resultsContent.innerHTML = `
 <strong>Plateforme :</strong> ${platform}<br>
 <strong>Ton :</strong> ${tone}<br>
 <strong>Objectif :</strong> ${objectif}<br>
 <strong>Mood :</strong> ${selectedMood}
 <hr>
 <p><strong>Post 1 :</strong> Respire. Même un petit pas est un progrès.</p>
 <p><strong>Post 2 :</strong> La régularité vaut mieux que la perfection.</p>
 <p><strong>Post 3 :</strong> Tu construis quelque chose, même les jours calmes.</p>
 <p><strong>Post 4 :</strong> Publier, c’est déjà avancer.</p>
 <p><strong>Post 5 :</strong> Continue. Le reste suivra.</p>
 `;

 resultsSection.hidden = false;

 // Enregistrer la génération
 localStorage.setItem(STORAGE_KEY, Date.now().toString());

 // Basculer en mode limité
 showLimit();
 });

 /* =========================
 COPIE
 ========================= */
 copyBtn.addEventListener("click", () => {
 const text = resultsContent.innerText;
 navigator.clipboard.writeText(text);
 copyBtn.innerText = "Copié ";
 setTimeout(() => {
 copyBtn.innerText = "Copier les 5 posts";
 }, 1500);
 });

});