const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    pid: {
      type: Number,
      required: [true, 'pid là bắt buộc'],
      unique: true,
      min: [1, 'pid phải lớn hơn hoặc bằng 1'],
      validate: { validator: Number.isInteger, message: 'pid phải là số nguyên' },
    },
    pname: {
      type: String,
      required: [true, 'pname là bắt buộc'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'price là bắt buộc'],
      min: [0, 'price không được âm'],
    },
    quantity: {
      type: Number,
      required: [true, 'quantity là bắt buộc'],
      min: [0, 'quantity không được âm'],
      validate: { validator: Number.isInteger, message: 'quantity phải là số nguyên' },
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
