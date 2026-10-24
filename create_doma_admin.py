"""Create the first DOMA administrator in a fresh Neon PostgreSQL database.

Run from the backend project root, next to the `app` directory:
    python create_doma_admin_v2.py

The connection URL and password are requested through hidden input and are never
printed. Use the DIRECT Neon connection URL (disable Connection pooling in Neon).
"""
from __future__ import annotations

import getpass
import io
import os
import sys
import time
from contextlib import redirect_stdout, redirect_stderr
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse


def read_database_url() -> str:
    value = getpass.getpass("Paste the DIRECT Neon PostgreSQL connection string (input hidden): ").strip()
    if not value:
        raise ValueError("DATABASE_URL was empty.")
    if value.startswith("postgres://"):
        value = "postgresql://" + value[len("postgres://"):]

    parsed = urlparse(value)
    if parsed.scheme not in {"postgresql", "postgresql+psycopg2"} or not parsed.hostname:
        raise ValueError("The connection string must be a PostgreSQL URL from Neon.")
    if "-pooler." in parsed.hostname:
        raise ValueError("This script needs Neon's DIRECT connection URL. In Neon Connect, turn Connection pooling OFF and copy the new URL.")

    query_items = parse_qsl(parsed.query, keep_blank_values=True)
    query = dict(query_items)
    query.setdefault("sslmode", "require")
    return urlunparse(parsed._replace(query=urlencode(query)))


def main() -> int:
    print("DOMA — create the first administrator in the new database")
    print("Use the DIRECT Neon URL (Connection pooling OFF). Secrets will not be printed.\n")

    try:
        database_url = read_database_url()
    except (ValueError, KeyboardInterrupt) as exc:
        if isinstance(exc, KeyboardInterrupt):
            print("\nCancelled.")
            return 130
        print(f"Input error: {exc}")
        return 2

    os.environ["DATABASE_URL"] = database_url

    try:
        # Suppress legacy debug prints that may emit DATABASE_URL during import.
        with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
            from app.database import Base  # noqa: F401
            import app.models  # noqa: F401 -- registers all ORM models
            from app.models import User
            from sqlalchemy import create_engine, text
            from sqlalchemy.exc import OperationalError
            from sqlalchemy.orm import sessionmaker
            from passlib.context import CryptContext

        # A short-lived/pre-ping connection pool prevents reuse of stale idle
        # connections from a serverless Neon compute.
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_recycle=120,
            pool_size=1,
            max_overflow=0,
            connect_args={"connect_timeout": 25},
        )
        SessionForBootstrap = sessionmaker(bind=engine, expire_on_commit=False)

        # Retry idempotent connectivity/schema checks, disposing stale sockets each time.
        last_error = None
        for attempt in range(1, 4):
            try:
                with engine.connect() as connection:
                    connection.execute(text("SELECT 1"))
                Base.metadata.create_all(bind=engine)
                last_error = None
                break
            except OperationalError as exc:
                last_error = exc
                engine.dispose()
                if attempt < 3:
                    print(f"Connection attempt {attempt}/3 failed; retrying in 3 seconds...")
                    time.sleep(3)
        if last_error is not None:
            print("Could not connect to Neon after 3 attempts.")
            print("Check that you copied the DIRECT Neon URL with Connection pooling OFF, that the endpoint is active, and that local network/firewall permits PostgreSQL TLS.")
            print(f"Database error type: {type(last_error.orig).__name__}")
            return 1

        username = input("Administrator username (e.g. doma_admin): ").strip()
        if not username or len(username) > 80:
            print("Username must contain 1–80 characters.")
            engine.dispose()
            return 2

        password = getpass.getpass("New administrator password (input hidden): ")
        confirmation = getpass.getpass("Repeat password: ")
        if password != confirmation:
            print("Passwords do not match.")
            engine.dispose()
            return 2
        if len(password.encode("utf-8")) < 12:
            print("Use a password of at least 12 bytes.")
            engine.dispose()
            return 2
        if len(password.encode("utf-8")) > 72:
            print("For bcrypt compatibility, use a password no longer than 72 UTF-8 bytes.")
            engine.dispose()
            return 2

        db = SessionForBootstrap()
        try:
            # Retryable preflight query; after this point we write only once.
            existing_users = db.query(User).count()
            existing_username = db.query(User).filter(User.username == username).first()
            if existing_username:
                print("That username already exists. No changes were made.")
                return 3
            if existing_users:
                print(f"The users table already contains {existing_users} account(s). No changes were made.")
                print("This bootstrap only creates the first user in an empty users table.")
                return 3

            password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            admin = User(username=username, password_hash=password_context.hash(password), role="admin")
            db.add(admin)
            db.commit()
            print("\nAdministrator created successfully.")
            print(f"Username: {username}")
            print("Password: not displayed; save it in your password manager.")
            print("You can now sign in through the existing DOMA login page.")
            return 0
        except OperationalError as exc:
            db.rollback()
            print("Database connection was interrupted while checking or creating the administrator.")
            print(f"Database error type: {type(exc.orig).__name__}")
            print("No connection URL or password was printed. Verify the Neon endpoint and try again.")
            return 1
        finally:
            db.close()
            engine.dispose()

    except KeyboardInterrupt:
        print("\nCancelled.")
        return 130
    except Exception as exc:
        print("Could not create the administrator.")
        print(f"Error type: {type(exc).__name__}")
        # Do not print full SQLAlchemy exceptions; they can contain connection details.
        print("Check that the backend dependencies are installed and the project is being run from the backend directory.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
