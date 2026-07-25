import { SetMetadata } from '@nestjs/common';

export const CLE_ROLES = 'roles';

// Pose sur une route : @Roles('ADMIN') pour la reserver aux admins.
export const Roles = (...roles: string[]) => SetMetadata(CLE_ROLES, roles);
