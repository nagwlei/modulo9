var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Quiz' });
});

// Autoload de comandos con :quizId
router.param('quizId', quizController.load);	// autoload :quizId

// Definición de rutas de /quizes
router.get('/quizes',				quizController.index);
router.get('/quizes/:quizId(\\d+)',		quizController.show);
router.get('/quizes/:quizId(\\d+)/answer',	quizController.answer);
router.get('/quizes/new',			quizController.new);
router.post('/quizes/create',			quizController.create);

router.get('/author', function(req, res) {
    res.render('author', { authors: [{ name: 'Leire Roa', urlphoto: '/images/author.jpg', urlvideo: 'videos/30-SecondVideo.mp4' }, { name: 'Usuario Prueba', urlphoto: '/images/usuario.jpeg' }]});
});

module.exports = router;