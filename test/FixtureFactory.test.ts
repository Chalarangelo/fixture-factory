import FixtureFactory from '../src/FixtureFactory';
import FactoryDefinition from '../src/FactoryDefinition';
import { Factories, FactoryDefinitions, Sequences } from '../src/constants';

describe('FixtureFactory', () => {
  afterEach(() => {
    FixtureFactory[FactoryDefinitions] = {};
    FixtureFactory[Factories] = {};
    FixtureFactory[Sequences] = {};
  });

  describe('define', () => {
    it('returns a FactoryDefinition', () => {
      expect(FixtureFactory.define('Test', () => ({}))).toBeInstanceOf(
        FactoryDefinition
      );
    });

    it('keeps a reference to the factory definition', () => {
      FixtureFactory.define('Test', () => ({}));
      expect(FixtureFactory[Factories]['Test']).toBeDefined();
    });
  });

  describe('alias', () => {
    beforeEach(() => {
      FixtureFactory.define('Test', () => ({ id: 0 }))
        .trait('aged', { age: 5 })
        .trait('named', (name: string) => ({ name }));
    });

    it('returns a FactoryDefinition', () => {
      expect(FixtureFactory.alias('Alias', 'Test', 'aged')).toBeInstanceOf(
        FactoryDefinition
      );
    });

    it('keeps a reference to the factory definition', () => {
      FixtureFactory.alias('Alias', 'Test', 'aged');
      expect(FixtureFactory[Factories]['Alias']).toBeDefined();
    });
  });

  describe('create', () => {
    beforeEach(() => {
      FixtureFactory.define('Test', () => ({ id: 0 }))
        .trait('aged', { age: 5 })
        .trait('named', (name: string) => ({ name }));
    });

    it('creates a fixture from the definition', () => {
      expect(FixtureFactory.create('Test')).toEqual({ id: 0 });
    });

    it('passes down trait parameters to the definition', () => {
      expect(FixtureFactory.create('Test', 'aged', ['named', 'John'])).toEqual({
        id: 0,
        age: 5,
        name: 'John',
      });
    });

    it('creates a fixture from an alias', () => {
      FixtureFactory.alias('Alias', 'Test', 'aged');
      expect(FixtureFactory.create('Alias')).toEqual({ id: 0, age: 5 });
    });
  });

  describe('createMany', () => {
    beforeEach(() => {
      FixtureFactory.define('Test', () => ({ id: 0 }))
        .trait('with id', (id: number) => ({ id }))
        .trait('aged', { age: 5 })
        .trait('named', (name: string) => ({ name }));
    });

    it('creates an array of fixtures with the provided length', () => {
      expect(FixtureFactory.createMany('Test', 5)).toHaveLength(5);
    });

    it('correctly uses passed traits array', () => {
      expect(FixtureFactory.createMany('Test', 2, ['aged'])).toEqual([
        { id: 0, age: 5 },
        { id: 0, age: 5 },
      ]);
    });

    it('correctly uses passed traits map function', () => {
      expect(
        FixtureFactory.createMany('Test', 2, (i: number) => [
          ['with id', i],
          'aged',
        ])
      ).toEqual([
        { id: 0, age: 5 },
        { id: 1, age: 5 },
      ]);
    });
  });

  describe('sequence', () => {
    let genFunction = function* () {
      let id = 0;
      while (true) {
        yield id++;
      }
    };

    it('returns the sequence generator', () => {
      expect(FixtureFactory.sequence('Id', genFunction).next).toBeInstanceOf(
        Function
      );
    });

    it('keeps a reference to the sequence definition', () => {
      FixtureFactory.sequence('Id', genFunction);
      expect(FixtureFactory[Sequences]['Id']).toBeDefined();
    });
  });

  describe('package', () => {
    let packaged: { [Factories]: Record<string, Function> };

    beforeEach(() => {
      FixtureFactory.define('Packaged', () => ({ id: 0 }))
        .trait('aged', { age: 5 })
        .trait('named', (name: string) => ({ name }));

      packaged = FixtureFactory.package();
    });

    it('packages the factory into an object', () => {
      expect(Object.keys(packaged[Factories])).toEqual(['Packaged']);
    });

    it('resets the factory', () => {
      expect(FixtureFactory[FactoryDefinitions]).toEqual({});
      expect(FixtureFactory[Factories]).toEqual({});
      expect(FixtureFactory[Sequences]).toEqual({});
    });
  });
});
