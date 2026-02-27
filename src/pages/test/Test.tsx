import { useEffect, useState } from "react";
import axios from "axios";
import { Tree, Badge, Spin, Empty, Pagination } from "antd";
import type { DataNode } from "antd/es/tree";
import api from "@/services/api/axios";

interface Category {
  id: number;
  nomi: string;
  parent: number | null;
  children: Category[];
  hujjatlar_soni: number;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Category[];
}

export default function Test() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchCategories = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await api.get<ApiResponse>(
        `hujjatlar/kategoriyalar/?page=${pageNumber}`,
      );

      setData(res.data.results);
      setTotal(res.data.count);
    } catch (err) {
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(page);
  }, [page]);

  const convertToTreeData = (categories: Category[]): DataNode[] =>
    categories.map((item) => ({
      key: item.id,
      title: (
        <div
          className="flex items-center justify-between w-full pr-4 cursor-pointer"
          onClick={() => console.log("Clicked:", item.id)}
        >
          <span className="font-medium text-gray-800">{item.nomi}</span>
          <Badge count={item.hujjatlar_soni} overflowCount={999} />
        </div>
      ),
      children:
        item.children && item.children.length > 0
          ? convertToTreeData(item.children)
          : undefined,
    }));

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-700">
        Hujjat Kategoriyalari
      </h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : data.length === 0 ? (
        <Empty description="Hali kategoriyalar mavjud emas" />
      ) : (
        <>
          <Tree treeData={convertToTreeData(data)} defaultExpandAll showLine />

          <div className="flex justify-center mt-6">
            <Pagination
              current={page}
              total={total}
              pageSize={10}
              onChange={(p) => setPage(p)}
            />
          </div>
        </>
      )}
    </div>
  );
}
