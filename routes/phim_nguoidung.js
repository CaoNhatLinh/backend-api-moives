const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/MaNguoiDung/:id', (req, res) => {
  const maNguoiDung = req.params.id;

  if (!maNguoiDung) {
    return res.status(400).json({ error: 'Thiếu MaNguoiDung' });
  }

  db.query('SELECT * FROM defaultdb.phim_nguoiDung WHERE MaNguoiDung = ?', [maNguoiDung], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        error: `Không tìm thấy bản ghi nào cho MaNguoiDung đã cho: ${maNguoiDung}` 
      });
    }

    res.json(results);
  });
});
// Lấy thông tin chi tiết của một bản ghi theo ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM phim_nguoiDung WHERE maPhim_NguoiDung = ?', [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.status(404).json({ error: 'Không tìm thấy bản ghi' });
      }
    }
  });
});
router.put('/', (req, res) => {
  const maNguoiDung = req.query.maNguoiDung;
  const maPhim = req.query.maPhim;
  const maTapPhim = req.query.maTapPhim;

  if (!maNguoiDung || !maPhim || !maTapPhim) {
    return res.status(400).json({ error: 'Thiếu một hoặc nhiều tham số cần thiết' });
  }

  // Logic cập nhật dữ liệu tại đây
  db.query('UPDATE phim_nguoiDung SET MaTapPhim = ? WHERE MaNguoiDung = ? AND MaPhim = ?', 
    [maTapPhim, maNguoiDung, maPhim], (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        if (result.affectedRows === 0) {
          res.status(404).json({ error: 'Không tìm thấy bản ghi nào với các giá trị đã cho' });
        } else {
          res.json({ message: 'Cập nhật thành công', maNguoiDung, maPhim, maTapPhim });
        }
      }
  });
});

// Thêm một bản ghi mới vào bảng phim_nguoiDung
router.post('/', (req, res) => {
  const { MaNguoiDung, MaPhim, MaTapPhim } = req.body;

  // Bước 1: Kiểm tra xem đã có MaNguoiDung và MaPhim chưa
  db.query('SELECT * FROM phim_nguoiDung WHERE MaNguoiDung = ? AND MaPhim = ?', [MaNguoiDung, MaPhim], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      if (results.length > 0) {
        // Bước 2: Nếu đã có, kiểm tra xem MaTapPhim có trùng với MaTapPhim cũ không
        const existingMaTapPhim = results[0].MaTapPhim;
        if (existingMaTapPhim === MaTapPhim) {
          // Bước 3: Nếu trùng, không làm gì cả
          res.status(200).json({ message: 'No action taken. The MaTapPhim is the same.' });
        } else {
          // Bước 4: Nếu không trùng, cập nhật MaTapPhim
          db.query('UPDATE phim_nguoiDung SET MaTapPhim = ? WHERE MaNguoiDung = ? AND MaPhim = ?', [MaTapPhim, MaNguoiDung, MaPhim], (updateErr) => {
            if (updateErr) {
              res.status(500).json({ error: updateErr.message });
            } else {
              res.status(200).json({ message: 'MaTapPhim updated successfully.' });
            }
          });
        }
      } else {
        // Bước 5: Nếu chưa có MaNguoiDung và MaPhim, thêm mới
        db.query('INSERT INTO phim_nguoiDung SET ?', req.body, (insertErr, result) => {
          if (insertErr) {
            res.status(500).json({ error: insertErr.message });
          } else {
            res.status(201).json({ id: result.insertId, ...req.body });
          }
        });
      }
    }
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM phim_nguoiDung WHERE maPhim_NguoiDung = ?', [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Bản ghi đã được xóa' });
    }
  });
});

module.exports = router;
