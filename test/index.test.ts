import FixtureFactory from '../src';

class User {
  id: number;
  name: string;
  username: string;
  status: boolean;
  authLevel: number;

  constructor(id: number, name: string, username: string) {
    this.id = id;
    this.name = name;
    this.username = username;
    this.status = true;
    this.authLevel = 0;
  }
}

describe('usage scenario', () => {
  let fixtures: {
    users: Array<User>;
    superuser?: User;
    bots: Array<User>;
  } = {
    users: [],
    bots: [],
  };

  beforeAll(() => {
    let factory = new FixtureFactory();

    factory.sequence('id', function* () {
      let id = 0;
      while (true) yield id++;
    });

    factory.define('User', () => new User(0, '', ''))
      .trait('with id', (id: number) => ({ id }))
      .trait('with auto id', () => ({ id: factory.nextFrom('id') }))
      .trait('moderator', { authLevel: 1 })
      .trait('administrator', { authLevel: 2 })
      .trait('active', { status: true })
      .trait('inactive', { status: false })
      .trait('with name', (name: string) => ({ name }))
      .trait('with username', (username: string) => ({ username }))
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

    factory = factory.package();

    let botNames = ['tic', 'tac', 'toe'];

    fixtures.users = factory.createMany('User', 5, [
      'with auto id',
      'active',
    ]);

    fixtures.superuser = factory.create('Superuser');

    fixtures.bots = factory.createMany('Bot', 8, (i: number) => [
      ['with id', 1000 + i],
      ['with name', `${botNames[Math.floor(Math.random() * 3)]}_bot`],
    ]);

    fixtures.users.push(factory.create('User', 'deleted'));
  });

  it('creates the correct fixture count', () => {
    expect(fixtures.users).toHaveLength(6);
    expect(fixtures.superuser).toBeDefined();
    expect(fixtures.bots).toHaveLength(8);
  });

  it('creates multiple users with auto incremented ids', () => {
    fixtures.users.slice(0, 5).forEach((user, i) => {
      expect(user.id).toBe(i);
    });
  });

  it('creates a superuser from an aliased factory', () => {
    expect(fixtures.superuser).toEqual({
      id: 0,
      authLevel: 2,
      status: true,
      name: 'superuser',
      username: 'superuser',
    });
  });

  it('creates multiple bots with correctly mapped ids', () => {
    fixtures.bots.forEach((bot, i) => {
      expect(bot.id).toBe(1000 + i);
    });
  });

  it('creates multiple bots with correctly mapped names', () => {
    fixtures.bots.forEach(bot => {
      expect(bot.name.endsWith('_bot')).toBeTruthy();
    });
  });

  it('creates multiple bots with the correct traits', () => {
    fixtures.bots.forEach(bot => {
      expect(bot.authLevel).toBe(1);
    });
  });
});
