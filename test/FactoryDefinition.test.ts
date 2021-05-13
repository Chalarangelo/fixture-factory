import FactoryDefinition from '../src/FactoryDefinition';
import {
  TraitDefinitions,
  Traits,
  FactoryInitializer,
  FactoryName,
} from '../src/constants';

describe('FactoryDefinition', () => {
  let definition: FactoryDefinition;

  class Demo {
    id: number;

    constructor() {
      this.id = 0;
    }
  }

  describe('constructor', () => {
    it('accepts a function', () => {
      definition = new FactoryDefinition('WithFunction', () => ({ id: 0 }));
      expect(definition).toBeInstanceOf(FactoryDefinition);
      expect(definition[FactoryName]).toBe('WithFunction');
      expect(definition[FactoryInitializer]()).toEqual({ id: 0 });
    });

    it('accepts a constructor', () => {
      definition = new FactoryDefinition('WithConstructor', Demo);
      expect(definition).toBeInstanceOf(FactoryDefinition);
      expect(definition[FactoryName]).toBe('WithConstructor');
      expect(definition[FactoryInitializer]()).toEqual({ id: 0 });
      expect(definition[FactoryInitializer]()).toBeInstanceOf(Demo);
    });
  });

  describe('trait', () => {
    beforeEach(() => {
      definition = new FactoryDefinition('Test', () => ({ id: 0 }));
    });

    it('accepts a function', () => {
      definition.trait('with function', () => ({ name: 'John' }));
      expect(definition[TraitDefinitions]['with function']()).toEqual({
        name: 'John',
      });
    });

    it('accepts an array', () => {
      definition.trait('with array', ['with function']);
      expect(definition[TraitDefinitions]['with array']()).toEqual({
        [Traits]: ['with function'],
      });
    });

    it('accepts an object', () => {
      definition.trait('with object', { age: 24 });
      expect(definition[TraitDefinitions]['with object']()).toEqual({
        age: 24,
      });
    });
  });

  describe('apply', () => {
    beforeEach(() => {
      definition = new FactoryDefinition('Test', Demo);
      definition.trait('aged', { age: 5 });
      definition.trait('parametrized id', (id: number) => ({ id }));
      definition.trait('name', (name: string) => ({ name }));
      definition.trait('with inherited traits', [
        'aged',
        ['parametrized id', 10],
      ]);
      definition.trait(
        'with inherited traits and customization',
        (name: string) => ({
          id: 20,
          [Traits]: [['name', name], 'aged'],
        })
      );
    });

    it('applies a single trait', () => {
      // @ts-ignore
      expect(definition.apply(new Demo(), 'aged')).toEqual({ id: 0, age: 5 });
    });

    it('resulting object has the correct prototype', () => {
      // @ts-ignore
      expect(definition.apply(new Demo(), 'aged')).toBeInstanceOf(Demo);
    });

    it('applies traits with parameters', () => {
      // @ts-ignore
      expect(definition.apply(new Demo(), 'parametrized id', 5)).toEqual({
        id: 5,
      });
    });

    it('applies inherited traits', () => {
      // @ts-ignore
      expect(definition.apply(new Demo(), 'with inherited traits')).toEqual({
        id: 10,
        age: 5,
      });
    });

    it('applies inherited traits with parameters', () => {
      expect(
        // @ts-ignore
        definition.apply(
          new Demo(),
          'with inherited traits and customization',
          'John'
        )
      ).toEqual({ id: 20, age: 5, name: 'John' });
    });
  });

  describe('init', () => {
    beforeEach(() => {
      definition = new FactoryDefinition('Test', Demo);
      definition.trait('aged', { age: 5 });
      definition.trait('name', (name: string) => ({ name }));
    });

    it('applies a single trait', () => {
      expect(definition.init('aged')).toEqual({ id: 0, age: 5 });
    });

    it('applies multiple traits', () => {
      expect(definition.init('aged', ['name', 'John'])).toEqual({
        id: 0,
        age: 5,
        name: 'John',
      });
    });
  });
});
