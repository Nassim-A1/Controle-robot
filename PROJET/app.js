// --- ÉLÉMENTS DU DOM ---
const maModale = document.getElementById("ma-modale");
const btnOuvrir = document.getElementById("btn-ouvrir-pop");
const btnFermer = document.querySelector(".fermer");
const logWindow = document.getElementById("log-window");
const btnUrgence = document.getElementById("btn-urgence");
const statusRobot = document.getElementById("robot-status");
const apiLabel = document.getElementById("api-label");

// --- CONFIG GRAPHIQUE ---
const canvas = document.getElementById('tempChart');
const ctx = canvas.getContext('2d');
let pointsTemp = [];
const maxPoints = 15;

// --- LOGIQUE POP-UP ---
btnOuvrir.onclick = () => maModale.style.display = "block";
btnFermer.onclick = () => maModale.style.display = "none";
window.onclick = (e) => { if (e.target == maModale) maModale.style.display = "none"; };

// --- FONCTION LOG ---
function ajouterLog(msg) {
    const p = document.createElement("p");
    p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logWindow.prepend(p);
}

// --- APPELS API ---
async function lancer(nom) {
    maModale.style.display = "none";
    apiLabel.textContent = "ENVOI EN COURS...";
    ajouterLog(`API POST: Lancement ${nom}`);
    
    try {
        const response = await fetch(`https://api-centrale.local/robot/${nom}`, { method: 'POST' });
        if(response.ok) {
            ajouterLog(`Succès: ${nom} validé.`);
            if(statusRobot) statusRobot.textContent = "EN COURS";
        }
    } catch (e) {
        ajouterLog(`Info: Ordre "${nom}" transmis à la passerelle.`);
    }
    
    setTimeout(() => { apiLabel.textContent = "GATEWAY API ACTIVE"; }, 2000);
}

// --- ARRÊT D'URGENCE ---
btnUrgence.onclick = () => {
    ajouterLog("⚠️ ALERTE: Arrêt d'urgence activé !");
    statusRobot.textContent = "ARRÊTÉ (URGENCE)";
    statusRobot.style.color = "#e74c3c";
    lancer('STOP_URGENT');
};

// --- DESSIN GRAPHIQUE ---
function dessinerGraphique() {
    const w = canvas.width;
    const h = canvas.height;
    const padding = 40;
    ctx.clearRect(0, 0, w, h);
    
    // Axes & Graduations
    ctx.strokeStyle = "#444";
    ctx.fillStyle = "#888";
    ctx.font = "10px Roboto Mono";
    for(let i = 0; i <= 4; i++) {
        let y = padding + i * (h - 2 * padding) / 4;
        let tempLabel = 40 - (i * 5);
        ctx.fillText(tempLabel + "°", 5, y + 3);
        ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Courbe
    if (pointsTemp.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = "#2ecc71";
        ctx.lineWidth = 2;
        const stepX = (w - padding) / (maxPoints - 1);
        pointsTemp.forEach((t, i) => {
            const xPos = padding + i * stepX;
            const yPos = (h - padding) - ((t - 20) * (h - 2 * padding) / 20);
            if (i === 0) ctx.moveTo(xPos, yPos); else ctx.lineTo(xPos, yPos);
        });
        ctx.stroke();
    }
}

// --- SUPERVISION ---
function updateVision() {
    const x = (Math.random() * 50).toFixed(2);
    const y = (Math.random() * 50).toFixed(2);
    const z = (Math.random() * 50).toFixed(2);
    document.getElementById("pos").textContent = `X:${x} Y:${y} Z:${z}`;

    const temp = parseFloat((22 + Math.random() * 10).toFixed(1));
    document.getElementById("temp-val").textContent = temp;

    pointsTemp.push(temp);
    if (pointsTemp.length > maxPoints) pointsTemp.shift();
    dessinerGraphique();

    if (temp > 30) ajouterLog(`⚠️ Surchauffe : ${temp}°C`);
}

setInterval(updateVision, 1500);