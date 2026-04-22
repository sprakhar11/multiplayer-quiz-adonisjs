import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    full_name: vine.string().trim().minLength(1).maxLength(255),
    email: vine.string().trim().email().maxLength(254),
    password: vine.string().minLength(8).maxLength(32),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string(),
  })
)

export const refreshValidator = vine.compile(
  vine.object({
    refresh_token: vine.string(),
  })
)

export const logoutValidator = vine.compile(
  vine.object({
    refresh_token: vine.string(),
  })
)
