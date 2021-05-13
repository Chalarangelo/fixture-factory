import FactoryDefinition from './FactoryDefinition';
import {
  Factories,
  Sequences,
  FactoryDefinitions,
  TraitDefinitions,
} from './constants';

const FixtureFactory: {
  [FactoryDefinitions]: Record<string, FactoryDefinition>;
  [Factories]: Record<string, Function>;
  [Sequences]: Record<string, Generator>;
  define(name: string, initializer: Function): FactoryDefinition;
  alias(aliasName: string, name: string, ...params: any[]): FactoryDefinition;
  create(name: string, ...params: any[]): any;
  createMany(name: string, num: number, paramMap?: any[] | Function): any[];
  sequence(name: string, generator: Function): Generator;
  nextFrom(name: string): any;
  package(): {
    readonly [FactoryDefinitions]: Record<string, FactoryDefinition>;
    readonly [Factories]: Record<string, Function>;
    readonly [Sequences]: Record<string, Generator>;
    create(name: string, ...params: any[]): any;
    createMany(name: string, num: number, paramMap?: any[] | Function): any[];
    nextFrom(name: string): any;
  };
} = {
  [FactoryDefinitions]: {},
  [Factories]: {},
  [Sequences]: {},
  define(name, initializer) {
    const definition = new FactoryDefinition(name, initializer);
    this[Factories][name] = (...params: any[]) => definition.init(...params);
    this[FactoryDefinitions][name] = definition;
    return definition;
  },
  alias(aliasName, name, ...params) {
    const aliasedDefinition = this.define(aliasName, () =>
      this[Factories][name](...params)
    );
    aliasedDefinition[TraitDefinitions] = {
      ...this[FactoryDefinitions][name][TraitDefinitions],
    };
    return aliasedDefinition;
  },
  create(name, ...params) {
    return this[Factories][name](...params);
  },
  createMany(name, num, paramMap) {
    return Array.from({ length: num }).map((_, i) => {
      if (!paramMap) return this.create(name);
      if (Array.isArray(paramMap)) return this.create(name, ...paramMap);
      return this.create(name, ...paramMap(i));
    });
  },
  sequence(name, generator) {
    this[Sequences][name] = generator();
    return this[Sequences][name];
  },
  nextFrom(name) {
    return this[Sequences][name].next().value;
  },
  package() {
    const packaged = Object.freeze({
      [FactoryDefinitions]: Object.freeze({ ...this[FactoryDefinitions] }),
      [Factories]: Object.freeze({ ...this[Factories] }),
      [Sequences]: Object.freeze({ ...this[Sequences] }),
      create: this.create.bind(this),
      createMany: this.createMany.bind(this),
      nextFrom: this.nextFrom.bind(this),
    });
    this[FactoryDefinitions] = {};
    this[Factories] = {};
    this[Sequences] = {};
    return packaged;
  },
};

export default FixtureFactory;
