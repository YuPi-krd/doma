"use client";

import { useEffect, useMemo, useState } from "react";

interface PhotoPreview {
  id: string;
  file: File;
  url: string;
}

const subtypeOptions: Record<string, { value: string; label: string }[]> = {
  apartment: [
    { value: "secondary", label: "Вторичка" },
    { value: "new_building", label: "Новостройка" },
    { value: "studio", label: "Студия" },
    { value: "1_room", label: "1-комнатная" },
    { value: "2_room", label: "2-комнатная" },
    { value: "3_room", label: "3-комнатная" },
    { value: "4_room", label: "4-комнатная" },
    { value: "5_room", label: "5-комнатная" },
    { value: "penthouse", label: "Пентхаус" },
  ],
  house: [
    { value: "house", label: "Дом" },
    { value: "part_of_house", label: "Часть дома" },
    { value: "townhouse", label: "Таунхаус" },
    { value: "duplex", label: "Дуплекс" },
    { value: "cottage", label: "Коттедж" },
    { value: "dacha", label: "Дача" },
  ],
  land: [
    { value: "izhs", label: "ИЖС" },
    { value: "gardening", label: "Садоводство" },
    { value: "commercial_land", label: "Коммерческое" },
    { value: "lph", label: "ЛПХ" },
    { value: "dnp", label: "ДНП" },
  ],
  commercial: [
    { value: "office", label: "Офис" },
    { value: "business", label: "Бизнес" },
    { value: "separate_building", label: "Отдельное здание" },
    { value: "production", label: "Производство" },
    { value: "warehouse", label: "Склад" },
    { value: "retail", label: "Торговое помещение" },
  ],
  garage: [
    { value: "garage_box", label: "Гараж-бокс" },
    { value: "residential_complex", label: "Паркинг ЖК" },
    { value: "covered_parking", label: "Крытый паркинг" },
    { value: "separate_garage", label: "Отдельный гараж" },
    { value: "parking", label: "Машино-место" },
  ],
};

const propertyTypeLabels: Record<string, string> = {
  apartment: "Квартира",
  house: "Дом",
  land: "Участок",
  commercial: "Коммерция",
  garage: "Гараж",
};

export default function RentPage() {
  const [title, setTitle] = useState("");
  const [dealType] = useState("rent");
  const [propertyType, setPropertyType] = useState("apartment");
  const [propertySubtype, setPropertySubtype] = useState("secondary");
  const [district, setDistrict] = useState("");
  const [realAddress, setRealAddress] = useState("");
  const [publicAddress, setPublicAddress] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [rooms, setRooms] = useState("");
  const [floor, setFloor] = useState("");
  const [totalFloors, setTotalFloors] = useState("");
  const [bathroom, setBathroom] = useState("");
  const [balcony, setBalcony] = useState("");
  const [renovation, setRenovation] = useState("");
  const [buildingMaterial, setBuildingMaterial] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [status, setStatus] = useState("Свободен");
  const [description, setDescription] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [agentComment, setAgentComment] = useState("");
  const [roomLayout, setRoomLayout] = useState("");
  const [livingArea, setLivingArea] = useState("");
  const [kitchenArea, setKitchenArea] = useState("");
  const [plotArea, setPlotArea] = useState("");
  const [plotLength, setPlotLength] = useState("");
  const [plotWidth, setPlotWidth] = useState("");
  const [frontage, setFrontage] = useState("");
  const [landPurpose, setLandPurpose] = useState("");
  const [heating, setHeating] = useState("");
  const [gas, setGas] = useState(false);
  const [water, setWater] = useState(false);
  const [electricity, setElectricity] = useState(false);
  const [sewerage, setSewerage] = useState(false);
  const [fenced, setFenced] = useState("");
  const [terrace, setTerrace] = useState(false);
  const [bathhouse, setBathhouse] = useState(false);
  const [sauna, setSauna] = useState(false);
  const [pool, setPool] = useState(false);
  const [garage, setGarage] = useState(false);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const currentSubtypes = useMemo(
    () => subtypeOptions[propertyType] ?? subtypeOptions.apartment,
    [propertyType]
  );

  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.url));
    };
  }, [photos]);

  function addPhotos(files: FileList | File[]) {
    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    const newPhotos = validFiles.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
    }));

    setPhotos((current) => [...current, ...newPhotos]);
  }

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      addPhotos(event.target.files);
      event.target.value = "";
    }
  }

  function removePhoto(id: string) {
    setPhotos((current) => {
      const photo = current.find((item) => item.id === id);
      if (photo) URL.revokeObjectURL(photo.url);
      return current.filter((item) => item.id !== id);
    });
  }

  function setMainPhoto(id: string) {
    setPhotos((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index <= 0) return current;
      const copy = [...current];
      const [main] = copy.splice(index, 1);
      copy.unshift(main);
      return copy;
    });
  }

  function handlePropertyTypeChange(value: string) {
    setPropertyType(value);
    const firstSubtype = subtypeOptions[value]?.[0]?.value ?? "secondary";
    setPropertySubtype(firstSubtype);
  }

  function saveDraft() {
    const draft = {
      title,
      dealType,
      propertyType,
      propertySubtype,
      district,
      realAddress,
      publicAddress,
      price,
      area,
      rooms,
      floor,
      totalFloors,
      bathroom,
      balcony,
      renovation,
      buildingMaterial,
      yearBuilt,
      status,
      description,
      ownerName,
      ownerPhone,
      agentComment,
      roomLayout,
      livingArea,
      kitchenArea,
      plotArea,
      plotLength,
      plotWidth,
      frontage,
      landPurpose,
      heating,
      gas,
      water,
      electricity,
      sewerage,
      fenced,
      terrace,
      bathhouse,
      sauna,
      pool,
      garage,
    };

    localStorage.setItem("doma-rent-draft", JSON.stringify(draft));
    alert("Черновик сохранён на этом устройстве.");
  }

  async function saveProperty() {
    if (!title.trim()) {
      alert("Введите название объекта.");
      return;
    }

    if (!realAddress.trim()) {
      alert("Введите реальный адрес объекта.");
      return;
    }

    setIsSaving(true);
    setSavedId(null);

    try {
      const res = await fetch("https://doma-nq4u.onrender.com/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description,
          price: Number(price) || 0,
          area: Number(area) || 0,
          rooms: Number(rooms) || 0,
          floor: Number(floor) || 0,
          total_floors: Number(totalFloors) || 0,
          bathroom,
          balcony,
          renovation,
          building_material: buildingMaterial,
          year_built: Number(yearBuilt) || 0,
          city: "Краснодар",
          district,
          address: publicAddress,
          real_address: realAddress,
          public_address: publicAddress,
          owner_name: ownerName,
          owner_phone: ownerPhone,
          owner_comment: agentComment,
          property_type: propertyType,
          property_subtype: propertySubtype,
          deal_type: dealType,
          status,
          room_layout: roomLayout,
          living_area: Number(livingArea) || 0,
          kitchen_area: Number(kitchenArea) || 0,
          plot_area: Number(plotArea) || 0,
          plot_length: Number(plotLength) || 0,
          plot_width: Number(plotWidth) || 0,
          frontage: Number(frontage) || 0,
          land_purpose: landPurpose,
          heating,
          gas,
          water,
          electricity,
          sewerage,
          fenced,
          terrace,
          bathhouse,
          sauna,
          pool,
          garage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Не удалось сохранить объект.");
        return;
      }

      setSavedId(data.id ?? null);
      alert(`Объект сохранён. ID: ${data.id}`);
    } catch (error) {
      console.error(error);
      alert("Не удалось подключиться к серверу CRM. Проверьте доступность API: https://doma-nq4u.onrender.com/");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <header style={headerStyle}>
          <div>
            <div style={eyebrowStyle}>CRM DOMA · ОБЪЕКТ</div>
            <h1 style={titleStyle}>Создание объекта</h1>
            <p style={subtitleStyle}>
              Заполните данные для сдачи недвижимости в аренду
            </p>
          </div>

          <div style={rentBadgeStyle}>
            <span style={rentDotStyle} />
            Аренда
          </div>
        </header>

        <section style={progressCardStyle}>
          <div>
            <div style={progressTitleStyle}>Новый объект</div>
            <div style={progressTextStyle}>
              Основная информация · характеристики · медиа · собственник
            </div>
          </div>
          <div style={progressNumberStyle}>01 / 01</div>
        </section>

        <section style={layoutStyle}>
          <div style={columnStyle}>
            <section style={cardStyle}>
              <SectionHeading
                number="01"
                title="Основная информация"
                description="Базовые сведения об объекте"
              />

              <div style={formGridStyle}>
                <Field label="Название объекта" required full>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Например: Светлая квартира в центре"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Тип недвижимости" required>
                  <select
                    value={propertyType}
                    onChange={(e) => handlePropertyTypeChange(e.target.value)}
                    style={inputStyle}
                  >
                    {Object.entries(propertyTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Подтип недвижимости">
                  <select
                    value={propertySubtype}
                    onChange={(e) => setPropertySubtype(e.target.value)}
                    style={inputStyle}
                  >
                    {currentSubtypes.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Район">
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Выберите район</option>
                    <option key="Центральный" value="Центральный">Центральный</option>
                    <option key="Западный" value="Западный">Западный</option>
                    <option key="Прикубанский" value="Прикубанский">Прикубанский</option>
                    <option key="Карасунский" value="Карасунский">Карасунский</option>
                    <option key="Юбилейный" value="Юбилейный">Юбилейный</option>
                    <option key="Фестивальный" value="Фестивальный">Фестивальный</option>
                    <option key="Черёмушки" value="Черёмушки">Черёмушки</option>
                    <option key="Гидростроителей" value="Гидростроителей">Гидростроителей</option>
                    <option key="Комсомольский" value="Комсомольский">Комсомольский</option>
                    <option key="Пашковский" value="Пашковский">Пашковский</option>
                    <option key="Славянский" value="Славянский">Славянский</option>
                    <option key="Энка" value="Энка">Энка</option>
                    <option key="40 лет Победы" value="40 лет Победы">40 лет Победы</option>
                    <option key="РМЗ" value="РМЗ">РМЗ</option>
                    <option key="Музыкальный микрорайон" value="Музыкальный микрорайон">Музыкальный микрорайон</option>
                    <option key="Другой район" value="Другой район">Другой район</option>
                  </select>
                </Field>

                <Field label="Цена аренды, ₽/мес." required>
                  <div style={inputWithSuffixStyle}>
                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="45000"
                      style={inputBareStyle}
                    />
                    <span style={suffixStyle}>₽</span>
                  </div>
                </Field>

                <Field label="Площадь" required>
                  <div style={inputWithSuffixStyle}>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="0"
                      style={inputBareStyle}
                    />
                    <span style={suffixStyle}>м²</span>
                  </div>
                </Field>

                <Field label="Реальный адрес" required full>
                  <div style={privateFieldWrapStyle}>
                    <input
                      value={realAddress}
                      onChange={(e) => setRealAddress(e.target.value)}
                      placeholder="Полный фактический адрес"
                      style={{ ...inputStyle, borderColor: "#fecaca" }}
                    />
                    <span style={privateTagStyle}>ТОЛЬКО АГЕНТУ</span>
                  </div>
                </Field>

                <Field label="Рекламный адрес" full>
                  <div style={publicFieldWrapStyle}>
                    <input
                      value={publicAddress}
                      onChange={(e) => setPublicAddress(e.target.value)}
                      placeholder="Адрес для публикации на сайте"
                      style={{ ...inputStyle, borderColor: "#bbf7d0" }}
                    />
                    <span style={publicTagStyle}>ВИДЕН КЛИЕНТУ</span>
                  </div>
                </Field>
              </div>
            </section>

            <section style={cardStyle}>
              <SectionHeading
                number="02"
                title="Описание"
                description="Текст для карточки объекта"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={11}
                placeholder="Опишите объект: состояние, планировку, преимущества, инфраструктуру и важные детали..."
                style={textareaStyle}
              />
              <div style={counterStyle}>{description.length} символов</div>
            </section>

            <section style={cardStyle}>
              <SectionHeading
                number="03"
                title="Фотографии"
                description="Добавьте фотографии объекта для будущей публикации"
              />

              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files.length) {
                    addPhotos(e.dataTransfer.files);
                  }
                }}
                style={dropzoneStyle(dragActive)}
              >
                <div style={uploadIconStyle}>↥</div>
                <div style={uploadTitleStyle}>Перетащите фотографии сюда</div>
                <div style={uploadTextStyle}>или выберите файлы с компьютера</div>
                <label style={uploadButtonStyle}>
                  Выбрать фотографии
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFiles}
                    hidden
                  />
                </label>
                <div style={hintStyle}>PNG, JPG, WEBP · можно выбрать несколько</div>
              </div>

              {photos.length > 0 && (
                <div style={photoGridStyle}>
                  {photos.map((photo, index) => (
                    <div key={photo.id} style={photoCardStyle}>
                      <img
                        src={photo.url}
                        alt={photo.file.name}
                        style={photoImageStyle}
                      />
                      <div style={photoOverlayStyle}>
                        <span style={photoIndexStyle}>{index === 0 ? "Главное" : index + 1}</span>
                        <button
                          type="button"
                          onClick={() => setMainPhoto(photo.id)}
                          style={photoActionStyle}
                          title="Сделать главным"
                        >
                          ★
                        </button>
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          style={photoActionDangerStyle}
                          title="Удалить"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div style={columnStyle}>
            <section style={cardStyle}>
              <SectionHeading
                number="04"
                title="Характеристики"
                description={`Параметры объекта: ${propertyTypeLabels[propertyType] ?? "недвижимость"}`}
              />

              <div style={formGridStyle}>
                {propertyType === "apartment" && (
                  <>
                    <Field label="Комнат">
                      <input type="number" min="0" value={rooms} onChange={(e) => setRooms(e.target.value)} placeholder="Например: 2" style={inputStyle} />
                    </Field>
                    <Field label="Этаж">
                      <input type="number" min="0" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="Например: 5" style={inputStyle} />
                    </Field>
                    <Field label="Этажность дома">
                      <input type="number" min="0" value={totalFloors} onChange={(e) => setTotalFloors(e.target.value)} placeholder="Например: 9" style={inputStyle} />
                    </Field>
                    <Field label="Год постройки">
                      <input type="number" min="0" value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} placeholder="Например: 2018" style={inputStyle} />
                    </Field>
                    <Field label="Планировка комнат">
                      <select value={roomLayout} onChange={(e) => setRoomLayout(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option>
                        <option value="isolated">Изолированные</option>
                        <option value="adjacent">Смежные</option>
                        <option value="kitchen_living">Кухня-гостиная</option>
                        <option value="free">Свободная планировка</option>
                      </select>
                    </Field>
                    <Field label="Санузел">
                      <select value={bathroom} onChange={(e) => setBathroom(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option><option value="combined">Совмещённый</option><option value="separate">Раздельный</option>
                      </select>
                    </Field>
                    <Field label="Балкон / лоджия">
                      <select value={balcony} onChange={(e) => setBalcony(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option><option value="yes">Есть</option><option value="no">Нет</option>
                      </select>
                    </Field>
                    <Field label="Ремонт">
                      <select value={renovation} onChange={(e) => setRenovation(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option><option value="none">Без ремонта</option><option value="cosmetic">Косметический</option><option value="euro">Евроремонт</option><option value="designer">Дизайнерский</option>
                      </select>
                    </Field>
                    <Field label="Материал дома">
                      <select value={buildingMaterial} onChange={(e) => setBuildingMaterial(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option><option value="brick">Кирпич</option><option value="monolith">Монолит</option><option value="panel">Панель</option><option value="block">Блок</option><option value="wood">Дерево</option>
                      </select>
                    </Field>
                  </>
                )}

                {propertyType === "house" && (
                  <>
                    <Field label="Количество комнат">
                      <input type="number" min="0" value={rooms} onChange={(e) => setRooms(e.target.value)} placeholder="Например: 4" style={inputStyle} />
                    </Field>
                    <Field label="Площадь жилая, м²">
                      <input type="number" min="0" step="0.1" value={livingArea} onChange={(e) => setLivingArea(e.target.value)} placeholder="Например: 90" style={inputStyle} />
                    </Field>
                    <Field label="Площадь кухни, м²">
                      <input type="number" min="0" step="0.1" value={kitchenArea} onChange={(e) => setKitchenArea(e.target.value)} placeholder="Например: 20" style={inputStyle} />
                    </Field>
                    <Field label="Этажность">
                      <input type="number" min="0" value={totalFloors} onChange={(e) => setTotalFloors(e.target.value)} placeholder="Например: 2" style={inputStyle} />
                    </Field>
                    <Field label="Год постройки">
                      <input type="number" min="0" value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} placeholder="Например: 2022" style={inputStyle} />
                    </Field>
                    <Field label="Материал дома">
                      <select value={buildingMaterial} onChange={(e) => setBuildingMaterial(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option><option value="brick">Кирпич</option><option value="monolith">Монолит</option><option value="block">Блок</option><option value="wood">Дерево</option><option value="frame">Каркас</option>
                      </select>
                    </Field>
                    <Field label="Отопление">
                      <select value={heating} onChange={(e) => setHeating(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option><option value="gas">Газовое</option><option value="electric">Электрическое</option><option value="solid_fuel">Твердотопливное</option><option value="central">Центральное</option>
                      </select>
                    </Field>
                    <Field label="Санузел">
                      <select value={bathroom} onChange={(e) => setBathroom(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option><option value="combined">Совмещённый</option><option value="separate">Раздельный</option><option value="multiple">Несколько</option>
                      </select>
                    </Field>
                    <Field label="Коммуникации" full>
                      <div style={checklistStyle}>
                        {[
                          ["Газ", gas, setGas],
                          ["Вода", water, setWater],
                          ["Электричество", electricity, setElectricity],
                          ["Канализация", sewerage, setSewerage],
                        ].map(([label, checked, setter]) => (
                          <label key={label as string} style={checkItemStyle}>
                            <input type="checkbox" checked={checked as boolean} onChange={(e) => (setter as (value: boolean) => void)(e.target.checked)} />
                            {label as string}
                          </label>
                        ))}
                      </div>
                    </Field>
                    <Field label="Дополнительно" full>
                      <div style={checklistStyle}>
                        {[
                          ["Бассейн", pool, setPool],
                          ["Гараж", garage, setGarage],
                          ["Терраса", terrace, setTerrace],
                          ["Баня", bathhouse, setBathhouse],
                          ["Сауна", sauna, setSauna],
                        ].map(([label, checked, setter]) => (
                          <label key={label as string} style={checkItemStyle}>
                            <input type="checkbox" checked={checked as boolean} onChange={(e) => (setter as (value: boolean) => void)(e.target.checked)} />
                            {label as string}
                          </label>
                        ))}
                      </div>
                    </Field>
                  </>
                )}

                {propertyType === "land" && (
                  <>
                    <Field label="Площадь участка, соток">
                      <input type="number" min="0" step="0.1" value={plotArea} onChange={(e) => setPlotArea(e.target.value)} placeholder="Например: 6" style={inputStyle} />
                    </Field>
                    <Field label="Назначение земли">
                      <select value={landPurpose || propertySubtype} onChange={(e) => { setLandPurpose(e.target.value); setPropertySubtype(e.target.value); }} style={inputStyle}>
                        <option value="izhs">ИЖС</option><option value="lph">ЛПХ</option><option value="gardening">Садоводство</option><option value="dnp">ДНП</option><option value="commercial_land">Коммерческое</option>
                      </select>
                    </Field>
                    <Field label="Длина, м">
                      <input type="number" min="0" step="0.1" value={plotLength} onChange={(e) => setPlotLength(e.target.value)} placeholder="Например: 30" style={inputStyle} />
                    </Field>
                    <Field label="Ширина, м">
                      <input type="number" min="0" step="0.1" value={plotWidth} onChange={(e) => setPlotWidth(e.target.value)} placeholder="Например: 20" style={inputStyle} />
                    </Field>
                    <Field label="Ширина фасада, м">
                      <input type="number" min="0" step="0.1" value={frontage} onChange={(e) => setFrontage(e.target.value)} placeholder="Например: 20" style={inputStyle} />
                    </Field>
                    <Field label="Ограждение">
                      <select value={fenced} onChange={(e) => setFenced(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option><option value="yes">Есть</option><option value="no">Нет</option>
                      </select>
                    </Field>
                    <Field label="Коммуникации" full>
                      <div style={checklistStyle}>
                        {[
                          ["Газ", gas, setGas],
                          ["Вода", water, setWater],
                          ["Электричество", electricity, setElectricity],
                          ["Канализация", sewerage, setSewerage],
                        ].map(([label, checked, setter]) => (
                          <label key={label as string} style={checkItemStyle}>
                            <input type="checkbox" checked={checked as boolean} onChange={(e) => (setter as (value: boolean) => void)(e.target.checked)} />
                            {label as string}
                          </label>
                        ))}
                      </div>
                    </Field>
                  </>
                )}

                {propertyType === "commercial" && (
                  <>
                    <Field label="Этаж">
                      <input type="number" min="0" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="Например: 1" style={inputStyle} />
                    </Field>
                    <Field label="Этажность здания">
                      <input type="number" min="0" value={totalFloors} onChange={(e) => setTotalFloors(e.target.value)} placeholder="Например: 3" style={inputStyle} />
                    </Field>
                    <Field label="Год постройки">
                      <input type="number" min="0" value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} placeholder="Например: 2015" style={inputStyle} />
                    </Field>
                    <Field label="Ремонт">
                      <select value={renovation} onChange={(e) => setRenovation(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option><option value="none">Без ремонта</option><option value="cosmetic">Косметический</option><option value="euro">Современный</option><option value="designer">Дизайнерский</option>
                      </select>
                    </Field>
                    <Field label="Материал здания">
                      <select value={buildingMaterial} onChange={(e) => setBuildingMaterial(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option><option value="brick">Кирпич</option><option value="monolith">Монолит</option><option value="panel">Панель</option><option value="block">Блок</option>
                      </select>
                    </Field>
                    <Field label="Санузел">
                      <select value={bathroom} onChange={(e) => setBathroom(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option><option value="combined">Совмещённый</option><option value="separate">Раздельный</option>
                      </select>
                    </Field>
                  </>
                )}

                {propertyType === "garage" && (
                  <>
                    <Field label="Тип гаража">
                      <select value={propertySubtype} onChange={(e) => setPropertySubtype(e.target.value)} style={inputStyle}>
                        {currentSubtypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                      </select>
                    </Field>
                    <Field label="Электричество">
                      <select value={electricity ? "yes" : "no"} onChange={(e) => setElectricity(e.target.value === "yes")} style={inputStyle}>
                        <option value="no">Нет / не указано</option><option value="yes">Есть</option>
                      </select>
                    </Field>
                    <Field label="Материал">
                      <select value={buildingMaterial} onChange={(e) => setBuildingMaterial(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option><option value="brick">Кирпич</option><option value="metal">Металл</option><option value="concrete">Бетон</option><option value="block">Блок</option>
                      </select>
                    </Field>
                    <Field label="Год постройки">
                      <input type="number" min="0" value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} placeholder="Например: 2018" style={inputStyle} />
                    </Field>
                  </>
                )}
              </div>
            </section>
            <section style={cardStyle}>
              <SectionHeading
                number="05"
                title="Собственник"
                description="Контактная информация доступна только сотрудникам"
              />

              <div style={privateNoticeStyle}>
                <span style={{ fontSize: 18 }}>🔒</span>
                <div>
                  <div style={privateNoticeTitleStyle}>Внутренние данные CRM</div>
                  <div style={privateNoticeTextStyle}>
                    Эти данные не используются в публичной карточке объекта.
                  </div>
                </div>
              </div>

              <div style={formGridStyle}>
                <Field label="ФИО собственника">
                  <input
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Иванов Иван Иванович"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Телефон">
                  <input
                    type="tel"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="+7 (999) 999-99-99"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Комментарий агента" full>
                  <textarea
                    value={agentComment}
                    onChange={(e) => setAgentComment(e.target.value)}
                    rows={7}
                    placeholder="История общения, договорённости, условия собственника..."
                    style={textareaSmallStyle}
                  />
                </Field>
              </div>
            </section>

            <section style={cardStyle}>
              <SectionHeading
                number="06"
                title="Статус объекта"
                description="Текущий этап работы объекта"
              />

              <div style={statusListStyle}>
                {[
                  ["Свободен", "Объект доступен для аренды"],
                  ["Бронь", "Есть временная договорённость"],
                  ["Задаток", "Получен задаток"],
                  ["Сдан", "Объект передан арендатору"],
                ].map(([value, descriptionText]) => {
                  const active = status === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStatus(value)}
                      style={statusButtonStyle(active)}
                    >
                      <span style={statusRadioStyle(active)} />
                      <span style={{ textAlign: "left" }}>
                        <strong style={{ display: "block", fontSize: 14 }}>{value}</strong>
                        <span style={{ display: "block", fontSize: 12, color: "#64748b", marginTop: 3 }}>
                          {descriptionText}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </section>

        <footer style={footerStyle}>
          <div>
            {savedId ? (
              <div style={savedMessageStyle}>✓ Объект №{savedId} успешно создан</div>
            ) : (
              <div style={footerHintStyle}>Перед сохранением проверьте реальный и рекламный адрес.</div>
            )}
          </div>

          <div style={footerActionsStyle}>
            <button type="button" onClick={saveDraft} style={secondaryButtonStyle}>
              Сохранить черновик
            </button>
            <button
              type="button"
              onClick={saveProperty}
              disabled={isSaving}
              style={{ ...primaryButtonStyle, opacity: isSaving ? 0.7 : 1 }}
            >
              {isSaving ? "Сохранение..." : "Сохранить объект"}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}

function SectionHeading({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div style={sectionHeadingStyle}>
      <div style={sectionNumberStyle}>{number}</div>
      <div>
        <h2 style={sectionTitleStyle}>{title}</h2>
        <p style={sectionDescriptionStyle}>{description}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label style={{ ...(full ? fullFieldStyle : fieldStyle) }}>
      <span style={labelStyle}>
        {label}
        {required && <span style={requiredStyle}> *</span>}
      </span>
      {children}
    </label>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f6f7f9",
  padding: "32px 24px 48px",
  color: "#0f172a",
};

const shellStyle: React.CSSProperties = {
  maxWidth: 1500,
  margin: "0 auto",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 24,
  marginBottom: 24,
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.12em",
  color: "#dc2626",
  marginBottom: 8,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 36,
  lineHeight: 1.1,
  letterSpacing: "-0.03em",
};

const subtitleStyle: React.CSSProperties = {
  margin: "10px 0 0",
  color: "#64748b",
  fontSize: 15,
};

const rentBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "11px 16px",
  borderRadius: 999,
  background: "#fff1f2",
  border: "1px solid #fecdd3",
  color: "#be123c",
  fontWeight: 700,
  fontSize: 14,
};

const rentDotStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: "#ef4444",
};

const progressCardStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px 22px",
  marginBottom: 24,
  borderRadius: 18,
  border: "1px solid #e2e8f0",
  background: "#ffffff",
};

const progressTitleStyle: React.CSSProperties = { fontWeight: 750, fontSize: 15 };
const progressTextStyle: React.CSSProperties = { marginTop: 4, color: "#64748b", fontSize: 13 };
const progressNumberStyle: React.CSSProperties = { fontWeight: 800, color: "#94a3b8", fontSize: 13 };

const layoutStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.25fr) minmax(380px, 0.85fr)",
  gap: 24,
  alignItems: "start",
};

const columnStyle: React.CSSProperties = { display: "grid", gap: 24 };

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 22,
  padding: 26,
  boxShadow: "0 12px 34px rgba(15,23,42,.045)",
};

const sectionHeadingStyle: React.CSSProperties = {
  display: "flex",
  gap: 14,
  alignItems: "flex-start",
  marginBottom: 22,
};

const sectionNumberStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  flex: "0 0 auto",
  display: "grid",
  placeItems: "center",
  borderRadius: 10,
  background: "#0f172a",
  color: "#ffffff",
  fontSize: 12,
  fontWeight: 800,
};

const sectionTitleStyle: React.CSSProperties = { margin: 0, fontSize: 19, fontWeight: 750 };
const sectionDescriptionStyle: React.CSSProperties = { margin: "5px 0 0", color: "#64748b", fontSize: 13 };

const formGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16,
};

const fieldStyle: React.CSSProperties = { display: "grid", gap: 8 };
const fullFieldStyle: React.CSSProperties = { ...fieldStyle, gridColumn: "1 / -1" };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 750, color: "#334155" };
const requiredStyle: React.CSSProperties = { color: "#dc2626" };

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 48,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid #dbe1e8",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const inputBareStyle: React.CSSProperties = {
  border: 0,
  outline: 0,
  flex: 1,
  width: "100%",
  background: "transparent",
  fontSize: 14,
  minHeight: 46,
};

const inputWithSuffixStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  minHeight: 48,
  padding: "0 12px 0 14px",
  borderRadius: 12,
  border: "1px solid #dbe1e8",
  background: "#ffffff",
};

const suffixStyle: React.CSSProperties = { color: "#94a3b8", fontSize: 13, fontWeight: 700 };

const privateFieldWrapStyle: React.CSSProperties = { position: "relative" };
const publicFieldWrapStyle: React.CSSProperties = { position: "relative" };

const privateTagStyle: React.CSSProperties = {
  position: "absolute",
  right: 10,
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: 10,
  fontWeight: 800,
  color: "#b91c1c",
  background: "#fff1f2",
  padding: "5px 7px",
  borderRadius: 7,
};

const publicTagStyle: React.CSSProperties = {
  position: "absolute",
  right: 10,
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: 10,
  fontWeight: 800,
  color: "#15803d",
  background: "#f0fdf4",
  padding: "5px 7px",
  borderRadius: 7,
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 220,
  resize: "vertical",
  padding: 16,
  borderRadius: 14,
  border: "1px solid #dbe1e8",
  fontSize: 14,
  lineHeight: 1.6,
  outline: "none",
  boxSizing: "border-box",
};

const textareaSmallStyle: React.CSSProperties = {
  ...textareaStyle,
  minHeight: 150,
};

const counterStyle: React.CSSProperties = {
  marginTop: 8,
  textAlign: "right",
  fontSize: 11,
  color: "#94a3b8",
};

const dropzoneStyle = (active: boolean): React.CSSProperties => ({
  minHeight: 235,
  borderRadius: 18,
  border: `2px dashed ${active ? "#dc2626" : "#cbd5e1"}`,
  background: active ? "#fff7f7" : "#f8fafc",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  textAlign: "center",
  transition: ".2s ease",
});

const uploadIconStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  display: "grid",
  placeItems: "center",
  borderRadius: 16,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  fontSize: 30,
  color: "#dc2626",
  marginBottom: 14,
};

const uploadTitleStyle: React.CSSProperties = { fontWeight: 750, fontSize: 16 };
const uploadTextStyle: React.CSSProperties = { color: "#64748b", marginTop: 5, fontSize: 13 };

const uploadButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 16,
  padding: "11px 16px",
  borderRadius: 10,
  background: "#0f172a",
  color: "#ffffff",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};

const hintStyle: React.CSSProperties = { marginTop: 10, fontSize: 11, color: "#94a3b8" };

const photoGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 12,
  marginTop: 18,
};

const photoCardStyle: React.CSSProperties = {
  position: "relative",
  aspectRatio: "4 / 3",
  overflow: "hidden",
  borderRadius: 14,
  background: "#e2e8f0",
};

const photoImageStyle: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };

const photoOverlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: "8px 8px auto 8px",
  display: "flex",
  gap: 5,
  alignItems: "center",
};

const photoIndexStyle: React.CSSProperties = {
  marginRight: "auto",
  padding: "5px 7px",
  borderRadius: 7,
  background: "rgba(15,23,42,.78)",
  color: "#ffffff",
  fontSize: 10,
  fontWeight: 800,
};

const photoActionStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  border: 0,
  borderRadius: 8,
  background: "rgba(255,255,255,.92)",
  cursor: "pointer",
  fontWeight: 800,
};

const photoActionDangerStyle: React.CSSProperties = {
  ...photoActionStyle,
  color: "#b91c1c",
};

const privateNoticeStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
  padding: 14,
  borderRadius: 14,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  marginBottom: 18,
};

const privateNoticeTitleStyle: React.CSSProperties = { fontWeight: 750, fontSize: 13 };
const privateNoticeTextStyle: React.CSSProperties = { marginTop: 3, color: "#64748b", fontSize: 12 };

const statusListStyle: React.CSSProperties = { display: "grid", gap: 10 };

const statusButtonStyle = (active: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  width: "100%",
  padding: "13px 14px",
  borderRadius: 13,
  border: `1px solid ${active ? "#fecaca" : "#e2e8f0"}`,
  background: active ? "#fff7f7" : "#ffffff",
  cursor: "pointer",
});

const statusRadioStyle = (active: boolean): React.CSSProperties => ({
  width: 16,
  height: 16,
  borderRadius: "50%",
  border: `4px solid ${active ? "#dc2626" : "#cbd5e1"}`,
  background: "#ffffff",
  boxSizing: "border-box",
});


const checklistStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px 18px",
  padding: "12px 14px",
  border: "1px solid #dbe1e8",
  borderRadius: 12,
  background: "#f8fafc",
};

const checkItemStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  color: "#334155",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  marginTop: 24,
  padding: 20,
  borderRadius: 20,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
};

const footerActionsStyle: React.CSSProperties = { display: "flex", gap: 12 };
const footerHintStyle: React.CSSProperties = { fontSize: 12, color: "#64748b" };
const savedMessageStyle: React.CSSProperties = { fontSize: 13, color: "#15803d", fontWeight: 750 };

const secondaryButtonStyle: React.CSSProperties = {
  padding: "13px 18px",
  borderRadius: 12,
  border: "1px solid #dbe1e8",
  background: "#ffffff",
  color: "#334155",
  fontWeight: 700,
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "13px 22px",
  borderRadius: 12,
  border: 0,
  background: "linear-gradient(135deg, #dc2626, #ef4444)",
  color: "#ffffff",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 12px 24px rgba(220,38,38,.22)",
};
