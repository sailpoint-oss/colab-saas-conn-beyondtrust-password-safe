// BeyondTrust SCIM functions
// Password Safe Cloud
import { ConnectorError, logger } from '@sailpoint/connector-sdk'

// =================================================
// GENERIC - Check OAuth Bearer Token expiration time
// =================================================
export async function check_token_expiration() {

// Check EXPIRATION_TIME
console.log('auth data before Auth = '+globalThis.__ACCESS_TOKEN)
let now = 0
now = Date.now();
console.log('now Time =        '+now)
console.log('Expiration Time = '+globalThis.__EXPIRATION_TIME)
const time_buffer = 100
let valid_token = 'valid'
if(!globalThis.__EXPIRATION_TIME){
    console.log('######### Expiration Time is undefined')
    valid_token = 'undefined'
}
else{
    if(globalThis.__EXPIRATION_TIME - time_buffer <= now){
        console.log('Expiration Time is in the past')
        valid_token = 'expired'
    }
    else{
        console.log('### Expiration Time is in the future:  No need to Re-Authenticate')
        valid_token = 'valid'
    }
}

return valid_token

}

// =================================================
// GENERIC - Smart Error Handling
// =================================================
export async function smart_error_handling(err: any) {

    console.log('############ We are in smart_error handling, error name = '+err.name+'    Error Message = '+err.message)
    // Smart Error Handling
    if(err.message.substr(0,21) == 'getaddrinfo ENOTFOUND'){
            throw new ConnectorError(err.message+'  ::  Verify the Source instance portion of the URL in Configuration.   '+err.message)
    }   else if(err.message == 'Request failed with status code 400'){
            throw new ConnectorError(err.message+'  ::  Verify that the Source API account client_id and client_secret are valid in Configuration.   '+err.message)
    }   else if(err.message == 'Request failed with status code 401'){
            throw new ConnectorError(err.message+'  ::  Verify that the Password Safe Group for the SCIM Service Account has the correct Features permissions.   '+err.message)
    }   else if(err.message == 'Request failed with status code 403'){
            throw new ConnectorError(err.message+'  ::  Verify that the Source API account has required permissions. '+err.message)
    }   else if(err.message == 'Request failed with status code 404'){
            throw new ConnectorError(err.message+'  ::  Source instance responded, but there is a problem with the URL in Configuration.  '+err.message)
    }   else{
            console.log('about to throw ConnectorError')
            throw new ConnectorError(err.name+'  ::  '+err.message)
    }
    }
    
 // SCIM Functions

// =================================================
// Authentication Simple
// =================================================
export async function scim_auth() {

        // set the Authorization header
    let base64data = Buffer.from(globalThis.__CLIENT_ID+':'+globalThis.__CLIENT_SECRET).toString('base64')
    const authorization = 'Basic '+base64data
    
    const axios = require('axios');
    const qs = require('querystring');
    const data = {
        grant_type: 'client_credentials'
    };
    // set the headers
    const config = {
        method: 'post',
        rejectUnauthorized: false,
        url: globalThis.__AUTHURL,
        data: qs.stringify(data),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': authorization
        }
    };
    try{
        let resAuth = await axios(config)
        // Store res data in Global variable
        let now = 0
        now = Date.now();
        globalThis.__ACCESS_TOKEN = resAuth.data.access_token
        globalThis.__EXPIRATION_TIME = now + (resAuth.data.expires_in * 1000)    
        return resAuth
    }   catch (err:any) {
        await smart_error_handling(err)
    }
    
    }
    
// =================================================
// SCIM GET ServiceProviderConfig
// =================================================
export async function scim_GET_ServiceProviderConfig() {

    const axios = require('axios');
    const qs = require('querystring');

        const config = {
            method: 'get',
            rejectUnauthorized: false,
            url: globalThis.__INSTANCE + '/ServiceProviderConfig',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
            }
        }
            try{
                let res = await axios(config)
                return res
            }   catch (err:any) {
                await smart_error_handling(err)
            }
        
    }

// =================================================
// SCIM GET Schemas
// =================================================
export async function scim_GET_Schemas() {

    const axios = require('axios');
    const qs = require('querystring');

        const config = {
            method: 'get',
            rejectUnauthorized: false,
            url: globalThis.__INSTANCE + '/Schemas',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
            }
        }
            try{
                let res = await axios(config)
                return res
            }   catch (err:any) {
                await smart_error_handling(err)
            }
        
    }

// =================================================
// SCIM GET ResourceTypes
// =================================================
export async function scim_GET_ResourceTypes() {

    const axios = require('axios');
    const qs = require('querystring');

        const config = {
            method: 'get',
            rejectUnauthorized: false,
            url: globalThis.__INSTANCE + '/ResourceTypes',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
            }
        }
            try{
                let res = await axios(config)
                return res
            }   catch (err:any) {
                await smart_error_handling(err)
            }
        
    }
    
// =================================================
// SCIM GET
// =================================================
export async function scim_GET(entity:string) {

    const axios = require('axios');
    const qs = require('querystring');
    
    // set the headers
    const config = {
        method: 'get',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/'+entity,
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
    };

    try{
        let res = await axios(config)
        return res.data
    }   catch (err:any) {
        await smart_error_handling(err)
    }

    }

// =================================================
// SCIM GET with Pagination - entity = Users, Groups, Containers, ContainerPermissions, PrivilegedData
// =================================================
export async function scim_GET_Pagination(entity: string) {

    let res = await scim_GET(entity)

    // PAGINATION BEGIN
    var records = res.Resources
    const numberOfRecords = res.totalResults
    const itemsPerPage = res.itemsPerPage
    const startIndex = res.startIndex
    const lastPage = Math.trunc(numberOfRecords / itemsPerPage) + 1

    console.log('Total # of Records = '+numberOfRecords+'  itemsPerPage = '+itemsPerPage+' startIndex = '+startIndex+' lastPage = '+lastPage)
    if(lastPage > 1){
        for (let page = 2; page < lastPage + 1; ++page) {
            const currentIndex = ((page - 1) * itemsPerPage) +1 
            console.log('PAGINATION: Last Page = '+lastPage+'   We are working on Page # '+page+'  currentIndex = '+currentIndex)
    
            let res2 = await scim_GET(entity +'?startIndex='+currentIndex+'&itemsPerPage='+itemsPerPage)
            records = records.concat(res2.Resources)
        }
    }
    // PAGINATION END

        return records
    }

// =================================================
// SCIM GET Users - with Pagination
// =================================================
export async function scim_GET_Users() {

    let res = await scim_GET('Users')

    // PAGINATION BEGIN
    var accounts = res.Resources
    const numberOfUsers = res.totalResults
    const itemsPerPage = res.itemsPerPage
    const startIndex = res.startIndex
    const lastPage = Math.trunc(numberOfUsers / itemsPerPage) + 1

    console.log('Total # of Users = '+numberOfUsers+'  itemsPerPage = '+itemsPerPage+' startIndex = '+startIndex+' lastPage = '+lastPage)
    if(lastPage > 1){
        for (let page = 2; page < lastPage + 1; ++page) {
            const currentIndex = ((page - 1) * itemsPerPage) +1 
            console.log('PAGINATION: Last Page = '+lastPage+'   We are working on Page # '+page+'  currentIndex = '+currentIndex)
    
            let res2 = await scim_GET('Users' +'?startIndex='+currentIndex+'&itemsPerPage='+itemsPerPage)
            accounts = accounts.concat(res2.Resources)
        }
    }
    // PAGINATION END

        return accounts
    }

// =================================================
// SCIM GET User 
// =================================================
export async function scim_GET_User(id:any) {

    const axios = require('axios');
    const qs = require('querystring');
    
    // set the headers
    const config = {
        method: 'get',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/Users/'+id,
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
    };

    try{
        let res = await axios(config)
        return res.data
    }   catch (err:any) {
        await smart_error_handling(err)
    }

    }

// =================================================
// SCIM POST User
// =================================================
export async function scim_POST_User(identity:any) {

    const axios = require('axios');
    const qs = require('querystring');

    let data = {};
    if(identity.source && identity.nativeIdentifier){
        data = {
            "schemas": [
                "urn:ietf:params:scim:schemas:core:2.0:User",
                "urn:ietf:params:scim:schemas:pam:1.0:LinkedObject"
            ],
            "userName": identity.username,
            "name": {
                "givenName": identity.firstname,
                "familyName": identity.lastname
            },
            "emails": [
                {
                    "type": "work",
                    "primary": true,
                    "value": identity.email
                }
            ],
            "active": identity.active,
            "password": identity.password,
            "meta": {
                "resourceType": "User"
            },
            "urn:ietf:params:scim:schemas:pam:1.0:LinkedObject": {
                "source": identity.source,
                "nativeIdentifier": identity.nativeIdentifier
            }
        }
    } else {
        data = {
            "schemas": [
                "urn:ietf:params:scim:schemas:core:2.0:User"
            ],
            "userName": identity.username,
            "name": {
                "givenName": identity.firstname,
                "familyName": identity.lastname
            },
            "emails": [
                {
                    "type": "work",
                    "primary": true,
                    "value": identity.email
                }
            ],
            "active": identity.active,
            "password": identity.password,
            "meta": {
                "resourceType": "User"
            }
        }

    }
        console.log('POST /Users data = '+JSON.stringify(data))
    // set the headers
    const config = {
        method: 'post',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/Users',
        data: data,
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
    };
    console.log('POST /Users url = '+globalThis.__INSTANCE + '/Users')
    try{
        let res = await axios(config)
        return res.data
    }   catch (err:any) {
        await smart_error_handling(err)
    }
    
    }

// =================================================
// SCIM PUT User
// =================================================
export async function scim_PUT_User(identity:any) {

    const axios = require('axios');
    const qs = require('querystring');


    const data = {
        "schemas": [
            "urn:ietf:params:scim:schemas:core:2.0:User"
        ],
        "userName": identity.username,
        "name": {
            "givenName": identity.firstname,
            "familyName": identity.lastname
        },
        "emails": [
            {
                "type": "work",
                "primary": true,
                "value": identity.email
            }
        ],
        "active": identity.active,
        "password": identity.password
        }

    // set the headers
    const config = {
        method: 'put',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/Users/'+identity.id,
        data: data,
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
    };
    try{
        let res = await axios(config)
        return res.data
    }   catch (err:any) {
        await smart_error_handling(err)
    }
    
    }

// =================================================
// SCIM PATCH User
// =================================================
export async function scim_PATCH_User(id:any, change:any) {

    const axios = require('axios');
    const qs = require('querystring');

        console.log('##### PATCH User change = '+JSON.stringify(change))
        // Define boby for PATCH 
        const body = {"schemas":["urn:ietf:params:scim:api:messages:2.0:PatchOp"],"Operations":[change]}
        console.log('PATCH body = '+JSON.stringify(body))
        
        const config = {
            method: 'patch',
            rejectUnauthorized: false,
            url: globalThis.__INSTANCE + '/Users/'+id,
            data: body,
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
            }
      
    }
    try{
        let res = await axios(config)
        return res.data
    }   catch (err:any) {
        await smart_error_handling(err)
    }

}    

// =================================================
// SCIM DELETE User 
// =================================================
export async function scim_DELETE_User(id:any) {

    const axios = require('axios');
    const qs = require('querystring');
    
    // set the headers
    const config = {
        method: 'delete',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/Users/'+id,
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
    };
      try{
        let res = await axios(config)
        return res
    }   catch (err:any) {
        await smart_error_handling(err)
    }
    }

// =================================================
// SCIM GET Groups
// =================================================
export async function scim_GET_Groups() {

    const axios = require('axios');
    const qs = require('querystring');

        const config = {
            method: 'get',
            rejectUnauthorized: false,
            url: globalThis.__INSTANCE + '/Groups',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
            }
        }
            try{
                let res = await axios(config)
                return res.data.Resources
            }   catch (err:any) {
                await smart_error_handling(err)
            }
        
    }

// =================================================
// SCIM GET Groups with SCIM PAM Containers
// =================================================
export async function scim_GET_Groups_Details() {

        let Groups = []
        // GET ContainerPermissions
        let resGroups = await scim_GET_Pagination("Groups")
        // Iterate Groups to GET ContainerPermissions
        for (const Group of resGroups) {
            console.log('########## Get All Groups: iterate Group id = '+Group.id+'  displayName = '+Group.displayName)
            let Containers = []
            let memberOf = []
            // GET ContainerPermissions
            let resCP = await scim_GET_ContainerPermission(Group.id)
            // GET Containers
            for (const ContainerPermission of resCP){
                console.log('########## Get All Groups: iterate Container Permission = '+ContainerPermission.container.value)
                let resC = await scim_GET_Container_simple(ContainerPermission.container.value)
                Containers.push(resC.displayName+'  |  rights: '+JSON.stringify(ContainerPermission.rights))
            }
            // Assemble Group with Details
            let Members = []
            for (const member of Group.members){
                console.log('########## Get All Groups: iterate member = '+member.value)
                let resU = await scim_GET_User(member.value)
                Members.push(member.value+'  |  '+resU.userName)
            }
            Groups.push({
                "id": Group.id,
                "displayName": Group.displayName,
                "members": Members,
                "description": Group.description,
                "containers": Containers
            })
            }
    
            return Groups

    }


// =================================================
// SCIM GET Group 
// =================================================
export async function scim_GET_Group(id:any) {

    const axios = require('axios');
    const qs = require('querystring');
    
    // set the headers
    const config = {
        method: 'get',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/Groups/'+id,
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
    };
      try{
        let res = await axios(config)
        return res.data
    }   catch (err:any) {
        await smart_error_handling(err)
    }
    }

// =================================================
// SCIM GET Group with SCIM PAM Containers
// =================================================
export async function scim_GET_Group_Details(identity: string) {
  
        // GET Group
        let group = await scim_GET_Group(identity)
        // Single Group - GET ContainerPermissions
            let Containers = []
            // GET ContainerPermissions
            let resCP: any = await scim_GET_ContainerPermission(identity)
            // GET Containers
            for (const ContainerPermission of resCP){
                let resC = await scim_GET_Container_simple(ContainerPermission.container.value)
                Containers.push(resC.displayName+'  |  rights: '+JSON.stringify(ContainerPermission.rights))
            }
            // Assemble Group with Details
            let Members = []
            for (const member of group.members){
                let resU = await scim_GET_User(member.value)
                Members.push(member.value+'  |  '+resU.userName)
            }
            const Group = {
                "id": group.id,
                "displayName": group.displayName,
                "members": Members,
                "description": group.description,
                "containers": Containers
              }
            return Group
  
    }
  
  // =================================================
// SCIM POST Group
// =================================================
export async function scim_POST_Group(identity:any) {

    const axios = require('axios');
    const qs = require('querystring');


    const data = {
        "displayName": identity.displayname,
        "description": identity.description
        }

    // set the headers
    const config = {
        method: 'post',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/Groups',
        data: data,
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
    };
    try{
        let res = await axios(config)
        return res.data
    }   catch (err:any) {
        await smart_error_handling(err)
    }
    
    }

// =================================================
// SCIM PUT Group
// =================================================
export async function scim_PUT_Group(identity:any) {

    const axios = require('axios');
    const qs = require('querystring');


    const data = {
        "displayName": identity.displayname,
        "description": identity.description
        }

    // set the headers
    const config = {
        method: 'put',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/Groups/'+identity.id,
        data: data,
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
    };
    try{
        let res = await axios(config)
        return res.data
    }   catch (err:any) {
        await smart_error_handling(err)
    }
    
    }

// =================================================
// SCIM PATCH Group
// =================================================
export async function scim_PATCH_Group(id:any, change:any) {

    const axios = require('axios');
    const qs = require('querystring');

        // Define boby for PATCH 
        const body = {"schemas":["urn:ietf:params:scim:api:messages:2.0:PatchOp"],"Operations":[change]}
        console.log('Group PATCH body = '+JSON.stringify(body))
        console.log('Group PATCH url = '+globalThis.__INSTANCE + '/Groups/'+id)

        const config = {
            method: 'patch',
            rejectUnauthorized: false,
            url: globalThis.__INSTANCE + '/Groups/'+id,
            data: body,
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
            }
      
    }
    try{
        let res = await axios(config)
        return res
    }   catch (err:any) {
        await smart_error_handling(err)
    }

}    

// =================================================
// SCIM DELETE Group 
// =================================================
export async function scim_DELETE_Group(id:any) {

    const axios = require('axios');
    const qs = require('querystring');
    
    // set the headers
    const config = {
        method: 'delete',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/Groups/'+id,
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
    };
    try{
        let res = await axios(config)
        return res
    }   catch (err:any) {
        await smart_error_handling(err)
    }
    }

// =================================================
// SCIM GET Containers
// =================================================
export async function scim_GET_Containers() {

    const axios = require('axios');
    const qs = require('querystring');

            let resSP = await scim_GET_Pagination("Containers")
            let Containers = []
            for (const container of resSP){
                let memberOf = []
                // GET ContainerPermissions
                const configCP = {
                    method: 'get',
                    rejectUnauthorized: false,
                    url: globalThis.__INSTANCE + '/ContainerPermissions?filter=container.value+eq+'+container.id,
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
                    }
                }
                let resCP = await axios(configCP)
                for (const ContainerPermission of resCP.data.Resources){
                    memberOf.push('g:'+ContainerPermission.group.value)
                }
                //                console.log('##### container = '+JSON.stringify(container))
                let privilegedDataIDs = []
                for (const privilegedData of container.privilegedData){
                        privilegedDataIDs.push(privilegedData.display)
                }
                Containers.push({
                    "id": container.id,
                    "name": container.name,
                    "displayName": container.displayName,
                    "description": container.description,
                    "privilegedData": privilegedDataIDs,
                    "memberOf": memberOf
                })
            }
            return Containers

    }

// =================================================
// SCIM GET Container
// =================================================
export async function scim_GET_Container(identity: string) {

            let resContainer = await scim_GET('Containers/'+identity)
            const container = resContainer;
                let memberOf = []
                // GET ContainerPermissions
                let resCP = await scim_GET('ContainerPermissions?filter=container.value+eq+'+container.id)
                for (const ContainerPermission of resCP.Resources){
                    memberOf.push('g:'+ContainerPermission.group.value)
                }
                let privilegedDataIDs = []
                for (const privilegedData of container.privilegedData){
                        privilegedDataIDs.push(privilegedData.display)
                }
                const Container = {
                    "id": container.id,
                    "name": container.name,
                    "displayName": container.displayName,
                    "description": container.description,
                    "privilegedData": privilegedDataIDs,
                    "memberOf": memberOf
                }
            return Container

    }

// =================================================
// SCIM GET Container Simple
// =================================================
export async function scim_GET_Container_simple(identity: string) {

    const axios = require('axios');
    const qs = require('querystring');

        const configContainer = {
            method: 'get',
            rejectUnauthorized: false,
            url: globalThis.__INSTANCE + '/Containers/'+identity,
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
            }
        }
            let resContainer = await axios(configContainer)
            const container = resContainer.data;
                const Container = {
                    "id": container.id,
                    "name": container.name,
                    "displayName": container.displayName,
                    "description": container.description
                }
//            }
            return Container

    }

// =================================================
// SCIM GET ContainerPermissions
// =================================================
export async function scim_GET_ContainerPermissions() {

    const axios = require('axios');
    const qs = require('querystring');

        const config = {
            method: 'get',
            rejectUnauthorized: false,
            url: globalThis.__INSTANCE + '/ContainerPermissions',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
            }
        }
        try{
            let res = await axios(config)
            return res
        }   catch (err:any) {
            await smart_error_handling(err)
        }
    
    }

// =================================================
// SCIM GET ContainerPermission 
// =================================================
export async function scim_GET_ContainerPermission(id:any) {

    const axios = require('axios');
    const qs = require('querystring');
    
    // set the headers
    const config = {
        method: 'get',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/ContainerPermissions?filter=group.value+eq+'+id,
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
    };
    try{
        let res = await axios(config)
        return res.data.Resources
    }   catch (err:any) {
        await smart_error_handling(err)
    }
    }

// =================================================
// SCIM POST ContainerPermission
// =================================================
export async function scim_POST_ContainerPermission(identity:any) {

    const axios = require('axios');
    const qs = require('querystring');


    const data = {
        "container": identity.container,
        "group": identity.group,
        "rights": identity.rights
        }

    // set the headers
    const config = {
        method: 'post',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/ContainerPermissions',
        data: data,
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
    };
    try{
        let res = await axios(config)
        return res.data
    }   catch (err:any) {
        await smart_error_handling(err)
    }
    
    }

// =================================================
// SCIM PUT ContainerPermission
// =================================================
export async function scim_PUT_ContainerPermission(identity:any) {

    const axios = require('axios');
    const qs = require('querystring');


    const data = {
        "container": identity.container,
        "group": identity.group,
        "rights": identity.rights
        }

    // set the headers
    const config = {
        method: 'put',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/ContainerPermissions/'+identity.id,
        data: data,
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
    };
    try{
        let res = await axios(config)
        return res.data
    }   catch (err:any) {
        await smart_error_handling(err)
    }
    
    }

// =================================================
// SCIM PATCH ContainerPermission
// =================================================
export async function scim_PATCH_ContainerPermission(id:any, change:any) {

    const axios = require('axios');
    const qs = require('querystring');


        const config = {
            method: 'patch',
            rejectUnauthorized: false,
            url: globalThis.__INSTANCE + '/ContainerPermissions/'+id,
            data: change,
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
            }
      
    }
    try{
        let res = await axios(config)
        return res
    }   catch (err:any) {
        await smart_error_handling(err)
    }

}    

// =================================================
// SCIM DELETE ContainerPermission 
// =================================================
export async function scim_DELETE_ContainerPermission(id:any) {

    const axios = require('axios');
    const qs = require('querystring');
    
    // set the headers
    const config = {
        method: 'delete',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/ContainerPermissions/'+id,
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
    };
    try{
        let res = await axios(config)
        return res
    }   catch (err:any) {
        await smart_error_handling(err)
    }
    }

// =================================================
// SCIM GET PrivilegedData List
// =================================================
export async function scim_GET_PrivilegedDataList() {

    const axios = require('axios');
    const qs = require('querystring');

        const config = {
            method: 'get',
            rejectUnauthorized: false,
            url: globalThis.__INSTANCE + '/PrivilegedData',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
            }
        }
        try{
            let res = await axios(config)
            return res
        }   catch (err:any) {
            await smart_error_handling(err)
        }
    
    }

// =================================================
// SCIM GET PrivilegedData 
// =================================================
export async function scim_GET_PrivilegedData(id:any) {

    const axios = require('axios');
    const qs = require('querystring');
    
    // set the headers
    const config = {
        method: 'get',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/PrivilegedData/'+id,
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
    };
    try{
        let res = await axios(config)
        return res
    }   catch (err:any) {
        await smart_error_handling(err)
    }
    }

