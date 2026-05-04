import React, { useState, useEffect, useRef } from 'react';
import './DroneSwarm.css';
import eventBus from 'shared/eventBus';

const commandMap = {
  storm: 'chaos',
  drones: 'skull',
  riot: 'X',
  love: 'heart',
  blackout: 'off',
  off: 'off',
  reset: 'grid',
};

const weatherFormationMap = {
  storm: 'chaos',
  clear: 'grid',
  'acid-fog': 'X',
  windy: 'skull',
  'dark-clouds': 'off',
};

export default function DroneSwarm() {
  const [formation, setFormation] = useState('grid');
  const [isCriticalOutage, setIsCriticalOutage] = useState(false);
  const formationRef = useRef('grid');
  const criticalOutageRef = useRef(false);

  const changeFormation = (nextFormation, sourceEvent = 'ui:manual') => {
    if (
      sourceEvent === 'ui:manual' &&
      criticalOutageRef.current &&
      nextFormation !== 'off'
    ) {
      return;
    }

    if (formationRef.current === nextFormation) {
      return;
    }

    formationRef.current = nextFormation;
    setFormation(nextFormation);

    const payload = {
      formation: nextFormation,
      sourceEvent,
      ts: Date.now(),
    };

    eventBus.emit('drone:formation', payload);
    console.log('[DroneSwarm] formation changed:', payload);
  };

  useEffect(() => {
    formationRef.current = formation;
  }, [formation]);

  useEffect(() => {
    const handleHackerCommand = (payload = {}) => {
      if (criticalOutageRef.current) {
        return;
      }

      const command = typeof payload === 'string' ? payload : payload.command;
      const mappedFormation = commandMap[command];

      if (!mappedFormation) {
        console.log('[DroneSwarm] no mapped formation for command:', command);
        return;
      }

      changeFormation(mappedFormation, 'hacker:command');
    };

    const handleWeatherChange = (payload = {}) => {
      if (criticalOutageRef.current) {
        return;
      }

      const weather = typeof payload === 'string' ? payload : payload.weather;
      const mappedFormation = weatherFormationMap[weather];

      if (!mappedFormation) {
        console.log('[DroneSwarm] no mapped formation for weather:', weather);
        return;
      }

      changeFormation(mappedFormation, 'weather:change');
    };

    const handlePowerOutage = (payload = {}) => {
      const { cityPower, severity } = payload;
      const isCriticalOutage = cityPower === 0 || severity === 'critical';

      if (isCriticalOutage) {
        criticalOutageRef.current = true;
        setIsCriticalOutage(true);
        changeFormation('off', 'power:outage');
      }
    };

    const handlePowerRestored = () => {
      criticalOutageRef.current = false;
      setIsCriticalOutage(false);
      changeFormation('grid', 'power:restored');
    };

    const unsubscribeHacker = eventBus.on('hacker:command', handleHackerCommand);
    const unsubscribeWeather = eventBus.on('weather:change', handleWeatherChange);
    const unsubscribePower = eventBus.on('power:outage', handlePowerOutage);
    const unsubscribePowerRestored = eventBus.on('power:restored', handlePowerRestored);

    return () => {
      if (typeof unsubscribeHacker === 'function') unsubscribeHacker();
      if (typeof unsubscribeWeather === 'function') unsubscribeWeather();
      if (typeof unsubscribePower === 'function') unsubscribePower();
      if (typeof unsubscribePowerRestored === 'function') unsubscribePowerRestored();
      console.log(
        '[DroneSwarm] listeners cleaned up: hacker:command, weather:change, power:outage, power:restored'
      );
    };
  }, []);

  return (
    <div className="drone-swarm">
      <div className="drone-header">
        <span>DRONE SWARM</span>
        <span className="formation-status">FORMATION: {formation.toUpperCase()}</span>
      </div>

      <div className="drone-grid">
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} className={`drone ${formation}`} />
        ))}
      </div>

      <div className="formation-buttons">
        {['grid', 'skull', 'heart', 'X', 'chaos', 'off'].map((item) => (
          <button
            key={item}
            className={`formation-btn ${formation === item ? 'active' : ''}`}
            disabled={isCriticalOutage && item !== 'off'}
            onClick={() => changeFormation(item)}
          >
            {item.toLowerCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
