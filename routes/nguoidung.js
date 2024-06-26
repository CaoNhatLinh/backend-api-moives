const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Lấy danh sách tất cả người dùng
router.get('/', (req, res) => {
  db.query('SELECT * FROM NguoiDung', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Lấy thông tin người dùng theo ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM NguoiDung WHERE MaNguoiDung = ?', [id], (err, result) => {
    if (err) throw err;
    res.json(result[0]);
  });
});

// Thêm người dùng mới
router.post('/', (req, res) => {
  const nguoidung = req.body;
  db.query('INSERT INTO NguoiDung SET ?', nguoidung, (err, result) => {
    if (err) throw err;
    res.status(201).json({ id: result.insertId, ...nguoidung });
  });
});

// Cập nhật thông tin người dùng
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const newData = req.body;
  db.query('UPDATE NguoiDung SET ? WHERE MaNguoiDung = ?', [newData, id], (err, result) => {
    if (err) throw err;
    res.json({ id, ...newData });
  });
});

// Xóa người dùng
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM NguoiDung WHERE MaNguoiDung = ?', [id], (err, result) => {
    if (err) throw err;
    res.json({ message: 'NguoiDung deleted' });
  });
});
//triệu thêm
router.post('/login', (req, res) => {
  const { emailOrUsername, password } = req.body;

  db.query('SELECT * FROM NguoiDung WHERE (TenDangNhap = ? OR Email = ?) AND MatKhau = ?', [emailOrUsername, emailOrUsername, password], (err, result) => {
    if (err) {
      res.status(500).json({ message: "Đã xảy ra lỗi khi đăng nhập" });
      return;
    }

    if (result.length === 0) {
      res.status(401).json({ message: "Thông tin đăng nhập không đúng" });
      return;
    }

    res.json({ message: "Đăng nhập thành công", user: result[0] });
  });
});

router.get('/profile/:TenDangNhap', (req, res) => {
  const TenDangNhap = req.params.TenDangNhap;

  if (!TenDangNhap) {
      return res.status(400).json({ error: 'Tên đăng nhập không được trống.' });
  }

  // Truy vấn cơ sở dữ liệu
  db.query('SELECT * FROM defaultdb.NguoiDung WHERE TenDangNhap = ? OR Email = ?', [TenDangNhap, TenDangNhap], (err, results) => {
      if (err) {
          console.error('Lỗi khi truy vấn cơ sở dữ liệu:', err);
          return res.status(500).json({ error: 'Có lỗi xảy ra khi truy vấn cơ sở dữ liệu.' });
      }
      if (results.length === 0) {
          return res.status(404).json({ error: 'Không tìm thấy người dùng với tên đăng nhập hoặc email này.' });
      }
      res.json(results[0]);
  });
});


// router.post('/login', (req, res) => {
//   const { Username,email, password } = req.body;

//   db.query('SELECT * FROM NguoiDung WHERE (TenDangNhap = ? OR Email = ?) AND MatKhau = ?', [Username, email, password], (err, result) => {
//     if (err) {
//       res.status(500).json({ message: "Đã xảy ra lỗi khi đăng nhập" });
//       return;
//     }

//     if (result.length === 0) {
//       res.status(401).json({ message: "Thông tin đăng nhập không đúng" });
//       return;
//     }

//     res.json({ message: "Đăng nhập thành công", user: result[0] });
//   });
// });

router.get('/bypassword/:password', (req, res) => {
  const password = req.params.password;
  db.query('SELECT * FROM NguoiDung WHERE MatKhau = ?', [password], (err, result) => {
    if (err) throw err;
    res.json(result[0]);
  });
});

router.get('/byemail/:email', (req, res) => {
  const email = req.params.email;
  db.query('SELECT * FROM NguoiDung WHERE Email = ?', [email], (err, result) => {
    if (err) throw err;
    res.json(result[0]);
  });
});
router.get('/byname/:name', (req, res) => {
  const name = req.params.name;
  db.query('SELECT * FROM NguoiDung WHERE TenDangNhap = ?', [name], (err, result) => {
    if (err) throw err;
    res.json(result[0]);
  });
});

// Thêm người dùng mới
router.post('/register', (req, res) => {
  const nguoiDung = req.body; // Lấy thông tin người dùng từ request body
  
  // Thiết lập giá trị mặc định cho MaQuyen là 'Client'
  nguoiDung.MaQuyen = 'Client';
  
  // Thực hiện truy vấn để thêm người dùng mới vào cơ sở dữ liệu
  db.query('INSERT INTO NguoiDung SET ?', nguoiDung, (err, result) => {
    if (err) {
      // Nếu có lỗi, trả về mã lỗi 500 và thông báo lỗi
      res.status(500).json({ error: err.message });
    } else {
      // Nếu thành công, trả về mã 201 Created và thông tin người dùng vừa đăng ký
      res.status(201).json({ id: result.insertId, ...nguoiDung });
    }
  });
});

// Đổi mật khẩu
router.post('/change-password', (req, res) => {
  const { emailOrUsername, oldPassword, newPassword } = req.body;

  // Kiểm tra thông tin người dùng và mật khẩu cũ
  db.query('SELECT * FROM NguoiDung WHERE (TenDangNhap = ? OR Email = ?) AND MatKhau = ?', [emailOrUsername, emailOrUsername, oldPassword], (err, result) => {
    if (err) {
      res.status(500).json({ message: "Đã xảy ra lỗi khi kiểm tra mật khẩu cũ" });
      return;
    }

    if (result.length === 0) {
      res.status(401).json({ message: "Mật khẩu cũ không đúng" });
      return;
    }

    // Cập nhật mật khẩu mới
    db.query('UPDATE NguoiDung SET MatKhau = ? WHERE MaNguoiDung = ?', [newPassword, result[0].MaNguoiDung], (err, updateResult) => {
      if (err) {
        res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật mật khẩu mới" });
        return;
      }

      res.json({ message: "Đổi mật khẩu thành công" });
    });
  });
});
// checkUserExist API
router.post('/checkUserExist', (req, res) => {
    const { emailOrUsername } = req.body;

    // Kiểm tra xem email hoặc tên đăng nhập đã tồn tại trong cơ sở dữ liệu hay chưa
    db.query('SELECT * FROM NguoiDung WHERE TenDangNhap = ? OR Email = ?', [emailOrUsername, emailOrUsername], (err, result) => {
        if (err) {
            // Nếu có lỗi, trả về mã lỗi 500 và thông báo lỗi
            res.status(500).json({ error: err.message });
        } else {
            // Nếu không có lỗi, trả về mã 200 và kết quả kiểm tra (true/false)
            res.status(200).json({ exists: result.length > 0 });
        }
    });
});


module.exports = router;
