const yaml = require('js-yaml');
const fs = require('fs');

const redirectsYaml = fs.readFileSync('./redirects.yaml', 'utf8');
const hashList = JSON.parse(fs.readFileSync('./script-hash-list.json', 'utf-8'));
const {redirects: parsedRedirects} = yaml.safeLoad(redirectsYaml);

const firebaseJson = require('./firebase.incl.json');
firebaseJson.hosting.redirects = parsedRedirects.reduce(
  (redirects, redirect) => {
    if (redirect.source && redirect.destination) {
      redirects.push({
        source: redirect.source,
        destination: redirect.destination,
        type: 301,
      });
    }
    return redirects;
  },
  [],
);
firebaseJson.hosting.headers[0].headers.push(
  {
    key: 'Content-Security-Policy',
    value: `script-src 'strict-dynamic' ${hashList.join(' ')} 'unsafe-inline' http: https:; object-src 'none'; base-uri 'self'`
  }
);

fs.writeFileSync('./firebase.json', JSON.stringify(firebaseJson, null, 2));
