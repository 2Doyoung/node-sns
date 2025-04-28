const User = require('../models/user');
const passport = require('passport');
const bcrypt = require('bcrypt')
const { Strategy: LocalStorage } = require('passport-local');

module.exports = () => {
    passport.use(new LocalStorage({
        usernameField: 'email', // req.body.email
        passwordField: 'password', // req.body.password
        passReqToCallback: true,
    }, async (req, email, password, done) => { // done(서버실패, 성공유저, 로직실패)
        try {
            const exUser = await User.findOne({ where: { email }});
            if(exUser) {
                const result = await bcrypt.compare(password, exUser.password);
                if(result) {
                    done(null, exUser);
                } else {
                    done(null, false, { message: '비밀번호가 일치하지 않습니다. '});
                }
            } else {
                done(null, false, { message: '가입하지 않은 사용자입니다. '});
            }
        } catch(error) {
            console.error(error);
            done(error);
        }
    }));
}