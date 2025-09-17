export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  stackAuthId: string;
}

export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  const baseUser: TestUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    stackAuthId: 'test-stack-auth-id',
    ...overrides
  };

  return baseUser;
}
