import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthError, NetworkError, ServerError } from '@/services/api';

describe('API error classes', () => {
  it('AuthError has correct name and message', () => {
    const err = new AuthError();
    expect(err.name).toBe('AuthError');
    expect(err.message).toBe('Authentication required');
  });

  it('AuthError accepts custom message', () => {
    const err = new AuthError('Token expired');
    expect(err.message).toBe('Token expired');
  });

  it('NetworkError has correct name and message', () => {
    const err = new NetworkError();
    expect(err.name).toBe('NetworkError');
    expect(err.message).toBe('Network request failed');
  });

  it('ServerError includes status code', () => {
    const err = new ServerError(500, 'Internal failure');
    expect(err.name).toBe('ServerError');
    expect(err.status).toBe(500);
    expect(err.message).toBe('Internal failure');
  });
});

describe('API fetch behavior', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('AuthError, NetworkError, and ServerError are distinguishable', () => {
    const auth = new AuthError();
    const network = new NetworkError();
    const server = new ServerError(503);

    expect(auth).toBeInstanceOf(AuthError);
    expect(auth).not.toBeInstanceOf(NetworkError);
    expect(network).toBeInstanceOf(NetworkError);
    expect(network).not.toBeInstanceOf(ServerError);
    expect(server).toBeInstanceOf(ServerError);
    expect(server).not.toBeInstanceOf(AuthError);
  });
});
