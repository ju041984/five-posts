document.addEventListener("DOMContentLoaded", () => {

 const btn = document.getElementById("checkoutBtn");
 if (!btn) return;

 btn.addEventListener("click", async () => {
 try {
 const res = await fetch("/create-checkout-session", {
 method: "POST"
 });

 const data = await res.json();
 window.location.href = data.url;

 } catch (err) {
 alert("Erreur Stripe. Réessaie.");
 console.error(err);
 }
 });
});