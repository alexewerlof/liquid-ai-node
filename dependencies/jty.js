// node_modules/jty/lib/misc.js
function isDef(x) {
  return x !== void 0;
}
function isNullish(x) {
  return x === null || x === void 0;
}
function isBool(x) {
  return typeof x === "boolean";
}
function isFn(x) {
  return typeof x === "function";
}
function isSym(x) {
  return typeof x === "symbol";
}
function isBigInt(x) {
  return typeof x === "bigint";
}

// node_modules/jty/lib/number.js
var { isNaN, isFinite, isInteger } = Number;
function isNum(x) {
  return typeof x === "number" && !isNaN(x);
}
function isInt(x) {
  return isInteger(x);
}
function isFin(x) {
  return isFinite(x);
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

// node_modules/jty/lib/array.js
var { isArray } = Array;
function isArr(x, minLen = 0, maxLen) {
  return isArray(x) && inRange(x.length, minLen, maxLen);
}
function isArrIdx(arr, x) {
  if (!isArr(arr)) {
    throw new TypeError(`isArrIdx(): "arr" must be an array. Got ${arr} (${typeof arr})`);
  }
  return isInt(x) && x >= 0 && x < arr.length;
}

// node_modules/jty/lib/object.js
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
function hasPath(x, ...propNames) {
  if (propNames.length === 0) {
    return false;
  }
  let scope = x;
  for (const propName of propNames) {
    if (isObj(scope) && hasProp(scope, propName)) {
      scope = scope[propName];
    } else {
      return false;
    }
  }
  return true;
}
function hasOwnPath(x, ...propNames) {
  if (propNames.length === 0) {
    return false;
  }
  let scope = x;
  for (const propName of propNames) {
    if (isObj(scope) && hasOwnProp(scope, propName)) {
      scope = scope[propName];
    } else {
      return false;
    }
  }
  return true;
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
function hasOwnProp(x, ...propNames) {
  if (!isObj(x)) {
    return false;
  }
  for (let propName of propNames) {
    if (!hasOwnProperty.call(x, propName)) {
      return false;
    }
  }
  return true;
}
function isSet(x) {
  return isA(x, Set);
}
function isMap(x) {
  return isA(x, Map);
}
function isRegExp(x) {
  return isA(x, RegExp);
}
function isDate(x) {
  return isA(x, Date);
}
function isErr(x) {
  return isA(x, Error);
}

// node_modules/jty/lib/string.js
function isStr(x) {
  return typeof x === "string";
}
function isStrLen(x, minLen = 0, maxLen) {
  if (!isStr(x)) {
    return false;
  }
  return inRange(x.length, minLen, maxLen);
}

// node_modules/jty/lib/same.js
var { hasOwnProperty: hasOwnProperty2 } = Object;
var { isArray: isArray2 } = Array;
function isSameArr(x, ref) {
  if (!isArray2(ref)) {
    throw new TypeError(`isSameArr(): "ref" must be an array. Got ${JSON.stringify(ref)}`);
  }
  if (!isArray2(x)) {
    return false;
  }
  if (x === ref) {
    return true;
  }
  return x.length === ref.length && x.every((v, i) => v === ref[i]);
}
function isSameSet(x, ref) {
  if (!isSet(ref)) {
    throw new TypeError(`isSameSet(): "ref" must be a Set. Got ${ref} (${typeof ref})`);
  }
  if (x === ref) {
    return true;
  }
  if (!isSet(x)) {
    return false;
  }
  if (x.size !== ref.size) {
    return false;
  }
  for (const value of ref) {
    if (!x.has(value)) {
      return false;
    }
  }
  return true;
}
function isSameMap(x, ref) {
  if (!isMap(ref)) {
    throw new TypeError(`isSameMap(): "ref" must be a Map. Got ${ref} (${typeof ref})`);
  }
  if (x === ref) {
    return true;
  }
  if (!isMap(x)) {
    return false;
  }
  if (x.size !== ref.size) {
    return false;
  }
  for (const [key, value] of ref) {
    if (!x.has(key) || x.get(key) !== value) {
      return false;
    }
  }
  return true;
}
function isSameRegExp(x, ref) {
  if (!isRegExp(ref)) {
    throw new TypeError(`isSameRegExp(): "ref" must be a RegExp. Got ${ref} (${typeof ref})`);
  }
  if (x === ref) {
    return true;
  }
  if (!isRegExp(x)) {
    return false;
  }
  return x.source === ref.source && x.flags === ref.flags;
}
function isSameDate(x, ref) {
  if (!isDate(ref)) {
    throw new TypeError(`isSameDate(): "ref" must be a Date. Got ${ref} (${typeof ref})`);
  }
  if (x === ref) {
    return true;
  }
  if (!isDate(x)) {
    return false;
  }
  return x.getTime() === ref.getTime();
}
function isSameErr(x, ref) {
  if (!isErr(ref)) {
    throw new TypeError(`isSameErr(): "ref" must be an Error. Got ${ref} (${typeof ref})`);
  }
  if (x === ref) {
    return true;
  }
  if (!isErr(x)) {
    return false;
  }
  return x.name === ref.name && x.message === ref.message;
}
function isSameObj(x, ref) {
  if (!isObj(ref)) {
    throw new TypeError(`isSameObj(): "ref" must be an object. Got ${ref} (${typeof ref})`);
  }
  if (x === ref) {
    return true;
  }
  if (!isObj(x)) {
    return false;
  }
  if ("constructor" in ref && x?.constructor !== ref.constructor) {
    return false;
  }
  if (isArray2(ref)) {
    return isSameArr(x, ref);
  }
  if (ref instanceof Set) {
    return isSameSet(x, ref);
  }
  if (ref instanceof Map) {
    return isSameMap(x, ref);
  }
  if (ref instanceof Error) {
    return isSameErr(x, ref);
  }
  if (ref instanceof Date) {
    return isSameDate(x, ref);
  }
  if (ref instanceof RegExp) {
    return isSameRegExp(x, ref);
  }
  const xKeys = Object.keys(x);
  const refKeys = Object.keys(ref);
  if (xKeys.length !== refKeys.length) {
    return false;
  }
  for (const xKey of xKeys) {
    if (!hasOwnProperty2.call(ref, xKey) || !isDeepEqual(x[xKey], ref[xKey])) {
      return false;
    }
  }
  return true;
}
function isDeepEqual(x, ref) {
  if (x === ref) {
    return true;
  }
  if (!isObj(x) || !isObj(ref)) {
    return false;
  }
  return isSameObj(x, ref);
}
export {
  hasOwnPath,
  hasOwnProp,
  hasPath,
  hasProp,
  inRange,
  isA,
  isArr,
  isArrIdx,
  isBigInt,
  isBool,
  isDate,
  isDeepEqual,
  isDef,
  isErr,
  isFin,
  isFn,
  isInt,
  isMap,
  isNullish,
  isNum,
  isObj,
  isRegExp,
  isSameArr,
  isSameDate,
  isSameErr,
  isSameMap,
  isSameObj,
  isSameRegExp,
  isSameSet,
  isSet,
  isStr,
  isStrLen,
  isSym
};
