# 🗄️ 오라클 DB 설치 및 설정 가이드

## 📋 설치 단계

### 1. **오라클 DB 다운로드**

#### Oracle Database 21c Express Edition (XE) 다운로드
- **공식 다운로드**: https://www.oracle.com/database/technologies/xe-downloads.html
- **Windows용**: `OracleXE213_Win64.zip` (약 2.5GB)
- **무료 버전**: Express Edition은 무료로 사용 가능

### 2. **시스템 요구사항 확인**

#### 최소 요구사항
- **OS**: Windows 10/11 (64-bit)
- **RAM**: 최소 1GB (권장 2GB 이상)
- **디스크**: 최소 10GB 여유 공간
- **Java**: JDK 8 이상

### 3. **설치 과정**

#### 3-1. 설치 파일 압축 해제
```bash
# 다운로드한 OracleXE213_Win64.zip 압축 해제
# setup.exe 파일 실행
```

#### 3-2. 설치 마법사 실행
1. **설치 마법사 시작**
2. **설치 옵션 선택**: "Desktop Class" 선택
3. **데이터베이스 정보 입력**:
   - **Global Database Name**: `XE`
   - **System Identifier (SID)**: `XE`
   - **Administrator Password**: 안전한 비밀번호 설정 (예: `Oracle123!`)
4. **설치 진행**: 약 10-15분 소요

#### 3-3. 설치 완료 후 확인
- **Oracle Service**: 자동으로 시작됨
- **포트**: 1521 (기본값)
- **SID**: XE

### 4. **환경 변수 설정**

#### 시스템 환경 변수 추가
```bash
# ORACLE_HOME 설정
ORACLE_HOME=C:\app\oracle\product\21c\dbhomeXE

# PATH에 추가
PATH=%PATH%;%ORACLE_HOME%\bin

# TNS_ADMIN 설정 (선택사항)
TNS_ADMIN=%ORACLE_HOME%\network\admin
```

### 5. **데이터베이스 접속 테스트**

#### SQL*Plus로 접속 테스트
```sql
-- 관리자로 접속
sqlplus sys/Oracle123!@localhost:1521/XE as sysdba

-- 일반 사용자로 접속
sqlplus system/Oracle123!@localhost:1521/XE
```

#### 접속 성공 확인
```sql
-- 데이터베이스 정보 확인
SELECT * FROM v$version;

-- 현재 사용자 확인
SELECT USER FROM dual;

-- 테이블스페이스 확인
SELECT tablespace_name FROM dba_tablespaces;
```

---

## 🔧 프로젝트 연동 설정

### 1. **Prisma 스키마 변경**

#### 오라클 DB로 변경
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "oracle"
  url      = env("DATABASE_URL")
}
```

### 2. **환경 변수 설정**

#### DATABASE_URL 설정
```bash
# .env 파일
DATABASE_URL="oracle://system:Oracle123!@localhost:1521/XE"
```

#### 연결 문자열 형식
```
oracle://[username]:[password]@[host]:[port]/[service_name]
```

### 3. **Prisma 클라이언트 생성**

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 스키마 푸시
npx prisma db push
```

---

## 🧪 테스트 방법

### 1. **데이터베이스 연결 테스트**

#### Node.js에서 테스트
```javascript
// test-connection.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ 오라클 DB 연결 성공!');
    
    // 간단한 쿼리 테스트
    const result = await prisma.$queryRaw`SELECT 1 as test FROM dual`;
    console.log('✅ 쿼리 테스트 성공:', result);
    
  } catch (error) {
    console.error('❌ 연결 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

### 2. **백엔드 서버 테스트**

```bash
# 환경 변수 설정
$env:DATABASE_URL="oracle://system:Oracle123!@localhost:1521/XE"
$env:JWT_SECRET="test-secret-key"
$env:JWT_REFRESH_SECRET="test-refresh-secret"

# 백엔드 서버 시작
cd server
npm run dev
```

---

## 🔍 문제 해결

### 1. **일반적인 문제들**

#### 연결 실패
```bash
# 오라클 서비스 상태 확인
services.msc
# OracleServiceXE 서비스가 실행 중인지 확인

# 포트 확인
netstat -an | findstr 1521
```

#### 권한 문제
```sql
-- 사용자 권한 확인
SELECT * FROM user_sys_privs;
SELECT * FROM user_tab_privs;

-- 필요한 권한 부여
GRANT CREATE SESSION TO [username];
GRANT CREATE TABLE TO [username];
GRANT CREATE SEQUENCE TO [username];
```

### 2. **Prisma 관련 문제**

#### 오라클 프로바이더 지원 확인
```bash
# Prisma 버전 확인
npx prisma --version

# 오라클 지원 확인
npx prisma db pull --preview-feature
```

#### 스키마 호환성 문제
- 오라클은 일부 데이터 타입이 다를 수 있음
- `@default(cuid())` → `@default(dbgenerated("SYS_GUID()"))`
- `@default(autoincrement())` → `@default(dbgenerated("SYS_GUID()"))`

---

## 📊 설치 후 확인사항

### ✅ **설치 완료 체크리스트**
- [ ] 오라클 DB 설치 완료
- [ ] Oracle Service 실행 중
- [ ] SQL*Plus 접속 성공
- [ ] 환경 변수 설정 완료
- [ ] Prisma 스키마 변경 완료
- [ ] 데이터베이스 연결 테스트 성공
- [ ] 백엔드 서버 실행 성공

### 🎯 **다음 단계**
1. **사용자 계정 생성** - 애플리케이션 전용 사용자
2. **테이블 생성** - Prisma 마이그레이션
3. **API 테스트** - 회원가입/로그인 테스트
4. **데이터 확인** - 실제 데이터 저장/조회 테스트

---

## 🚀 빠른 시작 명령어

### **1단계: 오라클 DB 설치**
```bash
# 1. Oracle XE 다운로드 및 설치
# 2. 환경 변수 설정
# 3. 서비스 시작 확인
```

### **2단계: 프로젝트 연동**
```bash
# Prisma 스키마 변경
# 환경 변수 설정
# 클라이언트 생성
npx prisma generate
npx prisma db push
```

### **3단계: 테스트**
```bash
# 백엔드 서버 시작
cd server
npm run dev

# 프론트엔드에서 회원가입 테스트
# http://localhost:8080/signup
```

---

**💡 오라클 DB 설치 후에는 Prisma가 오라클을 지원하는지 확인해야 합니다. 만약 지원하지 않는다면 PostgreSQL로 대체할 수 있습니다.**
