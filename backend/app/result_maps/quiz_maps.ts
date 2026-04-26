export const quizDetailMap = {
  mapId: 'quizDetailMap',
  idProperty: 'id',
  properties: ['title', 'description', 'category', 'difficulty', 'time_per_question', 'created_at'],
  collections: [
    { name: 'questions', mapId: 'questionMap', columnPrefix: 'qu_' },
  ],
}

export const questionMap = {
  mapId: 'questionMap',
  idProperty: 'id',
  properties: ['text', 'order_index', 'score_value'],
  collections: [
    { name: 'options', mapId: 'optionMap', columnPrefix: 'o_' },
  ],
}

export const optionMap = {
  mapId: 'optionMap',
  idProperty: 'id',
  properties: ['text', 'order_index'],
}

export const allQuizMaps = [quizDetailMap, questionMap, optionMap]
