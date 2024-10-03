package main

import (
	"context"
	"database/sql"
	"encoding/base64"
	"fmt"
	"strings"
	_ "github.com/go-sql-driver/mysql"
)

// App struct
type App struct {
	ctx context.Context
	db  *sql.DB
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// ConnectToMySQL connects to a MySQL database
func (a *App) ConnectToMySQL(dsn string) error {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return err
	}
	a.db = db
	return nil
}

// GetDatabases returns a list of databases
func (a *App) GetDatabases() ([]string, error) {
	rows, err := a.db.Query("SHOW DATABASES")
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
	_, err := a.db.Exec("USE " + dbName)
	if err != nil {
		return nil, err
	}

	rows, err := a.db.Query("SHOW TABLES")
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
	_, err := a.db.Exec("USE " + dbName)
	if err != nil {
		return nil, err
	}

	rows, err := a.db.Query("SELECT * FROM " + tableName)
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
				// 尝试解码 Base64
				decoded, err := base64.StdEncoding.DecodeString(string(strVal))
				if err == nil {
					row[column] = string(decoded)
				} else {
					// 如果不是 Base64，就使用原始值
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
	_, err := a.db.Exec("USE " + dbName)
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
	_, err = a.db.Exec(query, values...)
	return err
}

// InsertTableData inserts a new row into the given table
func (a *App) InsertTableData(dbName, tableName string, data map[string]interface{}) error {
	_, err := a.db.Exec("USE " + dbName)
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
	_, err = a.db.Exec(query, values...)
	return err
}

// DeleteTableData deletes a row from the given table
func (a *App) DeleteTableData(dbName, tableName string, id int) error {
	_, err := a.db.Exec("USE " + dbName)
	if err != nil {
		return err
	}

	query := fmt.Sprintf("DELETE FROM %s WHERE id = ?", tableName)
	_, err = a.db.Exec(query, id)
	return err
}

// ExecuteQuery executes a custom SQL query
func (a *App) ExecuteQuery(dbName, query string) ([]map[string]interface{}, error) {
	_, err := a.db.Exec("USE " + dbName)
	if err != nil {
		return nil, err
	}

	rows, err := a.db.Query(query)
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
