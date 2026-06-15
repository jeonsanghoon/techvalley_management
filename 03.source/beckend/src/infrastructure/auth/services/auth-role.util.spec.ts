import { authTypeToRole, cognitoClaimToRole } from './auth-role.util';

describe('authTypeToRole', () => {
  it('maps auth_type to JWT role', () => {
    expect(authTypeToRole(10)).toBe('admin');
    expect(authTypeToRole(9)).toBe('engineer');
    expect(authTypeToRole(4)).toBe('customer');
    expect(authTypeToRole(1)).toBe('cs');
  });
});

describe('cognitoClaimToRole', () => {
  it('reads custom:role claim', () => {
    expect(cognitoClaimToRole({ 'custom:role': 'engineer' })).toBe('engineer');
    expect(cognitoClaimToRole({ 'custom:role': 'admin' })).toBe('admin');
  });

  it('falls back to cs', () => {
    expect(cognitoClaimToRole({})).toBe('cs');
  });
});
