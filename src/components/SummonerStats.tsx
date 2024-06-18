import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableSortLabel from '@mui/material/TableSortLabel';
import {TextField } from '@mui/material';
import axios from 'axios';

interface RankedStats {
  leagueId: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
}

interface PlayerStats {
  summonerName: string;
  rankedStats: RankedStats | null;
}

const SummonerStats: React.FC = () => {
  const [playersStats, setPlayersStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>('summonerName');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/stats');
        setPlayersStats(response.data);
      } catch (error) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const sortComparator = (a: PlayerStats, b: PlayerStats) => {
    if (!a.rankedStats || !b.rankedStats) return 0;
    switch (orderBy) {
      case 'summonerName':
        return (a.summonerName < b.summonerName ? -1 : 1) * (order === 'asc' ? 1 : -1);
      case 'tier':
        return (a.rankedStats.tier < b.rankedStats.tier ? -1 : 1) * (order === 'asc' ? 1 : -1);
      case 'rank':
        return (a.rankedStats.rank < b.rankedStats.rank ? -1 : 1) * (order === 'asc' ? 1 : -1);
      case 'leaguePoints':
        return (a.rankedStats.leaguePoints - b.rankedStats.leaguePoints) * (order === 'asc' ? 1 : -1);
      case 'wins':
        return (a.rankedStats.wins - b.rankedStats.wins) * (order === 'asc' ? 1 : -1);
      case 'losses':
        return (a.rankedStats.losses - b.rankedStats.losses) * (order === 'asc' ? 1 : -1);
      case 'winRate':
        const winRateA = a.rankedStats.wins / (a.rankedStats.wins + a.rankedStats.losses);
        const winRateB = b.rankedStats.wins / (b.rankedStats.wins + b.rankedStats.losses);
        return (winRateA - winRateB) * (order === 'asc' ? 1 : -1);
      default:
        return 0;
    }
  };

  const filteredPlayersStats = playersStats
    .filter(player => player.summonerName.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort(sortComparator)

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <TextField
        label="Search Summoner"
        variant="outlined"
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ marginBottom: '16px' }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'summonerName'}
                  direction={orderBy === 'summonerName' ? order : 'asc'}
                  onClick={() => handleRequestSort('summonerName')}
                >
                  Summoner Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'tier'}
                  direction={orderBy === 'tier' ? order : 'asc'}
                  onClick={() => handleRequestSort('tier')}
                >
                  Tier
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'rank'}
                  direction={orderBy === 'rank' ? order : 'asc'}
                  onClick={() => handleRequestSort('rank')}
                >
                  Rank
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'leaguePoints'}
                  direction={orderBy === 'leaguePoints' ? order : 'asc'}
                  onClick={() => handleRequestSort('leaguePoints')}
                >
                  League Points
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'wins'}
                  direction={orderBy === 'wins' ? order : 'asc'}
                  onClick={() => handleRequestSort('wins')}
                >
                  Wins
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'losses'}
                  direction={orderBy === 'losses' ? order : 'asc'}
                  onClick={() => handleRequestSort('losses')}
                >
                  Losses
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'winRate'}
                  direction={orderBy === 'winRate' ? order : 'asc'}
                  onClick={() => handleRequestSort('winRate')}
                >
                  Win Rate
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPlayersStats.map((player) => (
              <TableRow key={player.summonerName}>
                <TableCell>{player.summonerName}</TableCell>
                <TableCell>{player.rankedStats?.tier || 'Unranked'}</TableCell>
                <TableCell>{player.rankedStats?.rank || '-'}</TableCell>
                <TableCell>{player.rankedStats?.leaguePoints || 0}</TableCell>
                <TableCell>{player.rankedStats?.wins || 0}</TableCell>
                <TableCell>{player.rankedStats?.losses || 0}</TableCell>
                <TableCell>
                  {player.rankedStats
                    ? (
                      (player.rankedStats.wins /
                        (player.rankedStats.wins + player.rankedStats.losses)) * 100
                    ).toFixed(2)
                    : '0.00'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default SummonerStats;
