# RUNBOOK GROUPE 5 - MFE DRONES (6 devs)

## 1) Repartition des 6 devs
- Dev 1 - **Lead technique/archi**: valide contrats d'evenements, coherence inter-MFE, revues finales.
- Dev 2 - **Owner `mfe-drones`**: logique d'essaim, emissions `drone:formation`, etats UI de crise.
- Dev 3 - **Owner integration `mfe-hacker`**: mapping `hacker:command` -> reactions drones.
- Dev 4 - **Owner integration `mfe-weather`**: adaptation des formations selon `weather:change`.
- Dev 5 - **Owner integration `mfe-powergrid`**: degradation/recovery selon `power:outage`.
- Dev 6 - **QA/Release**: scenarios E2E manuels, checklist DoD, suivi PR et verification finale.

## 2) Workflow git/PR conseille
- 1 branche par tache: `feat/g5-<topic>` ou `fix/g5-<topic>`.
- Commits petits, message clair (conventional commits), tests manuels notes dans la PR.
- PR vers `main` avec: contexte, changements, preuves (captures/logs), plan de test.
- Minimum 1 reviewer obligatoire (2 si changement de contrat d'evenements).
- Merge uniquement si: checks verts, conflits resolus, checklist DoD complete.

## 3) Commandes de run (shell + MFEs)
Prerequis (dans chaque terminal):

```bash
nvm use 22
```

Installation (une fois par app):

```bash
cd shell && yarn install
cd ../mfe-hacker && yarn install
cd ../mfe-weather && yarn install
cd ../mfe-powergrid && yarn install
cd ../mfe-drones && yarn install
```

Run (5 terminaux):

```bash
# Terminal 1
cd shell
yarn start

# Terminal 2
cd mfe-hacker
yarn start

# Terminal 3
cd mfe-weather
yarn start

# Terminal 4
cd mfe-powergrid
yarn start

# Terminal 5
cd mfe-drones
yarn start
```

Acces:
- Shell: [http://localhost:3000](http://localhost:3000)
- Hacker: `3001`, Weather: `3002`, Powergrid: `3003`, Drones: `3005`

## 4) Scenarios de validation (normal / crise / recovery)
Mode recommande (robuste meme si autres MFEs ont des TODO): depuis la console navigateur du Shell (`localhost:3000`), simuler les evenements via `window.eventBus.emit(...)`.

```js
window.eventBus.emit('hacker:command', { command: 'drones' })
```

Prerequis si vous ne simulez pas: `mfe-hacker`, `mfe-weather` et `mfe-powergrid` doivent deja emettre les evenements attendus.

### Scenario A - Normal
1. Simuler:
   - `window.eventBus.emit('hacker:command', { command: 'drones' })`
2. Evenements attendus:
   - emission `hacker:command`
   - `mfe-drones` passe en formation `skull`
   - emission `drone:formation` avec `formation: 'skull'`

### Scenario B - Crise
1. Simuler:
   - `window.eventBus.emit('hacker:command', { command: 'storm' })`
   - `window.eventBus.emit('power:outage', { severity: 'critical' })` (ou `{ cityPower: 0 }`)
2. Evenements attendus:
   - `mfe-drones` passe a `chaos` apres `storm`
   - `mfe-drones` passe a `off` apres `power:outage` critique (ou `cityPower: 0`)
   - emissions `drone:formation` correspondantes (`chaos`, puis `off`)

### Scenario C - Recovery
1. Simuler:
   - `window.eventBus.emit('power:restored', { cityPower: 100 })`
   - `window.eventBus.emit('hacker:command', { command: 'reset' })`
2. Evenements attendus:
   - emission `power:restored`
   - `mfe-drones` revient a `grid`
   - emissions `drone:formation` avec `formation: 'grid'`

## 5) Definition of Done - Groupe 5
- Les 3 scenarios sont executes sans erreur console bloquante.
- Les contrats `hacker:command`, `weather:change`, `power:outage`, `power:restored`, `drone:formation` sont respectes.
- Les `useEffect` de souscription ont un cleanup correct.
- Les formations utilisees sont uniquement: `grid`, `skull`, `heart`, `X`, `chaos`, `off`.
- PR relue et approuvee, preuves de test jointes.
- Documentation run/validation a jour dans ce runbook.
- Demo locale validee via le shell (`localhost:3000`).
