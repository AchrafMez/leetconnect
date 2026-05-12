import rateLimit from 'express-rate-limit'

export const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 300,
	message: { message: 'Too many requests, please slow down'},
	standardHeaders: true,
	legacyHeaders: false
});

export const mutationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  message: { message: 'Too many modification requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

