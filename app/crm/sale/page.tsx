"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const API_URL = "https://doma-nq4u.onrender.com";

interface PhotoPreview {
  id: string;
  file?: File;
  name: string;
  url: string;
  existing?: boolean;
  serverId?: number;
}

const subtypeOptions: Record<string, { value: string; label: string }[]> = {
  apartment: [
    { value: "secondary", label: "Вторичка" },
    { value: "new_building", label: "Новостройка" },
    { value: "1_room", label: "1-комнатная" },
    { value: "2_room", label: "2-комнатная" },
    { value: "3_room", label: "3-комнатная" },
    { value: "4_room", label: "4-комнатная" },
    { value: "5_room", label: "5-комнатная" },
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
    { value: "sto", label: "СТО" },
    { value: "hotel", label: "Гостиница" },
    { value: "car_wash", label: "Автомойка" },
    { value: "cafe", label: "Кафе" },
    { value: "shop", label: "Магазин" },
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

export default function SalePage() {
  const [title, setTitle] = useState("");
  const [dealType] = useState("sale");
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
  const [source, setSource] = useState("Рекомендация");
  const [hasMaternalCapital, setHasMaternalCapital] = useState(false);
  const [showPricePerSqm, setShowPricePerSqm] = useState(false);
  const [residentialComplex, setResidentialComplex] = useState("");
  const [cadastralNumber, setCadastralNumber] = useState("");
  const [landCadastralNumber, setLandCadastralNumber] = useState("");
  const [metro, setMetro] = useState("");
  const [condition, setCondition] = useState("");
  const [ceilingHeight, setCeilingHeight] = useState("");
  const [furniture, setFurniture] = useState("");
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
  const [editingPropertyId, setEditingPropertyId] = useState<number | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showCharacteristics, setShowCharacteristics] = useState(false);
  const [showReferenceSummary, setShowReferenceSummary] = useState(false);

  const currentSubtypes = useMemo(
    () => subtypeOptions[propertyType] ?? subtypeOptions.apartment,
    [propertyType]
  );

  const photosRef = useRef<PhotoPreview[]>([]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => { if (!photo.existing && photo.url.startsWith("blob:")) URL.revokeObjectURL(photo.url); });
    };
  }, []);

  function addPhotos(files: FileList | File[]) {
    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    const newPhotos = validFiles.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      file,
      name: file.name,
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
      if (photo && !photo.existing && photo.url.startsWith("blob:")) URL.revokeObjectURL(photo.url);
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

  function asFormString(value: unknown): string {
    return value === null || value === undefined ? "" : String(value);
  }

  function normalizeImageUrl(value: unknown): string {
    const path = asFormString(value).trim();
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  }

  async function loadPropertyIntoForm(propertyId: number) {
    setIsLoadingExisting(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Не найдена авторизация CRM. Войдите в систему заново.");
      }
      const response = await fetch(`${API_URL}/crm/properties/${propertyId}`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(raw.detail || `Не удалось загрузить объект №${propertyId}`);
      const p = (raw.property && typeof raw.property === "object" ? raw.property : raw) as Record<string, unknown>;

      setTitle(asFormString(p.title));
      setPropertyType(asFormString(p.property_type));
      setPropertySubtype(asFormString(p.property_subtype));
      setDistrict(asFormString(p.district));
      setRealAddress(asFormString(p.real_address));
      setPublicAddress(asFormString(p.public_address || p.address));
      setPrice(asFormString(p.price));
      setArea(asFormString(p.area));
      setRooms(asFormString(p.rooms));
      setFloor(asFormString(p.floor));
      setTotalFloors(asFormString(p.total_floors));
      setBathroom(asFormString(p.bathroom));
      setBalcony(asFormString(p.balcony));
      setRenovation(asFormString(p.renovation));
      setBuildingMaterial(asFormString(p.building_material));
      setYearBuilt(asFormString(p.year_built));
      setStatus(asFormString(p.status));
      setDescription(asFormString(p.description));
      setOwnerName(asFormString(p.owner_name));
      setOwnerPhone(asFormString(p.owner_phone));
      setAgentComment(asFormString(p.agent_comment));
      setSource(asFormString(p.source));
      setResidentialComplex(asFormString(p.residential_complex));
      setCadastralNumber(asFormString(p.cadastral_number));
      setLandCadastralNumber(asFormString(p.land_cadastral_number));
      setMetro(asFormString(p.metro));
      setCondition(asFormString(p.condition));
      setCeilingHeight(asFormString(p.ceiling_height));
      setFurniture(asFormString(p.furniture));
      setRoomLayout(asFormString(p.room_layout));
      setLivingArea(asFormString(p.living_area));
      setKitchenArea(asFormString(p.kitchen_area));
      setPlotArea(asFormString(p.plot_area));
      setPlotLength(asFormString(p.plot_length));
      setPlotWidth(asFormString(p.plot_width));
      setFrontage(asFormString(p.frontage));
      setLandPurpose(asFormString(p.land_purpose));
      setHeating(asFormString(p.heating));
      setFenced(asFormString(p.fenced));
      setHasMaternalCapital(Boolean(p.has_maternal_capital));
      setShowPricePerSqm(Boolean(p.show_price_per_sqm));
      setGas(Boolean(p.gas));
      setWater(Boolean(p.water));
      setElectricity(Boolean(p.electricity));
      setSewerage(Boolean(p.sewerage));
      setTerrace(Boolean(p.terrace));
      setBathhouse(Boolean(p.bathhouse));
      setSauna(Boolean(p.sauna));
      setPool(Boolean(p.pool));
      setGarage(Boolean(p.garage));
      setEditingPropertyId(propertyId);
      setSavedId(null);
      setShowCharacteristics(false);

      // Главное изображение и фотографии из галереи показываются в том же блоке, что и новые фото.
      const galleryResponse = await fetch(`${API_URL}/properties/${propertyId}/images`, { cache: "no-store" }).catch(() => null);
      const galleryRaw = galleryResponse?.ok ? await galleryResponse.json().catch(() => []) : [];
      const images: Array<{ id?: number | string; image_url?: string }> = Array.isArray(galleryRaw) ? galleryRaw : [];
      const photoUrls = [
        { id: `cover-${propertyId}`, image_url: asFormString(p.image_url) },
        ...images,
      ].filter((photo) => Boolean(photo.image_url))
       .map((photo, index) => ({
         id: String(photo.id ?? `existing-${propertyId}-${index}`),
         serverId: typeof photo.id === "number" ? photo.id : undefined,
         name: index === 0 ? "Главное фото" : `Фото ${index + 1}`,
         url: normalizeImageUrl(photo.image_url),
         existing: true as const,
       }))
       .filter((photo, index, list) => list.findIndex((entry) => entry.url === photo.url) === index);
      setPhotos(photoUrls);
      document.getElementById("doma-sale-create-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Не удалось загрузить данные объекта.");
    } finally {
      setIsLoadingExisting(false);
    }
  }

  function resetFormForNewObject() {
    if (editingPropertyId === null && !title.trim()) {
      document.getElementById("doma-sale-create-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (!window.confirm("Начать создание нового объекта? Несохранённые изменения будут потеряны.")) return;
    setTitle("");
    setPropertyType("");
    setPropertySubtype("");
    setDistrict("");
    setRealAddress("");
    setPublicAddress("");
    setPrice("");
    setArea("");
    setRooms("");
    setFloor("");
    setTotalFloors("");
    setBathroom("");
    setBalcony("");
    setRenovation("");
    setBuildingMaterial("");
    setYearBuilt("");
    setStatus("Свободен");
    setDescription("");
    setOwnerName("");
    setOwnerPhone("");
    setAgentComment("");
    setSource("Рекомендация");
    setResidentialComplex("");
    setCadastralNumber("");
    setLandCadastralNumber("");
    setMetro("");
    setCondition("");
    setCeilingHeight("");
    setFurniture("");
    setRoomLayout("");
    setLivingArea("");
    setKitchenArea("");
    setPlotArea("");
    setPlotLength("");
    setPlotWidth("");
    setFrontage("");
    setLandPurpose("");
    setHeating("");
    setFenced("");
    setHasMaternalCapital(false);
    setShowPricePerSqm(false);
    setGas(false);
    setWater(false);
    setElectricity(false);
    setSewerage(false);
    setTerrace(false);
    setBathhouse(false);
    setSauna(false);
    setPool(false);
    setGarage(false);
    setPropertyType("apartment");
    setPropertySubtype("secondary");
    setPhotos([]);
    setEditingPropertyId(null);
    setShowCharacteristics(false);
    setShowReferenceSummary(false);
    setSavedId(null);
    document.getElementById("doma-sale-create-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      source,
      hasMaternalCapital,
      showPricePerSqm,
      residentialComplex,
      cadastralNumber,
      landCadastralNumber,
      metro,
      condition,
      ceilingHeight,
      furniture,
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

    localStorage.setItem("doma-sale-draft", JSON.stringify(draft));
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
      const targetUrl = editingPropertyId !== null
        ? `${API_URL}/properties/${editingPropertyId}`
        : `${API_URL}/properties`;
      const res = await fetch(targetUrl, {
        method: editingPropertyId !== null ? "PUT" : "POST",
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
          agent_comment: agentComment,
          source,
          has_maternal_capital: hasMaternalCapital,
          show_price_per_sqm: showPricePerSqm,
          residential_complex: residentialComplex,
          cadastral_number: cadastralNumber,
          land_cadastral_number: landCadastralNumber,
          metro,
          condition,
          ceiling_height: Number(ceilingHeight) || 0,
          furniture,
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

      const propertyId = Number(data.id ?? data.property?.id ?? editingPropertyId);
      if (!propertyId) {
        throw new Error("Сервер сохранил объект, но не вернул его ID. Обновите список объектов перед повторным созданием.");
      }

      // Сначала устанавливаем главное фото, затем сохраняем все выбранные фото в галерею.
      // Оригинальный выбор файлов и превью остаются без изменений.
      if (photos.length > 0) {
        const primaryPhoto = photos[0];
        if (primaryPhoto.file) {
          const coverForm = new FormData();
          coverForm.append("file", primaryPhoto.file, primaryPhoto.file.name);
          const coverResponse = await fetch(`${API_URL}/properties/${propertyId}/image`, { method: "POST", body: coverForm });
          if (!coverResponse.ok) {
            const detail = await coverResponse.text();
            throw new Error(`Объект №${propertyId} сохранён, но главное фото не загрузилось: ${detail}`);
          }
        }
        // Существующие фото не загружаем повторно; отправляем только новые файлы.
        const newPhotos = photos.filter((photo) => Boolean(photo.file) && photo !== primaryPhoto || Boolean(photo.file) && primaryPhoto.existing);
        for (const photo of newPhotos) {
          if (!photo.file) continue;
          const imageForm = new FormData();
          imageForm.append("file", photo.file, photo.file.name);
          const imageResponse = await fetch(`${API_URL}/properties/${propertyId}/images`, { method: "POST", body: imageForm });
          if (!imageResponse.ok) {
            const detail = await imageResponse.text();
            throw new Error(`Объект №${propertyId} сохранён, но фотография «${photo.name}» не загрузилась: ${detail}`);
          }
        }
      }

      setSavedId(propertyId);
      const wasEditing = editingPropertyId !== null;
      setEditingPropertyId(null);
      alert(`${wasEditing ? "Изменения сохранены" : "Объект сохранён"}. ID: ${propertyId}${photos.length ? `. Фотографий в форме: ${photos.length}` : ""}`);
    } catch (error) {
      console.error(error);
      alert("Не удалось подключиться к серверу CRM. Проверьте доступность API: https://doma-nq4u.onrender.com/");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main style={pageStyle}>
      <style>{`@media (max-width: 980px) { .doma-crm-layout { grid-template-columns: minmax(0, 1fr) !important; } .doma-crm-reference { position: static !important; grid-column: 1 !important; grid-row: auto !important; max-height: none !important; } } @media (max-width: 620px) { .doma-crm-fields { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }`}</style>
      <div style={shellStyle}>
        <header style={headerStyle}>
          <div>
            <div style={eyebrowStyle}>CRM DOMA · ОБЪЕКТ</div>
            <h1 style={titleStyle}>{editingPropertyId !== null ? `Редактирование объекта №${editingPropertyId}` : "Создание объекта"}</h1>
            <p style={subtitleStyle}>
              Заполните данные для продажи недвижимости
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 7, flexWrap: "wrap" }}>
            <button type="button" onClick={editingPropertyId !== null ? resetFormForNewObject : () => document.getElementById("doma-sale-create-form")?.scrollIntoView({ behavior: "smooth", block: "start" })} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 24, padding: "4px 8px", border: "1px solid #b7d8f3", borderRadius: 2, background: "#f7fbff", color: "#075ba8", fontSize: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
              {editingPropertyId !== null ? "＋ Новый объект" : "＋ Добавить объект"}
            </button>
            <div style={saleBadgeStyle}>
              <span style={saleDotStyle} />
              Продажа
            </div>
          </div>
        </header>

        {/* Список находится прямо на странице продажи, как в видео; отдельный маршрут не нужен. */}
        <SalePropertiesList refreshKey={savedId ?? 0} onCreateClick={() => document.getElementById("doma-sale-create-form")?.scrollIntoView({ behavior: "smooth", block: "start" })} onOpenProperty={loadPropertyIntoForm} isOpening={isLoadingExisting} />

        <section id="doma-sale-create-form" className="doma-crm-layout" style={layoutStyle}>
          <div style={columnStyle}>
            <section style={cardStyle}>
              <SectionHeading
                number="01"
                title="Основная информация"
                description="Базовые сведения об объекте"
              />

              <div className="doma-crm-fields" style={formGridStyle}>
                <Field label="Тип сделки">
                  <select value={dealType} disabled style={{ ...inputStyle, background: "#e8edf2", color: "#253b4d", fontWeight: 700 }}>
                    <option value="sale">Продажа</option>
                    <option value="rent">Аренда</option>
                  </select>
                </Field>
                <Field label="Название объекта" required>

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

                <Field label="Район / микрорайон">
                  <DistrictPicker value={district} onChange={setDistrict} />
                </Field>

                <Field label="Жилой комплекс (ЖК)">
                  <input value={residentialComplex} onChange={(e) => setResidentialComplex(e.target.value)} placeholder="Название ЖК" style={inputStyle} />
                </Field>
                <Field label="Метро / остановка">
                  <input value={metro} onChange={(e) => setMetro(e.target.value)} placeholder="Ближайшая станция" style={inputStyle} />
                </Field>

                <Field label="Цена" required>
                  <div style={inputWithSuffixStyle}>
                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
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

                <Field label="Источник обращения">
                  <select value={source} onChange={(e) => setSource(e.target.value)} style={inputStyle}>
                    <option>Рекомендация</option><option>Сайт</option><option>Звонок</option><option>Социальные сети</option><option>Реклама</option><option>Партнёр</option><option>Повторный клиент</option><option>Другое</option>
                  </select>
                </Field>
                <Field label="Кадастровый номер объекта">
                  <input value={cadastralNumber} onChange={(e) => setCadastralNumber(e.target.value)} placeholder="XX:XX:XXXXXXX:XXX" style={inputStyle} />
                </Field>
                <Field label="Кадастровый номер участка">
                  <input value={landCadastralNumber} onChange={(e) => setLandCadastralNumber(e.target.value)} placeholder="При наличии" style={inputStyle} />
                </Field>
                <Field label="Показывать цену за м²">
                  <span style={inlineCheckboxStyle}>
                    <input type="checkbox" checked={showPricePerSqm} onChange={(e) => setShowPricePerSqm(e.target.checked)} />
                    <span>Да, показывать клиенту</span>
                  </span>
                </Field>
                <Field label="Материнский капитал">
                  <span style={inlineCheckboxStyle}>
                    <input type="checkbox" checked={hasMaternalCapital} onChange={(e) => setHasMaternalCapital(e.target.checked)} />
                    <span>Возможна сделка с маткапиталом</span>
                  </span>
                </Field>
</div>
            </section>

            <section style={cardStyle}>
              <button
                type="button"
                aria-expanded={showCharacteristics}
                onClick={() => setShowCharacteristics((value) => !value)}
                style={{ ...sectionHeadingStyle, width: "calc(100% + 16px)", border: 0, textAlign: "left", cursor: "pointer", fontFamily: "inherit", color: "#fff" }}
              >
                <span style={sectionTitleStyle}>Характеристики</span>
                <span style={{ marginLeft: "auto", color: "#fff", fontSize: 10, whiteSpace: "nowrap" }}>
                  {showCharacteristics ? "Скрыть ▲" : "Открыть характеристики ▼"}
                </span>
              </button>

              {!showCharacteristics && (
                <div role="note" style={{ margin: "0 0 7px", padding: "6px 8px", border: "1px solid #cbd5e1", background: "#f4f7fa", color: "#586674", fontSize: 10, lineHeight: 1.4 }}>
                  ℹ️ Дополнительные характеристики скрыты. Нажмите на заголовок «Характеристики», чтобы открыть поля.
                </div>
              )}

              {showCharacteristics && (
              <div className="doma-crm-fields" style={formGridStyle}>
                <Field label="Состояние объекта">
                  <select value={condition} onChange={(e) => setCondition(e.target.value)} style={inputStyle}>
                    <option value="">Не указано</option><option value="Новое">Новое</option><option value="Отличное">Отличное</option><option value="Хорошее">Хорошее</option><option value="Удовлетворительное">Удовлетворительное</option><option value="Требует ремонта">Требует ремонта</option>
                  </select>
                </Field>
                <Field label="Высота потолков, м">
                  <input type="number" min="0" step="0.1" value={ceilingHeight} onChange={(e) => setCeilingHeight(e.target.value)} placeholder="2.7" style={inputStyle} />
                </Field>
                <Field label="Мебель">
                  <select value={furniture} onChange={(e) => setFurniture(e.target.value)} style={inputStyle}>
                    <option value="">Не указано</option><option value="С мебелью">С мебелью</option><option value="Частично меблирована">Частично меблирована</option><option value="Без мебели">Без мебели</option>
                  </select>
                </Field>
                {propertyType === "apartment" && (
                  <>
                    <Field label="Комнат">
                      <input type="number" min="0" value={rooms} onChange={(e) => setRooms(e.target.value)} placeholder="Например: 2" style={inputStyle} />
                    </Field>
                    <Field label="Жилая площадь, м²">
                      <input type="number" min="0" step="0.1" value={livingArea} onChange={(e) => setLivingArea(e.target.value)} placeholder="0" style={inputStyle} />
                    </Field>
                    <Field label="Площадь кухни, м²">
                      <input type="number" min="0" step="0.1" value={kitchenArea} onChange={(e) => setKitchenArea(e.target.value)} placeholder="0" style={inputStyle} />
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
                        <option value="Изолированная">Изолированная</option>
                        <option value="Смежно-изолированная">Смежно-изолированная</option>
                        <option value="Смежная">Смежная</option>
                      </select>
                    </Field>
                    <Field label="Санузел">
                      <select value={bathroom} onChange={(e) => setBathroom(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option>
                        <option value="Совмещенный">Совмещенный</option>
                        <option value="Раздельный">Раздельный</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                      </select>
                    </Field>
                    <Field label="Балкон / лоджия">
                      <select value={balcony} onChange={(e) => setBalcony(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option>
                        <option value="Балкон">Балкон</option>
                        <option value="Лоджия">Лоджия</option>
                        <option value="2 балкона">2 балкона</option>
                        <option value="2 лоджии">2 лоджии</option>
                        <option value="Французский балкон">Французский балкон</option>
                        <option value="Терраса">Терраса</option>
                        <option value="Застекленная лоджия">Застекленная лоджия</option>
                        <option value="Застекленный балкон">Застекленный балкон</option>
                        <option value="Эркер">Эркер</option>
                        <option value="Несколько">Несколько</option>
                      </select>
                    </Field>
                    <Field label="Ремонт">
                      <select value={renovation} onChange={(e) => setRenovation(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option>
                        <option value="Евроремонт">Евроремонт</option>
                        <option value="Косметический">Косметический</option>
                        <option value="Дизайнерский">Дизайнерский</option>
                        <option value="Требует ремонта">Требует ремонта</option>
                        <option value="Современный">Современный</option>
                        <option value="Частичный">Частичный</option>
                        <option value="На стадии ремонта">На стадии ремонта</option>
                        <option value="Предчистовая отделка">Предчистовая отделка</option>
                        <option value="Без отделки">Без отделки</option>
                        <option value="Черновая отделка">Черновая отделка</option>
                        <option value="Подготовка под чистовую отделку">Подготовка под чистовую отделку</option>
                        <option value="Чистовая отделка">Чистовая отделка</option>
                      </select>
                    </Field>
                    <Field label="Материал дома">
                      <select value={buildingMaterial} onChange={(e) => setBuildingMaterial(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option>
                        <option value="Деревянный">Деревянный</option>
                        <option value="Бревно, сруб, лафет, брус">Бревно, сруб, лафет, брус</option>
                        <option value="Кирпичный">Кирпичный</option>
                        <option value="Монолитный">Монолитный</option>
                        <option value="Панельный">Панельный</option>
                        <option value="Сэндвич-панель">Сэндвич-панель</option>
                        <option value="Строительный кирпич">Строительный кирпич</option>
                        <option value="Силикатный кирпич">Силикатный кирпич</option>
                        <option value="Пористый кирпич">Пористый кирпич</option>
                        <option value="Съемная опалубка">Съемная опалубка</option>
                        <option value="Несъемная опалубка">Несъемная опалубка</option>
                        <option value="Монолитно-кирпичный">Монолитно-кирпичный</option>
                        <option value="Металлический">Металлический</option>
                        <option value="Блочный">Блочный</option>
                        <option value="Бетон">Бетон</option>
                        <option value="Пеноблок/пенобетон">Пеноблок/пенобетон</option>
                        <option value="Газоблок/газобетон/газосиликатный">Газоблок/газобетон/газосиликатный</option>
                        <option value="Керамзитобетон">Керамзитобетон</option>
                        <option value="Каркасный">Каркасный</option>
                        <option value="Каркасно-щитовой">Каркасно-щитовой</option>
                        <option value="Каркасно-панельный">Каркасно-панельный</option>
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
                        <option value="">Не указано</option>
                        <option value="Деревянный">Деревянный</option>
                        <option value="Бревно, сруб, лафет, брус">Бревно, сруб, лафет, брус</option>
                        <option value="Кирпичный">Кирпичный</option>
                        <option value="Монолитный">Монолитный</option>
                        <option value="Панельный">Панельный</option>
                        <option value="Сэндвич-панель">Сэндвич-панель</option>
                        <option value="Строительный кирпич">Строительный кирпич</option>
                        <option value="Силикатный кирпич">Силикатный кирпич</option>
                        <option value="Пористый кирпич">Пористый кирпич</option>
                        <option value="Съемная опалубка">Съемная опалубка</option>
                        <option value="Несъемная опалубка">Несъемная опалубка</option>
                        <option value="Монолитно-кирпичный">Монолитно-кирпичный</option>
                        <option value="Металлический">Металлический</option>
                        <option value="Блочный">Блочный</option>
                        <option value="Бетон">Бетон</option>
                        <option value="Пеноблок/пенобетон">Пеноблок/пенобетон</option>
                        <option value="Газоблок/газобетон/газосиликатный">Газоблок/газобетон/газосиликатный</option>
                        <option value="Керамзитобетон">Керамзитобетон</option>
                        <option value="Каркасный">Каркасный</option>
                        <option value="Каркасно-щитовой">Каркасно-щитовой</option>
                        <option value="Каркасно-панельный">Каркасно-панельный</option>
                      </select>
                    </Field>
                    <Field label="Отопление">
                      <select value={heating} onChange={(e) => setHeating(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option><option value="gas">Газовое</option><option value="electric">Электрическое</option><option value="solid_fuel">Твердотопливное</option><option value="central">Центральное</option>
                      </select>
                    </Field>
                    <Field label="Санузел">
                      <select value={bathroom} onChange={(e) => setBathroom(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option>
                        <option value="Совмещенный">Совмещенный</option>
                        <option value="Раздельный">Раздельный</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
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
                        <option value="">Не указано</option>
                        <option value="Евроремонт">Евроремонт</option>
                        <option value="Косметический">Косметический</option>
                        <option value="Дизайнерский">Дизайнерский</option>
                        <option value="Требует ремонта">Требует ремонта</option>
                        <option value="Современный">Современный</option>
                        <option value="Частичный">Частичный</option>
                        <option value="На стадии ремонта">На стадии ремонта</option>
                        <option value="Предчистовая отделка">Предчистовая отделка</option>
                        <option value="Без отделки">Без отделки</option>
                        <option value="Черновая отделка">Черновая отделка</option>
                        <option value="Подготовка под чистовую отделку">Подготовка под чистовую отделку</option>
                        <option value="Чистовая отделка">Чистовая отделка</option>
                      </select>
                    </Field>
                    <Field label="Материал здания">
                      <select value={buildingMaterial} onChange={(e) => setBuildingMaterial(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option>
                        <option value="Деревянный">Деревянный</option>
                        <option value="Бревно, сруб, лафет, брус">Бревно, сруб, лафет, брус</option>
                        <option value="Кирпичный">Кирпичный</option>
                        <option value="Монолитный">Монолитный</option>
                        <option value="Панельный">Панельный</option>
                        <option value="Сэндвич-панель">Сэндвич-панель</option>
                        <option value="Строительный кирпич">Строительный кирпич</option>
                        <option value="Силикатный кирпич">Силикатный кирпич</option>
                        <option value="Пористый кирпич">Пористый кирпич</option>
                        <option value="Съемная опалубка">Съемная опалубка</option>
                        <option value="Несъемная опалубка">Несъемная опалубка</option>
                        <option value="Монолитно-кирпичный">Монолитно-кирпичный</option>
                        <option value="Металлический">Металлический</option>
                        <option value="Блочный">Блочный</option>
                        <option value="Бетон">Бетон</option>
                        <option value="Пеноблок/пенобетон">Пеноблок/пенобетон</option>
                        <option value="Газоблок/газобетон/газосиликатный">Газоблок/газобетон/газосиликатный</option>
                        <option value="Керамзитобетон">Керамзитобетон</option>
                        <option value="Каркасный">Каркасный</option>
                        <option value="Каркасно-щитовой">Каркасно-щитовой</option>
                        <option value="Каркасно-панельный">Каркасно-панельный</option>
                      </select>
                    </Field>
                    <Field label="Санузел">
                      <select value={bathroom} onChange={(e) => setBathroom(e.target.value)} style={inputStyle}>
                        <option value="">Не указано</option>
                        <option value="Совмещенный">Совмещенный</option>
                        <option value="Раздельный">Раздельный</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
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
                        <option value="">Не указано</option>
                        <option value="Деревянный">Деревянный</option>
                        <option value="Бревно, сруб, лафет, брус">Бревно, сруб, лафет, брус</option>
                        <option value="Кирпичный">Кирпичный</option>
                        <option value="Монолитный">Монолитный</option>
                        <option value="Панельный">Панельный</option>
                        <option value="Сэндвич-панель">Сэндвич-панель</option>
                        <option value="Строительный кирпич">Строительный кирпич</option>
                        <option value="Силикатный кирпич">Силикатный кирпич</option>
                        <option value="Пористый кирпич">Пористый кирпич</option>
                        <option value="Съемная опалубка">Съемная опалубка</option>
                        <option value="Несъемная опалубка">Несъемная опалубка</option>
                        <option value="Монолитно-кирпичный">Монолитно-кирпичный</option>
                        <option value="Металлический">Металлический</option>
                        <option value="Блочный">Блочный</option>
                        <option value="Бетон">Бетон</option>
                        <option value="Пеноблок/пенобетон">Пеноблок/пенобетон</option>
                        <option value="Газоблок/газобетон/газосиликатный">Газоблок/газобетон/газосиликатный</option>
                        <option value="Керамзитобетон">Керамзитобетон</option>
                        <option value="Каркасный">Каркасный</option>
                        <option value="Каркасно-щитовой">Каркасно-щитовой</option>
                        <option value="Каркасно-панельный">Каркасно-панельный</option>
                      </select>
                    </Field>
                    <Field label="Год постройки">
                      <input type="number" min="0" value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} placeholder="Например: 2018" style={inputStyle} />
                    </Field>
                  </>
                )}
              </div>
              )}
            </section>
            <section style={cardStyle}>
              <SectionHeading
                number="03"
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
                number="04"
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
                        alt={photo.name}
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

              <div className="doma-crm-fields" style={formGridStyle}>
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
                  ["Свободен", "Объект доступен для продажи"],
                  ["Бронь", "Есть временная договорённость"],
                  ["Задаток", "Получен задаток"],
                  ["Продан", "Сделка завершена"],
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


            <section style={cardStyle}>
              <SectionHeading
                number="07"
                title="Карта адресов"
                description="Одна карта с двумя метками: реальный и рекламный адрес"
              />
              <div className="doma-crm-fields" style={formGridStyle}>
                <Field label="Реальный адрес" required full>
                  <div style={privateFieldWrapStyle}>
                    <input
                      value={realAddress}
                      onChange={(e) => setRealAddress(e.target.value)}
                      placeholder="Полный фактический адрес"
                      style={{ ...inputStyle, borderColor: "#fecaca", paddingRight: 125 }}
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
                      style={{ ...inputStyle, borderColor: "#bbf7d0", paddingRight: 145 }}
                    />
                    <span style={publicTagStyle}>ВИДЕН КЛИЕНТУ</span>
                  </div>
                </Field>
              </div>
              <AddressMap
                realAddress={realAddress}
                publicAddress={publicAddress}
                onRealAddressChange={setRealAddress}
                onPublicAddressChange={setPublicAddress}
              />
            </section>
          </div>

          <aside className="doma-crm-reference" style={referencePanelStyle}>
            <button
              type="button"
              aria-expanded={showReferenceSummary}
              onClick={() => setShowReferenceSummary((value) => !value)}
              style={{ ...referencePanelHeaderStyle, display: "block", width: "calc(100% + 12px)", border: 0, textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}
            >
              Сводка объекта {showReferenceSummary ? "−" : "+"}
            </button>
            {showReferenceSummary && (
            <>
            <table style={referenceTableStyle}>
              <tbody>
                {[
                  ["Тип объекта", `${propertyTypeLabels[propertyType] ?? "Недвижимость"} — ${currentSubtypes.find((item) => item.value === propertySubtype)?.label ?? propertySubtype}`],
                  ["Цена", price ? `${Number(price).toLocaleString("ru-RU")} ₽` : "—"],
                  ["Цена за м²", price && area && Number(area) > 0 ? `${Math.round(Number(price) / Number(area)).toLocaleString("ru-RU")} ₽` : "—"],
                  ["Общая площадь", area ? `${area} м²` : "—"],
                  ["Жилая площадь", livingArea ? `${livingArea} м²` : "—"],
                  ["Площадь кухни", kitchenArea ? `${kitchenArea} м²` : "—"],
                  ["Комнат", rooms || "—"],
                  ["Этаж", floor || "—"],
                  ["Этажность дома", totalFloors || "—"],
                  ["Год постройки", yearBuilt || "—"],
                  ["Материал дома", buildingMaterial || "—"],
                  ["Санузел", bathroom || "—"],
                  ["Балкон / лоджия", balcony || "—"],
                  ["Ремонт", renovation || "—"],
                  ["Планировка", roomLayout || "—"],
                  ["Состояние", condition || "—"],
                  ["Высота потолков", ceilingHeight ? `${ceilingHeight} м` : "—"],
                  ["Мебель", furniture || "—"],
                  ["Отопление", heating || "—"],
                  ["Площадь участка", plotArea ? `${plotArea} сот.` : "—"],
                  ["Длина участка", plotLength ? `${plotLength} м` : "—"],
                  ["Ширина участка", plotWidth ? `${plotWidth} м` : "—"],
                  ["Фасад участка", frontage ? `${frontage} м` : "—"],
                  ["Назначение земли", landPurpose || "—"],
                  ["Ограждение", fenced || "—"],
                  ["Терраса", terrace ? "Есть" : "Нет / не указано"],
                  ["Баня", bathhouse ? "Есть" : "Нет / не указано"],
                  ["Сауна", sauna ? "Есть" : "Нет / не указано"],
                  ["Бассейн", pool ? "Есть" : "Нет / не указано"],
                  ["Гараж", garage ? "Есть" : "Нет / не указано"],
                  ["Газ", gas ? "Есть" : "Нет / не указано"],
                  ["Вода", water ? "Есть" : "Нет / не указано"],
                  ["Электричество", electricity ? "Есть" : "Нет / не указано"],
                  ["Канализация", sewerage ? "Есть" : "Нет / не указано"],
                  ["Жилой комплекс", residentialComplex || "—"],
                  ["Микрорайон", district || "—"],
                  ["Метро / остановка", metro || "—"],
                  ["Источник обращения", source || "—"],
                  ["Материнский капитал", hasMaternalCapital ? "Возможен" : "Нет / не указано"],
                  ["Цена за м² на сайте", showPricePerSqm ? "Показывать" : "Не показывать"],
                  ["Кадастровый номер объекта", cadastralNumber || "—"],
                  ["Кадастровый номер участка", landCadastralNumber || "—"],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td style={referenceLabelCellStyle}>{label}</td>
                    <td style={referenceValueCellStyle}>{String(value || "—")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={referencePanelFooterStyle}>Значения обновляются при заполнении формы.</div>
            </>
            )}
          </aside>
        </section>

        <footer style={footerStyle}>
          <div>
            {savedId ? (
              <div style={savedMessageStyle}>✓ Объект №{savedId} сохранён</div>
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
              {isSaving ? "Сохранение..." : editingPropertyId !== null ? "Сохранить изменения" : "Сохранить объект"}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}


type DistrictNode = { label: string; children?: DistrictNode[] };

// Справочник по видимым районам и микрорайонам с предоставленных скриншотов.
const krasnodarDistricts: DistrictNode[] = [
  { label: "Центральный", children: [
    { label: "мкр Центральный" },
    { label: "микрорайон Центр Аврора" },
    { label: "микрорайон Центр Исторический" },
    { label: "мкр Кожзавод" },
    { label: "мкр Город Городов" },
    { label: "СНТ Урожай" },
  ]},
  { label: "Фестивальный", children: [
    { label: "Фестивальный мкр" },
    { label: "мкр 9-й километр" },
    { label: "мкр Авиагородок" },
  ]},
  { label: "мкр Юбилейный", children: [
    { label: "мкр Сельскохозяйственный Институт" },
    { label: "мкр Юбилейный" },
    { label: "жилой городок Аграрного Университета" },
    { label: "ЖК Виктория" },
    { label: "ЖК Новый Город" },
  ]},
  { label: "Западный" },
  { label: "Прикубанский" },
  { label: "Карасунский" },
  { label: "Славянский" },
  { label: "Немецкая деревня" },
  { label: "ЭНКА" },
  { label: "Северный" },
  { label: "Витаминкомбинат" },
  { label: "Ростовское шоссе дачи" },
  { label: "п. Российский" },
  { label: "п. Индустриальный" },
  { label: "п. Победитель" },
  { label: "п. Дружелюбный" },
  { label: "РИП" },
  { label: "ЗИП" },
  { label: "40 лет Победы" },
  { label: "Восточно-Кругликовский" },
  { label: "Черёмушки" },
  { label: "Комсомольский" },
  { label: "Гидростроителей" },
  { label: "Пашковский" },
  { label: "п. Знаменский" },
  { label: "х. Ленина" },
  { label: "ст. Елизаветинская" },
  { label: "СТ Аргон" },
  { label: "СТ Янтарь" },
  { label: "РМЗ" },
  { label: "Музыкальный микрорайон" },
  { label: "Другой район" },
];

function DistrictPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string[]>(["Центральный", "Фестивальный", "мкр Юбилейный"]);
  const query = search.trim().toLocaleLowerCase("ru-RU");
  const matches = (node: DistrictNode): boolean =>
    !query ||
    node.label.toLocaleLowerCase("ru-RU").includes(query) ||
    Boolean(node.children?.some(matches));

  function renderNodes(nodes: DistrictNode[], depth = 0): React.ReactNode {
    return nodes.filter(matches).map((node) => {
      const hasChildren = Boolean(node.children?.length);
      const isExpanded = expanded.includes(node.label) || Boolean(query);
      const selected = value === node.label;
      return (
        <div key={`${depth}-${node.label}`}>
          <div style={{ ...districtTreeRowStyle, paddingLeft: 8 + depth * 20, background: selected ? "#fff1f2" : "#fff" }}>
            {hasChildren ? (
              <button
                type="button"
                aria-label={isExpanded ? `Свернуть ${node.label}` : `Развернуть ${node.label}`}
                onClick={() => setExpanded((current) =>
                  isExpanded ? current.filter((item) => item !== node.label) : [...current, node.label]
                )}
                style={districtExpandButtonStyle}
              >
                {isExpanded ? "−" : "+"}
              </button>
            ) : <span style={districtExpandSpacerStyle} />}
            <input
              type="checkbox"
              checked={selected}
              onChange={() => { onChange(selected ? "" : node.label); setOpen(false); setSearch(""); }}
              aria-label={`Выбрать ${node.label}`}
              style={{ accentColor: "#dc2626", width: 15, height: 15, flex: "0 0 auto" }}
            />
            <button
              type="button"
              onClick={() => {
                if (hasChildren) {
                  setExpanded((current) => isExpanded ? current.filter((item) => item !== node.label) : [...current, node.label]);
                } else {
                  onChange(node.label);
                  setOpen(false);
                  setSearch("");
                }
              }}
              style={districtNodeLabelStyle}
            >
              {node.label}
            </button>
          </div>
          {hasChildren && isExpanded && <div>{renderNodes(node.children!, depth + 1)}</div>}
        </div>
      );
    });
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        style={{ ...inputStyle, display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", cursor: "pointer", gap: 12 }}
      >
        <span style={{ color: value ? "#0f172a" : "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || "Выберите район или микрорайон"}
        </span>
        <span style={{ color: "#64748b", flex: "0 0 auto" }}>{open ? "⌃" : "⌄"}</span>
      </button>
      {open && (
        <div style={districtDropdownStyle}>
          <div style={{ padding: 10, borderBottom: "1px solid #e2e8f0", background: "#fff", position: "sticky", top: 0, zIndex: 1 }}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск района или микрорайона..."
              style={{ ...inputStyle, minHeight: 40 }}
              autoFocus
            />
            <div style={{ marginTop: 7, fontSize: 11, color: "#64748b" }}>
              Выберите один пункт. Нажмите +, чтобы раскрыть вложенные микрорайоны.
            </div>
          </div>
          <div>{renderNodes(krasnodarDistricts)}</div>
        </div>
      )}
      {value && <button type="button" onClick={() => onChange("")} style={districtClearStyle}>Сбросить выбор</button>}
    </div>
  );
}

type DomaAddressKind = "real" | "public";
type DomaLngLat = [number, number];

declare global {
  interface Window {
    ymaps3?: any;
  }
}

let domaCrmYmapsPromise: Promise<any> | null = null;

async function loadDomaCrmYmaps(): Promise<any> {
  if (typeof window === "undefined") throw new Error("Яндекс.Карты доступны только в браузере.");
  if (window.ymaps3) {
    await window.ymaps3.ready;
    return window.ymaps3;
  }
  if (domaCrmYmapsPromise) return domaCrmYmapsPromise;

  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
  if (!apiKey) throw new Error("Не найден NEXT_PUBLIC_YANDEX_MAPS_API_KEY.");

  domaCrmYmapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-yandex-maps="true"]') as HTMLScriptElement | null;
    const script = existingScript ?? document.createElement("script");
    const handleLoad = async () => {
      try {
        if (!window.ymaps3) throw new Error("Яндекс.Карты не инициализировались после загрузки API.");
        await window.ymaps3.ready;
        resolve(window.ymaps3);
      } catch (error) {
        reject(error);
      }
    };
    const handleError = () => reject(new Error("Не удалось загрузить API Яндекс.Карт. Проверьте ключ и ограничения домена."));

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    if (!existingScript) {
      script.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`;
      script.async = true;
      script.dataset.yandexMaps = "true";
      document.head.appendChild(script);
    } else if (window.ymaps3) {
      void handleLoad();
    }
  });

  return domaCrmYmapsPromise;
}

function isDomaLngLat(value: unknown): value is DomaLngLat {
  return Array.isArray(value) && value.length === 2 && Number.isFinite(Number(value[0])) && Number.isFinite(Number(value[1]));
}

function AddressMap({
  realAddress,
  publicAddress,
  onRealAddressChange,
  onPublicAddressChange,
}: {
  realAddress: string;
  publicAddress: string;
  onRealAddressChange: (value: string) => void;
  onPublicAddressChange: (value: string) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<DomaAddressKind, any>>({ real: null, public: null });
  const coordinatesRef = useRef<Record<DomaAddressKind, DomaLngLat>>({
    real: [38.9769, 45.0355],
    public: [38.9822, 45.0380],
  });
  const latestPropsRef = useRef({ onRealAddressChange, onPublicAddressChange });
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">("loading");
  const [mapError, setMapError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mapNotice, setMapNotice] = useState("Перетаскивайте красную и синюю метки. После перемещения соответствующий адрес заполнится автоматически.");
  const [markerCoordinates, setMarkerCoordinates] = useState<Record<DomaAddressKind, DomaLngLat>>({
    real: [38.9769, 45.0355],
    public: [38.9822, 45.0380],
  });

  useEffect(() => {
    latestPropsRef.current = { onRealAddressChange, onPublicAddressChange };
  }, [onRealAddressChange, onPublicAddressChange]);

  const reverseGeocodeMarker = async (kind: DomaAddressKind, coordinates: DomaLngLat) => {
    const [longitude, latitude] = coordinates;
    setMapNotice(`Определяем адрес для ${kind === "real" ? "реальной" : "рекламной"} метки…`);
    try {
      const query = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude) });
      const response = await fetch(`${API_URL}/reverse-geocode?${query.toString()}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      const formatted = typeof data?.formatted === "string" ? data.formatted.trim() : "";
      if (!response.ok || data?.found !== true || !formatted) {
        throw new Error(data?.detail || "Не удалось получить адрес по координатам.");
      }
      const setter = kind === "real"
        ? latestPropsRef.current.onRealAddressChange
        : latestPropsRef.current.onPublicAddressChange;
      setter(formatted);
      setMapNotice(`${kind === "real" ? "Реальный" : "Рекламный"} адрес обновлён по положению метки.`);
    } catch (error) {
      console.error("Ошибка обратного геокодирования DOMA:", error);
      setMapNotice("Метка перемещена, но адрес не определился. Проверьте доступность обратного геокодирования на сервере.");
    }
  };

  useEffect(() => {
    let cancelled = false;
    let map: any = null;

    async function initMap() {
      try {
        setMapStatus("loading");
        const ymaps = await loadDomaCrmYmaps();
        if (cancelled || !mapContainerRef.current) return;
        map = new ymaps.YMap(mapContainerRef.current, {
          location: { center: [38.9769, 45.0355], zoom: 12 },
          mode: "vector",
        });
        map.addChild(new ymaps.YMapDefaultSchemeLayer({}));
        map.addChild(new ymaps.YMapDefaultFeaturesLayer({}));
        mapRef.current = map;
        setMapStatus("ready");
      } catch (error) {
        console.error("Ошибка инициализации карты CRM:", error);
        if (!cancelled) {
          setMapError(error instanceof Error ? error.message : "Не удалось загрузить карту.");
          setMapStatus("error");
        }
      }
    }

    void initMap();
    return () => {
      cancelled = true;
      const currentMap = mapRef.current ?? map;
      if (currentMap) {
        (Object.keys(markersRef.current) as DomaAddressKind[]).forEach((kind) => {
          const marker = markersRef.current[kind];
          if (marker) {
            try { currentMap.removeChild(marker); } catch { /* метка уже удалена */ }
          }
          markersRef.current[kind] = null;
        });
        try { currentMap.destroy(); } catch { /* карта уже уничтожена */ }
      }
      if (mapRef.current === currentMap) mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapStatus !== "ready" || !mapRef.current) return;
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      const entries: Array<{ kind: DomaAddressKind; address: string; coordinates: DomaLngLat; resolved: boolean }> = [];
      const inputs: Array<{ kind: DomaAddressKind; address: string }> = [
        { kind: "real", address: realAddress.trim() },
        { kind: "public", address: publicAddress.trim() },
      ];

      await Promise.all(inputs.map(async ({ kind, address }) => {
        let coordinates = coordinatesRef.current[kind];
        let resolved = false;
        if (address) {
          try {
            const query = new URLSearchParams({ address: `${address}, Краснодар` });
            const response = await fetch(`${API_URL}/geocode?${query.toString()}`, { cache: "no-store" });
            const data = await response.json().catch(() => ({}));
            const longitude = Number(data?.longitude);
            const latitude = Number(data?.latitude);
            if (response.ok && data?.found === true && Number.isFinite(longitude) && Number.isFinite(latitude)) {
              coordinates = [longitude, latitude];
              resolved = true;
            }
          } catch (error) {
            console.warn(`Не удалось определить координаты адреса (${kind}):`, error);
          }
        }
        if (cancelled) return;
        coordinatesRef.current[kind] = coordinates;
        const marker = markersRef.current[kind];
        const ymaps = window.ymaps3;
        const onDragMove = (value: unknown) => {
          if (!isDomaLngLat(value)) return;
          const point: DomaLngLat = [Number(value[0]), Number(value[1])];
          coordinatesRef.current[kind] = point;
          markersRef.current[kind]?.update({ coordinates: point });
        };
        const onDragEnd = (value: unknown) => {
          if (!isDomaLngLat(value)) return;
          const point: DomaLngLat = [Number(value[0]), Number(value[1])];
          coordinatesRef.current[kind] = point;
          setMarkerCoordinates((current) => ({ ...current, [kind]: point }));
          void reverseGeocodeMarker(kind, point);
        };

        if (marker) {
          marker.update({ coordinates, draggable: true, mapFollowsOnDrag: true, onDragMove, onDragEnd });
        } else if (ymaps && mapRef.current) {
          const element = document.createElement("div");
          element.textContent = kind === "real" ? "Реальный адрес" : "Рекламный адрес";
          element.title = `Перетащите, чтобы изменить ${kind === "real" ? "реальный" : "рекламный"} адрес`;
          element.setAttribute("role", "img");
          element.setAttribute("aria-label", element.title);
          element.style.cssText = [
            "position:relative",
            "transform:translate(-50%,-100%)",
            `background:${kind === "real" ? "#dc2626" : "#2563eb"}`,
            "color:#fff",
            "border:2px solid #fff",
            "border-radius:8px 8px 8px 2px",
            "padding:6px 9px",
            "font:700 11px/1.2 Arial,sans-serif",
            "white-space:nowrap",
            "box-shadow:0 2px 7px rgba(15,23,42,.35)",
            "cursor:grab",
            "user-select:none",
          ].join(";");
          const newMarker = new ymaps.YMapMarker({
            coordinates,
            draggable: true,
            mapFollowsOnDrag: true,
            onDragMove,
            onDragEnd,
          }, element);
          mapRef.current.addChild(newMarker);
          markersRef.current[kind] = newMarker;
        }
        entries.push({ kind, address, coordinates, resolved });
      }));

      if (cancelled) return;
      setMarkerCoordinates({
        real: coordinatesRef.current.real,
        public: coordinatesRef.current.public,
      });
      setIsSearching(false);

      const resolvedEntries = entries.filter((entry) => entry.address && entry.resolved);
      const centerEntries = resolvedEntries.length
        ? resolvedEntries
        : entries.filter((entry) => entry.address).length
          ? entries.filter((entry) => entry.address)
          : entries;
      const center: DomaLngLat = centerEntries.length
        ? [
            centerEntries.reduce((sum, entry) => sum + entry.coordinates[0], 0) / centerEntries.length,
            centerEntries.reduce((sum, entry) => sum + entry.coordinates[1], 0) / centerEntries.length,
          ]
        : [38.9769, 45.0355];
      const zoom = resolvedEntries.length > 1 ? 12 : resolvedEntries.length === 1 ? 16 : 12;
      mapRef.current?.update({ location: { center, zoom, duration: 300 } });
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [realAddress, publicAddress, mapStatus]);

  const markerParam = [
    `${markerCoordinates.real[0]},${markerCoordinates.real[1]},pm2rdm`,
    `${markerCoordinates.public[0]},${markerCoordinates.public[1]},pm2blm`,
  ].join("~");
  const largeMapUrl = `https://yandex.ru/maps/?ll=${markerCoordinates.real[0]}%2C${markerCoordinates.real[1]}&z=12&pt=${markerParam}`;

  return (
    <div style={addressMapWrapStyle}>
      <div
        ref={mapContainerRef}
        role="application"
        aria-label="Карта адресов DOMA с двумя перетаскиваемыми метками"
        style={{ display: "block", width: "100%", height: 300, minHeight: 260, overflow: "hidden", borderRadius: 12, background: "#e9eef5" }}
      />
      {mapStatus === "loading" && <div style={{ ...addressMapCaptionStyle, marginTop: 0 }}>Загружаем карту Яндекса…</div>}
      {mapStatus === "error" && <div style={{ ...addressMapCaptionStyle, color: "#b91c1c" }}>Не удалось загрузить карту: {mapError}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
        <div style={addressMapCaptionStyle}>
          {isSearching ? "Определяем координаты адресов… " : ""}
          <span style={{ color: "#dc2626", fontWeight: 700 }}>Красная метка</span> — только агенту;{" "}
          <span style={{ color: "#2563eb", fontWeight: 700 }}>синяя метка</span> — рекламный адрес. {mapNotice}
        </div>
        <a href={largeMapUrl} target="_blank" rel="noreferrer" style={{ color: "#dc2626", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
          Открыть большую карту ↗
        </a>
      </div>
    </div>
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
  minHeight: "100vh", background: "#d7dadd", padding: "4px 5px 10px", color: "#20262d", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 12,
};

const shellStyle: React.CSSProperties = { width: "100%", maxWidth: "none", margin: "0 auto" };

const headerStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 5, padding: "5px 9px", minHeight: 28, background: "#0878d1", border: "1px solid #075ba8", color: "#fff" };

const eyebrowStyle: React.CSSProperties = { fontSize: 9, fontWeight: 700, letterSpacing: "0.02em", color: "#e5f2ff", marginBottom: 1 };

const titleStyle: React.CSSProperties = { margin: 0, fontSize: 15, lineHeight: 1.15, letterSpacing: "0", fontWeight: 700, color: "#fff" };

const subtitleStyle: React.CSSProperties = { margin: "2px 0 0", color: "#e5f2ff", fontSize: 10 };

const saleBadgeStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 7px", borderRadius: 2, background: "#eaf4fd", border: "1px solid #b7d8f3", color: "#075ba8", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap" };

const saleDotStyle: React.CSSProperties = { width: 6, height: 6, borderRadius: "50%", background: "#0878d1" };

const progressCardStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "7px 10px",
  marginBottom: 8,
  borderRadius: 0,
  border: "1px solid #075ba8",
  background: "#0878d1",
  color: "#ffffff",
};

const progressTitleStyle: React.CSSProperties = { fontWeight: 700, fontSize: 13, color: "#ffffff" };
const progressTextStyle: React.CSSProperties = { marginTop: 2, color: "#e2f1ff", fontSize: 11 };
const progressNumberStyle: React.CSSProperties = { fontWeight: 700, color: "#ffffff", fontSize: 11 };

const layoutStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "minmax(0, 1fr) 286px", gap: 6, alignItems: "start" };

const columnStyle: React.CSSProperties = { display: "contents" };

const cardStyle: React.CSSProperties = { gridColumn: "1", background: "#e9ebed", border: "1px solid #aeb5bc", borderRadius: 0, padding: "6px 8px", boxShadow: "none", minWidth: 0, marginBottom: 0 };

const sectionHeadingStyle: React.CSSProperties = { display: "flex", gap: 5, alignItems: "center", margin: "-6px -8px 6px", padding: "4px 7px", minHeight: 22, background: "#0878d1", borderBottom: "1px solid #075ba8" };

const sectionNumberStyle: React.CSSProperties = { display: "none" };

const sectionTitleStyle: React.CSSProperties = { margin: 0, fontSize: 12, fontWeight: 700, color: "#fff" };

const sectionDescriptionStyle: React.CSSProperties = { display: "none" };

const formGridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "5px 8px", alignItems: "start" };

const fieldStyle: React.CSSProperties = { display: "grid", gap: 2, minWidth: 0 };

const fullFieldStyle: React.CSSProperties = { ...fieldStyle, gridColumn: "1 / -1" };

const labelStyle: React.CSSProperties = { fontSize: 10, fontWeight: 600, color: "#303b46", lineHeight: 1.15 };

const requiredStyle: React.CSSProperties = { color: "#dc2626" };

const inputStyle: React.CSSProperties = { width: "100%", minHeight: 24, padding: "2px 5px", borderRadius: 1, border: "1px solid #a5adb5", background: "#fff", color: "#202a35", fontSize: 11, outline: "none", boxSizing: "border-box" };

const inputBareStyle: React.CSSProperties = { border: 0, outline: 0, flex: 1, width: "100%", background: "transparent", color: "#202a35", fontSize: 11, minHeight: 22 };

const inputWithSuffixStyle: React.CSSProperties = { display: "flex", alignItems: "center", minHeight: 24, padding: "0 5px", borderRadius: 1, border: "1px solid #a5adb5", background: "#fff" };

const suffixStyle: React.CSSProperties = { color: "#586674", fontSize: 10, fontWeight: 600 };

const districtDropdownStyle: React.CSSProperties = { position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0, zIndex: 50, maxHeight: 320, overflowY: "auto", background: "#fff", border: "1px solid #9da8b2", borderRadius: 1, boxShadow: "0 4px 10px rgba(0,0,0,.16)" };

const districtTreeRowStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, minHeight: 34, paddingRight: 10, borderBottom: "1px solid #f1f5f9" };
const districtExpandButtonStyle: React.CSSProperties = { width: 18, height: 18, padding: 0, border: "1px solid #cbd5e1", borderRadius: 3, background: "#fff", color: "#334155", fontSize: 14, lineHeight: "16px", cursor: "pointer", flex: "0 0 auto" };
const districtExpandSpacerStyle: React.CSSProperties = { display: "inline-block", width: 18, flex: "0 0 auto" };
const districtNodeLabelStyle: React.CSSProperties = { border: 0, background: "transparent", color: "#1e293b", textAlign: "left", padding: "6px 0", fontSize: 13, cursor: "pointer", flex: 1 };
const districtClearStyle: React.CSSProperties = { marginTop: 6, border: 0, background: "transparent", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 };

const addressMapWrapStyle: React.CSSProperties = {
  position: "relative",
  gridColumn: "1 / -1",
  zIndex: 1,
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  marginTop: 8,
  padding: 12,
  border: "1px solid #e2e8f0",
  borderRadius: 2,
  background: "#fff",
  boxShadow: "0 4px 12px rgba(22,42,60,.12)",
};
const addressMapCaptionStyle: React.CSSProperties = { marginTop: 7, fontSize: 11, color: "#64748b" };

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

const textareaStyle: React.CSSProperties = { width: "100%", minHeight: 82, resize: "vertical", padding: 6, borderRadius: 1, border: "1px solid #a5adb5", background: "#fff", color: "#202a35", fontSize: 11, lineHeight: 1.35, outline: "none", boxSizing: "border-box" };

const textareaSmallStyle: React.CSSProperties = { ...textareaStyle, minHeight: 58 };

const counterStyle: React.CSSProperties = {
  marginTop: 4,
  textAlign: "right",
  fontSize: 10,
  color: "#66727e",
};

const dropzoneStyle = (active: boolean): React.CSSProperties => ({ minHeight: 78, borderRadius: 1, border: `1px dashed ${active ? "#0878d1" : "#aeb5bc"}`, background: active ? "#eef7ff" : "#f4f5f6", display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "flex-start", gap: 6, padding: 8, textAlign: "left", transition: ".15s ease" });

const uploadIconStyle: React.CSSProperties = { width: 25, height: 25, display: "grid", placeItems: "center", borderRadius: 1, background: "#eaf4fd", border: "1px solid #b9d8f1", fontSize: 16, color: "#0878d1", marginBottom: 0 };

const uploadTitleStyle: React.CSSProperties = { fontWeight: 700, fontSize: 11 };

const uploadTextStyle: React.CSSProperties = { color: "#64707b", marginTop: 0, fontSize: 10 };

const uploadButtonStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", marginTop: 0, padding: "4px 8px", borderRadius: 1, background: "#0878d1", border: "1px solid #075ba8", color: "#fff", fontWeight: 700, fontSize: 10, cursor: "pointer" };

const hintStyle: React.CSSProperties = { marginTop: 0, fontSize: 9, color: "#6c7781" };

const photoGridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 6, marginTop: 7 };

const photoCardStyle: React.CSSProperties = { position: "relative", aspectRatio: "4 / 3", overflow: "hidden", borderRadius: 1, border: "1px solid #aeb5bc", background: "#e2e5e8" };

const photoImageStyle: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };

const photoOverlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: "8px 8px auto 8px",
  display: "flex",
  gap: 5,
  alignItems: "center",
};

const photoIndexStyle: React.CSSProperties = { marginRight: "auto", padding: "3px 5px", borderRadius: 1, background: "rgba(15,23,42,.78)", color: "#fff", fontSize: 9, fontWeight: 700 };

const photoActionStyle: React.CSSProperties = { width: 22, height: 22, border: 0, borderRadius: 1, background: "rgba(255,255,255,.92)", cursor: "pointer", fontWeight: 800 };

const photoActionDangerStyle: React.CSSProperties = {
  ...photoActionStyle,
  color: "#b91c1c",
};

const privateNoticeStyle: React.CSSProperties = { display: "flex", gap: 6, alignItems: "flex-start", padding: 6, borderRadius: 1, background: "#eef3f7", border: "1px solid #cbd5df", marginBottom: 6 };

const privateNoticeTitleStyle: React.CSSProperties = { fontWeight: 700, fontSize: 10 };

const privateNoticeTextStyle: React.CSSProperties = { marginTop: 2, color: "#586674", fontSize: 9 };

const statusListStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 4 };

const statusButtonStyle = (active: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 7,
  width: "100%",
  padding: "7px 8px",
  borderRadius: 2,
  border: `1px solid ${active ? "#4d91ca" : "#bfc6cc"}`,
  background: active ? "#e7f2fc" : "#ffffff",
  cursor: "pointer",
});

const statusRadioStyle = (active: boolean): React.CSSProperties => ({
  width: 12,
  height: 12,
  borderRadius: "50%",
  border: `3px solid ${active ? "#1674bb" : "#9da8b2"}`,
  background: "#ffffff",
  boxSizing: "border-box",
  flex: "0 0 auto",
});


const checklistStyle: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "6px 10px", padding: "6px 7px", border: "1px solid #bfc6cc", borderRadius: 1, background: "#f4f5f6" };

const checkItemStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 5, color: "#303b46", fontSize: 10, fontWeight: 500, cursor: "pointer" };

const inlineCheckboxStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 5, minHeight: 24, padding: "2px 5px", border: "1px solid #a5adb5", background: "#fff", boxSizing: "border-box", fontSize: 10, fontWeight: 400, cursor: "pointer" };
const referencePanelStyle: React.CSSProperties = { gridColumn: "2", gridRow: "1", minWidth: 0, background: "#e9ebed", border: "1px solid #aeb5bc", padding: "0 6px 6px", alignSelf: "start", position: "sticky", top: 6, maxHeight: "calc(100vh - 12px)", overflowY: "auto", boxSizing: "border-box" };
const referencePanelHeaderStyle: React.CSSProperties = { margin: "0 -6px 5px", padding: "5px 7px", background: "#0878d1", borderBottom: "1px solid #075ba8", color: "#fff", fontSize: 12, fontWeight: 700 };
const referenceTableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: 10, color: "#26323d" };
const referenceLabelCellStyle: React.CSSProperties = { width: "48%", padding: "3px 4px", border: "1px solid #aeb5bc", background: "#f2f3f4", verticalAlign: "top", overflowWrap: "anywhere" };
const referenceValueCellStyle: React.CSSProperties = { padding: "3px 4px", border: "1px solid #aeb5bc", background: "#fff", verticalAlign: "top", overflowWrap: "anywhere", fontWeight: 600 };
const referencePanelFooterStyle: React.CSSProperties = { marginTop: 5, fontSize: 9, color: "#65717b" };

const footerStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 5, padding: "5px 7px", borderRadius: 0, background: "#e3e6e9", border: "1px solid #aeb5bc" };

const footerActionsStyle: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 5 };

const footerHintStyle: React.CSSProperties = { fontSize: 10, color: "#586674" };

const savedMessageStyle: React.CSSProperties = { fontSize: 10, color: "#18733d", fontWeight: 700 };

const secondaryButtonStyle: React.CSSProperties = { padding: "5px 8px", borderRadius: 1, border: "1px solid #9da8b2", background: "#f8f9fa", color: "#26323d", fontSize: 10, fontWeight: 600, cursor: "pointer" };

const primaryButtonStyle: React.CSSProperties = { padding: "5px 9px", borderRadius: 1, border: "1px solid #0864ae", background: "#0878d1", color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", boxShadow: "none" };

type InlineSaleProperty = {
  id: number;
  title?: string;
  city?: string;
  district?: string;
  address?: string;
  public_address?: string;
  real_address?: string;
  price?: number | string;
  status?: string;
  image_url?: string | null;
  deal_type?: string;
  deal_type_label?: string;
  property_type?: string;
  property_type_label?: string;
  property_subtype?: string;
  property_subtype_label?: string;
  is_draft?: boolean | string | number;
  area?: number | string;
  rooms?: number | string;
  floor?: number | string | null;
  total_floors?: number | string | null;
};

type InlineSaleListResponse = {
  items: InlineSaleProperty[];
  total: number;
};

const INLINE_SALE_PAGE_SIZE = 25;
const inlineSaleTypeLabels: Record<string, string> = {
  apartment: "Квартира",
  house: "Дом",
  land: "Участок",
  commercial: "Коммерческая",
  garage: "Гараж / парковка",
};
const inlineSaleNumberFormat = new Intl.NumberFormat("ru-RU");
const inlineSaleStyles: Record<string, React.CSSProperties> = {
  panel: { marginTop: 8, marginBottom: 10, border: "1px solid #aeb7bf", background: "#f7f8f9", color: "#20262d", fontSize: 12 },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "8px 10px", background: "#e8edf2", borderBottom: "1px solid #b7c1c9" },
  title: { margin: 0, color: "#273746", fontSize: 13, fontWeight: 700 },
  subtitle: { margin: "3px 0 0", color: "#60717f", fontSize: 10 },
  btn: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, minHeight: 26, padding: "4px 8px", border: "1px solid #9eacb7", borderRadius: 2, background: "#fff", color: "#263746", fontSize: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
  blueBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, minHeight: 26, padding: "4px 8px", border: "1px solid #075ba8", borderRadius: 2, background: "#0878d1", color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
  input: { boxSizing: "border-box", width: "100%", height: 29, minWidth: 0, padding: "5px 7px", border: "1px solid #9daab5", borderRadius: 2, background: "#fff", color: "#20262d", fontSize: 11, outlineColor: "#0878d1" },
  label: { display: "block", marginBottom: 4, color: "#34495a", fontSize: 10, fontWeight: 700 },
  cell: { padding: "6px 7px", borderBottom: "1px solid #d3d9de", verticalAlign: "middle", fontSize: 10 },
};

function inlineSaleIsDraft(item: InlineSaleProperty) {
  return item.is_draft === true || String(item.is_draft).toLowerCase() === "true" || String(item.is_draft) === "1";
}

function inlineSaleAddress(item: InlineSaleProperty) {
  return [item.city, item.district, item.public_address || item.address || item.real_address]
    .filter((part) => Boolean(part && String(part).trim())).join(", ") || "Адрес не указан";
}

function inlineSaleMoney(value: InlineSaleProperty["price"]) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) && amount > 0 ? `${inlineSaleNumberFormat.format(amount)} ₽` : "—";
}

function SalePropertiesList({ refreshKey, onCreateClick, onOpenProperty, isOpening }: { refreshKey: number; onCreateClick: () => void; onOpenProperty: (id: number) => void; isOpening: boolean }) {
  const [items, setItems] = useState<InlineSaleProperty[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState<"published" | "drafts">("published");
  const [page, setPage] = useState(1);
  const [totalFromServer, setTotalFromServer] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => { setHasMounted(true); }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, propertyType, status, view]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        deal_type: "sale",
        offset: String((page - 1) * INLINE_SALE_PAGE_SIZE),
        limit: String(INLINE_SALE_PAGE_SIZE),
        is_draft: view === "drafts" ? "true" : "false",
      });
      if (propertyType !== "all") params.set("property_type", propertyType);
      if (status !== "all") params.set("status", status);
      if (debouncedSearch) params.set("search", debouncedSearch);
      try {
        const response = await fetch(`${API_URL}/properties?${params.toString()}`, { cache: "no-store" });
        if (!response.ok) throw new Error(`Сервер вернул код ${response.status}`);
        const payload: unknown = await response.json();
        if (cancelled) return;
        if (Array.isArray(payload)) {
          setItems(payload as InlineSaleProperty[]);
          setTotalFromServer(null);
        } else if (payload && typeof payload === "object" && Array.isArray((payload as InlineSaleListResponse).items)) {
          const result = payload as InlineSaleListResponse;
          setItems(result.items);
          setTotalFromServer(Number(result.total ?? result.items.length));
        } else {
          throw new Error("Сервер вернул неожиданный формат списка объектов");
        }
      } catch (caught) {
        if (cancelled) return;
        setError(caught instanceof Error ? caught.message : "Не удалось загрузить объекты");
        setItems([]);
        setTotalFromServer(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [page, debouncedSearch, propertyType, status, view, refreshCounter, refreshKey]);

  const localFiltered = useMemo(() => items.filter((item) => {
    if ((item.deal_type || "sale") !== "sale") return false;
    if (view === "drafts" ? !inlineSaleIsDraft(item) : inlineSaleIsDraft(item)) return false;
    if (propertyType !== "all" && item.property_type !== propertyType) return false;
    if (status !== "all" && (item.status || "") !== status) return false;
    if (debouncedSearch) {
      const haystack = [item.id, item.title, item.city, item.district, item.address, item.public_address, item.real_address, item.property_type_label]
        .filter(Boolean).join(" ").toLocaleLowerCase("ru-RU");
      if (!haystack.includes(debouncedSearch.toLocaleLowerCase("ru-RU"))) return false;
    }
    return true;
  }), [items, view, propertyType, status, debouncedSearch]);

  const total = totalFromServer ?? localFiltered.length;
  const maxPage = Math.max(1, Math.ceil(total / INLINE_SALE_PAGE_SIZE));
  const visible = totalFromServer === null ? localFiltered.slice((page - 1) * INLINE_SALE_PAGE_SIZE, page * INLINE_SALE_PAGE_SIZE) : localFiltered;

  async function updateListing(id: number, action: "publish" | "delete", itemTitle?: string) {
    if (busyId !== null) return;
    if (action === "delete" && !window.confirm(`Удалить объект №${id}${itemTitle ? ` «${itemTitle}»` : ""}? Это действие нельзя отменить.`)) return;
    setBusyId(id);
    try {
      const response = await fetch(action === "publish" ? `${API_URL}/properties/${id}/publish` : `${API_URL}/properties/${id}`, { method: action === "publish" ? "PUT" : "DELETE" });
      if (!response.ok) throw new Error((await response.text()) || `Сервер вернул код ${response.status}`);
      setRefreshCounter((value) => value + 1);
    } catch (caught) {
      window.alert(`Не удалось ${action === "publish" ? "опубликовать" : "удалить"} объект №${id}: ${caught instanceof Error ? caught.message : "ошибка запроса"}`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section style={inlineSaleStyles.panel} aria-label="Список объектов на продаже">
      <style>{`.doma-sale-inline-table { width:100%; border-collapse:collapse; min-width:920px; } .doma-sale-inline-table th { padding:7px; border-bottom:1px solid #b7c1c9; } .doma-sale-inline-row:hover { background:#eef6fc; } .doma-sale-inline-scroll { overflow-x:auto; width:100%; } @media(max-width:760px){.doma-sale-inline-filters{grid-template-columns:1fr 1fr!important}.doma-sale-inline-heading{align-items:flex-start!important;flex-direction:column!important}} @media(max-width:480px){.doma-sale-inline-filters{grid-template-columns:1fr!important}}`}</style>
      <div className="doma-sale-inline-heading" style={inlineSaleStyles.panelHeader}>
        <div>
          <h2 style={inlineSaleStyles.title}>Объекты на продаже</h2>
          <p style={inlineSaleStyles.subtitle}>Список расположен прямо на странице продажи — без перехода в отдельный раздел</p>
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <button type="button" onClick={() => setRefreshCounter((value) => value + 1)} disabled={hasMounted && loading} style={{ ...inlineSaleStyles.btn, opacity: hasMounted && loading ? 0.6 : 1 }}>↻ Обновить</button>
          <button type="button" onClick={onCreateClick} style={inlineSaleStyles.blueBtn}>＋ Добавить объект</button>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 5, padding: 7, borderBottom: "1px solid #d0d7dd" }}>
        <button type="button" onClick={() => setView("published")} style={{ ...inlineSaleStyles.btn, background: view === "published" ? "#e0f2e8" : "#fff", borderColor: view === "published" ? "#7cc49a" : "#9eacb7", color: view === "published" ? "#166534" : "#263746" }}>Объявления</button>
        <button type="button" onClick={() => setView("drafts")} style={{ ...inlineSaleStyles.btn, background: view === "drafts" ? "#fff2d6" : "#fff", borderColor: view === "drafts" ? "#d9ad5d" : "#9eacb7", color: view === "drafts" ? "#8a5700" : "#263746" }}>Черновики</button>
        <span style={{ marginLeft: "auto", color: "#536575", fontSize: 10 }}>Найдено: <b>{total.toLocaleString("ru-RU")}</b></span>
      </div>
      <div className="doma-sale-inline-filters" style={{ display: "grid", gridTemplateColumns: "minmax(200px,2fr) minmax(140px,1fr) minmax(130px,1fr)", gap: 7, padding: 8, borderBottom: "1px solid #d0d7dd" }}>
        <label><span style={inlineSaleStyles.label}>Поиск по ID, названию, адресу или району</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ID, ЖК, улица, район…" style={inlineSaleStyles.input} /></label>
        <label><span style={inlineSaleStyles.label}>Тип недвижимости</span><select value={propertyType} onChange={(event) => setPropertyType(event.target.value)} style={inlineSaleStyles.input}><option value="all">Все типы</option>{Object.entries(inlineSaleTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span style={inlineSaleStyles.label}>Статус</span><select value={status} onChange={(event) => setStatus(event.target.value)} style={inlineSaleStyles.input}><option value="all">Все статусы</option>{["Свободен", "Активен", "Опубликован", "Забронирован", "Продан", "Сдан", "Арендован", "Неактивен"].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      </div>
      {error && <div role="alert" style={{ padding: 9, color: "#a61b16", background: "#fff1f0", borderBottom: "1px solid #e8b4b1" }}>Не удалось загрузить список: {error}. Проверь доступность API.</div>}
      <div className="doma-sale-inline-scroll">
        <table className="doma-sale-inline-table">
          <thead><tr style={{ background: "#e6ebef", color: "#34495a", textAlign: "left", fontSize: 10, whiteSpace: "nowrap" }}><th>ID</th><th>Фото</th><th>Объект</th><th>Тип</th><th>Адрес</th><th>Площадь</th><th>Комнат</th><th>Цена</th><th>Статус</th><th>Действия</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={10} style={{ ...inlineSaleStyles.cell, textAlign: "center", padding: 22 }}>Загрузка объектов…</td></tr> : visible.length === 0 ? <tr><td colSpan={10} style={{ ...inlineSaleStyles.cell, textAlign: "center", padding: 22, color: "#536575" }}>{error ? "Нет данных для отображения" : view === "drafts" ? "Черновиков по выбранным условиям нет" : "Объектов по выбранным условиям нет"}</td></tr> : visible.map((item) => {
              const draft = inlineSaleIsDraft(item);
              const type = item.property_type_label || inlineSaleTypeLabels[item.property_type || ""] || item.property_type || "—";
              const address = inlineSaleAddress(item);
              return <tr key={item.id} className="doma-sale-inline-row">
                <td style={{ ...inlineSaleStyles.cell, color: "#536575" }}>#{item.id}</td>
                <td style={{ ...inlineSaleStyles.cell }}>
                  <button
                    type="button"
                    disabled={isOpening}
                    onClick={() => onOpenProperty(item.id)}
                    aria-label={`Открыть данные объекта №${item.id}`}
                    title="Открыть данные объекта"
                    style={{ display: "block", border: 0, background: "transparent", padding: 0, cursor: isOpening ? "wait" : "pointer", opacity: isOpening ? 0.6 : 1 }}
                  >
                    {item.image_url ? <img src={item.image_url.startsWith("http") ? item.image_url : `${API_URL}${item.image_url}`} alt={item.title || "Фото объекта"} loading="lazy" style={{ display: "block", width: 54, height: 39, objectFit: "cover", border: "1px solid #bdc7cf" }} /> : <span style={{ display: "grid", placeItems: "center", width: 54, height: 39, border: "1px solid #bdc7cf", background: "#e8edf2", color: "#80909e", fontSize: 9 }}>Нет фото</span>}
                  </button>
                </td>
                <td style={{ ...inlineSaleStyles.cell, minWidth: 150 }}><div style={{ fontWeight: 700, color: "#163e5d" }}>{item.title?.trim() || "Без названия"}</div><div style={{ color: "#667887", marginTop: 2, fontSize: 9 }}>{item.property_subtype_label || item.property_subtype || ""}</div></td>
                <td style={inlineSaleStyles.cell}>{type}</td>
                <td style={{ ...inlineSaleStyles.cell, maxWidth: 235, color: "#455866" }}>{address}</td>
                <td style={{ ...inlineSaleStyles.cell, whiteSpace: "nowrap" }}>{Number(item.area || 0) ? `${inlineSaleNumberFormat.format(Number(item.area))} м²` : "—"}</td>
                <td style={{ ...inlineSaleStyles.cell, textAlign: "center" }}>{["land", "commercial", "garage"].includes(item.property_type || "") ? "—" : Number(item.rooms || 0) || "—"}</td>
                <td style={{ ...inlineSaleStyles.cell, whiteSpace: "nowrap", fontWeight: 700, color: "#163e5d" }}>{inlineSaleMoney(item.price)}</td>
                <td style={inlineSaleStyles.cell}><span style={{ display: "inline-block", padding: "3px 5px", border: `1px solid ${draft ? "#d9ad5d" : "#7cc49a"}`, background: draft ? "#fff2d6" : "#e0f2e8", color: draft ? "#8a5700" : "#166534", whiteSpace: "nowrap" }}>{draft ? "Черновик" : item.status || "Активен"}</span></td>
                <td style={inlineSaleStyles.cell}><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}><button type="button" disabled={isOpening} onClick={() => onOpenProperty(item.id)} style={{ ...inlineSaleStyles.btn, opacity: isOpening ? 0.55 : 1 }}>{isOpening ? "Загрузка…" : "Открыть"}</button>{draft && <button type="button" disabled={busyId !== null} onClick={() => void updateListing(item.id, "publish")} style={{ ...inlineSaleStyles.blueBtn, opacity: busyId !== null ? 0.6 : 1 }}>{busyId === item.id ? "…" : "Опубликовать"}</button>}<button type="button" disabled={busyId !== null} onClick={() => void updateListing(item.id, "delete", item.title)} style={{ ...inlineSaleStyles.btn, color: "#ae2922", borderColor: "#d9a6a3", opacity: busyId !== null ? 0.6 : 1 }}>{busyId === item.id ? "…" : "Удалить"}</button></div></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      <footer style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 7, padding: 8, background: "#eef1f4", borderTop: "1px solid #c4cdd4" }}>
        <span style={{ color: "#536575", fontSize: 10 }}>Страница {page} из {maxPage} · по {INLINE_SALE_PAGE_SIZE} объектов</span>
        <div style={{ display: "flex", gap: 4 }}><button type="button" disabled={page <= 1 || loading} onClick={() => setPage(1)} style={{ ...inlineSaleStyles.btn, opacity: page <= 1 || loading ? 0.45 : 1 }}>« Первая</button><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))} style={{ ...inlineSaleStyles.btn, opacity: page <= 1 || loading ? 0.45 : 1 }}>‹ Назад</button><button type="button" disabled={page >= maxPage || loading} onClick={() => setPage((value) => Math.min(maxPage, value + 1))} style={{ ...inlineSaleStyles.btn, opacity: page >= maxPage || loading ? 0.45 : 1 }}>Вперёд ›</button><button type="button" disabled={page >= maxPage || loading} onClick={() => setPage(maxPage)} style={{ ...inlineSaleStyles.btn, opacity: page >= maxPage || loading ? 0.45 : 1 }}>Последняя »</button></div>
      </footer>
    </section>
  );
}

