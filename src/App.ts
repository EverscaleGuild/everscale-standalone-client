import {Address, ProviderRpcClient, TvmException} from 'everscale-inpage-provider'
import {EverscaleStandaloneClient} from 'everscale-standalone-client'

const DePoolAbi = {
    'ABI version': 2,
    header: ['time', 'expire'],
    functions: [
        {
            name: 'getDePoolInfo',
            inputs: [],
            outputs: [
                {name: 'poolClosed', type: 'bool'},
                {name: 'minStake', type: 'uint64'},
                {name: 'validatorAssurance', type: 'uint64'},
                {name: 'participantRewardFraction', type: 'uint8'},
                {name: 'validatorRewardFraction', type: 'uint8'},
                {name: 'balanceThreshold', type: 'uint64'},
                {name: 'validatorWallet', type: 'address'},
                {name: 'proxies', type: 'address[]'},
                {name: 'stakeFee', type: 'uint64'},
                {name: 'retOrReinvFee', type: 'uint64'},
                {name: 'proxyFee', type: 'uint64'},
            ],
        },
    ],
    data: [],
    events: [],
} as const // NOTE: `as const` is very important here

const ever = new ProviderRpcClient({
    fallback: () => EverscaleStandaloneClient.create({
        connection: 'mainnet',
    })
})

function behavior(name: string, fn: (elem: HTMLElement | HTMLButtonElement | HTMLInputElement) => void) {
    document.querySelectorAll(`[data-behavior=${name}]`).forEach(fn)
}

const innerText = (text: string) => (elem: HTMLElement | HTMLButtonElement) => {
    elem.innerText = text
}

async function App() {
    await ever.ensureInitialized()

    await ever.requestPermissions({
        permissions: ['basic'],
    })
    const state = await ever.getProviderState()
    behavior('network', innerText(`Selected connection: ${state.selectedConnection}`))
    const dePoolAddress = new Address('0:bbcbf7eb4b6f1203ba2d4ff5375de30a5408a8130bf79f870efbcfd49ec164e9')
    const dePool = new ever.Contract(DePoolAbi, dePoolAddress)

    try {
        const output = await dePool.methods.getDePoolInfo({}).call()
        behavior('log', innerText(JSON.stringify(output, null, 2)))
    } catch (e) {
        if (e instanceof TvmException) {
            behavior('log', innerText(`TvmException code: ${e.code}`))
        }
    }
}

App().catch(console.error)
