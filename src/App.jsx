import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import dragonSvg from "./assets/dragon.svg";
import greenSvg from "./assets/green.svg";
import scarecrowSvg from "./assets/scarecrow.svg";
import crowSvg from "./assets/crow.svg";

const BONUS_CATEGORIES = [
  {
    id: "firstBlood",
    emoji: "🩸",
    name: "First Blood",
    desc: "Deal the first combat damage",
    points: 1,
  },
  {
    id: "commanderKO",
    emoji: "⚔️",
    name: "Commander KO",
    desc: "Eliminate a player via commander damage",
    points: 1,
  },
  {
    id: "fullTable",
    emoji: "💀",
    name: "Full Table",
    desc: "Eliminate all opponents in one turn",
    points: 1,
  },
  {
    id: "speedDemon",
    emoji: "🏃",
    name: "Speed Demon",
    desc: "Win before turn 8",
    points: 1,
  },
  {
    id: "lastStand",
    emoji: "💪",
    name: "Last Stand",
    desc: "Win after being at 5 or fewer life",
    points: 1,
  },
  {
    id: "overkill",
    emoji: "🎯",
    name: "Overkill",
    desc: "Win dealing 10+ excess lethal damage",
    points: 1,
  },
  {
    id: "bilboBirthday",
    emoji: "🎂",
    name: "Bilbo's Birthday",
    desc: "Win with 111+ life",
    points: 1,
  },
  {
    id: "longExpectedParty",
    emoji: "🎆",
    name: "The Long-Expected Party",
    desc: "Win with EXACTLY 111 life",
    points: 3,
  },
];

const PLACEMENT_POINTS_3P = [3, 1, 0];
const PLACEMENT_POINTS_4P = [4, 2, 1, 0];
const SEASON_WEEKS = 8;

const DEFAULT_PLAYERS = ["Jack", "Danny", "Zach"];

const HERALDRY = [
  {
    primary: "#7246be",
    secondary: "#3a0505",
    accent: "#c8922a",
    pattern: "green",
  },
  {
    primary: "#1A3A5C",
    secondary: "#2E6B9E",
    accent: "#7EC8E3",
    pattern: "dragon",
  },
  {
    primary: "#1A4A1A",
    secondary: "#2E7D32",
    accent: "#A5D6A7",
    pattern: "crow",
  },
];

const Shield = ({ heraldry, size = 80, rank }) => {
  const { primary, secondary, accent, pattern } = heraldry;
  const clipId = `shield-clip-${primary.replace("#", "")}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        filter: rank === 0 ? `drop-shadow(0 0 8px ${accent}66)` : "none",
      }}
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M50,3 L97,18 L97,63 C97,82 50,97 50,97 C50,97 3,82 3,63 L3,18 Z" />
        </clipPath>
      </defs>
      <path
        d="M50,3 L97,18 L97,63 C97,82 50,97 50,97 C50,97 3,82 3,63 L3,18 Z"
        fill={primary}
      />
      {pattern === "chevron" && (
        <g clipPath={`url(#${clipId})`}>
          <polygon
            points="50,20 90,60 80,60 50,30 20,60 10,60"
            fill={secondary}
            opacity="0.6"
          />
          <polygon
            points="50,35 90,75 80,75 50,45 20,75 10,75"
            fill={secondary}
            opacity="0.4"
          />
        </g>
      )}
      {pattern === "cross" && (
        <g clipPath={`url(#${clipId})`}>
          <rect
            x="43"
            y="5"
            width="14"
            height="90"
            fill={secondary}
            opacity="0.5"
          />
          <rect
            x="5"
            y="43"
            width="90"
            height="14"
            fill={secondary}
            opacity="0.5"
          />
        </g>
      )}
      {pattern === "saltire" && (
        <g clipPath={`url(#${clipId})`}>
          <line
            x1="10"
            y1="10"
            x2="90"
            y2="90"
            stroke={secondary}
            strokeWidth="14"
            opacity="0.5"
          />
          <line
            x1="90"
            y1="10"
            x2="10"
            y2="90"
            stroke={secondary}
            strokeWidth="14"
            opacity="0.5"
          />
        </g>
      )}
      {heraldry.pattern === "scarecrow" && (
        <g clipPath={`url(#${clipId})`}>
          <rect x="0" y="0" width="100" height="100" fill="#080f0f" />
          <image
            href={scarecrowSvg}
            x="14"
            y="14"
            width="72"
            height="72"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      )}
      {heraldry.pattern === "green" && (
        <g clipPath={`url(#${clipId})`}>
          <rect x="0" y="0" width="100" height="100" fill="#0a1a08" />
          <image
            href={greenSvg}
            x="14"
            y="14"
            width="70"
            height="70"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      )}
      {pattern === "dragon" && (
        <g clipPath={`url(#${clipId})`}>
          <rect x="0" y="0" width="100" height="100" fill="#FFB300" />
          <image
            href={dragonSvg}
            x="5"
            y="2"
            width="90"
            height="96"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      )}
      {pattern === "crow" && (
        <g clipPath={`url(#${clipId})`}>
          <rect x="0" y="0" width="100" height="100" fill="#85a298" />
          <image
            href={crowSvg}
            x="5"
            y="2"
            width="90"
            height="96"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      )}
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontSize="28"
        fill={accent}
        opacity="0.9"
        style={{ fontFamily: "serif" }}
      >
        {heraldry.symbol}
      </text>
      <path
        d="M50,3 L97,18 L97,63 C97,82 50,97 50,97 C50,97 3,82 3,63 L3,18 Z"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        opacity="0.7"
      />
      <path
        d="M50,8 L92,22 L92,62 C92,79 50,93 50,93 C50,93 8,79 8,62 L8,22 Z"
        fill="none"
        stroke={accent}
        strokeWidth="1"
        opacity="0.3"
      />
      {rank === 0 && (
        <g transform="translate(50,3)">
          <polygon
            points="-8,-8 -6,-2 0,-6 6,-2 8,-8 9,0 -9,0"
            fill={accent}
            opacity="0.95"
          />
        </g>
      )}
    </svg>
  );
};

const OrnateRule = ({ color = "#3a2a10" }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0" }}
  >
    <div
      style={{
        flex: 1,
        height: 1,
        background: `linear-gradient(to right, transparent, ${color}88)`,
      }}
    />
    <div style={{ color, fontSize: 10, opacity: 0.7 }}>✦</div>
    <div
      style={{
        flex: 1,
        height: 1,
        background: `linear-gradient(to left, transparent, ${color}88)`,
      }}
    />
  </div>
);

export default function App() {
  const [showBonusRef, setShowBonusRef] = useState(true);
  const [players] = useState(DEFAULT_PLAYERS);
  const [games, setGames] = useState([]);
  const [view, setView] = useState("standings");
  const [newGame, setNewGame] = useState(null);
  const [toast, setToast] = useState(null);
  const [celebrateGame, setCelebrateGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminPass, setAdminPass] = useState("");
  const [expandedPlayers, setExpandedPlayers] = useState({});

  const togglePlayer = (name) => {
    setExpandedPlayers((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  useEffect(() => {
    fetchGames();
    const channel = supabase
      .channel("games-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "games" },
        () => fetchGames(),
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const fetchGames = async () => {
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error) setGames(data || []);
    setLoading(false);
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const initNewGame = () => {
    setNewGame({
      week: 1,
      playerCount: 3,
      isPlayoff: false,
      placements: Array(3).fill(""),
      bonuses: Array(3)
        .fill(null)
        .map(() => ({})),
    });
    setView("addGame");
  };

  const submitGame = async () => {
    if (newGame.placements.some((p) => p === "")) {
      showToast("Set all placements first!", "error");
      return;
    }
    const unique = new Set(newGame.placements);
    if (unique.size !== newGame.playerCount) {
      showToast("Each player needs a unique placement!", "error");
      return;
    }
    const { error } = await supabase
      .from("games")
      .insert({
        week: newGame.week,
        player_count: newGame.playerCount,
        is_playoff: newGame.isPlayoff,
        placements: newGame.placements,
        bonuses: newGame.bonuses,
      })
      .setHeader("x-admin-token", adminPass);
    if (error) {
      showToast("Error saving game!", "error");
      return;
    }
    if (newGame.bonuses.some((b) => b?.longExpectedParty))
      setCelebrateGame(true);
    showToast("Game logged! 🎉");
    setView("log");
    setNewGame(null);
  };

  const deleteGame = async (id) => {
    const pass = prompt("Enter admin password to remove this game:");
    if (!pass) return;
    const { error } = await supabase
      .from("games")
      .delete()
      .eq("id", id)
      .setHeader("x-admin-token", pass);
    if (error) showToast("Error removing game!", "error");
    else showToast("Game removed");
  };

  const standings = () =>
    players.map((name, pi) => {
      let placement = 0,
        bonus = 0,
        wins = 0,
        gamesPlayed = 0;
      const bonusCounts = {};
      games.forEach((g) => {
        if (pi >= g.player_count) return;
        gamesPlayed++;
        const pos = g.placements.indexOf(pi);
        const placementPts =
          g.player_count === 4
            ? (PLACEMENT_POINTS_4P[pos] ?? 0)
            : (PLACEMENT_POINTS_3P[pos] ?? 0);
        const multiplier = g.is_playoff ? 2 : 1;
        placement += placementPts * multiplier;
        if (g.placements[0] === pi) wins++;
        Object.entries(g.bonuses[pi] || {}).forEach(([id, val]) => {
          if (!val) return;
          const cat = BONUS_CATEGORIES.find((c) => c.id === id);
          bonus += cat?.points ?? 0;
          bonusCounts[id] = (bonusCounts[id] || 0) + 1;
        });
      });
      return {
        name,
        placement,
        bonus,
        total: placement + bonus,
        wins,
        gamesPlayed,
        bonusCounts,
      };
    });

  const weeklyBonus = () => {
    const weeks = {};
    games.forEach((g) => {
      if (!weeks[g.week]) weeks[g.week] = {};
      players.forEach((_, pi) => {
        if (pi >= g.player_count) return;
        if (g.placements[0] === pi)
          weeks[g.week][pi] = (weeks[g.week][pi] || 0) + 1;
      });
    });
    const bonuses = {};
    Object.entries(weeks).forEach(([, wins]) => {
      const max = Math.max(...Object.values(wins));
      if (max === 0) return;
      Object.entries(wins)
        .filter(([, w]) => w === max)
        .forEach(([pi]) => {
          bonuses[players[parseInt(pi)]] =
            (bonuses[players[parseInt(pi)]] || 0) + 1;
        });
    });
    return bonuses;
  };

  const wBonus = weeklyBonus();
  const finalStandings = standings()
    .map((s) => ({
      ...s,
      playerIndex: DEFAULT_PLAYERS.indexOf(s.name),
      total: s.total + (wBonus[s.name] || 0),
      weeklyBonus: wBonus[s.name] || 0,
    }))
    .sort((a, b) => b.total - a.total);

  const RANK_ROMAN = ["I", "II", "III"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1a1814",
        color: "#e8e0d0",
        fontFamily: "'Palatino Linotype', 'Book Antiqua', Georgia, serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cinzel+Decorative:wght@400;700&family=IM+Fell+English:ital@0;1&display=swap');
        * { box-sizing: border-box; }
        .player-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .player-card:hover { transform: translateY(-2px); }
        .nav-btn { transition: all 0.2s ease; }
        .nav-btn:hover { color: #f0d080 !important; }
        .fab { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(200,148,58,0.6) !important; }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .card-animate { animation: fadeSlideIn 0.4s ease forwards; }
        .gold-shimmer {
          background: linear-gradient(90deg, #c8943a, #f0d080, #e8b84b, #c8943a);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
        .fab { animation: pulse 2.5s ease-in-out infinite; filter: drop-shadow(0 4px 12px rgba(200,148,58,0.5)); }
        .fab:hover { transform: scale(1.1) !important; filter: drop-shadow(0 6px 20px rgba(200,148,58,0.8)) !important; }
        @keyframes pulse {
          0%, 100% { filter: drop-shadow(0 4px 12px rgba(200,148,58,0.4)); }
          50% { filter: drop-shadow(0 4px 24px rgba(200,148,58,0.8)); }
        }
      `}</style>

      {/* HEADER */}
      <div
        style={{
          background:
            "linear-gradient(180deg, #2a1e08 0%, #1e1608 40%, #141008 100%)",
          borderBottom: "1px solid #2a1a08",
          padding: "32px 20px 28px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 16,
            fontSize: 20,
            color: "#2a1a08",
            fontFamily: "serif",
          }}
        >
          ❧
        </div>
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            fontSize: 20,
            color: "#2a1a08",
            fontFamily: "serif",
            transform: "scaleX(-1)",
          }}
        >
          ❧
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center top, rgba(180,120,40,0.1) 0%, transparent 65%)",
          }}
        />
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 60,
                height: 1,
                background: "linear-gradient(to right, transparent, #5a3a14)",
              }}
            />
            <div style={{ color: "#5a3a14", fontSize: 14 }}>⚜</div>
            <div
              style={{
                width: 60,
                height: 1,
                background: "linear-gradient(to left, transparent, #5a3a14)",
              }}
            />
          </div>
          <h1
            className="gold-shimmer"
            style={{
              margin: 0,
              fontSize: 40,
              fontWeight: 700,
              fontFamily: "'Cinzel Decorative', serif",
              letterSpacing: 2,
              lineHeight: 1.2,
            }}
          >
            Commander League
          </h1>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 7,
              color: "#e8b84b",
              textTransform: "uppercase",
              marginBottom: 10,
              fontFamily: "'Cinzel', serif",
            }}
          >
            If there can be no victory, then I will fight forever
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginTop: 8,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: 40,
                height: 1,
                background: "linear-gradient(to right, transparent, #3a2a10)",
              }}
            />
            <div style={{ color: "#3a2a10", fontSize: 10 }}>✦</div>
            <div
              style={{
                width: 40,
                height: 1,
                background: "linear-gradient(to left, transparent, #3a2a10)",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 20,
              letterSpacing: 5,
              color: "#4a6a4a",
              textTransform: "uppercase",
              fontFamily: "'Cinzel', serif",
            }}
          >
            Season I &nbsp;·&nbsp; {games.length} Games Played
          </div>
        </div>
      </div>

      {/* NAV */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #1a1006",
          background: "linear-gradient(180deg, #0d0800, #06080a)",
        }}
      >
        {[
          { id: "standings", label: "⚔ Standings" },
          { id: "log", label: "📜 Game Log" },
        ].map((tab) => (
          <button
            key={tab.id}
            className="nav-btn"
            onClick={() => setView(tab.id)}
            style={{
              flex: 1,
              padding: "14px 8px",
              background: "none",
              border: "none",
              borderBottom:
                view === tab.id ? "2px solid #c8943a" : "2px solid transparent",
              color: view === tab.id ? "#f0d080" : "#4a3820",
              fontFamily: "'Cinzel', serif",
              fontSize: 11,
              letterSpacing: 2,
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "24px 16px", maxWidth: 640, margin: "0 auto" }}>
        {loading && (
          <div
            style={{
              textAlign: "center",
              color: "#4a3a20",
              padding: "60px 20px",
              fontFamily: "'IM Fell English', serif",
              fontSize: 15,
              fontStyle: "italic",
            }}
          >
            Consulting the ancient scrolls...
          </div>
        )}

        {/* STANDINGS */}
        {!loading && view === "standings" && (
          <div>
            {finalStandings.map((p, rank) => {
              const pi = DEFAULT_PLAYERS.indexOf(p.name);
              const h = HERALDRY[pi] || HERALDRY[0];
              const isExpanded = !!expandedPlayers[p.name];
              return (
                <div
                  key={p.name}
                  className="card-border-wrap"
                  onClick={() => togglePlayer(p.name)}
                  style={{
                    marginBottom: 16,
                    "--player-accent": h.accent,
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="player-card card-animate"
                    style={{
                      animationDelay: `${rank * 0.1}s`,
                      opacity: 0,
                      background: `linear-gradient(135deg, ${h.primary}1a 0%, #899bad 60%, ${h.primary}0d 100%)`,
                      backgroundColor: "#1a1814",
                      border: `1px solid ${h.accent}33`,
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow:
                        rank === 0
                          ? `0 4px 30px ${h.primary}2a, inset 0 1px 0 ${h.accent}1a`
                          : "0 2px 12px rgba(0,0,0,0.4)",
                    }}
                  >
                    <div
                      style={{
                        height: 2,
                        background: `linear-gradient(90deg, transparent, ${h.primary}, ${h.accent}, ${h.primary}, transparent)`,
                      }}
                    />

                    {/* COLLAPSED VIEW */}
                    {!isExpanded && (
                      <div
                        style={{
                          padding: "12px 20px",
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                        }}
                      >
                        <Shield heraldry={h} size={48} rank={rank} />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 700,
                              color: rank === 0 ? h.accent : "#d0c0a0",
                              fontFamily: "'Cinzel Decorative', serif",
                              letterSpacing: 1,
                            }}
                          >
                            {p.name}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "#3a2a18",
                              letterSpacing: 2,
                              fontFamily: "'Cinzel', serif",
                              textTransform: "uppercase",
                              marginTop: 2,
                            }}
                          >
                            Rank {RANK_ROMAN[rank]}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: 30,
                              fontWeight: 900,
                              lineHeight: 1,
                              color: rank === 0 ? h.accent : "#a09060",
                              fontFamily: "'Cinzel', serif",
                              textShadow:
                                rank === 0 ? `0 0 20px ${h.accent}55` : "none",
                            }}
                          >
                            {p.total}
                          </div>
                          <div
                            style={{
                              fontSize: 8,
                              color: "#3a2a18",
                              letterSpacing: 3,
                              fontFamily: "'Cinzel', serif",
                              textTransform: "uppercase",
                            }}
                          >
                            Points
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: h.accent + "88",
                            marginLeft: 4,
                          }}
                        >
                          ▼
                        </div>
                      </div>
                    )}

                    {/* EXPANDED VIEW */}
                    {isExpanded && (
                      <div style={{ padding: "18px 20px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                          }}
                        >
                          <div
                            style={{
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Shield heraldry={h} size={96} rank={rank} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 9,
                                letterSpacing: 4,
                                color: h.secondary,
                                textTransform: "uppercase",
                                fontFamily: "'Cinzel', serif",
                                marginBottom: 3,
                                opacity: 0.7,
                              }}
                            >
                              {h.title}
                            </div>
                            <div
                              style={{
                                fontSize: 24,
                                fontWeight: 700,
                                color: rank === 0 ? h.accent : "#d0c0a0",
                                fontFamily: "'Cinzel Decorative', serif",
                                letterSpacing: 1,
                                lineHeight: 1,
                              }}
                            >
                              {p.name}
                            </div>
                            <div
                              style={{
                                fontSize: 25,
                                color: "#4a3a28",
                                marginTop: 5,
                                fontFamily: "'IM Fell English', serif",
                                fontStyle: "italic",
                              }}
                            >
                              {p.wins} victories
                            </div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div
                              style={{
                                fontSize: 9,
                                letterSpacing: 3,
                                color: h.secondary,
                                fontFamily: "'Cinzel', serif",
                                textTransform: "uppercase",
                                marginBottom: 2,
                                opacity: 0.6,
                              }}
                            >
                              Rank {RANK_ROMAN[rank]}
                            </div>
                            <div
                              style={{
                                fontSize: 38,
                                fontWeight: 900,
                                lineHeight: 1,
                                color: rank === 0 ? h.accent : "#a09060",
                                fontFamily: "'Cinzel', serif",
                                textShadow:
                                  rank === 0
                                    ? `0 0 20px ${h.accent}55`
                                    : "none",
                              }}
                            >
                              {p.total}
                            </div>
                            <div
                              style={{
                                fontSize: 8,
                                color: "#3a2a18",
                                letterSpacing: 3,
                                fontFamily: "'Cinzel', serif",
                                textTransform: "uppercase",
                              }}
                            >
                              Points
                            </div>
                          </div>
                        </div>
                        <OrnateRule color={h.primary} />
                        <div
                          style={{ display: "flex", gap: 20, flexWrap: "wrap" }}
                        >
                          {[
                            { label: "Wins", val: p.wins },
                            { label: "Bonus", val: p.bonus },
                            { label: "Weekly", val: p.weeklyBonus },
                          ].map((b) => (
                            <div key={b.label}>
                              <span
                                style={{
                                  color: "#3a2a18",
                                  fontFamily: "'Cinzel', serif",
                                  fontSize: 8,
                                  letterSpacing: 2,
                                  textTransform: "uppercase",
                                }}
                              >
                                {b.label}{" "}
                              </span>
                              <span
                                style={{
                                  color: h.secondary,
                                  fontSize: 13,
                                  fontFamily: "'Cinzel', serif",
                                }}
                              >
                                {b.val}
                              </span>
                            </div>
                          ))}
                        </div>
                        {Object.entries(p.bonusCounts).length > 0 && (
                          <div
                            style={{
                              marginTop: 10,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 5,
                            }}
                          >
                            {Object.entries(p.bonusCounts).map(
                              ([id, count]) => {
                                const cat = BONUS_CATEGORIES.find(
                                  (c) => c.id === id,
                                );
                                return (
                                  <span
                                    key={id}
                                    style={{
                                      fontSize: 11,
                                      padding: "3px 9px",
                                      background: `${h.primary}1a`,
                                      borderRadius: 2,
                                      border: `1px solid ${h.primary}44`,
                                      color: h.secondary,
                                      fontFamily: "'IM Fell English', serif",
                                    }}
                                  >
                                    {cat?.emoji} {cat?.name} ×{count}
                                  </span>
                                );
                              },
                            )}
                          </div>
                        )}
                        <div
                          style={{
                            marginTop: 10,
                            textAlign: "right",
                            fontSize: 10,
                            color: h.accent + "88",
                          }}
                        >
                          ▲
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        height: 1,
                        background: `linear-gradient(90deg, transparent, ${h.primary}66, transparent)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* BONUS REFERENCE */}
            <div
              style={{
                marginTop: 28,
                background: "rgba(8,6,4,0.95)",
                border: "1px solid #1e1408",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: 2,
                  background:
                    "linear-gradient(90deg, transparent, #5a3a14, transparent)",
                }}
              />
              <div style={{ padding: "16px 20px" }}>
                <div
                  onClick={() => setShowBonusRef((v) => !v)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      fontSize: 10,
                      letterSpacing: 4,
                      color: "#5a4018",
                      textTransform: "uppercase",
                      fontFamily: "'Cinzel', serif",
                      textAlign: "center",
                    }}
                  >
                    ⚜ Honors & Achievements ⚜
                  </div>
                  <span style={{ fontSize: 18, color: "#5a4018" }}>
                    {showBonusRef ? "▲" : "▼"}
                  </span>
                </div>
                {showBonusRef && (
                  <>
                    {BONUS_CATEGORIES.map((cat, i) => (
                      <div
                        key={cat.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "6px 0",
                          borderBottom:
                            i < BONUS_CATEGORIES.length - 1
                              ? "1px solid rgba(255,255,255,0.03)"
                              : "none",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            width: 24,
                            textAlign: "center",
                          }}
                        >
                          {cat.emoji}
                        </span>
                        <div style={{ flex: 1 }}>
                          <span
                            style={{
                              fontSize: 13,
                              color: "#8a7848",
                              fontFamily: "'IM Fell English', serif",
                            }}
                          >
                            {cat.name}
                          </span>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#5a4a28",
                              fontFamily: "'IM Fell English', serif",
                              fontStyle: "italic",
                            }}
                          >
                            {cat.desc}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            color: "#3a6a3a",
                            fontFamily: "'Cinzel', serif",
                            letterSpacing: 1,
                          }}
                        >
                          +{cat.points}
                        </span>
                      </div>
                    ))}
                    <OrnateRule />
                    <div
                      style={{
                        fontSize: 11,
                        color: "#2a1e0a",
                        fontFamily: "'IM Fell English', serif",
                        fontStyle: "italic",
                        textAlign: "center",
                      }}
                    >
                      Weekly Honour: +1 to the player with most victories each
                      week
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#2a1e0a",
                        fontFamily: "'IM Fell English', serif",
                        fontStyle: "italic",
                        textAlign: "center",
                        marginTop: 3,
                      }}
                    >
                      Playoff Week: placement points doubled
                    </div>
                  </>
                )}
              </div>
              <div
                style={{
                  height: 2,
                  background:
                    "linear-gradient(90deg, transparent, #2a1a08, transparent)",
                }}
              />
            </div>
          </div>
        )}

        {/* GAME LOG */}
        {!loading && view === "log" && (
          <div>
            {games.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "#3a2a18",
                  padding: "60px 20px",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>📜</div>
                <div
                  style={{
                    fontFamily: "'IM Fell English', serif",
                    fontStyle: "italic",
                    fontSize: 15,
                  }}
                >
                  The chronicle awaits its first entry...
                </div>
              </div>
            )}
            {[...games].reverse().map((game) => {
              const sorted = game.placements
                .map((pos, pi) => ({ pi, pos }))
                .sort((a, b) => a.pos - b.pos);
              return (
                <div
                  key={game.id}
                  style={{
                    background: "rgba(10,8,6,0.9)",
                    border: "1px solid #1e1408",
                    borderRadius: 3,
                    padding: 16,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        color: "#5a4018",
                        letterSpacing: 3,
                        fontFamily: "'Cinzel', serif",
                        textTransform: "uppercase",
                      }}
                    >
                      Week {game.week}
                      {game.is_playoff ? " · 🏆 Playoff" : ""}
                      {game.player_count === 4 ? " · 4 Players" : ""}
                    </div>
                    <button
                      onClick={() => deleteGame(game.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#2a1010",
                        cursor: "pointer",
                        fontSize: 10,
                        fontFamily: "'Cinzel', serif",
                        letterSpacing: 1,
                      }}
                    >
                      ✕ remove
                    </button>
                  </div>
                  <OrnateRule />
                  {sorted.map(({ pi, pos }) => {
                    const h = HERALDRY[pi] || HERALDRY[0];
                    const placePts =
                      game.player_count === 4
                        ? PLACEMENT_POINTS_4P[pos]
                        : PLACEMENT_POINTS_3P[pos];
                    const mult = game.is_playoff ? 2 : 1;
                    const bonusList = Object.entries(
                      game.bonuses[pi] || {},
                    ).filter(([, v]) => v);
                    return (
                      <div
                        key={pi}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "5px 0",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            width: 18,
                            color: [h.accent, "#909090", "#8a5020"][pos],
                            fontFamily: "'Cinzel', serif",
                          }}
                        >
                          {pos + 1}.
                        </span>
                        <span
                          style={{
                            fontSize: 14,
                            flex: 1,
                            color: "#b8a878",
                            fontFamily: "'IM Fell English', serif",
                          }}
                        >
                          {pi < 3 ? players[pi] : "Guest"}
                        </span>
                        <span style={{ fontSize: 12, color: "#5a4a28" }}>
                          {bonusList
                            .map(
                              ([id]) =>
                                BONUS_CATEGORIES.find((c) => c.id === id)
                                  ?.emoji,
                            )
                            .join("")}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: h.secondary,
                            minWidth: 40,
                            textAlign: "right",
                            fontFamily: "'Cinzel', serif",
                          }}
                        >
                          {placePts * mult +
                            bonusList.reduce(
                              (s, [id]) =>
                                s +
                                (BONUS_CATEGORIES.find((c) => c.id === id)
                                  ?.points ?? 0),
                              0,
                            )}{" "}
                          pts
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* ADD GAME */}
        {view === "addGame" && newGame && (
          <div
            style={{
              background: "rgba(8,6,4,0.98)",
              border: "1px solid #2a1a08",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 2,
                background:
                  "linear-gradient(90deg, transparent, #8a5a18, transparent)",
              }}
            />
            <div style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: 4,
                  color: "#c8943a",
                  fontFamily: "'Cinzel', serif",
                  textTransform: "uppercase",
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                ⚔ Record a Battle ⚔
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 20,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <label style={labelStyle}>Week</label>
                  <select
                    value={newGame.week}
                    onChange={(e) =>
                      setNewGame((g) => ({ ...g, week: +e.target.value }))
                    }
                    style={selectStyle}
                  >
                    {Array.from({ length: SEASON_WEEKS }, (_, i) => i + 1).map(
                      (w) => (
                        <option key={w} value={w}>
                          Week {w}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Players</label>
                  <select
                    value={newGame.playerCount}
                    onChange={(e) => {
                      const cnt = +e.target.value;
                      setNewGame((g) => ({
                        ...g,
                        playerCount: cnt,
                        placements: Array(cnt).fill(""),
                        bonuses: Array(cnt)
                          .fill(null)
                          .map(() => ({})),
                      }));
                    }}
                    style={selectStyle}
                  >
                    <option value={3}>3 Players</option>
                    <option value={4}>4 Players (Guest)</option>
                  </select>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    paddingBottom: 2,
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 10,
                      color: "#5a4820",
                      cursor: "pointer",
                      fontFamily: "'Cinzel', serif",
                      letterSpacing: 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={newGame.isPlayoff}
                      onChange={(e) =>
                        setNewGame((g) => ({
                          ...g,
                          isPlayoff: e.target.checked,
                        }))
                      }
                      style={{ accentColor: "#c8943a" }}
                    />
                    Playoff (2×)
                  </label>
                </div>
              </div>
              <OrnateRule />
              <div style={{ marginBottom: 20 }}>
                <div style={labelStyle}>Placement</div>
                {Array.from({ length: newGame.playerCount }, (_, pi) => {
                  const h = HERALDRY[pi] || HERALDRY[0];
                  return (
                    <div
                      key={pi}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          color: h.secondary,
                          width: 72,
                          fontFamily: "'IM Fell English', serif",
                        }}
                      >
                        {pi < 3 ? players[pi] : "Guest"}
                      </span>
                      <div style={{ display: "flex", gap: 5 }}>
                        {Array.from(
                          { length: newGame.playerCount },
                          (_, place) => (
                            <button
                              key={place}
                              onClick={() =>
                                setNewGame((g) => {
                                  const p = [...g.placements];
                                  const existing = p.indexOf(place);
                                  if (existing !== -1) p[existing] = "";
                                  p[pi] = place;
                                  return { ...g, placements: p };
                                })
                              }
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 3,
                                border: `1px solid ${newGame.placements[pi] === place ? h.accent : "#2a1a08"}`,
                                background:
                                  newGame.placements[pi] === place
                                    ? `${h.primary}33`
                                    : "rgba(15,10,5,0.7)",
                                color:
                                  newGame.placements[pi] === place
                                    ? h.accent
                                    : "#3a2a18",
                                fontSize: 13,
                                cursor: "pointer",
                                fontFamily: "'Cinzel', serif",
                              }}
                            >
                              {place + 1}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <OrnateRule />
              <div style={{ marginBottom: 20 }}>
                <div style={labelStyle}>Honours</div>
                {BONUS_CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                    }}
                  >
                    <span
                      style={{ fontSize: 14, width: 24, textAlign: "center" }}
                    >
                      {cat.emoji}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#7a6838",
                        flex: 1,
                        fontFamily: "'IM Fell English', serif",
                      }}
                    >
                      {cat.name}{" "}
                      <span style={{ color: "#3a6a3a", fontSize: 11 }}>
                        +{cat.points}
                      </span>
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {Array.from({ length: newGame.playerCount }, (_, pi) => {
                        const h = HERALDRY[pi] || HERALDRY[0];
                        const active = newGame.bonuses[pi]?.[cat.id];
                        return (
                          <button
                            key={pi}
                            onClick={() =>
                              setNewGame((g) => {
                                const b = g.bonuses.map((x) => ({ ...x }));
                                b[pi][cat.id] = !b[pi][cat.id];
                                return { ...g, bonuses: b };
                              })
                            }
                            title={pi < 3 ? players[pi] : "Guest"}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 3,
                              border: `1px solid ${active ? h.accent + "77" : "#2a1a08"}`,
                              background: active
                                ? `${h.primary}33`
                                : "rgba(15,10,5,0.7)",
                              color: active ? h.accent : "#2a2010",
                              fontSize: 10,
                              cursor: "pointer",
                              fontFamily: "'Cinzel', serif",
                            }}
                          >
                            {pi < 3 ? players[pi][0] : "G"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Admin Password</label>
                <input
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Required to log game"
                  style={{
                    background: "#0c0904",
                    border: "1px solid #2a1a08",
                    borderRadius: 3,
                    color: "#b09050",
                    padding: "7px 12px",
                    fontFamily: "'Cinzel', serif",
                    fontSize: 12,
                    width: "100%",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={submitGame}
                  style={{
                    flex: 1,
                    padding: 13,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #9d670b, #5a3a10)",
                    border: "1px solid #7a5a18",
                    color: "#f0d080",
                    fontSize: 11,
                    fontFamily: "'Cinzel', serif",
                    cursor: "pointer",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  ⚔ Record Battle
                </button>
                <button
                  onClick={() => {
                    setView("standings");
                    setNewGame(null);
                  }}
                  style={{
                    padding: "13px 18px",
                    borderRadius: 3,
                    background: "none",
                    border: "1px solid #1e1408",
                    color: "#3a2a18",
                    fontFamily: "'Cinzel', serif",
                    cursor: "pointer",
                    fontSize: 10,
                    letterSpacing: 1,
                  }}
                >
                  Retreat
                </button>
              </div>
            </div>
            <div
              style={{
                height: 2,
                background:
                  "linear-gradient(90deg, transparent, #2a1a08, transparent)",
              }}
            />
          </div>
        )}
      </div>

      {/* FAB */}
      {view !== "addGame" && (
        <div
          onClick={initNewGame}
          className="fab"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 80,
            height: 80,
            cursor: "pointer",
          }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80">
            <defs>
              <path id="curve-top" d="M 10,40 a 30,30 0 1,1 60,0" />
              <path id="curve-bot" d="M 10,40 a 30,30 0 0,0 60,0" />
            </defs>
            <circle cx="40" cy="40" r="36" fill="url(#fabGrad)" />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#f0d08055"
              strokeWidth="1.5"
            />
            <circle
              cx="40"
              cy="40"
              r="30"
              fill="none"
              stroke="#f0d08022"
              strokeWidth="1"
            />
            <text
              fontSize="8"
              fontFamily="'Cinzel', serif"
              letterSpacing="2.5"
              fill="#f0d080cc"
            >
              <textPath href="#curve-top" startOffset="50%" textAnchor="middle">
                LOG GAME
              </textPath>
            </text>
            <text
              fontSize="8"
              fontFamily="'Cinzel', serif"
              letterSpacing="2.5"
              fill="#f0d08066"
            >
              <textPath href="#curve-bot" startOffset="50%" textAnchor="middle">
                ⚜ · ⚜
              </textPath>
            </text>
            <text
              x="40"
              y="46"
              textAnchor="middle"
              fontSize="22"
              fill="#f0d080"
            >
              ⚔
            </text>
            <defs>
              <radialGradient id="fabGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8a5a18" />
                <stop offset="100%" stopColor="#3a1e04" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            left: "50%",
            transform: "translateX(-50%)",
            background: toast.type === "error" ? "#120606" : "#060c06",
            border: `1px solid ${toast.type === "error" ? "#4a1010" : "#1a3a1a"}`,
            color: toast.type === "error" ? "#a07060" : "#70a870",
            padding: "10px 24px",
            borderRadius: 3,
            fontSize: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
            zIndex: 100,
            fontFamily: "'IM Fell English', serif",
            fontStyle: "italic",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Legendary Modal */}
      {celebrateGame && (
        <div
          onClick={() => setCelebrateGame(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #000000, #080f08)",
              border: "2px solid #c8943a",
              borderRadius: 3,
              padding: 36,
              textAlign: "center",
              maxWidth: 320,
              boxShadow: "0 0 80px rgba(200,148,58,0.25)",
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 16 }}>🎂🎂</div>
            <div
              style={{
                fontSize: 15,
                color: "#f0d080",
                marginBottom: 10,
                letterSpacing: 3,
                fontFamily: "'Cinzel Decorative', serif",
              }}
            >
              The Long-Expected Party
            </div>
            <OrnateRule color="#5a3a14" />
            <div
              style={{
                fontSize: 13,
                color: "#8a7848",
                lineHeight: 1.9,
                fontFamily: "'IM Fell English', serif",
                fontStyle: "italic",
              }}
            >
              "I don't know half of you half as well as I should like, and I
              like less than half of you half as well as you deserve."
            </div>
            <OrnateRule color="#2a1a08" />
            <div
              style={{
                fontSize: 12,
                color: "#5a4028",
                fontFamily: "'IM Fell English', serif",
                fontStyle: "italic",
              }}
            >
              A player has won with exactly 111 life.
              <br />A truly legendary feat.
            </div>
            <div
              style={{
                marginTop: 16,
                fontSize: 9,
                color: "#2a1a08",
                letterSpacing: 3,
                fontFamily: "'Cinzel', serif",
              }}
            >
              TAP TO DISMISS
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  fontSize: 8,
  color: "#4a3818",
  letterSpacing: 3,
  display: "block",
  marginBottom: 5,
  fontFamily: "'Cinzel', serif",
  textTransform: "uppercase",
};

const selectStyle = {
  background: "#0c0904",
  border: "1px solid #2a1a08",
  borderRadius: 3,
  color: "#b09050",
  padding: "7px 12px",
  fontFamily: "'Cinzel', serif",
  fontSize: 12,
};
