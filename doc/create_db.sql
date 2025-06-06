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
  assessment_name TEXT NOT NULL,
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL ,
  start_date TIMESTAMP NOT NULL,
  due_date TIMESTAMP NOT NULL,
  array_json_questions TEXT, -- SQLite does not support JSON/object natively, so use TEXT
  FOREIGN KEY (course_uuid) REFERENCES table_courses(course_uuid)
);

CREATE TABLE table_assessment_submissions (
  submission_uuid TEXT PRIMARY KEY NOT NULL,
  assessment_uuid TEXT NOT NULL,
  user_email TEXT NOT NULL,
  submission_json TEXT NOT NULL,
  date_submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (assessment_uuid) REFERENCES table_assessments(assessment_uuid),
  FOREIGN KEY (user_email) REFERENCES table_users(email)
);
