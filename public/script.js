document.addEventListener("DOMContentLoaded", async () => {
 console.log("script.js chargé");

 // ==============================
 // DOM
 // ==============================
 const generateBtn = document.getElementById("generateBtn");
 const upgradeBtn = document.getElementById("upgradeBtn");
 const postsContainer = document.getElementById("posts-container");

 if (!generateBtn) {
 console.error("Bouton generateBtn introuvable");
 return;
 }

 let selectedMood = null;

 // ==============================
 // MOODS
 // ==============================
 document.querySelectorAll(".mood").forEach(btn => {
 btn.addEventListener("click", () => {
 document.querySelectorAll(".mood").forEach(b =>
 b.classList.remove("active")
 );
 btn.classList.add("active");
 selectedMood = btn.textContent.trim();
 });
 });

 // ==============================
 // CHECK PRO
 // ==============================
 const proEmail = localStorage.getItem("proEmail");

 if (proEmail && upgradeBtn) {
 upgradeBtn.classList.add("hidden");
 console.log("Utilisateur PRO détecté");
 }

 // ==============================
 // GENERATE
 // ==============================
 generateBtn.addEventListener("click", async () => {
 console.log("Click sur Générer");

 if (!selectedMood) {
 alert("Choisis d’abord ton mood");
 return;
 }

 const platform = document.getElementById("platform").value;
 const tone = document.getElementById("tone").value;
 const intent = document.getElementById("intent").value;

 postsContainer.innerHTML = "";
 postsContainer.classList.remove("hidden");

 try {
 const res = await fetch("/generate", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 platform,
 tone,
 goal: intent,
 mood: selectedMood,
 ...(proEmail ? { email: proEmail } : {})
 })
 });

 const data = await res.json();
 console.log("Réponse serveur :", data);

 // ==============================
 // CAS LIMITE ATTEINTE
 // ==============================
 if (!data.posts || data.posts.length === 0) {
 postsContainer.innerHTML = `
 <div class="blocked">
 <h3>Limite gratuite atteinte</h3>
 <p>Tu as utilisé ta génération gratuite du jour.</p>
 </div>
 `;

 if (upgradeBtn) {
 upgradeBtn.classList.remove("hidden");
 }

 return;
 }

 // ==============================
 // AFFICHAGE DES POSTS (FREE OU PRO)
 // ==============================
 data.posts.forEach(p => {
 const post = document.createElement("div");
 post.className = "post";
 post.innerText = `${p.title}\n\n${p.content}`;
 postsContainer.appendChild(post);
 });

 postsContainer.scrollIntoView({ behavior: "smooth" });

 // Si FREE → on affiche le bouton PRO après génération
 if (!data.pro && upgradeBtn) {
 upgradeBtn.classList.remove("hidden");
 }

 } catch (err) {
 console.error("Erreur génération :", err);
 alert("Erreur lors de la génération");
 }
 });
});