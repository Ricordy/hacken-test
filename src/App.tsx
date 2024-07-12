import { Table } from "antd";
import "./App.css";

function App() {
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

  const data = [
    { name: "Name", current_price: "1", circulating_supply: "2" },
    { name: "bit", current_price: "2", circulating_supply: "1" },
  ];

  return (
    <>
      <section>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          pagination={false}
          style={{ width: "100vw" }}
        />
      </section>
    </>
  );
}

export default App;
