import {endsWith, startsWith, substr, lengthOf, isEqual, Maybe, maybe, isFunction, passThrough} from '@7urtle/lambda';

/**
 * checkRoute :: string -> object -> boolean
 *
 * checkRoute outputs true if inputs path and route.path match.
 * checkRoute supports /* routes.
 */
const checkRoute = path => route =>
  endsWith('/*')(route.path)
    ? startsWith(substr(lengthOf(route.path) - 2)(0)(route.path))(path)
    : isEqual(route.path)(path);

/**
 * MaybeRoute :: object -> Maybe
 *
 * MaybeRoute outputs Maybe of route found in input request or Maybe of Nothing if route is not found.
 */
const MaybeRoute = request =>
  Maybe.of(request.configuration.routes.find(checkRoute(request.path)));

/**
 * emptyContent :: AsyncEffect -> AsyncEffect
 *
 * emptyContent maps AsyncEffect evaluating contentLength and making file and content values empty.
 */
const emptyContent = ApiEffect =>
  ApiEffect
  .map(result => ({
    ...result,
    contentLength: result.contentLength || Buffer.byteLength(result.content),
    file: '',
    content: ''
  }));

/**
 * rawGetApiEffect :: object -> AsyncEffect
 *
 * rawGetApiEffect outputs AsyncEffect with the response to a request based on a route.
 * rawGetApiEffect if head is not api call it outputs AsyncEffect of api call for get with empty file and content result if get is defined.
 * rawGetApiEffect if head is not api call it outputs AsyncEffect of api call for any with empty file and content result if get is not defined.
 * rawGetApiEffect outputs AsyncEffect of api 404 error for head call if head, get and any are not found.
 * rawGetApiEffect outputs AsyncEffect of api 404 error call if route is not found.
 * rawGetApiEffect outputs AsyncEffect of api any call if requested method call is not found.
 * rawGetApiEffect outputs AsyncEffect of 404 api call if both requested method call and any call are not found.
 */
const rawGetApiEffect = request =>
  maybe
  (request.configuration.apiError.any({...request, status: 404}))
  (route =>
    isFunction(route.api[request.method]) // is there api call for the request method?
      ? route.api[request.method](request) // call api for the request method
      : isEqual(request.method)('head') // is request method HEAD?
      ? isFunction(route.api.get) // can I use get instead of head
        ? emptyContent(route.api.get(request)) // use get instead of head
        : isFunction(route.api.any) // can I used any instead of head
          ? emptyContent(route.api.any(request)) // use any instead of head
          : emptyContent(request.configuration.apiError.any({...request, status: 404})) // call api for 404 error
      : isFunction(route.api.any) // is there api any function?
        ? route.api.any(request) // call api any function
        : request.configuration.apiError.any({...request, status: 404}) // call api for 404 error
  )
  (MaybeRoute(request));

/**
 * memory :: object
 *
 * memory used for default function memoization
 */
let memory = {};

/**
 * memoizedGetApiEffect :: object -> object -> AsyncEffect
 */
const memoizedGetApiEffect = memory => request =>
  (key =>
    key in memory
      ? memory[key]
      : (passThrough(result => memory[key] = result))
        (rawGetApiEffect(request))
  )
  (request.path + ' ' + request.method);

/**
 * getApiEffect :: object -> AsyncEffect
 *
 * getApiEffect is memoized version of rawGetApiEffect
 */
const getApiEffect = memoizedGetApiEffect(memory);

export default {getApiEffect};

export {
  checkRoute,
  MaybeRoute,
  emptyContent,
  rawGetApiEffect,
  memoizedGetApiEffect,
  memory
};