import axios from 'axios';

const API_KEY = 'RGAPI-e79eff2b-fc1a-4c53-80d9-d868e5d97a65';

export const getPUUID = async (username: string, tag: string) => {
  const response = await axios.get(
    `https://cors-anywhere.herokuapp.com/https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${username}/${tag}?api_key=${API_KEY}`
  );
  return response.data.puuid;
};

export const getSummonerByPUUID = async (puuid: string) => {
  const response = await axios.get(
    `https://cors-anywhere.herokuapp.com/https://la1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${API_KEY}`
  );
  return response.data;
};

export const getRankedStatsBySummonerId = async (summonerId: string) => {
  const response = await axios.get(
    `https://cors-anywhere.herokuapp.com/https://la1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${API_KEY}`
  );
  return response.data;
};
