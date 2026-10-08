const express = require('express');
const productRoutes = require('./routes/product.routes');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/products', productRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Không tìm thấy đường dẫn' });
});

// Bắt lỗi JSON sai cú pháp trong body
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON không hợp lệ' });
  }
  console.error(err);
  res.status(500).json({ message: 'Lỗi server' });
});

module.exports = app;
