(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/lib/theme/theme-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider,
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
const ThemeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function ThemeProvider({ children, defaultTheme = 'system', storageKey = 'todo-app-theme' }) {
    _s();
    const [theme, setThemeState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaultTheme);
    const [resolvedTheme, setResolvedTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('light');
    // Get system preference
    const getSystemTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ThemeProvider.useCallback[getSystemTheme]": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
    }["ThemeProvider.useCallback[getSystemTheme]"], []);
    // Resolve theme based on current setting
    const resolveTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ThemeProvider.useCallback[resolveTheme]": (currentTheme)=>{
            if (currentTheme === 'system') {
                return getSystemTheme();
            }
            return currentTheme;
        }
    }["ThemeProvider.useCallback[resolveTheme]"], [
        getSystemTheme
    ]);
    // Apply theme to document
    const applyTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ThemeProvider.useCallback[applyTheme]": (resolved)=>{
            if (typeof document === 'undefined') return;
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(resolved);
            root.style.colorScheme = resolved;
        }
    }["ThemeProvider.useCallback[applyTheme]"], []);
    // Initialize theme from storage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeProvider.useEffect": ()=>{
            const stored = localStorage.getItem(storageKey);
            if (stored && [
                'light',
                'dark',
                'system'
            ].includes(stored)) {
                setThemeState(stored);
            }
        }
    }["ThemeProvider.useEffect"], [
        storageKey
    ]);
    // Update resolved theme when theme changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeProvider.useEffect": ()=>{
            const resolved = resolveTheme(theme);
            setResolvedTheme(resolved);
            applyTheme(resolved);
        }
    }["ThemeProvider.useEffect"], [
        theme,
        resolveTheme,
        applyTheme
    ]);
    // Listen for system theme changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeProvider.useEffect": ()=>{
            if (theme !== 'system') return;
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = {
                "ThemeProvider.useEffect.handleChange": ()=>{
                    const resolved = getSystemTheme();
                    setResolvedTheme(resolved);
                    applyTheme(resolved);
                }
            }["ThemeProvider.useEffect.handleChange"];
            mediaQuery.addEventListener('change', handleChange);
            return ({
                "ThemeProvider.useEffect": ()=>mediaQuery.removeEventListener('change', handleChange)
            })["ThemeProvider.useEffect"];
        }
    }["ThemeProvider.useEffect"], [
        theme,
        getSystemTheme,
        applyTheme
    ]);
    const setTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ThemeProvider.useCallback[setTheme]": (newTheme)=>{
            setThemeState(newTheme);
            localStorage.setItem(storageKey, newTheme);
        }
    }["ThemeProvider.useCallback[setTheme]"], [
        storageKey
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeContext.Provider, {
        value: {
            theme,
            resolvedTheme,
            setTheme
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/lib/theme/theme-provider.tsx",
        lineNumber: 89,
        columnNumber: 5
    }, this);
}
_s(ThemeProvider, "LmRMx6jGW/i4GBaLfO9sakFExDg=");
_c = ThemeProvider;
function useTheme() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
_s1(useTheme, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "ThemeProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/hooks/use-reduced-motion.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "useReducedMotion",
    ()=>useReducedMotion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
function useReducedMotion() {
    _s();
    const [prefersReducedMotion, setPrefersReducedMotion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useReducedMotion.useEffect": ()=>{
            // Check for the media query on mount
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            setPrefersReducedMotion(mediaQuery.matches);
            // Listen for changes
            const handleChange = {
                "useReducedMotion.useEffect.handleChange": (event)=>{
                    setPrefersReducedMotion(event.matches);
                }
            }["useReducedMotion.useEffect.handleChange"];
            mediaQuery.addEventListener('change', handleChange);
            return ({
                "useReducedMotion.useEffect": ()=>{
                    mediaQuery.removeEventListener('change', handleChange);
                }
            })["useReducedMotion.useEffect"];
        }
    }["useReducedMotion.useEffect"], []);
    return prefersReducedMotion;
}
_s(useReducedMotion, "c2o+PeDo1dLruq/wbnW+Z6a6rIY=");
const __TURBOPACK__default__export__ = useReducedMotion;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ui/toast.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToastProvider",
    ()=>ToastProvider,
    "default",
    ()=>__TURBOPACK__default__export__,
    "useToast",
    ()=>useToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$hooks$2f$use$2d$reduced$2d$motion$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/hooks/use-reduced-motion.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
;
;
const ToastContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createContext(undefined);
function useToast() {
    _s();
    const context = __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
_s(useToast, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
function ToastProvider({ children }) {
    _s1();
    const [toasts, setToasts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const prefersReducedMotion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$hooks$2f$use$2d$reduced$2d$motion$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    const addToast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ToastProvider.useCallback[addToast]": (message, type = 'info', duration = 5000)=>{
            const id = Math.random().toString(36).substring(2, 9);
            setToasts({
                "ToastProvider.useCallback[addToast]": (prev)=>[
                        ...prev,
                        {
                            id,
                            message,
                            type,
                            duration
                        }
                    ]
            }["ToastProvider.useCallback[addToast]"]);
        }
    }["ToastProvider.useCallback[addToast]"], []);
    const removeToast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ToastProvider.useCallback[removeToast]": (id)=>{
            setToasts({
                "ToastProvider.useCallback[removeToast]": (prev)=>prev.filter({
                        "ToastProvider.useCallback[removeToast]": (toast)=>toast.id !== id
                    }["ToastProvider.useCallback[removeToast]"])
            }["ToastProvider.useCallback[removeToast]"]);
        }
    }["ToastProvider.useCallback[removeToast]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastContext.Provider, {
        value: {
            addToast,
            removeToast
        },
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastContainer, {
                toasts: toasts,
                removeToast: removeToast,
                prefersReducedMotion: prefersReducedMotion
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ui/toast.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ui/toast.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, this);
}
_s1(ToastProvider, "QjGZLA+W3leeL8O+ssh1ZkxbzMY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$hooks$2f$use$2d$reduced$2d$motion$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useReducedMotion"]
    ];
});
_c = ToastProvider;
function ToastContainer({ toasts, removeToast, prefersReducedMotion }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-4 right-4 z-50 flex flex-col gap-2",
        children: toasts.map((toast)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastItem, {
                toast: toast,
                onClose: ()=>removeToast(toast.id),
                prefersReducedMotion: prefersReducedMotion
            }, toast.id, false, {
                fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ui/toast.tsx",
                lineNumber: 72,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ui/toast.tsx",
        lineNumber: 70,
        columnNumber: 5
    }, this);
}
_c1 = ToastContainer;
function ToastItem({ toast, onClose, prefersReducedMotion }) {
    _s2();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ToastItem.useEffect": ()=>{
            if (toast.duration && toast.duration > 0) {
                const timer = setTimeout(onClose, toast.duration);
                return ({
                    "ToastItem.useEffect": ()=>clearTimeout(timer)
                })["ToastItem.useEffect"];
            }
        }
    }["ToastItem.useEffect"], [
        toast.duration,
        onClose
    ]);
    const typeStyles = {
        info: 'bg-primary text-primary-foreground',
        success: 'bg-green-500 text-white',
        warning: 'bg-yellow-500 text-black',
        error: 'bg-destructive text-destructive-foreground'
    };
    const transitionClass = prefersReducedMotion ? '' : 'animate-in slide-in-from-right-5 fade-in duration-300';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[280px] max-w-md ${typeStyles[toast.type]} ${transitionClass}`,
        role: "alert",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex-1",
                children: toast.message
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ui/toast.tsx",
                lineNumber: 113,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onClose,
                className: "p-1 hover:opacity-80 transition-opacity",
                "aria-label": "Close notification",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    xmlns: "http://www.w3.org/2000/svg",
                    className: "h-4 w-4",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M6 18L18 6M6 6l12 12"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ui/toast.tsx",
                        lineNumber: 126,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ui/toast.tsx",
                    lineNumber: 119,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ui/toast.tsx",
                lineNumber: 114,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ui/toast.tsx",
        lineNumber: 109,
        columnNumber: 5
    }, this);
}
_s2(ToastItem, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c2 = ToastItem;
const __TURBOPACK__default__export__ = ToastProvider;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "ToastProvider");
__turbopack_context__.k.register(_c1, "ToastContainer");
__turbopack_context__.k.register(_c2, "ToastItem");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/lib/api-client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiErrorType",
    ()=>ApiErrorType,
    "apiClient",
    ()=>apiClient,
    "onRetry",
    ()=>onRetry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const API_BASE_URL = __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAYS = [
    1000,
    2000,
    4000
]; // Exponential backoff: 1s, 2s, 4s
var ApiErrorType = /*#__PURE__*/ function(ApiErrorType) {
    ApiErrorType["NETWORK_ERROR"] = "NETWORK_ERROR";
    ApiErrorType["SERVER_ERROR"] = "SERVER_ERROR";
    ApiErrorType["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ApiErrorType["AUTH_ERROR"] = "AUTH_ERROR";
    ApiErrorType["TIMEOUT_ERROR"] = "TIMEOUT_ERROR";
    ApiErrorType["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
    return ApiErrorType;
}({});
const retryListeners = new Set();
function onRetry(listener) {
    retryListeners.add(listener);
    return ()=>retryListeners.delete(listener);
}
function notifyRetry(attempt, maxRetries) {
    retryListeners.forEach((listener)=>listener(attempt, maxRetries));
}
class ApiClient {
    getAuthToken() {
        if ("TURBOPACK compile-time truthy", 1) {
            return localStorage.getItem('access_token');
        }
        //TURBOPACK unreachable
        ;
    }
    setAuthTokens(accessToken, refreshToken) {
        if ("TURBOPACK compile-time truthy", 1) {
            localStorage.setItem('access_token', accessToken);
            if (refreshToken) {
                localStorage.setItem('refresh_token', refreshToken);
            }
        }
    }
    clearAuthTokens() {
        if ("TURBOPACK compile-time truthy", 1) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
    }
    /**
   * Determines if the error is retryable
   */ isRetryableError(error) {
        return error.type === "NETWORK_ERROR" || error.type === "TIMEOUT_ERROR" || error.type === "SERVER_ERROR";
    }
    /**
   * Determines the type of network error based on the error message
   */ categorizeNetworkError(error) {
        const message = error.message.toLowerCase();
        // Timeout errors
        if (message.includes('timeout') || message.includes('aborted') || error.name === 'AbortError') {
            return {
                message: 'Request timed out. Please check your connection and try again.',
                type: "TIMEOUT_ERROR"
            };
        }
        // Connection refused - backend server not running
        if (message.includes('failed to fetch') || message.includes('network') || message.includes('connection')) {
            return {
                message: 'Unable to connect to the server. Please ensure the backend is running on ' + API_BASE_URL,
                type: "NETWORK_ERROR"
            };
        }
        // CORS errors
        if (message.includes('cors')) {
            return {
                message: 'Cross-origin request blocked. Please check server CORS configuration.',
                type: "NETWORK_ERROR"
            };
        }
        return {
            message: 'A network error occurred. Please check your connection.',
            type: "NETWORK_ERROR"
        };
    }
    /**
   * Categorizes HTTP error responses
   */ categorizeHttpError(status, detail) {
        if (status === 401) {
            return {
                message: detail || 'Authentication required. Please log in.',
                type: "AUTH_ERROR",
                statusCode: status
            };
        }
        if (status === 403) {
            return {
                message: detail || 'You do not have permission to perform this action.',
                type: "AUTH_ERROR",
                statusCode: status
            };
        }
        if (status === 422 || status === 400) {
            return {
                message: detail || 'Invalid input. Please check your data and try again.',
                type: "VALIDATION_ERROR",
                statusCode: status
            };
        }
        if (status >= 500) {
            return {
                message: detail || 'Server error. Please try again later.',
                type: "SERVER_ERROR",
                statusCode: status
            };
        }
        return {
            message: detail || `Request failed with status ${status}`,
            type: "UNKNOWN_ERROR",
            statusCode: status
        };
    }
    /**
   * Sleep for a specified duration
   */ sleep(ms) {
        return new Promise((resolve)=>setTimeout(resolve, ms));
    }
    /**
   * Make a single request with timeout
   */ async singleRequest(endpoint, options = {}, timeout = DEFAULT_TIMEOUT) {
        const token = this.getAuthToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(()=>controller.abort(), timeout);
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                const errorData = await response.json().catch(()=>({}));
                const apiError = this.categorizeHttpError(response.status, errorData.detail);
                return {
                    error: apiError
                };
            }
            const data = await response.json();
            return {
                data
            };
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error) {
                const apiError = this.categorizeNetworkError(error);
                return {
                    error: apiError
                };
            }
            return {
                error: {
                    message: 'An unexpected error occurred',
                    type: "UNKNOWN_ERROR"
                }
            };
        }
    }
    /**
   * Make a request with automatic retry on failure
   */ async request(endpoint, options = {}, enableRetry = true) {
        let lastError;
        for(let attempt = 0; attempt <= (enableRetry ? MAX_RETRIES : 0); attempt++){
            if (attempt > 0) {
                const delay = RETRY_DELAYS[attempt - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
                notifyRetry(attempt, MAX_RETRIES);
                await this.sleep(delay);
            }
            const result = await this.singleRequest(endpoint, options);
            if (result.data) {
                return {
                    data: result.data
                };
            }
            if (result.error) {
                lastError = result.error;
                // Don't retry on non-retryable errors
                if (!this.isRetryableError(result.error)) {
                    return {
                        error: result.error.message
                    };
                }
            }
        }
        return {
            error: lastError?.message || 'Request failed after multiple retries'
        };
    }
    // Auth methods (no retry on auth requests)
    async login(email, password) {
        const response = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password
            })
        }, false // Disable retry for auth
        );
        if (response.data) {
            this.setAuthTokens(response.data.access_token, response.data.refresh_token);
        }
        return response;
    }
    async register(email, password) {
        const response = await this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password
            })
        }, false // Disable retry for auth
        );
        if (response.data) {
            this.setAuthTokens(response.data.access_token);
        }
        return response;
    }
    async logout() {
        const response = await this.request('/api/auth/logout', {
            method: 'POST'
        }, false);
        this.clearAuthTokens();
        return response;
    }
    // Task methods
    async getTasks() {
        return this.request('/api/tasks/');
    }
    async getTask(taskId) {
        return this.request(`/api/tasks/${taskId}`);
    }
    async createTask(title, description) {
        return this.request('/api/tasks/', {
            method: 'POST',
            body: JSON.stringify({
                title,
                description
            })
        });
    }
    async updateTask(taskId, taskData) {
        return this.request(`/api/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(taskData)
        });
    }
    async deleteTask(taskId) {
        return this.request(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });
    }
    async reorderTasks(taskIds) {
        return this.request('/api/tasks/reorder', {
            method: 'POST',
            body: JSON.stringify({
                task_ids: taskIds
            })
        });
    }
    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getAuthToken();
    }
    // Event methods
    async getEvents(startDate, endDate) {
        let endpoint = '/api/events/';
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (params.toString()) endpoint += `?${params.toString()}`;
        return this.request(endpoint);
    }
    async getEvent(eventId) {
        return this.request(`/api/events/${eventId}`);
    }
    async createEvent(eventData) {
        return this.request('/api/events/', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
    }
    async updateEvent(eventId, eventData) {
        return this.request(`/api/events/${eventId}`, {
            method: 'PUT',
            body: JSON.stringify(eventData)
        });
    }
    async deleteEvent(eventId) {
        return this.request(`/api/events/${eventId}`, {
            method: 'DELETE'
        });
    }
    // User profile methods
    async getProfile() {
        return this.request('/api/users/profile');
    }
    async updateProfile(profileData) {
        return this.request('/api/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }
    async completeOnboarding() {
        return this.request('/api/users/onboarding', {
            method: 'POST'
        });
    }
}
const apiClient = new ApiClient();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ui/reconnecting-indicator.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReconnectingIndicator",
    ()=>ReconnectingIndicator,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/lib/api-client.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function ReconnectingIndicator() {
    _s();
    const [isReconnecting, setIsReconnecting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [attempt, setAttempt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [maxRetries, setMaxRetries] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(3);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ReconnectingIndicator.useEffect": ()=>{
            const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onRetry"])({
                "ReconnectingIndicator.useEffect.unsubscribe": (currentAttempt, max)=>{
                    setIsReconnecting(true);
                    setAttempt(currentAttempt);
                    setMaxRetries(max);
                    // Hide after a delay when not retrying anymore
                    const timer = setTimeout({
                        "ReconnectingIndicator.useEffect.unsubscribe.timer": ()=>{
                            setIsReconnecting(false);
                        }
                    }["ReconnectingIndicator.useEffect.unsubscribe.timer"], 3000);
                    return ({
                        "ReconnectingIndicator.useEffect.unsubscribe": ()=>clearTimeout(timer)
                    })["ReconnectingIndicator.useEffect.unsubscribe"];
                }
            }["ReconnectingIndicator.useEffect.unsubscribe"]);
            return unsubscribe;
        }
    }["ReconnectingIndicator.useEffect"], []);
    if (!isReconnecting) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-4 left-4 z-50 flex items-center gap-3 px-4 py-3 bg-yellow-500 text-black rounded-lg shadow-lg animate-pulse",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                className: "animate-spin h-5 w-5",
                xmlns: "http://www.w3.org/2000/svg",
                fill: "none",
                viewBox: "0 0 24 24",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        className: "opacity-25",
                        cx: "12",
                        cy: "12",
                        r: "10",
                        stroke: "currentColor",
                        strokeWidth: "4"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ui/reconnecting-indicator.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        className: "opacity-75",
                        fill: "currentColor",
                        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ui/reconnecting-indicator.tsx",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ui/reconnecting-indicator.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "font-medium",
                children: [
                    "Reconnecting... (",
                    attempt,
                    "/",
                    maxRetries,
                    ")"
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ui/reconnecting-indicator.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ui/reconnecting-indicator.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
_s(ReconnectingIndicator, "4O44FjDIS6khKLwkiutc/WeB13U=");
_c = ReconnectingIndicator;
const __TURBOPACK__default__export__ = ReconnectingIndicator;
var _c;
__turbopack_context__.k.register(_c, "ReconnectingIndicator");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/lib/chatbot/api-client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chatApiClient",
    ()=>chatApiClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * API client for connecting to the AI Chatbot endpoint
 * Now integrated into the main backend (same URL as main API)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
// Use the same backend URL as the main app (chatbot is now part of main backend)
const API_BASE_URL = __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
class ChatApiClient {
    baseUrl;
    constructor(){
        this.baseUrl = API_BASE_URL;
    }
    /**
   * Send a chat message to the chatbot endpoint (now part of main backend)
   * @param authToken - JWT token from main app
   * @param message - User's message
   * @param conversationId - Optional conversation ID for context
   */ async sendMessage(authToken, message, conversationId) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${this.baseUrl}/api/chat`, {
            conversation_id: conversationId,
            message
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        return response.data;
    }
}
const chatApiClient = new ChatApiClient();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$lib$2f$chatbot$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/lib/chatbot/api-client.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const ChatInterface = ({ authToken, initialConversationId })=>{
    _s();
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [conversationId, setConversationId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialConversationId);
    const messagesEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatInterface.useEffect": ()=>{
            messagesEndRef.current?.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }["ChatInterface.useEffect"], [
        messages
    ]);
    const onSubmit = async (e)=>{
        e.preventDefault();
        const message = input.trim();
        if (!message || isLoading) return;
        if (!authToken) {
            setMessages((prev)=>[
                    ...prev,
                    {
                        role: 'user',
                        content: message
                    },
                    {
                        role: 'assistant',
                        content: 'Please log in to manage your tasks.'
                    }
                ]);
            setInput('');
            return;
        }
        setMessages((prev)=>[
                ...prev,
                {
                    role: 'user',
                    content: message
                }
            ]);
        setInput('');
        setIsLoading(true);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$lib$2f$chatbot$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chatApiClient"].sendMessage(authToken, message, conversationId);
            if (response.conversation_id) {
                setConversationId(response.conversation_id);
            }
            setMessages((prev)=>[
                    ...prev,
                    {
                        role: 'assistant',
                        content: response.response,
                        taskChanged: response.task_changed
                    }
                ]);
            // Dispatch event to refresh task list if tasks were modified
            if (response.task_changed) {
                window.dispatchEvent(new CustomEvent('tasks-updated'));
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev)=>[
                    ...prev,
                    {
                        role: 'assistant',
                        content: 'Sorry, something went wrong. Please try again.'
                    }
                ]);
        } finally{
            setIsLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full bg-background",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto p-4 space-y-3",
                children: [
                    messages.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center mt-4 space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-muted-foreground",
                                children: authToken ? 'Hi! I can help you manage your tasks.' : 'Please log in to manage tasks.'
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx",
                                lineNumber: 70,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            authToken && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground",
                                children: 'Try: "Add buy groceries" or "Show my tasks"'
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx",
                                lineNumber: 74,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx",
                        lineNumber: 69,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    messages.map((msg, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary text-secondary-foreground rounded-bl-none'}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "whitespace-pre-wrap",
                                    children: msg.content
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx",
                                    lineNumber: 89,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx",
                                lineNumber: 82,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        }, index, false, {
                            fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx",
                            lineNumber: 81,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))),
                    isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-start",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-secondary text-secondary-foreground rounded-2xl rounded-bl-none px-4 py-2",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex space-x-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx",
                                        lineNumber: 97,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:75ms]"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx",
                                        lineNumber: 98,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx",
                                        lineNumber: 99,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx",
                                lineNumber: 96,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx",
                            lineNumber: 95,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx",
                        lineNumber: 94,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: messagesEndRef
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx",
                        lineNumber: 104,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-t border-border",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: onSubmit,
                    className: "flex gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            value: input,
                            onChange: (e)=>setInput(e.target.value),
                            placeholder: "Type your message...",
                            className: "flex-1 border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background",
                            disabled: isLoading
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx",
                            lineNumber: 109,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            disabled: isLoading || !input.trim(),
                            className: "bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed",
                            children: "Send"
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx",
                            lineNumber: 117,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx",
                    lineNumber: 108,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx",
                lineNumber: 107,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ChatInterface, "4EHkskwLB+wDOir66JNGG8vAIjQ=");
_c = ChatInterface;
const __TURBOPACK__default__export__ = ChatInterface;
var _c;
__turbopack_context__.k.register(_c, "ChatInterface");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ChatWidget.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChatWidget
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/node_modules/lucide-react/dist/esm/icons/message-circle.js [app-client] (ecmascript) <export default as MessageCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$components$2f$chatbot$2f$ChatInterface$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/chatbot/ChatInterface.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function ChatWidget() {
    _s();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [authToken, setAuthToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Get auth token from localStorage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatWidget.useEffect": ()=>{
            const token = localStorage.getItem('access_token');
            setAuthToken(token);
            // Listen for storage changes (login/logout)
            const handleStorageChange = {
                "ChatWidget.useEffect.handleStorageChange": ()=>{
                    setAuthToken(localStorage.getItem('access_token'));
                }
            }["ChatWidget.useEffect.handleStorageChange"];
            window.addEventListener('storage', handleStorageChange);
            return ({
                "ChatWidget.useEffect": ()=>window.removeEventListener('storage', handleStorageChange)
            })["ChatWidget.useEffect"];
        }
    }["ChatWidget.useEffect"], []);
    // Re-check token when widget opens
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatWidget.useEffect": ()=>{
            if (isOpen) {
                setAuthToken(localStorage.getItem('access_token'));
            }
        }
    }["ChatWidget.useEffect"], [
        isOpen
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsOpen(true),
                className: `fixed bottom-28 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center ${isOpen ? 'scale-0' : 'scale-100'}`,
                "aria-label": "Open chat",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                    className: "w-6 h-6"
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ChatWidget.tsx",
                    lineNumber: 41,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ChatWidget.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-28 right-6 z-50 w-[380px] h-[500px] rounded-2xl shadow-2xl border border-border bg-background overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                                        className: "w-5 h-5 text-primary"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ChatWidget.tsx",
                                        lineNumber: 50,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-medium text-sm",
                                        children: "Task Assistant"
                                    }, void 0, false, {
                                        fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ChatWidget.tsx",
                                        lineNumber: 51,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ChatWidget.tsx",
                                lineNumber: 49,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setIsOpen(false),
                                className: "p-1 hover:bg-muted rounded-md transition-colors",
                                "aria-label": "Close chat",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "w-5 h-5"
                                }, void 0, false, {
                                    fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ChatWidget.tsx",
                                    lineNumber: 58,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ChatWidget.tsx",
                                lineNumber: 53,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ChatWidget.tsx",
                        lineNumber: 48,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-hidden",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$todoapp$2f$todo$2d$web$2d$app$2f$frontend$2f$components$2f$chatbot$2f$ChatInterface$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            authToken: authToken
                        }, void 0, false, {
                            fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ChatWidget.tsx",
                            lineNumber: 64,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ChatWidget.tsx",
                        lineNumber: 63,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/OneDrive/Desktop/todoapp/todo-web-app/frontend/components/ChatWidget.tsx",
                lineNumber: 46,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_s(ChatWidget, "U8VMBA7ot8IWP7Zu8Yo1gTHC0B8=");
_c = ChatWidget;
var _c;
__turbopack_context__.k.register(_c, "ChatWidget");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=OneDrive_Desktop_todoapp_todo-web-app_frontend_08e8768d._.js.map