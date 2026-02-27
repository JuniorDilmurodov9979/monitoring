import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-800 text-slate-200">
      <div className="max-w-md w-full text-center bg-slate-900 rounded-xl p-12 shadow-2xl">
        <h1 className="text-8xl font-extrabold text-sky-400">404</h1>

        <h2 className="mt-4 text-2xl font-semibold">Sahifa topilmadi!</h2>

        <p className="mt-3 text-sm text-slate-400">
          Siz qidirayotgan sahifa mavjud emas yoki ko'chirib o'tkazilgan.
        </p>

        <Link
          to="/"
          className="inline-block mt-8 px-6 py-3 rounded-lg bg-sky-400 text-slate-950 font-semibold hover:bg-sky-300 transition"
        >
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
