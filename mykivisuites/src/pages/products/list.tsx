import {
  List,
  useTable,
  EditButton,
  ShowButton,
  DeleteButton,
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Table, Space } from "antd";

// Define your product type
interface Product {
  id: string | number;
  name: string;
  sku: string;
  price: number;
  stockLevel: number;
}

export const ProductList = () => {
  const { tableProps } = useTable<Product>({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column dataIndex="sku" title="SKU" />
        <Table.Column dataIndex="price" title="Price" />
        <Table.Column dataIndex="stockLevel" title="Stock" />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
