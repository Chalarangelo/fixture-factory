import FactoryDefinition from './FactoryDefinition';
import {
  Factories,
  Sequences,
  FactoryDefinitions,
  TraitDefinitions,
} from './constants';

class FixtureFactory {
  [FactoryDefinitions]: Record<string, FactoryDefinition>;
  [Factories]: Record<string, Function>;
  [Sequences]: Record<string, Generator>;

  constructor() {
    this[FactoryDefinitions] = {};
    this[Factories]= {};
    this[Sequences] ={};
  }

  define(name: string, initializer: Function): FactoryDefinition{
    const definition = new FactoryDefinition(name, initializer);
    this[Factories][name] = (...params: any[]) => definition.init(...params);
    this[FactoryDefinitions][name] = definition;
    return definition;
  }

  alias(aliasName: string, name: string, ...params: any[]): FactoryDefinition {
    const aliasedDefinition = this.define(aliasName, () =>
      this[Factories][name](...params)
    );
    aliasedDefinition[TraitDefinitions] = {
      ...this[FactoryDefinitions][name][TraitDefinitions],
    };
    return aliasedDefinition;
  }

  create(name: string, ...params: any[]): any{
    return this[Factories][name](...params);
  }

  createMany(name: string, num: number, paramMap?: any[] | Function): any[]{
    return Array.from({ length: num }).map((_, i) => {
      if (!paramMap) return this.create(name);
      if (Array.isArray(paramMap)) return this.create(name, ...paramMap);
      return this.create(name, ...paramMap(i));
    });
  }

  sequence(name: string, generator: Function): Generator{
    this[Sequences][name] = generator();
    return this[Sequences][name];
  }

  nextFrom(name: string){
    return this[Sequences][name].next().value;
  }

  package(): this{
    Object.freeze(this)
    return this;
  }
}

export default FixtureFactory;
