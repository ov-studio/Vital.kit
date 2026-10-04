export const BANNERS = [
  'https://traxion.gg/wp-content/uploads/2025/08/Rennsport-saudi-arabia-Jeddah-track.jpg',
  'https://assetsio.gnwcdn.com/best-racing-games-rps.jpg?width=690&quality=85&format=jpg&dpr=3&auto=webp',
  'https://www.nintendo-insider.com/wp-content/uploads/2026/02/4pgp_nintendo_switch_2_edition_review_banner.jpg',
];

export const LOGOS = [
  'https://img.freepik.com/premium-vector/racing-team-logo-trendy-fashionable-vector-see-more_384468-3806.jpg?semt=ais_hybrid&w=740&q=80',
  'https://static.vecteezy.com/system/resources/thumbnails/005/910/245/small/car-mascot-logo-esport-gaming-free-vector.jpg',
];

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const SERVER_LIST = [
  { name:'City Wars RP',      desc:'Immersive city roleplay — gang wars, police, civilian life.',             genre:'roleplay', players:84,  max:128, status:'live', discord:true,  site:true  },
  { name:'Drift Racing',      desc:'High-speed mountain circuits. Weekly ranked tournaments.',                genre:'racing',   players:42,  max:64,  status:'live', discord:true,  site:false },
  { name:'Shell Storm',       desc:'Tactical 8v8 warfare. Ranked seasons and custom loadouts.\nA\nB\nC\nD',              genre:'shooter',  players:128, max:128, status:'full', discord:true,  site:true  },
  { name:'Orbit Build',       desc:'Zero-gravity sandbox. Build stations, terraform planets.',               genre:'sandbox',  players:18,  max:64,  status:'none', discord:true,  site:false },
  { name:'NexCity RP',        desc:'Futuristic city sim — corporations, hacking, underground.',              genre:'roleplay', players:96,  max:128, status:'live', discord:true,  site:true  },
  { name:'Void Sector',       desc:'Open-world Lua sandbox. Build, explore, automate anything.',             genre:'sandbox',  players:201, max:256, status:'busy', discord:true,  site:true  },
  { name:'Wastezone',         desc:'Post-apocalyptic survival — scavenge, craft and defend.',                genre:'survival', players:29,  max:64,  status:'live', discord:true,  site:false },
  { name:'SkyBuild',          desc:'Floating island sandbox — architect sky cities and economies.',          genre:'sandbox',  players:35,  max:64,  status:'live', discord:true,  site:true  },
  { name:'Neon Streets RP',   desc:'Rain-soaked cyberpunk city. Run heists, own territory, build empires.', genre:'roleplay', players:112, max:200, status:'live', discord:true,  site:true  },
  { name:'Strike Force',      desc:'Competitive 5v5 objective-based shooter with ranked leagues.',           genre:'shooter',  players:60,  max:64,  status:'busy', discord:true,  site:false },
  { name:'Grid Circuit',      desc:'Formula-style open-wheel racing. Precision driving, live leaderboards.', genre:'racing',   players:38,  max:50,  status:'live', discord:true,  site:true  },
  { name:'Iron Bastion',      desc:'Tower defense meets survival — build, upgrade, and hold the line.',      genre:'survival', players:44,  max:80,  status:'live', discord:true,  site:false },
  { name:'DeepRun RP',        desc:'Underground bunker roleplay. Resources are scarce, alliances fragile.',  genre:'roleplay', players:71,  max:100, status:'live', discord:true,  site:true  },
  { name:'Construct Zero',    desc:'Physics sandbox with full Lua scripting. No limits, no rules.',          genre:'sandbox',  players:9,   max:32,  status:'none', discord:true,  site:false },
];

// One shuffled banner per server, so a server shows the same art in every view.
const banners = shuffle(SERVER_LIST.map((_, i) => BANNERS[i % BANNERS.length]));
export const SERVERS = SERVER_LIST.map((s, i) => ({ ...s, banner: banners[i] }));

export const GENRES = [...new Set(SERVERS.map(s => s.genre))];

// FEATURED: max 3 entries, cycled one at a time. Only the hero art (img) and
// thumbnail (logo) live here; everything else comes from the matching server.
const FEATURED_ART = {
  'City Wars RP':    { img: BANNERS[1], logo: LOGOS[0] },
  'Neon Streets RP': { img: BANNERS[2], logo: LOGOS[1] },
  'Shell Storm':     { img: BANNERS[0], logo: LOGOS[0] },
};

export const FEATURED = Object.entries(FEATURED_ART).map(([name, art]) => ({
  ...SERVERS.find(s => s.name === name),
  ...art,
}));
