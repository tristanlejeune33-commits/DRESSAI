const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Servir les fichiers statiques du dossier actuel
app.use(express.static(__dirname));

// Route principale renvoie vers le prototype
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'PROTO SKINAI.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Ouvrez votre navigateur à l'adresse ci-dessus pour tester.`);
});