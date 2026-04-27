# Database Setup

## Import the database

Run the following command in your terminal (requires MySQL 8.0+):

```bash
mysql -u root -p < ilcms_db.sql
```

Enter your MySQL root password when prompted.
This will create the `ilcms_db` database and populate all tables with sample data.

---

## Configure the backend

Copy the example environment file and update credentials if needed:

```
Backend/.env
```

Default values (change if your MySQL credentials differ):

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=viet
DB_NAME=ilcms_db
```

---

## Default login accounts

| Username | Password | Role  |
|----------|----------|-------|
| admin    | admin    | Admin |
| staff    | staff    | Staff |
| sale     | sale     | Sale  |

> Passwords are bcrypt-hashed in the database. The values above are the plain-text passwords to log in.

---

## Notes

- Uploaded material files are **not** included in the repository.
  Any material records referencing `/uploads/...` will show as missing files — this is expected.
- The backend auto-runs migrations on startup, so no manual `ALTER TABLE` steps are needed.
