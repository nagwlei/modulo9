var models = require('../models/models.js');

// Autoload - factoriza el códiga si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
    models.Quiz.find(
	{
	    where: {
		id: Number(quizId)
            },
            include: [{
                model: models.Comment
            }]
        }
    ).then(function(quiz) {
	if (quiz) {
	    req.quiz = quiz;
	    next();
	} else { 
	    next(new Error('No existe quizId=' + quizId)); 
	}
    }).catch(function(error) { next(error) });
};

// GET /quizes
exports.index = function(req, res) {
    if (req.query.search) {
	var search = '%' + req.query.search.split(' ').join('%') + '%';
	models.Quiz.findAll({where: ["pregunta like ?", search], order: 'pregunta ASC'}).then(function(quizes) {
		res.render('quizes/index', { quizes: quizes, errors: []});
	    }
	).catch(function(error) { next(error) });
    } else {
	models.Quiz.findAll().then(
	    function(quizes) {
		res.render('quizes/index', { quizes: quizes, errors: []});
	    }
	).catch(function(error) { next(error) });
    }
};

// GET /quizes/:id
exports.show = function(req, res) {
    res.render('quizes/show', { quiz: req.quiz, errors: [] });
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
    var resultado = 'Incorrecto';
    if (req.query.respuesta === req.quiz.respuesta) {
	resultado = 'Correcto';
    }
    res.render('quizes/answer', { quiz: req.quiz, respuesta: resultado, errors: [] });
};

//GET /author
exports.author = function(req, res) {
    res.render('author', { authors: [{ name: 'Leire Roa', urlphoto: '/images/author.jpg', urlvideo: 'videos/30-SecondVideo.mp4' }, { name: 'Usuario Prueba', urlphoto: '/images/usuario.jpeg' }], errors: []} );
};

// GET /quizes/new
exports.new = function(req, res) {
    var quiz = models.Quiz.build(	// crea objeto quiz
      { pregunta: "Pregunta", respuesta: "Respuesta" }
    );
    
    res.render('quizes/new', { quiz: quiz, errors: [] });
};

// POST /quizes/create
exports.create = function(req, res) {
    var quiz = models.Quiz.build( req.body.quiz );
    
    quiz.validate().then (
	function(err) {
	    if(err) {
		res.render('quizes/new', { quiz: quiz, errors: err.errors });
	    } else {
		quiz 	// save: guarda en DB campos pregunta y respuesta de quiz
		.save({ fields: ["pregunta", "respuesta", "tema"]}).then( function() { res.redirect('/quizes')})
	    }	// res.redirect: Redirección HTTP a lista de preguntas
	}
    ).catch(function(error){ next(error) });
};

// GET quizes/:id/edit
exports.edit = function(req, res) {
    var quiz = req.quiz;	// autoload de instancia de quiz
    
    res.render('quizes/edit', { quiz: quiz, errors: [] });
};

// PUT /quizes/:id
exports.update = function(req, res) {
    req.quiz.pregunta = req.body.quiz.pregunta;
    req.quiz.respuesta = req.body.quiz.respuesta;
    req.quiz.tema = req.body.quiz.tema;
    
    req.quiz.validate().then(
	function(err) {
	    if (err) {
		res.render('quizes/edit', { quiz: req.quiz, errors: err.errors });
	    } else {
		req.quiz	// save guarda campos pregunta y respuesta en DB
		.save( { fields: ["pregunta", "respuesta", "tema"]})
		.then( function() { res.redirect('/quizes'); });
	    }	// Redirección HTTP a la lista de preguntas (URL relativo)
	}
      ).catch(function(error) { next(error) });
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
    req.quiz.destroy().then( function() {
	res.redirect('/quizes');
    }).catch( function(error) { next(error) });
};

// GET /quizes/statistics
exports.statistics = function (req, res, next) {
	models.Quiz.findAll({
		include: [{ model: models.Comment }]
	}).then(function (quizes) {
		var estadisticas = {
			nPreguntas: quizes.length,
			nComentarios: 0,
			comtsPorPregunta: 0,
			nPreguntasNoComentadas: 0,
			nPreguntasComentadas: 0
		};
		for (var i = 0; i < quizes.length; i++) {
			var comments = quizes[i].Comments.length;
			estadisticas.nComentarios += comments;
			if (comments > 0) {
				estadisticas.nPreguntasComentadas++;
			} else {
				estadisticas.nPreguntasNoComentadas++;
			}
		}
		estadisticas.comPorPregunta = estadisticas.nComentarios / estadisticas.nPreguntas;
		res.render('quizes/statistics', {estadisticas:estadisticas, errors:[]});
	}).catch(function (err) {
		next(err);
	});
};