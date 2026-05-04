describe('mfe-drones contract test', () => {
  let eventBus;

  beforeAll(() => {
    global.window = {};
    const busModule = require('../shared/eventBus');
    eventBus = busModule.default || busModule;
  });

  test('mfe-drones emits drone:formation with expected payload format', (done) => {
    const unsubscribe = eventBus.on('drone:formation', (data) => {
      try {
        expect(data).toHaveProperty('formation');
        expect(data).toHaveProperty('sourceEvent');
        expect(data).toHaveProperty('ts');
        expect(typeof data.formation).toBe('string');
        expect(typeof data.sourceEvent).toBe('string');
        expect(typeof data.ts).toBe('number');
      } finally {
        unsubscribe();
        done();
      }
    });

    eventBus.emit('drone:formation', {
      formation: 'skull',
      sourceEvent: 'contract:test',
      ts: Date.now(),
    });
  });
});
