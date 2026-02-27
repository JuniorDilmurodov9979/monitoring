import { useEffect, useState } from "react";
import { Spin } from "antd";
import { UserAddOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import AddUserModal from "./AddUserModal";

interface User {
  id: number;
  fio: string;
  lavozim: string;
  boshqarma_nomi: string;
  is_active: boolean;
}

const XodimlarPage = () => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(API_ENDPOINTS.USERS.LIST);
      setData(res.data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const paginated = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(data.length / PAGE_SIZE);

  console.log(paginated);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 rounded-xl">
      {/* Page header */}
      <div className="mb-6">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-1">
          Tashkilot xodimlari
        </p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
            Xodimlar ro'yxati
          </h1>
          <div className="flex items-center gap-3">
            {data.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                <TeamOutlined className="text-[11px]" />
                {data.length} ta xodim
              </span>
            )}
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors duration-150"
            >
              <UserAddOutlined className="text-xs" />
              Xodim qo'shish
            </button>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <TeamOutlined className="text-slate-300 text-xl" />
            </div>
            <p className="text-sm text-slate-400 font-medium">
              Hozircha xodimlar mavjud emas
            </p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["F.I.O", "Lavozim", "Boshqarma", "Holati"].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => navigate(`/users/${user.id}`)}
                    className="border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors duration-100"
                  >
                    {/* FIO */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          {user.avatar ? (
                            <img
                              src={
                                user.avatar?.startsWith("http://")
                                  ? user.avatar.replace("http://", "https://")
                                  : user.avatar
                              }
                              alt={user.fio}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <UserOutlined className="text-slate-400 text-xs" />
                          )}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                          {user.fio}
                        </span>
                      </div>
                    </td>

                    {/* Lavozim */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 capitalize">
                        {user.lavozim.replace("_", " ")}
                      </span>
                    </td>

                    {/* Boshqarma */}
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-slate-600">
                        {user.boshqarma_nomi}
                      </span>
                    </td>

                    {/* Holati */}
                    <td className="px-4 py-3.5">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Aktiv
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          Nofaol
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  Jami{" "}
                  <span className="font-semibold text-slate-600">
                    {data.length}
                  </span>{" "}
                  ta xodim
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                          p === page
                            ? "bg-slate-800 text-white"
                            : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AddUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default XodimlarPage;
