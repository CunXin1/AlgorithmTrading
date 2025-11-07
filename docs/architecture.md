System Architecture

AlgorithmTrading follows a modular, service-oriented design.
It consists of three major layers: frontend, backend, and C++ computation core.

Components Description
Frontend (React.js)
Displays charts and indicators.
Handles user interactions (search, algorithm selection).
Communicates with backend through REST API.

Backend (Node.js)
Manages routing and API endpoints.
Fetches data from Yahoo Finance API.
Sends data to and from the C++ computation module.
Handles authentication and subscription logic (future).

Algorithm Core (C++)
Implements computationally heavy algorithms (VWAP, MACD, EMA, RSI).
Uses Node Addon (N-API) to integrate directly with Node.js.
Future versions may run in WebAssembly for browser-based computing.

Database
Stores user information, preferences, and strategy history.
May use PostgreSQL or SQLite.


系统架构说明
AlgorithmTrading 采用模块化的服务架构设计，分为三大层：前端（React）、后端（Node.js）、核心计算层（C++）。

模块说明
前端（React.js）
显示股票曲线与技术指标；
处理用户输入（搜索、选择算法）；
通过 REST API 与后端通信。

后端（Node.js）
管理接口与数据流；
调用 Yahoo Finance API；
与 C++ 模块通信处理计算任务；
未来负责登录与订阅系统。

核心计算层（C++）
负责执行高性能算法（VWAP、MACD、EMA、RSI等）；
通过 Node Addon (N-API) 与 Node.js 集成；
未来可编译为 WebAssembly 支持前端计算。

数据库
存储用户、策略、历史记录；
计划使用 PostgreSQL 或 SQLite。