import React, { useState, useEffect, useRef, useCallback } from "react";
import "./PowerGrid.css";
import eventBus from "shared/eventBus";

const ZONES = [
  { id: "A", name: "Downtown Sector", mw: 120 },
  { id: "B", name: "Industrial Bay", mw: 95 },
  { id: "C", name: "Neon Heights", mw: 78 },
  { id: "D", name: "Old Grid", mw: 64 },
  { id: "E", name: "Harbor Lines", mw: 88 },
  { id: "F", name: "Metro Core", mw: 110 },
];

const ZONE_IDS = ZONES.map((z) => z.id);

const defaultZoneStates = () =>
  Object.fromEntries(ZONE_IDS.map((id) => [id, "online"]));

export default function PowerGrid() {
  const [cityPower, setCityPower] = useState(100);
  const [showFailure, setShowFailure] = useState(false);
  const [zoneStates, setZoneStates] = useState(defaultZoneStates);
  const timersRef = useRef([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    // TODO: ecouter 'weather:change'
    // Si intensity >= 80 → zones A,B,D,E en crise, cityPower 34%
    // Si intensity >= 50 → zones B,D en warning, cityPower 72%
    // Si intensity < 50 → tout revient online
    //
    // Apres avoir change l'etat, emettre 'power:outage' avec:
    // { zones: [...], severity: 'partial'|'total', cityPower: number }

    // TODO: ecouter 'hacker:command'
    // Si command = 'blackout' → cascade A→F (setTimeout 300ms entre chaque), cityPower 0%
    // Si command = 'love' → toutes les zones en love, cityPower 100%
    // Si command = 'reset' → rallumage F→A (setTimeout 300ms), cityPower 100%

    return () => {
      // cleanup: unsub des deux listeners + clearTimers
    };
  }, [clearTimers]);

  const indicatorColor = (status) => {
    switch (status) {
      case "orange": return "#ff8800";
      case "red": return "#ff003c";
      case "black": return "#222";
      case "love": return "#00ff88";
      default: return "#00ff88";
    }
  };

  const zoneClass = (status) => {
    switch (status) {
      case "orange": return "zone zone-warning";
      case "red": return "zone zone-critical";
      case "black": return "zone zone-offline";
      case "love": return "zone zone-love";
      default: return "zone zone-online";
    }
  };

  const powerBarStyle = {
    width: `${Math.max(0, Math.min(100, cityPower))}%`,
    background:
      cityPower === 0 ? "#ff003c" : cityPower <= 50 ? "#ff8800" : "#00ff88",
  };

  return (
    <div className="powergrid">
      <div className="grid-header">
        <span className="grid-title">POWER GRID</span>
        <span className="city-power">CITY POWER: {cityPower}%</span>
      </div>

      <div className="simulate-row">
        <button className="simulate-btn" onClick={() => console.log('[PowerGrid] TODO: simulate weather intensity 50')}>
          WEATHER 50
        </button>
        <button className="simulate-btn" onClick={() => console.log('[PowerGrid] TODO: simulate weather intensity 80')}>
          WEATHER 80
        </button>
        <button className="simulate-btn" onClick={() => console.log('[PowerGrid] TODO: simulate blackout')}>
          BLACKOUT
        </button>
        <button className="simulate-btn" onClick={() => console.log('[PowerGrid] TODO: simulate love')}>
          LOVE
        </button>
        <button className="simulate-btn" onClick={() => console.log('[PowerGrid] TODO: simulate reset')}>
          RESET
        </button>
      </div>

      <div className="power-bar-track">
        <div className="power-bar-fill" style={powerBarStyle} />
      </div>

      {showFailure && <div className="blackout-alert">GRID FAILURE</div>}

      <div className="zones-grid">
        {ZONES.map((z) => {
          const status = zoneStates[z.id];
          return (
            <div key={z.id} className={zoneClass(status)}>
              <div
                className="zone-indicator"
                style={{ background: indicatorColor(status) }}
              />
              <div className="zone-id">ZONE {z.id}</div>
              <div className="zone-name">{z.name}</div>
              <div className="zone-power">{z.mw} MW</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
