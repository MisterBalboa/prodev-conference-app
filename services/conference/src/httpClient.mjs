import http from 'http';

export default async function(options, data) {
  return new Promise(function(resolve, reject) {
    var result = '';
    const req = http.request(options, res => {
      res.on('data', chunk => {
        result += chunk;
      });

      res.on('end', function() {
        if (res.StatusCode >= 200 && res.statusCode < 300) {
          try {
            return resolve(JSON.parse(result))
          } catch (err) {
            return result
          }
        } else {
          return result
        }
      });
    });

    if (data) {
      req.write(JSON.stringify(data))
    }

    req.end()
  });
}

