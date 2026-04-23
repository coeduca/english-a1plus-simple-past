// ====================================
// EJERCICIOS - SIMPLE PAST
// 2 versiones de cada ejercicio
// ====================================

const EXERCISES_POOL = {

  // ==================== 1. MULTIPLE CHOICE ====================
  multipleChoice: [
    {
      type: 'multipleChoice',
      title: '✅ Seleccion multiple: Elige la forma correcta del pasado',
      instructions: '🎯 Selecciona la respuesta correcta para completar cada oracion en pasado simple.',
      questions: [
        { q: 'Yesterday, I ___ to the park.', options: ['go', 'went', 'goed', 'gone'], answer: 1 },
        { q: 'She ___ her homework last night.', options: ['did', 'done', 'do', 'does'], answer: 0 },
        { q: 'They ___ a movie on Saturday.', options: ['watch', 'watches', 'watched', 'watching'], answer: 2 },
        { q: 'We ___ pizza for dinner yesterday.', options: ['eat', 'ate', 'eated', 'eaten'], answer: 1 },
        { q: 'He ___ not come to the party.', options: ['didn\'t', 'doesn\'t', 'wasn\'t', 'don\'t'], answer: 0 }
      ]
    },
    {
      type: 'multipleChoice',
      title: '✅ Seleccion multiple: Verbos en pasado',
      instructions: '🎯 Elige la opcion correcta en pasado simple para cada oracion.',
      questions: [
        { q: 'My mother ___ a cake last Sunday.', options: ['bake', 'baked', 'baking', 'bakes'], answer: 1 },
        { q: 'I ___ my keys this morning.', options: ['lose', 'losed', 'lost', 'losing'], answer: 2 },
        { q: 'The children ___ happy at the zoo.', options: ['was', 'were', 'is', 'are'], answer: 1 },
        { q: '___ you visit your grandma last weekend?', options: ['Do', 'Does', 'Did', 'Was'], answer: 2 },
        { q: 'She ___ a new dress at the mall.', options: ['buy', 'buyed', 'bought', 'buys'], answer: 2 }
      ]
    }
  ],

  // ==================== 2. FILL IN THE BLANK ====================
  fillInTheBlank: [
    {
      type: 'fillInTheBlank',
      title: '✏️ Completa el espacio en blanco',
      instructions: '⌨️ Escribe el verbo en pasado simple correctamente. No importan mayusculas, minusculas ni espacios extra.',
      sentences: [
        { parts: ['Last summer, we ', ' (travel) to Mexico.'], answer: 'traveled', alt: ['travelled'] },
        { parts: ['She ', ' (study) English for two hours yesterday.'], answer: 'studied' },
        { parts: ['They ', ' (play) soccer last Saturday.'], answer: 'played' },
        { parts: ['I ', ' (see) a great movie last night.'], answer: 'saw' },
        { parts: ['He ', ' (write) a letter to his friend.'], answer: 'wrote' }
      ]
    },
    {
      type: 'fillInTheBlank',
      title: '✏️ Rellena con el verbo correcto en pasado',
      instructions: '⌨️ Conjuga el verbo en parentesis en pasado simple y escribelo en el espacio.',
      sentences: [
        { parts: ['My brother ', ' (run) in the marathon yesterday.'], answer: 'ran' },
        { parts: ['The cat ', ' (sleep) all day.'], answer: 'slept' },
        { parts: ['We ', ' (cook) dinner together last night.'], answer: 'cooked' },
        { parts: ['Tom ', ' (drink) orange juice this morning.'], answer: 'drank' },
        { parts: ['My parents ', ' (visit) Paris in 2020.'], answer: 'visited' }
      ]
    }
  ],

  // ==================== 3. DRAG & DROP WORDS ====================
  dragDropWords: [
    {
      type: 'dragDropWords',
      title: '🖐️ Arrastra las palabras al lugar correcto',
      instructions: '👇 Arrastra cada verbo en pasado desde el banco al espacio correcto de la oracion.',
      wordBank: ['watched', 'ate', 'went', 'played', 'saw'],
      sentences: [
        { parts: ['I ', ' TV last night.'], answer: 'watched' },
        { parts: ['They ', ' pizza for lunch.'], answer: 'ate' },
        { parts: ['She ', ' to school by bus.'], answer: 'went' },
        { parts: ['We ', ' football in the park.'], answer: 'played' },
        { parts: ['He ', ' a beautiful sunset.'], answer: 'saw' }
      ]
    },
    {
      type: 'dragDropWords',
      title: '🖐️ Arrastra y completa las oraciones',
      instructions: '👇 Coloca el verbo correcto en pasado simple en cada espacio arrastrandolo.',
      wordBank: ['bought', 'wrote', 'drank', 'ran', 'slept'],
      sentences: [
        { parts: ['My mom ', ' a new phone.'], answer: 'bought' },
        { parts: ['I ', ' an email to my teacher.'], answer: 'wrote' },
        { parts: ['She ', ' coffee this morning.'], answer: 'drank' },
        { parts: ['The dog ', ' very fast.'], answer: 'ran' },
        { parts: ['Baby ', ' for 10 hours.'], answer: 'slept' }
      ]
    }
  ],

  // ==================== 4. UNSCRAMBLE WORDS ====================
  unscrambleWords: [
    {
      type: 'unscrambleWords',
      title: '🔤 Ordena las letras para formar verbos en pasado',
      instructions: '🧩 Reordena las letras desordenadas para formar el verbo en pasado simple correcto.',
      words: [
        { scrambled: 'T-N-E-W', answer: 'WENT', hint: '(verbo go en pasado)' },
        { scrambled: 'Y-A-D-L-E-P', answer: 'PLAYED', hint: '(verbo play en pasado)' },
        { scrambled: 'T-E-A', answer: 'ATE', hint: '(verbo eat en pasado)' },
        { scrambled: 'W-S-A', answer: 'SAW', hint: '(verbo see en pasado)' },
        { scrambled: 'T-U-G-H-O-B', answer: 'BOUGHT', hint: '(verbo buy en pasado)' }
      ]
    },
    {
      type: 'unscrambleWords',
      title: '🔤 Forma el verbo en pasado correcto',
      instructions: '🧩 Ordena las letras desordenadas para escribir el verbo en pasado simple.',
      words: [
        { scrambled: 'D-I-D', answer: 'DID', hint: '(verbo do en pasado)' },
        { scrambled: 'W-R-O-T-E', answer: 'WROTE', hint: '(verbo write en pasado)' },
        { scrambled: 'R-A-N', answer: 'RAN', hint: '(verbo run en pasado)' },
        { scrambled: 'D-R-A-N-K', answer: 'DRANK', hint: '(verbo drink en pasado)' },
        { scrambled: 'P-E-S-L-T', answer: 'SLEPT', hint: '(verbo sleep en pasado)' }
      ]
    }
  ],

  // ==================== 5. REORDER SENTENCES (AUDIO) ====================
  reorderSentences: [
    {
      type: 'reorderSentences',
      title: '🎧 Escucha y ordena las oraciones',
      instructions: '🔊 Reproduce el audio. En la columna izquierda estan las oraciones desordenadas; arrastralas a los espacios numerados de la derecha en el orden correcto segun lo que escuchas.',
      audioFile: 'files/audio.mp3',
      scrambled: [
        "You wore a terrible dress at the party.",
        "Ernesto didn't take a shower yesterday.",
        "Did you have a boyfriend last year?",
        "Mariana didn't do her homework, oh my god!",
        "Diana painted the house yesterday."
      ],
      correctOrder: [
        "Ernesto didn't take a shower yesterday.",
        "Mariana didn't do her homework, oh my god!",
        "Diana painted the house yesterday.",
        "You wore a terrible dress at the party.",
        "Did you have a boyfriend last year?"
      ]
    },
    {
      type: 'reorderSentences',
      title: '🎧 Audio: ordena en el orden correcto',
      instructions: '🔊 Escucha el audio y arrastra cada oracion del banco (izquierda) al espacio numerado correspondiente (derecha).',
      audioFile: 'files/audio.mp3',
      scrambled: [
        "Mariana didn't do her homework, oh my god!",
        "Did you have a boyfriend last year?",
        "Ernesto didn't take a shower yesterday.",
        "Diana painted the house yesterday.",
        "You wore a terrible dress at the party."
      ],
      correctOrder: [
        "Ernesto didn't take a shower yesterday.",
        "Mariana didn't do her homework, oh my god!",
        "Diana painted the house yesterday.",
        "You wore a terrible dress at the party.",
        "Did you have a boyfriend last year?"
      ]
    }
  ],

  // ==================== 6. TRUE / FALSE ====================
  trueFalse: [
    {
      type: 'trueFalse',
      title: '✔️❌ Verdadero o Falso',
      instructions: '🤔 Lee cada oracion y decide si es gramaticalmente correcta (V) o incorrecta (F) en pasado simple.',
      questions: [
        { q: 'She went to the beach last weekend.', answer: true },
        { q: 'They eated breakfast at 7 AM.', answer: false },
        { q: 'I didn\'t saw the movie yesterday.', answer: false },
        { q: 'He wrote a poem for his mother.', answer: true },
        { q: 'We was happy at the party.', answer: false }
      ]
    },
    {
      type: 'trueFalse',
      title: '✔️❌ Decide: Verdadero o Falso',
      instructions: '🤔 Indica si cada oracion esta correctamente escrita en pasado simple.',
      questions: [
        { q: 'Did you went to school yesterday?', answer: false },
        { q: 'My sister bought a new dress.', answer: true },
        { q: 'They didn\'t study for the test.', answer: true },
        { q: 'I goed to the park with my friends.', answer: false },
        { q: 'Anna readed the book last night.', answer: false }
      ]
    }
  ],

  // ==================== 7. WORD SEARCH ====================
  wordSearch: [
    {
      type: 'wordSearch',
      title: '🔍 Sopa de letras: Verbos en pasado',
      instructions: '🔎 Encuentra los verbos en pasado simple. Arrastra desde la primera letra hasta la ultima (horizontal, vertical o diagonal).',
      words: ['WENT', 'ATE', 'SAW', 'PLAYED', 'RAN', 'BOUGHT', 'WROTE', 'DRANK']
    },
    {
      type: 'wordSearch',
      title: '🔍 Sopa de letras: Encuentra los pasados',
      instructions: '🔎 Busca los verbos irregulares en pasado dentro de la cuadricula. Arrastra desde la primera hasta la ultima letra.',
      words: ['SLEPT', 'TOOK', 'GAVE', 'MADE', 'SAID', 'CAME', 'KNEW', 'FELT']
    }
  ],

  // ==================== 8. CATEGORIZATION ====================
  categorization: [
    {
      type: 'categorization',
      title: '📦 Clasifica: Regulares vs Irregulares',
      instructions: '🗂️ Arrastra cada verbo en pasado a la columna correcta segun sea regular (termina en -ed) o irregular.',
      items: [
        { word: 'played', category: 'regular' },
        { word: 'went', category: 'irregular' },
        { word: 'ate', category: 'irregular' },
        { word: 'watched', category: 'regular' },
        { word: 'cooked', category: 'regular' },
        { word: 'saw', category: 'irregular' },
        { word: 'studied', category: 'regular' },
        { word: 'wrote', category: 'irregular' }
      ],
      categories: [
        { id: 'regular', label: '🟢 Verbos Regulares (-ed)' },
        { id: 'irregular', label: '🟠 Verbos Irregulares' }
      ]
    },
    {
      type: 'categorization',
      title: '📦 Clasifica los verbos en pasado',
      instructions: '🗂️ Separa los verbos regulares de los irregulares arrastrandolos a cada columna.',
      items: [
        { word: 'visited', category: 'regular' },
        { word: 'bought', category: 'irregular' },
        { word: 'ran', category: 'irregular' },
        { word: 'danced', category: 'regular' },
        { word: 'drank', category: 'irregular' },
        { word: 'listened', category: 'regular' },
        { word: 'slept', category: 'irregular' },
        { word: 'talked', category: 'regular' }
      ],
      categories: [
        { id: 'regular', label: '🟢 Verbos Regulares (-ed)' },
        { id: 'irregular', label: '🟠 Verbos Irregulares' }
      ]
    }
  ],

  // ==================== 9. DROPDOWN ====================
  dropdown: [
    {
      type: 'dropdown',
      title: '📋 Menu desplegable: Elige el verbo correcto',
      instructions: '👇 Selecciona del menu la forma correcta del verbo para cada oracion.',
      sentences: [
        { parts: ['Yesterday I ', ' a book.'], options: ['read', 'reads', 'readed'], answer: 'read' },
        { parts: ['She ', ' to the store last night.'], options: ['goed', 'went', 'goes'], answer: 'went' },
        { parts: ['We ', ' happy at the birthday party.'], options: ['were', 'was', 'are'], answer: 'were' },
        { parts: ['He ', ' a new game yesterday.'], options: ['buyed', 'buys', 'bought'], answer: 'bought' },
        { parts: ['They ', ' at home last weekend.'], options: ['stayed', 'stays', 'staied'], answer: 'stayed' }
      ]
    },
    {
      type: 'dropdown',
      title: '📋 Elige la conjugacion correcta',
      instructions: '👇 Escoge del menu desplegable la forma correcta en pasado simple.',
      sentences: [
        { parts: ['My dad ', ' a sandwich for lunch.'], options: ['maked', 'made', 'makes'], answer: 'made' },
        { parts: ['I ', ' tired yesterday.'], options: ['was', 'were', 'am'], answer: 'was' },
        { parts: ['The students ', ' the test.'], options: ['taked', 'took', 'taken'], answer: 'took' },
        { parts: ['She ', ' her friend at school.'], options: ['sees', 'seen', 'saw'], answer: 'saw' },
        { parts: ['We ', ' a great time!'], options: ['had', 'haved', 'has'], answer: 'had' }
      ]
    }
  ],

  // ==================== 10. ERROR IDENTIFICATION ====================
  errorIdentification: [
    {
      type: 'errorIdentification',
      title: '🚨 Identifica el error',
      instructions: '🔎 Haz clic en la palabra INCORRECTA de cada oracion (solo una por oracion).',
      sentences: [
        { words: ['I', 'goed', 'to', 'school', 'yesterday.'], wrongIndex: 1 },
        { words: ['She', 'didn\'t', 'went', 'to', 'the', 'party.'], wrongIndex: 2 },
        { words: ['They', 'was', 'very', 'tired', 'last', 'night.'], wrongIndex: 1 },
        { words: ['He', 'eated', 'pizza', 'for', 'dinner.'], wrongIndex: 1 },
        { words: ['We', 'buyed', 'candy', 'at', 'the', 'store.'], wrongIndex: 1 }
      ]
    },
    {
      type: 'errorIdentification',
      title: '🚨 Encuentra el error gramatical',
      instructions: '🔎 Haz clic en la palabra que esta mal escrita o mal usada en cada oracion.',
      sentences: [
        { words: ['My', 'sister', 'runned', 'in', 'the', 'park.'], wrongIndex: 2 },
        { words: ['Did', 'you', 'saw', 'the', 'movie?'], wrongIndex: 2 },
        { words: ['I', 'readed', 'three', 'books', 'last', 'month.'], wrongIndex: 1 },
        { words: ['They', 'drinked', 'water', 'at', 'the', 'gym.'], wrongIndex: 1 },
        { words: ['She', 'writed', 'a', 'long', 'letter.'], wrongIndex: 1 }
      ]
    }
  ],

  // ==================== 11. EMOJI SENTENCE ====================
  emojiSentence: [
    {
      type: 'emojiSentence',
      title: '😊 Crea oraciones en pasado con emojis',
      instructions: '💭 Escribe una oracion en pasado simple que describa cada conjunto de emojis. Ejemplo: 🍕👦 = "The boy ate pizza yesterday."',
      prompts: [
        { emojis: '⚽🏃‍♂️', hint: 'Usar play / run' },
        { emojis: '📚👧', hint: 'Usar read / study' },
        { emojis: '🎂🕯️', hint: 'Usar eat / celebrate' },
        { emojis: '🏊‍♀️🌊', hint: 'Usar swim' }
      ]
    },
    {
      type: 'emojiSentence',
      title: '😊 Describe con oraciones en pasado',
      instructions: '💭 Escribe una oracion completa en pasado simple basada en los emojis. Ejemplo: 🎵🎧 = "He listened to music last night."',
      prompts: [
        { emojis: '🍔🍟', hint: 'Usar eat / buy' },
        { emojis: '✈️🏖️', hint: 'Usar travel / go' },
        { emojis: '📝✏️', hint: 'Usar write / do' },
        { emojis: '🎬🍿', hint: 'Usar watch / see' }
      ]
    }
  ],

  // ==================== 12. MATCH WITH IMAGES ====================
  matchImages: [
    {
      type: 'matchImages',
      title: '🖼️ Empareja la oracion con la imagen',
      instructions: '👆 Arrastra cada oracion en pasado hacia la imagen correspondiente.',
      items: [
        { image: 'files/babyboycrying.jpg', text: 'The baby cried a lot.', alt: 'bebe llorando' },
        { image: 'files/girlreadingbook.jpg', text: 'She read a book.', alt: 'nina leyendo' },
        { image: 'files/boyeatingpizza.jpg', text: 'He ate pizza.', alt: 'nino comiendo pizza' },
        { image: 'files/whitecatsleeping.jpg', text: 'The cat slept.', alt: 'gato durmiendo' }
      ]
    },
    {
      type: 'matchImages',
      title: '🖼️ Une la imagen con la accion en pasado',
      instructions: '👆 Arrastra las oraciones a la imagen que corresponda.',
      items: [
        { image: 'files/girlrunning.jpg', text: 'She ran fast.', alt: 'nina corriendo' },
        { image: 'files/boydrinkinglemonade.jpg', text: 'He drank lemonade.', alt: 'nino bebiendo' },
        { image: 'files/threeboysplayingcoccer.jpg', text: 'They played soccer.', alt: 'ninos jugando futbol' },
        { image: 'files/boyandgirlcooking.jpg', text: 'They cooked together.', alt: 'ninos cocinando' }
      ]
    }
  ],

  // ==================== 13. MATCHING LINES (SVG) ====================
  matchingLines: [
    {
      type: 'matchingLines',
      title: '📏 Une con lineas: presente y pasado',
      instructions: '👉 Toca una palabra de la izquierda y luego su pasado correspondiente a la derecha para unirlas con una linea.',
      pairs: [
        { left: 'go', right: 'went' },
        { left: 'eat', right: 'ate' },
        { left: 'see', right: 'saw' },
        { left: 'buy', right: 'bought' },
        { left: 'write', right: 'wrote' }
      ]
    },
    {
      type: 'matchingLines',
      title: '📏 Empareja con lineas: verbo base y pasado',
      instructions: '👉 Toca el verbo en la izquierda y luego su forma en pasado a la derecha.',
      pairs: [
        { left: 'run', right: 'ran' },
        { left: 'drink', right: 'drank' },
        { left: 'sleep', right: 'slept' },
        { left: 'take', right: 'took' },
        { left: 'make', right: 'made' }
      ]
    }
  ]
};

function getRandomExercise(type) {
  const pool = EXERCISES_POOL[type];
  return pool[Math.floor(Math.random() * pool.length)];
}

function getExercisesList() {
  return [
    getRandomExercise('multipleChoice'),
    getRandomExercise('fillInTheBlank'),
    getRandomExercise('dragDropWords'),
    getRandomExercise('unscrambleWords'),
    getRandomExercise('reorderSentences'),
    getRandomExercise('trueFalse'),
    getRandomExercise('wordSearch'),
    getRandomExercise('categorization'),
    getRandomExercise('dropdown'),
    getRandomExercise('errorIdentification'),
    getRandomExercise('emojiSentence'),
    getRandomExercise('matchImages'),
    getRandomExercise('matchingLines')
  ];
}
