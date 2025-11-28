module.exports = [
"[project]/node_modules/wagmi/node_modules/zustand/esm/middleware.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "combine",
    ()=>combine,
    "createJSONStorage",
    ()=>createJSONStorage,
    "devtools",
    ()=>devtools,
    "persist",
    ()=>persist,
    "redux",
    ()=>redux,
    "subscribeWithSelector",
    ()=>subscribeWithSelector
]);
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("node_modules/wagmi/node_modules/zustand/esm/middleware.mjs")}`;
    }
};
const reduxImpl = (reducer, initial)=>(set, _get, api)=>{
        api.dispatch = (action)=>{
            set((state)=>reducer(state, action), false, action);
            return action;
        };
        api.dispatchFromDevtools = true;
        return {
            dispatch: (...a)=>api.dispatch(...a),
            ...initial
        };
    };
const redux = reduxImpl;
const trackedConnections = /* @__PURE__ */ new Map();
const getTrackedConnectionState = (name)=>{
    const api = trackedConnections.get(name);
    if (!api) return {};
    return Object.fromEntries(Object.entries(api.stores).map(([key, api2])=>[
            key,
            api2.getState()
        ]));
};
const extractConnectionInformation = (store, extensionConnector, options)=>{
    if (store === undefined) {
        return {
            type: "untracked",
            connection: extensionConnector.connect(options)
        };
    }
    const existingConnection = trackedConnections.get(options.name);
    if (existingConnection) {
        return {
            type: "tracked",
            store,
            ...existingConnection
        };
    }
    const newConnection = {
        connection: extensionConnector.connect(options),
        stores: {}
    };
    trackedConnections.set(options.name, newConnection);
    return {
        type: "tracked",
        store,
        ...newConnection
    };
};
const devtoolsImpl = (fn, devtoolsOptions = {})=>(set, get, api)=>{
        const { enabled, anonymousActionType, store, ...options } = devtoolsOptions;
        let extensionConnector;
        try {
            extensionConnector = (enabled != null ? enabled : (__TURBOPACK__import$2e$meta__.env ? __TURBOPACK__import$2e$meta__.env.MODE : void 0) !== "production") && window.__REDUX_DEVTOOLS_EXTENSION__;
        } catch (e) {}
        if (!extensionConnector) {
            return fn(set, get, api);
        }
        const { connection, ...connectionInformation } = extractConnectionInformation(store, extensionConnector, options);
        let isRecording = true;
        api.setState = (state, replace, nameOrAction)=>{
            const r = set(state, replace);
            if (!isRecording) return r;
            const action = nameOrAction === undefined ? {
                type: anonymousActionType || "anonymous"
            } : typeof nameOrAction === "string" ? {
                type: nameOrAction
            } : nameOrAction;
            if (store === undefined) {
                connection == null ? undefined : connection.send(action, get());
                return r;
            }
            connection == null ? undefined : connection.send({
                ...action,
                type: `${store}/${action.type}`
            }, {
                ...getTrackedConnectionState(options.name),
                [store]: api.getState()
            });
            return r;
        };
        const setStateFromDevtools = (...a)=>{
            const originalIsRecording = isRecording;
            isRecording = false;
            set(...a);
            isRecording = originalIsRecording;
        };
        const initialState = fn(api.setState, get, api);
        if (connectionInformation.type === "untracked") {
            connection == null ? undefined : connection.init(initialState);
        } else {
            connectionInformation.stores[connectionInformation.store] = api;
            connection == null ? undefined : connection.init(Object.fromEntries(Object.entries(connectionInformation.stores).map(([key, store2])=>[
                    key,
                    key === connectionInformation.store ? initialState : store2.getState()
                ])));
        }
        if (api.dispatchFromDevtools && typeof api.dispatch === "function") {
            let didWarnAboutReservedActionType = false;
            const originalDispatch = api.dispatch;
            api.dispatch = (...a)=>{
                if ((__TURBOPACK__import$2e$meta__.env ? __TURBOPACK__import$2e$meta__.env.MODE : undefined) !== "production" && a[0].type === "__setState" && !didWarnAboutReservedActionType) {
                    console.warn('[zustand devtools middleware] "__setState" action type is reserved to set state from the devtools. Avoid using it.');
                    didWarnAboutReservedActionType = true;
                }
                originalDispatch(...a);
            };
        }
        connection.subscribe((message)=>{
            var _a;
            switch(message.type){
                case "ACTION":
                    if (typeof message.payload !== "string") {
                        console.error("[zustand devtools middleware] Unsupported action format");
                        return;
                    }
                    return parseJsonThen(message.payload, (action)=>{
                        if (action.type === "__setState") {
                            if (store === undefined) {
                                setStateFromDevtools(action.state);
                                return;
                            }
                            if (Object.keys(action.state).length !== 1) {
                                console.error(`
                    [zustand devtools middleware] Unsupported __setState action format.
                    When using 'store' option in devtools(), the 'state' should have only one key, which is a value of 'store' that was passed in devtools(),
                    and value of this only key should be a state object. Example: { "type": "__setState", "state": { "abc123Store": { "foo": "bar" } } }
                    `);
                            }
                            const stateFromDevtools = action.state[store];
                            if (stateFromDevtools === undefined || stateFromDevtools === null) {
                                return;
                            }
                            if (JSON.stringify(api.getState()) !== JSON.stringify(stateFromDevtools)) {
                                setStateFromDevtools(stateFromDevtools);
                            }
                            return;
                        }
                        if (!api.dispatchFromDevtools) return;
                        if (typeof api.dispatch !== "function") return;
                        api.dispatch(action);
                    });
                case "DISPATCH":
                    switch(message.payload.type){
                        case "RESET":
                            setStateFromDevtools(initialState);
                            if (store === undefined) {
                                return connection == null ? undefined : connection.init(api.getState());
                            }
                            return connection == null ? undefined : connection.init(getTrackedConnectionState(options.name));
                        case "COMMIT":
                            if (store === undefined) {
                                connection == null ? undefined : connection.init(api.getState());
                                return;
                            }
                            return connection == null ? undefined : connection.init(getTrackedConnectionState(options.name));
                        case "ROLLBACK":
                            return parseJsonThen(message.state, (state)=>{
                                if (store === undefined) {
                                    setStateFromDevtools(state);
                                    connection == null ? undefined : connection.init(api.getState());
                                    return;
                                }
                                setStateFromDevtools(state[store]);
                                connection == null ? undefined : connection.init(getTrackedConnectionState(options.name));
                            });
                        case "JUMP_TO_STATE":
                        case "JUMP_TO_ACTION":
                            return parseJsonThen(message.state, (state)=>{
                                if (store === undefined) {
                                    setStateFromDevtools(state);
                                    return;
                                }
                                if (JSON.stringify(api.getState()) !== JSON.stringify(state[store])) {
                                    setStateFromDevtools(state[store]);
                                }
                            });
                        case "IMPORT_STATE":
                            {
                                const { nextLiftedState } = message.payload;
                                const lastComputedState = (_a = nextLiftedState.computedStates.slice(-1)[0]) == null ? undefined : _a.state;
                                if (!lastComputedState) return;
                                if (store === undefined) {
                                    setStateFromDevtools(lastComputedState);
                                } else {
                                    setStateFromDevtools(lastComputedState[store]);
                                }
                                connection == null ? undefined : connection.send(null, // FIXME no-any
                                nextLiftedState);
                                return;
                            }
                        case "PAUSE_RECORDING":
                            return isRecording = !isRecording;
                    }
                    return;
            }
        });
        return initialState;
    };
const devtools = devtoolsImpl;
const parseJsonThen = (stringified, f)=>{
    let parsed;
    try {
        parsed = JSON.parse(stringified);
    } catch (e) {
        console.error("[zustand devtools middleware] Could not parse the received json", e);
    }
    if (parsed !== undefined) f(parsed);
};
const subscribeWithSelectorImpl = (fn)=>(set, get, api)=>{
        const origSubscribe = api.subscribe;
        api.subscribe = (selector, optListener, options)=>{
            let listener = selector;
            if (optListener) {
                const equalityFn = (options == null ? undefined : options.equalityFn) || Object.is;
                let currentSlice = selector(api.getState());
                listener = (state)=>{
                    const nextSlice = selector(state);
                    if (!equalityFn(currentSlice, nextSlice)) {
                        const previousSlice = currentSlice;
                        optListener(currentSlice = nextSlice, previousSlice);
                    }
                };
                if (options == null ? undefined : options.fireImmediately) {
                    optListener(currentSlice, currentSlice);
                }
            }
            return origSubscribe(listener);
        };
        const initialState = fn(set, get, api);
        return initialState;
    };
const subscribeWithSelector = subscribeWithSelectorImpl;
const combine = (initialState, create)=>(...a)=>Object.assign({}, initialState, create(...a));
function createJSONStorage(getStorage, options) {
    let storage;
    try {
        storage = getStorage();
    } catch (e) {
        return;
    }
    const persistStorage = {
        getItem: (name)=>{
            var _a;
            const parse = (str2)=>{
                if (str2 === null) {
                    return null;
                }
                return JSON.parse(str2, options == null ? undefined : options.reviver);
            };
            const str = (_a = storage.getItem(name)) != null ? _a : null;
            if (str instanceof Promise) {
                return str.then(parse);
            }
            return parse(str);
        },
        setItem: (name, newValue)=>storage.setItem(name, JSON.stringify(newValue, options == null ? undefined : options.replacer)),
        removeItem: (name)=>storage.removeItem(name)
    };
    return persistStorage;
}
const toThenable = (fn)=>(input)=>{
        try {
            const result = fn(input);
            if (result instanceof Promise) {
                return result;
            }
            return {
                then (onFulfilled) {
                    return toThenable(onFulfilled)(result);
                },
                catch (_onRejected) {
                    return this;
                }
            };
        } catch (e) {
            return {
                then (_onFulfilled) {
                    return this;
                },
                catch (onRejected) {
                    return toThenable(onRejected)(e);
                }
            };
        }
    };
const persistImpl = (config, baseOptions)=>(set, get, api)=>{
        let options = {
            storage: createJSONStorage(()=>localStorage),
            partialize: (state)=>state,
            version: 0,
            merge: (persistedState, currentState)=>({
                    ...currentState,
                    ...persistedState
                }),
            ...baseOptions
        };
        let hasHydrated = false;
        const hydrationListeners = /* @__PURE__ */ new Set();
        const finishHydrationListeners = /* @__PURE__ */ new Set();
        let storage = options.storage;
        if (!storage) {
            return config((...args)=>{
                console.warn(`[zustand persist middleware] Unable to update item '${options.name}', the given storage is currently unavailable.`);
                set(...args);
            }, get, api);
        }
        const setItem = ()=>{
            const state = options.partialize({
                ...get()
            });
            return storage.setItem(options.name, {
                state,
                version: options.version
            });
        };
        const savedSetState = api.setState;
        api.setState = (state, replace)=>{
            savedSetState(state, replace);
            void setItem();
        };
        const configResult = config((...args)=>{
            set(...args);
            void setItem();
        }, get, api);
        api.getInitialState = ()=>configResult;
        let stateFromStorage;
        const hydrate = ()=>{
            var _a, _b;
            if (!storage) return;
            hasHydrated = false;
            hydrationListeners.forEach((cb)=>{
                var _a2;
                return cb((_a2 = get()) != null ? _a2 : configResult);
            });
            const postRehydrationCallback = ((_b = options.onRehydrateStorage) == null ? undefined : _b.call(options, (_a = get()) != null ? _a : configResult)) || undefined;
            return toThenable(storage.getItem.bind(storage))(options.name).then((deserializedStorageValue)=>{
                if (deserializedStorageValue) {
                    if (typeof deserializedStorageValue.version === "number" && deserializedStorageValue.version !== options.version) {
                        if (options.migrate) {
                            const migration = options.migrate(deserializedStorageValue.state, deserializedStorageValue.version);
                            if (migration instanceof Promise) {
                                return migration.then((result)=>[
                                        true,
                                        result
                                    ]);
                            }
                            return [
                                true,
                                migration
                            ];
                        }
                        console.error(`State loaded from storage couldn't be migrated since no migrate function was provided`);
                    } else {
                        return [
                            false,
                            deserializedStorageValue.state
                        ];
                    }
                }
                return [
                    false,
                    undefined
                ];
            }).then((migrationResult)=>{
                var _a2;
                const [migrated, migratedState] = migrationResult;
                stateFromStorage = options.merge(migratedState, (_a2 = get()) != null ? _a2 : configResult);
                set(stateFromStorage, true);
                if (migrated) {
                    return setItem();
                }
            }).then(()=>{
                postRehydrationCallback == null ? undefined : postRehydrationCallback(stateFromStorage, undefined);
                stateFromStorage = get();
                hasHydrated = true;
                finishHydrationListeners.forEach((cb)=>cb(stateFromStorage));
            }).catch((e)=>{
                postRehydrationCallback == null ? undefined : postRehydrationCallback(undefined, e);
            });
        };
        api.persist = {
            setOptions: (newOptions)=>{
                options = {
                    ...options,
                    ...newOptions
                };
                if (newOptions.storage) {
                    storage = newOptions.storage;
                }
            },
            clearStorage: ()=>{
                storage == null ? undefined : storage.removeItem(options.name);
            },
            getOptions: ()=>options,
            rehydrate: ()=>hydrate(),
            hasHydrated: ()=>hasHydrated,
            onHydrate: (cb)=>{
                hydrationListeners.add(cb);
                return ()=>{
                    hydrationListeners.delete(cb);
                };
            },
            onFinishHydration: (cb)=>{
                finishHydrationListeners.add(cb);
                return ()=>{
                    finishHydrationListeners.delete(cb);
                };
            }
        };
        if (!options.skipHydration) {
            hydrate();
        }
        return stateFromStorage || configResult;
    };
const persist = persistImpl;
;
}),
"[project]/node_modules/wagmi/node_modules/zustand/esm/vanilla.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createStore",
    ()=>createStore
]);
const createStoreImpl = (createState)=>{
    let state;
    const listeners = /* @__PURE__ */ new Set();
    const setState = (partial, replace)=>{
        const nextState = typeof partial === "function" ? partial(state) : partial;
        if (!Object.is(nextState, state)) {
            const previousState = state;
            state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
            listeners.forEach((listener)=>listener(state, previousState));
        }
    };
    const getState = ()=>state;
    const getInitialState = ()=>initialState;
    const subscribe = (listener)=>{
        listeners.add(listener);
        return ()=>listeners.delete(listener);
    };
    const api = {
        setState,
        getState,
        getInitialState,
        subscribe
    };
    const initialState = state = createState(setState, getState, api);
    return api;
};
const createStore = (createState)=>createState ? createStoreImpl(createState) : createStoreImpl;
;
}),
"[project]/node_modules/wagmi/node_modules/preact/dist/preact.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Component",
    ()=>k,
    "Fragment",
    ()=>b,
    "cloneElement",
    ()=>E,
    "createContext",
    ()=>G,
    "createElement",
    ()=>_,
    "createRef",
    ()=>m,
    "h",
    ()=>_,
    "hydrate",
    ()=>D,
    "isValidElement",
    ()=>t,
    "options",
    ()=>l,
    "render",
    ()=>B,
    "toChildArray",
    ()=>H
]);
var n, l, u, t, i, o, r, f, e, c, s, a, h = {}, v = [], p = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, y = Array.isArray;
function d(n, l) {
    for(var u in l)n[u] = l[u];
    return n;
}
function w(n) {
    n && n.parentNode && n.parentNode.removeChild(n);
}
function _(l, u, t) {
    var i, o, r, f = {};
    for(r in u)"key" == r ? i = u[r] : "ref" == r ? o = u[r] : f[r] = u[r];
    if (arguments.length > 2 && (f.children = arguments.length > 3 ? n.call(arguments, 2) : t), "function" == typeof l && null != l.defaultProps) for(r in l.defaultProps)void 0 === f[r] && (f[r] = l.defaultProps[r]);
    return g(l, f, i, o, null);
}
function g(n, t, i, o, r) {
    var f = {
        type: n,
        props: t,
        key: i,
        ref: o,
        __k: null,
        __: null,
        __b: 0,
        __e: null,
        __d: void 0,
        __c: null,
        constructor: void 0,
        __v: null == r ? ++u : r,
        __i: -1,
        __u: 0
    };
    return null == r && null != l.vnode && l.vnode(f), f;
}
function m() {
    return {
        current: null
    };
}
function b(n) {
    return n.children;
}
function k(n, l) {
    this.props = n, this.context = l;
}
function x(n, l) {
    if (null == l) return n.__ ? x(n.__, n.__i + 1) : null;
    for(var u; l < n.__k.length; l++)if (null != (u = n.__k[l]) && null != u.__e) return u.__e;
    return "function" == typeof n.type ? x(n) : null;
}
function C(n) {
    var l, u;
    if (null != (n = n.__) && null != n.__c) {
        for(n.__e = n.__c.base = null, l = 0; l < n.__k.length; l++)if (null != (u = n.__k[l]) && null != u.__e) {
            n.__e = n.__c.base = u.__e;
            break;
        }
        return C(n);
    }
}
function M(n) {
    (!n.__d && (n.__d = !0) && i.push(n) && !P.__r++ || o !== l.debounceRendering) && ((o = l.debounceRendering) || r)(P);
}
function P() {
    var n, u, t, o, r, e, c, s;
    for(i.sort(f); n = i.shift();)n.__d && (u = i.length, o = void 0, e = (r = (t = n).__v).__e, c = [], s = [], t.__P && ((o = d({}, r)).__v = r.__v + 1, l.vnode && l.vnode(o), O(t.__P, o, r, t.__n, t.__P.namespaceURI, 32 & r.__u ? [
        e
    ] : null, c, null == e ? x(r) : e, !!(32 & r.__u), s), o.__v = r.__v, o.__.__k[o.__i] = o, j(c, o, s), o.__e != e && C(o)), i.length > u && i.sort(f));
    P.__r = 0;
}
function S(n, l, u, t, i, o, r, f, e, c, s) {
    var a, p, y, d, w, _ = t && t.__k || v, g = l.length;
    for(u.__d = e, $(u, l, _), e = u.__d, a = 0; a < g; a++)null != (y = u.__k[a]) && (p = -1 === y.__i ? h : _[y.__i] || h, y.__i = a, O(n, y, p, i, o, r, f, e, c, s), d = y.__e, y.ref && p.ref != y.ref && (p.ref && N(p.ref, null, y), s.push(y.ref, y.__c || d, y)), null == w && null != d && (w = d), 65536 & y.__u || p.__k === y.__k ? e = I(y, e, n) : "function" == typeof y.type && void 0 !== y.__d ? e = y.__d : d && (e = d.nextSibling), y.__d = void 0, y.__u &= -196609);
    u.__d = e, u.__e = w;
}
function $(n, l, u) {
    var t, i, o, r, f, e = l.length, c = u.length, s = c, a = 0;
    for(n.__k = [], t = 0; t < e; t++)null != (i = l[t]) && "boolean" != typeof i && "function" != typeof i ? (r = t + a, (i = n.__k[t] = "string" == typeof i || "number" == typeof i || "bigint" == typeof i || i.constructor == String ? g(null, i, null, null, null) : y(i) ? g(b, {
        children: i
    }, null, null, null) : void 0 === i.constructor && i.__b > 0 ? g(i.type, i.props, i.key, i.ref ? i.ref : null, i.__v) : i).__ = n, i.__b = n.__b + 1, o = null, -1 !== (f = i.__i = L(i, u, r, s)) && (s--, (o = u[f]) && (o.__u |= 131072)), null == o || null === o.__v ? (-1 == f && a--, "function" != typeof i.type && (i.__u |= 65536)) : f !== r && (f == r - 1 ? a-- : f == r + 1 ? a++ : (f > r ? a-- : a++, i.__u |= 65536))) : i = n.__k[t] = null;
    if (s) for(t = 0; t < c; t++)null != (o = u[t]) && 0 == (131072 & o.__u) && (o.__e == n.__d && (n.__d = x(o)), V(o, o));
}
function I(n, l, u) {
    var t, i;
    if ("function" == typeof n.type) {
        for(t = n.__k, i = 0; t && i < t.length; i++)t[i] && (t[i].__ = n, l = I(t[i], l, u));
        return l;
    }
    n.__e != l && (l && n.type && !u.contains(l) && (l = x(n)), u.insertBefore(n.__e, l || null), l = n.__e);
    do {
        l = l && l.nextSibling;
    }while (null != l && 8 === l.nodeType)
    return l;
}
function H(n, l) {
    return l = l || [], null == n || "boolean" == typeof n || (y(n) ? n.some(function(n) {
        H(n, l);
    }) : l.push(n)), l;
}
function L(n, l, u, t) {
    var i = n.key, o = n.type, r = u - 1, f = u + 1, e = l[u];
    if (null === e || e && i == e.key && o === e.type && 0 == (131072 & e.__u)) return u;
    if (t > (null != e && 0 == (131072 & e.__u) ? 1 : 0)) for(; r >= 0 || f < l.length;){
        if (r >= 0) {
            if ((e = l[r]) && 0 == (131072 & e.__u) && i == e.key && o === e.type) return r;
            r--;
        }
        if (f < l.length) {
            if ((e = l[f]) && 0 == (131072 & e.__u) && i == e.key && o === e.type) return f;
            f++;
        }
    }
    return -1;
}
function T(n, l, u) {
    "-" === l[0] ? n.setProperty(l, null == u ? "" : u) : n[l] = null == u ? "" : "number" != typeof u || p.test(l) ? u : u + "px";
}
function A(n, l, u, t, i) {
    var o;
    n: if ("style" === l) if ("string" == typeof u) n.style.cssText = u;
    else {
        if ("string" == typeof t && (n.style.cssText = t = ""), t) for(l in t)u && l in u || T(n.style, l, "");
        if (u) for(l in u)t && u[l] === t[l] || T(n.style, l, u[l]);
    }
    else if ("o" === l[0] && "n" === l[1]) o = l !== (l = l.replace(/(PointerCapture)$|Capture$/i, "$1")), l = l.toLowerCase() in n || "onFocusOut" === l || "onFocusIn" === l ? l.toLowerCase().slice(2) : l.slice(2), n.l || (n.l = {}), n.l[l + o] = u, u ? t ? u.u = t.u : (u.u = e, n.addEventListener(l, o ? s : c, o)) : n.removeEventListener(l, o ? s : c, o);
    else {
        if ("http://www.w3.org/2000/svg" == i) l = l.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
        else if ("width" != l && "height" != l && "href" != l && "list" != l && "form" != l && "tabIndex" != l && "download" != l && "rowSpan" != l && "colSpan" != l && "role" != l && "popover" != l && l in n) try {
            n[l] = null == u ? "" : u;
            break n;
        } catch (n) {}
        "function" == typeof u || (null == u || !1 === u && "-" !== l[4] ? n.removeAttribute(l) : n.setAttribute(l, "popover" == l && 1 == u ? "" : u));
    }
}
function F(n) {
    return function(u) {
        if (this.l) {
            var t = this.l[u.type + n];
            if (null == u.t) u.t = e++;
            else if (u.t < t.u) return;
            return t(l.event ? l.event(u) : u);
        }
    };
}
function O(n, u, t, i, o, r, f, e, c, s) {
    var a, h, v, p, w, _, g, m, x, C, M, P, $, I, H, L, T = u.type;
    if (void 0 !== u.constructor) return null;
    128 & t.__u && (c = !!(32 & t.__u), r = [
        e = u.__e = t.__e
    ]), (a = l.__b) && a(u);
    n: if ("function" == typeof T) try {
        if (m = u.props, x = "prototype" in T && T.prototype.render, C = (a = T.contextType) && i[a.__c], M = a ? C ? C.props.value : a.__ : i, t.__c ? g = (h = u.__c = t.__c).__ = h.__E : (x ? u.__c = h = new T(m, M) : (u.__c = h = new k(m, M), h.constructor = T, h.render = q), C && C.sub(h), h.props = m, h.state || (h.state = {}), h.context = M, h.__n = i, v = h.__d = !0, h.__h = [], h._sb = []), x && null == h.__s && (h.__s = h.state), x && null != T.getDerivedStateFromProps && (h.__s == h.state && (h.__s = d({}, h.__s)), d(h.__s, T.getDerivedStateFromProps(m, h.__s))), p = h.props, w = h.state, h.__v = u, v) x && null == T.getDerivedStateFromProps && null != h.componentWillMount && h.componentWillMount(), x && null != h.componentDidMount && h.__h.push(h.componentDidMount);
        else {
            if (x && null == T.getDerivedStateFromProps && m !== p && null != h.componentWillReceiveProps && h.componentWillReceiveProps(m, M), !h.__e && (null != h.shouldComponentUpdate && !1 === h.shouldComponentUpdate(m, h.__s, M) || u.__v === t.__v)) {
                for(u.__v !== t.__v && (h.props = m, h.state = h.__s, h.__d = !1), u.__e = t.__e, u.__k = t.__k, u.__k.some(function(n) {
                    n && (n.__ = u);
                }), P = 0; P < h._sb.length; P++)h.__h.push(h._sb[P]);
                h._sb = [], h.__h.length && f.push(h);
                break n;
            }
            null != h.componentWillUpdate && h.componentWillUpdate(m, h.__s, M), x && null != h.componentDidUpdate && h.__h.push(function() {
                h.componentDidUpdate(p, w, _);
            });
        }
        if (h.context = M, h.props = m, h.__P = n, h.__e = !1, $ = l.__r, I = 0, x) {
            for(h.state = h.__s, h.__d = !1, $ && $(u), a = h.render(h.props, h.state, h.context), H = 0; H < h._sb.length; H++)h.__h.push(h._sb[H]);
            h._sb = [];
        } else do {
            h.__d = !1, $ && $(u), a = h.render(h.props, h.state, h.context), h.state = h.__s;
        }while (h.__d && ++I < 25)
        h.state = h.__s, null != h.getChildContext && (i = d(d({}, i), h.getChildContext())), x && !v && null != h.getSnapshotBeforeUpdate && (_ = h.getSnapshotBeforeUpdate(p, w)), S(n, y(L = null != a && a.type === b && null == a.key ? a.props.children : a) ? L : [
            L
        ], u, t, i, o, r, f, e, c, s), h.base = u.__e, u.__u &= -161, h.__h.length && f.push(h), g && (h.__E = h.__ = null);
    } catch (n) {
        if (u.__v = null, c || null != r) {
            for(u.__u |= c ? 160 : 32; e && 8 === e.nodeType && e.nextSibling;)e = e.nextSibling;
            r[r.indexOf(e)] = null, u.__e = e;
        } else u.__e = t.__e, u.__k = t.__k;
        l.__e(n, u, t);
    }
    else null == r && u.__v === t.__v ? (u.__k = t.__k, u.__e = t.__e) : u.__e = z(t.__e, u, t, i, o, r, f, c, s);
    (a = l.diffed) && a(u);
}
function j(n, u, t) {
    u.__d = void 0;
    for(var i = 0; i < t.length; i++)N(t[i], t[++i], t[++i]);
    l.__c && l.__c(u, n), n.some(function(u) {
        try {
            n = u.__h, u.__h = [], n.some(function(n) {
                n.call(u);
            });
        } catch (n) {
            l.__e(n, u.__v);
        }
    });
}
function z(u, t, i, o, r, f, e, c, s) {
    var a, v, p, d, _, g, m, b = i.props, k = t.props, C = t.type;
    if ("svg" === C ? r = "http://www.w3.org/2000/svg" : "math" === C ? r = "http://www.w3.org/1998/Math/MathML" : r || (r = "http://www.w3.org/1999/xhtml"), null != f) {
        for(a = 0; a < f.length; a++)if ((_ = f[a]) && "setAttribute" in _ == !!C && (C ? _.localName === C : 3 === _.nodeType)) {
            u = _, f[a] = null;
            break;
        }
    }
    if (null == u) {
        if (null === C) return document.createTextNode(k);
        u = document.createElementNS(r, C, k.is && k), c && (l.__m && l.__m(t, f), c = !1), f = null;
    }
    if (null === C) b === k || c && u.data === k || (u.data = k);
    else {
        if (f = f && n.call(u.childNodes), b = i.props || h, !c && null != f) for(b = {}, a = 0; a < u.attributes.length; a++)b[(_ = u.attributes[a]).name] = _.value;
        for(a in b)if (_ = b[a], "children" == a) ;
        else if ("dangerouslySetInnerHTML" == a) p = _;
        else if (!(a in k)) {
            if ("value" == a && "defaultValue" in k || "checked" == a && "defaultChecked" in k) continue;
            A(u, a, null, _, r);
        }
        for(a in k)_ = k[a], "children" == a ? d = _ : "dangerouslySetInnerHTML" == a ? v = _ : "value" == a ? g = _ : "checked" == a ? m = _ : c && "function" != typeof _ || b[a] === _ || A(u, a, _, b[a], r);
        if (v) c || p && (v.__html === p.__html || v.__html === u.innerHTML) || (u.innerHTML = v.__html), t.__k = [];
        else if (p && (u.innerHTML = ""), S(u, y(d) ? d : [
            d
        ], t, i, o, "foreignObject" === C ? "http://www.w3.org/1999/xhtml" : r, f, e, f ? f[0] : i.__k && x(i, 0), c, s), null != f) for(a = f.length; a--;)w(f[a]);
        c || (a = "value", "progress" === C && null == g ? u.removeAttribute("value") : void 0 !== g && (g !== u[a] || "progress" === C && !g || "option" === C && g !== b[a]) && A(u, a, g, b[a], r), a = "checked", void 0 !== m && m !== u[a] && A(u, a, m, b[a], r));
    }
    return u;
}
function N(n, u, t) {
    try {
        if ("function" == typeof n) {
            var i = "function" == typeof n.__u;
            i && n.__u(), i && null == u || (n.__u = n(u));
        } else n.current = u;
    } catch (n) {
        l.__e(n, t);
    }
}
function V(n, u, t) {
    var i, o;
    if (l.unmount && l.unmount(n), (i = n.ref) && (i.current && i.current !== n.__e || N(i, null, u)), null != (i = n.__c)) {
        if (i.componentWillUnmount) try {
            i.componentWillUnmount();
        } catch (n) {
            l.__e(n, u);
        }
        i.base = i.__P = null;
    }
    if (i = n.__k) for(o = 0; o < i.length; o++)i[o] && V(i[o], u, t || "function" != typeof n.type);
    t || w(n.__e), n.__c = n.__ = n.__e = n.__d = void 0;
}
function q(n, l, u) {
    return this.constructor(n, u);
}
function B(u, t, i) {
    var o, r, f, e;
    l.__ && l.__(u, t), r = (o = "function" == typeof i) ? null : i && i.__k || t.__k, f = [], e = [], O(t, u = (!o && i || t).__k = _(b, null, [
        u
    ]), r || h, h, t.namespaceURI, !o && i ? [
        i
    ] : r ? null : t.firstChild ? n.call(t.childNodes) : null, f, !o && i ? i : r ? r.__e : t.firstChild, o, e), j(f, u, e);
}
function D(n, l) {
    B(n, l, D);
}
function E(l, u, t) {
    var i, o, r, f, e = d({}, l.props);
    for(r in l.type && l.type.defaultProps && (f = l.type.defaultProps), u)"key" == r ? i = u[r] : "ref" == r ? o = u[r] : e[r] = void 0 === u[r] && void 0 !== f ? f[r] : u[r];
    return arguments.length > 2 && (e.children = arguments.length > 3 ? n.call(arguments, 2) : t), g(l.type, e, i || l.key, o || l.ref, null);
}
function G(n, l) {
    var u = {
        __c: l = "__cC" + a++,
        __: n,
        Consumer: function(n, l) {
            return n.children(l);
        },
        Provider: function(n) {
            var u, t;
            return this.getChildContext || (u = [], (t = {})[l] = this, this.getChildContext = function() {
                return t;
            }, this.componentWillUnmount = function() {
                u = null;
            }, this.shouldComponentUpdate = function(n) {
                this.props.value !== n.value && u.some(function(n) {
                    n.__e = !0, M(n);
                });
            }, this.sub = function(n) {
                u.push(n);
                var l = n.componentWillUnmount;
                n.componentWillUnmount = function() {
                    u && u.splice(u.indexOf(n), 1), l && l.call(n);
                };
            }), n.children;
        }
    };
    return u.Provider.__ = u.Consumer.contextType = u;
}
n = v.slice, l = {
    __e: function(n, l, u, t) {
        for(var i, o, r; l = l.__;)if ((i = l.__c) && !i.__) try {
            if ((o = i.constructor) && null != o.getDerivedStateFromError && (i.setState(o.getDerivedStateFromError(n)), r = i.__d), null != i.componentDidCatch && (i.componentDidCatch(n, t || {}), r = i.__d), r) return i.__E = i;
        } catch (l) {
            n = l;
        }
        throw n;
    }
}, u = 0, t = function(n) {
    return null != n && null == n.constructor;
}, k.prototype.setState = function(n, l) {
    var u;
    u = null != this.__s && this.__s !== this.state ? this.__s : this.__s = d({}, this.state), "function" == typeof n && (n = n(d({}, u), this.props)), n && d(u, n), null != n && this.__v && (l && this._sb.push(l), M(this));
}, k.prototype.forceUpdate = function(n) {
    this.__v && (this.__e = !0, n && this.__h.push(n), M(this));
}, k.prototype.render = b, i = [], r = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, f = function(n, l) {
    return n.__v.__b - l.__v.__b;
}, P.__r = 0, e = 0, c = F(!1), s = F(!0), a = 0;
;
 //# sourceMappingURL=preact.module.js.map
}),
"[project]/node_modules/wagmi/node_modules/preact/jsx-runtime/dist/jsxRuntime.mjs [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "jsx",
    ()=>u,
    "jsxAttr",
    ()=>p,
    "jsxDEV",
    ()=>u,
    "jsxEscape",
    ()=>_,
    "jsxTemplate",
    ()=>a,
    "jsxs",
    ()=>u
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$preact$2f$dist$2f$preact$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/preact/dist/preact.mjs [app-ssr] (ecmascript)");
;
;
var t = /["&<]/;
function n(r) {
    if (0 === r.length || !1 === t.test(r)) return r;
    for(var e = 0, n = 0, o = "", f = ""; n < r.length; n++){
        switch(r.charCodeAt(n)){
            case 34:
                f = "&quot;";
                break;
            case 38:
                f = "&amp;";
                break;
            case 60:
                f = "&lt;";
                break;
            default:
                continue;
        }
        n !== e && (o += r.slice(e, n)), o += f, e = n + 1;
    }
    return n !== e && (o += r.slice(e, n)), o;
}
var o = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, f = 0, i = Array.isArray;
function u(e, t, n, o, i, u) {
    t || (t = {});
    var a, c, l = t;
    "ref" in t && (a = t.ref, delete t.ref);
    var p = {
        type: e,
        props: l,
        key: n,
        ref: a,
        __k: null,
        __: null,
        __b: 0,
        __e: null,
        __d: void 0,
        __c: null,
        constructor: void 0,
        __v: --f,
        __i: -1,
        __u: 0,
        __source: i,
        __self: u
    };
    if ("function" == typeof e && (a = e.defaultProps)) for(c in a)void 0 === l[c] && (l[c] = a[c]);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$preact$2f$dist$2f$preact$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["options"].vnode && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$preact$2f$dist$2f$preact$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["options"].vnode(p), p;
}
function a(r) {
    var t = u(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$preact$2f$dist$2f$preact$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        tpl: r,
        exprs: [].slice.call(arguments, 1)
    });
    return t.key = t.__v, t;
}
var c = {}, l = /[A-Z]/g;
function p(e, t) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$preact$2f$dist$2f$preact$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["options"].attr) {
        var f = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$preact$2f$dist$2f$preact$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["options"].attr(e, t);
        if ("string" == typeof f) return f;
    }
    if ("ref" === e || "key" === e) return "";
    if ("style" === e && "object" == typeof t) {
        var i = "";
        for(var u in t){
            var a = t[u];
            if (null != a && "" !== a) {
                var p = "-" == u[0] ? u : c[u] || (c[u] = u.replace(l, "-$&").toLowerCase()), _ = ";";
                "number" != typeof a || p.startsWith("--") || o.test(p) || (_ = "px;"), i = i + p + ":" + a + _;
            }
        }
        return e + '="' + i + '"';
    }
    return null == t || !1 === t || "function" == typeof t || "object" == typeof t ? "" : !0 === t ? e : e + '="' + n(t) + '"';
}
function _(r) {
    if (null == r || "boolean" == typeof r || "function" == typeof r) return null;
    if ("object" == typeof r) {
        if (void 0 === r.constructor) return r;
        if (i(r)) {
            for(var e = 0; e < r.length; e++)r[e] = _(r[e]);
            return r;
        }
    }
    return n("" + r);
}
;
 //# sourceMappingURL=jsxRuntime.module.js.map
}),
"[project]/node_modules/wagmi/node_modules/preact/hooks/dist/hooks.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCallback",
    ()=>q,
    "useContext",
    ()=>x,
    "useDebugValue",
    ()=>P,
    "useEffect",
    ()=>y,
    "useErrorBoundary",
    ()=>b,
    "useId",
    ()=>g,
    "useImperativeHandle",
    ()=>F,
    "useLayoutEffect",
    ()=>_,
    "useMemo",
    ()=>T,
    "useReducer",
    ()=>p,
    "useRef",
    ()=>A,
    "useState",
    ()=>h
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$preact$2f$dist$2f$preact$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/preact/dist/preact.mjs [app-ssr] (ecmascript)");
;
var t, r, u, i, o = 0, f = [], c = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$preact$2f$dist$2f$preact$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["options"], e = c.__b, a = c.__r, v = c.diffed, l = c.__c, m = c.unmount, s = c.__;
function d(n, t) {
    c.__h && c.__h(r, n, o || t), o = 0;
    var u = r.__H || (r.__H = {
        __: [],
        __h: []
    });
    return n >= u.__.length && u.__.push({}), u.__[n];
}
function h(n) {
    return o = 1, p(D, n);
}
function p(n, u, i) {
    var o = d(t++, 2);
    if (o.t = n, !o.__c && (o.__ = [
        i ? i(u) : D(void 0, u),
        function(n) {
            var t = o.__N ? o.__N[0] : o.__[0], r = o.t(t, n);
            t !== r && (o.__N = [
                r,
                o.__[1]
            ], o.__c.setState({}));
        }
    ], o.__c = r, !r.u)) {
        var f = function(n, t, r) {
            if (!o.__c.__H) return !0;
            var u = o.__c.__H.__.filter(function(n) {
                return !!n.__c;
            });
            if (u.every(function(n) {
                return !n.__N;
            })) return !c || c.call(this, n, t, r);
            var i = !1;
            return u.forEach(function(n) {
                if (n.__N) {
                    var t = n.__[0];
                    n.__ = n.__N, n.__N = void 0, t !== n.__[0] && (i = !0);
                }
            }), !(!i && o.__c.props === n) && (!c || c.call(this, n, t, r));
        };
        r.u = !0;
        var c = r.shouldComponentUpdate, e = r.componentWillUpdate;
        r.componentWillUpdate = function(n, t, r) {
            if (this.__e) {
                var u = c;
                c = void 0, f(n, t, r), c = u;
            }
            e && e.call(this, n, t, r);
        }, r.shouldComponentUpdate = f;
    }
    return o.__N || o.__;
}
function y(n, u) {
    var i = d(t++, 3);
    !c.__s && C(i.__H, u) && (i.__ = n, i.i = u, r.__H.__h.push(i));
}
function _(n, u) {
    var i = d(t++, 4);
    !c.__s && C(i.__H, u) && (i.__ = n, i.i = u, r.__h.push(i));
}
function A(n) {
    return o = 5, T(function() {
        return {
            current: n
        };
    }, []);
}
function F(n, t, r) {
    o = 6, _(function() {
        return "function" == typeof n ? (n(t()), function() {
            return n(null);
        }) : n ? (n.current = t(), function() {
            return n.current = null;
        }) : void 0;
    }, null == r ? r : r.concat(n));
}
function T(n, r) {
    var u = d(t++, 7);
    return C(u.__H, r) && (u.__ = n(), u.__H = r, u.__h = n), u.__;
}
function q(n, t) {
    return o = 8, T(function() {
        return n;
    }, t);
}
function x(n) {
    var u = r.context[n.__c], i = d(t++, 9);
    return i.c = n, u ? (null == i.__ && (i.__ = !0, u.sub(r)), u.props.value) : n.__;
}
function P(n, t) {
    c.useDebugValue && c.useDebugValue(t ? t(n) : n);
}
function b(n) {
    var u = d(t++, 10), i = h();
    return u.__ = n, r.componentDidCatch || (r.componentDidCatch = function(n, t) {
        u.__ && u.__(n, t), i[1](n);
    }), [
        i[0],
        function() {
            i[1](void 0);
        }
    ];
}
function g() {
    var n = d(t++, 11);
    if (!n.__) {
        for(var u = r.__v; null !== u && !u.__m && null !== u.__;)u = u.__;
        var i = u.__m || (u.__m = [
            0,
            0
        ]);
        n.__ = "P" + i[0] + "-" + i[1]++;
    }
    return n.__;
}
function j() {
    for(var n; n = f.shift();)if (n.__P && n.__H) try {
        n.__H.__h.forEach(z), n.__H.__h.forEach(B), n.__H.__h = [];
    } catch (t) {
        n.__H.__h = [], c.__e(t, n.__v);
    }
}
c.__b = function(n) {
    r = null, e && e(n);
}, c.__ = function(n, t) {
    n && t.__k && t.__k.__m && (n.__m = t.__k.__m), s && s(n, t);
}, c.__r = function(n) {
    a && a(n), t = 0;
    var i = (r = n.__c).__H;
    i && (u === r ? (i.__h = [], r.__h = [], i.__.forEach(function(n) {
        n.__N && (n.__ = n.__N), n.i = n.__N = void 0;
    })) : (i.__h.forEach(z), i.__h.forEach(B), i.__h = [], t = 0)), u = r;
}, c.diffed = function(n) {
    v && v(n);
    var t = n.__c;
    t && t.__H && (t.__H.__h.length && (1 !== f.push(t) && i === c.requestAnimationFrame || ((i = c.requestAnimationFrame) || w)(j)), t.__H.__.forEach(function(n) {
        n.i && (n.__H = n.i), n.i = void 0;
    })), u = r = null;
}, c.__c = function(n, t) {
    t.some(function(n) {
        try {
            n.__h.forEach(z), n.__h = n.__h.filter(function(n) {
                return !n.__ || B(n);
            });
        } catch (r) {
            t.some(function(n) {
                n.__h && (n.__h = []);
            }), t = [], c.__e(r, n.__v);
        }
    }), l && l(n, t);
}, c.unmount = function(n) {
    m && m(n);
    var t, r = n.__c;
    r && r.__H && (r.__H.__.forEach(function(n) {
        try {
            z(n);
        } catch (n) {
            t = n;
        }
    }), r.__H = void 0, t && c.__e(t, r.__v));
};
var k = "function" == typeof requestAnimationFrame;
function w(n) {
    var t, r = function() {
        clearTimeout(u), k && cancelAnimationFrame(t), setTimeout(n);
    }, u = setTimeout(r, 100);
    k && (t = requestAnimationFrame(r));
}
function z(n) {
    var t = r, u = n.__c;
    "function" == typeof u && (n.__c = void 0, u()), r = t;
}
function B(n) {
    var t = r;
    n.__c = n.__(), r = t;
}
function C(n, t) {
    return !n || n.length !== t.length || t.some(function(t, r) {
        return t !== n[r];
    });
}
function D(n, t) {
    return "function" == typeof t ? t(n) : t;
}
;
 //# sourceMappingURL=hooks.module.js.map
}),
"[project]/node_modules/wagmi/node_modules/clsx/dist/clsx.m.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clsx",
    ()=>clsx,
    "default",
    ()=>__TURBOPACK__default__export__
]);
function r(e) {
    var t, f, n = "";
    if ("string" == typeof e || "number" == typeof e) n += e;
    else if ("object" == typeof e) if (Array.isArray(e)) for(t = 0; t < e.length; t++)e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
    else for(t in e)e[t] && (n && (n += " "), n += t);
    return n;
}
function clsx() {
    for(var e, t, f = 0, n = ""; f < arguments.length;)(e = arguments[f++]) && (t = r(e)) && (n && (n += " "), n += t);
    return n;
}
const __TURBOPACK__default__export__ = clsx;
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/version.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** @internal */ __turbopack_context__.s([
    "version",
    ()=>version
]);
const version = '0.1.1'; //# sourceMappingURL=version.js.map
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/internal/errors.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getUrl",
    ()=>getUrl,
    "getVersion",
    ()=>getVersion,
    "prettyPrint",
    ()=>prettyPrint
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$version$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/version.js [app-ssr] (ecmascript)");
;
function getUrl(url) {
    return url;
}
function getVersion() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$version$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["version"];
}
function prettyPrint(args) {
    if (!args) return '';
    const entries = Object.entries(args).map(([key, value])=>{
        if (value === undefined || value === false) return null;
        return [
            key,
            value
        ];
    }).filter(Boolean);
    const maxLength = entries.reduce((acc, [key])=>Math.max(acc, key.length), 0);
    return entries.map(([key, value])=>`  ${`${key}:`.padEnd(maxLength + 1)}  ${value}`).join('\n');
} //# sourceMappingURL=errors.js.map
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/Errors.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseError",
    ()=>BaseError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/internal/errors.js [app-ssr] (ecmascript)");
;
class BaseError extends Error {
    constructor(shortMessage, options = {}){
        const details = (()=>{
            if (options.cause instanceof BaseError) {
                if (options.cause.details) return options.cause.details;
                if (options.cause.shortMessage) return options.cause.shortMessage;
            }
            if (options.cause?.message) return options.cause.message;
            return options.details;
        })();
        const docsPath = (()=>{
            if (options.cause instanceof BaseError) return options.cause.docsPath || options.docsPath;
            return options.docsPath;
        })();
        const docsBaseUrl = 'https://oxlib.sh';
        const docs = `${docsBaseUrl}${docsPath ?? ''}`;
        const message = [
            shortMessage || 'An error occurred.',
            ...options.metaMessages ? [
                '',
                ...options.metaMessages
            ] : [],
            ...details || docsPath ? [
                '',
                details ? `Details: ${details}` : undefined,
                docsPath ? `See: ${docs}` : undefined
            ] : []
        ].filter((x)=>typeof x === 'string').join('\n');
        super(message, options.cause ? {
            cause: options.cause
        } : undefined);
        Object.defineProperty(this, "details", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "docs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "docsPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "shortMessage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cause", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'BaseError'
        });
        Object.defineProperty(this, "version", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: `ox@${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getVersion"])()}`
        });
        this.cause = options.cause;
        this.details = details;
        this.docs = docs;
        this.docsPath = docsPath;
        this.shortMessage = shortMessage;
    }
    walk(fn) {
        return walk(this, fn);
    }
}
/** @internal */ function walk(err, fn) {
    if (fn?.(err)) return err;
    if (err && typeof err === 'object' && 'cause' in err && err.cause) return walk(err.cause, fn);
    return fn ? null : err;
} //# sourceMappingURL=Errors.js.map
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/Json.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parse",
    ()=>parse,
    "stringify",
    ()=>stringify
]);
const bigIntSuffix = '#__bigint';
function parse(string, reviver) {
    return JSON.parse(string, (key, value_)=>{
        const value = value_;
        if (typeof value === 'string' && value.endsWith(bigIntSuffix)) return BigInt(value.slice(0, -bigIntSuffix.length));
        return typeof reviver === 'function' ? reviver(key, value) : value;
    });
}
function stringify(value, replacer, space) {
    return JSON.stringify(value, (key, value)=>{
        if (typeof replacer === 'function') return replacer(key, value);
        if (typeof value === 'bigint') return value.toString() + bigIntSuffix;
        return value;
    }, space);
} //# sourceMappingURL=Json.js.map
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/internal/bytes.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertEndOffset",
    ()=>assertEndOffset,
    "assertSize",
    ()=>assertSize,
    "assertStartOffset",
    ()=>assertStartOffset,
    "charCodeMap",
    ()=>charCodeMap,
    "charCodeToBase16",
    ()=>charCodeToBase16,
    "pad",
    ()=>pad,
    "trim",
    ()=>trim
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Bytes.js [app-ssr] (ecmascript)");
;
function assertSize(bytes, size_) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["size"](bytes) > size_) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SizeOverflowError"]({
        givenSize: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["size"](bytes),
        maxSize: size_
    });
}
function assertStartOffset(value, start) {
    if (typeof start === 'number' && start > 0 && start > __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["size"](value) - 1) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SliceOffsetOutOfBoundsError"]({
        offset: start,
        position: 'start',
        size: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["size"](value)
    });
}
function assertEndOffset(value, start, end) {
    if (typeof start === 'number' && typeof end === 'number' && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["size"](value) !== end - start) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SliceOffsetOutOfBoundsError"]({
            offset: end,
            position: 'end',
            size: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["size"](value)
        });
    }
}
const charCodeMap = {
    zero: 48,
    nine: 57,
    A: 65,
    F: 70,
    a: 97,
    f: 102
};
function charCodeToBase16(char) {
    if (char >= charCodeMap.zero && char <= charCodeMap.nine) return char - charCodeMap.zero;
    if (char >= charCodeMap.A && char <= charCodeMap.F) return char - (charCodeMap.A - 10);
    if (char >= charCodeMap.a && char <= charCodeMap.f) return char - (charCodeMap.a - 10);
    return undefined;
}
function pad(bytes, options = {}) {
    const { dir, size = 32 } = options;
    if (size === 0) return bytes;
    if (bytes.length > size) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SizeExceedsPaddingSizeError"]({
        size: bytes.length,
        targetSize: size,
        type: 'Bytes'
    });
    const paddedBytes = new Uint8Array(size);
    for(let i = 0; i < size; i++){
        const padEnd = dir === 'right';
        paddedBytes[padEnd ? i : size - i - 1] = bytes[padEnd ? i : bytes.length - i - 1];
    }
    return paddedBytes;
}
function trim(value, options = {}) {
    const { dir = 'left' } = options;
    let data = value;
    let sliceLength = 0;
    for(let i = 0; i < data.length - 1; i++){
        if (data[dir === 'left' ? i : data.length - i - 1].toString() === '0') sliceLength++;
        else break;
    }
    data = dir === 'left' ? data.slice(sliceLength) : data.slice(0, data.length - sliceLength);
    return data;
} //# sourceMappingURL=bytes.js.map
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/internal/hex.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertEndOffset",
    ()=>assertEndOffset,
    "assertSize",
    ()=>assertSize,
    "assertStartOffset",
    ()=>assertStartOffset,
    "pad",
    ()=>pad,
    "trim",
    ()=>trim
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Hex.js [app-ssr] (ecmascript)");
;
function assertSize(hex, size_) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["size"](hex) > size_) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SizeOverflowError"]({
        givenSize: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["size"](hex),
        maxSize: size_
    });
}
function assertStartOffset(value, start) {
    if (typeof start === 'number' && start > 0 && start > __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["size"](value) - 1) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SliceOffsetOutOfBoundsError"]({
        offset: start,
        position: 'start',
        size: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["size"](value)
    });
}
function assertEndOffset(value, start, end) {
    if (typeof start === 'number' && typeof end === 'number' && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["size"](value) !== end - start) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SliceOffsetOutOfBoundsError"]({
            offset: end,
            position: 'end',
            size: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["size"](value)
        });
    }
}
function pad(hex_, options = {}) {
    const { dir, size = 32 } = options;
    if (size === 0) return hex_;
    const hex = hex_.replace('0x', '');
    if (hex.length > size * 2) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SizeExceedsPaddingSizeError"]({
        size: Math.ceil(hex.length / 2),
        targetSize: size,
        type: 'Hex'
    });
    return `0x${hex[dir === 'right' ? 'padEnd' : 'padStart'](size * 2, '0')}`;
}
function trim(value, options = {}) {
    const { dir = 'left' } = options;
    let data = value.replace('0x', '');
    let sliceLength = 0;
    for(let i = 0; i < data.length - 1; i++){
        if (data[dir === 'left' ? i : data.length - i - 1].toString() === '0') sliceLength++;
        else break;
    }
    data = dir === 'left' ? data.slice(sliceLength) : data.slice(0, data.length - sliceLength);
    if (data === '0') return '0x';
    if (dir === 'right' && data.length % 2 === 1) return `0x${data}0`;
    return `0x${data}`;
} //# sourceMappingURL=hex.js.map
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/Bytes.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InvalidBytesBooleanError",
    ()=>InvalidBytesBooleanError,
    "InvalidBytesTypeError",
    ()=>InvalidBytesTypeError,
    "SizeExceedsPaddingSizeError",
    ()=>SizeExceedsPaddingSizeError,
    "SizeOverflowError",
    ()=>SizeOverflowError,
    "SliceOffsetOutOfBoundsError",
    ()=>SliceOffsetOutOfBoundsError,
    "assert",
    ()=>assert,
    "concat",
    ()=>concat,
    "from",
    ()=>from,
    "fromArray",
    ()=>fromArray,
    "fromBoolean",
    ()=>fromBoolean,
    "fromHex",
    ()=>fromHex,
    "fromNumber",
    ()=>fromNumber,
    "fromString",
    ()=>fromString,
    "isEqual",
    ()=>isEqual,
    "padLeft",
    ()=>padLeft,
    "padRight",
    ()=>padRight,
    "random",
    ()=>random,
    "size",
    ()=>size,
    "slice",
    ()=>slice,
    "toBigInt",
    ()=>toBigInt,
    "toBoolean",
    ()=>toBoolean,
    "toHex",
    ()=>toHex,
    "toNumber",
    ()=>toNumber,
    "toString",
    ()=>toString,
    "trimLeft",
    ()=>trimLeft,
    "trimRight",
    ()=>trimRight,
    "validate",
    ()=>validate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/@noble/curves/esm/abstract/utils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Errors.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Hex.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Json$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Json.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/internal/bytes.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/internal/hex.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
const decoder = /*#__PURE__*/ new TextDecoder();
const encoder = /*#__PURE__*/ new TextEncoder();
function assert(value) {
    if (value instanceof Uint8Array) return;
    if (!value) throw new InvalidBytesTypeError(value);
    if (typeof value !== 'object') throw new InvalidBytesTypeError(value);
    if (!('BYTES_PER_ELEMENT' in value)) throw new InvalidBytesTypeError(value);
    if (value.BYTES_PER_ELEMENT !== 1 || value.constructor.name !== 'Uint8Array') throw new InvalidBytesTypeError(value);
}
function concat(...values) {
    let length = 0;
    for (const arr of values){
        length += arr.length;
    }
    const result = new Uint8Array(length);
    for(let i = 0, index = 0; i < values.length; i++){
        const arr = values[i];
        result.set(arr, index);
        index += arr.length;
    }
    return result;
}
function from(value) {
    if (value instanceof Uint8Array) return value;
    if (typeof value === 'string') return fromHex(value);
    return fromArray(value);
}
function fromArray(value) {
    return value instanceof Uint8Array ? value : new Uint8Array(value);
}
function fromBoolean(value, options = {}) {
    const { size } = options;
    const bytes = new Uint8Array(1);
    bytes[0] = Number(value);
    if (typeof size === 'number') {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assertSize"](bytes, size);
        return padLeft(bytes, size);
    }
    return bytes;
}
function fromHex(value, options = {}) {
    const { size } = options;
    let hex = value;
    if (size) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assertSize"](value, size);
        hex = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["padRight"](value, size);
    }
    let hexString = hex.slice(2);
    if (hexString.length % 2) hexString = `0${hexString}`;
    const length = hexString.length / 2;
    const bytes = new Uint8Array(length);
    for(let index = 0, j = 0; index < length; index++){
        const nibbleLeft = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["charCodeToBase16"](hexString.charCodeAt(j++));
        const nibbleRight = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["charCodeToBase16"](hexString.charCodeAt(j++));
        if (nibbleLeft === undefined || nibbleRight === undefined) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"](`Invalid byte sequence ("${hexString[j - 2]}${hexString[j - 1]}" in "${hexString}").`);
        }
        bytes[index] = nibbleLeft * 16 + nibbleRight;
    }
    return bytes;
}
function fromNumber(value, options) {
    const hex = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromNumber"](value, options);
    return fromHex(hex);
}
function fromString(value, options = {}) {
    const { size } = options;
    const bytes = encoder.encode(value);
    if (typeof size === 'number') {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assertSize"](bytes, size);
        return padRight(bytes, size);
    }
    return bytes;
}
function isEqual(bytesA, bytesB) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["equalBytes"])(bytesA, bytesB);
}
function padLeft(value, size) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pad"](value, {
        dir: 'left',
        size
    });
}
function padRight(value, size) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pad"](value, {
        dir: 'right',
        size
    });
}
function random(length) {
    return crypto.getRandomValues(new Uint8Array(length));
}
function size(value) {
    return value.length;
}
function slice(value, start, end, options = {}) {
    const { strict } = options;
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assertStartOffset"](value, start);
    const value_ = value.slice(start, end);
    if (strict) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assertEndOffset"](value_, start, end);
    return value_;
}
function toBigInt(bytes, options = {}) {
    const { size } = options;
    if (typeof size !== 'undefined') __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assertSize"](bytes, size);
    const hex = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromBytes"](bytes, options);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toBigInt"](hex, options);
}
function toBoolean(bytes, options = {}) {
    const { size } = options;
    let bytes_ = bytes;
    if (typeof size !== 'undefined') {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assertSize"](bytes_, size);
        bytes_ = trimLeft(bytes_);
    }
    if (bytes_.length > 1 || bytes_[0] > 1) throw new InvalidBytesBooleanError(bytes_);
    return Boolean(bytes_[0]);
}
function toHex(value, options = {}) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromBytes"](value, options);
}
function toNumber(bytes, options = {}) {
    const { size } = options;
    if (typeof size !== 'undefined') __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assertSize"](bytes, size);
    const hex = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromBytes"](bytes, options);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toNumber"](hex, options);
}
function toString(bytes, options = {}) {
    const { size } = options;
    let bytes_ = bytes;
    if (typeof size !== 'undefined') {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assertSize"](bytes_, size);
        bytes_ = trimRight(bytes_);
    }
    return decoder.decode(bytes_);
}
function trimLeft(value) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trim"](value, {
        dir: 'left'
    });
}
function trimRight(value) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trim"](value, {
        dir: 'right'
    });
}
function validate(value) {
    try {
        assert(value);
        return true;
    } catch  {
        return false;
    }
}
class InvalidBytesBooleanError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor(bytes){
        super(`Bytes value \`${bytes}\` is not a valid boolean.`, {
            metaMessages: [
                'The bytes array must contain a single byte of either a `0` or `1` value.'
            ]
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Bytes.InvalidBytesBooleanError'
        });
    }
}
class InvalidBytesTypeError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor(value){
        super(`Value \`${typeof value === 'object' ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Json$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stringify"](value) : value}\` of type \`${typeof value}\` is an invalid Bytes value.`, {
            metaMessages: [
                'Bytes values must be of type `Bytes`.'
            ]
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Bytes.InvalidBytesTypeError'
        });
    }
}
class SizeOverflowError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ givenSize, maxSize }){
        super(`Size cannot exceed \`${maxSize}\` bytes. Given size: \`${givenSize}\` bytes.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Bytes.SizeOverflowError'
        });
    }
}
class SliceOffsetOutOfBoundsError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ offset, position, size }){
        super(`Slice ${position === 'start' ? 'starting' : 'ending'} at offset \`${offset}\` is out-of-bounds (size: \`${size}\`).`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Bytes.SliceOffsetOutOfBoundsError'
        });
    }
}
class SizeExceedsPaddingSizeError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ size, targetSize, type }){
        super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (\`${size}\`) exceeds padding size (\`${targetSize}\`).`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Bytes.SizeExceedsPaddingSizeError'
        });
    }
} //# sourceMappingURL=Bytes.js.map
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/Hex.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IntegerOutOfRangeError",
    ()=>IntegerOutOfRangeError,
    "InvalidHexBooleanError",
    ()=>InvalidHexBooleanError,
    "InvalidHexTypeError",
    ()=>InvalidHexTypeError,
    "InvalidHexValueError",
    ()=>InvalidHexValueError,
    "InvalidLengthError",
    ()=>InvalidLengthError,
    "SizeExceedsPaddingSizeError",
    ()=>SizeExceedsPaddingSizeError,
    "SizeOverflowError",
    ()=>SizeOverflowError,
    "SliceOffsetOutOfBoundsError",
    ()=>SliceOffsetOutOfBoundsError,
    "assert",
    ()=>assert,
    "concat",
    ()=>concat,
    "from",
    ()=>from,
    "fromBoolean",
    ()=>fromBoolean,
    "fromBytes",
    ()=>fromBytes,
    "fromNumber",
    ()=>fromNumber,
    "fromString",
    ()=>fromString,
    "isEqual",
    ()=>isEqual,
    "padLeft",
    ()=>padLeft,
    "padRight",
    ()=>padRight,
    "random",
    ()=>random,
    "size",
    ()=>size,
    "slice",
    ()=>slice,
    "toBigInt",
    ()=>toBigInt,
    "toBoolean",
    ()=>toBoolean,
    "toBytes",
    ()=>toBytes,
    "toNumber",
    ()=>toNumber,
    "toString",
    ()=>toString,
    "trimLeft",
    ()=>trimLeft,
    "trimRight",
    ()=>trimRight,
    "validate",
    ()=>validate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/@noble/curves/esm/abstract/utils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Bytes.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Errors.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Json$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Json.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/internal/bytes.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/internal/hex.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
const encoder = /*#__PURE__*/ new TextEncoder();
const hexes = /*#__PURE__*/ Array.from({
    length: 256
}, (_v, i)=>i.toString(16).padStart(2, '0'));
function assert(value, options = {}) {
    const { strict = false } = options;
    if (!value) throw new InvalidHexTypeError(value);
    if (typeof value !== 'string') throw new InvalidHexTypeError(value);
    if (strict) {
        if (!/^0x[0-9a-fA-F]*$/.test(value)) throw new InvalidHexValueError(value);
    }
    if (!value.startsWith('0x')) throw new InvalidHexValueError(value);
}
function concat(...values) {
    return `0x${values.reduce((acc, x)=>acc + x.replace('0x', ''), '')}`;
}
function from(value) {
    if (value instanceof Uint8Array) return fromBytes(value);
    if (Array.isArray(value)) return fromBytes(new Uint8Array(value));
    return value;
}
function fromBoolean(value, options = {}) {
    const hex = `0x${Number(value)}`;
    if (typeof options.size === 'number') {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assertSize"](hex, options.size);
        return padLeft(hex, options.size);
    }
    return hex;
}
function fromBytes(value, options = {}) {
    let string = '';
    for(let i = 0; i < value.length; i++)string += hexes[value[i]];
    const hex = `0x${string}`;
    if (typeof options.size === 'number') {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assertSize"](hex, options.size);
        return padRight(hex, options.size);
    }
    return hex;
}
function fromNumber(value, options = {}) {
    const { signed, size } = options;
    const value_ = BigInt(value);
    let maxValue;
    if (size) {
        if (signed) maxValue = (1n << BigInt(size) * 8n - 1n) - 1n;
        else maxValue = 2n ** (BigInt(size) * 8n) - 1n;
    } else if (typeof value === 'number') {
        maxValue = BigInt(Number.MAX_SAFE_INTEGER);
    }
    const minValue = typeof maxValue === 'bigint' && signed ? -maxValue - 1n : 0;
    if (maxValue && value_ > maxValue || value_ < minValue) {
        const suffix = typeof value === 'bigint' ? 'n' : '';
        throw new IntegerOutOfRangeError({
            max: maxValue ? `${maxValue}${suffix}` : undefined,
            min: `${minValue}${suffix}`,
            signed,
            size,
            value: `${value}${suffix}`
        });
    }
    const stringValue = (signed && value_ < 0 ? (1n << BigInt(size * 8)) + BigInt(value_) : value_).toString(16);
    const hex = `0x${stringValue}`;
    if (size) return padLeft(hex, size);
    return hex;
}
function fromString(value, options = {}) {
    return fromBytes(encoder.encode(value), options);
}
function isEqual(hexA, hexB) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["equalBytes"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromHex"](hexA), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromHex"](hexB));
}
function padLeft(value, size) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pad"](value, {
        dir: 'left',
        size
    });
}
function padRight(value, size) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pad"](value, {
        dir: 'right',
        size
    });
}
function random(length) {
    return fromBytes(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["random"](length));
}
function slice(value, start, end, options = {}) {
    const { strict } = options;
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assertStartOffset"](value, start);
    const value_ = `0x${value.replace('0x', '').slice((start ?? 0) * 2, (end ?? value.length) * 2)}`;
    if (strict) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assertEndOffset"](value_, start, end);
    return value_;
}
function size(value) {
    return Math.ceil((value.length - 2) / 2);
}
function trimLeft(value) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trim"](value, {
        dir: 'left'
    });
}
function trimRight(value) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trim"](value, {
        dir: 'right'
    });
}
function toBigInt(hex, options = {}) {
    const { signed } = options;
    if (options.size) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assertSize"](hex, options.size);
    const value = BigInt(hex);
    if (!signed) return value;
    const size = (hex.length - 2) / 2;
    const max_unsigned = (1n << BigInt(size) * 8n) - 1n;
    const max_signed = max_unsigned >> 1n;
    if (value <= max_signed) return value;
    return value - max_unsigned - 1n;
}
function toBoolean(hex, options = {}) {
    if (options.size) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assertSize"](hex, options.size);
    const hex_ = trimLeft(hex);
    if (hex_ === '0x') return false;
    if (hex_ === '0x1') return true;
    throw new InvalidHexBooleanError(hex);
}
function toBytes(hex, options = {}) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromHex"](hex, options);
}
function toNumber(hex, options = {}) {
    const { signed, size } = options;
    if (!signed && !size) return Number(hex);
    return Number(toBigInt(hex, options));
}
function toString(hex, options = {}) {
    const { size } = options;
    let bytes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromHex"](hex);
    if (size) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assertSize"](bytes, size);
        bytes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trimRight"](bytes);
    }
    return new TextDecoder().decode(bytes);
}
function validate(value, options = {}) {
    const { strict = false } = options;
    try {
        assert(value, {
            strict
        });
        return true;
    } catch  {
        return false;
    }
}
class IntegerOutOfRangeError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ max, min, signed, size, value }){
        super(`Number \`${value}\` is not in safe${size ? ` ${size * 8}-bit` : ''}${signed ? ' signed' : ' unsigned'} integer range ${max ? `(\`${min}\` to \`${max}\`)` : `(above \`${min}\`)`}`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Hex.IntegerOutOfRangeError'
        });
    }
}
class InvalidHexBooleanError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor(hex){
        super(`Hex value \`"${hex}"\` is not a valid boolean.`, {
            metaMessages: [
                'The hex value must be `"0x0"` (false) or `"0x1"` (true).'
            ]
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Hex.InvalidHexBooleanError'
        });
    }
}
class InvalidHexTypeError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor(value){
        super(`Value \`${typeof value === 'object' ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Json$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stringify"](value) : value}\` of type \`${typeof value}\` is an invalid hex type.`, {
            metaMessages: [
                'Hex types must be represented as `"0x${string}"`.'
            ]
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Hex.InvalidHexTypeError'
        });
    }
}
class InvalidHexValueError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor(value){
        super(`Value \`${value}\` is an invalid hex value.`, {
            metaMessages: [
                'Hex values must start with `"0x"` and contain only hexadecimal characters (0-9, a-f, A-F).'
            ]
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Hex.InvalidHexValueError'
        });
    }
}
class InvalidLengthError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor(value){
        super(`Hex value \`"${value}"\` is an odd length (${value.length - 2} nibbles).`, {
            metaMessages: [
                'It must be an even length.'
            ]
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Hex.InvalidLengthError'
        });
    }
}
class SizeOverflowError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ givenSize, maxSize }){
        super(`Size cannot exceed \`${maxSize}\` bytes. Given size: \`${givenSize}\` bytes.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Hex.SizeOverflowError'
        });
    }
}
class SliceOffsetOutOfBoundsError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ offset, position, size }){
        super(`Slice ${position === 'start' ? 'starting' : 'ending'} at offset \`${offset}\` is out-of-bounds (size: \`${size}\`).`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Hex.SliceOffsetOutOfBoundsError'
        });
    }
}
class SizeExceedsPaddingSizeError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ size, targetSize, type }){
        super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (\`${size}\`) exceeds padding size (\`${targetSize}\`).`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Hex.SizeExceedsPaddingSizeError'
        });
    }
} //# sourceMappingURL=Hex.js.map
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/Hex.js [app-ssr] (ecmascript) <export * as Hex>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Hex",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Hex.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/PublicKey.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InvalidCompressedPrefixError",
    ()=>InvalidCompressedPrefixError,
    "InvalidError",
    ()=>InvalidError,
    "InvalidPrefixError",
    ()=>InvalidPrefixError,
    "InvalidSerializedSizeError",
    ()=>InvalidSerializedSizeError,
    "InvalidUncompressedPrefixError",
    ()=>InvalidUncompressedPrefixError,
    "assert",
    ()=>assert,
    "compress",
    ()=>compress,
    "from",
    ()=>from,
    "fromBytes",
    ()=>fromBytes,
    "fromHex",
    ()=>fromHex,
    "toBytes",
    ()=>toBytes,
    "toHex",
    ()=>toHex,
    "validate",
    ()=>validate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Bytes.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Errors.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Hex.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Json$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Json.js [app-ssr] (ecmascript)");
;
;
;
;
function assert(publicKey, options = {}) {
    const { compressed } = options;
    const { prefix, x, y } = publicKey;
    // Uncompressed
    if (compressed === false || typeof x === 'bigint' && typeof y === 'bigint') {
        if (prefix !== 4) throw new InvalidPrefixError({
            prefix,
            cause: new InvalidUncompressedPrefixError()
        });
        return;
    }
    // Compressed
    if (compressed === true || typeof x === 'bigint' && typeof y === 'undefined') {
        if (prefix !== 3 && prefix !== 2) throw new InvalidPrefixError({
            prefix,
            cause: new InvalidCompressedPrefixError()
        });
        return;
    }
    // Unknown/invalid
    throw new InvalidError({
        publicKey
    });
}
function compress(publicKey) {
    const { x, y } = publicKey;
    return {
        prefix: y % 2n === 0n ? 2 : 3,
        x
    };
}
function from(value) {
    const publicKey = (()=>{
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validate"](value)) return fromHex(value);
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validate"](value)) return fromBytes(value);
        const { prefix, x, y } = value;
        if (typeof x === 'bigint' && typeof y === 'bigint') return {
            prefix: prefix ?? 0x04,
            x,
            y
        };
        return {
            prefix,
            x
        };
    })();
    assert(publicKey);
    return publicKey;
}
function fromBytes(publicKey) {
    return fromHex(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromBytes"](publicKey));
}
function fromHex(publicKey) {
    if (publicKey.length !== 132 && publicKey.length !== 130 && publicKey.length !== 68) throw new InvalidSerializedSizeError({
        publicKey
    });
    if (publicKey.length === 130) {
        const x = BigInt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["slice"](publicKey, 0, 32));
        const y = BigInt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["slice"](publicKey, 32, 64));
        return {
            prefix: 4,
            x,
            y
        };
    }
    if (publicKey.length === 132) {
        const prefix = Number(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["slice"](publicKey, 0, 1));
        const x = BigInt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["slice"](publicKey, 1, 33));
        const y = BigInt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["slice"](publicKey, 33, 65));
        return {
            prefix,
            x,
            y
        };
    }
    const prefix = Number(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["slice"](publicKey, 0, 1));
    const x = BigInt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["slice"](publicKey, 1, 33));
    return {
        prefix,
        x
    };
}
function toBytes(publicKey, options = {}) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromHex"](toHex(publicKey, options));
}
function toHex(publicKey, options = {}) {
    assert(publicKey);
    const { prefix, x, y } = publicKey;
    const { includePrefix = true } = options;
    const publicKey_ = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["concat"](includePrefix ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromNumber"](prefix, {
        size: 1
    }) : '0x', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromNumber"](x, {
        size: 32
    }), // If the public key is not compressed, add the y coordinate.
    typeof y === 'bigint' ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromNumber"](y, {
        size: 32
    }) : '0x');
    return publicKey_;
}
function validate(publicKey, options = {}) {
    try {
        assert(publicKey, options);
        return true;
    } catch (error) {
        return false;
    }
}
class InvalidError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ publicKey }){
        super(`Value \`${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Json$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stringify"](publicKey)}\` is not a valid public key.`, {
            metaMessages: [
                'Public key must contain:',
                '- an `x` and `prefix` value (compressed)',
                '- an `x`, `y`, and `prefix` value (uncompressed)'
            ]
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'PublicKey.InvalidError'
        });
    }
}
class InvalidPrefixError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ prefix, cause }){
        super(`Prefix "${prefix}" is invalid.`, {
            cause
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'PublicKey.InvalidPrefixError'
        });
    }
}
class InvalidCompressedPrefixError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor(){
        super('Prefix must be 2 or 3 for compressed public keys.');
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'PublicKey.InvalidCompressedPrefixError'
        });
    }
}
class InvalidUncompressedPrefixError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor(){
        super('Prefix must be 4 for uncompressed public keys.');
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'PublicKey.InvalidUncompressedPrefixError'
        });
    }
}
class InvalidSerializedSizeError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ publicKey }){
        super(`Value \`${publicKey}\` is an invalid public key size.`, {
            metaMessages: [
                'Expected: 33 bytes (compressed + prefix), 64 bytes (uncompressed) or 65 bytes (uncompressed + prefix).',
                `Received ${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["size"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["from"](publicKey))} bytes.`
            ]
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'PublicKey.InvalidSerializedSizeError'
        });
    }
} //# sourceMappingURL=PublicKey.js.map
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/PublicKey.js [app-ssr] (ecmascript) <export * as PublicKey>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PublicKey",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$PublicKey$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$PublicKey$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/PublicKey.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/Solidity.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "arrayRegex",
    ()=>arrayRegex,
    "bytesRegex",
    ()=>bytesRegex,
    "integerRegex",
    ()=>integerRegex,
    "maxInt104",
    ()=>maxInt104,
    "maxInt112",
    ()=>maxInt112,
    "maxInt120",
    ()=>maxInt120,
    "maxInt128",
    ()=>maxInt128,
    "maxInt136",
    ()=>maxInt136,
    "maxInt144",
    ()=>maxInt144,
    "maxInt152",
    ()=>maxInt152,
    "maxInt16",
    ()=>maxInt16,
    "maxInt160",
    ()=>maxInt160,
    "maxInt168",
    ()=>maxInt168,
    "maxInt176",
    ()=>maxInt176,
    "maxInt184",
    ()=>maxInt184,
    "maxInt192",
    ()=>maxInt192,
    "maxInt200",
    ()=>maxInt200,
    "maxInt208",
    ()=>maxInt208,
    "maxInt216",
    ()=>maxInt216,
    "maxInt224",
    ()=>maxInt224,
    "maxInt232",
    ()=>maxInt232,
    "maxInt24",
    ()=>maxInt24,
    "maxInt240",
    ()=>maxInt240,
    "maxInt248",
    ()=>maxInt248,
    "maxInt256",
    ()=>maxInt256,
    "maxInt32",
    ()=>maxInt32,
    "maxInt40",
    ()=>maxInt40,
    "maxInt48",
    ()=>maxInt48,
    "maxInt56",
    ()=>maxInt56,
    "maxInt64",
    ()=>maxInt64,
    "maxInt72",
    ()=>maxInt72,
    "maxInt8",
    ()=>maxInt8,
    "maxInt80",
    ()=>maxInt80,
    "maxInt88",
    ()=>maxInt88,
    "maxInt96",
    ()=>maxInt96,
    "maxUint104",
    ()=>maxUint104,
    "maxUint112",
    ()=>maxUint112,
    "maxUint120",
    ()=>maxUint120,
    "maxUint128",
    ()=>maxUint128,
    "maxUint136",
    ()=>maxUint136,
    "maxUint144",
    ()=>maxUint144,
    "maxUint152",
    ()=>maxUint152,
    "maxUint16",
    ()=>maxUint16,
    "maxUint160",
    ()=>maxUint160,
    "maxUint168",
    ()=>maxUint168,
    "maxUint176",
    ()=>maxUint176,
    "maxUint184",
    ()=>maxUint184,
    "maxUint192",
    ()=>maxUint192,
    "maxUint200",
    ()=>maxUint200,
    "maxUint208",
    ()=>maxUint208,
    "maxUint216",
    ()=>maxUint216,
    "maxUint224",
    ()=>maxUint224,
    "maxUint232",
    ()=>maxUint232,
    "maxUint24",
    ()=>maxUint24,
    "maxUint240",
    ()=>maxUint240,
    "maxUint248",
    ()=>maxUint248,
    "maxUint256",
    ()=>maxUint256,
    "maxUint32",
    ()=>maxUint32,
    "maxUint40",
    ()=>maxUint40,
    "maxUint48",
    ()=>maxUint48,
    "maxUint56",
    ()=>maxUint56,
    "maxUint64",
    ()=>maxUint64,
    "maxUint72",
    ()=>maxUint72,
    "maxUint8",
    ()=>maxUint8,
    "maxUint80",
    ()=>maxUint80,
    "maxUint88",
    ()=>maxUint88,
    "maxUint96",
    ()=>maxUint96,
    "minInt104",
    ()=>minInt104,
    "minInt112",
    ()=>minInt112,
    "minInt120",
    ()=>minInt120,
    "minInt128",
    ()=>minInt128,
    "minInt136",
    ()=>minInt136,
    "minInt144",
    ()=>minInt144,
    "minInt152",
    ()=>minInt152,
    "minInt16",
    ()=>minInt16,
    "minInt160",
    ()=>minInt160,
    "minInt168",
    ()=>minInt168,
    "minInt176",
    ()=>minInt176,
    "minInt184",
    ()=>minInt184,
    "minInt192",
    ()=>minInt192,
    "minInt200",
    ()=>minInt200,
    "minInt208",
    ()=>minInt208,
    "minInt216",
    ()=>minInt216,
    "minInt224",
    ()=>minInt224,
    "minInt232",
    ()=>minInt232,
    "minInt24",
    ()=>minInt24,
    "minInt240",
    ()=>minInt240,
    "minInt248",
    ()=>minInt248,
    "minInt256",
    ()=>minInt256,
    "minInt32",
    ()=>minInt32,
    "minInt40",
    ()=>minInt40,
    "minInt48",
    ()=>minInt48,
    "minInt56",
    ()=>minInt56,
    "minInt64",
    ()=>minInt64,
    "minInt72",
    ()=>minInt72,
    "minInt8",
    ()=>minInt8,
    "minInt80",
    ()=>minInt80,
    "minInt88",
    ()=>minInt88,
    "minInt96",
    ()=>minInt96
]);
const arrayRegex = /^(.*)\[([0-9]*)\]$/;
const bytesRegex = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
const integerRegex = /^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
const maxInt8 = 2n ** (8n - 1n) - 1n;
const maxInt16 = 2n ** (16n - 1n) - 1n;
const maxInt24 = 2n ** (24n - 1n) - 1n;
const maxInt32 = 2n ** (32n - 1n) - 1n;
const maxInt40 = 2n ** (40n - 1n) - 1n;
const maxInt48 = 2n ** (48n - 1n) - 1n;
const maxInt56 = 2n ** (56n - 1n) - 1n;
const maxInt64 = 2n ** (64n - 1n) - 1n;
const maxInt72 = 2n ** (72n - 1n) - 1n;
const maxInt80 = 2n ** (80n - 1n) - 1n;
const maxInt88 = 2n ** (88n - 1n) - 1n;
const maxInt96 = 2n ** (96n - 1n) - 1n;
const maxInt104 = 2n ** (104n - 1n) - 1n;
const maxInt112 = 2n ** (112n - 1n) - 1n;
const maxInt120 = 2n ** (120n - 1n) - 1n;
const maxInt128 = 2n ** (128n - 1n) - 1n;
const maxInt136 = 2n ** (136n - 1n) - 1n;
const maxInt144 = 2n ** (144n - 1n) - 1n;
const maxInt152 = 2n ** (152n - 1n) - 1n;
const maxInt160 = 2n ** (160n - 1n) - 1n;
const maxInt168 = 2n ** (168n - 1n) - 1n;
const maxInt176 = 2n ** (176n - 1n) - 1n;
const maxInt184 = 2n ** (184n - 1n) - 1n;
const maxInt192 = 2n ** (192n - 1n) - 1n;
const maxInt200 = 2n ** (200n - 1n) - 1n;
const maxInt208 = 2n ** (208n - 1n) - 1n;
const maxInt216 = 2n ** (216n - 1n) - 1n;
const maxInt224 = 2n ** (224n - 1n) - 1n;
const maxInt232 = 2n ** (232n - 1n) - 1n;
const maxInt240 = 2n ** (240n - 1n) - 1n;
const maxInt248 = 2n ** (248n - 1n) - 1n;
const maxInt256 = 2n ** (256n - 1n) - 1n;
const minInt8 = -(2n ** (8n - 1n));
const minInt16 = -(2n ** (16n - 1n));
const minInt24 = -(2n ** (24n - 1n));
const minInt32 = -(2n ** (32n - 1n));
const minInt40 = -(2n ** (40n - 1n));
const minInt48 = -(2n ** (48n - 1n));
const minInt56 = -(2n ** (56n - 1n));
const minInt64 = -(2n ** (64n - 1n));
const minInt72 = -(2n ** (72n - 1n));
const minInt80 = -(2n ** (80n - 1n));
const minInt88 = -(2n ** (88n - 1n));
const minInt96 = -(2n ** (96n - 1n));
const minInt104 = -(2n ** (104n - 1n));
const minInt112 = -(2n ** (112n - 1n));
const minInt120 = -(2n ** (120n - 1n));
const minInt128 = -(2n ** (128n - 1n));
const minInt136 = -(2n ** (136n - 1n));
const minInt144 = -(2n ** (144n - 1n));
const minInt152 = -(2n ** (152n - 1n));
const minInt160 = -(2n ** (160n - 1n));
const minInt168 = -(2n ** (168n - 1n));
const minInt176 = -(2n ** (176n - 1n));
const minInt184 = -(2n ** (184n - 1n));
const minInt192 = -(2n ** (192n - 1n));
const minInt200 = -(2n ** (200n - 1n));
const minInt208 = -(2n ** (208n - 1n));
const minInt216 = -(2n ** (216n - 1n));
const minInt224 = -(2n ** (224n - 1n));
const minInt232 = -(2n ** (232n - 1n));
const minInt240 = -(2n ** (240n - 1n));
const minInt248 = -(2n ** (248n - 1n));
const minInt256 = -(2n ** (256n - 1n));
const maxUint8 = 2n ** 8n - 1n;
const maxUint16 = 2n ** 16n - 1n;
const maxUint24 = 2n ** 24n - 1n;
const maxUint32 = 2n ** 32n - 1n;
const maxUint40 = 2n ** 40n - 1n;
const maxUint48 = 2n ** 48n - 1n;
const maxUint56 = 2n ** 56n - 1n;
const maxUint64 = 2n ** 64n - 1n;
const maxUint72 = 2n ** 72n - 1n;
const maxUint80 = 2n ** 80n - 1n;
const maxUint88 = 2n ** 88n - 1n;
const maxUint96 = 2n ** 96n - 1n;
const maxUint104 = 2n ** 104n - 1n;
const maxUint112 = 2n ** 112n - 1n;
const maxUint120 = 2n ** 120n - 1n;
const maxUint128 = 2n ** 128n - 1n;
const maxUint136 = 2n ** 136n - 1n;
const maxUint144 = 2n ** 144n - 1n;
const maxUint152 = 2n ** 152n - 1n;
const maxUint160 = 2n ** 160n - 1n;
const maxUint168 = 2n ** 168n - 1n;
const maxUint176 = 2n ** 176n - 1n;
const maxUint184 = 2n ** 184n - 1n;
const maxUint192 = 2n ** 192n - 1n;
const maxUint200 = 2n ** 200n - 1n;
const maxUint208 = 2n ** 208n - 1n;
const maxUint216 = 2n ** 216n - 1n;
const maxUint224 = 2n ** 224n - 1n;
const maxUint232 = 2n ** 232n - 1n;
const maxUint240 = 2n ** 240n - 1n;
const maxUint248 = 2n ** 248n - 1n;
const maxUint256 = 2n ** 256n - 1n; //# sourceMappingURL=Solidity.js.map
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/Signature.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InvalidRError",
    ()=>InvalidRError,
    "InvalidSError",
    ()=>InvalidSError,
    "InvalidSerializedSizeError",
    ()=>InvalidSerializedSizeError,
    "InvalidVError",
    ()=>InvalidVError,
    "InvalidYParityError",
    ()=>InvalidYParityError,
    "MissingPropertiesError",
    ()=>MissingPropertiesError,
    "assert",
    ()=>assert,
    "extract",
    ()=>extract,
    "from",
    ()=>from,
    "fromBytes",
    ()=>fromBytes,
    "fromDerBytes",
    ()=>fromDerBytes,
    "fromDerHex",
    ()=>fromDerHex,
    "fromHex",
    ()=>fromHex,
    "fromLegacy",
    ()=>fromLegacy,
    "fromRpc",
    ()=>fromRpc,
    "fromTuple",
    ()=>fromTuple,
    "toBytes",
    ()=>toBytes,
    "toDerBytes",
    ()=>toDerBytes,
    "toDerHex",
    ()=>toDerHex,
    "toHex",
    ()=>toHex,
    "toLegacy",
    ()=>toLegacy,
    "toRpc",
    ()=>toRpc,
    "toTuple",
    ()=>toTuple,
    "vToYParity",
    ()=>vToYParity,
    "validate",
    ()=>validate,
    "yParityToV",
    ()=>yParityToV
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$secp256k1$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/@noble/curves/esm/secp256k1.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Bytes.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Errors.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Hex.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Json$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Json.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Solidity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Solidity.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
function assert(signature, options = {}) {
    const { recovered } = options;
    if (typeof signature.r === 'undefined') throw new MissingPropertiesError({
        signature
    });
    if (typeof signature.s === 'undefined') throw new MissingPropertiesError({
        signature
    });
    if (recovered && typeof signature.yParity === 'undefined') throw new MissingPropertiesError({
        signature
    });
    if (signature.r < 0n || signature.r > __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Solidity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["maxUint256"]) throw new InvalidRError({
        value: signature.r
    });
    if (signature.s < 0n || signature.s > __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Solidity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["maxUint256"]) throw new InvalidSError({
        value: signature.s
    });
    if (typeof signature.yParity === 'number' && signature.yParity !== 0 && signature.yParity !== 1) throw new InvalidYParityError({
        value: signature.yParity
    });
}
function fromBytes(signature) {
    return fromHex(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromBytes"](signature));
}
function fromHex(signature) {
    if (signature.length !== 130 && signature.length !== 132) throw new InvalidSerializedSizeError({
        signature
    });
    const r = BigInt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["slice"](signature, 0, 32));
    const s = BigInt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["slice"](signature, 32, 64));
    const yParity = (()=>{
        const yParity = Number(`0x${signature.slice(130)}`);
        if (Number.isNaN(yParity)) return undefined;
        try {
            return vToYParity(yParity);
        } catch  {
            throw new InvalidYParityError({
                value: yParity
            });
        }
    })();
    if (typeof yParity === 'undefined') return {
        r,
        s
    };
    return {
        r,
        s,
        yParity
    };
}
function extract(value) {
    if (typeof value.r === 'undefined') return undefined;
    if (typeof value.s === 'undefined') return undefined;
    return from(value);
}
function from(signature) {
    const signature_ = (()=>{
        if (typeof signature === 'string') return fromHex(signature);
        if (signature instanceof Uint8Array) return fromBytes(signature);
        if (typeof signature.r === 'string') return fromRpc(signature);
        if (signature.v) return fromLegacy(signature);
        return {
            r: signature.r,
            s: signature.s,
            ...typeof signature.yParity !== 'undefined' ? {
                yParity: signature.yParity
            } : {}
        };
    })();
    assert(signature_);
    return signature_;
}
function fromDerBytes(signature) {
    return fromDerHex(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromBytes"](signature));
}
function fromDerHex(signature) {
    const { r, s } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$secp256k1$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["secp256k1"].Signature.fromDER(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["from"](signature).slice(2));
    return {
        r,
        s
    };
}
function fromLegacy(signature) {
    return {
        r: signature.r,
        s: signature.s,
        yParity: vToYParity(signature.v)
    };
}
function fromRpc(signature) {
    const yParity = (()=>{
        const v = signature.v ? Number(signature.v) : undefined;
        let yParity = signature.yParity ? Number(signature.yParity) : undefined;
        if (typeof v === 'number' && typeof yParity !== 'number') yParity = vToYParity(v);
        if (typeof yParity !== 'number') throw new InvalidYParityError({
            value: signature.yParity
        });
        return yParity;
    })();
    return {
        r: BigInt(signature.r),
        s: BigInt(signature.s),
        yParity
    };
}
function fromTuple(tuple) {
    const [yParity, r, s] = tuple;
    return from({
        r: r === '0x' ? 0n : BigInt(r),
        s: s === '0x' ? 0n : BigInt(s),
        yParity: yParity === '0x' ? 0 : Number(yParity)
    });
}
function toBytes(signature) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromHex"](toHex(signature));
}
function toHex(signature) {
    assert(signature);
    const r = signature.r;
    const s = signature.s;
    const signature_ = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["concat"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromNumber"](r, {
        size: 32
    }), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromNumber"](s, {
        size: 32
    }), // If the signature is recovered, add the recovery byte to the signature.
    typeof signature.yParity === 'number' ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromNumber"](yParityToV(signature.yParity), {
        size: 1
    }) : '0x');
    return signature_;
}
function toDerBytes(signature) {
    const sig = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$secp256k1$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["secp256k1"].Signature(signature.r, signature.s);
    return sig.toDERRawBytes();
}
function toDerHex(signature) {
    const sig = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$secp256k1$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["secp256k1"].Signature(signature.r, signature.s);
    return `0x${sig.toDERHex()}`;
}
function toLegacy(signature) {
    return {
        r: signature.r,
        s: signature.s,
        v: yParityToV(signature.yParity)
    };
}
function toRpc(signature) {
    const { r, s, yParity } = signature;
    return {
        r: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromNumber"](r, {
            size: 32
        }),
        s: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromNumber"](s, {
            size: 32
        }),
        yParity: yParity === 0 ? '0x0' : '0x1'
    };
}
function toTuple(signature) {
    const { r, s, yParity } = signature;
    return [
        yParity ? '0x01' : '0x',
        r === 0n ? '0x' : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trimLeft"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromNumber"](r)),
        s === 0n ? '0x' : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trimLeft"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromNumber"](s))
    ];
}
function validate(signature, options = {}) {
    try {
        assert(signature, options);
        return true;
    } catch  {
        return false;
    }
}
function vToYParity(v) {
    if (v === 0 || v === 27) return 0;
    if (v === 1 || v === 28) return 1;
    if (v >= 35) return v % 2 === 0 ? 1 : 0;
    throw new InvalidVError({
        value: v
    });
}
function yParityToV(yParity) {
    if (yParity === 0) return 27;
    if (yParity === 1) return 28;
    throw new InvalidYParityError({
        value: yParity
    });
}
class InvalidSerializedSizeError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ signature }){
        super(`Value \`${signature}\` is an invalid signature size.`, {
            metaMessages: [
                'Expected: 64 bytes or 65 bytes.',
                `Received ${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["size"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["from"](signature))} bytes.`
            ]
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Signature.InvalidSerializedSizeError'
        });
    }
}
class MissingPropertiesError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ signature }){
        super(`Signature \`${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Json$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["stringify"](signature)}\` is missing either an \`r\`, \`s\`, or \`yParity\` property.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Signature.MissingPropertiesError'
        });
    }
}
class InvalidRError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ value }){
        super(`Value \`${value}\` is an invalid r value. r must be a positive integer less than 2^256.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Signature.InvalidRError'
        });
    }
}
class InvalidSError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ value }){
        super(`Value \`${value}\` is an invalid s value. s must be a positive integer less than 2^256.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Signature.InvalidSError'
        });
    }
}
class InvalidYParityError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ value }){
        super(`Value \`${value}\` is an invalid y-parity value. Y-parity must be 0 or 1.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Signature.InvalidYParityError'
        });
    }
}
class InvalidVError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ value }){
        super(`Value \`${value}\` is an invalid v value. v must be 27, 28 or >=35.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Signature.InvalidVError'
        });
    }
} //# sourceMappingURL=Signature.js.map
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/Signature.js [app-ssr] (ecmascript) <export * as Signature>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Signature",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Signature$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Signature$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Signature.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/Base64.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromBytes",
    ()=>fromBytes,
    "fromHex",
    ()=>fromHex,
    "fromString",
    ()=>fromString,
    "toBytes",
    ()=>toBytes,
    "toHex",
    ()=>toHex,
    "toString",
    ()=>toString
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Bytes.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Hex.js [app-ssr] (ecmascript)");
;
;
const encoder = /*#__PURE__*/ new TextEncoder();
const decoder = /*#__PURE__*/ new TextDecoder();
const integerToCharacter = /*#__PURE__*/ Object.fromEntries(Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/').map((a, i)=>[
        i,
        a.charCodeAt(0)
    ]));
const characterToInteger = /*#__PURE__*/ {
    ...Object.fromEntries(Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/').map((a, i)=>[
            a.charCodeAt(0),
            i
        ])),
    ['='.charCodeAt(0)]: 0,
    ['-'.charCodeAt(0)]: 62,
    ['_'.charCodeAt(0)]: 63
};
function fromBytes(value, options = {}) {
    const { pad = true, url = false } = options;
    const encoded = new Uint8Array(Math.ceil(value.length / 3) * 4);
    for(let i = 0, j = 0; j < value.length; i += 4, j += 3){
        const y = (value[j] << 16) + (value[j + 1] << 8) + (value[j + 2] | 0);
        encoded[i] = integerToCharacter[y >> 18];
        encoded[i + 1] = integerToCharacter[y >> 12 & 0x3f];
        encoded[i + 2] = integerToCharacter[y >> 6 & 0x3f];
        encoded[i + 3] = integerToCharacter[y & 0x3f];
    }
    const k = value.length % 3;
    const end = Math.floor(value.length / 3) * 4 + (k && k + 1);
    let base64 = decoder.decode(new Uint8Array(encoded.buffer, 0, end));
    if (pad && k === 1) base64 += '==';
    if (pad && k === 2) base64 += '=';
    if (url) base64 = base64.replaceAll('+', '-').replaceAll('/', '_');
    return base64;
}
function fromHex(value, options = {}) {
    return fromBytes(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromHex"](value), options);
}
function fromString(value, options = {}) {
    return fromBytes(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromString"](value), options);
}
function toBytes(value) {
    const base64 = value.replace(/=+$/, '');
    const size = base64.length;
    const decoded = new Uint8Array(size + 3);
    encoder.encodeInto(base64 + '===', decoded);
    for(let i = 0, j = 0; i < base64.length; i += 4, j += 3){
        const x = (characterToInteger[decoded[i]] << 18) + (characterToInteger[decoded[i + 1]] << 12) + (characterToInteger[decoded[i + 2]] << 6) + characterToInteger[decoded[i + 3]];
        decoded[j] = x >> 16;
        decoded[j + 1] = x >> 8 & 0xff;
        decoded[j + 2] = x & 0xff;
    }
    const decodedSize = (size >> 2) * 3 + (size % 4 && size % 4 - 1);
    return new Uint8Array(decoded.buffer, 0, decodedSize);
}
function toHex(value) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromBytes"](toBytes(value));
}
function toString(value) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toString"](toBytes(value));
} //# sourceMappingURL=Base64.js.map
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/Hash.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "keccak256",
    ()=>keccak256,
    "ripemd160",
    ()=>ripemd160,
    "sha256",
    ()=>sha256,
    "validate",
    ()=>validate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$ripemd160$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/node_modules/@noble/hashes/esm/ripemd160.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$sha3$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/node_modules/@noble/hashes/esm/sha3.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$sha256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/node_modules/@noble/hashes/esm/sha256.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Bytes.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Hex.js [app-ssr] (ecmascript)");
;
;
;
;
;
function keccak256(value, options = {}) {
    const { as = typeof value === 'string' ? 'Hex' : 'Bytes' } = options;
    const bytes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$sha3$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["keccak_256"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["from"](value));
    if (as === 'Bytes') return bytes;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromBytes"](bytes);
}
function ripemd160(value, options = {}) {
    const { as = typeof value === 'string' ? 'Hex' : 'Bytes' } = options;
    const bytes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$ripemd160$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ripemd160"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["from"](value));
    if (as === 'Bytes') return bytes;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromBytes"](bytes);
}
function sha256(value, options = {}) {
    const { as = typeof value === 'string' ? 'Hex' : 'Bytes' } = options;
    const bytes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$sha256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sha256"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["from"](value));
    if (as === 'Bytes') return bytes;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromBytes"](bytes);
}
function validate(value) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validate"](value) && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["size"](value) === 32;
} //# sourceMappingURL=Hash.js.map
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/internal/entropy.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extraEntropy",
    ()=>extraEntropy,
    "setExtraEntropy",
    ()=>setExtraEntropy
]);
let extraEntropy = false;
function setExtraEntropy(entropy) {
    extraEntropy = entropy;
} //# sourceMappingURL=entropy.js.map
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/P256.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getPublicKey",
    ()=>getPublicKey,
    "noble",
    ()=>noble,
    "randomPrivateKey",
    ()=>randomPrivateKey,
    "recoverPublicKey",
    ()=>recoverPublicKey,
    "sign",
    ()=>sign,
    "verify",
    ()=>verify
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$p256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/@noble/curves/esm/p256.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Bytes.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Hex.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$PublicKey$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/PublicKey.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$entropy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/internal/entropy.js [app-ssr] (ecmascript)");
;
;
;
;
;
const noble = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$p256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["secp256r1"];
function getPublicKey(options) {
    const { privateKey } = options;
    const point = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$p256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["secp256r1"].ProjectivePoint.fromPrivateKey(typeof privateKey === 'string' ? privateKey.slice(2) : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromBytes"](privateKey).slice(2));
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$PublicKey$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["from"](point);
}
function randomPrivateKey(options = {}) {
    const { as = 'Hex' } = options;
    const bytes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$p256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["secp256r1"].utils.randomPrivateKey();
    if (as === 'Hex') return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromBytes"](bytes);
    return bytes;
}
function recoverPublicKey(options) {
    const { payload, signature } = options;
    const { r, s, yParity } = signature;
    const signature_ = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$p256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["secp256r1"].Signature(BigInt(r), BigInt(s)).addRecoveryBit(yParity);
    const payload_ = payload instanceof Uint8Array ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromBytes"](payload) : payload;
    const point = signature_.recoverPublicKey(payload_.substring(2));
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$PublicKey$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["from"](point);
}
function sign(options) {
    const { extraEntropy = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$entropy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["extraEntropy"], hash, payload, privateKey } = options;
    const { r, s, recovery } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$p256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["secp256r1"].sign(payload instanceof Uint8Array ? payload : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromHex"](payload), privateKey instanceof Uint8Array ? privateKey : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromHex"](privateKey), {
        extraEntropy: typeof extraEntropy === 'boolean' ? extraEntropy : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["from"](extraEntropy).slice(2),
        lowS: true,
        ...hash ? {
            prehash: true
        } : {}
    });
    return {
        r,
        s,
        yParity: recovery
    };
}
function verify(options) {
    const { hash, payload, publicKey, signature } = options;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$p256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["secp256r1"].verify(signature, payload instanceof Uint8Array ? payload : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromHex"](payload), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$PublicKey$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toHex"](publicKey).substring(2), ...hash ? [
        {
            prehash: true,
            lowS: true
        }
    ] : []);
} //# sourceMappingURL=P256.js.map
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/internal/webauthn.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseAsn1Signature",
    ()=>parseAsn1Signature,
    "parseCredentialPublicKey",
    ()=>parseCredentialPublicKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$p256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/@noble/curves/esm/p256.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Hex.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$PublicKey$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/PublicKey.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$WebAuthnP256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/WebAuthnP256.js [app-ssr] (ecmascript)");
;
;
;
;
function parseAsn1Signature(bytes) {
    const r_start = bytes[4] === 0 ? 5 : 4;
    const r_end = r_start + 32;
    const s_start = bytes[r_end + 2] === 0 ? r_end + 3 : r_end + 2;
    const r = BigInt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromBytes"](bytes.slice(r_start, r_end)));
    const s = BigInt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromBytes"](bytes.slice(s_start)));
    return {
        r,
        s: s > __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$p256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["p256"].CURVE.n / 2n ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$p256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["p256"].CURVE.n - s : s
    };
}
async function parseCredentialPublicKey(response) {
    try {
        const publicKeyBuffer = response.getPublicKey();
        if (!publicKeyBuffer) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$WebAuthnP256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CredentialCreationFailedError"]();
        // Converting `publicKeyBuffer` throws when credential is created by 1Password Firefox Add-on
        const publicKeyBytes = new Uint8Array(publicKeyBuffer);
        const cryptoKey = await crypto.subtle.importKey('spki', new Uint8Array(publicKeyBytes), {
            name: 'ECDSA',
            namedCurve: 'P-256',
            hash: 'SHA-256'
        }, true, [
            'verify'
        ]);
        const publicKey = new Uint8Array(await crypto.subtle.exportKey('raw', cryptoKey));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$PublicKey$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["from"](publicKey);
    } catch (error) {
        // Fallback for 1Password Firefox Add-on restricts access to certain credential properties
        // so we need to use `attestationObject` to extract the public key.
        // https://github.com/passwordless-id/webauthn/issues/50#issuecomment-2072902094
        if (error.message !== 'Permission denied to access object') throw error;
        const data = new Uint8Array(response.attestationObject);
        const coordinateLength = 0x20;
        const cborPrefix = 0x58;
        const findStart = (key)=>{
            const coordinate = new Uint8Array([
                key,
                cborPrefix,
                coordinateLength
            ]);
            for(let i = 0; i < data.length - coordinate.length; i++)if (coordinate.every((byte, j)=>data[i + j] === byte)) return i + coordinate.length;
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$WebAuthnP256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CredentialCreationFailedError"]();
        };
        const xStart = findStart(0x21);
        const yStart = findStart(0x22);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$PublicKey$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["from"](new Uint8Array([
            0x04,
            ...data.slice(xStart, xStart + coordinateLength),
            ...data.slice(yStart, yStart + coordinateLength)
        ]));
    }
} //# sourceMappingURL=webauthn.js.map
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/WebAuthnP256.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CredentialCreationFailedError",
    ()=>CredentialCreationFailedError,
    "CredentialRequestFailedError",
    ()=>CredentialRequestFailedError,
    "createChallenge",
    ()=>createChallenge,
    "createCredential",
    ()=>createCredential,
    "getAuthenticatorData",
    ()=>getAuthenticatorData,
    "getClientDataJSON",
    ()=>getClientDataJSON,
    "getCredentialCreationOptions",
    ()=>getCredentialCreationOptions,
    "getCredentialRequestOptions",
    ()=>getCredentialRequestOptions,
    "getSignPayload",
    ()=>getSignPayload,
    "sign",
    ()=>sign,
    "verify",
    ()=>verify
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Base64$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Base64.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Bytes.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Errors.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hash$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Hash.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Hex.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$P256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/P256.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$webauthn$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/internal/webauthn.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
const createChallenge = Uint8Array.from([
    105,
    171,
    180,
    181,
    160,
    222,
    75,
    198,
    42,
    42,
    32,
    31,
    141,
    37,
    186,
    233
]);
async function createCredential(options) {
    const { createFn = window.navigator.credentials.create.bind(window.navigator.credentials), ...rest } = options;
    const creationOptions = getCredentialCreationOptions(rest);
    try {
        const credential = await createFn(creationOptions);
        if (!credential) throw new CredentialCreationFailedError();
        const response = credential.response;
        const publicKey = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$webauthn$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseCredentialPublicKey"](response);
        return {
            id: credential.id,
            publicKey,
            raw: credential
        };
    } catch (error) {
        throw new CredentialCreationFailedError({
            cause: error
        });
    }
}
function getAuthenticatorData(options = {}) {
    const { flag = 5, rpId = window.location.hostname, signCount = 0 } = options;
    const rpIdHash = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hash$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sha256"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromString"](rpId));
    const flag_bytes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromNumber"](flag, {
        size: 1
    });
    const signCount_bytes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromNumber"](signCount, {
        size: 4
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["concat"](rpIdHash, flag_bytes, signCount_bytes);
}
function getClientDataJSON(options) {
    const { challenge, crossOrigin = false, extraClientData, origin = window.location.origin } = options;
    return JSON.stringify({
        type: 'webauthn.get',
        challenge: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Base64$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromHex"](challenge, {
            url: true,
            pad: false
        }),
        origin,
        crossOrigin,
        ...extraClientData
    });
}
function getCredentialCreationOptions(options) {
    const { attestation = 'none', authenticatorSelection = {
        residentKey: 'preferred',
        requireResidentKey: false,
        userVerification: 'required'
    }, challenge = createChallenge, excludeCredentialIds, name: name_, rp = {
        id: window.location.hostname,
        name: window.document.title
    }, user, extensions } = options;
    const name = user?.name ?? name_;
    return {
        publicKey: {
            attestation,
            authenticatorSelection,
            challenge,
            ...excludeCredentialIds ? {
                excludeCredentials: excludeCredentialIds?.map((id)=>({
                        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Base64$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toBytes"](id),
                        type: 'public-key'
                    }))
            } : {},
            pubKeyCredParams: [
                {
                    type: 'public-key',
                    alg: -7
                }
            ],
            rp,
            user: {
                id: user?.id ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hash$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["keccak256"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromString"](name), {
                    as: 'Bytes'
                }),
                name,
                displayName: user?.displayName ?? name
            },
            extensions
        }
    };
}
function getCredentialRequestOptions(options) {
    const { credentialId, challenge, rpId = window.location.hostname, userVerification = 'required' } = options;
    return {
        publicKey: {
            ...credentialId ? {
                allowCredentials: [
                    {
                        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Base64$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toBytes"](credentialId),
                        type: 'public-key'
                    }
                ]
            } : {},
            challenge: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromHex"](challenge),
            rpId,
            userVerification
        }
    };
}
function getSignPayload(options) {
    const { challenge, crossOrigin, extraClientData, flag, origin, rpId, signCount, userVerification = 'required' } = options;
    const authenticatorData = getAuthenticatorData({
        flag,
        rpId,
        signCount
    });
    const clientDataJSON = getClientDataJSON({
        challenge,
        crossOrigin,
        extraClientData,
        origin
    });
    const clientDataJSONHash = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hash$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sha256"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromString"](clientDataJSON));
    const challengeIndex = clientDataJSON.indexOf('"challenge"');
    const typeIndex = clientDataJSON.indexOf('"type"');
    const metadata = {
        authenticatorData,
        clientDataJSON,
        challengeIndex,
        typeIndex,
        userVerificationRequired: userVerification === 'required'
    };
    const payload = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["concat"](authenticatorData, clientDataJSONHash);
    return {
        metadata,
        payload
    };
}
async function sign(options) {
    const { getFn = window.navigator.credentials.get.bind(window.navigator.credentials), ...rest } = options;
    const requestOptions = getCredentialRequestOptions(rest);
    try {
        const credential = await getFn(requestOptions);
        if (!credential) throw new CredentialRequestFailedError();
        const response = credential.response;
        const clientDataJSON = String.fromCharCode(...new Uint8Array(response.clientDataJSON));
        const challengeIndex = clientDataJSON.indexOf('"challenge"');
        const typeIndex = clientDataJSON.indexOf('"type"');
        const signature = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$internal$2f$webauthn$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseAsn1Signature"](new Uint8Array(response.signature));
        return {
            metadata: {
                authenticatorData: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromBytes"](new Uint8Array(response.authenticatorData)),
                clientDataJSON,
                challengeIndex,
                typeIndex,
                userVerificationRequired: requestOptions.publicKey.userVerification === 'required'
            },
            signature,
            raw: credential
        };
    } catch (error) {
        throw new CredentialRequestFailedError({
            cause: error
        });
    }
}
function verify(options) {
    const { challenge, hash = true, metadata, publicKey, signature } = options;
    const { authenticatorData, challengeIndex, clientDataJSON, typeIndex, userVerificationRequired } = metadata;
    const authenticatorDataBytes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromHex"](authenticatorData);
    // Check length of `authenticatorData`.
    if (authenticatorDataBytes.length < 37) return false;
    const flag = authenticatorDataBytes[32];
    // Verify that the UP bit of the flags in authData is set.
    if ((flag & 0x01) !== 0x01) return false;
    // If user verification was determined to be required, verify that
    // the UV bit of the flags in authData is set. Otherwise, ignore the
    // value of the UV flag.
    if (userVerificationRequired && (flag & 0x04) !== 0x04) return false;
    // If the BE bit of the flags in authData is not set, verify that
    // the BS bit is not set.
    if ((flag & 0x08) !== 0x08 && (flag & 0x10) === 0x10) return false;
    // Check that response is for an authentication assertion
    const type = '"type":"webauthn.get"';
    if (type !== clientDataJSON.slice(Number(typeIndex), type.length + 1)) return false;
    // Check that hash is in the clientDataJSON.
    const match = clientDataJSON.slice(Number(challengeIndex)).match(/^"challenge":"(.*?)"/);
    if (!match) return false;
    // Validate the challenge in the clientDataJSON.
    const [_, challenge_extracted] = match;
    if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromBytes"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Base64$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toBytes"](challenge_extracted)) !== challenge) return false;
    const clientDataJSONHash = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Hash$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sha256"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromString"](clientDataJSON), {
        as: 'Bytes'
    });
    const payload = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["concat"](authenticatorDataBytes, clientDataJSONHash);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$P256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["verify"]({
        hash,
        payload,
        publicKey,
        signature
    });
}
class CredentialCreationFailedError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ cause } = {}){
        super('Failed to create credential.', {
            cause
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'WebAuthnP256.CredentialCreationFailedError'
        });
    }
}
class CredentialRequestFailedError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ cause } = {}){
        super('Failed to request credential.', {
            cause
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'WebAuthnP256.CredentialRequestFailedError'
        });
    }
} //# sourceMappingURL=WebAuthnP256.js.map
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/WebAuthnP256.js [app-ssr] (ecmascript) <export * as WebAuthnP256>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WebAuthnP256",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$WebAuthnP256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$WebAuthnP256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/WebAuthnP256.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/WebCryptoP256.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createKeyPair",
    ()=>createKeyPair,
    "sign",
    ()=>sign,
    "verify",
    ()=>verify
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$p256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/@noble/curves/esm/p256.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/Bytes.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$PublicKey$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/PublicKey.js [app-ssr] (ecmascript)");
;
;
;
async function createKeyPair(options = {}) {
    const { extractable = false } = options;
    const keypair = await globalThis.crypto.subtle.generateKey({
        name: 'ECDSA',
        namedCurve: 'P-256'
    }, extractable, [
        'sign',
        'verify'
    ]);
    const publicKey_raw = await globalThis.crypto.subtle.exportKey('raw', keypair.publicKey);
    const publicKey = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$PublicKey$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["from"](new Uint8Array(publicKey_raw));
    return {
        privateKey: keypair.privateKey,
        publicKey
    };
}
async function sign(options) {
    const { payload, privateKey } = options;
    const signature = await globalThis.crypto.subtle.sign({
        name: 'ECDSA',
        hash: 'SHA-256'
    }, privateKey, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["from"](payload));
    const signature_bytes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromArray"](new Uint8Array(signature));
    const r = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toBigInt"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["slice"](signature_bytes, 0, 32));
    let s = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toBigInt"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["slice"](signature_bytes, 32, 64));
    if (s > __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$p256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["p256"].CURVE.n / 2n) s = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$p256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["p256"].CURVE.n - s;
    return {
        r,
        s
    };
}
async function verify(options) {
    const { payload, signature } = options;
    const publicKey = await globalThis.crypto.subtle.importKey('raw', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$PublicKey$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toBytes"](options.publicKey), {
        name: 'ECDSA',
        namedCurve: 'P-256'
    }, true, [
        'verify'
    ]);
    return await globalThis.crypto.subtle.verify({
        name: 'ECDSA',
        hash: 'SHA-256'
    }, publicKey, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["concat"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromNumber"](signature.r), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromNumber"](signature.s)), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$Bytes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["from"](payload));
} //# sourceMappingURL=WebCryptoP256.js.map
}),
"[project]/node_modules/wagmi/node_modules/ox/_esm/core/WebCryptoP256.js [app-ssr] (ecmascript) <export * as WebCryptoP256>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WebCryptoP256",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$WebCryptoP256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$ox$2f$_esm$2f$core$2f$WebCryptoP256$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/ox/_esm/core/WebCryptoP256.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/wagmi/node_modules/idb-keyval/dist/index.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clear",
    ()=>clear,
    "createStore",
    ()=>createStore,
    "del",
    ()=>del,
    "delMany",
    ()=>delMany,
    "entries",
    ()=>entries,
    "get",
    ()=>get,
    "getMany",
    ()=>getMany,
    "keys",
    ()=>keys,
    "promisifyRequest",
    ()=>promisifyRequest,
    "set",
    ()=>set,
    "setMany",
    ()=>setMany,
    "update",
    ()=>update,
    "values",
    ()=>values
]);
function promisifyRequest(request) {
    return new Promise((resolve, reject)=>{
        // @ts-ignore - file size hacks
        request.oncomplete = request.onsuccess = ()=>resolve(request.result);
        // @ts-ignore - file size hacks
        request.onabort = request.onerror = ()=>reject(request.error);
    });
}
function createStore(dbName, storeName) {
    const request = indexedDB.open(dbName);
    request.onupgradeneeded = ()=>request.result.createObjectStore(storeName);
    const dbp = promisifyRequest(request);
    return (txMode, callback)=>dbp.then((db)=>callback(db.transaction(storeName, txMode).objectStore(storeName)));
}
let defaultGetStoreFunc;
function defaultGetStore() {
    if (!defaultGetStoreFunc) {
        defaultGetStoreFunc = createStore('keyval-store', 'keyval');
    }
    return defaultGetStoreFunc;
}
/**
 * Get a value by its key.
 *
 * @param key
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */ function get(key, customStore = defaultGetStore()) {
    return customStore('readonly', (store)=>promisifyRequest(store.get(key)));
}
/**
 * Set a value with a key.
 *
 * @param key
 * @param value
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */ function set(key, value, customStore = defaultGetStore()) {
    return customStore('readwrite', (store)=>{
        store.put(value, key);
        return promisifyRequest(store.transaction);
    });
}
/**
 * Set multiple values at once. This is faster than calling set() multiple times.
 * It's also atomic – if one of the pairs can't be added, none will be added.
 *
 * @param entries Array of entries, where each entry is an array of `[key, value]`.
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */ function setMany(entries, customStore = defaultGetStore()) {
    return customStore('readwrite', (store)=>{
        entries.forEach((entry)=>store.put(entry[1], entry[0]));
        return promisifyRequest(store.transaction);
    });
}
/**
 * Get multiple values by their keys
 *
 * @param keys
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */ function getMany(keys, customStore = defaultGetStore()) {
    return customStore('readonly', (store)=>Promise.all(keys.map((key)=>promisifyRequest(store.get(key)))));
}
/**
 * Update a value. This lets you see the old value and update it as an atomic operation.
 *
 * @param key
 * @param updater A callback that takes the old value and returns a new value.
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */ function update(key, updater, customStore = defaultGetStore()) {
    return customStore('readwrite', (store)=>// Need to create the promise manually.
        // If I try to chain promises, the transaction closes in browsers
        // that use a promise polyfill (IE10/11).
        new Promise((resolve, reject)=>{
            store.get(key).onsuccess = function() {
                try {
                    store.put(updater(this.result), key);
                    resolve(promisifyRequest(store.transaction));
                } catch (err) {
                    reject(err);
                }
            };
        }));
}
/**
 * Delete a particular key from the store.
 *
 * @param key
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */ function del(key, customStore = defaultGetStore()) {
    return customStore('readwrite', (store)=>{
        store.delete(key);
        return promisifyRequest(store.transaction);
    });
}
/**
 * Delete multiple keys at once.
 *
 * @param keys List of keys to delete.
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */ function delMany(keys, customStore = defaultGetStore()) {
    return customStore('readwrite', (store)=>{
        keys.forEach((key)=>store.delete(key));
        return promisifyRequest(store.transaction);
    });
}
/**
 * Clear all values in the store.
 *
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */ function clear(customStore = defaultGetStore()) {
    return customStore('readwrite', (store)=>{
        store.clear();
        return promisifyRequest(store.transaction);
    });
}
function eachCursor(store, callback) {
    store.openCursor().onsuccess = function() {
        if (!this.result) return;
        callback(this.result);
        this.result.continue();
    };
    return promisifyRequest(store.transaction);
}
/**
 * Get all keys in the store.
 *
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */ function keys(customStore = defaultGetStore()) {
    return customStore('readonly', (store)=>{
        // Fast path for modern browsers
        if (store.getAllKeys) {
            return promisifyRequest(store.getAllKeys());
        }
        const items = [];
        return eachCursor(store, (cursor)=>items.push(cursor.key)).then(()=>items);
    });
}
/**
 * Get all values in the store.
 *
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */ function values(customStore = defaultGetStore()) {
    return customStore('readonly', (store)=>{
        // Fast path for modern browsers
        if (store.getAll) {
            return promisifyRequest(store.getAll());
        }
        const items = [];
        return eachCursor(store, (cursor)=>items.push(cursor.value)).then(()=>items);
    });
}
/**
 * Get all entries in the store. Each entry is an array of `[key, value]`.
 *
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */ function entries(customStore = defaultGetStore()) {
    return customStore('readonly', (store)=>{
        // Fast path for modern browsers
        // (although, hopefully we'll get a simpler path some day)
        if (store.getAll && store.getAllKeys) {
            return Promise.all([
                promisifyRequest(store.getAllKeys()),
                promisifyRequest(store.getAll())
            ]).then(([keys, values])=>keys.map((key, i)=>[
                        key,
                        values[i]
                    ]));
        }
        const items = [];
        return customStore('readonly', (store)=>eachCursor(store, (cursor)=>items.push([
                    cursor.key,
                    cursor.value
                ])).then(()=>items));
    });
}
;
}),
"[project]/node_modules/wagmi/node_modules/axios-retry/dist/esm/index.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_OPTIONS",
    ()=>DEFAULT_OPTIONS,
    "default",
    ()=>__TURBOPACK__default__export__,
    "exponentialDelay",
    ()=>exponentialDelay,
    "isIdempotentRequestError",
    ()=>isIdempotentRequestError,
    "isNetworkError",
    ()=>isNetworkError,
    "isNetworkOrIdempotentRequestError",
    ()=>isNetworkOrIdempotentRequestError,
    "isRetryableError",
    ()=>isRetryableError,
    "isSafeRequestError",
    ()=>isSafeRequestError,
    "linearDelay",
    ()=>linearDelay,
    "namespace",
    ()=>namespace,
    "retryAfter",
    ()=>retryAfter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$is$2d$retry$2d$allowed$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/is-retry-allowed/index.js [app-ssr] (ecmascript)");
;
const namespace = 'axios-retry';
function isNetworkError(error) {
    const CODE_EXCLUDE_LIST = [
        'ERR_CANCELED',
        'ECONNABORTED'
    ];
    if (error.response) {
        return false;
    }
    if (!error.code) {
        return false;
    }
    // Prevents retrying timed out & cancelled requests
    if (CODE_EXCLUDE_LIST.includes(error.code)) {
        return false;
    }
    // Prevents retrying unsafe errors
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$is$2d$retry$2d$allowed$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(error);
}
const SAFE_HTTP_METHODS = [
    'get',
    'head',
    'options'
];
const IDEMPOTENT_HTTP_METHODS = SAFE_HTTP_METHODS.concat([
    'put',
    'delete'
]);
function isRetryableError(error) {
    return error.code !== 'ECONNABORTED' && (!error.response || error.response.status === 429 || error.response.status >= 500 && error.response.status <= 599);
}
function isSafeRequestError(error) {
    if (!error.config?.method) {
        // Cannot determine if the request can be retried
        return false;
    }
    return isRetryableError(error) && SAFE_HTTP_METHODS.indexOf(error.config.method) !== -1;
}
function isIdempotentRequestError(error) {
    if (!error.config?.method) {
        // Cannot determine if the request can be retried
        return false;
    }
    return isRetryableError(error) && IDEMPOTENT_HTTP_METHODS.indexOf(error.config.method) !== -1;
}
function isNetworkOrIdempotentRequestError(error) {
    return isNetworkError(error) || isIdempotentRequestError(error);
}
function retryAfter(error = undefined) {
    const retryAfterHeader = error?.response?.headers['retry-after'];
    if (!retryAfterHeader) {
        return 0;
    }
    // if the retry after header is a number, convert it to milliseconds
    let retryAfterMs = (Number(retryAfterHeader) || 0) * 1000;
    // If the retry after header is a date, get the number of milliseconds until that date
    if (retryAfterMs === 0) {
        retryAfterMs = (new Date(retryAfterHeader).valueOf() || 0) - Date.now();
    }
    return Math.max(0, retryAfterMs);
}
function noDelay(_retryNumber = 0, error = undefined) {
    return Math.max(0, retryAfter(error));
}
function exponentialDelay(retryNumber = 0, error = undefined, delayFactor = 100) {
    const calculatedDelay = 2 ** retryNumber * delayFactor;
    const delay = Math.max(calculatedDelay, retryAfter(error));
    const randomSum = delay * 0.2 * Math.random(); // 0-20% of the delay
    return delay + randomSum;
}
function linearDelay(delayFactor = 100) {
    return (retryNumber = 0, error = undefined)=>{
        const delay = retryNumber * delayFactor;
        return Math.max(delay, retryAfter(error));
    };
}
const DEFAULT_OPTIONS = {
    retries: 3,
    retryCondition: isNetworkOrIdempotentRequestError,
    retryDelay: noDelay,
    shouldResetTimeout: false,
    onRetry: ()=>{},
    onMaxRetryTimesExceeded: ()=>{},
    validateResponse: null
};
function getRequestOptions(config, defaultOptions) {
    return {
        ...DEFAULT_OPTIONS,
        ...defaultOptions,
        ...config[namespace]
    };
}
function setCurrentState(config, defaultOptions, resetLastRequestTime = false) {
    const currentState = getRequestOptions(config, defaultOptions || {});
    currentState.retryCount = currentState.retryCount || 0;
    if (!currentState.lastRequestTime || resetLastRequestTime) {
        currentState.lastRequestTime = Date.now();
    }
    config[namespace] = currentState;
    return currentState;
}
function fixConfig(axiosInstance, config) {
    // @ts-ignore
    if (axiosInstance.defaults.agent === config.agent) {
        // @ts-ignore
        delete config.agent;
    }
    if (axiosInstance.defaults.httpAgent === config.httpAgent) {
        delete config.httpAgent;
    }
    if (axiosInstance.defaults.httpsAgent === config.httpsAgent) {
        delete config.httpsAgent;
    }
}
async function shouldRetry(currentState, error) {
    const { retries, retryCondition } = currentState;
    const shouldRetryOrPromise = (currentState.retryCount || 0) < retries && retryCondition(error);
    // This could be a promise
    if (typeof shouldRetryOrPromise === 'object') {
        try {
            const shouldRetryPromiseResult = await shouldRetryOrPromise;
            // keep return true unless shouldRetryPromiseResult return false for compatibility
            return shouldRetryPromiseResult !== false;
        } catch (_err) {
            return false;
        }
    }
    return shouldRetryOrPromise;
}
async function handleRetry(axiosInstance, currentState, error, config) {
    currentState.retryCount += 1;
    const { retryDelay, shouldResetTimeout, onRetry } = currentState;
    const delay = retryDelay(currentState.retryCount, error);
    // Axios fails merging this configuration to the default configuration because it has an issue
    // with circular structures: https://github.com/mzabriskie/axios/issues/370
    fixConfig(axiosInstance, config);
    if (!shouldResetTimeout && config.timeout && currentState.lastRequestTime) {
        const lastRequestDuration = Date.now() - currentState.lastRequestTime;
        const timeout = config.timeout - lastRequestDuration - delay;
        if (timeout <= 0) {
            return Promise.reject(error);
        }
        config.timeout = timeout;
    }
    config.transformRequest = [
        (data)=>data
    ];
    await onRetry(currentState.retryCount, error, config);
    if (config.signal?.aborted) {
        return Promise.resolve(axiosInstance(config));
    }
    return new Promise((resolve)=>{
        const abortListener = ()=>{
            clearTimeout(timeout);
            resolve(axiosInstance(config));
        };
        const timeout = setTimeout(()=>{
            resolve(axiosInstance(config));
            if (config.signal?.removeEventListener) {
                config.signal.removeEventListener('abort', abortListener);
            }
        }, delay);
        if (config.signal?.addEventListener) {
            config.signal.addEventListener('abort', abortListener, {
                once: true
            });
        }
    });
}
async function handleMaxRetryTimesExceeded(currentState, error) {
    if (currentState.retryCount >= currentState.retries) await currentState.onMaxRetryTimesExceeded(error, currentState.retryCount);
}
const axiosRetry = (axiosInstance, defaultOptions)=>{
    const requestInterceptorId = axiosInstance.interceptors.request.use((config)=>{
        setCurrentState(config, defaultOptions, true);
        if (config[namespace]?.validateResponse) {
            // by setting this, all HTTP responses will be go through the error interceptor first
            config.validateStatus = ()=>false;
        }
        return config;
    });
    const responseInterceptorId = axiosInstance.interceptors.response.use(null, async (error)=>{
        const { config } = error;
        // If we have no information to retry the request
        if (!config) {
            return Promise.reject(error);
        }
        const currentState = setCurrentState(config, defaultOptions);
        if (error.response && currentState.validateResponse?.(error.response)) {
            // no issue with response
            return error.response;
        }
        if (await shouldRetry(currentState, error)) {
            return handleRetry(axiosInstance, currentState, error, config);
        }
        await handleMaxRetryTimesExceeded(currentState, error);
        return Promise.reject(error);
    });
    return {
        requestInterceptorId,
        responseInterceptorId
    };
};
// Compatibility with CommonJS
axiosRetry.isNetworkError = isNetworkError;
axiosRetry.isSafeRequestError = isSafeRequestError;
axiosRetry.isIdempotentRequestError = isIdempotentRequestError;
axiosRetry.isNetworkOrIdempotentRequestError = isNetworkOrIdempotentRequestError;
axiosRetry.exponentialDelay = exponentialDelay;
axiosRetry.linearDelay = linearDelay;
axiosRetry.isRetryableError = isRetryableError;
const __TURBOPACK__default__export__ = axiosRetry;
}),
"[project]/node_modules/wagmi/node_modules/@solana/codecs-core/dist/index.node.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addCodecSentinel",
    ()=>addCodecSentinel,
    "addCodecSizePrefix",
    ()=>addCodecSizePrefix,
    "addDecoderSentinel",
    ()=>addDecoderSentinel,
    "addDecoderSizePrefix",
    ()=>addDecoderSizePrefix,
    "addEncoderSentinel",
    ()=>addEncoderSentinel,
    "addEncoderSizePrefix",
    ()=>addEncoderSizePrefix,
    "assertByteArrayHasEnoughBytesForCodec",
    ()=>assertByteArrayHasEnoughBytesForCodec,
    "assertByteArrayIsNotEmptyForCodec",
    ()=>assertByteArrayIsNotEmptyForCodec,
    "assertByteArrayOffsetIsNotOutOfRange",
    ()=>assertByteArrayOffsetIsNotOutOfRange,
    "assertIsFixedSize",
    ()=>assertIsFixedSize,
    "assertIsVariableSize",
    ()=>assertIsVariableSize,
    "combineCodec",
    ()=>combineCodec,
    "containsBytes",
    ()=>containsBytes,
    "createCodec",
    ()=>createCodec,
    "createDecoder",
    ()=>createDecoder,
    "createEncoder",
    ()=>createEncoder,
    "fixBytes",
    ()=>fixBytes,
    "fixCodecSize",
    ()=>fixCodecSize,
    "fixDecoderSize",
    ()=>fixDecoderSize,
    "fixEncoderSize",
    ()=>fixEncoderSize,
    "getEncodedSize",
    ()=>getEncodedSize,
    "isFixedSize",
    ()=>isFixedSize,
    "isVariableSize",
    ()=>isVariableSize,
    "mergeBytes",
    ()=>mergeBytes,
    "offsetCodec",
    ()=>offsetCodec,
    "offsetDecoder",
    ()=>offsetDecoder,
    "offsetEncoder",
    ()=>offsetEncoder,
    "padBytes",
    ()=>padBytes,
    "padLeftCodec",
    ()=>padLeftCodec,
    "padLeftDecoder",
    ()=>padLeftDecoder,
    "padLeftEncoder",
    ()=>padLeftEncoder,
    "padRightCodec",
    ()=>padRightCodec,
    "padRightDecoder",
    ()=>padRightDecoder,
    "padRightEncoder",
    ()=>padRightEncoder,
    "resizeCodec",
    ()=>resizeCodec,
    "resizeDecoder",
    ()=>resizeDecoder,
    "resizeEncoder",
    ()=>resizeEncoder,
    "reverseCodec",
    ()=>reverseCodec,
    "reverseDecoder",
    ()=>reverseDecoder,
    "reverseEncoder",
    ()=>reverseEncoder,
    "transformCodec",
    ()=>transformCodec,
    "transformDecoder",
    ()=>transformDecoder,
    "transformEncoder",
    ()=>transformEncoder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/@solana/codecs-core/node_modules/@solana/errors/dist/index.node.mjs [app-ssr] (ecmascript)");
;
// src/add-codec-sentinel.ts
// src/bytes.ts
var mergeBytes = (byteArrays)=>{
    const nonEmptyByteArrays = byteArrays.filter((arr)=>arr.length);
    if (nonEmptyByteArrays.length === 0) {
        return byteArrays.length ? byteArrays[0] : new Uint8Array();
    }
    if (nonEmptyByteArrays.length === 1) {
        return nonEmptyByteArrays[0];
    }
    const totalLength = nonEmptyByteArrays.reduce((total, arr)=>total + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    nonEmptyByteArrays.forEach((arr)=>{
        result.set(arr, offset);
        offset += arr.length;
    });
    return result;
};
var padBytes = (bytes, length)=>{
    if (bytes.length >= length) return bytes;
    const paddedBytes = new Uint8Array(length).fill(0);
    paddedBytes.set(bytes);
    return paddedBytes;
};
var fixBytes = (bytes, length)=>padBytes(bytes.length <= length ? bytes : bytes.slice(0, length), length);
function containsBytes(data, bytes, offset) {
    const slice = offset === 0 && data.length === bytes.length ? data : data.slice(offset, offset + bytes.length);
    if (slice.length !== bytes.length) return false;
    return bytes.every((b, i)=>b === slice[i]);
}
function getEncodedSize(value, encoder) {
    return "fixedSize" in encoder ? encoder.fixedSize : encoder.getSizeFromValue(value);
}
function createEncoder(encoder) {
    return Object.freeze({
        ...encoder,
        encode: (value)=>{
            const bytes = new Uint8Array(getEncodedSize(value, encoder));
            encoder.write(value, bytes, 0);
            return bytes;
        }
    });
}
function createDecoder(decoder) {
    return Object.freeze({
        ...decoder,
        decode: (bytes, offset = 0)=>decoder.read(bytes, offset)[0]
    });
}
function createCodec(codec) {
    return Object.freeze({
        ...codec,
        decode: (bytes, offset = 0)=>codec.read(bytes, offset)[0],
        encode: (value)=>{
            const bytes = new Uint8Array(getEncodedSize(value, codec));
            codec.write(value, bytes, 0);
            return bytes;
        }
    });
}
function isFixedSize(codec) {
    return "fixedSize" in codec && typeof codec.fixedSize === "number";
}
function assertIsFixedSize(codec) {
    if (!isFixedSize(codec)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__EXPECTED_FIXED_LENGTH"]);
    }
}
function isVariableSize(codec) {
    return !isFixedSize(codec);
}
function assertIsVariableSize(codec) {
    if (!isVariableSize(codec)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__EXPECTED_VARIABLE_LENGTH"]);
    }
}
function combineCodec(encoder, decoder) {
    if (isFixedSize(encoder) !== isFixedSize(decoder)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__ENCODER_DECODER_SIZE_COMPATIBILITY_MISMATCH"]);
    }
    if (isFixedSize(encoder) && isFixedSize(decoder) && encoder.fixedSize !== decoder.fixedSize) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__ENCODER_DECODER_FIXED_SIZE_MISMATCH"], {
            decoderFixedSize: decoder.fixedSize,
            encoderFixedSize: encoder.fixedSize
        });
    }
    if (!isFixedSize(encoder) && !isFixedSize(decoder) && encoder.maxSize !== decoder.maxSize) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__ENCODER_DECODER_MAX_SIZE_MISMATCH"], {
            decoderMaxSize: decoder.maxSize,
            encoderMaxSize: encoder.maxSize
        });
    }
    return {
        ...decoder,
        ...encoder,
        decode: decoder.decode,
        encode: encoder.encode,
        read: decoder.read,
        write: encoder.write
    };
}
// src/add-codec-sentinel.ts
function addEncoderSentinel(encoder, sentinel) {
    const write = (value, bytes, offset)=>{
        const encoderBytes = encoder.encode(value);
        if (findSentinelIndex(encoderBytes, sentinel) >= 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__ENCODED_BYTES_MUST_NOT_INCLUDE_SENTINEL"], {
                encodedBytes: encoderBytes,
                hexEncodedBytes: hexBytes(encoderBytes),
                hexSentinel: hexBytes(sentinel),
                sentinel
            });
        }
        bytes.set(encoderBytes, offset);
        offset += encoderBytes.length;
        bytes.set(sentinel, offset);
        offset += sentinel.length;
        return offset;
    };
    if (isFixedSize(encoder)) {
        return createEncoder({
            ...encoder,
            fixedSize: encoder.fixedSize + sentinel.length,
            write
        });
    }
    return createEncoder({
        ...encoder,
        ...encoder.maxSize != null ? {
            maxSize: encoder.maxSize + sentinel.length
        } : {},
        getSizeFromValue: (value)=>encoder.getSizeFromValue(value) + sentinel.length,
        write
    });
}
function addDecoderSentinel(decoder, sentinel) {
    const read = (bytes, offset)=>{
        const candidateBytes = offset === 0 ? bytes : bytes.slice(offset);
        const sentinelIndex = findSentinelIndex(candidateBytes, sentinel);
        if (sentinelIndex === -1) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__SENTINEL_MISSING_IN_DECODED_BYTES"], {
                decodedBytes: candidateBytes,
                hexDecodedBytes: hexBytes(candidateBytes),
                hexSentinel: hexBytes(sentinel),
                sentinel
            });
        }
        const preSentinelBytes = candidateBytes.slice(0, sentinelIndex);
        return [
            decoder.decode(preSentinelBytes),
            offset + preSentinelBytes.length + sentinel.length
        ];
    };
    if (isFixedSize(decoder)) {
        return createDecoder({
            ...decoder,
            fixedSize: decoder.fixedSize + sentinel.length,
            read
        });
    }
    return createDecoder({
        ...decoder,
        ...decoder.maxSize != null ? {
            maxSize: decoder.maxSize + sentinel.length
        } : {},
        read
    });
}
function addCodecSentinel(codec, sentinel) {
    return combineCodec(addEncoderSentinel(codec, sentinel), addDecoderSentinel(codec, sentinel));
}
function findSentinelIndex(bytes, sentinel) {
    return bytes.findIndex((byte, index, arr)=>{
        if (sentinel.length === 1) return byte === sentinel[0];
        return containsBytes(arr, sentinel, index);
    });
}
function hexBytes(bytes) {
    return bytes.reduce((str, byte)=>str + byte.toString(16).padStart(2, "0"), "");
}
function assertByteArrayIsNotEmptyForCodec(codecDescription, bytes, offset = 0) {
    if (bytes.length - offset <= 0) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__CANNOT_DECODE_EMPTY_BYTE_ARRAY"], {
            codecDescription
        });
    }
}
function assertByteArrayHasEnoughBytesForCodec(codecDescription, expected, bytes, offset = 0) {
    const bytesLength = bytes.length - offset;
    if (bytesLength < expected) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH"], {
            bytesLength,
            codecDescription,
            expected
        });
    }
}
function assertByteArrayOffsetIsNotOutOfRange(codecDescription, offset, bytesLength) {
    if (offset < 0 || offset > bytesLength) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__OFFSET_OUT_OF_RANGE"], {
            bytesLength,
            codecDescription,
            offset
        });
    }
}
// src/add-codec-size-prefix.ts
function addEncoderSizePrefix(encoder, prefix) {
    const write = (value, bytes, offset)=>{
        const encoderBytes = encoder.encode(value);
        offset = prefix.write(encoderBytes.length, bytes, offset);
        bytes.set(encoderBytes, offset);
        return offset + encoderBytes.length;
    };
    if (isFixedSize(prefix) && isFixedSize(encoder)) {
        return createEncoder({
            ...encoder,
            fixedSize: prefix.fixedSize + encoder.fixedSize,
            write
        });
    }
    const prefixMaxSize = isFixedSize(prefix) ? prefix.fixedSize : prefix.maxSize ?? null;
    const encoderMaxSize = isFixedSize(encoder) ? encoder.fixedSize : encoder.maxSize ?? null;
    const maxSize = prefixMaxSize !== null && encoderMaxSize !== null ? prefixMaxSize + encoderMaxSize : null;
    return createEncoder({
        ...encoder,
        ...maxSize !== null ? {
            maxSize
        } : {},
        getSizeFromValue: (value)=>{
            const encoderSize = getEncodedSize(value, encoder);
            return getEncodedSize(encoderSize, prefix) + encoderSize;
        },
        write
    });
}
function addDecoderSizePrefix(decoder, prefix) {
    const read = (bytes, offset)=>{
        const [bigintSize, decoderOffset] = prefix.read(bytes, offset);
        const size = Number(bigintSize);
        offset = decoderOffset;
        if (offset > 0 || bytes.length > size) {
            bytes = bytes.slice(offset, offset + size);
        }
        assertByteArrayHasEnoughBytesForCodec("addDecoderSizePrefix", size, bytes);
        return [
            decoder.decode(bytes),
            offset + size
        ];
    };
    if (isFixedSize(prefix) && isFixedSize(decoder)) {
        return createDecoder({
            ...decoder,
            fixedSize: prefix.fixedSize + decoder.fixedSize,
            read
        });
    }
    const prefixMaxSize = isFixedSize(prefix) ? prefix.fixedSize : prefix.maxSize ?? null;
    const decoderMaxSize = isFixedSize(decoder) ? decoder.fixedSize : decoder.maxSize ?? null;
    const maxSize = prefixMaxSize !== null && decoderMaxSize !== null ? prefixMaxSize + decoderMaxSize : null;
    return createDecoder({
        ...decoder,
        ...maxSize !== null ? {
            maxSize
        } : {},
        read
    });
}
function addCodecSizePrefix(codec, prefix) {
    return combineCodec(addEncoderSizePrefix(codec, prefix), addDecoderSizePrefix(codec, prefix));
}
// src/fix-codec-size.ts
function fixEncoderSize(encoder, fixedBytes) {
    return createEncoder({
        fixedSize: fixedBytes,
        write: (value, bytes, offset)=>{
            const variableByteArray = encoder.encode(value);
            const fixedByteArray = variableByteArray.length > fixedBytes ? variableByteArray.slice(0, fixedBytes) : variableByteArray;
            bytes.set(fixedByteArray, offset);
            return offset + fixedBytes;
        }
    });
}
function fixDecoderSize(decoder, fixedBytes) {
    return createDecoder({
        fixedSize: fixedBytes,
        read: (bytes, offset)=>{
            assertByteArrayHasEnoughBytesForCodec("fixCodecSize", fixedBytes, bytes, offset);
            if (offset > 0 || bytes.length > fixedBytes) {
                bytes = bytes.slice(offset, offset + fixedBytes);
            }
            if (isFixedSize(decoder)) {
                bytes = fixBytes(bytes, decoder.fixedSize);
            }
            const [value] = decoder.read(bytes, 0);
            return [
                value,
                offset + fixedBytes
            ];
        }
    });
}
function fixCodecSize(codec, fixedBytes) {
    return combineCodec(fixEncoderSize(codec, fixedBytes), fixDecoderSize(codec, fixedBytes));
}
// src/offset-codec.ts
function offsetEncoder(encoder, config) {
    return createEncoder({
        ...encoder,
        write: (value, bytes, preOffset)=>{
            const wrapBytes = (offset)=>modulo(offset, bytes.length);
            const newPreOffset = config.preOffset ? config.preOffset({
                bytes,
                preOffset,
                wrapBytes
            }) : preOffset;
            assertByteArrayOffsetIsNotOutOfRange("offsetEncoder", newPreOffset, bytes.length);
            const postOffset = encoder.write(value, bytes, newPreOffset);
            const newPostOffset = config.postOffset ? config.postOffset({
                bytes,
                newPreOffset,
                postOffset,
                preOffset,
                wrapBytes
            }) : postOffset;
            assertByteArrayOffsetIsNotOutOfRange("offsetEncoder", newPostOffset, bytes.length);
            return newPostOffset;
        }
    });
}
function offsetDecoder(decoder, config) {
    return createDecoder({
        ...decoder,
        read: (bytes, preOffset)=>{
            const wrapBytes = (offset)=>modulo(offset, bytes.length);
            const newPreOffset = config.preOffset ? config.preOffset({
                bytes,
                preOffset,
                wrapBytes
            }) : preOffset;
            assertByteArrayOffsetIsNotOutOfRange("offsetDecoder", newPreOffset, bytes.length);
            const [value, postOffset] = decoder.read(bytes, newPreOffset);
            const newPostOffset = config.postOffset ? config.postOffset({
                bytes,
                newPreOffset,
                postOffset,
                preOffset,
                wrapBytes
            }) : postOffset;
            assertByteArrayOffsetIsNotOutOfRange("offsetDecoder", newPostOffset, bytes.length);
            return [
                value,
                newPostOffset
            ];
        }
    });
}
function offsetCodec(codec, config) {
    return combineCodec(offsetEncoder(codec, config), offsetDecoder(codec, config));
}
function modulo(dividend, divisor) {
    if (divisor === 0) return 0;
    return (dividend % divisor + divisor) % divisor;
}
function resizeEncoder(encoder, resize) {
    if (isFixedSize(encoder)) {
        const fixedSize = resize(encoder.fixedSize);
        if (fixedSize < 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__EXPECTED_POSITIVE_BYTE_LENGTH"], {
                bytesLength: fixedSize,
                codecDescription: "resizeEncoder"
            });
        }
        return createEncoder({
            ...encoder,
            fixedSize
        });
    }
    return createEncoder({
        ...encoder,
        getSizeFromValue: (value)=>{
            const newSize = resize(encoder.getSizeFromValue(value));
            if (newSize < 0) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__EXPECTED_POSITIVE_BYTE_LENGTH"], {
                    bytesLength: newSize,
                    codecDescription: "resizeEncoder"
                });
            }
            return newSize;
        }
    });
}
function resizeDecoder(decoder, resize) {
    if (isFixedSize(decoder)) {
        const fixedSize = resize(decoder.fixedSize);
        if (fixedSize < 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__EXPECTED_POSITIVE_BYTE_LENGTH"], {
                bytesLength: fixedSize,
                codecDescription: "resizeDecoder"
            });
        }
        return createDecoder({
            ...decoder,
            fixedSize
        });
    }
    return decoder;
}
function resizeCodec(codec, resize) {
    return combineCodec(resizeEncoder(codec, resize), resizeDecoder(codec, resize));
}
// src/pad-codec.ts
function padLeftEncoder(encoder, offset) {
    return offsetEncoder(resizeEncoder(encoder, (size)=>size + offset), {
        preOffset: ({ preOffset })=>preOffset + offset
    });
}
function padRightEncoder(encoder, offset) {
    return offsetEncoder(resizeEncoder(encoder, (size)=>size + offset), {
        postOffset: ({ postOffset })=>postOffset + offset
    });
}
function padLeftDecoder(decoder, offset) {
    return offsetDecoder(resizeDecoder(decoder, (size)=>size + offset), {
        preOffset: ({ preOffset })=>preOffset + offset
    });
}
function padRightDecoder(decoder, offset) {
    return offsetDecoder(resizeDecoder(decoder, (size)=>size + offset), {
        postOffset: ({ postOffset })=>postOffset + offset
    });
}
function padLeftCodec(codec, offset) {
    return combineCodec(padLeftEncoder(codec, offset), padLeftDecoder(codec, offset));
}
function padRightCodec(codec, offset) {
    return combineCodec(padRightEncoder(codec, offset), padRightDecoder(codec, offset));
}
// src/reverse-codec.ts
function copySourceToTargetInReverse(source, target_WILL_MUTATE, sourceOffset, sourceLength, targetOffset = 0) {
    while(sourceOffset < --sourceLength){
        const leftValue = source[sourceOffset];
        target_WILL_MUTATE[sourceOffset + targetOffset] = source[sourceLength];
        target_WILL_MUTATE[sourceLength + targetOffset] = leftValue;
        sourceOffset++;
    }
    if (sourceOffset === sourceLength) {
        target_WILL_MUTATE[sourceOffset + targetOffset] = source[sourceOffset];
    }
}
function reverseEncoder(encoder) {
    assertIsFixedSize(encoder);
    return createEncoder({
        ...encoder,
        write: (value, bytes, offset)=>{
            const newOffset = encoder.write(value, bytes, offset);
            copySourceToTargetInReverse(bytes, bytes, offset, offset + encoder.fixedSize);
            return newOffset;
        }
    });
}
function reverseDecoder(decoder) {
    assertIsFixedSize(decoder);
    return createDecoder({
        ...decoder,
        read: (bytes, offset)=>{
            const reversedBytes = bytes.slice();
            copySourceToTargetInReverse(bytes, reversedBytes, offset, offset + decoder.fixedSize);
            return decoder.read(reversedBytes, offset);
        }
    });
}
function reverseCodec(codec) {
    return combineCodec(reverseEncoder(codec), reverseDecoder(codec));
}
// src/transform-codec.ts
function transformEncoder(encoder, unmap) {
    return createEncoder({
        ...isVariableSize(encoder) ? {
            ...encoder,
            getSizeFromValue: (value)=>encoder.getSizeFromValue(unmap(value))
        } : encoder,
        write: (value, bytes, offset)=>encoder.write(unmap(value), bytes, offset)
    });
}
function transformDecoder(decoder, map) {
    return createDecoder({
        ...decoder,
        read: (bytes, offset)=>{
            const [value, newOffset] = decoder.read(bytes, offset);
            return [
                map(value, bytes, offset),
                newOffset
            ];
        }
    });
}
function transformCodec(codec, unmap, map) {
    return createCodec({
        ...transformEncoder(codec, unmap),
        read: map ? transformDecoder(codec, map).read : codec.read
    });
}
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/node_modules/wagmi/node_modules/@solana/codecs-numbers/dist/index.node.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Endian",
    ()=>Endian,
    "assertNumberIsBetweenForCodec",
    ()=>assertNumberIsBetweenForCodec,
    "getF32Codec",
    ()=>getF32Codec,
    "getF32Decoder",
    ()=>getF32Decoder,
    "getF32Encoder",
    ()=>getF32Encoder,
    "getF64Codec",
    ()=>getF64Codec,
    "getF64Decoder",
    ()=>getF64Decoder,
    "getF64Encoder",
    ()=>getF64Encoder,
    "getI128Codec",
    ()=>getI128Codec,
    "getI128Decoder",
    ()=>getI128Decoder,
    "getI128Encoder",
    ()=>getI128Encoder,
    "getI16Codec",
    ()=>getI16Codec,
    "getI16Decoder",
    ()=>getI16Decoder,
    "getI16Encoder",
    ()=>getI16Encoder,
    "getI32Codec",
    ()=>getI32Codec,
    "getI32Decoder",
    ()=>getI32Decoder,
    "getI32Encoder",
    ()=>getI32Encoder,
    "getI64Codec",
    ()=>getI64Codec,
    "getI64Decoder",
    ()=>getI64Decoder,
    "getI64Encoder",
    ()=>getI64Encoder,
    "getI8Codec",
    ()=>getI8Codec,
    "getI8Decoder",
    ()=>getI8Decoder,
    "getI8Encoder",
    ()=>getI8Encoder,
    "getShortU16Codec",
    ()=>getShortU16Codec,
    "getShortU16Decoder",
    ()=>getShortU16Decoder,
    "getShortU16Encoder",
    ()=>getShortU16Encoder,
    "getU128Codec",
    ()=>getU128Codec,
    "getU128Decoder",
    ()=>getU128Decoder,
    "getU128Encoder",
    ()=>getU128Encoder,
    "getU16Codec",
    ()=>getU16Codec,
    "getU16Decoder",
    ()=>getU16Decoder,
    "getU16Encoder",
    ()=>getU16Encoder,
    "getU32Codec",
    ()=>getU32Codec,
    "getU32Decoder",
    ()=>getU32Decoder,
    "getU32Encoder",
    ()=>getU32Encoder,
    "getU64Codec",
    ()=>getU64Codec,
    "getU64Decoder",
    ()=>getU64Decoder,
    "getU64Encoder",
    ()=>getU64Encoder,
    "getU8Codec",
    ()=>getU8Codec,
    "getU8Decoder",
    ()=>getU8Decoder,
    "getU8Encoder",
    ()=>getU8Encoder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/@solana/codecs-numbers/node_modules/@solana/errors/dist/index.node.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/@solana/codecs-core/dist/index.node.mjs [app-ssr] (ecmascript)");
;
;
// src/assertions.ts
function assertNumberIsBetweenForCodec(codecDescription, min, max, value) {
    if (value < min || value > max) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SolanaError"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$node_modules$2f40$solana$2f$errors$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SOLANA_ERROR__CODECS__NUMBER_OUT_OF_RANGE"], {
            codecDescription,
            max,
            min,
            value
        });
    }
}
// src/common.ts
var Endian = /* @__PURE__ */ ((Endian2)=>{
    Endian2[Endian2["Little"] = 0] = "Little";
    Endian2[Endian2["Big"] = 1] = "Big";
    return Endian2;
})(Endian || {});
function isLittleEndian(config) {
    return config?.endian === 1 /* Big */  ? false : true;
}
function numberEncoderFactory(input) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createEncoder"])({
        fixedSize: input.size,
        write (value, bytes, offset) {
            if (input.range) {
                assertNumberIsBetweenForCodec(input.name, input.range[0], input.range[1], value);
            }
            const arrayBuffer = new ArrayBuffer(input.size);
            input.set(new DataView(arrayBuffer), value, isLittleEndian(input.config));
            bytes.set(new Uint8Array(arrayBuffer), offset);
            return offset + input.size;
        }
    });
}
function numberDecoderFactory(input) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createDecoder"])({
        fixedSize: input.size,
        read (bytes, offset = 0) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assertByteArrayIsNotEmptyForCodec"])(input.name, bytes, offset);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assertByteArrayHasEnoughBytesForCodec"])(input.name, input.size, bytes, offset);
            const view = new DataView(toArrayBuffer(bytes, offset, input.size));
            return [
                input.get(view, isLittleEndian(input.config)),
                offset + input.size
            ];
        }
    });
}
function toArrayBuffer(bytes, offset, length) {
    const bytesOffset = bytes.byteOffset + (offset ?? 0);
    const bytesLength = length ?? bytes.byteLength;
    return bytes.buffer.slice(bytesOffset, bytesOffset + bytesLength);
}
// src/f32.ts
var getF32Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "f32",
        set: (view, value, le)=>view.setFloat32(0, Number(value), le),
        size: 4
    });
var getF32Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getFloat32(0, le),
        name: "f32",
        size: 4
    });
var getF32Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getF32Encoder(config), getF32Decoder(config));
var getF64Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "f64",
        set: (view, value, le)=>view.setFloat64(0, Number(value), le),
        size: 8
    });
var getF64Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getFloat64(0, le),
        name: "f64",
        size: 8
    });
var getF64Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getF64Encoder(config), getF64Decoder(config));
var getI128Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "i128",
        range: [
            -BigInt("0x7fffffffffffffffffffffffffffffff") - 1n,
            BigInt("0x7fffffffffffffffffffffffffffffff")
        ],
        set: (view, value, le)=>{
            const leftOffset = le ? 8 : 0;
            const rightOffset = le ? 0 : 8;
            const rightMask = 0xffffffffffffffffn;
            view.setBigInt64(leftOffset, BigInt(value) >> 64n, le);
            view.setBigUint64(rightOffset, BigInt(value) & rightMask, le);
        },
        size: 16
    });
var getI128Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>{
            const leftOffset = le ? 8 : 0;
            const rightOffset = le ? 0 : 8;
            const left = view.getBigInt64(leftOffset, le);
            const right = view.getBigUint64(rightOffset, le);
            return (left << 64n) + right;
        },
        name: "i128",
        size: 16
    });
var getI128Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getI128Encoder(config), getI128Decoder(config));
var getI16Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "i16",
        range: [
            -Number("0x7fff") - 1,
            Number("0x7fff")
        ],
        set: (view, value, le)=>view.setInt16(0, Number(value), le),
        size: 2
    });
var getI16Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getInt16(0, le),
        name: "i16",
        size: 2
    });
var getI16Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getI16Encoder(config), getI16Decoder(config));
var getI32Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "i32",
        range: [
            -Number("0x7fffffff") - 1,
            Number("0x7fffffff")
        ],
        set: (view, value, le)=>view.setInt32(0, Number(value), le),
        size: 4
    });
var getI32Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getInt32(0, le),
        name: "i32",
        size: 4
    });
var getI32Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getI32Encoder(config), getI32Decoder(config));
var getI64Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "i64",
        range: [
            -BigInt("0x7fffffffffffffff") - 1n,
            BigInt("0x7fffffffffffffff")
        ],
        set: (view, value, le)=>view.setBigInt64(0, BigInt(value), le),
        size: 8
    });
var getI64Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getBigInt64(0, le),
        name: "i64",
        size: 8
    });
var getI64Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getI64Encoder(config), getI64Decoder(config));
var getI8Encoder = ()=>numberEncoderFactory({
        name: "i8",
        range: [
            -Number("0x7f") - 1,
            Number("0x7f")
        ],
        set: (view, value)=>view.setInt8(0, Number(value)),
        size: 1
    });
var getI8Decoder = ()=>numberDecoderFactory({
        get: (view)=>view.getInt8(0),
        name: "i8",
        size: 1
    });
var getI8Codec = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getI8Encoder(), getI8Decoder());
var getShortU16Encoder = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createEncoder"])({
        getSizeFromValue: (value)=>{
            if (value <= 127) return 1;
            if (value <= 16383) return 2;
            return 3;
        },
        maxSize: 3,
        write: (value, bytes, offset)=>{
            assertNumberIsBetweenForCodec("shortU16", 0, 65535, value);
            const shortU16Bytes = [
                0
            ];
            for(let ii = 0;; ii += 1){
                const alignedValue = Number(value) >> ii * 7;
                if (alignedValue === 0) {
                    break;
                }
                const nextSevenBits = 127 & alignedValue;
                shortU16Bytes[ii] = nextSevenBits;
                if (ii > 0) {
                    shortU16Bytes[ii - 1] |= 128;
                }
            }
            bytes.set(shortU16Bytes, offset);
            return offset + shortU16Bytes.length;
        }
    });
var getShortU16Decoder = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createDecoder"])({
        maxSize: 3,
        read: (bytes, offset)=>{
            let value = 0;
            let byteCount = 0;
            while(++byteCount){
                const byteIndex = byteCount - 1;
                const currentByte = bytes[offset + byteIndex];
                const nextSevenBits = 127 & currentByte;
                value |= nextSevenBits << byteIndex * 7;
                if ((currentByte & 128) === 0) {
                    break;
                }
            }
            return [
                value,
                offset + byteCount
            ];
        }
    });
var getShortU16Codec = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getShortU16Encoder(), getShortU16Decoder());
var getU128Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "u128",
        range: [
            0n,
            BigInt("0xffffffffffffffffffffffffffffffff")
        ],
        set: (view, value, le)=>{
            const leftOffset = le ? 8 : 0;
            const rightOffset = le ? 0 : 8;
            const rightMask = 0xffffffffffffffffn;
            view.setBigUint64(leftOffset, BigInt(value) >> 64n, le);
            view.setBigUint64(rightOffset, BigInt(value) & rightMask, le);
        },
        size: 16
    });
var getU128Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>{
            const leftOffset = le ? 8 : 0;
            const rightOffset = le ? 0 : 8;
            const left = view.getBigUint64(leftOffset, le);
            const right = view.getBigUint64(rightOffset, le);
            return (left << 64n) + right;
        },
        name: "u128",
        size: 16
    });
var getU128Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getU128Encoder(config), getU128Decoder(config));
var getU16Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "u16",
        range: [
            0,
            Number("0xffff")
        ],
        set: (view, value, le)=>view.setUint16(0, Number(value), le),
        size: 2
    });
var getU16Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getUint16(0, le),
        name: "u16",
        size: 2
    });
var getU16Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getU16Encoder(config), getU16Decoder(config));
var getU32Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "u32",
        range: [
            0,
            Number("0xffffffff")
        ],
        set: (view, value, le)=>view.setUint32(0, Number(value), le),
        size: 4
    });
var getU32Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getUint32(0, le),
        name: "u32",
        size: 4
    });
var getU32Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getU32Encoder(config), getU32Decoder(config));
var getU64Encoder = (config = {})=>numberEncoderFactory({
        config,
        name: "u64",
        range: [
            0n,
            BigInt("0xffffffffffffffff")
        ],
        set: (view, value, le)=>view.setBigUint64(0, BigInt(value), le),
        size: 8
    });
var getU64Decoder = (config = {})=>numberDecoderFactory({
        config,
        get: (view, le)=>view.getBigUint64(0, le),
        name: "u64",
        size: 8
    });
var getU64Codec = (config = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getU64Encoder(config), getU64Decoder(config));
var getU8Encoder = ()=>numberEncoderFactory({
        name: "u8",
        range: [
            0,
            Number("0xff")
        ],
        set: (view, value)=>view.setUint8(0, Number(value)),
        size: 1
    });
var getU8Decoder = ()=>numberDecoderFactory({
        get: (view)=>view.getUint8(0),
        name: "u8",
        size: 1
    });
var getU8Codec = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getU8Encoder(), getU8Decoder());
;
 //# sourceMappingURL=index.node.mjs.map
 //# sourceMappingURL=index.node.mjs.map
}),
"[project]/node_modules/wagmi/node_modules/abitype/dist/esm/regex.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// TODO: This looks cool. Need to check the performance of `new RegExp` versus defined inline though.
// https://twitter.com/GabrielVergnaud/status/1622906834343366657
__turbopack_context__.s([
    "bytesRegex",
    ()=>bytesRegex,
    "execTyped",
    ()=>execTyped,
    "integerRegex",
    ()=>integerRegex,
    "isTupleRegex",
    ()=>isTupleRegex
]);
function execTyped(regex, string) {
    const match = regex.exec(string);
    return match?.groups;
}
const bytesRegex = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
const integerRegex = /^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
const isTupleRegex = /^\(.+?\).*?$/; //# sourceMappingURL=regex.js.map
}),
"[project]/node_modules/wagmi/node_modules/abitype/dist/esm/version.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "version",
    ()=>version
]);
const version = '1.0.6'; //# sourceMappingURL=version.js.map
}),
"[project]/node_modules/wagmi/node_modules/abitype/dist/esm/errors.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseError",
    ()=>BaseError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$version$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/abitype/dist/esm/version.js [app-ssr] (ecmascript)");
;
class BaseError extends Error {
    constructor(shortMessage, args = {}){
        const details = args.cause instanceof BaseError ? args.cause.details : args.cause?.message ? args.cause.message : args.details;
        const docsPath = args.cause instanceof BaseError ? args.cause.docsPath || args.docsPath : args.docsPath;
        const message = [
            shortMessage || 'An error occurred.',
            '',
            ...args.metaMessages ? [
                ...args.metaMessages,
                ''
            ] : [],
            ...docsPath ? [
                `Docs: https://abitype.dev${docsPath}`
            ] : [],
            ...details ? [
                `Details: ${details}`
            ] : [],
            `Version: abitype@${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$version$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["version"]}`
        ].join('\n');
        super(message);
        Object.defineProperty(this, "details", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "docsPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "metaMessages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "shortMessage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiTypeError'
        });
        if (args.cause) this.cause = args.cause;
        this.details = details;
        this.docsPath = docsPath;
        this.metaMessages = args.metaMessages;
        this.shortMessage = shortMessage;
    }
} //# sourceMappingURL=errors.js.map
}),
"[project]/node_modules/wagmi/node_modules/abitype/dist/esm/human-readable/errors/abiItem.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InvalidAbiItemError",
    ()=>InvalidAbiItemError,
    "UnknownSolidityTypeError",
    ()=>UnknownSolidityTypeError,
    "UnknownTypeError",
    ()=>UnknownTypeError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/abitype/dist/esm/errors.js [app-ssr] (ecmascript)");
;
class InvalidAbiItemError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ signature }){
        super('Failed to parse ABI item.', {
            details: `parseAbiItem(${JSON.stringify(signature, null, 2)})`,
            docsPath: '/api/human#parseabiitem-1'
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidAbiItemError'
        });
    }
}
class UnknownTypeError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ type }){
        super('Unknown type.', {
            metaMessages: [
                `Type "${type}" is not a valid ABI type. Perhaps you forgot to include a struct signature?`
            ]
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'UnknownTypeError'
        });
    }
}
class UnknownSolidityTypeError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ type }){
        super('Unknown type.', {
            metaMessages: [
                `Type "${type}" is not a valid ABI type.`
            ]
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'UnknownSolidityTypeError'
        });
    }
} //# sourceMappingURL=abiItem.js.map
}),
"[project]/node_modules/wagmi/node_modules/abitype/dist/esm/human-readable/errors/abiParameter.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InvalidAbiParameterError",
    ()=>InvalidAbiParameterError,
    "InvalidAbiParametersError",
    ()=>InvalidAbiParametersError,
    "InvalidAbiTypeParameterError",
    ()=>InvalidAbiTypeParameterError,
    "InvalidFunctionModifierError",
    ()=>InvalidFunctionModifierError,
    "InvalidModifierError",
    ()=>InvalidModifierError,
    "InvalidParameterError",
    ()=>InvalidParameterError,
    "SolidityProtectedKeywordError",
    ()=>SolidityProtectedKeywordError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/abitype/dist/esm/errors.js [app-ssr] (ecmascript)");
;
class InvalidAbiParameterError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ param }){
        super('Failed to parse ABI parameter.', {
            details: `parseAbiParameter(${JSON.stringify(param, null, 2)})`,
            docsPath: '/api/human#parseabiparameter-1'
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidAbiParameterError'
        });
    }
}
class InvalidAbiParametersError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ params }){
        super('Failed to parse ABI parameters.', {
            details: `parseAbiParameters(${JSON.stringify(params, null, 2)})`,
            docsPath: '/api/human#parseabiparameters-1'
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidAbiParametersError'
        });
    }
}
class InvalidParameterError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ param }){
        super('Invalid ABI parameter.', {
            details: param
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidParameterError'
        });
    }
}
class SolidityProtectedKeywordError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ param, name }){
        super('Invalid ABI parameter.', {
            details: param,
            metaMessages: [
                `"${name}" is a protected Solidity keyword. More info: https://docs.soliditylang.org/en/latest/cheatsheet.html`
            ]
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'SolidityProtectedKeywordError'
        });
    }
}
class InvalidModifierError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ param, type, modifier }){
        super('Invalid ABI parameter.', {
            details: param,
            metaMessages: [
                `Modifier "${modifier}" not allowed${type ? ` in "${type}" type` : ''}.`
            ]
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidModifierError'
        });
    }
}
class InvalidFunctionModifierError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ param, type, modifier }){
        super('Invalid ABI parameter.', {
            details: param,
            metaMessages: [
                `Modifier "${modifier}" not allowed${type ? ` in "${type}" type` : ''}.`,
                `Data location can only be specified for array, struct, or mapping types, but "${modifier}" was given.`
            ]
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidFunctionModifierError'
        });
    }
}
class InvalidAbiTypeParameterError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ abiParameter }){
        super('Invalid ABI parameter.', {
            details: JSON.stringify(abiParameter, null, 2),
            metaMessages: [
                'ABI parameter type is invalid.'
            ]
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidAbiTypeParameterError'
        });
    }
} //# sourceMappingURL=abiParameter.js.map
}),
"[project]/node_modules/wagmi/node_modules/abitype/dist/esm/human-readable/errors/signature.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InvalidSignatureError",
    ()=>InvalidSignatureError,
    "InvalidStructSignatureError",
    ()=>InvalidStructSignatureError,
    "UnknownSignatureError",
    ()=>UnknownSignatureError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/abitype/dist/esm/errors.js [app-ssr] (ecmascript)");
;
class InvalidSignatureError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ signature, type }){
        super(`Invalid ${type} signature.`, {
            details: signature
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidSignatureError'
        });
    }
}
class UnknownSignatureError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ signature }){
        super('Unknown signature.', {
            details: signature
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'UnknownSignatureError'
        });
    }
}
class InvalidStructSignatureError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ signature }){
        super('Invalid struct signature.', {
            details: signature,
            metaMessages: [
                'No properties exist.'
            ]
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidStructSignatureError'
        });
    }
} //# sourceMappingURL=signature.js.map
}),
"[project]/node_modules/wagmi/node_modules/abitype/dist/esm/human-readable/errors/splitParameters.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InvalidParenthesisError",
    ()=>InvalidParenthesisError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/abitype/dist/esm/errors.js [app-ssr] (ecmascript)");
;
class InvalidParenthesisError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseError"] {
    constructor({ current, depth }){
        super('Unbalanced parentheses.', {
            metaMessages: [
                `"${current.trim()}" has too many ${depth > 0 ? 'opening' : 'closing'} parentheses.`
            ],
            details: `Depth "${depth}"`
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidParenthesisError'
        });
    }
} //# sourceMappingURL=splitParameters.js.map
}),
"[project]/node_modules/wagmi/node_modules/abitype/dist/esm/human-readable/runtime/cache.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Gets {@link parameterCache} cache key namespaced by {@link type}. This prevents parameters from being accessible to types that don't allow them (e.g. `string indexed foo` not allowed outside of `type: 'event'`).
 * @param param ABI parameter string
 * @param type ABI parameter type
 * @returns Cache key for {@link parameterCache}
 */ __turbopack_context__.s([
    "getParameterCacheKey",
    ()=>getParameterCacheKey,
    "parameterCache",
    ()=>parameterCache
]);
function getParameterCacheKey(param, type) {
    if (type) return `${type}:${param}`;
    return param;
}
const parameterCache = new Map([
    // Unnamed
    [
        'address',
        {
            type: 'address'
        }
    ],
    [
        'bool',
        {
            type: 'bool'
        }
    ],
    [
        'bytes',
        {
            type: 'bytes'
        }
    ],
    [
        'bytes32',
        {
            type: 'bytes32'
        }
    ],
    [
        'int',
        {
            type: 'int256'
        }
    ],
    [
        'int256',
        {
            type: 'int256'
        }
    ],
    [
        'string',
        {
            type: 'string'
        }
    ],
    [
        'uint',
        {
            type: 'uint256'
        }
    ],
    [
        'uint8',
        {
            type: 'uint8'
        }
    ],
    [
        'uint16',
        {
            type: 'uint16'
        }
    ],
    [
        'uint24',
        {
            type: 'uint24'
        }
    ],
    [
        'uint32',
        {
            type: 'uint32'
        }
    ],
    [
        'uint64',
        {
            type: 'uint64'
        }
    ],
    [
        'uint96',
        {
            type: 'uint96'
        }
    ],
    [
        'uint112',
        {
            type: 'uint112'
        }
    ],
    [
        'uint160',
        {
            type: 'uint160'
        }
    ],
    [
        'uint192',
        {
            type: 'uint192'
        }
    ],
    [
        'uint256',
        {
            type: 'uint256'
        }
    ],
    // Named
    [
        'address owner',
        {
            type: 'address',
            name: 'owner'
        }
    ],
    [
        'address to',
        {
            type: 'address',
            name: 'to'
        }
    ],
    [
        'bool approved',
        {
            type: 'bool',
            name: 'approved'
        }
    ],
    [
        'bytes _data',
        {
            type: 'bytes',
            name: '_data'
        }
    ],
    [
        'bytes data',
        {
            type: 'bytes',
            name: 'data'
        }
    ],
    [
        'bytes signature',
        {
            type: 'bytes',
            name: 'signature'
        }
    ],
    [
        'bytes32 hash',
        {
            type: 'bytes32',
            name: 'hash'
        }
    ],
    [
        'bytes32 r',
        {
            type: 'bytes32',
            name: 'r'
        }
    ],
    [
        'bytes32 root',
        {
            type: 'bytes32',
            name: 'root'
        }
    ],
    [
        'bytes32 s',
        {
            type: 'bytes32',
            name: 's'
        }
    ],
    [
        'string name',
        {
            type: 'string',
            name: 'name'
        }
    ],
    [
        'string symbol',
        {
            type: 'string',
            name: 'symbol'
        }
    ],
    [
        'string tokenURI',
        {
            type: 'string',
            name: 'tokenURI'
        }
    ],
    [
        'uint tokenId',
        {
            type: 'uint256',
            name: 'tokenId'
        }
    ],
    [
        'uint8 v',
        {
            type: 'uint8',
            name: 'v'
        }
    ],
    [
        'uint256 balance',
        {
            type: 'uint256',
            name: 'balance'
        }
    ],
    [
        'uint256 tokenId',
        {
            type: 'uint256',
            name: 'tokenId'
        }
    ],
    [
        'uint256 value',
        {
            type: 'uint256',
            name: 'value'
        }
    ],
    // Indexed
    [
        'event:address indexed from',
        {
            type: 'address',
            name: 'from',
            indexed: true
        }
    ],
    [
        'event:address indexed to',
        {
            type: 'address',
            name: 'to',
            indexed: true
        }
    ],
    [
        'event:uint indexed tokenId',
        {
            type: 'uint256',
            name: 'tokenId',
            indexed: true
        }
    ],
    [
        'event:uint256 indexed tokenId',
        {
            type: 'uint256',
            name: 'tokenId',
            indexed: true
        }
    ]
]); //# sourceMappingURL=cache.js.map
}),
"[project]/node_modules/wagmi/node_modules/abitype/dist/esm/human-readable/runtime/signatures.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "eventModifiers",
    ()=>eventModifiers,
    "execConstructorSignature",
    ()=>execConstructorSignature,
    "execErrorSignature",
    ()=>execErrorSignature,
    "execEventSignature",
    ()=>execEventSignature,
    "execFunctionSignature",
    ()=>execFunctionSignature,
    "execStructSignature",
    ()=>execStructSignature,
    "functionModifiers",
    ()=>functionModifiers,
    "isConstructorSignature",
    ()=>isConstructorSignature,
    "isErrorSignature",
    ()=>isErrorSignature,
    "isEventSignature",
    ()=>isEventSignature,
    "isFallbackSignature",
    ()=>isFallbackSignature,
    "isFunctionSignature",
    ()=>isFunctionSignature,
    "isReceiveSignature",
    ()=>isReceiveSignature,
    "isStructSignature",
    ()=>isStructSignature,
    "modifiers",
    ()=>modifiers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$regex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/abitype/dist/esm/regex.js [app-ssr] (ecmascript)");
;
// https://regexr.com/7gmok
const errorSignatureRegex = /^error (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
function isErrorSignature(signature) {
    return errorSignatureRegex.test(signature);
}
function execErrorSignature(signature) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$regex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["execTyped"])(errorSignatureRegex, signature);
}
// https://regexr.com/7gmoq
const eventSignatureRegex = /^event (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
function isEventSignature(signature) {
    return eventSignatureRegex.test(signature);
}
function execEventSignature(signature) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$regex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["execTyped"])(eventSignatureRegex, signature);
}
// https://regexr.com/7gmot
const functionSignatureRegex = /^function (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)(?: (?<scope>external|public{1}))?(?: (?<stateMutability>pure|view|nonpayable|payable{1}))?(?: returns\s?\((?<returns>.*?)\))?$/;
function isFunctionSignature(signature) {
    return functionSignatureRegex.test(signature);
}
function execFunctionSignature(signature) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$regex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["execTyped"])(functionSignatureRegex, signature);
}
// https://regexr.com/7gmp3
const structSignatureRegex = /^struct (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*) \{(?<properties>.*?)\}$/;
function isStructSignature(signature) {
    return structSignatureRegex.test(signature);
}
function execStructSignature(signature) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$regex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["execTyped"])(structSignatureRegex, signature);
}
// https://regexr.com/78u01
const constructorSignatureRegex = /^constructor\((?<parameters>.*?)\)(?:\s(?<stateMutability>payable{1}))?$/;
function isConstructorSignature(signature) {
    return constructorSignatureRegex.test(signature);
}
function execConstructorSignature(signature) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$regex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["execTyped"])(constructorSignatureRegex, signature);
}
// https://regexr.com/7srtn
const fallbackSignatureRegex = /^fallback\(\) external(?:\s(?<stateMutability>payable{1}))?$/;
function isFallbackSignature(signature) {
    return fallbackSignatureRegex.test(signature);
}
// https://regexr.com/78u1k
const receiveSignatureRegex = /^receive\(\) external payable$/;
function isReceiveSignature(signature) {
    return receiveSignatureRegex.test(signature);
}
const modifiers = new Set([
    'memory',
    'indexed',
    'storage',
    'calldata'
]);
const eventModifiers = new Set([
    'indexed'
]);
const functionModifiers = new Set([
    'calldata',
    'memory',
    'storage'
]); //# sourceMappingURL=signatures.js.map
}),
"[project]/node_modules/wagmi/node_modules/abitype/dist/esm/human-readable/runtime/utils.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isSolidityKeyword",
    ()=>isSolidityKeyword,
    "isSolidityType",
    ()=>isSolidityType,
    "isValidDataLocation",
    ()=>isValidDataLocation,
    "parseAbiParameter",
    ()=>parseAbiParameter,
    "parseSignature",
    ()=>parseSignature,
    "splitParameters",
    ()=>splitParameters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$regex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/abitype/dist/esm/regex.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$errors$2f$abiItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/abitype/dist/esm/human-readable/errors/abiItem.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$errors$2f$abiParameter$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/abitype/dist/esm/human-readable/errors/abiParameter.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$errors$2f$signature$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/abitype/dist/esm/human-readable/errors/signature.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$errors$2f$splitParameters$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/abitype/dist/esm/human-readable/errors/splitParameters.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$cache$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/abitype/dist/esm/human-readable/runtime/cache.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$signatures$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/abitype/dist/esm/human-readable/runtime/signatures.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
function parseSignature(signature, structs = {}) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$signatures$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isFunctionSignature"])(signature)) {
        const match = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$signatures$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["execFunctionSignature"])(signature);
        if (!match) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$errors$2f$signature$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["InvalidSignatureError"]({
            signature,
            type: 'function'
        });
        const inputParams = splitParameters(match.parameters);
        const inputs = [];
        const inputLength = inputParams.length;
        for(let i = 0; i < inputLength; i++){
            inputs.push(parseAbiParameter(inputParams[i], {
                modifiers: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$signatures$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["functionModifiers"],
                structs,
                type: 'function'
            }));
        }
        const outputs = [];
        if (match.returns) {
            const outputParams = splitParameters(match.returns);
            const outputLength = outputParams.length;
            for(let i = 0; i < outputLength; i++){
                outputs.push(parseAbiParameter(outputParams[i], {
                    modifiers: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$signatures$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["functionModifiers"],
                    structs,
                    type: 'function'
                }));
            }
        }
        return {
            name: match.name,
            type: 'function',
            stateMutability: match.stateMutability ?? 'nonpayable',
            inputs,
            outputs
        };
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$signatures$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isEventSignature"])(signature)) {
        const match = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$signatures$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["execEventSignature"])(signature);
        if (!match) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$errors$2f$signature$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["InvalidSignatureError"]({
            signature,
            type: 'event'
        });
        const params = splitParameters(match.parameters);
        const abiParameters = [];
        const length = params.length;
        for(let i = 0; i < length; i++){
            abiParameters.push(parseAbiParameter(params[i], {
                modifiers: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$signatures$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["eventModifiers"],
                structs,
                type: 'event'
            }));
        }
        return {
            name: match.name,
            type: 'event',
            inputs: abiParameters
        };
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$signatures$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isErrorSignature"])(signature)) {
        const match = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$signatures$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["execErrorSignature"])(signature);
        if (!match) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$errors$2f$signature$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["InvalidSignatureError"]({
            signature,
            type: 'error'
        });
        const params = splitParameters(match.parameters);
        const abiParameters = [];
        const length = params.length;
        for(let i = 0; i < length; i++){
            abiParameters.push(parseAbiParameter(params[i], {
                structs,
                type: 'error'
            }));
        }
        return {
            name: match.name,
            type: 'error',
            inputs: abiParameters
        };
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$signatures$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isConstructorSignature"])(signature)) {
        const match = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$signatures$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["execConstructorSignature"])(signature);
        if (!match) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$errors$2f$signature$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["InvalidSignatureError"]({
            signature,
            type: 'constructor'
        });
        const params = splitParameters(match.parameters);
        const abiParameters = [];
        const length = params.length;
        for(let i = 0; i < length; i++){
            abiParameters.push(parseAbiParameter(params[i], {
                structs,
                type: 'constructor'
            }));
        }
        return {
            type: 'constructor',
            stateMutability: match.stateMutability ?? 'nonpayable',
            inputs: abiParameters
        };
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$signatures$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isFallbackSignature"])(signature)) return {
        type: 'fallback'
    };
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$signatures$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isReceiveSignature"])(signature)) return {
        type: 'receive',
        stateMutability: 'payable'
    };
    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$errors$2f$signature$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UnknownSignatureError"]({
        signature
    });
}
const abiParameterWithoutTupleRegex = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/;
const abiParameterWithTupleRegex = /^\((?<type>.+?)\)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/;
const dynamicIntegerRegex = /^u?int$/;
function parseAbiParameter(param, options) {
    // optional namespace cache by `type`
    const parameterCacheKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$cache$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getParameterCacheKey"])(param, options?.type);
    if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$cache$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parameterCache"].has(parameterCacheKey)) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$cache$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parameterCache"].get(parameterCacheKey);
    const isTuple = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$regex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTupleRegex"].test(param);
    const match = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$regex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["execTyped"])(isTuple ? abiParameterWithTupleRegex : abiParameterWithoutTupleRegex, param);
    if (!match) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$errors$2f$abiParameter$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["InvalidParameterError"]({
        param
    });
    if (match.name && isSolidityKeyword(match.name)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$errors$2f$abiParameter$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SolidityProtectedKeywordError"]({
        param,
        name: match.name
    });
    const name = match.name ? {
        name: match.name
    } : {};
    const indexed = match.modifier === 'indexed' ? {
        indexed: true
    } : {};
    const structs = options?.structs ?? {};
    let type;
    let components = {};
    if (isTuple) {
        type = 'tuple';
        const params = splitParameters(match.type);
        const components_ = [];
        const length = params.length;
        for(let i = 0; i < length; i++){
            // remove `modifiers` from `options` to prevent from being added to tuple components
            components_.push(parseAbiParameter(params[i], {
                structs
            }));
        }
        components = {
            components: components_
        };
    } else if (match.type in structs) {
        type = 'tuple';
        components = {
            components: structs[match.type]
        };
    } else if (dynamicIntegerRegex.test(match.type)) {
        type = `${match.type}256`;
    } else {
        type = match.type;
        if (!(options?.type === 'struct') && !isSolidityType(type)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$errors$2f$abiItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UnknownSolidityTypeError"]({
            type
        });
    }
    if (match.modifier) {
        // Check if modifier exists, but is not allowed (e.g. `indexed` in `functionModifiers`)
        if (!options?.modifiers?.has?.(match.modifier)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$errors$2f$abiParameter$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["InvalidModifierError"]({
            param,
            type: options?.type,
            modifier: match.modifier
        });
        // Check if resolved `type` is valid if there is a function modifier
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$signatures$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["functionModifiers"].has(match.modifier) && !isValidDataLocation(type, !!match.array)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$errors$2f$abiParameter$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["InvalidFunctionModifierError"]({
            param,
            type: options?.type,
            modifier: match.modifier
        });
    }
    const abiParameter = {
        type: `${type}${match.array ?? ''}`,
        ...name,
        ...indexed,
        ...components
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$cache$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parameterCache"].set(parameterCacheKey, abiParameter);
    return abiParameter;
}
function splitParameters(params, result = [], current = '', depth = 0) {
    const length = params.trim().length;
    // biome-ignore lint/correctness/noUnreachable: recursive
    for(let i = 0; i < length; i++){
        const char = params[i];
        const tail = params.slice(i + 1);
        switch(char){
            case ',':
                return depth === 0 ? splitParameters(tail, [
                    ...result,
                    current.trim()
                ]) : splitParameters(tail, result, `${current}${char}`, depth);
            case '(':
                return splitParameters(tail, result, `${current}${char}`, depth + 1);
            case ')':
                return splitParameters(tail, result, `${current}${char}`, depth - 1);
            default:
                return splitParameters(tail, result, `${current}${char}`, depth);
        }
    }
    if (current === '') return result;
    if (depth !== 0) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$errors$2f$splitParameters$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["InvalidParenthesisError"]({
        current,
        depth
    });
    result.push(current.trim());
    return result;
}
function isSolidityType(type) {
    return type === 'address' || type === 'bool' || type === 'function' || type === 'string' || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$regex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bytesRegex"].test(type) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$regex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["integerRegex"].test(type);
}
const protectedKeywordsRegex = /^(?:after|alias|anonymous|apply|auto|byte|calldata|case|catch|constant|copyof|default|defined|error|event|external|false|final|function|immutable|implements|in|indexed|inline|internal|let|mapping|match|memory|mutable|null|of|override|partial|private|promise|public|pure|reference|relocatable|return|returns|sizeof|static|storage|struct|super|supports|switch|this|true|try|typedef|typeof|var|view|virtual)$/;
function isSolidityKeyword(name) {
    return name === 'address' || name === 'bool' || name === 'function' || name === 'string' || name === 'tuple' || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$regex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bytesRegex"].test(name) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$regex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["integerRegex"].test(name) || protectedKeywordsRegex.test(name);
}
function isValidDataLocation(type, isArray) {
    return isArray || type === 'bytes' || type === 'string' || type === 'tuple';
} //# sourceMappingURL=utils.js.map
}),
"[project]/node_modules/wagmi/node_modules/abitype/dist/esm/zod.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Abi",
    ()=>Abi,
    "AbiConstructor",
    ()=>AbiConstructor,
    "AbiError",
    ()=>AbiError,
    "AbiEvent",
    ()=>AbiEvent,
    "AbiEventParameter",
    ()=>AbiEventParameter,
    "AbiFallback",
    ()=>AbiFallback,
    "AbiFunction",
    ()=>AbiFunction,
    "AbiItemType",
    ()=>AbiItemType,
    "AbiParameter",
    ()=>AbiParameter,
    "AbiReceive",
    ()=>AbiReceive,
    "AbiStateMutability",
    ()=>AbiStateMutability,
    "Address",
    ()=>Address,
    "SolidityAddress",
    ()=>SolidityAddress,
    "SolidityArray",
    ()=>SolidityArray,
    "SolidityArrayWithTuple",
    ()=>SolidityArrayWithTuple,
    "SolidityArrayWithoutTuple",
    ()=>SolidityArrayWithoutTuple,
    "SolidityBool",
    ()=>SolidityBool,
    "SolidityBytes",
    ()=>SolidityBytes,
    "SolidityFunction",
    ()=>SolidityFunction,
    "SolidityInt",
    ()=>SolidityInt,
    "SolidityString",
    ()=>SolidityString,
    "SolidityTuple",
    ()=>SolidityTuple,
    "TypedData",
    ()=>TypedData,
    "TypedDataDomain",
    ()=>TypedDataDomain,
    "TypedDataParameter",
    ()=>TypedDataParameter,
    "TypedDataType",
    ()=>TypedDataType
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/zod/v3/external.js [app-ssr] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/abitype/dist/esm/human-readable/runtime/utils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$regex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/wagmi/node_modules/abitype/dist/esm/regex.js [app-ssr] (ecmascript)");
;
;
;
const Identifier = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/[a-zA-Z$_][a-zA-Z0-9$_]*/);
const Address = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().transform((val, ctx)=>{
    const regex = /^0x[a-fA-F0-9]{40}$/;
    if (!regex.test(val)) {
        ctx.addIssue({
            code: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].ZodIssueCode.custom,
            message: `Invalid Address ${val}`
        });
    }
    return val;
});
const SolidityAddress = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('address');
const SolidityBool = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('bool');
const SolidityBytes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$regex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bytesRegex"]);
const SolidityFunction = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('function');
const SolidityString = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('string');
const SolidityTuple = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('tuple');
const SolidityInt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$regex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["integerRegex"]);
const SolidityArrayWithoutTuple = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^(address|bool|function|string|bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?|u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?)(\[[0-9]{0,}\])+$/);
const SolidityArrayWithTuple = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^tuple(\[[0-9]{0,}\])+$/);
const SolidityArray = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
    SolidityArrayWithTuple,
    SolidityArrayWithoutTuple
]);
const AbiParameter = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].lazy(()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].intersection(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
            Identifier.optional(),
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('')
        ]),
        /** Representation used by Solidity compiler */ internalType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    }), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
                SolidityAddress,
                SolidityBool,
                SolidityBytes,
                SolidityFunction,
                SolidityString,
                SolidityInt,
                SolidityArrayWithoutTuple
            ])
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
                SolidityTuple,
                SolidityArrayWithTuple
            ]),
            components: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(AbiParameter).readonly()
        })
    ])));
const AbiEventParameter = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].intersection(AbiParameter, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    indexed: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional()
}));
const AbiStateMutability = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('pure'),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('view'),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('nonpayable'),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('payable')
]);
const AbiFunction = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess((val)=>{
    const abiFunction = val;
    // Calculate `stateMutability` for deprecated `constant` and `payable` fields
    if (abiFunction.stateMutability === undefined) {
        if (abiFunction.constant) abiFunction.stateMutability = 'view';
        else if (abiFunction.payable) abiFunction.stateMutability = 'payable';
        else abiFunction.stateMutability = 'nonpayable';
    }
    return val;
}, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('function'),
    /**
     * @deprecated use `pure` or `view` from {@link AbiStateMutability} instead
     * https://github.com/ethereum/solidity/issues/992
     */ constant: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    /**
     * @deprecated Vyper used to provide gas estimates
     * https://github.com/vyperlang/vyper/issues/2151
     */ gas: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().optional(),
    inputs: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(AbiParameter).readonly(),
    name: Identifier,
    outputs: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(AbiParameter).readonly(),
    /**
     * @deprecated use `payable` or `nonpayable` from {@link AbiStateMutability} instead
     * https://github.com/ethereum/solidity/issues/992
     */ payable: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    stateMutability: AbiStateMutability
}));
const AbiConstructor = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess((val)=>{
    const abiFunction = val;
    // Calculate `stateMutability` for deprecated `payable` field
    if (abiFunction.stateMutability === undefined) {
        if (abiFunction.payable) abiFunction.stateMutability = 'payable';
        else abiFunction.stateMutability = 'nonpayable';
    }
    return val;
}, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('constructor'),
    /**
     * @deprecated use `pure` or `view` from {@link AbiStateMutability} instead
     * https://github.com/ethereum/solidity/issues/992
     */ inputs: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(AbiParameter).readonly(),
    /**
     * @deprecated use `payable` or `nonpayable` from {@link AbiStateMutability} instead
     * https://github.com/ethereum/solidity/issues/992
     */ payable: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    stateMutability: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('nonpayable'),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('payable')
    ])
}));
const AbiFallback = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess((val)=>{
    const abiFunction = val;
    // Calculate `stateMutability` for deprecated `payable` field
    if (abiFunction.stateMutability === undefined) {
        if (abiFunction.payable) abiFunction.stateMutability = 'payable';
        else abiFunction.stateMutability = 'nonpayable';
    }
    return val;
}, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('fallback'),
    /**
     * @deprecated use `payable` or `nonpayable` from {@link AbiStateMutability} instead
     * https://github.com/ethereum/solidity/issues/992
     */ payable: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    stateMutability: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('nonpayable'),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('payable')
    ])
}));
const AbiReceive = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('receive'),
    stateMutability: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('payable')
});
const AbiEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('event'),
    anonymous: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    inputs: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(AbiEventParameter).readonly(),
    name: Identifier
});
const AbiError = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('error'),
    inputs: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(AbiParameter).readonly(),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
});
const AbiItemType = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('constructor'),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('event'),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('error'),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('fallback'),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('function'),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('receive')
]);
const Abi = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
    AbiError,
    AbiEvent,
    // TODO: Replace code below to `z.switch` (https://github.com/colinhacks/zod/issues/2106)
    // Need to redefine `AbiFunction | AbiConstructor | AbiFallback | AbiReceive` since `z.discriminate` doesn't support `z.preprocess` on `options`
    // https://github.com/colinhacks/zod/issues/1490
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess((val)=>{
        const abiItem = val;
        if (abiItem.type === 'receive') return abiItem;
        // Calculate `stateMutability` for deprecated fields: `constant` and `payable`
        if (val.stateMutability === undefined) {
            if (abiItem.type === 'function' && abiItem.constant) abiItem.stateMutability = 'view';
            else if (abiItem.payable) abiItem.stateMutability = 'payable';
            else abiItem.stateMutability = 'nonpayable';
        }
        return val;
    }, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].intersection(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        /**
         * @deprecated use `pure` or `view` from {@link AbiStateMutability} instead
         * https://github.com/ethereum/solidity/issues/992
         */ constant: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
        /**
         * @deprecated Vyper used to provide gas estimates
         * https://github.com/vyperlang/vyper/issues/2151
         */ gas: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().optional(),
        /**
         * @deprecated use `payable` or `nonpayable` from {@link AbiStateMutability} instead
         * https://github.com/ethereum/solidity/issues/992
         */ payable: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional()
    }), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion('type', [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('function'),
            inputs: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(AbiParameter).readonly(),
            name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/[a-zA-Z$_][a-zA-Z0-9$_]*/),
            outputs: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(AbiParameter).readonly(),
            stateMutability: AbiStateMutability
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('constructor'),
            inputs: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(AbiParameter).readonly(),
            stateMutability: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('payable'),
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('nonpayable')
            ])
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('fallback'),
            inputs: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].tuple([]).optional(),
            stateMutability: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('payable'),
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('nonpayable')
            ])
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('receive'),
            stateMutability: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('payable')
        })
    ])))
])).readonly();
const TypedDataDomain = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    chainId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().optional(),
    name: Identifier.optional(),
    salt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    verifyingContract: Address.optional(),
    version: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
const TypedDataType = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
    SolidityAddress,
    SolidityBool,
    SolidityBytes,
    SolidityString,
    SolidityInt,
    SolidityArray
]);
const TypedDataParameter = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: Identifier,
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
});
const TypedData = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(Identifier, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(TypedDataParameter)).transform((val, ctx)=>validateTypedDataKeys(val, ctx));
// Helper Functions.
function validateTypedDataKeys(typedData, zodContext) {
    const keys = Object.keys(typedData);
    for(let i = 0; i < keys.length; i++){
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSolidityType"])(keys[i])) {
            zodContext.addIssue({
                code: 'custom',
                message: `Invalid key. ${keys[i]} is a solidity type.`
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].NEVER;
        }
        validateTypedDataParameters(keys[i], typedData, zodContext);
    }
    return typedData;
}
const typeWithoutTupleRegex = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*?)(?<array>(?:\[\d*?\])+?)?$/;
function validateTypedDataParameters(key, typedData, zodContext, ancestors = new Set()) {
    const val = typedData[key];
    const length = val.length;
    for(let i = 0; i < length; i++){
        if (val[i]?.type === key) {
            zodContext.addIssue({
                code: 'custom',
                message: `Invalid type. ${key} is a self reference.`
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].NEVER;
        }
        const match = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$regex$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["execTyped"])(typeWithoutTupleRegex, val[i]?.type);
        if (!match?.type) {
            zodContext.addIssue({
                code: 'custom',
                message: `Invalid type. ${key} does not have a type.`
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].NEVER;
        }
        if (match.type in typedData) {
            if (ancestors.has(match.type)) {
                zodContext.addIssue({
                    code: 'custom',
                    message: `Invalid type. ${match.type} is a circular reference.`
                });
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].NEVER;
            }
            validateTypedDataParameters(match.type, typedData, zodContext, new Set([
                ...ancestors,
                match.type
            ]));
        } else if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$wagmi$2f$node_modules$2f$abitype$2f$dist$2f$esm$2f$human$2d$readable$2f$runtime$2f$utils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSolidityType"])(match.type)) {
            zodContext.addIssue({
                code: 'custom',
                message: `Invalid type. ${match.type} is not a valid EIP-712 type.`
            });
        }
    }
    return;
} //# sourceMappingURL=zod.js.map
}),
"[project]/node_modules/wagmi/node_modules/@solana-program/system/dist/src/index.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ADVANCE_NONCE_ACCOUNT_DISCRIMINATOR",
    ()=>ADVANCE_NONCE_ACCOUNT_DISCRIMINATOR,
    "ALLOCATE_DISCRIMINATOR",
    ()=>ALLOCATE_DISCRIMINATOR,
    "ALLOCATE_WITH_SEED_DISCRIMINATOR",
    ()=>ALLOCATE_WITH_SEED_DISCRIMINATOR,
    "ASSIGN_DISCRIMINATOR",
    ()=>ASSIGN_DISCRIMINATOR,
    "ASSIGN_WITH_SEED_DISCRIMINATOR",
    ()=>ASSIGN_WITH_SEED_DISCRIMINATOR,
    "AUTHORIZE_NONCE_ACCOUNT_DISCRIMINATOR",
    ()=>AUTHORIZE_NONCE_ACCOUNT_DISCRIMINATOR,
    "CREATE_ACCOUNT_DISCRIMINATOR",
    ()=>CREATE_ACCOUNT_DISCRIMINATOR,
    "CREATE_ACCOUNT_WITH_SEED_DISCRIMINATOR",
    ()=>CREATE_ACCOUNT_WITH_SEED_DISCRIMINATOR,
    "INITIALIZE_NONCE_ACCOUNT_DISCRIMINATOR",
    ()=>INITIALIZE_NONCE_ACCOUNT_DISCRIMINATOR,
    "NonceState",
    ()=>NonceState,
    "NonceVersion",
    ()=>NonceVersion,
    "SYSTEM_ERROR__ACCOUNT_ALREADY_IN_USE",
    ()=>SYSTEM_ERROR__ACCOUNT_ALREADY_IN_USE,
    "SYSTEM_ERROR__ADDRESS_WITH_SEED_MISMATCH",
    ()=>SYSTEM_ERROR__ADDRESS_WITH_SEED_MISMATCH,
    "SYSTEM_ERROR__INVALID_ACCOUNT_DATA_LENGTH",
    ()=>SYSTEM_ERROR__INVALID_ACCOUNT_DATA_LENGTH,
    "SYSTEM_ERROR__INVALID_PROGRAM_ID",
    ()=>SYSTEM_ERROR__INVALID_PROGRAM_ID,
    "SYSTEM_ERROR__MAX_SEED_LENGTH_EXCEEDED",
    ()=>SYSTEM_ERROR__MAX_SEED_LENGTH_EXCEEDED,
    "SYSTEM_ERROR__NONCE_BLOCKHASH_NOT_EXPIRED",
    ()=>SYSTEM_ERROR__NONCE_BLOCKHASH_NOT_EXPIRED,
    "SYSTEM_ERROR__NONCE_NO_RECENT_BLOCKHASHES",
    ()=>SYSTEM_ERROR__NONCE_NO_RECENT_BLOCKHASHES,
    "SYSTEM_ERROR__NONCE_UNEXPECTED_BLOCKHASH_VALUE",
    ()=>SYSTEM_ERROR__NONCE_UNEXPECTED_BLOCKHASH_VALUE,
    "SYSTEM_ERROR__RESULT_WITH_NEGATIVE_LAMPORTS",
    ()=>SYSTEM_ERROR__RESULT_WITH_NEGATIVE_LAMPORTS,
    "SYSTEM_PROGRAM_ADDRESS",
    ()=>SYSTEM_PROGRAM_ADDRESS,
    "SystemAccount",
    ()=>SystemAccount,
    "SystemInstruction",
    ()=>SystemInstruction,
    "TRANSFER_SOL_DISCRIMINATOR",
    ()=>TRANSFER_SOL_DISCRIMINATOR,
    "TRANSFER_SOL_WITH_SEED_DISCRIMINATOR",
    ()=>TRANSFER_SOL_WITH_SEED_DISCRIMINATOR,
    "UPGRADE_NONCE_ACCOUNT_DISCRIMINATOR",
    ()=>UPGRADE_NONCE_ACCOUNT_DISCRIMINATOR,
    "WITHDRAW_NONCE_ACCOUNT_DISCRIMINATOR",
    ()=>WITHDRAW_NONCE_ACCOUNT_DISCRIMINATOR,
    "decodeNonce",
    ()=>decodeNonce,
    "fetchAllMaybeNonce",
    ()=>fetchAllMaybeNonce,
    "fetchAllNonce",
    ()=>fetchAllNonce,
    "fetchMaybeNonce",
    ()=>fetchMaybeNonce,
    "fetchNonce",
    ()=>fetchNonce,
    "getAdvanceNonceAccountDiscriminatorBytes",
    ()=>getAdvanceNonceAccountDiscriminatorBytes,
    "getAdvanceNonceAccountInstruction",
    ()=>getAdvanceNonceAccountInstruction,
    "getAdvanceNonceAccountInstructionDataCodec",
    ()=>getAdvanceNonceAccountInstructionDataCodec,
    "getAdvanceNonceAccountInstructionDataDecoder",
    ()=>getAdvanceNonceAccountInstructionDataDecoder,
    "getAdvanceNonceAccountInstructionDataEncoder",
    ()=>getAdvanceNonceAccountInstructionDataEncoder,
    "getAllocateDiscriminatorBytes",
    ()=>getAllocateDiscriminatorBytes,
    "getAllocateInstruction",
    ()=>getAllocateInstruction,
    "getAllocateInstructionDataCodec",
    ()=>getAllocateInstructionDataCodec,
    "getAllocateInstructionDataDecoder",
    ()=>getAllocateInstructionDataDecoder,
    "getAllocateInstructionDataEncoder",
    ()=>getAllocateInstructionDataEncoder,
    "getAllocateWithSeedDiscriminatorBytes",
    ()=>getAllocateWithSeedDiscriminatorBytes,
    "getAllocateWithSeedInstruction",
    ()=>getAllocateWithSeedInstruction,
    "getAllocateWithSeedInstructionDataCodec",
    ()=>getAllocateWithSeedInstructionDataCodec,
    "getAllocateWithSeedInstructionDataDecoder",
    ()=>getAllocateWithSeedInstructionDataDecoder,
    "getAllocateWithSeedInstructionDataEncoder",
    ()=>getAllocateWithSeedInstructionDataEncoder,
    "getAssignDiscriminatorBytes",
    ()=>getAssignDiscriminatorBytes,
    "getAssignInstruction",
    ()=>getAssignInstruction,
    "getAssignInstructionDataCodec",
    ()=>getAssignInstructionDataCodec,
    "getAssignInstructionDataDecoder",
    ()=>getAssignInstructionDataDecoder,
    "getAssignInstructionDataEncoder",
    ()=>getAssignInstructionDataEncoder,
    "getAssignWithSeedDiscriminatorBytes",
    ()=>getAssignWithSeedDiscriminatorBytes,
    "getAssignWithSeedInstruction",
    ()=>getAssignWithSeedInstruction,
    "getAssignWithSeedInstructionDataCodec",
    ()=>getAssignWithSeedInstructionDataCodec,
    "getAssignWithSeedInstructionDataDecoder",
    ()=>getAssignWithSeedInstructionDataDecoder,
    "getAssignWithSeedInstructionDataEncoder",
    ()=>getAssignWithSeedInstructionDataEncoder,
    "getAuthorizeNonceAccountDiscriminatorBytes",
    ()=>getAuthorizeNonceAccountDiscriminatorBytes,
    "getAuthorizeNonceAccountInstruction",
    ()=>getAuthorizeNonceAccountInstruction,
    "getAuthorizeNonceAccountInstructionDataCodec",
    ()=>getAuthorizeNonceAccountInstructionDataCodec,
    "getAuthorizeNonceAccountInstructionDataDecoder",
    ()=>getAuthorizeNonceAccountInstructionDataDecoder,
    "getAuthorizeNonceAccountInstructionDataEncoder",
    ()=>getAuthorizeNonceAccountInstructionDataEncoder,
    "getCreateAccountDiscriminatorBytes",
    ()=>getCreateAccountDiscriminatorBytes,
    "getCreateAccountInstruction",
    ()=>getCreateAccountInstruction,
    "getCreateAccountInstructionDataCodec",
    ()=>getCreateAccountInstructionDataCodec,
    "getCreateAccountInstructionDataDecoder",
    ()=>getCreateAccountInstructionDataDecoder,
    "getCreateAccountInstructionDataEncoder",
    ()=>getCreateAccountInstructionDataEncoder,
    "getCreateAccountWithSeedDiscriminatorBytes",
    ()=>getCreateAccountWithSeedDiscriminatorBytes,
    "getCreateAccountWithSeedInstruction",
    ()=>getCreateAccountWithSeedInstruction,
    "getCreateAccountWithSeedInstructionDataCodec",
    ()=>getCreateAccountWithSeedInstructionDataCodec,
    "getCreateAccountWithSeedInstructionDataDecoder",
    ()=>getCreateAccountWithSeedInstructionDataDecoder,
    "getCreateAccountWithSeedInstructionDataEncoder",
    ()=>getCreateAccountWithSeedInstructionDataEncoder,
    "getInitializeNonceAccountDiscriminatorBytes",
    ()=>getInitializeNonceAccountDiscriminatorBytes,
    "getInitializeNonceAccountInstruction",
    ()=>getInitializeNonceAccountInstruction,
    "getInitializeNonceAccountInstructionDataCodec",
    ()=>getInitializeNonceAccountInstructionDataCodec,
    "getInitializeNonceAccountInstructionDataDecoder",
    ()=>getInitializeNonceAccountInstructionDataDecoder,
    "getInitializeNonceAccountInstructionDataEncoder",
    ()=>getInitializeNonceAccountInstructionDataEncoder,
    "getNonceCodec",
    ()=>getNonceCodec,
    "getNonceDecoder",
    ()=>getNonceDecoder,
    "getNonceEncoder",
    ()=>getNonceEncoder,
    "getNonceSize",
    ()=>getNonceSize,
    "getNonceStateCodec",
    ()=>getNonceStateCodec,
    "getNonceStateDecoder",
    ()=>getNonceStateDecoder,
    "getNonceStateEncoder",
    ()=>getNonceStateEncoder,
    "getNonceVersionCodec",
    ()=>getNonceVersionCodec,
    "getNonceVersionDecoder",
    ()=>getNonceVersionDecoder,
    "getNonceVersionEncoder",
    ()=>getNonceVersionEncoder,
    "getSystemErrorMessage",
    ()=>getSystemErrorMessage,
    "getTransferSolDiscriminatorBytes",
    ()=>getTransferSolDiscriminatorBytes,
    "getTransferSolInstruction",
    ()=>getTransferSolInstruction,
    "getTransferSolInstructionDataCodec",
    ()=>getTransferSolInstructionDataCodec,
    "getTransferSolInstructionDataDecoder",
    ()=>getTransferSolInstructionDataDecoder,
    "getTransferSolInstructionDataEncoder",
    ()=>getTransferSolInstructionDataEncoder,
    "getTransferSolWithSeedDiscriminatorBytes",
    ()=>getTransferSolWithSeedDiscriminatorBytes,
    "getTransferSolWithSeedInstruction",
    ()=>getTransferSolWithSeedInstruction,
    "getTransferSolWithSeedInstructionDataCodec",
    ()=>getTransferSolWithSeedInstructionDataCodec,
    "getTransferSolWithSeedInstructionDataDecoder",
    ()=>getTransferSolWithSeedInstructionDataDecoder,
    "getTransferSolWithSeedInstructionDataEncoder",
    ()=>getTransferSolWithSeedInstructionDataEncoder,
    "getUpgradeNonceAccountDiscriminatorBytes",
    ()=>getUpgradeNonceAccountDiscriminatorBytes,
    "getUpgradeNonceAccountInstruction",
    ()=>getUpgradeNonceAccountInstruction,
    "getUpgradeNonceAccountInstructionDataCodec",
    ()=>getUpgradeNonceAccountInstructionDataCodec,
    "getUpgradeNonceAccountInstructionDataDecoder",
    ()=>getUpgradeNonceAccountInstructionDataDecoder,
    "getUpgradeNonceAccountInstructionDataEncoder",
    ()=>getUpgradeNonceAccountInstructionDataEncoder,
    "getWithdrawNonceAccountDiscriminatorBytes",
    ()=>getWithdrawNonceAccountDiscriminatorBytes,
    "getWithdrawNonceAccountInstruction",
    ()=>getWithdrawNonceAccountInstruction,
    "getWithdrawNonceAccountInstructionDataCodec",
    ()=>getWithdrawNonceAccountInstructionDataCodec,
    "getWithdrawNonceAccountInstructionDataDecoder",
    ()=>getWithdrawNonceAccountInstructionDataDecoder,
    "getWithdrawNonceAccountInstructionDataEncoder",
    ()=>getWithdrawNonceAccountInstructionDataEncoder,
    "identifySystemInstruction",
    ()=>identifySystemInstruction,
    "isSystemError",
    ()=>isSystemError,
    "parseAdvanceNonceAccountInstruction",
    ()=>parseAdvanceNonceAccountInstruction,
    "parseAllocateInstruction",
    ()=>parseAllocateInstruction,
    "parseAllocateWithSeedInstruction",
    ()=>parseAllocateWithSeedInstruction,
    "parseAssignInstruction",
    ()=>parseAssignInstruction,
    "parseAssignWithSeedInstruction",
    ()=>parseAssignWithSeedInstruction,
    "parseAuthorizeNonceAccountInstruction",
    ()=>parseAuthorizeNonceAccountInstruction,
    "parseCreateAccountInstruction",
    ()=>parseCreateAccountInstruction,
    "parseCreateAccountWithSeedInstruction",
    ()=>parseCreateAccountWithSeedInstruction,
    "parseInitializeNonceAccountInstruction",
    ()=>parseInitializeNonceAccountInstruction,
    "parseTransferSolInstruction",
    ()=>parseTransferSolInstruction,
    "parseTransferSolWithSeedInstruction",
    ()=>parseTransferSolWithSeedInstruction,
    "parseUpgradeNonceAccountInstruction",
    ()=>parseUpgradeNonceAccountInstruction,
    "parseWithdrawNonceAccountInstruction",
    ()=>parseWithdrawNonceAccountInstruction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/codecs-data-structures/dist/index.node.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/codecs-numbers/dist/index.node.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/codecs-core/dist/index.node.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/addresses/dist/index.node.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/accounts/dist/index.node.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$programs$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/programs/dist/index.node.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/codecs-strings/dist/index.node.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/instructions/dist/index.node.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$signers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/signers/dist/index.node.mjs [app-ssr] (ecmascript)");
;
// src/generated/accounts/nonce.ts
var NonceState = /* @__PURE__ */ ((NonceState2)=>{
    NonceState2[NonceState2["Uninitialized"] = 0] = "Uninitialized";
    NonceState2[NonceState2["Initialized"] = 1] = "Initialized";
    return NonceState2;
})(NonceState || {});
function getNonceStateEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEnumEncoder"])(NonceState, {
        size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])()
    });
}
function getNonceStateDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEnumDecoder"])(NonceState, {
        size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Decoder"])()
    });
}
function getNonceStateCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getNonceStateEncoder(), getNonceStateDecoder());
}
var NonceVersion = /* @__PURE__ */ ((NonceVersion2)=>{
    NonceVersion2[NonceVersion2["Legacy"] = 0] = "Legacy";
    NonceVersion2[NonceVersion2["Current"] = 1] = "Current";
    return NonceVersion2;
})(NonceVersion || {});
function getNonceVersionEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEnumEncoder"])(NonceVersion, {
        size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])()
    });
}
function getNonceVersionDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEnumDecoder"])(NonceVersion, {
        size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Decoder"])()
    });
}
function getNonceVersionCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getNonceVersionEncoder(), getNonceVersionDecoder());
}
// src/generated/accounts/nonce.ts
function getNonceEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "version",
            getNonceVersionEncoder()
        ],
        [
            "state",
            getNonceStateEncoder()
        ],
        [
            "authority",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressEncoder"])()
        ],
        [
            "blockhash",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressEncoder"])()
        ],
        [
            "lamportsPerSignature",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ]
    ]);
}
function getNonceDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "version",
            getNonceVersionDecoder()
        ],
        [
            "state",
            getNonceStateDecoder()
        ],
        [
            "authority",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressDecoder"])()
        ],
        [
            "blockhash",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressDecoder"])()
        ],
        [
            "lamportsPerSignature",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ]
    ]);
}
function getNonceCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getNonceEncoder(), getNonceDecoder());
}
function decodeNonce(encodedAccount) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decodeAccount"])(encodedAccount, getNonceDecoder());
}
async function fetchNonce(rpc, address, config) {
    const maybeAccount = await fetchMaybeNonce(rpc, address, config);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assertAccountExists"])(maybeAccount);
    return maybeAccount;
}
async function fetchMaybeNonce(rpc, address, config) {
    const maybeAccount = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchEncodedAccount"])(rpc, address, config);
    return decodeNonce(maybeAccount);
}
async function fetchAllNonce(rpc, addresses, config) {
    const maybeAccounts = await fetchAllMaybeNonce(rpc, addresses, config);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assertAccountsExist"])(maybeAccounts);
    return maybeAccounts;
}
async function fetchAllMaybeNonce(rpc, addresses, config) {
    const maybeAccounts = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchEncodedAccounts"])(rpc, addresses, config);
    return maybeAccounts.map((maybeAccount)=>decodeNonce(maybeAccount));
}
function getNonceSize() {
    return 80;
}
var SYSTEM_PROGRAM_ADDRESS = "11111111111111111111111111111111";
var SystemAccount = /* @__PURE__ */ ((SystemAccount2)=>{
    SystemAccount2[SystemAccount2["Nonce"] = 0] = "Nonce";
    return SystemAccount2;
})(SystemAccount || {});
var SystemInstruction = /* @__PURE__ */ ((SystemInstruction2)=>{
    SystemInstruction2[SystemInstruction2["CreateAccount"] = 0] = "CreateAccount";
    SystemInstruction2[SystemInstruction2["Assign"] = 1] = "Assign";
    SystemInstruction2[SystemInstruction2["TransferSol"] = 2] = "TransferSol";
    SystemInstruction2[SystemInstruction2["CreateAccountWithSeed"] = 3] = "CreateAccountWithSeed";
    SystemInstruction2[SystemInstruction2["AdvanceNonceAccount"] = 4] = "AdvanceNonceAccount";
    SystemInstruction2[SystemInstruction2["WithdrawNonceAccount"] = 5] = "WithdrawNonceAccount";
    SystemInstruction2[SystemInstruction2["InitializeNonceAccount"] = 6] = "InitializeNonceAccount";
    SystemInstruction2[SystemInstruction2["AuthorizeNonceAccount"] = 7] = "AuthorizeNonceAccount";
    SystemInstruction2[SystemInstruction2["Allocate"] = 8] = "Allocate";
    SystemInstruction2[SystemInstruction2["AllocateWithSeed"] = 9] = "AllocateWithSeed";
    SystemInstruction2[SystemInstruction2["AssignWithSeed"] = 10] = "AssignWithSeed";
    SystemInstruction2[SystemInstruction2["TransferSolWithSeed"] = 11] = "TransferSolWithSeed";
    SystemInstruction2[SystemInstruction2["UpgradeNonceAccount"] = 12] = "UpgradeNonceAccount";
    return SystemInstruction2;
})(SystemInstruction || {});
function identifySystemInstruction(instruction) {
    const data = "data" in instruction ? instruction.data : instruction;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["containsBytes"])(data, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(0), 0)) {
        return 0 /* CreateAccount */ ;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["containsBytes"])(data, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(1), 0)) {
        return 1 /* Assign */ ;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["containsBytes"])(data, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(2), 0)) {
        return 2 /* TransferSol */ ;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["containsBytes"])(data, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(3), 0)) {
        return 3 /* CreateAccountWithSeed */ ;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["containsBytes"])(data, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(4), 0)) {
        return 4 /* AdvanceNonceAccount */ ;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["containsBytes"])(data, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(5), 0)) {
        return 5 /* WithdrawNonceAccount */ ;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["containsBytes"])(data, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(6), 0)) {
        return 6 /* InitializeNonceAccount */ ;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["containsBytes"])(data, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(7), 0)) {
        return 7 /* AuthorizeNonceAccount */ ;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["containsBytes"])(data, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(8), 0)) {
        return 8 /* Allocate */ ;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["containsBytes"])(data, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(9), 0)) {
        return 9 /* AllocateWithSeed */ ;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["containsBytes"])(data, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(10), 0)) {
        return 10 /* AssignWithSeed */ ;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["containsBytes"])(data, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(11), 0)) {
        return 11 /* TransferSolWithSeed */ ;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["containsBytes"])(data, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(12), 0)) {
        return 12 /* UpgradeNonceAccount */ ;
    }
    throw new Error("The provided instruction could not be identified as a system instruction.");
}
// src/generated/errors/system.ts
var SYSTEM_ERROR__ACCOUNT_ALREADY_IN_USE = 0;
var SYSTEM_ERROR__RESULT_WITH_NEGATIVE_LAMPORTS = 1;
var SYSTEM_ERROR__INVALID_PROGRAM_ID = 2;
var SYSTEM_ERROR__INVALID_ACCOUNT_DATA_LENGTH = 3;
var SYSTEM_ERROR__MAX_SEED_LENGTH_EXCEEDED = 4;
var SYSTEM_ERROR__ADDRESS_WITH_SEED_MISMATCH = 5;
var SYSTEM_ERROR__NONCE_NO_RECENT_BLOCKHASHES = 6;
var SYSTEM_ERROR__NONCE_BLOCKHASH_NOT_EXPIRED = 7;
var SYSTEM_ERROR__NONCE_UNEXPECTED_BLOCKHASH_VALUE = 8;
var systemErrorMessages;
if (("TURBOPACK compile-time value", "development") !== "production") {
    systemErrorMessages = {
        [SYSTEM_ERROR__ACCOUNT_ALREADY_IN_USE]: `an account with the same address already exists`,
        [SYSTEM_ERROR__ADDRESS_WITH_SEED_MISMATCH]: `provided address does not match addressed derived from seed`,
        [SYSTEM_ERROR__INVALID_ACCOUNT_DATA_LENGTH]: `cannot allocate account data of this length`,
        [SYSTEM_ERROR__INVALID_PROGRAM_ID]: `cannot assign account to this program id`,
        [SYSTEM_ERROR__MAX_SEED_LENGTH_EXCEEDED]: `length of requested seed is too long`,
        [SYSTEM_ERROR__NONCE_BLOCKHASH_NOT_EXPIRED]: `stored nonce is still in recent_blockhashes`,
        [SYSTEM_ERROR__NONCE_NO_RECENT_BLOCKHASHES]: `advancing stored nonce requires a populated RecentBlockhashes sysvar`,
        [SYSTEM_ERROR__NONCE_UNEXPECTED_BLOCKHASH_VALUE]: `specified nonce does not match stored nonce`,
        [SYSTEM_ERROR__RESULT_WITH_NEGATIVE_LAMPORTS]: `account does not have enough SOL to perform the operation`
    };
}
function getSystemErrorMessage(code) {
    if ("TURBOPACK compile-time truthy", 1) {
        return systemErrorMessages[code];
    }
    //TURBOPACK unreachable
    ;
}
function isSystemError(error, transactionMessage, code) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$programs$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isProgramError"])(error, transactionMessage, SYSTEM_PROGRAM_ADDRESS, code);
}
function expectAddress(value) {
    if (!value) {
        throw new Error("Expected a Address.");
    }
    if (typeof value === "object" && "address" in value) {
        return value.address;
    }
    if (Array.isArray(value)) {
        return value[0];
    }
    return value;
}
function getAccountMetaFactory(programAddress, optionalAccountStrategy) {
    return (account)=>{
        if (!account.value) {
            return;
        }
        const writableRole = account.isWritable ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AccountRole"].WRITABLE : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AccountRole"].READONLY;
        return Object.freeze({
            address: expectAddress(account.value),
            role: isTransactionSigner(account.value) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$instructions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["upgradeRoleToSigner"])(writableRole) : writableRole,
            ...isTransactionSigner(account.value) ? {
                signer: account.value
            } : {}
        });
    };
}
function isTransactionSigner(value) {
    return !!value && typeof value === "object" && "address" in value && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$signers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTransactionSigner"])(value);
}
// src/generated/instructions/advanceNonceAccount.ts
var ADVANCE_NONCE_ACCOUNT_DISCRIMINATOR = 4;
function getAdvanceNonceAccountDiscriminatorBytes() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(ADVANCE_NONCE_ACCOUNT_DISCRIMINATOR);
}
function getAdvanceNonceAccountInstructionDataEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])()
        ]
    ]), (value)=>({
            ...value,
            discriminator: ADVANCE_NONCE_ACCOUNT_DISCRIMINATOR
        }));
}
function getAdvanceNonceAccountInstructionDataDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Decoder"])()
        ]
    ]);
}
function getAdvanceNonceAccountInstructionDataCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getAdvanceNonceAccountInstructionDataEncoder(), getAdvanceNonceAccountInstructionDataDecoder());
}
function getAdvanceNonceAccountInstruction(input, config) {
    const programAddress = config?.programAddress ?? SYSTEM_PROGRAM_ADDRESS;
    const originalAccounts = {
        nonceAccount: {
            value: input.nonceAccount ?? null,
            isWritable: true
        },
        recentBlockhashesSysvar: {
            value: input.recentBlockhashesSysvar ?? null,
            isWritable: false
        },
        nonceAuthority: {
            value: input.nonceAuthority ?? null,
            isWritable: false
        }
    };
    const accounts = originalAccounts;
    if (!accounts.recentBlockhashesSysvar.value) {
        accounts.recentBlockhashesSysvar.value = "SysvarRecentB1ockHashes11111111111111111111";
    }
    const getAccountMeta = getAccountMetaFactory();
    const instruction = {
        accounts: [
            getAccountMeta(accounts.nonceAccount),
            getAccountMeta(accounts.recentBlockhashesSysvar),
            getAccountMeta(accounts.nonceAuthority)
        ],
        programAddress,
        data: getAdvanceNonceAccountInstructionDataEncoder().encode({})
    };
    return instruction;
}
function parseAdvanceNonceAccountInstruction(instruction) {
    if (instruction.accounts.length < 3) {
        throw new Error("Not enough accounts");
    }
    let accountIndex = 0;
    const getNextAccount = ()=>{
        const accountMeta = instruction.accounts[accountIndex];
        accountIndex += 1;
        return accountMeta;
    };
    return {
        programAddress: instruction.programAddress,
        accounts: {
            nonceAccount: getNextAccount(),
            recentBlockhashesSysvar: getNextAccount(),
            nonceAuthority: getNextAccount()
        },
        data: getAdvanceNonceAccountInstructionDataDecoder().decode(instruction.data)
    };
}
var ALLOCATE_DISCRIMINATOR = 8;
function getAllocateDiscriminatorBytes() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(ALLOCATE_DISCRIMINATOR);
}
function getAllocateInstructionDataEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])()
        ],
        [
            "space",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ]
    ]), (value)=>({
            ...value,
            discriminator: ALLOCATE_DISCRIMINATOR
        }));
}
function getAllocateInstructionDataDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Decoder"])()
        ],
        [
            "space",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ]
    ]);
}
function getAllocateInstructionDataCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getAllocateInstructionDataEncoder(), getAllocateInstructionDataDecoder());
}
function getAllocateInstruction(input, config) {
    const programAddress = config?.programAddress ?? SYSTEM_PROGRAM_ADDRESS;
    const originalAccounts = {
        newAccount: {
            value: input.newAccount ?? null,
            isWritable: true
        }
    };
    const accounts = originalAccounts;
    const args = {
        ...input
    };
    const getAccountMeta = getAccountMetaFactory();
    const instruction = {
        accounts: [
            getAccountMeta(accounts.newAccount)
        ],
        programAddress,
        data: getAllocateInstructionDataEncoder().encode(args)
    };
    return instruction;
}
function parseAllocateInstruction(instruction) {
    if (instruction.accounts.length < 1) {
        throw new Error("Not enough accounts");
    }
    let accountIndex = 0;
    const getNextAccount = ()=>{
        const accountMeta = instruction.accounts[accountIndex];
        accountIndex += 1;
        return accountMeta;
    };
    return {
        programAddress: instruction.programAddress,
        accounts: {
            newAccount: getNextAccount()
        },
        data: getAllocateInstructionDataDecoder().decode(instruction.data)
    };
}
var ALLOCATE_WITH_SEED_DISCRIMINATOR = 9;
function getAllocateWithSeedDiscriminatorBytes() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(ALLOCATE_WITH_SEED_DISCRIMINATOR);
}
function getAllocateWithSeedInstructionDataEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])()
        ],
        [
            "base",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressEncoder"])()
        ],
        [
            "seed",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addEncoderSizePrefix"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUtf8Encoder"])(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Encoder"])())
        ],
        [
            "space",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ],
        [
            "programAddress",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressEncoder"])()
        ]
    ]), (value)=>({
            ...value,
            discriminator: ALLOCATE_WITH_SEED_DISCRIMINATOR
        }));
}
function getAllocateWithSeedInstructionDataDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Decoder"])()
        ],
        [
            "base",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressDecoder"])()
        ],
        [
            "seed",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addDecoderSizePrefix"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUtf8Decoder"])(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Decoder"])())
        ],
        [
            "space",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ],
        [
            "programAddress",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressDecoder"])()
        ]
    ]);
}
function getAllocateWithSeedInstructionDataCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getAllocateWithSeedInstructionDataEncoder(), getAllocateWithSeedInstructionDataDecoder());
}
function getAllocateWithSeedInstruction(input, config) {
    const programAddress = config?.programAddress ?? SYSTEM_PROGRAM_ADDRESS;
    const originalAccounts = {
        newAccount: {
            value: input.newAccount ?? null,
            isWritable: true
        },
        baseAccount: {
            value: input.baseAccount ?? null,
            isWritable: false
        }
    };
    const accounts = originalAccounts;
    const args = {
        ...input
    };
    const getAccountMeta = getAccountMetaFactory();
    const instruction = {
        accounts: [
            getAccountMeta(accounts.newAccount),
            getAccountMeta(accounts.baseAccount)
        ],
        programAddress,
        data: getAllocateWithSeedInstructionDataEncoder().encode(args)
    };
    return instruction;
}
function parseAllocateWithSeedInstruction(instruction) {
    if (instruction.accounts.length < 2) {
        throw new Error("Not enough accounts");
    }
    let accountIndex = 0;
    const getNextAccount = ()=>{
        const accountMeta = instruction.accounts[accountIndex];
        accountIndex += 1;
        return accountMeta;
    };
    return {
        programAddress: instruction.programAddress,
        accounts: {
            newAccount: getNextAccount(),
            baseAccount: getNextAccount()
        },
        data: getAllocateWithSeedInstructionDataDecoder().decode(instruction.data)
    };
}
var ASSIGN_DISCRIMINATOR = 1;
function getAssignDiscriminatorBytes() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(ASSIGN_DISCRIMINATOR);
}
function getAssignInstructionDataEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])()
        ],
        [
            "programAddress",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressEncoder"])()
        ]
    ]), (value)=>({
            ...value,
            discriminator: ASSIGN_DISCRIMINATOR
        }));
}
function getAssignInstructionDataDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Decoder"])()
        ],
        [
            "programAddress",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressDecoder"])()
        ]
    ]);
}
function getAssignInstructionDataCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getAssignInstructionDataEncoder(), getAssignInstructionDataDecoder());
}
function getAssignInstruction(input, config) {
    const programAddress = config?.programAddress ?? SYSTEM_PROGRAM_ADDRESS;
    const originalAccounts = {
        account: {
            value: input.account ?? null,
            isWritable: true
        }
    };
    const accounts = originalAccounts;
    const args = {
        ...input
    };
    const getAccountMeta = getAccountMetaFactory();
    const instruction = {
        accounts: [
            getAccountMeta(accounts.account)
        ],
        programAddress,
        data: getAssignInstructionDataEncoder().encode(args)
    };
    return instruction;
}
function parseAssignInstruction(instruction) {
    if (instruction.accounts.length < 1) {
        throw new Error("Not enough accounts");
    }
    let accountIndex = 0;
    const getNextAccount = ()=>{
        const accountMeta = instruction.accounts[accountIndex];
        accountIndex += 1;
        return accountMeta;
    };
    return {
        programAddress: instruction.programAddress,
        accounts: {
            account: getNextAccount()
        },
        data: getAssignInstructionDataDecoder().decode(instruction.data)
    };
}
var ASSIGN_WITH_SEED_DISCRIMINATOR = 10;
function getAssignWithSeedDiscriminatorBytes() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(ASSIGN_WITH_SEED_DISCRIMINATOR);
}
function getAssignWithSeedInstructionDataEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])()
        ],
        [
            "base",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressEncoder"])()
        ],
        [
            "seed",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addEncoderSizePrefix"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUtf8Encoder"])(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Encoder"])())
        ],
        [
            "programAddress",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressEncoder"])()
        ]
    ]), (value)=>({
            ...value,
            discriminator: ASSIGN_WITH_SEED_DISCRIMINATOR
        }));
}
function getAssignWithSeedInstructionDataDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Decoder"])()
        ],
        [
            "base",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressDecoder"])()
        ],
        [
            "seed",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addDecoderSizePrefix"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUtf8Decoder"])(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Decoder"])())
        ],
        [
            "programAddress",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressDecoder"])()
        ]
    ]);
}
function getAssignWithSeedInstructionDataCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getAssignWithSeedInstructionDataEncoder(), getAssignWithSeedInstructionDataDecoder());
}
function getAssignWithSeedInstruction(input, config) {
    const programAddress = config?.programAddress ?? SYSTEM_PROGRAM_ADDRESS;
    const originalAccounts = {
        account: {
            value: input.account ?? null,
            isWritable: true
        },
        baseAccount: {
            value: input.baseAccount ?? null,
            isWritable: false
        }
    };
    const accounts = originalAccounts;
    const args = {
        ...input
    };
    const getAccountMeta = getAccountMetaFactory();
    const instruction = {
        accounts: [
            getAccountMeta(accounts.account),
            getAccountMeta(accounts.baseAccount)
        ],
        programAddress,
        data: getAssignWithSeedInstructionDataEncoder().encode(args)
    };
    return instruction;
}
function parseAssignWithSeedInstruction(instruction) {
    if (instruction.accounts.length < 2) {
        throw new Error("Not enough accounts");
    }
    let accountIndex = 0;
    const getNextAccount = ()=>{
        const accountMeta = instruction.accounts[accountIndex];
        accountIndex += 1;
        return accountMeta;
    };
    return {
        programAddress: instruction.programAddress,
        accounts: {
            account: getNextAccount(),
            baseAccount: getNextAccount()
        },
        data: getAssignWithSeedInstructionDataDecoder().decode(instruction.data)
    };
}
var AUTHORIZE_NONCE_ACCOUNT_DISCRIMINATOR = 7;
function getAuthorizeNonceAccountDiscriminatorBytes() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(AUTHORIZE_NONCE_ACCOUNT_DISCRIMINATOR);
}
function getAuthorizeNonceAccountInstructionDataEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])()
        ],
        [
            "newNonceAuthority",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressEncoder"])()
        ]
    ]), (value)=>({
            ...value,
            discriminator: AUTHORIZE_NONCE_ACCOUNT_DISCRIMINATOR
        }));
}
function getAuthorizeNonceAccountInstructionDataDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Decoder"])()
        ],
        [
            "newNonceAuthority",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressDecoder"])()
        ]
    ]);
}
function getAuthorizeNonceAccountInstructionDataCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getAuthorizeNonceAccountInstructionDataEncoder(), getAuthorizeNonceAccountInstructionDataDecoder());
}
function getAuthorizeNonceAccountInstruction(input, config) {
    const programAddress = config?.programAddress ?? SYSTEM_PROGRAM_ADDRESS;
    const originalAccounts = {
        nonceAccount: {
            value: input.nonceAccount ?? null,
            isWritable: true
        },
        nonceAuthority: {
            value: input.nonceAuthority ?? null,
            isWritable: false
        }
    };
    const accounts = originalAccounts;
    const args = {
        ...input
    };
    const getAccountMeta = getAccountMetaFactory();
    const instruction = {
        accounts: [
            getAccountMeta(accounts.nonceAccount),
            getAccountMeta(accounts.nonceAuthority)
        ],
        programAddress,
        data: getAuthorizeNonceAccountInstructionDataEncoder().encode(args)
    };
    return instruction;
}
function parseAuthorizeNonceAccountInstruction(instruction) {
    if (instruction.accounts.length < 2) {
        throw new Error("Not enough accounts");
    }
    let accountIndex = 0;
    const getNextAccount = ()=>{
        const accountMeta = instruction.accounts[accountIndex];
        accountIndex += 1;
        return accountMeta;
    };
    return {
        programAddress: instruction.programAddress,
        accounts: {
            nonceAccount: getNextAccount(),
            nonceAuthority: getNextAccount()
        },
        data: getAuthorizeNonceAccountInstructionDataDecoder().decode(instruction.data)
    };
}
var CREATE_ACCOUNT_DISCRIMINATOR = 0;
function getCreateAccountDiscriminatorBytes() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(CREATE_ACCOUNT_DISCRIMINATOR);
}
function getCreateAccountInstructionDataEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])()
        ],
        [
            "lamports",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ],
        [
            "space",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ],
        [
            "programAddress",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressEncoder"])()
        ]
    ]), (value)=>({
            ...value,
            discriminator: CREATE_ACCOUNT_DISCRIMINATOR
        }));
}
function getCreateAccountInstructionDataDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Decoder"])()
        ],
        [
            "lamports",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ],
        [
            "space",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ],
        [
            "programAddress",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressDecoder"])()
        ]
    ]);
}
function getCreateAccountInstructionDataCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getCreateAccountInstructionDataEncoder(), getCreateAccountInstructionDataDecoder());
}
function getCreateAccountInstruction(input, config) {
    const programAddress = config?.programAddress ?? SYSTEM_PROGRAM_ADDRESS;
    const originalAccounts = {
        payer: {
            value: input.payer ?? null,
            isWritable: true
        },
        newAccount: {
            value: input.newAccount ?? null,
            isWritable: true
        }
    };
    const accounts = originalAccounts;
    const args = {
        ...input
    };
    const byteDelta = [
        Number(args.space) + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$accounts$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BASE_ACCOUNT_SIZE"]
    ].reduce((a, b)=>a + b, 0);
    const getAccountMeta = getAccountMetaFactory();
    const instruction = {
        accounts: [
            getAccountMeta(accounts.payer),
            getAccountMeta(accounts.newAccount)
        ],
        programAddress,
        data: getCreateAccountInstructionDataEncoder().encode(args)
    };
    return Object.freeze({
        ...instruction,
        byteDelta
    });
}
function parseCreateAccountInstruction(instruction) {
    if (instruction.accounts.length < 2) {
        throw new Error("Not enough accounts");
    }
    let accountIndex = 0;
    const getNextAccount = ()=>{
        const accountMeta = instruction.accounts[accountIndex];
        accountIndex += 1;
        return accountMeta;
    };
    return {
        programAddress: instruction.programAddress,
        accounts: {
            payer: getNextAccount(),
            newAccount: getNextAccount()
        },
        data: getCreateAccountInstructionDataDecoder().decode(instruction.data)
    };
}
var CREATE_ACCOUNT_WITH_SEED_DISCRIMINATOR = 3;
function getCreateAccountWithSeedDiscriminatorBytes() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(CREATE_ACCOUNT_WITH_SEED_DISCRIMINATOR);
}
function getCreateAccountWithSeedInstructionDataEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])()
        ],
        [
            "base",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressEncoder"])()
        ],
        [
            "seed",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addEncoderSizePrefix"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUtf8Encoder"])(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Encoder"])())
        ],
        [
            "amount",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ],
        [
            "space",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ],
        [
            "programAddress",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressEncoder"])()
        ]
    ]), (value)=>({
            ...value,
            discriminator: CREATE_ACCOUNT_WITH_SEED_DISCRIMINATOR
        }));
}
function getCreateAccountWithSeedInstructionDataDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Decoder"])()
        ],
        [
            "base",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressDecoder"])()
        ],
        [
            "seed",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addDecoderSizePrefix"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUtf8Decoder"])(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Decoder"])())
        ],
        [
            "amount",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ],
        [
            "space",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ],
        [
            "programAddress",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressDecoder"])()
        ]
    ]);
}
function getCreateAccountWithSeedInstructionDataCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getCreateAccountWithSeedInstructionDataEncoder(), getCreateAccountWithSeedInstructionDataDecoder());
}
function getCreateAccountWithSeedInstruction(input, config) {
    const programAddress = config?.programAddress ?? SYSTEM_PROGRAM_ADDRESS;
    const originalAccounts = {
        payer: {
            value: input.payer ?? null,
            isWritable: true
        },
        newAccount: {
            value: input.newAccount ?? null,
            isWritable: true
        },
        baseAccount: {
            value: input.baseAccount ?? null,
            isWritable: false
        }
    };
    const accounts = originalAccounts;
    const args = {
        ...input
    };
    const getAccountMeta = getAccountMetaFactory();
    const instruction = {
        accounts: [
            getAccountMeta(accounts.payer),
            getAccountMeta(accounts.newAccount),
            getAccountMeta(accounts.baseAccount)
        ].filter((x)=>x !== void 0),
        programAddress,
        data: getCreateAccountWithSeedInstructionDataEncoder().encode(args)
    };
    return instruction;
}
function parseCreateAccountWithSeedInstruction(instruction) {
    if (instruction.accounts.length < 2) {
        throw new Error("Not enough accounts");
    }
    let accountIndex = 0;
    const getNextAccount = ()=>{
        const accountMeta = instruction.accounts[accountIndex];
        accountIndex += 1;
        return accountMeta;
    };
    let optionalAccountsRemaining = instruction.accounts.length - 2;
    const getNextOptionalAccount = ()=>{
        if (optionalAccountsRemaining === 0) return void 0;
        optionalAccountsRemaining -= 1;
        return getNextAccount();
    };
    return {
        programAddress: instruction.programAddress,
        accounts: {
            payer: getNextAccount(),
            newAccount: getNextAccount(),
            baseAccount: getNextOptionalAccount()
        },
        data: getCreateAccountWithSeedInstructionDataDecoder().decode(instruction.data)
    };
}
var INITIALIZE_NONCE_ACCOUNT_DISCRIMINATOR = 6;
function getInitializeNonceAccountDiscriminatorBytes() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(INITIALIZE_NONCE_ACCOUNT_DISCRIMINATOR);
}
function getInitializeNonceAccountInstructionDataEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])()
        ],
        [
            "nonceAuthority",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressEncoder"])()
        ]
    ]), (value)=>({
            ...value,
            discriminator: INITIALIZE_NONCE_ACCOUNT_DISCRIMINATOR
        }));
}
function getInitializeNonceAccountInstructionDataDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Decoder"])()
        ],
        [
            "nonceAuthority",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressDecoder"])()
        ]
    ]);
}
function getInitializeNonceAccountInstructionDataCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getInitializeNonceAccountInstructionDataEncoder(), getInitializeNonceAccountInstructionDataDecoder());
}
function getInitializeNonceAccountInstruction(input, config) {
    const programAddress = config?.programAddress ?? SYSTEM_PROGRAM_ADDRESS;
    const originalAccounts = {
        nonceAccount: {
            value: input.nonceAccount ?? null,
            isWritable: true
        },
        recentBlockhashesSysvar: {
            value: input.recentBlockhashesSysvar ?? null,
            isWritable: false
        },
        rentSysvar: {
            value: input.rentSysvar ?? null,
            isWritable: false
        }
    };
    const accounts = originalAccounts;
    const args = {
        ...input
    };
    if (!accounts.recentBlockhashesSysvar.value) {
        accounts.recentBlockhashesSysvar.value = "SysvarRecentB1ockHashes11111111111111111111";
    }
    if (!accounts.rentSysvar.value) {
        accounts.rentSysvar.value = "SysvarRent111111111111111111111111111111111";
    }
    const getAccountMeta = getAccountMetaFactory();
    const instruction = {
        accounts: [
            getAccountMeta(accounts.nonceAccount),
            getAccountMeta(accounts.recentBlockhashesSysvar),
            getAccountMeta(accounts.rentSysvar)
        ],
        programAddress,
        data: getInitializeNonceAccountInstructionDataEncoder().encode(args)
    };
    return instruction;
}
function parseInitializeNonceAccountInstruction(instruction) {
    if (instruction.accounts.length < 3) {
        throw new Error("Not enough accounts");
    }
    let accountIndex = 0;
    const getNextAccount = ()=>{
        const accountMeta = instruction.accounts[accountIndex];
        accountIndex += 1;
        return accountMeta;
    };
    return {
        programAddress: instruction.programAddress,
        accounts: {
            nonceAccount: getNextAccount(),
            recentBlockhashesSysvar: getNextAccount(),
            rentSysvar: getNextAccount()
        },
        data: getInitializeNonceAccountInstructionDataDecoder().decode(instruction.data)
    };
}
var TRANSFER_SOL_DISCRIMINATOR = 2;
function getTransferSolDiscriminatorBytes() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(TRANSFER_SOL_DISCRIMINATOR);
}
function getTransferSolInstructionDataEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])()
        ],
        [
            "amount",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ]
    ]), (value)=>({
            ...value,
            discriminator: TRANSFER_SOL_DISCRIMINATOR
        }));
}
function getTransferSolInstructionDataDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Decoder"])()
        ],
        [
            "amount",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ]
    ]);
}
function getTransferSolInstructionDataCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getTransferSolInstructionDataEncoder(), getTransferSolInstructionDataDecoder());
}
function getTransferSolInstruction(input, config) {
    const programAddress = config?.programAddress ?? SYSTEM_PROGRAM_ADDRESS;
    const originalAccounts = {
        source: {
            value: input.source ?? null,
            isWritable: true
        },
        destination: {
            value: input.destination ?? null,
            isWritable: true
        }
    };
    const accounts = originalAccounts;
    const args = {
        ...input
    };
    const getAccountMeta = getAccountMetaFactory();
    const instruction = {
        accounts: [
            getAccountMeta(accounts.source),
            getAccountMeta(accounts.destination)
        ],
        programAddress,
        data: getTransferSolInstructionDataEncoder().encode(args)
    };
    return instruction;
}
function parseTransferSolInstruction(instruction) {
    if (instruction.accounts.length < 2) {
        throw new Error("Not enough accounts");
    }
    let accountIndex = 0;
    const getNextAccount = ()=>{
        const accountMeta = instruction.accounts[accountIndex];
        accountIndex += 1;
        return accountMeta;
    };
    return {
        programAddress: instruction.programAddress,
        accounts: {
            source: getNextAccount(),
            destination: getNextAccount()
        },
        data: getTransferSolInstructionDataDecoder().decode(instruction.data)
    };
}
var TRANSFER_SOL_WITH_SEED_DISCRIMINATOR = 11;
function getTransferSolWithSeedDiscriminatorBytes() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(TRANSFER_SOL_WITH_SEED_DISCRIMINATOR);
}
function getTransferSolWithSeedInstructionDataEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])()
        ],
        [
            "amount",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ],
        [
            "fromSeed",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addEncoderSizePrefix"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUtf8Encoder"])(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Encoder"])())
        ],
        [
            "fromOwner",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressEncoder"])()
        ]
    ]), (value)=>({
            ...value,
            discriminator: TRANSFER_SOL_WITH_SEED_DISCRIMINATOR
        }));
}
function getTransferSolWithSeedInstructionDataDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Decoder"])()
        ],
        [
            "amount",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ],
        [
            "fromSeed",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addDecoderSizePrefix"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUtf8Decoder"])(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Decoder"])())
        ],
        [
            "fromOwner",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAddressDecoder"])()
        ]
    ]);
}
function getTransferSolWithSeedInstructionDataCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getTransferSolWithSeedInstructionDataEncoder(), getTransferSolWithSeedInstructionDataDecoder());
}
function getTransferSolWithSeedInstruction(input, config) {
    const programAddress = config?.programAddress ?? SYSTEM_PROGRAM_ADDRESS;
    const originalAccounts = {
        source: {
            value: input.source ?? null,
            isWritable: true
        },
        baseAccount: {
            value: input.baseAccount ?? null,
            isWritable: false
        },
        destination: {
            value: input.destination ?? null,
            isWritable: true
        }
    };
    const accounts = originalAccounts;
    const args = {
        ...input
    };
    const getAccountMeta = getAccountMetaFactory();
    const instruction = {
        accounts: [
            getAccountMeta(accounts.source),
            getAccountMeta(accounts.baseAccount),
            getAccountMeta(accounts.destination)
        ],
        programAddress,
        data: getTransferSolWithSeedInstructionDataEncoder().encode(args)
    };
    return instruction;
}
function parseTransferSolWithSeedInstruction(instruction) {
    if (instruction.accounts.length < 3) {
        throw new Error("Not enough accounts");
    }
    let accountIndex = 0;
    const getNextAccount = ()=>{
        const accountMeta = instruction.accounts[accountIndex];
        accountIndex += 1;
        return accountMeta;
    };
    return {
        programAddress: instruction.programAddress,
        accounts: {
            source: getNextAccount(),
            baseAccount: getNextAccount(),
            destination: getNextAccount()
        },
        data: getTransferSolWithSeedInstructionDataDecoder().decode(instruction.data)
    };
}
var UPGRADE_NONCE_ACCOUNT_DISCRIMINATOR = 12;
function getUpgradeNonceAccountDiscriminatorBytes() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(UPGRADE_NONCE_ACCOUNT_DISCRIMINATOR);
}
function getUpgradeNonceAccountInstructionDataEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])()
        ]
    ]), (value)=>({
            ...value,
            discriminator: UPGRADE_NONCE_ACCOUNT_DISCRIMINATOR
        }));
}
function getUpgradeNonceAccountInstructionDataDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Decoder"])()
        ]
    ]);
}
function getUpgradeNonceAccountInstructionDataCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getUpgradeNonceAccountInstructionDataEncoder(), getUpgradeNonceAccountInstructionDataDecoder());
}
function getUpgradeNonceAccountInstruction(input, config) {
    const programAddress = config?.programAddress ?? SYSTEM_PROGRAM_ADDRESS;
    const originalAccounts = {
        nonceAccount: {
            value: input.nonceAccount ?? null,
            isWritable: true
        }
    };
    const accounts = originalAccounts;
    const getAccountMeta = getAccountMetaFactory();
    const instruction = {
        accounts: [
            getAccountMeta(accounts.nonceAccount)
        ],
        programAddress,
        data: getUpgradeNonceAccountInstructionDataEncoder().encode({})
    };
    return instruction;
}
function parseUpgradeNonceAccountInstruction(instruction) {
    if (instruction.accounts.length < 1) {
        throw new Error("Not enough accounts");
    }
    let accountIndex = 0;
    const getNextAccount = ()=>{
        const accountMeta = instruction.accounts[accountIndex];
        accountIndex += 1;
        return accountMeta;
    };
    return {
        programAddress: instruction.programAddress,
        accounts: {
            nonceAccount: getNextAccount()
        },
        data: getUpgradeNonceAccountInstructionDataDecoder().decode(instruction.data)
    };
}
var WITHDRAW_NONCE_ACCOUNT_DISCRIMINATOR = 5;
function getWithdrawNonceAccountDiscriminatorBytes() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])().encode(WITHDRAW_NONCE_ACCOUNT_DISCRIMINATOR);
}
function getWithdrawNonceAccountInstructionDataEncoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transformEncoder"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructEncoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Encoder"])()
        ],
        [
            "withdrawAmount",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Encoder"])()
        ]
    ]), (value)=>({
            ...value,
            discriminator: WITHDRAW_NONCE_ACCOUNT_DISCRIMINATOR
        }));
}
function getWithdrawNonceAccountInstructionDataDecoder() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$data$2d$structures$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStructDecoder"])([
        [
            "discriminator",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU32Decoder"])()
        ],
        [
            "withdrawAmount",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$numbers$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getU64Decoder"])()
        ]
    ]);
}
function getWithdrawNonceAccountInstructionDataCodec() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$codecs$2d$core$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combineCodec"])(getWithdrawNonceAccountInstructionDataEncoder(), getWithdrawNonceAccountInstructionDataDecoder());
}
function getWithdrawNonceAccountInstruction(input, config) {
    const programAddress = config?.programAddress ?? SYSTEM_PROGRAM_ADDRESS;
    const originalAccounts = {
        nonceAccount: {
            value: input.nonceAccount ?? null,
            isWritable: true
        },
        recipientAccount: {
            value: input.recipientAccount ?? null,
            isWritable: true
        },
        recentBlockhashesSysvar: {
            value: input.recentBlockhashesSysvar ?? null,
            isWritable: false
        },
        rentSysvar: {
            value: input.rentSysvar ?? null,
            isWritable: false
        },
        nonceAuthority: {
            value: input.nonceAuthority ?? null,
            isWritable: false
        }
    };
    const accounts = originalAccounts;
    const args = {
        ...input
    };
    if (!accounts.recentBlockhashesSysvar.value) {
        accounts.recentBlockhashesSysvar.value = "SysvarRecentB1ockHashes11111111111111111111";
    }
    if (!accounts.rentSysvar.value) {
        accounts.rentSysvar.value = "SysvarRent111111111111111111111111111111111";
    }
    const getAccountMeta = getAccountMetaFactory();
    const instruction = {
        accounts: [
            getAccountMeta(accounts.nonceAccount),
            getAccountMeta(accounts.recipientAccount),
            getAccountMeta(accounts.recentBlockhashesSysvar),
            getAccountMeta(accounts.rentSysvar),
            getAccountMeta(accounts.nonceAuthority)
        ],
        programAddress,
        data: getWithdrawNonceAccountInstructionDataEncoder().encode(args)
    };
    return instruction;
}
function parseWithdrawNonceAccountInstruction(instruction) {
    if (instruction.accounts.length < 5) {
        throw new Error("Not enough accounts");
    }
    let accountIndex = 0;
    const getNextAccount = ()=>{
        const accountMeta = instruction.accounts[accountIndex];
        accountIndex += 1;
        return accountMeta;
    };
    return {
        programAddress: instruction.programAddress,
        accounts: {
            nonceAccount: getNextAccount(),
            recipientAccount: getNextAccount(),
            recentBlockhashesSysvar: getNextAccount(),
            rentSysvar: getNextAccount(),
            nonceAuthority: getNextAccount()
        },
        data: getWithdrawNonceAccountInstructionDataDecoder().decode(instruction.data)
    };
}
;
 //# sourceMappingURL=index.mjs.map
 //# sourceMappingURL=index.mjs.map
}),
];

//# sourceMappingURL=84aae_9e780eda._.js.map