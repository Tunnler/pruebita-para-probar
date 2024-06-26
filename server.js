const express = require('express');
const fs = require('fs');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
const port = process.env.PORT || 3001;

const RIOT_API_KEY = 'RGAPI-e79eff2b-fc1a-4c53-80d9-d868e5d97a65'; // Reemplaza esto con tu clave de API de Riot
const players = [
  { username: 'Pause', tag: 'lan' },
  { username: 'Dritzh', tag: '098' },
  { username: 'Sleeper', tag: '9905' },
  { username: 'Gërsön', tag: 'lan' },
];

const getPUUID = async (username, tag) => {
  const response = await axios.get(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${username}/${tag}?api_key=${RIOT_API_KEY}`);
  return response.data.puuid;
};

const getSummonerByPUUID = async (puuid) => {
  const response = await axios.get(`https://la1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`);
  return response.data;
};

const getRankedStatsBySummonerId = async (summonerId) => {
  const response = await axios.get(`https://la1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${RIOT_API_KEY}`);
  return response.data;
};

const fetchPlayerStats = async () => {
  const statsPromises = players.map(async player => {
    const puuid = await getPUUID(player.username, player.tag);
    const summoner = await getSummonerByPUUID(puuid);
    const stats = await getRankedStatsBySummonerId(summoner.id);
    const soloStats = stats.find(stat => stat.queueType === 'RANKED_SOLO_5x5');
    return { summonerName: player.username, rankedStats: soloStats || null };
  });

  return Promise.all(statsPromises);
};

const updatePlayerStats = async () => {
  const playerStats = await fetchPlayerStats();
  fs.writeFileSync('playerStats.json', JSON.stringify(playerStats, null, 2));
};

// Actualizar datos cada hora
cron.schedule('0 * * * *', updatePlayerStats);

// Ruta para la raíz
app.get('/', (req, res) => {
  res.send('Servidor Backend está funcionando.');
});

// Ruta para obtener las estadísticas
app.get('/stats', (req, res) => {
  fs.readFile('playerStats.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read data' });
    }
    res.json(JSON.parse(data));
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  updatePlayerStats(); // Actualizar datos al iniciar el servidor
});