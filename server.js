/* eslint-disable @typescript-eslint/no-require-imports */
// Limit Node.js background thread pool to prevent CloudLinux 'pthread_create' / NPROC thread limit errors
process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || '2';

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
// Phusion Passenger passes a dynamic port via process.env.PORT
// If not available, we use 3000 as a fallback.
const port = process.env.PORT || 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            // Be sure to pass `true` as the second argument to `url.parse`.
            // This tells it to parse the query portion of the URL.
            const parsedUrl = parse(req.url, true);

            // You can add custom routing here if needed
            await handle(req, res, parsedUrl)

        } catch (err) {
            console.error('Error occurred handling', req.url, err)
            res.statusCode = 500
            res.end('internal server error')
        }
    })
        .once('error', (err) => {
            console.error(err)
            require('fs').appendFileSync(__dirname + '/passenger_startup_error.log', new Date().toISOString() + ' - SERVER ONCE ERROR: ' + (err.stack || err) + '\n');
            process.exit(1)
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`)
        })
}).catch((err) => {
    require('fs').appendFileSync(__dirname + '/passenger_startup_error.log', new Date().toISOString() + ' - PREPARE CATCH ERROR: ' + (err.stack || err) + '\n');
    process.exit(1);
})
