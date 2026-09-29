"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import AddressMapPicker from "@/components/AddressMapPicker";

const API_URL =
  "https://doma-nq4u.onrender.com";

type PropertyType =
  | "apartment"
  | "house"
  | "land"
  | "commercial"
  | "garage";

const PROPERTY_TYPES: {
  value: PropertyType;
  label: string;
}[] = [
  {
    value: "apartment",
    label: "Квартира",
  },
  {
    value: "house",
    label: "Дом",
  },
  {
    value: "land",
    label: "Земельный участок",
  },
  {
    value: "commercial",
    label: "Коммерческая недвижимость",
  },
  {
    value: "garage",
    label: "Гараж",
  },
];

const SUBTYPES: Record<
  PropertyType,
  {
    value: string;
    label: string;
  }[]
> = {
  apartment: [
    {
      value: "secondary",
      label: "Вторичное жильё",
    },
    {
      value: "new_building",
      label: "Новостройка",
    },
    {
      value: "studio",
      label: "Студия",
    },
    {
      value: "1_room",
      label: "1-комнатная",
    },
    {
      value: "2_room",
      label: "2-комнатная",
    },
    {
      value: "3_room",
      label: "3-комнатная",
    },
    {
      value: "4_room",
      label: "4-комнатная",
    },
    {
      value: "5_room",
      label: "5-комнатная",
    },
    {
      value: "penthouse",
      label: "Пентхаус",
    },
  ],

  house: [
    {
      value: "house",
      label: "Дом",
    },
    {
      value: "part_of_house",
      label: "Часть дома",
    },
    {
      value: "townhouse",
      label: "Таунхаус",
    },
    {
      value: "duplex",
      label: "Дуплекс",
    },
    {
      value: "cottage",
      label: "Коттедж",
    },
    {
      value: "dacha",
      label: "Дача",
    },
  ],

  land: [
    {
      value: "izhs",
      label: "ИЖС",
    },
    {
      value: "gardening",
      label: "Садоводство",
    },
    {
      value: "commercial_land",
      label: "Коммерческая земля",
    },
    {
      value: "lph",
      label: "ЛПХ",
    },
    {
      value: "dnp",
      label: "ДНП",
    },
  ],

  commercial: [
    {
      value: "office",
      label: "Офис",
    },
    {
      value: "business",
      label: "Готовый бизнес",
    },
    {
      value: "separate_building",
      label: "Отдельное здание",
    },
    {
      value: "production",
      label: "Производственное",
    },
    {
      value: "warehouse",
      label: "Складское",
    },
    {
      value: "retail",
      label: "Торговое помещение",
    },
  ],

  garage: [
    {
      value: "garage_box",
      label: "Гаражный бокс",
    },
    {
      value: "residential_complex",
      label: "Внутри ЖК",
    },
    {
      value: "covered_parking",
      label: "Крытая парковка",
    },
    {
      value: "separate_garage",
      label: "Отдельно стоящий гараж",
    },
    {
      value: "parking",
      label: "Паркинг",
    },
  ],
};

const DEAL_TYPES = [
  {
    value: "sale",
    label: "Продажа",
  },
  {
    value: "rent",
    label: "Аренда",
  },
  {
    value: "lease",
    label: "Сдача",
  },
];

const STATUS_TYPES = [
  "Свободен",
  "Бронь",
  "Продан",
];

export default function NewPropertyPage() {
  const router = useRouter();

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    propertyType,
    setPropertyType,
  ] = useState<PropertyType>(
    "apartment"
  );

  const [
    propertySubtype,
    setPropertySubtype,
  ] = useState(
    "secondary"
  );

  const [
    dealType,
    setDealType,
  ] = useState("sale");

  const [
    price,
    setPrice,
  ] = useState("");

  const [
    area,
    setArea,
  ] = useState("");

  const [
    rooms,
    setRooms,
  ] = useState("1");

  const [
    city,
    setCity,
  ] = useState(
    "Краснодар"
  );

  const [
    district,
    setDistrict,
  ] = useState("");

  const [
    address,
    setAddress,
  ] = useState("");

  const [
    latitude,
    setLatitude,
  ] = useState<number | null>(
    null
  );

  const [
    longitude,
    setLongitude,
  ] = useState<number | null>(
    null
  );

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("Свободен");

  const [
    images,
    setImages,
  ] = useState<File[]>(
    []
  );

  const [
    previews,
    setPreviews,
  ] = useState<string[]>(
    []
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const currentSubtypes =
    useMemo(
      () =>
        SUBTYPES[
          propertyType
        ] || [],
      [propertyType]
    );

  useEffect(() => {
    const first =
      currentSubtypes[0];

    if (
      !currentSubtypes.some(
        (item) =>
          item.value ===
          propertySubtype
      )
    ) {
      setPropertySubtype(
        first?.value ||
          ""
      );
    }
  }, [
    propertyType,
    currentSubtypes,
    propertySubtype,
  ]);

  function handleTypeChange(
    value: PropertyType
  ) {
    setPropertyType(value);

    setPropertySubtype(
      SUBTYPES[value][0]
        ?.value || ""
    );
  }

  function handleImages(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ||
        []
    );

    if (!files.length) {
      return;
    }

    const validFiles =
      files.filter((file) =>
        file.type.startsWith(
          "image/"
        )
      );

    setImages(
      validFiles
    );

    const nextPreviews =
      validFiles.map(
        (file) =>
          URL.createObjectURL(
            file
          )
      );

    previews.forEach(
      (url) =>
        URL.revokeObjectURL(
          url
        )
    );

    setPreviews(
      nextPreviews
    );
  }

  function removeImage(
    index: number
  ) {
    const nextImages =
      images.filter(
        (_, i) =>
          i !== index
      );

    const nextPreviews =
      previews.filter(
        (_, i) =>
          i !== index
      );

    if (
      previews[index]
    ) {
      URL.revokeObjectURL(
        previews[index]
      );
    }

    setImages(
      nextImages
    );

    setPreviews(
      nextPreviews
    );
  }

  async function uploadExtraImages(
    propertyId: number,
    files: File[]
  ) {
    for (
      const file of files
    ) {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          `${API_URL}/properties/${propertyId}/images`,
          {
            method: "POST",
            body: formData,
          }
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(
              () => ({})
            );

        throw new Error(
          data?.detail ||
            "Не удалось загрузить фотографию."
        );
      }
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!title.trim()) {
        throw new Error(
          "Введите название объекта."
        );
      }

      if (!price) {
        throw new Error(
          "Укажите цену."
        );
      }

      if (!area) {
        throw new Error(
          "Укажите площадь."
        );
      }

      if (!address.trim()) {
        throw new Error(
          "Укажите адрес."
        );
      }

      const formData =
        new FormData();

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "price",
        price
      );

      formData.append(
        "area",
        area
      );

      formData.append(
        "rooms",
        rooms
      );

      formData.append(
        "city",
        city.trim()
      );

      formData.append(
        "district",
        district.trim()
      );

      formData.append(
        "address",
        address.trim()
      );

      formData.append(
        "property_type",
        propertyType
      );

      formData.append(
        "property_subtype",
        propertySubtype
      );

      formData.append(
        "deal_type",
        dealType
      );

      formData.append(
        "status",
        status
      );

      if (
        latitude !== null
      ) {
        formData.append(
          "latitude",
          String(latitude)
        );
      }

      if (
        longitude !== null
      ) {
        formData.append(
          "longitude",
          String(longitude)
        );
      }

      /*
       * Первое фото становится
       * основной фотографией объекта.
       */

      if (images[0]) {
        formData.append(
          "image",
          images[0]
        );
      }

      const token =
        localStorage.getItem(
          "token"
        );

      const headers: HeadersInit =
        {};

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      const response =
        await fetch(
          `${API_URL}/properties`,
          {
            method: "POST",
            headers,
            body: formData,
          }
        );

      const data =
        await response
          .json()
          .catch(
            () => ({})
          );

      if (!response.ok) {
        throw new Error(
          typeof data?.detail ===
            "string"
            ? data.detail
            : "Не удалось создать объект."
        );
      }

      const propertyId =
        Number(
          data?.id
        );

      /*
       * Остальные фотографии
       * записываем в property_images.
       */

      if (
        propertyId &&
        images.length > 1
      ) {
        await uploadExtraImages(
          propertyId,
          images.slice(1)
        );
      }

      setSuccess(
        "Объект успешно создан."
      );

      setTimeout(() => {
        router.push(
          `/admin/properties/${propertyId}`
        );

        router.refresh();
      }, 500);
    } catch (
      submitError
    ) {
      console.error(
        submitError
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Не удалось создать объект."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">

      <div className="container">

        <div className="header">
          <div>
            <div className="eyebrow">
              АДМИН-ПАНЕЛЬ
            </div>

            <h1>
              Новый объект
            </h1>

            <p>
              Добавьте недвижимость
              в каталог DOMA
            </p>
          </div>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="form"
        >

          <section className="card">
            <h2>
              Основные параметры
            </h2>

            <div className="grid">

              <div className="field">
                <label>
                  Название объекта
                </label>

                <input
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                  placeholder="Например: ЖК Самолёт"
                  required
                />
              </div>

              <div className="field">
                <label>
                  Операция
                </label>

                <select
                  value={dealType}
                  onChange={(e) =>
                    setDealType(
                      e.target.value
                    )
                  }
                >
                  {DEAL_TYPES.map(
                    (item) => (
                      <option
                        key={
                          item.value
                        }
                        value={
                          item.value
                        }
                      >
                        {
                          item.label
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="field">
                <label>
                  Тип недвижимости
                </label>

                <select
                  value={
                    propertyType
                  }
                  onChange={(e) =>
                    handleTypeChange(
                      e.target.value as PropertyType
                    )
                  }
                >
                  {PROPERTY_TYPES.map(
                    (item) => (
                      <option
                        key={
                          item.value
                        }
                        value={
                          item.value
                        }
                      >
                        {
                          item.label
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="field">
                <label>
                  Подтип недвижимости
                </label>

                <select
                  value={
                    propertySubtype
                  }
                  onChange={(e) =>
                    setPropertySubtype(
                      e.target.value
                    )
                  }
                >
                  {currentSubtypes.map(
                    (item) => (
                      <option
                        key={
                          item.value
                        }
                        value={
                          item.value
                        }
                      >
                        {
                          item.label
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="field">
                <label>
                  Цена, ₽
                </label>

                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="field">
                <label>
                  Площадь, м²
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={area}
                  onChange={(e) =>
                    setArea(
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="field">
                <label>
                  Количество комнат
                </label>

                <input
                  type="number"
                  min="0"
                  value={rooms}
                  onChange={(e) =>
                    setRooms(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="field">
                <label>
                  Статус
                </label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value
                    )
                  }
                >
                  {STATUS_TYPES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

            </div>

            <div className="preview-box">
              <span>
                Объявление попадёт в раздел
              </span>

              <strong>
                {
                  DEAL_TYPES.find(
                    (item) =>
                      item.value ===
                      dealType
                  )?.label
                }
                {" → "}
                {
                  PROPERTY_TYPES.find(
                    (item) =>
                      item.value ===
                      propertyType
                  )?.label
                }
                {" → "}
                {
                  currentSubtypes.find(
                    (item) =>
                      item.value ===
                      propertySubtype
                  )?.label
                }
              </strong>

              <small>
                /catalog/
                {
                  dealType
                }/
                {
                  propertyType ===
                  "apartment"
                    ? "apartments"
                    : propertyType ===
                      "house"
                    ? "houses"
                    : propertyType ===
                      "land"
                    ? "land"
                    : propertyType ===
                      "commercial"
                    ? "commercial"
                    : "garages"
                }/
                {
                  propertySubtype
                }
              </small>
            </div>
          </section>

          <section className="card">
            <h2>
              Расположение
            </h2>

            <div className="grid">

              <div className="field">
                <label>
                  Город
                </label>

                <input
                  value={city}
                  onChange={(e) =>
                    setCity(
                      e.target.value
                    )
                  }
                  placeholder="Краснодар"
                  required
                />
              </div>

              <div className="field">
                <label>
                  Район
                </label>

                <input
                  value={district}
                  onChange={(e) =>
                    setDistrict(
                      e.target.value
                    )
                  }
                  placeholder="Центральный"
                />
              </div>

            </div>

            <div className="address-block">

              <label>
                Адрес
              </label>

              <AddressMapPicker
                city={city}
                address={address}
                latitude={latitude}
                longitude={longitude}
                onAddressChange={
                  setAddress
                }
                onCoordinatesChange={(
                  nextLatitude,
                  nextLongitude
                ) => {
                  setLatitude(
                    nextLatitude
                  );

                  setLongitude(
                    nextLongitude
                  );
                }}
              />

            </div>
          </section>

          <section className="card">
            <h2>
              Фотографии
            </h2>

            <p className="hint">
              Можно выбрать сразу
              несколько фотографий
              с компьютера.
              Первая фотография
              станет основной.
            </p>

            <label className="upload">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={
                  handleImages
                }
              />

              <span className="upload-icon">
                +
              </span>

              <strong>
                Добавить фотографии
              </strong>

              <small>
                JPG, JPEG, PNG,
                WEBP
              </small>
            </label>

            {previews.length >
              0 && (
              <div className="photos">

                {previews.map(
                  (
                    preview,
                    index
                  ) => (
                    <div
                      className="photo"
                      key={
                        preview
                      }
                    >
                      <img
                        src={
                          preview
                        }
                        alt={`Фото ${
                          index +
                          1
                        }`}
                      />

                      {index ===
                        0 && (
                        <span className="main-photo">
                          Основное
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(
                            index
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  )
                )}

              </div>
            )}
          </section>

          <section className="card">
            <h2>
              Описание
            </h2>

            <textarea
              rows={8}
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Описание объекта..."
            />
          </section>

          {error && (
            <div className="alert error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert success">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="save"
            disabled={loading}
          >
            {loading
              ? "Сохраняем..."
              : "💾 Создать объект"}
          </button>

        </form>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding:
            45px
            20px
            80px;
          background: #f5f7fa;
        }

        .container {
          width: 100%;
          max-width: 1050px;
          margin: 0 auto;
        }

        .header {
          margin-bottom: 28px;
        }

        .eyebrow {
          color: #ef4444;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        h1 {
          margin:
            8px 0
            8px;
          color: #101828;
          font-size:
            clamp(
              38px,
              5vw,
              56px
            );
          line-height: 1;
          letter-spacing:
            -0.04em;
        }

        .header p {
          margin: 0;
          color: #667085;
          font-size: 15px;
        }

        .form {
          display: grid;
          gap: 20px;
        }

        .card {
          padding: 30px;
          border:
            1px solid
            #e4e7ec;
          border-radius: 24px;
          background: #fff;
          box-shadow:
            0
            8px
            30px
            rgba(
              16,
              24,
              40,
              0.05
            );
        }

        h2 {
          margin:
            0 0
            24px;
          color: #101828;
          font-size: 22px;
        }

        .grid {
          display: grid;
          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );
          gap: 18px;
        }

        .field {
          min-width: 0;
        }

        .field label,
        .address-block > label {
          display: block;
          margin-bottom: 8px;
          color: #344054;
          font-size: 13px;
          font-weight: 700;
        }

        input,
        select,
        textarea {
          width: 100%;
          box-sizing: border-box;

          border:
            1px solid
            #d0d5dd;

          border-radius: 13px;

          padding:
            13px
            14px;

          background: #fff;
          color: #101828;

          font-size: 14px;
          outline: none;
        }

        input,
        select {
          height: 48px;
        }

        textarea {
          resize: vertical;
          min-height: 170px;
          line-height: 1.6;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #ef4444;
          box-shadow:
            0
            0
            0
            3px
            rgba(
              239,
              68,
              68,
              0.08
            );
        }

        .preview-box {
          display: grid;
          gap: 6px;

          margin-top: 22px;
          padding: 18px;

          border-radius: 16px;
          background: #f8fafc;
          border:
            1px solid
            #e5e7eb;
        }

        .preview-box span {
          color: #667085;
          font-size: 12px;
        }

        .preview-box strong {
          color: #101828;
          font-size: 16px;
        }

        .preview-box small {
          color: #98a2b3;
          font-size: 12px;
        }

        .address-block {
          margin-top: 20px;
        }

        .hint {
          margin:
            -10px 0
            20px;
          color: #667085;
          font-size: 13px;
          line-height: 1.6;
        }

        .upload {
          min-height: 190px;

          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;

          gap: 7px;

          border:
            2px dashed
            #d0d5dd;

          border-radius: 18px;

          background: #fafafa;

          cursor: pointer;
          transition:
            0.2s
            ease;
        }

        .upload:hover {
          border-color: #ef4444;
          background: #fffafa;
        }

        .upload input {
          display: none;
        }

        .upload-icon {
          width: 48px;
          height: 48px;

          display: grid;
          place-items: center;

          border-radius: 50%;

          background: #fee2e2;
          color: #ef4444;

          font-size: 28px;
        }

        .upload strong {
          color: #344054;
          font-size: 15px;
        }

        .upload small {
          color: #98a2b3;
        }

        .photos {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fill,
              minmax(
                160px,
                1fr
              )
            );
          gap: 14px;
          margin-top: 18px;
        }

        .photo {
          position: relative;
          height: 150px;
          overflow: hidden;
          border-radius: 16px;
          background: #f2f4f7;
        }

        .photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo button {
          position: absolute;
          top: 8px;
          right: 8px;

          width: 30px;
          height: 30px;

          border: 0;
          border-radius: 50%;

          background:
            rgba(
              0,
              0,
              0,
              0.6
            );

          color: #fff;
          cursor: pointer;
          font-size: 20px;
        }

        .main-photo {
          position: absolute;
          left: 8px;
          bottom: 8px;

          padding:
            5px
            8px;

          border-radius: 8px;

          background: #ef4444;
          color: #fff;

          font-size: 11px;
          font-weight: 700;
        }

        .alert {
          padding:
            14px
            16px;
          border-radius: 13px;
          font-size: 14px;
        }

        .alert.error {
          background: #fee2e2;
          color: #991b1b;
        }

        .alert.success {
          background: #dcfce7;
          color: #166534;
        }

        .save {
          width: 100%;
          min-height: 56px;

          border: 0;
          border-radius: 16px;

          background: #ef4444;
          color: #fff;

          font-size: 16px;
          font-weight: 800;

          cursor: pointer;
          transition:
            0.2s
            ease;
        }

        .save:hover:not(
          :disabled
        ) {
          background: #dc3741;
          transform:
            translateY(-1px);
        }

        .save:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        @media (max-width: 700px) {
          .page {
            padding:
              25px
              14px
              50px;
          }

          .card {
            padding: 20px;
            border-radius: 18px;
          }

          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}