import { User, Media, IUser } from '../models';
import { Errors } from '../utils/errors';

export interface UpdateProfileInput {
  name?: string | null;
  avatarId?: string | null;
}

export async function updateProfile(user: IUser, input: UpdateProfileInput): Promise<IUser> {
  const updates: Partial<Pick<IUser, 'name' | 'avatar'>> = {};

  if (input.name !== undefined && input.name !== null) {
    const name = input.name.trim();
    if (name.length < 2) {
      throw Errors.badInput('Name must be at least 2 characters.');
    }
    updates.name = name;
  }

  if (input.avatarId !== undefined) {
    if (input.avatarId === null) {
      updates.avatar = null;
    } else {
      const media = await Media.findById(input.avatarId);
      if (!media) {
        throw Errors.notFound('Avatar image not found.');
      }
      updates.avatar = media._id;
    }
  }

  const updated = await User.findByIdAndUpdate(user._id, updates, { new: true });
  if (!updated) {
    throw Errors.unauthenticated();
  }
  return updated;
}

export interface ListUsersArgs {
  limit: number;
  offset: number;
}

export async function listUsers({ limit, offset }: ListUsersArgs): Promise<IUser[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 200);
  const safeOffset = Math.max(offset, 0);
  return User.find().sort({ createdAt: -1 }).skip(safeOffset).limit(safeLimit);
}
