import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { buildContext } from './graphql/context';
import { configureCloudinary } from './services/cloudinary';
import uploadRouter from './routes/upload';

async function start(): Promise<void> {
  await connectDatabase();
  configureCloudinary();

  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // Secure HTTP headers (API server — CSP is handled by the Next.js frontend).
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

  const graphqlLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' },
  });

  const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many uploads. Please try again later.' },
  });

  app.use(cookieParser());
  app.use(cors({ origin: env.corsOrigins, credentials: true }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'cardsafe-backend' });
  });

  app.use('/api/upload', uploadLimiter, uploadRouter);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (formattedError) => {
      // Never leak stack traces or internals to clients — in any environment.
      // Log the detail server-side instead.
      if (env.nodeEnv !== 'production') {
        console.error('[graphql]', formattedError.message);
        const stacktrace = formattedError.extensions?.stacktrace as string[] | undefined;
        if (stacktrace?.[0]) {
          console.error('[graphql] stack:', stacktrace[0]);
        }
      }
      return {
        message: formattedError.message,
        extensions: {
          code: formattedError.extensions?.code ?? 'INTERNAL_SERVER_ERROR',
        },
      };
    },
  });

  await server.start();

  app.use(
    '/graphql',
    cors({ origin: env.corsOrigins, credentials: true }),
    graphqlLimiter,
    express.json({ limit: '16mb' }),
    expressMiddleware(server, { context: buildContext })
  );

  // Central error handler for REST routes (uploads, etc.). Maps known error
  // codes to sensible HTTP statuses, logs diagnostic detail server-side, and
  // never leaks stack traces or secrets to clients.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const e = err as {
      status?: number;
      code?: string;
      extensions?: { code?: string };
      message?: string;
    };
    const appCode = e.extensions?.code;
    const multerCode = e.code;

    let status = e.status ?? 500;
    if (multerCode === 'LIMIT_FILE_SIZE') status = 413;
    else if (appCode === 'BAD_USER_INPUT') status = 400;
    else if (appCode === 'UNAUTHENTICATED') status = 401;
    else if (appCode === 'FORBIDDEN') status = 403;
    else if (appCode === 'NOT_FOUND') status = 404;
    else if (appCode === 'CONFLICT') status = 409;

    const message =
      err instanceof Error && err.message ? err.message : 'Internal server error.';

    console.error(`[server] ${status} ${message}${appCode ? ` (${appCode})` : ''}`);
    if (env.nodeEnv !== 'production' && err instanceof Error && err.stack) {
      console.error('[server] stack:', err.stack.split('\n').slice(0, 4).join('\n'));
    }

    res.status(status).json({ error: message });
  });

  app.listen(env.port, () => {
    console.log(
      `[server] CARDSAFE backend ready at http://localhost:${env.port}/graphql (REST upload: /api/upload)`
    );
  });
}

start().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
