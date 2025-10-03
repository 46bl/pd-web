# Project Setup Guide

This guide will walk you through the steps to set up and run this project locally.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

*   [Node.js](https://nodejs.org/en/) (v18 or higher)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)

## 1. Installation

Clone the repository and install the dependencies using npm:

```bash
npm install
```

## 2. Database Setup

This project uses a PostgreSQL database. You will need to provide a connection string to your PostgreSQL database.

### Create a `.env` file

Create a new file named `.env` in the root of the project directory.

### Add the Database Connection String

Add the following line to the `.env` file, replacing `"your_postgresql_connection_string_here"` with your actual PostgreSQL connection string:

```
DATABASE_URL="your_postgresql_connection_string_here"
```

**Note:** If you don't have a PostgreSQL database, you can get a free one from [Neon](https://neon.tech/).

## 3. Database Migration

Once you have set up your `.env` file with the correct database connection string, you need to run the database migration to create the necessary tables in your database.

Run the following command in your terminal:

```bash
npm run db:push
```

## 4. Running the Application

After completing the installation and database setup, you can start the development server.

Run the following command in your terminal:

```bash
npm run dev
```

The application should now be running on [http://localhost:5173](http://localhost:5173).
