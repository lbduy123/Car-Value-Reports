import { Test } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { UsersService } from './users.service'
import { User } from './user.entity'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";

describe('AuthService', () => {
  let service: AuthService
  let fakeUsersService: Partial<UsersService>

  beforeEach(async () => {
    const users: User[] = []
    // Create fake copy of UsersService
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter(user => user.email === email)
        return Promise.resolve(filteredUsers)
      },
      create: (email: string, password: string) => {
        const user = { id: Math.floor(Math.random() * 999999) ,email, password } as User
        users.push(user)
        return Promise.resolve(user)
      }
    } // AuthService only depends on UsersService.find() & UsersService.create() 
      // so we just need toimplement 2 these functions

    const module = await Test.createTestingModule({
      providers: [AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService
        } // If anyone asks for the copy of UsersService, then give them the value of fakeUsersService
      ]              // Providers array is list of things we want to be in our Testing DI Container
    }).compile()                              // create new DI container

    service = module.get(AuthService)
  })

  it('can create instance of AuthService', async () => {
    expect(service).toBeDefined()
  })

  it ('create a new user with a salted and hashed password', async () => {
    const user = await service.signup('test@example.com', 'password')
    expect(user.password).not.toEqual('password')
    const [salt, hash] = user.password.split('.')
    expect(salt).toBeDefined()
    expect(hash).toBeDefined()
  })

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('test@example.com', 'password')
    await expect(service.signup('test@example.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if signin is called with an unregistered email', async () => {
    await expect(
      service.signin('asdflkj@asdlfkj.com', 'passdflkj'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('test@example.com', 'password')
    await expect(
      service.signin('test@example.com', 'wrongpassword'),
    ).rejects.toThrow(BadRequestException);
  });

  it('return a user if correct password is provided', async () => {
    await service.signup('test@example.com', 'password')
    const user = await service.signin('test@example.com', 'password')
    expect(user).toBeDefined()
  })
})
