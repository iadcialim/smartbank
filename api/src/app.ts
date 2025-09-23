import express, { Request, Response } from 'express';

export const app = express();

app.use(express.json());

// Auth routes
app.post('/api/auth/register', (_req: Request, _res: Response) => {
  throw new Error('Registration handler not implemented yet');
});

app.post('/api/auth/verify-email', (_req: Request, _res: Response) => {
  throw new Error('Email verification handler not implemented yet');
});

app.post('/api/auth/login', (_req: Request, _res: Response) => {
  throw new Error('Login handler not implemented yet');
});

app.get('/api/auth/profile', (_req: Request, _res: Response) => {
  throw new Error('Profile handler not implemented yet');
});

app.post('/api/auth/refresh', (_req: Request, _res: Response) => {
  throw new Error('Refresh token handler not implemented yet');
});

app.post('/api/auth/logout', (_req: Request, _res: Response) => {
  throw new Error('Logout handler not implemented yet');
});

app.post('/api/auth/password-reset/request', (_req: Request, _res: Response) => {
  throw new Error('Password reset request handler not implemented yet');
});

app.post('/api/auth/password-reset/verify', (_req: Request, _res: Response) => {
  throw new Error('Password reset verify handler not implemented yet');
});

app.post('/api/auth/password-reset/confirm', (_req: Request, _res: Response) => {
  throw new Error('Password reset confirm handler not implemented yet');
});

app.post('/api/auth/change-password', (_req: Request, _res: Response) => {
  throw new Error('Change password handler not implemented yet');
});