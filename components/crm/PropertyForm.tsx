"use client";

export default function PropertyForm({
  mode,
}: {
  mode: "sale" | "rent";
}) {
  return (
    <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-lg p-8">
      <h1 className="text-3xl font-bold mb-8">
        {mode === "sale"
          ? "Новый объект (Продажа)"
          : "Новый объект (Аренда)"}
      </h1>

      <div className="grid grid-cols-2 gap-6">

        <div>
          <label>Тип объекта</label>
          <select className="w-full border rounded-xl p-3">
            <option>Квартира</option>
            <option>Дом</option>
            <option>Участок</option>
            <option>Коммерция</option>
          </select>
        </div>

        <div>
          <label>Район</label>
          <input
            className="w-full border rounded-xl p-3"
            placeholder="Фестивальный"
          />
        </div>

        <div>
          <label>Реальный адрес</label>
          <input
            className="w-full border rounded-xl p-3"
            placeholder="Виден только агенту"
          />
        </div>

        <div>
          <label>Рекламный адрес</label>
          <input
            className="w-full border rounded-xl p-3"
            placeholder="Виден клиентам"
          />
        </div>

        <div>
          <label>Цена</label>
          <input
            type="number"
            className="w-full border rounded-xl p-3"
          />
        </div>

        <div>
          <label>Площадь</label>
          <input
            type="number"
            className="w-full border rounded-xl p-3"
          />
        </div>

      </div>

      <div className="mt-8">
        <button className="bg-red-500 text-white px-6 py-3 rounded-xl">
          Характеристики объекта
        </button>
      </div>
    </div>
  );
}