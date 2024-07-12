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

const { Title, Text } = Typography;

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
  const [stats, setStats] = useState({
    diff: 0.0,
    coin1Price2MC: 0.0,
    coin1MC2P: 0.0,
  });
  const [coinsToCompare, setCoinsToCompare] = useState({
    coin1: "",
    coin2: "",
    coin1P: 0,
    coin2P: 0,
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
        coin1P: item[0].current_price,
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
        coin2P: item[0].current_price,
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
          coin1P: data[0]?.current_price,
          coin2P: data[1]?.current_price,
        });
      });
  }, [selectedCurrency, sorting]);

  useEffect(() => {
    if (coinsToCompare.coin1MC > coinsToCompare.coin2MC) {
      setStats((prev) => ({
        ...prev,
        diff: coinsToCompare.coin1MC / coinsToCompare.coin2MC,
        coin1Price2MC:
          (coinsToCompare.coin1P *
            ((coinsToCompare.coin2MC * 100) / coinsToCompare.coin1MC)) /
          100,
        coin1MC2P:
          (coinsToCompare.coin1MC *
            ((coinsToCompare.coin2P * 100) / coinsToCompare.coin1P)) /
          100,
      }));
    } else if (coinsToCompare.coin1MC < coinsToCompare.coin2MC) {
      setStats((prev) => ({
        ...prev,
        diff: -Math.abs(coinsToCompare.coin2MC / coinsToCompare.coin1MC),
        coin1Price2MC:
          (coinsToCompare.coin1P *
            ((coinsToCompare.coin2MC * 100) / coinsToCompare.coin1MC)) /
          100,
        coin1MC2P:
          (coinsToCompare.coin1MC *
            ((coinsToCompare.coin2P * 100) / coinsToCompare.coin1P)) /
          100,
      }));
    } else {
      setStats((prev) => ({ ...prev, diff: 0 }));
    }

    return () => {};
  }, [coinsToCompare.coin1MC, coinsToCompare.coin2MC]);

  // Returning HTML
  return (
    <main>
      <section>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Title level={2}>Quick note</Title>
          <Card style={{ width: "100%" }}>
            <Space direction="vertical">
              <Text>
                In order to improve the "app" I decided to remove part of the
                API parameters as well as add a market cap comparasion. As can
                be seen below:
              </Text>
              <Controlled
                value={paginationDiffCode}
                height="150px"
                maxWidth="95vw"
                extensions={[javascript({ jsx: true })]}
                editable={false}
              />
              <div>
                I am leaving this note since I'm not sure if this was something
                I could do. Not calling the API each time the pagination is used
                allows for less calls thus faster user interaction/experience.
                Therefore I decided to proceed this way but save a link for a
                <a
                  target="__blank"
                  href="https://github.com/Ricordy/hacken-test/pull/2/commits/073ea6fcdb7d552de77343679e34de5a0af9d97c"
                >
                  {" "}
                  GitHub Commit{" "}
                </a>{" "}
                that will show you the minimal differences made in the "app".
              </div>
              <div>Thanks!</div>
            </Space>
          </Card>
        </Space>
      </section>
      <section>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Title level={2}>Market cap comparasion</Title>
          <Card style={{ width: "100%" }}>
            <Space direction="vertical">
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
              <Space direction="vertical">
                <Title level={3}>
                  How many times{" "}
                  <text className={stats.diff > 0 ? "text-green" : "text-red"}>
                    {coinsToCompare.coin1}
                  </text>{" "}
                  market cap is {stats.diff > 0 ? "bigger" : "smaller"} than{" "}
                  <text className={stats.diff < 0 ? "text-green" : "text-red"}>
                    {coinsToCompare.coin2}
                  </text>
                  ?
                </Title>
                <Title>
                  <NumericFormat
                    value={stats.diff}
                    decimalScale={2}
                    decimalSeparator="."
                    prefix={"x"}
                    displayType="text"
                    allowNegative
                  />
                </Title>
              </Space>
              <Space direction="vertical">
                <Title level={3}>
                  How much would{" "}
                  <text className={stats.diff > 0 ? "text-green" : "text-red"}>
                    {coinsToCompare.coin1}
                  </text>{" "}
                  worth with{" "}
                  <text className={stats.diff < 0 ? "text-green" : "text-red"}>
                    {coinsToCompare.coin2}
                  </text>{" "}
                  market cap?
                </Title>
                <Title>
                  <NumericFormat
                    value={stats.coin1Price2MC}
                    decimalScale={2}
                    decimalSeparator="."
                    suffix={" " + selectedCurrency}
                    displayType="text"
                    allowNegative
                  />
                </Title>
              </Space>
              <Space direction="vertical">
                <Title level={3}>
                  How much would{" "}
                  <text className={stats.diff > 0 ? "text-green" : "text-red"}>
                    {coinsToCompare.coin1}'s
                  </text>{" "}
                  market cap be if{" "}
                  <text className={stats.diff > 0 ? "text-green" : "text-red"}>
                    {coinsToCompare.coin1}'s
                  </text>
                  {"  "}price is the same as{"  "}
                  <text className={stats.diff < 0 ? "text-green" : "text-red"}>
                    {coinsToCompare.coin2}
                  </text>{" "}
                  ?
                </Title>
                <Title>
                  <NumericFormat
                    value={stats.coin1MC2P}
                    decimalScale={2}
                    decimalSeparator="."
                    suffix={" " + selectedCurrency}
                    displayType="text"
                    allowNegative
                    thousandSeparator=","
                  />
                </Title>
              </Space>
            </Space>
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
          <Controlled
            value={code}
            extensions={[javascript({ jsx: true })]}
            editable={false}
          />
        </Space>
      </section>
    </main>
  );
}

export default App;

const code = `import {
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

const { Title, Text } = Typography;

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
   const [stats, setStats] = useState({
    diff: 0.0,
    coin1Price2MC: 0.0,
    coin1MC2P: 0.0,
  });
  const [coinsToCompare, setCoinsToCompare] = useState({
    coin1: "",
    coin2: "",
    coin1P: 0,
    coin2P: 0,
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
        coin1P: item[0].current_price,
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
        coin2P: item[0].current_price,
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
          coin1P: data[0]?.current_price,
          coin2P: data[1]?.current_price,
        });
      });
  }, [selectedCurrency, sorting, tableParams.pagination]);

  useEffect(() => {
    if (coinsToCompare.coin1MC > coinsToCompare.coin2MC) {
      setStats((prev) => ({
        ...prev,
        diff: coinsToCompare.coin1MC / coinsToCompare.coin2MC,
        coin1Price2MC:
          (coinsToCompare.coin1P *
            ((coinsToCompare.coin2MC * 100) / coinsToCompare.coin1MC)) /
          100,
        coin1MC2P:
          (coinsToCompare.coin1MC *
            ((coinsToCompare.coin2P * 100) / coinsToCompare.coin1P)) /
          100,
      }));
    } else if (coinsToCompare.coin1MC < coinsToCompare.coin2MC) {
      setStats((prev) => ({
        ...prev,
        diff: -Math.abs(coinsToCompare.coin2MC / coinsToCompare.coin1MC),
        coin1Price2MC:
          (coinsToCompare.coin1P *
            ((coinsToCompare.coin2MC * 100) / coinsToCompare.coin1MC)) /
          100,
        coin1MC2P:
          (coinsToCompare.coin1MC *
            ((coinsToCompare.coin2P * 100) / coinsToCompare.coin1P)) /
          100,
      }));
    } else {
      setStats((prev) => ({ ...prev, diff: 0 }));
    }

    return () => {};
  }, [coinsToCompare.coin1MC, coinsToCompare.coin2MC]);


  // Returning HTML
  return (
    <main>
      <section>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Title level={2}>Quick note</Title>
          <Card style={{ width: "100%" }}>
            <Space direction="vertical">
              <Text>
                In order to improve the "app" I decided to remove part of the
                API parameters as well as add a market cap comparasion. As can
                be seen below:
              </Text>
              <Controlled
                value={paginationDiffCode}
                height="150px"
                maxWidth="95vw"
                extensions={[javascript({ jsx: true })]}
                editable={false}
              />
              <div>
                I am leaving this note since I'm not sure if this was something
                I could do. Not calling the API each time the pagination is used
                allows for less calls thus faster user interaction/experience.
                Therefore I decided to proceed this way but save a link for a
                <a
                  target="__blank"
                  href="https://github.com/Ricordy/hacken-test/pull/2/commits/073ea6fcdb7d552de77343679e34de5a0af9d97c"
                >
                  {" "}
                  GitHub Commit{" "}
                </a>{" "}
                that will show you the minimal differences made in the "app".
              </div>
              <div>Thanks!</div>
            </Space>
          </Card>
        </Space>
      </section>
      <section>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Title level={2}>Market cap comparasion</Title>
          <Card style={{ width: "100%" }}>
            <Space direction="vertical">
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
              <Space direction="vertical">
                <Title level={3}>
                  How many times{" "}
                  <text className={stats.diff > 0 ? "text-green" : "text-red"}>
                    {coinsToCompare.coin1}
                  </text>{" "}
                  market cap is {stats.diff > 0 ? "bigger" : "smaller"} than{" "}
                  <text className={stats.diff < 0 ? "text-green" : "text-red"}>
                    {coinsToCompare.coin2}
                  </text>
                  ?
                </Title>
                <Title>
                  <NumericFormat
                    value={stats.diff}
                    decimalScale={2}
                    decimalSeparator="."
                    prefix={"x"}
                    displayType="text"
                    allowNegative
                  />
                </Title>
              </Space>
              <Space direction="vertical">
                <Title level={3}>
                  How much would{" "}
                  <text className={stats.diff > 0 ? "text-green" : "text-red"}>
                    {coinsToCompare.coin1}
                  </text>{" "}
                  worth with{" "}
                  <text className={stats.diff < 0 ? "text-green" : "text-red"}>
                    {coinsToCompare.coin2}
                  </text>{" "}
                  market cap?
                </Title>
                <Title>
                  <NumericFormat
                    value={stats.coin1Price2MC}
                    decimalScale={2}
                    decimalSeparator="."
                    suffix={" " + selectedCurrency}
                    displayType="text"
                    allowNegative
                  />
                </Title>
              </Space>
              <Space direction="vertical">
                <Title level={3}>
                  How much would{" "}
                  <text className={stats.diff > 0 ? "text-green" : "text-red"}>
                    {coinsToCompare.coin1}'s
                  </text>{" "}
                  market cap be if{" "}
                  <text className={stats.diff > 0 ? "text-green" : "text-red"}>
                    {coinsToCompare.coin1}'s
                  </text>
                  {"  "}price is the same as{"  "}
                  <text className={stats.diff < 0 ? "text-green" : "text-red"}>
                    {coinsToCompare.coin2}
                  </text>{" "}
                  ?
                </Title>
                <Title>
                  <NumericFormat
                    value={stats.coin1MC2P}
                    decimalScale={2}
                    decimalSeparator="."
                    suffix={" " + selectedCurrency}
                    displayType="text"
                    allowNegative
                    thousandSeparator=","
                  />
                </Title>
              </Space>
            </Space>
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
          <Controlled
            value={code}
            extensions={[javascript({ jsx: true })]}
            editable={false}
          />
        </Space>
      </section>
    </main>
  );
}

export default App;`;

const paginationDiffCode = `
// Test guidelines fetch with pagination
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
  
  
  // Suggested fetch without pagination
fetch(
  \`https://api.coingecko.com/api/v3/coins/markets?vs_currency=\${selectedCurrency}&order=market_cap_\${sorting}&sparkline=false\`
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
`;
