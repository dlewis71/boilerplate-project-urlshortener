const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');

const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

let urls = [];
let counter = 1;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/api/shorturl', (req, res) => {
  let originalUrl = req.body.url;

  try {
    const parsedUrl = urlParser.parse(originalUrl);
    if (!/^https?:\/\//.test(originalUrl) || !parsedUrl.hostname) {
      return res.json({ error: 'invalid url' });
    }

    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      const shortUrl = counter++;
      urls.push({ original_url: originalUrl, short_url: shortUrl });
      res.json({ original_url: originalUrl, short_url: shortUrl });
    });
  } catch (error) {
    res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const found = urls.find((item) => item.short_url === shortUrl);

  if (found) {
    res.redirect(found.original_url);
  } else {
    res.json({ error: 'No short URL found for given input' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
