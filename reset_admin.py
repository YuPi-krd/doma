import os
from getpass import getpass
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

from sqlalchemy import create_engine, text
from passlib.context import CryptContext


# Получаем URL базы из переменной окружения
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL не задана.\n"
        "В PowerShell нужно выполнить:\n"
        '$env:DATABASE_URL="ТВОЙ_EXTERNAL_DATABASE_URL_ИЗ_RENDER"'
    )

DATABASE_URL = DATABASE_URL.strip().strip('"').strip("'")

# Старый формат Render/PostgreSQL
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgres://",
        "postgresql://",
        1
    )

# -------------------------------------------------
# Добавляем SSL для внешнего подключения Render
# -------------------------------------------------

parts = urlsplit(DATABASE_URL)

query = dict(parse_qsl(parts.query))

if parts.hostname and "render.com" in parts.hostname:
    query["sslmode"] = "require"

DATABASE_URL = urlunsplit((
    parts.scheme,
    parts.netloc,
    parts.path,
    urlencode(query),
    parts.fragment,
))

print("Подключение к базе...")
print(f"Host: {parts.hostname}")
print(f"Database: {parts.path}")
print("SSL: require")
print("")

# -------------------------------------------------
# Подключение SQLAlchemy
# -------------------------------------------------

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

# -------------------------------------------------
# Получаем пользователей
# -------------------------------------------------

print("Проверяем пользователей...\n")

with engine.connect() as conn:
    result = conn.execute(
        text("""
            SELECT id, username, role
            FROM users
            ORDER BY id
        """)
    )

    users = result.fetchall()

if not users:
    print("В таблице users нет пользователей.")
    raise SystemExit

for user in users:
    print(
        f"ID: {user.id} | "
        f"Логин: {user.username} | "
        f"Роль: {user.role}"
    )

# -------------------------------------------------
# Выбираем администратора
# -------------------------------------------------

username = input(
    "\nВведите логин администратора: "
).strip()

if not username:
    raise RuntimeError("Логин не может быть пустым.")

new_password = getpass(
    "Введите новый пароль: "
)

if not new_password:
    raise RuntimeError("Пароль не может быть пустым.")

confirm_password = getpass(
    "Повторите новый пароль: "
)

if new_password != confirm_password:
    raise RuntimeError("Пароли не совпадают.")

# -------------------------------------------------
# Создаём хеш
# -------------------------------------------------

password_hash = pwd_context.hash(new_password)

# -------------------------------------------------
# Обновляем пароль
# -------------------------------------------------

with engine.begin() as conn:
    result = conn.execute(
        text("""
            UPDATE users
            SET password_hash = :password_hash
            WHERE username = :username
        """),
        {
            "password_hash": password_hash,
            "username": username,
        }
    )

    if result.rowcount == 0:
        raise RuntimeError(
            f"Пользователь '{username}' не найден."
        )

print("\n================================")
print("Пароль успешно изменён!")
print("================================")