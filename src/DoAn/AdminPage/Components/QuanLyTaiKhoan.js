import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, message } from "antd";
import { DeleteOutlined, EditOutlined} from '@ant-design/icons';
import axios from "axios";

const { Option } = Select;

const QuanLyTaiKhoan = () => {
  const [accounts, setAccounts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get("http://furniture-e-commerce-wt2i.onrender.com/api/accounts");
      setAccounts(response.data);
    } catch (error) {
      message.error("Failed to fetch accounts");
    }
  };

  const handleAddAccount = () => {
    setEditingAccount(null); // Reset editing account
    setIsModalVisible(true);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setIsModalVisible(true);
  };

  const handleDeleteAccount = async (id) => {
    try {
      await axios.delete(`http://furniture-e-commerce-wt2i.onrender.com/api/accounts/${id}`);
      message.success("Account deleted successfully");
      fetchAccounts(); // Refresh account list after deletion
    } catch (error) {
      message.error("Failed to delete account");
    }
  };

  const handleSaveAccount = async (values) => {
    try {
      if (editingAccount) {
        // Edit existing account
        await axios.put(`http://furniture-e-commerce-wt2i.onrender.com/api/accounts/${editingAccount.id}`, values);
        message.success("Account updated successfully");
      } else {
        // Add new account
        await axios.post("http://furniture-e-commerce-wt2i.onrender.com/api/accounts", values);
        message.success("Account added successfully");
      }
      setIsModalVisible(false); // Close the modal
      fetchAccounts(); // Refresh the accounts list
    } catch (error) {
      message.error("Failed to save account");
    }
  };

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Name",
      dataIndex: "ho_ten",
    },
    {
      title: "Phone",
      dataIndex: "sdt",
    },
    {
      title: "Status",
      dataIndex: "trang_thai",
      render: (status) => <span>{status}</span>,
    },
    {
      title: "Role",
      dataIndex: "role",
    },
    {
      title: "Password",  // Thêm cột mật khẩu
      dataIndex: "mat_khau",
      render: (password) => <span>******</span>,  // Mật khẩu sẽ được ẩn
    },
    {
      title: "Actions",
      render: (text, record) => (
        <div>
          <Button onClick={() => handleEditAccount(record)}  style={{ marginRight: 10 }} icon={<EditOutlined />}/>
          <Button onClick={() => handleDeleteAccount(record.id)} danger icon={<DeleteOutlined />} />
        </div>
      ),
    },
  ];
  

  return (
    <div>
      <Button type="primary" onClick={handleAddAccount} style={{ marginBottom: 16 }}>
        Thêm tài khoản
      </Button>
      <Table columns={columns} dataSource={accounts} rowKey="id" />

      <Modal
        title={editingAccount ? "Sửa thông tin tài khoản" : "Thêm tài khoản"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          initialValues={editingAccount || { role: "customer", trang_thai: "active" }}
          onFinish={handleSaveAccount}
          layout="vertical"
        >
          {/* Email Field */}
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email", message: "Please input a valid email!" }]}
          >
            <Input />
          </Form.Item>

          {/* Password Field */}
          <Form.Item
            label="Password"
            name="mat_khau"
            rules={[{ required: true, message: "Please input the password!" }]}
          >
            <Input.Password />
          </Form.Item>

          {/* Full Name Field */}
          <Form.Item
            label="Full Name"
            name="ho_ten"
            rules={[{ required: true, message: "Please input the full name!" }]}
          >
            <Input />
          </Form.Item>

          {/* Phone Field */}
          <Form.Item
            label="Phone"
            name="sdt"
          >
            <Input />
          </Form.Item>

          {/* Status Field */}
          <Form.Item
            label="Status"
            name="trang_thai"
          >
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>

          {/* Role Field */}
          <Form.Item
            label="Role"
            name="role"
          >
            <Select>
              <Option value="admin">Admin</Option>
              <Option value="customer">Customer</Option>
            </Select>
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              {editingAccount ? "Update" : "Add"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default QuanLyTaiKhoan;
