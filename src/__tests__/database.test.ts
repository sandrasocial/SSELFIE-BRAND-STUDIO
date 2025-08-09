import { prisma } from '../db';

describe('Database Operations', () => {
  beforeEach(async () => {
    // Clean test database before each test
    await prisma.user.deleteMany();
  });

  describe('User CRUD Operations', () => {
    it('should create user with valid data', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test@luxury.com',
          name: 'Test User',
          hashedPassword: 'hashed_password_here'
        }
      });

      expect(user).toHaveProperty('id');
      expect(user.email).toBe('test@luxury.com');
    });

    it('should read user data', async () => {
      // Create test user
      const created = await prisma.user.create({
        data: {
          email: 'read@luxury.com',
          name: 'Read Test',
          hashedPassword: 'hashed_password_here'
        }
      });

      // Read user
      const found = await prisma.user.findUnique({
        where: { id: created.id }
      });

      expect(found).toBeTruthy();
      expect(found?.email).toBe('read@luxury.com');
    });

    it('should update user data', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          email: 'update@luxury.com',
          name: 'Update Test',
          hashedPassword: 'hashed_password_here'
        }
      });

      // Update user
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { name: 'Updated Name' }
      });

      expect(updated.name).toBe('Updated Name');
    });

    it('should delete user', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          email: 'delete@luxury.com',
          name: 'Delete Test',
          hashedPassword: 'hashed_password_here'
        }
      });

      // Delete user
      await prisma.user.delete({
        where: { id: user.id }
      });

      // Verify deletion
      const found = await prisma.user.findUnique({
        where: { id: user.id }
      });

      expect(found).toBeNull();
    });
  });

  describe('Data Integrity', () => {
    it('should enforce unique email constraint', async () => {
      // Create first user
      await prisma.user.create({
        data: {
          email: 'duplicate@luxury.com',
          name: 'First User',
          hashedPassword: 'hashed_password_here'
        }
      });

      // Attempt to create duplicate
      await expect(
        prisma.user.create({
          data: {
            email: 'duplicate@luxury.com',
            name: 'Second User',
            hashedPassword: 'hashed_password_here'
          }
        })
      ).rejects.toThrow();
    });
  });
});