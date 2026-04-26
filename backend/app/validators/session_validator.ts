import vine from '@vinejs/vine'

export const startSessionValidator = vine.compile(
  vine.object({
    quiz_id: vine.number().positive(),
    mode: vine.enum(['solo', 'multiplayer']),
  })
)

export const joinSessionValidator = vine.compile(
  vine.object({
    invite_code: vine.string().fixedLength(8),
  })
)
