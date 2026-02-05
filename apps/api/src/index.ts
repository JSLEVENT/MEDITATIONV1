import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { generalRateLimit } from './middleware/rateLimitMiddleware';
import { initSentry } from './lib/sentry';

initSentry();

const app = express();

const webOrigin = process.env.WEB_ORIGIN || 'http://localhost:3000';

app.use(cors({ origin: webOrigin, credentials: true }));
app.use(helmet());
app.use(compression());
app.use(
  express.json({
    limit: '1mb',
    verify: (req, _res, buf) => {
      (req as typeof req & { rawBody?: Buffer }).rawBody = buf;
    }
  })
);
app.use(morgan('tiny'));

app.use(generalRateLimit(100, 60));

app.use(routes);

app.use(errorHandler);

const port = Number(process.env.PORT) || 3001;

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
