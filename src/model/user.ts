import { Group } from "./group"

/**
 * User is a complete definition of a user, including entitlements
 */
export class User {
    id?: string
    userName?: string
    name?: any
    emails?: any
    active?: boolean
    password?: string
    groups?: any[]
    source?: string
    nativeIdentifier?: string
}