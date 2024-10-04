import React from 'react';

const CustomQuerySection = ({ customQuery, setCustomQuery, handleExecuteQuery, queryResult }) => {
  return (
    <div className="bottom-bar glass-effect">
      <div className="custom-query">
        <textarea
          value={customQuery}
          onChange={(e) => setCustomQuery(e.target.value)}
          placeholder="输入自定义 SQL 查询"
        />
        <button className="primary-button" onClick={handleExecuteQuery}>执行查询</button>
      </div>
      {queryResult.length > 0 && (
        <div className="query-result">
          <h3>查询结果</h3>
          <table>
            <thead>
              <tr>
                {Object.keys(queryResult[0]).map(key => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queryResult.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{value !== null ? value.toString() : 'NULL'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomQuerySection;
