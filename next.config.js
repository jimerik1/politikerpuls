/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
// next.config.js
/** @type {import("next").NextConfig} */
const config = {};

// Import env validation
require("./src/env.js");

module.exports = config;