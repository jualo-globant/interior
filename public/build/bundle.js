
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    // Adapted from https://github.com/then/is-promise/blob/master/index.js
    // Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE
    function is_promise(value) {
        return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    /**
     * List of attributes that should always be set through the attr method,
     * because updating them through the property setter doesn't work reliably.
     * In the example of `width`/`height`, the problem is that the setter only
     * accepts numeric values, but the attribute can also be set to a string like `50%`.
     * If this list becomes too big, rethink this approach.
     */
    const always_set_through_set_attribute = ['width', 'height'];
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set && always_set_through_set_attribute.indexOf(key) === -1) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        const options = { direction: 'in' };
        let config = fn(node, params, options);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config(options);
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        const options = { direction: 'out' };
        let config = fn(node, params, options);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config(options);
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const LOCATION = {};
    const ROUTER = {};
    const HISTORY = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const PARAM = /^:(.+)/;
    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Split up the URI into segments delimited by `/`
     * Strip starting/ending `/`
     * @param {string} uri
     * @return {string[]}
     */
    const segmentize = (uri) => uri.replace(/(^\/+|\/+$)/g, "").split("/");
    /**
     * Strip `str` of potential start and end `/`
     * @param {string} string
     * @return {string}
     */
    const stripSlashes = (string) => string.replace(/(^\/+|\/+$)/g, "");
    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    const rankRoute = (route, index) => {
        const score = route.default
            ? 0
            : segmentize(route.path).reduce((score, segment) => {
                  score += SEGMENT_POINTS;

                  if (segment === "") {
                      score += ROOT_POINTS;
                  } else if (PARAM.test(segment)) {
                      score += DYNAMIC_POINTS;
                  } else if (segment[0] === "*") {
                      score -= SEGMENT_POINTS + SPLAT_PENALTY;
                  } else {
                      score += STATIC_POINTS;
                  }

                  return score;
              }, 0);

        return { route, score, index };
    };
    /**
     * Give a score to all routes and sort them on that
     * If two routes have the exact same score, we go by index instead
     * @param {object[]} routes
     * @return {object[]}
     */
    const rankRoutes = (routes) =>
        routes
            .map(rankRoute)
            .sort((a, b) =>
                a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
            );
    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    const pick = (routes, uri) => {
        let match;
        let default_;

        const [uriPathname] = uri.split("?");
        const uriSegments = segmentize(uriPathname);
        const isRootUri = uriSegments[0] === "";
        const ranked = rankRoutes(routes);

        for (let i = 0, l = ranked.length; i < l; i++) {
            const route = ranked[i].route;
            let missed = false;

            if (route.default) {
                default_ = {
                    route,
                    params: {},
                    uri,
                };
                continue;
            }

            const routeSegments = segmentize(route.path);
            const params = {};
            const max = Math.max(uriSegments.length, routeSegments.length);
            let index = 0;

            for (; index < max; index++) {
                const routeSegment = routeSegments[index];
                const uriSegment = uriSegments[index];

                if (routeSegment && routeSegment[0] === "*") {
                    // Hit a splat, just grab the rest, and return a match
                    // uri:   /files/documents/work
                    // route: /files/* or /files/*splatname
                    const splatName =
                        routeSegment === "*" ? "*" : routeSegment.slice(1);

                    params[splatName] = uriSegments
                        .slice(index)
                        .map(decodeURIComponent)
                        .join("/");
                    break;
                }

                if (typeof uriSegment === "undefined") {
                    // URI is shorter than the route, no match
                    // uri:   /users
                    // route: /users/:userId
                    missed = true;
                    break;
                }

                const dynamicMatch = PARAM.exec(routeSegment);

                if (dynamicMatch && !isRootUri) {
                    const value = decodeURIComponent(uriSegment);
                    params[dynamicMatch[1]] = value;
                } else if (routeSegment !== uriSegment) {
                    // Current segments don't match, not dynamic, not splat, so no match
                    // uri:   /users/123/settings
                    // route: /users/:id/profile
                    missed = true;
                    break;
                }
            }

            if (!missed) {
                match = {
                    route,
                    params,
                    uri: "/" + uriSegments.slice(0, index).join("/"),
                };
                break;
            }
        }

        return match || default_ || null;
    };
    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    const addQuery = (pathname, query) => pathname + (query ? `?${query}` : "");
    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    const resolve = (to, base) => {
        // /foo/bar, /baz/qux => /foo/bar
        if (to.startsWith("/")) return to;

        const [toPathname, toQuery] = to.split("?");
        const [basePathname] = base.split("?");
        const toSegments = segmentize(toPathname);
        const baseSegments = segmentize(basePathname);

        // ?a=b, /users?b=c => /users?a=b
        if (toSegments[0] === "") return addQuery(basePathname, toQuery);

        // profile, /users/789 => /users/789/profile

        if (!toSegments[0].startsWith(".")) {
            const pathname = baseSegments.concat(toSegments).join("/");
            return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
        }

        // ./       , /users/123 => /users/123
        // ../      , /users/123 => /users
        // ../..    , /users/123 => /
        // ../../one, /a/b/c/d   => /a/b/one
        // .././one , /a/b/c/d   => /a/b/c/one
        const allSegments = baseSegments.concat(toSegments);
        const segments = [];

        allSegments.forEach((segment) => {
            if (segment === "..") segments.pop();
            else if (segment !== ".") segments.push(segment);
        });

        return addQuery("/" + segments.join("/"), toQuery);
    };
    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    const combinePaths = (basepath, path) =>
        `${stripSlashes(
        path === "/"
            ? basepath
            : `${stripSlashes(basepath)}/${stripSlashes(path)}`
    )}/`;
    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    const shouldNavigate = (event) =>
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

    const canUseDOM = () =>
        typeof window !== "undefined" &&
        "document" in window &&
        "location" in window;

    /* node_modules\svelte-routing\src\Link.svelte generated by Svelte v3.59.2 */
    const file$9 = "node_modules\\svelte-routing\\src\\Link.svelte";
    const get_default_slot_changes$2 = dirty => ({ active: dirty & /*ariaCurrent*/ 4 });
    const get_default_slot_context$2 = ctx => ({ active: !!/*ariaCurrent*/ ctx[2] });

    function create_fragment$b(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[16], get_default_slot_context$2);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1],
    		/*$$restProps*/ ctx[6]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$9, 41, 0, 1414);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, ariaCurrent*/ 65540)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[16],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[16])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[16], dirty, get_default_slot_changes$2),
    						get_default_slot_context$2
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let ariaCurrent;
    	const omit_props_names = ["to","replace","state","getProps","preserveScroll"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $location;
    	let $base;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Link', slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	let { preserveScroll = false } = $$props;
    	const location = getContext(LOCATION);
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(14, $location = value));
    	const { base } = getContext(ROUTER);
    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(15, $base = value));
    	const { navigate } = getContext(HISTORY);
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	const onClick = event => {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, {
    				state,
    				replace: shouldReplace,
    				preserveScroll
    			});
    		}
    	};

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('to' in $$new_props) $$invalidate(7, to = $$new_props.to);
    		if ('replace' in $$new_props) $$invalidate(8, replace = $$new_props.replace);
    		if ('state' in $$new_props) $$invalidate(9, state = $$new_props.state);
    		if ('getProps' in $$new_props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ('preserveScroll' in $$new_props) $$invalidate(11, preserveScroll = $$new_props.preserveScroll);
    		if ('$$scope' in $$new_props) $$invalidate(16, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		getContext,
    		HISTORY,
    		LOCATION,
    		ROUTER,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		preserveScroll,
    		location,
    		base,
    		navigate,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		ariaCurrent,
    		$location,
    		$base
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('to' in $$props) $$invalidate(7, to = $$new_props.to);
    		if ('replace' in $$props) $$invalidate(8, replace = $$new_props.replace);
    		if ('state' in $$props) $$invalidate(9, state = $$new_props.state);
    		if ('getProps' in $$props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ('preserveScroll' in $$props) $$invalidate(11, preserveScroll = $$new_props.preserveScroll);
    		if ('href' in $$props) $$invalidate(0, href = $$new_props.href);
    		if ('isPartiallyCurrent' in $$props) $$invalidate(12, isPartiallyCurrent = $$new_props.isPartiallyCurrent);
    		if ('isCurrent' in $$props) $$invalidate(13, isCurrent = $$new_props.isCurrent);
    		if ('props' in $$props) $$invalidate(1, props = $$new_props.props);
    		if ('ariaCurrent' in $$props) $$invalidate(2, ariaCurrent = $$new_props.ariaCurrent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 32896) {
    			$$invalidate(0, href = resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 16385) {
    			$$invalidate(12, isPartiallyCurrent = $location.pathname.startsWith(href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 16385) {
    			$$invalidate(13, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 8192) {
    			$$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		$$invalidate(1, props = getProps({
    			location: $location,
    			href,
    			isPartiallyCurrent,
    			isCurrent,
    			existingProps: $$restProps
    		}));
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		location,
    		base,
    		onClick,
    		$$restProps,
    		to,
    		replace,
    		state,
    		getProps,
    		preserveScroll,
    		isPartiallyCurrent,
    		isCurrent,
    		$location,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			to: 7,
    			replace: 8,
    			state: 9,
    			getProps: 10,
    			preserveScroll: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get preserveScroll() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set preserveScroll(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.59.2 */
    const get_default_slot_changes$1 = dirty => ({ params: dirty & /*routeParams*/ 4 });
    const get_default_slot_context$1 = ctx => ({ params: /*routeParams*/ ctx[2] });

    // (42:0) {#if $activeRoute && $activeRoute.route === route}
    function create_if_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(42:0) {#if $activeRoute && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (51:4) {:else}
    function create_else_block$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context$1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, routeParams*/ 132)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, get_default_slot_changes$1),
    						get_default_slot_context$1
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(51:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (43:4) {#if component}
    function create_if_block_1(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 12,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*component*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*component*/ 1 && promise !== (promise = /*component*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(43:4) {#if component}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>     import { getContext, onDestroy }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>     import { getContext, onDestroy }",
    		ctx
    	});

    	return block;
    }

    // (44:49)              <svelte:component                 this={resolvedComponent?.default || resolvedComponent}
    function create_then_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*routeParams*/ ctx[2], /*routeProps*/ ctx[3]];
    	var switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*routeParams, routeProps*/ 12)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(44:49)              <svelte:component                 this={resolvedComponent?.default || resolvedComponent}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>     import { getContext, onDestroy }
    function create_pending_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script>     import { getContext, onDestroy }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	let routeParams = {};
    	let routeProps = {};
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	registerRoute(route);

    	onDestroy(() => {
    		unregisterRoute(route);
    	});

    	$$self.$$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('path' in $$new_props) $$invalidate(6, path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		canUseDOM,
    		path,
    		component,
    		routeParams,
    		routeProps,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		route,
    		$activeRoute
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate(6, path = $$new_props.path);
    		if ('component' in $$props) $$invalidate(0, component = $$new_props.component);
    		if ('routeParams' in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ('routeProps' in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($activeRoute && $activeRoute.route === route) {
    			$$invalidate(2, routeParams = $activeRoute.params);
    			const { component: c, path, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);

    			if (c) {
    				if (c.toString().startsWith("class ")) $$invalidate(0, component = c); else $$invalidate(0, component = c());
    			}

    			canUseDOM() && !$activeRoute.preserveScroll && window?.scrollTo(0, 0);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		activeRoute,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { path: 6, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier} [start]
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let started = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (started) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            started = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
                // We need to set this to false because callbacks can still happen despite having unsubscribed:
                // Callbacks might already be placed in the queue which doesn't know it should no longer
                // invoke this derived store.
                started = false;
            };
        });
    }

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const getLocation = (source) => {
        return {
            ...source.location,
            state: source.history.state,
            key: (source.history.state && source.history.state.key) || "initial",
        };
    };
    const createHistory = (source) => {
        const listeners = [];
        let location = getLocation(source);

        return {
            get location() {
                return location;
            },

            listen(listener) {
                listeners.push(listener);

                const popstateListener = () => {
                    location = getLocation(source);
                    listener({ location, action: "POP" });
                };

                source.addEventListener("popstate", popstateListener);

                return () => {
                    source.removeEventListener("popstate", popstateListener);
                    const index = listeners.indexOf(listener);
                    listeners.splice(index, 1);
                };
            },

            navigate(to, { state, replace = false, preserveScroll = false, blurActiveElement = true } = {}) {
                state = { ...state, key: Date.now() + "" };
                // try...catch iOS Safari limits to 100 pushState calls
                try {
                    if (replace) source.history.replaceState(state, "", to);
                    else source.history.pushState(state, "", to);
                } catch (e) {
                    source.location[replace ? "replace" : "assign"](to);
                }
                location = getLocation(source);
                listeners.forEach((listener) =>
                    listener({ location, action: "PUSH", preserveScroll })
                );
                if(blurActiveElement) document.activeElement.blur();
            },
        };
    };
    // Stores history entries in memory for testing or other platforms like Native
    const createMemorySource = (initialPathname = "/") => {
        let index = 0;
        const stack = [{ pathname: initialPathname, search: "" }];
        const states = [];

        return {
            get location() {
                return stack[index];
            },
            addEventListener(name, fn) {},
            removeEventListener(name, fn) {},
            history: {
                get entries() {
                    return stack;
                },
                get index() {
                    return index;
                },
                get state() {
                    return states[index];
                },
                pushState(state, _, uri) {
                    const [pathname, search = ""] = uri.split("?");
                    index++;
                    stack.push({ pathname, search });
                    states.push(state);
                },
                replaceState(state, _, uri) {
                    const [pathname, search = ""] = uri.split("?");
                    stack[index] = { pathname, search };
                    states[index] = state;
                },
            },
        };
    };
    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const globalHistory = createHistory(
        canUseDOM() ? window : createMemorySource()
    );

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.59.2 */

    const { Object: Object_1 } = globals;
    const file$8 = "node_modules\\svelte-routing\\src\\Router.svelte";

    const get_default_slot_changes_1 = dirty => ({
    	route: dirty & /*$activeRoute*/ 4,
    	location: dirty & /*$location*/ 2
    });

    const get_default_slot_context_1 = ctx => ({
    	route: /*$activeRoute*/ ctx[2] && /*$activeRoute*/ ctx[2].uri,
    	location: /*$location*/ ctx[1]
    });

    const get_default_slot_changes = dirty => ({
    	route: dirty & /*$activeRoute*/ 4,
    	location: dirty & /*$location*/ 2
    });

    const get_default_slot_context = ctx => ({
    	route: /*$activeRoute*/ ctx[2] && /*$activeRoute*/ ctx[2].uri,
    	location: /*$location*/ ctx[1]
    });

    // (143:0) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context_1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $activeRoute, $location*/ 16390)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, get_default_slot_changes_1),
    						get_default_slot_context_1
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(143:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (134:0) {#if viewtransition}
    function create_if_block(ctx) {
    	let previous_key = /*$location*/ ctx[1].pathname;
    	let key_block_anchor;
    	let current;
    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			key_block.c();
    			key_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			key_block.m(target, anchor);
    			insert_dev(target, key_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$location*/ 2 && safe_not_equal(previous_key, previous_key = /*$location*/ ctx[1].pathname)) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block, 1);
    				key_block.m(key_block_anchor.parentNode, key_block_anchor);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(key_block_anchor);
    			key_block.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(134:0) {#if viewtransition}",
    		ctx
    	});

    	return block;
    }

    // (135:4) {#key $location.pathname}
    function create_key_block(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			add_location(div, file$8, 135, 8, 4659);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $activeRoute, $location*/ 16390)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!current) return;
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, /*viewtransitionFn*/ ctx[3], {});
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*viewtransitionFn*/ ctx[3], {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(135:4) {#key $location.pathname}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*viewtransition*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $location;
    	let $routes;
    	let $base;
    	let $activeRoute;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	let { viewtransition = null } = $$props;
    	let { history = globalHistory } = $$props;

    	const viewtransitionFn = (node, _, direction) => {
    		const vt = viewtransition(direction);
    		if (typeof vt?.fn === "function") return vt.fn(node, vt); else return vt;
    	};

    	setContext(HISTORY, history);
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, 'routes');
    	component_subscribe($$self, routes, value => $$invalidate(12, $routes = value));
    	const activeRoute = writable(null);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(2, $activeRoute = value));
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : history.location);

    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(1, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(13, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (!activeRoute) return base;

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	const registerRoute = route => {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) return;

    			const matchingRoute = pick([route], $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => [...rs, route]);
    		}
    	};

    	const unregisterRoute = route => {
    		routes.update(rs => rs.filter(r => r !== route));
    	};

    	let preserveScroll = false;

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = history.listen(event => {
    				$$invalidate(11, preserveScroll = event.preserveScroll || false);
    				location.set(event.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ['basepath', 'url', 'viewtransition', 'history'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('basepath' in $$props) $$invalidate(8, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(9, url = $$props.url);
    		if ('viewtransition' in $$props) $$invalidate(0, viewtransition = $$props.viewtransition);
    		if ('history' in $$props) $$invalidate(10, history = $$props.history);
    		if ('$$scope' in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		setContext,
    		derived,
    		writable,
    		HISTORY,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		combinePaths,
    		pick,
    		basepath,
    		url,
    		viewtransition,
    		history,
    		viewtransitionFn,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		preserveScroll,
    		$location,
    		$routes,
    		$base,
    		$activeRoute
    	});

    	$$self.$inject_state = $$props => {
    		if ('basepath' in $$props) $$invalidate(8, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(9, url = $$props.url);
    		if ('viewtransition' in $$props) $$invalidate(0, viewtransition = $$props.viewtransition);
    		if ('history' in $$props) $$invalidate(10, history = $$props.history);
    		if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
    		if ('preserveScroll' in $$props) $$invalidate(11, preserveScroll = $$props.preserveScroll);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 8192) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;
    				routes.update(rs => rs.map(r => Object.assign(r, { path: combinePaths(basepath, r._path) })));
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location, preserveScroll*/ 6146) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch ? { ...bestMatch, preserveScroll } : bestMatch);
    			}
    		}
    	};

    	return [
    		viewtransition,
    		$location,
    		$activeRoute,
    		viewtransitionFn,
    		routes,
    		activeRoute,
    		location,
    		base,
    		basepath,
    		url,
    		history,
    		preserveScroll,
    		$routes,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			basepath: 8,
    			url: 9,
    			viewtransition: 0,
    			history: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewtransition() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewtransition(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get history() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set history(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Header.svelte generated by Svelte v3.59.2 */
    const file$7 = "src\\Header.svelte";

    // (32:28) <Link class="dropdown-item" to="/">
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Home");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(32:28) <Link class=\\\"dropdown-item\\\" to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (36:24) <Link class="nav-link" to="/sobre-nosotros">
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Sobre Nosotros");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(36:24) <Link class=\\\"nav-link\\\" to=\\\"/sobre-nosotros\\\">",
    		ctx
    	});

    	return block;
    }

    // (39:24) <Link class="nav-link" to="/servicios">
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Servicios");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(39:24) <Link class=\\\"nav-link\\\" to=\\\"/servicios\\\">",
    		ctx
    	});

    	return block;
    }

    // (45:28) <Link class="dropdown-item" to="/proyectos-realizados">
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Project Details");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(45:28) <Link class=\\\"dropdown-item\\\" to=\\\"/proyectos-realizados\\\">",
    		ctx
    	});

    	return block;
    }

    // (46:28) <Link class="dropdown-item" to="/proyectos-realizados">
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Project Details");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(46:28) <Link class=\\\"dropdown-item\\\" to=\\\"/proyectos-realizados\\\">",
    		ctx
    	});

    	return block;
    }

    // (50:24) <Link class="nav-link" to="/proyectos-realizados">
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Proyectos Realizados");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(50:24) <Link class=\\\"nav-link\\\" to=\\\"/proyectos-realizados\\\">",
    		ctx
    	});

    	return block;
    }

    // (53:28) <Link class="nav-link" to="/precios">
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Precios");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(53:28) <Link class=\\\"nav-link\\\" to=\\\"/precios\\\">",
    		ctx
    	});

    	return block;
    }

    // (55:40) <Link class="btn login-btn ml-50" to="/contacto">
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Contacto");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(55:40) <Link class=\\\"btn login-btn ml-50\\\" to=\\\"/contacto\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let nav;
    	let div6;
    	let a0;
    	let span0;
    	let img;
    	let img_src_value;
    	let t1;
    	let t2;
    	let button;
    	let span1;
    	let t3;
    	let div5;
    	let ul;
    	let li0;
    	let a1;
    	let t5;
    	let div3;
    	let link0;
    	let t6;
    	let li1;
    	let link1;
    	let t7;
    	let li2;
    	let link2;
    	let t8;
    	let li3;
    	let a2;
    	let t10;
    	let div4;
    	let link3;
    	let t11;
    	let link4;
    	let t12;
    	let li4;
    	let link5;
    	let t13;
    	let li5;
    	let link6;
    	let t14;
    	let li6;
    	let link7;
    	let current;

    	link0 = new Link({
    			props: {
    				class: "dropdown-item",
    				to: "/",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1 = new Link({
    			props: {
    				class: "nav-link",
    				to: "/sobre-nosotros",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link2 = new Link({
    			props: {
    				class: "nav-link",
    				to: "/servicios",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link3 = new Link({
    			props: {
    				class: "dropdown-item",
    				to: "/proyectos-realizados",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link4 = new Link({
    			props: {
    				class: "dropdown-item",
    				to: "/proyectos-realizados",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link5 = new Link({
    			props: {
    				class: "nav-link",
    				to: "/proyectos-realizados",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link6 = new Link({
    			props: {
    				class: "nav-link",
    				to: "/precios",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link7 = new Link({
    			props: {
    				class: "btn login-btn ml-50",
    				to: "/contacto",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			nav = element("nav");
    			div6 = element("div");
    			a0 = element("a");
    			span0 = element("span");
    			img = element("img");
    			t1 = text(" Interior Tech");
    			t2 = space();
    			button = element("button");
    			span1 = element("span");
    			t3 = space();
    			div5 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			a1.textContent = "Home";
    			t5 = space();
    			div3 = element("div");
    			create_component(link0.$$.fragment);
    			t6 = space();
    			li1 = element("li");
    			create_component(link1.$$.fragment);
    			t7 = space();
    			li2 = element("li");
    			create_component(link2.$$.fragment);
    			t8 = space();
    			li3 = element("li");
    			a2 = element("a");
    			a2.textContent = "Projects";
    			t10 = space();
    			div4 = element("div");
    			create_component(link3.$$.fragment);
    			t11 = space();
    			create_component(link4.$$.fragment);
    			t12 = space();
    			li4 = element("li");
    			create_component(link5.$$.fragment);
    			t13 = space();
    			li5 = element("li");
    			create_component(link6.$$.fragment);
    			t14 = space();
    			li6 = element("li");
    			create_component(link7.$$.fragment);
    			attr_dev(div0, "id", "dream-load");
    			add_location(div0, file$7, 8, 12, 156);
    			attr_dev(div1, "class", "preload-content");
    			add_location(div1, file$7, 7, 8, 114);
    			attr_dev(div2, "id", "preloader");
    			add_location(div2, file$7, 6, 4, 85);
    			attr_dev(img, "draggable", "false");
    			if (!src_url_equal(img.src, img_src_value = "img/core-img/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			add_location(img, file$7, 17, 51, 499);
    			add_location(span0, file$7, 17, 45, 493);
    			attr_dev(a0, "class", "navbar-brand");
    			attr_dev(a0, "href", "#");
    			add_location(a0, file$7, 17, 12, 460);
    			attr_dev(span1, "class", "navbar-toggler-icon");
    			add_location(span1, file$7, 21, 16, 765);
    			attr_dev(button, "class", "navbar-toggler");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-toggle", "collapse");
    			attr_dev(button, "data-target", "#collapsibleNavbar");
    			add_location(button, file$7, 20, 12, 647);
    			attr_dev(a1, "class", "nav-link dropdown-toggle");
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "id", "navbardrop");
    			attr_dev(a1, "data-toggle", "dropdown");
    			add_location(a1, file$7, 29, 24, 1131);
    			attr_dev(div3, "class", "dropdown-menu");
    			add_location(div3, file$7, 30, 24, 1248);
    			attr_dev(li0, "class", "nav-item dropdown");
    			add_location(li0, file$7, 27, 20, 1006);
    			attr_dev(li1, "class", "nav-item");
    			add_location(li1, file$7, 34, 20, 1428);
    			attr_dev(li2, "class", "nav-item");
    			add_location(li2, file$7, 37, 20, 1586);
    			attr_dev(a2, "class", "nav-link dropdown-toggle");
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "id", "navbardrop");
    			attr_dev(a2, "data-toggle", "dropdown");
    			add_location(a2, file$7, 42, 24, 1859);
    			attr_dev(div4, "class", "dropdown-menu");
    			add_location(div4, file$7, 43, 24, 1980);
    			attr_dev(li3, "class", "nav-item dropdown");
    			add_location(li3, file$7, 40, 20, 1734);
    			attr_dev(li4, "class", "nav-item");
    			add_location(li4, file$7, 48, 20, 2297);
    			attr_dev(li5, "class", "nav-item");
    			add_location(li5, file$7, 51, 20, 2467);
    			attr_dev(li6, "class", "lh-55px");
    			add_location(li6, file$7, 54, 20, 2615);
    			attr_dev(ul, "class", "navbar-nav ml-auto");
    			add_location(ul, file$7, 26, 16, 954);
    			attr_dev(div5, "class", "collapse navbar-collapse");
    			attr_dev(div5, "id", "collapsibleNavbar");
    			add_location(div5, file$7, 25, 12, 876);
    			attr_dev(div6, "class", "container");
    			add_location(div6, file$7, 14, 8, 339);
    			attr_dev(nav, "class", "navbar navbar-expand-lg navbar-white fixed-top");
    			attr_dev(nav, "id", "banner");
    			add_location(nav, file$7, 13, 4, 258);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div6);
    			append_dev(div6, a0);
    			append_dev(a0, span0);
    			append_dev(span0, img);
    			append_dev(a0, t1);
    			append_dev(div6, t2);
    			append_dev(div6, button);
    			append_dev(button, span1);
    			append_dev(div6, t3);
    			append_dev(div6, div5);
    			append_dev(div5, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a1);
    			append_dev(li0, t5);
    			append_dev(li0, div3);
    			mount_component(link0, div3, null);
    			append_dev(ul, t6);
    			append_dev(ul, li1);
    			mount_component(link1, li1, null);
    			append_dev(ul, t7);
    			append_dev(ul, li2);
    			mount_component(link2, li2, null);
    			append_dev(ul, t8);
    			append_dev(ul, li3);
    			append_dev(li3, a2);
    			append_dev(li3, t10);
    			append_dev(li3, div4);
    			mount_component(link3, div4, null);
    			append_dev(div4, t11);
    			mount_component(link4, div4, null);
    			append_dev(ul, t12);
    			append_dev(ul, li4);
    			mount_component(link5, li4, null);
    			append_dev(ul, t13);
    			append_dev(ul, li5);
    			mount_component(link6, li5, null);
    			append_dev(ul, t14);
    			append_dev(ul, li6);
    			mount_component(link7, li6, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const link2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link2_changes.$$scope = { dirty, ctx };
    			}

    			link2.$set(link2_changes);
    			const link3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link3_changes.$$scope = { dirty, ctx };
    			}

    			link3.$set(link3_changes);
    			const link4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link4_changes.$$scope = { dirty, ctx };
    			}

    			link4.$set(link4_changes);
    			const link5_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link5_changes.$$scope = { dirty, ctx };
    			}

    			link5.$set(link5_changes);
    			const link6_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link6_changes.$$scope = { dirty, ctx };
    			}

    			link6.$set(link6_changes);
    			const link7_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link7_changes.$$scope = { dirty, ctx };
    			}

    			link7.$set(link7_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			transition_in(link3.$$.fragment, local);
    			transition_in(link4.$$.fragment, local);
    			transition_in(link5.$$.fragment, local);
    			transition_in(link6.$$.fragment, local);
    			transition_in(link7.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(link3.$$.fragment, local);
    			transition_out(link4.$$.fragment, local);
    			transition_out(link5.$$.fragment, local);
    			transition_out(link6.$$.fragment, local);
    			transition_out(link7.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(nav);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			destroy_component(link3);
    			destroy_component(link4);
    			destroy_component(link5);
    			destroy_component(link6);
    			destroy_component(link7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Link });
    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\Footer.svelte generated by Svelte v3.59.2 */

    const file$6 = "src\\Footer.svelte";

    function create_fragment$7(ctx) {
    	let footer;
    	let div16;
    	let div15;
    	let div14;
    	let div4;
    	let div3;
    	let div1;
    	let div0;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let t1;
    	let p0;
    	let t3;
    	let div2;
    	let a1;
    	let i0;
    	let t4;
    	let a2;
    	let i1;
    	let t5;
    	let a3;
    	let i2;
    	let t6;
    	let a4;
    	let i3;
    	let t7;
    	let a5;
    	let i4;
    	let t8;
    	let div7;
    	let div6;
    	let div5;
    	let h50;
    	let t10;
    	let a6;
    	let p1;
    	let t12;
    	let a7;
    	let p2;
    	let t14;
    	let a8;
    	let p3;
    	let t16;
    	let a9;
    	let p4;
    	let t18;
    	let a10;
    	let p5;
    	let t20;
    	let div10;
    	let div9;
    	let div8;
    	let h51;
    	let t22;
    	let a11;
    	let p6;
    	let t24;
    	let a12;
    	let p7;
    	let t26;
    	let a13;
    	let p8;
    	let t28;
    	let a14;
    	let p9;
    	let t30;
    	let a15;
    	let p10;
    	let t32;
    	let div13;
    	let div12;
    	let div11;
    	let h52;
    	let t34;
    	let p11;
    	let t36;
    	let p12;
    	let t38;
    	let p13;
    	let t40;
    	let p14;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div16 = element("div");
    			div15 = element("div");
    			div14 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			img = element("img");
    			t0 = text(" Technogen");
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Velit ducimus voluptatibus neque illo id repellat quisquam? Autem expedita earum quae laborum ipsum ad.";
    			t3 = space();
    			div2 = element("div");
    			a1 = element("a");
    			i0 = element("i");
    			t4 = space();
    			a2 = element("a");
    			i1 = element("i");
    			t5 = space();
    			a3 = element("a");
    			i2 = element("i");
    			t6 = space();
    			a4 = element("a");
    			i3 = element("i");
    			t7 = space();
    			a5 = element("a");
    			i4 = element("i");
    			t8 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			h50 = element("h5");
    			h50.textContent = "PRIVACY & TOS";
    			t10 = space();
    			a6 = element("a");
    			p1 = element("p");
    			p1.textContent = "Advertiser Agreement";
    			t12 = space();
    			a7 = element("a");
    			p2 = element("p");
    			p2.textContent = "Acceptable Use Policy";
    			t14 = space();
    			a8 = element("a");
    			p3 = element("p");
    			p3.textContent = "Privacy Policy";
    			t16 = space();
    			a9 = element("a");
    			p4 = element("p");
    			p4.textContent = "Technology Privacy";
    			t18 = space();
    			a10 = element("a");
    			p5 = element("p");
    			p5.textContent = "Developer Agreement";
    			t20 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			h51 = element("h5");
    			h51.textContent = "NAVIGATE";
    			t22 = space();
    			a11 = element("a");
    			p6 = element("p");
    			p6.textContent = "Advertisers";
    			t24 = space();
    			a12 = element("a");
    			p7 = element("p");
    			p7.textContent = "Developers";
    			t26 = space();
    			a13 = element("a");
    			p8 = element("p");
    			p8.textContent = "Resources";
    			t28 = space();
    			a14 = element("a");
    			p9 = element("p");
    			p9.textContent = "Company";
    			t30 = space();
    			a15 = element("a");
    			p10 = element("p");
    			p10.textContent = "Connect";
    			t32 = space();
    			div13 = element("div");
    			div12 = element("div");
    			div11 = element("div");
    			h52 = element("h5");
    			h52.textContent = "CONTACT US";
    			t34 = space();
    			p11 = element("p");
    			p11.textContent = "Mailing Address:xx00 E. Union Ave";
    			t36 = space();
    			p12 = element("p");
    			p12.textContent = "Suite 1100. Denver, CO 80237";
    			t38 = space();
    			p13 = element("p");
    			p13.textContent = "+999 90932 627";
    			t40 = space();
    			p14 = element("p");
    			p14.textContent = "support@yourdomain.com";
    			attr_dev(img, "draggable", "false");
    			if (!src_url_equal(img.src, img_src_value = "img/core-img/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			add_location(img, file$6, 14, 48, 697);
    			attr_dev(a0, "href", "#");
    			add_location(a0, file$6, 14, 36, 685);
    			attr_dev(div0, "class", "footer-logo");
    			add_location(div0, file$6, 12, 32, 541);
    			add_location(p0, file$6, 16, 32, 846);
    			attr_dev(div1, "class", "copywrite_text fadeInUp");
    			attr_dev(div1, "data-wow-delay", "0.2s");
    			add_location(div1, file$6, 11, 28, 449);
    			attr_dev(i0, "class", "fa fa-facebook");
    			attr_dev(i0, "aria-hidden", "true");
    			add_location(i0, file$6, 21, 44, 1313);
    			attr_dev(a1, "href", "#");
    			add_location(a1, file$6, 21, 32, 1301);
    			attr_dev(i1, "class", "fa fa-twitter");
    			attr_dev(i1, "aria-hidden", "true");
    			add_location(i1, file$6, 23, 45, 1490);
    			attr_dev(a2, "href", "#");
    			add_location(a2, file$6, 23, 32, 1477);
    			attr_dev(i2, "class", "fa fa-google-plus");
    			attr_dev(i2, "aria-hidden", "true");
    			add_location(i2, file$6, 25, 44, 1665);
    			attr_dev(a3, "href", "#");
    			add_location(a3, file$6, 25, 32, 1653);
    			attr_dev(i3, "class", "fa fa-instagram");
    			attr_dev(i3, "aria-hidden", "true");
    			add_location(i3, file$6, 27, 44, 1844);
    			attr_dev(a4, "href", "#");
    			add_location(a4, file$6, 27, 32, 1832);
    			attr_dev(i4, "class", "fa fa-linkedin");
    			attr_dev(i4, "aria-hidden", "true");
    			add_location(i4, file$6, 29, 44, 2021);
    			attr_dev(a5, "href", "#");
    			add_location(a5, file$6, 29, 32, 2009);
    			attr_dev(div2, "class", "footer-social-info fadeInUp");
    			attr_dev(div2, "data-wow-delay", "0.4s");
    			add_location(div2, file$6, 19, 28, 1127);
    			attr_dev(div3, "class", "footer-copywrite-info");
    			add_location(div3, file$6, 9, 24, 338);
    			attr_dev(div4, "class", "col-12 col-lg-4 col-md-6");
    			add_location(div4, file$6, 8, 20, 275);
    			add_location(h50, file$6, 39, 32, 2577);
    			add_location(p1, file$6, 41, 43, 2721);
    			attr_dev(a6, "href", "");
    			add_location(a6, file$6, 41, 32, 2710);
    			add_location(p2, file$6, 43, 43, 2874);
    			attr_dev(a7, "href", "");
    			add_location(a7, file$6, 43, 32, 2863);
    			add_location(p3, file$6, 45, 43, 3028);
    			attr_dev(a8, "href", "");
    			add_location(a8, file$6, 45, 32, 3017);
    			add_location(p4, file$6, 47, 43, 3175);
    			attr_dev(a9, "href", "");
    			add_location(a9, file$6, 47, 32, 3164);
    			add_location(p5, file$6, 48, 43, 3248);
    			attr_dev(a10, "href", "");
    			add_location(a10, file$6, 48, 32, 3237);
    			attr_dev(div5, "class", "contact_info mt-x text-center fadeInUp");
    			attr_dev(div5, "data-wow-delay", "0.3s");
    			add_location(div5, file$6, 38, 28, 2470);
    			attr_dev(div6, "class", "contact_info_area d-sm-flex justify-content-between");
    			add_location(div6, file$6, 35, 24, 2252);
    			attr_dev(div7, "class", "col-12 col-lg-3 col-md-6");
    			add_location(div7, file$6, 34, 20, 2189);
    			add_location(h51, file$6, 57, 32, 3726);
    			add_location(p6, file$6, 59, 43, 3865);
    			attr_dev(a11, "href", "");
    			add_location(a11, file$6, 59, 32, 3854);
    			add_location(p7, file$6, 61, 43, 4009);
    			attr_dev(a12, "href", "");
    			add_location(a12, file$6, 61, 32, 3998);
    			add_location(p8, file$6, 63, 43, 4152);
    			attr_dev(a13, "href", "");
    			add_location(a13, file$6, 63, 32, 4141);
    			add_location(p9, file$6, 65, 43, 4294);
    			attr_dev(a14, "href", "");
    			add_location(a14, file$6, 65, 32, 4283);
    			add_location(p10, file$6, 67, 43, 4434);
    			attr_dev(a15, "href", "");
    			add_location(a15, file$6, 67, 32, 4423);
    			attr_dev(div8, "class", "contact_info mt-s text-center fadeInUp");
    			attr_dev(div8, "data-wow-delay", "0.2s");
    			add_location(div8, file$6, 56, 28, 3619);
    			attr_dev(div9, "class", "contact_info_area d-sm-flex justify-content-between");
    			add_location(div9, file$6, 55, 24, 3525);
    			attr_dev(div10, "class", "col-12 col-lg-2 col-md-6 ");
    			add_location(div10, file$6, 53, 20, 3415);
    			add_location(h52, file$6, 77, 32, 4903);
    			add_location(p11, file$6, 78, 32, 4955);
    			add_location(p12, file$6, 79, 32, 5028);
    			add_location(p13, file$6, 80, 32, 5096);
    			add_location(p14, file$6, 81, 32, 5150);
    			attr_dev(div11, "class", "contact_info mt-s text-center fadeInUp");
    			attr_dev(div11, "data-wow-delay", "0.4s");
    			add_location(div11, file$6, 76, 28, 4796);
    			attr_dev(div12, "class", "contact_info_area d-sm-flex justify-content-between");
    			add_location(div12, file$6, 74, 24, 4652);
    			attr_dev(div13, "class", "col-12 col-lg-3 col-md-6 ");
    			add_location(div13, file$6, 73, 20, 4588);
    			attr_dev(div14, "class", "row ");
    			add_location(div14, file$6, 7, 16, 236);
    			attr_dev(div15, "class", "container");
    			add_location(div15, file$6, 6, 12, 196);
    			attr_dev(div16, "class", "footer-content-area ");
    			add_location(div16, file$6, 5, 8, 149);
    			attr_dev(footer, "class", "footer-area bg-img");
    			set_style(footer, "background-image", "url(img/core-img/pattern.png)");
    			add_location(footer, file$6, 3, 4, 47);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div16);
    			append_dev(div16, div15);
    			append_dev(div15, div14);
    			append_dev(div14, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img);
    			append_dev(a0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, p0);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, a1);
    			append_dev(a1, i0);
    			append_dev(div2, t4);
    			append_dev(div2, a2);
    			append_dev(a2, i1);
    			append_dev(div2, t5);
    			append_dev(div2, a3);
    			append_dev(a3, i2);
    			append_dev(div2, t6);
    			append_dev(div2, a4);
    			append_dev(a4, i3);
    			append_dev(div2, t7);
    			append_dev(div2, a5);
    			append_dev(a5, i4);
    			append_dev(div14, t8);
    			append_dev(div14, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, h50);
    			append_dev(div5, t10);
    			append_dev(div5, a6);
    			append_dev(a6, p1);
    			append_dev(div5, t12);
    			append_dev(div5, a7);
    			append_dev(a7, p2);
    			append_dev(div5, t14);
    			append_dev(div5, a8);
    			append_dev(a8, p3);
    			append_dev(div5, t16);
    			append_dev(div5, a9);
    			append_dev(a9, p4);
    			append_dev(div5, t18);
    			append_dev(div5, a10);
    			append_dev(a10, p5);
    			append_dev(div14, t20);
    			append_dev(div14, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h51);
    			append_dev(div8, t22);
    			append_dev(div8, a11);
    			append_dev(a11, p6);
    			append_dev(div8, t24);
    			append_dev(div8, a12);
    			append_dev(a12, p7);
    			append_dev(div8, t26);
    			append_dev(div8, a13);
    			append_dev(a13, p8);
    			append_dev(div8, t28);
    			append_dev(div8, a14);
    			append_dev(a14, p9);
    			append_dev(div8, t30);
    			append_dev(div8, a15);
    			append_dev(a15, p10);
    			append_dev(div14, t32);
    			append_dev(div14, div13);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div11, h52);
    			append_dev(div11, t34);
    			append_dev(div11, p11);
    			append_dev(div11, t36);
    			append_dev(div11, p12);
    			append_dev(div11, t38);
    			append_dev(div11, p13);
    			append_dev(div11, t40);
    			append_dev(div11, p14);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\routes\Inicio.svelte generated by Svelte v3.59.2 */

    const file$5 = "src\\routes\\Inicio.svelte";

    function create_fragment$6(ctx) {
    	let section0;
    	let div12;
    	let div11;
    	let div10;
    	let div9;
    	let div8;
    	let h1;
    	let t0;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let t2;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let p0;
    	let t5;
    	let div6;
    	let div2;
    	let div1;
    	let img2;
    	let img2_src_value;
    	let t6;
    	let div0;
    	let t8;
    	let div5;
    	let div4;
    	let img3;
    	let img3_src_value;
    	let t9;
    	let div3;
    	let t11;
    	let div7;
    	let a0;
    	let t13;
    	let a1;
    	let t15;
    	let div21;
    	let div20;
    	let div19;
    	let div13;
    	let img4;
    	let img4_src_value;
    	let t16;
    	let div14;
    	let img5;
    	let img5_src_value;
    	let t17;
    	let div15;
    	let img6;
    	let img6_src_value;
    	let t18;
    	let div16;
    	let img7;
    	let img7_src_value;
    	let t19;
    	let div17;
    	let img8;
    	let img8_src_value;
    	let t20;
    	let div18;
    	let img9;
    	let img9_src_value;
    	let t21;
    	let div22;
    	let t22;
    	let section1;
    	let div35;
    	let div24;
    	let div23;
    	let img10;
    	let img10_src_value;
    	let t23;
    	let h20;
    	let t25;
    	let p1;
    	let t27;
    	let div34;
    	let div27;
    	let div26;
    	let div25;
    	let img11;
    	let img11_src_value;
    	let t28;
    	let span0;
    	let t30;
    	let h60;
    	let t32;
    	let p2;
    	let t34;
    	let div30;
    	let div29;
    	let div28;
    	let img12;
    	let img12_src_value;
    	let t35;
    	let span1;
    	let t37;
    	let h61;
    	let t39;
    	let p3;
    	let t41;
    	let div33;
    	let div32;
    	let div31;
    	let img13;
    	let img13_src_value;
    	let t42;
    	let span2;
    	let t44;
    	let h62;
    	let t46;
    	let p4;
    	let t48;
    	let section2;
    	let div51;
    	let div50;
    	let div43;
    	let div42;
    	let img14;
    	let img14_src_value;
    	let t49;
    	let h40;
    	let t51;
    	let p5;
    	let t53;
    	let ul;
    	let li0;
    	let div36;
    	let t55;
    	let h30;
    	let t57;
    	let div37;
    	let t59;
    	let li1;
    	let div38;
    	let t61;
    	let h31;
    	let t63;
    	let div39;
    	let t65;
    	let li2;
    	let div40;
    	let t67;
    	let h32;
    	let t69;
    	let div41;
    	let t71;
    	let div49;
    	let div48;
    	let div45;
    	let div44;
    	let img15;
    	let img15_src_value;
    	let t72;
    	let div47;
    	let div46;
    	let img16;
    	let img16_src_value;
    	let t73;
    	let section3;
    	let div67;
    	let div53;
    	let div52;
    	let img17;
    	let img17_src_value;
    	let t74;
    	let h21;
    	let t76;
    	let p6;
    	let t78;
    	let div66;
    	let div56;
    	let a2;
    	let div54;
    	let img18;
    	let img18_src_value;
    	let t79;
    	let div55;
    	let h63;
    	let t81;
    	let p7;
    	let t83;
    	let div59;
    	let a3;
    	let div57;
    	let img19;
    	let img19_src_value;
    	let t84;
    	let div58;
    	let h64;
    	let t86;
    	let p8;
    	let t88;
    	let div62;
    	let a4;
    	let div60;
    	let img20;
    	let img20_src_value;
    	let t89;
    	let div61;
    	let h65;
    	let t91;
    	let p9;
    	let t93;
    	let div65;
    	let a5;
    	let div63;
    	let img21;
    	let img21_src_value;
    	let t94;
    	let div64;
    	let h66;
    	let t96;
    	let p10;
    	let t98;
    	let section4;
    	let div76;
    	let div75;
    	let div69;
    	let div68;
    	let img22;
    	let img22_src_value;
    	let t99;
    	let div72;
    	let div71;
    	let div70;
    	let span3;
    	let t101;
    	let h41;
    	let t103;
    	let img23;
    	let img23_src_value;
    	let t104;
    	let div74;
    	let div73;
    	let p11;
    	let t106;
    	let a6;
    	let t108;
    	let div106;
    	let div105;
    	let div78;
    	let div77;
    	let span4;
    	let t110;
    	let h22;
    	let t112;
    	let p12;
    	let t114;
    	let div104;
    	let div103;
    	let div84;
    	let div83;
    	let div79;
    	let img24;
    	let img24_src_value;
    	let t115;
    	let div82;
    	let div80;
    	let span5;
    	let t117;
    	let div81;
    	let t119;
    	let div90;
    	let div89;
    	let div85;
    	let img25;
    	let img25_src_value;
    	let t120;
    	let div88;
    	let div86;
    	let span6;
    	let t122;
    	let div87;
    	let t124;
    	let div96;
    	let div95;
    	let div91;
    	let img26;
    	let img26_src_value;
    	let t125;
    	let div94;
    	let div92;
    	let span7;
    	let t127;
    	let div93;
    	let t129;
    	let div102;
    	let div101;
    	let div97;
    	let img27;
    	let img27_src_value;
    	let t130;
    	let div100;
    	let div98;
    	let span8;
    	let t132;
    	let div99;
    	let t134;
    	let section5;
    	let div129;
    	let div111;
    	let div108;
    	let div107;
    	let h42;
    	let t136;
    	let img28;
    	let img28_src_value;
    	let t137;
    	let div110;
    	let div109;
    	let p13;
    	let t139;
    	let div128;
    	let div115;
    	let div114;
    	let div112;
    	let img29;
    	let img29_src_value;
    	let t140;
    	let div113;
    	let h43;
    	let t141;
    	let br0;
    	let t142;
    	let t143;
    	let p14;
    	let t145;
    	let a7;
    	let t146;
    	let span9;
    	let i0;
    	let t147;
    	let div119;
    	let div118;
    	let div116;
    	let img30;
    	let img30_src_value;
    	let t148;
    	let div117;
    	let h44;
    	let t149;
    	let br1;
    	let t150;
    	let t151;
    	let p15;
    	let t153;
    	let a8;
    	let t154;
    	let span10;
    	let i1;
    	let t155;
    	let div123;
    	let div122;
    	let div120;
    	let img31;
    	let img31_src_value;
    	let t156;
    	let div121;
    	let h45;
    	let t157;
    	let br2;
    	let t158;
    	let t159;
    	let p16;
    	let t161;
    	let a9;
    	let t162;
    	let span11;
    	let i2;
    	let t163;
    	let div127;
    	let div126;
    	let div124;
    	let img32;
    	let img32_src_value;
    	let t164;
    	let div125;
    	let h46;
    	let t165;
    	let br3;
    	let t166;
    	let t167;
    	let p17;
    	let t169;
    	let a10;
    	let t170;
    	let span12;
    	let i3;
    	let t171;
    	let div137;
    	let div136;
    	let div131;
    	let div130;
    	let img33;
    	let img33_src_value;
    	let t172;
    	let h23;
    	let t174;
    	let p18;
    	let t176;
    	let div135;
    	let div132;
    	let img34;
    	let img34_src_value;
    	let t177;
    	let div134;
    	let div133;
    	let dl;
    	let dt0;
    	let dd0;
    	let p19;
    	let t180;
    	let dt1;
    	let dd1;
    	let p20;
    	let t183;
    	let dt2;
    	let dd2;
    	let p21;
    	let t186;
    	let dt3;
    	let dd3;
    	let p22;
    	let t189;
    	let section6;
    	let div163;
    	let div141;
    	let div140;
    	let div139;
    	let div138;
    	let img35;
    	let img35_src_value;
    	let t190;
    	let h24;
    	let t192;
    	let p23;
    	let t194;
    	let div162;
    	let div146;
    	let div145;
    	let div142;
    	let img36;
    	let img36_src_value;
    	let t195;
    	let div143;
    	let h50;
    	let t197;
    	let p24;
    	let t199;
    	let div144;
    	let a11;
    	let i4;
    	let t200;
    	let div151;
    	let div150;
    	let div147;
    	let img37;
    	let img37_src_value;
    	let t201;
    	let div148;
    	let h51;
    	let t203;
    	let p25;
    	let t205;
    	let div149;
    	let a12;
    	let i5;
    	let t206;
    	let div156;
    	let div155;
    	let div152;
    	let img38;
    	let img38_src_value;
    	let t207;
    	let div153;
    	let h52;
    	let t209;
    	let p26;
    	let t211;
    	let div154;
    	let a13;
    	let i6;
    	let t212;
    	let div161;
    	let div160;
    	let div157;
    	let img39;
    	let img39_src_value;
    	let t213;
    	let div158;
    	let h53;
    	let t215;
    	let p27;
    	let t217;
    	let div159;
    	let a14;
    	let i7;

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			div12 = element("div");
    			div11 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			h1 = element("h1");
    			t0 = text("Creative IT Company and Technology ");
    			img0 = element("img");
    			t1 = text("  Services You Expect");
    			t2 = space();
    			img1 = element("img");
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eveniet dolorem blanditiis ad perferendis, labore delectus dolor sit amet, adipisicing elit. Eveniet ipsum dolor sit amet.";
    			t5 = space();
    			div6 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			img2 = element("img");
    			t6 = space();
    			div0 = element("div");
    			div0.textContent = "Velit ducimus volupta tibus neque illo";
    			t8 = space();
    			div5 = element("div");
    			div4 = element("div");
    			img3 = element("img");
    			t9 = space();
    			div3 = element("div");
    			div3.textContent = "Velit ducimus volupta tibus neque illo";
    			t11 = space();
    			div7 = element("div");
    			a0 = element("a");
    			a0.textContent = "Our Services";
    			t13 = space();
    			a1 = element("a");
    			a1.textContent = "Contact Us";
    			t15 = space();
    			div21 = element("div");
    			div20 = element("div");
    			div19 = element("div");
    			div13 = element("div");
    			img4 = element("img");
    			t16 = space();
    			div14 = element("div");
    			img5 = element("img");
    			t17 = space();
    			div15 = element("div");
    			img6 = element("img");
    			t18 = space();
    			div16 = element("div");
    			img7 = element("img");
    			t19 = space();
    			div17 = element("div");
    			img8 = element("img");
    			t20 = space();
    			div18 = element("div");
    			img9 = element("img");
    			t21 = space();
    			div22 = element("div");
    			t22 = space();
    			section1 = element("section");
    			div35 = element("div");
    			div24 = element("div");
    			div23 = element("div");
    			img10 = element("img");
    			t23 = space();
    			h20 = element("h2");
    			h20.textContent = "How it works";
    			t25 = space();
    			p1 = element("p");
    			p1.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis accumsan nisi Ut ut felis congue nisl hendrerit commodo.";
    			t27 = space();
    			div34 = element("div");
    			div27 = element("div");
    			div26 = element("div");
    			div25 = element("div");
    			img11 = element("img");
    			t28 = space();
    			span0 = element("span");
    			span0.textContent = "1";
    			t30 = space();
    			h60 = element("h6");
    			h60.textContent = "Add Your Security Problem";
    			t32 = space();
    			p2 = element("p");
    			p2.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla neque quam, max imus ut accumsan ut, posuere sit.";
    			t34 = space();
    			div30 = element("div");
    			div29 = element("div");
    			div28 = element("div");
    			img12 = element("img");
    			t35 = space();
    			span1 = element("span");
    			span1.textContent = "2";
    			t37 = space();
    			h61 = element("h6");
    			h61.textContent = "Choose Security Package";
    			t39 = space();
    			p3 = element("p");
    			p3.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla neque quam, max imus ut accumsan ut, posuere sit.";
    			t41 = space();
    			div33 = element("div");
    			div32 = element("div");
    			div31 = element("div");
    			img13 = element("img");
    			t42 = space();
    			span2 = element("span");
    			span2.textContent = "3";
    			t44 = space();
    			h62 = element("h6");
    			h62.textContent = "Prepare For Security Test";
    			t46 = space();
    			p4 = element("p");
    			p4.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla neque quam, max imus ut accumsan ut, posuere sit.";
    			t48 = space();
    			section2 = element("section");
    			div51 = element("div");
    			div50 = element("div");
    			div43 = element("div");
    			div42 = element("div");
    			img14 = element("img");
    			t49 = space();
    			h40 = element("h4");
    			h40.textContent = "Our Main Features";
    			t51 = space();
    			p5 = element("p");
    			p5.textContent = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsum ad, ipsam labore. Sunt iste a velit, quidem alias officia aperiam.";
    			t53 = space();
    			ul = element("ul");
    			li0 = element("li");
    			div36 = element("div");
    			div36.textContent = "01";
    			t55 = space();
    			h30 = element("h3");
    			h30.textContent = "Creative & Reliable IT Agency";
    			t57 = space();
    			div37 = element("div");
    			div37.textContent = "Lorem ipsum dolor sit amet, conse ctetur dolor adipisicing elit alias officia aperiam.";
    			t59 = space();
    			li1 = element("li");
    			div38 = element("div");
    			div38.textContent = "02";
    			t61 = space();
    			h31 = element("h3");
    			h31.textContent = "Strong Blockchain Experts Team";
    			t63 = space();
    			div39 = element("div");
    			div39.textContent = "Lorem ipsum dolor sit amet, conse ctetur dolor adipisicing elit alias officia aperiam.";
    			t65 = space();
    			li2 = element("li");
    			div40 = element("div");
    			div40.textContent = "03";
    			t67 = space();
    			h32 = element("h3");
    			h32.textContent = "Design and Development";
    			t69 = space();
    			div41 = element("div");
    			div41.textContent = "Lorem ipsum dolor sit amet, conse ctetur dolor adipisicing elit alias officia aperiam.";
    			t71 = space();
    			div49 = element("div");
    			div48 = element("div");
    			div45 = element("div");
    			div44 = element("div");
    			img15 = element("img");
    			t72 = space();
    			div47 = element("div");
    			div46 = element("div");
    			img16 = element("img");
    			t73 = space();
    			section3 = element("section");
    			div67 = element("div");
    			div53 = element("div");
    			div52 = element("div");
    			img17 = element("img");
    			t74 = space();
    			h21 = element("h2");
    			h21.textContent = "Our Company Services";
    			t76 = space();
    			p6 = element("p");
    			p6.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis accumsan nisi Ut ut felis congue nisl hendrerit commodo.";
    			t78 = space();
    			div66 = element("div");
    			div56 = element("div");
    			a2 = element("a");
    			div54 = element("div");
    			img18 = element("img");
    			t79 = space();
    			div55 = element("div");
    			h63 = element("h6");
    			h63.textContent = "Hacking & Security Solutions";
    			t81 = space();
    			p7 = element("p");
    			p7.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla neque quam, max imus ut accumsan ut, posuere sit.";
    			t83 = space();
    			div59 = element("div");
    			a3 = element("a");
    			div57 = element("div");
    			img19 = element("img");
    			t84 = space();
    			div58 = element("div");
    			h64 = element("h6");
    			h64.textContent = "IT Deployment and Migration";
    			t86 = space();
    			p8 = element("p");
    			p8.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla neque quam, max imus ut accumsan ut, posuere sit.";
    			t88 = space();
    			div62 = element("div");
    			a4 = element("a");
    			div60 = element("div");
    			img20 = element("img");
    			t89 = space();
    			div61 = element("div");
    			h65 = element("h6");
    			h65.textContent = "Managed Web Application";
    			t91 = space();
    			p9 = element("p");
    			p9.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla neque quam, max imus ut accumsan ut, posuere sit.";
    			t93 = space();
    			div65 = element("div");
    			a5 = element("a");
    			div63 = element("div");
    			img21 = element("img");
    			t94 = space();
    			div64 = element("div");
    			h66 = element("h6");
    			h66.textContent = "IT & Cloud Managment";
    			t96 = space();
    			p10 = element("p");
    			p10.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla neque quam, max imus ut accumsan ut, posuere sit.";
    			t98 = space();
    			section4 = element("section");
    			div76 = element("div");
    			div75 = element("div");
    			div69 = element("div");
    			div68 = element("div");
    			img22 = element("img");
    			t99 = space();
    			div72 = element("div");
    			div71 = element("div");
    			div70 = element("div");
    			span3 = element("span");
    			span3.textContent = "Our Company Community";
    			t101 = space();
    			h41 = element("h4");
    			h41.textContent = "Top Technology and IT services with Our Agency.";
    			t103 = space();
    			img23 = element("img");
    			t104 = space();
    			div74 = element("div");
    			div73 = element("div");
    			p11 = element("p");
    			p11.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at dictum risus, non suscipit arcu. Quisque aliquam posuere tortor, sit amet convallis nunc scelerisque in Quisque aliquam posuere.";
    			t106 = space();
    			a6 = element("a");
    			a6.textContent = "Read More";
    			t108 = space();
    			div106 = element("div");
    			div105 = element("div");
    			div78 = element("div");
    			div77 = element("div");
    			span4 = element("span");
    			span4.textContent = "Numbers Are Talking";
    			t110 = space();
    			h22 = element("h2");
    			h22.textContent = "Our Agency Facts";
    			t112 = space();
    			p12 = element("p");
    			p12.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis accumsan nisi Ut ut felis congue nisl hendrerit commodo.";
    			t114 = space();
    			div104 = element("div");
    			div103 = element("div");
    			div84 = element("div");
    			div83 = element("div");
    			div79 = element("div");
    			img24 = element("img");
    			t115 = space();
    			div82 = element("div");
    			div80 = element("div");
    			span5 = element("span");
    			span5.textContent = "327";
    			t117 = space();
    			div81 = element("div");
    			div81.textContent = "Happy Clients";
    			t119 = space();
    			div90 = element("div");
    			div89 = element("div");
    			div85 = element("div");
    			img25 = element("img");
    			t120 = space();
    			div88 = element("div");
    			div86 = element("div");
    			span6 = element("span");
    			span6.textContent = "3041";
    			t122 = space();
    			div87 = element("div");
    			div87.textContent = "Projects Taken";
    			t124 = space();
    			div96 = element("div");
    			div95 = element("div");
    			div91 = element("div");
    			img26 = element("img");
    			t125 = space();
    			div94 = element("div");
    			div92 = element("div");
    			span7 = element("span");
    			span7.textContent = "23";
    			t127 = space();
    			div93 = element("div");
    			div93.textContent = "Awards Won";
    			t129 = space();
    			div102 = element("div");
    			div101 = element("div");
    			div97 = element("div");
    			img27 = element("img");
    			t130 = space();
    			div100 = element("div");
    			div98 = element("div");
    			span8 = element("span");
    			span8.textContent = "940";
    			t132 = space();
    			div99 = element("div");
    			div99.textContent = "Secured Devices";
    			t134 = space();
    			section5 = element("section");
    			div129 = element("div");
    			div111 = element("div");
    			div108 = element("div");
    			div107 = element("div");
    			h42 = element("h4");
    			h42.textContent = "Our Creative Projects";
    			t136 = space();
    			img28 = element("img");
    			t137 = space();
    			div110 = element("div");
    			div109 = element("div");
    			p13 = element("p");
    			p13.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at dictum risus, non suscipit arcu. Quisque aliquam posuere tortor, sit amet convallis nunc scelerisque in Quisque aliquam posuere.";
    			t139 = space();
    			div128 = element("div");
    			div115 = element("div");
    			div114 = element("div");
    			div112 = element("div");
    			img29 = element("img");
    			t140 = space();
    			div113 = element("div");
    			h43 = element("h4");
    			t141 = text("IT Check and ");
    			br0 = element("br");
    			t142 = text(" Cloud Managment");
    			t143 = space();
    			p14 = element("p");
    			p14.textContent = "Security Testing";
    			t145 = space();
    			a7 = element("a");
    			t146 = text("Full Case Study");
    			span9 = element("span");
    			i0 = element("i");
    			t147 = space();
    			div119 = element("div");
    			div118 = element("div");
    			div116 = element("div");
    			img30 = element("img");
    			t148 = space();
    			div117 = element("div");
    			h44 = element("h4");
    			t149 = text("System Security ");
    			br1 = element("br");
    			t150 = text(" and Development");
    			t151 = space();
    			p15 = element("p");
    			p15.textContent = "Development";
    			t153 = space();
    			a8 = element("a");
    			t154 = text("Full Case Study");
    			span10 = element("span");
    			i1 = element("i");
    			t155 = space();
    			div123 = element("div");
    			div122 = element("div");
    			div120 = element("div");
    			img31 = element("img");
    			t156 = space();
    			div121 = element("div");
    			h45 = element("h4");
    			t157 = text("Cloud Migration");
    			br2 = element("br");
    			t158 = text(" and Deployment");
    			t159 = space();
    			p16 = element("p");
    			p16.textContent = "Blockchain";
    			t161 = space();
    			a9 = element("a");
    			t162 = text("Full Case Study");
    			span11 = element("span");
    			i2 = element("i");
    			t163 = space();
    			div127 = element("div");
    			div126 = element("div");
    			div124 = element("div");
    			img32 = element("img");
    			t164 = space();
    			div125 = element("div");
    			h46 = element("h4");
    			t165 = text("Network Security ");
    			br3 = element("br");
    			t166 = text(" Cloud Computing");
    			t167 = space();
    			p17 = element("p");
    			p17.textContent = "Networking";
    			t169 = space();
    			a10 = element("a");
    			t170 = text("Full Case Study");
    			span12 = element("span");
    			i3 = element("i");
    			t171 = space();
    			div137 = element("div");
    			div136 = element("div");
    			div131 = element("div");
    			div130 = element("div");
    			img33 = element("img");
    			t172 = space();
    			h23 = element("h2");
    			h23.textContent = "Frequently Questions";
    			t174 = space();
    			p18 = element("p");
    			p18.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis accumsan nisi Ut ut felis congue nisl hendrerit commodo.";
    			t176 = space();
    			div135 = element("div");
    			div132 = element("div");
    			img34 = element("img");
    			t177 = space();
    			div134 = element("div");
    			div133 = element("div");
    			dl = element("dl");
    			dt0 = element("dt");
    			dt0.textContent = "What are the objectives of this Agency?";
    			dd0 = element("dd");
    			p19 = element("p");
    			p19.textContent = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolore omnis quaerat nostrum, pariatur ipsam sunt accusamus enim necessitatibus est fugiat, assumenda dolorem, deleniti corrupti cupiditate ipsum, dolorum voluptatum esse error?";
    			t180 = space();
    			dt1 = element("dt");
    			dt1.textContent = "What is the best features and services we deiver?";
    			dd1 = element("dd");
    			p20 = element("p");
    			p20.textContent = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolore omnis quaerat nostrum, pariatur ipsam sunt accusamus enim necessitatibus est fugiat, assumenda dolorem, deleniti corrupti cupiditate ipsum, dolorum voluptatum esse error?";
    			t183 = space();
    			dt2 = element("dt");
    			dt2.textContent = "Why this Company Service important to me?";
    			dd2 = element("dd");
    			p21 = element("p");
    			p21.textContent = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolore omnis quaerat nostrum, pariatur ipsam sunt accusamus enim necessitatibus est fugiat, assumenda dolorem, deleniti corrupti cupiditate ipsum, dolorum voluptatum esse error?";
    			t186 = space();
    			dt3 = element("dt");
    			dt3.textContent = "how may I take part in and purchase this Service?";
    			dd3 = element("dd");
    			p22 = element("p");
    			p22.textContent = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolore omnis quaerat nostrum, pariatur ipsam sunt accusamus enim necessitatibus est fugiat, assumenda dolorem, deleniti corrupti cupiditate ipsum, dolorum voluptatum esse error?";
    			t189 = space();
    			section6 = element("section");
    			div163 = element("div");
    			div141 = element("div");
    			div140 = element("div");
    			div139 = element("div");
    			div138 = element("div");
    			img35 = element("img");
    			t190 = space();
    			h24 = element("h2");
    			h24.textContent = "Awesome Team";
    			t192 = space();
    			p23 = element("p");
    			p23.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis accumsan nisi Ut ut felis congue nisl hendrerit commodo.";
    			t194 = space();
    			div162 = element("div");
    			div146 = element("div");
    			div145 = element("div");
    			div142 = element("div");
    			img36 = element("img");
    			t195 = space();
    			div143 = element("div");
    			h50 = element("h5");
    			h50.textContent = "Joman Helal";
    			t197 = space();
    			p24 = element("p");
    			p24.textContent = "Executive Officer";
    			t199 = space();
    			div144 = element("div");
    			a11 = element("a");
    			i4 = element("i");
    			t200 = space();
    			div151 = element("div");
    			div150 = element("div");
    			div147 = element("div");
    			img37 = element("img");
    			t201 = space();
    			div148 = element("div");
    			h51 = element("h5");
    			h51.textContent = "Slans Alons";
    			t203 = space();
    			p25 = element("p");
    			p25.textContent = "Business Development";
    			t205 = space();
    			div149 = element("div");
    			a12 = element("a");
    			i5 = element("i");
    			t206 = space();
    			div156 = element("div");
    			div155 = element("div");
    			div152 = element("div");
    			img38 = element("img");
    			t207 = space();
    			div153 = element("div");
    			h52 = element("h5");
    			h52.textContent = "Josha Michal";
    			t209 = space();
    			p26 = element("p");
    			p26.textContent = "UX/UI Designer";
    			t211 = space();
    			div154 = element("div");
    			a13 = element("a");
    			i6 = element("i");
    			t212 = space();
    			div161 = element("div");
    			div160 = element("div");
    			div157 = element("div");
    			img39 = element("img");
    			t213 = space();
    			div158 = element("div");
    			h53 = element("h5");
    			h53.textContent = "Johan Wright";
    			t215 = space();
    			p27 = element("p");
    			p27.textContent = "Head of Marketing";
    			t217 = space();
    			div159 = element("div");
    			a14 = element("a");
    			i7 = element("i");
    			attr_dev(img0, "class", "heado-img");
    			if (!src_url_equal(img0.src, img0_src_value = "img/core-img/head.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$5, 12, 106, 585);
    			attr_dev(h1, "class", "fadeInUp");
    			attr_dev(h1, "data-wow-delay", "0.2s");
    			add_location(h1, file$5, 12, 28, 507);
    			if (!src_url_equal(img1.src, img1_src_value = "img/svg/divider-01.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "width", "100");
    			attr_dev(img1, "class", "mb-30");
    			attr_dev(img1, "alt", "divider");
    			add_location(img1, file$5, 13, 28, 698);
    			attr_dev(p0, "class", "w-text fadeInUp");
    			attr_dev(p0, "data-wow-delay", "0.3s");
    			add_location(p0, file$5, 14, 28, 801);
    			if (!src_url_equal(img2.src, img2_src_value = "img/icons/f1.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "check-mark-icon");
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$5, 18, 40, 1249);
    			attr_dev(div0, "class", "foot-c-info");
    			add_location(div0, file$5, 19, 40, 1349);
    			attr_dev(div1, "class", "side-feature-list-item");
    			add_location(div1, file$5, 17, 36, 1172);
    			attr_dev(div2, "class", "col-md-6");
    			add_location(div2, file$5, 16, 32, 1113);
    			if (!src_url_equal(img3.src, img3_src_value = "img/icons/f2.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "class", "check-mark-icon");
    			attr_dev(img3, "alt", "");
    			add_location(img3, file$5, 24, 40, 1669);
    			attr_dev(div3, "class", "foot-c-info");
    			add_location(div3, file$5, 25, 40, 1769);
    			attr_dev(div4, "class", "side-feature-list-item");
    			add_location(div4, file$5, 23, 36, 1592);
    			attr_dev(div5, "class", "col-md-6");
    			add_location(div5, file$5, 22, 32, 1533);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$5, 15, 28, 1063);
    			attr_dev(a0, "href", "services.html");
    			attr_dev(a0, "class", "btn more-btn mr-3");
    			add_location(a0, file$5, 31, 32, 2084);
    			attr_dev(a1, "href", "contact-us.html");
    			attr_dev(a1, "class", "btn more-btn");
    			add_location(a1, file$5, 32, 32, 2183);
    			attr_dev(div7, "class", "dream-btn-group fadeInUp mt-30");
    			attr_dev(div7, "data-wow-delay", "0.4s");
    			add_location(div7, file$5, 30, 28, 1985);
    			attr_dev(div8, "class", "welcome-content");
    			add_location(div8, file$5, 10, 24, 420);
    			attr_dev(div9, "class", "col-12 col-lg-6 col-md-12");
    			add_location(div9, file$5, 9, 20, 356);
    			attr_dev(div10, "class", "row align-items-center");
    			add_location(div10, file$5, 7, 16, 254);
    			attr_dev(div11, "class", "container ");
    			add_location(div11, file$5, 6, 12, 213);
    			attr_dev(div12, "class", "hero-section-content");
    			add_location(div12, file$5, 4, 8, 153);
    			attr_dev(section0, "class", "hero-section app section-padding");
    			attr_dev(section0, "id", "home");
    			add_location(section0, file$5, 1, 4, 46);
    			if (!src_url_equal(img4.src, img4_src_value = "img/partners/2.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "");
    			add_location(img4, file$5, 47, 20, 2652);
    			attr_dev(div13, "class", "col-lg-2 col-md-4 col-sm-4 col-xs-6");
    			add_location(div13, file$5, 46, 16, 2582);
    			if (!src_url_equal(img5.src, img5_src_value = "img/partners/1.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "");
    			add_location(img5, file$5, 50, 20, 2799);
    			attr_dev(div14, "class", "col-lg-2 col-md-4 col-sm-4 col-xs-6");
    			add_location(div14, file$5, 49, 16, 2729);
    			if (!src_url_equal(img6.src, img6_src_value = "img/partners/3.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "");
    			add_location(img6, file$5, 53, 20, 2946);
    			attr_dev(div15, "class", "col-lg-2 col-md-4 col-sm-4 col-xs-6");
    			add_location(div15, file$5, 52, 16, 2876);
    			if (!src_url_equal(img7.src, img7_src_value = "img/partners/4.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "");
    			add_location(img7, file$5, 56, 20, 3093);
    			attr_dev(div16, "class", "col-lg-2 col-md-4 col-sm-4 col-xs-6");
    			add_location(div16, file$5, 55, 16, 3023);
    			if (!src_url_equal(img8.src, img8_src_value = "img/partners/5.png")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "");
    			add_location(img8, file$5, 59, 20, 3240);
    			attr_dev(div17, "class", "col-lg-2 col-md-4 col-sm-4 col-xs-6");
    			add_location(div17, file$5, 58, 16, 3170);
    			if (!src_url_equal(img9.src, img9_src_value = "img/partners/6.png")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "");
    			add_location(img9, file$5, 62, 20, 3387);
    			attr_dev(div18, "class", "col-lg-2 col-md-4 col-sm-4 col-xs-6");
    			add_location(div18, file$5, 61, 16, 3317);
    			attr_dev(div19, "class", "row");
    			add_location(div19, file$5, 45, 12, 2548);
    			attr_dev(div20, "class", "container");
    			add_location(div20, file$5, 44, 8, 2512);
    			attr_dev(div21, "class", "parttns");
    			add_location(div21, file$5, 43, 8, 2482);
    			attr_dev(div22, "class", "clearfix");
    			add_location(div22, file$5, 68, 4, 3498);
    			if (!src_url_equal(img10.src, img10_src_value = "img/svg/divider-01.svg")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "width", "100");
    			attr_dev(img10, "class", "mb-15");
    			attr_dev(img10, "alt", "divider");
    			add_location(img10, file$5, 77, 20, 3811);
    			attr_dev(div23, "class", "dream-dots justify-content-center wow fadeInUp");
    			attr_dev(div23, "data-wow-delay", "0.2s");
    			add_location(div23, file$5, 76, 16, 3708);
    			attr_dev(h20, "class", "wow fadeInUp");
    			attr_dev(h20, "data-wow-delay", "0.3s");
    			add_location(h20, file$5, 79, 16, 3925);
    			attr_dev(p1, "class", "wow fadeInUp");
    			attr_dev(p1, "data-wow-delay", "0.4s");
    			add_location(p1, file$5, 80, 16, 4006);
    			attr_dev(div24, "class", "section-heading text-center");
    			add_location(div24, file$5, 74, 12, 3633);
    			attr_dev(img11, "draggable", "false");
    			if (!src_url_equal(img11.src, img11_src_value = "img/icons/5.png")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "class", "white-icon");
    			attr_dev(img11, "alt", "");
    			add_location(img11, file$5, 88, 28, 4562);
    			attr_dev(span0, "class", "step-num");
    			add_location(span0, file$5, 89, 28, 4662);
    			attr_dev(div25, "class", "service_icon");
    			add_location(div25, file$5, 87, 24, 4507);
    			add_location(h60, file$5, 91, 24, 4749);
    			add_location(p2, file$5, 92, 24, 4808);
    			attr_dev(div26, "class", "service_single_content v3 box-shadow text-center mb-100 wow fadeInUp");
    			attr_dev(div26, "data-wow-delay", "0.2s");
    			add_location(div26, file$5, 85, 20, 4340);
    			attr_dev(div27, "class", "col-12 col-md-6 col-lg-4");
    			add_location(div27, file$5, 83, 16, 4244);
    			attr_dev(img12, "draggable", "false");
    			if (!src_url_equal(img12.src, img12_src_value = "img/icons/6.png")) attr_dev(img12, "src", img12_src_value);
    			attr_dev(img12, "class", "white-icon");
    			attr_dev(img12, "alt", "");
    			add_location(img12, file$5, 100, 28, 5316);
    			attr_dev(span1, "class", "step-num");
    			add_location(span1, file$5, 101, 28, 5416);
    			attr_dev(div28, "class", "service_icon");
    			add_location(div28, file$5, 99, 24, 5261);
    			add_location(h61, file$5, 103, 24, 5503);
    			add_location(p3, file$5, 104, 24, 5560);
    			attr_dev(div29, "class", "service_single_content v3 box-shadow text-center mb-100 wow wow fadeInUp");
    			attr_dev(div29, "data-wow-delay", "0.3s");
    			add_location(div29, file$5, 97, 20, 5090);
    			attr_dev(div30, "class", "col-12 col-md-6 col-lg-4");
    			add_location(div30, file$5, 95, 16, 4994);
    			attr_dev(img13, "draggable", "false");
    			if (!src_url_equal(img13.src, img13_src_value = "img/icons/7.png")) attr_dev(img13, "src", img13_src_value);
    			attr_dev(img13, "class", "white-icon");
    			attr_dev(img13, "alt", "");
    			add_location(img13, file$5, 112, 28, 6064);
    			attr_dev(span2, "class", "step-num");
    			add_location(span2, file$5, 113, 28, 6164);
    			attr_dev(div31, "class", "service_icon");
    			add_location(div31, file$5, 111, 24, 6009);
    			add_location(h62, file$5, 115, 24, 6251);
    			add_location(p4, file$5, 116, 24, 6310);
    			attr_dev(div32, "class", "service_single_content v3 box-shadow text-center mb-100 wow fadeInUp");
    			attr_dev(div32, "data-wow-delay", "0.4s");
    			add_location(div32, file$5, 109, 20, 5842);
    			attr_dev(div33, "class", "col-12 col-md-6 col-lg-4");
    			add_location(div33, file$5, 107, 16, 5746);
    			attr_dev(div34, "class", "row");
    			add_location(div34, file$5, 82, 12, 4210);
    			attr_dev(div35, "class", "container");
    			add_location(div35, file$5, 72, 8, 3596);
    			attr_dev(section1, "class", "darky how section-padding-100-70");
    			add_location(section1, file$5, 70, 8, 3536);
    			if (!src_url_equal(img14.src, img14_src_value = "img/svg/divider-01.svg")) attr_dev(img14, "src", img14_src_value);
    			attr_dev(img14, "width", "100");
    			attr_dev(img14, "class", "mb-15");
    			attr_dev(img14, "alt", "divider");
    			add_location(img14, file$5, 129, 24, 6833);
    			attr_dev(h40, "class", "fadeInUp");
    			attr_dev(h40, "data-wow-delay", "0.3s");
    			add_location(h40, file$5, 130, 24, 6932);
    			attr_dev(p5, "class", "mb-30 fadeInUp");
    			attr_dev(p5, "data-wow-delay", "0.4s");
    			add_location(p5, file$5, 131, 24, 7022);
    			attr_dev(div36, "class", "icon-font-box");
    			add_location(div36, file$5, 134, 32, 7348);
    			add_location(h30, file$5, 135, 32, 7416);
    			attr_dev(div37, "class", "text width-80");
    			add_location(div37, file$5, 136, 32, 7487);
    			attr_dev(li0, "class", "inner-box");
    			add_location(li0, file$5, 133, 28, 7293);
    			attr_dev(div38, "class", "icon-font-box");
    			add_location(div38, file$5, 139, 32, 7724);
    			add_location(h31, file$5, 140, 32, 7792);
    			attr_dev(div39, "class", "text width-80");
    			add_location(div39, file$5, 141, 32, 7864);
    			attr_dev(li1, "class", "inner-box");
    			add_location(li1, file$5, 138, 28, 7669);
    			attr_dev(div40, "class", "icon-font-box");
    			add_location(div40, file$5, 144, 32, 8101);
    			add_location(h32, file$5, 145, 32, 8169);
    			attr_dev(div41, "class", "text width-80");
    			add_location(div41, file$5, 146, 32, 8233);
    			attr_dev(li2, "class", "inner-box");
    			add_location(li2, file$5, 143, 28, 8046);
    			attr_dev(ul, "class", "services-block-four v2");
    			add_location(ul, file$5, 132, 24, 7229);
    			attr_dev(div42, "class", "who-we-contant");
    			add_location(div42, file$5, 128, 20, 6780);
    			attr_dev(div43, "class", "col-12 col-lg-6");
    			add_location(div43, file$5, 127, 16, 6730);
    			if (!src_url_equal(img15.src, img15_src_value = "img/core-img/how2.png")) attr_dev(img15, "src", img15_src_value);
    			attr_dev(img15, "alt", "");
    			add_location(img15, file$5, 154, 53, 8667);
    			attr_dev(div44, "class", "gready-img");
    			add_location(div44, file$5, 154, 28, 8642);
    			attr_dev(div45, "class", "col-sm-6");
    			add_location(div45, file$5, 153, 24, 8591);
    			if (!src_url_equal(img16.src, img16_src_value = "img/core-img/how1.png")) attr_dev(img16, "src", img16_src_value);
    			attr_dev(img16, "alt", "");
    			add_location(img16, file$5, 157, 53, 8845);
    			attr_dev(div46, "class", "gready-img");
    			add_location(div46, file$5, 157, 28, 8820);
    			attr_dev(div47, "class", "col-sm-6");
    			add_location(div47, file$5, 156, 24, 8769);
    			attr_dev(div48, "class", "row align-items-end");
    			add_location(div48, file$5, 152, 20, 8533);
    			attr_dev(div49, "class", "col-12 col-lg-6");
    			add_location(div49, file$5, 151, 16, 8483);
    			attr_dev(div50, "class", "row align-items-center");
    			add_location(div50, file$5, 126, 12, 6677);
    			attr_dev(div51, "class", "container has-shadow");
    			add_location(div51, file$5, 125, 8, 6630);
    			attr_dev(section2, "class", "special fuel-features section-padding-0-100 clearfix");
    			add_location(section2, file$5, 124, 4, 6551);
    			if (!src_url_equal(img17.src, img17_src_value = "img/svg/divider-01.svg")) attr_dev(img17, "src", img17_src_value);
    			attr_dev(img17, "width", "100");
    			attr_dev(img17, "class", "mb-15");
    			attr_dev(img17, "alt", "divider");
    			add_location(img17, file$5, 172, 20, 9302);
    			attr_dev(div52, "class", "dream-dots justify-content-center wow fadeInUp");
    			attr_dev(div52, "data-wow-delay", "0.2s");
    			add_location(div52, file$5, 171, 16, 9199);
    			attr_dev(h21, "class", "wow fadeInUp");
    			attr_dev(h21, "data-wow-delay", "0.3s");
    			add_location(h21, file$5, 174, 16, 9416);
    			attr_dev(p6, "class", "wow fadeInUp");
    			attr_dev(p6, "data-wow-delay", "0.4s");
    			set_style(p6, "visibility", "visible");
    			set_style(p6, "animation-delay", "0.4s");
    			set_style(p6, "animation-name", "fadeInUp");
    			add_location(p6, file$5, 175, 16, 9505);
    			attr_dev(div53, "class", "section-heading text-center");
    			add_location(div53, file$5, 169, 12, 9124);
    			attr_dev(img18, "draggable", "false");
    			if (!src_url_equal(img18.src, img18_src_value = "img/icons/1.png")) attr_dev(img18, "src", img18_src_value);
    			attr_dev(img18, "class", "white-icon");
    			attr_dev(img18, "alt", "");
    			add_location(img18, file$5, 183, 28, 10166);
    			attr_dev(div54, "class", "service_icon v2");
    			add_location(div54, file$5, 182, 24, 10108);
    			add_location(h63, file$5, 186, 28, 10351);
    			add_location(p7, file$5, 187, 28, 10417);
    			attr_dev(div55, "class", "service_content");
    			add_location(div55, file$5, 185, 24, 10293);
    			attr_dev(a2, "href", "services.html");
    			attr_dev(a2, "class", "service_single_content grediant-borders box-shadow text-left wow fadeInUp");
    			attr_dev(a2, "data-wow-delay", "0.2s");
    			add_location(a2, file$5, 180, 20, 9917);
    			attr_dev(div56, "class", "col-12 col-md-6 col-lg-6");
    			add_location(div56, file$5, 178, 16, 9821);
    			attr_dev(img19, "draggable", "false");
    			if (!src_url_equal(img19.src, img19_src_value = "img/icons/2.png")) attr_dev(img19, "src", img19_src_value);
    			attr_dev(img19, "class", "white-icon");
    			attr_dev(img19, "alt", "");
    			add_location(img19, file$5, 196, 28, 10981);
    			attr_dev(div57, "class", "service_icon v2");
    			add_location(div57, file$5, 195, 24, 10923);
    			add_location(h64, file$5, 199, 28, 11166);
    			add_location(p8, file$5, 200, 28, 11231);
    			attr_dev(div58, "class", "service_content");
    			add_location(div58, file$5, 198, 24, 11108);
    			attr_dev(a3, "href", "services.html");
    			attr_dev(a3, "class", "service_single_content grediant-borders box-shadow text-left wow wow fadeInUp");
    			attr_dev(a3, "data-wow-delay", "0.3s");
    			add_location(a3, file$5, 193, 20, 10728);
    			attr_dev(div59, "class", "col-12 col-md-6 col-lg-6");
    			add_location(div59, file$5, 191, 16, 10632);
    			attr_dev(img20, "draggable", "false");
    			if (!src_url_equal(img20.src, img20_src_value = "img/icons/3.png")) attr_dev(img20, "src", img20_src_value);
    			attr_dev(img20, "class", "white-icon");
    			attr_dev(img20, "alt", "");
    			add_location(img20, file$5, 209, 28, 11791);
    			attr_dev(div60, "class", "service_icon v2");
    			add_location(div60, file$5, 208, 24, 11733);
    			add_location(h65, file$5, 212, 28, 11976);
    			add_location(p9, file$5, 213, 28, 12037);
    			attr_dev(div61, "class", "service_content");
    			add_location(div61, file$5, 211, 24, 11918);
    			attr_dev(a4, "href", "services.html");
    			attr_dev(a4, "class", "service_single_content grediant-borders box-shadow text-left wow fadeInUp");
    			attr_dev(a4, "data-wow-delay", "0.4s");
    			add_location(a4, file$5, 206, 20, 11542);
    			attr_dev(div62, "class", "col-12 col-md-6 col-lg-6");
    			add_location(div62, file$5, 204, 16, 11446);
    			attr_dev(img21, "draggable", "false");
    			if (!src_url_equal(img21.src, img21_src_value = "img/icons/4.png")) attr_dev(img21, "src", img21_src_value);
    			attr_dev(img21, "class", "white-icon");
    			attr_dev(img21, "alt", "");
    			add_location(img21, file$5, 222, 28, 12597);
    			attr_dev(div63, "class", "service_icon v2");
    			add_location(div63, file$5, 221, 24, 12539);
    			add_location(h66, file$5, 225, 28, 12782);
    			add_location(p10, file$5, 226, 28, 12840);
    			attr_dev(div64, "class", "service_content");
    			add_location(div64, file$5, 224, 24, 12724);
    			attr_dev(a5, "href", "services.html");
    			attr_dev(a5, "class", "service_single_content grediant-borders box-shadow text-left wow fadeInUp");
    			attr_dev(a5, "data-wow-delay", "0.5s");
    			add_location(a5, file$5, 219, 20, 12348);
    			attr_dev(div65, "class", "col-12 col-md-6 col-lg-6");
    			add_location(div65, file$5, 217, 16, 12252);
    			attr_dev(div66, "class", "row");
    			add_location(div66, file$5, 177, 12, 9787);
    			attr_dev(div67, "class", "container");
    			add_location(div67, file$5, 167, 8, 9087);
    			attr_dev(section3, "class", "darky how section-padding-100-70");
    			add_location(section3, file$5, 166, 4, 9028);
    			attr_dev(img22, "draggable", "false");
    			if (!src_url_equal(img22.src, img22_src_value = "img/core-img/img4.png")) attr_dev(img22, "src", img22_src_value);
    			attr_dev(img22, "alt", "");
    			add_location(img22, file$5, 241, 24, 13450);
    			attr_dev(div68, "class", "welcome-meter");
    			add_location(div68, file$5, 240, 20, 13398);
    			attr_dev(div69, "class", "col-12 col-lg-4 offset-lg-0 col-md-6");
    			add_location(div69, file$5, 239, 16, 13327);
    			attr_dev(span3, "class", "gradient-text");
    			add_location(span3, file$5, 247, 28, 13790);
    			attr_dev(div70, "class", "dream-dots text-left fadeInUp");
    			attr_dev(div70, "data-wow-delay", "0.2s");
    			add_location(div70, file$5, 246, 24, 13696);
    			attr_dev(h41, "class", "fadeInUp");
    			attr_dev(h41, "data-wow-delay", "0.3s");
    			add_location(h41, file$5, 249, 24, 13902);
    			if (!src_url_equal(img23.src, img23_src_value = "img/svg/divider-01.svg")) attr_dev(img23, "src", img23_src_value);
    			attr_dev(img23, "width", "100");
    			attr_dev(img23, "class", "mt-15");
    			attr_dev(img23, "alt", "divider");
    			add_location(img23, file$5, 250, 24, 14022);
    			attr_dev(div71, "class", "who-we-contant");
    			add_location(div71, file$5, 245, 20, 13643);
    			attr_dev(div72, "class", "col-12 col-lg-4 offset-lg-0 mt-s");
    			add_location(div72, file$5, 244, 16, 13576);
    			add_location(p11, file$5, 255, 24, 14292);
    			attr_dev(a6, "class", "btn more-btn mt-30 fadeInUp");
    			attr_dev(a6, "data-wow-delay", "0.6s");
    			attr_dev(a6, "href", "about-us.html");
    			add_location(a6, file$5, 256, 24, 14517);
    			attr_dev(div73, "class", "who-we-contant left-bor");
    			add_location(div73, file$5, 254, 20, 14230);
    			attr_dev(div74, "class", "col-12 col-lg-4 offset-lg-0 mt-s");
    			add_location(div74, file$5, 253, 16, 14163);
    			attr_dev(div75, "class", "row align-items-center");
    			add_location(div75, file$5, 238, 12, 13274);
    			attr_dev(div76, "class", "container");
    			add_location(div76, file$5, 237, 8, 13238);
    			attr_dev(section4, "class", "about-us-area section-padding-0-100 clearfix");
    			attr_dev(section4, "id", "about");
    			add_location(section4, file$5, 236, 4, 13156);
    			attr_dev(span4, "class", "gradient-text white");
    			add_location(span4, file$5, 270, 20, 15058);
    			attr_dev(div77, "class", "dream-dots justify-content-center fadeInUp");
    			attr_dev(div77, "data-wow-delay", "0.2s");
    			add_location(div77, file$5, 269, 16, 14959);
    			add_location(h22, file$5, 272, 16, 15158);
    			attr_dev(p12, "class", "w-text");
    			add_location(p12, file$5, 273, 16, 15200);
    			attr_dev(div78, "class", "section-heading text-center");
    			add_location(div78, file$5, 267, 12, 14888);
    			if (!src_url_equal(img24.src, img24_src_value = "img/icons/fact1.png")) attr_dev(img24, "src", img24_src_value);
    			attr_dev(img24, "alt", "");
    			add_location(img24, file$5, 279, 45, 15609);
    			attr_dev(div79, "class", "icon-box");
    			add_location(div79, file$5, 279, 23, 15587);
    			attr_dev(span5, "class", "count-text counter");
    			add_location(span5, file$5, 282, 34, 15792);
    			attr_dev(div80, "class", "count-outer");
    			add_location(div80, file$5, 281, 30, 15732);
    			attr_dev(div81, "class", "counter-title");
    			add_location(div81, file$5, 284, 30, 15903);
    			attr_dev(div82, "class", "content");
    			add_location(div82, file$5, 280, 26, 15680);
    			attr_dev(div83, "class", "inner");
    			add_location(div83, file$5, 278, 22, 15544);
    			attr_dev(div84, "class", "fact-box count-box col-lg-3 col-xs-12");
    			add_location(div84, file$5, 277, 20, 15470);
    			if (!src_url_equal(img25.src, img25_src_value = "img/icons/fact2.png")) attr_dev(img25, "src", img25_src_value);
    			attr_dev(img25, "alt", "");
    			add_location(img25, file$5, 291, 45, 16211);
    			attr_dev(div85, "class", "icon-box");
    			add_location(div85, file$5, 291, 23, 16189);
    			attr_dev(span6, "class", "count-text counter");
    			add_location(span6, file$5, 294, 34, 16394);
    			attr_dev(div86, "class", "count-outer");
    			add_location(div86, file$5, 293, 30, 16334);
    			attr_dev(div87, "class", "counter-title");
    			add_location(div87, file$5, 296, 30, 16506);
    			attr_dev(div88, "class", "content");
    			add_location(div88, file$5, 292, 26, 16282);
    			attr_dev(div89, "class", "inner");
    			add_location(div89, file$5, 290, 22, 16146);
    			attr_dev(div90, "class", "fact-box count-box col-lg-3 col-xs-12 fact-box-xs");
    			add_location(div90, file$5, 289, 20, 16060);
    			if (!src_url_equal(img26.src, img26_src_value = "img/icons/fact3.png")) attr_dev(img26, "src", img26_src_value);
    			attr_dev(img26, "alt", "");
    			add_location(img26, file$5, 303, 45, 16815);
    			attr_dev(div91, "class", "icon-box");
    			add_location(div91, file$5, 303, 23, 16793);
    			attr_dev(span7, "class", "count-text counter");
    			add_location(span7, file$5, 306, 34, 16998);
    			attr_dev(div92, "class", "count-outer");
    			add_location(div92, file$5, 305, 30, 16938);
    			attr_dev(div93, "class", "counter-title");
    			add_location(div93, file$5, 308, 30, 17108);
    			attr_dev(div94, "class", "content");
    			add_location(div94, file$5, 304, 26, 16886);
    			attr_dev(div95, "class", "inner");
    			add_location(div95, file$5, 302, 22, 16750);
    			attr_dev(div96, "class", "fact-box count-box col-lg-3 col-xs-12 fact-box-sm");
    			add_location(div96, file$5, 301, 20, 16664);
    			if (!src_url_equal(img27.src, img27_src_value = "img/icons/fact4.png")) attr_dev(img27, "src", img27_src_value);
    			attr_dev(img27, "alt", "");
    			add_location(img27, file$5, 315, 45, 17413);
    			attr_dev(div97, "class", "icon-box");
    			add_location(div97, file$5, 315, 23, 17391);
    			attr_dev(span8, "class", "count-text counter");
    			add_location(span8, file$5, 318, 34, 17596);
    			attr_dev(div98, "class", "count-outer");
    			add_location(div98, file$5, 317, 30, 17536);
    			attr_dev(div99, "class", "counter-title");
    			add_location(div99, file$5, 320, 30, 17707);
    			attr_dev(div100, "class", "content");
    			add_location(div100, file$5, 316, 26, 17484);
    			attr_dev(div101, "class", "inner");
    			add_location(div101, file$5, 314, 22, 17348);
    			attr_dev(div102, "class", "fact-box count-box col-lg-3 col-xs-12 fact-box-sm");
    			add_location(div102, file$5, 313, 20, 17262);
    			attr_dev(div103, "class", "col-12");
    			add_location(div103, file$5, 276, 16, 15429);
    			attr_dev(div104, "class", "row align-items-center");
    			add_location(div104, file$5, 275, 12, 15376);
    			attr_dev(div105, "class", "container pre-sale-bg");
    			add_location(div105, file$5, 266, 8, 14840);
    			attr_dev(div106, "class", "section-padding-0-0");
    			add_location(div106, file$5, 265, 4, 14797);
    			attr_dev(h42, "class", "fadeInUp");
    			attr_dev(h42, "data-wow-delay", "0.3s");
    			add_location(h42, file$5, 335, 24, 18185);
    			if (!src_url_equal(img28.src, img28_src_value = "img/svg/divider-01.svg")) attr_dev(img28, "src", img28_src_value);
    			attr_dev(img28, "width", "100");
    			attr_dev(img28, "alt", "divider");
    			add_location(img28, file$5, 336, 24, 18279);
    			attr_dev(div107, "class", "who-we-contant");
    			add_location(div107, file$5, 334, 20, 18132);
    			attr_dev(div108, "class", "col-12 col-lg-6 offset-lg-0");
    			add_location(div108, file$5, 333, 16, 18070);
    			add_location(p13, file$5, 341, 24, 18535);
    			attr_dev(div109, "class", "who-we-contant left-bor");
    			add_location(div109, file$5, 340, 20, 18473);
    			attr_dev(div110, "class", "col-12 col-lg-6 offset-lg-0 mt-s");
    			add_location(div110, file$5, 339, 16, 18406);
    			attr_dev(div111, "class", "row align-items-center mb-50");
    			add_location(div111, file$5, 332, 12, 18011);
    			if (!src_url_equal(img29.src, img29_src_value = "img/projects/1.jpg")) attr_dev(img29, "src", img29_src_value);
    			attr_dev(img29, "class", "img-responsive ");
    			attr_dev(img29, "alt", "");
    			add_location(img29, file$5, 350, 28, 19080);
    			attr_dev(div112, "class", "project_img");
    			add_location(div112, file$5, 349, 24, 19026);
    			add_location(br0, file$5, 353, 45, 19269);
    			add_location(h43, file$5, 353, 28, 19252);
    			add_location(p14, file$5, 354, 28, 19324);
    			attr_dev(i0, "class", "fa fa-arrow-right");
    			add_location(i0, file$5, 355, 80, 19428);
    			add_location(span9, file$5, 355, 74, 19422);
    			attr_dev(a7, "href", "project-details.html");
    			add_location(a7, file$5, 355, 28, 19376);
    			attr_dev(div113, "class", "project_info");
    			add_location(div113, file$5, 352, 24, 19197);
    			attr_dev(div114, "class", "project_single wow fadeInUp");
    			attr_dev(div114, "data-wow-delay", "0.2s");
    			add_location(div114, file$5, 348, 20, 18938);
    			attr_dev(div115, "class", "col-12 col-lg-6");
    			add_location(div115, file$5, 346, 16, 18851);
    			if (!src_url_equal(img30.src, img30_src_value = "img/projects/2.jpg")) attr_dev(img30, "src", img30_src_value);
    			attr_dev(img30, "class", "img-responsive ");
    			attr_dev(img30, "alt", "");
    			add_location(img30, file$5, 363, 28, 19799);
    			attr_dev(div116, "class", "project_img");
    			add_location(div116, file$5, 362, 24, 19745);
    			add_location(br1, file$5, 366, 48, 19991);
    			add_location(h44, file$5, 366, 28, 19971);
    			add_location(p15, file$5, 367, 28, 20046);
    			attr_dev(i1, "class", "fa fa-arrow-right");
    			add_location(i1, file$5, 368, 80, 20145);
    			add_location(span10, file$5, 368, 74, 20139);
    			attr_dev(a8, "href", "project-details.html");
    			add_location(a8, file$5, 368, 28, 20093);
    			attr_dev(div117, "class", "project_info");
    			add_location(div117, file$5, 365, 24, 19916);
    			attr_dev(div118, "class", "project_single wow fadeInUp");
    			attr_dev(div118, "data-wow-delay", "0.3s");
    			add_location(div118, file$5, 361, 20, 19657);
    			attr_dev(div119, "class", "col-12 col-lg-6");
    			add_location(div119, file$5, 359, 16, 19570);
    			if (!src_url_equal(img31.src, img31_src_value = "img/projects/3.jpg")) attr_dev(img31, "src", img31_src_value);
    			attr_dev(img31, "class", "img-responsive ");
    			attr_dev(img31, "alt", "");
    			add_location(img31, file$5, 376, 28, 20516);
    			attr_dev(div120, "class", "project_img");
    			add_location(div120, file$5, 375, 24, 20462);
    			add_location(br2, file$5, 379, 47, 20707);
    			add_location(h45, file$5, 379, 28, 20688);
    			add_location(p16, file$5, 380, 28, 20761);
    			attr_dev(i2, "class", "fa fa-arrow-right");
    			add_location(i2, file$5, 381, 80, 20859);
    			add_location(span11, file$5, 381, 74, 20853);
    			attr_dev(a9, "href", "project-details.html");
    			add_location(a9, file$5, 381, 28, 20807);
    			attr_dev(div121, "class", "project_info");
    			add_location(div121, file$5, 378, 24, 20633);
    			attr_dev(div122, "class", "project_single wow fadeInUp");
    			attr_dev(div122, "data-wow-delay", "0.2s");
    			add_location(div122, file$5, 374, 20, 20374);
    			attr_dev(div123, "class", "col-12 col-lg-6");
    			add_location(div123, file$5, 372, 16, 20287);
    			if (!src_url_equal(img32.src, img32_src_value = "img/projects/4.jpg")) attr_dev(img32, "src", img32_src_value);
    			attr_dev(img32, "class", "img-responsive ");
    			attr_dev(img32, "alt", "");
    			add_location(img32, file$5, 389, 28, 21230);
    			attr_dev(div124, "class", "project_img");
    			add_location(div124, file$5, 388, 24, 21176);
    			add_location(br3, file$5, 392, 49, 21423);
    			add_location(h46, file$5, 392, 28, 21402);
    			add_location(p17, file$5, 393, 28, 21479);
    			attr_dev(i3, "class", "fa fa-arrow-right");
    			add_location(i3, file$5, 394, 80, 21577);
    			add_location(span12, file$5, 394, 74, 21571);
    			attr_dev(a10, "href", "project-details.html");
    			add_location(a10, file$5, 394, 28, 21525);
    			attr_dev(div125, "class", "project_info");
    			add_location(div125, file$5, 391, 24, 21347);
    			attr_dev(div126, "class", "project_single wow fadeInUp");
    			attr_dev(div126, "data-wow-delay", "0.3s");
    			add_location(div126, file$5, 387, 20, 21088);
    			attr_dev(div127, "class", "col-12 col-lg-6");
    			add_location(div127, file$5, 385, 16, 21001);
    			attr_dev(div128, "class", "row");
    			add_location(div128, file$5, 345, 12, 18817);
    			attr_dev(div129, "class", "container");
    			add_location(div129, file$5, 331, 8, 17975);
    			attr_dev(section5, "class", "Projects section-padding-0-0");
    			add_location(section5, file$5, 330, 4, 17920);
    			if (!src_url_equal(img33.src, img33_src_value = "img/svg/divider-01.svg")) attr_dev(img33, "src", img33_src_value);
    			attr_dev(img33, "width", "100");
    			attr_dev(img33, "class", "mb-15");
    			attr_dev(img33, "alt", "divider");
    			add_location(img33, file$5, 408, 20, 22086);
    			attr_dev(div130, "class", "dream-dots justify-content-center fadeInUp");
    			attr_dev(div130, "data-wow-delay", "0.2s");
    			add_location(div130, file$5, 407, 16, 21987);
    			attr_dev(h23, "class", "fadeInUp");
    			attr_dev(h23, "data-wow-delay", "0.3s");
    			add_location(h23, file$5, 410, 16, 22200);
    			attr_dev(p18, "class", "fadeInUp");
    			attr_dev(p18, "data-wow-delay", "0.4s");
    			add_location(p18, file$5, 411, 16, 22287);
    			attr_dev(div131, "class", "section-heading text-center");
    			add_location(div131, file$5, 406, 12, 21929);
    			attr_dev(img34, "draggable", "false");
    			if (!src_url_equal(img34.src, img34_src_value = "img/core-img/img2.png")) attr_dev(img34, "src", img34_src_value);
    			attr_dev(img34, "alt", "");
    			attr_dev(img34, "class", "center-block img-responsive");
    			add_location(img34, file$5, 415, 20, 22633);
    			attr_dev(div132, "class", "col-12 col-lg-6 offset-lg-0 col-md-8 offset-md-2 col-sm-12");
    			add_location(div132, file$5, 414, 16, 22540);
    			attr_dev(dt0, "class", "wave fadeInUp");
    			attr_dev(dt0, "data-wow-delay", "0.2s");
    			add_location(dt0, file$5, 421, 28, 22996);
    			add_location(p19, file$5, 423, 32, 23193);
    			attr_dev(dd0, "class", "fadeInUp");
    			attr_dev(dd0, "data-wow-delay", "0.3s");
    			add_location(dd0, file$5, 422, 28, 23117);
    			attr_dev(dt1, "class", "wave fadeInUp");
    			attr_dev(dt1, "data-wow-delay", "0.3s");
    			add_location(dt1, file$5, 426, 28, 23551);
    			add_location(p20, file$5, 428, 32, 23719);
    			add_location(dd1, file$5, 427, 28, 23682);
    			attr_dev(dt2, "class", "wave fadeInUp");
    			attr_dev(dt2, "data-wow-delay", "0.4s");
    			add_location(dt2, file$5, 431, 28, 24077);
    			add_location(p21, file$5, 433, 32, 24237);
    			add_location(dd2, file$5, 432, 28, 24200);
    			attr_dev(dt3, "class", "wave fadeInUp");
    			attr_dev(dt3, "data-wow-delay", "0.5s");
    			add_location(dt3, file$5, 436, 28, 24595);
    			add_location(p22, file$5, 438, 32, 24763);
    			add_location(dd3, file$5, 437, 28, 24726);
    			set_style(dl, "margin-bottom", "0");
    			add_location(dl, file$5, 419, 24, 22886);
    			attr_dev(div133, "class", "dream-faq-area mt-s ");
    			add_location(div133, file$5, 418, 20, 22827);
    			attr_dev(div134, "class", "col-12 col-lg-6 col-md-12");
    			add_location(div134, file$5, 417, 16, 22767);
    			attr_dev(div135, "class", "row align-items-center");
    			add_location(div135, file$5, 413, 12, 22487);
    			attr_dev(div136, "class", "container");
    			add_location(div136, file$5, 405, 8, 21893);
    			attr_dev(div137, "class", "faq-timeline-area section-padding-100-85");
    			attr_dev(div137, "id", "faq");
    			add_location(div137, file$5, 404, 4, 21821);
    			if (!src_url_equal(img35.src, img35_src_value = "img/svg/divider-01.svg")) attr_dev(img35, "src", img35_src_value);
    			attr_dev(img35, "width", "100");
    			attr_dev(img35, "class", "mb-15");
    			attr_dev(img35, "alt", "divider");
    			add_location(img35, file$5, 458, 28, 25671);
    			attr_dev(div138, "class", "dream-dots justify-content-center fadeInUp");
    			attr_dev(div138, "data-wow-delay", "0.2s");
    			add_location(div138, file$5, 457, 24, 25564);
    			attr_dev(h24, "class", "fadeInUp");
    			attr_dev(h24, "data-wow-delay", "0.3s");
    			add_location(h24, file$5, 460, 24, 25801);
    			attr_dev(p23, "class", "fadeInUp");
    			attr_dev(p23, "data-wow-delay", "0.4s");
    			add_location(p23, file$5, 461, 24, 25886);
    			attr_dev(div139, "class", "section-heading text-center");
    			add_location(div139, file$5, 455, 20, 25473);
    			attr_dev(div140, "class", "col-12");
    			add_location(div140, file$5, 454, 16, 25432);
    			attr_dev(div141, "class", "row");
    			add_location(div141, file$5, 453, 12, 25398);
    			attr_dev(img36, "draggable", "false");
    			if (!src_url_equal(img36.src, img36_src_value = "img/team-img/avatar-1.png")) attr_dev(img36, "src", img36_src_value);
    			attr_dev(img36, "class", "center-block");
    			attr_dev(img36, "alt", "");
    			add_location(img36, file$5, 472, 28, 26462);
    			attr_dev(div142, "class", "team-member-thumb");
    			add_location(div142, file$5, 471, 24, 26402);
    			attr_dev(h50, "class", "w-text");
    			add_location(h50, file$5, 476, 28, 26696);
    			attr_dev(p24, "class", "g-text");
    			add_location(p24, file$5, 477, 28, 26760);
    			attr_dev(div143, "class", "team-info");
    			add_location(div143, file$5, 475, 24, 26644);
    			attr_dev(i4, "class", "fa fa-linkedin");
    			add_location(i4, file$5, 481, 43, 26974);
    			attr_dev(a11, "href", "#top");
    			add_location(a11, file$5, 481, 28, 26959);
    			attr_dev(div144, "class", "team-social-icon");
    			add_location(div144, file$5, 480, 24, 26900);
    			attr_dev(div145, "class", "single-team-member fadeInUp");
    			attr_dev(div145, "data-wow-delay", "0.2s");
    			add_location(div145, file$5, 469, 20, 26275);
    			attr_dev(div146, "class", "col-12 col-sm-6 col-lg-3");
    			add_location(div146, file$5, 468, 16, 26216);
    			attr_dev(img37, "draggable", "false");
    			if (!src_url_equal(img37.src, img37_src_value = "img/team-img/avatar-2.png")) attr_dev(img37, "src", img37_src_value);
    			attr_dev(img37, "class", "center-block");
    			attr_dev(img37, "alt", "");
    			add_location(img37, file$5, 491, 28, 27397);
    			attr_dev(div147, "class", "team-member-thumb");
    			add_location(div147, file$5, 490, 24, 27337);
    			attr_dev(h51, "class", "w-text");
    			add_location(h51, file$5, 495, 28, 27631);
    			attr_dev(p25, "class", "g-text");
    			add_location(p25, file$5, 496, 28, 27695);
    			attr_dev(div148, "class", "team-info");
    			add_location(div148, file$5, 494, 24, 27579);
    			attr_dev(i5, "class", "fa fa-linkedin");
    			add_location(i5, file$5, 500, 43, 27912);
    			attr_dev(a12, "href", "#top");
    			add_location(a12, file$5, 500, 28, 27897);
    			attr_dev(div149, "class", "team-social-icon");
    			add_location(div149, file$5, 499, 24, 27838);
    			attr_dev(div150, "class", "single-team-member fadeInUp");
    			attr_dev(div150, "data-wow-delay", "0.3s");
    			add_location(div150, file$5, 488, 20, 27210);
    			attr_dev(div151, "class", "col-12 col-sm-6 col-lg-3");
    			add_location(div151, file$5, 487, 16, 27151);
    			attr_dev(img38, "draggable", "false");
    			if (!src_url_equal(img38.src, img38_src_value = "img/team-img/avatar-3.png")) attr_dev(img38, "src", img38_src_value);
    			attr_dev(img38, "class", "center-block");
    			attr_dev(img38, "alt", "");
    			add_location(img38, file$5, 510, 28, 28335);
    			attr_dev(div152, "class", "team-member-thumb");
    			add_location(div152, file$5, 509, 24, 28275);
    			attr_dev(h52, "class", "w-text");
    			add_location(h52, file$5, 514, 28, 28569);
    			attr_dev(p26, "class", "g-text");
    			add_location(p26, file$5, 515, 28, 28634);
    			attr_dev(div153, "class", "team-info");
    			add_location(div153, file$5, 513, 24, 28517);
    			attr_dev(i6, "class", "fa fa-linkedin");
    			add_location(i6, file$5, 519, 43, 28845);
    			attr_dev(a13, "href", "#top");
    			add_location(a13, file$5, 519, 28, 28830);
    			attr_dev(div154, "class", "team-social-icon");
    			add_location(div154, file$5, 518, 24, 28771);
    			attr_dev(div155, "class", "single-team-member fadeInUp");
    			attr_dev(div155, "data-wow-delay", "0.4s");
    			add_location(div155, file$5, 507, 20, 28148);
    			attr_dev(div156, "class", "col-12 col-sm-6 col-lg-3");
    			add_location(div156, file$5, 506, 16, 28089);
    			attr_dev(img39, "draggable", "false");
    			if (!src_url_equal(img39.src, img39_src_value = "img/team-img/avatar-4.png")) attr_dev(img39, "src", img39_src_value);
    			attr_dev(img39, "class", "center-block");
    			attr_dev(img39, "alt", "");
    			add_location(img39, file$5, 529, 28, 29268);
    			attr_dev(div157, "class", "team-member-thumb");
    			add_location(div157, file$5, 528, 24, 29208);
    			attr_dev(h53, "class", "w-text");
    			add_location(h53, file$5, 533, 28, 29502);
    			attr_dev(p27, "class", "g-text");
    			add_location(p27, file$5, 534, 28, 29567);
    			attr_dev(div158, "class", "team-info");
    			add_location(div158, file$5, 532, 24, 29450);
    			attr_dev(i7, "class", "fa fa-linkedin");
    			add_location(i7, file$5, 538, 43, 29774);
    			attr_dev(a14, "href", "#top");
    			add_location(a14, file$5, 538, 28, 29759);
    			attr_dev(div159, "class", "team-social-icon");
    			add_location(div159, file$5, 537, 24, 29700);
    			attr_dev(div160, "class", "single-team-member fadeInUp");
    			attr_dev(div160, "data-wow-delay", "0.5s");
    			add_location(div160, file$5, 526, 20, 29081);
    			attr_dev(div161, "class", "col-12 col-sm-6 col-lg-3");
    			add_location(div161, file$5, 525, 16, 29022);
    			attr_dev(div162, "class", "row");
    			add_location(div162, file$5, 466, 12, 26138);
    			attr_dev(div163, "class", "container");
    			add_location(div163, file$5, 452, 8, 25362);
    			attr_dev(section6, "class", "our_team_area section-padding-0-70 clearfix");
    			attr_dev(section6, "id", "team");
    			add_location(section6, file$5, 451, 4, 25282);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			append_dev(section0, div12);
    			append_dev(div12, div11);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h1);
    			append_dev(h1, t0);
    			append_dev(h1, img0);
    			append_dev(h1, t1);
    			append_dev(div8, t2);
    			append_dev(div8, img1);
    			append_dev(div8, t3);
    			append_dev(div8, p0);
    			append_dev(div8, t5);
    			append_dev(div8, div6);
    			append_dev(div6, div2);
    			append_dev(div2, div1);
    			append_dev(div1, img2);
    			append_dev(div1, t6);
    			append_dev(div1, div0);
    			append_dev(div6, t8);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, img3);
    			append_dev(div4, t9);
    			append_dev(div4, div3);
    			append_dev(div8, t11);
    			append_dev(div8, div7);
    			append_dev(div7, a0);
    			append_dev(div7, t13);
    			append_dev(div7, a1);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, div21, anchor);
    			append_dev(div21, div20);
    			append_dev(div20, div19);
    			append_dev(div19, div13);
    			append_dev(div13, img4);
    			append_dev(div19, t16);
    			append_dev(div19, div14);
    			append_dev(div14, img5);
    			append_dev(div19, t17);
    			append_dev(div19, div15);
    			append_dev(div15, img6);
    			append_dev(div19, t18);
    			append_dev(div19, div16);
    			append_dev(div16, img7);
    			append_dev(div19, t19);
    			append_dev(div19, div17);
    			append_dev(div17, img8);
    			append_dev(div19, t20);
    			append_dev(div19, div18);
    			append_dev(div18, img9);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, div22, anchor);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div35);
    			append_dev(div35, div24);
    			append_dev(div24, div23);
    			append_dev(div23, img10);
    			append_dev(div24, t23);
    			append_dev(div24, h20);
    			append_dev(div24, t25);
    			append_dev(div24, p1);
    			append_dev(div35, t27);
    			append_dev(div35, div34);
    			append_dev(div34, div27);
    			append_dev(div27, div26);
    			append_dev(div26, div25);
    			append_dev(div25, img11);
    			append_dev(div25, t28);
    			append_dev(div25, span0);
    			append_dev(div26, t30);
    			append_dev(div26, h60);
    			append_dev(div26, t32);
    			append_dev(div26, p2);
    			append_dev(div34, t34);
    			append_dev(div34, div30);
    			append_dev(div30, div29);
    			append_dev(div29, div28);
    			append_dev(div28, img12);
    			append_dev(div28, t35);
    			append_dev(div28, span1);
    			append_dev(div29, t37);
    			append_dev(div29, h61);
    			append_dev(div29, t39);
    			append_dev(div29, p3);
    			append_dev(div34, t41);
    			append_dev(div34, div33);
    			append_dev(div33, div32);
    			append_dev(div32, div31);
    			append_dev(div31, img13);
    			append_dev(div31, t42);
    			append_dev(div31, span2);
    			append_dev(div32, t44);
    			append_dev(div32, h62);
    			append_dev(div32, t46);
    			append_dev(div32, p4);
    			insert_dev(target, t48, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, div51);
    			append_dev(div51, div50);
    			append_dev(div50, div43);
    			append_dev(div43, div42);
    			append_dev(div42, img14);
    			append_dev(div42, t49);
    			append_dev(div42, h40);
    			append_dev(div42, t51);
    			append_dev(div42, p5);
    			append_dev(div42, t53);
    			append_dev(div42, ul);
    			append_dev(ul, li0);
    			append_dev(li0, div36);
    			append_dev(li0, t55);
    			append_dev(li0, h30);
    			append_dev(li0, t57);
    			append_dev(li0, div37);
    			append_dev(ul, t59);
    			append_dev(ul, li1);
    			append_dev(li1, div38);
    			append_dev(li1, t61);
    			append_dev(li1, h31);
    			append_dev(li1, t63);
    			append_dev(li1, div39);
    			append_dev(ul, t65);
    			append_dev(ul, li2);
    			append_dev(li2, div40);
    			append_dev(li2, t67);
    			append_dev(li2, h32);
    			append_dev(li2, t69);
    			append_dev(li2, div41);
    			append_dev(div50, t71);
    			append_dev(div50, div49);
    			append_dev(div49, div48);
    			append_dev(div48, div45);
    			append_dev(div45, div44);
    			append_dev(div44, img15);
    			append_dev(div48, t72);
    			append_dev(div48, div47);
    			append_dev(div47, div46);
    			append_dev(div46, img16);
    			insert_dev(target, t73, anchor);
    			insert_dev(target, section3, anchor);
    			append_dev(section3, div67);
    			append_dev(div67, div53);
    			append_dev(div53, div52);
    			append_dev(div52, img17);
    			append_dev(div53, t74);
    			append_dev(div53, h21);
    			append_dev(div53, t76);
    			append_dev(div53, p6);
    			append_dev(div67, t78);
    			append_dev(div67, div66);
    			append_dev(div66, div56);
    			append_dev(div56, a2);
    			append_dev(a2, div54);
    			append_dev(div54, img18);
    			append_dev(a2, t79);
    			append_dev(a2, div55);
    			append_dev(div55, h63);
    			append_dev(div55, t81);
    			append_dev(div55, p7);
    			append_dev(div66, t83);
    			append_dev(div66, div59);
    			append_dev(div59, a3);
    			append_dev(a3, div57);
    			append_dev(div57, img19);
    			append_dev(a3, t84);
    			append_dev(a3, div58);
    			append_dev(div58, h64);
    			append_dev(div58, t86);
    			append_dev(div58, p8);
    			append_dev(div66, t88);
    			append_dev(div66, div62);
    			append_dev(div62, a4);
    			append_dev(a4, div60);
    			append_dev(div60, img20);
    			append_dev(a4, t89);
    			append_dev(a4, div61);
    			append_dev(div61, h65);
    			append_dev(div61, t91);
    			append_dev(div61, p9);
    			append_dev(div66, t93);
    			append_dev(div66, div65);
    			append_dev(div65, a5);
    			append_dev(a5, div63);
    			append_dev(div63, img21);
    			append_dev(a5, t94);
    			append_dev(a5, div64);
    			append_dev(div64, h66);
    			append_dev(div64, t96);
    			append_dev(div64, p10);
    			insert_dev(target, t98, anchor);
    			insert_dev(target, section4, anchor);
    			append_dev(section4, div76);
    			append_dev(div76, div75);
    			append_dev(div75, div69);
    			append_dev(div69, div68);
    			append_dev(div68, img22);
    			append_dev(div75, t99);
    			append_dev(div75, div72);
    			append_dev(div72, div71);
    			append_dev(div71, div70);
    			append_dev(div70, span3);
    			append_dev(div71, t101);
    			append_dev(div71, h41);
    			append_dev(div71, t103);
    			append_dev(div71, img23);
    			append_dev(div75, t104);
    			append_dev(div75, div74);
    			append_dev(div74, div73);
    			append_dev(div73, p11);
    			append_dev(div73, t106);
    			append_dev(div73, a6);
    			insert_dev(target, t108, anchor);
    			insert_dev(target, div106, anchor);
    			append_dev(div106, div105);
    			append_dev(div105, div78);
    			append_dev(div78, div77);
    			append_dev(div77, span4);
    			append_dev(div78, t110);
    			append_dev(div78, h22);
    			append_dev(div78, t112);
    			append_dev(div78, p12);
    			append_dev(div105, t114);
    			append_dev(div105, div104);
    			append_dev(div104, div103);
    			append_dev(div103, div84);
    			append_dev(div84, div83);
    			append_dev(div83, div79);
    			append_dev(div79, img24);
    			append_dev(div83, t115);
    			append_dev(div83, div82);
    			append_dev(div82, div80);
    			append_dev(div80, span5);
    			append_dev(div82, t117);
    			append_dev(div82, div81);
    			append_dev(div103, t119);
    			append_dev(div103, div90);
    			append_dev(div90, div89);
    			append_dev(div89, div85);
    			append_dev(div85, img25);
    			append_dev(div89, t120);
    			append_dev(div89, div88);
    			append_dev(div88, div86);
    			append_dev(div86, span6);
    			append_dev(div88, t122);
    			append_dev(div88, div87);
    			append_dev(div103, t124);
    			append_dev(div103, div96);
    			append_dev(div96, div95);
    			append_dev(div95, div91);
    			append_dev(div91, img26);
    			append_dev(div95, t125);
    			append_dev(div95, div94);
    			append_dev(div94, div92);
    			append_dev(div92, span7);
    			append_dev(div94, t127);
    			append_dev(div94, div93);
    			append_dev(div103, t129);
    			append_dev(div103, div102);
    			append_dev(div102, div101);
    			append_dev(div101, div97);
    			append_dev(div97, img27);
    			append_dev(div101, t130);
    			append_dev(div101, div100);
    			append_dev(div100, div98);
    			append_dev(div98, span8);
    			append_dev(div100, t132);
    			append_dev(div100, div99);
    			insert_dev(target, t134, anchor);
    			insert_dev(target, section5, anchor);
    			append_dev(section5, div129);
    			append_dev(div129, div111);
    			append_dev(div111, div108);
    			append_dev(div108, div107);
    			append_dev(div107, h42);
    			append_dev(div107, t136);
    			append_dev(div107, img28);
    			append_dev(div111, t137);
    			append_dev(div111, div110);
    			append_dev(div110, div109);
    			append_dev(div109, p13);
    			append_dev(div129, t139);
    			append_dev(div129, div128);
    			append_dev(div128, div115);
    			append_dev(div115, div114);
    			append_dev(div114, div112);
    			append_dev(div112, img29);
    			append_dev(div114, t140);
    			append_dev(div114, div113);
    			append_dev(div113, h43);
    			append_dev(h43, t141);
    			append_dev(h43, br0);
    			append_dev(h43, t142);
    			append_dev(div113, t143);
    			append_dev(div113, p14);
    			append_dev(div113, t145);
    			append_dev(div113, a7);
    			append_dev(a7, t146);
    			append_dev(a7, span9);
    			append_dev(span9, i0);
    			append_dev(div128, t147);
    			append_dev(div128, div119);
    			append_dev(div119, div118);
    			append_dev(div118, div116);
    			append_dev(div116, img30);
    			append_dev(div118, t148);
    			append_dev(div118, div117);
    			append_dev(div117, h44);
    			append_dev(h44, t149);
    			append_dev(h44, br1);
    			append_dev(h44, t150);
    			append_dev(div117, t151);
    			append_dev(div117, p15);
    			append_dev(div117, t153);
    			append_dev(div117, a8);
    			append_dev(a8, t154);
    			append_dev(a8, span10);
    			append_dev(span10, i1);
    			append_dev(div128, t155);
    			append_dev(div128, div123);
    			append_dev(div123, div122);
    			append_dev(div122, div120);
    			append_dev(div120, img31);
    			append_dev(div122, t156);
    			append_dev(div122, div121);
    			append_dev(div121, h45);
    			append_dev(h45, t157);
    			append_dev(h45, br2);
    			append_dev(h45, t158);
    			append_dev(div121, t159);
    			append_dev(div121, p16);
    			append_dev(div121, t161);
    			append_dev(div121, a9);
    			append_dev(a9, t162);
    			append_dev(a9, span11);
    			append_dev(span11, i2);
    			append_dev(div128, t163);
    			append_dev(div128, div127);
    			append_dev(div127, div126);
    			append_dev(div126, div124);
    			append_dev(div124, img32);
    			append_dev(div126, t164);
    			append_dev(div126, div125);
    			append_dev(div125, h46);
    			append_dev(h46, t165);
    			append_dev(h46, br3);
    			append_dev(h46, t166);
    			append_dev(div125, t167);
    			append_dev(div125, p17);
    			append_dev(div125, t169);
    			append_dev(div125, a10);
    			append_dev(a10, t170);
    			append_dev(a10, span12);
    			append_dev(span12, i3);
    			insert_dev(target, t171, anchor);
    			insert_dev(target, div137, anchor);
    			append_dev(div137, div136);
    			append_dev(div136, div131);
    			append_dev(div131, div130);
    			append_dev(div130, img33);
    			append_dev(div131, t172);
    			append_dev(div131, h23);
    			append_dev(div131, t174);
    			append_dev(div131, p18);
    			append_dev(div136, t176);
    			append_dev(div136, div135);
    			append_dev(div135, div132);
    			append_dev(div132, img34);
    			append_dev(div135, t177);
    			append_dev(div135, div134);
    			append_dev(div134, div133);
    			append_dev(div133, dl);
    			append_dev(dl, dt0);
    			append_dev(dl, dd0);
    			append_dev(dd0, p19);
    			append_dev(dd0, t180);
    			append_dev(dl, dt1);
    			append_dev(dl, dd1);
    			append_dev(dd1, p20);
    			append_dev(dd1, t183);
    			append_dev(dl, dt2);
    			append_dev(dl, dd2);
    			append_dev(dd2, p21);
    			append_dev(dd2, t186);
    			append_dev(dl, dt3);
    			append_dev(dl, dd3);
    			append_dev(dd3, p22);
    			insert_dev(target, t189, anchor);
    			insert_dev(target, section6, anchor);
    			append_dev(section6, div163);
    			append_dev(div163, div141);
    			append_dev(div141, div140);
    			append_dev(div140, div139);
    			append_dev(div139, div138);
    			append_dev(div138, img35);
    			append_dev(div139, t190);
    			append_dev(div139, h24);
    			append_dev(div139, t192);
    			append_dev(div139, p23);
    			append_dev(div163, t194);
    			append_dev(div163, div162);
    			append_dev(div162, div146);
    			append_dev(div146, div145);
    			append_dev(div145, div142);
    			append_dev(div142, img36);
    			append_dev(div145, t195);
    			append_dev(div145, div143);
    			append_dev(div143, h50);
    			append_dev(div143, t197);
    			append_dev(div143, p24);
    			append_dev(div145, t199);
    			append_dev(div145, div144);
    			append_dev(div144, a11);
    			append_dev(a11, i4);
    			append_dev(div162, t200);
    			append_dev(div162, div151);
    			append_dev(div151, div150);
    			append_dev(div150, div147);
    			append_dev(div147, img37);
    			append_dev(div150, t201);
    			append_dev(div150, div148);
    			append_dev(div148, h51);
    			append_dev(div148, t203);
    			append_dev(div148, p25);
    			append_dev(div150, t205);
    			append_dev(div150, div149);
    			append_dev(div149, a12);
    			append_dev(a12, i5);
    			append_dev(div162, t206);
    			append_dev(div162, div156);
    			append_dev(div156, div155);
    			append_dev(div155, div152);
    			append_dev(div152, img38);
    			append_dev(div155, t207);
    			append_dev(div155, div153);
    			append_dev(div153, h52);
    			append_dev(div153, t209);
    			append_dev(div153, p26);
    			append_dev(div155, t211);
    			append_dev(div155, div154);
    			append_dev(div154, a13);
    			append_dev(a13, i6);
    			append_dev(div162, t212);
    			append_dev(div162, div161);
    			append_dev(div161, div160);
    			append_dev(div160, div157);
    			append_dev(div157, img39);
    			append_dev(div160, t213);
    			append_dev(div160, div158);
    			append_dev(div158, h53);
    			append_dev(div158, t215);
    			append_dev(div158, p27);
    			append_dev(div160, t217);
    			append_dev(div160, div159);
    			append_dev(div159, a14);
    			append_dev(a14, i7);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(div21);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(div22);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(section1);
    			if (detaching) detach_dev(t48);
    			if (detaching) detach_dev(section2);
    			if (detaching) detach_dev(t73);
    			if (detaching) detach_dev(section3);
    			if (detaching) detach_dev(t98);
    			if (detaching) detach_dev(section4);
    			if (detaching) detach_dev(t108);
    			if (detaching) detach_dev(div106);
    			if (detaching) detach_dev(t134);
    			if (detaching) detach_dev(section5);
    			if (detaching) detach_dev(t171);
    			if (detaching) detach_dev(div137);
    			if (detaching) detach_dev(t189);
    			if (detaching) detach_dev(section6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Inicio', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Inicio> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Inicio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Inicio",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\routes\Precios.svelte generated by Svelte v3.59.2 */

    const file$4 = "src\\routes\\Precios.svelte";

    function create_fragment$5(ctx) {
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let nav;
    	let h20;
    	let t1;
    	let ol;
    	let li0;
    	let a0;
    	let t3;
    	let li1;
    	let t5;
    	let section0;
    	let div23;
    	let div6;
    	let div5;
    	let span;
    	let t7;
    	let h21;
    	let t9;
    	let p0;
    	let t11;
    	let div22;
    	let div11;
    	let div10;
    	let div7;
    	let h50;
    	let t13;
    	let h10;
    	let t15;
    	let div8;
    	let p1;
    	let t17;
    	let p2;
    	let t19;
    	let p3;
    	let t21;
    	let p4;
    	let t23;
    	let p5;
    	let t25;
    	let p6;
    	let t27;
    	let div9;
    	let a1;
    	let t29;
    	let div16;
    	let div15;
    	let div12;
    	let h51;
    	let t31;
    	let h11;
    	let t33;
    	let div13;
    	let p7;
    	let t35;
    	let p8;
    	let t37;
    	let p9;
    	let t39;
    	let p10;
    	let t41;
    	let p11;
    	let t43;
    	let p12;
    	let t45;
    	let div14;
    	let a2;
    	let t47;
    	let div21;
    	let div20;
    	let div17;
    	let h52;
    	let t49;
    	let h12;
    	let t51;
    	let div18;
    	let p13;
    	let t53;
    	let p14;
    	let t55;
    	let p15;
    	let t57;
    	let p16;
    	let t59;
    	let p17;
    	let t61;
    	let p18;
    	let t63;
    	let div19;
    	let a3;
    	let t65;
    	let section1;
    	let div49;
    	let div27;
    	let div26;
    	let div25;
    	let div24;
    	let img0;
    	let img0_src_value;
    	let t66;
    	let h22;
    	let t68;
    	let p19;
    	let t70;
    	let div48;
    	let div32;
    	let div31;
    	let div28;
    	let img1;
    	let img1_src_value;
    	let t71;
    	let div29;
    	let h53;
    	let t73;
    	let p20;
    	let t75;
    	let div30;
    	let a4;
    	let i0;
    	let t76;
    	let div37;
    	let div36;
    	let div33;
    	let img2;
    	let img2_src_value;
    	let t77;
    	let div34;
    	let h54;
    	let t79;
    	let p21;
    	let t81;
    	let div35;
    	let a5;
    	let i1;
    	let t82;
    	let div42;
    	let div41;
    	let div38;
    	let img3;
    	let img3_src_value;
    	let t83;
    	let div39;
    	let h55;
    	let t85;
    	let p22;
    	let t87;
    	let div40;
    	let a6;
    	let i2;
    	let t88;
    	let div47;
    	let div46;
    	let div43;
    	let img4;
    	let img4_src_value;
    	let t89;
    	let div44;
    	let h56;
    	let t91;
    	let p23;
    	let t93;
    	let div45;
    	let a7;
    	let i3;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			nav = element("nav");
    			h20 = element("h2");
    			h20.textContent = "Pricing";
    			t1 = space();
    			ol = element("ol");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Home";
    			t3 = space();
    			li1 = element("li");
    			li1.textContent = "Pricing";
    			t5 = space();
    			section0 = element("section");
    			div23 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			span = element("span");
    			span.textContent = "Pricing Plans";
    			t7 = space();
    			h21 = element("h2");
    			h21.textContent = "Our Pricing Plans";
    			t9 = space();
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis accumsan nisi Ut ut felis congue nisl hendrerit commodo.";
    			t11 = space();
    			div22 = element("div");
    			div11 = element("div");
    			div10 = element("div");
    			div7 = element("div");
    			h50 = element("h5");
    			h50.textContent = "Begginer";
    			t13 = space();
    			h10 = element("h1");
    			h10.textContent = "$219.99";
    			t15 = space();
    			div8 = element("div");
    			p1 = element("p");
    			p1.textContent = "lorem ipsum dolor";
    			t17 = space();
    			p2 = element("p");
    			p2.textContent = "Sed quis accumsan nisi";
    			t19 = space();
    			p3 = element("p");
    			p3.textContent = "Sed do eiusmod tempor";
    			t21 = space();
    			p4 = element("p");
    			p4.textContent = "felis congue nisl hendas";
    			t23 = space();
    			p5 = element("p");
    			p5.textContent = "Incididunt ut laboredolore";
    			t25 = space();
    			p6 = element("p");
    			p6.textContent = "24/7 Support Service";
    			t27 = space();
    			div9 = element("div");
    			a1 = element("a");
    			a1.textContent = "Start";
    			t29 = space();
    			div16 = element("div");
    			div15 = element("div");
    			div12 = element("div");
    			h51 = element("h5");
    			h51.textContent = "Business";
    			t31 = space();
    			h11 = element("h1");
    			h11.textContent = "$259.99";
    			t33 = space();
    			div13 = element("div");
    			p7 = element("p");
    			p7.textContent = "lorem ipsum dolor";
    			t35 = space();
    			p8 = element("p");
    			p8.textContent = "Sed quis accumsan nisi";
    			t37 = space();
    			p9 = element("p");
    			p9.textContent = "Sed do eiusmod tempor";
    			t39 = space();
    			p10 = element("p");
    			p10.textContent = "felis congue nisl hendas";
    			t41 = space();
    			p11 = element("p");
    			p11.textContent = "Incididunt ut laboredolore";
    			t43 = space();
    			p12 = element("p");
    			p12.textContent = "24/7 Support Service";
    			t45 = space();
    			div14 = element("div");
    			a2 = element("a");
    			a2.textContent = "Start";
    			t47 = space();
    			div21 = element("div");
    			div20 = element("div");
    			div17 = element("div");
    			h52 = element("h5");
    			h52.textContent = "professional";
    			t49 = space();
    			h12 = element("h1");
    			h12.textContent = "$299.99";
    			t51 = space();
    			div18 = element("div");
    			p13 = element("p");
    			p13.textContent = "lorem ipsum dolor";
    			t53 = space();
    			p14 = element("p");
    			p14.textContent = "Sed quis accumsan nisi";
    			t55 = space();
    			p15 = element("p");
    			p15.textContent = "Sed do eiusmod tempor";
    			t57 = space();
    			p16 = element("p");
    			p16.textContent = "felis congue nisl hendas";
    			t59 = space();
    			p17 = element("p");
    			p17.textContent = "Incididunt ut laboredolore";
    			t61 = space();
    			p18 = element("p");
    			p18.textContent = "24/7 Support Service";
    			t63 = space();
    			div19 = element("div");
    			a3 = element("a");
    			a3.textContent = "Start";
    			t65 = space();
    			section1 = element("section");
    			div49 = element("div");
    			div27 = element("div");
    			div26 = element("div");
    			div25 = element("div");
    			div24 = element("div");
    			img0 = element("img");
    			t66 = space();
    			h22 = element("h2");
    			h22.textContent = "Awesome Team";
    			t68 = space();
    			p19 = element("p");
    			p19.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis accumsan nisi Ut ut felis congue nisl hendrerit commodo.";
    			t70 = space();
    			div48 = element("div");
    			div32 = element("div");
    			div31 = element("div");
    			div28 = element("div");
    			img1 = element("img");
    			t71 = space();
    			div29 = element("div");
    			h53 = element("h5");
    			h53.textContent = "Joman Helal";
    			t73 = space();
    			p20 = element("p");
    			p20.textContent = "Executive Officer";
    			t75 = space();
    			div30 = element("div");
    			a4 = element("a");
    			i0 = element("i");
    			t76 = space();
    			div37 = element("div");
    			div36 = element("div");
    			div33 = element("div");
    			img2 = element("img");
    			t77 = space();
    			div34 = element("div");
    			h54 = element("h5");
    			h54.textContent = "Slans Alons";
    			t79 = space();
    			p21 = element("p");
    			p21.textContent = "Business Development";
    			t81 = space();
    			div35 = element("div");
    			a5 = element("a");
    			i1 = element("i");
    			t82 = space();
    			div42 = element("div");
    			div41 = element("div");
    			div38 = element("div");
    			img3 = element("img");
    			t83 = space();
    			div39 = element("div");
    			h55 = element("h5");
    			h55.textContent = "Josha Michal";
    			t85 = space();
    			p22 = element("p");
    			p22.textContent = "UX/UI Designer";
    			t87 = space();
    			div40 = element("div");
    			a6 = element("a");
    			i2 = element("i");
    			t88 = space();
    			div47 = element("div");
    			div46 = element("div");
    			div43 = element("div");
    			img4 = element("img");
    			t89 = space();
    			div44 = element("div");
    			h56 = element("h5");
    			h56.textContent = "Johan Wright";
    			t91 = space();
    			p23 = element("p");
    			p23.textContent = "Head of Marketing";
    			t93 = space();
    			div45 = element("div");
    			a7 = element("a");
    			i3 = element("i");
    			attr_dev(h20, "class", "w-text title wow fadeInUp");
    			attr_dev(h20, "data-wow-delay", "0.2s");
    			add_location(h20, file$4, 8, 28, 407);
    			attr_dev(a0, "href", "#top");
    			add_location(a0, file$4, 10, 60, 650);
    			attr_dev(li0, "class", "breadcrumb-item");
    			add_location(li0, file$4, 10, 32, 622);
    			attr_dev(li1, "class", "breadcrumb-item active");
    			attr_dev(li1, "aria-current", "page");
    			add_location(li1, file$4, 11, 32, 711);
    			attr_dev(ol, "class", "breadcrumb justify-content-center wow fadeInUp");
    			attr_dev(ol, "data-wow-delay", "0.4s");
    			add_location(ol, file$4, 9, 28, 508);
    			attr_dev(nav, "aria-label", "breadcrumb");
    			attr_dev(nav, "class", "breadcumb--con text-center");
    			add_location(nav, file$4, 7, 24, 314);
    			attr_dev(div0, "class", "col-12");
    			add_location(div0, file$4, 6, 20, 269);
    			attr_dev(div1, "class", "row h-100 align-items-center");
    			add_location(div1, file$4, 5, 16, 206);
    			attr_dev(div2, "class", "container h-100");
    			add_location(div2, file$4, 4, 12, 160);
    			attr_dev(div3, "class", "breadcumb-content");
    			add_location(div3, file$4, 3, 8, 116);
    			attr_dev(div4, "class", "breadcumb-area");
    			add_location(div4, file$4, 1, 4, 44);
    			attr_dev(span, "class", "gradient-text blue");
    			add_location(span, file$4, 27, 20, 1284);
    			attr_dev(div5, "class", "mb-15 justify-content-center fadeInUp");
    			attr_dev(div5, "data-wow-delay", "0.2s");
    			add_location(div5, file$4, 26, 16, 1190);
    			attr_dev(h21, "class", "d-blue bold fadeInUp");
    			attr_dev(h21, "data-wow-delay", "0.3s");
    			add_location(h21, file$4, 29, 16, 1377);
    			attr_dev(p0, "class", "fadeInUp");
    			attr_dev(p0, "data-wow-delay", "0.4s");
    			add_location(p0, file$4, 30, 16, 1471);
    			attr_dev(div6, "class", "section-heading text-center");
    			add_location(div6, file$4, 25, 12, 1132);
    			attr_dev(h50, "class", "gradient-text cyan");
    			add_location(h50, file$4, 37, 28, 1983);
    			add_location(h10, file$4, 38, 28, 2056);
    			attr_dev(div7, "class", "price_table_text");
    			add_location(div7, file$4, 36, 24, 1924);
    			add_location(p1, file$4, 41, 28, 2189);
    			add_location(p2, file$4, 42, 28, 2242);
    			add_location(p3, file$4, 43, 28, 2300);
    			add_location(p4, file$4, 44, 28, 2357);
    			add_location(p5, file$4, 45, 28, 2418);
    			add_location(p6, file$4, 46, 28, 2480);
    			attr_dev(div8, "class", "table_text_details");
    			add_location(div8, file$4, 40, 24, 2128);
    			attr_dev(a1, "href", "#top");
    			attr_dev(a1, "class", "btn more-btn mt-15");
    			add_location(a1, file$4, 49, 28, 2615);
    			attr_dev(div9, "class", "table_btn");
    			add_location(div9, file$4, 48, 24, 2563);
    			attr_dev(div10, "class", "single_price_table_content grediant-borders text-center wow fadeInUp");
    			attr_dev(div10, "data-wow-delay", "0.2s");
    			add_location(div10, file$4, 35, 20, 1795);
    			attr_dev(div11, "class", "col-lg-4 col-md-6");
    			add_location(div11, file$4, 34, 16, 1743);
    			attr_dev(h51, "class", "gradient-text blue");
    			add_location(h51, file$4, 57, 28, 3047);
    			attr_dev(h11, "class", "d-blue");
    			add_location(h11, file$4, 58, 28, 3120);
    			attr_dev(div12, "class", "price_table_text differ");
    			add_location(div12, file$4, 56, 24, 2981);
    			add_location(p7, file$4, 61, 28, 3268);
    			add_location(p8, file$4, 62, 28, 3321);
    			add_location(p9, file$4, 63, 28, 3379);
    			add_location(p10, file$4, 64, 28, 3436);
    			add_location(p11, file$4, 65, 28, 3497);
    			add_location(p12, file$4, 66, 28, 3559);
    			attr_dev(div13, "class", "table_text_details");
    			add_location(div13, file$4, 60, 24, 3207);
    			attr_dev(a2, "href", "#top");
    			attr_dev(a2, "class", "btn more-btn mt-15");
    			add_location(a2, file$4, 69, 28, 3694);
    			attr_dev(div14, "class", "table_btn");
    			add_location(div14, file$4, 68, 24, 3642);
    			attr_dev(div15, "class", "single_price_table_content grediant-borders text-center wow fadeIn");
    			attr_dev(div15, "data-wow-delay", "0.3s");
    			add_location(div15, file$4, 55, 20, 2854);
    			attr_dev(div16, "class", "col-lg-4 col-md-6");
    			add_location(div16, file$4, 54, 16, 2802);
    			attr_dev(h52, "class", "gradient-text cyan");
    			add_location(h52, file$4, 77, 28, 4121);
    			add_location(h12, file$4, 78, 28, 4198);
    			attr_dev(div17, "class", "price_table_text");
    			add_location(div17, file$4, 76, 24, 4062);
    			add_location(p13, file$4, 81, 28, 4331);
    			add_location(p14, file$4, 82, 28, 4384);
    			add_location(p15, file$4, 83, 28, 4442);
    			add_location(p16, file$4, 84, 28, 4499);
    			add_location(p17, file$4, 85, 28, 4560);
    			add_location(p18, file$4, 86, 28, 4622);
    			attr_dev(div18, "class", "table_text_details");
    			add_location(div18, file$4, 80, 24, 4270);
    			attr_dev(a3, "href", "#top");
    			attr_dev(a3, "class", "btn more-btn mt-15");
    			add_location(a3, file$4, 89, 28, 4757);
    			attr_dev(div19, "class", "table_btn");
    			add_location(div19, file$4, 88, 24, 4705);
    			attr_dev(div20, "class", "single_price_table_content grediant-borders text-center wow fadeInUp");
    			attr_dev(div20, "data-wow-delay", "0.4s");
    			add_location(div20, file$4, 75, 20, 3933);
    			attr_dev(div21, "class", "col-lg-4 col-md-6");
    			add_location(div21, file$4, 74, 16, 3881);
    			attr_dev(div22, "class", "row");
    			add_location(div22, file$4, 32, 12, 1671);
    			attr_dev(div23, "class", "container");
    			add_location(div23, file$4, 24, 8, 1096);
    			attr_dev(section0, "class", "pricing section-padding-100-70");
    			add_location(section0, file$4, 22, 4, 1030);
    			if (!src_url_equal(img0.src, img0_src_value = "img/svg/divider-01.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "width", "100");
    			attr_dev(img0, "class", "mb-15");
    			attr_dev(img0, "alt", "divider");
    			add_location(img0, file$4, 107, 28, 5429);
    			attr_dev(div24, "class", "dream-dots justify-content-center fadeInUp");
    			attr_dev(div24, "data-wow-delay", "0.2s");
    			add_location(div24, file$4, 106, 24, 5322);
    			attr_dev(h22, "class", "fadeInUp");
    			attr_dev(h22, "data-wow-delay", "0.3s");
    			add_location(h22, file$4, 109, 24, 5559);
    			attr_dev(p19, "class", "fadeInUp");
    			attr_dev(p19, "data-wow-delay", "0.4s");
    			add_location(p19, file$4, 110, 24, 5644);
    			attr_dev(div25, "class", "section-heading text-center");
    			add_location(div25, file$4, 104, 20, 5231);
    			attr_dev(div26, "class", "col-12");
    			add_location(div26, file$4, 103, 16, 5190);
    			attr_dev(div27, "class", "row");
    			add_location(div27, file$4, 102, 12, 5156);
    			attr_dev(img1, "draggable", "false");
    			if (!src_url_equal(img1.src, img1_src_value = "img/team-img/avatar-1.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "center-block");
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$4, 121, 28, 6220);
    			attr_dev(div28, "class", "team-member-thumb");
    			add_location(div28, file$4, 120, 24, 6160);
    			attr_dev(h53, "class", "w-text");
    			add_location(h53, file$4, 125, 28, 6454);
    			attr_dev(p20, "class", "g-text");
    			add_location(p20, file$4, 126, 28, 6518);
    			attr_dev(div29, "class", "team-info");
    			add_location(div29, file$4, 124, 24, 6402);
    			attr_dev(i0, "class", "fa fa-linkedin");
    			add_location(i0, file$4, 130, 43, 6732);
    			attr_dev(a4, "href", "#top");
    			add_location(a4, file$4, 130, 28, 6717);
    			attr_dev(div30, "class", "team-social-icon");
    			add_location(div30, file$4, 129, 24, 6658);
    			attr_dev(div31, "class", "single-team-member fadeInUp");
    			attr_dev(div31, "data-wow-delay", "0.2s");
    			add_location(div31, file$4, 118, 20, 6033);
    			attr_dev(div32, "class", "col-12 col-sm-6 col-lg-3");
    			add_location(div32, file$4, 117, 16, 5974);
    			attr_dev(img2, "draggable", "false");
    			if (!src_url_equal(img2.src, img2_src_value = "img/team-img/avatar-2.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "center-block");
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$4, 140, 28, 7155);
    			attr_dev(div33, "class", "team-member-thumb");
    			add_location(div33, file$4, 139, 24, 7095);
    			attr_dev(h54, "class", "w-text");
    			add_location(h54, file$4, 144, 28, 7389);
    			attr_dev(p21, "class", "g-text");
    			add_location(p21, file$4, 145, 28, 7453);
    			attr_dev(div34, "class", "team-info");
    			add_location(div34, file$4, 143, 24, 7337);
    			attr_dev(i1, "class", "fa fa-linkedin");
    			add_location(i1, file$4, 149, 43, 7670);
    			attr_dev(a5, "href", "#top");
    			add_location(a5, file$4, 149, 28, 7655);
    			attr_dev(div35, "class", "team-social-icon");
    			add_location(div35, file$4, 148, 24, 7596);
    			attr_dev(div36, "class", "single-team-member fadeInUp");
    			attr_dev(div36, "data-wow-delay", "0.3s");
    			add_location(div36, file$4, 137, 20, 6968);
    			attr_dev(div37, "class", "col-12 col-sm-6 col-lg-3");
    			add_location(div37, file$4, 136, 16, 6909);
    			attr_dev(img3, "draggable", "false");
    			if (!src_url_equal(img3.src, img3_src_value = "img/team-img/avatar-3.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "class", "center-block");
    			attr_dev(img3, "alt", "");
    			add_location(img3, file$4, 159, 28, 8093);
    			attr_dev(div38, "class", "team-member-thumb");
    			add_location(div38, file$4, 158, 24, 8033);
    			attr_dev(h55, "class", "w-text");
    			add_location(h55, file$4, 163, 28, 8327);
    			attr_dev(p22, "class", "g-text");
    			add_location(p22, file$4, 164, 28, 8392);
    			attr_dev(div39, "class", "team-info");
    			add_location(div39, file$4, 162, 24, 8275);
    			attr_dev(i2, "class", "fa fa-linkedin");
    			add_location(i2, file$4, 168, 43, 8603);
    			attr_dev(a6, "href", "#top");
    			add_location(a6, file$4, 168, 28, 8588);
    			attr_dev(div40, "class", "team-social-icon");
    			add_location(div40, file$4, 167, 24, 8529);
    			attr_dev(div41, "class", "single-team-member fadeInUp");
    			attr_dev(div41, "data-wow-delay", "0.4s");
    			add_location(div41, file$4, 156, 20, 7906);
    			attr_dev(div42, "class", "col-12 col-sm-6 col-lg-3");
    			add_location(div42, file$4, 155, 16, 7847);
    			attr_dev(img4, "draggable", "false");
    			if (!src_url_equal(img4.src, img4_src_value = "img/team-img/avatar-4.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "class", "center-block");
    			attr_dev(img4, "alt", "");
    			add_location(img4, file$4, 178, 28, 9026);
    			attr_dev(div43, "class", "team-member-thumb");
    			add_location(div43, file$4, 177, 24, 8966);
    			attr_dev(h56, "class", "w-text");
    			add_location(h56, file$4, 182, 28, 9260);
    			attr_dev(p23, "class", "g-text");
    			add_location(p23, file$4, 183, 28, 9325);
    			attr_dev(div44, "class", "team-info");
    			add_location(div44, file$4, 181, 24, 9208);
    			attr_dev(i3, "class", "fa fa-linkedin");
    			add_location(i3, file$4, 187, 43, 9532);
    			attr_dev(a7, "href", "#top");
    			add_location(a7, file$4, 187, 28, 9517);
    			attr_dev(div45, "class", "team-social-icon");
    			add_location(div45, file$4, 186, 24, 9458);
    			attr_dev(div46, "class", "single-team-member fadeInUp");
    			attr_dev(div46, "data-wow-delay", "0.5s");
    			add_location(div46, file$4, 175, 20, 8839);
    			attr_dev(div47, "class", "col-12 col-sm-6 col-lg-3");
    			add_location(div47, file$4, 174, 16, 8780);
    			attr_dev(div48, "class", "row");
    			add_location(div48, file$4, 115, 12, 5896);
    			attr_dev(div49, "class", "container");
    			add_location(div49, file$4, 101, 8, 5120);
    			attr_dev(section1, "class", "our_team_area section-padding-0-70 clearfix");
    			attr_dev(section1, "id", "team");
    			add_location(section1, file$4, 100, 4, 5040);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, nav);
    			append_dev(nav, h20);
    			append_dev(nav, t1);
    			append_dev(nav, ol);
    			append_dev(ol, li0);
    			append_dev(li0, a0);
    			append_dev(ol, t3);
    			append_dev(ol, li1);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, section0, anchor);
    			append_dev(section0, div23);
    			append_dev(div23, div6);
    			append_dev(div6, div5);
    			append_dev(div5, span);
    			append_dev(div6, t7);
    			append_dev(div6, h21);
    			append_dev(div6, t9);
    			append_dev(div6, p0);
    			append_dev(div23, t11);
    			append_dev(div23, div22);
    			append_dev(div22, div11);
    			append_dev(div11, div10);
    			append_dev(div10, div7);
    			append_dev(div7, h50);
    			append_dev(div7, t13);
    			append_dev(div7, h10);
    			append_dev(div10, t15);
    			append_dev(div10, div8);
    			append_dev(div8, p1);
    			append_dev(div8, t17);
    			append_dev(div8, p2);
    			append_dev(div8, t19);
    			append_dev(div8, p3);
    			append_dev(div8, t21);
    			append_dev(div8, p4);
    			append_dev(div8, t23);
    			append_dev(div8, p5);
    			append_dev(div8, t25);
    			append_dev(div8, p6);
    			append_dev(div10, t27);
    			append_dev(div10, div9);
    			append_dev(div9, a1);
    			append_dev(div22, t29);
    			append_dev(div22, div16);
    			append_dev(div16, div15);
    			append_dev(div15, div12);
    			append_dev(div12, h51);
    			append_dev(div12, t31);
    			append_dev(div12, h11);
    			append_dev(div15, t33);
    			append_dev(div15, div13);
    			append_dev(div13, p7);
    			append_dev(div13, t35);
    			append_dev(div13, p8);
    			append_dev(div13, t37);
    			append_dev(div13, p9);
    			append_dev(div13, t39);
    			append_dev(div13, p10);
    			append_dev(div13, t41);
    			append_dev(div13, p11);
    			append_dev(div13, t43);
    			append_dev(div13, p12);
    			append_dev(div15, t45);
    			append_dev(div15, div14);
    			append_dev(div14, a2);
    			append_dev(div22, t47);
    			append_dev(div22, div21);
    			append_dev(div21, div20);
    			append_dev(div20, div17);
    			append_dev(div17, h52);
    			append_dev(div17, t49);
    			append_dev(div17, h12);
    			append_dev(div20, t51);
    			append_dev(div20, div18);
    			append_dev(div18, p13);
    			append_dev(div18, t53);
    			append_dev(div18, p14);
    			append_dev(div18, t55);
    			append_dev(div18, p15);
    			append_dev(div18, t57);
    			append_dev(div18, p16);
    			append_dev(div18, t59);
    			append_dev(div18, p17);
    			append_dev(div18, t61);
    			append_dev(div18, p18);
    			append_dev(div20, t63);
    			append_dev(div20, div19);
    			append_dev(div19, a3);
    			insert_dev(target, t65, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div49);
    			append_dev(div49, div27);
    			append_dev(div27, div26);
    			append_dev(div26, div25);
    			append_dev(div25, div24);
    			append_dev(div24, img0);
    			append_dev(div25, t66);
    			append_dev(div25, h22);
    			append_dev(div25, t68);
    			append_dev(div25, p19);
    			append_dev(div49, t70);
    			append_dev(div49, div48);
    			append_dev(div48, div32);
    			append_dev(div32, div31);
    			append_dev(div31, div28);
    			append_dev(div28, img1);
    			append_dev(div31, t71);
    			append_dev(div31, div29);
    			append_dev(div29, h53);
    			append_dev(div29, t73);
    			append_dev(div29, p20);
    			append_dev(div31, t75);
    			append_dev(div31, div30);
    			append_dev(div30, a4);
    			append_dev(a4, i0);
    			append_dev(div48, t76);
    			append_dev(div48, div37);
    			append_dev(div37, div36);
    			append_dev(div36, div33);
    			append_dev(div33, img2);
    			append_dev(div36, t77);
    			append_dev(div36, div34);
    			append_dev(div34, h54);
    			append_dev(div34, t79);
    			append_dev(div34, p21);
    			append_dev(div36, t81);
    			append_dev(div36, div35);
    			append_dev(div35, a5);
    			append_dev(a5, i1);
    			append_dev(div48, t82);
    			append_dev(div48, div42);
    			append_dev(div42, div41);
    			append_dev(div41, div38);
    			append_dev(div38, img3);
    			append_dev(div41, t83);
    			append_dev(div41, div39);
    			append_dev(div39, h55);
    			append_dev(div39, t85);
    			append_dev(div39, p22);
    			append_dev(div41, t87);
    			append_dev(div41, div40);
    			append_dev(div40, a6);
    			append_dev(a6, i2);
    			append_dev(div48, t88);
    			append_dev(div48, div47);
    			append_dev(div47, div46);
    			append_dev(div46, div43);
    			append_dev(div43, img4);
    			append_dev(div46, t89);
    			append_dev(div46, div44);
    			append_dev(div44, h56);
    			append_dev(div44, t91);
    			append_dev(div44, p23);
    			append_dev(div46, t93);
    			append_dev(div46, div45);
    			append_dev(div45, a7);
    			append_dev(a7, i3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t65);
    			if (detaching) detach_dev(section1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Precios', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Precios> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Precios extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Precios",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\routes\Servicios.svelte generated by Svelte v3.59.2 */

    const file$3 = "src\\routes\\Servicios.svelte";

    function create_fragment$4(ctx) {
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let nav;
    	let h20;
    	let t1;
    	let ol;
    	let li0;
    	let a0;
    	let t3;
    	let li1;
    	let t5;
    	let section0;
    	let div20;
    	let div6;
    	let div5;
    	let img0;
    	let img0_src_value;
    	let t6;
    	let h21;
    	let t8;
    	let p0;
    	let t10;
    	let div19;
    	let div9;
    	let a1;
    	let div7;
    	let img1;
    	let img1_src_value;
    	let t11;
    	let div8;
    	let h60;
    	let t13;
    	let p1;
    	let t15;
    	let div12;
    	let a2;
    	let div10;
    	let img2;
    	let img2_src_value;
    	let t16;
    	let div11;
    	let h61;
    	let t18;
    	let p2;
    	let t20;
    	let div15;
    	let a3;
    	let div13;
    	let img3;
    	let img3_src_value;
    	let t21;
    	let div14;
    	let h62;
    	let t23;
    	let p3;
    	let t25;
    	let div18;
    	let a4;
    	let div16;
    	let img4;
    	let img4_src_value;
    	let t26;
    	let div17;
    	let h63;
    	let t28;
    	let p4;
    	let t30;
    	let div50;
    	let div49;
    	let div22;
    	let div21;
    	let span0;
    	let t32;
    	let h22;
    	let t34;
    	let p5;
    	let t36;
    	let div48;
    	let div47;
    	let div28;
    	let div27;
    	let div23;
    	let img5;
    	let img5_src_value;
    	let t37;
    	let div26;
    	let div24;
    	let span1;
    	let t39;
    	let div25;
    	let t41;
    	let div34;
    	let div33;
    	let div29;
    	let img6;
    	let img6_src_value;
    	let t42;
    	let div32;
    	let div30;
    	let span2;
    	let t44;
    	let div31;
    	let t46;
    	let div40;
    	let div39;
    	let div35;
    	let img7;
    	let img7_src_value;
    	let t47;
    	let div38;
    	let div36;
    	let span3;
    	let t49;
    	let div37;
    	let t51;
    	let div46;
    	let div45;
    	let div41;
    	let img8;
    	let img8_src_value;
    	let t52;
    	let div44;
    	let div42;
    	let span4;
    	let t54;
    	let div43;
    	let t56;
    	let section1;
    	let div63;
    	let div52;
    	let div51;
    	let img9;
    	let img9_src_value;
    	let t57;
    	let h23;
    	let t59;
    	let p6;
    	let t61;
    	let div62;
    	let div55;
    	let div54;
    	let div53;
    	let img10;
    	let img10_src_value;
    	let t62;
    	let span5;
    	let t64;
    	let h64;
    	let t66;
    	let p7;
    	let t68;
    	let div58;
    	let div57;
    	let div56;
    	let img11;
    	let img11_src_value;
    	let t69;
    	let span6;
    	let t71;
    	let h65;
    	let t73;
    	let p8;
    	let t75;
    	let div61;
    	let div60;
    	let div59;
    	let img12;
    	let img12_src_value;
    	let t76;
    	let span7;
    	let t78;
    	let h66;
    	let t80;
    	let p9;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			nav = element("nav");
    			h20 = element("h2");
    			h20.textContent = "Services";
    			t1 = space();
    			ol = element("ol");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Home";
    			t3 = space();
    			li1 = element("li");
    			li1.textContent = "Services";
    			t5 = space();
    			section0 = element("section");
    			div20 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			img0 = element("img");
    			t6 = space();
    			h21 = element("h2");
    			h21.textContent = "Our Company Services";
    			t8 = space();
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis accumsan nisi Ut ut felis congue nisl hendrerit commodo.";
    			t10 = space();
    			div19 = element("div");
    			div9 = element("div");
    			a1 = element("a");
    			div7 = element("div");
    			img1 = element("img");
    			t11 = space();
    			div8 = element("div");
    			h60 = element("h6");
    			h60.textContent = "Hacking & Security Solutions";
    			t13 = space();
    			p1 = element("p");
    			p1.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla neque quam, max imus ut accumsan ut, posuere sit.";
    			t15 = space();
    			div12 = element("div");
    			a2 = element("a");
    			div10 = element("div");
    			img2 = element("img");
    			t16 = space();
    			div11 = element("div");
    			h61 = element("h6");
    			h61.textContent = "IT Deployment and Migration";
    			t18 = space();
    			p2 = element("p");
    			p2.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla neque quam, max imus ut accumsan ut, posuere sit.";
    			t20 = space();
    			div15 = element("div");
    			a3 = element("a");
    			div13 = element("div");
    			img3 = element("img");
    			t21 = space();
    			div14 = element("div");
    			h62 = element("h6");
    			h62.textContent = "Managed Web Application";
    			t23 = space();
    			p3 = element("p");
    			p3.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla neque quam, max imus ut accumsan ut, posuere sit.";
    			t25 = space();
    			div18 = element("div");
    			a4 = element("a");
    			div16 = element("div");
    			img4 = element("img");
    			t26 = space();
    			div17 = element("div");
    			h63 = element("h6");
    			h63.textContent = "IT & Cloud Managment";
    			t28 = space();
    			p4 = element("p");
    			p4.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla neque quam, max imus ut accumsan ut, posuere sit.";
    			t30 = space();
    			div50 = element("div");
    			div49 = element("div");
    			div22 = element("div");
    			div21 = element("div");
    			span0 = element("span");
    			span0.textContent = "Numbers Are Talking";
    			t32 = space();
    			h22 = element("h2");
    			h22.textContent = "Our Agency Facts";
    			t34 = space();
    			p5 = element("p");
    			p5.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis accumsan nisi Ut ut felis congue nisl hendrerit commodo.";
    			t36 = space();
    			div48 = element("div");
    			div47 = element("div");
    			div28 = element("div");
    			div27 = element("div");
    			div23 = element("div");
    			img5 = element("img");
    			t37 = space();
    			div26 = element("div");
    			div24 = element("div");
    			span1 = element("span");
    			span1.textContent = "327";
    			t39 = space();
    			div25 = element("div");
    			div25.textContent = "Happy Clients";
    			t41 = space();
    			div34 = element("div");
    			div33 = element("div");
    			div29 = element("div");
    			img6 = element("img");
    			t42 = space();
    			div32 = element("div");
    			div30 = element("div");
    			span2 = element("span");
    			span2.textContent = "3041";
    			t44 = space();
    			div31 = element("div");
    			div31.textContent = "Projects Taken";
    			t46 = space();
    			div40 = element("div");
    			div39 = element("div");
    			div35 = element("div");
    			img7 = element("img");
    			t47 = space();
    			div38 = element("div");
    			div36 = element("div");
    			span3 = element("span");
    			span3.textContent = "23";
    			t49 = space();
    			div37 = element("div");
    			div37.textContent = "Awards Won";
    			t51 = space();
    			div46 = element("div");
    			div45 = element("div");
    			div41 = element("div");
    			img8 = element("img");
    			t52 = space();
    			div44 = element("div");
    			div42 = element("div");
    			span4 = element("span");
    			span4.textContent = "940";
    			t54 = space();
    			div43 = element("div");
    			div43.textContent = "Secured Devices";
    			t56 = space();
    			section1 = element("section");
    			div63 = element("div");
    			div52 = element("div");
    			div51 = element("div");
    			img9 = element("img");
    			t57 = space();
    			h23 = element("h2");
    			h23.textContent = "How it works";
    			t59 = space();
    			p6 = element("p");
    			p6.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis accumsan nisi Ut ut felis congue nisl hendrerit commodo.";
    			t61 = space();
    			div62 = element("div");
    			div55 = element("div");
    			div54 = element("div");
    			div53 = element("div");
    			img10 = element("img");
    			t62 = space();
    			span5 = element("span");
    			span5.textContent = "1";
    			t64 = space();
    			h64 = element("h6");
    			h64.textContent = "Add Your Security Problem";
    			t66 = space();
    			p7 = element("p");
    			p7.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla neque quam, max imus ut accumsan ut, posuere sit.";
    			t68 = space();
    			div58 = element("div");
    			div57 = element("div");
    			div56 = element("div");
    			img11 = element("img");
    			t69 = space();
    			span6 = element("span");
    			span6.textContent = "2";
    			t71 = space();
    			h65 = element("h6");
    			h65.textContent = "Choose Security Package";
    			t73 = space();
    			p8 = element("p");
    			p8.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla neque quam, max imus ut accumsan ut, posuere sit.";
    			t75 = space();
    			div61 = element("div");
    			div60 = element("div");
    			div59 = element("div");
    			img12 = element("img");
    			t76 = space();
    			span7 = element("span");
    			span7.textContent = "3";
    			t78 = space();
    			h66 = element("h6");
    			h66.textContent = "Prepare For Security Test";
    			t80 = space();
    			p9 = element("p");
    			p9.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla neque quam, max imus ut accumsan ut, posuere sit.";
    			attr_dev(h20, "class", "w-text title wow fadeInUp");
    			attr_dev(h20, "data-wow-delay", "0.2s");
    			add_location(h20, file$3, 9, 28, 417);
    			attr_dev(a0, "href", "#top");
    			add_location(a0, file$3, 11, 60, 661);
    			attr_dev(li0, "class", "breadcrumb-item");
    			add_location(li0, file$3, 11, 32, 633);
    			attr_dev(li1, "class", "breadcrumb-item active");
    			attr_dev(li1, "aria-current", "page");
    			add_location(li1, file$3, 12, 32, 722);
    			attr_dev(ol, "class", "breadcrumb justify-content-center wow fadeInUp");
    			attr_dev(ol, "data-wow-delay", "0.4s");
    			add_location(ol, file$3, 10, 28, 519);
    			attr_dev(nav, "aria-label", "breadcrumb");
    			attr_dev(nav, "class", "breadcumb--con text-center");
    			add_location(nav, file$3, 8, 24, 324);
    			attr_dev(div0, "class", "col-12");
    			add_location(div0, file$3, 7, 20, 279);
    			attr_dev(div1, "class", "row h-100 align-items-center");
    			add_location(div1, file$3, 6, 16, 216);
    			attr_dev(div2, "class", "container h-100");
    			add_location(div2, file$3, 5, 12, 170);
    			attr_dev(div3, "class", "breadcumb-content");
    			add_location(div3, file$3, 4, 8, 126);
    			attr_dev(div4, "class", "breadcumb-area");
    			add_location(div4, file$3, 1, 4, 45);
    			if (!src_url_equal(img0.src, img0_src_value = "img/svg/divider-01.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "width", "100");
    			attr_dev(img0, "class", "mb-15");
    			attr_dev(img0, "alt", "divider");
    			add_location(img0, file$3, 28, 20, 1280);
    			attr_dev(div5, "class", "dream-dots justify-content-center wow fadeInUp");
    			attr_dev(div5, "data-wow-delay", "0.2s");
    			add_location(div5, file$3, 27, 16, 1177);
    			attr_dev(h21, "class", "wow fadeInUp");
    			attr_dev(h21, "data-wow-delay", "0.3s");
    			add_location(h21, file$3, 30, 16, 1394);
    			attr_dev(p0, "class", "wow fadeInUp");
    			attr_dev(p0, "data-wow-delay", "0.4s");
    			set_style(p0, "visibility", "visible");
    			set_style(p0, "animation-delay", "0.4s");
    			set_style(p0, "animation-name", "fadeInUp");
    			add_location(p0, file$3, 31, 16, 1483);
    			attr_dev(div6, "class", "section-heading text-center");
    			add_location(div6, file$3, 25, 12, 1102);
    			attr_dev(img1, "draggable", "false");
    			if (!src_url_equal(img1.src, img1_src_value = "img/icons/1.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "white-icon");
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$3, 39, 28, 2144);
    			attr_dev(div7, "class", "service_icon v2");
    			add_location(div7, file$3, 38, 24, 2086);
    			add_location(h60, file$3, 42, 28, 2329);
    			add_location(p1, file$3, 43, 28, 2395);
    			attr_dev(div8, "class", "service_content");
    			add_location(div8, file$3, 41, 24, 2271);
    			attr_dev(a1, "href", "services.html");
    			attr_dev(a1, "class", "service_single_content grediant-borders box-shadow text-left wow fadeInUp");
    			attr_dev(a1, "data-wow-delay", "0.2s");
    			add_location(a1, file$3, 36, 20, 1895);
    			attr_dev(div9, "class", "col-12 col-md-6 col-lg-6");
    			add_location(div9, file$3, 34, 16, 1799);
    			attr_dev(img2, "draggable", "false");
    			if (!src_url_equal(img2.src, img2_src_value = "img/icons/2.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "white-icon");
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$3, 52, 28, 2959);
    			attr_dev(div10, "class", "service_icon v2");
    			add_location(div10, file$3, 51, 24, 2901);
    			add_location(h61, file$3, 55, 28, 3144);
    			add_location(p2, file$3, 56, 28, 3209);
    			attr_dev(div11, "class", "service_content");
    			add_location(div11, file$3, 54, 24, 3086);
    			attr_dev(a2, "href", "services.html");
    			attr_dev(a2, "class", "service_single_content grediant-borders box-shadow text-left wow wow fadeInUp");
    			attr_dev(a2, "data-wow-delay", "0.3s");
    			add_location(a2, file$3, 49, 20, 2706);
    			attr_dev(div12, "class", "col-12 col-md-6 col-lg-6");
    			add_location(div12, file$3, 47, 16, 2610);
    			attr_dev(img3, "draggable", "false");
    			if (!src_url_equal(img3.src, img3_src_value = "img/icons/3.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "class", "white-icon");
    			attr_dev(img3, "alt", "");
    			add_location(img3, file$3, 65, 28, 3769);
    			attr_dev(div13, "class", "service_icon v2");
    			add_location(div13, file$3, 64, 24, 3711);
    			add_location(h62, file$3, 68, 28, 3954);
    			add_location(p3, file$3, 69, 28, 4015);
    			attr_dev(div14, "class", "service_content");
    			add_location(div14, file$3, 67, 24, 3896);
    			attr_dev(a3, "href", "services.html");
    			attr_dev(a3, "class", "service_single_content grediant-borders box-shadow text-left wow fadeInUp");
    			attr_dev(a3, "data-wow-delay", "0.4s");
    			add_location(a3, file$3, 62, 20, 3520);
    			attr_dev(div15, "class", "col-12 col-md-6 col-lg-6");
    			add_location(div15, file$3, 60, 16, 3424);
    			attr_dev(img4, "draggable", "false");
    			if (!src_url_equal(img4.src, img4_src_value = "img/icons/4.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "class", "white-icon");
    			attr_dev(img4, "alt", "");
    			add_location(img4, file$3, 78, 28, 4575);
    			attr_dev(div16, "class", "service_icon v2");
    			add_location(div16, file$3, 77, 24, 4517);
    			add_location(h63, file$3, 81, 28, 4760);
    			add_location(p4, file$3, 82, 28, 4818);
    			attr_dev(div17, "class", "service_content");
    			add_location(div17, file$3, 80, 24, 4702);
    			attr_dev(a4, "href", "services.html");
    			attr_dev(a4, "class", "service_single_content grediant-borders box-shadow text-left wow fadeInUp");
    			attr_dev(a4, "data-wow-delay", "0.5s");
    			add_location(a4, file$3, 75, 20, 4326);
    			attr_dev(div18, "class", "col-12 col-md-6 col-lg-6");
    			add_location(div18, file$3, 73, 16, 4230);
    			attr_dev(div19, "class", "row");
    			add_location(div19, file$3, 33, 12, 1765);
    			attr_dev(div20, "class", "container");
    			add_location(div20, file$3, 23, 8, 1065);
    			attr_dev(section0, "class", "darky how section-padding-100-70");
    			add_location(section0, file$3, 22, 4, 1006);
    			attr_dev(span0, "class", "gradient-text white");
    			add_location(span0, file$3, 97, 20, 5386);
    			attr_dev(div21, "class", "dream-dots justify-content-center fadeInUp");
    			attr_dev(div21, "data-wow-delay", "0.2s");
    			add_location(div21, file$3, 96, 16, 5287);
    			add_location(h22, file$3, 99, 16, 5486);
    			attr_dev(p5, "class", "w-text");
    			add_location(p5, file$3, 100, 16, 5528);
    			attr_dev(div22, "class", "section-heading text-center");
    			add_location(div22, file$3, 94, 12, 5216);
    			if (!src_url_equal(img5.src, img5_src_value = "img/icons/fact1.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "");
    			add_location(img5, file$3, 106, 45, 5937);
    			attr_dev(div23, "class", "icon-box");
    			add_location(div23, file$3, 106, 23, 5915);
    			attr_dev(span1, "class", "count-text counter");
    			add_location(span1, file$3, 109, 34, 6120);
    			attr_dev(div24, "class", "count-outer");
    			add_location(div24, file$3, 108, 30, 6060);
    			attr_dev(div25, "class", "counter-title");
    			add_location(div25, file$3, 111, 30, 6231);
    			attr_dev(div26, "class", "content");
    			add_location(div26, file$3, 107, 26, 6008);
    			attr_dev(div27, "class", "inner");
    			add_location(div27, file$3, 105, 22, 5872);
    			attr_dev(div28, "class", "fact-box count-box col-lg-3 col-xs-12");
    			add_location(div28, file$3, 104, 20, 5798);
    			if (!src_url_equal(img6.src, img6_src_value = "img/icons/fact2.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "");
    			add_location(img6, file$3, 118, 45, 6539);
    			attr_dev(div29, "class", "icon-box");
    			add_location(div29, file$3, 118, 23, 6517);
    			attr_dev(span2, "class", "count-text counter");
    			add_location(span2, file$3, 121, 34, 6722);
    			attr_dev(div30, "class", "count-outer");
    			add_location(div30, file$3, 120, 30, 6662);
    			attr_dev(div31, "class", "counter-title");
    			add_location(div31, file$3, 123, 30, 6834);
    			attr_dev(div32, "class", "content");
    			add_location(div32, file$3, 119, 26, 6610);
    			attr_dev(div33, "class", "inner");
    			add_location(div33, file$3, 117, 22, 6474);
    			attr_dev(div34, "class", "fact-box count-box col-lg-3 col-xs-12 fact-box-xs");
    			add_location(div34, file$3, 116, 20, 6388);
    			if (!src_url_equal(img7.src, img7_src_value = "img/icons/fact3.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "");
    			add_location(img7, file$3, 130, 45, 7143);
    			attr_dev(div35, "class", "icon-box");
    			add_location(div35, file$3, 130, 23, 7121);
    			attr_dev(span3, "class", "count-text counter");
    			add_location(span3, file$3, 133, 34, 7326);
    			attr_dev(div36, "class", "count-outer");
    			add_location(div36, file$3, 132, 30, 7266);
    			attr_dev(div37, "class", "counter-title");
    			add_location(div37, file$3, 135, 30, 7436);
    			attr_dev(div38, "class", "content");
    			add_location(div38, file$3, 131, 26, 7214);
    			attr_dev(div39, "class", "inner");
    			add_location(div39, file$3, 129, 22, 7078);
    			attr_dev(div40, "class", "fact-box count-box col-lg-3 col-xs-12 fact-box-sm");
    			add_location(div40, file$3, 128, 20, 6992);
    			if (!src_url_equal(img8.src, img8_src_value = "img/icons/fact4.png")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "");
    			add_location(img8, file$3, 142, 45, 7741);
    			attr_dev(div41, "class", "icon-box");
    			add_location(div41, file$3, 142, 23, 7719);
    			attr_dev(span4, "class", "count-text counter");
    			add_location(span4, file$3, 145, 34, 7924);
    			attr_dev(div42, "class", "count-outer");
    			add_location(div42, file$3, 144, 30, 7864);
    			attr_dev(div43, "class", "counter-title");
    			add_location(div43, file$3, 147, 30, 8035);
    			attr_dev(div44, "class", "content");
    			add_location(div44, file$3, 143, 26, 7812);
    			attr_dev(div45, "class", "inner");
    			add_location(div45, file$3, 141, 22, 7676);
    			attr_dev(div46, "class", "fact-box count-box col-lg-3 col-xs-12 fact-box-sm");
    			add_location(div46, file$3, 140, 20, 7590);
    			attr_dev(div47, "class", "col-12");
    			add_location(div47, file$3, 103, 16, 5757);
    			attr_dev(div48, "class", "row align-items-center");
    			add_location(div48, file$3, 102, 12, 5704);
    			attr_dev(div49, "class", "container pre-sale-bg");
    			add_location(div49, file$3, 93, 8, 5168);
    			attr_dev(div50, "class", "section-padding-0-0");
    			add_location(div50, file$3, 92, 4, 5125);
    			if (!src_url_equal(img9.src, img9_src_value = "img/svg/divider-01.svg")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "width", "100");
    			attr_dev(img9, "class", "mb-15");
    			attr_dev(img9, "alt", "divider");
    			add_location(img9, file$3, 164, 20, 8521);
    			attr_dev(div51, "class", "dream-dots justify-content-center wow fadeInUp");
    			attr_dev(div51, "data-wow-delay", "0.2s");
    			add_location(div51, file$3, 163, 16, 8418);
    			attr_dev(h23, "class", "wow fadeInUp");
    			attr_dev(h23, "data-wow-delay", "0.3s");
    			add_location(h23, file$3, 166, 16, 8635);
    			attr_dev(p6, "class", "wow fadeInUp");
    			attr_dev(p6, "data-wow-delay", "0.4s");
    			add_location(p6, file$3, 167, 16, 8716);
    			attr_dev(div52, "class", "section-heading text-center");
    			add_location(div52, file$3, 161, 12, 8343);
    			attr_dev(img10, "draggable", "false");
    			if (!src_url_equal(img10.src, img10_src_value = "img/icons/5.png")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "class", "white-icon");
    			attr_dev(img10, "alt", "");
    			add_location(img10, file$3, 175, 28, 9272);
    			attr_dev(span5, "class", "step-num");
    			add_location(span5, file$3, 176, 28, 9372);
    			attr_dev(div53, "class", "service_icon");
    			add_location(div53, file$3, 174, 24, 9217);
    			add_location(h64, file$3, 178, 24, 9459);
    			add_location(p7, file$3, 179, 24, 9518);
    			attr_dev(div54, "class", "service_single_content v3 box-shadow text-center mb-100 wow fadeInUp");
    			attr_dev(div54, "data-wow-delay", "0.2s");
    			add_location(div54, file$3, 172, 20, 9050);
    			attr_dev(div55, "class", "col-12 col-md-6 col-lg-4");
    			add_location(div55, file$3, 170, 16, 8954);
    			attr_dev(img11, "draggable", "false");
    			if (!src_url_equal(img11.src, img11_src_value = "img/icons/6.png")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "class", "white-icon");
    			attr_dev(img11, "alt", "");
    			add_location(img11, file$3, 187, 28, 10026);
    			attr_dev(span6, "class", "step-num");
    			add_location(span6, file$3, 188, 28, 10126);
    			attr_dev(div56, "class", "service_icon");
    			add_location(div56, file$3, 186, 24, 9971);
    			add_location(h65, file$3, 190, 24, 10213);
    			add_location(p8, file$3, 191, 24, 10270);
    			attr_dev(div57, "class", "service_single_content v3 box-shadow text-center mb-100 wow wow fadeInUp");
    			attr_dev(div57, "data-wow-delay", "0.3s");
    			add_location(div57, file$3, 184, 20, 9800);
    			attr_dev(div58, "class", "col-12 col-md-6 col-lg-4");
    			add_location(div58, file$3, 182, 16, 9704);
    			attr_dev(img12, "draggable", "false");
    			if (!src_url_equal(img12.src, img12_src_value = "img/icons/7.png")) attr_dev(img12, "src", img12_src_value);
    			attr_dev(img12, "class", "white-icon");
    			attr_dev(img12, "alt", "");
    			add_location(img12, file$3, 199, 28, 10774);
    			attr_dev(span7, "class", "step-num");
    			add_location(span7, file$3, 200, 28, 10874);
    			attr_dev(div59, "class", "service_icon");
    			add_location(div59, file$3, 198, 24, 10719);
    			add_location(h66, file$3, 202, 24, 10961);
    			add_location(p9, file$3, 203, 24, 11020);
    			attr_dev(div60, "class", "service_single_content v3 box-shadow text-center mb-100 wow fadeInUp");
    			attr_dev(div60, "data-wow-delay", "0.4s");
    			add_location(div60, file$3, 196, 20, 10552);
    			attr_dev(div61, "class", "col-12 col-md-6 col-lg-4");
    			add_location(div61, file$3, 194, 16, 10456);
    			attr_dev(div62, "class", "row");
    			add_location(div62, file$3, 169, 12, 8920);
    			attr_dev(div63, "class", "container");
    			add_location(div63, file$3, 159, 8, 8306);
    			attr_dev(section1, "class", "darky how section-padding-0-70");
    			add_location(section1, file$3, 157, 4, 8248);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, nav);
    			append_dev(nav, h20);
    			append_dev(nav, t1);
    			append_dev(nav, ol);
    			append_dev(ol, li0);
    			append_dev(li0, a0);
    			append_dev(ol, t3);
    			append_dev(ol, li1);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, section0, anchor);
    			append_dev(section0, div20);
    			append_dev(div20, div6);
    			append_dev(div6, div5);
    			append_dev(div5, img0);
    			append_dev(div6, t6);
    			append_dev(div6, h21);
    			append_dev(div6, t8);
    			append_dev(div6, p0);
    			append_dev(div20, t10);
    			append_dev(div20, div19);
    			append_dev(div19, div9);
    			append_dev(div9, a1);
    			append_dev(a1, div7);
    			append_dev(div7, img1);
    			append_dev(a1, t11);
    			append_dev(a1, div8);
    			append_dev(div8, h60);
    			append_dev(div8, t13);
    			append_dev(div8, p1);
    			append_dev(div19, t15);
    			append_dev(div19, div12);
    			append_dev(div12, a2);
    			append_dev(a2, div10);
    			append_dev(div10, img2);
    			append_dev(a2, t16);
    			append_dev(a2, div11);
    			append_dev(div11, h61);
    			append_dev(div11, t18);
    			append_dev(div11, p2);
    			append_dev(div19, t20);
    			append_dev(div19, div15);
    			append_dev(div15, a3);
    			append_dev(a3, div13);
    			append_dev(div13, img3);
    			append_dev(a3, t21);
    			append_dev(a3, div14);
    			append_dev(div14, h62);
    			append_dev(div14, t23);
    			append_dev(div14, p3);
    			append_dev(div19, t25);
    			append_dev(div19, div18);
    			append_dev(div18, a4);
    			append_dev(a4, div16);
    			append_dev(div16, img4);
    			append_dev(a4, t26);
    			append_dev(a4, div17);
    			append_dev(div17, h63);
    			append_dev(div17, t28);
    			append_dev(div17, p4);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, div50, anchor);
    			append_dev(div50, div49);
    			append_dev(div49, div22);
    			append_dev(div22, div21);
    			append_dev(div21, span0);
    			append_dev(div22, t32);
    			append_dev(div22, h22);
    			append_dev(div22, t34);
    			append_dev(div22, p5);
    			append_dev(div49, t36);
    			append_dev(div49, div48);
    			append_dev(div48, div47);
    			append_dev(div47, div28);
    			append_dev(div28, div27);
    			append_dev(div27, div23);
    			append_dev(div23, img5);
    			append_dev(div27, t37);
    			append_dev(div27, div26);
    			append_dev(div26, div24);
    			append_dev(div24, span1);
    			append_dev(div26, t39);
    			append_dev(div26, div25);
    			append_dev(div47, t41);
    			append_dev(div47, div34);
    			append_dev(div34, div33);
    			append_dev(div33, div29);
    			append_dev(div29, img6);
    			append_dev(div33, t42);
    			append_dev(div33, div32);
    			append_dev(div32, div30);
    			append_dev(div30, span2);
    			append_dev(div32, t44);
    			append_dev(div32, div31);
    			append_dev(div47, t46);
    			append_dev(div47, div40);
    			append_dev(div40, div39);
    			append_dev(div39, div35);
    			append_dev(div35, img7);
    			append_dev(div39, t47);
    			append_dev(div39, div38);
    			append_dev(div38, div36);
    			append_dev(div36, span3);
    			append_dev(div38, t49);
    			append_dev(div38, div37);
    			append_dev(div47, t51);
    			append_dev(div47, div46);
    			append_dev(div46, div45);
    			append_dev(div45, div41);
    			append_dev(div41, img8);
    			append_dev(div45, t52);
    			append_dev(div45, div44);
    			append_dev(div44, div42);
    			append_dev(div42, span4);
    			append_dev(div44, t54);
    			append_dev(div44, div43);
    			insert_dev(target, t56, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div63);
    			append_dev(div63, div52);
    			append_dev(div52, div51);
    			append_dev(div51, img9);
    			append_dev(div52, t57);
    			append_dev(div52, h23);
    			append_dev(div52, t59);
    			append_dev(div52, p6);
    			append_dev(div63, t61);
    			append_dev(div63, div62);
    			append_dev(div62, div55);
    			append_dev(div55, div54);
    			append_dev(div54, div53);
    			append_dev(div53, img10);
    			append_dev(div53, t62);
    			append_dev(div53, span5);
    			append_dev(div54, t64);
    			append_dev(div54, h64);
    			append_dev(div54, t66);
    			append_dev(div54, p7);
    			append_dev(div62, t68);
    			append_dev(div62, div58);
    			append_dev(div58, div57);
    			append_dev(div57, div56);
    			append_dev(div56, img11);
    			append_dev(div56, t69);
    			append_dev(div56, span6);
    			append_dev(div57, t71);
    			append_dev(div57, h65);
    			append_dev(div57, t73);
    			append_dev(div57, p8);
    			append_dev(div62, t75);
    			append_dev(div62, div61);
    			append_dev(div61, div60);
    			append_dev(div60, div59);
    			append_dev(div59, img12);
    			append_dev(div59, t76);
    			append_dev(div59, span7);
    			append_dev(div60, t78);
    			append_dev(div60, h66);
    			append_dev(div60, t80);
    			append_dev(div60, p9);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(div50);
    			if (detaching) detach_dev(t56);
    			if (detaching) detach_dev(section1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Servicios', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Servicios> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Servicios extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Servicios",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\routes\SobreNosotros.svelte generated by Svelte v3.59.2 */

    const file$2 = "src\\routes\\SobreNosotros.svelte";

    function create_fragment$3(ctx) {
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let nav;
    	let h20;
    	let t1;
    	let ol;
    	let li0;
    	let a0;
    	let t3;
    	let li1;
    	let t5;
    	let section0;
    	let div21;
    	let div20;
    	let div17;
    	let div16;
    	let div5;
    	let span0;
    	let t7;
    	let h40;
    	let t9;
    	let p0;
    	let t11;
    	let p1;
    	let t13;
    	let div15;
    	let div14;
    	let div7;
    	let img0;
    	let img0_src_value;
    	let t14;
    	let div6;
    	let t16;
    	let div9;
    	let img1;
    	let img1_src_value;
    	let t17;
    	let div8;
    	let t19;
    	let div11;
    	let img2;
    	let img2_src_value;
    	let t20;
    	let div10;
    	let t22;
    	let div13;
    	let img3;
    	let img3_src_value;
    	let t23;
    	let div12;
    	let t25;
    	let div19;
    	let div18;
    	let img4;
    	let img4_src_value;
    	let t26;
    	let section1;
    	let div30;
    	let div29;
    	let div23;
    	let div22;
    	let img5;
    	let img5_src_value;
    	let t27;
    	let div26;
    	let div25;
    	let div24;
    	let span1;
    	let t29;
    	let h41;
    	let t31;
    	let img6;
    	let img6_src_value;
    	let t32;
    	let div28;
    	let div27;
    	let p2;
    	let t34;
    	let a1;
    	let t36;
    	let section2;
    	let div56;
    	let div34;
    	let div33;
    	let div32;
    	let div31;
    	let img7;
    	let img7_src_value;
    	let t37;
    	let h21;
    	let t39;
    	let p3;
    	let t41;
    	let div55;
    	let div39;
    	let div38;
    	let div35;
    	let img8;
    	let img8_src_value;
    	let t42;
    	let div36;
    	let h50;
    	let t44;
    	let p4;
    	let t46;
    	let div37;
    	let a2;
    	let i0;
    	let t47;
    	let div44;
    	let div43;
    	let div40;
    	let img9;
    	let img9_src_value;
    	let t48;
    	let div41;
    	let h51;
    	let t50;
    	let p5;
    	let t52;
    	let div42;
    	let a3;
    	let i1;
    	let t53;
    	let div49;
    	let div48;
    	let div45;
    	let img10;
    	let img10_src_value;
    	let t54;
    	let div46;
    	let h52;
    	let t56;
    	let p6;
    	let t58;
    	let div47;
    	let a4;
    	let i2;
    	let t59;
    	let div54;
    	let div53;
    	let div50;
    	let img11;
    	let img11_src_value;
    	let t60;
    	let div51;
    	let h53;
    	let t62;
    	let p7;
    	let t64;
    	let div52;
    	let a5;
    	let i3;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			nav = element("nav");
    			h20 = element("h2");
    			h20.textContent = "About us";
    			t1 = space();
    			ol = element("ol");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Home";
    			t3 = space();
    			li1 = element("li");
    			li1.textContent = "About us";
    			t5 = space();
    			section0 = element("section");
    			div21 = element("div");
    			div20 = element("div");
    			div17 = element("div");
    			div16 = element("div");
    			div5 = element("div");
    			span0 = element("span");
    			span0.textContent = "About Our IT Technology  Agency.";
    			t7 = space();
    			h40 = element("h4");
    			h40.textContent = "Creative IT Technology & Cloud Computing Solutions.";
    			t9 = space();
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at dictum risus, non suscipit arcu. Quisque aliquam posuere tortor, sit amet convallis nunc scelerisque in voluptatibus aliquid alias beatae.";
    			t11 = space();
    			p1 = element("p");
    			p1.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at dictum risus, non suscipit arcu. Quisque aliquam posuere tortor, sit amet convallis nunc scelerisque in.";
    			t13 = space();
    			div15 = element("div");
    			div14 = element("div");
    			div7 = element("div");
    			img0 = element("img");
    			t14 = space();
    			div6 = element("div");
    			div6.textContent = "Velit ducimus voluptatibus neque illo";
    			t16 = space();
    			div9 = element("div");
    			img1 = element("img");
    			t17 = space();
    			div8 = element("div");
    			div8.textContent = "nisi Ut ut felis congue nisl hendrerit";
    			t19 = space();
    			div11 = element("div");
    			img2 = element("img");
    			t20 = space();
    			div10 = element("div");
    			div10.textContent = "Affordable Packages & Detailed Results";
    			t22 = space();
    			div13 = element("div");
    			img3 = element("img");
    			t23 = space();
    			div12 = element("div");
    			div12.textContent = "amet consectetur adipisicing elit";
    			t25 = space();
    			div19 = element("div");
    			div18 = element("div");
    			img4 = element("img");
    			t26 = space();
    			section1 = element("section");
    			div30 = element("div");
    			div29 = element("div");
    			div23 = element("div");
    			div22 = element("div");
    			img5 = element("img");
    			t27 = space();
    			div26 = element("div");
    			div25 = element("div");
    			div24 = element("div");
    			span1 = element("span");
    			span1.textContent = "Our Company Community";
    			t29 = space();
    			h41 = element("h4");
    			h41.textContent = "Top Technology and IT services with Our Agency..";
    			t31 = space();
    			img6 = element("img");
    			t32 = space();
    			div28 = element("div");
    			div27 = element("div");
    			p2 = element("p");
    			p2.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at dictum risus, non suscipit arcu. Quisque aliquam posuere tortor, sit amet convallis nunc scelerisque in Quisque aliquam posuere.";
    			t34 = space();
    			a1 = element("a");
    			a1.textContent = "Read More";
    			t36 = space();
    			section2 = element("section");
    			div56 = element("div");
    			div34 = element("div");
    			div33 = element("div");
    			div32 = element("div");
    			div31 = element("div");
    			img7 = element("img");
    			t37 = space();
    			h21 = element("h2");
    			h21.textContent = "Awesome Team";
    			t39 = space();
    			p3 = element("p");
    			p3.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis accumsan nisi Ut ut felis congue nisl hendrerit commodo.";
    			t41 = space();
    			div55 = element("div");
    			div39 = element("div");
    			div38 = element("div");
    			div35 = element("div");
    			img8 = element("img");
    			t42 = space();
    			div36 = element("div");
    			h50 = element("h5");
    			h50.textContent = "Joman Helal";
    			t44 = space();
    			p4 = element("p");
    			p4.textContent = "Executive Officer";
    			t46 = space();
    			div37 = element("div");
    			a2 = element("a");
    			i0 = element("i");
    			t47 = space();
    			div44 = element("div");
    			div43 = element("div");
    			div40 = element("div");
    			img9 = element("img");
    			t48 = space();
    			div41 = element("div");
    			h51 = element("h5");
    			h51.textContent = "Slans Alons";
    			t50 = space();
    			p5 = element("p");
    			p5.textContent = "Business Development";
    			t52 = space();
    			div42 = element("div");
    			a3 = element("a");
    			i1 = element("i");
    			t53 = space();
    			div49 = element("div");
    			div48 = element("div");
    			div45 = element("div");
    			img10 = element("img");
    			t54 = space();
    			div46 = element("div");
    			h52 = element("h5");
    			h52.textContent = "Josha Michal";
    			t56 = space();
    			p6 = element("p");
    			p6.textContent = "UX/UI Designer";
    			t58 = space();
    			div47 = element("div");
    			a4 = element("a");
    			i2 = element("i");
    			t59 = space();
    			div54 = element("div");
    			div53 = element("div");
    			div50 = element("div");
    			img11 = element("img");
    			t60 = space();
    			div51 = element("div");
    			h53 = element("h5");
    			h53.textContent = "Johan Wright";
    			t62 = space();
    			p7 = element("p");
    			p7.textContent = "Head of Marketing";
    			t64 = space();
    			div52 = element("div");
    			a5 = element("a");
    			i3 = element("i");
    			attr_dev(h20, "class", "w-text title wow fadeInUp");
    			attr_dev(h20, "data-wow-delay", "0.2s");
    			add_location(h20, file$2, 9, 28, 417);
    			attr_dev(a0, "href", "#top");
    			add_location(a0, file$2, 11, 60, 661);
    			attr_dev(li0, "class", "breadcrumb-item");
    			add_location(li0, file$2, 11, 32, 633);
    			attr_dev(li1, "class", "breadcrumb-item active");
    			attr_dev(li1, "aria-current", "page");
    			add_location(li1, file$2, 12, 32, 722);
    			attr_dev(ol, "class", "breadcrumb justify-content-center wow fadeInUp");
    			attr_dev(ol, "data-wow-delay", "0.4s");
    			add_location(ol, file$2, 10, 28, 519);
    			attr_dev(nav, "aria-label", "breadcrumb");
    			attr_dev(nav, "class", "breadcumb--con text-center");
    			add_location(nav, file$2, 8, 24, 324);
    			attr_dev(div0, "class", "col-12");
    			add_location(div0, file$2, 7, 20, 279);
    			attr_dev(div1, "class", "row h-100 align-items-center");
    			add_location(div1, file$2, 6, 16, 216);
    			attr_dev(div2, "class", "container h-100");
    			add_location(div2, file$2, 5, 12, 170);
    			attr_dev(div3, "class", "breadcumb-content");
    			add_location(div3, file$2, 4, 8, 126);
    			attr_dev(div4, "class", "breadcumb-area");
    			add_location(div4, file$2, 1, 4, 45);
    			attr_dev(span0, "class", "gradient-text");
    			add_location(span0, file$2, 30, 28, 1445);
    			attr_dev(div5, "class", "dream-dots text-left fadeInUp");
    			attr_dev(div5, "data-wow-delay", "0.2s");
    			add_location(div5, file$2, 29, 24, 1351);
    			attr_dev(h40, "class", "fadeInUp");
    			attr_dev(h40, "data-wow-delay", "0.3s");
    			add_location(h40, file$2, 32, 24, 1569);
    			attr_dev(p0, "class", "fadeInUp");
    			attr_dev(p0, "data-wow-delay", "0.4s");
    			add_location(p0, file$2, 33, 24, 1693);
    			attr_dev(p1, "class", "fadeInUp");
    			attr_dev(p1, "data-wow-delay", "0.5s");
    			add_location(p1, file$2, 34, 24, 1967);
    			if (!src_url_equal(img0.src, img0_src_value = "img/icons/f1.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "check-mark-icon");
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$2, 39, 36, 2407);
    			attr_dev(div6, "class", "foot-c-info");
    			add_location(div6, file$2, 40, 36, 2503);
    			attr_dev(div7, "class", "side-feature-list-item");
    			add_location(div7, file$2, 38, 32, 2334);
    			if (!src_url_equal(img1.src, img1_src_value = "img/icons/f2.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "check-mark-icon");
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$2, 43, 36, 2716);
    			attr_dev(div8, "class", "foot-c-info");
    			add_location(div8, file$2, 44, 36, 2812);
    			attr_dev(div9, "class", "side-feature-list-item");
    			add_location(div9, file$2, 42, 32, 2643);
    			if (!src_url_equal(img2.src, img2_src_value = "img/icons/f3.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "check-mark-icon");
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$2, 47, 36, 3026);
    			attr_dev(div10, "class", "foot-c-info");
    			add_location(div10, file$2, 48, 36, 3122);
    			attr_dev(div11, "class", "side-feature-list-item");
    			add_location(div11, file$2, 46, 32, 2953);
    			if (!src_url_equal(img3.src, img3_src_value = "img/icons/f1.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "class", "check-mark-icon");
    			attr_dev(img3, "alt", "");
    			add_location(img3, file$2, 51, 36, 3340);
    			attr_dev(div12, "class", "foot-c-info");
    			add_location(div12, file$2, 52, 36, 3436);
    			attr_dev(div13, "class", "side-feature-list-item");
    			add_location(div13, file$2, 50, 32, 3267);
    			attr_dev(div14, "class", "col-sm-12");
    			add_location(div14, file$2, 37, 28, 2278);
    			attr_dev(div15, "class", "row");
    			add_location(div15, file$2, 36, 24, 2232);
    			attr_dev(div16, "class", "who-we-contant");
    			add_location(div16, file$2, 28, 20, 1298);
    			attr_dev(div17, "class", "col-12 col-lg-6 offset-lg-0 mt-s");
    			add_location(div17, file$2, 27, 16, 1231);
    			attr_dev(img4, "draggable", "false");
    			attr_dev(img4, "class", "floating");
    			if (!src_url_equal(img4.src, img4_src_value = "img/core-img/img1.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "");
    			add_location(img4, file$2, 60, 24, 3797);
    			attr_dev(div18, "class", "welcome-meter");
    			add_location(div18, file$2, 59, 20, 3745);
    			attr_dev(div19, "class", "col-12 col-lg-6 offset-lg-0 col-md-12");
    			add_location(div19, file$2, 58, 16, 3673);
    			attr_dev(div20, "class", "row align-items-center");
    			add_location(div20, file$2, 26, 12, 1178);
    			attr_dev(div21, "class", "container");
    			add_location(div21, file$2, 25, 8, 1142);
    			attr_dev(section0, "class", "about-us-area section-padding-100-0 clearfix");
    			attr_dev(section0, "id", "about");
    			add_location(section0, file$2, 23, 4, 1051);
    			attr_dev(img5, "draggable", "false");
    			if (!src_url_equal(img5.src, img5_src_value = "img/core-img/img4.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "");
    			add_location(img5, file$2, 75, 24, 4359);
    			attr_dev(div22, "class", "welcome-meter");
    			add_location(div22, file$2, 74, 20, 4307);
    			attr_dev(div23, "class", "col-12 col-lg-4 offset-lg-0 col-md-6");
    			add_location(div23, file$2, 73, 16, 4236);
    			attr_dev(span1, "class", "gradient-text");
    			add_location(span1, file$2, 81, 28, 4699);
    			attr_dev(div24, "class", "dream-dots text-left fadeInUp");
    			attr_dev(div24, "data-wow-delay", "0.2s");
    			add_location(div24, file$2, 80, 24, 4605);
    			attr_dev(h41, "class", "fadeInUp");
    			attr_dev(h41, "data-wow-delay", "0.3s");
    			add_location(h41, file$2, 83, 24, 4811);
    			if (!src_url_equal(img6.src, img6_src_value = "img/svg/divider-01.svg")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "width", "100");
    			attr_dev(img6, "class", "mt-15");
    			attr_dev(img6, "alt", "divider");
    			add_location(img6, file$2, 84, 24, 4932);
    			attr_dev(div25, "class", "who-we-contant");
    			add_location(div25, file$2, 79, 20, 4552);
    			attr_dev(div26, "class", "col-12 col-lg-4 offset-lg-0 mt-s");
    			add_location(div26, file$2, 78, 16, 4485);
    			add_location(p2, file$2, 89, 24, 5202);
    			attr_dev(a1, "class", "btn more-btn mt-30 fadeInUp");
    			attr_dev(a1, "data-wow-delay", "0.6s");
    			attr_dev(a1, "href", "about-us.html");
    			add_location(a1, file$2, 90, 24, 5427);
    			attr_dev(div27, "class", "who-we-contant left-bor");
    			add_location(div27, file$2, 88, 20, 5140);
    			attr_dev(div28, "class", "col-12 col-lg-4 offset-lg-0 mt-s");
    			add_location(div28, file$2, 87, 16, 5073);
    			attr_dev(div29, "class", "row align-items-center");
    			add_location(div29, file$2, 72, 12, 4183);
    			attr_dev(div30, "class", "container");
    			add_location(div30, file$2, 71, 8, 4147);
    			attr_dev(section1, "class", "about-us-area section-padding-100 clearfix");
    			attr_dev(section1, "id", "about");
    			add_location(section1, file$2, 70, 4, 4067);
    			if (!src_url_equal(img7.src, img7_src_value = "img/svg/divider-01.svg")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "width", "100");
    			attr_dev(img7, "class", "mb-15");
    			attr_dev(img7, "alt", "divider");
    			add_location(img7, file$2, 106, 28, 6100);
    			attr_dev(div31, "class", "dream-dots justify-content-center fadeInUp");
    			attr_dev(div31, "data-wow-delay", "0.2s");
    			add_location(div31, file$2, 105, 24, 5993);
    			attr_dev(h21, "class", "fadeInUp");
    			attr_dev(h21, "data-wow-delay", "0.3s");
    			add_location(h21, file$2, 108, 24, 6230);
    			attr_dev(p3, "class", "fadeInUp");
    			attr_dev(p3, "data-wow-delay", "0.4s");
    			add_location(p3, file$2, 109, 24, 6315);
    			attr_dev(div32, "class", "section-heading text-center");
    			add_location(div32, file$2, 103, 20, 5902);
    			attr_dev(div33, "class", "col-12");
    			add_location(div33, file$2, 102, 16, 5861);
    			attr_dev(div34, "class", "row");
    			add_location(div34, file$2, 101, 12, 5827);
    			attr_dev(img8, "draggable", "false");
    			if (!src_url_equal(img8.src, img8_src_value = "img/team-img/avatar-1.png")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "class", "center-block");
    			attr_dev(img8, "alt", "");
    			add_location(img8, file$2, 120, 28, 6891);
    			attr_dev(div35, "class", "team-member-thumb");
    			add_location(div35, file$2, 119, 24, 6831);
    			attr_dev(h50, "class", "w-text");
    			add_location(h50, file$2, 124, 28, 7125);
    			attr_dev(p4, "class", "g-text");
    			add_location(p4, file$2, 125, 28, 7189);
    			attr_dev(div36, "class", "team-info");
    			add_location(div36, file$2, 123, 24, 7073);
    			attr_dev(i0, "class", "fa fa-linkedin");
    			add_location(i0, file$2, 129, 43, 7403);
    			attr_dev(a2, "href", "#top");
    			add_location(a2, file$2, 129, 28, 7388);
    			attr_dev(div37, "class", "team-social-icon");
    			add_location(div37, file$2, 128, 24, 7329);
    			attr_dev(div38, "class", "single-team-member fadeInUp");
    			attr_dev(div38, "data-wow-delay", "0.2s");
    			add_location(div38, file$2, 117, 20, 6704);
    			attr_dev(div39, "class", "col-12 col-sm-6 col-lg-3");
    			add_location(div39, file$2, 116, 16, 6645);
    			attr_dev(img9, "draggable", "false");
    			if (!src_url_equal(img9.src, img9_src_value = "img/team-img/avatar-2.png")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "class", "center-block");
    			attr_dev(img9, "alt", "");
    			add_location(img9, file$2, 139, 28, 7826);
    			attr_dev(div40, "class", "team-member-thumb");
    			add_location(div40, file$2, 138, 24, 7766);
    			attr_dev(h51, "class", "w-text");
    			add_location(h51, file$2, 143, 28, 8060);
    			attr_dev(p5, "class", "g-text");
    			add_location(p5, file$2, 144, 28, 8124);
    			attr_dev(div41, "class", "team-info");
    			add_location(div41, file$2, 142, 24, 8008);
    			attr_dev(i1, "class", "fa fa-linkedin");
    			add_location(i1, file$2, 148, 43, 8341);
    			attr_dev(a3, "href", "#top");
    			add_location(a3, file$2, 148, 28, 8326);
    			attr_dev(div42, "class", "team-social-icon");
    			add_location(div42, file$2, 147, 24, 8267);
    			attr_dev(div43, "class", "single-team-member fadeInUp");
    			attr_dev(div43, "data-wow-delay", "0.3s");
    			add_location(div43, file$2, 136, 20, 7639);
    			attr_dev(div44, "class", "col-12 col-sm-6 col-lg-3");
    			add_location(div44, file$2, 135, 16, 7580);
    			attr_dev(img10, "draggable", "false");
    			if (!src_url_equal(img10.src, img10_src_value = "img/team-img/avatar-3.png")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "class", "center-block");
    			attr_dev(img10, "alt", "");
    			add_location(img10, file$2, 158, 28, 8764);
    			attr_dev(div45, "class", "team-member-thumb");
    			add_location(div45, file$2, 157, 24, 8704);
    			attr_dev(h52, "class", "w-text");
    			add_location(h52, file$2, 162, 28, 8998);
    			attr_dev(p6, "class", "g-text");
    			add_location(p6, file$2, 163, 28, 9063);
    			attr_dev(div46, "class", "team-info");
    			add_location(div46, file$2, 161, 24, 8946);
    			attr_dev(i2, "class", "fa fa-linkedin");
    			add_location(i2, file$2, 167, 43, 9274);
    			attr_dev(a4, "href", "#top");
    			add_location(a4, file$2, 167, 28, 9259);
    			attr_dev(div47, "class", "team-social-icon");
    			add_location(div47, file$2, 166, 24, 9200);
    			attr_dev(div48, "class", "single-team-member fadeInUp");
    			attr_dev(div48, "data-wow-delay", "0.4s");
    			add_location(div48, file$2, 155, 20, 8577);
    			attr_dev(div49, "class", "col-12 col-sm-6 col-lg-3");
    			add_location(div49, file$2, 154, 16, 8518);
    			attr_dev(img11, "draggable", "false");
    			if (!src_url_equal(img11.src, img11_src_value = "img/team-img/avatar-4.png")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "class", "center-block");
    			attr_dev(img11, "alt", "");
    			add_location(img11, file$2, 177, 28, 9697);
    			attr_dev(div50, "class", "team-member-thumb");
    			add_location(div50, file$2, 176, 24, 9637);
    			attr_dev(h53, "class", "w-text");
    			add_location(h53, file$2, 181, 28, 9931);
    			attr_dev(p7, "class", "g-text");
    			add_location(p7, file$2, 182, 28, 9996);
    			attr_dev(div51, "class", "team-info");
    			add_location(div51, file$2, 180, 24, 9879);
    			attr_dev(i3, "class", "fa fa-linkedin");
    			add_location(i3, file$2, 186, 43, 10203);
    			attr_dev(a5, "href", "#top");
    			add_location(a5, file$2, 186, 28, 10188);
    			attr_dev(div52, "class", "team-social-icon");
    			add_location(div52, file$2, 185, 24, 10129);
    			attr_dev(div53, "class", "single-team-member fadeInUp");
    			attr_dev(div53, "data-wow-delay", "0.5s");
    			add_location(div53, file$2, 174, 20, 9510);
    			attr_dev(div54, "class", "col-12 col-sm-6 col-lg-3");
    			add_location(div54, file$2, 173, 16, 9451);
    			attr_dev(div55, "class", "row");
    			add_location(div55, file$2, 114, 12, 6567);
    			attr_dev(div56, "class", "container");
    			add_location(div56, file$2, 100, 8, 5791);
    			attr_dev(section2, "class", "our_team_area section-padding-0-70 clearfix");
    			attr_dev(section2, "id", "team");
    			add_location(section2, file$2, 99, 4, 5711);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, nav);
    			append_dev(nav, h20);
    			append_dev(nav, t1);
    			append_dev(nav, ol);
    			append_dev(ol, li0);
    			append_dev(li0, a0);
    			append_dev(ol, t3);
    			append_dev(ol, li1);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, section0, anchor);
    			append_dev(section0, div21);
    			append_dev(div21, div20);
    			append_dev(div20, div17);
    			append_dev(div17, div16);
    			append_dev(div16, div5);
    			append_dev(div5, span0);
    			append_dev(div16, t7);
    			append_dev(div16, h40);
    			append_dev(div16, t9);
    			append_dev(div16, p0);
    			append_dev(div16, t11);
    			append_dev(div16, p1);
    			append_dev(div16, t13);
    			append_dev(div16, div15);
    			append_dev(div15, div14);
    			append_dev(div14, div7);
    			append_dev(div7, img0);
    			append_dev(div7, t14);
    			append_dev(div7, div6);
    			append_dev(div14, t16);
    			append_dev(div14, div9);
    			append_dev(div9, img1);
    			append_dev(div9, t17);
    			append_dev(div9, div8);
    			append_dev(div14, t19);
    			append_dev(div14, div11);
    			append_dev(div11, img2);
    			append_dev(div11, t20);
    			append_dev(div11, div10);
    			append_dev(div14, t22);
    			append_dev(div14, div13);
    			append_dev(div13, img3);
    			append_dev(div13, t23);
    			append_dev(div13, div12);
    			append_dev(div20, t25);
    			append_dev(div20, div19);
    			append_dev(div19, div18);
    			append_dev(div18, img4);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div30);
    			append_dev(div30, div29);
    			append_dev(div29, div23);
    			append_dev(div23, div22);
    			append_dev(div22, img5);
    			append_dev(div29, t27);
    			append_dev(div29, div26);
    			append_dev(div26, div25);
    			append_dev(div25, div24);
    			append_dev(div24, span1);
    			append_dev(div25, t29);
    			append_dev(div25, h41);
    			append_dev(div25, t31);
    			append_dev(div25, img6);
    			append_dev(div29, t32);
    			append_dev(div29, div28);
    			append_dev(div28, div27);
    			append_dev(div27, p2);
    			append_dev(div27, t34);
    			append_dev(div27, a1);
    			insert_dev(target, t36, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, div56);
    			append_dev(div56, div34);
    			append_dev(div34, div33);
    			append_dev(div33, div32);
    			append_dev(div32, div31);
    			append_dev(div31, img7);
    			append_dev(div32, t37);
    			append_dev(div32, h21);
    			append_dev(div32, t39);
    			append_dev(div32, p3);
    			append_dev(div56, t41);
    			append_dev(div56, div55);
    			append_dev(div55, div39);
    			append_dev(div39, div38);
    			append_dev(div38, div35);
    			append_dev(div35, img8);
    			append_dev(div38, t42);
    			append_dev(div38, div36);
    			append_dev(div36, h50);
    			append_dev(div36, t44);
    			append_dev(div36, p4);
    			append_dev(div38, t46);
    			append_dev(div38, div37);
    			append_dev(div37, a2);
    			append_dev(a2, i0);
    			append_dev(div55, t47);
    			append_dev(div55, div44);
    			append_dev(div44, div43);
    			append_dev(div43, div40);
    			append_dev(div40, img9);
    			append_dev(div43, t48);
    			append_dev(div43, div41);
    			append_dev(div41, h51);
    			append_dev(div41, t50);
    			append_dev(div41, p5);
    			append_dev(div43, t52);
    			append_dev(div43, div42);
    			append_dev(div42, a3);
    			append_dev(a3, i1);
    			append_dev(div55, t53);
    			append_dev(div55, div49);
    			append_dev(div49, div48);
    			append_dev(div48, div45);
    			append_dev(div45, img10);
    			append_dev(div48, t54);
    			append_dev(div48, div46);
    			append_dev(div46, h52);
    			append_dev(div46, t56);
    			append_dev(div46, p6);
    			append_dev(div48, t58);
    			append_dev(div48, div47);
    			append_dev(div47, a4);
    			append_dev(a4, i2);
    			append_dev(div55, t59);
    			append_dev(div55, div54);
    			append_dev(div54, div53);
    			append_dev(div53, div50);
    			append_dev(div50, img11);
    			append_dev(div53, t60);
    			append_dev(div53, div51);
    			append_dev(div51, h53);
    			append_dev(div51, t62);
    			append_dev(div51, p7);
    			append_dev(div53, t64);
    			append_dev(div53, div52);
    			append_dev(div52, a5);
    			append_dev(a5, i3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(section1);
    			if (detaching) detach_dev(t36);
    			if (detaching) detach_dev(section2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SobreNosotros', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SobreNosotros> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class SobreNosotros extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SobreNosotros",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\routes\ProyectosRealizados.svelte generated by Svelte v3.59.2 */

    const file$1 = "src\\routes\\ProyectosRealizados.svelte";

    function create_fragment$2(ctx) {
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let nav;
    	let h20;
    	let t1;
    	let ol;
    	let li0;
    	let a0;
    	let t3;
    	let li1;
    	let t5;
    	let section0;
    	let div27;
    	let div9;
    	let div6;
    	let div5;
    	let h40;
    	let t7;
    	let img0;
    	let img0_src_value;
    	let t8;
    	let div8;
    	let div7;
    	let p0;
    	let t10;
    	let div26;
    	let div13;
    	let div12;
    	let div10;
    	let img1;
    	let img1_src_value;
    	let t11;
    	let div11;
    	let h41;
    	let t12;
    	let br0;
    	let t13;
    	let t14;
    	let p1;
    	let t16;
    	let a1;
    	let t17;
    	let span0;
    	let i0;
    	let t18;
    	let div17;
    	let div16;
    	let div14;
    	let img2;
    	let img2_src_value;
    	let t19;
    	let div15;
    	let h42;
    	let t20;
    	let br1;
    	let t21;
    	let t22;
    	let p2;
    	let t24;
    	let a2;
    	let t25;
    	let span1;
    	let i1;
    	let t26;
    	let div21;
    	let div20;
    	let div18;
    	let img3;
    	let img3_src_value;
    	let t27;
    	let div19;
    	let h43;
    	let t28;
    	let br2;
    	let t29;
    	let t30;
    	let p3;
    	let t32;
    	let a3;
    	let t33;
    	let span2;
    	let i2;
    	let t34;
    	let div25;
    	let div24;
    	let div22;
    	let img4;
    	let img4_src_value;
    	let t35;
    	let div23;
    	let h44;
    	let t36;
    	let br3;
    	let t37;
    	let t38;
    	let p4;
    	let t40;
    	let a4;
    	let t41;
    	let span3;
    	let i3;
    	let t42;
    	let section1;
    	let div36;
    	let div35;
    	let div29;
    	let div28;
    	let img5;
    	let img5_src_value;
    	let t43;
    	let div32;
    	let div31;
    	let div30;
    	let span4;
    	let t45;
    	let h45;
    	let t47;
    	let img6;
    	let img6_src_value;
    	let t48;
    	let div34;
    	let div33;
    	let p5;
    	let t50;
    	let a5;
    	let t52;
    	let section2;
    	let div62;
    	let div40;
    	let div39;
    	let div38;
    	let div37;
    	let img7;
    	let img7_src_value;
    	let t53;
    	let h21;
    	let t55;
    	let p6;
    	let t57;
    	let div61;
    	let div45;
    	let div44;
    	let div41;
    	let img8;
    	let img8_src_value;
    	let t58;
    	let div42;
    	let h50;
    	let t60;
    	let p7;
    	let t62;
    	let div43;
    	let a6;
    	let i4;
    	let t63;
    	let div50;
    	let div49;
    	let div46;
    	let img9;
    	let img9_src_value;
    	let t64;
    	let div47;
    	let h51;
    	let t66;
    	let p8;
    	let t68;
    	let div48;
    	let a7;
    	let i5;
    	let t69;
    	let div55;
    	let div54;
    	let div51;
    	let img10;
    	let img10_src_value;
    	let t70;
    	let div52;
    	let h52;
    	let t72;
    	let p9;
    	let t74;
    	let div53;
    	let a8;
    	let i6;
    	let t75;
    	let div60;
    	let div59;
    	let div56;
    	let img11;
    	let img11_src_value;
    	let t76;
    	let div57;
    	let h53;
    	let t78;
    	let p10;
    	let t80;
    	let div58;
    	let a9;
    	let i7;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			nav = element("nav");
    			h20 = element("h2");
    			h20.textContent = "Projects";
    			t1 = space();
    			ol = element("ol");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Home";
    			t3 = space();
    			li1 = element("li");
    			li1.textContent = "Projects";
    			t5 = space();
    			section0 = element("section");
    			div27 = element("div");
    			div9 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			h40 = element("h4");
    			h40.textContent = "Our Creative Projects";
    			t7 = space();
    			img0 = element("img");
    			t8 = space();
    			div8 = element("div");
    			div7 = element("div");
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at dictum risus, non suscipit arcu. Quisque aliquam posuere tortor, sit amet convallis nunc scelerisque in Quisque aliquam posuere.";
    			t10 = space();
    			div26 = element("div");
    			div13 = element("div");
    			div12 = element("div");
    			div10 = element("div");
    			img1 = element("img");
    			t11 = space();
    			div11 = element("div");
    			h41 = element("h4");
    			t12 = text("IT Check and ");
    			br0 = element("br");
    			t13 = text(" Cloud Managment");
    			t14 = space();
    			p1 = element("p");
    			p1.textContent = "Security Testing";
    			t16 = space();
    			a1 = element("a");
    			t17 = text("Full Case Study");
    			span0 = element("span");
    			i0 = element("i");
    			t18 = space();
    			div17 = element("div");
    			div16 = element("div");
    			div14 = element("div");
    			img2 = element("img");
    			t19 = space();
    			div15 = element("div");
    			h42 = element("h4");
    			t20 = text("System Security ");
    			br1 = element("br");
    			t21 = text(" and Development");
    			t22 = space();
    			p2 = element("p");
    			p2.textContent = "Development";
    			t24 = space();
    			a2 = element("a");
    			t25 = text("Full Case Study");
    			span1 = element("span");
    			i1 = element("i");
    			t26 = space();
    			div21 = element("div");
    			div20 = element("div");
    			div18 = element("div");
    			img3 = element("img");
    			t27 = space();
    			div19 = element("div");
    			h43 = element("h4");
    			t28 = text("Cloud Migration");
    			br2 = element("br");
    			t29 = text(" and Deployment");
    			t30 = space();
    			p3 = element("p");
    			p3.textContent = "Blockchain";
    			t32 = space();
    			a3 = element("a");
    			t33 = text("Full Case Study");
    			span2 = element("span");
    			i2 = element("i");
    			t34 = space();
    			div25 = element("div");
    			div24 = element("div");
    			div22 = element("div");
    			img4 = element("img");
    			t35 = space();
    			div23 = element("div");
    			h44 = element("h4");
    			t36 = text("Network Security ");
    			br3 = element("br");
    			t37 = text(" Cloud Computing");
    			t38 = space();
    			p4 = element("p");
    			p4.textContent = "Networking";
    			t40 = space();
    			a4 = element("a");
    			t41 = text("Full Case Study");
    			span3 = element("span");
    			i3 = element("i");
    			t42 = space();
    			section1 = element("section");
    			div36 = element("div");
    			div35 = element("div");
    			div29 = element("div");
    			div28 = element("div");
    			img5 = element("img");
    			t43 = space();
    			div32 = element("div");
    			div31 = element("div");
    			div30 = element("div");
    			span4 = element("span");
    			span4.textContent = "Our Company Community";
    			t45 = space();
    			h45 = element("h4");
    			h45.textContent = "Top Technology and IT services with Our Agency..";
    			t47 = space();
    			img6 = element("img");
    			t48 = space();
    			div34 = element("div");
    			div33 = element("div");
    			p5 = element("p");
    			p5.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at dictum risus, non suscipit arcu. Quisque aliquam posuere tortor, sit amet convallis nunc scelerisque in Quisque aliquam posuere.";
    			t50 = space();
    			a5 = element("a");
    			a5.textContent = "Read More";
    			t52 = space();
    			section2 = element("section");
    			div62 = element("div");
    			div40 = element("div");
    			div39 = element("div");
    			div38 = element("div");
    			div37 = element("div");
    			img7 = element("img");
    			t53 = space();
    			h21 = element("h2");
    			h21.textContent = "Awesome Team";
    			t55 = space();
    			p6 = element("p");
    			p6.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis accumsan nisi Ut ut felis congue nisl hendrerit commodo.";
    			t57 = space();
    			div61 = element("div");
    			div45 = element("div");
    			div44 = element("div");
    			div41 = element("div");
    			img8 = element("img");
    			t58 = space();
    			div42 = element("div");
    			h50 = element("h5");
    			h50.textContent = "Joman Helal";
    			t60 = space();
    			p7 = element("p");
    			p7.textContent = "Executive Officer";
    			t62 = space();
    			div43 = element("div");
    			a6 = element("a");
    			i4 = element("i");
    			t63 = space();
    			div50 = element("div");
    			div49 = element("div");
    			div46 = element("div");
    			img9 = element("img");
    			t64 = space();
    			div47 = element("div");
    			h51 = element("h5");
    			h51.textContent = "Slans Alons";
    			t66 = space();
    			p8 = element("p");
    			p8.textContent = "Business Development";
    			t68 = space();
    			div48 = element("div");
    			a7 = element("a");
    			i5 = element("i");
    			t69 = space();
    			div55 = element("div");
    			div54 = element("div");
    			div51 = element("div");
    			img10 = element("img");
    			t70 = space();
    			div52 = element("div");
    			h52 = element("h5");
    			h52.textContent = "Josha Michal";
    			t72 = space();
    			p9 = element("p");
    			p9.textContent = "UX/UI Designer";
    			t74 = space();
    			div53 = element("div");
    			a8 = element("a");
    			i6 = element("i");
    			t75 = space();
    			div60 = element("div");
    			div59 = element("div");
    			div56 = element("div");
    			img11 = element("img");
    			t76 = space();
    			div57 = element("div");
    			h53 = element("h5");
    			h53.textContent = "Johan Wright";
    			t78 = space();
    			p10 = element("p");
    			p10.textContent = "Head of Marketing";
    			t80 = space();
    			div58 = element("div");
    			a9 = element("a");
    			i7 = element("i");
    			attr_dev(h20, "class", "w-text title wow fadeInUp");
    			attr_dev(h20, "data-wow-delay", "0.2s");
    			add_location(h20, file$1, 9, 28, 420);
    			attr_dev(a0, "href", "#top");
    			add_location(a0, file$1, 11, 60, 664);
    			attr_dev(li0, "class", "breadcrumb-item");
    			add_location(li0, file$1, 11, 32, 636);
    			attr_dev(li1, "class", "breadcrumb-item active");
    			attr_dev(li1, "aria-current", "page");
    			add_location(li1, file$1, 12, 32, 725);
    			attr_dev(ol, "class", "breadcrumb justify-content-center wow fadeInUp");
    			attr_dev(ol, "data-wow-delay", "0.4s");
    			add_location(ol, file$1, 10, 28, 522);
    			attr_dev(nav, "aria-label", "breadcrumb");
    			attr_dev(nav, "class", "breadcumb--con text-center");
    			add_location(nav, file$1, 8, 24, 327);
    			attr_dev(div0, "class", "col-12");
    			add_location(div0, file$1, 7, 20, 282);
    			attr_dev(div1, "class", "row h-100 align-items-center");
    			add_location(div1, file$1, 6, 16, 219);
    			attr_dev(div2, "class", "container h-100");
    			add_location(div2, file$1, 5, 12, 173);
    			attr_dev(div3, "class", "breadcumb-content");
    			add_location(div3, file$1, 4, 8, 129);
    			attr_dev(div4, "class", "breadcumb-area");
    			add_location(div4, file$1, 1, 4, 48);
    			attr_dev(h40, "class", "fadeInUp");
    			attr_dev(h40, "data-wow-delay", "0.3s");
    			add_location(h40, file$1, 27, 24, 1266);
    			if (!src_url_equal(img0.src, img0_src_value = "img/svg/divider-01.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "width", "100");
    			attr_dev(img0, "alt", "divider");
    			add_location(img0, file$1, 28, 24, 1360);
    			attr_dev(div5, "class", "who-we-contant");
    			add_location(div5, file$1, 26, 20, 1213);
    			attr_dev(div6, "class", "col-12 col-lg-6 offset-lg-0");
    			add_location(div6, file$1, 25, 16, 1151);
    			add_location(p0, file$1, 33, 24, 1616);
    			attr_dev(div7, "class", "who-we-contant left-bor");
    			add_location(div7, file$1, 32, 20, 1554);
    			attr_dev(div8, "class", "col-12 col-lg-6 offset-lg-0 mt-s");
    			add_location(div8, file$1, 31, 16, 1487);
    			attr_dev(div9, "class", "row align-items-center mb-50");
    			add_location(div9, file$1, 24, 12, 1092);
    			if (!src_url_equal(img1.src, img1_src_value = "img/projects/1.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "img-responsive ");
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$1, 42, 28, 2161);
    			attr_dev(div10, "class", "project_img");
    			add_location(div10, file$1, 41, 24, 2107);
    			add_location(br0, file$1, 45, 45, 2350);
    			add_location(h41, file$1, 45, 28, 2333);
    			add_location(p1, file$1, 46, 28, 2405);
    			attr_dev(i0, "class", "fa fa-arrow-right");
    			add_location(i0, file$1, 47, 80, 2509);
    			add_location(span0, file$1, 47, 74, 2503);
    			attr_dev(a1, "href", "project-details.html");
    			add_location(a1, file$1, 47, 28, 2457);
    			attr_dev(div11, "class", "project_info");
    			add_location(div11, file$1, 44, 24, 2278);
    			attr_dev(div12, "class", "project_single wow fadeInUp");
    			attr_dev(div12, "data-wow-delay", "0.2s");
    			add_location(div12, file$1, 40, 20, 2019);
    			attr_dev(div13, "class", "col-12 col-lg-6");
    			add_location(div13, file$1, 38, 16, 1932);
    			if (!src_url_equal(img2.src, img2_src_value = "img/projects/2.jpg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "img-responsive ");
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$1, 55, 28, 2880);
    			attr_dev(div14, "class", "project_img");
    			add_location(div14, file$1, 54, 24, 2826);
    			add_location(br1, file$1, 58, 48, 3072);
    			add_location(h42, file$1, 58, 28, 3052);
    			add_location(p2, file$1, 59, 28, 3127);
    			attr_dev(i1, "class", "fa fa-arrow-right");
    			add_location(i1, file$1, 60, 80, 3226);
    			add_location(span1, file$1, 60, 74, 3220);
    			attr_dev(a2, "href", "project-details.html");
    			add_location(a2, file$1, 60, 28, 3174);
    			attr_dev(div15, "class", "project_info");
    			add_location(div15, file$1, 57, 24, 2997);
    			attr_dev(div16, "class", "project_single wow fadeInUp");
    			attr_dev(div16, "data-wow-delay", "0.3s");
    			add_location(div16, file$1, 53, 20, 2738);
    			attr_dev(div17, "class", "col-12 col-lg-6");
    			add_location(div17, file$1, 51, 16, 2651);
    			if (!src_url_equal(img3.src, img3_src_value = "img/projects/3.jpg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "class", "img-responsive ");
    			attr_dev(img3, "alt", "");
    			add_location(img3, file$1, 68, 28, 3597);
    			attr_dev(div18, "class", "project_img");
    			add_location(div18, file$1, 67, 24, 3543);
    			add_location(br2, file$1, 71, 47, 3788);
    			add_location(h43, file$1, 71, 28, 3769);
    			add_location(p3, file$1, 72, 28, 3842);
    			attr_dev(i2, "class", "fa fa-arrow-right");
    			add_location(i2, file$1, 73, 80, 3940);
    			add_location(span2, file$1, 73, 74, 3934);
    			attr_dev(a3, "href", "project-details.html");
    			add_location(a3, file$1, 73, 28, 3888);
    			attr_dev(div19, "class", "project_info");
    			add_location(div19, file$1, 70, 24, 3714);
    			attr_dev(div20, "class", "project_single wow fadeInUp");
    			attr_dev(div20, "data-wow-delay", "0.2s");
    			add_location(div20, file$1, 66, 20, 3455);
    			attr_dev(div21, "class", "col-12 col-lg-6");
    			add_location(div21, file$1, 64, 16, 3368);
    			if (!src_url_equal(img4.src, img4_src_value = "img/projects/4.jpg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "class", "img-responsive ");
    			attr_dev(img4, "alt", "");
    			add_location(img4, file$1, 81, 28, 4311);
    			attr_dev(div22, "class", "project_img");
    			add_location(div22, file$1, 80, 24, 4257);
    			add_location(br3, file$1, 84, 49, 4504);
    			add_location(h44, file$1, 84, 28, 4483);
    			add_location(p4, file$1, 85, 28, 4560);
    			attr_dev(i3, "class", "fa fa-arrow-right");
    			add_location(i3, file$1, 86, 80, 4658);
    			add_location(span3, file$1, 86, 74, 4652);
    			attr_dev(a4, "href", "project-details.html");
    			add_location(a4, file$1, 86, 28, 4606);
    			attr_dev(div23, "class", "project_info");
    			add_location(div23, file$1, 83, 24, 4428);
    			attr_dev(div24, "class", "project_single wow fadeInUp");
    			attr_dev(div24, "data-wow-delay", "0.3s");
    			add_location(div24, file$1, 79, 20, 4169);
    			attr_dev(div25, "class", "col-12 col-lg-6");
    			add_location(div25, file$1, 77, 16, 4082);
    			attr_dev(div26, "class", "row");
    			add_location(div26, file$1, 37, 12, 1898);
    			attr_dev(div27, "class", "container");
    			add_location(div27, file$1, 23, 8, 1056);
    			attr_dev(section0, "class", "Projects section-padding-100");
    			add_location(section0, file$1, 22, 4, 1001);
    			attr_dev(img5, "draggable", "false");
    			if (!src_url_equal(img5.src, img5_src_value = "img/core-img/img4.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "");
    			add_location(img5, file$1, 101, 24, 5188);
    			attr_dev(div28, "class", "welcome-meter");
    			add_location(div28, file$1, 100, 20, 5136);
    			attr_dev(div29, "class", "col-12 col-lg-4 offset-lg-0 col-md-6");
    			add_location(div29, file$1, 99, 16, 5065);
    			attr_dev(span4, "class", "gradient-text");
    			add_location(span4, file$1, 107, 28, 5528);
    			attr_dev(div30, "class", "dream-dots text-left fadeInUp");
    			attr_dev(div30, "data-wow-delay", "0.2s");
    			add_location(div30, file$1, 106, 24, 5434);
    			attr_dev(h45, "class", "fadeInUp");
    			attr_dev(h45, "data-wow-delay", "0.3s");
    			add_location(h45, file$1, 109, 24, 5640);
    			if (!src_url_equal(img6.src, img6_src_value = "img/svg/divider-01.svg")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "width", "100");
    			attr_dev(img6, "class", "mt-15");
    			attr_dev(img6, "alt", "divider");
    			add_location(img6, file$1, 110, 24, 5761);
    			attr_dev(div31, "class", "who-we-contant");
    			add_location(div31, file$1, 105, 20, 5381);
    			attr_dev(div32, "class", "col-12 col-lg-4 offset-lg-0 mt-s");
    			add_location(div32, file$1, 104, 16, 5314);
    			add_location(p5, file$1, 115, 24, 6031);
    			attr_dev(a5, "class", "btn more-btn mt-30 fadeInUp");
    			attr_dev(a5, "data-wow-delay", "0.6s");
    			attr_dev(a5, "href", "about-us.html");
    			add_location(a5, file$1, 116, 24, 6256);
    			attr_dev(div33, "class", "who-we-contant left-bor");
    			add_location(div33, file$1, 114, 20, 5969);
    			attr_dev(div34, "class", "col-12 col-lg-4 offset-lg-0 mt-s");
    			add_location(div34, file$1, 113, 16, 5902);
    			attr_dev(div35, "class", "row align-items-center");
    			add_location(div35, file$1, 98, 12, 5012);
    			attr_dev(div36, "class", "container");
    			add_location(div36, file$1, 97, 8, 4976);
    			attr_dev(section1, "class", "about-us-area section-padding-0-0 clearfix");
    			attr_dev(section1, "id", "about");
    			add_location(section1, file$1, 96, 4, 4896);
    			if (!src_url_equal(img7.src, img7_src_value = "img/svg/divider-01.svg")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "width", "100");
    			attr_dev(img7, "class", "mb-15");
    			attr_dev(img7, "alt", "divider");
    			add_location(img7, file$1, 132, 28, 6931);
    			attr_dev(div37, "class", "dream-dots justify-content-center fadeInUp");
    			attr_dev(div37, "data-wow-delay", "0.2s");
    			add_location(div37, file$1, 131, 24, 6824);
    			attr_dev(h21, "class", "fadeInUp");
    			attr_dev(h21, "data-wow-delay", "0.3s");
    			add_location(h21, file$1, 134, 24, 7061);
    			attr_dev(p6, "class", "fadeInUp");
    			attr_dev(p6, "data-wow-delay", "0.4s");
    			add_location(p6, file$1, 135, 24, 7146);
    			attr_dev(div38, "class", "section-heading text-center");
    			add_location(div38, file$1, 129, 20, 6733);
    			attr_dev(div39, "class", "col-12");
    			add_location(div39, file$1, 128, 16, 6692);
    			attr_dev(div40, "class", "row");
    			add_location(div40, file$1, 127, 12, 6658);
    			attr_dev(img8, "draggable", "false");
    			if (!src_url_equal(img8.src, img8_src_value = "img/team-img/avatar-1.png")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "class", "center-block");
    			attr_dev(img8, "alt", "");
    			add_location(img8, file$1, 146, 28, 7722);
    			attr_dev(div41, "class", "team-member-thumb");
    			add_location(div41, file$1, 145, 24, 7662);
    			attr_dev(h50, "class", "w-text");
    			add_location(h50, file$1, 150, 28, 7956);
    			attr_dev(p7, "class", "g-text");
    			add_location(p7, file$1, 151, 28, 8020);
    			attr_dev(div42, "class", "team-info");
    			add_location(div42, file$1, 149, 24, 7904);
    			attr_dev(i4, "class", "fa fa-linkedin");
    			add_location(i4, file$1, 155, 43, 8234);
    			attr_dev(a6, "href", "#top");
    			add_location(a6, file$1, 155, 28, 8219);
    			attr_dev(div43, "class", "team-social-icon");
    			add_location(div43, file$1, 154, 24, 8160);
    			attr_dev(div44, "class", "single-team-member fadeInUp");
    			attr_dev(div44, "data-wow-delay", "0.2s");
    			add_location(div44, file$1, 143, 20, 7535);
    			attr_dev(div45, "class", "col-12 col-sm-6 col-lg-3");
    			add_location(div45, file$1, 142, 16, 7476);
    			attr_dev(img9, "draggable", "false");
    			if (!src_url_equal(img9.src, img9_src_value = "img/team-img/avatar-2.png")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "class", "center-block");
    			attr_dev(img9, "alt", "");
    			add_location(img9, file$1, 165, 28, 8657);
    			attr_dev(div46, "class", "team-member-thumb");
    			add_location(div46, file$1, 164, 24, 8597);
    			attr_dev(h51, "class", "w-text");
    			add_location(h51, file$1, 169, 28, 8891);
    			attr_dev(p8, "class", "g-text");
    			add_location(p8, file$1, 170, 28, 8955);
    			attr_dev(div47, "class", "team-info");
    			add_location(div47, file$1, 168, 24, 8839);
    			attr_dev(i5, "class", "fa fa-linkedin");
    			add_location(i5, file$1, 174, 43, 9172);
    			attr_dev(a7, "href", "#top");
    			add_location(a7, file$1, 174, 28, 9157);
    			attr_dev(div48, "class", "team-social-icon");
    			add_location(div48, file$1, 173, 24, 9098);
    			attr_dev(div49, "class", "single-team-member fadeInUp");
    			attr_dev(div49, "data-wow-delay", "0.3s");
    			add_location(div49, file$1, 162, 20, 8470);
    			attr_dev(div50, "class", "col-12 col-sm-6 col-lg-3");
    			add_location(div50, file$1, 161, 16, 8411);
    			attr_dev(img10, "draggable", "false");
    			if (!src_url_equal(img10.src, img10_src_value = "img/team-img/avatar-3.png")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "class", "center-block");
    			attr_dev(img10, "alt", "");
    			add_location(img10, file$1, 184, 28, 9595);
    			attr_dev(div51, "class", "team-member-thumb");
    			add_location(div51, file$1, 183, 24, 9535);
    			attr_dev(h52, "class", "w-text");
    			add_location(h52, file$1, 188, 28, 9829);
    			attr_dev(p9, "class", "g-text");
    			add_location(p9, file$1, 189, 28, 9894);
    			attr_dev(div52, "class", "team-info");
    			add_location(div52, file$1, 187, 24, 9777);
    			attr_dev(i6, "class", "fa fa-linkedin");
    			add_location(i6, file$1, 193, 43, 10105);
    			attr_dev(a8, "href", "#top");
    			add_location(a8, file$1, 193, 28, 10090);
    			attr_dev(div53, "class", "team-social-icon");
    			add_location(div53, file$1, 192, 24, 10031);
    			attr_dev(div54, "class", "single-team-member fadeInUp");
    			attr_dev(div54, "data-wow-delay", "0.4s");
    			add_location(div54, file$1, 181, 20, 9408);
    			attr_dev(div55, "class", "col-12 col-sm-6 col-lg-3");
    			add_location(div55, file$1, 180, 16, 9349);
    			attr_dev(img11, "draggable", "false");
    			if (!src_url_equal(img11.src, img11_src_value = "img/team-img/avatar-4.png")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "class", "center-block");
    			attr_dev(img11, "alt", "");
    			add_location(img11, file$1, 203, 28, 10528);
    			attr_dev(div56, "class", "team-member-thumb");
    			add_location(div56, file$1, 202, 24, 10468);
    			attr_dev(h53, "class", "w-text");
    			add_location(h53, file$1, 207, 28, 10762);
    			attr_dev(p10, "class", "g-text");
    			add_location(p10, file$1, 208, 28, 10827);
    			attr_dev(div57, "class", "team-info");
    			add_location(div57, file$1, 206, 24, 10710);
    			attr_dev(i7, "class", "fa fa-linkedin");
    			add_location(i7, file$1, 212, 43, 11034);
    			attr_dev(a9, "href", "#top");
    			add_location(a9, file$1, 212, 28, 11019);
    			attr_dev(div58, "class", "team-social-icon");
    			add_location(div58, file$1, 211, 24, 10960);
    			attr_dev(div59, "class", "single-team-member fadeInUp");
    			attr_dev(div59, "data-wow-delay", "0.5s");
    			add_location(div59, file$1, 200, 20, 10341);
    			attr_dev(div60, "class", "col-12 col-sm-6 col-lg-3");
    			add_location(div60, file$1, 199, 16, 10282);
    			attr_dev(div61, "class", "row");
    			add_location(div61, file$1, 140, 12, 7398);
    			attr_dev(div62, "class", "container");
    			add_location(div62, file$1, 126, 8, 6622);
    			attr_dev(section2, "class", "our_team_area section-padding-100-70 clearfix");
    			attr_dev(section2, "id", "team");
    			add_location(section2, file$1, 125, 4, 6540);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, nav);
    			append_dev(nav, h20);
    			append_dev(nav, t1);
    			append_dev(nav, ol);
    			append_dev(ol, li0);
    			append_dev(li0, a0);
    			append_dev(ol, t3);
    			append_dev(ol, li1);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, section0, anchor);
    			append_dev(section0, div27);
    			append_dev(div27, div9);
    			append_dev(div9, div6);
    			append_dev(div6, div5);
    			append_dev(div5, h40);
    			append_dev(div5, t7);
    			append_dev(div5, img0);
    			append_dev(div9, t8);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, p0);
    			append_dev(div27, t10);
    			append_dev(div27, div26);
    			append_dev(div26, div13);
    			append_dev(div13, div12);
    			append_dev(div12, div10);
    			append_dev(div10, img1);
    			append_dev(div12, t11);
    			append_dev(div12, div11);
    			append_dev(div11, h41);
    			append_dev(h41, t12);
    			append_dev(h41, br0);
    			append_dev(h41, t13);
    			append_dev(div11, t14);
    			append_dev(div11, p1);
    			append_dev(div11, t16);
    			append_dev(div11, a1);
    			append_dev(a1, t17);
    			append_dev(a1, span0);
    			append_dev(span0, i0);
    			append_dev(div26, t18);
    			append_dev(div26, div17);
    			append_dev(div17, div16);
    			append_dev(div16, div14);
    			append_dev(div14, img2);
    			append_dev(div16, t19);
    			append_dev(div16, div15);
    			append_dev(div15, h42);
    			append_dev(h42, t20);
    			append_dev(h42, br1);
    			append_dev(h42, t21);
    			append_dev(div15, t22);
    			append_dev(div15, p2);
    			append_dev(div15, t24);
    			append_dev(div15, a2);
    			append_dev(a2, t25);
    			append_dev(a2, span1);
    			append_dev(span1, i1);
    			append_dev(div26, t26);
    			append_dev(div26, div21);
    			append_dev(div21, div20);
    			append_dev(div20, div18);
    			append_dev(div18, img3);
    			append_dev(div20, t27);
    			append_dev(div20, div19);
    			append_dev(div19, h43);
    			append_dev(h43, t28);
    			append_dev(h43, br2);
    			append_dev(h43, t29);
    			append_dev(div19, t30);
    			append_dev(div19, p3);
    			append_dev(div19, t32);
    			append_dev(div19, a3);
    			append_dev(a3, t33);
    			append_dev(a3, span2);
    			append_dev(span2, i2);
    			append_dev(div26, t34);
    			append_dev(div26, div25);
    			append_dev(div25, div24);
    			append_dev(div24, div22);
    			append_dev(div22, img4);
    			append_dev(div24, t35);
    			append_dev(div24, div23);
    			append_dev(div23, h44);
    			append_dev(h44, t36);
    			append_dev(h44, br3);
    			append_dev(h44, t37);
    			append_dev(div23, t38);
    			append_dev(div23, p4);
    			append_dev(div23, t40);
    			append_dev(div23, a4);
    			append_dev(a4, t41);
    			append_dev(a4, span3);
    			append_dev(span3, i3);
    			insert_dev(target, t42, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div36);
    			append_dev(div36, div35);
    			append_dev(div35, div29);
    			append_dev(div29, div28);
    			append_dev(div28, img5);
    			append_dev(div35, t43);
    			append_dev(div35, div32);
    			append_dev(div32, div31);
    			append_dev(div31, div30);
    			append_dev(div30, span4);
    			append_dev(div31, t45);
    			append_dev(div31, h45);
    			append_dev(div31, t47);
    			append_dev(div31, img6);
    			append_dev(div35, t48);
    			append_dev(div35, div34);
    			append_dev(div34, div33);
    			append_dev(div33, p5);
    			append_dev(div33, t50);
    			append_dev(div33, a5);
    			insert_dev(target, t52, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, div62);
    			append_dev(div62, div40);
    			append_dev(div40, div39);
    			append_dev(div39, div38);
    			append_dev(div38, div37);
    			append_dev(div37, img7);
    			append_dev(div38, t53);
    			append_dev(div38, h21);
    			append_dev(div38, t55);
    			append_dev(div38, p6);
    			append_dev(div62, t57);
    			append_dev(div62, div61);
    			append_dev(div61, div45);
    			append_dev(div45, div44);
    			append_dev(div44, div41);
    			append_dev(div41, img8);
    			append_dev(div44, t58);
    			append_dev(div44, div42);
    			append_dev(div42, h50);
    			append_dev(div42, t60);
    			append_dev(div42, p7);
    			append_dev(div44, t62);
    			append_dev(div44, div43);
    			append_dev(div43, a6);
    			append_dev(a6, i4);
    			append_dev(div61, t63);
    			append_dev(div61, div50);
    			append_dev(div50, div49);
    			append_dev(div49, div46);
    			append_dev(div46, img9);
    			append_dev(div49, t64);
    			append_dev(div49, div47);
    			append_dev(div47, h51);
    			append_dev(div47, t66);
    			append_dev(div47, p8);
    			append_dev(div49, t68);
    			append_dev(div49, div48);
    			append_dev(div48, a7);
    			append_dev(a7, i5);
    			append_dev(div61, t69);
    			append_dev(div61, div55);
    			append_dev(div55, div54);
    			append_dev(div54, div51);
    			append_dev(div51, img10);
    			append_dev(div54, t70);
    			append_dev(div54, div52);
    			append_dev(div52, h52);
    			append_dev(div52, t72);
    			append_dev(div52, p9);
    			append_dev(div54, t74);
    			append_dev(div54, div53);
    			append_dev(div53, a8);
    			append_dev(a8, i6);
    			append_dev(div61, t75);
    			append_dev(div61, div60);
    			append_dev(div60, div59);
    			append_dev(div59, div56);
    			append_dev(div56, img11);
    			append_dev(div59, t76);
    			append_dev(div59, div57);
    			append_dev(div57, h53);
    			append_dev(div57, t78);
    			append_dev(div57, p10);
    			append_dev(div59, t80);
    			append_dev(div59, div58);
    			append_dev(div58, a9);
    			append_dev(a9, i7);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t42);
    			if (detaching) detach_dev(section1);
    			if (detaching) detach_dev(t52);
    			if (detaching) detach_dev(section2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ProyectosRealizados', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ProyectosRealizados> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class ProyectosRealizados extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProyectosRealizados",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\routes\Contacto.svelte generated by Svelte v3.59.2 */

    const file = "src\\routes\\Contacto.svelte";

    function create_fragment$1(ctx) {
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let nav;
    	let h20;
    	let t1;
    	let ol;
    	let li0;
    	let a;
    	let t3;
    	let li1;
    	let t5;
    	let div32;
    	let div31;
    	let div6;
    	let div5;
    	let img0;
    	let img0_src_value;
    	let t6;
    	let h21;
    	let t8;
    	let p0;
    	let t10;
    	let div30;
    	let div15;
    	let ul;
    	let li2;
    	let div7;
    	let i0;
    	let t11;
    	let h30;
    	let t13;
    	let div8;
    	let t15;
    	let li3;
    	let div9;
    	let i1;
    	let t16;
    	let h31;
    	let t18;
    	let div10;
    	let t20;
    	let li4;
    	let div11;
    	let i2;
    	let t21;
    	let h32;
    	let t23;
    	let div12;
    	let t25;
    	let li5;
    	let div13;
    	let i3;
    	let t26;
    	let h33;
    	let t28;
    	let div14;
    	let t30;
    	let div29;
    	let div28;
    	let form;
    	let div27;
    	let div17;
    	let div16;
    	let t31;
    	let div19;
    	let div18;
    	let input0;
    	let t32;
    	let span0;
    	let t33;
    	let span1;
    	let t34;
    	let label0;
    	let t36;
    	let div21;
    	let div20;
    	let input1;
    	let t37;
    	let span2;
    	let t38;
    	let span3;
    	let t39;
    	let label1;
    	let t41;
    	let div23;
    	let div22;
    	let input2;
    	let t42;
    	let span4;
    	let t43;
    	let span5;
    	let t44;
    	let label2;
    	let t46;
    	let div25;
    	let div24;
    	let textarea;
    	let t47;
    	let span6;
    	let t48;
    	let span7;
    	let t49;
    	let label3;
    	let t51;
    	let div26;
    	let button;
    	let t53;
    	let section;
    	let div45;
    	let div36;
    	let div35;
    	let div34;
    	let div33;
    	let img1;
    	let img1_src_value;
    	let t54;
    	let h22;
    	let t56;
    	let p1;
    	let t58;
    	let div44;
    	let div43;
    	let div37;
    	let img2;
    	let img2_src_value;
    	let t59;
    	let div38;
    	let img3;
    	let img3_src_value;
    	let t60;
    	let div39;
    	let img4;
    	let img4_src_value;
    	let t61;
    	let div40;
    	let img5;
    	let img5_src_value;
    	let t62;
    	let div41;
    	let img6;
    	let img6_src_value;
    	let t63;
    	let div42;
    	let img7;
    	let img7_src_value;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			nav = element("nav");
    			h20 = element("h2");
    			h20.textContent = "Contact Us";
    			t1 = space();
    			ol = element("ol");
    			li0 = element("li");
    			a = element("a");
    			a.textContent = "Home";
    			t3 = space();
    			li1 = element("li");
    			li1.textContent = "Contact Us";
    			t5 = space();
    			div32 = element("div");
    			div31 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			img0 = element("img");
    			t6 = space();
    			h21 = element("h2");
    			h21.textContent = "Contact With Us";
    			t8 = space();
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis accumsan nisi Ut ut felis congue nisl hendrerit commodo.";
    			t10 = space();
    			div30 = element("div");
    			div15 = element("div");
    			ul = element("ul");
    			li2 = element("li");
    			div7 = element("div");
    			i0 = element("i");
    			t11 = space();
    			h30 = element("h3");
    			h30.textContent = "Support Email";
    			t13 = space();
    			div8 = element("div");
    			div8.textContent = "Hello@yourdomain.com";
    			t15 = space();
    			li3 = element("li");
    			div9 = element("div");
    			i1 = element("i");
    			t16 = space();
    			h31 = element("h3");
    			h31.textContent = "Phone Number";
    			t18 = space();
    			div10 = element("div");
    			div10.textContent = "(039) 245 90238";
    			t20 = space();
    			li4 = element("li");
    			div11 = element("div");
    			i2 = element("i");
    			t21 = space();
    			h32 = element("h3");
    			h32.textContent = "Working Hours";
    			t23 = space();
    			div12 = element("div");
    			div12.textContent = "9AM to 5PM Sunday To Friday";
    			t25 = space();
    			li5 = element("li");
    			div13 = element("div");
    			i3 = element("i");
    			t26 = space();
    			h33 = element("h3");
    			h33.textContent = "Location";
    			t28 = space();
    			div14 = element("div");
    			div14.textContent = "72 St, Newyork, Downtown Tower";
    			t30 = space();
    			div29 = element("div");
    			div28 = element("div");
    			form = element("form");
    			div27 = element("div");
    			div17 = element("div");
    			div16 = element("div");
    			t31 = space();
    			div19 = element("div");
    			div18 = element("div");
    			input0 = element("input");
    			t32 = space();
    			span0 = element("span");
    			t33 = space();
    			span1 = element("span");
    			t34 = space();
    			label0 = element("label");
    			label0.textContent = "Name";
    			t36 = space();
    			div21 = element("div");
    			div20 = element("div");
    			input1 = element("input");
    			t37 = space();
    			span2 = element("span");
    			t38 = space();
    			span3 = element("span");
    			t39 = space();
    			label1 = element("label");
    			label1.textContent = "Email";
    			t41 = space();
    			div23 = element("div");
    			div22 = element("div");
    			input2 = element("input");
    			t42 = space();
    			span4 = element("span");
    			t43 = space();
    			span5 = element("span");
    			t44 = space();
    			label2 = element("label");
    			label2.textContent = "Subject";
    			t46 = space();
    			div25 = element("div");
    			div24 = element("div");
    			textarea = element("textarea");
    			t47 = space();
    			span6 = element("span");
    			t48 = space();
    			span7 = element("span");
    			t49 = space();
    			label3 = element("label");
    			label3.textContent = "Message";
    			t51 = space();
    			div26 = element("div");
    			button = element("button");
    			button.textContent = "Send Message";
    			t53 = space();
    			section = element("section");
    			div45 = element("div");
    			div36 = element("div");
    			div35 = element("div");
    			div34 = element("div");
    			div33 = element("div");
    			img1 = element("img");
    			t54 = space();
    			h22 = element("h2");
    			h22.textContent = "Out Top Sponsors";
    			t56 = space();
    			p1 = element("p");
    			p1.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis accumsan nisi Ut ut felis congue nisl hendrerit commodo.";
    			t58 = space();
    			div44 = element("div");
    			div43 = element("div");
    			div37 = element("div");
    			img2 = element("img");
    			t59 = space();
    			div38 = element("div");
    			img3 = element("img");
    			t60 = space();
    			div39 = element("div");
    			img4 = element("img");
    			t61 = space();
    			div40 = element("div");
    			img5 = element("img");
    			t62 = space();
    			div41 = element("div");
    			img6 = element("img");
    			t63 = space();
    			div42 = element("div");
    			img7 = element("img");
    			attr_dev(h20, "class", "w-text title wow fadeInUp");
    			attr_dev(h20, "data-wow-delay", "0.2s");
    			add_location(h20, file, 9, 28, 420);
    			attr_dev(a, "href", "#top");
    			add_location(a, file, 11, 60, 666);
    			attr_dev(li0, "class", "breadcrumb-item");
    			add_location(li0, file, 11, 32, 638);
    			attr_dev(li1, "class", "breadcrumb-item active");
    			attr_dev(li1, "aria-current", "page");
    			add_location(li1, file, 12, 32, 727);
    			attr_dev(ol, "class", "breadcrumb justify-content-center wow fadeInUp");
    			attr_dev(ol, "data-wow-delay", "0.4s");
    			add_location(ol, file, 10, 28, 524);
    			attr_dev(nav, "aria-label", "breadcrumb");
    			attr_dev(nav, "class", "breadcumb--con text-center");
    			add_location(nav, file, 8, 24, 327);
    			attr_dev(div0, "class", "col-12");
    			add_location(div0, file, 7, 20, 282);
    			attr_dev(div1, "class", "row h-100 align-items-center");
    			add_location(div1, file, 6, 16, 219);
    			attr_dev(div2, "class", "container h-100");
    			add_location(div2, file, 5, 12, 173);
    			attr_dev(div3, "class", "breadcumb-content");
    			add_location(div3, file, 4, 8, 129);
    			attr_dev(div4, "class", "breadcumb-area");
    			add_location(div4, file, 1, 4, 48);
    			if (!src_url_equal(img0.src, img0_src_value = "img/svg/divider-01.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "width", "100");
    			attr_dev(img0, "class", "mb-15");
    			attr_dev(img0, "alt", "divider");
    			add_location(img0, file, 28, 20, 1345);
    			attr_dev(div5, "class", "dream-dots justify-content-center fadeInUp");
    			attr_dev(div5, "data-wow-delay", "0.2s");
    			add_location(div5, file, 27, 16, 1246);
    			attr_dev(h21, "class", "fadeInUp");
    			attr_dev(h21, "data-wow-delay", "0.3s");
    			add_location(h21, file, 30, 16, 1459);
    			attr_dev(p0, "class", "fadeInUp");
    			attr_dev(p0, "data-wow-delay", "0.4s");
    			add_location(p0, file, 31, 16, 1539);
    			attr_dev(div6, "class", "section-heading text-center");
    			add_location(div6, file, 25, 12, 1167);
    			attr_dev(i0, "class", "fa fa-envelope-o");
    			add_location(i0, file, 38, 55, 2016);
    			attr_dev(div7, "class", "icon-font-box");
    			add_location(div7, file, 38, 28, 1989);
    			add_location(h30, file, 39, 28, 2083);
    			attr_dev(div8, "class", "text width-80");
    			add_location(div8, file, 40, 28, 2134);
    			attr_dev(li2, "class", "inner-box");
    			add_location(li2, file, 37, 24, 1938);
    			attr_dev(i1, "class", "fa fa-phone");
    			add_location(i1, file, 43, 55, 2320);
    			attr_dev(div9, "class", "icon-font-box");
    			add_location(div9, file, 43, 28, 2293);
    			add_location(h31, file, 44, 28, 2382);
    			attr_dev(div10, "class", "text width-80");
    			add_location(div10, file, 45, 28, 2432);
    			attr_dev(li3, "class", "inner-box");
    			add_location(li3, file, 42, 24, 2242);
    			attr_dev(i2, "class", "fa fa-calendar-o");
    			add_location(i2, file, 48, 55, 2613);
    			attr_dev(div11, "class", "icon-font-box");
    			add_location(div11, file, 48, 28, 2586);
    			add_location(h32, file, 49, 28, 2680);
    			attr_dev(div12, "class", "text width-80");
    			add_location(div12, file, 50, 28, 2731);
    			attr_dev(li4, "class", "inner-box");
    			add_location(li4, file, 47, 24, 2535);
    			attr_dev(i3, "class", "fa fa-map-o");
    			add_location(i3, file, 53, 55, 2924);
    			attr_dev(div13, "class", "icon-font-box");
    			add_location(div13, file, 53, 28, 2897);
    			add_location(h33, file, 54, 28, 2986);
    			attr_dev(div14, "class", "text width-80");
    			add_location(div14, file, 55, 28, 3032);
    			attr_dev(li5, "class", "inner-box");
    			add_location(li5, file, 52, 24, 2846);
    			attr_dev(ul, "class", "services-block-four");
    			add_location(ul, file, 36, 20, 1881);
    			attr_dev(div15, "class", "col-12 col-lg-4");
    			add_location(div15, file, 35, 16, 1831);
    			attr_dev(div16, "id", "success_fail_info");
    			add_location(div16, file, 64, 36, 3513);
    			attr_dev(div17, "class", "col-12");
    			add_location(div17, file, 63, 32, 3456);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "id", "name");
    			input0.required = true;
    			add_location(input0, file, 69, 40, 3777);
    			attr_dev(span0, "class", "highlight");
    			add_location(span0, file, 70, 40, 3868);
    			attr_dev(span1, "class", "bar");
    			add_location(span1, file, 71, 40, 3940);
    			add_location(label0, file, 73, 40, 4103);
    			attr_dev(div18, "class", "group fadeInUp");
    			attr_dev(div18, "data-wow-delay", "0.2s");
    			add_location(div18, file, 68, 36, 3686);
    			attr_dev(div19, "class", "col-12 col-md-6");
    			add_location(div19, file, 67, 32, 3620);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "email");
    			attr_dev(input1, "id", "email");
    			input1.required = true;
    			add_location(input1, file, 78, 40, 4394);
    			attr_dev(span2, "class", "highlight");
    			add_location(span2, file, 79, 40, 4487);
    			attr_dev(span3, "class", "bar");
    			add_location(span3, file, 80, 40, 4559);
    			add_location(label1, file, 82, 40, 4722);
    			attr_dev(div20, "class", "group fadeInUp");
    			attr_dev(div20, "data-wow-delay", "0.3s");
    			add_location(div20, file, 77, 36, 4303);
    			attr_dev(div21, "class", "col-12 col-md-6");
    			add_location(div21, file, 76, 32, 4237);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "name", "subject");
    			attr_dev(input2, "id", "subject");
    			input2.required = true;
    			add_location(input2, file, 87, 40, 5005);
    			attr_dev(span4, "class", "highlight");
    			add_location(span4, file, 88, 40, 5102);
    			attr_dev(span5, "class", "bar");
    			add_location(span5, file, 89, 40, 5174);
    			add_location(label2, file, 91, 40, 5337);
    			attr_dev(div22, "class", "group fadeInUp");
    			attr_dev(div22, "data-wow-delay", "0.4s");
    			add_location(div22, file, 86, 36, 4914);
    			attr_dev(div23, "class", "col-12");
    			add_location(div23, file, 85, 32, 4857);
    			attr_dev(textarea, "name", "message");
    			attr_dev(textarea, "id", "message");
    			textarea.required = true;
    			add_location(textarea, file, 96, 40, 5622);
    			attr_dev(span6, "class", "highlight");
    			add_location(span6, file, 97, 40, 5721);
    			attr_dev(span7, "class", "bar");
    			add_location(span7, file, 98, 40, 5793);
    			add_location(label3, file, 100, 40, 5956);
    			attr_dev(div24, "class", "group fadeInUp");
    			attr_dev(div24, "data-wow-delay", "0.5s");
    			add_location(div24, file, 95, 36, 5531);
    			attr_dev(div25, "class", "col-12");
    			add_location(div25, file, 94, 32, 5474);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "btn more-btn");
    			add_location(button, file, 104, 36, 6193);
    			attr_dev(div26, "class", "col-12 text-center fadeInUp");
    			attr_dev(div26, "data-wow-delay", "0.6s");
    			add_location(div26, file, 103, 32, 6093);
    			attr_dev(div27, "class", "row");
    			add_location(div27, file, 62, 28, 3406);
    			attr_dev(form, "action", "#top");
    			attr_dev(form, "method", "post");
    			attr_dev(form, "id", "main_contact_form");
    			form.noValidate = true;
    			add_location(form, file, 61, 24, 3309);
    			attr_dev(div28, "class", "contact_form grediant-borders");
    			add_location(div28, file, 60, 20, 3241);
    			attr_dev(div29, "class", "col-12 col-lg-8");
    			add_location(div29, file, 59, 16, 3191);
    			attr_dev(div30, "class", "row justify-content-center");
    			add_location(div30, file, 34, 12, 1774);
    			attr_dev(div31, "class", "container");
    			add_location(div31, file, 24, 8, 1131);
    			attr_dev(div32, "class", "contact_us_area section-padding-100-70");
    			attr_dev(div32, "id", "contact");
    			add_location(div32, file, 23, 4, 1057);
    			if (!src_url_equal(img1.src, img1_src_value = "img/svg/divider-01.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "width", "100");
    			attr_dev(img1, "class", "mb-15");
    			attr_dev(img1, "alt", "divider");
    			add_location(img1, file, 123, 28, 6940);
    			attr_dev(div33, "class", "dream-dots justify-content-center fadeInUp");
    			attr_dev(div33, "data-wow-delay", "0.2s");
    			add_location(div33, file, 122, 24, 6833);
    			attr_dev(h22, "class", "fadeInUp");
    			attr_dev(h22, "data-wow-delay", "0.3s");
    			add_location(h22, file, 125, 24, 7070);
    			attr_dev(p1, "class", "fadeInUp");
    			attr_dev(p1, "data-wow-delay", "0.4s");
    			add_location(p1, file, 126, 24, 7159);
    			attr_dev(div34, "class", "section-heading text-center");
    			add_location(div34, file, 120, 20, 6742);
    			attr_dev(div35, "class", "col-12");
    			add_location(div35, file, 119, 16, 6701);
    			attr_dev(div36, "class", "row");
    			add_location(div36, file, 118, 12, 6667);
    			if (!src_url_equal(img2.src, img2_src_value = "img/partners/2.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			add_location(img2, file, 134, 24, 7561);
    			attr_dev(div37, "class", "col-lg-2 col-md-4 col-sm-4 col-xs-6");
    			add_location(div37, file, 133, 20, 7487);
    			if (!src_url_equal(img3.src, img3_src_value = "img/partners/1.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "");
    			add_location(img3, file, 137, 24, 7720);
    			attr_dev(div38, "class", "col-lg-2 col-md-4 col-sm-4 col-xs-6");
    			add_location(div38, file, 136, 20, 7646);
    			if (!src_url_equal(img4.src, img4_src_value = "img/partners/3.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "");
    			add_location(img4, file, 140, 24, 7879);
    			attr_dev(div39, "class", "col-lg-2 col-md-4 col-sm-4 col-xs-6");
    			add_location(div39, file, 139, 20, 7805);
    			if (!src_url_equal(img5.src, img5_src_value = "img/partners/4.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "");
    			add_location(img5, file, 143, 24, 8038);
    			attr_dev(div40, "class", "col-lg-2 col-md-4 col-sm-4 col-xs-6");
    			add_location(div40, file, 142, 20, 7964);
    			if (!src_url_equal(img6.src, img6_src_value = "img/partners/5.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "");
    			add_location(img6, file, 146, 24, 8197);
    			attr_dev(div41, "class", "col-lg-2 col-md-4 col-sm-4 col-xs-6");
    			add_location(div41, file, 145, 20, 8123);
    			if (!src_url_equal(img7.src, img7_src_value = "img/partners/6.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "");
    			add_location(img7, file, 149, 24, 8356);
    			attr_dev(div42, "class", "col-lg-2 col-md-4 col-sm-4 col-xs-6");
    			add_location(div42, file, 148, 20, 8282);
    			attr_dev(div43, "class", "row");
    			add_location(div43, file, 132, 16, 7449);
    			attr_dev(div44, "class", "parttns");
    			add_location(div44, file, 131, 12, 7411);
    			attr_dev(div45, "class", "container");
    			add_location(div45, file, 117, 8, 6631);
    			attr_dev(section, "class", "our_team_area section-padding-0-100 clearfix");
    			attr_dev(section, "id", "team");
    			add_location(section, file, 116, 4, 6550);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, nav);
    			append_dev(nav, h20);
    			append_dev(nav, t1);
    			append_dev(nav, ol);
    			append_dev(ol, li0);
    			append_dev(li0, a);
    			append_dev(ol, t3);
    			append_dev(ol, li1);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div32, anchor);
    			append_dev(div32, div31);
    			append_dev(div31, div6);
    			append_dev(div6, div5);
    			append_dev(div5, img0);
    			append_dev(div6, t6);
    			append_dev(div6, h21);
    			append_dev(div6, t8);
    			append_dev(div6, p0);
    			append_dev(div31, t10);
    			append_dev(div31, div30);
    			append_dev(div30, div15);
    			append_dev(div15, ul);
    			append_dev(ul, li2);
    			append_dev(li2, div7);
    			append_dev(div7, i0);
    			append_dev(li2, t11);
    			append_dev(li2, h30);
    			append_dev(li2, t13);
    			append_dev(li2, div8);
    			append_dev(ul, t15);
    			append_dev(ul, li3);
    			append_dev(li3, div9);
    			append_dev(div9, i1);
    			append_dev(li3, t16);
    			append_dev(li3, h31);
    			append_dev(li3, t18);
    			append_dev(li3, div10);
    			append_dev(ul, t20);
    			append_dev(ul, li4);
    			append_dev(li4, div11);
    			append_dev(div11, i2);
    			append_dev(li4, t21);
    			append_dev(li4, h32);
    			append_dev(li4, t23);
    			append_dev(li4, div12);
    			append_dev(ul, t25);
    			append_dev(ul, li5);
    			append_dev(li5, div13);
    			append_dev(div13, i3);
    			append_dev(li5, t26);
    			append_dev(li5, h33);
    			append_dev(li5, t28);
    			append_dev(li5, div14);
    			append_dev(div30, t30);
    			append_dev(div30, div29);
    			append_dev(div29, div28);
    			append_dev(div28, form);
    			append_dev(form, div27);
    			append_dev(div27, div17);
    			append_dev(div17, div16);
    			append_dev(div27, t31);
    			append_dev(div27, div19);
    			append_dev(div19, div18);
    			append_dev(div18, input0);
    			append_dev(div18, t32);
    			append_dev(div18, span0);
    			append_dev(div18, t33);
    			append_dev(div18, span1);
    			append_dev(div18, t34);
    			append_dev(div18, label0);
    			append_dev(div27, t36);
    			append_dev(div27, div21);
    			append_dev(div21, div20);
    			append_dev(div20, input1);
    			append_dev(div20, t37);
    			append_dev(div20, span2);
    			append_dev(div20, t38);
    			append_dev(div20, span3);
    			append_dev(div20, t39);
    			append_dev(div20, label1);
    			append_dev(div27, t41);
    			append_dev(div27, div23);
    			append_dev(div23, div22);
    			append_dev(div22, input2);
    			append_dev(div22, t42);
    			append_dev(div22, span4);
    			append_dev(div22, t43);
    			append_dev(div22, span5);
    			append_dev(div22, t44);
    			append_dev(div22, label2);
    			append_dev(div27, t46);
    			append_dev(div27, div25);
    			append_dev(div25, div24);
    			append_dev(div24, textarea);
    			append_dev(div24, t47);
    			append_dev(div24, span6);
    			append_dev(div24, t48);
    			append_dev(div24, span7);
    			append_dev(div24, t49);
    			append_dev(div24, label3);
    			append_dev(div27, t51);
    			append_dev(div27, div26);
    			append_dev(div26, button);
    			insert_dev(target, t53, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, div45);
    			append_dev(div45, div36);
    			append_dev(div36, div35);
    			append_dev(div35, div34);
    			append_dev(div34, div33);
    			append_dev(div33, img1);
    			append_dev(div34, t54);
    			append_dev(div34, h22);
    			append_dev(div34, t56);
    			append_dev(div34, p1);
    			append_dev(div45, t58);
    			append_dev(div45, div44);
    			append_dev(div44, div43);
    			append_dev(div43, div37);
    			append_dev(div37, img2);
    			append_dev(div43, t59);
    			append_dev(div43, div38);
    			append_dev(div38, img3);
    			append_dev(div43, t60);
    			append_dev(div43, div39);
    			append_dev(div39, img4);
    			append_dev(div43, t61);
    			append_dev(div43, div40);
    			append_dev(div40, img5);
    			append_dev(div43, t62);
    			append_dev(div43, div41);
    			append_dev(div41, img6);
    			append_dev(div43, t63);
    			append_dev(div43, div42);
    			append_dev(div42, img7);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div32);
    			if (detaching) detach_dev(t53);
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contacto', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contacto> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Contacto extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contacto",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const routes = [
      { path: '/', component: Inicio },
      { path: '/precios', component: Precios },
      { path: '/servicios', component: Servicios },
      { path: '/sobre-nosotros', component: SobreNosotros },
      { path: '/proyectos-realizados', component: ProyectosRealizados },
      { path: '/contacto', component: Contacto },
    ];

    /* src\App.svelte generated by Svelte v3.59.2 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i].path;
    	child_ctx[1] = list[i].component;
    	return child_ctx;
    }

    // (10:1) {#each routes as { path, component }}
    function create_each_block(ctx) {
    	let route;
    	let current;

    	route = new Route({
    			props: {
    				path: /*path*/ ctx[0],
    				component: /*component*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(10:1) {#each routes as { path, component }}",
    		ctx
    	});

    	return block;
    }

    // (8:0) <Router>
    function create_default_slot(ctx) {
    	let header;
    	let t;
    	let each_1_anchor;
    	let current;
    	header = new Header({ $$inline: true });
    	let each_value = routes;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*routes*/ 0) {
    				each_value = routes;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(8:0) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let router;
    	let t;
    	let footer;
    	let current;

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    			t = space();
    			create_component(footer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Header, Footer, Router, Route, routes });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
