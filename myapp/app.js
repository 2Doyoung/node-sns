const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');
const { sequelize } = require('./models');

dotenv.config(); // .env 파일을 읽어 process.env로 환경변수 설정
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const passportConifg = require('./passport')

const app = express();
passportConifg();
app.set('port', process.env.PORT || 8001); // 포트 설정 (기본 8001)
app.set('view engine', 'html'); // 템플릿 엔진을 html로 설정 (nunjucks 사용)
nunjucks.configure('views', { // nunjucks 설정
    express: app, // express 앱 연결
    watch: true, // 템플릿 파일 변경 시 자동 반영
});

sequelize.sync()
    .then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch((err) => {
        console.error(err);
    })

app.use(morgan('dev')); // HTTP 요청 로깅 (개발용 dev, 배포용 combined)
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 제공(public 폴더)
app.use('/img', express.static(path.join(__dirname, 'uploads'))); // 정적 파일 제공(public 폴더)
app.use(express.json()); // JSON 데이터 파싱(req.body에 담기)
app.use(express.urlencoded({ extended: false })); // 폼 데이터 파싱(req.body에 담기, 단순 객체만)
app.use(cookieParser(process.env.COOKIE_SECRET)); // 쿠키 파싱 및 암호화
app.use(session({ // 세션 설정
    resave: false, // 요청이 왔을 때 세션에 수정사항이 없어도 저장할지(false 추천)
    saveUninitialized: false, // 세션에 저장할 내역이 없어도 초기 세션 저장할지(false 추천)
    secret: process.env.COOKIE_SECRET, // 세션 암호화 키
    cookie: {
        httpOnly: true, // 클라이언트에서 쿠키 접근 금지 (보안 강화)
        secure: false, // https가 아닌 환경에서도 사용(false)
    }
}));
app.use(passport.initialize()); // req.user, req.login, req.isAuthenticat, req.logout
app.use(passport.session());

app.use('/', pageRouter); // 기본 경로에 pageRouter 적용
app.use('/auth', authRouter);
app.use('/post', postRouter);

app.use((req, res, next) => { // 404 NOT FOUND 처리 미들웨어
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => { // 에러 처리 미들웨어
    res.locals.message = err.message; // 에러 메시지를 locals에 저장
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}; // 개발환경이면 에러 전체 출력, 아니면 숨김
    res.status(err.status || 500); // 상태 코드 설정 (기본 500)
    res.render('error');
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트 시작');
});