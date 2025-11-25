// script.js — CoolCalc
(() => {
  const display = document.getElementById('display');
  const historyEl = document.getElementById('history');
  const buttons = Array.from(document.querySelectorAll('.btn'));
  let current = '';
  let lastResult = '';
  let lastExpr = '';

  function update() {
    display.value = current || lastResult || '0';
    historyEl.textContent = lastExpr ? `${lastExpr} = ${lastResult}` : '';
  }

  function sanitize(expr){
    // allow digits, spaces and operators + - * / % . ( )
    return expr.replace(/[^0-9+\-*/.%() ]/g, '');
  }

  function compute(expr){
    expr = sanitize(expr);
    try {
      // percent handling: convert '50%' -> '(50/100)'
      expr = expr.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
      // evaluate safely using Function
      // NOTE: For assignment/demo only — avoid using eval for production APIs.
      const fn = new Function(`return ${expr}`);
      const val = fn();
      if (!isFinite(val)) return 'Error';
      return Math.round((val + Number.EPSILON) * 100000000) / 100000000;
    } catch (e) {
      return 'Error';
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const n = btn.getAttribute('data-num');
      const op = btn.getAttribute('data-op');

      if (n !== null) {
        if (n === '.' && current.includes('.')) return;
        current = current + n;
      } else if (op) {
        if (op === 'AC') {
          current = '';
          lastResult = '';
          lastExpr = '';
        } else if (op === '±') {
          if (current.startsWith('-')) current = current.slice(1);
          else current = current ? '-' + current : '';
        } else if (op === '=') {
          if (!current) return;
          const res = compute(current);
          lastExpr = current;
          lastResult = res;
          current = '';
        } else {
          // operator (+ - * / %)
          // prevent duplicate operator
          if (current === '' && lastResult) {
            current = String(lastResult) + op;
            lastResult = '';
            lastExpr = '';
          } else if (current.endsWith('+') || current.endsWith('-') || current.endsWith('*') || current.endsWith('/') ) {
            current = current.slice(0, -1) + op;
          } else {
            current += op;
          }
        }
      }
      update();
    });
  });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    const k = e.key;
    if ((/[\d\.\+\-\*\/\%\(\)]/).test(k)) {
      current += k;
      update();
    } else if (k === 'Enter') {
      e.preventDefault();
      if (current) {
        const res = compute(current);
        lastExpr = current;
        lastResult = res;
        current = '';
        update();
      }
    } else if (k === 'Backspace') {
      current = current.slice(0, -1);
      update();
    } else if (k.toLowerCase() === 'c') { // quick clear
      current = '';
      lastResult = '';
      lastExpr = '';
      update();
    }
  });

  // initialize
  update();
})();
