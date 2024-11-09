// app/utils/debounce.ts
export function debounce<Args extends any[]>(fn: (...args: Args) => void, delay = 100) {
  let timer: number | undefined;

  const debounced = function <U>(this: U, ...args: Args) {
    const context = this;
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };

  // Add cancel method to clear timeout
  debounced.cancel = () => clearTimeout(timer);

  return debounced;
}
