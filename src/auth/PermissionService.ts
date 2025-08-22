import { Injectable } from '@nestjs/common';

export enum UserRole {
  CREATOR = 'creator',
  ENTREPRENEUR = 'entrepreneur',
  ADMIN = 'admin',
}

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

@Injectable()
export class PermissionService {
  private readonly rolePermissions = new Map<UserRole, Permission[]>();

  constructor() {
    this.initializePermissions();
  }

  private initializePermissions() {
    // Creator tier permissions
    this.rolePermissions.set(UserRole.CREATOR, [
      { resource: 'content', action: 'create' },
      { resource: 'content', action: 'read' },
      { resource: 'content', action: 'update' },
      { resource: 'content', action: 'delete' },
      { resource: 'ai-tools', action: 'read' },
      { resource: 'templates', action: 'read' },
    ]);

    // Entrepreneur tier permissions (includes everything from Creator plus more)
    this.rolePermissions.set(UserRole.ENTREPRENEUR, [
      ...this.rolePermissions.get(UserRole.CREATOR)!,
      { resource: 'team', action: 'create' },
      { resource: 'team', action: 'read' },
      { resource: 'team', action: 'update' },
      { resource: 'analytics', action: 'read' },
      { resource: 'advanced-tools', action: 'read' },
    ]);

    // Admin permissions
    this.rolePermissions.set(UserRole.ADMIN, [
      { resource: '*', action: 'create' },
      { resource: '*', action: 'read' },
      { resource: '*', action: 'update' },
      { resource: '*', action: 'delete' },
    ]);
  }

  async hasPermission(userRole: UserRole, resource: string, action: string): Promise<boolean> {
    const permissions = this.rolePermissions.get(userRole);
    if (!permissions) return false;

    return permissions.some(
      (permission) =>
        (permission.resource === resource || permission.resource === '*') &&
        permission.action === action
    );
  }

  async getUserPermissions(userRole: UserRole): Promise<Permission[]> {
    return this.rolePermissions.get(userRole) || [];
  }
}