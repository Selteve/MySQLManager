# MySQL 可视化管理工具 / MySQL Visual Management Tool

[English Version](#english-version)

## 中文版

### 关于本项目

这是一个基于 Wails 和 React 开发的 MySQL 可视化管理工具。它提供了一个现代、简洁且美观的用户界面，让用户可以轻松地管理 MySQL 数据库。

### 主要功能

1. **数据库连接**：支持连接到本地或远程 MySQL 数据库。
2. **数据库和表格浏览**：可以浏览和选择数据库及其中的表格。
3. **数据操作**：支持查看、编辑、添加和删除表格中的数据。
4. **自定义 SQL 查询**：允许用户执行自定义的 SQL 查询并查看结果。
5. **美观的用户界面**：采用毛玻璃效果设计，支持自定义背景图片。
6. **响应式设计**：适配不同尺寸的屏幕，包括移动设备。

### 技术特点

- 使用 Wails 框架，结合 Go 后端和 React 前端。
- 采用现代化的 UI 设计，包括毛玻璃效果和动态样式。
- 实现了可折叠的侧边栏，优化了空间利用。
- 提供了直观的数据库操作界面。

### 如何使用

1. 克隆本仓库到本地。
2. 确保已安装 Wails 和 Go。
3. 在项目目录下运行 `wails dev` 进行开发。
4. 使用 `wails build` 构建生产版本。

### 开发

- 前端代码位于 `frontend/src` 目录。
- 后端 Go 代码位于项目根目录。
- 主要组件文件为 `MySQLManager.jsx`。
- 样式文件为 `index.css`。

### 贡献

欢迎提交 Pull Requests 或创建 Issues 来帮助改进这个项目。

---

## English Version

### About This Project

This is a MySQL visual management tool developed using Wails and React. It provides a modern, clean, and beautiful user interface for easy management of MySQL databases.

### Key Features

1. **Database Connection**: Support for connecting to local or remote MySQL databases.
2. **Database and Table Browsing**: Ability to browse and select databases and their tables.
3. **Data Manipulation**: Support for viewing, editing, adding, and deleting data in tables.
4. **Custom SQL Queries**: Allows users to execute custom SQL queries and view results.
5. **Beautiful User Interface**: Featuring a glassmorphism design with support for custom background images.
6. **Responsive Design**: Adapts to different screen sizes, including mobile devices.

### Technical Highlights

- Built with Wails framework, combining Go backend with React frontend.
- Modern UI design including glassmorphism effects and dynamic styling.
- Implements a collapsible sidebar for optimized space utilization.
- Provides an intuitive interface for database operations.

### How to Use

1. Clone this repository to your local machine.
2. Ensure you have Wails and Go installed.
3. Run `wails dev` in the project directory for development.
4. Use `wails build` to build the production version.

### Development

- Frontend code is located in the `frontend/src` directory.
- Backend Go code is in the project root directory.
- The main component file is `MySQLManager.jsx`.
- Styles are defined in `index.css`.

### Contributing

Pull requests and issue creations are welcome to help improve this project.

