// node_modules/jj/lib/bundle.js
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
function isDef(x) {
  return x !== void 0;
}
function isFn(x) {
  return typeof x === "function";
}
var { isNaN, isFinite, isInteger } = Number;
function isNum(x) {
  return typeof x === "number" && !isNaN(x);
}
function inRange(x, min, max) {
  if (!isNum(x)) {
    throw new TypeError(`inRange(): "x" must be a number. Got ${x} (${typeof x})`);
  }
  if (isDef(min)) {
    if (!isNum(min)) {
      throw new TypeError(`inRange(): "min" must be a number. Got ${min} (${typeof min})`);
    }
    if (isDef(max)) {
      if (!isNum(max)) {
        throw new TypeError(`inRange(): "max" must be a number. Got ${max} (${typeof max})`);
      }
      if (min > max) {
        return max <= x && x <= min;
      }
      return min <= x && x <= max;
    }
    return x >= min;
  } else if (isDef(max)) {
    if (!isNum(max)) {
      throw new TypeError(`inRange(): "max" must be a number. Got ${max} (${typeof max})`);
    }
    return x <= max;
  }
  throw new TypeError(`inRange(): expected at least min or max to be defined. Got min=${min} and max=${max}`);
}
var { isArray } = Array;
function isArr(x, minLen = 0, maxLen) {
  return isArray(x) && inRange(x.length, minLen, maxLen);
}
var { hasOwnProperty } = Object;
function isObj(x) {
  return Boolean(x) && typeof x === "object";
}
function isA(x, classConstructor) {
  if (!isFn(classConstructor)) {
    throw new TypeError(`Expected a constructor function. Got ${classConstructor} (${typeof classConstructor})`);
  }
  return x instanceof classConstructor;
}
function hasProp(x, ...propNames) {
  if (!isObj(x)) {
    return false;
  }
  for (let propName of propNames) {
    if (!(propName in x)) {
      return false;
    }
  }
  return true;
}
function isStr(x) {
  return typeof x === "string";
}
var { hasOwnProperty: hasOwnProperty2 } = Object;
var { isArray: isArray2 } = Array;
function errMsg(varName, expected, received) {
  return `Expected '${varName}' to be ${expected}. Got ${received} (${typeof received})`;
}
function typeErr(varName, expected, received) {
  return new TypeError(errMsg(varName, expected, received));
}
function fileExt(path) {
  if (!isStr(path)) {
    throw typeErr("path", "a string", path);
  }
  const lastDotIndex = path.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return "";
  }
  const ext = path.slice(lastDotIndex + 1);
  if (ext.indexOf("/") !== -1) {
    return "";
  }
  return ext.toLowerCase().trim();
}
function nextAnimationFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}
function sleep(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function cssToStyle(css) {
  const sheet = new CSSStyleSheet();
  return await sheet.replace(css);
}
function pas2keb(str) {
  if (!isStr(str)) {
    throw typeErr("str", "a string", str);
  }
  if (/[^a-zA-Z0-9_]/.test(str)) {
    throw new SyntaxError(errMsg("str", "alphanumeric characters and underscores", str));
  }
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").replace(/_/g, "-").toLowerCase();
}
function keb2pas(str) {
  if (!isStr(str)) {
    throw typeErr("str", "a string", str);
  }
  return str.split("-").filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("") || // Handle strings that were not kebab-case to begin with (e.g. 'single', 'camelCase')
  (str.length > 0 ? str.charAt(0).toUpperCase() + str.slice(1) : "");
}
function keb2cam(str) {
  if (!isStr(str)) {
    throw typeErr("str", "a string", str);
  }
  return str.replace(/^-+|-+$/g, "").replace(/-+([a-z])/g, (g, c) => c.toUpperCase());
}
var _ref;
var _boundHandlers;
var _JJET_instances;
var getBoundHandler_fn;
var _JJET = class _JJET2 {
  /**
   * Creates a JJET instance.
   *
   * @param ref - The EventTarget to wrap.
   * @throws {TypeError} If `ref` is not an EventTarget.
   */
  constructor(ref) {
    __privateAdd(this, _JJET_instances);
    __privateAdd(this, _ref);
    __privateAdd(this, _boundHandlers, /* @__PURE__ */ new WeakMap());
    if (!isA(ref, EventTarget)) {
      throw new TypeError(`JJET expects an EventTarget instance. Got ${ref} (${typeof ref}). `);
    }
    __privateSet(this, _ref, ref);
  }
  static from(ref) {
    return new _JJET2(ref);
  }
  /**
   * Gets the underlying DOM object.
   */
  get ref() {
    return __privateGet(this, _ref);
  }
  /**
   * Adds an event listener.
   *
   * @remarks
   * The handler is automatically bound to this JJET instance, so `this` inside the handler
   * refers to the JJET instance, not the DOM element. To access the DOM element, use `this.ref`.
   *
   * @example
   * ```ts
   * JJET.from(window).on('resize', function() {
   *   console.log(this) // JJET instance
   *   console.log(this.ref) // window object
   * })
   * ```
   * @param eventName - The name of the event.
   * @param handler - The event handler.
   * @param options - Optional event listener options.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener | EventTarget.addEventListener}
   */
  on(eventName, handler, options) {
    const boundHandler = __privateMethod(this, _JJET_instances, getBoundHandler_fn).call(this, handler);
    this.ref.addEventListener(eventName, boundHandler, options);
    return this;
  }
  /**
   * Removes an event listener.
   *
   * @remarks
   * Pass the same handler reference that was used in `on()` to properly remove the listener.
   *
   * @example
   * ```ts
   * const handler = function() { console.log(this) }
   * JJET.from(window).on('resize', handler)
   * JJET.from(window).off('resize', handler)
   * ```
   * @param eventName - The name of the event.
   * @param handler - The event handler.
   * @param options - Optional event listener options or boolean.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener | EventTarget.removeEventListener}
   */
  off(eventName, handler, options) {
    const boundHandler = __privateMethod(this, _JJET_instances, getBoundHandler_fn).call(this, handler);
    this.ref.removeEventListener(eventName, boundHandler, options);
    return this;
  }
  /**
   * Dispatches an Event at the specified EventTarget.
   *
   * @param event - The Event object to dispatch.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent | EventTarget.dispatchEvent}
   */
  trigger(event) {
    this.ref.dispatchEvent(event);
    return this;
  }
  /**
   * Runs a function in the context of this JJET instance.
   *
   * @example
   * ```ts
   * node.run(function() {
   *   console.log(this.ref)
   * })
   * ```
   * @remarks
   * If you want to access the current JJ* instance using `this` keyword, you SHOULD use a `function` not an arrow function.
   * If the function throws, `run()` doesn't swallow the exception.
   * So if you're expecting an error, make sure to wrap it in a `try..catch` block and handle the exception.
   * If the function returns a promise, you can `await` on the response.
   *
   * @param fn - The function to run. `this` inside the function will refer to this JJET instance.
   * @param args - Arguments to pass to the function.
   * @returns The return value of the function.
   */
  run(fn, ...args) {
    return fn.call(this, ...args);
  }
};
_ref = /* @__PURE__ */ new WeakMap();
_boundHandlers = /* @__PURE__ */ new WeakMap();
_JJET_instances = /* @__PURE__ */ new WeakSet();
getBoundHandler_fn = function(handler) {
  if (handler === null) return null;
  let bound = __privateGet(this, _boundHandlers).get(handler);
  if (!bound) {
    if (typeof handler === "function") {
      bound = handler.bind(this);
    } else {
      bound = { handleEvent: handler.handleEvent.bind(this) };
    }
    __privateGet(this, _boundHandlers).set(handler, bound);
  }
  return bound;
};
var JJET = _JJET;
var JJN = class _JJN extends JJET {
  /**
   * Creates a JJN instance from a Node reference.
   *
   * @example
   * ```ts
   * const node = JJN.from(document.createTextNode('hello'))
   * ```
   *
   * @param node - The Node instance.
   * @returns A new JJN instance.
   */
  static from(node) {
    return new _JJN(node);
  }
  /**
   * Checks if a value can be passed to the `wrap()` or `unwrap()` function.
   *
   * @remarks
   * This is useful for filtering the array that is passed to `append()`, `prepend()` or `setChildren()`
   *
   * @param x an unknown value
   * @returns true if `x` is a string, Node (or its descendents), JJN (or its descendents)
   */
  static isWrapable(x) {
    return isStr(x) || isA(x, Node) || isA(x, _JJN);
  }
  /**
   * Wraps a native DOM node or string into the most specific JJ wrapper available.
   *
   * @remarks
   * This function acts as a factory, inspecting the input type and returning the appropriate
   * subclass of `JJN` (e.g., `JJHE` for `HTMLElement`, `JJT` for `Text`).
   *
   * @example
   * ```ts
   * const bodyWrapper = JJN.wrap(document.body) // Returns JJHE
   * const textWrapper = JJN.wrap('Hello') // Returns JJT wrapping a new Text node
   * ```
   *
   * @param raw - The object to wrap. If it's already Wrapped, it'll be returned without any change. We don't double-wrap or clone it.
   * @returns The most granular Wrapped subclass instance. If the input is already wrapped, it'll be returned as is without cloning.
   * @throws {TypeError} If the input is not a Node, string, or JJ wrapper.
   */
  static wrap(raw) {
    throw new ReferenceError(`The mixin is supposed to override this method.`);
  }
  /**
   * Extracts the underlying native DOM node from a wrapper.
   *
   * @remarks
   * If the input is already a native Node, it is returned as is.
   * If the input is a string, a new Text node is created and returned.
   *
   * @example
   * ```ts
   * const rawElement = JJN.unwrap(myJJHE) // Returns HTMLElement
   * ```
   *
   * @param obj - The object to unwrap.
   * @returns The underlying DOM node.
   * @throws {TypeError} If the input cannot be unwrapped.
   */
  static unwrap(obj) {
    if (isStr(obj)) {
      return document.createTextNode(obj);
    }
    if (!isObj(obj)) {
      throw new TypeError(`JJN.unwrap() expects a string, DOM Node, or JJ wrapper. Got ${obj} (${typeof obj}). `);
    }
    if (isA(obj, Node)) {
      return obj;
    }
    if (isA(obj, _JJN)) {
      return obj.ref;
    }
    throw new TypeError(
      `Could not unwrap ${obj} (${typeof obj}). Expected a string, Node, or JJ wrapper. Make sure you're passing a valid DOM element or JJ wrapper.`
    );
  }
  /**
   * Wraps an iterable object (e.g. an array of wrapped or DOM elements).
   *
   * @example
   * ```ts
   * const wrappedList = JJN.wrapAll(document.querySelectorAll('div'))
   * ```
   *
   * @param iterable - The iterable to wrap.
   * @returns An array of wrapped instances.
   */
  static wrapAll(iterable) {
    return Array.from(iterable, _JJN.wrap);
  }
  /**
   * Unwraps an iterable object (e.g. an array or HTMLCollection).
   *
   * @example
   * ```ts
   * const nodes = JJN.unwrapAll(wrappedList)
   * ```
   *
   * @param iterable - The iterable to unwrap.
   * @returns An array of native DOM nodes.
   */
  static unwrapAll(iterable) {
    return Array.from(iterable, _JJN.unwrap);
  }
  /**
   * Creates an instance of JJN.
   *
   * @param ref - The Node to wrap.
   * @throws {TypeError} If `ref` is not a Node.
   */
  constructor(ref) {
    if (!isA(ref, Node)) {
      throw new TypeError(
        `JJN expects a Node instance. Got ${ref} (${typeof ref}). Use JJN.from(node) with a DOM Node, or check that you're passing a valid DOM element.`
      );
    }
    super(ref);
  }
  /**
   * Clones the Node.
   *
   * @param deep - If true, clones the subtree.
   * @returns A new wrapped instance of the clone.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode | Node.cloneNode}
   */
  clone(deep) {
    return _JJN.wrap(this.ref.cloneNode(deep));
  }
  /**
   * Creates a Text node from a string and appends it to this Node.
   *
   * @remarks
   * This method is overridden in JJT to append to the existing text content instead.
   *
   * @example
   * ```ts
   * el.addText('Hello ')
   * el.addText('World')
   * ```
   *
   * @param text - The text to add. If null or undefined, nothing is added.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createTextNode | document.createTextNode}
   */
  addText(text) {
    if (text) {
      this.ref.appendChild(document.createTextNode(text));
    }
    return this;
  }
};
var JJNx = class extends JJN {
  /**
   * Finds the first element matching a selector within this Element.
   *
   * @example
   * ```ts
   * const span = el.find('span')  // Returns null if not found
   * const span = el.find('span', true)  // Throws if not found
   * ```
   *
   * @param selector - The CSS selector.
   * @param required - Whether to throw an error if not found. Defaults to false.
   * @returns The wrapped element, or null if not found and required is false.
   * @throws {TypeError} If selector is not a string or element not found and required is true.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector | Element.querySelector}
   */
  find(selector, required = false) {
    const queryResult = this.ref.querySelector(selector);
    if (queryResult) {
      return JJN.wrap(queryResult);
    }
    if (required) {
      throw new TypeError(`No element matched query "${selector}"`);
    }
    return null;
  }
  /**
   * Finds all elements matching a selector within this Element.
   *
   * @example
   * ```ts
   * const items = el.findAll('li')
   * ```
   *
   * @param selector - The CSS selector.
   * @returns An array of wrapped elements.
   * @throws {TypeError} If selector is not a string.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll | Element.querySelectorAll}
   */
  findAll(selector) {
    return JJN.wrapAll(this.ref.querySelectorAll(selector));
  }
  /**
   * Appends children to this Element.
   *
   * @example
   * ```ts
   * el.addChild(h('span', null, 'hello'))
   * ```
   *
   * @remarks
   * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
   *
   * @param children - The children to append.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/append | Element.append}
   */
  addChild(...children) {
    const nodes = JJN.unwrapAll(children.filter(JJN.isWrapable));
    this.ref.append(...nodes);
    return this;
  }
  /**
   * Prepends children to this Element.
   *
   * @example
   * ```ts
   * el.preChild(h('span', null, 'first'))
   * ```
   *
   * @remarks
   * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
   *
   * @param children - The children to prepend.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/prepend | Element.prepend}
   */
  preChild(...children) {
    const nodes = JJN.unwrapAll(children.filter(JJN.isWrapable));
    this.ref.prepend(...nodes);
    return this;
  }
  /**
   * Maps an array to children and appends them.
   *
   * @example
   * ```ts
   * node.addChildMap(['a', 'b'], item => h('li', null, item))
   * ```
   *
   * @remarks
   * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
   *
   * @param array - The source array.
   * @param mapFn - The mapping function returning a Wrappable.
   * @returns This instance for chaining.
   */
  addChildMap(array, mapFn) {
    return this.addChild(...array.map(mapFn));
  }
  /**
   * Maps an array to children and prepends them.
   *
   * @example
   * ```ts
   * node.preChildMap(['a', 'b'], item => JJHE.create('li').setText(item))
   * ```
   *
   * @remarks
   * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
   *
   * @param array - The source array.
   * @param mapFn - The mapping function.
   * @returns This instance for chaining.
   */
  preChildMap(array, mapFn) {
    return this.preChild(...array.map(mapFn));
  }
  /**
   * Replaces the existing children of an Element with a specified new set of children.
   *
   * @remarks
   * If no children are provided, it empties the Element.
   * To make template codes easier, this function ignores any child that is not possible to `wrap()` (e.g. undefined, null, false).
   *
   * @example
   * ```ts
   * el.setChildren(h('p', null, 'New Content'))
   * ```
   * @param children - The children to replace with.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren | Element.replaceChildren}
   */
  setChildren(...children) {
    const nodes = JJN.unwrapAll(children.filter(JJN.isWrapable));
    this.ref.replaceChildren(...nodes);
    return this;
  }
  /**
   * Removes all children from this Element.
   *
   * @example
   * ```ts
   * el.empty()
   * ```
   *
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren | Element.setChildren}
   */
  empty() {
    this.setChildren();
    return this;
  }
};
var JJDF = class _JJDF extends JJNx {
  /**
   * Creates a JJDF instance from a DocumentFragment reference.
   *
   * @example
   * ```ts
   * const frag = JJDF.from(myFrag)
   * ```
   *
   *
   * @param ref - The DocumentFragment instance.
   * @returns A new JJDF instance.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment | DocumentFragment}
   */
  static from(ref) {
    return new _JJDF(ref);
  }
  /**
   * Creates a new empty JJDF instance (wraps a new DocumentFragment).
   *
   * @example
   * ```ts
   * const frag = JJDF.create()
   * ```
   *
   * @returns A new JJDF instance.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createDocumentFragment | document.createDocumentFragment}
   */
  static create() {
    return new _JJDF(document.createDocumentFragment());
  }
  /**
   * Creates an instance of JJDF.
   *
   * @param ref - The DocumentFragment instance to wrap.
   * @throws {TypeError} If `ref` is not a DocumentFragment.
   */
  constructor(ref) {
    if (!isA(ref, DocumentFragment)) {
      throw typeErr("ref", "a DocumentFragment", ref);
    }
    super(ref);
  }
};
var JJSR = class _JJSR extends JJDF {
  /**
   * Creates a JJSR instance from a ShadowRoot reference.
   *
   * @example
   * ```ts
   * const shadow = JJSR.from(element.shadowRoot)
   * ```
   *
   * @param shadowRoot - The ShadowRoot instance.
   * @returns A new JJSR instance.
   */
  static from(shadowRoot) {
    return new _JJSR(shadowRoot);
  }
  /**
   * Creates an instance of JJSR.
   *
   * @param shadowRoot - The ShadowRoot to wrap.
   * @throws {TypeError} If `shadowRoot` is not a ShadowRoot.
   */
  constructor(shadowRoot) {
    if (!isA(shadowRoot, ShadowRoot)) {
      throw new TypeError(
        `JJSR expects a ShadowRoot instance. Got ${shadowRoot} (${typeof shadowRoot}). Access a shadow root using element.shadowRoot after calling element.attachShadow().`
      );
    }
    super(shadowRoot);
  }
  /**
   * Gets the inner HTML of the ShadowRoot.
   *
   * @returns The inner HTML string.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML | Element.innerHTML}
   */
  getHTML() {
    return this.ref.innerHTML;
  }
  /**
   * Sets the inner HTML of the ShadowRoot.
   *
   * @example
   * ```ts
   * shadow.setHTML('<p>Hello</p>', true)
   * ```
   *
   * @param html - The HTML string to set, or null/undefined to clear.
   * @param unsafe - explicit opt-in to set innerHTML. must be true if html is provided.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML | Element.innerHTML}
   */
  setHTML(html, unsafe) {
    if (html && unsafe !== true) {
      throw new Error(
        `Setting innerHTML is unsafe. Pass true as the second argument to confirm you know what you are doing.`
      );
    }
    this.ref.innerHTML = html ?? "";
    return this;
  }
  /**
   * Adds constructed stylesheets to the ShadowRoot.
   *
   * @example
   * ```ts
   * const sheet = new CSSStyleSheet()
   * sheet.replaceSync('p { color: red; }')
   * shadow.addStyleSheets(sheet)
   * ```
   *
   * @param styleSheets - The stylesheets to add.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/adoptedStyleSheets | ShadowRoot.adoptedStyleSheets}
   */
  addStyleSheets(...styleSheets) {
    this.ref.adoptedStyleSheets.push(...styleSheets);
    return this;
  }
};
var JJE = class _JJE extends JJNx {
  /**
   * Creates a JJE instance from an Element reference.
   *
   * @example
   * ```ts
   * const el = JJE.from(document.querySelector('.my-class'))
   * ```
   *
   * @param ref - The Element instance.
   * @returns A new JJE instance.
   */
  static from(ref) {
    return new _JJE(ref);
  }
  /**
   * Creates an instance of JJE.
   *
   * @param ref - The Element to wrap.
   * @throws {TypeError} If `ref` is not an Element.
   */
  constructor(ref) {
    if (!isA(ref, Element)) {
      throw new TypeError(
        `JJE expects an Element instance. Got ${ref} (${typeof ref}). Use JJE.from(element) with a DOM Element, or use the specific wrapper (JJHE for HTMLElement, JJSE for SVGElement).`
      );
    }
    super(ref);
  }
  /**
   * Gets the value of an attribute.
   *
   * @param name - The name of the attribute.
   * @returns The attribute value, or null if not present.
   * @throws {TypeError} If `name` is not a string.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute | Element.getAttribute}
   */
  getAttr(name) {
    if (!isStr(name)) {
      throw typeErr("name", "a string", name);
    }
    return this.ref.getAttribute(name);
  }
  /**
   * Checks if an attribute exists.
   *
   * @param name - The name of the attribute.
   * @returns `true` if the attribute exists, otherwise `false`.
   * @throws {TypeError} If `name` is not a string.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttribute | Element.hasAttribute}
   */
  hasAttr(name) {
    if (!isStr(name)) {
      throw typeErr("name", "a string", name);
    }
    return this.ref.hasAttribute(name);
  }
  setAttr(nameOrObj, value) {
    if (typeof nameOrObj === "string") {
      this.ref.setAttribute(nameOrObj, value);
    } else if (isObj(nameOrObj)) {
      for (const [k, v] of Object.entries(nameOrObj)) {
        this.ref.setAttribute(k, v);
      }
    } else {
      throw typeErr("nameOrObj", "a string or object", nameOrObj);
    }
    return this;
  }
  /**
   * Removes one or more attributes from the Element.
   *
   * @example
   * ```ts
   * el.rmAttr('disabled')  // Remove single
   * el.rmAttr('hidden', 'aria-hidden')  // Remove multiple
   * ```
   *
   * @param names - The name(s) of the attribute(s) to remove.
   * @returns This instance for chaining.
   * @throws {TypeError} If any name is not a string.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute | Element.removeAttribute}
   */
  rmAttr(...names) {
    for (const name of names) {
      if (!isStr(name)) {
        throw typeErr("name", "a string", name);
      }
      this.ref.removeAttribute(name);
    }
    return this;
  }
  /**
   * Gets the value of an ARIA attribute.
   *
   * @remarks
   * Automatically prepends `aria-` to the name.
   *
   * @example
   * ```ts
   * el.getAria('label') // gets 'aria-label'
   * ```
   *
   * @param name - The ARIA attribute suffix (e.g., 'label' for 'aria-label').
   * @returns The attribute value, or null if not present.
   * @throws {TypeError} If `name` is not a string.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes | ARIA Attributes}
   */
  getAria(name) {
    if (!isStr(name)) {
      throw typeErr("name", "a string", name);
    }
    return this.ref.getAttribute(`aria-${name}`);
  }
  /**
   * Checks if an ARIA attribute exists.
   *
   * @param name - The ARIA attribute suffix.
   * @returns `true` if the attribute exists.
   * @throws {TypeError} If `name` is not a string.
   */
  hasAria(name) {
    if (!isStr(name)) {
      throw typeErr("name", "a string", name);
    }
    return this.ref.hasAttribute(`aria-${name}`);
  }
  setAria(nameOrObj, value) {
    if (isStr(nameOrObj)) {
      this.ref.setAttribute(`aria-${nameOrObj}`, value);
    } else if (isObj(nameOrObj)) {
      for (const [k, v] of Object.entries(nameOrObj)) {
        this.ref.setAttribute(`aria-${k}`, v);
      }
    } else {
      throw typeErr("nameOrObj", "a string or object", nameOrObj);
    }
    return this;
  }
  /**
   * Removes one or more ARIA attributes from the Element.
   *
   * @example
   * ```ts
   * el.rmAria('hidden')  // Remove single
   * el.rmAria('label', 'hidden')  // Remove multiple
   * ```
   *
   * @param names - The ARIA attribute suffix(es) to remove.
   * @returns This instance for chaining.
   * @throws {TypeError} If any name is not a string.
   */
  rmAria(...names) {
    for (const name of names) {
      if (!isStr(name)) {
        throw typeErr("name", "a string", name);
      }
      this.ref.removeAttribute(`aria-${name}`);
    }
    return this;
  }
  /**
   * Gets the class attribute.
   *
   * @returns The class attribute value, or null if not present.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/className | Element.className}
   */
  getClass() {
    return this.getAttr("class");
  }
  setClass(classNameOrMap) {
    if (typeof classNameOrMap === "string") {
      return this.setAttr("class", classNameOrMap);
    }
    for (const [className, condition] of Object.entries(classNameOrMap)) {
      if (condition) {
        this.ref.classList.add(className);
      } else {
        this.ref.classList.remove(className);
      }
    }
    return this;
  }
  /**
   * Adds one or more classes to the Element.
   *
   * @example
   * ```ts
   * el.addClass('btn', 'btn-primary')
   * ```
   *
   * @param classNames - The classes to add.
   * @returns This instance for chaining.
   * @throws {TypeError} If any class name is not a string.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList | Element.classList}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/add | DOMTokenList.add}
   */
  addClass(...classNames) {
    for (const className of classNames) {
      if (!isStr(className)) {
        throw typeErr("className", "a string", className);
      }
    }
    this.ref.classList.add(...classNames);
    return this;
  }
  /**
   * Removes one or more classes from the Element.
   *
   * @example
   * ```ts
   * el.rmClass('active')  // Remove single
   * el.rmClass('btn', 'btn-primary')  // Remove multiple
   * ```
   *
   * @param classNames - The classes to remove.
   * @returns This instance for chaining.
   * @throws {TypeError} If any class name is not a string.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList | Element.classList}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/remove | DOMTokenList.remove}
   */
  rmClass(...classNames) {
    for (const className of classNames) {
      if (!isStr(className)) {
        throw typeErr("className", "a string", className);
      }
    }
    this.ref.classList.remove(...classNames);
    return this;
  }
  /**
   * Checks if the Element has a specific class.
   *
   * @param className - The class to check for.
   * @returns `true` if the element has the class.
   * @throws {TypeError} If `className` is not a string.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList | Element.classList}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/contains | DOMTokenList.contains}
   */
  hasClass(className) {
    if (!isStr(className)) {
      throw typeErr("className", "a string", className);
    }
    return this.ref.classList.contains(className);
  }
  /**
   * Toggles a class on the Element.
   *
   * @param className - The class to toggle.
   * @returns This instance for chaining.
   * @throws {TypeError} If `className` is not a string.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList | Element.classList}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle | DOMTokenList.toggle}
   */
  toggleClass(className) {
    if (!isStr(className)) {
      throw typeErr("className", "a string", className);
    }
    this.ref.classList.toggle(className);
    return this;
  }
  /**
   * Replaces a class with another one
   *
   * @remarks
   * If the `oldClassName` doesn't exist, the `newClassName` isn't added
   *
   * @param oldClassName - The class name to remove
   * @param newClassName - The class name to add
   * @throws {TypeError} If either className is not a string.
   */
  replaceClass(oldClassName, newClassName) {
    if (!isStr(oldClassName)) {
      throw typeErr("oldClassName", "a string", oldClassName);
    }
    if (!isStr(newClassName)) {
      throw typeErr("newClassName", "a string", newClassName);
    }
    this.ref.classList.replace(oldClassName, newClassName);
    return this;
  }
  /**
   * Finds the closest ancestor (or self) that matches a CSS selector.
   *
   * @remarks
   * Returns `null` when no matching ancestor is found.
   *
   * @example
   * ```ts
   * const button = JJE.from(document.querySelector('button'))
   * const card = button.closest('.card')
   * if (card) {
   *     card.addClass('has-action')
   * }
   * ```
   *
   * @param selector - The CSS selector to search for.
   * @returns A JJE wrapping the closest match, or null when none exists.
   * @throws {TypeError} If `selector` is not a string.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/closest | Element.closest}
   */
  closest(selector) {
    if (!isStr(selector)) {
      throw typeErr("selector", "a string", selector);
    }
    const match = this.ref.closest(selector);
    return match ? JJN.wrap(match) : null;
  }
  /**
  
       * Hides the Element by setting the `hidden` attribute and `aria-hidden="true"`.
       *
       * @returns This instance for chaining.
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden | hidden attribute}
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-hidden | aria-hidden}
       */
  hide() {
    return this.setAttr("hidden", "").setAttr("aria-hidden", "true");
  }
  /**
   * Shows the Element by removing the `hidden` and `aria-hidden` attributes.
   *
   * @returns This instance for chaining.
   */
  show() {
    return this.rmAttr("hidden", "aria-hidden");
  }
  /**
   * Disables the Element by setting the `disabled` attribute and `aria-disabled="true"`.
   *
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled | disabled attribute}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-disabled | aria-disabled}
   */
  disable() {
    return this.setAttr("disabled", "").setAttr("aria-disabled", "true");
  }
  /**
   * Enables the Element by removing the `disabled` and `aria-disabled` attributes.
   *
   * @returns This instance for chaining.
   */
  enable() {
    return this.rmAttr("disabled", "aria-disabled");
  }
  /**
   * Gets the inner HTML of the Element.
   *
   * @remarks
   * This method operates on `innerHTML`. The method name is kept short for convenience.
   *
   * @returns The inner HTML string.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML | Element.innerHTML}
   */
  getHTML() {
    return this.ref.innerHTML;
  }
  /**
   * Sets the inner HTML of the Element.
   *
   * @remarks
   * This method operates on `innerHTML`. The method name is kept short for convenience.
   * Pass an empty string, `null`, or `undefined` to clear the content.
   *
   * @param html - The HTML string to set, or null/undefined to clear.
   * @param unsafe - explicit opt-in to set innerHTML. must be true if html is provided.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML | Element.innerHTML}
   */
  setHTML(html, unsafe) {
    if (html && unsafe !== true) {
      throw new Error(
        `Setting innerHTML is unsafe. Pass true as the second argument to confirm you know what you are doing.`
      );
    }
    this.ref.innerHTML = html ?? "";
    return this;
  }
  /**
   * Attaches a Shadow DOM to the Element and optionally sets its content and styles.
   *
   * @remarks
   * We prevent FOUC by assigning the template and CSS in one go.
   * **Note:** You can't attach a shadow root to every type of element. There are some that can't have a
   * shadow DOM for security reasons (for example `<a>`).
   *
   * @param mode - The encapsulation mode ('open' or 'closed'). Defaults to 'open'.
   * @param config - Optional configuration object containing `template` (HTML string) and `styles` (array of CSSStyleSheet).
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow | Element.attachShadow}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/adoptedStyleSheets | ShadowRoot.adoptedStyleSheets}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets | Document.adoptedStyleSheets}
   */
  initShadow(mode = "open", config) {
    const shadowRoot = this.ref.shadowRoot ?? this.ref.attachShadow({ mode });
    if (isObj(config)) {
      const { template, styles } = config;
      if (template) {
        if (isStr(template)) {
          shadowRoot.innerHTML = template;
        } else {
          shadowRoot.appendChild(template);
        }
      }
      if (isArr(styles) && styles.length) {
        shadowRoot.adoptedStyleSheets.push(...styles);
      }
    }
    return this;
  }
  /**
   * Gets a wrapper around the Element's Shadow Root, if it exists.
   *
   * @returns A JJSR instance wrapping the shadow root, or null if no shadow root exists.
   */
  get shadow() {
    return this.ref.shadowRoot ? new JJSR(this.ref.shadowRoot) : null;
  }
};
var JJEx = class extends JJE {
  /**
   * Gets a data attribute from the HTMLElement.
   *
   * @example
   * ```ts
   * const value = el.getData('my-key')
   * ```
   *
   * @param name - The data attribute name (in camelCase).
   * @returns The value of the attribute, or undefined if not set.
   * @throws {TypeError} If `name` is not a string.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
   */
  getData(name) {
    if (!isStr(name)) {
      throw typeErr("name", "a string", name);
    }
    return this.ref.dataset[name];
  }
  /**
   * Checks if a data attribute exists on the HTMLElement.
   *
   * @example
   * ```ts
   * if (el.hasData('my-key')) {
   *   // ...
   * }
   * ```
   *
   * @param name - The data attribute name (in camelCase).
   * @returns True if the attribute exists, false otherwise.
   * @throws {TypeError} If `name` is not a string.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
   */
  hasData(name) {
    if (!isStr(name)) {
      throw typeErr("name", "a string", name);
    }
    return hasProp(this.ref.dataset, name);
  }
  setData(nameOrObj, value) {
    if (typeof nameOrObj === "string") {
      this.ref.dataset[nameOrObj] = value;
    } else if (isObj(nameOrObj)) {
      for (const [k, v] of Object.entries(nameOrObj)) {
        this.ref.dataset[k] = v;
      }
    } else {
      throw typeErr("nameOrObj", "a string or object", nameOrObj);
    }
    return this;
  }
  /**
   * Removes one or more data attributes from the HTMLElement.
   *
   * @example
   * ```ts
   * el.rmData('myKey')  // Remove single
   * el.rmData('myKey', 'otherKey')  // Remove multiple
   * ```
   *
   * @param names - The data attribute name(s) (in camelCase).
   * @returns This instance for chaining.
   * @throws {TypeError} If any name is not a string.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | HTMLElement.dataset}
   */
  rmData(...names) {
    for (const name of names) {
      if (!isStr(name)) {
        throw typeErr("name", "a string", name);
      }
      delete this.ref.dataset[name];
    }
    return this;
  }
};
var JJHE = class _JJHE extends JJEx {
  /**
   * Creates a JJHE instance from an HTMLElement reference.
   *
   * @example
   * ```ts
   * const el = JJHE.from(document.getElementById('my-id'))  // from an existing HTMLElement
   * const el = JJHE.from(new document.createElement('div')) // from a new HTMLElement
   * ```
   *
   * @param ref - The HTMLElement.
   * @returns A new JJHE instance.
   */
  static from(ref) {
    return new _JJHE(ref);
  }
  static create(tagName, options) {
    if (!isStr(tagName)) {
      throw typeErr("tagName", "a string like 'div' or 'button'", tagName);
    }
    return new _JJHE(document.createElement(tagName, options));
  }
  /**
   * Creates an instance of JJHE.
   *
   * @param ref - The HTMLElement to wrap.
   * @throws {TypeError} If `ref` is not an HTMLElement.
   */
  constructor(ref) {
    if (!isA(ref, HTMLElement)) {
      throw typeErr("ref", "an HTMLElement", ref);
    }
    super(ref);
  }
  /**
   * Gets the value property of the HTMLElement (e.g. for inputs).
   *
   * @returns The value.
   * @throws {Error} If the HTMLElement does not have a value property.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/value | HTMLInputElement.value}
   */
  getValue() {
    if (!hasProp(this.ref, "value")) {
      throw new ReferenceError(`${this.ref.tagName} has no value property.`);
    }
    return this.ref.value;
  }
  /**
   * Sets the value property of the HTMLElement.
   *
   * @example
   * ```ts
   * input.setValue('new value')
   * input.setValue(42)  // Numbers are automatically converted
   * ```
   *
   * @param value - The value to set.
   * @returns This instance for chaining.
   * @throws {Error} If the HTMLElement does not have a value property.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/value | HTMLInputElement.value}
   */
  setValue(value) {
    if (!hasProp(this.ref, "value")) {
      throw new ReferenceError(`${this.ref.tagName} has no value property.`);
    }
    this.ref.value = value;
    return this;
  }
  /**
   * Focuses the HTMLElement.
   *
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus | HTMLElement.focus}
   */
  focus() {
    this.ref.focus();
    return this;
  }
  /**
   * Clicks the HTMLElement.
   *
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/click | HTMLElement.click}
   */
  click() {
    this.ref.click();
    return this;
  }
  /**
   * Gets the inner text of the HTMLElement.
   *
   * @remarks
   * This method operates on `innerText`. The method name is kept short for convenience.
   *
   * @returns The inner text.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText | HTMLElement.innerText}
   */
  getText() {
    return this.ref.innerText;
  }
  /**
   * Sets the inner text of the HTMLElement.
   *
   * @remarks
   * This method operates on `innerText`. The method name is kept short for convenience.
   * Pass an empty string, `null`, or `undefined` to clear the content.
   * Numbers and booleans are automatically converted to strings.
   *
   * @param text - The text to set, or null/undefined to clear.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText | HTMLElement.innerText}
   */
  setText(text) {
    this.ref.innerText = text ?? "";
    return this;
  }
};
var JJT = class _JJT extends JJN {
  /**
   * Creates a JJT instance from a Text node.
   *
   * @example
   * ```ts
   * const textNode = document.createTextNode('foo')
   * const text = JJT.from(textNode)
   * ```
   *
   * @param text - The Text node.
   * @returns A new JJT instance.
   * @throws {TypeError} If `text` is not a Text node.
   */
  static from(text) {
    return new _JJT(text);
  }
  static fromStr(text) {
    return new _JJT(document.createTextNode(text));
  }
  /**
   * Creates an instance of JJT.
   *
   * @example
   * ```ts
   * const text = new JJT('Hello World')
   * ```
   *
   * @param ref - The Text node or a string to create a Text node from.
   * @throws {TypeError} If `ref` is not a Text node or string.
   */
  constructor(ref) {
    if (!isA(ref, Text)) {
      throw new TypeError(
        `JJT expects a Text node. Got ${ref} (${typeof ref}). Create a Text node with JJT.fromStr() or document.createTextNode('text').`
      );
    }
    super(ref);
  }
  /**
   * Gets the text content of the Text node.
   *
   * @example
   * ```ts
   * const content = text.getText()
   * ```
   *
   * @returns The text content.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
   */
  getText() {
    return this.ref.textContent;
  }
  /**
   * Sets the text content of the Text node.
   *
   * @example
   * ```ts
   * text.setText('New content')
   * ```
   *
   * @param text - The text to set. Set it to null or undefined to remove all text
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
   */
  setText(text) {
    this.ref.textContent = text ?? null;
    return this;
  }
  /**
   * Appends text to the existing content.
   *
   * @example
   * ```ts
   * text.setText('hello')
   * text.addText(' world')
   * console.log(text.getText()) // 'hello world'
   * ```
   *
   * @param text - The string to add to the existing contents. If null or undefined, nothing is added.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
   */
  addText(text) {
    if (text != null) {
      this.ref.textContent += text;
    }
    return this;
  }
  /**
   * Clears the text content of the Text node.
   *
   * @example
   * ```ts
   * text.empty()
   * ```
   *
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
   */
  empty() {
    return this.setText("");
  }
};
var JJD = class _JJD extends JJNx {
  /**
   * Creates a JJD instance from a Document reference.
   *
   * @example
   * ```ts
   * const doc = JJD.from(document)
   * ```
   *
   * @param ref - The Document instance.
   * @returns A new JJD instance.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document | Document}
   */
  static from(ref) {
    return new _JJD(ref);
  }
  /**
   * Creates an instance of JJD.
   *
   * @param ref - The Document instance to wrap.
   * @throws {TypeError} If `ref` is not a Document.
   */
  constructor(ref) {
    if (!isA(ref, Document)) {
      throw new TypeError(`JJD expects a Document instance. Got ${ref} (${typeof ref}). `);
    }
    super(ref);
  }
  /**
   * Gets the `<head>` element of the document wrapped in a `JJHE` instance.
   *
   * @returns The wrapped head element.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/head | Document.head}
   */
  get head() {
    return JJHE.from(this.ref.head);
  }
  /**
   * Gets the `<body>` element of the document wrapped in a `JJHE` instance.
   *
   * @returns The wrapped body element.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/body | Document.body}
   */
  get body() {
    return JJHE.from(this.ref.body);
  }
};
var SVG_NAMESPACE_URI = "http://www.w3.org/2000/svg";
var JJSE = class _JJSE extends JJEx {
  /**
   * Creates a JJSE instance from an SVGElement reference.
   *
   * @example
   * ```ts
   * const svg = JJSE.from(myCircle)
   * ```
   *
   * @param ref - The SVGElement.
   * @returns A new JJSE instance.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGElement | SVGElement}
   */
  static from(ref) {
    return new _JJSE(ref);
  }
  /**
   * Creates a JJSE instance from a tag name (in the SVG namespace).
   *
   * @remarks
   * Automatically uses the correct SVG namespace URI: `http://www.w3.org/2000/svg`.
   *
   * @example
   * ```ts
   * const circle = JJSE.create('circle')
   * ```
   *
   * @param tagName - The tag name.
   * @param options - Element creation options.
   * @returns A new JJSE instance.
   * @throws {TypeError} If `tagName` is not a string.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS | document.createElementNS}
   */
  static create(tagName, options) {
    if (!isStr(tagName)) {
      throw typeErr("tagName", 'a string like "circle" or "path"', tagName);
    }
    const element = document.createElementNS(SVG_NAMESPACE_URI, tagName, options);
    return new _JJSE(element);
  }
  /**
   * Creates an instance of JJSE.
   *
   * @param ref - The SVGElement to wrap.
   * @throws {TypeError} If `ref` is not an SVGElement.
   */
  constructor(ref) {
    if (!isA(ref, SVGElement)) {
      throw typeErr("ref", "an SVGElement", ref);
    }
    super(ref);
  }
  /**
   * Gets the text content of the SVGElement.
   *
   * @remarks
   * This method operates on `textContent`. The method name is kept short for convenience.
   *
   * @example
   * ```ts
   * const text = svg.getText()
   * ```
   *
   * @returns The text content.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
   */
  getText() {
    return this.ref.textContent ?? "";
  }
  /**
   * Sets the text content of the SVGElement.
   *
   * @remarks
   * This method operates on `textContent`. The method name is kept short for convenience.
   * Pass an empty string, `null`, or `undefined` to clear the content.
   * Numbers and booleans are automatically converted to strings.
   *
   * @example
   * ```ts
   * svg.setText('Hello SVG')
   * svg.setText(null)  // Clear content
   * svg.setText(42)  // Numbers are converted
   * ```
   *
   * @param text - The text to set, or null/undefined to clear.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent | Node.textContent}
   */
  setText(text) {
    this.ref.textContent = text ?? "";
    return this;
  }
  /**
   * Sets the fill attribute.
   *
   * @param value - The fill color/value.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill | fill}
   */
  setFill(value) {
    return this.setAttr("fill", value);
  }
  /**
   * Sets the stroke attribute.
   *
   * @param value - The stroke color/value.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke | stroke}
   */
  setStroke(value) {
    return this.setAttr("stroke", value);
  }
  /**
   * Sets the stroke-width attribute.
   *
   * @param value - The width.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-width | stroke-width}
   */
  setStrokeWidth(value) {
    return this.setAttr("stroke-width", String(value));
  }
  /**
   * Sets the viewBox attribute.
   *
   * @example
   * ```ts
   * svg.setViewBox(0, 0, 100, 100)
   * svg.setViewBox('0 0 100 100')
   * ```
   *
   * @param p1 - Min-x or string/array value.
   * @param p2 - Min-y.
   * @param p3 - Width.
   * @param p4 - Height.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox | viewBox}
   */
  setViewBox(p1, p2, p3, p4) {
    if (typeof p1 === "number" && p2 !== void 0 && p3 !== void 0 && p4 !== void 0) {
      return this.setAttr("viewBox", `${p1} ${p2} ${p3} ${p4}`);
    }
    const value = p1;
    return this.setAttr("viewBox", Array.isArray(value) ? value.join(" ") : value);
  }
  /**
   * Sets the width attribute.
   *
   * @param value - The width.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/width | width}
   */
  setWidth(value) {
    return this.setAttr("width", String(value));
  }
  /**
   * Sets the height attribute.
   *
   * @param value - The height.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/height | height}
   */
  setHeight(value) {
    return this.setAttr("height", String(value));
  }
  /**
   * Sets the d attribute (path data).
   *
   * @param value - The path data string or array of segments.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d | d}
   */
  setD(value) {
    return this.setAttr("d", Array.isArray(value) ? value.join(" ") : value);
  }
  /**
   * Sets the transform attribute.
   *
   * @param value - The transform string.
   * @returns This instance for chaining.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform | transform}
   */
  setTransform(value) {
    return this.setAttr("transform", value);
  }
};
JJN.wrap = function wrap(raw) {
  if (isStr(raw)) {
    return JJT.fromStr(raw);
  }
  if (!isObj(raw)) {
    throw typeErr("raw", "an object", raw);
  }
  if (isA(raw, JJN)) {
    return raw;
  }
  if (isA(raw, HTMLElement)) {
    return JJHE.from(raw);
  }
  if (isA(raw, SVGElement)) {
    return JJSE.from(raw);
  }
  if (isA(raw, Element)) {
    return JJE.from(raw);
  }
  if (isA(raw, ShadowRoot)) {
    return JJSR.from(raw);
  }
  if (isA(raw, DocumentFragment)) {
    return JJDF.from(raw);
  }
  if (isA(raw, Document)) {
    return JJD.from(raw);
  }
  if (isA(raw, Text)) {
    return JJT.from(raw);
  }
  if (isA(raw, Node)) {
    return JJN.from(raw);
  }
  throw typeErr("raw", "a Node", raw);
};
function h(tagName, attributes, ...children) {
  const ret = JJHE.create(tagName).addChild(...children);
  if (attributes) {
    ret.setAttr(attributes);
  }
  return ret;
}
function linkAs(href) {
  switch (fileExt(href)) {
    case "html":
    case "htm":
    case "md":
      return "fetch";
    case "css":
      return "style";
    case "js":
    case "mjs":
    case "cjs":
      return "script";
    default:
      throw new Error(`No 'as' attribute was specified and we failed to guess it from the URL: ${href}`);
  }
}
function createLinkPre(href, rel, as) {
  if (!isStr(href)) {
    if (!isA(href, URL)) {
      throw typeErr("href", "a string or URL", href);
    }
    href = href.toString();
  }
  if (!["prefetch", "preload"].includes(rel)) {
    throw new RangeError(errMsg("rel", `'prefetch' or 'preload'`, rel));
  }
  if (!as) {
    as = linkAs(href);
    if (!as) {
      throw new Error(`Could not guess 'as' attribute from URL: ${href}`);
    }
  }
  if (!["fetch", "style", "script"].includes(as)) {
    throw new RangeError(errMsg("as", `'fetch', 'style', or 'script'`, as));
  }
  return JJHE.create("link").setAttr({
    href,
    rel,
    as
  });
}
function addLinkPre(...args) {
  const link = createLinkPre(...args);
  document.head.append(link.ref);
  return link;
}
async function fetchText(url, mime = "text/*") {
  if (!isStr(mime)) {
    throw typeErr("mime", "a string", mime);
  }
  const response = await fetch(url, { headers: { Accept: mime } });
  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
  }
  return response.text();
}
async function fetchHtml(url) {
  return await fetchText(url, "text/html");
}
async function fetchCss(url) {
  return await fetchText(url, "text/css");
}
async function fetchStyle(url) {
  return await cssToStyle(await fetchCss(url));
}
function attr2prop(instance, name, oldValue, newValue) {
  if (!isA(instance, HTMLElement)) {
    throw typeErr("instance", "an HTMLElement", instance);
  }
  if (oldValue !== newValue) {
    const propName = keb2cam(name);
    if (hasProp(instance, propName)) {
      instance[propName] = newValue;
      return true;
    }
  }
  return false;
}
async function registerComponent(name, constructor, options) {
  if (!isStr(name)) {
    throw typeErr("name", "a string", name);
  }
  if (!isFn(constructor)) {
    throw typeErr("constructor", "a function", constructor);
  }
  if (!customElements.get(name)) {
    customElements.define(name, constructor, options);
    await customElements.whenDefined(name);
  }
}
async function templatePromise(templateConfig) {
  if (templateConfig === void 0) {
    return void 0;
  }
  if (isFn(templateConfig)) {
    templateConfig = await templateConfig();
  }
  templateConfig = await templateConfig;
  if (isStr(templateConfig)) {
    return templateConfig;
  }
  if (isA(templateConfig, JJDF)) {
    return templateConfig.ref.cloneNode(true);
  }
  if (isA(templateConfig, DocumentFragment)) {
    return templateConfig.cloneNode(true);
  }
  if (isA(templateConfig, JJHE)) {
    if (templateConfig.ref instanceof HTMLTemplateElement) {
      return templateConfig.ref.content.cloneNode(true);
    }
    return templateConfig.ref.outerHTML;
  }
  if (isA(templateConfig, HTMLElement)) {
    return templateConfig instanceof HTMLTemplateElement ? templateConfig.content.cloneNode(true) : templateConfig.outerHTML;
  }
  throw typeErr("template", "a string, JJHE, JJDF, HTMLElement, or DocumentFragment", templateConfig);
}
async function stylePromise(styleConfig) {
  if (isFn(styleConfig)) {
    styleConfig = await styleConfig();
  }
  styleConfig = await styleConfig;
  if (isA(styleConfig, CSSStyleSheet)) {
    return styleConfig;
  }
  if (isStr(styleConfig)) {
    return await cssToStyle(styleConfig);
  }
  throw typeErr("style", "a CSS string or CSSStyleSheet", styleConfig);
}
function stylePromises(styleConfigs) {
  if (!isArr(styleConfigs)) {
    return [];
  }
  return styleConfigs.map(stylePromise);
}
async function resolveConfig(templateConfig, styleConfigs) {
  const [template, ...styles] = await Promise.all([templatePromise(templateConfig), ...stylePromises(styleConfigs)]);
  return { template, styles };
}
var _templateConfig;
var _stylesConfig;
var _normalizedConfig;
var _ShadowMaster = class _ShadowMaster2 {
  constructor() {
    __privateAdd(this, _templateConfig);
    __privateAdd(this, _stylesConfig, []);
    __privateAdd(this, _normalizedConfig);
  }
  /**
   * Creates a new instance of ShadowMaster.
   *
   * @returns A new ShadowMaster instance.
   */
  static create() {
    return new _ShadowMaster2();
  }
  /**
   * Sets the template configuration.
   *
   * @param templateConfig - The template configuration.
   * @returns The instance for chaining.
   *
   * @example
   * ```ts
   * // Accepts string, promise, or fetchHtml result
   * sm.setTemplate(fetchHtml('./template.html'))
   * ```
   */
  setTemplate(templateConfig) {
    __privateSet(this, _templateConfig, templateConfig);
    return this;
  }
  /**
   * Adds one or more style configurations.
   *
   * @param stylesConfig - Variable number of style configurations.
   * @returns The instance for chaining.
   *
   * @example
   * ```ts
   * sm.addStyles(
   *     'p { color: red; }',
   *     fetchCss('./styles.css'),
   *     () => fetchCss('../lazy-loaded-styles.css'),
   * )
   * ```
   */
  addStyles(...stylesConfig) {
    __privateGet(this, _stylesConfig).push(...stylesConfig);
    return this;
  }
  /**
   * Resolves the configuration to something that can be fed to `JJHE.initShadow()` function
   *
   * The result is cached, so subsequent calls return the same promise.
   * Note: Any changes made to the ShadowMaster instance (via setTemplate/addStyles)
   * after the first call to getResolved() will be ignored.
   *
   * @returns A promise resolving to the ShadowConfig.
   */
  async getResolved() {
    if (!__privateGet(this, _normalizedConfig)) {
      __privateSet(this, _normalizedConfig, resolveConfig(__privateGet(this, _templateConfig), __privateGet(this, _stylesConfig)));
    }
    return await __privateGet(this, _normalizedConfig);
  }
};
_templateConfig = /* @__PURE__ */ new WeakMap();
_stylesConfig = /* @__PURE__ */ new WeakMap();
_normalizedConfig = /* @__PURE__ */ new WeakMap();
var ShadowMaster = _ShadowMaster;
var doc = JJD.from(document);
export {
  JJD,
  JJDF,
  JJE,
  JJET,
  JJHE,
  JJN,
  JJSE,
  JJSR,
  JJT,
  ShadowMaster,
  addLinkPre,
  attr2prop,
  createLinkPre,
  cssToStyle,
  doc,
  fetchCss,
  fetchHtml,
  fetchStyle,
  fetchText,
  fileExt,
  h,
  keb2cam,
  keb2pas,
  nextAnimationFrame,
  pas2keb,
  registerComponent,
  sleep
};
