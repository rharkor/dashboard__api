import User from 'src/modules/users/entities/user.entity';

export type RequestWithUser = Request & { user: User };
