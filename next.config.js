/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
// next.config.js
import { env } from "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {};

export default config;
