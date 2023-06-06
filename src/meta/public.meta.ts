import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const IS_TOKEN_AVAILABLE = 'isTokenAvailable';
export const TokenAvailable = () => SetMetadata(IS_TOKEN_AVAILABLE, true);
