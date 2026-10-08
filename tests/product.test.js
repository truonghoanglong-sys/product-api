const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Product = require('../src/models/product');

// Test luon dung database rieng, KHONG dung MONGO_URI cua moi truong dev
const MONGO_URI_TEST =
  process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/productdb_test';

jest.setTimeout(30000);

const sample = { pid: 1, pname: 'Laptop', price: 15000000, quantity: 10 };

const createProduct = (data) => request(app).post('/api/products').send(data);

beforeAll(async () => {
  if (!MONGO_URI_TEST.split('?')[0].endsWith('_test')) {
    throw new Error('Ten database test phai ket thuc bang _test de tranh xoa nham du lieu that');
  }
  await mongoose.connect(MONGO_URI_TEST, { serverSelectionTimeoutMS: 5000 });
  await Product.init(); // dam bao unique index cua pid da duoc tao
});

beforeEach(async () => {
  await Product.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('GET /health', () => {
  test('tra 200 va db connected khi da ket noi MongoDB', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', db: 'connected' });
  });
});

describe('POST /api/products (Create)', () => {
  test('tao san pham moi tra 201', async () => {
    const res = await createProduct(sample);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(sample);
    expect(res.body._id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
  });

  test('thieu truong bat buoc tra 400', async () => {
    const res = await createProduct({ pid: 2, pname: 'Chuot' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Dữ liệu không hợp lệ');
    expect(res.body.errors).toEqual(
      expect.arrayContaining(['price là bắt buộc', 'quantity là bắt buộc'])
    );
  });

  test('trung pid tra 409', async () => {
    await createProduct(sample);
    const res = await createProduct(sample);
    expect(res.status).toBe(409);
    expect(res.body.message).toBe('pid đã tồn tại');
  });

  test('price am tra 400', async () => {
    const res = await createProduct({ ...sample, price: -1 });
    expect(res.status).toBe(400);
  });

  test('quantity khong phai so nguyen tra 400', async () => {
    const res = await createProduct({ ...sample, quantity: 2.5 });
    expect(res.status).toBe(400);
  });

  test('pid bang 0 tra 400', async () => {
    const res = await createProduct({ ...sample, pid: 0 });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/products (Read all)', () => {
  test('danh sach rong tra mang rong', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('danh sach duoc sap xep theo pid', async () => {
    await createProduct({ ...sample, pid: 3 });
    await createProduct({ ...sample, pid: 1 });
    await createProduct({ ...sample, pid: 2 });
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.map((p) => p.pid)).toEqual([1, 2, 3]);
  });
});

describe('GET /api/products/:pid (Read one)', () => {
  test('tim thay san pham tra 200', async () => {
    await createProduct(sample);
    const res = await request(app).get('/api/products/1');
    expect(res.status).toBe(200);
    expect(res.body.pname).toBe('Laptop');
  });

  test('khong ton tai tra 404', async () => {
    const res = await request(app).get('/api/products/999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Không tìm thấy sản phẩm');
  });

  test('pid khong phai so tra 400', async () => {
    const res = await request(app).get('/api/products/abc');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('pid phải là số nguyên');
  });
});

describe('PUT /api/products/:pid (Update)', () => {
  test('cap nhat mot phan, giu nguyen cac truong con lai', async () => {
    await createProduct(sample);
    const res = await request(app)
      .put('/api/products/1')
      .send({ price: 14000000, quantity: 8 });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(14000000);
    expect(res.body.quantity).toBe(8);
    expect(res.body.pname).toBe('Laptop');
  });

  test('khong cho doi pid qua body', async () => {
    await createProduct(sample);
    const res = await request(app)
      .put('/api/products/1')
      .send({ pid: 99, pname: 'Moi' });
    expect(res.status).toBe(200);
    expect(res.body.pid).toBe(1);
    expect(res.body.pname).toBe('Moi');
    const check = await request(app).get('/api/products/99');
    expect(check.status).toBe(404);
  });

  test('san pham khong ton tai tra 404', async () => {
    const res = await request(app).put('/api/products/999').send({ price: 1 });
    expect(res.status).toBe(404);
  });

  test('body rong tra 400', async () => {
    await createProduct(sample);
    const res = await request(app).put('/api/products/1').send({});
    expect(res.status).toBe(400);
  });

  test('price am tra 400', async () => {
    await createProduct(sample);
    const res = await request(app).put('/api/products/1').send({ price: -5 });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/products/:pid (Delete)', () => {
  test('xoa thanh cong roi khong con tim thay', async () => {
    await createProduct(sample);
    const res = await request(app).delete('/api/products/1');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Đã xóa sản phẩm');
    expect(res.body.product.pid).toBe(1);
    const check = await request(app).get('/api/products/1');
    expect(check.status).toBe(404);
  });

  test('xoa san pham khong ton tai tra 404', async () => {
    const res = await request(app).delete('/api/products/999');
    expect(res.status).toBe(404);
  });
});

describe('Cac truong hop chung', () => {
  test('duong dan khong ton tai tra 404', async () => {
    const res = await request(app).get('/api/khong-co');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Không tìm thấy đường dẫn');
  });

  test('JSON sai cu phap tra 400', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Content-Type', 'application/json')
      .send('{bad json');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('JSON không hợp lệ');
  });
});
