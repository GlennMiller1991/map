import {objectType, pointCoordsType} from "../types";

export const generateCoords = (obj: objectType) => {
    // функция-хелпер
    // для тестовых целей
    // генерирует массив рандомных точек
    // либо массив (рандомной длины) массивов (рандомных длин) рандомных точек
    // чистой функцией не является!!!
    // функция мутабельная!!
    // объекты, прокинутые в компоненту карты, изменяются и за её пределами!
    // Только для тестовых целей!!
    if (obj.itIs === 'point') {
        obj.coords = [
            [(Math.random() * 90) - 30, (Math.random() * 80) - 40]
        ]
    } else if (obj.itIs === 'line' || obj.itIs === 'polygon') {
        const lines = Math.floor(Math.random() * 3 + 1)
        console.log(lines)
        for (let i = 0; i < lines; i++) {
            const points = Math.floor(Math.random() * 3 + 1)
            obj.coords[i] = []
            for (let j = 0; j < points; j++) {
                const coords = [(Math.random() * 90) - 30, (Math.random() * 80) - 40]
                obj.coords[i][j] = coords as pointCoordsType
            }
        }
    }
}