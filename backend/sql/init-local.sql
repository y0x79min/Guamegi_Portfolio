CREATE DATABASE IF NOT EXISTS guamegi_db
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS 목포대학교_db
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS 우송대학교_db
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE guamegi_db;

CREATE TABLE IF NOT EXISTS 학교리스트 (
  번호 INT NOT NULL AUTO_INCREMENT,
  학교이름 VARCHAR(20) NOT NULL,
  로그인사이트 VARCHAR(100),
  로그인실패사이트 VARCHAR(100),
  로그인성공사이트 VARCHAR(100),
  id입력칸 VARCHAR(20),
  pw입력칸 VARCHAR(20),
  로그인버튼 VARCHAR(20),
  쿠키명 VARCHAR(20),
  수업들사이트 VARCHAR(100),
  강의목록 VARCHAR(100),
  이름위치 VARCHAR(100),
  학과위치 VARCHAR(100),
  강의명위치 VARCHAR(100),
  교수명위치 VARCHAR(100),
  수업링크위치 VARCHAR(100),
  과제종합링크 VARCHAR(100),
  링크자르기 VARCHAR(30),
  과제리스트위치 VARCHAR(100),
  제출여부위치 VARCHAR(100),
  과제이름위치 VARCHAR(100),
  제출일위치 VARCHAR(100),
  과제링크위치 VARCHAR(100),
  sso링크 VARCHAR(1000),
  PRIMARY KEY (번호),
  UNIQUE KEY uq_학교이름 (학교이름)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO 학교리스트 (
  학교이름, 로그인사이트, 로그인실패사이트, 로그인성공사이트,
  id입력칸, pw입력칸, 로그인버튼, 쿠키명, 수업들사이트,
  강의목록, 이름위치, 학과위치, 강의명위치, 교수명위치,
  수업링크위치, 과제종합링크, 링크자르기, 과제리스트위치,
  제출여부위치, 과제이름위치, 제출일위치, 과제링크위치
) VALUES (
  '우송대학교',
  'https://smart.wsu.ac.kr/login.php',
  'https://smart.wsu.ac.kr/login.php?errorcode=',
  'http://smart.wsu.ac.kr/',
  '#input-username', '#input-password', '.btn-success', 'MoodleSession',
  'http://smart.wsu.ac.kr/', '.course_box', '.user_department', '.department',
  '.course-title > h3', '.course-title > .prof ', '.course_box > a ',
  'http://smart.wsu.ac.kr//mod/assign/index.php?', 'id=',
  'table > tbody > tr', '.c3', '.c1 > a', '.c2', '.c1'
) ON DUPLICATE KEY UPDATE
  로그인사이트=VALUES(로그인사이트),
  로그인실패사이트=VALUES(로그인실패사이트),
  로그인성공사이트=VALUES(로그인성공사이트),
  id입력칸=VALUES(id입력칸),
  pw입력칸=VALUES(pw입력칸),
  로그인버튼=VALUES(로그인버튼),
  쿠키명=VALUES(쿠키명),
  수업들사이트=VALUES(수업들사이트),
  강의목록=VALUES(강의목록),
  이름위치=VALUES(이름위치),
  학과위치=VALUES(학과위치),
  강의명위치=VALUES(강의명위치),
  교수명위치=VALUES(교수명위치),
  수업링크위치=VALUES(수업링크위치),
  과제종합링크=VALUES(과제종합링크),
  링크자르기=VALUES(링크자르기),
  과제리스트위치=VALUES(과제리스트위치),
  제출여부위치=VALUES(제출여부위치),
  과제이름위치=VALUES(과제이름위치),
  제출일위치=VALUES(제출일위치),
  과제링크위치=VALUES(과제링크위치);

INSERT INTO 학교리스트 (학교이름, sso링크)
VALUES ('목포대학교', 'https://lms.mokpo.ac.kr/sso/index.php/sso/index.jsp?pmi-sso-return2')
ON DUPLICATE KEY UPDATE sso링크=VALUES(sso링크);

USE guamegi_db;
CREATE TABLE IF NOT EXISTS 유저 (
  번호 INT NOT NULL AUTO_INCREMENT,
  아이디 VARCHAR(50),
  쿠키 VARCHAR(100),
  마지막크롤링 VARCHAR(30),
  자동로그인 INT,
  링크모음 VARCHAR(10000),
  학과 VARCHAR(50),
  닉네임_학교 VARCHAR(10),
  닉네임_학과 VARCHAR(10),
  익명_학교 INT NOT NULL DEFAULT 0,
  익명_학과 INT NOT NULL DEFAULT 0,
  익명_학교_시간 VARCHAR(20),
  익명_학과_시간 VARCHAR(20),
  PRIMARY KEY (번호)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

USE 목포대학교_db;
CREATE TABLE IF NOT EXISTS 유저 (
  번호 INT NOT NULL AUTO_INCREMENT,
  아이디 VARCHAR(50),
  쿠키 VARCHAR(100),
  마지막크롤링 VARCHAR(30),
  자동로그인 INT,
  링크모음 VARCHAR(10000),
  학과 VARCHAR(50),
  닉네임_학교 VARCHAR(10),
  닉네임_학과 VARCHAR(10),
  익명_학교 INT NOT NULL DEFAULT 0,
  익명_학과 INT NOT NULL DEFAULT 0,
  익명_학교_시간 VARCHAR(20),
  익명_학과_시간 VARCHAR(20),
  PRIMARY KEY (번호)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

USE 우송대학교_db;
CREATE TABLE IF NOT EXISTS 유저 (
  번호 INT NOT NULL AUTO_INCREMENT,
  아이디 VARCHAR(50),
  쿠키 VARCHAR(100),
  마지막크롤링 VARCHAR(30),
  자동로그인 INT,
  링크모음 VARCHAR(10000),
  학과 VARCHAR(50),
  닉네임_학교 VARCHAR(10),
  닉네임_학과 VARCHAR(10),
  익명_학교 INT NOT NULL DEFAULT 0,
  익명_학과 INT NOT NULL DEFAULT 0,
  익명_학교_시간 VARCHAR(20),
  익명_학과_시간 VARCHAR(20),
  PRIMARY KEY (번호)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
