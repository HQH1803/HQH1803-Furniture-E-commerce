const cors = require("cors");
const express = require("express");
const mysql = require("mysql2/promise");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require('axios');
const jwt = require("jsonwebtoken"); 
require('dotenv').config();
const CryptoJS = require('crypto-js');
const moment = require('moment');
const qs = require('qs');
const cron = require('node-cron');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('280214824726-obdubefdgijm5csrr7fijrgpku83hla6.apps.googleusercontent.com'); 


const app = express();
const port = 4000;

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });
// Cấu hình để serve frontend React từ build
app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Cấu hình multer để lưu trữ tệp tin
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `file_${Date.now()}${ext}`);
    }
});

const upload = multer({ storage: storage });

const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Middleware để áp dụng CORS cho tất cả các routes
app.use(cors());
app.use(cors({
    exposedHeaders: ['Content-Range']
  }));

// Endpoint để xử lý tải lên hình ảnh
app.post('/api/admin/upload', upload.single('file'), (req, res) => {
    res.json({ url: `/uploads/${req.file.filename}` });
});
// Cấu hình Express để phục vụ các tệp tĩnh từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.post("/api/update-user", async (req, res) => {
    const { email, ho_ten, sdt} = req.body;

    if (!email || !ho_ten || !sdt) {
        return res.status(400).json({ message: "Thiếu thông tin." });
    }

    try {
        // Lấy thông tin tài khoản từ cơ sở dữ liệu
        const [rows] = await connection.execute("SELECT * FROM tai_khoan WHERE email = ?", [email]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Tài khoản không tồn tại." });
        }

        // Cập nhật thông tin người dùng
        await connection.execute("UPDATE tai_khoan SET ho_ten = ?, sdt = ? WHERE email = ?", 
            [ho_ten, sdt, email]);

        res.status(200).json({ message: "Cập nhật thông tin người dùng thành công!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình cập nhật thông tin người dùng." });
    }
});

// Endpoint để cập nhật mật khẩu
app.post("/api/update-password", async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ message: "Thiếu thông tin." });
    }

    try {
        // Lấy thông tin tài khoản từ cơ sở dữ liệu
        const [rows] = await connection.execute("SELECT * FROM tai_khoan WHERE email = ?", [email]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Tài khoản không tồn tại." });
        }

        const user = rows[0];

        // Kiểm tra mật khẩu hiện tại
        if (currentPassword !== user.mat_khau) {
            return res.status(401).json({ message: "Mật khẩu hiện tại không chính xác." });
        }

        // Cập nhật mật khẩu mới
        await connection.execute("UPDATE tai_khoan SET mat_khau = ? WHERE email = ?", [newPassword, email]);

        // Trả về phản hồi thành công
        res.status(200).json({ message: "Cập nhật mật khẩu thành công!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình cập nhật mật khẩu." });
    }
});





// Password update endpoint
app.post('/api/update-password', async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;

    try {
        // Fetch the user from the database using email
        const [user] = await connection.query('SELECT * FROM tai_khoan WHERE email = ?', [email]);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        if (currentPassword !== user.mat_khau) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update the user's password in the database
        await connection.query('UPDATE tai_khoan SET mat_khau = ? WHERE email = ?', [newPassword, email]);

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//Đăng nhập bằng Google
app.post('/api/google-login', async (req, res) => {
    const { idToken } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: '280214824726-obdubefdgijm5csrr7fijrgpku83hla6.apps.googleusercontent.com',
        });

        const payload = ticket.getPayload();
        const email = payload['email'];
        const ho_ten = payload['name']; // Lấy tên từ payload, có thể tùy chỉnh thêm
        const sdt = ""; // Bạn có thể lấy số điện thoại từ một nơi khác nếu cần
        const trangThai = 1; // Ví dụ, 1 có thể là "hoạt động"

        // Kiểm tra xem người dùng đã tồn tại trong cơ sở dữ liệu chưa
        const [rows] = await connection.execute("SELECT * FROM tai_khoan WHERE email = ?", [email]);

        if (rows.length > 0) {
            // Người dùng đã tồn tại
            res.status(200).json({ message: "Login successful", user: rows[0] });
        } else {
            // Người dùng chưa tồn tại, thêm mới vào cơ sở dữ liệu
            await connection.execute(
                "INSERT INTO tai_khoan (email, mat_khau, ho_ten, sdt, trang_thai) VALUES (?, ?, ?, ?, ?)",
                [email, "", ho_ten, sdt, trangThai] // Mat khau có thể để trống hoặc mã hóa nếu cần
            );

            res.status(201).json({ message: "User created successfully", user: { email, ho_ten, sdt, trangThai } });
        }
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

//Đăng nhập bằng FaceBook
app.post('/api/facebook-login', async (req, res) => {
    const { accessToken } = req.body;

    try {
        // Verify Facebook access token using Facebook's API
        const userData = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
        const facebookData = await userData.json();

        const { email, name } = facebookData;
        const ho_ten = name;
        const sdt = ""; // Số điện thoại không có sẵn từ Facebook login
        const trangThai = 1; // Ví dụ, 1 là "hoạt động"

        // Kiểm tra xem người dùng đã tồn tại trong cơ sở dữ liệu chưa
        const [rows] = await connection.execute("SELECT * FROM tai_khoan WHERE email = ?", [email]);

        if (rows.length > 0) {
            // Người dùng đã tồn tại
            res.status(200).json({ message: "Login successful", user: rows[0] });
        } else {
            // Người dùng chưa tồn tại, thêm mới vào cơ sở dữ liệu
            await connection.execute(
                "INSERT INTO tai_khoan (email, mat_khau, ho_ten, sdt, trang_thai) VALUES (?, ?, ?, ?, ?)",
                [email, "", ho_ten, sdt, trangThai]
            );

            res.status(201).json({ message: "User created successfully", user: { email, ho_ten, sdt, trangThai } });
        }
    } catch (error) {
        console.error("Error verifying Facebook token:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



// API Đăng nhập
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Tìm người dùng trong cơ sở dữ liệu
        const [user] = await connection.execute('SELECT * FROM tai_khoan WHERE email = ?', [email]);

        if (!user) {
            return res.status(401).json({ message: 'Tài khoản không tồn tại' });
        }
    
        if (user[0].mat_khau !== password ) {
            return res.status(401).json({ message: 'Mật khẩu không chính xác' });
        }

        // Tạo token (nếu sử dụng JWT)
        const token = jwt.sign(
            { email: user.email, role: user.role }, // Payload
            'secretKey', // Secret Key
            { expiresIn: '1h' }
        );

        // Trả về thông tin người dùng và token
        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                email: user[0].email,
                ho_ten: user[0].ho_ten,
                sdt: user[0].sdt,
                role: user[0].role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Đã xảy ra lỗi trong quá trình đăng nhập' });
    }
});

// Đăng ký
app.post('/api/register', async (req, res) => {
    const { email, password, ho_ten, sdt } = req.body; // Extract sdt from req.body
    try {
        // Check if the email already exists
        const [result] = await connection.query('SELECT * FROM tai_khoan WHERE email = ?', [email]);
        
        if (result.length > 0) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        // Insert new user into the database
        await connection.query(
            'INSERT INTO tai_khoan (email, mat_khau, ho_ten, sdt, trang_thai) VALUES (?, ?, ?, ?, ?)',
            [email, password, ho_ten, sdt, 'active'] // Include sdt and set trang_thai to 'active'
        );

        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (error) {
        console.error('Lỗi server:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

//DÙNG ĐỂ TẠO ĐƠN HÀNG
// API endpoint để tạo đơn hàng
/*app.post('/api/orders', async (req, res) => {
    const { ten_khach_hang, email_khach_hang, sdt_khach_hang, dia_chi, items, ngay_dat_hang, phuong_thuc_giao_hang } = req.body;

    // Tính tổng tiền sản phẩm
    let tong_tien = items.reduce((total, item) => total + item.gia_san_pham * item.so_luong_san_pham, 0);

    // Thêm phí giao hàng nếu là Giao hàng nhanh
    let phi_giao_hang = 0;
    if (phuong_thuc_giao_hang === 'Nhanh') {
        phi_giao_hang = 50000;
    }

    // Tổng tiền sau khi thêm phí giao hàng
    tong_tien += phi_giao_hang;

    const sqlInsertOrder = `
        INSERT INTO don_hang (
            ten_khach_hang, email_khach_hang, sdt_khach_hang, dia_chi,
            tong_tien, phuong_thuc_giao_hang, phi_giao_hang, ngay_dat_hang
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const sqlInsertOrderItem = `
        INSERT INTO chi_tiet_don_hang (
            id_don_hang, id_san_pham, ten_san_pham, so_luong_san_pham, gia_san_pham
        ) VALUES (?, ?, ?, ?, ?)
    `;

    let conn;

    try {
        conn = await connection.getConnection();
        await conn.beginTransaction();

        // Lưu thông tin đơn hàng
        const [result] = await conn.query(sqlInsertOrder, [
            ten_khach_hang, email_khach_hang, sdt_khach_hang, dia_chi,
            tong_tien, phuong_thuc_giao_hang, phi_giao_hang, ngay_dat_hang
        ]);

        const id_don_hang = result.insertId;

        // Lưu từng sản phẩm trong chi tiết đơn hàng
        for (const item of items) {
            await conn.query(sqlInsertOrderItem, [
                id_don_hang, item.id_san_pham, item.ten_san_pham, item.so_luong_san_pham, item.gia_san_pham
            ]);
        }

        await conn.commit();
        res.status(201).json({ message: 'Order placed successfully!' });
    } catch (error) {
        if (conn) {
            await conn.rollback();
        }
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Error placing order' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
});
*/

// Endpoint API để lấy dữ liệu từ bảng 'san_pham'
app.get("/api/san-pham", async (req, res) => {
    try {
        const [rows] = await connection.query(`
            SELECT 
                sp.*,
                GROUP_CONCAT(sms.mau_sac_id) AS mau_sac_ids,
                GROUP_CONCAT(ss.kich_thuoc_id) AS kich_thuoc_ids
            FROM 
                san_pham sp
            LEFT JOIN 
                san_pham_mau_sac sms ON sp.id = sms.san_pham_id
            LEFT JOIN 
                san_pham_kich_thuoc ss ON sp.id = ss.san_pham_id
            GROUP BY 
                sp.id
        `);
        
        const totalCount = rows.length; // Tổng số sản phẩm

        // Thiết lập header Content-Range
        res.set('Content-Range', `san-pham 0-${totalCount - 1}/${totalCount}`);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});




// Endpoint API để lấy thông tin sản phẩm theo ID
app.get("/api/san-pham/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Truy vấn cơ sở dữ liệu để lấy thông tin sản phẩm với ID tương ứng
        const [rows] = await connection.query("SELECT * FROM san_pham WHERE id = ?", [id]);
        
        // Kiểm tra xem sản phẩm có tồn tại không
        if (rows.length === 0) {
            res.status(404).json({ error: "Product not found" });
        } else {
            // Trả về thông tin sản phẩm
            res.json(rows[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching product from database" });
    }
});

// Endpoint API để lấy san pham từ id truyền vào từ bảng 'san_pham'
app.get("/api/chitietsanpham/:id", cors(), async (req, res) => {
    const { id } = req.params;  
    try {
        const [rows] = await connection.query("SELECT * FROM `san_pham` WHERE id = ?", [id]);
        if (rows.length === 0) {
            res.status(404).send("Products not found");
        } else {
            res.json(rows[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching book");
    }
  });
// Endpoint API để lấy dữ liệu 8 SẢN PHẨM MỚI NHẤT từ bảng 'san_pham'
app.get("/api/san-pham-moi", async (req, res) => {
    try {
        const [rows] = await connection.query("SELECT * FROM san_pham WHERE soluong > 0 ORDER BY id DESC LIMIT 6 ");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});
// Endpoint API để lấy dữ liệu 9 SẢN PHẨM NGẪU NHIÊN từ bảng 'san_pham'
app.get("/api/san-pham-ngau-nhien", async (req, res) => {
    try {
        const [rows] = await connection.query("SELECT * FROM san_pham WHERE soluong > 0 ORDER BY RAND() LIMIT 6");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});

// Endpoint API để lấy dữ liệu PHÒNG ĂN
app.get("/api/phong-an", async (req, res) => {
    try {
        const [rows] = await connection.query(`
            SELECT 
                sp.*,
                GROUP_CONCAT(sms.mau_sac_id) AS mau_sac_ids,
                GROUP_CONCAT(ss.kich_thuoc_id) AS kich_thuoc_ids
            FROM 
                san_pham sp
            LEFT JOIN 
                san_pham_mau_sac sms ON sp.id = sms.san_pham_id
            LEFT JOIN 
                san_pham_kich_thuoc ss ON sp.id = ss.san_pham_id
            WHERE 
                sp.loai_phong_id = 4
            GROUP BY 
                sp.id
        `);

        const totalCount = rows.length; // Tổng số sản phẩm
        res.set('Content-Range', `phong-an 0-${totalCount - 1}/${totalCount}`);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});

// Endpoint API để lấy dữ liệu PHÒNG LÀM VIỆC
app.get("/api/phong-lam-viec", async (req, res) => {
    try {
        const [rows] = await connection.query(`
            SELECT 
                sp.*,
                GROUP_CONCAT(sms.mau_sac_id) AS mau_sac_ids,
                GROUP_CONCAT(ss.kich_thuoc_id) AS kich_thuoc_ids
            FROM 
                san_pham sp
            LEFT JOIN 
                san_pham_mau_sac sms ON sp.id = sms.san_pham_id
            LEFT JOIN 
                san_pham_kich_thuoc ss ON sp.id = ss.san_pham_id
            WHERE 
                sp.loai_phong_id = 3
            GROUP BY 
                sp.id
        `);

        const totalCount = rows.length; // Tổng số sản phẩm
        res.set('Content-Range', `phong-lam-viec 0-${totalCount - 1}/${totalCount}`);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});

// Endpoint API để lấy dữ liệu PHÒNG KHÁCH
app.get("/api/phong-khach", async (req, res) => {
    try {
        const [rows] = await connection.query(`
            SELECT 
                sp.*,
                GROUP_CONCAT(sms.mau_sac_id) AS mau_sac_ids,
                GROUP_CONCAT(ss.kich_thuoc_id) AS kich_thuoc_ids
            FROM 
                san_pham sp
            LEFT JOIN 
                san_pham_mau_sac sms ON sp.id = sms.san_pham_id
            LEFT JOIN 
                san_pham_kich_thuoc ss ON sp.id = ss.san_pham_id
            WHERE 
                sp.loai_phong_id = 1
            GROUP BY 
                sp.id
        `);

        const totalCount = rows.length; // Tổng số sản phẩm
        res.set('Content-Range', `phong-khach 0-${totalCount - 1}/${totalCount}`);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});

// Endpoint API để lấy dữ liệu PHÒNG NGỦ
app.get("/api/phong-ngu", async (req, res) => {
    try {
        const [rows] = await connection.query(`
            SELECT 
                sp.*,
                GROUP_CONCAT(sms.mau_sac_id) AS mau_sac_ids,
                GROUP_CONCAT(ss.kich_thuoc_id) AS kich_thuoc_ids
            FROM 
                san_pham sp
            LEFT JOIN 
                san_pham_mau_sac sms ON sp.id = sms.san_pham_id
            LEFT JOIN 
                san_pham_kich_thuoc ss ON sp.id = ss.san_pham_id
            WHERE 
                sp.loai_phong_id = 2
            GROUP BY 
                sp.id
        `);

        const totalCount = rows.length; // Tổng số sản phẩm
        res.set('Content-Range', `phong-ngu 0-${totalCount - 1}/${totalCount}`);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});

// Endpoint API để lấy dữ liệu TỦ QUẦN ÁO
app.get("/api/tu-quan-ao", async (req, res) => {
    try {
        const [rows] = await connection.query(`
            SELECT 
                sp.*,
                GROUP_CONCAT(sms.mau_sac_id) AS mau_sac_ids,
                GROUP_CONCAT(ss.kich_thuoc_id) AS kich_thuoc_ids
            FROM 
                san_pham sp
            LEFT JOIN 
                san_pham_mau_sac sms ON sp.id = sms.san_pham_id
            LEFT JOIN 
                san_pham_kich_thuoc ss ON sp.id = ss.san_pham_id
            WHERE 
                sp.loai_phong_id = 2 AND sp.id_LoaiSP = 3
            GROUP BY 
                sp.id
        `);

        const totalCount = rows.length; // Tổng số sản phẩm
        res.set('Content-Range', `tu-quan-ao 0-${totalCount - 1}/${totalCount}`);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});

// Endpoint API để lấy dữ liệu GIƯỜNG NGỦ
app.get("/api/giuong-ngu", async (req, res) => {
    try {
        const [rows] = await connection.query(`
            SELECT 
                sp.*,
                GROUP_CONCAT(sms.mau_sac_id) AS mau_sac_ids,
                GROUP_CONCAT(ss.kich_thuoc_id) AS kich_thuoc_ids
            FROM 
                san_pham sp
            LEFT JOIN 
                san_pham_mau_sac sms ON sp.id = sms.san_pham_id
            LEFT JOIN 
                san_pham_kich_thuoc ss ON sp.id = ss.san_pham_id
            WHERE 
                sp.loai_phong_id = 2 AND sp.id_LoaiSP = 5
            GROUP BY 
                sp.id
        `);

        const totalCount = rows.length; // Tổng số sản phẩm
        res.set('Content-Range', `giuong-ngu 0-${totalCount - 1}/${totalCount}`);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});

// Endpoint API để lấy dữ liệu NỆM
app.get("/api/nem", async (req, res) => {
    try {
        const [rows] = await connection.query(`
            SELECT 
                sp.*,
                GROUP_CONCAT(sms.mau_sac_id) AS mau_sac_ids,
                GROUP_CONCAT(ss.kich_thuoc_id) AS kich_thuoc_ids
            FROM 
                san_pham sp
            LEFT JOIN 
                san_pham_mau_sac sms ON sp.id = sms.san_pham_id
            LEFT JOIN 
                san_pham_kich_thuoc ss ON sp.id = ss.san_pham_id
            WHERE 
                sp.loai_phong_id = 2 AND sp.id_LoaiSP = 6
            GROUP BY 
                sp.id
        `);

        const totalCount = rows.length; // Tổng số sản phẩm
        res.set('Content-Range', `nem 0-${totalCount - 1}/${totalCount}`);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});


app.get("/api/ban-cafe-sofa", async (req, res) => {
    try {
        const [rows] = await connection.query(`
            SELECT 
                sp.*,
                GROUP_CONCAT(sms.mau_sac_id) AS mau_sac_ids,
                GROUP_CONCAT(ss.kich_thuoc_id) AS kich_thuoc_ids
            FROM 
                san_pham sp
            LEFT JOIN 
                san_pham_mau_sac sms ON sp.id = sms.san_pham_id
            LEFT JOIN 
                san_pham_kich_thuoc ss ON sp.id = ss.san_pham_id
            WHERE 
                sp.loai_phong_id = 1 AND sp.id_LoaiSP = 2
            GROUP BY 
                sp.id
        `);

        const totalCount = rows.length; // Tổng số sản phẩm

        // Thiết lập header Content-Range
        res.set('Content-Range', `ban-cafe-sofa 0-${totalCount - 1}/${totalCount}`);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});

// Endpoint API để lấy dữ liệu GHẾ từ PHÒNG KHÁCH từ bảng 'san_pham'
app.get("/api/ghe-sofa", async (req, res) => {
    try {
        const [rows] = await connection.query(`
            SELECT 
                sp.*,
                GROUP_CONCAT(sms.mau_sac_id) AS mau_sac_ids,
                GROUP_CONCAT(ss.kich_thuoc_id) AS kich_thuoc_ids
            FROM 
                san_pham sp
            LEFT JOIN 
                san_pham_mau_sac sms ON sp.id = sms.san_pham_id
            LEFT JOIN 
                san_pham_kich_thuoc ss ON sp.id = ss.san_pham_id
            WHERE 
                sp.loai_phong_id = 1 AND sp.id_LoaiSP = 1
            GROUP BY 
                sp.id
        `);

        const totalCount = rows.length; // Tổng số sản phẩm

        // Thiết lập header Content-Range
        res.set('Content-Range', `ghe-sofa 0-${totalCount - 1}/${totalCount}`);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});

// Endpoint API để lấy dữ liệu TỦ từ PHÒNG KHÁCH từ bảng 'san_pham'
app.get("/api/tu-tivi", async (req, res) => {
    try {
        const [rows] = await connection.query(`
            SELECT 
                sp.*,
                GROUP_CONCAT(sms.mau_sac_id) AS mau_sac_ids,
                GROUP_CONCAT(ss.kich_thuoc_id) AS kich_thuoc_ids
            FROM 
                san_pham sp
            LEFT JOIN 
                san_pham_mau_sac sms ON sp.id = sms.san_pham_id
            LEFT JOIN 
                san_pham_kich_thuoc ss ON sp.id = ss.san_pham_id
            WHERE 
                sp.loai_phong_id = 1 AND sp.id_LoaiSP = 3
            GROUP BY 
                sp.id
        `);

        const totalCount = rows.length; // Tổng số sản phẩm

        // Thiết lập header Content-Range
        res.set('Content-Range', `tu-tivi 0-${totalCount - 1}/${totalCount}`);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});
// Endpoint API để lấy dữ liệu GHẾ từ PHÒNG LÀM VIỆC từ bảng 'san_pham'
app.get("/api/ghe-van-phong", async (req, res) => {
    try {
        const [rows] = await connection.query(`
            SELECT 
                sp.*,
                GROUP_CONCAT(sms.mau_sac_id) AS mau_sac_ids,
                GROUP_CONCAT(ss.kich_thuoc_id) AS kich_thuoc_ids
            FROM 
                san_pham sp
            LEFT JOIN 
                san_pham_mau_sac sms ON sp.id = sms.san_pham_id
            LEFT JOIN 
                san_pham_kich_thuoc ss ON sp.id = ss.san_pham_id
            WHERE 
                sp.loai_phong_id = 3 AND sp.id_LoaiSP = 1
            GROUP BY 
                sp.id
        `);

        const totalCount = rows.length; // Tổng số sản phẩm

        // Thiết lập header Content-Range
        res.set('Content-Range', `ghe-van-phong 0-${totalCount - 1}/${totalCount}`);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});
// Endpoint API để lấy dữ liệu BÀN từ PHÒNG LÀM VIỆC từ bảng 'san_pham'
// Endpoint API để lấy dữ liệu BÀN từ PHÒNG LÀM VIỆC
app.get("/api/ban-lam-viec", async (req, res) => {
    try {
        const [rows] = await connection.query(`
            SELECT 
                sp.*,
                GROUP_CONCAT(sms.mau_sac_id) AS mau_sac_ids,
                GROUP_CONCAT(ss.kich_thuoc_id) AS kich_thuoc_ids
            FROM 
                san_pham sp
            LEFT JOIN 
                san_pham_mau_sac sms ON sp.id = sms.san_pham_id
            LEFT JOIN 
                san_pham_kich_thuoc ss ON sp.id = ss.san_pham_id
            WHERE 
                sp.loai_phong_id = 3 AND sp.id_LoaiSP = 2
            GROUP BY 
                sp.id
        `);

        const totalCount = rows.length; // Tổng số sản phẩm

        // Thiết lập header Content-Range
        res.set('Content-Range', `ban-lam-viec 0-${totalCount - 1}/${totalCount}`);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});

// Endpoint API để lấy dữ liệu từ bảng 'tin_tuc' với phân trang và giới hạn số tin trả về
app.get("/api/tin-tuc", async (req, res) => {
    const { page = 1, perPage = 5 } = req.query;
    const offset = (page - 1) * perPage;

    try {
        // Lấy dữ liệu từ cơ sở dữ liệu với phân trang và giới hạn
        const [rows] = await connection.query("SELECT * FROM tin_tuc Where trang_thai='Đã duyệt' ORDER BY id DESC LIMIT ?, ?", [offset, perPage]);

        // Lấy tổng số lượng tin tức
        const [[totalCount]] = await connection.query("SELECT COUNT(*) as totalCount FROM tin_tuc");

        const firstIndex = offset + 1;
        const lastIndex = Math.min(offset + perPage, totalCount.totalCount);
        const contentRange = `tin-tuc ${firstIndex}-${lastIndex}/${totalCount.totalCount}`;

        res.set('Content-Range', contentRange);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});

app.get("/api/tin-tuc-chi-tiet/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Đầu tiên, lấy tin tức
        const [newsItem] = await connection.query("SELECT * FROM tin_tuc WHERE id = ?", [id]);

        if (!newsItem.length) {
            return res.status(404).json({ error: "Tin tức không tìm thấy." });
        }    

        // Gửi tin tức cùng với lượt xem
        res.status(200).json(newsItem[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi khi lấy thông tin tin tức." });
    }
});

app.post("/api/tin-tuc-chi-tiet/:id/increase-view", async (req, res) => {
    const { id } = req.params;

    try {
        // Tăng lượt xem
        await connection.query("UPDATE tin_tuc SET luot_xem = luot_xem + 1 WHERE id = ?", [id]);
        res.status(200).json({ message: "Lượt xem đã được tăng." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi khi cập nhật lượt xem." });
    }
});

// Endpoint POST để lấy 4 tin tức mới nhất
app.get("/api/tin-tuc-moi", async (req, res) => {
    try {
        const [rows] = await connection.query("SELECT * FROM tin_tuc ORDER BY id DESC LIMIT 4");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});


// Endpoint API để lấy dữ liệu theo tên tìm kiếm từ bảng 'san_pham'
app.get("/api/search/:tentimkiem", async (req, res) => {
    const { tentimkiem } = req.params;

    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    try {
        // Sử dụng ? để thay thế cho giá trị tìm kiếm, tránh SQL injection
        const [rows] = await connection.query("SELECT * FROM san_pham WHERE tenSP LIKE ?", [`%${tentimkiem}%`]);
        if (rows.length === 0) {
            res.status(404).send("Product not found");
        } else {
            res.json(rows); // Trả về tất cả các bản ghi thỏa mãn điều kiện
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching product");
    }
}); 


//Admin
// Route GET: Lấy danh sách sản phẩm

app.get('/api/admin/san-pham', async (req, res) => {
    try {
        const [rows] = await connection.query(`
            SELECT sp.*, 
            lsp.tenLoaiSP, 
            lp.tenPhong
            FROM san_pham sp
            JOIN loai_san_pham lsp ON sp.id_loaiSP = lsp.id
            JOIN loai_phong lp ON sp.loai_phong_id = lp.id
            ORDER BY sp.id DESC;
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching products from database" });
    }
});



// Route POST: Thêm sản phẩm mới hoặc cập nhật số lượng nếu sản phẩm đã tồn tại
app.post('/api/admin/san-pham', async (req, res) => {
    const { 
        tenSP, 
        hinh_anh, 
        mo_ta, 
        mo_ta_nho, 
        gia, 
        soluong, 
        id_loaiSP, 
        loai_phong_id,
        mau_sac_ids,
        kich_thuoc_ids
    } = req.body;

    // Thay thế undefined bằng null
    const values = [
        tenSP ?? null,
        hinh_anh ?? null,
        mo_ta ?? null,
        mo_ta_nho ?? null,
        gia ?? null,
        soluong ?? null,
        id_loaiSP ?? null,
        loai_phong_id ?? null,
        gia ?? null
    ];
    console.log('Values for INSERT:', values);

    try {
        // Check if product already exists
        const [existingProduct] = await connection.execute(
            'SELECT * FROM san_pham WHERE tenSP = ? AND id_loaiSP = ? AND loai_phong_id = ?',
            [tenSP, id_loaiSP, loai_phong_id]
        );

        if (existingProduct.length > 0) {
            // If product exists, update its quantity
            const newQuantity = existingProduct[0].soluong + soluong;
            await connection.execute(
                'UPDATE san_pham SET soluong = ? WHERE id = ?',
                [newQuantity, existingProduct[0].id]
            );
            return res.status(200).json({ message: 'Cập nhật số lượng sản phẩm thành công' });
        }

        // If product doesn't exist, insert a new product
        const [result] = await connection.execute(
            'INSERT INTO san_pham (tenSP, hinh_anh, mo_ta, mo_ta_nho, gia, soluong, id_loaiSP, loai_phong_id, gia_goc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            values
        );
        
        // Insert into san_pham_mau_sac table
        if (mau_sac_ids && mau_sac_ids.length > 0) {
            const insertMauSacPromises = mau_sac_ids.map(mau_sac_id => {
                return connection.execute(
                    'INSERT INTO san_pham_mau_sac (san_pham_id, mau_sac_id) VALUES (?, ?)',
                    [result.insertId, mau_sac_id]
                );
            });
            await Promise.all(insertMauSacPromises);
        }

        // Insert into san_pham_kich_thuoc table
        if (kich_thuoc_ids && kich_thuoc_ids.length > 0) {
            const insertKichThuocPromises = kich_thuoc_ids.map(kich_thuoc_id => {
                return connection.execute(
                    'INSERT INTO san_pham_kich_thuoc (san_pham_id, kich_thuoc_id) VALUES (?, ?)',
                    [result.insertId, kich_thuoc_id]
                );
            });
            await Promise.all(insertKichThuocPromises);
        }

        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error adding or updating product:', error); // Ghi lại lỗi
        res.status(500).json({ error: error.message });
    }
});

// Route PUT: Cập nhật thông tin sản phẩm
app.put('/api/admin/san-pham/:id', async (req, res) => {
    const { id } = req.params;
    const { 
        tenSP, 
        hinh_anh, 
        mo_ta, 
        mo_ta_nho, 
        gia, 
        soluong, 
        id_loaiSP, 
        loai_phong_id,
        mau_sac_ids,
        kich_thuoc_ids
    } = req.body;

    // Thay thế undefined bằng null
    const values = [
        tenSP ?? null,
        hinh_anh ?? null,
        mo_ta ?? null,
        mo_ta_nho ?? null,
        gia ?? null,
        soluong ?? null,
        Array.isArray(id_loaiSP) ? id_loaiSP[0] : id_loaiSP ?? null,
        loai_phong_id ?? null,
        gia ?? null,  // Cập nhật gia_goc bằng gia
        id
    ];

    try {
        const [result] = await connection.execute(
            'UPDATE san_pham SET tenSP = ?, hinh_anh = ?, mo_ta = ?, mo_ta_nho = ?, gia = ?, soluong = ?, id_loaiSP = ?, loai_phong_id = ?, gia_goc = ? WHERE id = ?',
            values
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Xóa màu sắc và kích thước cũ
        await connection.execute('DELETE FROM san_pham_mau_sac WHERE san_pham_id = ?', [id]);
        await connection.execute('DELETE FROM san_pham_kich_thuoc WHERE san_pham_id = ?', [id]);

        // Thêm màu sắc mới
        if (mau_sac_ids && mau_sac_ids.length > 0) {
            const insertMauSacPromises = mau_sac_ids.map(mau_sac_id => {
                return connection.execute(
                    'INSERT INTO san_pham_mau_sac (san_pham_id, mau_sac_id) VALUES (?, ?)',
                    [id, mau_sac_id]
                );
            });
            await Promise.all(insertMauSacPromises);
        }

        // Thêm kích thước mới
        if (kich_thuoc_ids && kich_thuoc_ids.length > 0) {
            const insertKichThuocPromises = kich_thuoc_ids.map(kich_thuoc_id => {
                return connection.execute(
                    'INSERT INTO san_pham_kich_thuoc (san_pham_id, kich_thuoc_id) VALUES (?, ?)',
                    [id, kich_thuoc_id]
                );
            });
            await Promise.all(insertKichThuocPromises);
        }

        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error updating product:', error); // Ghi lại lỗi
        res.status(500).json({ error: error.message });
    }
});



// Route DELETE: Xoá sản phẩm

app.delete('/api/admin/san-pham/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Kiểm tra xem sản phẩm có tồn tại trong bảng order_item không
        const [orderCheck] = await connection.execute(
            'SELECT oi.order_id, o.status FROM order_items oi JOIN orders o ON oi.order_id = o.order_id WHERE oi.product_id = ?',
            [id]
        );

        // Kiểm tra nếu sản phẩm có trong đơn hàng và trạng thái của đơn hàng
        if (orderCheck.length > 0) {
            const order = orderCheck[0];
            // Nếu trạng thái đơn hàng là 'cancel' hoặc 'delivered', có thể xóa sản phẩm
            if (order.status === 'cancel\n' || order.status === 'delivered\n') {
                // Xóa sản phẩm trong bảng san_pham
                await connection.execute('DELETE FROM san_pham WHERE id = ?', [id]);
                return res.status(204).send(); // Xóa thành công
            } else {
                // Nếu đơn hàng chưa bị hủy hoặc chưa giao, không cho phép xóa
                return res.status(400).json({ error: 'Không thể xoá! Sản phẩm còn tồn tại trong đơn hàng chưa hủy hoặc chưa giao.' });
            }
        }

        // Nếu không có đơn hàng nào liên quan đến sản phẩm, cho phép xóa
        await connection.execute('DELETE FROM san_pham WHERE id = ?', [id]);
        res.status(204).send(); // Xóa thành công
    } catch (error) {
        console.error('Error deleting product:', error); // Ghi lỗi
        res.status(500).json({ error: error.message }); // Lỗi server
    }
});



app.get('/api/kich-thuoc', async (req, res) => {
    try {
        const [rows] = await connection.query("SELECT * FROM kich_thuoc");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});
app.post('/api/kich-thuoc', async (req, res) => {
    const { kich_thuoc } = req.body;

    if (!kich_thuoc) {
        return res.status(400).json({ error: "Kích thước không được để trống" });
    }

    try {
        // Check if kich_thuoc already exists
        const [existing] = await connection.query("SELECT * FROM kich_thuoc WHERE kich_thuoc = ?", [kich_thuoc]);
        if (existing.length > 0) {
            return res.status(409).json({ error: "Kích thước này đã tồn tại" });
        }

        // Insert new kich_thuoc
        const [result] = await connection.query("INSERT INTO kich_thuoc (kich_thuoc) VALUES (?)", [kich_thuoc]);
        res.status(201).json({ id: result.insertId, kich_thuoc });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error inserting data into database" });
    }
});
app.put('/api/kich-thuoc/:id', async (req, res) => {
    const { id } = req.params;
    const { kich_thuoc } = req.body;

    if (!kich_thuoc) {
        return res.status(400).json({ error: "Kích thước không được để trống" });
    }

    try {
        // Check if kich_thuoc already exists
        const [existing] = await connection.query("SELECT * FROM kich_thuoc WHERE kich_thuoc = ? AND id != ?", [kich_thuoc, id]);
        if (existing.length > 0) {
            return res.status(409).json({ error: "Kích thước này đã tồn tại" });
        }

        // Update kich_thuoc
        const [result] = await connection.query("UPDATE kich_thuoc SET kich_thuoc = ? WHERE id = ?", [kich_thuoc, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Không tìm thấy kích thước để cập nhật" });
        }

        res.json({ id, kich_thuoc });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error updating data in database" });
    }
});
app.delete('/api/kich-thuoc/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await connection.query("DELETE FROM kich_thuoc WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Không tìm thấy kích thước để xóa" });
        }

        res.json({ message: "Xóa kích thước thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error deleting data from database" });
    }
});

app.get('/api/mau-sac', async (req, res) => {
    try {
        const [rows] = await connection.query("SELECT * FROM mau_sac");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});
app.post('/api/mau-sac', async (req, res) => {
    const { ten_mau, ma_mau } = req.body;
    console.log(ma_mau)
    if (!ten_mau || !ma_mau) {
        return res.status(400).json({ error: 'Tên màu và mã màu là bắt buộc' });
    }

    try {
        // Kiểm tra màu đã tồn tại
        const [existingColor] = await connection.query(
            "SELECT * FROM mau_sac WHERE ten_mau = ? OR ma_mau = ?",
            [ten_mau, ma_mau]
        );

        if (existingColor.length > 0) {
            return res.status(400).json({ error: 'Tên màu hoặc mã màu đã tồn tại' });
        }

        // Thêm màu mới nếu không tồn tại
        const [result] = await connection.query(
            "INSERT INTO mau_sac (ten_mau, ma_mau) VALUES (?, ?)",
            [ten_mau, ma_mau]
        );

        res.status(201).json({ id: result.insertId, ten_mau, ma_mau });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error inserting data into database" });
    }
});

app.put('/api/mau-sac/:id', async (req, res) => {
    const { id } = req.params;
    const { ten_mau, ma_mau } = req.body;
    if (!ten_mau || !ma_mau) {
        return res.status(400).json({ error: 'Tên màu và mã màu là bắt buộc' });
    }

    try {
        // Kiểm tra màu đã tồn tại nhưng không phải của bản ghi hiện tại
        const [existingColor] = await connection.query(
            "SELECT * FROM mau_sac WHERE (ten_mau = ? OR ma_mau = ?) AND id != ?",
            [ten_mau, ma_mau, id]
        );

        if (existingColor.length > 0) {
            return res.status(400).json({ error: 'Tên màu hoặc mã màu đã tồn tại' });
        }

        // Cập nhật màu nếu hợp lệ
        const [result] = await connection.query(
            "UPDATE mau_sac SET ten_mau = ?, ma_mau = ? WHERE id = ?",
            [ten_mau, ma_mau, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Không tìm thấy màu sắc cần cập nhật" });
        }

        res.json({ id, ten_mau, ma_mau });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error updating data in database" });
    }
});

app.delete('/api/mau-sac/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await connection.query(
            "DELETE FROM mau_sac WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Không tìm thấy màu sắc cần xóa" });
        }

        res.json({ message: "Xóa màu sắc thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error deleting data from database" });
    }
});


app.get('/api/getKichThuocMauSac/:productId', async (req, res) => {
    const { productId } = req.params; // Lấy productId từ params

    try {
        const [rows] = await connection.execute(`
            SELECT DISTINCT
                k.id AS kich_thuoc_id,
                k.kich_thuoc AS kich_thuoc,
                m.id AS mau_sac_id,
                m.ten_mau AS mau_sac
            FROM 
                san_pham sp
            JOIN 
                san_pham_kich_thuoc spk ON sp.id = spk.san_pham_id
            JOIN 
                kich_thuoc k ON spk.kich_thuoc_id = k.id
            JOIN 
                san_pham_mau_sac spm ON sp.id = spm.san_pham_id
            JOIN 
                mau_sac m ON spm.mau_sac_id = m.id
            WHERE 
                sp.id = ?
        `, [productId]); // Truyền productId vào tham số truy vấn

        if (rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Trả về dữ liệu theo dạng mảng chứa id và tên cho kichThuoc và mauSac
        const kichThuoc = rows.map(row => ({
            id: row.kich_thuoc_id,
            name: row.kich_thuoc
        }));
        const mauSac = rows.map(row => ({
            id: row.mau_sac_id,
            name: row.mau_sac
        }));

        res.json({
            kichThuoc,
            mauSac
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});

app.get('/api/getLoaiSanPham/:loaiSanPhamId', async (req, res) => {
    const { loaiSanPhamId } = req.params;
    try {
        const [rows] = await connection.execute(`
             SELECT * FROM loai_san_pham WHERE id = ?
        `, [loaiSanPhamId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Loai san pham not found" });
        }

        res.json(rows[0]); // Trả về tên loại sản phẩm
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching loai san pham" });
    }
});

app.get('/api/loai-phong-san-pham', async (req, res) => {
    try {
        const [rows] = await connection.query("SELECT * FROM loai_phong_san_pham");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});

// POST: Thêm liên kết giữa loại phòng và loại sản phẩm
app.post('/api/loai-phong-san-pham', async (req, res) => {
    const { loai_phong_id, loai_san_pham_id } = req.body;

    if (!loai_phong_id || !loai_san_pham_id) {
        return res.status(400).json({ error: "Vui lòng cung cấp đầy đủ thông tin" });
    }

    try {
        await connection.query(
            "INSERT INTO loai_phong_san_pham (loai_phong_id, loai_san_pham_id) VALUES (?, ?)",
            [loai_phong_id, loai_san_pham_id]
        );
        res.json({ message: "Liên kết thành công!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi khi thêm liên kết" });
    }
});

// PUT: Cập nhật liên kết giữa loại phòng và loại sản phẩm
app.put('/api/loai-phong-san-pham/:id', async (req, res) => {
    const { id } = req.params;
    const { loai_phong_id, loai_san_pham_id } = req.body;

    if (!loai_phong_id || !loai_san_pham_id) {
        return res.status(400).json({ error: "Vui lòng cung cấp đầy đủ thông tin" });
    }

    try {
        const [result] = await connection.query(
            "UPDATE loai_phong_san_pham SET loai_phong_id = ?, loai_san_pham_id = ? WHERE id = ?",
            [loai_phong_id, loai_san_pham_id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Liên kết không tìm thấy" });
        }

        res.json({ message: "Cập nhật liên kết thành công!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi khi cập nhật liên kết" });
    }
});

// DELETE: Xóa liên kết giữa loại phòng và loại sản phẩm
app.delete('/api/loai-phong-san-pham/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await connection.query(
            "DELETE FROM loai_phong_san_pham WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Liên kết không tìm thấy" });
        }

        res.json({ message: "Xóa liên kết thành công!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi khi xóa liên kết" });
    }
});


app.get('/api/loai-san-pham', async (req, res) => {
    try {
        const [rows] = await connection.query("SELECT * FROM loai_san_pham");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});
app.post('/api/loai-san-pham', async (req, res) => {
    const { tenLoaiSP } = req.body;
    try {
      // Kiểm tra trùng tên loại sản phẩm
      const [rows] = await connection.execute('SELECT * FROM loai_san_pham WHERE tenLoaiSP = ?', [tenLoaiSP]);
      if (rows.length > 0) {
        return res.status(409).json({ message: "Tên loại sản phẩm đã tồn tại" });
      }
  
      // Thêm loại sản phẩm mới
      const [result] = await connection.execute('INSERT INTO loai_san_pham (tenLoaiSP) VALUES (?)', [tenLoaiSP]);
      res.status(201).json({ id: result.insertId, tenLoaiSP });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server" });
    }
});
  
app.put('/api/loai-san-pham/:id', async (req, res) => {
    const { id } = req.params;
    const { tenLoaiSP} = req.body;

    if (!tenLoaiSP) {
        return res.status(400).json({ error: "Tên loại sản phẩm và hình ảnh là bắt buộc." });
    }

    try {
        const query = "UPDATE loai_san_pham SET tenLoaiSP = ? WHERE id = ?";
        const [result] = await connection.query(query, [tenLoaiSP, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Không tìm thấy loại sản phẩm để sửa." });
        }

        res.json({ message: "Sửa loại sản phẩm thành công." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi khi sửa loại sản phẩm." });
    }
});     
app.delete('/api/loai-san-pham/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = "DELETE FROM loai_san_pham WHERE id = ?";
        const [result] = await connection.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Không tìm thấy loại sản phẩm để xóa." });
        }

        res.json({ message: "Xóa loại sản phẩm thành công." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi khi xóa loại sản phẩm." });
    }
});

app.get('/api/loai-phong', async (req, res) => {
    try {
        const [rows] = await connection.query("SELECT * FROM loai_phong");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});
app.post('/api/loai-phong', async (req, res) => {
    const { tenPhong, mo_ta_phong } = req.body;

    if (!tenPhong) {
        return res.status(400).json({ error: "Tên phòng là bắt buộc." });
    }

    // Nếu mo_ta_phong không được truyền hoặc là chuỗi rỗng, đặt nó thành null
    const description = mo_ta_phong || null;

    try {
        const query = "INSERT INTO loai_phong (tenPhong, mo_ta_phong) VALUES (?, ?)";
        await connection.query(query, [tenPhong, description]);
        res.status(201).json({ message: "Thêm mới loại phòng thành công." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi khi thêm mới loại phòng." });
    }
});

app.put('/api/loai-phong/:id', async (req, res) => {
    const { id } = req.params;
    const { tenPhong, mo_ta_phong } = req.body;

    if (!tenPhong) {
        return res.status(400).json({ error: "Tên phòng là bắt buộc." });
    }

    // Nếu mo_ta_phong không được truyền hoặc là chuỗi rỗng, đặt nó thành null
    const description = mo_ta_phong || null;

    try {
        const query = "UPDATE loai_phong SET tenPhong = ?, mo_ta_phong = ? WHERE id = ?";
        const [result] = await connection.query(query, [tenPhong, description, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Không tìm thấy loại phòng để sửa." });
        }

        res.json({ message: "Sửa loại phòng thành công." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi khi sửa loại phòng." });
    }
});
app.delete('/api/loai-phong/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = "DELETE FROM loai_phong WHERE id = ?";
        const [result] = await connection.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Không tìm thấy loại phòng để xóa." });
        }

        res.json({ message: "Xóa loại phòng thành công." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi khi xóa loại phòng." });
    }
});

app.get('/api/danh-sach-phong', async (req, res) => {
    try {
        const [rows] = await connection.query(`
           SELECT  lp.id AS LoaiPhongID,
                   lp.tenPhong AS LoaiPhong, 
                   GROUP_CONCAT(lsp.id, ':', lsp.tenLoaiSP SEPARATOR ', ') AS SanPham
            FROM loai_phong_san_pham lpsp
            JOIN loai_phong lp ON lpsp.loai_phong_id = lp.id
            JOIN loai_san_pham lsp ON lpsp.loai_san_pham_id = lsp.id
            GROUP BY lp.tenPhong;
          `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching data from database" });
    }
});
  

app.get('/api/loai-phong/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await connection.execute('SELECT * FROM loai_phong WHERE id = ?', [id]);

        // Kiểm tra nếu không tìm thấy bản ghi nào
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Not found' });
        }

        // Trả về mô tả loại sản phẩm
        res.json(rows[0]); // Trả về đối tượng đầu tiên
    } catch (error) {
        console.error('Error fetching product description: ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route GET: Lấy danh sách tin tức
app.get('/api/admin/tin-tuc', async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM tin_tuc ORDER By id DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route GET: Lấy danh sách tài khoản
app.get('/api/accounts', async (req, res) => {
    try {
      const [rows] = await connection.execute('SELECT * FROM tai_khoan');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Route POST: Thêm tài khoản mới
  app.post('/api/accounts', async (req, res) => {
    const { email, mat_khau, ho_ten, sdt, trang_thai, role } = req.body;
    try {
      const result = await connection.execute(
        'INSERT INTO tai_khoan (email, mat_khau, ho_ten, sdt, trang_thai, role) VALUES (?, ?, ?, ?, ?, ?)',
        [email, mat_khau, ho_ten, sdt, trang_thai, role]
      );
      res.status(201).json({ message: 'Account added successfully', id: result[0].insertId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Route PUT: Cập nhật tài khoản
  app.put('/api/accounts/:id', async (req, res) => {
    const { email, mat_khau, ho_ten, sdt, trang_thai, role } = req.body;
    const { id } = req.params;
    try {
      const result = await connection.execute(
        'UPDATE tai_khoan SET email = ?, mat_khau = ?, ho_ten = ?, sdt = ?, trang_thai = ?, role = ? WHERE id = ?',
        [email, mat_khau, ho_ten, sdt, trang_thai, role, id]
      );
      if (result[0].affectedRows > 0) {
        res.json({ message: 'Account updated successfully' });
      } else {
        res.status(404).json({ message: 'Account not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Route DELETE: Xóa tài khoản
  app.delete('/api/accounts/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await connection.execute('DELETE FROM tai_khoan WHERE id = ?', [id]);
      if (result[0].affectedRows > 0) {
        res.json({ message: 'Account deleted successfully' });
      } else {
        res.status(404).json({ message: 'Account not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  

// Route POST: Thêm tin tức mới
app.post('/api/admin/tin-tuc', async (req, res) => {
    const { tieu_de, hinh_anh, noi_dung, ngay_dang, trang_thai } = req.body;

    try {
        const [result] = await connection.execute(
            `INSERT INTO tin_tuc (tieu_de, hinh_anh, noi_dung, ngay_dang, trang_thai) 
            VALUES (?, ?, ?, ?, ?, ?)`,
           [tieu_de, hinh_anh, noi_dung, ngay_dang, luot_xem || 0, trang_thai]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route PUT: Cập nhật thông tin tin tức
app.put('/api/admin/tin-tuc/:id', async (req, res) => {
    const { id } = req.params;
    const { tieu_de, hinh_anh, noi_dung, ngay_dang, trang_thai } = req.body;


    try {
        await connection.execute(
            `UPDATE tin_tuc 
             SET tieu_de = ?, hinh_anh = ?, noi_dung = ?, ngay_dang = ?, trang_thai = ? 
             WHERE id = ?`,
            [tieu_de, hinh_anh, noi_dung, ngay_dang, trang_thai, id]
        );
        res.json({ id, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route DELETE: Xoá tin tức
app.delete('/api/admin/tin-tuc/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await connection.execute('DELETE FROM tin_tuc WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ĐƠN HÀNG
// Lấy ra đơn hàng
// Route GET: Lấy danh sách đơn hàng
app.get('/api/don-hang', async (req, res) => {
    try {
        
        // Thực hiện truy vấn để lấy đơn hàng dựa trên email
        const [rows] = await connection.execute(
            'SELECT * FROM orders ORDER BY order_id DESC'
        );
        
        // Trả về kết quả
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Route GET: Lấy danh sách đơn hàng qua người dùng
app.get('/api/don-hang-user', async (req, res) => {
    const email = req.query.email; // Lấy email từ query parameter

    try {
        // Thực hiện truy vấn để lấy đơn hàng và tên người dùng
        const [rows] = await connection.execute(
            `SELECT o.*, u.ho_ten FROM orders o
             JOIN tai_khoan u ON o.user_email = u.email
             WHERE o.user_email = ? ORDER BY o.order_id DESC`,
            [email]
        );

        // Trả về kết quả
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Endpoint cập nhật đơn hàng
app.put('/api/don-hang/:id', async (req, res) => {
    const orderId = req.params.id; // Lấy ID từ URL
    const {
      recipient_name,
      recipient_phone,
      recipient_address,
      recipient_ward,
      recipient_district,
      status,
      total_amount,
    } = req.body; // Lấy thông tin từ body
  
    // SQL query để cập nhật đơn hàng
    const sql = `
      UPDATE orders 
      SET 
        recipient_name = ?, 
        recipient_phone = ?, 
        recipient_address = ?, 
        recipient_ward = ?, 
        recipient_district = ?, 
        status = ?, 
        total_amount = ?
      WHERE order_id = ?`;
  
    const values = [
      recipient_name,
      recipient_phone,
      recipient_address,
      recipient_ward,
      recipient_district,
      status,
      total_amount,
      orderId,
    ];
  
    try {
      await connection.execute(sql, values); // Thực hiện cập nhật
      res.status(200).json({ message: 'Cập nhật đơn hàng thành công' });
    } catch (error) {
      console.error('Lỗi cập nhật đơn hàng:', error);
      res.status(500).json({ message: 'Lỗi khi cập nhật đơn hàng' });
    }
  });
  

// Route DELETE: Xoá đơn hàng
app.delete('/api/don-hang/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Lấy thông tin mã đơn hàng từ cơ sở dữ liệu trước khi xoá
        const [order] = await connection.execute('SELECT order_code FROM orders WHERE order_id = ?', [id]);
        if (order.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const orderCode = order[0].order_code;

        // Gửi yêu cầu xoá đơn hàng qua API GHN
        const response = await axios.post('https://online-gateway.ghn.vn/shiip/public-api/v2/switch-status/cancel', 
            {
                order_codes: [orderCode]
            }, 
            {
                headers: {
                    'Content-Type': 'application/json',
                    'ShopId': process.env.REACT_APP_API_SHOPID_GHN,
                    'Token': process.env.REACT_APP_API_TOKEN_GHN
                }
            }
        );

        if (response.data.code !== 200) {
            return res.status(400).json({ error: 'Failed to cancel order on GHN' });
        }

        // Xoá đơn hàng khỏi cơ sở dữ liệu sau khi thành công từ GHN
        await connection.execute('DELETE FROM orders WHERE order_id = ?', [id]);
        res.status(204).send();

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

 
// API để lấy chi tiết đơn hàng
app.get('/api/don-hang/:orderId/details', async (req, res) => {
    const { orderId } = req.params;

    try {
        // Truy vấn để lấy chi tiết đơn hàng
        const [rows] = await connection.execute(
            `SELECT oi.item_id, oi.product_id, oi.product_name, oi.quantity, oi.price, 
                    (oi.quantity * oi.price) AS tong_tien
            FROM order_items oi
            WHERE oi.order_id = ?`,
            [orderId]
        );

        // Kiểm tra nếu không có sản phẩm nào được tìm thấy
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy chi tiết đơn hàng' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
        res.status(500).json({ error: 'Có lỗi xảy ra khi lấy chi tiết đơn hàng' });
    }
});
   
// API để hủy đơn hàng nếu trạng thái là 'ready_to_pick'
app.post('/api/don-hang/:orderId/cancel', async (req, res) => {
    const { orderId } = req.params;

    try {
        // Kiểm tra trạng thái đơn hàng
        const [rows] = await connection.execute(
            'SELECT status, order_code FROM orders WHERE order_id = ?',
            [orderId]
        );

        // Kiểm tra nếu đơn hàng không tồn tại
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
        }

        const orderStatus = rows[0].status;
        const orderCode = rows[0].order_code;

        // Kiểm tra trạng thái đơn hàng có thể hủy
        if (orderStatus !== 'ready_to_pick') {
            return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng ở trạng thái "ready_to_pick"' });
        }

        // Gửi yêu cầu hủy đơn hàng tới GHN
        const response = await axios.post(
            'https://online-gateway.ghn.vn/shiip/public-api/v2/switch-status/cancel',
            {
                order_codes: [orderCode]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'ShopId': process.env.REACT_APP_API_SHOPID_GHN,
                    'Token': process.env.REACT_APP_API_TOKEN_GHN
                }
            }
        );

        // Kiểm tra phản hồi từ GHN
        if (response.data.code !== 200) {
            return res.status(400).json({ message: 'Có lỗi xảy ra khi hủy đơn hàng tại GHN', details: response.data });
        }

        // Lấy các sản phẩm trong đơn hàng để cập nhật số lượng trong kho
        const [orderItems] = await connection.execute(
            'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
            [orderId]
        );

        // Cập nhật số lượng sản phẩm trong kho
        for (const item of orderItems) {
            await connection.execute(
                'UPDATE san_pham SET soluong = soluong + ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        // Cập nhật trạng thái đơn hàng thành 'Đã huỷ'
        await connection.execute(
            'UPDATE orders SET status = ? WHERE order_id = ?',
            ['cancel', orderId]
        );

        res.json({ message: 'Đơn hàng đã được hủy thành công' });
    } catch (error) {
        console.error('Lỗi khi hủy đơn hàng:', error);
        res.status(500).json({ error: 'Có lỗi xảy ra khi hủy đơn hàng' });
    }
});

// Lấy ra danh sách yêu thích
app.get('/api/favorites', async (req, res) => {
    const { user_email } = req.query;

    if (!user_email) {
        return res.status(400).json({ message: "User email is required" });
    }

    try {
        const [rows] = await connection.execute(
            'SELECT f.id AS favorite_id,f.product_id,f.created_at,p.tenSP AS product_name,p.hinh_anh AS product_image FROM favorites f JOIN san_pham p ON f.product_id = p.id WHERE f.user_email = ?',
            [user_email]
        );

        if (rows.length === 0) {
            return res.json([]); // Return empty array if no favorites found
        }

        res.json(rows);  // Send the favorite products back
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ message: 'Error fetching favorites' });
    }
});
app.get('/api/favorites/:userEmail', async (req, res) => {
    const { userEmail } = req.params;

    try {
        const [favorites] = await connection.query(
            'SELECT product_id FROM favorites WHERE user_email = ?',
            [userEmail]
        );

        // Chỉ lấy product_id
        const favoriteProductIds = favorites.map(favorite => favorite.product_id);
        res.status(200).json({ favorites: favoriteProductIds });
    } catch (error) {
        console.error('Lỗi server:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

    
// Thêm sản phẩm vào danh sách yêu thích
app.post('/api/favorites', async (req, res) => {
    const { user_email, product_id } = req.body; // Lấy thông tin user_email và product_id từ request body
    
    try {
        // Kiểm tra xem sản phẩm đã được yêu thích chưa
        const [existingFavorite] = await connection.query(
            'SELECT * FROM favorites WHERE user_email = ? AND product_id = ?',
            [user_email, product_id]
        );

        if (existingFavorite.length > 0) {
            return res.status(400).json({ message: 'Sản phẩm đã được yêu thích' });
        }

        // Thêm sản phẩm vào danh sách yêu thích
        await connection.query(
            'INSERT INTO favorites (user_email, product_id) VALUES (?, ?)',
            [user_email, product_id]
        );

        res.status(201).json({ message: 'Thêm sản phẩm vào danh sách yêu thích thành công' });
    } catch (error) {
        console.error('Lỗi server:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});
// Xóa sản phẩm khỏi danh sách yêu thích
app.delete('/api/favorites', async (req, res) => {
    const { userEmail, productId } = req.body;

    try {
        // Kiểm tra xem sản phẩm có tồn tại trong danh sách yêu thích không
        const [existingFavorite] = await connection.query(
            'SELECT * FROM favorites WHERE user_email = ? AND product_id = ?',
            [userEmail, productId]
        );

        if (existingFavorite.length === 0) {
            return res.status(404).json({ message: 'Sản phẩm chưa được yêu thích' });
        }

        // Xóa sản phẩm khỏi danh sách yêu thích
        await connection.query(
            'DELETE FROM favorites WHERE user_email = ? AND product_id = ?',
            [userEmail, productId]
        );

        res.status(200).json({ message: 'Đã xóa sản phẩm khỏi danh sách yêu thích' });
    } catch (error) {
        console.error('Lỗi server:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});
// Xóa sản phẩm yêu thích theo ID
app.delete('/api/favorites/:favoriteId', async (req, res) => {
    const { favoriteId } = req.params; // Lấy favoriteId từ params

    try {
        // Câu lệnh SQL để xóa sản phẩm yêu thích
        const query = 'DELETE FROM favorites WHERE id = ?';
        const [result] = await connection.execute(query, [favoriteId]);

        // Kiểm tra nếu có bản ghi nào bị xóa
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Favorite not found' });
        }

        // Gửi phản hồi thành công
        res.status(200).json({ message: 'Favorite removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Đánh giá
app.post('/api/san-pham/:productId/danh-gia', async (req, res) => {
    const { rate_name, rate_email, rating, noi_dung } = req.body; // Lấy thông tin từ body của yêu cầu
    const productId = req.params.productId; // Lấy ID sản phẩm từ URL

    // Kiểm tra thông tin cơ bản
    if (!rate_name || !rate_email || !rating || !noi_dung || !productId) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
    }

    // Kiểm tra rating có trong khoảng từ 1 đến 5 hay không
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Đánh giá phải trong khoảng từ 1 đến 5!' });
    }

    try {
        // Thêm đánh giá vào cơ sở dữ liệu
        await connection.execute(
            'INSERT INTO danh_gia (product_id, rate_name, rate_email, rating, noi_dung) VALUES (?, ?, ?, ?, ?)',
            [productId, rate_name, rate_email, rating, noi_dung]
        );

        res.status(200).json({ message: 'Đánh giá sản phẩm thành công' });
    } catch (error) {
        console.error('Lỗi server:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

app.get('/api/san-pham/:productId/danh-gia', async (req, res) => {
    const { productId } = req.params;
    const { page = 1, limit = 5, sortOrder = 'newest' } = req.query;

    // Determine sorting order based on the query parameter
    const orderBy = sortOrder === 'newest' ? 'DESC' : 'ASC';

    // Calculate the offset for pagination
    const offset = (page - 1) * limit;

    try {
        // Fetch the total number of reviews
        const [totalResult] = await connection.execute('SELECT COUNT(*) as totalCount FROM danh_gia WHERE product_id = ?', [productId]);
        const totalCount = totalResult[0].totalCount;

        // Fetch the reviews based on pagination and sorting
        const [rows] = await connection.execute(
            `SELECT * FROM danh_gia WHERE product_id = ? ORDER BY created_at ${orderBy} LIMIT ? OFFSET ?`,
            [productId, parseInt(limit), parseInt(offset)]
        );

        // Calculate total number of pages
        const totalPages = Math.ceil(totalCount / limit);

        res.json({ reviews: rows, totalPages, totalCount });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đánh giá:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đánh giá' });
    }
});

/*
// Thêm bình luận cho sản phẩm
app.post('/api/san-pham/:productId/binh-luan', async (req, res) => {
    const { name, email, comment } = req.body; // Lấy thông tin từ body của yêu cầu
    const productId = req.params.productId; // Lấy ID sản phẩm từ URL

    // Kiểm tra thông tin cơ bản
    if (!name || !email || !comment || !productId) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
    }

    try {
        // Thêm bình luận vào cơ sở dữ liệu
        await connection.execute(
            'INSERT INTO binh_luan (product_id, name, email, comment) VALUES (?, ?, ?, ?)',
            [productId, name, email, comment]
        );

        res.status(200).json({ message: 'Bình luận sản phẩm thành công' });
    } catch (error) {
        console.error('Lỗi server:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Lấy danh sách bình luận cho sản phẩm
app.get('/api/san-pham/:productId/binh-luan', async (req, res) => {
    const { productId } = req.params;

    try {
        // Truy vấn để lấy tất cả bình luận của sản phẩm
        const [rows] = await connection.execute('SELECT * FROM binh_luan WHERE product_id = ?', [productId]);
        res.json(rows);
    } catch (error) {
        console.error('Lỗi server:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách bình luận' });
    }
});
*/

// API route để tạo đơn hàng
app.post('/api/create-order', async (req, res) => {
    const { 
        payment_type_id, note, required_note, from_name, from_phone, from_address, 
        to_name, to_phone, to_address, to_ward_code, to_district_id, total_price,
        weight, length, width, height, service_id, items, user_email
    } = req.body;

    const conn = await connection.getConnection();
    await conn.beginTransaction();

    try {
        const ghnResponse = await axios.post('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create', {
            payment_type_id,
            note,
            required_note,
            from_name,
            from_phone,
            from_address,
            to_name,
            to_phone,
            to_address,
            to_ward_code,
            to_district_id,            
            weight,
            length,
            width,
            height,
            service_id,
            items
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Token': process.env.REACT_APP_API_TOKEN_GHN,
                'ShopId': process.env.REACT_APP_API_SHOPID_GHN
            }
        });

        if (ghnResponse.data.code === 200) {
            const orderCode = ghnResponse.data.data.order_code;

            const [orderResult] = await conn.query(`
                INSERT INTO orders 
                (order_code, recipient_name, recipient_phone, recipient_address, recipient_ward, recipient_district, total_amount, user_email)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                orderCode,
                to_name,
                to_phone,
                to_address,
                to_ward_code,
                to_district_id,
                total_price,
                user_email
            ]);

            const orderId = orderResult.insertId;

            for (const item of items) {
                const [product] = await conn.query(`
                    SELECT soluong FROM san_pham 
                    WHERE id = ? FOR UPDATE
                `, [item.productId]);

                if (product[0].soluong < item.quantity) {
                    throw new Error(`Insufficient quantity for product ID: ${item.productId}`);
                }

                await conn.query(`
                    INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
                    VALUES (?, ?, ?, ?, ?)
                `, [
                    orderId,
                    item.productId,
                    item.name,
                    item.quantity,
                    item.price
                ]);

                await conn.query(`
                    UPDATE san_pham 
                    SET soluong = soluong - ? 
                    WHERE id = ?
                `, [
                    item.quantity,
                    item.productId
                ]);
            }

            await conn.commit();
            res.status(200).json({ message: 'Success', orderCode });
        } else {
            await conn.rollback();
            res.status(400).json({ message: 'Failed to create order with GHN', error: ghnResponse.data.message });
        }
    } catch (error) {
        await conn.rollback();
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error while creating order', error: error.message });
    } finally {
        conn.release();
    }
});


// Route để lấy thông tin đơn hàng theo orderCode
app.get('/api/orders/:orderCode', (req, res) => {
    const { orderCode } = req.params;

    const query = 'SELECT * FROM orders WHERE order_code = ?';
    
    connection.query(query, [orderCode], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu', error });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        const order = results[0];

        // Lấy thông tin sản phẩm từ bảng order_items
        const itemsQuery = 'SELECT * FROM order_items WHERE order_id = ?';
        connection.query(itemsQuery, [order.order_id], (err, items) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu', error: err });
            }

            // Kết hợp thông tin đơn hàng và sản phẩm
            return res.status(200).json({ ...order, items });
        });
    });
});

// Hàm cập nhật trạng thái đơn hàng
async function updateAllOrderStatuses() {
    const conn = await connection.getConnection(); 
    try {
        // Bước 1: Lấy tất cả mã đơn hàng từ bảng orders
        const [results] = await conn.query('SELECT order_code FROM orders');
        
        // Bước 2: Lặp qua từng mã đơn hàng và lấy trạng thái từ API GHN
        for (const order of results) {
            const orderCode = order.order_code;
            try {
                const response = await axios.post(
                    'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail',
                    { order_code: orderCode },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Token': process.env.REACT_APP_API_TOKEN_GHN, // Token thực tế
                        },
                    }
                );

                // Bước 3: Lấy trạng thái mới từ phản hồi của API
                const newStatus = response.data.data.status; // Điều chỉnh theo cấu trúc phản hồi thực tế

                // Bước 4: Cập nhật trạng thái đơn hàng trong cơ sở dữ liệu MySQL
                const updateQuery = 'UPDATE orders SET status = ? WHERE order_code = ?';
                await conn.execute(updateQuery, [newStatus, orderCode]);

                //console.log(`Trạng thái đơn hàng ${orderCode} đã được cập nhật thành ${newStatus}`);
            } catch (error) {
                console.error(`Lỗi khi lấy chi tiết đơn hàng ${orderCode}:`, error.response?.data || error.message);
            }
        }
    } catch (error) {
        console.error('Lỗi khi lấy đơn hàng:', error);
    } finally {
        conn.release(); 
    }
}

/*// Lên lịch cập nhật mỗi giây
setInterval(() => {
    console.log('Đang cập nhật trạng thái đơn hàng...');
    updateAllOrderStatuses().catch(console.error);
}, 1000); // 1000 mili giây = 1 giây*/
// Thiết lập cron job để chạy mỗi giây
cron.schedule('*/5 * * * * *', async () => {
    console.log('Đang cập nhật trạng thái đơn hàng...');
    try {
        await updateAllOrderStatuses();
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    }
});

// Tạo API để lấy số lượng tồn kho của sản phẩm
app.get('/api/products/stock/:productId', async (req, res) => {
    const productId = req.params.productId;  // Lấy ID sản phẩm từ request params
  
    // Query kiểm tra số lượng tồn kho của sản phẩm
    const query = 'SELECT soluong FROM san_pham WHERE id = ?';
  
    try {
      const [results] = await connection.execute(query, [productId]);
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
      }
  
      const stockQuantity = results[0].soluong;
  
      if (stockQuantity <= 0) {
        return res.status(200).json({ inStock: false, message: 'Sản phẩm đã hết hàng.' });
      }
  
      return res.status(200).json({ inStock: true, stockQuantity });
  
    } catch (err) {
      console.error('Lỗi truy vấn MySQL:', err);
      return res.status(500).json({ error: 'Lỗi server' });
    }
  });
  

//Xử Lý giỏ hàng
// Route: Lấy giỏ hàng của người dùng
app.get("/api/cart", async (req, res) => {
    const { email } = req.query; // Lấy email từ query string
    try {
        const [cart] = await connection.execute('SELECT * FROM gio_hang WHERE email = ?', [email]);
        res.json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route: Thêm sản phẩm vào giỏ hàng
app.post("/api/cart", async (req, res) => {
    const { email, product_id, quantity } = req.body;
    try {
        const [result] = await connection.execute(
            'INSERT INTO gio_hang (email, product_id, quantity) VALUES (?, ?, ?)',
            [email, product_id, quantity]
        );
        res.status(201).json({ id: result.insertId, email, product_id, quantity });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route: Cập nhật số lượng sản phẩm trong giỏ hàng
app.put("/api/cart/:email/:product_id", async (req, res) => {
    const { email, product_id } = req.params;
    const { quantity } = req.body;
    try {
        await connection.execute(
            'UPDATE gio_hang SET quantity = ? WHERE email = ? AND product_id = ?',
            [quantity, email, product_id]
        );
        res.status(200).json({ email, product_id, quantity });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route: Xóa sản phẩm khỏi giỏ hàng
app.delete("/api/cart/:email/:product_id", async (req, res) => {
    const { email, product_id } = req.params;
    try {
        await connection.execute(
            'DELETE FROM gio_hang WHERE email = ? AND product_id = ?',
            [email, product_id]
        );
        res.status(204).send(); // Gửi lại status 204 No Content
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route: Xóa toàn bộ giỏ hàng
app.delete("/api/cart/:email", async (req, res) => {
    const { email } = req.params;
    try {
        await connection.execute('DELETE FROM gio_hang WHERE email = ?', [email]);
        res.status(204).send(); // Gửi lại status 204 No Content
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



//Thanh Toán ZaloPay
// APP INFO, STK TEST: 4111 1111 1111 1111
const config = {
    app_id: '2553',
    key1: 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
    key2: 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
    endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
  };
  app.post('/payment', async (req, res) => {
    const { totalAll } = req.body; 
    const embed_data = {
    };
  
    const items = [];
    const transID = Math.floor(Math.random() * 1000000);
  
    const appTransId = `${moment().format('YYMMDD')}_${transID}`; // Tạo app_trans_id
    const order = {
      app_id: config.app_id,
      app_trans_id: appTransId,
      app_user: 'user123',
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: totalAll,
      callback_url: `${process.env.REACT_APP_API_BASE_URL}/successpage`,
      description: `Lazada - Payment for the order #${transID}`,
      bank_code: '',
    };
  
    const data = config.app_id + '|' + order.app_trans_id + '|' + order.app_user + '|' + order.amount + '|' + order.app_time + '|' + order.embed_data + '|' + order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
  
    try {
      const result = await axios.post(config.endpoint, null, { params: order });
      
      // Trả về app_trans_id cùng với phản hồi từ Zalopay
      return res.status(200).json({ ...result.data, app_trans_id: appTransId });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to create payment order' });
    }
});

  
  /**
   * method: POST
   * description: callback để Zalopay Server call đến khi thanh toán thành công.
   * Khi và chỉ khi ZaloPay đã thu tiền khách hàng thành công thì mới gọi API này để thông báo kết quả.
   */
  app.post('/callback', (req, res) => {
    let result = {};
    console.log(req.body);
    try {
      let dataStr = req.body.data;
      let reqMac = req.body.mac;
  
      let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
      console.log('mac =', mac);
  
      // kiểm tra callback hợp lệ (đến từ ZaloPay server)
      if (reqMac !== mac) {
        // callback không hợp lệ
        result.return_code = -1;
        result.return_message = 'mac not equal';
      } else {
        // thanh toán thành công
        // merchant cập nhật trạng thái cho đơn hàng ở đây
        let dataJson = JSON.parse(dataStr, config.key2);
        console.log(
          "update order's status = success where app_trans_id =",
          dataJson['app_trans_id'],
        );
  
        result.return_code = 1;
        result.return_message = 'success';
      }
    } catch (ex) {
      console.log('lỗi:::' + ex.message);
      result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
      result.return_message = ex.message;
    }
  
    // thông báo kết quả cho ZaloPay server
    res.json(result);
  });
  
  /**
   * method: POST
   * Sandbox	POST	https://sb-openapi.zalopay.vn/v2/query
   * Real	POST	https://openapi.zalopay.vn/v2/query
   * description:
   * Khi user thanh toán thành công,
   * ZaloPay sẽ gọi callback (notify) tới merchant để merchant cập nhật trạng thái
   * đơn hàng Thành Công trên hệ thống. Trong thực tế callback có thể bị miss do lỗi Network timeout,
   * Merchant Service Unavailable/Internal Error...
   * nên Merchant cần hiện thực việc chủ động gọi API truy vấn trạng thái đơn hàng.
   */
  
  app.post('/check-status-order', async (req, res) => {
    const { app_trans_id } = req.body;
  
    let postData = {
      app_id: config.app_id,
      app_trans_id, // Input your app_trans_id
    };
  
    let data = postData.app_id + '|' + postData.app_trans_id + '|' + config.key1; // appid|app_trans_id|key1
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
  
    let postConfig = {
      method: 'post',
      url: 'https://sb-openapi.zalopay.vn/v2/query',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify(postData),
    };
  
    try {
      const result = await axios(postConfig);
      console.log(result.data);
      return res.status(200).json(result.data);
      /**
       * kết quả mẫu
        {
          "return_code": 1, // 1 : Thành công, 2 : Thất bại, 3 : Đơn hàng chưa thanh toán hoặc giao dịch đang xử lý
          "return_message": "",
          "sub_return_code": 1,
          "sub_return_message": "",
          "is_processing": false,
          "amount": 50000,
          "zp_trans_id": 240331000000175,
          "server_time": 1711857138483,
          "discount_amount": 0
        }
      */
    } catch (error) {
      console.log('lỗi');
      console.log(error);
    }
  });

  app.get('/api/canh-bao-ton-kho', async (req, res) => {
    const { range } = req.query; // Lấy giá trị range từ query params
    const maxQuantity = parseInt(range, 10) || 10; // Giá trị mặc định là 10 nếu không có range
  
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM san_pham WHERE soluong <= ?',
        [maxQuantity]
      );
      res.json(rows);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu tồn kho:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });
  
  

// POST /api/tinh-doanh-thu
// API POST /api/tinh-doanh-thu
// API tính doanh thu và lưu vào bảng doanh_thu
app.post("/api/tinh-doanh-thu", async (req, res) => {
    try {
        // Truy vấn tính tổng doanh thu, số đơn hàng, số sản phẩm, và lợi nhuận
        const query = `
            SELECT 
                SUM(o.total_amount) AS tong_doanh_thu,
                COUNT(o.order_id) AS tong_so_don_hang,
                SUM(oi.quantity) AS tong_so_san_pham,
                SUM(oi.quantity * oi.price) AS tong_loi_nhuan
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            WHERE DATE(o.created_at) = CURDATE()
            AND o.status = 'delivered'
        `;
        const [results] = await connection.execute(query);
        const { tong_doanh_thu, tong_so_don_hang, tong_so_san_pham, tong_loi_nhuan } = results[0];

        // Nếu không có dữ liệu doanh thu, trả về thông báo
        if (!tong_doanh_thu) {
            return res.status(404).send("Không có dữ liệu doanh thu cho ngày hôm nay.");
        }

        // Kiểm tra nếu đã có doanh thu cho ngày hôm nay
        const checkQuery = 'SELECT COUNT(*) AS count FROM doanh_thu WHERE ngay = CURDATE()';
        const [checkResult] = await connection.execute(checkQuery);
        
        if (checkResult[0].count > 0) {
            return res.status(400).send("Đã tính doanh thu cho ngày hôm nay.");
        }

        // Lưu kết quả vào bảng doanh_thu
        const insertQuery = `
            INSERT INTO doanh_thu (ngay, tong_doanh_thu, tong_so_don_hang, tong_so_san_pham, tong_loi_nhuan)
            VALUES (CURDATE(), ?, ?, ?, ?)
        `;
        await connection.execute(insertQuery, [tong_doanh_thu, tong_so_don_hang, tong_so_san_pham, tong_loi_nhuan]);

        // Trả về kết quả thành công
        res.status(200).send("Đã tính và cập nhật doanh thu thành công.");
    } catch (error) {
        console.error("Lỗi khi tính doanh thu:", error);
        res.status(500).send("Lỗi khi tính doanh thu.");
    }
});

cron.schedule('59 23 * * *', async () => {
    try {
      await axios.post('http://localhost:4000/api/tinh-doanh-thu');
      console.log('Đã cập nhật doanh thu');
    } catch (error) {
      console.error('Lỗi khi cập nhật doanh thu:', error);
    }
  });
  
// API: Lấy dữ liệu doanh thu theo khoảng thời gian
app.get('/api/doanh-thu', async (req, res) => {
    const { period } = req.query;  // `period` có thể là "day", "week", "month", hoặc "year"

    let query;
    switch (period) {
        case 'day':
            query = `
                SELECT ngay, SUM(tong_doanh_thu) AS tong_doanh_thu, 
                       SUM(tong_so_don_hang) AS tong_so_don_hang, 
                       SUM(tong_so_san_pham) AS tong_so_san_pham,
                       SUM(tong_loi_nhuan) AS tong_loi_nhuan
                FROM doanh_thu
                GROUP BY ngay
                ORDER BY ngay ASC;
            `;
            break;
        case 'month':
            query = `
                SELECT DATE_FORMAT(ngay, '%Y-%m') AS month, SUM(tong_doanh_thu) AS tong_doanh_thu, 
                       SUM(tong_so_don_hang) AS tong_so_don_hang, 
                       SUM(tong_so_san_pham) AS tong_so_san_pham,
                       SUM(tong_loi_nhuan) AS tong_loi_nhuan
                FROM doanh_thu
                GROUP BY month
                ORDER BY month ASC;
            `;
            break;
        case 'year':
            query = `
                SELECT YEAR(ngay) AS year, SUM(tong_doanh_thu) AS tong_doanh_thu, 
                       SUM(tong_so_don_hang) AS tong_so_don_hang, 
                       SUM(tong_so_san_pham) AS tong_so_san_pham,
                       SUM(tong_loi_nhuan) AS tong_loi_nhuan
                FROM doanh_thu
                GROUP BY year
                ORDER BY year ASC;
            `;
            break;
        default:
            return res.status(400).json({ error: "Khoảng thời gian không hợp lệ" });
    }

    try {
        const [rows] = await connection.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
        res.status(500).send("Lỗi server");
    }
});

// API: Lấy sản phẩm bán chạy nhất
app.get('/api/san-pham-ban-chay', async (req, res) => {
    const limit = parseInt(req.query.limit) || 5; // Số lượng sản phẩm bán chạy muốn lấy, mặc định là 5

    try {
        const query = `
            SELECT san_pham.id, san_pham.tenSP, SUM(order_items.quantity) AS total_sold
            FROM order_items
            JOIN san_pham ON order_items.product_id = san_pham.id
            GROUP BY san_pham.id, san_pham.tenSP
            ORDER BY total_sold DESC
            LIMIT ?;
        `;
        
        const [topProducts] = await connection.query(query, [limit]);

        res.status(200).json(topProducts);
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm bán chạy:', error);
        res.status(500).send('Lỗi server');
    }
});


// Create promotion
app.post('/api/promotions', async (req, res) => {
    const { code } = req.body;
    try {
      const [rows] = await connection.execute(
        `SELECT discount 
       FROM promotions 
       WHERE (code = ? AND CURDATE() BETWEEN start_date AND end_date) 
       AND status = "active"`,[code]
      );
      if (rows.length > 0) {
        res.json({ success: true, discount: rows[0].discount });
      } else {
        res.json({ success: false, message: 'Invalid or expired promo code' });
      }
    } catch (error) {
      console.error('Error fetching promo code:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  
// Hàm để áp dụng giảm giá cho tất cả sản phẩm
// Hàm để áp dụng giảm giá cho tất cả sản phẩm nếu có sự thay đổi trong bảng promotions
const applyPromotionForAllProducts = async (promoCode) => {
    try {
      // Kiểm tra mã khuyến mãi và lấy thông tin mã giảm giá
      const checkPromotionQuery = `
        SELECT discount, start_date, end_date, status 
        FROM promotions 
        WHERE code = ? 
          AND status = 'active'
      `;
      
      // Thực hiện truy vấn kiểm tra mã khuyến mãi
      const [promoResults] = await connection.execute(checkPromotionQuery, [promoCode]);
  
      if (promoResults.length === 0) {
        console.log("Mã khuyến mãi không hợp lệ hoặc không còn hoạt động.");
        return;
      }
  
      const promo = promoResults[0];
      const discount = promo.discount;
      const startDate = promo.start_date;
      const endDate = promo.end_date;
  
      // Kiểm tra sự thay đổi so với khuyến mãi hiện tại (so với giá gốc)
      const checkCurrentPromoQuery = `
        SELECT discount, start_date, end_date 
        FROM promotions 
        WHERE code = ?
      `;
      const [currentPromoResults] = await connection.execute(checkCurrentPromoQuery, [promoCode]);
  
      if (currentPromoResults.length === 0) {
        console.log("Không có thông tin khuyến mãi.");
        return;
      }
  
      const currentPromo = currentPromoResults[0];
  
      // Kiểm tra nếu tỷ lệ giảm giá hoặc ngày bắt đầu/ngày kết thúc có thay đổi
      if (
        currentPromo.discount !== discount ||
        currentPromo.start_date !== startDate ||
        currentPromo.end_date !== endDate
      ) {  
        // Cập nhật lại giá cho tất cả sản phẩm trong bảng san_pham
        const updatePriceQuery = `
          UPDATE san_pham
          SET gia = gia_goc * (1 - ? / 100), is_discounted = TRUE
          WHERE gia_goc IS NOT NULL
        `;
        await connection.execute(updatePriceQuery, [discount]);
  
        //console.log("Giá sản phẩm đã được cập nhật theo khuyến mãi mới.");
      } else {
        console.log("Không có sự thay đổi nào trong khuyến mãi.");
      }
    } catch (err) {
      console.error("Lỗi trong quá trình áp dụng khuyến mãi: ", err);
    }
  };
  

  // Hàm để lấy mã khuyến mãi theo ngày lễ
  const getPromoCodeForHoliday = () => {
    const today = new Date();
    const month = today.getMonth() + 1;  // Tháng bắt đầu từ 0 nên cộng thêm 1
    const day = today.getDate();
    const year = today.getFullYear();
  
    // Tính toán ngày thứ 6 cuối cùng của tháng 11 (Black Friday)
    const blackFriday = new Date(year, 10, 1); // Tháng 11 (0-based, nên tháng 10 là 11)
    blackFriday.setDate(1);  // Đặt ngày đầu tiên của tháng 11
    const dayOfWeek = blackFriday.getDay();  // Lấy ngày trong tuần (0: Chủ nhật, 1: Thứ 2, ..., 6: Thứ 7)
    const offset = (dayOfWeek <= 5 ? 5 - dayOfWeek : 12 - dayOfWeek);  // Tính toán để có được ngày thứ 6 cuối cùng
    blackFriday.setDate(1 + offset);  // Cập nhật lại ngày Black Friday
  
    // Xác định mã khuyến mãi dựa trên ngày hiện tại
    if ((month === 1 || month === 2)) {  // Tết Nguyên Đán (tháng 1, tháng 2)
      return "NEWYEAR";
    } else if (month >= 5 && month <= 8) {  // Mùa hè (tháng 5 đến tháng 8)
      return "SUMMER";
    } else if (month === 9 && day === 2) {  // Lễ Quốc khánh (ngày 2 tháng 9)
      return "NATIONALDAY";
    } else if (month === 4 && day === 30) {  // Lễ Giải phóng (ngày 30 tháng 4)
      return "LIBERATION";
    } else if (month === 11 || (month === 12 && day <= 25)) {  // Giáng Sinh (tháng 11 đến tháng 12, đặc biệt là tháng 12)
      return "CHRISTMAS";
    } else if (month === 9 || month === 10) {  // Thu (tháng 9 và tháng 10)
      return "AUTUMN";
    } else if (month === 11 && day === blackFriday.getDate()) {  // Black Friday (Thứ 6 cuối cùng của tháng 11)
      return "BLACKFRIDAY";
    } else {
      return "TATCASANPHAM";  // Mặc định là mã giảm giá toàn bộ sản phẩm
    }
  };
  
  // Cấu hình cron job để tự động kiểm tra khuyến mãi và cập nhật giá mỗi ngày lúc 00:00
  cron.schedule('*/5 * * * * *', async () => {
    // Lấy mã khuyến mãi dựa trên ngày lễ
  const promoCode = getPromoCodeForHoliday();
    // Lấy mã khuyến mãi từ bảng promotions
    // Truy vấn lấy thông tin mã khuyến mãi từ bảng promotions
    console.log("Đang áp dụng mã khuyến mãi:",promoCode);
  const getPromoCodeQuery =`
    SELECT code FROM promotions       
    WHERE code = ? AND status = 'active'`;
  const [promoCodeResults] = await connection.execute(getPromoCodeQuery, [promoCode]);
    if (promoCodeResults.length > 0) {
      const promoCode = promoCodeResults[0].code;
      await applyPromotionForAllProducts(promoCode);
    } else {
        // Nếu mã khuyến mãi không còn hoạt động, reset lại giá
      const resetPriceQuery = 
      `UPDATE san_pham
      SET gia = gia_goc, is_discounted = FALSE
      WHERE is_discounted = TRUE`
      ;
      await connection.execute(resetPriceQuery);
      console.log("Không có mã khuyến mãi hợp lệ.");
    }
  });
  

// Fetch all promotions
app.get('/api/admin/promotions',async (req, res)=> {
    try {
        const [rows] = await connection.execute('SELECT * FROM promotions ORDER By id DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
  
 // Add a new promotion
 app.post('/api/admin/promotions', async (req, res) => {
    const { code, description, discount, start_date, end_date, status } = req.body;

    try {
        // Kiểm tra mã khuyến mãi đã tồn tại chưa
        const [existingPromotion] = await connection.execute(
            `SELECT * FROM promotions WHERE code = ?`, [code]
        );

        // Kiểm tra xem có kết quả hay không
        if (existingPromotion.length > 0) {
            // Nếu có kết quả trả về, nghĩa là mã khuyến mãi đã tồn tại
            return res.status(400).json({ message: 'Mã khuyến mãi đã tồn tại' });
        }

        // Nếu chưa tồn tại, thực hiện thêm khuyến mãi mới
        const [result] = await connection.execute(
            `INSERT INTO promotions (code, description, discount, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?)`,
            [code, description, discount, start_date, end_date, status]
        );

        // Trả về phản hồi thành công
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        // Trả về lỗi nếu có vấn đề trong quá trình xử lý
        console.error(error); // Log lỗi để dễ debug
        res.status(500).json({ error: error.message });
    }
});

  
 
  // Update an existing promotion
  app.put('/api/admin/promotions/:id'  , async (req, res) => {
    const { id } = req.params;
    const { code, description, discount, start_date, end_date, status } = req.body;


    try {
        await connection.execute(
            `UPDATE promotions SET code = ?, description = ?, discount = ?, start_date = ?, end_date = ?, status = ? WHERE id = ?`,
            [code, description, discount, start_date, end_date, status, id]
        );
        res.json({ id, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

  // Delete a promotion
  app.delete('/api/admin/promotions/:id', async (req, res)=> {
    const { id } = req.params;

    try {
        await connection.execute('DELETE FROM promotions WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });

// Khởi động server và lắng nghe kết nối trên cổng 4000
app.listen(port, '0.0.0.0', (err) => {
    if (err) {
        console.error("Error starting server:", err);
    } else {
        console.log(`Server is running and listening on port ${port}`);
    }
});