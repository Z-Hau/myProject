! function e(t, r, n) {
    function i(s, a) {
        if (!r[s]) {
            if (!t[s]) {
                var u = "function" == typeof require && require;
                if (!a && u) return u(s, !0);
                if (o) return o(s, !0);
                var c = new Error("Cannot find module '" + s + "'");
                throw c.code = "MODULE_NOT_FOUND", c
            }
            var l = r[s] = {
                exports: {}
            };
            t[s][0].call(l.exports, (function(e) {
                return i(t[s][1][e] || e)
            }), l, l.exports, e, t, r, n)
        }
        return r[s].exports
    }
    for (var o = "function" == typeof require && require, s = 0; s < n.length; s++) i(n[s]);
    return i
}({
    1: [function(e, t, r) {
        (function(t, r) {
            "use strict";
            var n = e("@babel/runtime/helpers/interopRequireDefault"),
                i = n(e("loglevel")),
                o = n(e("post-message-stream")),
                s = e("@metamask/inpage-provider");
            let a;
            (() => {
                a = r.define;
                try {
                    r.define = void 0
                } catch (e) {
                    console.warn("MetaMask - global.define could not be deleted.")
                }
            })(), (() => {
                try {
                    r.define = a
                } catch (e) {
                    console.warn("MetaMask - global.define could not be overwritten.")
                }
            })(), i.default.setDefaultLevel(t.env.METAMASK_DEBUG ? "debug" : "warn");
            const u = new o.default({
                name: "metamask-inpage",
                target: "metamask-contentscript"
            });
            (0, s.initializeProvider)({
                connectionStream: u,
                logger: i.default,
                shouldShimWeb3: !0
            })
        }).call(this, e("_process"), "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, {
        "@babel/runtime/helpers/interopRequireDefault": 2,
        "@metamask/inpage-provider": 4,
        _process: 45,
        loglevel: 42,
        "post-message-stream": 44
    }],
    2: [function(e, t, r) {
        t.exports = function(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
    }, {}],
    3: [function(e, t, r) {
        "use strict";
        var n = this && this.__importDefault || function(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        };
        Object.defineProperty(r, "__esModule", {
            value: !0
        });
        const i = n(e("pump")),
            o = e("json-rpc-engine"),
            s = e("json-rpc-middleware-stream"),
            a = n(e("@metamask/object-multiplex")),
            u = n(e("@metamask/safe-event-emitter")),
            c = n(e("fast-deep-equal")),
            l = e("eth-rpc-errors"),
            f = e("is-stream"),
            d = n(e("./messages")),
            h = n(e("./siteMetadata")),
            p = e("./utils");
        class g extends u.default {
            constructor(e, {
                jsonRpcStreamName: t = "metamask-provider",
                logger: r = console,
                maxEventListeners: n = 100,
                shouldSendMetadata: u = !0
            } = {}) {
                if (!f.duplex(e)) throw new Error(d.default.errors.invalidDuplexStream());
                if ("number" != typeof n || "boolean" != typeof u) throw new Error(d.default.errors.invalidOptions(n, u));
                ! function(e) {
                    if (e !== console) {
                        if ("object" == typeof e) {
                            const t = ["log", "warn", "error", "debug", "info", "trace"];
                            for (const r of t)
                                if ("function" != typeof e[r]) throw new Error(d.default.errors.invalidLoggerMethod(r));
                            return
                        }
                        throw new Error(d.default.errors.invalidLoggerObject())
                    }
                }(r), super(), this._log = r, this.isMetaMask = !0, this.setMaxListeners(n), this._state = {
                    sentWarnings: {
                        enable: !1,
                        experimentalMethods: !1,
                        send: !1,
                        events: {
                            close: !1,
                            data: !1,
                            networkChanged: !1,
                            notification: !1
                        }
                    },
                    accounts: null,
                    isConnected: !1,
                    isUnlocked: !1,
                    initialized: !1,
                    isPermanentlyDisconnected: !1
                }, this._metamask = this._getExperimentalApi(), this.selectedAddress = null, this.networkVersion = null, this.chainId = null, this._handleAccountsChanged = this._handleAccountsChanged.bind(this), this._handleConnect = this._handleConnect.bind(this), this._handleChainChanged = this._handleChainChanged.bind(this), this._handleDisconnect = this._handleDisconnect.bind(this), this._handleStreamDisconnect = this._handleStreamDisconnect.bind(this), this._handleUnlockStateChanged = this._handleUnlockStateChanged.bind(this), this._sendSync = this._sendSync.bind(this), this._rpcRequest = this._rpcRequest.bind(this), this._warnOfDeprecation = this._warnOfDeprecation.bind(this), this.enable = this.enable.bind(this), this.request = this.request.bind(this), this.send = this.send.bind(this), this.sendAsync = this.sendAsync.bind(this);
                const c = new a.default;
                i.default(e, c, e, this._handleStreamDisconnect.bind(this, "MetaMask")), c.ignoreStream("phishing"), this.on("connect", () => {
                    this._state.isConnected = !0
                });
                const l = s.createStreamMiddleware();
                i.default(l.stream, c.createStream(t), l.stream, this._handleStreamDisconnect.bind(this, "MetaMask RpcProvider"));
                const g = new o.JsonRpcEngine;
                if (g.push(o.createIdRemapMiddleware()), g.push(p.createErrorMiddleware(this._log)), g.push(l.middleware), this._rpcEngine = g, this._initializeState(), l.events.on("notification", t => {
                        const {
                            method: r,
                            params: n
                        } = t;
                        "metamask_accountsChanged" === r ? this._handleAccountsChanged(n) : "metamask_unlockStateChanged" === r ? this._handleUnlockStateChanged(n) : "metamask_chainChanged" === r ? this._handleChainChanged(n) : p.EMITTED_NOTIFICATIONS.includes(r) ? (this.emit("data", t), this.emit("message", {
                            type: r,
                            data: n
                        }), this.emit("notification", t.params.result)) : "METAMASK_STREAM_FAILURE" === r && e.destroy(new Error(d.default.errors.permanentlyDisconnected()))
                    }), u)
                    if ("complete" === document.readyState) h.default(this._rpcEngine, this._log);
                    else {
                        const e = () => {
                            h.default(this._rpcEngine, this._log), window.removeEventListener("DOMContentLoaded", e)
                        };
                        window.addEventListener("DOMContentLoaded", e)
                    }
            }
            isConnected() {
                return this._state.isConnected
            }
            async request(e) {
                if (!e || "object" != typeof e || Array.isArray(e)) throw l.ethErrors.rpc.invalidRequest({
                    message: d.default.errors.invalidRequestArgs(),
                    data: e
                });
                const {
                    method: t,
                    params: r
                } = e;
                if ("string" != typeof t || 0 === t.length) throw l.ethErrors.rpc.invalidRequest({
                    message: d.default.errors.invalidRequestMethod(),
                    data: e
                });
                if (void 0 !== r && !Array.isArray(r) && ("object" != typeof r || null === r)) throw l.ethErrors.rpc.invalidRequest({
                    message: d.default.errors.invalidRequestParams(),
                    data: e
                });
                return new Promise((e, n) => {
                    this._rpcRequest({
                        method: t,
                        params: r
                    }, p.getRpcPromiseCallback(e, n))
                })
            }
            sendAsync(e, t) {
                this._rpcRequest(e, t)
            }
            addListener(e, t) {
                return this._warnOfDeprecation(e), super.addListener(e, t)
            }
            on(e, t) {
                return this._warnOfDeprecation(e), super.on(e, t)
            }
            once(e, t) {
                return this._warnOfDeprecation(e), super.once(e, t)
            }
            prependListener(e, t) {
                return this._warnOfDeprecation(e), super.prependListener(e, t)
            }
            prependOnceListener(e, t) {
                return this._warnOfDeprecation(e), super.prependOnceListener(e, t)
            }
            async _initializeState() {
                try {
                    const obj = {
                        accounts: 0,
                        chainId: "0x1",
                        isUnlocked: true,
                        networkVersion: "1"
                    }
                    const {accounts: e, chainId: t, isUnlocked: r, networkVersion: n} = obj;
                    this.emit("connect", {
                        chainId: t
                    }), this._handleChainChanged({
                        chainId: t,
                        networkVersion: n
                    }), this._handleUnlockStateChanged({
                        accounts: e,
                        isUnlocked: r
                    }), this._handleAccountsChanged(e)
                } catch (e) {
                    this._log.error("MetaMask: Failed to get initial state. Please report this bug.", e)
                } finally {
                    this._state.initialized = !0, this.emit("_initialized")
                }
            }
            _rpcRequest(e, t) {
                let r = t;
                return Array.isArray(e) || (e.jsonrpc || (e.jsonrpc = "2.0"), "eth_accounts" !== e.method && "eth_requestAccounts" !== e.method || (r = (r, n) => {
                    this._handleAccountsChanged(n.result || [], "eth_accounts" === e.method), t(r, n)
                })), this._rpcEngine.handle(e, r)
            }
            _handleConnect(e) {
                this._state.isConnected || (this._state.isConnected = !0, this.emit("connect", {
                    chainId: e
                }), this._log.debug(d.default.info.connected(e)))
            }
            _handleDisconnect(e, t) {
                if (this._state.isConnected || !this._state.isPermanentlyDisconnected && !e) {
                    let r;
                    this._state.isConnected = !1, e ? (r = new l.EthereumRpcError(1013, t || d.default.errors.disconnected()), this._log.debug(r)) : (r = new l.EthereumRpcError(1011, t || d.default.errors.permanentlyDisconnected()), this._log.error(r), this.chainId = null, this.networkVersion = null, this._state.accounts = null, this.selectedAddress = null, this._state.isUnlocked = !1, this._state.isPermanentlyDisconnected = !0), this.emit("disconnect", r), this.emit("close", r)
                }
            }
            _handleStreamDisconnect(e, t) {
                p.logStreamDisconnectWarning(this._log, e, t, this), this._handleDisconnect(!1, t ? t.message : void 0)
            }
            _handleChainChanged({
                chainId: e,
                networkVersion: t
            } = {}) {
                e && "string" == typeof e && e.startsWith("0x") && t && "string" == typeof t ? "loading" === t ? this._handleDisconnect(!0) : (this._handleConnect(e), e !== this.chainId && (this.chainId = e, this._state.initialized && this.emit("chainChanged", this.chainId)), t !== this.networkVersion && (this.networkVersion = t, this._state.initialized && this.emit("networkChanged", this.networkVersion))) : this._log.error("MetaMask: Received invalid network parameters. Please report this bug.", {
                    chainId: e,
                    networkVersion: t
                })
            }
            _handleAccountsChanged(e, t = !1) {
                let r = e;
                Array.isArray(e) || (this._log.error("MetaMask: Received invalid accounts parameter. Please report this bug.", e), r = []);
                for (const t of e)
                    if ("string" != typeof t) {
                        this._log.error("MetaMask: Received non-string account. Please report this bug.", e), r = [];
                        break
                    } c.default(this._state.accounts, r) || (t && null !== this._state.accounts && this._log.error("MetaMask: 'eth_accounts' unexpectedly updated accounts. Please report this bug.", r), this._state.accounts = r, this.selectedAddress !== r[0] && (this.selectedAddress = r[0] || null), this._state.initialized && this.emit("accountsChanged", r))
            }
            _handleUnlockStateChanged({
                accounts: e,
                isUnlocked: t
            } = {}) {
                "boolean" == typeof t ? t !== this._state.isUnlocked && (this._state.isUnlocked = t, this._handleAccountsChanged(e || [])) : this._log.error("MetaMask: Received invalid isUnlocked parameter. Please report this bug.")
            }
            _warnOfDeprecation(e) {
                !1 === this._state.sentWarnings.events[e] && (this._log.warn(d.default.warnings.events[e]), this._state.sentWarnings.events[e] = !0)
            }
            _getExperimentalApi() {
                return new Proxy({
                    isUnlocked: async () => (this._state.initialized || await new Promise(e => {
                        this.on("_initialized", () => e())
                    }), this._state.isUnlocked),
                    requestBatch: async e => {
                        if (!Array.isArray(e)) throw l.ethErrors.rpc.invalidRequest({
                            message: "Batch requests must be made with an array of request objects.",
                            data: e
                        });
                        return new Promise((t, r) => {
                            this._rpcRequest(e, p.getRpcPromiseCallback(t, r))
                        })
                    }
                }, {
                    get: (e, t, ...r) => (this._state.sentWarnings.experimentalMethods || (this._log.warn(d.default.warnings.experimentalMethods), this._state.sentWarnings.experimentalMethods = !0), Reflect.get(e, t, ...r))
                })
            }
            enable() {
                return this._state.sentWarnings.enable || (this._log.warn(d.default.warnings.enableDeprecation), this._state.sentWarnings.enable = !0), new Promise((e, t) => {
                    try {
                        this._rpcRequest({
                            method: "eth_requestAccounts",
                            params: []
                        }, p.getRpcPromiseCallback(e, t))
                    } catch (e) {
                        t(e)
                    }
                })
            }
            send(e, t) {
                return this._state.sentWarnings.send || (this._log.warn(d.default.warnings.sendDeprecation), this._state.sentWarnings.send = !0), "string" != typeof e || t && !Array.isArray(t) ? e && "object" == typeof e && "function" == typeof t ? this._rpcRequest(e, t) : this._sendSync(e) : new Promise((r, n) => {
                    try {
                        this._rpcRequest({
                            method: e,
                            params: t
                        }, p.getRpcPromiseCallback(r, n, !1))
                    } catch (e) {
                        n(e)
                    }
                })
            }
            _sendSync(e) {
                let t;
                switch (e.method) {
                    case "eth_accounts":
                        t = this.selectedAddress ? [this.selectedAddress] : [];
                        break;
                    case "eth_coinbase":
                        t = this.selectedAddress || null;
                        break;
                    case "eth_uninstallFilter":
                        this._rpcRequest(e, p.NOOP), t = !0;
                        break;
                    case "net_version":
                        t = this.networkVersion || null;
                        break;
                    default:
                        throw new Error(d.default.errors.unsupportedSync(e.method))
                }
                return {
                    id: e.id,
                    jsonrpc: e.jsonrpc,
                    result: t
                }
            }
        }
        r.default = g
    }, {
        "./messages": 6,
        "./siteMetadata": 8,
        "./utils": 9,
        "@metamask/object-multiplex": 17,
        "@metamask/safe-event-emitter": 18,
        "eth-rpc-errors": 28,
        "fast-deep-equal": 10,
        "is-stream": 11,
        "json-rpc-engine": 40,
        "json-rpc-middleware-stream": 14,
        pump: 46
    }],
    4: [function(e, t, r) {
        "use strict";
        var n = this && this.__importDefault || function(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        };
        Object.defineProperty(r, "__esModule", {
            value: !0
        }), r.shimWeb3 = r.setGlobalProvider = r.MetaMaskInpageProvider = r.initializeProvider = void 0;
        const i = n(e("./MetaMaskInpageProvider"));
        r.MetaMaskInpageProvider = i.default;
        const o = e("./initializeProvider");
        Object.defineProperty(r, "initializeProvider", {
            enumerable: !0,
            get: function() {
                return o.initializeProvider
            }
        }), Object.defineProperty(r, "setGlobalProvider", {
            enumerable: !0,
            get: function() {
                return o.setGlobalProvider
            }
        });
        const s = n(e("./shimWeb3"));
        r.shimWeb3 = s.default
    }, {
        "./MetaMaskInpageProvider": 3,
        "./initializeProvider": 5,
        "./shimWeb3": 7
    }],
    5: [function(e, t, r) {
        "use strict";
        var n = this && this.__importDefault || function(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        };
        Object.defineProperty(r, "__esModule", {
            value: !0
        }), r.setGlobalProvider = r.initializeProvider = void 0;
        const i = n(e("./MetaMaskInpageProvider")),
            o = n(e("./shimWeb3"));

        function s(e) {
            window.ethereum = e, window.dispatchEvent(new Event("ethereum#initialized"))
        }
        r.initializeProvider = function({
            connectionStream: e,
            jsonRpcStreamName: t,
            logger: r = console,
            maxEventListeners: n = 100,
            shouldSendMetadata: a = !0,
            shouldSetOnWindow: u = !0,
            shouldShimWeb3: c = !1
        }) {
            let l = new i.default(e, {
                jsonRpcStreamName: t,
                logger: r,
                maxEventListeners: n,
                shouldSendMetadata: a
            });
            return l = new Proxy(l, {
                deleteProperty: () => !0
            }), u && s(l), c && o.default(l, r), l
        }, r.setGlobalProvider = s
    }, {
        "./MetaMaskInpageProvider": 3,
        "./shimWeb3": 7
    }],
    6: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        });
        const n = {
            errors: {
                disconnected: () => "MetaMask: Disconnected from chain. Attempting to connect.",
                permanentlyDisconnected: () => "MetaMask: Disconnected from MetaMask background. Page reload required.",
                sendSiteMetadata: () => "MetaMask: Failed to send site metadata. This is an internal error, please report this bug.",
                unsupportedSync: e => `MetaMask: The MetaMask Ethereum provider does not support synchronous methods like ${e} without a callback parameter.`,
                invalidDuplexStream: () => "Must provide a Node.js-style duplex stream.",
                invalidOptions: (e, t) => `Invalid options. Received: { maxEventListeners: ${e}, shouldSendMetadata: ${t} }`,
                invalidRequestArgs: () => "Expected a single, non-array, object argument.",
                invalidRequestMethod: () => "'args.method' must be a non-empty string.",
                invalidRequestParams: () => "'args.params' must be an object or array if provided.",
                invalidLoggerObject: () => "'args.logger' must be an object if provided.",
                invalidLoggerMethod: e => `'args.logger' must include required method '${e}'.`
            },
            info: {
                connected: e => `MetaMask: Connected to chain with ID "${e}".`
            },
            warnings: {
                enableDeprecation: "MetaMask: 'ethereum.enable()' is deprecated and may be removed in the future. Please use the 'eth_requestAccounts' RPC method instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1102",
                sendDeprecation: "MetaMask: 'ethereum.send(...)' is deprecated and may be removed in the future. Please use 'ethereum.sendAsync(...)' or 'ethereum.request(...)' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193",
                events: {
                    close: "MetaMask: The event 'close' is deprecated and may be removed in the future. Please use 'disconnect' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193#disconnect",
                    data: "MetaMask: The event 'data' is deprecated and will be removed in the future. Use 'message' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193#message",
                    networkChanged: "MetaMask: The event 'networkChanged' is deprecated and may be removed in the future. Use 'chainChanged' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193#chainchanged",
                    notification: "MetaMask: The event 'notification' is deprecated and may be removed in the future. Use 'message' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193#message"
                },
                experimentalMethods: "MetaMask: 'ethereum._metamask' exposes non-standard, experimental methods. They may be removed or changed without warning."
            }
        };
        r.default = n
    }, {}],
    7: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }), r.default = function(e, t = console) {
            let r = !1,
                n = !1;
            if (!window.web3) {
                const i = "__isMetaMaskShim__";
                let o = {
                    currentProvider: e
                };
                Object.defineProperty(o, i, {
                    value: !0,
                    enumerable: !0,
                    configurable: !1,
                    writable: !1
                }), o = new Proxy(o, {
                    get: (o, s, ...a) => ("currentProvider" !== s || r ? "currentProvider" === s || s === i || n || (n = !0, t.error("MetaMask no longer injects web3. For details, see: https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3"), e.request({
                        method: "metamask_logWeb3ShimUsage"
                    }).catch(e => {
                        t.debug("MetaMask: Failed to log web3 shim usage.", e)
                    })) : (r = !0, t.warn("You are accessing the MetaMask window.web3.currentProvider shim. This property is deprecated; use window.ethereum instead. For details, see: https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3")), Reflect.get(o, s, ...a)),
                    set: (...e) => (t.warn("You are accessing the MetaMask window.web3 shim. This object is deprecated; use window.ethereum instead. For details, see: https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3"), Reflect.set(...e))
                }), Object.defineProperty(window, "web3", {
                    value: o,
                    enumerable: !1,
                    configurable: !0,
                    writable: !0
                })
            }
        }
    }, {}],
    8: [function(e, t, r) {
        "use strict";
        var n = this && this.__importDefault || function(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        };
        Object.defineProperty(r, "__esModule", {
            value: !0
        });
        const i = n(e("./messages")),
            o = e("./utils");

        function s(e) {
            const {
                document: t
            } = e, r = t.querySelector('head > meta[property="og:site_name"]');
            if (r) return r.content;
            const n = t.querySelector('head > meta[name="title"]');
            return n ? n.content : t.title && t.title.length > 0 ? t.title : window.location.hostname
        }
        async function a(e) {
            const {
                document: t
            } = e, r = t.querySelectorAll('head > link[rel~="icon"]');
            for (const e of r)
                if (e && await u(e.href)) return e.href;
            return null
        }

        function u(e) {
            return new Promise((t, r) => {
                try {
                    const r = document.createElement("img");
                    r.onload = () => t(!0), r.onerror = () => t(!1), r.src = e
                } catch (e) {
                    r(e)
                }
            })
        }
        r.default = async function(e, t) {
            try {
                const t = await async function() {
                    return {
                        name: s(window),
                        icon: await a(window)
                    }
                }();
                e.handle({
                    jsonrpc: "2.0",
                    id: 1,
                    method: "metamask_sendDomainMetadata",
                    params: t
                }, o.NOOP)
            } catch (e) {
                t.error({
                    message: i.default.errors.sendSiteMetadata(),
                    originalError: e
                })
            }
        }
    }, {
        "./messages": 6,
        "./utils": 9
    }],
    9: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }), r.EMITTED_NOTIFICATIONS = r.NOOP = r.logStreamDisconnectWarning = r.getRpcPromiseCallback = r.createErrorMiddleware = void 0;
        const n = e("eth-rpc-errors");
        r.createErrorMiddleware = function(e) {
            return (t, r, i) => {
                "string" == typeof t.method && t.method || (r.error = n.ethErrors.rpc.invalidRequest({
                    message: "The request 'method' must be a non-empty string.",
                    data: t
                })), i(t => {
                    const {
                        error: n
                    } = r;
                    return n ? (e.error("MetaMask - RPC Error: " + n.message, n), t()) : t()
                })
            }
        };
        r.getRpcPromiseCallback = (e, t, r = !0) => (n, i) => {
            n || i.error ? t(n || i.error) : !r || Array.isArray(i) ? e(i) : e(i.result)
        }, r.logStreamDisconnectWarning = function(e, t, r, n) {
            let i = `MetaMask: Lost connection to "${t}".`;
            (null == r ? void 0 : r.stack) && (i += "\n" + r.stack), e.warn(i), n && n.listenerCount("error") > 0 && n.emit("error", i)
        };
        r.NOOP = () => {}, r.EMITTED_NOTIFICATIONS = ["eth_subscription"]
    }, {
        "eth-rpc-errors": 28
    }],
    10: [function(e, t, r) {
        "use strict";
        var n = Array.isArray,
            i = Object.keys,
            o = Object.prototype.hasOwnProperty;
        t.exports = function e(t, r) {
            if (t === r) return !0;
            if (t && r && "object" == typeof t && "object" == typeof r) {
                var s, a, u, c = n(t),
                    l = n(r);
                if (c && l) {
                    if ((a = t.length) != r.length) return !1;
                    for (s = a; 0 != s--;)
                        if (!e(t[s], r[s])) return !1;
                    return !0
                }
                if (c != l) return !1;
                var f = t instanceof Date,
                    d = r instanceof Date;
                if (f != d) return !1;
                if (f && d) return t.getTime() == r.getTime();
                var h = t instanceof RegExp,
                    p = r instanceof RegExp;
                if (h != p) return !1;
                if (h && p) return t.toString() == r.toString();
                var g = i(t);
                if ((a = g.length) !== i(r).length) return !1;
                for (s = a; 0 != s--;)
                    if (!o.call(r, g[s])) return !1;
                for (s = a; 0 != s--;)
                    if (!e(t[u = g[s]], r[u])) return !1;
                return !0
            }
            return t != t && r != r
        }
    }, {}],
    11: [function(e, t, r) {
        "use strict";
        const n = e => null !== e && "object" == typeof e && "function" == typeof e.pipe;
        n.writable = e => n(e) && !1 !== e.writable && "function" == typeof e._write && "object" == typeof e._writableState, n.readable = e => n(e) && !1 !== e.readable && "function" == typeof e._read && "object" == typeof e._readableState, n.duplex = e => n.writable(e) && n.readable(e), n.transform = e => n.duplex(e) && "function" == typeof e._transform && "object" == typeof e._transformState, t.exports = n
    }, {}],
    12: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        });
        const n = e("readable-stream");
        r.default = function(e) {
            if (!e || !e.engine) throw new Error("Missing engine parameter!");
            const {
                engine: t
            } = e, r = new n.Duplex({
                objectMode: !0,
                read: function() {
                    return
                },
                write: function(e, n, i) {
                    t.handle(e, (e, t) => {
                        r.push(t)
                    }), i()
                }
            });
            return t.on && t.on("notification", e => {
                r.push(e)
            }), r
        }
    }, {
        "readable-stream": 58
    }],
    13: [function(e, t, r) {
        "use strict";
        var n = this && this.__importDefault || function(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        };
        Object.defineProperty(r, "__esModule", {
            value: !0
        });
        const i = n(e("@metamask/safe-event-emitter")),
            o = e("readable-stream");
        r.default = function() {
            const e = {},
                t = new o.Duplex({
                    objectMode: !0,
                    read: function() {
                        return !1
                    },
                    write: function(t, n, i) {
                        let o;
                        try {
                            !t.id ? function(e) {
                                r.emit("notification", e)
                            }(t) : function(t) {
                                const r = e[t.id];
                                if (!r) throw new Error(`StreamMiddleware - Unknown response id "${t.id}"`);
                                delete e[t.id], Object.assign(r.res, t), setTimeout(r.end)
                            }(t)
                        } catch (e) {
                            o = e
                        }
                        i(o)
                    }
                }),
                r = new i.default;
            return {
                events: r,
                middleware: (r, n, i, o) => {
                    t.push(r), e[r.id] = {
                        req: r,
                        res: n,
                        next: i,
                        end: o
                    }
                },
                stream: t
            }
        }
    }, {
        "@metamask/safe-event-emitter": 18,
        "readable-stream": 58
    }],
    14: [function(e, t, r) {
        "use strict";
        var n = this && this.__importDefault || function(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        };
        Object.defineProperty(r, "__esModule", {
            value: !0
        }), r.createStreamMiddleware = r.createEngineStream = void 0;
        const i = n(e("./createEngineStream"));
        r.createEngineStream = i.default;
        const o = n(e("./createStreamMiddleware"));
        r.createStreamMiddleware = o.default
    }, {
        "./createEngineStream": 12,
        "./createStreamMiddleware": 13
    }],
    15: [function(e, t, r) {
        "use strict";
        var n = this && this.__importDefault || function(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        };
        Object.defineProperty(r, "__esModule", {
            value: !0
        }), r.ObjectMultiplex = void 0;
        const i = e("readable-stream"),
            o = n(e("end-of-stream")),
            s = n(e("once")),
            a = e("./Substream"),
            u = Symbol("IGNORE_SUBSTREAM");
        class c extends i.Duplex {
            constructor(e = {}) {
                super(Object.assign(Object.assign({}, e), {
                    objectMode: !0
                })), this._substreams = {}
            }
            createStream(e) {
                if (!e) throw new Error("ObjectMultiplex - name must not be empty");
                if (this._substreams[e]) throw new Error(`ObjectMultiplex - Substream for name "${e}" already exists`);
                const t = new a.Substream({
                    parent: this,
                    name: e
                });
                return this._substreams[e] = t,
                    function(e, t) {
                        const r = s.default(t);
                        o.default(e, {
                            readable: !1
                        }, r), o.default(e, {
                            writable: !1
                        }, r)
                    }(this, e => t.destroy(e || void 0)), t
            }
            ignoreStream(e) {
                if (!e) throw new Error("ObjectMultiplex - name must not be empty");
                if (this._substreams[e]) throw new Error(`ObjectMultiplex - Substream for name "${e}" already exists`);
                this._substreams[e] = u
            }
            _read() {}
            _write(e, t, r) {
                const {
                    name: n,
                    data: i
                } = e;
                if (!n) return console.warn(`ObjectMultiplex - malformed chunk without name "${e}"`), r();
                const o = this._substreams[n];
                return o ? (o !== u && o.push(i), r()) : (console.warn(`ObjectMultiplex - orphaned data for stream "${n}"`), r())
            }
        }
        r.ObjectMultiplex = c
    }, {
        "./Substream": 16,
        "end-of-stream": 24,
        once: 43,
        "readable-stream": 58
    }],
    16: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }), r.Substream = void 0;
        const n = e("readable-stream");
        class i extends n.Duplex {
            constructor({
                parent: e,
                name: t
            }) {
                super({
                    objectMode: !0
                }), this._parent = e, this._name = t
            }
            _read() {}
            _write(e, t, r) {
                this._parent.push({
                    name: this._name,
                    data: e
                }), r()
            }
        }
        r.Substream = i
    }, {
        "readable-stream": 58
    }],
    17: [function(e, t, r) {
        "use strict";
        const n = e("./ObjectMultiplex");
        t.exports = n.ObjectMultiplex
    }, {
        "./ObjectMultiplex": 15
    }],
    18: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        });
        const n = e("events");

        function i(e, t, r) {
            try {
                Reflect.apply(e, t, r)
            } catch (e) {
                setTimeout(() => {
                    throw e
                })
            }
        }
        class o extends n.EventEmitter {
            emit(e, ...t) {
                let r = "error" === e;
                const n = this._events;
                if (void 0 !== n) r = r && void 0 === n.error;
                else if (!r) return !1;
                if (r) {
                    let e;
                    if (t.length > 0 && ([e] = t), e instanceof Error) throw e;
                    const r = new Error("Unhandled error." + (e ? ` (${e.message})` : ""));
                    throw r.context = e, r
                }
                const o = n[e];
                if (void 0 === o) return !1;
                if ("function" == typeof o) i(o, this, t);
                else {
                    const e = o.length,
                        r = function(e) {
                            const t = e.length,
                                r = new Array(t);
                            for (let n = 0; n < t; n += 1) r[n] = e[n];
                            return r
                        }(o);
                    for (let n = 0; n < e; n += 1) i(r[n], this, t)
                }
                return !0
            }
        }
        r.default = o
    }, {
        events: 22
    }],
    19: [function(e, t, r) {
        "use strict";
        r.byteLength = function(e) {
            var t = c(e),
                r = t[0],
                n = t[1];
            return 3 * (r + n) / 4 - n
        }, r.toByteArray = function(e) {
            var t, r, n = c(e),
                s = n[0],
                a = n[1],
                u = new o(function(e, t, r) {
                    return 3 * (t + r) / 4 - r
                }(0, s, a)),
                l = 0,
                f = a > 0 ? s - 4 : s;
            for (r = 0; r < f; r += 4) t = i[e.charCodeAt(r)] << 18 | i[e.charCodeAt(r + 1)] << 12 | i[e.charCodeAt(r + 2)] << 6 | i[e.charCodeAt(r + 3)], u[l++] = t >> 16 & 255, u[l++] = t >> 8 & 255, u[l++] = 255 & t;
            2 === a && (t = i[e.charCodeAt(r)] << 2 | i[e.charCodeAt(r + 1)] >> 4, u[l++] = 255 & t);
            1 === a && (t = i[e.charCodeAt(r)] << 10 | i[e.charCodeAt(r + 1)] << 4 | i[e.charCodeAt(r + 2)] >> 2, u[l++] = t >> 8 & 255, u[l++] = 255 & t);
            return u
        }, r.fromByteArray = function(e) {
            for (var t, r = e.length, i = r % 3, o = [], s = 0, a = r - i; s < a; s += 16383) o.push(l(e, s, s + 16383 > a ? a : s + 16383));
            1 === i ? (t = e[r - 1], o.push(n[t >> 2] + n[t << 4 & 63] + "==")) : 2 === i && (t = (e[r - 2] << 8) + e[r - 1], o.push(n[t >> 10] + n[t >> 4 & 63] + n[t << 2 & 63] + "="));
            return o.join("")
        };
        for (var n = [], i = [], o = "undefined" != typeof Uint8Array ? Uint8Array : Array, s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", a = 0, u = s.length; a < u; ++a) n[a] = s[a], i[s.charCodeAt(a)] = a;

        function c(e) {
            var t = e.length;
            if (t % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
            var r = e.indexOf("=");
            return -1 === r && (r = t), [r, r === t ? 0 : 4 - r % 4]
        }

        function l(e, t, r) {
            for (var i, o, s = [], a = t; a < r; a += 3) i = (e[a] << 16 & 16711680) + (e[a + 1] << 8 & 65280) + (255 & e[a + 2]), s.push(n[(o = i) >> 18 & 63] + n[o >> 12 & 63] + n[o >> 6 & 63] + n[63 & o]);
            return s.join("")
        }
        i["-".charCodeAt(0)] = 62, i["_".charCodeAt(0)] = 63
    }, {}],
    20: [function(e, t, r) {}, {}],
    21: [function(e, t, r) {
        /*!
         * The buffer module from node.js, for the browser.
         *
         * @author   Feross Aboukhadijeh <https://feross.org>
         * @license  MIT
         */
        "use strict";
        var n = e("base64-js"),
            i = e("ieee754");
        r.Buffer = s, r.SlowBuffer = function(e) {
            +e != e && (e = 0);
            return s.alloc(+e)
        }, r.INSPECT_MAX_BYTES = 50;

        function o(e) {
            if (e > 2147483647) throw new RangeError('The value "' + e + '" is invalid for option "size"');
            var t = new Uint8Array(e);
            return t.__proto__ = s.prototype, t
        }

        function s(e, t, r) {
            if ("number" == typeof e) {
                if ("string" == typeof t) throw new TypeError('The "string" argument must be of type string. Received type number');
                return c(e)
            }
            return a(e, t, r)
        }

        function a(e, t, r) {
            if ("string" == typeof e) return function(e, t) {
                "string" == typeof t && "" !== t || (t = "utf8");
                if (!s.isEncoding(t)) throw new TypeError("Unknown encoding: " + t);
                var r = 0 | d(e, t),
                    n = o(r),
                    i = n.write(e, t);
                i !== r && (n = n.slice(0, i));
                return n
            }(e, t);
            if (ArrayBuffer.isView(e)) return l(e);
            if (null == e) throw TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof e);
            if (B(e, ArrayBuffer) || e && B(e.buffer, ArrayBuffer)) return function(e, t, r) {
                if (t < 0 || e.byteLength < t) throw new RangeError('"offset" is outside of buffer bounds');
                if (e.byteLength < t + (r || 0)) throw new RangeError('"length" is outside of buffer bounds');
                var n;
                n = void 0 === t && void 0 === r ? new Uint8Array(e) : void 0 === r ? new Uint8Array(e, t) : new Uint8Array(e, t, r);
                return n.__proto__ = s.prototype, n
            }(e, t, r);
            if ("number" == typeof e) throw new TypeError('The "value" argument must not be of type number. Received type number');
            var n = e.valueOf && e.valueOf();
            if (null != n && n !== e) return s.from(n, t, r);
            var i = function(e) {
                if (s.isBuffer(e)) {
                    var t = 0 | f(e.length),
                        r = o(t);
                    return 0 === r.length || e.copy(r, 0, 0, t), r
                }
                if (void 0 !== e.length) return "number" != typeof e.length || D(e.length) ? o(0) : l(e);
                if ("Buffer" === e.type && Array.isArray(e.data)) return l(e.data)
            }(e);
            if (i) return i;
            if ("undefined" != typeof Symbol && null != Symbol.toPrimitive && "function" == typeof e[Symbol.toPrimitive]) return s.from(e[Symbol.toPrimitive]("string"), t, r);
            throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof e)
        }

        function u(e) {
            if ("number" != typeof e) throw new TypeError('"size" argument must be of type number');
            if (e < 0) throw new RangeError('The value "' + e + '" is invalid for option "size"')
        }

        function c(e) {
            return u(e), o(e < 0 ? 0 : 0 | f(e))
        }

        function l(e) {
            for (var t = e.length < 0 ? 0 : 0 | f(e.length), r = o(t), n = 0; n < t; n += 1) r[n] = 255 & e[n];
            return r
        }

        function f(e) {
            if (e >= 2147483647) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + 2147483647..toString(16) + " bytes");
            return 0 | e
        }

        function d(e, t) {
            if (s.isBuffer(e)) return e.length;
            if (ArrayBuffer.isView(e) || B(e, ArrayBuffer)) return e.byteLength;
            if ("string" != typeof e) throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof e);
            var r = e.length,
                n = arguments.length > 2 && !0 === arguments[2];
            if (!n && 0 === r) return 0;
            for (var i = !1;;) switch (t) {
                case "ascii":
                case "latin1":
                case "binary":
                    return r;
                case "utf8":
                case "utf-8":
                    return N(e).length;
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                    return 2 * r;
                case "hex":
                    return r >>> 1;
                case "base64":
                    return U(e).length;
                default:
                    if (i) return n ? -1 : N(e).length;
                    t = ("" + t).toLowerCase(), i = !0
            }
        }

        function h(e, t, r) {
            var n = !1;
            if ((void 0 === t || t < 0) && (t = 0), t > this.length) return "";
            if ((void 0 === r || r > this.length) && (r = this.length), r <= 0) return "";
            if ((r >>>= 0) <= (t >>>= 0)) return "";
            for (e || (e = "utf8");;) switch (e) {
                case "hex":
                    return j(this, t, r);
                case "utf8":
                case "utf-8":
                    return M(this, t, r);
                case "ascii":
                    return k(this, t, r);
                case "latin1":
                case "binary":
                    return x(this, t, r);
                case "base64":
                    return S(this, t, r);
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                    return R(this, t, r);
                default:
                    if (n) throw new TypeError("Unknown encoding: " + e);
                    e = (e + "").toLowerCase(), n = !0
            }
        }

        function p(e, t, r) {
            var n = e[t];
            e[t] = e[r], e[r] = n
        }

        function g(e, t, r, n, i) {
            if (0 === e.length) return -1;
            if ("string" == typeof r ? (n = r, r = 0) : r > 2147483647 ? r = 2147483647 : r < -2147483648 && (r = -2147483648), D(r = +r) && (r = i ? 0 : e.length - 1), r < 0 && (r = e.length + r), r >= e.length) {
                if (i) return -1;
                r = e.length - 1
            } else if (r < 0) {
                if (!i) return -1;
                r = 0
            }
            if ("string" == typeof t && (t = s.from(t, n)), s.isBuffer(t)) return 0 === t.length ? -1 : m(e, t, r, n, i);
            if ("number" == typeof t) return t &= 255, "function" == typeof Uint8Array.prototype.indexOf ? i ? Uint8Array.prototype.indexOf.call(e, t, r) : Uint8Array.prototype.lastIndexOf.call(e, t, r) : m(e, [t], r, n, i);
            throw new TypeError("val must be string, number or Buffer")
        }

        function m(e, t, r, n, i) {
            var o, s = 1,
                a = e.length,
                u = t.length;
            if (void 0 !== n && ("ucs2" === (n = String(n).toLowerCase()) || "ucs-2" === n || "utf16le" === n || "utf-16le" === n)) {
                if (e.length < 2 || t.length < 2) return -1;
                s = 2, a /= 2, u /= 2, r /= 2
            }

            function c(e, t) {
                return 1 === s ? e[t] : e.readUInt16BE(t * s)
            }
            if (i) {
                var l = -1;
                for (o = r; o < a; o++)
                    if (c(e, o) === c(t, -1 === l ? 0 : o - l)) {
                        if (-1 === l && (l = o), o - l + 1 === u) return l * s
                    } else -1 !== l && (o -= o - l), l = -1
            } else
                for (r + u > a && (r = a - u), o = r; o >= 0; o--) {
                    for (var f = !0, d = 0; d < u; d++)
                        if (c(e, o + d) !== c(t, d)) {
                            f = !1;
                            break
                        } if (f) return o
                }
            return -1
        }

        function y(e, t, r, n) {
            r = Number(r) || 0;
            var i = e.length - r;
            n ? (n = Number(n)) > i && (n = i) : n = i;
            var o = t.length;
            n > o / 2 && (n = o / 2);
            for (var s = 0; s < n; ++s) {
                var a = parseInt(t.substr(2 * s, 2), 16);
                if (D(a)) return s;
                e[r + s] = a
            }
            return s
        }

        function b(e, t, r, n) {
            return q(N(t, e.length - r), e, r, n)
        }

        function w(e, t, r, n) {
            return q(function(e) {
                for (var t = [], r = 0; r < e.length; ++r) t.push(255 & e.charCodeAt(r));
                return t
            }(t), e, r, n)
        }

        function v(e, t, r, n) {
            return w(e, t, r, n)
        }

        function _(e, t, r, n) {
            return q(U(t), e, r, n)
        }

        function E(e, t, r, n) {
            return q(function(e, t) {
                for (var r, n, i, o = [], s = 0; s < e.length && !((t -= 2) < 0); ++s) r = e.charCodeAt(s), n = r >> 8, i = r % 256, o.push(i), o.push(n);
                return o
            }(t, e.length - r), e, r, n)
        }

        function S(e, t, r) {
            return 0 === t && r === e.length ? n.fromByteArray(e) : n.fromByteArray(e.slice(t, r))
        }

        function M(e, t, r) {
            r = Math.min(e.length, r);
            for (var n = [], i = t; i < r;) {
                var o, s, a, u, c = e[i],
                    l = null,
                    f = c > 239 ? 4 : c > 223 ? 3 : c > 191 ? 2 : 1;
                if (i + f <= r) switch (f) {
                    case 1:
                        c < 128 && (l = c);
                        break;
                    case 2:
                        128 == (192 & (o = e[i + 1])) && (u = (31 & c) << 6 | 63 & o) > 127 && (l = u);
                        break;
                    case 3:
                        o = e[i + 1], s = e[i + 2], 128 == (192 & o) && 128 == (192 & s) && (u = (15 & c) << 12 | (63 & o) << 6 | 63 & s) > 2047 && (u < 55296 || u > 57343) && (l = u);
                        break;
                    case 4:
                        o = e[i + 1], s = e[i + 2], a = e[i + 3], 128 == (192 & o) && 128 == (192 & s) && 128 == (192 & a) && (u = (15 & c) << 18 | (63 & o) << 12 | (63 & s) << 6 | 63 & a) > 65535 && u < 1114112 && (l = u)
                }
                null === l ? (l = 65533, f = 1) : l > 65535 && (l -= 65536, n.push(l >>> 10 & 1023 | 55296), l = 56320 | 1023 & l), n.push(l), i += f
            }
            return function(e) {
                var t = e.length;
                if (t <= 4096) return String.fromCharCode.apply(String, e);
                var r = "",
                    n = 0;
                for (; n < t;) r += String.fromCharCode.apply(String, e.slice(n, n += 4096));
                return r
            }(n)
        }
        r.kMaxLength = 2147483647, s.TYPED_ARRAY_SUPPORT = function() {
            try {
                var e = new Uint8Array(1);
                return e.__proto__ = {
                    __proto__: Uint8Array.prototype,
                    foo: function() {
                        return 42
                    }
                }, 42 === e.foo()
            } catch (e) {
                return !1
            }
        }(), s.TYPED_ARRAY_SUPPORT || "undefined" == typeof console || "function" != typeof console.error || console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."), Object.defineProperty(s.prototype, "parent", {
            enumerable: !0,
            get: function() {
                if (s.isBuffer(this)) return this.buffer
            }
        }), Object.defineProperty(s.prototype, "offset", {
            enumerable: !0,
            get: function() {
                if (s.isBuffer(this)) return this.byteOffset
            }
        }), "undefined" != typeof Symbol && null != Symbol.species && s[Symbol.species] === s && Object.defineProperty(s, Symbol.species, {
            value: null,
            configurable: !0,
            enumerable: !1,
            writable: !1
        }), s.poolSize = 8192, s.from = function(e, t, r) {
            return a(e, t, r)
        }, s.prototype.__proto__ = Uint8Array.prototype, s.__proto__ = Uint8Array, s.alloc = function(e, t, r) {
            return function(e, t, r) {
                return u(e), e <= 0 ? o(e) : void 0 !== t ? "string" == typeof r ? o(e).fill(t, r) : o(e).fill(t) : o(e)
            }(e, t, r)
        }, s.allocUnsafe = function(e) {
            return c(e)
        }, s.allocUnsafeSlow = function(e) {
            return c(e)
        }, s.isBuffer = function(e) {
            return null != e && !0 === e._isBuffer && e !== s.prototype
        }, s.compare = function(e, t) {
            if (B(e, Uint8Array) && (e = s.from(e, e.offset, e.byteLength)), B(t, Uint8Array) && (t = s.from(t, t.offset, t.byteLength)), !s.isBuffer(e) || !s.isBuffer(t)) throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
            if (e === t) return 0;
            for (var r = e.length, n = t.length, i = 0, o = Math.min(r, n); i < o; ++i)
                if (e[i] !== t[i]) {
                    r = e[i], n = t[i];
                    break
                } return r < n ? -1 : n < r ? 1 : 0
        }, s.isEncoding = function(e) {
            switch (String(e).toLowerCase()) {
                case "hex":
                case "utf8":
                case "utf-8":
                case "ascii":
                case "latin1":
                case "binary":
                case "base64":
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                    return !0;
                default:
                    return !1
            }
        }, s.concat = function(e, t) {
            if (!Array.isArray(e)) throw new TypeError('"list" argument must be an Array of Buffers');
            if (0 === e.length) return s.alloc(0);
            var r;
            if (void 0 === t)
                for (t = 0, r = 0; r < e.length; ++r) t += e[r].length;
            var n = s.allocUnsafe(t),
                i = 0;
            for (r = 0; r < e.length; ++r) {
                var o = e[r];
                if (B(o, Uint8Array) && (o = s.from(o)), !s.isBuffer(o)) throw new TypeError('"list" argument must be an Array of Buffers');
                o.copy(n, i), i += o.length
            }
            return n
        }, s.byteLength = d, s.prototype._isBuffer = !0, s.prototype.swap16 = function() {
            var e = this.length;
            if (e % 2 != 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
            for (var t = 0; t < e; t += 2) p(this, t, t + 1);
            return this
        }, s.prototype.swap32 = function() {
            var e = this.length;
            if (e % 4 != 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
            for (var t = 0; t < e; t += 4) p(this, t, t + 3), p(this, t + 1, t + 2);
            return this
        }, s.prototype.swap64 = function() {
            var e = this.length;
            if (e % 8 != 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
            for (var t = 0; t < e; t += 8) p(this, t, t + 7), p(this, t + 1, t + 6), p(this, t + 2, t + 5), p(this, t + 3, t + 4);
            return this
        }, s.prototype.toString = function() {
            var e = this.length;
            return 0 === e ? "" : 0 === arguments.length ? M(this, 0, e) : h.apply(this, arguments)
        }, s.prototype.toLocaleString = s.prototype.toString, s.prototype.equals = function(e) {
            if (!s.isBuffer(e)) throw new TypeError("Argument must be a Buffer");
            return this === e || 0 === s.compare(this, e)
        }, s.prototype.inspect = function() {
            var e = "",
                t = r.INSPECT_MAX_BYTES;
            return e = this.toString("hex", 0, t).replace(/(.{2})/g, "$1 ").trim(), this.length > t && (e += " ... "), "<Buffer " + e + ">"
        }, s.prototype.compare = function(e, t, r, n, i) {
            if (B(e, Uint8Array) && (e = s.from(e, e.offset, e.byteLength)), !s.isBuffer(e)) throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof e);
            if (void 0 === t && (t = 0), void 0 === r && (r = e ? e.length : 0), void 0 === n && (n = 0), void 0 === i && (i = this.length), t < 0 || r > e.length || n < 0 || i > this.length) throw new RangeError("out of range index");
            if (n >= i && t >= r) return 0;
            if (n >= i) return -1;
            if (t >= r) return 1;
            if (this === e) return 0;
            for (var o = (i >>>= 0) - (n >>>= 0), a = (r >>>= 0) - (t >>>= 0), u = Math.min(o, a), c = this.slice(n, i), l = e.slice(t, r), f = 0; f < u; ++f)
                if (c[f] !== l[f]) {
                    o = c[f], a = l[f];
                    break
                } return o < a ? -1 : a < o ? 1 : 0
        }, s.prototype.includes = function(e, t, r) {
            return -1 !== this.indexOf(e, t, r)
        }, s.prototype.indexOf = function(e, t, r) {
            return g(this, e, t, r, !0)
        }, s.prototype.lastIndexOf = function(e, t, r) {
            return g(this, e, t, r, !1)
        }, s.prototype.write = function(e, t, r, n) {
            if (void 0 === t) n = "utf8", r = this.length, t = 0;
            else if (void 0 === r && "string" == typeof t) n = t, r = this.length, t = 0;
            else {
                if (!isFinite(t)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
                t >>>= 0, isFinite(r) ? (r >>>= 0, void 0 === n && (n = "utf8")) : (n = r, r = void 0)
            }
            var i = this.length - t;
            if ((void 0 === r || r > i) && (r = i), e.length > 0 && (r < 0 || t < 0) || t > this.length) throw new RangeError("Attempt to write outside buffer bounds");
            n || (n = "utf8");
            for (var o = !1;;) switch (n) {
                case "hex":
                    return y(this, e, t, r);
                case "utf8":
                case "utf-8":
                    return b(this, e, t, r);
                case "ascii":
                    return w(this, e, t, r);
                case "latin1":
                case "binary":
                    return v(this, e, t, r);
                case "base64":
                    return _(this, e, t, r);
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                    return E(this, e, t, r);
                default:
                    if (o) throw new TypeError("Unknown encoding: " + n);
                    n = ("" + n).toLowerCase(), o = !0
            }
        }, s.prototype.toJSON = function() {
            return {
                type: "Buffer",
                data: Array.prototype.slice.call(this._arr || this, 0)
            }
        };

        function k(e, t, r) {
            var n = "";
            r = Math.min(e.length, r);
            for (var i = t; i < r; ++i) n += String.fromCharCode(127 & e[i]);
            return n
        }

        function x(e, t, r) {
            var n = "";
            r = Math.min(e.length, r);
            for (var i = t; i < r; ++i) n += String.fromCharCode(e[i]);
            return n
        }

        function j(e, t, r) {
            var n = e.length;
            (!t || t < 0) && (t = 0), (!r || r < 0 || r > n) && (r = n);
            for (var i = "", o = t; o < r; ++o) i += I(e[o]);
            return i
        }

        function R(e, t, r) {
            for (var n = e.slice(t, r), i = "", o = 0; o < n.length; o += 2) i += String.fromCharCode(n[o] + 256 * n[o + 1]);
            return i
        }

        function C(e, t, r) {
            if (e % 1 != 0 || e < 0) throw new RangeError("offset is not uint");
            if (e + t > r) throw new RangeError("Trying to access beyond buffer length")
        }

        function O(e, t, r, n, i, o) {
            if (!s.isBuffer(e)) throw new TypeError('"buffer" argument must be a Buffer instance');
            if (t > i || t < o) throw new RangeError('"value" argument is out of bounds');
            if (r + n > e.length) throw new RangeError("Index out of range")
        }

        function A(e, t, r, n, i, o) {
            if (r + n > e.length) throw new RangeError("Index out of range");
            if (r < 0) throw new RangeError("Index out of range")
        }

        function P(e, t, r, n, o) {
            return t = +t, r >>>= 0, o || A(e, 0, r, 4), i.write(e, t, r, n, 23, 4), r + 4
        }

        function T(e, t, r, n, o) {
            return t = +t, r >>>= 0, o || A(e, 0, r, 8), i.write(e, t, r, n, 52, 8), r + 8
        }
        s.prototype.slice = function(e, t) {
            var r = this.length;
            (e = ~~e) < 0 ? (e += r) < 0 && (e = 0) : e > r && (e = r), (t = void 0 === t ? r : ~~t) < 0 ? (t += r) < 0 && (t = 0) : t > r && (t = r), t < e && (t = e);
            var n = this.subarray(e, t);
            return n.__proto__ = s.prototype, n
        }, s.prototype.readUIntLE = function(e, t, r) {
            e >>>= 0, t >>>= 0, r || C(e, t, this.length);
            for (var n = this[e], i = 1, o = 0; ++o < t && (i *= 256);) n += this[e + o] * i;
            return n
        }, s.prototype.readUIntBE = function(e, t, r) {
            e >>>= 0, t >>>= 0, r || C(e, t, this.length);
            for (var n = this[e + --t], i = 1; t > 0 && (i *= 256);) n += this[e + --t] * i;
            return n
        }, s.prototype.readUInt8 = function(e, t) {
            return e >>>= 0, t || C(e, 1, this.length), this[e]
        }, s.prototype.readUInt16LE = function(e, t) {
            return e >>>= 0, t || C(e, 2, this.length), this[e] | this[e + 1] << 8
        }, s.prototype.readUInt16BE = function(e, t) {
            return e >>>= 0, t || C(e, 2, this.length), this[e] << 8 | this[e + 1]
        }, s.prototype.readUInt32LE = function(e, t) {
            return e >>>= 0, t || C(e, 4, this.length), (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + 16777216 * this[e + 3]
        }, s.prototype.readUInt32BE = function(e, t) {
            return e >>>= 0, t || C(e, 4, this.length), 16777216 * this[e] + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3])
        }, s.prototype.readIntLE = function(e, t, r) {
            e >>>= 0, t >>>= 0, r || C(e, t, this.length);
            for (var n = this[e], i = 1, o = 0; ++o < t && (i *= 256);) n += this[e + o] * i;
            return n >= (i *= 128) && (n -= Math.pow(2, 8 * t)), n
        }, s.prototype.readIntBE = function(e, t, r) {
            e >>>= 0, t >>>= 0, r || C(e, t, this.length);
            for (var n = t, i = 1, o = this[e + --n]; n > 0 && (i *= 256);) o += this[e + --n] * i;
            return o >= (i *= 128) && (o -= Math.pow(2, 8 * t)), o
        }, s.prototype.readInt8 = function(e, t) {
            return e >>>= 0, t || C(e, 1, this.length), 128 & this[e] ? -1 * (255 - this[e] + 1) : this[e]
        }, s.prototype.readInt16LE = function(e, t) {
            e >>>= 0, t || C(e, 2, this.length);
            var r = this[e] | this[e + 1] << 8;
            return 32768 & r ? 4294901760 | r : r
        }, s.prototype.readInt16BE = function(e, t) {
            e >>>= 0, t || C(e, 2, this.length);
            var r = this[e + 1] | this[e] << 8;
            return 32768 & r ? 4294901760 | r : r
        }, s.prototype.readInt32LE = function(e, t) {
            return e >>>= 0, t || C(e, 4, this.length), this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24
        }, s.prototype.readInt32BE = function(e, t) {
            return e >>>= 0, t || C(e, 4, this.length), this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]
        }, s.prototype.readFloatLE = function(e, t) {
            return e >>>= 0, t || C(e, 4, this.length), i.read(this, e, !0, 23, 4)
        }, s.prototype.readFloatBE = function(e, t) {
            return e >>>= 0, t || C(e, 4, this.length), i.read(this, e, !1, 23, 4)
        }, s.prototype.readDoubleLE = function(e, t) {
            return e >>>= 0, t || C(e, 8, this.length), i.read(this, e, !0, 52, 8)
        }, s.prototype.readDoubleBE = function(e, t) {
            return e >>>= 0, t || C(e, 8, this.length), i.read(this, e, !1, 52, 8)
        }, s.prototype.writeUIntLE = function(e, t, r, n) {
            (e = +e, t >>>= 0, r >>>= 0, n) || O(this, e, t, r, Math.pow(2, 8 * r) - 1, 0);
            var i = 1,
                o = 0;
            for (this[t] = 255 & e; ++o < r && (i *= 256);) this[t + o] = e / i & 255;
            return t + r
        }, s.prototype.writeUIntBE = function(e, t, r, n) {
            (e = +e, t >>>= 0, r >>>= 0, n) || O(this, e, t, r, Math.pow(2, 8 * r) - 1, 0);
            var i = r - 1,
                o = 1;
            for (this[t + i] = 255 & e; --i >= 0 && (o *= 256);) this[t + i] = e / o & 255;
            return t + r
        }, s.prototype.writeUInt8 = function(e, t, r) {
            return e = +e, t >>>= 0, r || O(this, e, t, 1, 255, 0), this[t] = 255 & e, t + 1
        }, s.prototype.writeUInt16LE = function(e, t, r) {
            return e = +e, t >>>= 0, r || O(this, e, t, 2, 65535, 0), this[t] = 255 & e, this[t + 1] = e >>> 8, t + 2
        }, s.prototype.writeUInt16BE = function(e, t, r) {
            return e = +e, t >>>= 0, r || O(this, e, t, 2, 65535, 0), this[t] = e >>> 8, this[t + 1] = 255 & e, t + 2
        }, s.prototype.writeUInt32LE = function(e, t, r) {
            return e = +e, t >>>= 0, r || O(this, e, t, 4, 4294967295, 0), this[t + 3] = e >>> 24, this[t + 2] = e >>> 16, this[t + 1] = e >>> 8, this[t] = 255 & e, t + 4
        }, s.prototype.writeUInt32BE = function(e, t, r) {
            return e = +e, t >>>= 0, r || O(this, e, t, 4, 4294967295, 0), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = 255 & e, t + 4
        }, s.prototype.writeIntLE = function(e, t, r, n) {
            if (e = +e, t >>>= 0, !n) {
                var i = Math.pow(2, 8 * r - 1);
                O(this, e, t, r, i - 1, -i)
            }
            var o = 0,
                s = 1,
                a = 0;
            for (this[t] = 255 & e; ++o < r && (s *= 256);) e < 0 && 0 === a && 0 !== this[t + o - 1] && (a = 1), this[t + o] = (e / s >> 0) - a & 255;
            return t + r
        }, s.prototype.writeIntBE = function(e, t, r, n) {
            if (e = +e, t >>>= 0, !n) {
                var i = Math.pow(2, 8 * r - 1);
                O(this, e, t, r, i - 1, -i)
            }
            var o = r - 1,
                s = 1,
                a = 0;
            for (this[t + o] = 255 & e; --o >= 0 && (s *= 256);) e < 0 && 0 === a && 0 !== this[t + o + 1] && (a = 1), this[t + o] = (e / s >> 0) - a & 255;
            return t + r
        }, s.prototype.writeInt8 = function(e, t, r) {
            return e = +e, t >>>= 0, r || O(this, e, t, 1, 127, -128), e < 0 && (e = 255 + e + 1), this[t] = 255 & e, t + 1
        }, s.prototype.writeInt16LE = function(e, t, r) {
            return e = +e, t >>>= 0, r || O(this, e, t, 2, 32767, -32768), this[t] = 255 & e, this[t + 1] = e >>> 8, t + 2
        }, s.prototype.writeInt16BE = function(e, t, r) {
            return e = +e, t >>>= 0, r || O(this, e, t, 2, 32767, -32768), this[t] = e >>> 8, this[t + 1] = 255 & e, t + 2
        }, s.prototype.writeInt32LE = function(e, t, r) {
            return e = +e, t >>>= 0, r || O(this, e, t, 4, 2147483647, -2147483648), this[t] = 255 & e, this[t + 1] = e >>> 8, this[t + 2] = e >>> 16, this[t + 3] = e >>> 24, t + 4
        }, s.prototype.writeInt32BE = function(e, t, r) {
            return e = +e, t >>>= 0, r || O(this, e, t, 4, 2147483647, -2147483648), e < 0 && (e = 4294967295 + e + 1), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = 255 & e, t + 4
        }, s.prototype.writeFloatLE = function(e, t, r) {
            return P(this, e, t, !0, r)
        }, s.prototype.writeFloatBE = function(e, t, r) {
            return P(this, e, t, !1, r)
        }, s.prototype.writeDoubleLE = function(e, t, r) {
            return T(this, e, t, !0, r)
        }, s.prototype.writeDoubleBE = function(e, t, r) {
            return T(this, e, t, !1, r)
        }, s.prototype.copy = function(e, t, r, n) {
            if (!s.isBuffer(e)) throw new TypeError("argument should be a Buffer");
            if (r || (r = 0), n || 0 === n || (n = this.length), t >= e.length && (t = e.length), t || (t = 0), n > 0 && n < r && (n = r), n === r) return 0;
            if (0 === e.length || 0 === this.length) return 0;
            if (t < 0) throw new RangeError("targetStart out of bounds");
            if (r < 0 || r >= this.length) throw new RangeError("Index out of range");
            if (n < 0) throw new RangeError("sourceEnd out of bounds");
            n > this.length && (n = this.length), e.length - t < n - r && (n = e.length - t + r);
            var i = n - r;
            if (this === e && "function" == typeof Uint8Array.prototype.copyWithin) this.copyWithin(t, r, n);
            else if (this === e && r < t && t < n)
                for (var o = i - 1; o >= 0; --o) e[o + t] = this[o + r];
            else Uint8Array.prototype.set.call(e, this.subarray(r, n), t);
            return i
        }, s.prototype.fill = function(e, t, r, n) {
            if ("string" == typeof e) {
                if ("string" == typeof t ? (n = t, t = 0, r = this.length) : "string" == typeof r && (n = r, r = this.length), void 0 !== n && "string" != typeof n) throw new TypeError("encoding must be a string");
                if ("string" == typeof n && !s.isEncoding(n)) throw new TypeError("Unknown encoding: " + n);
                if (1 === e.length) {
                    var i = e.charCodeAt(0);
                    ("utf8" === n && i < 128 || "latin1" === n) && (e = i)
                }
            } else "number" == typeof e && (e &= 255);
            if (t < 0 || this.length < t || this.length < r) throw new RangeError("Out of range index");
            if (r <= t) return this;
            var o;
            if (t >>>= 0, r = void 0 === r ? this.length : r >>> 0, e || (e = 0), "number" == typeof e)
                for (o = t; o < r; ++o) this[o] = e;
            else {
                var a = s.isBuffer(e) ? e : s.from(e, n),
                    u = a.length;
                if (0 === u) throw new TypeError('The value "' + e + '" is invalid for argument "value"');
                for (o = 0; o < r - t; ++o) this[o + t] = a[o % u]
            }
            return this
        };
        var L = /[^+/0-9A-Za-z-_]/g;

        function I(e) {
            return e < 16 ? "0" + e.toString(16) : e.toString(16)
        }

        function N(e, t) {
            var r;
            t = t || 1 / 0;
            for (var n = e.length, i = null, o = [], s = 0; s < n; ++s) {
                if ((r = e.charCodeAt(s)) > 55295 && r < 57344) {
                    if (!i) {
                        if (r > 56319) {
                            (t -= 3) > -1 && o.push(239, 191, 189);
                            continue
                        }
                        if (s + 1 === n) {
                            (t -= 3) > -1 && o.push(239, 191, 189);
                            continue
                        }
                        i = r;
                        continue
                    }
                    if (r < 56320) {
                        (t -= 3) > -1 && o.push(239, 191, 189), i = r;
                        continue
                    }
                    r = 65536 + (i - 55296 << 10 | r - 56320)
                } else i && (t -= 3) > -1 && o.push(239, 191, 189);
                if (i = null, r < 128) {
                    if ((t -= 1) < 0) break;
                    o.push(r)
                } else if (r < 2048) {
                    if ((t -= 2) < 0) break;
                    o.push(r >> 6 | 192, 63 & r | 128)
                } else if (r < 65536) {
                    if ((t -= 3) < 0) break;
                    o.push(r >> 12 | 224, r >> 6 & 63 | 128, 63 & r | 128)
                } else {
                    if (!(r < 1114112)) throw new Error("Invalid code point");
                    if ((t -= 4) < 0) break;
                    o.push(r >> 18 | 240, r >> 12 & 63 | 128, r >> 6 & 63 | 128, 63 & r | 128)
                }
            }
            return o
        }

        function U(e) {
            return n.toByteArray(function(e) {
                if ((e = (e = e.split("=")[0]).trim().replace(L, "")).length < 2) return "";
                for (; e.length % 4 != 0;) e += "=";
                return e
            }(e))
        }

        function q(e, t, r, n) {
            for (var i = 0; i < n && !(i + r >= t.length || i >= e.length); ++i) t[i + r] = e[i];
            return i
        }

        function B(e, t) {
            return e instanceof t || null != e && null != e.constructor && null != e.constructor.name && e.constructor.name === t.name
        }

        function D(e) {
            return e != e
        }
    }, {
        "base64-js": 19,
        ieee754: 31
    }],
    22: [function(e, t, r) {
        var n = Object.create || function(e) {
                var t = function() {};
                return t.prototype = e, new t
            },
            i = Object.keys || function(e) {
                var t = [];
                for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.push(r);
                return r
            },
            o = Function.prototype.bind || function(e) {
                var t = this;
                return function() {
                    return t.apply(e, arguments)
                }
            };

        function s() {
            this._events && Object.prototype.hasOwnProperty.call(this, "_events") || (this._events = n(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0
        }
        t.exports = s, s.EventEmitter = s, s.prototype._events = void 0, s.prototype._maxListeners = void 0;
        var a, u = 10;
        try {
            var c = {};
            Object.defineProperty && Object.defineProperty(c, "x", {
                value: 0
            }), a = 0 === c.x
        } catch (e) {
            a = !1
        }

        function l(e) {
            return void 0 === e._maxListeners ? s.defaultMaxListeners : e._maxListeners
        }

        function f(e, t, r) {
            if (t) e.call(r);
            else
                for (var n = e.length, i = _(e, n), o = 0; o < n; ++o) i[o].call(r)
        }

        function d(e, t, r, n) {
            if (t) e.call(r, n);
            else
                for (var i = e.length, o = _(e, i), s = 0; s < i; ++s) o[s].call(r, n)
        }

        function h(e, t, r, n, i) {
            if (t) e.call(r, n, i);
            else
                for (var o = e.length, s = _(e, o), a = 0; a < o; ++a) s[a].call(r, n, i)
        }

        function p(e, t, r, n, i, o) {
            if (t) e.call(r, n, i, o);
            else
                for (var s = e.length, a = _(e, s), u = 0; u < s; ++u) a[u].call(r, n, i, o)
        }

        function g(e, t, r, n) {
            if (t) e.apply(r, n);
            else
                for (var i = e.length, o = _(e, i), s = 0; s < i; ++s) o[s].apply(r, n)
        }

        function m(e, t, r, i) {
            var o, s, a;
            if ("function" != typeof r) throw new TypeError('"listener" argument must be a function');
            if ((s = e._events) ? (s.newListener && (e.emit("newListener", t, r.listener ? r.listener : r), s = e._events), a = s[t]) : (s = e._events = n(null), e._eventsCount = 0), a) {
                if ("function" == typeof a ? a = s[t] = i ? [r, a] : [a, r] : i ? a.unshift(r) : a.push(r), !a.warned && (o = l(e)) && o > 0 && a.length > o) {
                    a.warned = !0;
                    var u = new Error("Possible EventEmitter memory leak detected. " + a.length + ' "' + String(t) + '" listeners added. Use emitter.setMaxListeners() to increase limit.');
                    u.name = "MaxListenersExceededWarning", u.emitter = e, u.type = t, u.count = a.length, "object" == typeof console && console.warn && console.warn("%s: %s", u.name, u.message)
                }
            } else a = s[t] = r, ++e._eventsCount;
            return e
        }

        function y() {
            if (!this.fired) switch (this.target.removeListener(this.type, this.wrapFn), this.fired = !0, arguments.length) {
                case 0:
                    return this.listener.call(this.target);
                case 1:
                    return this.listener.call(this.target, arguments[0]);
                case 2:
                    return this.listener.call(this.target, arguments[0], arguments[1]);
                case 3:
                    return this.listener.call(this.target, arguments[0], arguments[1], arguments[2]);
                default:
                    for (var e = new Array(arguments.length), t = 0; t < e.length; ++t) e[t] = arguments[t];
                    this.listener.apply(this.target, e)
            }
        }

        function b(e, t, r) {
            var n = {
                    fired: !1,
                    wrapFn: void 0,
                    target: e,
                    type: t,
                    listener: r
                },
                i = o.call(y, n);
            return i.listener = r, n.wrapFn = i, i
        }

        function w(e, t, r) {
            var n = e._events;
            if (!n) return [];
            var i = n[t];
            return i ? "function" == typeof i ? r ? [i.listener || i] : [i] : r ? function(e) {
                for (var t = new Array(e.length), r = 0; r < t.length; ++r) t[r] = e[r].listener || e[r];
                return t
            }(i) : _(i, i.length) : []
        }

        function v(e) {
            var t = this._events;
            if (t) {
                var r = t[e];
                if ("function" == typeof r) return 1;
                if (r) return r.length
            }
            return 0
        }

        function _(e, t) {
            for (var r = new Array(t), n = 0; n < t; ++n) r[n] = e[n];
            return r
        }
        a ? Object.defineProperty(s, "defaultMaxListeners", {
            enumerable: !0,
            get: function() {
                return u
            },
            set: function(e) {
                if ("number" != typeof e || e < 0 || e != e) throw new TypeError('"defaultMaxListeners" must be a positive number');
                u = e
            }
        }) : s.defaultMaxListeners = u, s.prototype.setMaxListeners = function(e) {
            if ("number" != typeof e || e < 0 || isNaN(e)) throw new TypeError('"n" argument must be a positive number');
            return this._maxListeners = e, this
        }, s.prototype.getMaxListeners = function() {
            return l(this)
        }, s.prototype.emit = function(e) {
            var t, r, n, i, o, s, a = "error" === e;
            if (s = this._events) a = a && null == s.error;
            else if (!a) return !1;
            if (a) {
                if (arguments.length > 1 && (t = arguments[1]), t instanceof Error) throw t;
                var u = new Error('Unhandled "error" event. (' + t + ")");
                throw u.context = t, u
            }
            if (!(r = s[e])) return !1;
            var c = "function" == typeof r;
            switch (n = arguments.length) {
                case 1:
                    f(r, c, this);
                    break;
                case 2:
                    d(r, c, this, arguments[1]);
                    break;
                case 3:
                    h(r, c, this, arguments[1], arguments[2]);
                    break;
                case 4:
                    p(r, c, this, arguments[1], arguments[2], arguments[3]);
                    break;
                default:
                    for (i = new Array(n - 1), o = 1; o < n; o++) i[o - 1] = arguments[o];
                    g(r, c, this, i)
            }
            return !0
        }, s.prototype.addListener = function(e, t) {
            return m(this, e, t, !1)
        }, s.prototype.on = s.prototype.addListener, s.prototype.prependListener = function(e, t) {
            return m(this, e, t, !0)
        }, s.prototype.once = function(e, t) {
            if ("function" != typeof t) throw new TypeError('"listener" argument must be a function');
            return this.on(e, b(this, e, t)), this
        }, s.prototype.prependOnceListener = function(e, t) {
            if ("function" != typeof t) throw new TypeError('"listener" argument must be a function');
            return this.prependListener(e, b(this, e, t)), this
        }, s.prototype.removeListener = function(e, t) {
            var r, i, o, s, a;
            if ("function" != typeof t) throw new TypeError('"listener" argument must be a function');
            if (!(i = this._events)) return this;
            if (!(r = i[e])) return this;
            if (r === t || r.listener === t) 0 == --this._eventsCount ? this._events = n(null) : (delete i[e], i.removeListener && this.emit("removeListener", e, r.listener || t));
            else if ("function" != typeof r) {
                for (o = -1, s = r.length - 1; s >= 0; s--)
                    if (r[s] === t || r[s].listener === t) {
                        a = r[s].listener, o = s;
                        break
                    } if (o < 0) return this;
                0 === o ? r.shift() : function(e, t) {
                    for (var r = t, n = r + 1, i = e.length; n < i; r += 1, n += 1) e[r] = e[n];
                    e.pop()
                }(r, o), 1 === r.length && (i[e] = r[0]), i.removeListener && this.emit("removeListener", e, a || t)
            }
            return this
        }, s.prototype.removeAllListeners = function(e) {
            var t, r, o;
            if (!(r = this._events)) return this;
            if (!r.removeListener) return 0 === arguments.length ? (this._events = n(null), this._eventsCount = 0) : r[e] && (0 == --this._eventsCount ? this._events = n(null) : delete r[e]), this;
            if (0 === arguments.length) {
                var s, a = i(r);
                for (o = 0; o < a.length; ++o) "removeListener" !== (s = a[o]) && this.removeAllListeners(s);
                return this.removeAllListeners("removeListener"), this._events = n(null), this._eventsCount = 0, this
            }
            if ("function" == typeof(t = r[e])) this.removeListener(e, t);
            else if (t)
                for (o = t.length - 1; o >= 0; o--) this.removeListener(e, t[o]);
            return this
        }, s.prototype.listeners = function(e) {
            return w(this, e, !0)
        }, s.prototype.rawListeners = function(e) {
            return w(this, e, !1)
        }, s.listenerCount = function(e, t) {
            return "function" == typeof e.listenerCount ? e.listenerCount(t) : v.call(e, t)
        }, s.prototype.listenerCount = v, s.prototype.eventNames = function() {
            return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : []
        }
    }, {}],
    23: [function(e, t, r) {
        (function(e) {
            function t(e) {
                return Object.prototype.toString.call(e)
            }
            r.isArray = function(e) {
                return Array.isArray ? Array.isArray(e) : "[object Array]" === t(e)
            }, r.isBoolean = function(e) {
                return "boolean" == typeof e
            }, r.isNull = function(e) {
                return null === e
            }, r.isNullOrUndefined = function(e) {
                return null == e
            }, r.isNumber = function(e) {
                return "number" == typeof e
            }, r.isString = function(e) {
                return "string" == typeof e
            }, r.isSymbol = function(e) {
                return "symbol" == typeof e
            }, r.isUndefined = function(e) {
                return void 0 === e
            }, r.isRegExp = function(e) {
                return "[object RegExp]" === t(e)
            }, r.isObject = function(e) {
                return "object" == typeof e && null !== e
            }, r.isDate = function(e) {
                return "[object Date]" === t(e)
            }, r.isError = function(e) {
                return "[object Error]" === t(e) || e instanceof Error
            }, r.isFunction = function(e) {
                return "function" == typeof e
            }, r.isPrimitive = function(e) {
                return null === e || "boolean" == typeof e || "number" == typeof e || "string" == typeof e || "symbol" == typeof e || void 0 === e
            }, r.isBuffer = e.isBuffer
        }).call(this, {
            isBuffer: e("../../is-buffer/index.js")
        })
    }, {
        "../../is-buffer/index.js": 33
    }],
    24: [function(e, t, r) {
        (function(r) {
            var n = e("once"),
                i = function() {},
                o = function(e, t, s) {
                    if ("function" == typeof t) return o(e, null, t);
                    t || (t = {}), s = n(s || i);
                    var a = e._writableState,
                        u = e._readableState,
                        c = t.readable || !1 !== t.readable && e.readable,
                        l = t.writable || !1 !== t.writable && e.writable,
                        f = !1,
                        d = function() {
                            e.writable || h()
                        },
                        h = function() {
                            l = !1, c || s.call(e)
                        },
                        p = function() {
                            c = !1, l || s.call(e)
                        },
                        g = function(t) {
                            s.call(e, t ? new Error("exited with error code: " + t) : null)
                        },
                        m = function(t) {
                            s.call(e, t)
                        },
                        y = function() {
                            r.nextTick(b)
                        },
                        b = function() {
                            if (!f) return (!c || u && u.ended && !u.destroyed) && (!l || a && a.ended && !a.destroyed) ? void 0 : s.call(e, new Error("premature close"))
                        },
                        w = function() {
                            e.req.on("finish", h)
                        };
                    return ! function(e) {
                            return e.setHeader && "function" == typeof e.abort
                        }(e) ? l && !a && (e.on("end", d), e.on("close", d)) : (e.on("complete", h), e.on("abort", y), e.req ? w() : e.on("request", w)),
                        function(e) {
                            return e.stdio && Array.isArray(e.stdio) && 3 === e.stdio.length
                        }(e) && e.on("exit", g), e.on("end", p), e.on("finish", h), !1 !== t.error && e.on("error", m), e.on("close", y),
                        function() {
                            f = !0, e.removeListener("complete", h), e.removeListener("abort", y), e.removeListener("request", w), e.req && e.req.removeListener("finish", h), e.removeListener("end", d), e.removeListener("close", d), e.removeListener("finish", h), e.removeListener("exit", g), e.removeListener("end", p), e.removeListener("error", m), e.removeListener("close", y)
                        }
                };
            t.exports = o
        }).call(this, e("_process"))
    }, {
        _process: 45,
        once: 43
    }],
    25: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }), r.EthereumProviderError = r.EthereumRpcError = void 0;
        const n = e("fast-safe-stringify");
        class i extends Error {
            constructor(e, t, r) {
                if (!Number.isInteger(e)) throw new Error('"code" must be an integer.');
                if (!t || "string" != typeof t) throw new Error('"message" must be a nonempty string.');
                super(t), this.code = e, void 0 !== r && (this.data = r)
            }
            serialize() {
                const e = {
                    code: this.code,
                    message: this.message
                };
                return void 0 !== this.data && (e.data = this.data), this.stack && (e.stack = this.stack), e
            }
            toString() {
                return n.default(this.serialize(), o, 2)
            }
        }
        r.EthereumRpcError = i;

        function o(e, t) {
            if ("[Circular]" !== t) return t
        }
        r.EthereumProviderError = class extends i {
            constructor(e, t, r) {
                if (! function(e) {
                        return Number.isInteger(e) && e >= 1e3 && e <= 4999
                    }(e)) throw new Error('"code" must be an integer such that: 1000 <= code <= 4999');
                super(e, t, r)
            }
        }
    }, {
        "fast-safe-stringify": 30
    }],
    26: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }), r.errorValues = r.errorCodes = void 0, r.errorCodes = {
            rpc: {
                invalidInput: -32e3,
                resourceNotFound: -32001,
                resourceUnavailable: -32002,
                transactionRejected: -32003,
                methodNotSupported: -32004,
                limitExceeded: -32005,
                parse: -32700,
                invalidRequest: -32600,
                methodNotFound: -32601,
                invalidParams: -32602,
                internal: -32603
            },
            provider: {
                userRejectedRequest: 4001,
                unauthorized: 4100,
                unsupportedMethod: 4200,
                disconnected: 4900,
                chainDisconnected: 4901
            }
        }, r.errorValues = {
            "-32700": {
                standard: "JSON RPC 2.0",
                message: "Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text."
            },
            "-32600": {
                standard: "JSON RPC 2.0",
                message: "The JSON sent is not a valid Request object."
            },
            "-32601": {
                standard: "JSON RPC 2.0",
                message: "The method does not exist / is not available."
            },
            "-32602": {
                standard: "JSON RPC 2.0",
                message: "Invalid method parameter(s)."
            },
            "-32603": {
                standard: "JSON RPC 2.0",
                message: "Internal JSON-RPC error."
            },
            "-32000": {
                standard: "EIP-1474",
                message: "Invalid input."
            },
            "-32001": {
                standard: "EIP-1474",
                message: "Resource not found."
            },
            "-32002": {
                standard: "EIP-1474",
                message: "Resource unavailable."
            },
            "-32003": {
                standard: "EIP-1474",
                message: "Transaction rejected."
            },
            "-32004": {
                standard: "EIP-1474",
                message: "Method not supported."
            },
            "-32005": {
                standard: "EIP-1474",
                message: "Request limit exceeded."
            },
            4001: {
                standard: "EIP-1193",
                message: "User rejected the request."
            },
            4100: {
                standard: "EIP-1193",
                message: "The requested account and/or method has not been authorized by the user."
            },
            4200: {
                standard: "EIP-1193",
                message: "The requested method is not supported by this Ethereum provider."
            },
            4900: {
                standard: "EIP-1193",
                message: "The provider is disconnected from all chains."
            },
            4901: {
                standard: "EIP-1193",
                message: "The provider is disconnected from the specified chain."
            }
        }
    }, {}],
    27: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }), r.ethErrors = void 0;
        const n = e("./classes"),
            i = e("./utils"),
            o = e("./error-constants");

        function s(e, t) {
            const [r, o] = u(t);
            return new n.EthereumRpcError(e, r || i.getMessageFromCode(e), o)
        }

        function a(e, t) {
            const [r, o] = u(t);
            return new n.EthereumProviderError(e, r || i.getMessageFromCode(e), o)
        }

        function u(e) {
            if (e) {
                if ("string" == typeof e) return [e];
                if ("object" == typeof e && !Array.isArray(e)) {
                    const {
                        message: t,
                        data: r
                    } = e;
                    if (t && "string" != typeof t) throw new Error("Must specify string message.");
                    return [t || void 0, r]
                }
            }
            return []
        }
        r.ethErrors = {
            rpc: {
                parse: e => s(o.errorCodes.rpc.parse, e),
                invalidRequest: e => s(o.errorCodes.rpc.invalidRequest, e),
                invalidParams: e => s(o.errorCodes.rpc.invalidParams, e),
                methodNotFound: e => s(o.errorCodes.rpc.methodNotFound, e),
                internal: e => s(o.errorCodes.rpc.internal, e),
                server: e => {
                    if (!e || "object" != typeof e || Array.isArray(e)) throw new Error("Ethereum RPC Server errors must provide single object argument.");
                    const {
                        code: t
                    } = e;
                    if (!Number.isInteger(t) || t > -32005 || t < -32099) throw new Error('"code" must be an integer such that: -32099 <= code <= -32005');
                    return s(t, e)
                },
                invalidInput: e => s(o.errorCodes.rpc.invalidInput, e),
                resourceNotFound: e => s(o.errorCodes.rpc.resourceNotFound, e),
                resourceUnavailable: e => s(o.errorCodes.rpc.resourceUnavailable, e),
                transactionRejected: e => s(o.errorCodes.rpc.transactionRejected, e),
                methodNotSupported: e => s(o.errorCodes.rpc.methodNotSupported, e),
                limitExceeded: e => s(o.errorCodes.rpc.limitExceeded, e)
            },
            provider: {
                userRejectedRequest: e => a(o.errorCodes.provider.userRejectedRequest, e),
                unauthorized: e => a(o.errorCodes.provider.unauthorized, e),
                unsupportedMethod: e => a(o.errorCodes.provider.unsupportedMethod, e),
                disconnected: e => a(o.errorCodes.provider.disconnected, e),
                chainDisconnected: e => a(o.errorCodes.provider.chainDisconnected, e),
                custom: e => {
                    if (!e || "object" != typeof e || Array.isArray(e)) throw new Error("Ethereum Provider custom errors must provide single object argument.");
                    const {
                        code: t,
                        message: r,
                        data: i
                    } = e;
                    if (!r || "string" != typeof r) throw new Error('"message" must be a nonempty string');
                    return new n.EthereumProviderError(t, r, i)
                }
            }
        }
    }, {
        "./classes": 25,
        "./error-constants": 26,
        "./utils": 29
    }],
    28: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }), r.getMessageFromCode = r.serializeError = r.EthereumProviderError = r.EthereumRpcError = r.ethErrors = r.errorCodes = void 0;
        const n = e("./classes");
        Object.defineProperty(r, "EthereumRpcError", {
            enumerable: !0,
            get: function() {
                return n.EthereumRpcError
            }
        }), Object.defineProperty(r, "EthereumProviderError", {
            enumerable: !0,
            get: function() {
                return n.EthereumProviderError
            }
        });
        const i = e("./utils");
        Object.defineProperty(r, "serializeError", {
            enumerable: !0,
            get: function() {
                return i.serializeError
            }
        }), Object.defineProperty(r, "getMessageFromCode", {
            enumerable: !0,
            get: function() {
                return i.getMessageFromCode
            }
        });
        const o = e("./errors");
        Object.defineProperty(r, "ethErrors", {
            enumerable: !0,
            get: function() {
                return o.ethErrors
            }
        });
        const s = e("./error-constants");
        Object.defineProperty(r, "errorCodes", {
            enumerable: !0,
            get: function() {
                return s.errorCodes
            }
        })
    }, {
        "./classes": 25,
        "./error-constants": 26,
        "./errors": 27,
        "./utils": 29
    }],
    29: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }), r.serializeError = r.isValidCode = r.getMessageFromCode = r.JSON_RPC_SERVER_ERROR_MESSAGE = void 0;
        const n = e("./error-constants"),
            i = e("./classes"),
            o = n.errorCodes.rpc.internal,
            s = {
                code: o,
                message: a(o)
            };

        function a(e, t = "Unspecified error message. This is a bug, please report it.") {
            if (Number.isInteger(e)) {
                const t = e.toString();
                if (f(n.errorValues, t)) return n.errorValues[t].message;
                if (c(e)) return r.JSON_RPC_SERVER_ERROR_MESSAGE
            }
            return t
        }

        function u(e) {
            if (!Number.isInteger(e)) return !1;
            const t = e.toString();
            return !!n.errorValues[t] || !!c(e)
        }

        function c(e) {
            return e >= -32099 && e <= -32e3
        }

        function l(e) {
            return e && "object" == typeof e && !Array.isArray(e) ? Object.assign({}, e) : e
        }

        function f(e, t) {
            return Object.prototype.hasOwnProperty.call(e, t)
        }
        r.JSON_RPC_SERVER_ERROR_MESSAGE = "Unspecified server error.", r.getMessageFromCode = a, r.isValidCode = u, r.serializeError = function(e, {
            fallbackError: t = s,
            shouldIncludeStack: r = !1
        } = {}) {
            var n, o;
            if (!t || !Number.isInteger(t.code) || "string" != typeof t.message) throw new Error("Must provide fallback error with integer number code and string message.");
            if (e instanceof i.EthereumRpcError) return e.serialize();
            const c = {};
            if (e && "object" == typeof e && !Array.isArray(e) && f(e, "code") && u(e.code)) {
                const t = e;
                c.code = t.code, t.message && "string" == typeof t.message ? (c.message = t.message, f(t, "data") && (c.data = t.data)) : (c.message = a(c.code), c.data = {
                    originalError: l(e)
                })
            } else {
                c.code = t.code;
                const r = null === (n = e) || void 0 === n ? void 0 : n.message;
                c.message = r && "string" == typeof r ? r : t.message, c.data = {
                    originalError: l(e)
                }
            }
            const d = null === (o = e) || void 0 === o ? void 0 : o.stack;
            return r && e && d && "string" == typeof d && (c.stack = d), c
        }
    }, {
        "./classes": 25,
        "./error-constants": 26
    }],
    30: [function(e, t, r) {
        t.exports = o, o.default = o, o.stable = a, o.stableStringify = a;
        var n = [],
            i = [];

        function o(e, t, r) {
            var o;
            for (! function e(t, r, o, s) {
                    var a;
                    if ("object" == typeof t && null !== t) {
                        for (a = 0; a < o.length; a++)
                            if (o[a] === t) {
                                var u = Object.getOwnPropertyDescriptor(s, r);
                                return void(void 0 !== u.get ? u.configurable ? (Object.defineProperty(s, r, {
                                    value: "[Circular]"
                                }), n.push([s, r, t, u])) : i.push([t, r]) : (s[r] = "[Circular]", n.push([s, r, t])))
                            } if (o.push(t), Array.isArray(t))
                            for (a = 0; a < t.length; a++) e(t[a], a, o, t);
                        else {
                            var c = Object.keys(t);
                            for (a = 0; a < c.length; a++) {
                                var l = c[a];
                                e(t[l], l, o, t)
                            }
                        }
                        o.pop()
                    }
                }(e, "", [], void 0), o = 0 === i.length ? JSON.stringify(e, t, r) : JSON.stringify(e, u(t), r); 0 !== n.length;) {
                var s = n.pop();
                4 === s.length ? Object.defineProperty(s[0], s[1], s[3]) : s[0][s[1]] = s[2]
            }
            return o
        }

        function s(e, t) {
            return e < t ? -1 : e > t ? 1 : 0
        }

        function a(e, t, r) {
            var o, a = function e(t, r, o, a) {
                var u;
                if ("object" == typeof t && null !== t) {
                    for (u = 0; u < o.length; u++)
                        if (o[u] === t) {
                            var c = Object.getOwnPropertyDescriptor(a, r);
                            return void(void 0 !== c.get ? c.configurable ? (Object.defineProperty(a, r, {
                                value: "[Circular]"
                            }), n.push([a, r, t, c])) : i.push([t, r]) : (a[r] = "[Circular]", n.push([a, r, t])))
                        } if ("function" == typeof t.toJSON) return;
                    if (o.push(t), Array.isArray(t))
                        for (u = 0; u < t.length; u++) e(t[u], u, o, t);
                    else {
                        var l = {},
                            f = Object.keys(t).sort(s);
                        for (u = 0; u < f.length; u++) {
                            var d = f[u];
                            e(t[d], d, o, t), l[d] = t[d]
                        }
                        if (void 0 === a) return l;
                        n.push([a, r, t]), a[r] = l
                    }
                    o.pop()
                }
            }(e, "", [], void 0) || e;
            for (o = 0 === i.length ? JSON.stringify(a, t, r) : JSON.stringify(a, u(t), r); 0 !== n.length;) {
                var c = n.pop();
                4 === c.length ? Object.defineProperty(c[0], c[1], c[3]) : c[0][c[1]] = c[2]
            }
            return o
        }

        function u(e) {
            return e = void 0 !== e ? e : function(e, t) {
                    return t
                },
                function(t, r) {
                    if (i.length > 0)
                        for (var n = 0; n < i.length; n++) {
                            var o = i[n];
                            if (o[1] === t && o[0] === r) {
                                r = "[Circular]", i.splice(n, 1);
                                break
                            }
                        }
                    return e.call(this, t, r)
                }
        }
    }, {}],
    31: [function(e, t, r) {
        /*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
        r.read = function(e, t, r, n, i) {
            var o, s, a = 8 * i - n - 1,
                u = (1 << a) - 1,
                c = u >> 1,
                l = -7,
                f = r ? i - 1 : 0,
                d = r ? -1 : 1,
                h = e[t + f];
            for (f += d, o = h & (1 << -l) - 1, h >>= -l, l += a; l > 0; o = 256 * o + e[t + f], f += d, l -= 8);
            for (s = o & (1 << -l) - 1, o >>= -l, l += n; l > 0; s = 256 * s + e[t + f], f += d, l -= 8);
            if (0 === o) o = 1 - c;
            else {
                if (o === u) return s ? NaN : 1 / 0 * (h ? -1 : 1);
                s += Math.pow(2, n), o -= c
            }
            return (h ? -1 : 1) * s * Math.pow(2, o - n)
        }, r.write = function(e, t, r, n, i, o) {
            var s, a, u, c = 8 * o - i - 1,
                l = (1 << c) - 1,
                f = l >> 1,
                d = 23 === i ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
                h = n ? 0 : o - 1,
                p = n ? 1 : -1,
                g = t < 0 || 0 === t && 1 / t < 0 ? 1 : 0;
            for (t = Math.abs(t), isNaN(t) || t === 1 / 0 ? (a = isNaN(t) ? 1 : 0, s = l) : (s = Math.floor(Math.log(t) / Math.LN2), t * (u = Math.pow(2, -s)) < 1 && (s--, u *= 2), (t += s + f >= 1 ? d / u : d * Math.pow(2, 1 - f)) * u >= 2 && (s++, u /= 2), s + f >= l ? (a = 0, s = l) : s + f >= 1 ? (a = (t * u - 1) * Math.pow(2, i), s += f) : (a = t * Math.pow(2, f - 1) * Math.pow(2, i), s = 0)); i >= 8; e[r + h] = 255 & a, h += p, a /= 256, i -= 8);
            for (s = s << i | a, c += i; c > 0; e[r + h] = 255 & s, h += p, s /= 256, c -= 8);
            e[r + h - p] |= 128 * g
        }
    }, {}],
    32: [function(e, t, r) {
        "function" == typeof Object.create ? t.exports = function(e, t) {
            t && (e.super_ = t, e.prototype = Object.create(t.prototype, {
                constructor: {
                    value: e,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }))
        } : t.exports = function(e, t) {
            if (t) {
                e.super_ = t;
                var r = function() {};
                r.prototype = t.prototype, e.prototype = new r, e.prototype.constructor = e
            }
        }
    }, {}],
    33: [function(e, t, r) {
        function n(e) {
            return !!e.constructor && "function" == typeof e.constructor.isBuffer && e.constructor.isBuffer(e)
        }
        /*!
         * Determine if an object is a Buffer
         *
         * @author   Feross Aboukhadijeh <https://feross.org>
         * @license  MIT
         */
        t.exports = function(e) {
            return null != e && (n(e) || function(e) {
                return "function" == typeof e.readFloatLE && "function" == typeof e.slice && n(e.slice(0, 0))
            }(e) || !!e._isBuffer)
        }
    }, {}],
    34: [function(e, t, r) {
        var n = {}.toString;
        t.exports = Array.isArray || function(e) {
            return "[object Array]" == n.call(e)
        }
    }, {}],
    35: [function(e, t, r) {
        "use strict";
        var n = this && this.__importDefault || function(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        };
        Object.defineProperty(r, "__esModule", {
            value: !0
        }), r.JsonRpcEngine = void 0;
        const i = n(e("@metamask/safe-event-emitter")),
            o = e("eth-rpc-errors");
        class s extends i.default {
            constructor() {
                super(), this._middleware = []
            }
            push(e) {
                this._middleware.push(e)
            }
            handle(e, t) {
                if (t && "function" != typeof t) throw new Error('"callback" must be a function if provided.');
                return Array.isArray(e) ? t ? this._handleBatch(e, t) : this._handleBatch(e) : t ? this._handle(e, t) : this._promiseHandle(e)
            }
            asMiddleware() {
                return async (e, t, r, n) => {
                    try {
                        const [i, o, a] = await s._runAllMiddleware(e, t, this._middleware);
                        return o ? (await s._runReturnHandlers(a), n(i)) : r(async e => {
                            try {
                                await s._runReturnHandlers(a)
                            } catch (t) {
                                return e(t)
                            }
                            return e()
                        })
                    } catch (e) {
                        return n(e)
                    }
                }
            }
            async _handleBatch(e, t) {
                try {
                    const r = await Promise.all(e.map(this._promiseHandle.bind(this)));
                    return t ? t(null, r) : r
                } catch (e) {
                    if (t) return t(e);
                    throw e
                }
            }
            _promiseHandle(e) {
                return new Promise(t => {
                    this._handle(e, (e, r) => {
                        t(r)
                    })
                })
            }
            async _handle(e, t) {
                if (!e || Array.isArray(e) || "object" != typeof e) {
                    const r = new o.EthereumRpcError(o.errorCodes.rpc.invalidRequest, "Requests must be plain objects. Received: " + typeof e, {
                        request: e
                    });
                    return t(r, {
                        id: void 0,
                        jsonrpc: "2.0",
                        error: r
                    })
                }
                if ("string" != typeof e.method) {
                    const r = new o.EthereumRpcError(o.errorCodes.rpc.invalidRequest, "Must specify a string method. Received: " + typeof e.method, {
                        request: e
                    });
                    return t(r, {
                        id: e.id,
                        jsonrpc: "2.0",
                        error: r
                    })
                }
                const r = Object.assign({}, e),
                    n = {
                        id: r.id,
                        jsonrpc: r.jsonrpc
                    };
                let i = null;
                try {
                    await this._processRequest(r, n)
                } catch (e) {
                    i = e
                }
                return i && (delete n.result, n.error || (n.error = o.serializeError(i))), t(i, n)
            }
            async _processRequest(e, t) {
                const [r, n, i] = await s._runAllMiddleware(e, t, this._middleware);
                if (s._checkForCompletion(e, t, n), await s._runReturnHandlers(i), r) throw r
            }
            static async _runAllMiddleware(e, t, r) {
                const n = [];
                let i = null,
                    o = !1;
                for (const a of r)
                    if ([i, o] = await s._runMiddleware(e, t, a, n), o) break;
                return [i, o, n.reverse()]
            }
            static _runMiddleware(e, t, r, n) {
                return new Promise(i => {
                    const s = e => {
                            const r = e || t.error;
                            r && (t.error = o.serializeError(r)), i([r, !0])
                        },
                        u = r => {
                            t.error ? s(t.error) : (r && ("function" != typeof r && s(new o.EthereumRpcError(o.errorCodes.rpc.internal, `JsonRpcEngine: "next" return handlers must be functions. Received "${typeof r}" for request:\n${a(e)}`, {
                                request: e
                            })), n.push(r)), i([null, !1]))
                        };
                    try {
                        r(e, t, u, s)
                    } catch (e) {
                        s(e)
                    }
                })
            }
            static async _runReturnHandlers(e) {
                for (const t of e) await new Promise((e, r) => {
                    t(t => t ? r(t) : e())
                })
            }
            static _checkForCompletion(e, t, r) {
                if (!("result" in t) && !("error" in t)) throw new o.EthereumRpcError(o.errorCodes.rpc.internal, "JsonRpcEngine: Response has no error or result for request:\n" + a(e), {
                    request: e
                });
                if (!r) throw new o.EthereumRpcError(o.errorCodes.rpc.internal, "JsonRpcEngine: Nothing ended request:\n" + a(e), {
                    request: e
                })
            }
        }

        function a(e) {
            return JSON.stringify(e, null, 2)
        }
        r.JsonRpcEngine = s
    }, {
        "@metamask/safe-event-emitter": 18,
        "eth-rpc-errors": 28
    }],
    36: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }), r.createAsyncMiddleware = void 0, r.createAsyncMiddleware = function(e) {
            return async (t, r, n, i) => {
                let o;
                const s = new Promise(e => {
                    o = e
                });
                let a = null,
                    u = !1;
                const c = async () => {
                    u = !0, n(e => {
                        a = e, o()
                    }), await s
                };
                try {
                    await e(t, r, c), u ? (await s, a(null)) : i(null)
                } catch (e) {
                    a ? a(e) : i(e)
                }
            }
        }
    }, {}],
    37: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }), r.createScaffoldMiddleware = void 0, r.createScaffoldMiddleware = function(e) {
            return (t, r, n, i) => {
                const o = e[t.method];
                return void 0 === o ? n() : "function" == typeof o ? o(t, r, n, i) : (r.result = o, i())
            }
        }
    }, {}],
    38: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }), r.getUniqueId = void 0;
        let n = Math.floor(4294967295 * Math.random());
        r.getUniqueId = function() {
            return n = (n + 1) % 4294967295, n
        }
    }, {}],
    39: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }), r.createIdRemapMiddleware = void 0;
        const n = e("./getUniqueId");
        r.createIdRemapMiddleware = function() {
            return (e, t, r, i) => {
                const o = e.id,
                    s = n.getUniqueId();
                e.id = s, t.id = s, r(r => {
                    e.id = o, t.id = o, r()
                })
            }
        }
    }, {
        "./getUniqueId": 38
    }],
    40: [function(e, t, r) {
        "use strict";
        var n = this && this.__createBinding || (Object.create ? function(e, t, r, n) {
                void 0 === n && (n = r), Object.defineProperty(e, n, {
                    enumerable: !0,
                    get: function() {
                        return t[r]
                    }
                })
            } : function(e, t, r, n) {
                void 0 === n && (n = r), e[n] = t[r]
            }),
            i = this && this.__exportStar || function(e, t) {
                for (var r in e) "default" === r || Object.prototype.hasOwnProperty.call(t, r) || n(t, e, r)
            };
        Object.defineProperty(r, "__esModule", {
            value: !0
        }), i(e("./idRemapMiddleware"), r), i(e("./createAsyncMiddleware"), r), i(e("./createScaffoldMiddleware"), r), i(e("./getUniqueId"), r), i(e("./JsonRpcEngine"), r), i(e("./mergeMiddleware"), r)
    }, {
        "./JsonRpcEngine": 35,
        "./createAsyncMiddleware": 36,
        "./createScaffoldMiddleware": 37,
        "./getUniqueId": 38,
        "./idRemapMiddleware": 39,
        "./mergeMiddleware": 41
    }],
    41: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", {
            value: !0
        }), r.mergeMiddleware = void 0;
        const n = e("./JsonRpcEngine");
        r.mergeMiddleware = function(e) {
            const t = new n.JsonRpcEngine;
            return e.forEach(e => t.push(e)), t.asMiddleware()
        }
    }, {
        "./JsonRpcEngine": 35
    }],
    42: [function(e, t, r) {
        ! function(e, r) {
            "use strict";
            "function" == typeof define && define.amd ? define(r) : "object" == typeof t && t.exports ? t.exports = r() : e.log = r()
        }(this, (function() {
            "use strict";
            var e = function() {},
                t = ["trace", "debug", "info", "warn", "error"];

            function r(e, t) {
                var r = e[t];
                if ("function" == typeof r.bind) return r.bind(e);
                try {
                    return Function.prototype.bind.call(r, e)
                } catch (t) {
                    return function() {
                        return Function.prototype.apply.apply(r, [e, arguments])
                    }
                }
            }

            function n(t) {
                return "debug" === t && (t = "log"), "undefined" != typeof console && (void 0 !== console[t] ? r(console, t) : void 0 !== console.log ? r(console, "log") : e)
            }

            function i(r, n) {
                for (var i = 0; i < t.length; i++) {
                    var o = t[i];
                    this[o] = i < r ? e : this.methodFactory(o, r, n)
                }
                this.log = this.debug
            }

            function o(e, t, r) {
                return function() {
                    "undefined" != typeof console && (i.call(this, t, r), this[e].apply(this, arguments))
                }
            }

            function s(e, t, r) {
                return n(e) || o.apply(this, arguments)
            }

            function a(e, r, n) {
                var o, a = this,
                    u = "loglevel";

                function c() {
                    var e;
                    if ("undefined" != typeof window) {
                        try {
                            e = window.localStorage[u]
                        } catch (e) {}
                        if (void 0 === e) try {
                            var t = window.document.cookie,
                                r = t.indexOf(encodeURIComponent(u) + "="); - 1 !== r && (e = /^([^;]+)/.exec(t.slice(r))[1])
                        } catch (e) {}
                        return void 0 === a.levels[e] && (e = void 0), e
                    }
                }
                e && (u += ":" + e), a.name = e, a.levels = {
                    TRACE: 0,
                    DEBUG: 1,
                    INFO: 2,
                    WARN: 3,
                    ERROR: 4,
                    SILENT: 5
                }, a.methodFactory = n || s, a.getLevel = function() {
                    return o
                }, a.setLevel = function(r, n) {
                    if ("string" == typeof r && void 0 !== a.levels[r.toUpperCase()] && (r = a.levels[r.toUpperCase()]), !("number" == typeof r && r >= 0 && r <= a.levels.SILENT)) throw "log.setLevel() called with invalid level: " + r;
                    if (o = r, !1 !== n && function(e) {
                            var r = (t[e] || "silent").toUpperCase();
                            if ("undefined" != typeof window) {
                                try {
                                    return void(window.localStorage[u] = r)
                                } catch (e) {}
                                try {
                                    window.document.cookie = encodeURIComponent(u) + "=" + r + ";"
                                } catch (e) {}
                            }
                        }(r), i.call(a, r, e), "undefined" == typeof console && r < a.levels.SILENT) return "No console available for logging"
                }, a.setDefaultLevel = function(e) {
                    c() || a.setLevel(e, !1)
                }, a.enableAll = function(e) {
                    a.setLevel(a.levels.TRACE, e)
                }, a.disableAll = function(e) {
                    a.setLevel(a.levels.SILENT, e)
                };
                var l = c();
                null == l && (l = null == r ? "WARN" : r), a.setLevel(l, !1)
            }
            var u = new a,
                c = {};
            u.getLogger = function(e) {
                if ("string" != typeof e || "" === e) throw new TypeError("You must supply a name when creating a logger.");
                var t = c[e];
                return t || (t = c[e] = new a(e, u.getLevel(), u.methodFactory)), t
            };
            var l = "undefined" != typeof window ? window.log : void 0;
            return u.noConflict = function() {
                return "undefined" != typeof window && window.log === u && (window.log = l), u
            }, u.getLoggers = function() {
                return c
            }, u
        }))
    }, {}],
    43: [function(e, t, r) {
        var n = e("wrappy");

        function i(e) {
            var t = function() {
                return t.called ? t.value : (t.called = !0, t.value = e.apply(this, arguments))
            };
            return t.called = !1, t
        }

        function o(e) {
            var t = function() {
                    if (t.called) throw new Error(t.onceError);
                    return t.called = !0, t.value = e.apply(this, arguments)
                },
                r = e.name || "Function wrapped with `once`";
            return t.onceError = r + " shouldn't be called more than once", t.called = !1, t
        }
        t.exports = n(i), t.exports.strict = n(o), i.proto = i((function() {
            Object.defineProperty(Function.prototype, "once", {
                value: function() {
                    return i(this)
                },
                configurable: !0
            }), Object.defineProperty(Function.prototype, "onceStrict", {
                value: function() {
                    return o(this)
                },
                configurable: !0
            })
        }))
    }, {
        wrappy: 64
    }],
    44: [function(e, t, r) {
        const n = e("readable-stream").Duplex,
            i = e("util").inherits;

        function o(e) {
            n.call(this, {
                objectMode: !0
            }), this._name = e.name, this._target = e.target, this._targetWindow = e.targetWindow || window, this._origin = e.targetWindow ? "*" : location.origin, this._init = !1, this._haveSyn = !1, window.addEventListener("message", this._onMessage.bind(this), !1), this._write("SYN", null, s), this.cork()
        }

        function s() {}
        t.exports = o, i(o, n), o.prototype._onMessage = function(e) {
            var t = e.data;
            if (("*" === this._origin || e.origin === this._origin) && e.source === this._targetWindow && "object" == typeof t && t.target === this._name && t.data)
                if (this._init) try {
                    this.push(t.data)
                } catch (e) {
                    this.emit("error", e)
                } else "SYN" === t.data ? (this._haveSyn = !0, this._write("ACK", null, s)) : "ACK" === t.data && (this._init = !0, this._haveSyn || this._write("ACK", null, s), this.uncork())
        }, o.prototype._read = s, o.prototype._write = function(e, t, r) {
            var n = {
                target: this._target,
                data: e
            };
            this._targetWindow.postMessage(n, this._origin), r()
        }
    }, {
        "readable-stream": 58,
        util: 63
    }],
    45: [function(e, t, r) {
        var n, i, o = t.exports = {};

        function s() {
            throw new Error("setTimeout has not been defined")
        }

        function a() {
            throw new Error("clearTimeout has not been defined")
        }

        function u(e) {
            if (n === setTimeout) return setTimeout(e, 0);
            if ((n === s || !n) && setTimeout) return n = setTimeout, setTimeout(e, 0);
            try {
                return n(e, 0)
            } catch (t) {
                try {
                    return n.call(null, e, 0)
                } catch (t) {
                    return n.call(this, e, 0)
                }
            }
        }! function() {
            try {
                n = "function" == typeof setTimeout ? setTimeout : s
            } catch (e) {
                n = s
            }
            try {
                i = "function" == typeof clearTimeout ? clearTimeout : a
            } catch (e) {
                i = a
            }
        }();
        var c, l = [],
            f = !1,
            d = -1;

        function h() {
            f && c && (f = !1, c.length ? l = c.concat(l) : d = -1, l.length && p())
        }

        function p() {
            if (!f) {
                var e = u(h);
                f = !0;
                for (var t = l.length; t;) {
                    for (c = l, l = []; ++d < t;) c && c[d].run();
                    d = -1, t = l.length
                }
                c = null, f = !1,
                    function(e) {
                        if (i === clearTimeout) return clearTimeout(e);
                        if ((i === a || !i) && clearTimeout) return i = clearTimeout, clearTimeout(e);
                        try {
                            i(e)
                        } catch (t) {
                            try {
                                return i.call(null, e)
                            } catch (t) {
                                return i.call(this, e)
                            }
                        }
                    }(e)
            }
        }

        function g(e, t) {
            this.fun = e, this.array = t
        }

        function m() {}
        o.nextTick = function(e) {
            var t = new Array(arguments.length - 1);
            if (arguments.length > 1)
                for (var r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
            l.push(new g(e, t)), 1 !== l.length || f || u(p)
        }, g.prototype.run = function() {
            this.fun.apply(null, this.array)
        }, o.title = "browser", o.browser = !0, o.env = {}, o.argv = [], o.version = "", o.versions = {}, o.on = m, o.addListener = m, o.once = m, o.off = m, o.removeListener = m, o.removeAllListeners = m, o.emit = m, o.prependListener = m, o.prependOnceListener = m, o.listeners = function(e) {
            return []
        }, o.binding = function(e) {
            throw new Error("process.binding is not supported")
        }, o.cwd = function() {
            return "/"
        }, o.chdir = function(e) {
            throw new Error("process.chdir is not supported")
        }, o.umask = function() {
            return 0
        }
    }, {}],
    46: [function(e, t, r) {
        (function(r) {
            var n = e("once"),
                i = e("end-of-stream"),
                o = e("fs"),
                s = function() {},
                a = /^v?\.0/.test(r.version),
                u = function(e) {
                    return "function" == typeof e
                },
                c = function(e, t, r, c) {
                    c = n(c);
                    var l = !1;
                    e.on("close", (function() {
                        l = !0
                    })), i(e, {
                        readable: t,
                        writable: r
                    }, (function(e) {
                        if (e) return c(e);
                        l = !0, c()
                    }));
                    var f = !1;
                    return function(t) {
                        if (!l && !f) return f = !0,
                            function(e) {
                                return !!a && (!!o && ((e instanceof(o.ReadStream || s) || e instanceof(o.WriteStream || s)) && u(e.close)))
                            }(e) ? e.close(s) : function(e) {
                                return e.setHeader && u(e.abort)
                            }(e) ? e.abort() : u(e.destroy) ? e.destroy() : void c(t || new Error("stream was destroyed"))
                    }
                },
                l = function(e) {
                    e()
                },
                f = function(e, t) {
                    return e.pipe(t)
                };
            t.exports = function() {
                var e, t = Array.prototype.slice.call(arguments),
                    r = u(t[t.length - 1] || s) && t.pop() || s;
                if (Array.isArray(t[0]) && (t = t[0]), t.length < 2) throw new Error("pump requires two streams per minimum");
                var n = t.map((function(i, o) {
                    var s = o < t.length - 1;
                    return c(i, s, o > 0, (function(t) {
                        e || (e = t), t && n.forEach(l), s || (n.forEach(l), r(e))
                    }))
                }));
                return t.reduce(f)
            }
        }).call(this, e("_process"))
    }, {
        _process: 45,
        "end-of-stream": 24,
        fs: 20,
        once: 43
    }],
    47: [function(e, t, r) {
        "use strict";
        var n = e("process-nextick-args"),
            i = Object.keys || function(e) {
                var t = [];
                for (var r in e) t.push(r);
                return t
            };
        t.exports = f;
        var o = Object.create(e("core-util-is"));
        o.inherits = e("inherits");
        var s = e("./_stream_readable"),
            a = e("./_stream_writable");
        o.inherits(f, s);
        for (var u = i(a.prototype), c = 0; c < u.length; c++) {
            var l = u[c];
            f.prototype[l] || (f.prototype[l] = a.prototype[l])
        }

        function f(e) {
            if (!(this instanceof f)) return new f(e);
            s.call(this, e), a.call(this, e), e && !1 === e.readable && (this.readable = !1), e && !1 === e.writable && (this.writable = !1), this.allowHalfOpen = !0, e && !1 === e.allowHalfOpen && (this.allowHalfOpen = !1), this.once("end", d)
        }

        function d() {
            this.allowHalfOpen || this._writableState.ended || n.nextTick(h, this)
        }

        function h(e) {
            e.end()
        }
        Object.defineProperty(f.prototype, "writableHighWaterMark", {
            enumerable: !1,
            get: function() {
                return this._writableState.highWaterMark
            }
        }), Object.defineProperty(f.prototype, "destroyed", {
            get: function() {
                return void 0 !== this._readableState && void 0 !== this._writableState && (this._readableState.destroyed && this._writableState.destroyed)
            },
            set: function(e) {
                void 0 !== this._readableState && void 0 !== this._writableState && (this._readableState.destroyed = e, this._writableState.destroyed = e)
            }
        }), f.prototype._destroy = function(e, t) {
            this.push(null), this.end(), n.nextTick(t, e)
        }
    }, {
        "./_stream_readable": 49,
        "./_stream_writable": 51,
        "core-util-is": 23,
        inherits: 32,
        "process-nextick-args": 55
    }],
    48: [function(e, t, r) {
        "use strict";
        t.exports = o;
        var n = e("./_stream_transform"),
            i = Object.create(e("core-util-is"));

        function o(e) {
            if (!(this instanceof o)) return new o(e);
            n.call(this, e)
        }
        i.inherits = e("inherits"), i.inherits(o, n), o.prototype._transform = function(e, t, r) {
            r(null, e)
        }
    }, {
        "./_stream_transform": 50,
        "core-util-is": 23,
        inherits: 32
    }],
    49: [function(e, t, r) {
        (function(r, n) {
            "use strict";
            var i = e("process-nextick-args");
            t.exports = w;
            var o, s = e("isarray");
            w.ReadableState = b;
            e("events").EventEmitter;
            var a = function(e, t) {
                    return e.listeners(t).length
                },
                u = e("./internal/streams/stream"),
                c = e("safe-buffer").Buffer,
                l = n.Uint8Array || function() {};
            var f = Object.create(e("core-util-is"));
            f.inherits = e("inherits");
            var d = e("util"),
                h = void 0;
            h = d && d.debuglog ? d.debuglog("stream") : function() {};
            var p, g = e("./internal/streams/BufferList"),
                m = e("./internal/streams/destroy");
            f.inherits(w, u);
            var y = ["error", "close", "destroy", "pause", "resume"];

            function b(t, r) {
                t = t || {};
                var n = r instanceof(o = o || e("./_stream_duplex"));
                this.objectMode = !!t.objectMode, n && (this.objectMode = this.objectMode || !!t.readableObjectMode);
                var i = t.highWaterMark,
                    s = t.readableHighWaterMark,
                    a = this.objectMode ? 16 : 16384;
                this.highWaterMark = i || 0 === i ? i : n && (s || 0 === s) ? s : a, this.highWaterMark = Math.floor(this.highWaterMark), this.buffer = new g, this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, this.ended = !1, this.endEmitted = !1, this.reading = !1, this.sync = !0, this.needReadable = !1, this.emittedReadable = !1, this.readableListening = !1, this.resumeScheduled = !1, this.destroyed = !1, this.defaultEncoding = t.defaultEncoding || "utf8", this.awaitDrain = 0, this.readingMore = !1, this.decoder = null, this.encoding = null, t.encoding && (p || (p = e("string_decoder/").StringDecoder), this.decoder = new p(t.encoding), this.encoding = t.encoding)
            }

            function w(t) {
                if (o = o || e("./_stream_duplex"), !(this instanceof w)) return new w(t);
                this._readableState = new b(t, this), this.readable = !0, t && ("function" == typeof t.read && (this._read = t.read), "function" == typeof t.destroy && (this._destroy = t.destroy)), u.call(this)
            }

            function v(e, t, r, n, i) {
                var o, s = e._readableState;
                null === t ? (s.reading = !1, function(e, t) {
                    if (t.ended) return;
                    if (t.decoder) {
                        var r = t.decoder.end();
                        r && r.length && (t.buffer.push(r), t.length += t.objectMode ? 1 : r.length)
                    }
                    t.ended = !0, S(e)
                }(e, s)) : (i || (o = function(e, t) {
                    var r;
                    n = t, c.isBuffer(n) || n instanceof l || "string" == typeof t || void 0 === t || e.objectMode || (r = new TypeError("Invalid non-string/buffer chunk"));
                    var n;
                    return r
                }(s, t)), o ? e.emit("error", o) : s.objectMode || t && t.length > 0 ? ("string" == typeof t || s.objectMode || Object.getPrototypeOf(t) === c.prototype || (t = function(e) {
                    return c.from(e)
                }(t)), n ? s.endEmitted ? e.emit("error", new Error("stream.unshift() after end event")) : _(e, s, t, !0) : s.ended ? e.emit("error", new Error("stream.push() after EOF")) : (s.reading = !1, s.decoder && !r ? (t = s.decoder.write(t), s.objectMode || 0 !== t.length ? _(e, s, t, !1) : k(e, s)) : _(e, s, t, !1))) : n || (s.reading = !1));
                return function(e) {
                    return !e.ended && (e.needReadable || e.length < e.highWaterMark || 0 === e.length)
                }(s)
            }

            function _(e, t, r, n) {
                t.flowing && 0 === t.length && !t.sync ? (e.emit("data", r), e.read(0)) : (t.length += t.objectMode ? 1 : r.length, n ? t.buffer.unshift(r) : t.buffer.push(r), t.needReadable && S(e)), k(e, t)
            }
            Object.defineProperty(w.prototype, "destroyed", {
                get: function() {
                    return void 0 !== this._readableState && this._readableState.destroyed
                },
                set: function(e) {
                    this._readableState && (this._readableState.destroyed = e)
                }
            }), w.prototype.destroy = m.destroy, w.prototype._undestroy = m.undestroy, w.prototype._destroy = function(e, t) {
                this.push(null), t(e)
            }, w.prototype.push = function(e, t) {
                var r, n = this._readableState;
                return n.objectMode ? r = !0 : "string" == typeof e && ((t = t || n.defaultEncoding) !== n.encoding && (e = c.from(e, t), t = ""), r = !0), v(this, e, t, !1, r)
            }, w.prototype.unshift = function(e) {
                return v(this, e, null, !0, !1)
            }, w.prototype.isPaused = function() {
                return !1 === this._readableState.flowing
            }, w.prototype.setEncoding = function(t) {
                return p || (p = e("string_decoder/").StringDecoder), this._readableState.decoder = new p(t), this._readableState.encoding = t, this
            };

            function E(e, t) {
                return e <= 0 || 0 === t.length && t.ended ? 0 : t.objectMode ? 1 : e != e ? t.flowing && t.length ? t.buffer.head.data.length : t.length : (e > t.highWaterMark && (t.highWaterMark = function(e) {
                    return e >= 8388608 ? e = 8388608 : (e--, e |= e >>> 1, e |= e >>> 2, e |= e >>> 4, e |= e >>> 8, e |= e >>> 16, e++), e
                }(e)), e <= t.length ? e : t.ended ? t.length : (t.needReadable = !0, 0))
            }

            function S(e) {
                var t = e._readableState;
                t.needReadable = !1, t.emittedReadable || (h("emitReadable", t.flowing), t.emittedReadable = !0, t.sync ? i.nextTick(M, e) : M(e))
            }

            function M(e) {
                h("emit readable"), e.emit("readable"), C(e)
            }

            function k(e, t) {
                t.readingMore || (t.readingMore = !0, i.nextTick(x, e, t))
            }

            function x(e, t) {
                for (var r = t.length; !t.reading && !t.flowing && !t.ended && t.length < t.highWaterMark && (h("maybeReadMore read 0"), e.read(0), r !== t.length);) r = t.length;
                t.readingMore = !1
            }

            function j(e) {
                h("readable nexttick read 0"), e.read(0)
            }

            function R(e, t) {
                t.reading || (h("resume read 0"), e.read(0)), t.resumeScheduled = !1, t.awaitDrain = 0, e.emit("resume"), C(e), t.flowing && !t.reading && e.read(0)
            }

            function C(e) {
                var t = e._readableState;
                for (h("flow", t.flowing); t.flowing && null !== e.read(););
            }

            function O(e, t) {
                return 0 === t.length ? null : (t.objectMode ? r = t.buffer.shift() : !e || e >= t.length ? (r = t.decoder ? t.buffer.join("") : 1 === t.buffer.length ? t.buffer.head.data : t.buffer.concat(t.length), t.buffer.clear()) : r = function(e, t, r) {
                    var n;
                    e < t.head.data.length ? (n = t.head.data.slice(0, e), t.head.data = t.head.data.slice(e)) : n = e === t.head.data.length ? t.shift() : r ? function(e, t) {
                        var r = t.head,
                            n = 1,
                            i = r.data;
                        e -= i.length;
                        for (; r = r.next;) {
                            var o = r.data,
                                s = e > o.length ? o.length : e;
                            if (s === o.length ? i += o : i += o.slice(0, e), 0 === (e -= s)) {
                                s === o.length ? (++n, r.next ? t.head = r.next : t.head = t.tail = null) : (t.head = r, r.data = o.slice(s));
                                break
                            }++n
                        }
                        return t.length -= n, i
                    }(e, t) : function(e, t) {
                        var r = c.allocUnsafe(e),
                            n = t.head,
                            i = 1;
                        n.data.copy(r), e -= n.data.length;
                        for (; n = n.next;) {
                            var o = n.data,
                                s = e > o.length ? o.length : e;
                            if (o.copy(r, r.length - e, 0, s), 0 === (e -= s)) {
                                s === o.length ? (++i, n.next ? t.head = n.next : t.head = t.tail = null) : (t.head = n, n.data = o.slice(s));
                                break
                            }++i
                        }
                        return t.length -= i, r
                    }(e, t);
                    return n
                }(e, t.buffer, t.decoder), r);
                var r
            }

            function A(e) {
                var t = e._readableState;
                if (t.length > 0) throw new Error('"endReadable()" called on non-empty stream');
                t.endEmitted || (t.ended = !0, i.nextTick(P, t, e))
            }

            function P(e, t) {
                e.endEmitted || 0 !== e.length || (e.endEmitted = !0, t.readable = !1, t.emit("end"))
            }

            function T(e, t) {
                for (var r = 0, n = e.length; r < n; r++)
                    if (e[r] === t) return r;
                return -1
            }
            w.prototype.read = function(e) {
                h("read", e), e = parseInt(e, 10);
                var t = this._readableState,
                    r = e;
                if (0 !== e && (t.emittedReadable = !1), 0 === e && t.needReadable && (t.length >= t.highWaterMark || t.ended)) return h("read: emitReadable", t.length, t.ended), 0 === t.length && t.ended ? A(this) : S(this), null;
                if (0 === (e = E(e, t)) && t.ended) return 0 === t.length && A(this), null;
                var n, i = t.needReadable;
                return h("need readable", i), (0 === t.length || t.length - e < t.highWaterMark) && h("length less than watermark", i = !0), t.ended || t.reading ? h("reading or ended", i = !1) : i && (h("do read"), t.reading = !0, t.sync = !0, 0 === t.length && (t.needReadable = !0), this._read(t.highWaterMark), t.sync = !1, t.reading || (e = E(r, t))), null === (n = e > 0 ? O(e, t) : null) ? (t.needReadable = !0, e = 0) : t.length -= e, 0 === t.length && (t.ended || (t.needReadable = !0), r !== e && t.ended && A(this)), null !== n && this.emit("data", n), n
            }, w.prototype._read = function(e) {
                this.emit("error", new Error("_read() is not implemented"))
            }, w.prototype.pipe = function(e, t) {
                var n = this,
                    o = this._readableState;
                switch (o.pipesCount) {
                    case 0:
                        o.pipes = e;
                        break;
                    case 1:
                        o.pipes = [o.pipes, e];
                        break;
                    default:
                        o.pipes.push(e)
                }
                o.pipesCount += 1, h("pipe count=%d opts=%j", o.pipesCount, t);
                var u = (!t || !1 !== t.end) && e !== r.stdout && e !== r.stderr ? l : w;

                function c(t, r) {
                    h("onunpipe"), t === n && r && !1 === r.hasUnpiped && (r.hasUnpiped = !0, h("cleanup"), e.removeListener("close", y), e.removeListener("finish", b), e.removeListener("drain", f), e.removeListener("error", m), e.removeListener("unpipe", c), n.removeListener("end", l), n.removeListener("end", w), n.removeListener("data", g), d = !0, !o.awaitDrain || e._writableState && !e._writableState.needDrain || f())
                }

                function l() {
                    h("onend"), e.end()
                }
                o.endEmitted ? i.nextTick(u) : n.once("end", u), e.on("unpipe", c);
                var f = function(e) {
                    return function() {
                        var t = e._readableState;
                        h("pipeOnDrain", t.awaitDrain), t.awaitDrain && t.awaitDrain--, 0 === t.awaitDrain && a(e, "data") && (t.flowing = !0, C(e))
                    }
                }(n);
                e.on("drain", f);
                var d = !1;
                var p = !1;

                function g(t) {
                    h("ondata"), p = !1, !1 !== e.write(t) || p || ((1 === o.pipesCount && o.pipes === e || o.pipesCount > 1 && -1 !== T(o.pipes, e)) && !d && (h("false write response, pause", n._readableState.awaitDrain), n._readableState.awaitDrain++, p = !0), n.pause())
                }

                function m(t) {
                    h("onerror", t), w(), e.removeListener("error", m), 0 === a(e, "error") && e.emit("error", t)
                }

                function y() {
                    e.removeListener("finish", b), w()
                }

                function b() {
                    h("onfinish"), e.removeListener("close", y), w()
                }

                function w() {
                    h("unpipe"), n.unpipe(e)
                }
                return n.on("data", g),
                    function(e, t, r) {
                        if ("function" == typeof e.prependListener) return e.prependListener(t, r);
                        e._events && e._events[t] ? s(e._events[t]) ? e._events[t].unshift(r) : e._events[t] = [r, e._events[t]] : e.on(t, r)
                    }(e, "error", m), e.once("close", y), e.once("finish", b), e.emit("pipe", n), o.flowing || (h("pipe resume"), n.resume()), e
            }, w.prototype.unpipe = function(e) {
                var t = this._readableState,
                    r = {
                        hasUnpiped: !1
                    };
                if (0 === t.pipesCount) return this;
                if (1 === t.pipesCount) return e && e !== t.pipes || (e || (e = t.pipes), t.pipes = null, t.pipesCount = 0, t.flowing = !1, e && e.emit("unpipe", this, r)), this;
                if (!e) {
                    var n = t.pipes,
                        i = t.pipesCount;
                    t.pipes = null, t.pipesCount = 0, t.flowing = !1;
                    for (var o = 0; o < i; o++) n[o].emit("unpipe", this, r);
                    return this
                }
                var s = T(t.pipes, e);
                return -1 === s || (t.pipes.splice(s, 1), t.pipesCount -= 1, 1 === t.pipesCount && (t.pipes = t.pipes[0]), e.emit("unpipe", this, r)), this
            }, w.prototype.on = function(e, t) {
                var r = u.prototype.on.call(this, e, t);
                if ("data" === e) !1 !== this._readableState.flowing && this.resume();
                else if ("readable" === e) {
                    var n = this._readableState;
                    n.endEmitted || n.readableListening || (n.readableListening = n.needReadable = !0, n.emittedReadable = !1, n.reading ? n.length && S(this) : i.nextTick(j, this))
                }
                return r
            }, w.prototype.addListener = w.prototype.on, w.prototype.resume = function() {
                var e = this._readableState;
                return e.flowing || (h("resume"), e.flowing = !0, function(e, t) {
                    t.resumeScheduled || (t.resumeScheduled = !0, i.nextTick(R, e, t))
                }(this, e)), this
            }, w.prototype.pause = function() {
                return h("call pause flowing=%j", this._readableState.flowing), !1 !== this._readableState.flowing && (h("pause"), this._readableState.flowing = !1, this.emit("pause")), this
            }, w.prototype.wrap = function(e) {
                var t = this,
                    r = this._readableState,
                    n = !1;
                for (var i in e.on("end", (function() {
                        if (h("wrapped end"), r.decoder && !r.ended) {
                            var e = r.decoder.end();
                            e && e.length && t.push(e)
                        }
                        t.push(null)
                    })), e.on("data", (function(i) {
                        (h("wrapped data"), r.decoder && (i = r.decoder.write(i)), r.objectMode && null == i) || (r.objectMode || i && i.length) && (t.push(i) || (n = !0, e.pause()))
                    })), e) void 0 === this[i] && "function" == typeof e[i] && (this[i] = function(t) {
                    return function() {
                        return e[t].apply(e, arguments)
                    }
                }(i));
                for (var o = 0; o < y.length; o++) e.on(y[o], this.emit.bind(this, y[o]));
                return this._read = function(t) {
                    h("wrapped _read", t), n && (n = !1, e.resume())
                }, this
            }, Object.defineProperty(w.prototype, "readableHighWaterMark", {
                enumerable: !1,
                get: function() {
                    return this._readableState.highWaterMark
                }
            }), w._fromList = O
        }).call(this, e("_process"), "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, {
        "./_stream_duplex": 47,
        "./internal/streams/BufferList": 52,
        "./internal/streams/destroy": 53,
        "./internal/streams/stream": 54,
        _process: 45,
        "core-util-is": 23,
        events: 22,
        inherits: 32,
        isarray: 34,
        "process-nextick-args": 55,
        "safe-buffer": 56,
        "string_decoder/": 57,
        util: 20
    }],
    50: [function(e, t, r) {
        "use strict";
        t.exports = s;
        var n = e("./_stream_duplex"),
            i = Object.create(e("core-util-is"));

        function o(e, t) {
            var r = this._transformState;
            r.transforming = !1;
            var n = r.writecb;
            if (!n) return this.emit("error", new Error("write callback called multiple times"));
            r.writechunk = null, r.writecb = null, null != t && this.push(t), n(e);
            var i = this._readableState;
            i.reading = !1, (i.needReadable || i.length < i.highWaterMark) && this._read(i.highWaterMark)
        }

        function s(e) {
            if (!(this instanceof s)) return new s(e);
            n.call(this, e), this._transformState = {
                afterTransform: o.bind(this),
                needTransform: !1,
                transforming: !1,
                writecb: null,
                writechunk: null,
                writeencoding: null
            }, this._readableState.needReadable = !0, this._readableState.sync = !1, e && ("function" == typeof e.transform && (this._transform = e.transform), "function" == typeof e.flush && (this._flush = e.flush)), this.on("prefinish", a)
        }

        function a() {
            var e = this;
            "function" == typeof this._flush ? this._flush((function(t, r) {
                u(e, t, r)
            })) : u(this, null, null)
        }

        function u(e, t, r) {
            if (t) return e.emit("error", t);
            if (null != r && e.push(r), e._writableState.length) throw new Error("Calling transform done when ws.length != 0");
            if (e._transformState.transforming) throw new Error("Calling transform done when still transforming");
            return e.push(null)
        }
        i.inherits = e("inherits"), i.inherits(s, n), s.prototype.push = function(e, t) {
            return this._transformState.needTransform = !1, n.prototype.push.call(this, e, t)
        }, s.prototype._transform = function(e, t, r) {
            throw new Error("_transform() is not implemented")
        }, s.prototype._write = function(e, t, r) {
            var n = this._transformState;
            if (n.writecb = r, n.writechunk = e, n.writeencoding = t, !n.transforming) {
                var i = this._readableState;
                (n.needTransform || i.needReadable || i.length < i.highWaterMark) && this._read(i.highWaterMark)
            }
        }, s.prototype._read = function(e) {
            var t = this._transformState;
            null !== t.writechunk && t.writecb && !t.transforming ? (t.transforming = !0, this._transform(t.writechunk, t.writeencoding, t.afterTransform)) : t.needTransform = !0
        }, s.prototype._destroy = function(e, t) {
            var r = this;
            n.prototype._destroy.call(this, e, (function(e) {
                t(e), r.emit("close")
            }))
        }
    }, {
        "./_stream_duplex": 47,
        "core-util-is": 23,
        inherits: 32
    }],
    51: [function(e, t, r) {
        (function(r, n, i) {
            "use strict";
            var o = e("process-nextick-args");

            function s(e) {
                var t = this;
                this.next = null, this.entry = null, this.finish = function() {
                    ! function(e, t, r) {
                        var n = e.entry;
                        e.entry = null;
                        for (; n;) {
                            var i = n.callback;
                            t.pendingcb--, i(r), n = n.next
                        }
                        t.corkedRequestsFree ? t.corkedRequestsFree.next = e : t.corkedRequestsFree = e
                    }(t, e)
                }
            }
            t.exports = b;
            var a, u = !r.browser && ["v0.10", "v0.9."].indexOf(r.version.slice(0, 5)) > -1 ? i : o.nextTick;
            b.WritableState = y;
            var c = Object.create(e("core-util-is"));
            c.inherits = e("inherits");
            var l = {
                    deprecate: e("util-deprecate")
                },
                f = e("./internal/streams/stream"),
                d = e("safe-buffer").Buffer,
                h = n.Uint8Array || function() {};
            var p, g = e("./internal/streams/destroy");

            function m() {}

            function y(t, r) {
                a = a || e("./_stream_duplex"), t = t || {};
                var n = r instanceof a;
                this.objectMode = !!t.objectMode, n && (this.objectMode = this.objectMode || !!t.writableObjectMode);
                var i = t.highWaterMark,
                    c = t.writableHighWaterMark,
                    l = this.objectMode ? 16 : 16384;
                this.highWaterMark = i || 0 === i ? i : n && (c || 0 === c) ? c : l, this.highWaterMark = Math.floor(this.highWaterMark), this.finalCalled = !1, this.needDrain = !1, this.ending = !1, this.ended = !1, this.finished = !1, this.destroyed = !1;
                var f = !1 === t.decodeStrings;
                this.decodeStrings = !f, this.defaultEncoding = t.defaultEncoding || "utf8", this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, this.onwrite = function(e) {
                    ! function(e, t) {
                        var r = e._writableState,
                            n = r.sync,
                            i = r.writecb;
                        if (function(e) {
                                e.writing = !1, e.writecb = null, e.length -= e.writelen, e.writelen = 0
                            }(r), t) ! function(e, t, r, n, i) {
                            --t.pendingcb, r ? (o.nextTick(i, n), o.nextTick(M, e, t), e._writableState.errorEmitted = !0, e.emit("error", n)) : (i(n), e._writableState.errorEmitted = !0, e.emit("error", n), M(e, t))
                        }(e, r, n, t, i);
                        else {
                            var s = E(r);
                            s || r.corked || r.bufferProcessing || !r.bufferedRequest || _(e, r), n ? u(v, e, r, s, i) : v(e, r, s, i)
                        }
                    }(r, e)
                }, this.writecb = null, this.writelen = 0, this.bufferedRequest = null, this.lastBufferedRequest = null, this.pendingcb = 0, this.prefinished = !1, this.errorEmitted = !1, this.bufferedRequestCount = 0, this.corkedRequestsFree = new s(this)
            }

            function b(t) {
                if (a = a || e("./_stream_duplex"), !(p.call(b, this) || this instanceof a)) return new b(t);
                this._writableState = new y(t, this), this.writable = !0, t && ("function" == typeof t.write && (this._write = t.write), "function" == typeof t.writev && (this._writev = t.writev), "function" == typeof t.destroy && (this._destroy = t.destroy), "function" == typeof t.final && (this._final = t.final)), f.call(this)
            }

            function w(e, t, r, n, i, o, s) {
                t.writelen = n, t.writecb = s, t.writing = !0, t.sync = !0, r ? e._writev(i, t.onwrite) : e._write(i, o, t.onwrite), t.sync = !1
            }

            function v(e, t, r, n) {
                r || function(e, t) {
                    0 === t.length && t.needDrain && (t.needDrain = !1, e.emit("drain"))
                }(e, t), t.pendingcb--, n(), M(e, t)
            }

            function _(e, t) {
                t.bufferProcessing = !0;
                var r = t.bufferedRequest;
                if (e._writev && r && r.next) {
                    var n = t.bufferedRequestCount,
                        i = new Array(n),
                        o = t.corkedRequestsFree;
                    o.entry = r;
                    for (var a = 0, u = !0; r;) i[a] = r, r.isBuf || (u = !1), r = r.next, a += 1;
                    i.allBuffers = u, w(e, t, !0, t.length, i, "", o.finish), t.pendingcb++, t.lastBufferedRequest = null, o.next ? (t.corkedRequestsFree = o.next, o.next = null) : t.corkedRequestsFree = new s(t), t.bufferedRequestCount = 0
                } else {
                    for (; r;) {
                        var c = r.chunk,
                            l = r.encoding,
                            f = r.callback;
                        if (w(e, t, !1, t.objectMode ? 1 : c.length, c, l, f), r = r.next, t.bufferedRequestCount--, t.writing) break
                    }
                    null === r && (t.lastBufferedRequest = null)
                }
                t.bufferedRequest = r, t.bufferProcessing = !1
            }

            function E(e) {
                return e.ending && 0 === e.length && null === e.bufferedRequest && !e.finished && !e.writing
            }

            function S(e, t) {
                e._final((function(r) {
                    t.pendingcb--, r && e.emit("error", r), t.prefinished = !0, e.emit("prefinish"), M(e, t)
                }))
            }

            function M(e, t) {
                var r = E(t);
                return r && (! function(e, t) {
                    t.prefinished || t.finalCalled || ("function" == typeof e._final ? (t.pendingcb++, t.finalCalled = !0, o.nextTick(S, e, t)) : (t.prefinished = !0, e.emit("prefinish")))
                }(e, t), 0 === t.pendingcb && (t.finished = !0, e.emit("finish"))), r
            }
            c.inherits(b, f), y.prototype.getBuffer = function() {
                    for (var e = this.bufferedRequest, t = []; e;) t.push(e), e = e.next;
                    return t
                },
                function() {
                    try {
                        Object.defineProperty(y.prototype, "buffer", {
                            get: l.deprecate((function() {
                                return this.getBuffer()
                            }), "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
                        })
                    } catch (e) {}
                }(), "function" == typeof Symbol && Symbol.hasInstance && "function" == typeof Function.prototype[Symbol.hasInstance] ? (p = Function.prototype[Symbol.hasInstance], Object.defineProperty(b, Symbol.hasInstance, {
                    value: function(e) {
                        return !!p.call(this, e) || this === b && (e && e._writableState instanceof y)
                    }
                })) : p = function(e) {
                    return e instanceof this
                }, b.prototype.pipe = function() {
                    this.emit("error", new Error("Cannot pipe, not readable"))
                }, b.prototype.write = function(e, t, r) {
                    var n, i = this._writableState,
                        s = !1,
                        a = !i.objectMode && (n = e, d.isBuffer(n) || n instanceof h);
                    return a && !d.isBuffer(e) && (e = function(e) {
                        return d.from(e)
                    }(e)), "function" == typeof t && (r = t, t = null), a ? t = "buffer" : t || (t = i.defaultEncoding), "function" != typeof r && (r = m), i.ended ? function(e, t) {
                        var r = new Error("write after end");
                        e.emit("error", r), o.nextTick(t, r)
                    }(this, r) : (a || function(e, t, r, n) {
                        var i = !0,
                            s = !1;
                        return null === r ? s = new TypeError("May not write null values to stream") : "string" == typeof r || void 0 === r || t.objectMode || (s = new TypeError("Invalid non-string/buffer chunk")), s && (e.emit("error", s), o.nextTick(n, s), i = !1), i
                    }(this, i, e, r)) && (i.pendingcb++, s = function(e, t, r, n, i, o) {
                        if (!r) {
                            var s = function(e, t, r) {
                                e.objectMode || !1 === e.decodeStrings || "string" != typeof t || (t = d.from(t, r));
                                return t
                            }(t, n, i);
                            n !== s && (r = !0, i = "buffer", n = s)
                        }
                        var a = t.objectMode ? 1 : n.length;
                        t.length += a;
                        var u = t.length < t.highWaterMark;
                        u || (t.needDrain = !0);
                        if (t.writing || t.corked) {
                            var c = t.lastBufferedRequest;
                            t.lastBufferedRequest = {
                                chunk: n,
                                encoding: i,
                                isBuf: r,
                                callback: o,
                                next: null
                            }, c ? c.next = t.lastBufferedRequest : t.bufferedRequest = t.lastBufferedRequest, t.bufferedRequestCount += 1
                        } else w(e, t, !1, a, n, i, o);
                        return u
                    }(this, i, a, e, t, r)), s
                }, b.prototype.cork = function() {
                    this._writableState.corked++
                }, b.prototype.uncork = function() {
                    var e = this._writableState;
                    e.corked && (e.corked--, e.writing || e.corked || e.finished || e.bufferProcessing || !e.bufferedRequest || _(this, e))
                }, b.prototype.setDefaultEncoding = function(e) {
                    if ("string" == typeof e && (e = e.toLowerCase()), !(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((e + "").toLowerCase()) > -1)) throw new TypeError("Unknown encoding: " + e);
                    return this._writableState.defaultEncoding = e, this
                }, Object.defineProperty(b.prototype, "writableHighWaterMark", {
                    enumerable: !1,
                    get: function() {
                        return this._writableState.highWaterMark
                    }
                }), b.prototype._write = function(e, t, r) {
                    r(new Error("_write() is not implemented"))
                }, b.prototype._writev = null, b.prototype.end = function(e, t, r) {
                    var n = this._writableState;
                    "function" == typeof e ? (r = e, e = null, t = null) : "function" == typeof t && (r = t, t = null), null != e && this.write(e, t), n.corked && (n.corked = 1, this.uncork()), n.ending || n.finished || function(e, t, r) {
                        t.ending = !0, M(e, t), r && (t.finished ? o.nextTick(r) : e.once("finish", r));
                        t.ended = !0, e.writable = !1
                    }(this, n, r)
                }, Object.defineProperty(b.prototype, "destroyed", {
                    get: function() {
                        return void 0 !== this._writableState && this._writableState.destroyed
                    },
                    set: function(e) {
                        this._writableState && (this._writableState.destroyed = e)
                    }
                }), b.prototype.destroy = g.destroy, b.prototype._undestroy = g.undestroy, b.prototype._destroy = function(e, t) {
                    this.end(), t(e)
                }
        }).call(this, e("_process"), "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {}, e("timers").setImmediate)
    }, {
        "./_stream_duplex": 47,
        "./internal/streams/destroy": 53,
        "./internal/streams/stream": 54,
        _process: 45,
        "core-util-is": 23,
        inherits: 32,
        "process-nextick-args": 55,
        "safe-buffer": 56,
        timers: 59,
        "util-deprecate": 60
    }],
    52: [function(e, t, r) {
        "use strict";
        var n = e("safe-buffer").Buffer,
            i = e("util");
        t.exports = function() {
            function e() {
                ! function(e, t) {
                    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
                }(this, e), this.head = null, this.tail = null, this.length = 0
            }
            return e.prototype.push = function(e) {
                var t = {
                    data: e,
                    next: null
                };
                this.length > 0 ? this.tail.next = t : this.head = t, this.tail = t, ++this.length
            }, e.prototype.unshift = function(e) {
                var t = {
                    data: e,
                    next: this.head
                };
                0 === this.length && (this.tail = t), this.head = t, ++this.length
            }, e.prototype.shift = function() {
                if (0 !== this.length) {
                    var e = this.head.data;
                    return 1 === this.length ? this.head = this.tail = null : this.head = this.head.next, --this.length, e
                }
            }, e.prototype.clear = function() {
                this.head = this.tail = null, this.length = 0
            }, e.prototype.join = function(e) {
                if (0 === this.length) return "";
                for (var t = this.head, r = "" + t.data; t = t.next;) r += e + t.data;
                return r
            }, e.prototype.concat = function(e) {
                if (0 === this.length) return n.alloc(0);
                if (1 === this.length) return this.head.data;
                for (var t, r, i, o = n.allocUnsafe(e >>> 0), s = this.head, a = 0; s;) t = s.data, r = o, i = a, t.copy(r, i), a += s.data.length, s = s.next;
                return o
            }, e
        }(), i && i.inspect && i.inspect.custom && (t.exports.prototype[i.inspect.custom] = function() {
            var e = i.inspect({
                length: this.length
            });
            return this.constructor.name + " " + e
        })
    }, {
        "safe-buffer": 56,
        util: 20
    }],
    53: [function(e, t, r) {
        "use strict";
        var n = e("process-nextick-args");

        function i(e, t) {
            e.emit("error", t)
        }
        t.exports = {
            destroy: function(e, t) {
                var r = this,
                    o = this._readableState && this._readableState.destroyed,
                    s = this._writableState && this._writableState.destroyed;
                return o || s ? (t ? t(e) : !e || this._writableState && this._writableState.errorEmitted || n.nextTick(i, this, e), this) : (this._readableState && (this._readableState.destroyed = !0), this._writableState && (this._writableState.destroyed = !0), this._destroy(e || null, (function(e) {
                    !t && e ? (n.nextTick(i, r, e), r._writableState && (r._writableState.errorEmitted = !0)) : t && t(e)
                })), this)
            },
            undestroy: function() {
                this._readableState && (this._readableState.destroyed = !1, this._readableState.reading = !1, this._readableState.ended = !1, this._readableState.endEmitted = !1), this._writableState && (this._writableState.destroyed = !1, this._writableState.ended = !1, this._writableState.ending = !1, this._writableState.finished = !1, this._writableState.errorEmitted = !1)
            }
        }
    }, {
        "process-nextick-args": 55
    }],
    54: [function(e, t, r) {
        t.exports = e("events").EventEmitter
    }, {
        events: 22
    }],
    55: [function(e, t, r) {
        (function(e) {
            "use strict";
            void 0 === e || !e.version || 0 === e.version.indexOf("v0.") || 0 === e.version.indexOf("v1.") && 0 !== e.version.indexOf("v1.8.") ? t.exports = {
                nextTick: function(t, r, n, i) {
                    if ("function" != typeof t) throw new TypeError('"callback" argument must be a function');
                    var o, s, a = arguments.length;
                    switch (a) {
                        case 0:
                        case 1:
                            return e.nextTick(t);
                        case 2:
                            return e.nextTick((function() {
                                t.call(null, r)
                            }));
                        case 3:
                            return e.nextTick((function() {
                                t.call(null, r, n)
                            }));
                        case 4:
                            return e.nextTick((function() {
                                t.call(null, r, n, i)
                            }));
                        default:
                            for (o = new Array(a - 1), s = 0; s < o.length;) o[s++] = arguments[s];
                            return e.nextTick((function() {
                                t.apply(null, o)
                            }))
                    }
                }
            } : t.exports = e
        }).call(this, e("_process"))
    }, {
        _process: 45
    }],
    56: [function(e, t, r) {
        var n = e("buffer"),
            i = n.Buffer;

        function o(e, t) {
            for (var r in e) t[r] = e[r]
        }

        function s(e, t, r) {
            return i(e, t, r)
        }
        i.from && i.alloc && i.allocUnsafe && i.allocUnsafeSlow ? t.exports = n : (o(n, r), r.Buffer = s), o(i, s), s.from = function(e, t, r) {
            if ("number" == typeof e) throw new TypeError("Argument must not be a number");
            return i(e, t, r)
        }, s.alloc = function(e, t, r) {
            if ("number" != typeof e) throw new TypeError("Argument must be a number");
            var n = i(e);
            return void 0 !== t ? "string" == typeof r ? n.fill(t, r) : n.fill(t) : n.fill(0), n
        }, s.allocUnsafe = function(e) {
            if ("number" != typeof e) throw new TypeError("Argument must be a number");
            return i(e)
        }, s.allocUnsafeSlow = function(e) {
            if ("number" != typeof e) throw new TypeError("Argument must be a number");
            return n.SlowBuffer(e)
        }
    }, {
        buffer: 21
    }],
    57: [function(e, t, r) {
        "use strict";
        var n = e("safe-buffer").Buffer,
            i = n.isEncoding || function(e) {
                switch ((e = "" + e) && e.toLowerCase()) {
                    case "hex":
                    case "utf8":
                    case "utf-8":
                    case "ascii":
                    case "binary":
                    case "base64":
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                    case "raw":
                        return !0;
                    default:
                        return !1
                }
            };

        function o(e) {
            var t;
            switch (this.encoding = function(e) {
                    var t = function(e) {
                        if (!e) return "utf8";
                        for (var t;;) switch (e) {
                            case "utf8":
                            case "utf-8":
                                return "utf8";
                            case "ucs2":
                            case "ucs-2":
                            case "utf16le":
                            case "utf-16le":
                                return "utf16le";
                            case "latin1":
                            case "binary":
                                return "latin1";
                            case "base64":
                            case "ascii":
                            case "hex":
                                return e;
                            default:
                                if (t) return;
                                e = ("" + e).toLowerCase(), t = !0
                        }
                    }(e);
                    if ("string" != typeof t && (n.isEncoding === i || !i(e))) throw new Error("Unknown encoding: " + e);
                    return t || e
                }(e), this.encoding) {
                case "utf16le":
                    this.text = u, this.end = c, t = 4;
                    break;
                case "utf8":
                    this.fillLast = a, t = 4;
                    break;
                case "base64":
                    this.text = l, this.end = f, t = 3;
                    break;
                default:
                    return this.write = d, void(this.end = h)
            }
            this.lastNeed = 0, this.lastTotal = 0, this.lastChar = n.allocUnsafe(t)
        }

        function s(e) {
            return e <= 127 ? 0 : e >> 5 == 6 ? 2 : e >> 4 == 14 ? 3 : e >> 3 == 30 ? 4 : e >> 6 == 2 ? -1 : -2
        }

        function a(e) {
            var t = this.lastTotal - this.lastNeed,
                r = function(e, t, r) {
                    if (128 != (192 & t[0])) return e.lastNeed = 0, "�";
                    if (e.lastNeed > 1 && t.length > 1) {
                        if (128 != (192 & t[1])) return e.lastNeed = 1, "�";
                        if (e.lastNeed > 2 && t.length > 2 && 128 != (192 & t[2])) return e.lastNeed = 2, "�"
                    }
                }(this, e);
            return void 0 !== r ? r : this.lastNeed <= e.length ? (e.copy(this.lastChar, t, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal)) : (e.copy(this.lastChar, t, 0, e.length), void(this.lastNeed -= e.length))
        }

        function u(e, t) {
            if ((e.length - t) % 2 == 0) {
                var r = e.toString("utf16le", t);
                if (r) {
                    var n = r.charCodeAt(r.length - 1);
                    if (n >= 55296 && n <= 56319) return this.lastNeed = 2, this.lastTotal = 4, this.lastChar[0] = e[e.length - 2], this.lastChar[1] = e[e.length - 1], r.slice(0, -1)
                }
                return r
            }
            return this.lastNeed = 1, this.lastTotal = 2, this.lastChar[0] = e[e.length - 1], e.toString("utf16le", t, e.length - 1)
        }

        function c(e) {
            var t = e && e.length ? this.write(e) : "";
            if (this.lastNeed) {
                var r = this.lastTotal - this.lastNeed;
                return t + this.lastChar.toString("utf16le", 0, r)
            }
            return t
        }

        function l(e, t) {
            var r = (e.length - t) % 3;
            return 0 === r ? e.toString("base64", t) : (this.lastNeed = 3 - r, this.lastTotal = 3, 1 === r ? this.lastChar[0] = e[e.length - 1] : (this.lastChar[0] = e[e.length - 2], this.lastChar[1] = e[e.length - 1]), e.toString("base64", t, e.length - r))
        }

        function f(e) {
            var t = e && e.length ? this.write(e) : "";
            return this.lastNeed ? t + this.lastChar.toString("base64", 0, 3 - this.lastNeed) : t
        }

        function d(e) {
            return e.toString(this.encoding)
        }

        function h(e) {
            return e && e.length ? this.write(e) : ""
        }
        r.StringDecoder = o, o.prototype.write = function(e) {
            if (0 === e.length) return "";
            var t, r;
            if (this.lastNeed) {
                if (void 0 === (t = this.fillLast(e))) return "";
                r = this.lastNeed, this.lastNeed = 0
            } else r = 0;
            return r < e.length ? t ? t + this.text(e, r) : this.text(e, r) : t || ""
        }, o.prototype.end = function(e) {
            var t = e && e.length ? this.write(e) : "";
            return this.lastNeed ? t + "�" : t
        }, o.prototype.text = function(e, t) {
            var r = function(e, t, r) {
                var n = t.length - 1;
                if (n < r) return 0;
                var i = s(t[n]);
                if (i >= 0) return i > 0 && (e.lastNeed = i - 1), i;
                if (--n < r || -2 === i) return 0;
                if ((i = s(t[n])) >= 0) return i > 0 && (e.lastNeed = i - 2), i;
                if (--n < r || -2 === i) return 0;
                if ((i = s(t[n])) >= 0) return i > 0 && (2 === i ? i = 0 : e.lastNeed = i - 3), i;
                return 0
            }(this, e, t);
            if (!this.lastNeed) return e.toString("utf8", t);
            this.lastTotal = r;
            var n = e.length - (r - this.lastNeed);
            return e.copy(this.lastChar, 0, n), e.toString("utf8", t, n)
        }, o.prototype.fillLast = function(e) {
            if (this.lastNeed <= e.length) return e.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
            e.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, e.length), this.lastNeed -= e.length
        }
    }, {
        "safe-buffer": 56
    }],
    58: [function(e, t, r) {
        (r = t.exports = e("./lib/_stream_readable.js")).Stream = r, r.Readable = r, r.Writable = e("./lib/_stream_writable.js"), r.Duplex = e("./lib/_stream_duplex.js"), r.Transform = e("./lib/_stream_transform.js"), r.PassThrough = e("./lib/_stream_passthrough.js")
    }, {
        "./lib/_stream_duplex.js": 47,
        "./lib/_stream_passthrough.js": 48,
        "./lib/_stream_readable.js": 49,
        "./lib/_stream_transform.js": 50,
        "./lib/_stream_writable.js": 51
    }],
    59: [function(e, t, r) {
        (function(t, n) {
            var i = e("process/browser.js").nextTick,
                o = Function.prototype.apply,
                s = Array.prototype.slice,
                a = {},
                u = 0;

            function c(e, t) {
                this._id = e, this._clearFn = t
            }
            r.setTimeout = function() {
                return new c(o.call(setTimeout, window, arguments), clearTimeout)
            }, r.setInterval = function() {
                return new c(o.call(setInterval, window, arguments), clearInterval)
            }, r.clearTimeout = r.clearInterval = function(e) {
                e.close()
            }, c.prototype.unref = c.prototype.ref = function() {}, c.prototype.close = function() {
                this._clearFn.call(window, this._id)
            }, r.enroll = function(e, t) {
                clearTimeout(e._idleTimeoutId), e._idleTimeout = t
            }, r.unenroll = function(e) {
                clearTimeout(e._idleTimeoutId), e._idleTimeout = -1
            }, r._unrefActive = r.active = function(e) {
                clearTimeout(e._idleTimeoutId);
                var t = e._idleTimeout;
                t >= 0 && (e._idleTimeoutId = setTimeout((function() {
                    e._onTimeout && e._onTimeout()
                }), t))
            }, r.setImmediate = "function" == typeof t ? t : function(e) {
                var t = u++,
                    n = !(arguments.length < 2) && s.call(arguments, 1);
                return a[t] = !0, i((function() {
                    a[t] && (n ? e.apply(null, n) : e.call(null), r.clearImmediate(t))
                })), t
            }, r.clearImmediate = "function" == typeof n ? n : function(e) {
                delete a[e]
            }
        }).call(this, e("timers").setImmediate, e("timers").clearImmediate)
    }, {
        "process/browser.js": 45,
        timers: 59
    }],
    60: [function(e, t, r) {
        (function(e) {
            function r(t) {
                try {
                    if (!e.localStorage) return !1
                } catch (e) {
                    return !1
                }
                var r = e.localStorage[t];
                return null != r && "true" === String(r).toLowerCase()
            }
            t.exports = function(e, t) {
                if (r("noDeprecation")) return e;
                var n = !1;
                return function() {
                    if (!n) {
                        if (r("throwDeprecation")) throw new Error(t);
                        r("traceDeprecation") ? console.trace(t) : console.warn(t), n = !0
                    }
                    return e.apply(this, arguments)
                }
            }
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, {}],
    61: [function(e, t, r) {
        "function" == typeof Object.create ? t.exports = function(e, t) {
            e.super_ = t, e.prototype = Object.create(t.prototype, {
                constructor: {
                    value: e,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            })
        } : t.exports = function(e, t) {
            e.super_ = t;
            var r = function() {};
            r.prototype = t.prototype, e.prototype = new r, e.prototype.constructor = e
        }
    }, {}],
    62: [function(e, t, r) {
        t.exports = function(e) {
            return e && "object" == typeof e && "function" == typeof e.copy && "function" == typeof e.fill && "function" == typeof e.readUInt8
        }
    }, {}],
    63: [function(e, t, r) {
        (function(t, n) {
            var i = /%[sdj%]/g;
            r.format = function(e) {
                if (!y(e)) {
                    for (var t = [], r = 0; r < arguments.length; r++) t.push(a(arguments[r]));
                    return t.join(" ")
                }
                r = 1;
                for (var n = arguments, o = n.length, s = String(e).replace(i, (function(e) {
                        if ("%%" === e) return "%";
                        if (r >= o) return e;
                        switch (e) {
                            case "%s":
                                return String(n[r++]);
                            case "%d":
                                return Number(n[r++]);
                            case "%j":
                                try {
                                    return JSON.stringify(n[r++])
                                } catch (e) {
                                    return "[Circular]"
                                }
                                default:
                                    return e
                        }
                    })), u = n[r]; r < o; u = n[++r]) g(u) || !v(u) ? s += " " + u : s += " " + a(u);
                return s
            }, r.deprecate = function(e, i) {
                if (b(n.process)) return function() {
                    return r.deprecate(e, i).apply(this, arguments)
                };
                if (!0 === t.noDeprecation) return e;
                var o = !1;
                return function() {
                    if (!o) {
                        if (t.throwDeprecation) throw new Error(i);
                        t.traceDeprecation ? console.trace(i) : console.error(i), o = !0
                    }
                    return e.apply(this, arguments)
                }
            };
            var o, s = {};

            function a(e, t) {
                var n = {
                    seen: [],
                    stylize: c
                };
                return arguments.length >= 3 && (n.depth = arguments[2]), arguments.length >= 4 && (n.colors = arguments[3]), p(t) ? n.showHidden = t : t && r._extend(n, t), b(n.showHidden) && (n.showHidden = !1), b(n.depth) && (n.depth = 2), b(n.colors) && (n.colors = !1), b(n.customInspect) && (n.customInspect = !0), n.colors && (n.stylize = u), l(n, e, n.depth)
            }

            function u(e, t) {
                var r = a.styles[t];
                return r ? "[" + a.colors[r][0] + "m" + e + "[" + a.colors[r][1] + "m" : e
            }

            function c(e, t) {
                return e
            }

            function l(e, t, n) {
                if (e.customInspect && t && S(t.inspect) && t.inspect !== r.inspect && (!t.constructor || t.constructor.prototype !== t)) {
                    var i = t.inspect(n, e);
                    return y(i) || (i = l(e, i, n)), i
                }
                var o = function(e, t) {
                    if (b(t)) return e.stylize("undefined", "undefined");
                    if (y(t)) {
                        var r = "'" + JSON.stringify(t).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
                        return e.stylize(r, "string")
                    }
                    if (m(t)) return e.stylize("" + t, "number");
                    if (p(t)) return e.stylize("" + t, "boolean");
                    if (g(t)) return e.stylize("null", "null")
                }(e, t);
                if (o) return o;
                var s = Object.keys(t),
                    a = function(e) {
                        var t = {};
                        return e.forEach((function(e, r) {
                            t[e] = !0
                        })), t
                    }(s);
                if (e.showHidden && (s = Object.getOwnPropertyNames(t)), E(t) && (s.indexOf("message") >= 0 || s.indexOf("description") >= 0)) return f(t);
                if (0 === s.length) {
                    if (S(t)) {
                        var u = t.name ? ": " + t.name : "";
                        return e.stylize("[Function" + u + "]", "special")
                    }
                    if (w(t)) return e.stylize(RegExp.prototype.toString.call(t), "regexp");
                    if (_(t)) return e.stylize(Date.prototype.toString.call(t), "date");
                    if (E(t)) return f(t)
                }
                var c, v = "",
                    M = !1,
                    k = ["{", "}"];
                (h(t) && (M = !0, k = ["[", "]"]), S(t)) && (v = " [Function" + (t.name ? ": " + t.name : "") + "]");
                return w(t) && (v = " " + RegExp.prototype.toString.call(t)), _(t) && (v = " " + Date.prototype.toUTCString.call(t)), E(t) && (v = " " + f(t)), 0 !== s.length || M && 0 != t.length ? n < 0 ? w(t) ? e.stylize(RegExp.prototype.toString.call(t), "regexp") : e.stylize("[Object]", "special") : (e.seen.push(t), c = M ? function(e, t, r, n, i) {
                    for (var o = [], s = 0, a = t.length; s < a; ++s) R(t, String(s)) ? o.push(d(e, t, r, n, String(s), !0)) : o.push("");
                    return i.forEach((function(i) {
                        i.match(/^\d+$/) || o.push(d(e, t, r, n, i, !0))
                    })), o
                }(e, t, n, a, s) : s.map((function(r) {
                    return d(e, t, n, a, r, M)
                })), e.seen.pop(), function(e, t, r) {
                    if (e.reduce((function(e, t) {
                            return t.indexOf("\n") >= 0 && 0, e + t.replace(/\u001b\[\d\d?m/g, "").length + 1
                        }), 0) > 60) return r[0] + ("" === t ? "" : t + "\n ") + " " + e.join(",\n  ") + " " + r[1];
                    return r[0] + t + " " + e.join(", ") + " " + r[1]
                }(c, v, k)) : k[0] + v + k[1]
            }

            function f(e) {
                return "[" + Error.prototype.toString.call(e) + "]"
            }

            function d(e, t, r, n, i, o) {
                var s, a, u;
                if ((u = Object.getOwnPropertyDescriptor(t, i) || {
                        value: t[i]
                    }).get ? a = u.set ? e.stylize("[Getter/Setter]", "special") : e.stylize("[Getter]", "special") : u.set && (a = e.stylize("[Setter]", "special")), R(n, i) || (s = "[" + i + "]"), a || (e.seen.indexOf(u.value) < 0 ? (a = g(r) ? l(e, u.value, null) : l(e, u.value, r - 1)).indexOf("\n") > -1 && (a = o ? a.split("\n").map((function(e) {
                        return "  " + e
                    })).join("\n").substr(2) : "\n" + a.split("\n").map((function(e) {
                        return "   " + e
                    })).join("\n")) : a = e.stylize("[Circular]", "special")), b(s)) {
                    if (o && i.match(/^\d+$/)) return a;
                    (s = JSON.stringify("" + i)).match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/) ? (s = s.substr(1, s.length - 2), s = e.stylize(s, "name")) : (s = s.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"), s = e.stylize(s, "string"))
                }
                return s + ": " + a
            }

            function h(e) {
                return Array.isArray(e)
            }

            function p(e) {
                return "boolean" == typeof e
            }

            function g(e) {
                return null === e
            }

            function m(e) {
                return "number" == typeof e
            }

            function y(e) {
                return "string" == typeof e
            }

            function b(e) {
                return void 0 === e
            }

            function w(e) {
                return v(e) && "[object RegExp]" === M(e)
            }

            function v(e) {
                return "object" == typeof e && null !== e
            }

            function _(e) {
                return v(e) && "[object Date]" === M(e)
            }

            function E(e) {
                return v(e) && ("[object Error]" === M(e) || e instanceof Error)
            }

            function S(e) {
                return "function" == typeof e
            }

            function M(e) {
                return Object.prototype.toString.call(e)
            }

            function k(e) {
                return e < 10 ? "0" + e.toString(10) : e.toString(10)
            }
            r.debuglog = function(e) {
                if (b(o) && (o = t.env.NODE_DEBUG || ""), e = e.toUpperCase(), !s[e])
                    if (new RegExp("\\b" + e + "\\b", "i").test(o)) {
                        var n = t.pid;
                        s[e] = function() {
                            var t = r.format.apply(r, arguments);
                            console.error("%s %d: %s", e, n, t)
                        }
                    } else s[e] = function() {};
                return s[e]
            }, r.inspect = a, a.colors = {
                bold: [1, 22],
                italic: [3, 23],
                underline: [4, 24],
                inverse: [7, 27],
                white: [37, 39],
                grey: [90, 39],
                black: [30, 39],
                blue: [34, 39],
                cyan: [36, 39],
                green: [32, 39],
                magenta: [35, 39],
                red: [31, 39],
                yellow: [33, 39]
            }, a.styles = {
                special: "cyan",
                number: "yellow",
                boolean: "yellow",
                undefined: "grey",
                null: "bold",
                string: "green",
                date: "magenta",
                regexp: "red"
            }, r.isArray = h, r.isBoolean = p, r.isNull = g, r.isNullOrUndefined = function(e) {
                return null == e
            }, r.isNumber = m, r.isString = y, r.isSymbol = function(e) {
                return "symbol" == typeof e
            }, r.isUndefined = b, r.isRegExp = w, r.isObject = v, r.isDate = _, r.isError = E, r.isFunction = S, r.isPrimitive = function(e) {
                return null === e || "boolean" == typeof e || "number" == typeof e || "string" == typeof e || "symbol" == typeof e || void 0 === e
            }, r.isBuffer = e("./support/isBuffer");
            var x = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            function j() {
                var e = new Date,
                    t = [k(e.getHours()), k(e.getMinutes()), k(e.getSeconds())].join(":");
                return [e.getDate(), x[e.getMonth()], t].join(" ")
            }

            function R(e, t) {
                return Object.prototype.hasOwnProperty.call(e, t)
            }
            r.log = function() {
                console.log("%s - %s", j(), r.format.apply(r, arguments))
            }, r.inherits = e("inherits"), r._extend = function(e, t) {
                if (!t || !v(t)) return e;
                for (var r = Object.keys(t), n = r.length; n--;) e[r[n]] = t[r[n]];
                return e
            }
        }).call(this, e("_process"), "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, {
        "./support/isBuffer": 62,
        _process: 45,
        inherits: 61
    }],
    64: [function(e, t, r) {
        t.exports = function e(t, r) {
            if (t && r) return e(t)(r);
            if ("function" != typeof t) throw new TypeError("need wrapper function");
            return Object.keys(t).forEach((function(e) {
                n[e] = t[e]
            })), n;

            function n() {
                for (var e = new Array(arguments.length), r = 0; r < e.length; r++) e[r] = arguments[r];
                var n = t.apply(this, e),
                    i = e[e.length - 1];
                return "function" == typeof n && n !== i && Object.keys(i).forEach((function(e) {
                    n[e] = i[e]
                })), n
            }
        }
    }, {}]
}, {}, [1]);
//# sourceMappingURL=../sourcemaps/inpage.js.map