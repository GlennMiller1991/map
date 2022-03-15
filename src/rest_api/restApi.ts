import {pointCoordsType} from "../misc/types";
import {coordsToString} from "../utils/coordsToString";
import {secondVersionKey, thirdVersionKey} from "./apiKeys";

const DG = require('2gis-maps')

const baseUrl = 'https://catalog.api.2gis.com'

export const doubleGisRestApi = {
    getAddress(point: pointCoordsType) {
        // get address by coords
        return DG.ajax({
                url: `${baseUrl}/2.0/geo/search`,
                data: {
                    key: secondVersionKey,
                    point: coordsToString(point),
                    type: 'building',
                    fields: 'items.adm_div,items.full_address_name',
                },
            }
        )
    },
    getSuggestion(search: string) {
        // get address suggestions
        return DG.ajax({
            url: `${baseUrl}/3.0/suggests`,
            data: {
                key: thirdVersionKey,
                q: search,
                type: 'building,' +
                    'street,' +
                    'adm_div.district,' +
                    'adm_div.district_area,' +
                    'adm_div.district_area,' +
                    'adm_div.city,' +
                    'adm_div.country,' +
                    'adm_div.region,' +
                    'adm_div.living_area,' +
                    'adm_div.division',
                fields: 'items.full_address_name',
            }
        })
    },
    getCoords(id: string) {
        // get info about object by id for coordinate parse
        return DG.ajax({
            url: `${baseUrl}/2.0/geo/get`,
            data: {
                key: secondVersionKey,
                id,
                fields: 'items.geometry.centroid'
            }
        })
    }
}

//types
export type TSearchResponse = {
    meta: {
        code: number,
        api_version: string,
        issua_date: string,
        error: {
            message: string,
            type: string,
        }
    },
    result: {
        total: number,
        items: Array<TItems>,
    }
}
export type TItems = {
    name: string,
    full_name: string,
    id: string,
    subtype: TSubtype,
    address_name?: string,
    full_address_name?: string,
}
type TSubtype = 'city' | 'district' | 'division'