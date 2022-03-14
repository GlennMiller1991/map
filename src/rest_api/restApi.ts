import {pointCoordsType} from "../types";
import {coordsToString} from "../utils/coordsToString";
import {secondVersionKey} from "./apiKeys";

const DG = require('2gis-maps')

const baseUrl = 'https://catalog.api.2gis.com'

export const doubleGisRestApi = {
    getAddress(point: pointCoordsType) {
        return DG.ajax({
            url: `${baseUrl}/2.0/geo/search`,
            data: {
                key: secondVersionKey,
                point: coordsToString(point),
                region_id: '32',
                type: 'building',
                fields: 'items.adm_div,items.full_address_name',
            }
        })
    },
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

type TItems = {
    name: string,
    full_name: string,
    id: string,
    subtype: TSubtype,
    address_name?: string,
    full_address_name?: string,
}

type TSubtype = 'city' | 'district' | 'division'