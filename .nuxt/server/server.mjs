import { effectScope, shallowReactive, reactive, getCurrentScope, hasInjectionContext, getCurrentInstance, inject, toRef, version, unref, h, shallowRef, isReadonly, isRef, isShallow, isReactive, toRaw, defineComponent, mergeModels, useModel, ref, mergeProps, useSSRContext, computed, provide, watch, Suspense, nextTick, Fragment, Transition, defineAsyncComponent, onErrorCaptured, onServerPrefetch, createVNode, resolveDynamicComponent, createApp } from "vue";
import { $fetch } from "ofetch";
import { baseURL } from "#internal/nuxt/paths";
import { createHooks } from "hookable";
import { getContext } from "unctx";
import { sanitizeStatusCode, createError as createError$1 } from "h3";
import { getActiveHead, CapoPlugin } from "unhead";
import { defineHeadPlugin } from "@unhead/shared";
import { START_LOCATION, createMemoryHistory, createRouter as createRouter$1, RouterView } from "vue-router";
import { toRouteMatcher, createRouter } from "radix3";
import { defu } from "defu";
import { hasProtocol, isScriptProtocol, joinURL, withQuery } from "ufo";
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderDynamicModel, ssrRenderStyle, ssrRenderComponent, ssrRenderList, ssrRenderSuspense, ssrRenderVNode } from "vue/server-renderer";
import "twilio";
import { useMouseInElement } from "@vueuse/core";
if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL()
  });
}
const appPageTransition = false;
const appKeepalive = false;
const nuxtLinkDefaults = { "componentName": "NuxtLink", "prefetch": true, "prefetchOn": { "visibility": true } };
const appId = "nuxt-app";
function getNuxtAppCtx(id = appId) {
  return getContext(id, {
    asyncContext: false
  });
}
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  var _a;
  let hydratingCount = 0;
  const nuxtApp = {
    _id: options.id || appId || "nuxt-app",
    _scope: effectScope(),
    provide: void 0,
    globalName: "nuxt",
    versions: {
      get nuxt() {
        return "3.13.2";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      ...((_a = options.ssrContext) == null ? void 0 : _a.payload) || {},
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: {
      data: {}
    },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) {
        return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      }
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  {
    nuxtApp.payload.serverRendered = true;
  }
  if (nuxtApp.ssrContext) {
    nuxtApp.payload.path = nuxtApp.ssrContext.url;
    nuxtApp.ssrContext.nuxt = nuxtApp;
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: nuxtApp.ssrContext.runtimeConfig.public,
      app: nuxtApp.ssrContext.runtimeConfig.app
    };
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
function registerPluginHooks(nuxtApp, plugin2) {
  if (plugin2.hooks) {
    nuxtApp.hooks.addHooks(plugin2.hooks);
  }
}
async function applyPlugin(nuxtApp, plugin2) {
  if (typeof plugin2 === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin2(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  var _a, _b, _c, _d;
  const resolvedPlugins = [];
  const unresolvedPlugins = [];
  const parallels = [];
  const errors = [];
  let promiseDepth = 0;
  async function executePlugin(plugin2) {
    var _a2;
    const unresolvedPluginsForThisPlugin = ((_a2 = plugin2.dependsOn) == null ? void 0 : _a2.filter((name) => plugins2.some((p) => p._name === name) && !resolvedPlugins.includes(name))) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin2]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin2).then(async () => {
        if (plugin2._name) {
          resolvedPlugins.push(plugin2._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin2._name)) {
              dependsOn.delete(plugin2._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      });
      if (plugin2.parallel) {
        parallels.push(promise.catch((e) => errors.push(e)));
      } else {
        await promise;
      }
    }
  }
  for (const plugin2 of plugins2) {
    if (((_a = nuxtApp.ssrContext) == null ? void 0 : _a.islandContext) && ((_b = plugin2.env) == null ? void 0 : _b.islands) === false) {
      continue;
    }
    registerPluginHooks(nuxtApp, plugin2);
  }
  for (const plugin2 of plugins2) {
    if (((_c = nuxtApp.ssrContext) == null ? void 0 : _c.islandContext) && ((_d = plugin2.env) == null ? void 0 : _d.islands) === false) {
      continue;
    }
    await executePlugin(plugin2);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (errors.length) {
    throw errors[0];
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin2) {
  if (typeof plugin2 === "function") {
    return plugin2;
  }
  const _name = plugin2._name || plugin2.name;
  delete plugin2.name;
  return Object.assign(plugin2.setup || (() => {
  }), plugin2, { [NuxtPluginIndicator]: true, _name });
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
function tryUseNuxtApp(id) {
  var _a;
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = (_a = getCurrentInstance()) == null ? void 0 : _a.appContext.app.$nuxt;
  }
  nuxtAppInstance = nuxtAppInstance || getNuxtAppCtx(id).tryUse();
  return nuxtAppInstance || null;
}
function useNuxtApp(id) {
  const nuxtAppInstance = tryUseNuxtApp(id);
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const LayoutMetaSymbol = Symbol("layout-meta");
const PageRouteSymbol = Symbol("route");
const useRouter = () => {
  var _a;
  return (_a = useNuxtApp()) == null ? void 0 : _a.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const navigateTo = (to, options) => {
  if (!to) {
    to = "/";
  }
  const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
  const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
  const isExternal = (options == null ? void 0 : options.external) || isExternalHost;
  if (isExternal) {
    if (!(options == null ? void 0 : options.external)) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedLoc = location2.replace(/"/g, "%22");
        const encodedHeader = encodeURL(location2, isExternalHost);
        nuxtApp.ssrContext._renderResponse = {
          statusCode: sanitizeStatusCode((options == null ? void 0 : options.redirectCode) || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodedHeader }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options == null ? void 0 : options.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  return (options == null ? void 0 : options.replace) ? router.replace(to) : router.push(to);
};
function resolveRouteObject(to) {
  return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
function encodeURL(location2, isExternalHost = false) {
  const url = new URL(location2, "http://localhost");
  if (!isExternalHost) {
    return url.pathname + url.search + url.hash;
  }
  if (location2.startsWith("//")) {
    return url.toString().replace(url.protocol, "");
  }
  return url.toString();
}
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = () => toRef(useNuxtApp().payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const nuxtApp = useNuxtApp();
    const error2 = useError();
    if (false) ;
    error2.value = error2.value || nuxtError;
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  return nuxtError;
};
version[0] === "3";
function resolveUnref(r) {
  return typeof r === "function" ? r() : unref(r);
}
function resolveUnrefHeadInput(ref2) {
  if (ref2 instanceof Promise || ref2 instanceof Date || ref2 instanceof RegExp)
    return ref2;
  const root = resolveUnref(ref2);
  if (!ref2 || !root)
    return root;
  if (Array.isArray(root))
    return root.map((r) => resolveUnrefHeadInput(r));
  if (typeof root === "object") {
    const resolved = {};
    for (const k in root) {
      if (!Object.prototype.hasOwnProperty.call(root, k)) {
        continue;
      }
      if (k === "titleTemplate" || k[0] === "o" && k[1] === "n") {
        resolved[k] = unref(root[k]);
        continue;
      }
      resolved[k] = resolveUnrefHeadInput(root[k]);
    }
    return resolved;
  }
  return root;
}
defineHeadPlugin({
  hooks: {
    "entries:resolve": (ctx) => {
      for (const entry2 of ctx.entries)
        entry2.resolvedInput = resolveUnrefHeadInput(entry2.input);
    }
  }
});
const headSymbol = "usehead";
const _global = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
const globalKey$1 = "__unhead_injection_handler__";
function setHeadInjectionHandler(handler) {
  _global[globalKey$1] = handler;
}
function injectHead() {
  if (globalKey$1 in _global) {
    return _global[globalKey$1]();
  }
  const head = inject(headSymbol);
  if (!head && process.env.NODE_ENV !== "production")
    console.warn("Unhead is missing Vue context, falling back to shared context. This may have unexpected results.");
  return head || getActiveHead();
}
[CapoPlugin({ track: true })];
const unhead_KgADcZ0jPj = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    setHeadInjectionHandler(
      // need a fresh instance of the nuxt app to avoid parallel requests interfering with each other
      () => useNuxtApp().vueApp._context.provides.usehead
    );
    nuxtApp.vueApp.use(head);
  }
});
function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als && currentInstance === void 0) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      contexts[key];
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
_globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());
function executeAsync(function_) {
  const restores = [];
  for (const leaveHandler of asyncHandlers) {
    const restore2 = leaveHandler();
    if (restore2) {
      restores.push(restore2);
    }
  }
  const restore = () => {
    for (const restore2 of restores) {
      restore2();
    }
  };
  let awaitable = function_();
  if (awaitable && typeof awaitable === "object" && "catch" in awaitable) {
    awaitable = awaitable.catch((error) => {
      restore();
      throw error;
    });
  }
  return [awaitable, restore];
}
const interpolatePath = (route, match) => {
  return match.path.replace(/(:\w+)\([^)]+\)/g, "$1").replace(/(:\w+)[?+*]/g, "$1").replace(/:\w+/g, (r) => {
    var _a;
    return ((_a = route.params[r.slice(1)]) == null ? void 0 : _a.toString()) || "";
  });
};
const generateRouteKey$1 = (routeProps, override) => {
  const matchedRoute = routeProps.route.matched.find((m) => {
    var _a;
    return ((_a = m.components) == null ? void 0 : _a.default) === routeProps.Component.type;
  });
  const source = override ?? (matchedRoute == null ? void 0 : matchedRoute.meta.key) ?? (matchedRoute && interpolatePath(routeProps.route, matchedRoute));
  return typeof source === "function" ? source(routeProps.route) : source;
};
const wrapInKeepAlive = (props, children) => {
  return { default: () => children };
};
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}
async function getRouteRules(url) {
  {
    const _routeRulesMatcher = toRouteMatcher(
      createRouter({ routes: (/* @__PURE__ */ useRuntimeConfig()).nitro.routeRules })
    );
    return defu({}, ..._routeRulesMatcher.matchAll(url).reverse());
  }
}
const _routes = [
  {
    name: "ApplyNow",
    path: "/ApplyNow",
    component: () => import("./_nuxt/ApplyNow-O7ynF3PA.js")
  },
  {
    name: "index",
    path: "/",
    component: () => import("./_nuxt/index-BaaSBkLQ.js")
  }
];
const _wrapIf = (component, props, slots) => {
  props = props === true ? {} : props;
  return { default: () => {
    var _a;
    return props ? h(component, props, slots) : (_a = slots.default) == null ? void 0 : _a.call(slots);
  } };
};
function generateRouteKey(route) {
  const source = (route == null ? void 0 : route.meta.key) ?? route.path.replace(/(:\w+)\([^)]+\)/g, "$1").replace(/(:\w+)[?+*]/g, "$1").replace(/:\w+/g, (r) => {
    var _a;
    return ((_a = route.params[r.slice(1)]) == null ? void 0 : _a.toString()) || "";
  });
  return typeof source === "function" ? source(route) : source;
}
function isChangingPage(to, from) {
  if (to === from || from === START_LOCATION) {
    return false;
  }
  if (generateRouteKey(to) !== generateRouteKey(from)) {
    return true;
  }
  const areComponentsSame = to.matched.every(
    (comp, index) => {
      var _a, _b;
      return comp.components && comp.components.default === ((_b = (_a = from.matched[index]) == null ? void 0 : _a.components) == null ? void 0 : _b.default);
    }
  );
  if (areComponentsSame) {
    return false;
  }
  return true;
}
const routerOptions0 = {
  scrollBehavior(to, from, savedPosition) {
    var _a;
    const nuxtApp = useNuxtApp();
    const behavior = ((_a = useRouter().options) == null ? void 0 : _a.scrollBehaviorType) ?? "auto";
    let position = savedPosition || void 0;
    const routeAllowsScrollToTop = typeof to.meta.scrollToTop === "function" ? to.meta.scrollToTop(to, from) : to.meta.scrollToTop;
    if (!position && from && to && routeAllowsScrollToTop !== false && isChangingPage(to, from)) {
      position = { left: 0, top: 0 };
    }
    if (to.path === from.path) {
      if (from.hash && !to.hash) {
        return { left: 0, top: 0 };
      }
      if (to.hash) {
        return { el: to.hash, top: _getHashElementScrollMarginTop(to.hash), behavior };
      }
      return false;
    }
    const hasTransition = (route) => !!(route.meta.pageTransition ?? appPageTransition);
    const hookToWait = hasTransition(from) && hasTransition(to) ? "page:transition:finish" : "page:finish";
    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce(hookToWait, async () => {
        await new Promise((resolve2) => setTimeout(resolve2, 0));
        if (to.hash) {
          position = { el: to.hash, top: _getHashElementScrollMarginTop(to.hash), behavior };
        }
        resolve(position);
      });
    });
  }
};
function _getHashElementScrollMarginTop(selector) {
  try {
    const elem = (void 0).querySelector(selector);
    if (elem) {
      return (Number.parseFloat(getComputedStyle(elem).scrollMarginTop) || 0) + (Number.parseFloat(getComputedStyle((void 0).documentElement).scrollPaddingTop) || 0);
    }
  } catch {
  }
  return 0;
}
const configRouterOptions = {
  hashMode: false,
  scrollBehaviorType: "auto"
};
const routerOptions = {
  ...configRouterOptions,
  ...routerOptions0
};
const validate = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to) => {
  var _a;
  let __temp, __restore;
  if (!((_a = to.meta) == null ? void 0 : _a.validate)) {
    return;
  }
  const nuxtApp = useNuxtApp();
  const router = useRouter();
  const result = ([__temp, __restore] = executeAsync(() => Promise.resolve(to.meta.validate(to))), __temp = await __temp, __restore(), __temp);
  if (result === true) {
    return;
  }
  const error = createError({
    statusCode: result && result.statusCode || 404,
    statusMessage: result && result.statusMessage || `Page Not Found: ${to.fullPath}`,
    data: {
      path: to.fullPath
    }
  });
  const unsub = router.beforeResolve((final) => {
    unsub();
    if (final === to) {
      const unsub2 = router.afterEach(async () => {
        unsub2();
        await nuxtApp.runWithContext(() => showError(error));
      });
      return false;
    }
  });
});
const manifest_45route_45rule = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to) => {
  {
    return;
  }
});
const globalMiddleware = [
  validate,
  manifest_45route_45rule
];
const namedMiddleware = {};
const plugin = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  async setup(nuxtApp) {
    var _a, _b, _c;
    let __temp, __restore;
    let routerBase = (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    if (routerOptions.hashMode && !routerBase.includes("#")) {
      routerBase += "#";
    }
    const history = ((_a = routerOptions.history) == null ? void 0 : _a.call(routerOptions, routerBase)) ?? createMemoryHistory(routerBase);
    const routes = routerOptions.routes ? ([__temp, __restore] = executeAsync(() => routerOptions.routes(_routes)), __temp = await __temp, __restore(), __temp) ?? _routes : _routes;
    let startPosition;
    const router = createRouter$1({
      ...routerOptions,
      scrollBehavior: (to, from, savedPosition) => {
        if (from === START_LOCATION) {
          startPosition = savedPosition;
          return;
        }
        if (routerOptions.scrollBehavior) {
          router.options.scrollBehavior = routerOptions.scrollBehavior;
          if ("scrollRestoration" in (void 0).history) {
            const unsub = router.beforeEach(() => {
              unsub();
              (void 0).history.scrollRestoration = "manual";
            });
          }
          return routerOptions.scrollBehavior(to, START_LOCATION, startPosition || savedPosition);
        }
      },
      history,
      routes
    });
    nuxtApp.vueApp.use(router);
    const previousRoute = shallowRef(router.currentRoute.value);
    router.afterEach((_to, from) => {
      previousRoute.value = from;
    });
    Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", {
      get: () => previousRoute.value
    });
    const initialURL = nuxtApp.ssrContext.url;
    const _route = shallowRef(router.currentRoute.value);
    const syncCurrentRoute = () => {
      _route.value = router.currentRoute.value;
    };
    nuxtApp.hook("page:finish", syncCurrentRoute);
    router.afterEach((to, from) => {
      var _a2, _b2, _c2, _d;
      if (((_b2 = (_a2 = to.matched[0]) == null ? void 0 : _a2.components) == null ? void 0 : _b2.default) === ((_d = (_c2 = from.matched[0]) == null ? void 0 : _c2.components) == null ? void 0 : _d.default)) {
        syncCurrentRoute();
      }
    });
    const route = {};
    for (const key in _route.value) {
      Object.defineProperty(route, key, {
        get: () => _route.value[key],
        enumerable: true
      });
    }
    nuxtApp._route = shallowReactive(route);
    nuxtApp._middleware = nuxtApp._middleware || {
      global: [],
      named: {}
    };
    useError();
    if (!((_b = nuxtApp.ssrContext) == null ? void 0 : _b.islandContext)) {
      router.afterEach(async (to, _from, failure) => {
        delete nuxtApp._processingMiddleware;
        if (failure) {
          await nuxtApp.callHook("page:loading:end");
        }
        if ((failure == null ? void 0 : failure.type) === 4) {
          return;
        }
        if (to.matched.length === 0) {
          await nuxtApp.runWithContext(() => showError(createError$1({
            statusCode: 404,
            fatal: false,
            statusMessage: `Page not found: ${to.fullPath}`,
            data: {
              path: to.fullPath
            }
          })));
        } else if (to.redirectedFrom && to.fullPath !== initialURL) {
          await nuxtApp.runWithContext(() => navigateTo(to.fullPath || "/"));
        }
      });
    }
    try {
      if (true) {
        ;
        [__temp, __restore] = executeAsync(() => router.push(initialURL)), await __temp, __restore();
        ;
      }
      ;
      [__temp, __restore] = executeAsync(() => router.isReady()), await __temp, __restore();
      ;
    } catch (error2) {
      [__temp, __restore] = executeAsync(() => nuxtApp.runWithContext(() => showError(error2))), await __temp, __restore();
    }
    const resolvedInitialRoute = router.currentRoute.value;
    syncCurrentRoute();
    if ((_c = nuxtApp.ssrContext) == null ? void 0 : _c.islandContext) {
      return { provide: { router } };
    }
    const initialLayout = nuxtApp.payload.state._layout;
    router.beforeEach(async (to, from) => {
      var _a2, _b2;
      await nuxtApp.callHook("page:loading:start");
      to.meta = reactive(to.meta);
      if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) {
        to.meta.layout = initialLayout;
      }
      nuxtApp._processingMiddleware = true;
      if (!((_a2 = nuxtApp.ssrContext) == null ? void 0 : _a2.islandContext)) {
        const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
        for (const component of to.matched) {
          const componentMiddleware = component.meta.middleware;
          if (!componentMiddleware) {
            continue;
          }
          for (const entry2 of toArray(componentMiddleware)) {
            middlewareEntries.add(entry2);
          }
        }
        {
          const routeRules = await nuxtApp.runWithContext(() => getRouteRules(to.path));
          if (routeRules.appMiddleware) {
            for (const key in routeRules.appMiddleware) {
              if (routeRules.appMiddleware[key]) {
                middlewareEntries.add(key);
              } else {
                middlewareEntries.delete(key);
              }
            }
          }
        }
        for (const entry2 of middlewareEntries) {
          const middleware = typeof entry2 === "string" ? nuxtApp._middleware.named[entry2] || await ((_b2 = namedMiddleware[entry2]) == null ? void 0 : _b2.call(namedMiddleware).then((r) => r.default || r)) : entry2;
          if (!middleware) {
            throw new Error(`Unknown route middleware: '${entry2}'.`);
          }
          const result = await nuxtApp.runWithContext(() => middleware(to, from));
          {
            if (result === false || result instanceof Error) {
              const error2 = result || createError$1({
                statusCode: 404,
                statusMessage: `Page Not Found: ${initialURL}`
              });
              await nuxtApp.runWithContext(() => showError(error2));
              return false;
            }
          }
          if (result === true) {
            continue;
          }
          if (result || result === false) {
            return result;
          }
        }
      }
    });
    router.onError(async () => {
      delete nuxtApp._processingMiddleware;
      await nuxtApp.callHook("page:loading:end");
    });
    nuxtApp.hooks.hookOnce("app:created", async () => {
      try {
        if ("name" in resolvedInitialRoute) {
          resolvedInitialRoute.name = void 0;
        }
        await router.replace({
          ...resolvedInitialRoute,
          force: true
        });
        router.options.scrollBehavior = routerOptions.scrollBehavior;
      } catch (error2) {
        await nuxtApp.runWithContext(() => showError(error2));
      }
    });
    return { provide: { router } };
  }
});
function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext._payloadReducers[name] = reduce;
  }
}
const reducers = [
  ["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
  ["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
  ["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
  ["Ref", (data) => isRef(data) && data.value],
  ["Reactive", (data) => isReactive(data) && toRaw(data)]
];
const revive_payload_server_eJ33V7gbc6 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const [reducer, fn] of reducers) {
      definePayloadReducer(reducer, fn);
    }
  }
});
const components_plugin_KR1HBZs4kY = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
const plugins = [
  unhead_KgADcZ0jPj,
  plugin,
  revive_payload_server_eJ33V7gbc6,
  components_plugin_KR1HBZs4kY
];
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "InputAndLabel",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    labelStr: {},
    inputType: {},
    notRequired: { type: Boolean }
  }, {
    "modelValue": { type: [String, Boolean, Date] },
    "modelModifiers": {}
  }),
  emits: ["update:modelValue"],
  setup(__props) {
    const textInput = useModel(__props, "modelValue");
    let staticTextInput = ref();
    ref();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mb-3" }, _attrs))} data-v-406455d3><label${ssrRenderAttr("for", unref(staticTextInput))} class="form-label" data-v-406455d3>${ssrInterpolate(_ctx.labelStr)}</label>`);
      if (_ctx.inputType == "radio") {
        _push(`<div data-v-406455d3><div class="form-check" data-v-406455d3><input class="form-check-input" type="radio"${ssrRenderAttr("name", _ctx.labelStr)}${ssrRenderAttr("id", _ctx.labelStr + "1")}${ssrIncludeBooleanAttr(_ctx.notRequired ? !_ctx.notRequired : true) ? " required" : ""} data-v-406455d3><label class="form-check-label" for="textInput1" data-v-406455d3> Yes </label></div><div class="form-check" data-v-406455d3><input class="form-check-input" type="radio"${ssrRenderAttr("name", _ctx.labelStr)}${ssrRenderAttr("id", _ctx.labelStr + "2")}${ssrIncludeBooleanAttr(_ctx.notRequired ? !_ctx.notRequired : true) ? " required" : ""} data-v-406455d3><label class="form-check-label" for="textInput2" data-v-406455d3> No </label></div></div>`);
      } else if (_ctx.inputType == "textarea") {
        _push(`<textarea class="form-control"${ssrRenderAttr("id", unref(staticTextInput))}${ssrIncludeBooleanAttr(_ctx.notRequired ? !_ctx.notRequired : true) ? " required" : ""} data-v-406455d3></textarea>`);
      } else {
        _push(`<input${ssrRenderDynamicModel(_ctx.inputType, textInput.value, null)}${ssrRenderAttr("type", _ctx.inputType)} class="form-control"${ssrRenderAttr("id", unref(staticTextInput))}${ssrIncludeBooleanAttr(_ctx.notRequired ? !_ctx.notRequired : true) ? " required" : ""} data-v-406455d3>`);
      }
      _push(`</div>`);
    };
  }
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/InputAndLabel.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const __nuxt_component_0$2 = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-406455d3"]]);
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "ThankYouConfirm",
  __ssrInlineRender: true,
  props: {
    "modelValue": {},
    "modelModifiers": {}
  },
  emits: ["update:modelValue"],
  setup(__props) {
    useModel(__props, "modelValue");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "d-flex flex-column align-items-center justify-content-center",
        style: { "height": "85vh" }
      }, _attrs))}><h1 class="font-libre fw-semibold">Thank you for your interest in Thistledown Recovery Home!</h1><br><h4 class="font-libre w-75 text-center">We have received your application and appreciate your interest. Our team will carefully review the information you provided, and we will contact you if any additional details are needed or if you move forward in the process. If you have any questions in the meantime, please don’t hesitate to reach out to <a href="mailto:info@thistledownrecoveryhome.com"><u>info@thistledownrecoveryhome.com</u></a>. Thank you for taking the time to apply—we look forward to reviewing your application!</h4><br><h2 class="w-75 fst-italic">Best regards, </h2><h2 class="w-75 font-libre">Thistledown Recovery Home</h2><br><button class="btn btn-primary">Close</button></div>`);
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ThankYouConfirm.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "HousemateApplication",
  __ssrInlineRender: true,
  props: {
    "showModal": {},
    "showModalModifiers": {},
    "applicantName": {},
    "applicantNameModifiers": {},
    "applicantAddr": {},
    "applicantAddrModifiers": {},
    "applicantEmailAddr": {},
    "applicantEmailAddrModifiers": {},
    "applicantPhoneNum": {},
    "applicantPhoneNumModifiers": {},
    "applicantDOB": {},
    "applicantDOBModifiers": {},
    "appContactAndPhone": {},
    "appContactAndPhoneModifiers": {},
    "applicantNextOfKin": {},
    "applicantNextOfKinModifiers": {},
    "applicantHearOfUs": {},
    "applicantHearOfUsModifiers": {},
    "applicantProgram": {},
    "applicantProgramModifiers": {},
    "applicantAdmitDate": {},
    "applicantAdmitDateModifiers": {},
    "applicantSupervisor": {},
    "applicantSupervisorModifiers": {},
    "appSupeEmail": {},
    "appSupeEmailModifiers": {},
    "appSupePhone": {},
    "appSupePhoneModifiers": {},
    "appLeaveHome": { type: Boolean },
    "appLeaveHomeModifiers": {},
    "appLeaveReason": {},
    "appLeaveReasonModifiers": {},
    "appEvicted": { type: Boolean },
    "appEvictedModifiers": {},
    "appEvictWhy": {},
    "appEvictWhyModifiers": {},
    "appLastUse": {},
    "appLastUseModifiers": {},
    "appWarrants": {},
    "appWarrantsModifiers": {},
    "appProbation": {},
    "appProbationModifiers": {},
    "appSexOffend": { type: Boolean },
    "appSexOffendModifiers": {},
    "appViolence": { type: Boolean },
    "appViolenceModifiers": {},
    "appViolenceExplain": {},
    "appViolenceExplainModifiers": {},
    "appRestrOrder": { type: Boolean },
    "appRestrOrderModifiers": {},
    "appRestrExplain": {},
    "appRestrExplainModifiers": {},
    "appTreatment": { type: Boolean },
    "appTreatmentModifiers": {},
    "appTreatProvNamePhone": {},
    "appTreatProvNamePhoneModifiers": {},
    "appMedication": {},
    "appMedicationModifiers": {},
    "appAllergies": { type: Boolean },
    "appAllergiesModifiers": {},
    "appAllergiesExplain": {},
    "appAllergiesExplainModifiers": {},
    "appInhaler": { type: Boolean },
    "appInhalerModifiers": {},
    "appInhalerExplain": {},
    "appInhalerExplainModifiers": {},
    "appMedConditions": {},
    "appMedConditionsModifiers": {},
    "appMentalConditions": {},
    "appMentalConditionsModifiers": {},
    "appCovidVacc": { type: Boolean },
    "appCovidVaccModifiers": {},
    "appCovidWilling": { type: Boolean },
    "appCovidWillingModifiers": {},
    "appMedicalIns": { type: Boolean },
    "appMedicalInsModifiers": {},
    "appPolicyNameNum": {},
    "appPolicyNameNumModifiers": {},
    "applicantMarriage": {},
    "applicantMarriageModifiers": {},
    "applicantChildren": {},
    "applicantChildrenModifiers": {},
    "appEmployment": {},
    "appEmploymentModifiers": {},
    "appDriverLic": { type: Boolean },
    "appDriverLicModifiers": {},
    "appParking": { type: Boolean },
    "appParkingModifiers": {},
    "appCarLicNum": {},
    "appCarLicNumModifiers": {},
    "appMakeModel": {},
    "appMakeModelModifiers": {},
    "appRecoveryQues": {},
    "appRecoveryQuesModifiers": {},
    "appHowWeHelp": {},
    "appHowWeHelpModifiers": {},
    "applicantQualities": {},
    "applicantQualitiesModifiers": {},
    "appTroubleWRules": {},
    "appTroubleWRulesModifiers": {},
    "appCharacteristics": {},
    "appCharacteristicsModifiers": {},
    "appCharOther": {},
    "appCharOtherModifiers": {},
    "appReservations": {},
    "appReservationsModifiers": {},
    "appWhatShouldWeKnow": {},
    "appWhatShouldWeKnowModifiers": {}
  },
  emits: ["update:showModal", "update:applicantName", "update:applicantAddr", "update:applicantEmailAddr", "update:applicantPhoneNum", "update:applicantDOB", "update:appContactAndPhone", "update:applicantNextOfKin", "update:applicantHearOfUs", "update:applicantProgram", "update:applicantAdmitDate", "update:applicantSupervisor", "update:appSupeEmail", "update:appSupePhone", "update:appLeaveHome", "update:appLeaveReason", "update:appEvicted", "update:appEvictWhy", "update:appLastUse", "update:appWarrants", "update:appProbation", "update:appSexOffend", "update:appViolence", "update:appViolenceExplain", "update:appRestrOrder", "update:appRestrExplain", "update:appTreatment", "update:appTreatProvNamePhone", "update:appMedication", "update:appAllergies", "update:appAllergiesExplain", "update:appInhaler", "update:appInhalerExplain", "update:appMedConditions", "update:appMentalConditions", "update:appCovidVacc", "update:appCovidWilling", "update:appMedicalIns", "update:appPolicyNameNum", "update:applicantMarriage", "update:applicantChildren", "update:appEmployment", "update:appDriverLic", "update:appParking", "update:appCarLicNum", "update:appMakeModel", "update:appRecoveryQues", "update:appHowWeHelp", "update:applicantQualities", "update:appTroubleWRules", "update:appCharacteristics", "update:appCharOther", "update:appReservations", "update:appWhatShouldWeKnow"],
  setup(__props) {
    const showModal = useModel(__props, "showModal");
    const clickedOnce = ref(true);
    const applicantName = useModel(__props, "applicantName");
    const todaysDate = ref(new Date(Date.now()));
    const applicantAddr = useModel(__props, "applicantAddr");
    const applicantEmailAddr = useModel(__props, "applicantEmailAddr");
    const applicantPhoneNum = useModel(__props, "applicantPhoneNum");
    const applicantDOB = useModel(__props, "applicantDOB");
    const appContactAndPhone = useModel(__props, "appContactAndPhone");
    const applicantNextOfKin = useModel(__props, "applicantNextOfKin");
    const applicantHearOfUs = useModel(__props, "applicantHearOfUs");
    const applicantProgram = useModel(__props, "applicantProgram");
    const applicantAdmitDate = useModel(__props, "applicantAdmitDate");
    const applicantSupervisor = useModel(__props, "applicantSupervisor");
    const appSupeEmail = useModel(__props, "appSupeEmail");
    const appSupePhone = useModel(__props, "appSupePhone");
    const appLeaveHome = useModel(__props, "appLeaveHome");
    const appLeaveReason = useModel(__props, "appLeaveReason");
    const appEvicted = useModel(__props, "appEvicted");
    const appEvictWhy = useModel(__props, "appEvictWhy");
    const appLastUse = useModel(__props, "appLastUse");
    const appWarrants = useModel(__props, "appWarrants");
    const appProbation = useModel(__props, "appProbation");
    const appSexOffend = useModel(__props, "appSexOffend");
    const appViolence = useModel(__props, "appViolence");
    const appViolenceExplain = useModel(__props, "appViolenceExplain");
    const appRestrOrder = useModel(__props, "appRestrOrder");
    const appRestrExplain = useModel(__props, "appRestrExplain");
    const appTreatment = useModel(__props, "appTreatment");
    const appTreatProvNamePhone = useModel(__props, "appTreatProvNamePhone");
    const appMedication = useModel(__props, "appMedication");
    const appAllergies = useModel(__props, "appAllergies");
    const appAllergiesExplain = useModel(__props, "appAllergiesExplain");
    const appInhaler = useModel(__props, "appInhaler");
    const appInhalerExplain = useModel(__props, "appInhalerExplain");
    const appMedConditions = useModel(__props, "appMedConditions");
    const appMentalConditions = useModel(__props, "appMentalConditions");
    const appCovidVacc = useModel(__props, "appCovidVacc");
    const appCovidWilling = useModel(__props, "appCovidWilling");
    const appMedicalIns = useModel(__props, "appMedicalIns");
    const appPolicyNameNum = useModel(__props, "appPolicyNameNum");
    const applicantMarriage = useModel(__props, "applicantMarriage");
    const applicantChildren = useModel(__props, "applicantChildren");
    const appEmployment = useModel(__props, "appEmployment");
    const appDriverLic = useModel(__props, "appDriverLic");
    const appParking = useModel(__props, "appParking");
    const appCarLicNum = useModel(__props, "appCarLicNum");
    const appMakeModel = useModel(__props, "appMakeModel");
    const appRecoveryQues = useModel(__props, "appRecoveryQues");
    const appHowWeHelp = useModel(__props, "appHowWeHelp");
    const applicantQualities = useModel(__props, "applicantQualities");
    const appTroubleWRules = useModel(__props, "appTroubleWRules");
    useModel(__props, "appCharacteristics");
    const appCharOther = useModel(__props, "appCharOther");
    const commChars = ["temper", "social awkwardness", "anxiety", "arrogance", "bullying", "sarcasm", "need for control", "shyness", "tendency to lie", "defiance", "mistrust of other men", "not 'fitting in'"];
    const appReservations = useModel(__props, "appReservations");
    const appWhatShouldWeKnow = useModel(__props, "appWhatShouldWeKnow");
    const commCharChoices = ref([]);
    computed(() => {
      return {
        "Name": applicantName.value,
        "Date": todaysDate.value.toDateString(),
        "Address": applicantAddr.value,
        "Phone #": applicantPhoneNum.value,
        "Date of Birth": applicantDOB.value,
        "Email Address": applicantEmailAddr.value,
        "Emergency Contact and Phone": appContactAndPhone.value,
        "Next of kin, if different": applicantNextOfKin.value,
        "How did you hear about us?": applicantHearOfUs.value,
        "Name of program or facility": applicantProgram.value,
        "Date you arrived or were admitted": applicantAdmitDate.value,
        "Aftercare coordinator or DOC supervisor": applicantSupervisor.value,
        "Coordinator/Supervisor Email address": appSupeEmail.value,
        "Coordinator/Supervisor Phone #": appSupePhone.value,
        "Have you ever been asked to leave a sober house or treatment center?": appLeaveHome.value,
        "If so, what was the reason?": appLeaveReason.value,
        "Have you ever been evicted?": appEvicted.value,
        "If so, why?": appEvictWhy.value,
        "When did you last use alcohol or illegal drugs?": appLastUse.value,
        "Do you have any outstanding warrants, pending criminal charges or upcoming court dates?": appWarrants.value,
        "Are you on probation, parole, or suspended sentence? Please explain": appProbation.value,
        "Are you a convicted sex offender and/or required to register as a sex offender in any state?": appSexOffend.value,
        "Do you have a history of violence?": appViolence.value,
        "Please explain history": appViolenceExplain.value,
        "Are you currently subject to an order of protection (restraining order) by the court?": appRestrOrder.value,
        "Please explain order of protection": appRestrExplain.value,
        "Are you undergoing medication assisted treatment (MAT/MAR) such as methadone or suboxone?": appTreatment.value,
        "Provider name and contact information": appTreatProvNamePhone.value,
        "Please list any physician-prescribed medication": appMedication.value,
        "Do you have any allergies?": appAllergies.value,
        "If so, please list your them": appAllergiesExplain.value,
        "Do you use a rescue inhaler or Epipen?": appInhaler.value,
        "If so, please tell us more": appInhalerExplain.value,
        "Other than alcoholism and/or addiction, do you have any medical conditions or physical disabilities we should be aware of?": appMedConditions.value,
        "Other than alcoholism and/or addiction, do you have any mental health issues or disabilities we should be aware of?": appMentalConditions.value,
        "Have you been vaccinated against COVID-19?": appCovidVacc.value,
        "Are you willing to be vaccinated?": appCovidWilling.value,
        "Do you have medical insurance (in case of medical emergency)?": appMedicalIns.value,
        "Policy name/number": appPolicyNameNum.value,
        "Marital Status": applicantMarriage.value,
        "Children?": applicantChildren.value,
        "Please tell us about your current employment/volunteer/student status (where/hours/supervisor, etc.)": appEmployment.value,
        "Do you have a valid driver’s license?": appDriverLic.value,
        "Will you need parking?": appParking.value,
        "If so, license number and state": appCarLicNum.value,
        "Make/Model/VIN": appMakeModel.value,
        "What is the biggest challenge you face in sustaining your recovery?": appRecoveryQues.value,
        "How do you expect being a part of our home will help with your recovery?": appHowWeHelp.value,
        "What personal qualities will you contribute to the mutual support we share in our home?": applicantQualities.value,
        "Is there any reason you might have trouble following our home’s guidelines and expectations?": appTroubleWRules.value,
        "Following is a short list of characteristics that can possibly make communal living difficult. Do any of these describe parts of your personality?": commCharChoices.value,
        "Other": appCharOther.value,
        "What reservations/reluctance do you have about following the house rules, policies, and procedures?": appReservations.value,
        "Is there anything else you think we should know about you? Thistledown will consider all reasonable accommodations for residency": appWhatShouldWeKnow.value
      };
    });
    const fieldsFilled = computed(() => {
      return applicantName.value !== void 0 && applicantName.value !== "" && (applicantEmailAddr.value !== void 0 && applicantEmailAddr.value !== "") && (applicantPhoneNum.value !== void 0 && applicantPhoneNum.value !== "") && (applicantDOB.value !== void 0 && applicantDOB.value !== null) && (applicantHearOfUs.value !== void 0 && applicantHearOfUs.value !== "") && (applicantProgram.value !== void 0 && applicantProgram.value !== "") && (appLeaveHome.value !== void 0 && appLeaveHome.value !== null) && (appEvicted.value !== void 0 && appEvicted.value !== null) && (appLastUse.value !== void 0 && appLastUse.value !== "") && (appWarrants.value !== void 0 && appWarrants.value !== "") && (appProbation.value !== void 0 && appProbation.value !== "") && (appSexOffend.value !== void 0 && appSexOffend.value !== null) && (appViolence.value !== void 0 && appViolence.value !== null) && (appRestrOrder.value !== void 0 && appRestrOrder.value !== null) && (appTreatment.value !== void 0 && appTreatment.value !== null) && (appAllergies.value !== void 0 && appAllergies.value !== null) && (appInhaler.value !== void 0 && appInhaler.value !== null) && (appMedConditions.value !== void 0 && appMedConditions.value !== "") && (appMentalConditions.value !== void 0 && appMentalConditions.value !== "") && (appMedicalIns.value !== void 0 && appMedicalIns.value !== null) && (appDriverLic.value !== void 0 && appDriverLic.value !== null) && (appParking.value !== void 0 && appParking.value !== null) && (appRecoveryQues.value !== void 0 && appRecoveryQues.value !== "") && (appHowWeHelp.value !== void 0 && appHowWeHelp.value !== "") && (applicantQualities.value !== void 0 && applicantQualities.value !== "") && (appReservations.value !== void 0 && appReservations.value !== "") && (appWhatShouldWeKnow.value !== void 0 && appWhatShouldWeKnow.value !== "") && (commCharChoices.value.length > 0 || appCharOther.value !== void 0 && appCharOther.value !== null);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_InputAndLabel = __nuxt_component_0$2;
      const _component_ThankYouConfirm = _sfc_main$7;
      if (clickedOnce.value) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "ms-4 pe-4 py-4 overflow-y-auto" }, _attrs))} data-v-ae69466f><h2 class="text-center mb-4" data-v-ae69466f>New Housemate Application</h2><h6 class="text-center fst-italic fw-normal" data-v-ae69466f>* Please fill out all required fields (highlighted with a <span style="${ssrRenderStyle({ "color": "red" })}" data-v-ae69466f>red </span>border). We ask that you do your best to fill out all fields.</h6><form class="bg-white p-4 border border-solid rounded" id="printarea" data-v-ae69466f><div class="d-flex justify-content-around gap-2" data-v-ae69466f><div class="col mb-3" data-v-ae69466f><label for="nameInput" class="form-label" data-v-ae69466f>Name</label><input${ssrRenderAttr("value", applicantName.value)} type="text" class="form-control" id="nameInput" aria-describedby="nameHelp" required data-v-ae69466f></div><div class="col mb-3" data-v-ae69466f><label for="dateInput" class="form-label" data-v-ae69466f>Date</label><input type="text" class="form-control" id="dateInput"${ssrRenderAttr("value", todaysDate.value.getMonth() + 1 + "/" + todaysDate.value.getDate() + "/" + todaysDate.value.getFullYear())} disabled data-v-ae69466f></div></div><div class="col mb-3" data-v-ae69466f><label for="addrInput" class="form-label" data-v-ae69466f>Address</label><input${ssrRenderAttr("value", applicantAddr.value)} type="text" class="form-control" id="addrInput" data-v-ae69466f></div><div class="d-flex justify-content-around gap-2" data-v-ae69466f>`);
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: applicantPhoneNum.value,
          "onUpdate:modelValue": ($event) => applicantPhoneNum.value = $event,
          class: "col",
          labelStr: "Phone Number",
          inputType: "text"
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: applicantDOB.value,
          "onUpdate:modelValue": ($event) => applicantDOB.value = $event,
          class: "col",
          labelStr: "Date of Birth",
          inputType: "date"
        }, null, _parent));
        _push(`</div><div class="col mb-3" data-v-ae69466f><label for="emailAddrInput" class="form-label" data-v-ae69466f>Email Address</label><input${ssrRenderAttr("value", applicantEmailAddr.value)} type="email" class="form-control" id="emailAddrInput" required data-v-ae69466f></div>`);
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appContactAndPhone.value,
          "onUpdate:modelValue": ($event) => appContactAndPhone.value = $event,
          labelStr: "Emergency Contact and Phone",
          inputType: "textarea",
          notRequired: ""
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: applicantNextOfKin.value,
          "onUpdate:modelValue": ($event) => applicantNextOfKin.value = $event,
          labelStr: "Next of kin, if different",
          inputType: "text",
          notRequired: ""
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: applicantHearOfUs.value,
          "onUpdate:modelValue": ($event) => applicantHearOfUs.value = $event,
          labelStr: "How did you hear about us?",
          inputType: "textarea"
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: applicantProgram.value,
          "onUpdate:modelValue": ($event) => applicantProgram.value = $event,
          labelStr: "Name of program or facility",
          inputType: "text"
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: applicantAdmitDate.value,
          "onUpdate:modelValue": ($event) => applicantAdmitDate.value = $event,
          labelStr: "Date you arrived or were admitted",
          inputType: "date",
          notRequired: ""
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: applicantSupervisor.value,
          "onUpdate:modelValue": ($event) => applicantSupervisor.value = $event,
          labelStr: "Aftercare coordinator or DOC supervisor",
          inputType: "text",
          notRequired: ""
        }, null, _parent));
        _push(`<div class="d-flex justify-content-around gap-2" data-v-ae69466f>`);
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appSupeEmail.value,
          "onUpdate:modelValue": ($event) => appSupeEmail.value = $event,
          class: "col",
          labelStr: "Email address",
          inputType: "text",
          notRequired: ""
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appSupePhone.value,
          "onUpdate:modelValue": ($event) => appSupePhone.value = $event,
          class: "col",
          labelStr: "Phone",
          inputType: "text",
          notRequired: ""
        }, null, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appLeaveHome.value,
          "onUpdate:modelValue": ($event) => appLeaveHome.value = $event,
          labelStr: "Have you ever been asked to leave a sober house or treatment center?",
          inputType: "radio"
        }, null, _parent));
        if (appLeaveHome.value) {
          _push(ssrRenderComponent(_component_InputAndLabel, {
            modelValue: appLeaveReason.value,
            "onUpdate:modelValue": ($event) => appLeaveReason.value = $event,
            labelStr: "If so, what was the reason?",
            inputType: "text"
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appEvicted.value,
          "onUpdate:modelValue": ($event) => appEvicted.value = $event,
          labelStr: "Have you ever been evicted?",
          inputType: "radio"
        }, null, _parent));
        if (appEvicted.value) {
          _push(ssrRenderComponent(_component_InputAndLabel, {
            modelValue: appEvictWhy.value,
            "onUpdate:modelValue": ($event) => appEvictWhy.value = $event,
            labelStr: "If so, why?",
            inputType: "text"
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appLastUse.value,
          "onUpdate:modelValue": ($event) => appLastUse.value = $event,
          labelStr: "When did you last use alcohol or illegal drugs?",
          inputType: "text"
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appWarrants.value,
          "onUpdate:modelValue": ($event) => appWarrants.value = $event,
          labelStr: "Do you have any outstanding warrants, pending criminal charges or upcoming court dates?",
          inputType: "text"
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appProbation.value,
          "onUpdate:modelValue": ($event) => appProbation.value = $event,
          labelStr: "Are you on probation, parole, or suspended sentence? Please explain",
          inputType: "text"
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appSexOffend.value,
          "onUpdate:modelValue": ($event) => appSexOffend.value = $event,
          labelStr: "Are you a convicted sex offender and/or required to register as a sex offender in any state?",
          inputType: "radio"
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appViolence.value,
          "onUpdate:modelValue": ($event) => appViolence.value = $event,
          labelStr: "Do you have a history of violence?",
          inputType: "radio"
        }, null, _parent));
        if (appViolence.value) {
          _push(ssrRenderComponent(_component_InputAndLabel, {
            modelValue: appViolenceExplain.value,
            "onUpdate:modelValue": ($event) => appViolenceExplain.value = $event,
            labelStr: "Please explain",
            inputType: "text"
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appRestrOrder.value,
          "onUpdate:modelValue": ($event) => appRestrOrder.value = $event,
          labelStr: "Are you currently subject to an order of protection (restraining order) by the court?",
          inputType: "radio"
        }, null, _parent));
        if (appRestrOrder.value) {
          _push(ssrRenderComponent(_component_InputAndLabel, {
            modelValue: appRestrExplain.value,
            "onUpdate:modelValue": ($event) => appRestrExplain.value = $event,
            labelStr: "Please explain",
            inputType: "text"
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appTreatment.value,
          "onUpdate:modelValue": ($event) => appTreatment.value = $event,
          labelStr: "Are you undergoing medication assisted treatment (MAT/MAR) such as methadone or suboxone?",
          inputType: "radio"
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appTreatProvNamePhone.value,
          "onUpdate:modelValue": ($event) => appTreatProvNamePhone.value = $event,
          labelStr: "Provider name and contact information",
          inputType: "text",
          notRequired: ""
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appMedication.value,
          "onUpdate:modelValue": ($event) => appMedication.value = $event,
          labelStr: "Please list any physician-prescribed medication",
          inputType: "text",
          notRequired: ""
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appAllergies.value,
          "onUpdate:modelValue": ($event) => appAllergies.value = $event,
          labelStr: "Do you have any allergies?",
          inputType: "radio"
        }, null, _parent));
        if (appAllergies.value) {
          _push(ssrRenderComponent(_component_InputAndLabel, {
            modelValue: appAllergiesExplain.value,
            "onUpdate:modelValue": ($event) => appAllergiesExplain.value = $event,
            labelStr: "If so, please list them.",
            inputType: "text"
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appInhaler.value,
          "onUpdate:modelValue": ($event) => appInhaler.value = $event,
          labelStr: "Do you use a rescue inhaler or Epipen?",
          inputType: "radio"
        }, null, _parent));
        if (appInhaler.value) {
          _push(ssrRenderComponent(_component_InputAndLabel, {
            modelValue: appInhalerExplain.value,
            "onUpdate:modelValue": ($event) => appInhalerExplain.value = $event,
            labelStr: "If so, please let us know more.",
            inputType: "text"
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appMedConditions.value,
          "onUpdate:modelValue": ($event) => appMedConditions.value = $event,
          labelStr: "Other than alcoholism and/or addiction, do you have any medical\n                conditions or physical disabilities we should be aware of?",
          inputType: "text"
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appMentalConditions.value,
          "onUpdate:modelValue": ($event) => appMentalConditions.value = $event,
          labelStr: "Other than alcoholism and/or addiction, do you have any mental health\n                issues or disabilities we should be aware of?",
          inputType: "text"
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appCovidVacc.value,
          "onUpdate:modelValue": ($event) => appCovidVacc.value = $event,
          labelStr: "Have you been vaccinated against COVID-19?",
          inputType: "radio",
          notRequired: ""
        }, null, _parent));
        if (!appCovidVacc.value) {
          _push(ssrRenderComponent(_component_InputAndLabel, {
            modelValue: appCovidWilling.value,
            "onUpdate:modelValue": ($event) => appCovidWilling.value = $event,
            labelStr: "Are you willing to be vaccinated?",
            inputType: "radio",
            notRequired: ""
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appMedicalIns.value,
          "onUpdate:modelValue": ($event) => appMedicalIns.value = $event,
          labelStr: "Do you have medical insurance (in case of medical emergency)?",
          inputType: "radio"
        }, null, _parent));
        if (appMedicalIns.value) {
          _push(ssrRenderComponent(_component_InputAndLabel, {
            modelValue: appPolicyNameNum.value,
            "onUpdate:modelValue": ($event) => appPolicyNameNum.value = $event,
            labelStr: "Policy name/number",
            inputType: "text",
            notRequired: ""
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<h5 data-v-ae69466f>General Information:</h5><div class="d-flex justify-content-around gap-2" data-v-ae69466f>`);
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: applicantMarriage.value,
          "onUpdate:modelValue": ($event) => applicantMarriage.value = $event,
          class: "col",
          labelStr: "Marital Status",
          inputType: "text",
          notRequired: ""
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: applicantChildren.value,
          "onUpdate:modelValue": ($event) => applicantChildren.value = $event,
          class: "col",
          labelStr: "Children?",
          inputType: "text",
          notRequired: ""
        }, null, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appEmployment.value,
          "onUpdate:modelValue": ($event) => appEmployment.value = $event,
          labelStr: "Please tell us about your current employment/volunteer/student status\n                (where/hours/supervisor, etc.)",
          inputType: "textarea",
          notRequired: ""
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appDriverLic.value,
          "onUpdate:modelValue": ($event) => appDriverLic.value = $event,
          labelStr: "Do you have a valid driver’s license?",
          inputType: "radio"
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appParking.value,
          "onUpdate:modelValue": ($event) => appParking.value = $event,
          labelStr: "Will you need parking?",
          inputType: "radio"
        }, null, _parent));
        if (appParking.value) {
          _push(ssrRenderComponent(_component_InputAndLabel, {
            modelValue: appCarLicNum.value,
            "onUpdate:modelValue": ($event) => appCarLicNum.value = $event,
            labelStr: "If so, please let us know your license plate number and state",
            inputType: "text",
            notRequired: ""
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        if (appParking.value) {
          _push(ssrRenderComponent(_component_InputAndLabel, {
            modelValue: appMakeModel.value,
            "onUpdate:modelValue": ($event) => appMakeModel.value = $event,
            labelStr: "Make/Model/VIN",
            inputType: "text",
            notRequired: ""
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appRecoveryQues.value,
          "onUpdate:modelValue": ($event) => appRecoveryQues.value = $event,
          labelStr: "What is the biggest challenge you face in sustaining your recovery?",
          inputType: "textarea"
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appHowWeHelp.value,
          "onUpdate:modelValue": ($event) => appHowWeHelp.value = $event,
          labelStr: "How do you expect being a part of our home will help with your recovery?",
          inputType: "textarea"
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: applicantQualities.value,
          "onUpdate:modelValue": ($event) => applicantQualities.value = $event,
          labelStr: "What personal qualities will you contribute to the mutual support we share in our home?",
          inputType: "textarea"
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appTroubleWRules.value,
          "onUpdate:modelValue": ($event) => appTroubleWRules.value = $event,
          labelStr: "Is there any reason you might have trouble following our home’s guidelines and expectations?",
          inputType: "textarea"
        }, null, _parent));
        _push(`<div data-v-ae69466f><label class="col mb-3" for="appCharacteristics" data-v-ae69466f>Following is a short list of characteristics that can possibly make communal living difficult. Do any of these describe parts of your personality?</label><div class="d-flex flex-wrap" data-v-ae69466f><!--[-->`);
        ssrRenderList(commChars, (commChar, cIndex) => {
          _push(`<div class="ms-2 mb-3 form-check" data-v-ae69466f><input type="checkbox" class="form-check-input"${ssrRenderAttr("value", commChar)}${ssrRenderAttr("id", commChar)} data-v-ae69466f><label class="form-check-label"${ssrRenderAttr("for", commChar)} data-v-ae69466f>${ssrInterpolate(commChar)}</label></div>`);
        });
        _push(`<!--]-->`);
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appCharOther.value,
          "onUpdate:modelValue": ($event) => appCharOther.value = $event,
          class: "d-flex align-items-center mx-2 gap-2",
          labelStr: "Other:",
          inputType: "text",
          notRequired: commCharChoices.value.length > 0
        }, null, _parent));
        _push(`</div></div>`);
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appReservations.value,
          "onUpdate:modelValue": ($event) => appReservations.value = $event,
          labelStr: "What reservations/reluctance do you have about following the house rules, policies, \n                and procedures?",
          inputType: "textarea"
        }, null, _parent));
        _push(ssrRenderComponent(_component_InputAndLabel, {
          modelValue: appWhatShouldWeKnow.value,
          "onUpdate:modelValue": ($event) => appWhatShouldWeKnow.value = $event,
          labelStr: "Is there anything else you think we should know about you? Thistledown will\n                consider all reasonable accommodations for residency",
          inputType: "textarea"
        }, null, _parent));
        _push(`<div class="d-flex gap-2" data-v-ae69466f><button type="submit" class="btn btn-primary"${ssrIncludeBooleanAttr(!unref(fieldsFilled)) ? " disabled" : ""} data-v-ae69466f>Submit</button><button class="btn btn-dark" data-v-ae69466f>Cancel</button></div></form></div>`);
      } else {
        _push(ssrRenderComponent(_component_ThankYouConfirm, mergeProps({
          modelValue: showModal.value,
          "onUpdate:modelValue": ($event) => showModal.value = $event
        }, _attrs), null, _parent));
      }
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/HousemateApplication.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const __nuxt_component_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-ae69466f"]]);
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "RequestInfo",
  __ssrInlineRender: true,
  props: {
    "showModal": {},
    "showModalModifiers": {},
    "reqFName": {},
    "reqFNameModifiers": {},
    "reqLName": {},
    "reqLNameModifiers": {},
    "reqPhoneNum": {},
    "reqPhoneNumModifiers": {},
    "reqEmailAddr": {},
    "reqEmailAddrModifiers": {},
    "reqTextArea": {},
    "reqTextAreaModifiers": {}
  },
  emits: ["update:showModal", "update:reqFName", "update:reqLName", "update:reqPhoneNum", "update:reqEmailAddr", "update:reqTextArea"],
  setup(__props) {
    const showModal = useModel(__props, "showModal");
    const clickedOnce = ref(true);
    const reqFName = useModel(__props, "reqFName");
    const reqLName = useModel(__props, "reqLName");
    const reqPhoneNum = useModel(__props, "reqPhoneNum");
    const reqEmailAddr = useModel(__props, "reqEmailAddr");
    const reqTextArea = useModel(__props, "reqTextArea");
    const fieldsFilled = computed(() => {
      return reqFName.value !== void 0 && reqPhoneNum.value !== void 0 && reqEmailAddr.value !== void 0 && reqTextArea.value !== void 0 && reqFName.value !== "" && reqPhoneNum.value !== "" && reqEmailAddr.value !== "" && reqTextArea.value !== "";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ThankYouConfirm = _sfc_main$7;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "matte" }, _attrs))} data-v-e474864e><div class="bd-example-snippet bd-code-snippet" data-v-e474864e>`);
      if (unref(clickedOnce)) {
        _push(`<div class="bd-example m-0 border-0" data-v-e474864e><h2 class="text-center mb-4" data-v-e474864e>Request Info</h2><h6 class="text-center fst-italic fw-normal" data-v-e474864e>* Please fill out all required fields (highlighted with a <span style="${ssrRenderStyle({ "color": "red" })}" data-v-e474864e>red </span>border).</h6><form data-v-e474864e><div class="d-flex gap-3 mb-3" data-v-e474864e><div class="col form-floating mb-3" data-v-e474864e><input${ssrRenderAttr("value", reqFName.value)} type="text" class="form-control" id="floatingFName" placeholder="John" required data-v-e474864e><label for="floatingFName" data-v-e474864e>First Name</label></div><div class="col form-floating" data-v-e474864e><input${ssrRenderAttr("value", reqLName.value)} type="text" class="form-control" id="floatingLName" placeholder="Smith" data-v-e474864e><label for="floatingLName" data-v-e474864e>Last Name</label></div></div><div class="form-floating" data-v-e474864e><input${ssrRenderAttr("value", reqPhoneNum.value)} type="number" class="form-control" id="floatingPhoneNum" placeholder="Password" required data-v-e474864e><label for="floatingPhoneNum" data-v-e474864e>Phone #</label></div><div class="form-floating my-4" data-v-e474864e><input${ssrRenderAttr("value", reqEmailAddr.value)} type="password" class="form-control" id="floatingEmail" placeholder="Password" required data-v-e474864e><label for="floatingEmail" data-v-e474864e>Email Address</label></div><div class="form-floating my-4" data-v-e474864e><textarea class="form-control" placeholder="Leave a comment here" id="floatingTextarea" rows="18" style="${ssrRenderStyle({ "height": "90%", "max-height": "90%" })}" required data-v-e474864e>${ssrInterpolate(reqTextArea.value)}</textarea><label for="floatingTextarea" data-v-e474864e>Let us know how we can help</label></div><div class="d-flex gap-2" data-v-e474864e><button class="btn btn-primary"${ssrIncludeBooleanAttr(!unref(fieldsFilled)) ? " disabled" : ""} data-v-e474864e>Submit</button><button class="btn btn-dark" data-v-e474864e>Cancel</button></div></form></div>`);
      } else {
        _push(ssrRenderComponent(_component_ThankYouConfirm, {
          modelValue: showModal.value,
          "onUpdate:modelValue": ($event) => showModal.value = $event
        }, null, _parent));
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/RequestInfo.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_1$1 = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-e474864e"]]);
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "FullScreenModal",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    caller: {}
  }, {
    "modelValue": {},
    "modelModifiers": {}
  }),
  emits: ["update:modelValue"],
  setup(__props) {
    const showModal = useModel(__props, "modelValue");
    const matteEl = ref();
    useMouseInElement(matteEl);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_HousemateApplication = __nuxt_component_0$1;
      const _component_RequestInfo = __nuxt_component_1$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ style: { "position": "sticky", "top": "0", "z-index": "2" } }, _attrs))} data-v-2dc65f07>`);
      if (showModal.value) {
        _push(`<div class="noprint position-absolute d-flex top-0 left-0 z-3 text-white justify-content-center align-items-center bg-opaque-black" style="${ssrRenderStyle({ "height": "100vh", "width": "100vw" })}" id="modalDarkBox" data-v-2dc65f07><div class="noprint d-flex flex-column justify-content-center align-items-center bg-thistle-ultralight-grey rounded text-black w-75 opacity-100" id="modalMatte" style="${ssrRenderStyle({ "max-height": "90vh" })}" data-v-2dc65f07>`);
        if (_ctx.caller == "apply") {
          _push(ssrRenderComponent(_component_HousemateApplication, {
            showModal: showModal.value,
            "onUpdate:showModal": ($event) => showModal.value = $event
          }, null, _parent));
        } else {
          _push(ssrRenderComponent(_component_RequestInfo, {
            showModal: showModal.value,
            "onUpdate:showModal": ($event) => showModal.value = $event
          }, null, _parent));
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/FullScreenModal.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-2dc65f07"]]);
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "ThistledownHeader",
  __ssrInlineRender: true,
  props: {
    "modelValue": {},
    "modelModifiers": {}
  },
  emits: ["update:modelValue"],
  setup(__props) {
    useModel(__props, "modelValue");
    inject("caller");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ style: { "position": "sticky", "top": "0", "z-index": "1" } }, _attrs))} data-v-96fb7ba4><div class="noprint d-flex bg-thistle-light-gray align-items-center justify-content-center w-100 py-2 gap-2 overflow-hidden" data-v-96fb7ba4><div class="col d-lg-flex d-none align-items-center justify-content-evenly fw-bold text-nowrap gap-2 text-charcoal" style="${ssrRenderStyle({ "font-size": "1.25rem" })}" data-v-96fb7ba4><a href="#about-us" data-v-96fb7ba4><span data-v-96fb7ba4>ABOUT US</span></a><a href="#our-mission" data-v-96fb7ba4><span data-v-96fb7ba4>OUR MISSION</span></a><a href="#our-home" data-v-96fb7ba4><span data-v-96fb7ba4>OUR HOME</span></a><a href="#our-community" data-v-96fb7ba4><span data-v-96fb7ba4>OUR COMMUNITY</span></a><a href="#our-approach" data-v-96fb7ba4><span data-v-96fb7ba4>OUR APPROACH</span></a><a href="#house-amenities" data-v-96fb7ba4><span data-v-96fb7ba4>HOUSE AMENITIES</span></a></div><div class="col-1 d-flex justify-content-evenly gap-3" data-v-96fb7ba4><button class="btn btn-dark text-nowrap" data-v-96fb7ba4>Request Info</button><button class="btn btn-success text-nowrap" data-v-96fb7ba4>Apply Now</button></div><div class="col-1" data-v-96fb7ba4></div></div></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ThistledownHeader.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-96fb7ba4"]]);
const RouteProvider = defineComponent({
  props: {
    vnode: {
      type: Object,
      required: true
    },
    route: {
      type: Object,
      required: true
    },
    vnodeRef: Object,
    renderKey: String,
    trackRootNodes: Boolean
  },
  setup(props) {
    const previousKey = props.renderKey;
    const previousRoute = props.route;
    const route = {};
    for (const key in props.route) {
      Object.defineProperty(route, key, {
        get: () => previousKey === props.renderKey ? props.route[key] : previousRoute[key],
        enumerable: true
      });
    }
    provide(PageRouteSymbol, shallowReactive(route));
    return () => {
      return h(props.vnode, { ref: props.vnodeRef });
    };
  }
});
const __nuxt_component_2 = defineComponent({
  name: "NuxtPage",
  inheritAttrs: false,
  props: {
    name: {
      type: String
    },
    transition: {
      type: [Boolean, Object],
      default: void 0
    },
    keepalive: {
      type: [Boolean, Object],
      default: void 0
    },
    route: {
      type: Object
    },
    pageKey: {
      type: [Function, String],
      default: null
    }
  },
  setup(props, { attrs, slots, expose }) {
    const nuxtApp = useNuxtApp();
    const pageRef = ref();
    const forkRoute = inject(PageRouteSymbol, null);
    let previousPageKey;
    expose({ pageRef });
    inject(LayoutMetaSymbol, null);
    let vnode;
    const done = nuxtApp.deferHydration();
    if (props.pageKey) {
      watch(() => props.pageKey, (next, prev) => {
        if (next !== prev) {
          nuxtApp.callHook("page:loading:start");
        }
      });
    }
    return () => {
      return h(RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: (routeProps) => {
          if (!routeProps.Component) {
            done();
            return;
          }
          const key = generateRouteKey$1(routeProps, props.pageKey);
          if (!nuxtApp.isHydrating && !hasChildrenRoutes(forkRoute, routeProps.route, routeProps.Component) && previousPageKey === key) {
            nuxtApp.callHook("page:loading:end");
          }
          previousPageKey = key;
          const hasTransition = !!(props.transition ?? routeProps.route.meta.pageTransition ?? appPageTransition);
          const transitionProps = hasTransition && _mergeTransitionProps([
            props.transition,
            routeProps.route.meta.pageTransition,
            appPageTransition,
            { onAfterLeave: () => {
              nuxtApp.callHook("page:transition:finish", routeProps.Component);
            } }
          ].filter(Boolean));
          const keepaliveConfig = props.keepalive ?? routeProps.route.meta.keepalive ?? appKeepalive;
          vnode = _wrapIf(
            Transition,
            hasTransition && transitionProps,
            wrapInKeepAlive(
              keepaliveConfig,
              h(Suspense, {
                suspensible: true,
                onPending: () => nuxtApp.callHook("page:start", routeProps.Component),
                onResolve: () => {
                  nextTick(() => nuxtApp.callHook("page:finish", routeProps.Component).then(() => nuxtApp.callHook("page:loading:end")).finally(done));
                }
              }, {
                default: () => {
                  const providerVNode = h(RouteProvider, {
                    key: key || void 0,
                    vnode: slots.default ? h(Fragment, void 0, slots.default(routeProps)) : routeProps.Component,
                    route: routeProps.route,
                    renderKey: key || void 0,
                    trackRootNodes: hasTransition,
                    vnodeRef: pageRef
                  });
                  return providerVNode;
                }
              })
            )
          ).default();
          return vnode;
        }
      });
    };
  }
});
function _mergeTransitionProps(routeProps) {
  const _props = routeProps.map((prop) => ({
    ...prop,
    onAfterLeave: prop.onAfterLeave ? toArray(prop.onAfterLeave) : void 0
  }));
  return defu(..._props);
}
function hasChildrenRoutes(fork, newRoute, Component) {
  if (!fork) {
    return false;
  }
  const index = newRoute.matched.findIndex((m) => {
    var _a;
    return ((_a = m.components) == null ? void 0 : _a.default) === (Component == null ? void 0 : Component.type);
  });
  return index < newRoute.matched.length - 1;
}
const _imports_0 = "" + __buildAssetsURL("thistledown-banner.CkeY-b7b.png");
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "app",
  __ssrInlineRender: true,
  setup(__props) {
    const showModal = ref(false);
    const caller = ref("");
    provide("caller", caller);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FullScreenModal = __nuxt_component_0;
      const _component_ThistledownHeader = __nuxt_component_1;
      const _component_NuxtPage = __nuxt_component_2;
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_component_FullScreenModal, {
        modelValue: unref(showModal),
        "onUpdate:modelValue": ($event) => isRef(showModal) ? showModal.value = $event : null,
        caller: unref(caller)
      }, null, _parent));
      _push(`<div class="vstack w-100" data-v-a8f33031><img class="img-fluid"${ssrRenderAttr("src", _imports_0)} data-v-a8f33031>`);
      _push(ssrRenderComponent(_component_ThistledownHeader, {
        modelValue: unref(showModal),
        "onUpdate:modelValue": ($event) => isRef(showModal) ? showModal.value = $event : null
      }, null, _parent));
      _push(ssrRenderComponent(_component_NuxtPage, {
        modelValue: unref(showModal),
        "onUpdate:modelValue": ($event) => isRef(showModal) ? showModal.value = $event : null,
        id: "main"
      }, null, _parent));
      _push(`</div><footer class="d-flex flex-wrap justify-content-between align-items-center py-3 mt-3 mb-2 px-5 border-top" style="${ssrRenderStyle({ "background-color": "#dbe4cf" })}" data-v-a8f33031><div class="col-md-4 d-flex align-items-center" data-v-a8f33031><a href="/" class="mb-3 me-2 mb-md-0 text-body-secondary text-decoration-none lh-1" data-v-a8f33031><svg class="bi" width="30" height="24" data-v-a8f33031><use xlink:href="#bootstrap" data-v-a8f33031></use></svg></a><span class="mb-3 mb-md-0 text-body-secondary" data-v-a8f33031>© ${ssrInterpolate(new Date(Date.now()).getFullYear())} Thistledown, Inc</span></div><div class="col-md-4 d-flex flex-column text-center justify-content-center" data-v-a8f33031><span class="text-body-secondary" data-v-a8f33031> 379 White Mountain Highway, Conway, NH 03818</span><span class="text-body-secondary" data-v-a8f33031>(603) 307-0385</span></div><ul class="nav col-md-4 justify-content-end list-unstyled d-flex" data-v-a8f33031><li class="ms-3" data-v-a8f33031></li><li class="ms-3" data-v-a8f33031></li><li class="ms-3" data-v-a8f33031></li></ul></footer><!--]-->`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const AppComponent = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-a8f33031"]]);
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    _error.stack ? _error.stack.split("\n").splice(1).map((line) => {
      const text = line.replace("webpack:/", "").replace(".vue", ".js").trim();
      return {
        text,
        internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
      };
    }).map((i) => `<span class="stack${i.internal ? " internal" : ""}">${i.text}</span>`).join("\n") : "";
    const statusCode = Number(_error.statusCode || 500);
    const is404 = statusCode === 404;
    const statusMessage = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import("./_nuxt/error-404-gj1ZRwnH.js"));
    const _Error = defineAsyncComponent(() => import("./_nuxt/error-500-BSfkZGMT.js"));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ statusCode: unref(statusCode), statusMessage: unref(statusMessage), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup");
    const error = useError();
    const abortRender = error.value && !nuxtApp.ssrContext.error;
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(abortRender)) {
            _push(`<div></div>`);
          } else if (unref(error)) {
            _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(AppComponent), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      nuxt.payload.error = nuxt.payload.error || createError(error);
    }
    if (ssrContext == null ? void 0 : ssrContext._renderResponse) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry$1 = (ssrContext) => entry(ssrContext);
export {
  _export_sfc as _,
  navigateTo as a,
  useNuxtApp as b,
  useRuntimeConfig as c,
  resolveUnrefHeadInput as d,
  entry$1 as default,
  __nuxt_component_0$1 as e,
  injectHead as i,
  nuxtLinkDefaults as n,
  resolveRouteObject as r,
  useRouter as u
};
//# sourceMappingURL=server.mjs.map
