require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const apiRouter = require('./routes/apiRouter');

const app = express();

app.set('trust proxy', 1);

/*const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));*/


  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use('/api', apiRouter);

  app.use('/api/*', (_req, res) => res.status(404).json({ error: 'Not found' }));

  const buildDir = path.join(__dirname, '..', 'frontend', 'build');
    app.use(express.static(buildDir));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(buildDir, 'index.html'));
    });

    if (process.env.NODE_ENV === 'production') {
      const buildDir = path.join(__dirname, '..', 'frontend', 'build');
      app.use(express.static(buildDir));
    
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) return next();
        res.sendFile(path.join(buildDir, 'index.html'));
      });
    }

app.use((err, _req, res, _next) => {
  console.error('Express error:', err && (err.stack || err));
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
  console.log(`OK. Server running on http://localhost:${PORT}`);
});
