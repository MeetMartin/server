import createLogger from "@7urtle/logger";
import loggerConfiguration from "./loggerConfiguration";
import apiError from "../../src/apis/apiError";
import {AsyncEffect} from "@7urtle/lambda";

const apiRoot = {
  post: () => AsyncEffect.of((reject, _) => reject(501)),
  patch: () => AsyncEffect.of((_, resolve) => { throw Error('I am a sad tortoise :(') }),
  any: request =>
    AsyncEffect.of((_, resolve) => resolve({
      ...request,
      status: 200,
      contentType: 'text/plain',
      content: 'any root result'
    }))
};

const redirectPath = {
  get: () =>
    AsyncEffect.of(_ => resolve => resolve({
      status: 301,
      headers: {
        location: 'https://www.7urtle.com'
      }
    }))
};

const apiPath = {
  get: request =>
    AsyncEffect.of((_, resolve) => resolve({
      //...request,
      status: 200,
      contentType: 'text/plain',
      content: 'get path result'
    })),
  any: request =>
    AsyncEffect.of((_, resolve) => resolve({
      ...request,
      status: 200,
      contentType: 'text/plain',
      content: 'any path result'
    }))
};

const apiUnicode = {
  any: request =>
    AsyncEffect.of((_, resolve) => resolve({
      ...request,
      status: 200,
      contentType: 'application/json',
      body: {horse: 'Příliš žluťoučký kůň úpěl ďábelské ódy'}
    }))
};

const apiUnicode2 = {
  any: request =>
    AsyncEffect.of((_, resolve) => resolve({
      ...request,
      status: 200,
      contentType: 'application/json',
      content: JSON.stringify({horse: 'Příliš žluťoučký kůň úpěl ďábelské ódy'})
    }))
};

const apiStar = {
  any: request =>
    AsyncEffect.of((_, resolve) => resolve({
      ...request,
      status: 200,
      contentType: 'text/plain',
      content: 'I am a star'
    }))
};

const apiPost = {
  post: request =>
    AsyncEffect.of((_, resolve) => resolve({
      ...request,
      status: 200,
      contentType: 'application/json',
      content: JSON.stringify(request.data)
    }))
};

const apiFile = path => ({
  any: request =>
    AsyncEffect.of((_, resolve) => resolve({
      ...request,
      status: 200,
      file: path,
      contentType: 'text/html',
      contentLength: 25
    }))
});

const apiOptions = {
  options: request =>
    AsyncEffect.of((_, resolve) => resolve({
      ...request,
      status: 204,
      allow: 'OPTIONS',
      'Access-Control-Allow-Origin': 'http://localhost:8080',
      'Access-Control-Request-Method': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Origin': 'http://localhost:8080'
    }))
};

const configuration = {
  options: {
    port: 3000
  },
  logger: createLogger(loggerConfiguration),
  apiError: apiError,
  routes: [
    {
      path: '/',
      api: apiRoot
    },
    {
      path: '/path',
      api: apiPath
    },
    {
      path: '/unicode',
      api: apiUnicode
    },
    {
      path: '/unicode2',
      api: apiUnicode2
    },
    {
      path: '/options',
      api: apiOptions
    },
    {
      path: '/star/*',
      api: apiStar
    },
    {
      path: '/post',
      api: apiPost
    },
    {
      path: '/file.html',
      api: apiFile('./tests/mocks/static.html')
    },
    {
      path: '/redirect',
      api: redirectPath
    }
  ],
};

const configurationWithListeners = {
  listeners: {
    request: (request, response) => response.end('Turtles are awesome!'),
    error: () => 'error',
    listening: () => 'listening'
  },
  ...configuration
};

const request = {configuration: configuration};
const response = {
  configuration: configuration,
  status: 404,
  contentType: 'text/plain',
  content: 'Not Found'
};

export {
  configuration,
  configurationWithListeners,
  request,
  response
};