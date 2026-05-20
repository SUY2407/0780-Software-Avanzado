import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'c3VwZXItc2VjcmV0LWp3dC1rZXk=',
}));
