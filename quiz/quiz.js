const QUESTION_TYPE = {
    RADIO: 'radio',
    CHECKBOX: 'checkbox',
};

class Question {
    question = '';
    weight = 0;

    choices = [];
    validAnswers = [];

    type;

    constructor({question, weight, choices, validAnswers}) {
        this.question = question;
        this.weight = weight;
        this.choices = choices;
        this.validAnswers = validAnswers;
        if (validAnswers.length < 1) {
            throw new Error('At least one valid choice is required');
        } else if (validAnswers.length === 1) {
            this.type = QUESTION_TYPE.RADIO;
        } else {
            this.type = QUESTION_TYPE.CHECKBOX;
        }
    }

    getGrade(answers) {
        if (!answers) return 0;
        let isCorrect = true;
        this.validAnswers.forEach((validAnswer) => {
            if (!answers.includes(validAnswer)) {
                isCorrect = false;
            }
        });
        answers.forEach((answer) => {
            if (!this.validAnswers.includes(answer)) {
                isCorrect = false;
            }
        });
        return isCorrect ? this.weight : 0;
    }
}

class Quiz {
    questions = [];
    questionAnswers = [];

    quizContainer;
    questionElements = [];

    constructor(questions) {
        this.questions = questions;
    }

    calculateGrade() {
        let maximum = this.questions.reduce((accumulator, currentValue) => accumulator + currentValue.weight, 0);
        let score = this.questions.reduce((accumulator, currentValue, currentIndex) => {
            return accumulator + currentValue.getGrade(this.questionAnswers?.[currentIndex]);
        }, 0);
        let percentage = (score / maximum) * 100;
        return {maximum, score, percentage};
    }

    inject() {
        this.quizContainer = document.getElementById('quiz-container');
        for (let questionIndex = 0; questionIndex < this.questions.length; questionIndex++) {
            let question = this.questions[questionIndex];

            let questionElement = document.createElement('div');
            questionElement.classList.add('question-container');
            if (question.type === QUESTION_TYPE.RADIO) {
                questionElement.innerHTML = `
                    <div class="question-header">${questionIndex + 1}) ${question.question}</div>
                    ${question.choices.map((choice, index) => `
                        <input type="radio" id="question-${questionIndex}-${index}" name="question-${questionIndex}" value="${index}">
                        <label for="question-${questionIndex}-${index}">${choice}</label>
                    `).join('')}
                `;
                const radioButtons = questionElement.querySelectorAll('input[type="radio"]');
                radioButtons.forEach((button) => {
                    button.addEventListener('change', (event) => {
                        this.questionAnswers[questionIndex] = [parseInt(event.target.value)];
                    });
                });
            } else if (question.type === QUESTION_TYPE.CHECKBOX) {
                questionElement.innerHTML = `
                    <div class="question-header">${questionIndex + 1}) ${question.question}</div>
                        ${question.choices.map((choice, index) => `
                        <input type="checkbox" id="question-${questionIndex}-${index}" name="question-${questionIndex}" value="${index}">
                        <label for="question-${questionIndex}-${index}">${choice}</label>
                    `).join('')}
                `;
                const checkboxes = questionElement.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach((checkbox) => {
                    checkbox.addEventListener('change', (event) => {
                        const answerIndex = parseInt(event.target.value);
                        if (event.target.checked) {
                            if (!this.questionAnswers[questionIndex]) this.questionAnswers[questionIndex] = [];
                            this.questionAnswers[questionIndex]?.push(answerIndex);
                        } else {
                            this.questionAnswers[questionIndex] = this.questionAnswers[questionIndex]?.filter(answer => answer !== answerIndex);
                        }
                    });
                });
            } else {
                throw new Error('Invalid question type');
            }

            this.questionElements[questionIndex] = questionElement;
            this.quizContainer.appendChild(questionElement);
        }

        let submitButton = document.createElement('button');
        submitButton.innerHTML = 'Submit';
        submitButton.classList.add('submit-button');

        let resultElement = document.createElement('div');

        submitButton.addEventListener('click', () => {
            let {maximum, score, percentage} = this.calculateGrade();
            resultElement.innerHTML = `You scored ${score} out of ${maximum}, which is ${percentage.toFixed(0)}%`;
            resultElement.classList.add('result-container');
            submitButton.remove();
            document.querySelectorAll('.question-container').forEach((question) => question.remove());
            if (percentage < 60) {
                let audio = new Audio('../sounds/quiz-fail.mp3');
                audio.play();
            } else {
                let audio = new Audio('../sounds/quiz-success.mp3');
                audio.play();
            }

        });

        this.quizContainer.appendChild(submitButton);
        this.quizContainer.appendChild(resultElement);
    }
}

let quest = [
    {
        question: 'Which planet is closest to our Sun?',
        weight: 1,
        choices: ['Jupiter', 'Mercury', 'Venus', 'Neptune'],
        validAnswers: [1],
    },
    {
        question: 'What is the second-largest planet in our Solar System?',
        weight: 1,
        choices: ['Saturn', 'Earth', 'Neptune', 'Jupiter'],
        validAnswers: [0],
    },
    {
        question: 'At its surface, is the air pressure on Venus greater or lesser than that of Earth?',
        weight: 1,
        choices: ['Lesser', 'Greater'],
        validAnswers: [1],
    },
    {
        question: 'The planet Uranus is primarily composed of ______ (pick three).',
        weight: 1,
        choices: ['Water', 'Ammonia', 'Methane', 'Nitroglycerin'],
        validAnswers: [0,1,2],
    },
    {
        question: 'Which planet\'s solar day length is closest to Earth\'s?',
        weight: 1,
        choices: ['Venus', 'Jupiter', 'Mars', 'Pluto'],
        validAnswers: [2]
    },
    {
        question: 'The planet Gliese 436-B has a comet-like trail of evaporated water that is 9 ______ miles long.',
        weight: 1,
        choices: ['Hundred', 'Thousand', 'Million'],
        validAnswers: [2]
    },
    {
        question: 'The Gas Giant WASP-12 B is so close to its Sun that it is being pulled into what shape?',
        weight: 1,
        choices: ['Egg', 'Disk', 'Sphere'],
        validAnswers: [0]
    },
    {
        question: '"Zombie Planets" are abnormal because they orbit what?',
        weight: 1,
        choices: ['Black Holes', 'Neutron Stars', 'Comets', 'Gas Giants'],
        validAnswers: [1]
    },
    {
        question: 'What is the name of the star closest to our Sun?',
        weight: 1,
        choices: ['Betelgeuse', 'Vega', 'Zeta Leonis', 'Proxima Centauri'],
        validAnswers: [3]
    },
    {
        question: 'Planets that occupy the "Habitable Zone" in their Solar Systems have the potential to sustain what?',
        weight: 1,
        choices: ['Solar Wind', 'Liquid Water', 'Radiation', 'Helium'],
        validAnswers: [1]
    },
];


let questionInstances = quest.map(question => new Question(question));

let quiz = new Quiz(questionInstances);
quiz.inject();
