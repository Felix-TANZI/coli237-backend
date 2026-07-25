import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Pose ce garde sur une route pour exiger un jeton valide.
@Injectable()
export class JwtGuard extends AuthGuard('jwt') {}
