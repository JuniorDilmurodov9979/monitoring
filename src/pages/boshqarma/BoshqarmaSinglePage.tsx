import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { ArrowLeftOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";
import api from "@/services/api/axios";

interface UserType {
  id: number;
  fio: string;
  lavozim: string;
  boshqarma_nomi: string;
  is_active: boolean;
}

const BoshqarmaSinglePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`auth/users/?boshqarma=${id}`);
      setData(res.data.results);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUsers();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Back + header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors mb-3"
        >
          <ArrowLeftOutlined className="text-[10px]" />
          Boshqarmalar
        </button>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-1">
              Boshqarma #{id}
            </p>
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
              Xodimlar ro'yxati
            </h1>
          </div>

          {data.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
              <TeamOutlined className="text-[11px]" />
              {data.length} ta xodim
            </span>
          )}
        </div>
      </div>

      {/* Table card */}
      {data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
            <TeamOutlined className="text-slate-300 text-xl" />
          </div>
          <p className="text-sm text-slate-400 font-medium">Bu boshqarmada xodimlar yo'q</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["#", "F.I.O", "Lavozim", "Boshqarma", "Holati"].map((col) => (
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
              {data.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => navigate(`/users/${user.id}`)}
                  className="border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors duration-100"
                >
                  {/* ID */}
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-medium text-slate-400 tabular-nums">
                      {user.id}
                    </span>
                  </td>

                  {/* FIO */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <UserOutlined className="text-slate-400 text-xs" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {user.fio}
                      </span>
                    </div>
                  </td>

                  {/* Lavozim */}
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                      {user.lavozim}
                    </span>
                  </td>

                  {/* Boshqarma */}
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-slate-600">{user.boshqarma_nomi}</span>
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
        </div>
      )}
    </div>
  );
};

export default BoshqarmaSinglePage;