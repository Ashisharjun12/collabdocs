import { RateLimiterRedis } from 'rate-limiter-flexible';
import { RedisClient } from './redis-client.js';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../../utils/logger.js';
import { _config } from '../../config/config.js';

// api rate limit
export const apiRateLimiter = new RateLimiterRedis({
  storeClient: RedisClient.getConnection(),
  keyPrefix: 'api_limit',
  points: 500,
  duration: 60,
});

// auth rate limit
export const authRateLimiter = new RateLimiterRedis({
  storeClient: RedisClient.getConnection(),
  keyPrefix: 'auth_limit',
  points: 100,
  duration: 2 * 60, // 2 mins 
});


//rate limit middleware
const createRateLimitMiddleware = (limiter: RateLimiterRedis) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting in development
    if (_config.NODE_ENV !== 'production') {
      return next();
    }

    try {
      await limiter.consume(req.ip!);
      next();
    } catch (rejectRes) {
      logger.warn(`Rate limit triggered for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
      });
    }
  };
};

// email rate limit
export const emailRateLimiter = new RateLimiterRedis({
  storeClient: RedisClient.getConnection(),
  keyPrefix: 'email_limit',
  points: 5, // max 5 emails per 60 seconds
  duration: 60, // 1 minute
});

export const apiRateLimitMiddleware = createRateLimitMiddleware(apiRateLimiter);
export const authRateLimitMiddleware = createRateLimitMiddleware(authRateLimiter);
export const emailRateLimitMiddleware = createRateLimitMiddleware(emailRateLimiter);


