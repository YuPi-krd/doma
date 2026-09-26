import os
from getpass import getpass
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

import psycopg2
import bcrypt


DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL не задана.\n"
        "Сначала выполни в PowerShell:\n"
        '$env:DATABASE_URL="ТВОЙ_EXTERNAL_DATABASE_URL_ИЗ_RENDER"'
    )

DATABASE_URL = DATABASE_URL.strip().strip('"').strip("'")

# Добавляем SSL для Render
parts = urlsplit(DATABASE_URL)
query = dict(parse_qsl(parts.query))
query["sslmode"] = "require"

DATABASE_URL = urlunsplit((
    parts.scheme,
    parts.netloc,
    parts.path,
    urlencode(query),
    parts.fragment,
))


print("Подключение к базе...")

conn = psycopg2.connect(
    DATABASE_URL,
    connect_timeout=15
)

print("Подключение успешно.\n")

cursor = conn.cursor()

# Показываем существующих пользователей
cursor.execute("""
    SELECT id, username, role
    FROM users
    ORDER BY id
""")

users = cursor.fetchall()

print("Пользователи в базе:")

if users:
    for user in users:
        print(
            f"ID: {user[0]} | "
            f"Логин: {user[1]} | "
            f"Роль: {user[2]}"
        )
else:
    print("Пользователей пока нет.")

print()

username = input("Введите логин администратора: ").strip()

if not username:
    raise RuntimeError("Логин не может быть пустым.")

password = getpass("Введите новый пароль: ")

if not password:
    raise RuntimeError("Пароль не может быть пустым.")

if len(password.encode("utf-8")) > 72:
    raise RuntimeError(
        "Пароль слишком длинный для bcrypt. "
        "Используй пароль до 72 байт."
    )

password_confirm = getpass("Повторите пароль: ")

if password != password_confirm:
    raise RuntimeError("Пароли не совпадают.")

# Создаём bcrypt-хеш
password_hash = bcrypt.hashpw(
    password.encode("utf-8"),
    bcrypt.gensalt()
).decode("utf-8")


# Проверяем, существует ли пользователь
cursor.execute(
    """
    SELECT id
    FROM users
    WHERE username = %s
    """,
    (username,)
)

existing_user = cursor.fetchone()


if existing_user:
    # Обновляем существующего пользователя
    cursor.execute(
        """
        UPDATE users
        SET password_hash = %s,
            role = 'admin'
        WHERE username = %s
        """,
        (password_hash, username)
    )

    print("\nСуществующий пользователь обновлён.")
    print("Пароль успешно изменён.")

else:
    # Создаём нового администратора
    cursor.execute(
        """
        INSERT INTO users (
            username,
            password_hash,
            role
        )
        VALUES (%s, %s, 'admin')
        """,
        (username, password_hash)
    )

    print("\nАдминистратор успешно создан.")


conn.commit()
cursor.close()
conn.close()

print("\nГотово.")
print(f"Логин: {username}")
print("Роль: admin")