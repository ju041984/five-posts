import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import Database from "better-sqlite3";

dotenv.config();

// ==============================
// DB
// ==============================
const db = new Database("pro.db");

db.prepare(`
CREATE TABLE IF NOT EXISTS pro_users (
email TEXT PRIMARY KEY,
activated_at TEXT,
source TEXT
)
`).run();

// ==============================
// INIT
// ==============================
const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ==============================
// RATE LIMIT
// ==============================
const RATE_LIMIT_FREE = 1; // 1 génération gratuite
const RATE_LIMIT_PRO = 20; // large pour les PRO
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24h

const rateMap = new Map();

function checkRateLimit(key, limit) {
const now = Date.now();
const data = rateMap.get(key) || { count: 0, start: now };

if (now - data.start > WINDOW_MS) {
rateMap.set(key, { count: 1, start: now });
return true;
}

if (data.count >= limit) return false;

data.count++;
rateMap.set(key, data);
return true;
}

// ==============================
// PATHS
// ==============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==============================
// STRIPE WEBHOOK
// ==============================
app.post(
"/webhook",
express.raw({ type: "application/json" }),
(req, res) => {
const sig = req.headers["stripe-signature"];
let event;

try {
event = stripe.webhooks.constructEvent(
req.body,
sig,
process.env.STRIPE_WEBHOOK_SECRET
);
} catch (err) {
console.error("Webhook error:", err.message);
return res.status(400).send("Webhook Error");
}

const session = event.data.object;
const email = session?.customer_details?.email?.toLowerCase();

if (event.type === "checkout.session.completed" && email) {
db.prepare(`
INSERT OR REPLACE INTO pro_users (email, activated_at, source)
VALUES (?, datetime('now'), 'stripe')
`).run(email);

console.log("✅ PRO activé :", email);
}

if (
event.type === "customer.subscription.deleted" ||
event.type === "invoice.payment_failed"
) {
if (email) {
db.prepare(`DELETE FROM pro_users WHERE email = ?`).run(email);
console.log("⛔ PRO désactivé :", email);
}
}

res.json({ received: true });
}
);

// ==============================
// MIDDLEWARES
// ==============================
app.use(express.static("public"));
app.use(express.json());

// ==============================
// CHECK PRO STATUS
// ==============================
app.get("/me", (req, res) => {
const email = req.query.email?.toLowerCase();
if (!email) return res.json({ pro: false });

const row = db
.prepare("SELECT email FROM pro_users WHERE email = ?")
.get(email);

res.json({ pro: !!row });
});

// ==============================
// STRIPE CHECKOUT
// ==============================
app.post("/create-checkout-session", async (req, res) => {
try {
const session = await stripe.checkout.sessions.create({
mode: "subscription",
payment_method_types: ["card"],
line_items: [
{
price: process.env.STRIPE_PRICE_ID,
quantity: 1,
},
],
success_url: `${process.env.BASE_URL}/success`,
cancel_url: `${process.env.BASE_URL}/upgrade`,
});

res.json({ url: session.url });
} catch (err) {
console.error("Stripe error:", err.message);
res.status(500).json({ error: "Stripe checkout error" });
}
});

// ==============================
// GENERATE (FREE + PRO)
// ==============================
app.post("/generate", async (req, res) => {
const { platform, tone, goal, mood, email } = req.body;

let isPro = false;

if (email) {
const row = db
.prepare("SELECT email FROM pro_users WHERE email = ?")
.get(email.toLowerCase());
isPro = !!row;
}

const rateKey = isPro ? `pro_${email}` : `free_${req.ip}`;
const limit = isPro ? RATE_LIMIT_PRO : RATE_LIMIT_FREE;

if (!checkRateLimit(rateKey, limit)) {
return res.status(403).json({
pro: false,
error: "Limite gratuite atteinte",
});
}

try {
const prompt = `
Plateforme : ${platform}
Ton : ${tone}
Objectif : ${goal}
Mood : ${mood}

Génère 5 posts courts, naturels, humains.
Sans hashtags. Sans emojis excessifs.
Un post par paragraphe.
`;

const completion = await openai.chat.completions.create({
model: "gpt-4o-mini",
messages: [{ role: "user", content: prompt }],
});

const posts = completion.choices[0].message.content
.split("\n\n")
.slice(0, 5)
.map((content, i) => ({
title: `${platform} – Post ${i + 1}`,
content,
}));

res.json({ pro: isPro, posts });
} catch (err) {
console.error("OpenAI error:", err.message);
res.status(500).json({ error: "IA indisponible" });
}
});

// ==============================
// PAGES
// ==============================
app.get("/upgrade", (req, res) => {
res.sendFile(path.join(__dirname, "public/upgrade.html"));
});

app.get("/success", (req, res) => {
res.sendFile(path.join(__dirname, "public/success.html"));
});

// ==============================
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});