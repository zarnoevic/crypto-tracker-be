import { AuthenticatorMiddleware } from './authenticator.middleware';

describe('AuthenticatorMiddleware', () => {
  it('should be defined', () => {
    expect(new AuthenticatorMiddleware()).toBeDefined();
  });
});
