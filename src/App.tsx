import {
  GetProp,
  Select,
  Table,
  TablePaginationConfig,
  TableProps,
} from "antd";
import "./App.css";
import { useEffect, useState } from "react";
import { SorterResult } from "antd/es/table/interface";

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult<number>["field"];
  sortOrder?: SorterResult<number>["order"];
  filters?: Parameters<GetProp<TableProps, "onChange">>[1];
}

function App() {
  const [data, setData] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("usd");
  const [loading, setLoading] = useState(true);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Current Price",
      dataIndex: "current_price",
      key: "current_price",
    },
    {
      title: "Circulating supply",
      dataIndex: "circulating_supply",
      key: "circulating_supply",
    },
  ];

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

  useEffect(() => {
    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${selectedCurrency}`
    )
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, [selectedCurrency]);

  return (
    <>
      <section>
        <Select
          defaultValue="usd"
          style={{ width: 120 }}
          onChange={handleCurrencyChange}
          options={[
            { value: "usd", label: "USD" },
            { value: "eur", label: "EUR" },
          ]}
        />
        <Table
          dataSource={data}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={tableParams.pagination}
          style={{ width: "100vw" }}
          onChange={handleTableChange}
        />
      </section>
    </>
  );
}

export default App;
