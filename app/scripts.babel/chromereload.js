'use strict';

// Reload client for Chrome Apps & Extensions.
// The reload client has a compatibility with livereload.
// WARNING: only supports reload command.

try {
  const LIVERELOAD_HOST = 'localhost:';
  const LIVERELOAD_PORT = 35729;
  const connection = new WebSocket('ws://' + LIVERELOAD_HOST + LIVERELOAD_PORT + '/livereload');

  connection.onerror = error => {
    console.log('reload connection got error:', error);
  };

  connection.onmessage = e => {
    try {
      if (e.data) {
        const data = JSON.parse(e.data);
        if (data && data.command === 'reload') {
          chrome.runtime.reload();
        }
      }
    } catch(err) {
      (console.error || console.log).call(console, err.stack || err);
    }
  };

} catch(err) {
  (console.error || console.log).call(console, err.stack || err);
}