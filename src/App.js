import {
  Button,
  Form,
  Input,
  Popconfirm,
  Table,
  Divider,
  Image,
  Checkbox,
  Row,
  Col,
} from "antd";
import React, { useContext, useEffect, useRef, useState } from "react";
import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";
const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      console.log("Save failed:");
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};
const App = () => {
  const [dataSource, setDataSource] = useState([]);
  const [count, setCount] = useState(2);
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");
  const [selectionType, setSelectionType] = useState("checkbox");
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, { selectedRows });
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === "Disabled User",
      // Column configuration not to be checked
      name: record.name,
    }),
  };
  useEffect(() => {
    fetch(`https://my-json-server.typicode.com/HEINRICK7/fakeApi/db`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.pacientes);
      });
  }, []);
  const filteredServidor = results.filter((result) => {
    return (
      result.cpf.toLowerCase().includes(search.toLowerCase()) ||
      result.nome.toLowerCase().includes(search.toLowerCase()) ||
      result.numero_prontuario.includes(search)
    );
  });
  console.log(filteredServidor);
  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };
  const defaultColumns = [
    {
      title: "Nº prontuário",
      dataIndex: "numero_prontuario",
      width: "30%",
      editable: true,
    },
    {
      title: "Paciente",
      dataIndex: "nome",
      editable: true,
    },
    {
      title: "Data de nascimento",
      dataIndex: "data_nascimento",
      editable: true,
    },
    {
      title: "Procedimento",
      dataIndex: "procedimento",
      editable: true,
    },
    {
      title: "operation",
      dataIndex: "operation",
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record.key)}
          >
            <a>Delete</a>
          </Popconfirm>
        ) : null,
    },
  ];
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
      }),
    };
  });
  return (
    <>
      <form>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "grey",
            justifyContent: "space-between",
            padding: "20px",
          }}
        >
          <h1 style={{ color: "snow" }}>Associar Paciente</h1>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Input
              size="large"
              placeholder="Digite"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              suffix={<SearchOutlined />}
            />
          </div>
        </div>
        <div>
          <Table
            components={components}
            rowSelection={{
              type: selectionType,
              ...rowSelection,
            }}
            rowClassName={() => "editable-row"}
            bordered
            dataSource={filteredServidor.length === 1 ? filteredServidor : null}
            columns={columns}
          />
        </div>
        <Divider />
        {filteredServidor.length !== 0 ? (
          <Image.PreviewGroup>
            <Checkbox.Group
              style={{
                width: "100%",
              }}
              onChange={rowSelection}
            >
              <Row>
                <Col span={8}>
                  {filteredServidor.length === 1
                    ? filteredServidor?.map((res) =>
                        res.images.map((res) => <Checkbox value={res} />)
                      )
                    : null}
                </Col>
              </Row>
            </Checkbox.Group>
            {filteredServidor.length === 1
              ? filteredServidor?.map((res) =>
                  res.images.map((res) => <Image width={200} src={res.image} />)
                )
              : null}
          </Image.PreviewGroup>
        ) : null}
      </form>
    </>
  );
};
export default App;
