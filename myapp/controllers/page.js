exports.renderProfile = (req, res, next) => {
    res.render('profile', { title: '내 정보 - Node SNS' });
};

exports.renderJoin = (req, res, next) => {
    res.render('join', { title: '회원가입 - Node SNS' });
};

exports.renderMain = (req, res, next) => {
    res.render('main', { 
        title: 'Node SNS',
        twits: [],
    });
};