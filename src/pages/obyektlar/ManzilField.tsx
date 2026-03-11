import { useState, useRef, useEffect } from "react";
import { Form, Input } from "antd";
import { MapPin, ChevronDown, X } from "lucide-react";

const UZBEKISTAN_LOCATIONS = {
  "Toshkent shahri": [
    "Yunusobod",
    "Chilonzor",
    "Mirzo Ulug'bek",
    "Shayxontohur",
    "Olmazor",
    "Bektemir",
    "Yakkasaroy",
    "Yashnobod",
    "Sergeli",
    "Uchtepa",
    "Hamza",
  ],
  "Toshkent viloyati": [
    "Angren",
    "Bekobod",
    "Bo'ka",
    "Bo'stonliq",
    "Chinoz",
    "Chirchiq",
    "Ohangaron",
    "Oqqo'rg'on",
    "Parkent",
    "Piskent",
    "Qibray",
    "Yangiyo'l",
    "Zangiota",
    "Zangota",
  ],
  Samarqand: [
    "Samarqand shahri",
    "Ishtixon",
    "Jomboy",
    "Kattaqo'rg'on",
    "Narpay",
    "Nurobod",
    "Oqdaryo",
    "Pastdarg'om",
    "Paxtachi",
    "Payariq",
    "Qo'shrabot",
    "Toyloq",
    "Urgut",
  ],
  Buxoro: [
    "Buxoro shahri",
    "G'ijduvon",
    "Jondor",
    "Kogon",
    "Olot",
    "Peshku",
    "Qorovulbozor",
    "Romitan",
    "Shofirkon",
    "Vobkent",
  ],
  "Farg'ona": [
    "Farg'ona shahri",
    "Beshariq",
    "Bog'dod",
    "Buvayda",
    "Dang'ara",
    "Furqat",
    "Hamza",
    "Marg'ilon",
    "O'zbekiston",
    "Oltiariq",
    "Qo'qon",
    "Quva",
    "Rishton",
    "So'x",
    "Toshloq",
    "Uchko'prik",
    "Yozyovon",
  ],
  Andijon: [
    "Andijon shahri",
    "Asaka",
    "Baliqchi",
    "Bo'z",
    "Buloqboshi",
    "Izboskan",
    "Jalaquduq",
    "Xo'jaobod",
    "Marhamat",
    "Oltinko'l",
    "Paxtaobod",
    "Qo'rg'ontepa",
    "Shahrixon",
    "Ulug'nor",
  ],
  Namangan: [
    "Namangan shahri",
    "Chortoq",
    "Chust",
    "Kosonsoy",
    "Mingbuloq",
    "Namangan tumani",
    "Norin",
    "Pop",
    "To'raqo'rg'on",
    "Uchqo'rg'on",
    "Yangiqo'rg'on",
  ],
  Xorazm: [
    "Urganch shahri",
    "Bog'ot",
    "Gurlan",
    "Hazorasp",
    "Xiva",
    "Xonqa",
    "Qo'shko'pir",
    "Shovot",
    "Urganch tumani",
    "Yang'iariq",
    "Yangibozor",
  ],
  Qashqadaryo: [
    "Qarshi shahri",
    "Chiroqchi",
    "Dehqonobod",
    "G'uzor",
    "Kasbi",
    "Kitob",
    "Koson",
    "Mirishkor",
    "Muborak",
    "Nishon",
    "Qamashi",
    "Shahrisabz",
    "Yakkabog'",
  ],
  Surxondaryo: [
    "Termiz shahri",
    "Angor",
    "Bandixon",
    "Boysun",
    "Denov",
    "Jarqo'rg'on",
    "Muzrabot",
    "Oltinsoy",
    "Qiziriq",
    "Qumqo'rg'on",
    "Sariosiyo",
    "Sherobod",
    "Sho'rchi",
    "Uzun",
  ],
  Jizzax: [
    "Jizzax shahri",
    "Arnasoy",
    "Baxmal",
    "Do'stlik",
    "Forish",
    "G'allaorol",
    "Mirzacho'l",
    "Paxtakor",
    "Sharof Rashidov",
    "Yangiobod",
    "Zafarobod",
    "Zarbdor",
    "Zomin",
  ],
  Sirdaryo: [
    "Guliston shahri",
    "Boyovut",
    "Gurushtepa",
    "Xovos",
    "Mirzaobod",
    "Oqoltin",
    "Sardoba",
    "Sayxunobod",
    "Shirin",
    "Yangiyer",
  ],
  Navoiy: [
    "Navoiy shahri",
    "Karmana",
    "Konimex",
    "Navbahor",
    "Nurota",
    "Qiziltepa",
    "Tomdi",
    "Uchquduq",
    "Xatirchi",
  ],
  "Qoraqalpog'iston": [
    "Nukus shahri",
    "Amudaryo",
    "Beruniy",
    "Chimboy",
    "Ellikkala",
    "Kegeyli",
    "Mo'ynoq",
    "Nukus tumani",
    "Qanliko'l",
    "Qo'ng'irot",
    "Qorao'zak",
    "Shumanay",
    "Taxtako'pir",
    "To'rtko'l",
    "Xo'jayli",
  ],
};

const FormLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="font-medium text-gray-700">{children}</span>
);

export default function ManzilField() {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filtered, setFiltered] = useState<
    { region: string; district: string }[]
  >([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (val.trim().length === 0) {
      // Show all when empty and focused
      const all = Object.entries(UZBEKISTAN_LOCATIONS).flatMap(
        ([region, districts]) =>
          districts.map((d) => ({ region, district: d })),
      );
      setFiltered(all.slice(0, 30));
    } else {
      const lower = val.toLowerCase();
      const results: { region: string; district: string }[] = [];
      for (const [region, districts] of Object.entries(UZBEKISTAN_LOCATIONS)) {
        if (region.toLowerCase().includes(lower)) {
          districts.forEach((d) => results.push({ region, district: d }));
        } else {
          districts
            .filter((d) => d.toLowerCase().includes(lower))
            .forEach((d) => results.push({ region, district: d }));
        }
      }
      setFiltered(results.slice(0, 20));
    }
    setShowDropdown(true);
  };

  const handleFocus = () => {
    const all = Object.entries(UZBEKISTAN_LOCATIONS).flatMap(
      ([region, districts]) => districts.map((d) => ({ region, district: d })),
    );
    setFiltered(all.slice(0, 30));
    setShowDropdown(true);
  };

  const handleSelect = (region: string, district: string) => {
    const full = `${district}, ${region}`;
    setInputValue(full);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setInputValue("");
    setShowDropdown(false);
  };

  // Group filtered results by region for display
  const grouped = filtered.reduce<Record<string, string[]>>(
    (acc, { region, district }) => {
      if (!acc[region]) acc[region] = [];
      acc[region].push(district);
      return acc;
    },
    {},
  );

  return (
    <Form.Item
      className="col-span-2"
      label={<FormLabel>Manzil</FormLabel>}
      name="manzil"
      rules={[{ required: true, message: "Manzilni kiriting" }]}
    >
      <div ref={wrapperRef} className="relative">
        <div className="relative">
          <MapPin
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
          />
          <input
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder="Manzilni kiriting yoki tanlang..."
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
          />
          {inputValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          ) : (
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          )}
        </div>

        {showDropdown && Object.keys(grouped).length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {Object.entries(grouped).map(([region, districts]) => (
              <div key={region}>
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                  📍 {region}
                </div>
                {districts.map((district) => (
                  <button
                    key={district}
                    type="button"
                    onMouseDown={() => handleSelect(region, district)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    {district}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </Form.Item>
  );
}
