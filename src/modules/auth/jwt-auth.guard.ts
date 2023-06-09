import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_TOKEN_AVAILABLE, IS_PUBLIC_KEY } from 'src/meta/public.meta';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    return super.handleRequest(err, user, info, context, status);
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const isTokenAvailable = this.reflector.getAllAndOverride<boolean>(
      IS_TOKEN_AVAILABLE,
      [context.getHandler(), context.getClass()],
    );
    if (isTokenAvailable) {
      if (req.query.token) {
        return true;
      } else {
        return super.canActivate(context);
      }
    }

    return super.canActivate(context);
  }
}
