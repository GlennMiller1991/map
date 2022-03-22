// 2gis rest api response constants
export const RESPONSE__SUCCESS = 200
export const RESPONSE__BAD_REQUEST = 400
export const RESPONSE__FORBIDDEN = 403
export const RESPONSE__NOT_FOUND = 404
export const RESPONSE__TIMEOUT = 408
export const RESPONSE__SERVER_ERROR = 500

// event emitter messages
export const EVENT__CHANGE_DRAW_MODE = 'changeDrawMode'
export const EVENT__REFRESH_OBJECT_PROPERTIES = 'refreshObjectProperties'
export const EVENT__CHANGE_EDIT_MODE = 'changeEditMode'
export const EVENT__CREATE_MARKER = 'createMarker'
export const EVENT__CREATE_ENTRANCE = 'createEntrance'
export const EVENT__DELETE_ENTRANCE = 'deleteEntrance'

// local storage exceptions
export const EXCEPTION__FORBIDDEN = 18
export const EXCEPTION__EXCEED_MEMORY = 22

// indexedDB name
export const DB__NAME = 'app/map'
export const DB__OBJECTS_STORAGE_NAME = 'app/map/objects'

// fakeObject constants
export const fakeID = '-2'
