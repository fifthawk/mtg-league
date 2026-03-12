import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const BONUS_CATEGORIES = [
  { id: "firstBlood", emoji: "🩸", name: "First Blood", desc: "Deal the first combat damage", points: 1 },
  { id: "commanderKO", emoji: "⚔️", name: "Commander KO", desc: "Eliminate a player via commander damage", points: 1 },
  { id: "fullTable", emoji: "💀", name: "Full Table", desc: "Eliminate all opponents in one turn", points: 1 },
  { id: "speedDemon", emoji: "🏃", name: "Speed Demon", desc: "Win before turn 8", points: 1 },
  { id: "lastStand", emoji: "💪", name: "Last Stand", desc: "Win after being at 5 or fewer life", points: 1 },
  { id: "overkill", emoji: "🎯", name: "Overkill", desc: "Win dealing 10+ excess lethal damage", points: 1 },
  { id: "bilboBirthday", emoji: "🎂", name: "Bilbo's Birthday", desc: "Win with 111+ life", points: 1 },
  { id: "longExpectedParty", emoji: "🎂🎂", name: "The Long-Expected Party", desc: "Win with EXACTLY 111 life", points: 3 },
];

const PLACEMENT_POINTS_3P = [3, 1, 0];
const PLACEMENT_POINTS_4P = [4, 2, 1, 0];
const SEASON_WEEKS = 8;

const DEFAULT_PLAYERS = ["Jack", "Brother", "Cousin"];

export default function App() {
  const [players] = useState(DEFAULT_PLAYERS);
  const [games, setGames] = useState([]);
  const [view, setView] = useState("standings");
  const [newGame, setNewGame] = useState(null);
  const [toast, setToast] = useState(null);
  const [celebrateGame, setCelebrateGame] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load games from Supabase on mount
  useEffect(() => {
    fetchGames();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("games-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "games" }, () => {
        fetchGames();
      })
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
      bonuses: Array(3).fill(null).map(() => ({})),
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

    const { error } = await supabase.from("games").insert({
      week: newGame.week,
      player_count: newGame.playerCount,
      is_playoff: newGame.isPlayoff,
      placements: newGame.placements,
      bonuses: newGame.bonuses,
    });

    if (error) {
      showToast("Error saving game!", "error");
      return;
    }

    const hasParty = newGame.bonuses.some((b) => b?.longExpectedParty);
    if (hasParty) setCelebrateGame(true);

    showToast("Game logged! 🎉");
    setView("log");
    setNewGame(null);
  };

  const deleteGame = async (id) => {
    const { error } = await supabase.from("games").delete().eq("id", id);
    if (error) showToast("Error removing game!", "error");
    else showToast("Game removed");
  };

  const standings = () => {
    return players.map((name, pi) => {
      let placement = 0, bonus = 0, wins = 0, gamesPlayed = 0;
      const bonusCounts = {};

      games.forEach((g) => {
        if (pi >= g.player_count) return;
        gamesPlayed++;
        const pos = g.placements.indexOf(pi);
        const placementPts =
          g.player_count === 4 ? PLACEMENT_POINTS_4P[pos] ?? 0 : PLACEMENT_POINTS_3P[pos] ?? 0;
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

      return { name, placement, bonus, total: placement + bonus, wins, gamesPlayed, bonusCounts };
    });
  };

  const weeklyBonus = () => {
    const weeks = {};
    games.forEach((g) => {
      if (!weeks[g.week]) weeks[g.week] = {};
      players.forEach((_, pi) => {
        if (pi >= g.player_count) return;
        if (g.placements[0] === pi) weeks[g.week][pi] = (weeks[g.week][pi] || 0) + 1;
      });
    });
    const bonuses = {};
    Object.entries(weeks).forEach(([, wins]) => {
      const max = Math.max(...Object.values(wins));
      if (max === 0) return;
      Object.entries(wins)
        .filter(([, w]) => w === max)
        .forEach(([pi]) => {
          bonuses[players[parseInt(pi)]] = (bonuses[players[parseInt(pi)]] || 0) + 1;
        });
    });
    return bonuses;
  };

  const wBonus = weeklyBonus();
  const finalStandings = standings()
    .map((s) => ({ ...s, total: s.total + (wBonus[s.name] || 0), weeklyBonus: wBonus[s.name] || 0 }))
    .sort((a, b) => b.total - a.total);

  const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
  const RANK_LABELS = ["👑", "🥈", "🥉"];

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f", color: "#e8e0d0",
      fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
      backgroundImage: `
        radial-gradient(ellipse at 20% 20%, rgba(101,63,20,0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(30,60,40,0.15) 0%, transparent 50%)
      `,
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg, #1a0e05 0%, #0d1a0d 50%, #0a0a0f 100%)",
        borderBottom: "1px solid #3a2a1a", padding: "24px 20px 20px",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center top, rgba(180,120,40,0.2) 0%, transparent 60%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 11, letterSpacing: 6, color: "#8a6a30", textTransform: "uppercase", marginBottom: 6 }}>
            The Fellowship of the Fetch Step
          </div>
          <h1 style={{
            margin: 0, fontSize: 28, fontWeight: 700,
            background: "linear-gradient(135deg, #c8943a, #f0d080, #c8943a)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 2,
          }}>Commander League</h1>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#5a8a5a", textTransform: "uppercase", marginTop: 6 }}>
            Season I • {games.length} Games Played
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", borderBottom: "1px solid #2a1f10", background: "#0d0d12" }}>
        {[{ id: "standings", label: "⚔ Standings" }, { id: "log", label: "📜 Game Log" }].map((tab) => (
          <button key={tab.id} onClick={() => setView(tab.id)} style={{
            flex: 1, padding: "12px 8px", background: "none", border: "none",
            borderBottom: view === tab.id ? "2px solid #c8943a" : "2px solid transparent",
            color: view === tab.id ? "#f0d080" : "#7a6a50",
            fontFamily: "inherit", fontSize: 13, letterSpacing: 1, cursor: "pointer",
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 600, margin: "0 auto" }}>

        {loading && (
          <div style={{ textAlign: "center", color: "#4a3a20", padding: "60px 20px" }}>
            Loading league data...
          </div>
        )}

        {/* STANDINGS */}
        {!loading && view === "standings" && (
          <div>
            {finalStandings.map((p, rank) => (
              <div key={p.name} style={{
                background: rank === 0 ? "linear-gradient(135deg, rgba(180,120,20,0.15) 0%, rgba(20,20,30,0.8) 100%)" : "rgba(20,20,30,0.6)",
                border: `1px solid ${rank === 0 ? "#5a3a10" : "#2a2a3a"}`,
                borderRadius: 8, padding: 16, marginBottom: 12, position: "relative", overflow: "hidden",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: `radial-gradient(circle, ${RANK_COLORS[rank]}33, ${RANK_COLORS[rank]}11)`,
                    border: `2px solid ${RANK_COLORS[rank]}66`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, flexShrink: 0,
                  }}>{RANK_LABELS[rank]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: rank === 0 ? "#f0d080" : "#e0d0c0" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "#6a5a40", marginTop: 2 }}>{p.gamesPlayed} games • {p.wins} wins</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 26, fontWeight: 700, color: rank === 0 ? "#f0d080" : "#c0b090" }}>{p.total}</div>
                    <div style={{ fontSize: 10, color: "#5a4a30", letterSpacing: 1 }}>POINTS</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {[{ label: "Placement", val: p.placement }, { label: "Bonus", val: p.bonus }, { label: "Weekly", val: p.weeklyBonus }].map((b) => (
                    <div key={b.label} style={{ fontSize: 11 }}>
                      <span style={{ color: "#5a4a30" }}>{b.label}: </span>
                      <span style={{ color: "#a09070" }}>{b.val}</span>
                    </div>
                  ))}
                </div>
                {Object.entries(p.bonusCounts).length > 0 && (
                  <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {Object.entries(p.bonusCounts).map(([id, count]) => {
                      const cat = BONUS_CATEGORIES.find((c) => c.id === id);
                      return (
                        <span key={id} style={{
                          fontSize: 11, padding: "2px 7px",
                          background: "rgba(255,255,255,0.05)", borderRadius: 20,
                          border: "1px solid rgba(255,255,255,0.1)", color: "#9a8a60",
                        }}>{cat?.emoji} {cat?.name} ×{count}</span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Bonus Reference */}
            <div style={{ marginTop: 24, background: "rgba(15,20,15,0.8)", border: "1px solid #1a2a1a", borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 12, letterSpacing: 3, color: "#4a7a4a", textTransform: "uppercase", marginBottom: 12 }}>Bonus Points</div>
              {BONUS_CATEGORIES.map((cat) => (
                <div key={cat.id} style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <span style={{ fontSize: 14 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 13, color: "#b0a080", flex: 1 }}>{cat.name}</span>
                  <span style={{ fontSize: 11, color: "#4a7a4a" }}>+{cat.points}</span>
                </div>
              ))}
              <div style={{ marginTop: 12, fontSize: 11, color: "#3a5a3a" }}>Weekly bonus: +1 to the player with most wins each week</div>
              <div style={{ marginTop: 4, fontSize: 11, color: "#3a5a3a" }}>Playoff week: placement points doubled</div>
            </div>
          </div>
        )}

        {/* GAME LOG */}
        {!loading && view === "log" && (
          <div>
            {games.length === 0 && (
              <div style={{ textAlign: "center", color: "#4a3a20", padding: "60px 20px", fontSize: 14 }}>
                No games logged yet.<br /><span style={{ fontSize: 12, color: "#3a2a10" }}>The saga awaits...</span>
              </div>
            )}
            {[...games].reverse().map((game) => {
              const sorted = game.placements.map((pos, pi) => ({ pi, pos })).sort((a, b) => a.pos - b.pos);
              return (
                <div key={game.id} style={{ background: "rgba(20,18,30,0.7)", border: "1px solid #2a2a3a", borderRadius: 8, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: "#5a4a30", letterSpacing: 2 }}>
                      WEEK {game.week}{game.is_playoff ? " • 🏆 PLAYOFF" : ""}{game.player_count === 4 ? " • 4 PLAYERS" : ""}
                    </div>
                    <button onClick={() => deleteGame(game.id)} style={{ background: "none", border: "none", color: "#4a2a2a", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
                      ✕ remove
                    </button>
                  </div>
                  {sorted.map(({ pi, pos }) => {
                    const placePts = game.player_count === 4 ? PLACEMENT_POINTS_4P[pos] : PLACEMENT_POINTS_3P[pos];
                    const mult = game.is_playoff ? 2 : 1;
                    const bonusList = Object.entries(game.bonuses[pi] || {}).filter(([, v]) => v);
                    return (
                      <div key={pi} style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
                        <span style={{ fontSize: 12, width: 16, color: ["#f0d080", "#a0a0b0", "#a06030"][pos] }}>{pos + 1}.</span>
                        <span style={{ fontSize: 14, flex: 1, color: "#d0c0a0" }}>{pi < 3 ? players[pi] : "Guest"}</span>
                        <span style={{ fontSize: 11, color: "#6a5a30" }}>{bonusList.map(([id]) => BONUS_CATEGORIES.find((c) => c.id === id)?.emoji).join("")}</span>
                        <span style={{ fontSize: 13, color: "#8a7a50", minWidth: 40, textAlign: "right" }}>
                          {placePts * mult + bonusList.reduce((s, [id]) => s + (BONUS_CATEGORIES.find((c) => c.id === id)?.points ?? 0), 0)} pts
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
          <div style={{ background: "rgba(15,15,20,0.95)", border: "1px solid #3a2a10", borderRadius: 10, padding: 20 }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 16, color: "#c8943a", letterSpacing: 2 }}>LOG GAME</h2>

            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <div>
                <label style={{ fontSize: 11, color: "#5a4a30", letterSpacing: 2, display: "block", marginBottom: 4 }}>WEEK</label>
                <select value={newGame.week} onChange={(e) => setNewGame((g) => ({ ...g, week: +e.target.value }))} style={selectStyle}>
                  {Array.from({ length: SEASON_WEEKS }, (_, i) => i + 1).map((w) => <option key={w} value={w}>Week {w}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#5a4a30", letterSpacing: 2, display: "block", marginBottom: 4 }}>PLAYERS</label>
                <select value={newGame.playerCount} onChange={(e) => {
                  const cnt = +e.target.value;
                  setNewGame((g) => ({ ...g, playerCount: cnt, placements: Array(cnt).fill(""), bonuses: Array(cnt).fill(null).map(() => ({})) }));
                }} style={selectStyle}>
                  <option value={3}>3 Players</option>
                  <option value={4}>4 Players (Guest)</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#7a6a40", cursor: "pointer" }}>
                  <input type="checkbox" checked={newGame.isPlayoff} onChange={(e) => setNewGame((g) => ({ ...g, isPlayoff: e.target.checked }))} style={{ accentColor: "#c8943a" }} />
                  Playoff (2× pts)
                </label>
              </div>
            </div>

            {/* Placements */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#5a4a30", letterSpacing: 2, marginBottom: 10 }}>PLACEMENT</div>
              {Array.from({ length: newGame.playerCount }, (_, pi) => (
                <div key={pi} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#7a6a50", width: 80 }}>{pi < 3 ? players[pi] : "Guest"}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {Array.from({ length: newGame.playerCount }, (_, place) => (
                      <button key={place} onClick={() => setNewGame((g) => {
                        const p = [...g.placements];
                        const existing = p.indexOf(place);
                        if (existing !== -1) p[existing] = "";
                        p[pi] = place;
                        return { ...g, placements: p };
                      })} style={{
                        width: 32, height: 32, borderRadius: 6,
                        border: `1px solid ${newGame.placements[pi] === place ? "#c8943a" : "#2a2a3a"}`,
                        background: newGame.placements[pi] === place ? "rgba(200,148,58,0.2)" : "rgba(30,30,40,0.5)",
                        color: newGame.placements[pi] === place ? "#f0d080" : "#5a5a6a",
                        fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                      }}>{place + 1}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bonuses */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#5a4a30", letterSpacing: 2, marginBottom: 10 }}>BONUS POINTS</div>
              {BONUS_CATEGORIES.map((cat) => (
                <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: 14, width: 28 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 12, color: "#9a8a60", flex: 1 }}>{cat.name} <span style={{ color: "#4a7a4a" }}>+{cat.points}</span></span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {Array.from({ length: newGame.playerCount }, (_, pi) => (
                      <button key={pi} onClick={() => setNewGame((g) => {
                        const b = g.bonuses.map((x) => ({ ...x }));
                        b[pi][cat.id] = !b[pi][cat.id];
                        return { ...g, bonuses: b };
                      })} title={pi < 3 ? players[pi] : "Guest"} style={{
                        width: 28, height: 28, borderRadius: 6,
                        border: `1px solid ${newGame.bonuses[pi]?.[cat.id] ? "#4a7a4a" : "#2a2a3a"}`,
                        background: newGame.bonuses[pi]?.[cat.id] ? "rgba(74,122,74,0.25)" : "rgba(30,30,40,0.5)",
                        color: newGame.bonuses[pi]?.[cat.id] ? "#7aaa7a" : "#4a4a5a",
                        fontSize: 10, cursor: "pointer", fontFamily: "inherit",
                      }}>{pi < 3 ? players[pi][0] : "G"}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={submitGame} style={{
                flex: 1, padding: 12, borderRadius: 8,
                background: "linear-gradient(135deg, #3a2a08, #5a3a10)",
                border: "1px solid #8a6a20", color: "#f0d080",
                fontSize: 14, fontFamily: "inherit", cursor: "pointer", letterSpacing: 1,
              }}>⚔ Log Game</button>
              <button onClick={() => { setView("standings"); setNewGame(null); }} style={{
                padding: "12px 16px", borderRadius: 8, background: "none",
                border: "1px solid #2a2a3a", color: "#5a5a6a", fontFamily: "inherit", cursor: "pointer",
              }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      {view !== "addGame" && (
        <button onClick={initNewGame} style={{
          position: "fixed", bottom: 24, right: 24, width: 56, height: 56,
          borderRadius: "50%", background: "linear-gradient(135deg, #8a5a10, #c8943a)",
          border: "none", color: "#fff", fontSize: 24,
          boxShadow: "0 4px 20px rgba(200,148,58,0.4)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>+</button>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
          background: toast.type === "error" ? "#3a1010" : "#1a3a1a",
          border: `1px solid ${toast.type === "error" ? "#6a2020" : "#2a6a2a"}`,
          color: toast.type === "error" ? "#f08080" : "#80c880",
          padding: "10px 20px", borderRadius: 8, fontSize: 13,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)", zIndex: 100,
        }}>{toast.msg}</div>
      )}

      {/* Legendary Moment */}
      {celebrateGame && (
        <div onClick={() => setCelebrateGame(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20,
        }}>
          <div style={{
            background: "linear-gradient(135deg, #1a1000, #0a1a0a)",
            border: "2px solid #c8943a", borderRadius: 12, padding: 32,
            textAlign: "center", maxWidth: 320,
            boxShadow: "0 0 60px rgba(200,148,58,0.4)",
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎂🎂</div>
            <div style={{ fontSize: 18, color: "#f0d080", marginBottom: 8, letterSpacing: 2 }}>THE LONG-EXPECTED PARTY</div>
            <div style={{ fontSize: 13, color: "#9a8a50", lineHeight: 1.6 }}>
              A player has won with exactly 111 life.<br />This is a legendary moment. Bilbo himself would be proud.
            </div>
            <div style={{ marginTop: 16, fontSize: 11, color: "#4a3a20" }}>tap to dismiss</div>
          </div>
        </div>
      )}
    </div>
  );
}

const selectStyle = {
  background: "#1a1a25", border: "1px solid #3a2a10", borderRadius: 6,
  color: "#c0a870", padding: "6px 10px", fontFamily: "inherit", fontSize: 13,
};