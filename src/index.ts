import {
    Context,
    createConnector,
    ConnectorError,
    readConfig,
    Response,
    logger,
    StdAccountListOutput,
    StdAccountReadInput,
    StdAccountReadOutput,
    StdAccountCreateInput,    
    StdAccountCreateOutput,    
    StdAccountDeleteInput,
    StdAccountDeleteOutput,
    StdAccountDisableInput,
    StdAccountDisableOutput,
    StdAccountEnableInput,
    StdAccountEnableOutput,
    StdAccountUpdateInput,
    StdAccountUpdateOutput,
    StdTestConnectionOutput,
    StdEntitlementListInput,
    StdEntitlementListOutput,
    StdEntitlementReadOutput,
    StdEntitlementReadInput
} from '@sailpoint/connector-sdk'
import { MyClient } from './my-client'
import { Util } from './tools/util'

// Connector must be exported as module property named connector
export const connector = async () => {

    // Get connector source config
    const config = await readConfig()

    const util = new Util();

    // Use the vendor SDK, or implement own client as necessary, to initialize a client
    const myClient = new MyClient(config)

    try{
    return createConnector()
        .stdTestConnection(async (context: Context, input: undefined, res: Response<StdTestConnectionOutput>) => {
            logger.info("Running test connection")
            res.send(await myClient.testConnection())
        })
        .stdAccountList(async (context: Context, input: any, res: Response<StdAccountListOutput>) => {

            const accounts = await myClient.getAllAccounts()

            for (const account of accounts) {

                res.send(util.userToAccount(account))
}
                logger.info(`stdAccountList sent ${accounts.length} accounts`)
        })
        .stdAccountRead(async (context: Context, input: StdAccountReadInput, res: Response<StdAccountReadOutput>) => {
            const account = await myClient.getAccount(input.identity)

                res.send(util.userToAccount(account))

            logger.info(`stdAccountRead read account : ${input.identity}`)

        })
        .stdAccountCreate(async (context: Context, input: StdAccountCreateInput, res: Response<StdAccountCreateOutput>) => {
            logger.info(input, "creating account using input")
            if (!input) {
                throw new Error('identity cannot be null')
            }
            const newAccount = await myClient.createAccount(input.attributes)
            console.log('##### Create User with Group:  '+JSON.stringify(newAccount))
            if(input.attributes.groups[0].substring(0,2) == 'g:'){
                console.log('### We have a Group = '+input.attributes.groups[0])
                let accountChange = await myClient.updateGroup(newAccount.id, 'add', input.attributes.groups[0])
            }
            const account = await myClient.getAccount(newAccount.id)
            logger.info(account, "created user in Password Safe")
            res.send(util.userToAccount(account))

        })

        .stdAccountUpdate(async (context: Context, input: StdAccountUpdateInput, res: Response<StdAccountUpdateOutput>) => {
            logger.info(input, "getting account using input")
            logger.info(input.identity, "changing the following account in BeyondTrust Password Safe Cloud")

            if(input.changes[0].attribute == 'groups'){
                let accountChange = await myClient.updateGroup(input.identity, input.changes[0].op, input.changes[0].value)
    
            } else {
                let accountChange = await myClient.updateAccount(input.identity, input.changes[0])
            }

            let account = await myClient.getAccount(input.identity)
            res.send(util.userToAccount(account))

        })

        .stdAccountDisable(async (context: Context, input: StdAccountDisableInput, res: Response<StdAccountDisableOutput>) => {
            logger.info(input.identity, "disabling the following account in BeyondTrust Password Safe")
            const disableAccount = await myClient.changeAccountStatus(input.identity, false)
            const account = await myClient.getAccount(disableAccount.id)
            logger.info(input.identity, "account after changes applied")
            res.send(util.userToAccount(account))
        })

        .stdAccountEnable(async (context: Context, input: StdAccountEnableInput, res: Response<StdAccountEnableOutput>) => {
            logger.info(input.identity, "enabling the following account in BeyondTrust Password Safe")
            const enableAccount = await myClient.changeAccountStatus(input.identity, true)
            const account = await myClient.getAccount(enableAccount.id)
            logger.info(input.identity, "account after changes applied")
            res.send(util.userToAccount(account))
        })

        .stdAccountDelete(async (context: Context, input: StdAccountDeleteInput, res: Response<StdAccountDeleteOutput>) => {
            logger.info(input.identity, "deleting the following account in BeyondTrust PWS")
            const account = await myClient.deleteAccount(input.identity)
            logger.info(input.identity, "account deleted")
        })

        .stdEntitlementList(async (context: Context, input: StdEntitlementListInput, res: Response<StdEntitlementListOutput>) => {
            const groups = await myClient.getAllGroups()
            for (const group of groups) {
            res.send(util.groupToEntitlement(group))
}
            logger.info(`stdEntitlementList sent ${groups.length} groups`)

            const containers = await myClient.getAllContainers()
            for (const container of containers) {
            res.send(util.containerToEntitlement(container))
}
            logger.info(`stdEntitlementList sent ${containers.length} containers`)
        })

        .stdEntitlementRead(async (context: Context, input: StdEntitlementReadInput, res: Response<StdEntitlementReadOutput>) => {
                logger.debug(input, 'entitlement read input object')
                if(input.type == 'group' && input.identity.substr(0,2) == 'g:'){
                        const group: any = await myClient.getGroup(input.identity.substr(2))
                        logger.debug(group, 'Password Safe group found')
                        res.send(util.groupToEntitlement(group))
                    } else if(input.type == 'container' && input.identity.substr(0,2) == 'c:'){
                        const container: any = await myClient.getContainer(input.identity.substr(2))
                        logger.debug(container, 'Password Safe container found')
                        res.send(util.containerToEntitlement(container))
                    }
        })
    } catch (err:any) {
        throw new ConnectorError(err.name+'  :index:  '+err.message)
    }

        }
