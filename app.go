package main

import (
	"context"
	"database/sql"
	"encoding/base64"
	"fmt"
	"strings"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/mattn/go-sqlite3"
)

// App struct
type App struct {
	ctx context.Context
	mysqlDB  *sql.DB    // MySQL 连接
	sqliteDB *sql.DB    // SQLite 连接，用于存储连接信息
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	// 初始化 SQLite 数据库
	db, err := sql.Open("sqlite3", "./connections.db")
	if err != nil {
		fmt.Println("Failed to open SQLite database:", err)
		return
	}
	a.sqliteDB = db

	// 创建连接表
	_, err = a.sqliteDB.Exec(`CREATE TABLE IF NOT EXISTS connections (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT,
		password TEXT,
		host TEXT,
		port TEXT
	)`)
	if err != nil {
		fmt.Println("Failed to create connections table:", err)
	}
}

// ConnectToMySQL connects to a MySQL database
func (a *App) ConnectToMySQL(dsn string) error {
	// 关闭现有的 MySQL 连接
	if a.mysqlDB != nil {
		a.mysqlDB.Close()
	}

	// 连接到 MySQL
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return err
	}

	// 测试连接
	err = db.Ping()
	if err != nil {
		return err
	}

	a.mysqlDB = db
	return nil
}

// GetDatabases returns a list of databases
func (a *App) GetDatabases() ([]string, error) {
	if a.mysqlDB == nil {
		return nil, fmt.Errorf("未连接到 MySQL")
	}
	
	rows, err := a.mysqlDB.Query("SHOW DATABASES")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var databases []string
	for rows.Next() {
		var dbName string
		if err := rows.Scan(&dbName); err != nil {
			return nil, err
		}
		databases = append(databases, dbName)
	}
	return databases, nil
}

// GetTables returns a list of tables for a given database
func (a *App) GetTables(dbName string) ([]string, error) {
	_, err := a.mysqlDB.Exec("USE " + dbName)
	if err != nil {
		return nil, err
	}

	rows, err := a.mysqlDB.Query("SHOW TABLES")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tables []string
	for rows.Next() {
		var tableName string
		if err := rows.Scan(&tableName); err != nil {
			return nil, err
		}
		tables = append(tables, tableName)
	}
	return tables, nil
}

// GetTableData returns the data for a given table
func (a *App) GetTableData(dbName, tableName string) ([]map[string]interface{}, error) {
	_, err := a.mysqlDB.Exec("USE " + dbName)
	if err != nil {
		return nil, err
	}

	rows, err := a.mysqlDB.Query("SELECT * FROM " + tableName)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return nil, err
	}

	var result []map[string]interface{}
	for rows.Next() {
		row := make(map[string]interface{})
		values := make([]interface{}, len(columns))
		valuePointers := make([]interface{}, len(columns))
		for i := range columns {
			valuePointers[i] = &values[i]
		}

		if err := rows.Scan(valuePointers...); err != nil {
			return nil, err
		}

		for i, column := range columns {
			if strVal, ok := values[i].([]byte); ok {
				decoded, err := base64.StdEncoding.DecodeString(string(strVal))
				if err == nil {
					row[column] = string(decoded)
				} else {
					row[column] = string(strVal)
				}
			} else {
				row[column] = values[i]
			}
		}
		result = append(result, row)
	}

	return result, nil
}

// UpdateTableData updates a row in the given table
func (a *App) UpdateTableData(dbName, tableName string, id int, data map[string]interface{}) error {
	_, err := a.mysqlDB.Exec("USE " + dbName)
	if err != nil {
		return err
	}

	var setClauses []string
	var values []interface{}
	for column, value := range data {
		setClauses = append(setClauses, fmt.Sprintf("%s = ?", column))
		values = append(values, value)
	}
	values = append(values, id)

	query := fmt.Sprintf("UPDATE %s SET %s WHERE id = ?", tableName, strings.Join(setClauses, ", "))
	_, err = a.mysqlDB.Exec(query, values...)
	return err
}

// InsertTableData inserts a new row into the given table
func (a *App) InsertTableData(dbName, tableName string, data map[string]interface{}) error {
	_, err := a.mysqlDB.Exec("USE " + dbName)
	if err != nil {
		return err
	}

	var columns []string
	var placeholders []string
	var values []interface{}
	for column, value := range data {
		columns = append(columns, column)
		placeholders = append(placeholders, "?")
		values = append(values, value)
	}

	query := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s)", tableName, strings.Join(columns, ", "), strings.Join(placeholders, ", "))
	_, err = a.mysqlDB.Exec(query, values...)
	return err
}

// DeleteTableData deletes a row from the given table
func (a *App) DeleteTableData(dbName, tableName string, id int) error {
	_, err := a.mysqlDB.Exec("USE " + dbName)
	if err != nil {
		return err
	}

	query := fmt.Sprintf("DELETE FROM %s WHERE id = ?", tableName)
	_, err = a.mysqlDB.Exec(query, id)
	return err
}

// ExecuteQuery executes a custom SQL query
func (a *App) ExecuteQuery(dbName, query string) ([]map[string]interface{}, error) {
	_, err := a.mysqlDB.Exec("USE " + dbName)
	if err != nil {
		return nil, err
	}

	rows, err := a.mysqlDB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return nil, err
	}

	var result []map[string]interface{}
	for rows.Next() {
		row := make(map[string]interface{})
		values := make([]interface{}, len(columns))
		valuePointers := make([]interface{}, len(columns))
		for i := range columns {
			valuePointers[i] = &values[i]
		}

		if err := rows.Scan(valuePointers...); err != nil {
			return nil, err
		}

		for i, column := range columns {
			if strVal, ok := values[i].([]byte); ok {
				row[column] = string(strVal)
			} else {
				row[column] = values[i]
			}
		}
		result = append(result, row)
	}

	return result, nil
}

// AddConnection adds a new connection to the SQLite database
func (a *App) AddConnection(username, password, host, port string) error {
	_, err := a.sqliteDB.Exec(`INSERT INTO connections (username, password, host, port) VALUES (?, ?, ?, ?)`, username, password, host, port)
	return err
}

// DeleteConnection deletes a connection from the SQLite database by ID
func (a *App) DeleteConnection(id int) error {
	_, err := a.sqliteDB.Exec(`DELETE FROM connections WHERE id = ?`, id)
	return err
}

// GetConnections retrieves all connections from the SQLite database
func (a *App) GetConnections() ([]map[string]interface{}, error) {
	rows, err := a.sqliteDB.Query(`SELECT id, username, password, host, port FROM connections`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var connections []map[string]interface{}
	for rows.Next() {
		var id int
		var username, password, host, port string
		if err := rows.Scan(&id, &username, &password, &host, &port); err != nil {
			return nil, err
		}
		connections = append(connections, map[string]interface{}{
			"id":       id,
			"username": username,
			"password": password,
			"host":     host,
			"port":     port,
		})
	}
	return connections, nil
}