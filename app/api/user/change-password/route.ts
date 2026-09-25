import { NextRequest } from 'next/server';
import { UserController } from '@/controllers/user.controller';

export async function POST(req: NextRequest) {
  return UserController.changePassword(req);
}
