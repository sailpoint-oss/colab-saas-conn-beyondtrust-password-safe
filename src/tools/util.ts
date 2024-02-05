import { AttributeChange, ConnectorError, StdAccountCreateInput, StdAccountCreateOutput, StdEntitlementListOutput } from "@sailpoint/connector-sdk"
import { Group } from "../model/group"
import { User } from "../model/user"
import { Container } from "../model/container"

export class Util {
  

    /**
     * converts user object to IDN account output
     *
     * @param {User} user User object
     * @returns {StdAccountCreateOutput} IDN account create object
     */
    public userToAccount(user: User): StdAccountCreateOutput {
        var jsonPath = require('JSONPath');
        // Formatting output for IdentityNow
//                console.log('###### userToAccount user = '+JSON.stringify(user))
                const uid = user.id ? user.id : ''
                const firstname = user.name.givenName ? user.name.givenName : ''
                const lastname = user.name.familyName ? user.name.familyName : ''
                const email = user.emails[0].value ? user.emails[0].value : ''
                const groups = user.groups ? user.groups : ''
                const active = user.active ? user.active : true
                const source = jsonPath.eval(user, "$..source") + jsonPath.eval(user, "$..Source") ? jsonPath.eval(user, "$..source") + jsonPath.eval(user, "$..Source"): ''
                const nativeIdentifier = jsonPath.eval(user, "$..nativeIdentifier") + jsonPath.eval(user, "$..NativeIdentifier") ? jsonPath.eval(user, "$..nativeIdentifier") + jsonPath.eval(user, "$..NativeIdentifier") : ''
                let groups_idn = []
                console.log('##### user id = '+uid)
//                console.log('##### # of groups = '+ groups.length+'  groups ='+JSON.stringify(groups))
                for (let index = 0; index < groups.length; ++index) {
//                    console.log('######## group = '+JSON.stringify(groups[index].value))
                        groups_idn.push('g:'+groups[index].value)
                }
        return {
            // Convert id to string because IDN doesn't work well with number types for the account ID
            identity: user.id ? user.id : '',
            uuid: user.id ? user.id : '',
            attributes: {
                id: user.id ? user.id : '',
                userName: user.userName ? user.userName : '',
                firstname: firstname,
                lastname: lastname,
                email: email,
                groups: groups_idn,
                active: active,
                source: source,
                nativeIdentifier: nativeIdentifier
            }
        }
    }

    /**
     * converts group object to IDN Entitlement List Output
     *
     * @param {Group} group group object
     * @returns {StdAccountCreateOutput} IDN Entitlement List Output
     */
    public groupToEntitlement(group: Group): StdEntitlementListOutput {
        const groupId = 'g:'+group.id.toString()
        return {
//            identity: groupId + ':' + group.displayName,
//            uuid: groupId + ':' + group.displayName,
            identity: groupId,
            uuid: groupId,
            type: 'group',
            attributes: {
//                id: groupId + ':' + group.displayName,
                id: groupId,
                name: group.displayName,
                description: group.description,
                members: group.members,
                containers: group.containers
            }
        }
    }

    /**
     * converts container object to IDN Entitlement List Output
     *
     * @param {Container} container container object
     * @returns {StdAccountCreateOutput} IDN Entitlement List Output
     */
    public containerToEntitlement(container: Container): StdEntitlementListOutput {
        const containerId = 'c:'+container.id?.toString()
        return {
            identity: containerId,
            uuid: containerId,
            type: 'group',
            attributes: {
                id: containerId,
                name: 'CONTAINER::'+container.name,
                displayName: container.displayName,
                description: container.description,
                managedAccounts: container.privilegedData,
                memberOf: container.memberOf
            }
        }
    }


}