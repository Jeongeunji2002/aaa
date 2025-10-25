// 🚀 Mock API 서버 - 오라클 DB 없이 테스트용
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// 미들웨어 설정
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());

// Mock 데이터 저장소
let users = [];
let boards = [];
let refreshTokens = [];

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Mock 서버가 실행 중입니다.',
    data: {
      users: users.length,
      boards: boards.length,
      refreshTokens: refreshTokens.length
    }
  });
});

// 회원가입 API
app.post('/api/auth/signup', (req, res) => {
  console.log('📝 회원가입 요청:', req.body);
  
  const { userId, password, name, email } = req.body;
  
  // 유효성 검사
  if (!userId || !password || !name) {
    return res.status(400).json({
      success: false,
      message: '필수 정보를 모두 입력해주세요.',
      errors: [
        { field: 'userId', message: !userId ? '아이디를 입력해주세요.' : '' },
        { field: 'password', message: !password ? '비밀번호를 입력해주세요.' : '' },
        { field: 'name', message: !name ? '이름을 입력해주세요.' : '' }
      ].filter(e => e.message)
    });
  }
  
  // 중복 확인
  const existingUser = users.find(u => u.userId === userId || u.email === email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: existingUser.userId === userId 
        ? '이미 사용 중인 아이디입니다.' 
        : '이미 사용 중인 이메일입니다.'
    });
  }
  
  // 새 사용자 생성
  const newUser = {
    id: `user_${Date.now()}`,
    userId,
    password: `hashed_${password}`, // 실제로는 bcrypt로 해싱
    name,
    email,
    provider: null,
    providerId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  console.log('✅ 회원가입 성공:', newUser.userId);
  
  res.status(201).json({
    success: true,
    message: '회원가입이 완료되었습니다.',
    data: {
      id: newUser.id,
      userId: newUser.userId,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt
    }
  });
});

// 로그인 API
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 로그인 요청:', req.body);
  
  const { userId, password } = req.body;
  
  // 유효성 검사
  if (!userId || !password) {
    return res.status(400).json({
      success: false,
      message: '아이디와 비밀번호를 입력해주세요.'
    });
  }
  
  // 사용자 찾기
  const user = users.find(u => u.userId === userId);
  if (!user || user.password !== `hashed_${password}`) {
    return res.status(401).json({
      success: false,
      message: '아이디 또는 비밀번호가 올바르지 않습니다.'
    });
  }
  
  // JWT 토큰 생성 (Mock)
  const accessToken = `mock_access_token_${Date.now()}`;
  const refreshToken = `mock_refresh_token_${Date.now()}`;
  
  // Refresh Token 저장
  refreshTokens.push({
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  });
  
  console.log('✅ 로그인 성공:', user.userId);
  
  res.json({
    success: true,
    message: '로그인 성공',
    data: {
      accessToken,
      refreshToken,
      user: {
        userId: user.userId,
        name: user.name
      }
    }
  });
});

// 토큰 갱신 API
app.post('/api/auth/refresh', (req, res) => {
  console.log('🔄 토큰 갱신 요청');
  
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token이 필요합니다.'
    });
  }
  
  const storedToken = refreshTokens.find(t => t.token === refreshToken);
  if (!storedToken || new Date(storedToken.expiresAt) < new Date()) {
    return res.status(401).json({
      success: false,
      message: '유효하지 않은 refresh token입니다.'
    });
  }
  
  const newAccessToken = `mock_access_token_${Date.now()}`;
  
  res.json({
    success: true,
    data: {
      accessToken: newAccessToken
    }
  });
});

// 로그아웃 API
app.post('/api/auth/logout', (req, res) => {
  console.log('🚪 로그아웃 요청');
  
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    refreshTokens = refreshTokens.filter(t => t.token !== refreshToken);
  }
  
  res.json({
    success: true,
    message: '로그아웃되었습니다.'
  });
});

// 내 정보 조회 API
app.get('/api/auth/me', (req, res) => {
  console.log('👤 내 정보 조회 요청');
  
  // Mock 인증 (실제로는 JWT 검증)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '인증이 필요합니다.'
    });
  }
  
  // Mock 사용자 정보 반환
  const mockUser = {
    id: 'mock_user_id',
    userId: 'testuser',
    name: '테스트 사용자',
    email: 'test@example.com',
    provider: null,
    createdAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: mockUser
  });
});

// 게시글 목록 조회 API
app.get('/api/boards', (req, res) => {
  console.log('📋 게시글 목록 조회 요청');
  
  const page = parseInt(req.query.page) || 0;
  const size = parseInt(req.query.size) || 10;
  const category = req.query.category;
  
  let filteredBoards = boards;
  if (category) {
    filteredBoards = boards.filter(b => b.category === category);
  }
  
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const paginatedBoards = filteredBoards.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: {
      content: paginatedBoards,
      pageable: { pageNumber: page, pageSize: size },
      totalPages: Math.ceil(filteredBoards.length / size),
      totalElements: filteredBoards.length
    }
  });
});

// 게시글 작성 API
app.post('/api/boards', (req, res) => {
  console.log('✍️ 게시글 작성 요청:', req.body);
  
  const { title, content, category } = req.body;
  
  if (!title || !content || !category) {
    return res.status(400).json({
      success: false,
      message: '제목, 내용, 카테고리를 모두 입력해주세요.'
    });
  }
  
  const newBoard = {
    id: boards.length + 1,
    title,
    content,
    category,
    imageUrl: null,
    authorId: 'mock_user_id',
    author: {
      userId: 'testuser',
      name: '테스트 사용자'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  boards.push(newBoard);
  
  console.log('✅ 게시글 작성 성공:', newBoard.title);
  
  res.status(201).json({
    success: true,
    message: '게시글 작성 성공',
    data: newBoard
  });
});

// 소셜 로그인 API
app.post('/api/social/login', (req, res) => {
  console.log('🌐 소셜 로그인 요청:', req.body);
  
  const { provider, code, state } = req.body;
  
  // Mock 소셜 로그인 처리
  const mockUser = {
    id: `social_${provider}_${Date.now()}`,
    userId: `${provider}_user_${Date.now()}`,
    name: `${provider} 사용자`,
    email: `${provider}@example.com`,
    provider,
    providerId: `mock_${provider}_id`
  };
  
  // 기존 사용자 확인
  let user = users.find(u => u.provider === provider && u.providerId === mockUser.providerId);
  
  if (!user) {
    // 새 사용자 생성
    user = {
      ...mockUser,
      password: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(user);
  }
  
  // JWT 토큰 생성
  const accessToken = `mock_social_access_token_${Date.now()}`;
  const refreshToken = `mock_social_refresh_token_${Date.now()}`;
  
  refreshTokens.push({
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  });
  
  console.log('✅ 소셜 로그인 성공:', provider, user.userId);
  
  res.json({
    success: true,
    message: '소셜 로그인 성공',
    data: {
      accessToken,
      refreshToken,
      user: {
        userId: user.userId,
        name: user.name
      }
    }
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '요청한 API를 찾을 수 없습니다.',
    path: req.originalUrl
  });
});

// 에러 핸들러
app.use((error, req, res, next) => {
  console.error('❌ 서버 에러:', error);
  res.status(500).json({
    success: false,
    message: '서버 내부 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log('🚀 Mock API 서버가 시작되었습니다!');
  console.log(`📍 포트: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`💚 헬스 체크: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('📋 사용 가능한 API:');
  console.log('  POST /api/auth/signup - 회원가입');
  console.log('  POST /api/auth/login - 로그인');
  console.log('  POST /api/auth/refresh - 토큰 갱신');
  console.log('  POST /api/auth/logout - 로그아웃');
  console.log('  GET  /api/auth/me - 내 정보 조회');
  console.log('  GET  /api/boards - 게시글 목록');
  console.log('  POST /api/boards - 게시글 작성');
  console.log('  POST /api/social/login - 소셜 로그인');
  console.log('');
  console.log('🎯 프론트엔드에서 테스트: http://localhost:8080/signup');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 서버를 종료합니다...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 서버를 종료합니다...');
  process.exit(0);
});
