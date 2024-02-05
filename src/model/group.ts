import { Container } from "./container"
/**
 * Group is Password Safe's representation of a group, omitting the properties we don't need.
 */
 export class Group {
    id = ''
    name = ''
    displayName = ''
    description = ''
    members = []
    containers = []
    memberOf = []
    managedAccounts = []
 }