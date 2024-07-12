import {
  Avatar,
  GetProp,
  Select,
  Space,
  Table,
  TablePaginationConfig,
  TableProps,
  Typography,
} from "antd";
import "./App.css";
import { useEffect, useState } from "react";
import { SorterResult } from "antd/es/table/interface";
import { javascript } from "@codemirror/lang-javascript";
import Controlled from "@uiw/react-codemirror";

const { Title } = Typography;

// Type for the parameters that define the table
interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult<number>["field"];
  sortOrder?: SorterResult<number>["order"];
  filters?: Parameters<GetProp<TableProps, "onChange">>[1];
}

function App() {
  // STATE VARIABLES
  const [data, setData] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("usd");
  const [sorting, setSorting] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 10000,
    },
  });

  // Variable for the columns that defines rendenring logic and parameters to show
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (item: unknown, record: any) => {
        return (
          <Space size={5}>
            <Avatar src={record.image} /> {" " + item}
          </Space>
        );
      },
    },
    {
      title: "Current Price",
      dataIndex: "current_price",
      key: "current_price",
      render: (item: any, record: any) => {
        return <div>{item + " " + selectedCurrency} </div>;
      },
    },
    {
      title: "Circulating supply",
      dataIndex: "circulating_supply",
      key: "circulating_supply",
    },
  ];

  // Callback function for the Table component
  const handleTableChange: TableProps["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    setTableParams({
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    });
  };

  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
  };

  const handleSortingChange = (value: string) => {
    setSorting(value);
  };

  // UseEffect to fetch the API when the state is changed or after first loading the page
  useEffect(() => {
    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${selectedCurrency}&order=market_cap_${sorting}&per_page=${tableParams.pagination?.pageSize}&page=${tableParams.pagination?.current}&sparkline=false`
    )
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, [selectedCurrency, sorting, tableParams.pagination]);

  // Returning HTML
  return (
    <main>
      <section>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Title level={2}>Coins & Markets</Title>
          <Space size={15}>
            <Select
              defaultValue="usd"
              style={{ width: 180 }}
              onChange={handleCurrencyChange}
              options={[
                { value: "usd", label: "USD" },
                { value: "eur", label: "EUR" },
              ]}
            />
            <Select
              defaultValue="desc"
              style={{ width: 180 }}
              onChange={handleSortingChange}
              options={[
                { value: "asc", label: "Market cap ascending" },
                { value: "desc", label: "Market cap descending" },
              ]}
            />
          </Space>

          <Table
            dataSource={data}
            columns={columns}
            loading={loading}
            rowKey="id"
            pagination={tableParams.pagination}
            style={{ width: "100" }}
            onChange={handleTableChange}
          />
        </Space>
      </section>
      <section>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Title level={2}>Coins & Markets</Title>
          <Controlled value={code} extensions={[javascript({ jsx: true })]} />
        </Space>
      </section>
    </main>
  );
}

export default App;

const code = `import React, { useEffect, useState } from "react";
import {
  Avatar,
  Select,
  Space,
  Table,
  TablePaginationConfig,
  TableProps,
  Typography,
} from "antd";
import { SorterResult } from "antd/es/table/interface";
import { Controlled as CodeMirror } from "@uiw/react-codemirror";
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import "./App.css";

const { Title } = Typography;

// Type for the parameters that define the table
interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult<number>["field"];
  sortOrder?: SorterResult<number>["order"];
  filters?: Parameters<GetProp<TableProps, "onChange">>[1];
}

function App() {
  // STATE VARIABLES
  const [data, setData] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("usd");
  const [sorting, setSorting] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 10000,
    },
  });

  // Variable for the columns that defines rendenring logic and parameters to show
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (item: any, record: any) => {
        return (
          <Space size={5}>
            <Avatar src={record.image} /> {" " + item}
          </Space>
        );
      },
    },
    {
      title: "Current Price",
      dataIndex: "current_price",
      key: "current_price",
      render: (item: any, record: any) => {
        return <div>{item + " " + selectedCurrency} </div>;
      },
    },
    {
      title: "Circulating supply",
      dataIndex: "circulating_supply",
      key: "circulating_supply",
    },
  ];

  // Callback function for the Table component
  const handleTableChange: TableProps["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    setTableParams({
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    });
  };

  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
  };

  const handleSortingChange = (value: string) => {
    setSorting(value);
  };

  // UseEffect to fetch the API when the state is changed or after first loading the page
  useEffect(() => {
    console.log("current page: ", tableParams.pagination?.current);

    fetch(
      \`https://api.coingecko.com/api/v3/coins/markets?vs_currency=\${selectedCurrency}&order=market_cap_\${sorting}&per_page=\${tableParams.pagination?.pageSize}&page=\${tableParams.pagination?.current}&sparkline=false\`
    )
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, [selectedCurrency, sorting, tableParams.pagination]);

  // Returning HTML
  return (
    <main>
      <section>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Title level={2}>Coins & Markets</Title>
          <Space size={15}>
            <Select
              defaultValue="usd"
              style={{ width: 180 }}
              onChange={handleCurrencyChange}
              options={[
                { value: "usd", label: "USD" },
                { value: "eur", label: "EUR" },
              ]}
            />
            <Select
              defaultValue="desc"
              style={{ width: 180 }}
              onChange={handleSortingChange}
              options={[
                { value: "asc", label: "Market cap ascending" },
                { value: "desc", label: "Market cap descending" },
              ]}
            />
          </Space>

          <Table
            dataSource={data}
            columns={columns}
            loading={loading}
            rowKey="id"
            pagination={tableParams.pagination}
            style={{ width: "100" }}
            onChange={handleTableChange}
          />
        </Space>
      </section>
      <section>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Title level={2}>Coins & Markets</Title>
          <Controlled value={code} extensions={[javascript({ jsx: true })]} />
        </Space>
      </section>
    </main>
  );
}

export default App;`;
