importScripts('https://gildas-lormeau.github.io/zip.js/demos/zip.min.js');

function* generatePasswords(charset, maxLen) {
  const base = charset.length;
  const maxNumber = Math.pow(base, maxLen);

  for (let i = 0; i < maxNumber; i++) {
    let n = i;
    let pwd = '';
    for (let j = 0; j < maxLen; j++) {
      pwd = charset[n % base] + pwd;
      n = Math.floor(n / base);
    }
    yield pwd;
  }
}

self.onmessage = async function(e) {
  const { fileBuffer, charset, maxLen } = e.data;
  const fileBlob = new Blob([fileBuffer]);

  for (const pwd of generatePasswords(charset, maxLen)) {
    self.postMessage({ type: 'progress', password: pwd });

    try {
      const reader = new zip.ZipReader(new zip.BlobReader(fileBlob), { password: pwd });
      const entries = await reader.getEntries();
      await reader.close();

      if (entries.length > 0) {
        self.postMessage({ type: 'found', password: pwd });
        return;
      }
    } catch (err) {
      // wrong password, ignore
    }
  }

  self.postMessage({ type: 'notfound' });
};
