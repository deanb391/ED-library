import { NextRequest } from 'next/server';
import { AuthController } from '@/controllers/auth.controller';

export async function POST(req: NextRequest) {
  return AuthController.login(req);
}
