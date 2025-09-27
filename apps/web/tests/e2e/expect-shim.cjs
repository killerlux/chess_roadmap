const jestMatchersObject = Symbol.for("$$jest-matchers-object");

const descriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  jestMatchersObject,
);
if (!descriptor || descriptor.configurable) {
  Object.defineProperty(globalThis, jestMatchersObject, {
    configurable: true,
    writable: true,
    value: descriptor?.value,
  });
}

const Module = require("module");
const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  const exported = originalLoad.apply(this, arguments);
  if (request === "@playwright/test" && exported?.expect?.extend) {
    const originalExtend = exported.expect.extend.bind(exported.expect);
    exported.expect.extend = (matchers) => {
      if (!matchers || typeof matchers !== "object") {
        return originalExtend(matchers ?? {});
      }
      const safeEntries = Object.entries(matchers).filter(
        ([, value]) => typeof value === "function",
      );
      return originalExtend(Object.fromEntries(safeEntries));
    };
  }
  return exported;
};
