export const userResultMap = {
  mapId: 'userMap',
  idProperty: 'id',
  properties: ['full_name', 'email', 'password', 'role', 'profile_picture', 'created_at', 'updated_at'],
}

export const userPublicResultMap = {
  mapId: 'userPublicMap',
  idProperty: 'id',
  properties: ['full_name', 'email', 'role', 'profile_picture', 'created_at'],
}

export const allUserMaps = [userResultMap, userPublicResultMap]
