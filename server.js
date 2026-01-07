import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = 3002;

// nécessaire pour __dirname en ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middleware
app.use(express.json());
app.use(express.static(__dirname));

// PAGE PRINCIPALE
app.get("/", (req, res) => {
 res.sendFile(path.join(__dirname, "index.html"));
});

// ENDPOINT GENERATION
app.post("/generate", async (req, res) => {
 try {
 const { platform, tone, objectif, mood } = req.body;

 // TEMPORAIRE (mock stable)
 const posts = [
 `Prends un moment pour respirer profondément. Même lentement, tu avances.`,
 `Chaque jour est une opportunité discrète de progresser.`,
 `La simplicité est parfois la meilleure stratégie.`,
 `Une pause peut devenir une force.`,
 `Avance à ton rythme, mais avance.`
 ];

 res.json({ posts });
 } catch (err) {
 console.error(err);
 res.status(500).json({ error: "Erreur serveur" });
 }
});

app.listen(PORT, () => {
 console.log(` Serveur lancé sur http://localhost:${PORT}`);
});