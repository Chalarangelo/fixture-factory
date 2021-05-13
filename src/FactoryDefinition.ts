import { Traits, TraitDefinitions, FactoryInitializer, FactoryName } from './constants';

type TraitDefinition = Function | Object | Array<string>;
type TraitParameter = [string, ...any[]] | string;

class FactoryDefinition {
  readonly [FactoryName]: string;
  readonly [FactoryInitializer]: Function;
  [TraitDefinitions]: Record<string, Function>;

  constructor(name: string, initializer: Function) {
    this[FactoryName] = name;
    this[FactoryInitializer] = () => {
      try {
        return Reflect.construct(initializer, []);
      } catch {
        return initializer();
      }
    }
    this[TraitDefinitions] = {};
  }

  trait(name: string, definition: TraitDefinition): FactoryDefinition {
    if (typeof definition === 'function') {
      this[TraitDefinitions][name] = definition;
    } else if (Array.isArray(definition)) {
      this[TraitDefinitions][name] = () => ({ [Traits]: definition });
    } else {
      this[TraitDefinitions][name] = () => ({ ...definition });
    }
    return this;
  }

  private apply(obj: object, trait: string, ...params: any[]): Record<string, any> {
    const res = this[TraitDefinitions][trait](...params);
    const newObj = Object.keys(res)
      .reduce((o: Record<string, any> ,k: string) => {
        o[k] = res[k];
        return o;
      }, obj);
    const inherited = res[Traits] || [];

    return inherited.reduce((o: Record<string, any>, t: TraitParameter, ...params: any[]) => {
      if (Array.isArray(t)) return this.apply(o, ...t);
      return this.apply(o, t, ...params);
    }, newObj);
  }

  init(...traits: Array<TraitParameter>) {
    return traits.reduce((obj, t) => {
      if (Array.isArray(t)) return this.apply(obj, ...t);
      else return this.apply(obj, t);
    }, this[FactoryInitializer]());
  }
}

export default FactoryDefinition;
