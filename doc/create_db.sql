PRAGMA foreign_keys = ON;

CREATE TABLE table_users (
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  email TEXT PRIMARY KEY NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  last_logged_in TIMESTAMP NOT NULL
);

CREATE TABLE table_socials (
  email TEXT PRIMARY KEY NOT NULL,
  discord TEXT,
  teams TEXT,
  phone TEXT NOT NULL,
  FOREIGN KEY (email) REFERENCES table_users(email)
);

CREATE TABLE table_courses (
  name TEXT NOT NULL,
  course_uuid TEXT PRIMARY KEY NOT NULL,
  owner_email TEXT NOT NULL,
  FOREIGN KEY (owner_email) REFERENCES table_users(email)
);

CREATE TABLE table_course_enrollments (
  course_uuid TEXT NOT NULL,
  user_email TEXT NOT NULL,
  enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (course_uuid, user_email),
  FOREIGN KEY (course_uuid) REFERENCES table_courses(course_uuid),
  FOREIGN KEY (user_email) REFERENCES table_users(email)
);

CREATE TABLE table_groups (
  group_name TEXT NOT NULL,
  course_uuid TEXT NOT NULL,
  group_uuid TEXT PRIMARY KEY NOT NULL,
  FOREIGN KEY (course_uuid) REFERENCES table_courses(course_uuid)
);

CREATE TABLE table_group_membership (
  group_uuid TEXT NOT NULL,
  user_email TEXT NOT NULL,
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (group_uuid, user_email),
  FOREIGN KEY (group_uuid) REFERENCES table_groups(group_uuid),
  FOREIGN KEY (user_email) REFERENCES table_users(email)
);

CREATE TABLE table_assessments (
  assessment_uuid TEXT PRIMARY KEY NOT NULL,
  course_uuid TEXT NOT NULL,
  title TEXT NOT NULL,
  date_created TIMESTAMP NOT NULL,
  due_date TIMESTAMP NOT NULL,
  questions_object TEXT, -- SQLite does not support JSON/object natively, so use TEXT
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  FOREIGN KEY (course_uuid) REFERENCES table_courses(course_uuid)
);

CREATE TABLE table_sessions (
  user_email TEXT NOT NULL,
  start_datetime TIMESTAMP,
  last_datetime TIMESTAMP,
  status TEXT NOT NULL,
  FOREIGN KEY (user_email) REFERENCES table_users(email)
);
