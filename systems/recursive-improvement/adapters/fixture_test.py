"""Independent regression test executes the actual inline script in a Node VM."""
import os
from pathlib import Path
import subprocess

source = (Path(os.environ["RSEI_WORKSPACE"]) / "index.html").read_text()
script = source.split("<script>")[1].split("</script>")[0]
harness = r"""
const vm = require('node:vm');
const assert = require('node:assert/strict');
const elements = {'#count': {textContent: '0'}, '#increment': {}};
const context = {document: {querySelector: selector => elements[selector]}};
let source = '';
process.stdin.on('data', chunk => source += chunk);
process.stdin.on('end', () => {
  vm.runInNewContext(source, context, {timeout: 1000});
  for (let i = 1; i <= 5; i++) {
    elements['#increment'].onclick();
    assert.equal(Number(elements['#count'].textContent), i);
  }
  console.log('PASS: five consecutive clicks increment by exactly one');
});
"""
subprocess.run(["node", "-e", harness], input=script, text=True, check=True, timeout=5)
