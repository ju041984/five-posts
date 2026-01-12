document.addEventListener("DOMContentLoaded", () => {

 const phrases = [
 "Fatigué ",
 "Focus ",
 "Motivé ",
 "Calme ",
 "Journée grise "
 ];

 const phrasesContainer = document.getElementById("phrases");
 const countdownContainer = document.getElementById("countdown");
 const upgradeBtn = document.getElementById("upgradeBtn");

 // Sécurité DOM
 if (!phrasesContainer || !countdownContainer || !upgradeBtn) {
 console.warn("Index.js : éléments manquants");
 return;
 }

 // --- PHRASES ---
 phrases.forEach(text => {
 const div = document.createElement("div");
 div.className = "phrase";
 div.textContent = text;
 phrases.forEach(text => {
 const div = document.createElement("div");
 div.className = "phrase";
 div.textContent = text;

 // MODE sélectionnable
 div.addEventListener("click", () => {
 document.querySelectorAll(".phrase").forEach(p =>
 p.classList.remove("active")
 );
 div.classList.add("active");
 });

 phrasesContainer.appendChild(div);
});
 phrasesContainer.appendChild(div);
 });

 // --- LIMITE GRATUITE ---
 const lastUse = localStorage.getItem("lastGeneration");
 const now = Date.now();
 const limitMs = 24 * 60 * 60 * 1000;

 if (lastUse && now - Number(lastUse) < limitMs) {
 startCountdown(limitMs - (now - Number(lastUse)));
 } else {
 countdownContainer.textContent = " Génération gratuite disponible";
 }

 function startCountdown(ms) {
 function update() {
 const h = Math.floor(ms / 3600000);
 const m = Math.floor((ms % 3600000) / 60000);
 const s = Math.floor((ms % 60000) / 1000);

 countdownContainer.textContent =
 ` Prochaine génération gratuite dans ${h}h ${m}m ${s}s`;

 ms -= 1000;
 if (ms <= 0) clearInterval(timer);
 }

 update();
 const timer = setInterval(update, 1000);
 }

 // --- BOUTON PRO ---
 upgradeBtn.addEventListener("click", () => {
 window.location.href = "/upgrade.html";
 });
 // --- GÉNÉRATION DES POSTS ---
const generateBtn = document.getElementById("generateBtn");
const postsContainer = document.getElementById("posts");

if (generateBtn && postsContainer) {
 generateBtn.addEventListener("click", async () => {

 // Valeurs sélectionnées
 const platform = document.querySelector("select")?.value || "instagram";
 const tone = "simple";
 const goal = "exister";
 const mood = document.querySelector(".phrase.active")?.textContent.trim() || "Calme";

 // Email simulé (PRO déjà actif chez toi)
 const email = localStorage.getItem("email") || "stripe@example.com";

 // Appel API
 const res = await fetch("/generate", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ platform, tone, goal, mood, email })
 });

 const data = await res.json();

 // Affichage
 postsContainer.innerHTML = "";
 data.posts.forEach((post, i) => {
 const div = document.createElement("div");
 div.className = "post";
 div.innerHTML = `<strong>Post ${i + 1}</strong><p>${post}</p>`;
 postsContainer.appendChild(div);
 });

 // Limite gratuite
 localStorage.setItem("lastGeneration", Date.now());
 });
}
});