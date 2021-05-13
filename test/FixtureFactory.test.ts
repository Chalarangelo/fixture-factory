import FixtureFactory from '../src/FixtureFactory';
import FactoryDefinition from '../src/FactoryDefinition';
import { Factories, Sequences } from '../src/constants';

describe('FixtureFactory', () => {
  describe('define', () => {
    it('returns a FactoryDefinition', () => {
      expect(new FixtureFactory().define('Test', () => ({}))).toBeInstanceOf(
        FactoryDefinition
      );
    });

    it('keeps a reference to the factory definition', () => {
      const factory = new FixtureFactory()
      factory.define('Test', () => ({}));
      expect(factory[Factories]['Test']).toBeDefined();
    });
  });

  describe('alias', () => {
    beforeEach(() => {
      new FixtureFactory().define('Test', () => ({ id: 0 }))
        .trait('aged', { age: 5 })
        .trait('named', (name: string) => ({ name }));
    });

    it('returns a FactoryDefinition', () => {
      const factory = new FixtureFactory();
      factory.define('Test', () => ({})).trait('aged', { age: 5 });
      expect(factory.alias('Alias', 'Test', 'aged')).toBeInstanceOf(
        FactoryDefinition
      );
    });

    it('keeps a reference to the factory definition', () => {
      const factory = new FixtureFactory();
      factory.define('Test', () => ({})).trait('aged', { age: 5 });
      factory.alias('Alias', 'Test', 'aged');
      expect(factory[Factories]['Alias']).toBeDefined();
    });
  });

  describe('create', () => {
    let factory: FixtureFactory;

    beforeEach(() => {
      factory = new FixtureFactory();
      factory.define('Test', () => ({ id: 0 }))
        .trait('aged', { age: 5 })
        .trait('named', (name: string) => ({ name }));
    });

    it('creates a fixture from the definition', () => {
      expect(factory.create('Test')).toEqual({ id: 0 });
    });

    it('passes down trait parameters to the definition', () => {
      expect(factory.create('Test', 'aged', ['named', 'John'])).toEqual({
        id: 0,
        age: 5,
        name: 'John',
      });
    });

    it('creates a fixture from an alias', () => {
      factory.alias('Alias', 'Test', 'aged');
      expect(factory.create('Alias')).toEqual({ id: 0, age: 5 });
    });
  });

  describe('createMany', () => {
    let factory: FixtureFactory;

    beforeEach(() => {
      factory = new FixtureFactory();
      factory.define('Test', () => ({ id: 0 }))
        .trait('with id', (id: number) => ({ id }))
        .trait('aged', { age: 5 })
        .trait('named', (name: string) => ({ name }));
    });

    it('creates an array of fixtures with the provided length', () => {
      expect(factory.createMany('Test', 5)).toHaveLength(5);
    });

    it('correctly uses passed traits array', () => {
      expect(factory.createMany('Test', 2, ['aged'])).toEqual([
        { id: 0, age: 5 },
        { id: 0, age: 5 },
      ]);
    });

    it('correctly uses passed traits map function', () => {
      expect(
        factory.createMany('Test', 2, (i: number) => [
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
      expect(new FixtureFactory().sequence('Id', genFunction).next).toBeInstanceOf(
        Function
      );
    });

    it('keeps a reference to the sequence definition', () => {
      const factory = new FixtureFactory();
      factory.sequence('Id', genFunction);
      expect(factory[Sequences]['Id']).toBeDefined();
    });
  });

  describe('package', () => {
    let packaged: { [Factories]: Record<string, Function> };

    beforeEach(() => {
      const factory = new FixtureFactory();

      factory.define('Packaged', () => ({ id: 0 }))
        .trait('aged', { age: 5 })
        .trait('named', (name: string) => ({ name }));

      packaged = factory.package();
    });

    it('packages the factory into an object', () => {
      expect(Object.keys(packaged[Factories])).toEqual(['Packaged']);
    });
  });
});
