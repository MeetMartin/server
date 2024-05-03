import createLogger from "@7urtle/logger";
import Server from "./Server.js";
import apiError from "./apis/apiError.js";
import apiFile from "./apis/apiFile.js";

const defaultConfiguration = {
  options: {
    port: process.env.port || 3000
  },
  logger: createLogger(),
  routes: [],
  apiError: apiError,
};

const start = configuration =>
  Server.create({
    ...defaultConfiguration,
    ...configuration
  });

export default {start};

export {apiFile};