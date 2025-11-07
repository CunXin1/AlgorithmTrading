AlgorithmTrading
Intelligent Algorithmic Trading Platform for U.S. Stocks and More

1. Overview

AlgorithmTrading is a next-generation algorithmic trading platform designed to analyze, visualize, and forecast U.S. stock market trends.
It allows users to input any stock ticker symbol (e.g., AAPL, NVDA, TSLA) and view real-time and historical data through interactive charts.
The system applies various trading algorithms such as VWAP, MACD, RSI, and moving averages to predict market movement and display signals visually.

In the future, AlgorithmTrading aims to provide:
Large-scale historical backtesting
Automatic trading via U.S. brokerage APIs
AI-generated market summaries
Subscription-based premium features

2. Technology Stack
Layer	Technology	Purpose
Frontend	React.js + TradingView API + Google Dev API	Interactive UI and visual charts
Backend	Node.js (Express)	Data routing, API logic, integration with C++ core
Algorithm Engine	C++	High-performance numerical computation (VWAP, MACD, EMA, etc.)
Data Source	Yahoo Finance API	Free real-time and historical stock data
Database	SQLite / PostgreSQL (planned)	User profiles, historical logs, strategies
AI Layer (Future)	OpenAI / Gemini / Llama	Summarize financial news and assist decision making

3. Installation and Setup

Prerequisites

Node.js >= 18
npm >= 9
g++ >= 10

Frontend
cd frontend
npm install
npm run dev

Backend
cd ../backend
npm install
npm run dev

C++ Core
cd cpp
node-gyp configure build

4. Completed Features

Initial React frontend
Navigation bar (Home, News, Investing, Algorithm, Log In)
TradingView chart placeholder
Stock search bar
Technical indicator options
Basic Node.js backend structure
Core documentation and file structure

5. Todo List

Integrate TradingView lightweight charts
Connect Yahoo Finance API
Implement MACD, VWAP, EMA, RSI algorithms in C++
Add historical backtesting module
Add auto-trading support for U.S. broker APIs
Build AI-based market summary system
Add subscription and user management system

6. Author
Author: Ruibo Sun



智能美股算法交易平台

1. 项目简介

AlgorithmTrading 是一个面向未来的美股算法交易平台，集数据分析、图像可视化与趋势预测于一体。
用户可以输入任意股票代码（如 AAPL、NVDA、TSLA），查看实时及历史曲线。
系统会使用多种交易算法（如 VWAP、MACD、RSI、均线等）对市场进行预测并在图像上显示信号。

未来将支持：

基于历史数据的大规模回测
与美股券商 API 联动，实现自动交易
AI 自动生成市场新闻总结
高级功能订阅制

2. 技术架构

层级	技术	作用
前端	React.js + TradingView API + Google Dev API	可交互用户界面与图表
后端	Node.js (Express)	数据接口、逻辑控制、连接C++核心
算法核心	C++	高性能数值计算（VWAP、MACD、EMA等）
数据源	Yahoo Finance API	免费的美股实时与历史数据
数据库	SQLite / PostgreSQL（计划）	用户信息、策略记录、日志
AI 模块（未来）	OpenAI / Gemini / Llama	自动生成财经总结、辅助决策

3. 安装运行

环境要求
Node.js >= 18
npm >= 9
g++ >= 10

前端
cd frontend
npm install
npm run dev

后端
cd ../backend
npm install
npm run dev

C++ 核心
cd cpp
node-gyp configure build


4. 已完成部分

React 前端初版
导航栏 (Home, News, Investing, Algorithm, Log In)
TradingView 曲线占位
股票搜索框
技术指标选择功能
Node.js 基础框架
项目文件结构与文档

5. 待办事项

集成 TradingView 图表
接入 Yahoo Finance API
实现 C++ 算法模块
添加历史数据回测功能
对接美股自动交易 API
构建 AI 新闻总结功能
用户系统与订阅制功能

