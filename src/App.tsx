import {
  Avatar,
  Card,
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
import { NumericFormat } from "react-number-format";

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
  const [marketCapDiff, setMarketCapDiff] = useState(0.0);
  const [coinsToCompare, setCoinsToCompare] = useState({
    coin1: "",
    coin2: "",
    coin1MC: 0,
    coin2MC: 0,
  });
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
      render: (item: any) => {
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

  const onChange1 = (value: string) => {
    const item = data.filter((i: any) => i.name === value) as any;
    console.log("item 0 : ", item[0]);

    if (item.length > 0) {
      setCoinsToCompare((prev) => ({
        ...prev,
        coin1MC: Number(item[0].market_cap),
        coin1: item[0].name,
      }));
    }
  };

  const onChange2 = (value: string) => {
    const item = data.filter((i: any) => i.name === value) as any;
    if (item.length > 0) {
      setCoinsToCompare((prev) => ({
        ...prev,
        coin2MC: Number(item[0].market_cap),
        coin2: item[0].name,
      }));
    }
  };

  const onSearch = (value: string) => {
    console.log("search:", value);
  };

  // UseEffect to fetch the API when the state is changed or after first loading the page
  useEffect(() => {
    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${selectedCurrency}&order=market_cap_${sorting}&sparkline=false`
    )
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
        setCoinsToCompare({
          coin1MC: Number(data[0]?.market_cap),
          coin2MC: Number(data[1]?.market_cap),
          coin1: data[0]?.name,
          coin2: data[1]?.name,
        });
      });
  }, [selectedCurrency, sorting]);

  useEffect(() => {
    if (coinsToCompare.coin1MC > coinsToCompare.coin2MC) {
      setMarketCapDiff(coinsToCompare.coin1MC / coinsToCompare.coin2MC);
    } else if (coinsToCompare.coin1MC < coinsToCompare.coin2MC) {
      setMarketCapDiff(
        -Math.abs(coinsToCompare.coin2MC / coinsToCompare.coin1MC)
      );
    } else {
      setMarketCapDiff(0);
    }

    return () => {};
  }, [coinsToCompare.coin1MC, coinsToCompare.coin2MC]);

  // Returning HTML
  return (
    <main>
      <section>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Title level={2}>Market cap comparasion</Title>
          <Card style={{ width: "100%" }}>
            <Space>
              <Select
                showSearch
                placeholder="Choose the currency"
                onChange={onChange1}
                onSearch={onSearch}
                style={{ width: "200px" }}
              >
                {data.map((cryptocurrency: any) => {
                  return (
                    <Select.Option
                      value={cryptocurrency.name}
                      key={cryptocurrency.id}
                    >
                      {cryptocurrency.name.toString()}
                    </Select.Option>
                  );
                })}
              </Select>
              <Select
                showSearch
                placeholder="Choose the currency"
                onChange={onChange2}
                onSearch={onSearch}
                style={{ width: "200px" }}
              >
                {data.map((cryptocurrency: any) => {
                  return (
                    <Select.Option
                      value={cryptocurrency.name}
                      key={cryptocurrency.id}
                    >
                      {cryptocurrency.name.toString()}
                    </Select.Option>
                  );
                })}
              </Select>
            </Space>

            <Title level={3}>
              How many times{" "}
              <text className={marketCapDiff > 0 ? "text-green" : "text-red"}>
                {coinsToCompare.coin1}
              </text>{" "}
              market cap is {marketCapDiff > 0 ? "bigger" : "smaller"} than{" "}
              <text className={marketCapDiff < 0 ? "text-green" : "text-red"}>
                {coinsToCompare.coin2}
              </text>
              ?
            </Title>
            <Title>
              <NumericFormat
                value={marketCapDiff}
                decimalScale={2}
                decimalSeparator="."
                prefix={"x"}
                displayType="text"
                allowNegative
              />
            </Title>
          </Card>
        </Space>
      </section>
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
          <Title level={2}>App source code</Title>
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
  const [marketCapDiff, setMarketCapDiff] = useState(0.0);
  const [coinsToCompare, setCoinsToCompare] = useState({
    coin1: "",
    coin2:"",
    coin1MC: 0,
    coin2MC: 0,
  });
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
      render: (item: any) => {
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

  const onChange1 = (value: string) => {
    const item = data.filter((i) => i.name === value);
    console.log("item 0 : ", item[0]);

    if (item.length > 0) {
      setCoinsToCompare((prev) => ({
        ...prev,
        coin1MC: Number(item[0].market_cap),
        coin1: item[0].name,
      }));
    }
  };

  const onChange2 = (value: string) => {
    const item = data.filter((i) => i.name === value);
    if (item.length > 0) {
      setCoinsToCompare((prev) => ({
        ...prev,
        coin2MC: Number(item[0].market_cap),
        coin2: item[0].name,
      }));
    }
  };

  const onSearch = (value: string) => {
    console.log("search:", value);
  };

  // UseEffect to fetch the API when the state is changed or after first loading the page
  useEffect(() => {
    fetch(
      \`https://api.coingecko.com/api/v3/coins/markets?vs_currency=\${selectedCurrency}&order=market_cap_\${sorting}&per_page=\${tableParams.pagination?.pageSize}&page=\${tableParams.pagination?.current}&sparkline=false\`
    )
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
        setCoinsToCompare({
          coin1MC: Number(data[0]?.market_cap),
          coin2MC: Number(data[1]?.market_cap),
          coin1: data[0]?.name,
          coin2: data[1]?.name,
        });
      });
  }, [selectedCurrency, sorting, tableParams.pagination]);

  useEffect(() => {
    if (coinsToCompare.coin1MC > coinsToCompare.coin2MC) {
      setMarketCapDiff(coinsToCompare.coin1MC / coinsToCompare.coin2MC);
    } else if (coinsToCompare.coin1MC < coinsToCompare.coin2MC) {
      setMarketCapDiff(
        -Math.abs(coinsToCompare.coin2MC / coinsToCompare.coin1MC)
      );
    } else {
      setMarketCapDiff(0);
    }

    return () => {};
  }, [coinsToCompare.coin1MC, coinsToCompare.coin2MC]);

  // Returning HTML
  return (
    <main>
      <section>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Title level={2}>Market cap comparasion</Title>
          <Card style={{ width: "100%" }}>
            <Space>
              <Select
                placeholder="Choose the currency"
                onChange={onChange1}
                onSearch={onSearch}
                style={{ width: "200px" }}
              >
                {data.map((cryptocurrency) => {
                  return (
                    <Select.Option
                      value={cryptocurrency.name}
                      key={cryptocurrency.id}
                    >
                      {cryptocurrency.name.toString()}
                    </Select.Option>
                  );
                })}
              </Select>
              <Select
                showSearch
                placeholder="Choose the currency"
                onChange={onChange2}
                onSearch={onSearch}
                style={{ width: "200px" }}
              >
                {data.map((cryptocurrency) => {
                  return (
                    <Select.Option
                      value={cryptocurrency.name}
                      key={cryptocurrency.id}
                    >
                      {cryptocurrency.name.toString()}
                    </Select.Option>
                  );
                })}
              </Select>
            </Space>

            <Title level={3}>
              How many times{" "}
              <text className={marketCapDiff > 0 ? "text-green" : "text-red"}>
                {coinsToCompare.coin1}
              </text>{" "}
              market cap is {marketCapDiff > 0 ? "bigger" : "smaller"} than{" "}
              <text className={marketCapDiff < 0 ? "text-green" : "text-red"}>
                {coinsToCompare.coin2}
              </text>
              ?
            </Title>
            <Title>
              <NumericFormat
                value={marketCapDiff}
                decimalScale={2}
                decimalSeparator="."
                prefix={"x"}
                displayType="text"
                allowNegative
              />
            </Title>
          </Card>
        </Space>
      </section>
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
          <Title level={2}>App source code</Title>
          <Controlled value={code} extensions={[javascript({ jsx: true })]} />
        </Space>
      </section>
    </main>
  );
}

export default App;`;
