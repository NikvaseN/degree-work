process.env.NODE_ENV = 'test';

import User from '../models/user.js';

// Очистить бд перед и после теста
before((done) => { 
    User.deleteMany({}, function(err) {
        // Очистить индексы после удаления документов
        User.collection.dropIndexes(function(err, result) {});
    });
	done();
});

after((done) => { 
    User.deleteMany({}, function(err) {
        User.collection.dropIndexes(function(err, result) {});
    });
	done();
});