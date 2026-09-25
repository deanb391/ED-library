import { NextRequest } from 'next/server';
import { UserController } from '@/controllers/user.controller';

export async function PATCH(req: NextRequest) {
  return UserController.updateProfile(req);
}

export async function PUT(req: NextRequest) {
  return UserController.updateProfile(req);
}
