import { NextRequest } from 'next/server';
import { AuthController } from '@/controllers/auth.controller';

export async function GET(req: NextRequest) {
  return AuthController.me(req);
}
