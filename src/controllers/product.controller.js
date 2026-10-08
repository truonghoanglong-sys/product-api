const Product = require('../models/product');

function handleError(res, err) {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ',
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'pid đã tồn tại' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Giá trị không hợp lệ: ${err.path}` });
  }
  console.error(err);
  return res.status(500).json({ message: 'Lỗi server' });
}

function parsePid(req, res) {
  const pid = Number(req.params.pid);
  if (!Number.isInteger(pid)) {
    res.status(400).json({ message: 'pid phải là số nguyên' });
    return null;
  }
  return pid;
}

// CREATE: POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const { pid, pname, price, quantity } = req.body;
    const product = await Product.create({ pid, pname, price, quantity });
    res.status(201).json(product);
  } catch (err) {
    handleError(res, err);
  }
};

// READ ALL: GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ pid: 1 });
    res.json(products);
  } catch (err) {
    handleError(res, err);
  }
};

// READ ONE: GET /api/products/:pid
exports.getProductByPid = async (req, res) => {
  try {
    const pid = parsePid(req, res);
    if (pid === null) return;
    const product = await Product.findOne({ pid });
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (err) {
    handleError(res, err);
  }
};

// UPDATE: PUT /api/products/:pid
exports.updateProduct = async (req, res) => {
  try {
    const pid = parsePid(req, res);
    if (pid === null) return;

    const update = {};
    for (const field of ['pname', 'price', 'quantity']) {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    }
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'Cần ít nhất một trường: pname, price, quantity' });
    }

    const product = await Product.findOneAndUpdate({ pid }, update, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (err) {
    handleError(res, err);
  }
};

// DELETE: DELETE /api/products/:pid
exports.deleteProduct = async (req, res) => {
  try {
    const pid = parsePid(req, res);
    if (pid === null) return;
    const product = await Product.findOneAndDelete({ pid });
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json({ message: 'Đã xóa sản phẩm', product });
  } catch (err) {
    handleError(res, err);
  }
};
