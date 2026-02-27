import { ArrowLeftOutlined } from "@ant-design/icons";
import React from "react";

export const getHolatColor = (holat: string) => {
  switch (holat) {
    case "rejada":
      return "blue";
    case "jarayonda":
      return "gold";
    case "tugatilgan":
      return "green";
    case "muammoli":
      return "red";
    case "to'xtatilgan":
      return "gray";
    default:
      return "default";
  }
};
export const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${day}.${month}.${year}`;
};

type BackButtonProps = {
  onClick?: () => void;
};

export const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.history.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center cursor-pointer gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
    >
      <ArrowLeftOutlined /> Orqaga
    </button>
  );
};
