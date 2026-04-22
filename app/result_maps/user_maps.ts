export const userResultMap = {
  mapId: 'userMap',
  idProperty: 'id',
  properties: ['full_name', 'email', 'password', 'role', 'created_at', 'updated_at'],
}

export const userPublicResultMap = {
  mapId: 'userPublicMap',
  idProperty: 'id',
  properties: ['full_name', 'email', 'role', 'created_at'],
}

export const allUserMaps = [userResultMap, userPublicResultMap]
