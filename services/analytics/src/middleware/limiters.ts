import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const heavyQueryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: 'Query limit reached, please wait before changing filters' },
  standardHeaders: true,
  legacyHeaders: false,
});
