const rateLimit = require("express-rate-limit");

// Rate limiter untuk autentikasi
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // maksimal 5 request per window
  message: {
    error: "Too many authentication attempts, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter untuk API umum
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // maksimal 10 request per window
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter untuk pembuatan todo
const createTodoLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 10, // maksimal 10 todo per menit
  message: {
    error: "Too many todo creation attempts, please slow down.",
    retryAfter: "1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  apiLimiter,
  createTodoLimiter,
};
