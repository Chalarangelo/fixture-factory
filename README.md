# ![FixtureFactory](logo.png)
Modest fixture creation utility for JS tests

## Installation

You can install the utility using npm or yarn:

```sh
$ npm install --save-dev @fixture-factory/fixture-factory
```

```sh
$ yarn add -D @fixture-factory/fixture-factory
```

## Usage

You would typically use this utility to create one or more objects with a specific set of keys, differentiating values as necessary. Let's assume a `User` class with the following properties:

```js
// src/user.js
class User {
  constructor(id, name, username) {
    this.id = id;
    this.name = name;
    this.username = username;
    this.status = true;
    this.authLevel = 0;
  }

  stringify() {
    const levelNames = ['user', 'moderator', 'administrator'];
    return `${this.id}: ${this.username} (${this.name}) ${levelNames[this.authLevel]}`;
  }
}

export default User;
```

You can create a fixture factory for the `User` class and define its traits based on your application's business logic:

```js
// fixtures/user.js
import FixtureFactory from '@fixture-factory/fixture-factory';
import User from '../src/user';

const factory = new FixtureFactory();

factory.sequence('id', function* () {
  let id = 0;
  while (true) yield id++;
});

factory.define('User', () => new User(0, '', ''))
  .trait('with id', id => ({ id }))
  .trait('with auto id', () => ({ id: factory.nextFrom('id') }))
  .trait('moderator', { authLevel: 1 })
  .trait('administrator', { authLevel: 2 })
  .trait('active', { status: true })
  .trait('inactive', { status: false })
  .trait('with name', name => ({ name }))
  .trait('with username', username => ({ username }))
  .trait('deleted', ['inactive', ['with name', 'deleted']]);

factory.alias(
  'Superuser',
  'User',
  'administrator',
  'active',
  ['with name', 'superuser'],
  ['with username', 'superuser']
);

factory.alias('Bot', 'User', 'moderator');

export default factory.package();
```

Finally, you can use it in your tests to generate appropriate fixtures:

```js
// test/user.js
import User from '../src/user';
import userFactory from '../fixtures/user';

let fixtures = { users: [], bots: [] };

const botNames = ['tic', 'tac', 'toe'];

fixtures.users = userFactory.createMany('User', 5, [
  'with auto id',
  'active',
]);

fixtures.superuser = userFactory.create('Superuser');

fixtures.bots = userFactory.createMany('Bot', 8, i => [
  ['with id', 1000 + i],
  ['with name', `${botNames[Math.floor(Math.random() * 3)]}_bot`],
]);

fixtures.users.push(userFactory.create('User', 'deleted'));

describe('User', () => {
  describe('stringify()', () => {
    it('for a regular user', () => {
      expect(fixtures.users[2].stringify().startsWith('2: ')).toBeTruthy();
    });

    it('for a superuser', () => {
      expect(fixtures.superuser.stringify()).toBe(
        '0: superuser (superuser) administrator'
      );
    });

    it('for a bot', () => {
      expect(fixtures.bots[1].name.includes('_bot')).toBeTruthy();
    });
  });
});
```

## API reference

#### Creating factory instances

Factory instances can be created using the `FixtureFactory` constructor.

```js
const factory = new FixtureFactory();
```

**Return value**

A `FixtureFactory` instance.

#### Defining factories

Factories can be defined using `FixtureFactory.prototype.define(name, initializer)`.

```js
import User from './user';

const factory = new FixtureFactory();

// With a constructor
factory.define('User', User);

// With a function
factory.define('Item', () => ({ itemId: 0 }));
```

**Parameters**

- `name`: A string representing the name of the factory. Each `name` must be unique.
- `initializer`: A function or a class. If a class is provided, its constructor will be called for fixture creation. The initializer function or constructor will not be passed any arguments and is used to set the initial value for a fixture.

**Return value**

A new `FactoryDefinition` which can be used to define traits.

#### Adding traits

Traits can be chained to any existing definition using `FactoryDefinition.prototype.trait(name, definition)`.

```js
const factory = new FixtureFactory();

factory
  .define('Item', () => ({ itemId: 0 }))
  // With an object
  .trait('active', { active: true })
  // With a function
  .trait('named', name => ({ name }))
  // With an array
  .trait('special item', ['active', ['named', 'Special']]);
```

**Parameters**

- `name`: A string representing the name of the trait. Each `name` must be unique.
- `definition`: An object, a function or an array.
  - If an object is provided, it will be merged into the initial value of the fixture.
  - If a function is provided, it must return an object. The returned object will be merged into the initial value of the fixture.
  - If an array is provided, all values must be either a string or a tuple of a string and parameters. Each value represents an existing trait to be inherited.

**Return value**

The `FactoryDefinition` for which the method was called.

#### Creating aliases

An alias is a thin layer on top of an existing definition, inheriting any traits defined up to that point. Aliases can be defined using `FixtureFactory.prototype.alias(aliasName, name, ...params)`.

```js
const factory = new FixtureFactory();

factory
  .define('Product', { id: 0 })
  .trait('category', category => ({ category }))
  .trait('manufacturer', manufacturer => ({ manufacturer }))
  .trait('in stock', { inStock: true });

factory
  .alias('Laptop', 'Product', ['category', 'laptops'], 'in stock'];
```

**Parameters**

- `aliasName`: A string representing the name of the alias. Each `name` must be unique.
- `name`: The name of the original definition.
- `...params`: Any traits (string or tuple) to pass by default to the original definition.

**Return value**

A new `FactoryDefinition` for the defined alias.

#### Creating individual fixtures

Individual fixtures can be created using `FixtureFactory.prototype.create(name, ...params)`.

```js
const factory = new FixtureFactory();

factory
  .define('Item', () => ({ itemId: 0 }))
  .trait('active', { active: true })
  .trait('named', name => ({ name }));

const myItem = factory
  .create('Item', 'active', ['name', 'Laptop']);
// { itemId: 0, active: true, name: 'Laptop' }
```

**Parameters**

- `name`: A string for the definition to be used to create the fixture object.
- `...params`: Traits (string or tuple) to be given to the fixture object.

**Return value**

A fixture object.

### Creating multiple fixtures

Multiple fixtures can be created using `FixtureFactory.prototype.createMany(name, num, paramMap)`.

```js
const factory = new FixtureFactory();

factory
  .define('Item', () => ({ itemId: 0 }))
  .trait('active', { active: true })
  .trait('category', category => ({ category }))
  .trait('id', itemId => ({ itemId }));

// With array
const laptops = factory
  .createMany('Item', 2, ['active', ['category', 'Laptop']]);
// [
//  { itemId: 0, active: true, category: 'Laptop' },
//  { itemId: 0, active: true, category: 'Laptop' }
// ]

// With function
const numberedItems = factory
  .createMany('Item', 3, (id) => ['id', id]);
// [ { itemId: 0 }, { itemId: 1 }, { itemId: 2} ]
```

**Parameters**

- `name`: A string for the definition to be used to create the fixture object.
- `num`: A number representing the amount of fixture objects to be created.
- `paramMap`: An array of traits (string or tuple) to be passed down to all objects or a function that returns an array of traits. If a function is provided, it accepts the index of the item being created as the sole argument.

**Return value**

An array of fixture objects.

#### Defining sequences

Sequences are simple generators that can be used when creating fixtures. They can be defined using `FixtureFactory.prototype.sequence(name, generator)`.

```js
const factory = new FixtureFactory();

factory
  .sequence('id', function* () {
    let id = 0;
    while (true) yield id++;
  });
```

**Parameters**

- `name`: A string representing the name of the sequence. Each `name` must be unique.
- `generator`: A generator function.

**Return value**

A generator.

#### Using sequences

Sequences can be called to generate sequential values using `FixtureFactory.prototype.nextFrom(name)`.

```js
const factory = new FixtureFactory();

factory
  .sequence('id', function* () {
    let id = 10;
    while (true) yield id++;
  });

factory
  .define('Item', () => ({ itemId: 0 }))
  .trait('autoId', () => ({ itemId: factory.nextFrom('id') }));

const numberedItems = factory
  .createMany('Item', 3, ['autoId']);
// [ { itemId: 10 }, { itemId: 11 }, { itemId: 12 }]
```

**Parameters**

- `name`: A string for the sequence definition to be used to generate a new value.

**Return value**

The next value in the given sequence.

#### Packaging factories

Factories can be packaged along with any definitions, aliases, sequences and traits they contain using `FixtureFactory.prototype.package()`. Packaged factories only expose their `create()`, `createMany()` and `nextFrom()` methods and any contained definitions cannot be altered further.

This is especially useful when exporting definitions from a file to use in multiple test files.

```js
const factory = new FixtureFactory();

factory
  .define('Item', () => ({ itemId: 0 }))
  .trait('active', { active: true })
  .trait('category', category => ({ category }))
  .trait('id', itemId => ({ itemId }));

export default factory.package();
```

**Return value**

A packaged object from the current factory's contents.

## License

This project is licensed under the MIT license.
