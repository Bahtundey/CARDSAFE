import { AppContext } from '../../types/context';
import * as authService from '../../services/auth.service';
import * as userService from '../../services/user.service';
import { requireAuth } from '../../middleware/auth';
import { setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE } from '../../utils/cookies';

export const authResolvers = {
  Mutation: {
    register: async (
      _: unknown,
      { input }: { input: authService.RegisterInput }
    ) => {
      // Registration creates the account but does NOT establish a session —
      // no refresh cookie, no access token. The user must log in afterwards.
      await authService.register(input);
      return {
        success: true,
        message:
          'Account created successfully! Please log in with your registered email and password to continue.',
      };
    },

    login: async (_: unknown, { input }: { input: authService.LoginInput }, ctx: AppContext) => {
      const result = await authService.login(input, ctx.req.ip);
      setRefreshCookie(ctx.res, result.refreshToken);
      return { accessToken: result.accessToken, user: result.user };
    },

    logout: async (_: unknown, __: unknown, ctx: AppContext) => {
      const user = requireAuth(ctx);
      await authService.logout(user);
      clearRefreshCookie(ctx.res);
      return true;
    },

    refreshToken: async (_: unknown, __: unknown, ctx: AppContext) => {
      const token = ctx.req.cookies?.[REFRESH_COOKIE];
      const result = await authService.refresh(token);
      setRefreshCookie(ctx.res, result.refreshToken);
      return { accessToken: result.accessToken, user: result.user };
    },

    updateProfile: async (
      _: unknown,
      { input }: { input: userService.UpdateProfileInput },
      ctx: AppContext
    ) => {
      const user = requireAuth(ctx);
      return userService.updateProfile(user, input);
    },

    changePassword: async (
      _: unknown,
      { input }: { input: { currentPassword: string; newPassword: string } },
      ctx: AppContext
    ) => {
      const user = requireAuth(ctx);
      return authService.changePassword(user, input.currentPassword, input.newPassword);
    },
  },
};
