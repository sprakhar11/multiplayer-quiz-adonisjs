import vine from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine.object({
    full_name: vine.string().trim().minLength(1).maxLength(255),
  })
)
