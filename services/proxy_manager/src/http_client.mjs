import http from 'http';

export default async function httpRequest(options, data) {
  return new Promise(function(resolve, reject) {
    var result = '';
    const req = http.request(options, res => {
      res.on('data', chunk => {
        result += chunk;
      });

      res.on('end', endData => {
        return resolve(JSON.parse(result))
      });
    });

    if (data) {
      req.write(JSON.stringify(data))
    }

    req.end()
  });
}

