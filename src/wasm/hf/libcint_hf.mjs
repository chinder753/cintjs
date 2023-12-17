var Module = (() => {
    var _scriptDir = import.meta.url;

    return (
        async function (moduleArg = {}) {

            var Module = moduleArg;
            var readyPromiseResolve, readyPromiseReject;
            Module["ready"] = new Promise((resolve, reject) => {
                readyPromiseResolve = resolve;
                readyPromiseReject = reject
            });
            var moduleOverrides = Object.assign({}, Module);
            var arguments_ = [];
            var thisProgram = "./this.program";
            var quit_ = (status, toThrow) => {
                throw toThrow
            };
            var ENVIRONMENT_IS_WEB = typeof window == "object";
            var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
            var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";
            var scriptDirectory = "";

            function locateFile(path) {
                if (Module["locateFile"]) {
                    return Module["locateFile"](path, scriptDirectory)
                }
                return scriptDirectory + path
            }

            var read_, readAsync, readBinary;
            if (ENVIRONMENT_IS_NODE) {
                const {createRequire: createRequire} = await import("module");
                var require = createRequire(import.meta.url);
                var fs = require("fs");
                var nodePath = require("path");
                if (ENVIRONMENT_IS_WORKER) {
                    scriptDirectory = nodePath.dirname(scriptDirectory) + "/"
                } else {
                    scriptDirectory = require("url").fileURLToPath(new URL("./", import.meta.url))
                }
                read_ = (filename, binary) => {
                    filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
                    return fs.readFileSync(filename, binary ? undefined : "utf8")
                };
                readBinary = filename => {
                    var ret = read_(filename, true);
                    if (!ret.buffer) {
                        ret = new Uint8Array(ret)
                    }
                    return ret
                };
                readAsync = (filename, onload, onerror, binary = true) => {
                    filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
                    fs.readFile(filename, binary ? undefined : "utf8", (err, data) => {
                        if (err) onerror(err); else onload(binary ? data.buffer : data)
                    })
                };
                if (!Module["thisProgram"] && process.argv.length > 1) {
                    thisProgram = process.argv[1].replace(/\\/g, "/")
                }
                arguments_ = process.argv.slice(2);
                quit_ = (status, toThrow) => {
                    process.exitCode = status;
                    throw toThrow
                };
                Module["inspect"] = () => "[Emscripten Module object]"
            } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
                if (ENVIRONMENT_IS_WORKER) {
                    scriptDirectory = self.location.href
                } else if (typeof document != "undefined" && document.currentScript) {
                    scriptDirectory = document.currentScript.src
                }
                if (_scriptDir) {
                    scriptDirectory = _scriptDir
                }
                if (scriptDirectory.indexOf("blob:") !== 0) {
                    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1)
                } else {
                    scriptDirectory = ""
                }
                {
                    read_ = url => {
                        var xhr = new XMLHttpRequest;
                        xhr.open("GET", url, false);
                        xhr.send(null);
                        return xhr.responseText
                    };
                    if (ENVIRONMENT_IS_WORKER) {
                        readBinary = url => {
                            var xhr = new XMLHttpRequest;
                            xhr.open("GET", url, false);
                            xhr.responseType = "arraybuffer";
                            xhr.send(null);
                            return new Uint8Array(xhr.response)
                        }
                    }
                    readAsync = (url, onload, onerror) => {
                        var xhr = new XMLHttpRequest;
                        xhr.open("GET", url, true);
                        xhr.responseType = "arraybuffer";
                        xhr.onload = () => {
                            if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                                onload(xhr.response);
                                return
                            }
                            onerror()
                        };
                        xhr.onerror = onerror;
                        xhr.send(null)
                    }
                }
            } else {
            }
            var out = Module["print"] || console.log.bind(console);
            var err = Module["printErr"] || console.error.bind(console);
            Object.assign(Module, moduleOverrides);
            moduleOverrides = null;
            if (Module["arguments"]) arguments_ = Module["arguments"];
            if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
            if (Module["quit"]) quit_ = Module["quit"];
            var wasmBinary;
            if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
            var noExitRuntime = Module["noExitRuntime"] || true;
            if (typeof WebAssembly != "object") {
                abort("no native wasm support detected")
            }
            var wasmMemory;
            var ABORT = false;
            var EXITSTATUS;
            var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

            function updateMemoryViews() {
                var b = wasmMemory.buffer;
                Module["HEAP8"] = HEAP8 = new Int8Array(b);
                Module["HEAP16"] = HEAP16 = new Int16Array(b);
                Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
                Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
                Module["HEAP32"] = HEAP32 = new Int32Array(b);
                Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
                Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
                Module["HEAPF64"] = HEAPF64 = new Float64Array(b)
            }

            var __ATPRERUN__ = [];
            var __ATINIT__ = [];
            var __ATPOSTRUN__ = [];
            var runtimeInitialized = false;
            var runtimeKeepaliveCounter = 0;

            function keepRuntimeAlive() {
                return noExitRuntime || runtimeKeepaliveCounter > 0
            }

            function preRun() {
                if (Module["preRun"]) {
                    if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
                    while (Module["preRun"].length) {
                        addOnPreRun(Module["preRun"].shift())
                    }
                }
                callRuntimeCallbacks(__ATPRERUN__)
            }

            function initRuntime() {
                runtimeInitialized = true;
                callRuntimeCallbacks(__ATINIT__)
            }

            function postRun() {
                if (Module["postRun"]) {
                    if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
                    while (Module["postRun"].length) {
                        addOnPostRun(Module["postRun"].shift())
                    }
                }
                callRuntimeCallbacks(__ATPOSTRUN__)
            }

            function addOnPreRun(cb) {
                __ATPRERUN__.unshift(cb)
            }

            function addOnInit(cb) {
                __ATINIT__.unshift(cb)
            }

            function addOnPostRun(cb) {
                __ATPOSTRUN__.unshift(cb)
            }

            var runDependencies = 0;
            var runDependencyWatcher = null;
            var dependenciesFulfilled = null;

            function addRunDependency(id) {
                runDependencies++;
                if (Module["monitorRunDependencies"]) {
                    Module["monitorRunDependencies"](runDependencies)
                }
            }

            function removeRunDependency(id) {
                runDependencies--;
                if (Module["monitorRunDependencies"]) {
                    Module["monitorRunDependencies"](runDependencies)
                }
                if (runDependencies == 0) {
                    if (runDependencyWatcher !== null) {
                        clearInterval(runDependencyWatcher);
                        runDependencyWatcher = null
                    }
                    if (dependenciesFulfilled) {
                        var callback = dependenciesFulfilled;
                        dependenciesFulfilled = null;
                        callback()
                    }
                }
            }

            function abort(what) {
                if (Module["onAbort"]) {
                    Module["onAbort"](what)
                }
                what = "Aborted(" + what + ")";
                err(what);
                ABORT = true;
                EXITSTATUS = 1;
                what += ". Build with -sASSERTIONS for more info.";
                var e = new WebAssembly.RuntimeError(what);
                readyPromiseReject(e);
                throw e
            }

            var dataURIPrefix = "data:application/octet-stream;base64,";

            function isDataURI(filename) {
                return filename.startsWith(dataURIPrefix)
            }

            function isFileURI(filename) {
                return filename.startsWith("file://")
            }

            var wasmBinaryFile;
            if (Module["locateFile"]) {
                wasmBinaryFile = "libcint_hf.wasm";
                if (!isDataURI(wasmBinaryFile)) {
                    wasmBinaryFile = locateFile(wasmBinaryFile)
                }
            } else {
                wasmBinaryFile = new URL("libcint_hf.wasm", import.meta.url).href
            }

            function getBinarySync(file) {
                if (file == wasmBinaryFile && wasmBinary) {
                    return new Uint8Array(wasmBinary)
                }
                if (readBinary) {
                    return readBinary(file)
                }
                throw "both async and sync fetching of the wasm failed"
            }

            function getBinaryPromise(binaryFile) {
                if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
                    if (typeof fetch == "function" && !isFileURI(binaryFile)) {
                        return fetch(binaryFile, {credentials: "same-origin"}).then(response => {
                            if (!response["ok"]) {
                                throw "failed to load wasm binary file at '" + binaryFile + "'"
                            }
                            return response["arrayBuffer"]()
                        }).catch(() => getBinarySync(binaryFile))
                    } else if (readAsync) {
                        return new Promise((resolve, reject) => {
                            readAsync(binaryFile, response => resolve(new Uint8Array(response)), reject)
                        })
                    }
                }
                return Promise.resolve().then(() => getBinarySync(binaryFile))
            }

            function instantiateArrayBuffer(binaryFile, imports, receiver) {
                return getBinaryPromise(binaryFile).then(binary => WebAssembly.instantiate(binary, imports)).then(instance => instance).then(receiver, reason => {
                    err(`failed to asynchronously prepare wasm: ${reason}`);
                    abort(reason)
                })
            }

            function instantiateAsync(binary, binaryFile, imports, callback) {
                if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && !isFileURI(binaryFile) && !ENVIRONMENT_IS_NODE && typeof fetch == "function") {
                    return fetch(binaryFile, {credentials: "same-origin"}).then(response => {
                        var result = WebAssembly.instantiateStreaming(response, imports);
                        return result.then(callback, function (reason) {
                            err(`wasm streaming compile failed: ${reason}`);
                            err("falling back to ArrayBuffer instantiation");
                            return instantiateArrayBuffer(binaryFile, imports, callback)
                        })
                    })
                }
                return instantiateArrayBuffer(binaryFile, imports, callback)
            }

            function createWasm() {
                var info = {"a": wasmImports};

                function receiveInstance(instance, module) {
                    wasmExports = instance.exports;
                    wasmMemory = wasmExports["g"];
                    updateMemoryViews();
                    addOnInit(wasmExports["h"]);
                    removeRunDependency("wasm-instantiate");
                    return wasmExports
                }

                addRunDependency("wasm-instantiate");

                function receiveInstantiationResult(result) {
                    receiveInstance(result["instance"])
                }

                if (Module["instantiateWasm"]) {
                    try {
                        return Module["instantiateWasm"](info, receiveInstance)
                    } catch (e) {
                        err(`Module.instantiateWasm callback failed with error: ${e}`);
                        readyPromiseReject(e)
                    }
                }
                instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
                return {}
            }

            function ExitStatus(status) {
                this.name = "ExitStatus";
                this.message = `Program terminated with exit(${status})`;
                this.status = status
            }

            var callRuntimeCallbacks = callbacks => {
                while (callbacks.length > 0) {
                    callbacks.shift()(Module)
                }
            };
            var _emscripten_memcpy_js = (dest, src, num) => HEAPU8.copyWithin(dest, src, src + num);
            var getHeapMax = () => 2147483648;
            var growMemory = size => {
                var b = wasmMemory.buffer;
                var pages = (size - b.byteLength + 65535) / 65536;
                try {
                    wasmMemory.grow(pages);
                    updateMemoryViews();
                    return 1
                } catch (e) {
                }
            };
            var _emscripten_resize_heap = requestedSize => {
                var oldSize = HEAPU8.length;
                requestedSize >>>= 0;
                var maxHeapSize = getHeapMax();
                if (requestedSize > maxHeapSize) {
                    return false
                }
                var alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
                for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
                    var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
                    overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
                    var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
                    var replacement = growMemory(newSize);
                    if (replacement) {
                        return true
                    }
                }
                return false
            };
            var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;
            var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
                var endIdx = idx + maxBytesToRead;
                var endPtr = idx;
                while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
                if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
                    return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr))
                }
                var str = "";
                while (idx < endPtr) {
                    var u0 = heapOrArray[idx++];
                    if (!(u0 & 128)) {
                        str += String.fromCharCode(u0);
                        continue
                    }
                    var u1 = heapOrArray[idx++] & 63;
                    if ((u0 & 224) == 192) {
                        str += String.fromCharCode((u0 & 31) << 6 | u1);
                        continue
                    }
                    var u2 = heapOrArray[idx++] & 63;
                    if ((u0 & 240) == 224) {
                        u0 = (u0 & 15) << 12 | u1 << 6 | u2
                    } else {
                        u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63
                    }
                    if (u0 < 65536) {
                        str += String.fromCharCode(u0)
                    } else {
                        var ch = u0 - 65536;
                        str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
                    }
                }
                return str
            };
            var UTF8ToString = (ptr, maxBytesToRead) => ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
            var SYSCALLS = {
                varargs: undefined, get() {
                    var ret = HEAP32[+SYSCALLS.varargs >> 2];
                    SYSCALLS.varargs += 4;
                    return ret
                }, getp() {
                    return SYSCALLS.get()
                }, getStr(ptr) {
                    var ret = UTF8ToString(ptr);
                    return ret
                }
            };
            var _proc_exit = code => {
                EXITSTATUS = code;
                if (!keepRuntimeAlive()) {
                    if (Module["onExit"]) Module["onExit"](code);
                    ABORT = true
                }
                quit_(code, new ExitStatus(code))
            };
            var exitJS = (status, implicit) => {
                EXITSTATUS = status;
                _proc_exit(status)
            };
            var _exit = exitJS;
            var _fd_close = fd => 52;
            var convertI32PairToI53Checked = (lo, hi) => hi + 2097152 >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;

            function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
                var offset = convertI32PairToI53Checked(offset_low, offset_high);
                return 70
            }

            var printCharBuffers = [null, [], []];
            var printChar = (stream, curr) => {
                var buffer = printCharBuffers[stream];
                if (curr === 0 || curr === 10) {
                    (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
                    buffer.length = 0
                } else {
                    buffer.push(curr)
                }
            };
            var _fd_write = (fd, iov, iovcnt, pnum) => {
                var num = 0;
                for (var i = 0; i < iovcnt; i++) {
                    var ptr = HEAPU32[iov >> 2];
                    var len = HEAPU32[iov + 4 >> 2];
                    iov += 8;
                    for (var j = 0; j < len; j++) {
                        printChar(fd, HEAPU8[ptr + j])
                    }
                    num += len
                }
                HEAPU32[pnum >> 2] = num;
                return 0
            };
            var wasmImports = {
                e: _emscripten_memcpy_js,
                d: _emscripten_resize_heap,
                a: _exit,
                f: _fd_close,
                c: _fd_seek,
                b: _fd_write
            };
            var wasmExports = createWasm();
            var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports["h"])();
            var _CINTc2s_bra_sph = Module["_CINTc2s_bra_sph"] = (a0, a1, a2, a3) => (_CINTc2s_bra_sph = Module["_CINTc2s_bra_sph"] = wasmExports["i"])(a0, a1, a2, a3);
            var _CINTc2s_ket_sph = Module["_CINTc2s_ket_sph"] = (a0, a1, a2, a3) => (_CINTc2s_ket_sph = Module["_CINTc2s_ket_sph"] = wasmExports["j"])(a0, a1, a2, a3);
            var _CINTc2s_ket_sph1 = Module["_CINTc2s_ket_sph1"] = (a0, a1, a2, a3, a4) => (_CINTc2s_ket_sph1 = Module["_CINTc2s_ket_sph1"] = wasmExports["k"])(a0, a1, a2, a3, a4);
            var _CINTc2s_ket_spinor_sf1 = Module["_CINTc2s_ket_spinor_sf1"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_CINTc2s_ket_spinor_sf1 = Module["_CINTc2s_ket_spinor_sf1"] = wasmExports["l"])(a0, a1, a2, a3, a4, a5, a6, a7);
            var _CINTc2s_iket_spinor_sf1 = Module["_CINTc2s_iket_spinor_sf1"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_CINTc2s_iket_spinor_sf1 = Module["_CINTc2s_iket_spinor_sf1"] = wasmExports["m"])(a0, a1, a2, a3, a4, a5, a6, a7);
            var _CINTc2s_ket_spinor_si1 = Module["_CINTc2s_ket_spinor_si1"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_CINTc2s_ket_spinor_si1 = Module["_CINTc2s_ket_spinor_si1"] = wasmExports["n"])(a0, a1, a2, a3, a4, a5, a6, a7);
            var _CINTc2s_iket_spinor_si1 = Module["_CINTc2s_iket_spinor_si1"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_CINTc2s_iket_spinor_si1 = Module["_CINTc2s_iket_spinor_si1"] = wasmExports["o"])(a0, a1, a2, a3, a4, a5, a6, a7);
            var _int1e_ovlp_sph = Module["_int1e_ovlp_sph"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_ovlp_sph = Module["_int1e_ovlp_sph"] = wasmExports["p"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int1e_ovlp_cart = Module["_int1e_ovlp_cart"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_ovlp_cart = Module["_int1e_ovlp_cart"] = wasmExports["q"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int1e_ovlp_spinor = Module["_int1e_ovlp_spinor"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_ovlp_spinor = Module["_int1e_ovlp_spinor"] = wasmExports["r"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int1e_ovlp_optimizer = Module["_int1e_ovlp_optimizer"] = (a0, a1, a2, a3, a4, a5) => (_int1e_ovlp_optimizer = Module["_int1e_ovlp_optimizer"] = wasmExports["s"])(a0, a1, a2, a3, a4, a5);
            var _int1e_nuc_sph = Module["_int1e_nuc_sph"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_nuc_sph = Module["_int1e_nuc_sph"] = wasmExports["t"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int1e_nuc_cart = Module["_int1e_nuc_cart"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_nuc_cart = Module["_int1e_nuc_cart"] = wasmExports["u"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int1e_nuc_spinor = Module["_int1e_nuc_spinor"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_nuc_spinor = Module["_int1e_nuc_spinor"] = wasmExports["v"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int1e_nuc_optimizer = Module["_int1e_nuc_optimizer"] = (a0, a1, a2, a3, a4, a5) => (_int1e_nuc_optimizer = Module["_int1e_nuc_optimizer"] = wasmExports["w"])(a0, a1, a2, a3, a4, a5);
            var _int2e_sph = Module["_int2e_sph"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int2e_sph = Module["_int2e_sph"] = wasmExports["x"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int2e_optimizer = Module["_int2e_optimizer"] = (a0, a1, a2, a3, a4, a5) => (_int2e_optimizer = Module["_int2e_optimizer"] = wasmExports["y"])(a0, a1, a2, a3, a4, a5);
            var _int2e_cart = Module["_int2e_cart"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int2e_cart = Module["_int2e_cart"] = wasmExports["z"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int2e_spinor = Module["_int2e_spinor"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int2e_spinor = Module["_int2e_spinor"] = wasmExports["A"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _CINTlen_cart = Module["_CINTlen_cart"] = a0 => (_CINTlen_cart = Module["_CINTlen_cart"] = wasmExports["B"])(a0);
            var _CINTlen_spinor = Module["_CINTlen_spinor"] = (a0, a1) => (_CINTlen_spinor = Module["_CINTlen_spinor"] = wasmExports["C"])(a0, a1);
            var _CINTcgtos_cart = Module["_CINTcgtos_cart"] = (a0, a1) => (_CINTcgtos_cart = Module["_CINTcgtos_cart"] = wasmExports["D"])(a0, a1);
            var _CINTcgto_cart = Module["_CINTcgto_cart"] = (a0, a1) => (_CINTcgto_cart = Module["_CINTcgto_cart"] = wasmExports["E"])(a0, a1);
            var _CINTcgtos_spheric = Module["_CINTcgtos_spheric"] = (a0, a1) => (_CINTcgtos_spheric = Module["_CINTcgtos_spheric"] = wasmExports["F"])(a0, a1);
            var _CINTcgto_spheric = Module["_CINTcgto_spheric"] = (a0, a1) => (_CINTcgto_spheric = Module["_CINTcgto_spheric"] = wasmExports["G"])(a0, a1);
            var _CINTcgtos_spinor = Module["_CINTcgtos_spinor"] = (a0, a1) => (_CINTcgtos_spinor = Module["_CINTcgtos_spinor"] = wasmExports["H"])(a0, a1);
            var _CINTcgto_spinor = Module["_CINTcgto_spinor"] = (a0, a1) => (_CINTcgto_spinor = Module["_CINTcgto_spinor"] = wasmExports["I"])(a0, a1);
            var _CINTtot_pgto_spheric = Module["_CINTtot_pgto_spheric"] = (a0, a1) => (_CINTtot_pgto_spheric = Module["_CINTtot_pgto_spheric"] = wasmExports["J"])(a0, a1);
            var _CINTtot_pgto_spinor = Module["_CINTtot_pgto_spinor"] = (a0, a1) => (_CINTtot_pgto_spinor = Module["_CINTtot_pgto_spinor"] = wasmExports["K"])(a0, a1);
            var _CINTtot_cgto_spheric = Module["_CINTtot_cgto_spheric"] = (a0, a1) => (_CINTtot_cgto_spheric = Module["_CINTtot_cgto_spheric"] = wasmExports["L"])(a0, a1);
            var _CINTtot_cgto_spinor = Module["_CINTtot_cgto_spinor"] = (a0, a1) => (_CINTtot_cgto_spinor = Module["_CINTtot_cgto_spinor"] = wasmExports["M"])(a0, a1);
            var _CINTtot_cgto_cart = Module["_CINTtot_cgto_cart"] = (a0, a1) => (_CINTtot_cgto_cart = Module["_CINTtot_cgto_cart"] = wasmExports["N"])(a0, a1);
            var _CINTshells_cart_offset = Module["_CINTshells_cart_offset"] = (a0, a1, a2) => (_CINTshells_cart_offset = Module["_CINTshells_cart_offset"] = wasmExports["O"])(a0, a1, a2);
            var _CINTshells_spheric_offset = Module["_CINTshells_spheric_offset"] = (a0, a1, a2) => (_CINTshells_spheric_offset = Module["_CINTshells_spheric_offset"] = wasmExports["P"])(a0, a1, a2);
            var _CINTshells_spinor_offset = Module["_CINTshells_spinor_offset"] = (a0, a1, a2) => (_CINTshells_spinor_offset = Module["_CINTshells_spinor_offset"] = wasmExports["Q"])(a0, a1, a2);
            var _CINTgto_norm = Module["_CINTgto_norm"] = (a0, a1) => (_CINTgto_norm = Module["_CINTgto_norm"] = wasmExports["R"])(a0, a1);
            var _CINTinit_2e_optimizer = Module["_CINTinit_2e_optimizer"] = (a0, a1, a2, a3, a4, a5) => (_CINTinit_2e_optimizer = Module["_CINTinit_2e_optimizer"] = wasmExports["S"])(a0, a1, a2, a3, a4, a5);
            var _CINTinit_optimizer = Module["_CINTinit_optimizer"] = (a0, a1, a2, a3, a4, a5) => (_CINTinit_optimizer = Module["_CINTinit_optimizer"] = wasmExports["T"])(a0, a1, a2, a3, a4, a5);
            var _CINTdel_2e_optimizer = Module["_CINTdel_2e_optimizer"] = a0 => (_CINTdel_2e_optimizer = Module["_CINTdel_2e_optimizer"] = wasmExports["U"])(a0);
            var _CINTdel_optimizer = Module["_CINTdel_optimizer"] = a0 => (_CINTdel_optimizer = Module["_CINTdel_optimizer"] = wasmExports["V"])(a0);
            var _int1e_ipovlp_optimizer = Module["_int1e_ipovlp_optimizer"] = (a0, a1, a2, a3, a4, a5) => (_int1e_ipovlp_optimizer = Module["_int1e_ipovlp_optimizer"] = wasmExports["W"])(a0, a1, a2, a3, a4, a5);
            var _int1e_ipovlp_cart = Module["_int1e_ipovlp_cart"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_ipovlp_cart = Module["_int1e_ipovlp_cart"] = wasmExports["X"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int1e_ipovlp_sph = Module["_int1e_ipovlp_sph"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_ipovlp_sph = Module["_int1e_ipovlp_sph"] = wasmExports["Y"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int1e_ipovlp_spinor = Module["_int1e_ipovlp_spinor"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_ipovlp_spinor = Module["_int1e_ipovlp_spinor"] = wasmExports["Z"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int1e_ipkin_optimizer = Module["_int1e_ipkin_optimizer"] = (a0, a1, a2, a3, a4, a5) => (_int1e_ipkin_optimizer = Module["_int1e_ipkin_optimizer"] = wasmExports["_"])(a0, a1, a2, a3, a4, a5);
            var _int1e_ipkin_cart = Module["_int1e_ipkin_cart"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_ipkin_cart = Module["_int1e_ipkin_cart"] = wasmExports["$"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int1e_ipkin_sph = Module["_int1e_ipkin_sph"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_ipkin_sph = Module["_int1e_ipkin_sph"] = wasmExports["aa"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int1e_ipkin_spinor = Module["_int1e_ipkin_spinor"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_ipkin_spinor = Module["_int1e_ipkin_spinor"] = wasmExports["ba"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int1e_ipnuc_optimizer = Module["_int1e_ipnuc_optimizer"] = (a0, a1, a2, a3, a4, a5) => (_int1e_ipnuc_optimizer = Module["_int1e_ipnuc_optimizer"] = wasmExports["ca"])(a0, a1, a2, a3, a4, a5);
            var _int1e_ipnuc_cart = Module["_int1e_ipnuc_cart"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_ipnuc_cart = Module["_int1e_ipnuc_cart"] = wasmExports["da"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int1e_ipnuc_sph = Module["_int1e_ipnuc_sph"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_ipnuc_sph = Module["_int1e_ipnuc_sph"] = wasmExports["ea"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int1e_ipnuc_spinor = Module["_int1e_ipnuc_spinor"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_ipnuc_spinor = Module["_int1e_ipnuc_spinor"] = wasmExports["fa"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int2e_ip1_optimizer = Module["_int2e_ip1_optimizer"] = (a0, a1, a2, a3, a4, a5) => (_int2e_ip1_optimizer = Module["_int2e_ip1_optimizer"] = wasmExports["ga"])(a0, a1, a2, a3, a4, a5);
            var _int2e_ip1_cart = Module["_int2e_ip1_cart"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int2e_ip1_cart = Module["_int2e_ip1_cart"] = wasmExports["ha"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int2e_ip1_sph = Module["_int2e_ip1_sph"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int2e_ip1_sph = Module["_int2e_ip1_sph"] = wasmExports["ia"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int2e_ip1_spinor = Module["_int2e_ip1_spinor"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int2e_ip1_spinor = Module["_int2e_ip1_spinor"] = wasmExports["ja"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int3c2e_ip1_optimizer = Module["_int3c2e_ip1_optimizer"] = (a0, a1, a2, a3, a4, a5) => (_int3c2e_ip1_optimizer = Module["_int3c2e_ip1_optimizer"] = wasmExports["ka"])(a0, a1, a2, a3, a4, a5);
            var _int3c2e_ip1_cart = Module["_int3c2e_ip1_cart"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int3c2e_ip1_cart = Module["_int3c2e_ip1_cart"] = wasmExports["la"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int3c2e_ip1_sph = Module["_int3c2e_ip1_sph"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int3c2e_ip1_sph = Module["_int3c2e_ip1_sph"] = wasmExports["ma"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int3c2e_ip1_spinor = Module["_int3c2e_ip1_spinor"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int3c2e_ip1_spinor = Module["_int3c2e_ip1_spinor"] = wasmExports["na"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int1e_kin_optimizer = Module["_int1e_kin_optimizer"] = (a0, a1, a2, a3, a4, a5) => (_int1e_kin_optimizer = Module["_int1e_kin_optimizer"] = wasmExports["oa"])(a0, a1, a2, a3, a4, a5);
            var _int1e_kin_cart = Module["_int1e_kin_cart"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_kin_cart = Module["_int1e_kin_cart"] = wasmExports["pa"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int1e_kin_sph = Module["_int1e_kin_sph"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_kin_sph = Module["_int1e_kin_sph"] = wasmExports["qa"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int1e_kin_spinor = Module["_int1e_kin_spinor"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_kin_spinor = Module["_int1e_kin_spinor"] = wasmExports["ra"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int1e_rinv_optimizer = Module["_int1e_rinv_optimizer"] = (a0, a1, a2, a3, a4, a5) => (_int1e_rinv_optimizer = Module["_int1e_rinv_optimizer"] = wasmExports["sa"])(a0, a1, a2, a3, a4, a5);
            var _int1e_rinv_cart = Module["_int1e_rinv_cart"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_rinv_cart = Module["_int1e_rinv_cart"] = wasmExports["ta"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int1e_rinv_sph = Module["_int1e_rinv_sph"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_rinv_sph = Module["_int1e_rinv_sph"] = wasmExports["ua"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var _int1e_rinv_spinor = Module["_int1e_rinv_spinor"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_int1e_rinv_spinor = Module["_int1e_rinv_spinor"] = wasmExports["va"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
            var ___errno_location = () => (___errno_location = wasmExports["__errno_location"])();
            var _malloc = Module["_malloc"] = a0 => (_malloc = Module["_malloc"] = wasmExports["wa"])(a0);
            var _free = Module["_free"] = a0 => (_free = Module["_free"] = wasmExports["xa"])(a0);
            var calledRun;
            dependenciesFulfilled = function runCaller() {
                if (!calledRun) run();
                if (!calledRun) dependenciesFulfilled = runCaller
            };

            function run() {
                if (runDependencies > 0) {
                    return
                }
                preRun();
                if (runDependencies > 0) {
                    return
                }

                function doRun() {
                    if (calledRun) return;
                    calledRun = true;
                    Module["calledRun"] = true;
                    if (ABORT) return;
                    initRuntime();
                    readyPromiseResolve(Module);
                    if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
                    postRun()
                }

                if (Module["setStatus"]) {
                    Module["setStatus"]("Running...");
                    setTimeout(function () {
                        setTimeout(function () {
                            Module["setStatus"]("")
                        }, 1);
                        doRun()
                    }, 1)
                } else {
                    doRun()
                }
            }

            if (Module["preInit"]) {
                if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
                while (Module["preInit"].length > 0) {
                    Module["preInit"].pop()()
                }
            }
            run();


            return moduleArg.ready
        }

    );
})();
export default Module;